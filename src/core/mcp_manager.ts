import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SchemaType, Tool } from '@google/generative-ai';
import { Logger } from '../utils/logger';

export class MCPManager {
    private static instance: MCPManager | null = null;
    
    // Diccionario para mantener las conexiones vivas a múltiples servidores MCP
    private clients: Map<string, Client> = new Map();
    // Diccionario para saber a qué servidor pertenece cada herramienta
    private toolRegistry: Map<string, string> = new Map(); 

    private constructor() {}

    public static getInstance(): MCPManager {
        if (!this.instance) {
            this.instance = new MCPManager();
        }
        return this.instance;
    }

    /**
     * Conecta OctoArch a un servidor MCP externo (ej: un script de Python o Node)
     */
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

    /**
     * Interroga a todos los servidores conectados, obtiene sus herramientas 
     * y las traduce dinámicamente al formato nativo de Gemini
     */
    public async getDynamicGeminiTools(): Promise<Tool[]> {
        const dynamicDeclarations: any[] = [];

        for (const [serverName, client] of this.clients.entries()) {
            try {
                const response = await client.listTools();
                
                for (const tool of response.tools) {
                    // Mapeamos el nombre de la herramienta al servidor que la ejecuta
                    this.toolRegistry.set(tool.name, serverName);

                    // Traducción de JSON Schema (MCP) a Gemini SchemaType
                    const properties: any = {};
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

    /**
     * Ejecuta una herramienta en el servidor MCP correspondiente
     */
    public async executeTool(toolName: string, args: any): Promise<string> {
        const serverName = this.toolRegistry.get(toolName);
        if (!serverName) {
            throw new Error(`No se encontró un servidor MCP para la herramienta: ${toolName}`);
        }

        const client = this.clients.get(serverName);
        if (!client) {
            throw new Error(`El cliente MCP ${serverName} está desconectado.`);
        }

        Logger.info(`⚡ Ejecutando MCP Tool [${toolName}] en servidor [${serverName}]...`);
        
        // Añadimos "as any" para que TypeScript deje de quejarse de la estructura de retorno
        const result = await client.callTool({
            name: toolName,
            arguments: args
        }) as any; 

        // Formatear el resultado para devolverlo al Bucle Cognitivo
        if (result.isError) {
            return `❌ [ERROR MCP]: ${JSON.stringify(result.content)}`;
        }
        
        // También añadimos "any" a "c" para que map no falle
        return result.content.map((c: any) => c.type === 'text' ? c.text : '[Contenido No Textual]').join('\n');
    }
}