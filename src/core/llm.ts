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
        const modelName = "gemini-2.5-flash";
        
        // 🌐 MODIFICACIÓN MAESTRA V2: Manual de Herramientas Estricto
        // Aquí le enseñamos que 'execute' NO es para navegar, solucionando el bloqueo de seguridad.
        this.model = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction: `
            ERES OCTOARCH V4.0.
            
            1. REGLA DE IDIOMA (BILINGÜE):
            Analiza el idioma del usuario. Responde y PIENSA ('thought') estrictamente en ese idioma.

            2. REGLA DE HERRAMIENTAS (CRÍTICA):
            - Para NAVEGAR en internet: DEBES usar { "action": "inspect", "url": "..." }.
            - ESTÁ PROHIBIDO usar "execute" para ver webs. "execute" es SOLO para comandos de terminal (bash/powershell).
            - Si estás en modo RESEARCHER, solo puedes usar "inspect" y "read". NO intentes usar "execute".

            3. REGLA ANTI-ALUCINACIÓN:
            No inventes noticias ni datos. Si no puedes usar la herramienta, dilo.
            `
        });
        
        Logger.info(`IntelligenceCore v4.0 inicializado con ${modelName} (Manual de Herramientas + Bucle Cognitivo)`);
    }

    private async generateWithRetry(prompt: string, retries = 3): Promise<any> {
        let delay = 5000;
        for (let i = 0; i < retries; i++) {
            try {
                return await this.model.generateContent(prompt);
            } catch (error: any) {
                if (error.message?.includes('429') || error.message?.includes('Quota')) {
                    Logger.warn(`Rate Limit. Esperando ${delay}ms... (Intento ${i + 1}/${retries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                } else {
                    throw error;
                }
            }
        }
        throw new Error("❌ Se excedió el límite de reintentos.");
    }

    async generateResponse(userPrompt: string, forcedIntent: string | null = null): Promise<string> {
        try {
            const fileList = await FileTool.listFiles('./');
            const memory = await MemorySystem.recall();
            
            const intent = forcedIntent ? forcedIntent : detectIntent(userPrompt);
            const enrichedPrompt = applyTemplate(intent, userPrompt);
            Logger.info('Intención Final Evaluada', { intent, isForced: !!forcedIntent });

            const systemPrompt = buildSystemPrompt(memory, fileList, enrichedPrompt);

            const result = await this.generateWithRetry(systemPrompt);
            const responseText = result.response.text();
            
            return await this.processExecution(responseText, intent, forcedIntent);

        } catch (error: any) {
            Logger.error("❌ Error en Core:", error);
            return `❌ Error: ${error.message}. Verifica tu API Key o cuota.`;
        }
    }

    private async processExecution(responseText: string, intent: string, forcedIntent: string | null): Promise<string> {
        try {
            // 🧹 LIMPIEZA PROFUNDA DE JSON (ALGORITMO MATEMÁTICO)
            const firstBrace = responseText.indexOf('{');
            const lastBrace = responseText.lastIndexOf('}');

            // Si no encontramos llaves válidas, asumimos que es charla normal
            if (firstBrace === -1 || lastBrace === -1) return responseText;

            // Extraemos solo lo que está entre las llaves ignorando basura externa
            const cleanJson = responseText.substring(firstBrace, lastBrace + 1);

            let parsed: any;
            try {
                parsed = JSON.parse(cleanJson);
            } catch (jsonError) {
                return responseText;
            }
            
            // Si no hay operaciones, devolvemos el pensamiento
            if (!parsed.operations || !Array.isArray(parsed.operations)) return parsed.thought || responseText;

            let toolOutputs = ""; 
            let operationsPerformed = false;
            const activeRole = forcedIntent || 'Auto';

            for (const op of parsed.operations) {
                
                // 🛡️ RBAC: Validación de Seguridad
                let isAllowed = true;
                let denyReason = "";

                if (activeRole === 'CHAT') {
                    if (['execute', 'create', 'read', 'inspect'].includes(op.action)) {
                        isAllowed = false;
                        denyReason = "Modo Seguro (Chat) no permite herramientas.";
                    }
                } 
                else if ((activeRole === 'CFO_ADVISOR' || activeRole === 'RESEARCHER') && ['execute', 'create'].includes(op.action)) {
                    isAllowed = false;
                    denyReason = "Rol de Análisis no permite modificar el sistema (Read-Only).";
                }

                if (!isAllowed) {
                    Logger.warn(`🛡️ BLOCKED: ${op.action} en modo ${activeRole}`);
                    toolOutputs += `❌ [BLOCKED]: Operación '${op.action}' denegada por seguridad (${denyReason}).\n`;
                    continue; 
                }

                // Ejecución Real
                try {
                    if (op.action === 'read' && op.path) {
                        const content = await FileTool.readFile(op.path);
                        toolOutputs += `\n--- RESULTADO DE LEER ${op.path} ---\n${content.substring(0, 5000)}\n-----------------------------------\n`;
                        operationsPerformed = true;
                    }
                    else if (op.action === 'create' && op.path && op.content) {
                        const res = await FileTool.writeFile(op.path, op.content);
                        toolOutputs += `\n--- RESULTADO DE CREAR ARCHIVO ---\n${res}\n-----------------------------------\n`;
                        operationsPerformed = true;
                    }
                    else if (op.action === 'execute' && op.command) {
                        const output = await ShellTool.execute(op.command);
                        toolOutputs += `\n--- RESULTADO DE TERMINAL (${op.command}) ---\n${output.substring(0, 3000)}\n-----------------------------------\n`;
                        operationsPerformed = true;
                    }
                    else if (op.action === 'inspect' && op.url) {
                        // Importamos dinámicamente para evitar ciclos
                        const { BrowserTool } = require('../tools/browser');
                        const report = await BrowserTool.inspect(op.url);
                        toolOutputs += `\n--- RESULTADO DE NAVEGADOR (${op.url}) ---\n${report}\n-----------------------------------\n`;
                        operationsPerformed = true;
                    }
                } catch (opError: any) {
                    toolOutputs += `❌ [ERROR EJECUCIÓN]: ${opError.message}\n`;
                }
            }

            // 🔄 BUCLE COGNITIVO (LOOP)
            // Si hubo operaciones exitosas, reinyectamos los resultados al cerebro
            if (operationsPerformed) {
                Logger.info("🔄 Iniciando Bucle Cognitivo para interpretar resultados...");
                
                const loopPrompt = `
                [CONTEXTO]
                Actúas como: ${intent}.
                Tu pensamiento original fue: "${parsed.thought || 'N/A'}"
                
                [RESULTADOS TÉCNICOS OBTENIDOS]
                ${toolOutputs}

                [INSTRUCCIÓN]
                Analiza los resultados de arriba y responde al usuario final.
                - NO menciones que estás leyendo logs o JSON.
                - Si es una investigación web, resume los hallazgos clave de forma clara.
                - Responde en el mismo idioma que usaste en tu pensamiento original.
                `;

                const finalResponse = await this.generateWithRetry(loopPrompt);
                return finalResponse.response.text();
            }

            // Si falló todo o fue bloqueado, devolvemos el log de errores
            return `**Octoarch (${intent}):**\n${parsed.thought || ''}\n\n${toolOutputs}`;

        } catch (e) {
            return responseText;
        }
    }
}