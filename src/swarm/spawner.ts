// spawner.ts - El Orquestador del Sistema Swarm
import { fork } from 'child_process';
import path from 'path';
import { Logger } from '../utils/logger';

export class Spawner {
    static async invokeWorker(taskDescription: string): Promise<string> {
        return new Promise((resolve, reject) => {
            Logger.info(`[👑 ORQUESTADOR]: Necesito crear un módulo nuevo.`);
            Logger.info(`[👑 ORQUESTADOR]: Misión: "${taskDescription}"`);
            Logger.info(`[👑 ORQUESTADOR]: Invocando al Obrero en un hilo separado...`);

            const workerPath = path.join(__dirname, 'worker.ts');

            const worker = fork(workerPath, {
                execArgv: ['-r', 'ts-node/register'] 
            });

            // Le pasamos la tarea dinámica que OctoArch nos pidió
            worker.send({ tarea: taskDescription });

            worker.on('message', (respuesta: any) => {
                Logger.info(`[👑 ORQUESTADOR]: Recibí el paquete del Obrero. Estado: ${respuesta.estado}`);
                if (respuesta.estado === 'EXITO') {
                    Logger.info(`[👑 ORQUESTADOR]: Archivo listo en:\n${respuesta.archivo}`);
                    resolve(`✅ Herramienta forjada con éxito y promovida a producción en: ${respuesta.archivo}. OctoArch, puedes usarla inmediatamente.`);
                } else {
                    Logger.error(`[👑 ORQUESTADOR]: Motivo del fallo:\n${respuesta.error}`);
                    resolve(`❌ El Obrero falló al forjar la herramienta. Razón: ${respuesta.error}`);
                }
            });

            worker.on('error', (err) => {
                Logger.error(`[👑 ORQUESTADOR]: Error en el proceso del Obrero: ${err.message}`);
                resolve(`❌ Error crítico al invocar al Obrero: ${err.message}`);
            });

            worker.on('exit', (code) => {
                if (code === 0) {
                    Logger.info(`[👑 ORQUESTADOR]: El Obrero ha sido eliminado limpiamente de la memoria RAM.`);
                } else {
                    Logger.warn(`[👑 ORQUESTADOR]: ALERTA - El Obrero colapsó con código de error ${code}.`);
                }
            });
        });
    }
}