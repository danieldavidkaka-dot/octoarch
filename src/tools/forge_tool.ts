import { Spawner } from '../swarm/spawner';
import { Logger } from '../utils/logger';

export class ForgeTool {
    static async execute(args: any): Promise<string> {
        const { task_description } = args;
        
        Logger.info(`🔨 [FORJA] Iniciando solicitud de forjado de herramienta: ${task_description}`);
        
        try {
            // Llamamos al spawner y esperamos a que el Obrero termine su trabajo
            const result = await Spawner.invokeWorker(task_description);
            
            // Importante: Le decimos al Cerebro que llame al DynamicRegistry para recargar las herramientas
            const { DynamicRegistry } = await import('../dynamic_registry');
            await DynamicRegistry.loadAll();
            
            return result + "\n(Nota del Sistema: La memoria ha sido actualizada. Puedes usar la herramienta ahora mismo).";
        } catch (error: any) {
            return `❌ Error interno al invocar la forja: ${error.message}`;
        }
    }
}