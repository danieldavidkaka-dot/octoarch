import { AgentExecutor } from './agent_executor';
import { MCPManager } from './mcp_manager';
import { Logger } from '../utils/logger';

export class ToolOrchestrator {
    /**
     * Procesa la lista de herramientas que el LLM solicitó usar.
     * Retorna los resultados concatenados y los datos extraídos listos para el bucle cognitivo.
     */
    static async executeTurn(functionCalls: any[], activeRole: string): Promise<{
        toolOutputs: string;
        extractedJson: string;
        operationsPerformed: boolean;
    }> {
        let toolOutputs = ""; 
        let extractedJson = ""; 
        let operationsPerformed = false;

        for (const call of functionCalls) {
            // 🛡️ CAPTURA DE MEMORIA: Bypass específico para InvoDex
            if (call.name === 'procesar_factura') {
                extractedJson = JSON.stringify(call.args, null, 2);
            }

            let executionResult = "";
            
            // 1. Intenta ejecutar como herramienta nativa (shell, archivos, navegador)
            executionResult = await AgentExecutor.execute(call.name, call.args, activeRole);
            
            // 2. Si no es nativa, busca en los servidores externos MCP (ERP, Bases de datos)
            if (executionResult.includes('Herramienta desconocida')) {
                try {
                    const mcpResult = await MCPManager.getInstance().executeTool(call.name, call.args);
                    executionResult = `\n--- RESULTADO MCP (${call.name}) ---\n${mcpResult}\n`;
                } catch (mcpError: any) {
                    executionResult = `❌ [ERROR MCP en ${call.name}]: ${mcpError.message}\n`;
                }
            }

            toolOutputs += executionResult;
            
            // Verificamos si la operación fue exitosa para permitir que el bucle continúe
            if (!executionResult.includes('[BLOCKED]') && !executionResult.includes('[ERROR')) {
                operationsPerformed = true;
            }
        }

        return { toolOutputs, extractedJson, operationsPerformed };
    }
}