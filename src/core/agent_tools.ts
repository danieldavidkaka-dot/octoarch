import { SchemaType, Tool } from '@google/generative-ai';

export const octoTools: Tool[] = [{
    functionDeclarations: [
        {
            name: "readFile",
            description: "Lee el contenido de un archivo en el sistema local.",
            parameters: {
                type: SchemaType.OBJECT,
                properties: {
                    path: { type: SchemaType.STRING, description: "Ruta del archivo a leer" }
                },
                required: ["path"]
            }
        },
        {
            name: "createFile",
            description: "Crea o sobrescribe un archivo en el sistema local.",
            parameters: {
                type: SchemaType.OBJECT,
                properties: {
                    path: { type: SchemaType.STRING, description: "Ruta destino del archivo" },
                    content: { type: SchemaType.STRING, description: "Contenido completo" }
                },
                required: ["path", "content"]
            }
        },
        {
            name: "executeCommand",
            description: "Ejecuta un comando en la terminal (ej: npm install). Prohibido para webs.",
            parameters: {
                type: SchemaType.OBJECT,
                properties: {
                    command: { type: SchemaType.STRING, description: "Comando a ejecutar" }
                },
                required: ["command"]
            }
        },
        {
            name: "inspectWeb",
            description: "Navega a una URL y extrae su contenido usando Puppeteer.",
            parameters: {
                type: SchemaType.OBJECT,
                properties: {
                    url: { type: SchemaType.STRING, description: "URL completa a inspeccionar" }
                },
                required: ["url"]
            }
        },
        {
            name: "checkGmail",
            description: "Revisa la bandeja de entrada de Gmail conectada buscando correos nuevos/no leídos que tengan archivos adjuntos.",
            parameters: {
                type: SchemaType.OBJECT,
                properties: {} 
            }
        },
        // 🧠 NUEVA HERRAMIENTA: Lector de Skills
        {
            name: "loadSkill",
            description: "Carga un manual de habilidades (.md) desde la carpeta workspace/skills/ para adquirir nuevos conocimientos temporales.",
            parameters: {
                type: SchemaType.OBJECT,
                properties: {
                    skillName: { type: SchemaType.STRING, description: "Nombre de la skill sin extensión (ej: frontend-design)" }
                },
                required: ["skillName"]
            }
        }
    ]
}];