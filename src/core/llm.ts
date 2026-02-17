import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { FileTool } from '../tools/files';
import { ShellTool } from '../tools/shell';
import { MemorySystem } from './memory';
import { ConversationManager } from './conversation';
import { Logger } from '../utils/logger';
import { detectIntent, applyTemplate, buildSystemPrompt } from './library';

export class IntelligenceCore {
    private model: any;
    // @ts-ignore
    private conversationMgr: ConversationManager;

    constructor() {
        this.conversationMgr = new ConversationManager();
        
        const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        
        // Usamos gemini-2.5-flash (confirmado)
        const modelName = "gemini-2.5-flash";
        
        this.model = genAI.getGenerativeModel({ model: modelName });
        
        Logger.info(`🧠 IntelligenceCore v4.0 inicializado con ${modelName}`);
    }

    private async generateWithRetry(prompt: string, retries = 3): Promise<any> {
        let delay = 5000;
        
        for (let i = 0; i < retries; i++) {
            try {
                return await this.model.generateContent(prompt);
            } catch (error: any) {
                if (error.message?.includes('429') || error.message?.includes('Quota')) {
                    Logger.warn(`⏳ Rate Limit. Esperando ${delay}ms... (Intento ${i + 1}/${retries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2; 
                } else {
                    throw error;
                }
            }
        }
        throw new Error("❌ Se excedió el límite de reintentos.");
    }

    async generateResponse(userPrompt: string): Promise<string> {
        try {
            // Contexto del entorno
            const fileList = await FileTool.listFiles('./');
            const memory = await MemorySystem.recall();
            
            // Detección de intención
            const intent = detectIntent(userPrompt);
            const enrichedPrompt = applyTemplate(intent, userPrompt);
            
            Logger.info('🧠 Intención detectada', { intent });

            // Construcción del Prompt de Sistema
            const systemPrompt = buildSystemPrompt(memory, fileList, enrichedPrompt);
            
            // Generación
            const result = await this.generateWithRetry(systemPrompt);
            const responseText = result.response.text();
            
            // Ejecución de herramientas (Si el modelo devolvió JSON)
            return await this.processExecution(responseText, intent);

        } catch (error: any) {
            Logger.error("❌ Error en Core:", error);
            return `❌ Error: ${error.message}. Verifica tu API Key o cuota.`;
        }
    }

    private async processExecution(responseText: string, intent: string): Promise<string> {
        try {
            // Limpieza del JSON (a veces el modelo añade markdown extra)
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            
            // Si no parece JSON, devolvemos el texto plano (modo conversación normal)
            if (!cleanJson.startsWith('{')) return responseText;

            const parsed = JSON.parse(cleanJson);
            
            // Si no tiene operaciones, es solo un pensamiento
            if (!parsed.operations || !Array.isArray(parsed.operations)) return responseText;

            let log = ` **Octoarch (${intent}):**\n`;
            if (parsed.thought) log += `💭 _"${parsed.thought}"_\n\n`;

            for (const op of parsed.operations) {
                try {
                    // 1. HERRAMIENTA DE ARCHIVOS (LECTURA)
                    if (op.action === 'read' && op.path) {
                        const content = await FileTool.readFile(op.path);
                        log += `📖 Leído: \`${op.path}\` (${content.length} chars)\n`;
                    }
                    // 2. HERRAMIENTA DE ARCHIVOS (ESCRITURA)
                    else if (op.action === 'create' && op.path && op.content) {
                        const res = await FileTool.writeFile(op.path, op.content);
                        log += `📝 ${res}\n`;
                    }
                    // 3. HERRAMIENTA DE TERMINAL
                    else if (op.action === 'execute' && op.command) {
                        const output = await ShellTool.execute(op.command);
                        // AUMENTADO: Ahora mostramos 2000 caracteres de salida de terminal
                        const preview = output.length > 2000 ? output.substring(0, 2000) + "..." : output;
                        log += `💻 Ejecutado: \`${op.command}\`\n\`\`\`\n${preview}\n\`\`\`\n`;
                    }
                    // 4. HERRAMIENTA DE NAVEGADOR (NUEVA v4.0) 🌍
                    else if (op.action === 'inspect' && op.url) {
                        // Importación dinámica para evitar cargar Puppeteer si no se usa
                        const { BrowserTool } = require('../tools/browser');
                        const report = await BrowserTool.inspect(op.url);
                        // 🔥 AUMENTADO: Ahora "recordamos" hasta 8000 caracteres de la web
                        const preview = report.length > 8000 ? report.substring(0, 8000) + "..." : report;
                        log += `🌍 Navegado: \`${op.url}\`\n\`\`\`\n${preview}\n\`\`\`\n`;
                    }

                } catch (opError: any) {
                    log += `❌ Falló operación: ${opError.message}\n`;
                }
            }
            return log;

        } catch (e) {
            // Si falla el parseo JSON, devolvemos el texto original por seguridad
            return responseText;
        }
    }
}