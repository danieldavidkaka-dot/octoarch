import { Spawner } from '../swarm/spawner';
import { Logger } from '../utils/logger';

export class ForgeTool {
    static async execute(args: any): Promise<string> {
        const { task_description } = args;
        
        // ⛓️ LÓGICA DE LA CORREA DEL ENJAMBRE (Bounded Autonomy)
        let maxIterations = 3; // Por defecto: 3 intentos (Para que pueda arreglar errores de sintaxis comunes)
        let modeName = "MODO ESTÁNDAR";

        // Buscamos tu comando mágico de autorización
        if (task_description.toLowerCase().includes('octo sw')) {
            maxIterations = 5; // Modo desatado 
            modeName = "SWARM DESATADO 🔥";
        }
        
        Logger.info(`🔨 [FORJA] Iniciando solicitud: ${task_description}`);
        Logger.info(`🤖 [AUTONOMÍA] Modo: ${modeName} | Límite de iteraciones: ${maxIterations}`);
        
        try {
            // Pasamos el límite matemático (maxIterations) directamente al Obrero
            const result = await Spawner.invokeWorker(task_description, maxIterations);
            
            // Importante: Le decimos al Cerebro que llame al DynamicRegistry para recargar las herramientas
            const { DynamicRegistry } = await import('../dynamic_registry');
            await DynamicRegistry.loadAll();
            
            return result + "\n(Nota del Sistema: La memoria ha sido actualizada. Puedes usar la herramienta ahora mismo).";
        } catch (error: any) {
            return `❌ Error interno al invocar la forja: ${error.message}`;
        }
    }
}