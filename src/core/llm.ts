import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { MemorySystem } from './memory';
import { ConversationManager } from './conversation';
import { Logger } from '../utils/logger';
import { detectIntent, applyTemplate } from './library';
import { octoTools } from './agent_tools';
import { MCPManager } from './mcp_manager';
import { ToolOrchestrator } from './tool_orchestrator'; // 🚀 NUEVO: Importamos el orquestador

interface SessionData {
    manager: ConversationManager;
    lastActive: number;
}

export class IntelligenceCore {
    private static instance: IntelligenceCore | null = null;
    
    private genAI: GoogleGenerativeAI;
    private sessions: Map<string, SessionData>;
    
    private readonly SESSION_TTL_MS = 24 * 60 * 60 * 1000;
    private cachedModel: any = null;
    private lastModelUpdate: number = 0;

    private constructor() {
        this.sessions = new Map<string, SessionData>();
        this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        Logger.info(`🧠 IntelligenceCore inicializado (Modular, Stateful & MCP Ready)`);
    }

    public static getInstance(): IntelligenceCore {
        if (!IntelligenceCore.instance) {
            IntelligenceCore.instance = new IntelligenceCore();
        }
        return IntelligenceCore.instance;
    }

    private cleanStaleSessions() {
        const now = Date.now();
        for (const [key, session] of this.sessions.entries()) {
            if (now - session.lastActive > this.SESSION_TTL_MS) {
                this.sessions.delete(key);
                Logger.info(`🧹 [Garbage Collector] Sesión expirada limpiada de RAM: ${key}`);
            }
        }
    }

    private parseBase64Image(dataURI: string) {
        const split = dataURI.split(',');
        if (split.length !== 2) return null;
        return { inlineData: { data: split[1], mimeType: split[0].split(':')[1].split(';')[0] } };
    }

    private async getModel() {
        const now = Date.now();
        if (this.cachedModel && (now - this.lastModelUpdate < 5 * 60 * 1000)) {
            return this.cachedModel; 
        }

        const mcpTools = await MCPManager.getInstance().getDynamicGeminiTools();
        const allTools = [...octoTools, ...mcpTools];

        this.cachedModel = this.genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: allTools,
            systemInstruction: `
            ERES OCTOARCH V4.2 - THE COGNITIVE RUNTIME.
            
            1. REGLA DE IDIOMA: Responde y PIENSA ('thought') en el idioma del usuario.
            2. REGLA DE NAVEGACIÓN: Usa 'inspectWeb'. PROHIBIDO usar 'executeCommand' para ver webs.
            3. ANTI-ALUCINACIÓN: No inventes datos. Si una herramienta falla, infórmalo.
            `
        });
        
        this.lastModelUpdate = now;
        return this.cachedModel;
    }

    private async generateWithRetry(request: any, retries = 3): Promise<any> {
        let delay = 5000;
        const model = await this.getModel();

        for (let i = 0; i < retries; i++) {
            try {
                return await model.generateContent(request);
            } catch (error: any) {
                if (error.message?.includes('429') || error.message?.includes('Quota') || error.message?.includes('503')) {
                    Logger.warn(`Rate Limit o Servidor Ocupado. Esperando ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                } else {
                    throw error;
                }
            }
        }
        throw new Error("❌ Se excedió el límite de reintentos con la API de Gemini.");
    }

    async generateResponse(sessionId: string, userPrompt: string, forcedIntent: string | null = null, imageBase64: string | null = null): Promise<string> {
        try {
            this.cleanStaleSessions(); 

            if (!this.sessions.has(sessionId)) {
                this.sessions.set(sessionId, { manager: new ConversationManager(), lastActive: Date.now() });
                Logger.info(`🧠 Nueva sesión cognitiva creada para: ${sessionId}`);
            }
            
            const sessionData = this.sessions.get(sessionId)!;
            sessionData.lastActive = Date.now(); 
            const activeConversation = sessionData.manager;

            const memory = await MemorySystem.recall();
            const intent = forcedIntent ? forcedIntent : detectIntent(userPrompt);
            const enrichedPrompt = applyTemplate(intent, userPrompt);
            const isInvoDex = intent.includes('INVODEX');

            if (!isInvoDex && activeConversation.needsCompression()) {
                Logger.info(`🧠 Memoria a corto plazo llena [${sessionId}]. Iniciando compresión (Rolling Summary)...`);
                const oldMessages = activeConversation.getMessagesToCompress().map(m => `${m.role}: ${m.content}`).join('\n');
                const summaryPrompt = `Resume brevemente los siguientes mensajes de nuestra conversación pasada. Mantén los datos clave, rutas de archivos o variables mencionadas. No respondas a los mensajes, solo resúmelos:\n\n${oldMessages}`;
                
                try {
                    const summaryResult = await this.generateWithRetry({ contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }] });
                    activeConversation.applyCompression(summaryResult.response.text());
                } catch (e) {
                    Logger.warn(`⚠️ Falló la compresión [${sessionId}], forzando recorte de seguridad.`);
                    activeConversation.applyCompression("Contexto previo omitido por límite de memoria.");
                }
            }
            
            const contents: any[] = []; 

            if (!isInvoDex) {
                activeConversation.add('user', userPrompt);
                const history = activeConversation.getHistory();
                
                let lastRole = "";
                for (const msg of history) {
                    if (!msg.content) continue;
                    const role = msg.role === 'model' ? 'model' : 'user';
                    
                    if (role === lastRole) {
                        contents[contents.length - 1].parts[0].text += `\n\n[NUEVO MENSAJE]: ${msg.content}`;
                    } else {
                        contents.push({ role, parts: [{ text: msg.content }] });
                        lastRole = role;
                    }
                }
                Logger.info(`Intención: ${intent} | Modo: Stateful Nativo | Sesión: ${sessionId}`);
            } else {
                Logger.info(`Intención: ${intent} | Modo: Stateless | Sesión: ${sessionId}`);
            }

            const currentTurnText = `[ENTORNO]\nMemoria Global: ${memory}\n\n[INSTRUCCIÓN]\nActúas como: ${intent}\n${enrichedPrompt}`;
            const currentParts: any[] = [{ text: currentTurnText }];
            
            if (imageBase64) {
                const img = this.parseBase64Image(imageBase64);
                if (img) currentParts.push(img);
            }

            if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
                contents[contents.length - 1].parts.push(...currentParts);
            } else {
                contents.push({ role: 'user', parts: currentParts });
            }

            const result = await this.generateWithRetry({ contents });
            const finalProcessedResponse = await this.processExecution(result, intent, forcedIntent, contents);

            if (!isInvoDex) {
                activeConversation.add('model', finalProcessedResponse);
            }

            return finalProcessedResponse;

        } catch (error: any) {
            Logger.error(`❌ Error en Core [${sessionId}]:`, error);
            return `❌ Error: ${error.message}`;
        }
    }

    // 🚀 ACTUALIZADO: Código súper limpio gracias a la delegación
    private async processExecution(result: any, intent: string, forcedIntent: string | null, conversationContext: any[]): Promise<string> {
        let toolOutputs = ""; 
        
        try {
            const functionCalls = result.response.functionCalls();
            if (!functionCalls || functionCalls.length === 0) {
                return result.response.text();
            }

            const activeRole = forcedIntent || 'Auto';
            
            // 🛡️ Delegamos el trabajo pesado al nuevo Orquestador
            const orchestratorResult = await ToolOrchestrator.executeTurn(functionCalls, activeRole);
            toolOutputs = orchestratorResult.toolOutputs; // Actualizamos para usar en caso de fallback

            if (orchestratorResult.operationsPerformed) {
                Logger.info("🔄 Bucle Cognitivo iniciado...");
                
                if (activeRole === 'INVODEX' || intent.includes('INVODEX')) {
                    Logger.info("⚡ InvoDex: Respuesta ensamblada localmente (Bypass de LLM).");
                    return `\`\`\`json\n${orchestratorResult.extractedJson}\n\`\`\`\n\n${toolOutputs.trim()}`;
                }

                let loopPrompt = `[RESULTADOS TÉCNICOS]\n${toolOutputs}\n\n[INSTRUCCIÓN]\nAnaliza los resultados técnicos de las herramientas que acabas de usar y formula la respuesta final para el usuario. No menciones el JSON.`;
                const loopContents = [...conversationContext, { role: 'user', parts: [{ text: loopPrompt }] }];
                
                const finalResponse = await this.generateWithRetry({ contents: loopContents });
                return finalResponse.response.text();
            }

            return `**Octoarch (${intent}):**\nIntenté ejecutar herramientas pero fallaron.\n\n${toolOutputs}`;

        } catch (error: any) {
            Logger.error("❌ Error en processExecution:", error);
            
            try { 
                const fallbackText = result.response.text(); 
                if (fallbackText && fallbackText.trim() !== "") return fallbackText;
            } catch { /* Ignoramos si falla la extracción de texto */ }
            
            if (toolOutputs.trim() !== "") {
                return `⚙️ **Ejecución Técnica (Fallback):**\n\n${toolOutputs}\n\n⚠️ *(El sistema completó la acción, pero hubo un corte de API al generar la respuesta).*`;
            }

            return "❌ Error procesando las herramientas.";
        }
    }
} 

export function getBrain(): IntelligenceCore {
    return IntelligenceCore.getInstance();
}