import fs from 'fs/promises';
import path from 'path';
import { Logger } from './utils/logger'; // Corregida la ruta del import

export class DynamicRegistry {
    private static tools: Map<string, any> = new Map();
    private static schemas: any[] = [];

    /**
     * Carga o recarga todas las herramientas .ts de la carpeta dynamic_tools.
     * Usa require y limpieza de caché para permitir Hot-Reload en tiempo real.
     */
    static async loadAll() {
        // Resolvemos la ruta absoluta para evitar fallos en Windows
        const dir = path.resolve(process.cwd(), 'src', 'dynamic_tools');
        
        this.tools.clear();
        this.schemas = [];
        
        try {
            // Aseguramos que la carpeta exista
            await fs.mkdir(dir, { recursive: true });
            const files = await fs.readdir(dir);
            
            for (const file of files) {
                if (file.endsWith('.ts')) {
                    const filePath = path.join(dir, file);
                    
                    try {
                        // 🧹 LIMPIEZA DE CACHÉ: Obligamos a Node a olvidar la versión vieja del archivo
                        const resolvedPath = require.resolve(filePath);
                        if (require.cache[resolvedPath]) {
                            delete require.cache[resolvedPath];
                        }
                        
                        // 🔌 CARGA DINÁMICA: Usamos require para que ts-node lo procese correctamente
                        const module = require(filePath);
                        const tool = module.tool;

                        if (tool && tool.name) {
                            this.tools.set(tool.name, tool);
                            this.schemas.push({
                                name: tool.name,
                                description: tool.description,
                                parameters: tool.parameters
                            });
                            Logger.info(`🔌 [Hot-Swap] Herramienta inyectada: ${tool.name}`);
                        } else {
                            Logger.warn(`⚠️ El archivo ${file} no exporta un objeto 'tool' válido.`);
                        }
                    } catch (importError: any) {
                        Logger.error(`❌ Error cargando módulo ${file}:`, importError.message);
                    }
                }
            }
        } catch (error) {
            Logger.warn("Carpeta dynamic_tools no encontrada o vacía.");
        }
    }

    // Devuelve los esquemas para dárselos a Gemini
    static getSchemas() {
        return this.schemas;
    }

    // Ejecuta la herramienta si el LLM la llama
    static async executeTool(name: string, args: any): Promise<string | null> {
        const tool = this.tools.get(name);
        if (tool) {
            try {
                Logger.info(`⚙️ Ejecutando herramienta dinámica: ${name}`);
                return await tool.execute(args);
            } catch (error: any) {
                return `❌ Error interno en la herramienta dinámica '${name}': ${error.message}`;
            }
        }
        return null; // Significa que no es una herramienta dinámica
    }
}