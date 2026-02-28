import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SchemaType, Tool } from '@google/generative-ai';
import { Logger } from '../utils/logger';
import { z } from 'zod'; // 🛡️ Nueva importación de Zod

// 🛡️ Esquema estricto para lo que devuelve un servidor MCP
const McpToolResultSchema = z.object({
    isError: z.boolean().optional(),
    content: z.array(z.object({
        type: z.string(),
        text: z.string().optional()
    }).passthrough())
}).passthrough();

export class MCPManager {
    private static instance: MCPManager | null = null;
    
    private clients: Map<string, Client> = new Map();
    private toolRegistry: Map<string, string> = new Map(); 

    private constructor() {}

    public static getInstance(): MCPManager {
        if (!this.instance) {
            this.instance = new MCPManager();
        }
        return this.instance;
    }

    public async connectServer(serverName: string, command: string, args: string[]): Promise<void> {
        try {
            Logger.info(`🔌 Conectando al servidor MCP: [${serverName}]...`);
            
            const transport = new StdioClientTransport({ command, args });
            const client = new Client(
                { name: "OctoArch-Cognitive-Runtime", version: "4.2.0" },
                { capabilities: {} }
            );

            await client.connect(transport);
            this.clients.set(serverName, client);
            
            Logger.info(`✅ MCP Server [${serverName}] conectado con éxito.`);
        } catch (error: any) {
            Logger.error(`❌ Error conectando al servidor MCP [${serverName}]:`, error);
        }
    }

    public async getDynamicGeminiTools(): Promise<Tool[]> {
        const dynamicDeclarations: any[] = [];

        for (const [serverName, client] of this.clients.entries()) {
            try {
                const response = await client.listTools();
                
                for (const tool of response.tools) {
                    this.toolRegistry.set(tool.name, serverName);

                    const properties: Record<string, any> = {};
                    const required: string[] = tool.inputSchema?.required || [];

                    if (tool.inputSchema?.properties) {
                        for (const [key, prop] of Object.entries<any>(tool.inputSchema.properties)) {
                            properties[key] = {
                                type: prop.type === 'string' ? SchemaType.STRING : 
                                      prop.type === 'number' ? SchemaType.NUMBER : 
                                      prop.type === 'boolean' ? SchemaType.BOOLEAN : SchemaType.OBJECT,
                                description: prop.description || ""
                            };
                        }
                    }

                    dynamicDeclarations.push({
                        name: tool.name,
                        description: `[Vía MCP: ${serverName}] ${tool.description}`,
                        parameters: {
                            type: SchemaType.OBJECT,
                            properties: properties,
                            required: required
                        }
                    });
                }
            } catch (error) {
                Logger.error(`⚠️ Error obteniendo herramientas de [${serverName}]:`, error);
            }
        }

        return dynamicDeclarations.length > 0 ? [{ functionDeclarations: dynamicDeclarations }] : [];
    }

    public async executeTool(toolName: string, args: Record<string, unknown>): Promise<string> {
        const serverName = this.toolRegistry.get(toolName);
        if (!serverName) {
            throw new Error(`No se encontró un servidor MCP para la herramienta: ${toolName}`);
        }

        const client = this.clients.get(serverName);
        if (!client) {
            throw new Error(`El cliente MCP ${serverName} está desconectado.`);
        }

        Logger.info(`⚡ Ejecutando MCP Tool [${toolName}] en servidor [${serverName}]...`);
        
        // 🛡️ Implementación de Timeout (Circuit Breaker)
        const callPromise = client.callTool({
            name: toolName,
            arguments: args
        });

        // Cronómetro de autodestrucción: 30 segundos
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new Error(`[TIMEOUT] La herramienta MCP '${toolName}' no respondió en 30 segundos.`));
            }, 30000);
        });

        let rawResult;
        try {
            // Promise.race ejecuta ambas. Si el timeout termina antes, lanza el error y aborta el bloqueo.
            rawResult = await Promise.race([callPromise, timeoutPromise]);
        } catch (error: any) {
            Logger.error(`❌ Error o Timeout ejecutando MCP:`, error);
            return `❌ [ERROR MCP]: ${error.message || 'Fallo de conexión.'} El sistema abortó la operación para evitar el congelamiento de OctoArch. Reintenta más tarde.`;
        }

        const parsedResult = McpToolResultSchema.safeParse(rawResult);
        
        if (!parsedResult.success) {
            Logger.error(`Error de validación MCP:`, parsedResult.error);
            return `❌ [ERROR MCP]: El servidor ${serverName} devolvió datos malformados.`;
        }

        const result = parsedResult.data;

        if (result.isError) {
            return `❌ [ERROR MCP]: ${JSON.stringify(result.content)}`;
        }
        
        return result.content.map(c => c.type === 'text' ? c.text : '[Contenido No Textual]').join('\n');
    }
}