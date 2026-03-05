// spawner.ts - El Orquestador
import { fork } from 'child_process';
import path from 'path';

async function invocarSubAgente() {
    console.log(`[👑 ORQUESTADOR]: Son las 3:00 AM. Necesito crear un módulo nuevo.`);
    console.log(`[👑 ORQUESTADOR]: Invocando al Obrero en un hilo separado...`);

    // Buscamos la ruta exacta del archivo worker.ts
    const workerPath = path.join(__dirname, 'worker.ts');

    // fork() es la magia: crea un proceso clon de Node.js
    const worker = fork(workerPath, {
        // execArgv es crucial para que funcione con TypeScript (ts-node)
        execArgv: ['-r', 'ts-node/register'] 
    });

    // Le damos la orden al Obrero
    worker.send({ tarea: 'Escribir módulo de clima' });

    // Escuchamos la respuesta del Obrero
    worker.on('message', (respuesta: any) => {
        console.log(`[👑 ORQUESTADOR]: Recibí el paquete del Obrero. Estado: ${respuesta.estado}`);
        if (respuesta.estado === 'EXITO') {
            console.log(`[👑 ORQUESTADOR]: Archivo listo en:\n${respuesta.archivo}`);
        } else {
            console.log(`[👑 ORQUESTADOR]: Motivo del fallo:\n${respuesta.error}`);
        }
    });

    // Detectamos cuando el Obrero muere
    worker.on('exit', (code) => {
        if (code === 0) {
            console.log(`[👑 ORQUESTADOR]: El Obrero ha sido eliminado limpiamente de la memoria RAM (Código 0).`);
        } else {
            console.log(`[👑 ORQUESTADOR]: ALERTA - El Obrero colapsó con código de error ${code}.`);
        }
        console.log(`[👑 ORQUESTADOR]: Ciclo nocturno terminado. OctoArch sigue funcionando al 100%.`);
    });
}

// Ejecutamos la prueba
invocarSubAgente();