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

            // 🛡️ CORTAFUEGOS ANTI-ZOMBIS: Temporizador de autodestrucción (60 segundos)
            const timeoutId = setTimeout(() => {
                Logger.warn(`[👑 ORQUESTADOR]: 🚨 ALERTA CRÍTICA - El Obrero se ha colgado. Procediendo a aniquilar el proceso (Timeout).`);
                worker.kill('SIGKILL'); // Asesina implacablemente el proceso colgado a nivel de OS
                resolve(`❌ [TIMEOUT] El Obrero fue asesinado porque tardó más de 60 segundos en responder. Es muy probable que el código que intentó compilar contuviera un bucle infinito (while loop) o una promesa que nunca se resolvió. Pídele que lo reescriba con más cuidado.`);
            }, 60000); // 60,000 milisegundos = 60 segundos

            // Le pasamos la tarea dinámica que OctoArch nos pidió
            worker.send({ tarea: taskDescription });

            worker.on('message', (respuesta: any) => {
                clearTimeout(timeoutId); // 🧹 Si responde a tiempo, cancelamos la autodestrucción
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
                clearTimeout(timeoutId); // 🧹
                Logger.error(`[👑 ORQUESTADOR]: Error en el proceso del Obrero: ${err.message}`);
                resolve(`❌ Error crítico al invocar al Obrero: ${err.message}`);
            });

            worker.on('exit', (code, signal) => {
                clearTimeout(timeoutId); // 🧹
                if (code === 0) {
                    Logger.info(`[👑 ORQUESTADOR]: El Obrero ha sido eliminado limpiamente de la memoria RAM.`);
                } else if (signal === 'SIGKILL') {
                    Logger.warn(`[👑 ORQUESTADOR]: El cadáver del Obrero ha sido retirado de la memoria tras el asesinato.`);
                } else {
                    Logger.warn(`[👑 ORQUESTADOR]: ALERTA - El Obrero colapsó con código de error ${code}.`);
                }
            });
        });
    }
}