import * as fs from 'fs/promises';
import * as path from 'path';
import { PATHS } from '../config/paths';

export const MemoryWriterTool = {
    name: "write_skill",
    description: "Permite a OctoArch crear o actualizar una Habilidad (Skill) en el disco duro. Úsala cuando el usuario te pida aprender algo nuevo, guardar reglas, o recordar preferencias permanentemente.",
    parameters: {
        type: "object",
        properties: {
            filename: {
                type: "string",
                description: "Nombre del archivo (ej. 'experto-seo.md' o 'reglas-cfo.md'). DEBE terminar en .md"
            },
            content: {
                type: "string",
                description: "El contenido completo en formato Markdown. DEBE incluir el frontmatter YAML con 'name' y 'description' al inicio."
            }
        },
        required: ["filename", "content"]
    },
    
    execute: async (args: { filename: string, content: string }): Promise<string> => {
        try {
            // 1. Sanitización de seguridad (Path Traversal Protection)
            let safeFilename = path.basename(args.filename);
            if (!safeFilename.endsWith('.md')) {
                safeFilename += '.md';
            }

            // 2. Ruta exacta a la carpeta de skills
            const skillsDir = path.join(PATHS.WORKSPACE, 'skills');
            const filePath = path.join(skillsDir, safeFilename);

            // 3. Asegurarnos de que el directorio exista
            await fs.mkdir(skillsDir, { recursive: true });

            // 4. Escribir el archivo en el disco duro
            await fs.writeFile(filePath, args.content, 'utf8');

            return `✅ [MemoryWriter] ÉXITO: La Skill '${safeFilename}' ha sido guardada en el disco duro. A partir de ahora puedes usarla cargándola con el sistema de skills.`;
            
        } catch (error: any) {
            return `❌ [MemoryWriter] ERROR al guardar el archivo: ${error.message}`;
        }
    }
};