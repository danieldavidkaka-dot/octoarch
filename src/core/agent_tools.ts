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
        },
        // 🧠 NUEVA HERRAMIENTA: El Hipocampo Digital (Auto-Aprendizaje)
        {
            name: "write_skill",
            description: "Permite a OctoArch crear o actualizar una Habilidad (Skill) en el disco duro. Úsala cuando el usuario te pida aprender algo nuevo, guardar reglas, o recordar preferencias permanentemente.",
            parameters: {
                type: SchemaType.OBJECT,
                properties: {
                    filename: { type: SchemaType.STRING, description: "Nombre del archivo (ej. 'experto-seo.md' o 'reglas-cfo.md'). DEBE terminar en .md" },
                    content: { type: SchemaType.STRING, description: "El contenido completo en formato Markdown. DEBE incluir el frontmatter YAML con 'name' y 'description' al inicio." }
                },
                required: ["filename", "content"]
            }
        }
    ]
}];