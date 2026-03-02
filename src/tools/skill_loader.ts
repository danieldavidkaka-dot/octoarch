import fs from 'fs/promises'; // Usamos la versión de promesas para no bloquear el Event Loop
import path from 'path';
import { Logger } from '../utils/logger';

export class SkillLoader {
    // 🛡️ LÍMITE DE SEGURIDAD: 50KB máximo para no reventar el contexto de Gemini
    private static readonly MAX_SKILL_SIZE = 50 * 1024; 

    static async load(skillName: string): Promise<string> {
        try {
            // Limpiamos el nombre para evitar que el bot navegue fuera de la carpeta (Path Traversal)
            const safeName = path.basename(skillName, '.md');
            const skillPath = path.resolve(process.cwd(), `workspace/skills/${safeName}.md`);

            // 1. Verificamos si existe de forma asíncrona
            try {
                await fs.access(skillPath);
            } catch {
                return `❌ No se encontró la skill: ${safeName}. Asegúrate de que el archivo exista en workspace/skills/.`;
            }

            // 🛡️ 2. Validar el tamaño antes de leer (Evita gastar tokens innecesarios)
            const stats = await fs.stat(skillPath);
            if (stats.size > this.MAX_SKILL_SIZE) {
                Logger.warn(`🛡️ [SkillLoader] Skill rechazada por exceso de tamaño: ${safeName} (${(stats.size / 1024).toFixed(2)}KB)`);
                return `❌ La skill '${safeName}' excede el límite de seguridad de 50KB. Redúcela para proteger el consumo de tokens y la memoria.`;
            }

            // 3. Lectura asíncrona (No bloquea el servidor)
            const content = await fs.readFile(skillPath, 'utf-8');
            Logger.info(`🎮 Skill cargada en memoria: ${safeName} (${(stats.size / 1024).toFixed(2)}KB)`);
            
            // Le damos una orden fuerte al LLM para que obedezca el contenido
            return `✅ SKILL CARGADA CORRECTAMENTE. A partir de este momento, DEBES aplicar las siguientes reglas y conocimientos para la tarea solicitada:\n\n${content}\n\n--- FIN DE LA SKILL ---`;
        } catch (error: any) {
            return `❌ Error al cargar la skill: ${error.message}`;
        }
    }
}