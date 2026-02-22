import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
    { name: "invodex-erp-mock", version: "1.0.0" },
    { capabilities: { tools: {} } }
);

// 1. Declaramos qué herramientas tiene este servidor
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [{
            name: "procesar_factura",
            description: "Procesa una factura y la indexa simulando una conexión a un sistema ERP.",
            inputSchema: {
                type: "object",
                properties: {
                    nroFactura: { type: "string" },
                    cliente: { type: "string" },
                    monto: { type: "number" }
                },
                required: ["nroFactura", "cliente", "monto"]
            }
        }]
    };
});

// 2. Definimos qué hace la herramienta cuando OctoArch la llama
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "procesar_factura") {
        const { nroFactura, cliente, monto } = request.params.arguments as any;
        
        // Aquí en el futuro iría tu conexión real a SQL o SAP
        return {
            content: [{
                type: "text",
                text: `✅ [MCP ERP SERVER] Factura ${nroFactura} del cliente ${cliente} por $${monto} procesada e indexada correctamente en el ERP.`
            }]
        };
    }
    throw new Error("Herramienta no encontrada");
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main();