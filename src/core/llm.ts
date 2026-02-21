import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { MemorySystem } from './memory';
import { ConversationManager } from './conversation';
import { Logger } from '../utils/logger';
import { detectIntent, applyTemplate } from './library';
import { octoTools } from './agent_tools';
import { AgentExecutor } from './agent_executor';

export class IntelligenceCore {
    private model: any;
    // @ts-ignore
    private conversationMgr: ConversationManager;

    private constructor() {
        this.conversationMgr = new ConversationManager();
        const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        const modelName = "gemini-2.5-flash";
        
        this.model = genAI.getGenerativeModel({ 
            model: modelName,
            tools: octoTools,
            systemInstruction: `
            ERES OCTOARCH V4.2.
            
            1. REGLA DE IDIOMA: Responde y PIENSA ('thought') en el idioma del usuario.
            2. REGLA DE NAVEGACIÓN: Usa 'inspectWeb'. PROHIBIDO usar 'executeCommand' para ver webs.
            3. ANTI-ALUCINACIÓN: No inventes datos. Si una herramienta falla, infórmalo.
            `
        });
        Logger.info(`🧠 IntelligenceCore inicializado (Modular & Stateful Nativo)`);
    }

    private parseBase64Image(dataURI: string) {
        const split = dataURI.split(',');
        if (split.length !== 2) return null;
        return { inlineData: { data: split[1], mimeType: split[0].split(':')[1].split(';')[0] } };
    }

    private async generateWithRetry(request: any, retries = 3): Promise<any> {
        let delay = 5000;
        for (let i = 0; i < retries; i++) {
            try {
                return await this.model.generateContent(request);
            } catch (error: any) {
                if (error.message?.includes('429') || error.message?.includes('Quota')) {
                    Logger.warn(`Rate Limit. Esperando ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                } else {
                    throw error;
                }
            }
        }
        throw new Error("❌ Se excedió el límite de reintentos.");
    }

    async generateResponse(userPrompt: string, forcedIntent: string | null = null, imageBase64: string | null = null): Promise<string> {
        try {
            const memory = await MemorySystem.recall();
            const intent = forcedIntent ? forcedIntent : detectIntent(userPrompt);
            const enrichedPrompt = applyTemplate(intent, userPrompt);
            const isInvoDex = intent.includes('INVODEX');
            
            const contents: any[] = []; // Arreglo nativo de historial Gemini

            if (!isInvoDex) {
                this.conversationMgr.add('user', userPrompt);
                const history = this.conversationMgr.getHistory();
                
                let lastRole = "";
                // 🔄 Traducción de Memoria a Formato Nativo de Gemini
                for (const msg of history) {
                    if (!msg.content) continue;
                    const role = msg.role === 'model' ? 'model' : 'user';
                    
                    // Gemini colapsa si hay dos "user" seguidos, así que los concatenamos
                    if (role === lastRole) {
                        contents[contents.length - 1].parts[0].text += `\n\n[NUEVO MENSAJE]: ${msg.content}`;
                    } else {
                        contents.push({ role, parts: [{ text: msg.content }] });
                        lastRole = role;
                    }
                }
                Logger.info(`Intención: ${intent} | Modo: Stateful Nativo`);
            } else {
                Logger.info(`Intención: ${intent} | Modo: Stateless`);
            }

            // 📦 Empaquetado del turno actual
            const currentTurnText = `[ENTORNO]\nMemoria Global: ${memory}\n\n[INSTRUCCIÓN]\nActúas como: ${intent}\n${enrichedPrompt}`;
            const currentParts: any[] = [{ text: currentTurnText }];
            
            if (imageBase64) {
                const img = this.parseBase64Image(imageBase64);
                if (img) currentParts.push(img);
            }

            // Si el último mensaje inyectado ya era del usuario, le adjuntamos este nuevo texto
            if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
                contents[contents.length - 1].parts.push(...currentParts);
            } else {
                contents.push({ role: 'user', parts: currentParts });
            }

            const result = await this.generateWithRetry({ contents });
            const finalProcessedResponse = await this.processExecution(result, intent, forcedIntent);

            if (!isInvoDex) {
                this.conversationMgr.add('model', finalProcessedResponse);
            }

            return finalProcessedResponse;

        } catch (error: any) {
            Logger.error("❌ Error en Core:", error);
            return `❌ Error: ${error.message}`;
        }
    }

    private async processExecution(result: any, intent: string, forcedIntent: string | null): Promise<string> {
        try {
            const functionCalls = result.response.functionCalls();
            if (!functionCalls || functionCalls.length === 0) {
                return result.response.text();
            }

            let toolOutputs = "";
            let operationsPerformed = false;
            const activeRole = forcedIntent || 'Auto';

            for (const call of functionCalls) {
                // ⚡ Delegamos la ejecución y seguridad al nuevo AgentExecutor
                const executionResult = await AgentExecutor.execute(call.name, call.args, activeRole);
                toolOutputs += executionResult;
                if (!executionResult.includes('[BLOCKED]') && !executionResult.includes('[ERROR EJECUCIÓN')) {
                    operationsPerformed = true;
                }
            }

            if (operationsPerformed) {
                Logger.info("🔄 Bucle Cognitivo iniciado...");
                const loopPrompt = `[RESULTADOS TÉCNICOS]\n${toolOutputs}\n\n[INSTRUCCIÓN]\nAnaliza los resultados técnicos de las herramientas que acabas de usar y formula la respuesta final para el usuario. No menciones el JSON.`;
                const finalResponse = await this.generateWithRetry({ contents: [{ role: 'user', parts: [{ text: loopPrompt }] }] });
                return finalResponse.response.text();
            }

            return `**Octoarch (${intent}):**\nIntenté ejecutar herramientas pero fallaron.\n\n${toolOutputs}`;

        } catch (error: any) {
            Logger.error("❌ Error en processExecution:", error);
            try { return result.response.text(); } catch { return "❌ Error procesando las herramientas."; }
        }
    }
}

let instance: IntelligenceCore | null = null;
export function getBrain(): IntelligenceCore {
    if (!instance) {
        // @ts-ignore
        instance = new IntelligenceCore();
    }
    return instance!;
}