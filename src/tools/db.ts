export class DatabaseTool {
    static async query(sql: string): Promise<any> {
        // 🛡️ PARCHE APLICADO: Evita la Promesa Zombi que colgaba el servidor
        // Lanzamos un error claro para que el LLM sepa que debe usar otra vía por ahora.
        throw new Error("DatabaseTool no implementado. Usa el MCP Server de InvoDex.");
    }
}