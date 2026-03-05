import { CoderLLM } from './coder_llm';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
const cerebro = new CoderLLM();

process.on('message', async (mensaje: any) => {
    console.log(`[👷 OBRERO]: He despertado. Orden recibida: "${mensaje.tarea}"`);

    const maxIntentos = 3;
    let intentoActual = 1;
    
    // 🧠 AQUÍ ESTÁ EL CAMBIO: El prompt técnico estricto para encajar en OctoArch
    let promptTecnico = `Escribe un módulo en TypeScript que cumpla esta orden: ${mensaje.tarea}.
    REGLA VITAL 1: Usa 'fetch' nativo de Node.js. NUNCA uses la librería 'request'.
    REGLA VITAL 2: El código DEBE exportar un objeto constante llamado 'tool' que cumpla con la interfaz de herramientas de Gemini.
    
    USA EXACTAMENTE ESTA PLANTILLA COMO BASE:
    
    import { SchemaType } from '@google/generative-ai';
    
    export const tool = {
        name: "nombre_de_la_funcion_en_snake_case",
        description: "Descripción muy detallada de cuándo y para qué usar esta herramienta.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                parametro1: { type: SchemaType.STRING, description: "..." }
            },
            required: ["parametro1"]
        },
        execute: async (args: any): Promise<string> => {
            // AQUÍ VA TU LÓGICA (Fetch, procesamiento, etc)
            // Siempre debes retornar un string con el resultado.
            return "resultado";
        }
    };
    `;

    const tempDir = path.join(process.cwd(), 'src', 'skills', 'temp');
    const finalDir = path.join(process.cwd(), 'src', 'dynamic_tools'); // 🚀 La carpeta definitiva

    // Aseguramos que ambas carpetas existan
    await fs.mkdir(tempDir, { recursive: true });
    await fs.mkdir(finalDir, { recursive: true });

    let currentTempPath = "";

    while (intentoActual <= maxIntentos) {
        console.log(`\n[👷 OBRERO]: 🔄 Iniciando forja (Intento ${intentoActual}/${maxIntentos})...`);
        
        try {
            // 1. FORJAR (Ajustado para recibir objeto JSON)
            const { filename, code } = await cerebro.generateCode(promptTecnico);
            
            // Ruta temporal con el nombre sugerido por la IA
            currentTempPath = path.join(tempDir, filename);

            // Limpiamos la basura de markdown por si acaso
            const codigoLimpio = code.replace("```typescript", "").replace("```ts", "").replaceAll("```", "").trim();
            await fs.writeFile(currentTempPath, codigoLimpio, 'utf-8');
            console.log(`[👷 OBRERO]: Archivo guardado como '${filename}'. Ejecutando Linter...`);

            // 2. TESTEAR
            await execAsync(`npx tsc --project tsconfig.json --noEmit`);
            
            // 3. ASCENSO DEL CÓDIGO (Si llega aquí, es porque no hubo throw de execAsync)
            console.log(`[👷 OBRERO]: ✅ ¡Sintaxis perfecta! Compilación superada.`);
            
            const finalPath = path.join(finalDir, filename);
            await fs.rename(currentTempPath, finalPath); // Movemos el archivo a producción
            console.log(`[👷 OBRERO]: 🚀 Archivo promovido a producción en: src/dynamic_tools/${filename}`);
            
            const resultado = {
                estado: 'EXITO',
                archivo: finalPath,
                mensaje: `Código curado y promovido a '${filename}' tras ${intentoActual} intento(s).`
            };

            if (process.send) {
                process.send(resultado, undefined, undefined, () => {
                    process.disconnect(); process.exit(0);
                });
            } else { process.exit(0); }
            
            return; // Termina la ejecución exitosamente

        } catch (error: any) {
            const tsErrorDetails = error.stdout || error.stderr || error.message;
            console.error(`[👷 OBRERO]: ❌ Fallo en compilación.`);
            
            // 🧹 ESCUDO ANTI-BUCLES: Borramos el archivo malo para que no ensucie el siguiente 'tsc'
            if (currentTempPath) {
                await fs.unlink(currentTempPath).catch(() => {});
            }

            if (intentoActual < maxIntentos) {
                console.log(`[👷 OBRERO]: 🧠 Retroalimentando a la IA con el error para que lo corrija...`);
                // Le inyectamos el error al prompt original
                promptTecnico += `\n\n⚠️ ATENCIÓN: El código que generaste anteriormente falló con este error de TypeScript:\n${tsErrorDetails}\n\nPor favor, analiza el error y devuelve el CÓDIGO CORREGIDO completo.`;
                intentoActual++;
            } else {
                console.log(`[👷 OBRERO]: 💀 Agoté mis ${maxIntentos} intentos. Abortando misión.`);
                if (process.send) {
                    process.send({ estado: 'ERROR', error: tsErrorDetails }, undefined, undefined, () => {
                        process.disconnect(); process.exit(1);
                    });
                } else { process.exit(1); }
                return;
            }
        }
    }
});