import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { MemorySystem } from './memory';
import { Logger } from '../utils/logger';
import { octoTools } from './agent_tools';
import { MCPManager } from './mcp_manager';
import { ToolOrchestrator } from './tool_orchestrator';
import { PromptManager } from './prompt_manager';
import { DynamicRegistry } from '../dynamic_registry';
import { SessionManager } from './session_manager'; 

export class IntelligenceCore {
    private static instance: IntelligenceCore | null = null;
    private genAI: GoogleGenerativeAI;
    private cachedModel: any = null;
    private lastModelUpdate: number = 0;
    private currentRole: string = 'octo_base'; // 🧬 NUEVO: Guardamos qué ADN está activo

    private constructor() {
        this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        Logger.info(`🧠 IntelligenceCore inicializado (Slim Architecture)`);
    }

    public static getInstance(): IntelligenceCore {
        if (!this.instance) this.instance = new IntelligenceCore();
        return this.instance;
    }

    // 🧬 NUEVO: Método para cambiar el ADN (Role-Switching) en tiempo de ejecución
    public setRole(roleId: string) {
        if (this.currentRole !== roleId) {
            this.currentRole = roleId;
            // Forzamos a que el modelo se recargue en la próxima llamada para leer el nuevo ADN
            this.lastModelUpdate = 0; 
            Logger.info(`🧬 [AIEOS] ADN cambiado a: ${roleId}. El núcleo se recargará.`);
        }
    }

    // 🧬 REFACTOR: Ahora el modelo se forja basado en el ADN actual
    private async getModel() {
        const now = Date.now();
        // Solo usamos caché si el modelo no es muy viejo y no cambiamos de rol
        if (this.cachedModel && (now - this.lastModelUpdate < 5 * 60 * 1000)) return this.cachedModel;

        const mcpTools = await MCPManager.getInstance().getDynamicGeminiTools();
        const allTools = [...octoTools, ...mcpTools];

        // 🚀 INYECCIÓN DINÁMICA DE HERRAMIENTAS
        const dynamicSchemas = DynamicRegistry.getSchemas();
        if (dynamicSchemas.length > 0) allTools.push({ functionDeclarations: dynamicSchemas });

        // 🧬 LECTURA DEL ADN (AIEOS)
        const systemInstructionText = await PromptManager.getSystemPrompt(this.currentRole);
        const dynamicTemperature = await PromptManager.getLlmTemperature(this.currentRole);

        Logger.info(`⚙️ [AIEOS] Inyectando núcleo con Temperatura: ${dynamicTemperature}`);

        this.cachedModel = this.genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            tools: allTools,
            systemInstruction: systemInstructionText, // 🧬 ADN Inyectado
            generationConfig: { 
                temperature: dynamicTemperature, // 🧬 Temperatura Matemática Inyectada
                topK: 32, 
                topP: 0.8 
            }
        });
        
        this.lastModelUpdate = now;
        return this.cachedModel;
    }

    private async generateWithRetry(request: any, retries = 3): Promise<any> {
        let delay = 5000;
        const model = await this.getModel();
        for (let i = 0; i < retries; i++) {
            try { return await model.generateContent(request); }
            catch (error: any) {
                if (error.message?.includes('429') || error.message?.includes('503')) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                } else throw error;
            }
        }
        throw new Error("❌ Se excedió el límite de reintentos con la API de Gemini.");
    }

    async generateResponse(sessionId: string, userPrompt: string, forcedIntent: string | null = null, imageBase64: string | null = null): Promise<string> {
        try {
            const activeConversation = SessionManager.getInstance().getSession(sessionId);
            await SessionManager.getInstance().loadHistoryFromCloud(sessionId, activeConversation);
            const memory = await MemorySystem.recall();
            const activeMode = forcedIntent || 'chat';
            const isInvoDex = activeMode === 'INVODEX';

            // Compresión de contexto delegada
            if (!isInvoDex && activeConversation.needsCompression()) {
                const oldMessages = activeConversation.getMessagesToCompress().map(m => `${m.role}: ${m.content}`).join('\n');
                try {
                    const summary = await this.generateWithRetry({ contents: [{ role: 'user', parts: [{ text: `Resume:\n${oldMessages}` }] }] });
                    activeConversation.applyCompression(summary.response.text());
                } catch { activeConversation.applyCompression("Contexto omitido."); }
            }
            
            const contents: any[] = [];
            if (!isInvoDex) {
                activeConversation.add('user', userPrompt);
                
                // ☁️ NUEVO: Guardar mensaje del usuario en Supabase (Fire & Forget)
                SessionManager.getInstance().saveMessageToCloud(sessionId, 'user', userPrompt);

                let lastRole = "";
                for (const msg of activeConversation.getHistory()) {
                    if (!msg.content) continue;
                    const role = msg.role === 'model' ? 'model' : 'user';
                    if (role === lastRole) contents[contents.length - 1].parts[0].text += `\n\n${msg.content}`;
                    else { contents.push({ role, parts: [{ text: msg.content }] }); lastRole = role; }
                }
            }

            // Mantenemos tu lógica de "Turn Prompt" para meter memoria dinámica
            // pero el PromptManager ahora espera que uses la función buildTurnPrompt tal como la tenías
            const currentTurnText = PromptManager.buildTurnPrompt(activeMode, memory, userPrompt, !!imageBase64);
            const currentParts: any[] = [{ text: currentTurnText }];
            if (imageBase64) currentParts.push({ inlineData: { data: imageBase64.split(',')[1], mimeType: imageBase64.split(':')[1].split(';')[0] } });

            if (contents.length > 0 && contents[contents.length - 1].role === 'user') contents[contents.length - 1].parts.push(...currentParts);
            else contents.push({ role: 'user', parts: currentParts });

            const result = await this.generateWithRetry({ contents });
            const finalResponse = await this.processExecution(result, activeMode, contents);

            if (!isInvoDex) {
                activeConversation.add('model', finalResponse);
                
                // ☁️ NUEVO: Guardar respuesta de OctoArch en Supabase (Fire & Forget)
                SessionManager.getInstance().saveMessageToCloud(sessionId, 'assistant', finalResponse);
            }
            return finalResponse;

        } catch (error: any) {
            Logger.error(`❌ Error en Core [${sessionId}]: ${error.message}`);
            return `❌ Error: ${error.message}`;
        }
    }

    private async processExecution(result: any, activeMode: string, context: any[]): Promise<string> {
        const functionCalls = result.response.functionCalls();
        if (!functionCalls || functionCalls.length === 0) return result.response.text();

        const orchestratorResult = await ToolOrchestrator.executeTurn(functionCalls, activeMode);
        
        if (orchestratorResult.operationsPerformed) {
            if (activeMode === 'INVODEX') return `\`\`\`json\n${orchestratorResult.extractedJson}\n\`\`\`\n\n${orchestratorResult.toolOutputs.trim()}`;
            const loopContents = [...context, { role: 'user', parts: [{ text: `[RESULTADOS]\n${orchestratorResult.toolOutputs}\nAnaliza esto y responde.` }] }];
            const finalResponse = await this.generateWithRetry({ contents: loopContents });
            return finalResponse.response.text();
        }
        return `**Octoarch:** Intenté ejecutar herramientas pero fallaron.\n\n${orchestratorResult.toolOutputs}`;
    }
}

export function getBrain(): IntelligenceCore { return IntelligenceCore.getInstance(); }