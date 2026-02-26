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
            description: "Procesa una factura y crea un documento preliminar en el sistema ERP (SAP B1 / Profit Plus).",
            inputSchema: {
                type: "object",
                properties: {
                    rif_proveedor: { type: "string" },
                    nombre_proveedor: { type: "string" },
                    numero_factura: { type: "string" },
                    numero_control: { type: "string" },
                    fecha_emision: { type: "string" },
                    subtotal_base_imponible: { type: "number" },
                    porcentaje_iva: { type: "number" },
                    monto_iva: { type: "number" },
                    monto_total: { type: "number" }
                },
                required: [
                    "rif_proveedor", "nombre_proveedor", "numero_factura", 
                    "numero_control", "fecha_emision", "subtotal_base_imponible", 
                    "porcentaje_iva", "monto_iva", "monto_total"
                ]
            }
        }]
    };
});

// 2. Definimos qué hace la herramienta cuando OctoArch la llama
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "procesar_factura") {
        const { 
            rif_proveedor, nombre_proveedor, numero_factura, 
            numero_control, fecha_emision, subtotal_base_imponible, 
            porcentaje_iva, monto_iva, monto_total 
        } = request.params.arguments as any;
        
        // Aquí en el futuro irá tu conexión real a SQL, SAP B1 o Profit Plus
        return {
            content: [{
                type: "text",
                text: `✅ [MCP ERP SERVER] Documento Preliminar Creado.\nProveedor: ${nombre_proveedor} (${rif_proveedor})\nFactura: ${numero_factura} | Control: ${numero_control}\nFecha: ${fecha_emision}\nTotal: Bs. ${monto_total} (Base: ${subtotal_base_imponible} + IVA: ${monto_iva})`
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