import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { MemorySystem } from './memory';
import { ConversationManager } from './conversation';
import { Logger } from '../utils/logger';
import { detectIntent, applyTemplate } from './library';
import { octoTools } from './agent_tools';
import { AgentExecutor } from './agent_executor';
import { MCPManager } from './mcp_manager'; // 🔌 Nueva integración

export class IntelligenceCore {
    private genAI: GoogleGenerativeAI;
    // @ts-ignore
    private conversationMgr: ConversationManager;

    private constructor() {
        this.conversationMgr = new ConversationManager();
        this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        Logger.info(`🧠 IntelligenceCore inicializado (Modular, Stateful & MCP Ready)`);
    }

    private parseBase64Image(dataURI: string) {
        const split = dataURI.split(',');
        if (split.length !== 2) return null;
        return { inlineData: { data: split[1], mimeType: split[0].split(':')[1].split(';')[0] } };
    }

    // 🏆 Instanciación dinámica del modelo para inyectar herramientas MCP en caliente
    private async getModel() {
        const mcpTools = await MCPManager.getInstance().getDynamicGeminiTools();
        const allTools = [...octoTools, ...mcpTools];

        return this.genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: allTools,
            systemInstruction: `
            ERES OCTOARCH V4.2 - THE COGNITIVE RUNTIME.
            
            1. REGLA DE IDIOMA: Responde y PIENSA ('thought') en el idioma del usuario.
            2. REGLA DE NAVEGACIÓN: Usa 'inspectWeb'. PROHIBIDO usar 'executeCommand' para ver webs.
            3. ANTI-ALUCINACIÓN: No inventes datos. Si una herramienta falla, infórmalo.
            `
        });
    }

    private async generateWithRetry(request: any, retries = 3): Promise<any> {
        let delay = 5000;
        // Instanciamos el modelo con las herramientas actualizadas
        const model = await this.getModel();

        for (let i = 0; i < retries; i++) {
            try {
                return await model.generateContent(request);
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
            
            const contents: any[] = []; 

            if (!isInvoDex) {
                this.conversationMgr.add('user', userPrompt);
                const history = this.conversationMgr.getHistory();
                
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
                Logger.info(`Intención: ${intent} | Modo: Stateful Nativo`);
            } else {
                Logger.info(`Intención: ${intent} | Modo: Stateless`);
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
        // Movido aquí arriba para que el bloque catch pueda leer el resultado si Google corta la conexión
        let toolOutputs = ""; 
        
        try {
            const functionCalls = result.response.functionCalls();
            if (!functionCalls || functionCalls.length === 0) {
                return result.response.text();
            }

            let operationsPerformed = false;
            const activeRole = forcedIntent || 'Auto';

            for (const call of functionCalls) {
                let executionResult = "";

                // 1. Ejecución Nativa
                executionResult = await AgentExecutor.execute(call.name, call.args, activeRole);
                
                // 2. Ejecución MCP en cascada (Si AgentExecutor no la reconoce)
                if (executionResult.includes('Herramienta desconocida')) {
                    try {
                        const mcpResult = await MCPManager.getInstance().executeTool(call.name, call.args);
                        executionResult = `\n--- RESULTADO MCP (${call.name}) ---\n${mcpResult}\n`;
                    } catch (mcpError: any) {
                        executionResult = `❌ [ERROR MCP en ${call.name}]: ${mcpError.message}\n`;
                    }
                }

                toolOutputs += executionResult;
                if (!executionResult.includes('[BLOCKED]') && !executionResult.includes('[ERROR')) {
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
            
            // Intento de rescate 1: Buscar texto plano en la primera respuesta
            try { 
                const fallbackText = result.response.text(); 
                if (fallbackText && fallbackText.trim() !== "") {
                    return fallbackText;
                }
            } catch { /* Ignoramos si falla la extracción de texto */ }
            
            // Intento de rescate 2: Si hay resultados técnicos, devolverlos sin el formato humano
            if (toolOutputs.trim() !== "") {
                return `⚙️ **Ejecución Técnica (Fallback):**\n\n${toolOutputs}\n\n⚠️ *(El sistema completó la acción, pero hubo un corte de API al generar la respuesta humana).*`;
            }

            return "❌ Error procesando las herramientas.";
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