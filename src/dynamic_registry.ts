import fs from 'fs/promises';
import path from 'path';
import { Logger } from './utils/logger';

// 🛡️ NUEVO: Interfaz estricta para garantizar que toda herramienta dinámica tenga el formato correcto
export interface IOctoTool {
    name: string;
    description: string;
    parameters: any;
    execute: (args: any) => Promise<string>;
}

export class DynamicRegistry {
    // 🛡️ REFACTOR: Cambiamos de 'any' a la interfaz estricta 'IOctoTool'
    private static tools: Map<string, IOctoTool> = new Map();
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

                        // 🛡️ CORTAFUEGOS DE HOT-SWAP: Validación exhaustiva de la herramienta forjada
                        if (!tool) {
                            Logger.warn(`⚠️ El archivo ${file} no exporta un objeto 'tool'.`);
                            continue;
                        }
                        
                        if (!tool.name) {
                            Logger.warn(`⚠️ El archivo ${file} exporta un 'tool' pero le falta la propiedad 'name'.`);
                            continue;
                        }
                        
                        if (typeof tool.execute !== 'function') {
                            Logger.error(`🚨 [Hot-Swap Rechazado] El archivo ${file} exporta un 'tool' válido pero NO tiene el método 'execute()'. El archivo será ignorado para evitar la caída del servidor.`);
                            continue;
                        }

                        // ✅ Si pasó el cortafuegos, inyectamos al cerebro
                        this.tools.set(tool.name, tool as IOctoTool);
                        this.schemas.push({
                            name: tool.name,
                            description: tool.description,
                            parameters: tool.parameters
                        });
                        
                        Logger.info(`🔌 [Hot-Swap] Herramienta inyectada de forma segura: ${tool.name}`);

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
                // Ahora TypeScript sabe que 'execute' existe y es una función
                return await tool.execute(args);
            } catch (error: any) {
                return `❌ Error interno en la herramienta dinámica '${name}': ${error.message}`;
            }
        }
        return null; // Significa que no es una herramienta dinámica
    }
}