import { CoderLLM } from './coder_llm';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { env } from '../config/env'; // 💉 Importamos el maletín de llaves

const execAsync = util.promisify(exec);
const cerebro = new CoderLLM();

process.on('message', async (mensaje: any) => {
    console.log(`[👷 OBRERO]: He despertado. Orden recibida: "${mensaje.tarea}"`);

    const maxIntentos = 3;
    let intentoActual = 1;
    
    // 🧠 INYECCIÓN DE LLAVES
    const llavesDisponibles = JSON.stringify(env.WORKER_SECRETS, null, 2);

    let promptTecnico = `Escribe un módulo en TypeScript que cumpla esta orden: ${mensaje.tarea}.
    REGLA VITAL 1: Usa 'fetch' nativo de Node.js. NUNCA uses la librería 'request' ni 'axios'.
    REGLA VITAL 2: El código DEBE exportar un objeto constante llamado 'tool' que cumpla con la interfaz de herramientas de Gemini.
    REGLA VITAL 3: Si necesitas usar contraseñas o API Keys para conectarte a servicios externos, DEBES importar y usar el objeto 'env.WORKER_SECRETS'.
    
    AQUÍ TIENES LAS LLAVES DISPONIBLES EN EL SISTEMA ACTUALMENTE:
    ${llavesDisponibles}
    (NOTA: Usa solo las llaves que tengan un valor asignado. Usa env.WORKER_SECRETS.NOMBRE_DE_LA_LLAVE en tu código).
    
    USA EXACTAMENTE ESTA PLANTILLA COMO BASE:
    
    import { SchemaType } from '@google/generative-ai';
    import { env } from '../config/env'; // <-- IMPORTANTE: Importa siempre env

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
            // Ejemplo: const miLlave = env.WORKER_SECRETS.OPENWEATHER_API_KEY;
            return "resultado";
        }
    };
    `;

    // 🛡️ CAMBIO ESTRATÉGICO: Sala temporal a la misma altura que Producción
    const tempDir = path.join(process.cwd(), 'src', 'temp_tools'); // Taller de pruebas seguro
    const finalDir = path.join(process.cwd(), 'src', 'dynamic_tools'); // Producción (Vigilada por Hot-Swap)

    // Aseguramos que ambas carpetas existan
    await fs.mkdir(tempDir, { recursive: true });
    await fs.mkdir(finalDir, { recursive: true });

    let currentTempPath = "";

    while (intentoActual <= maxIntentos) {
        console.log(`\n[👷 OBRERO]: 🔄 Iniciando forja (Intento ${intentoActual}/${maxIntentos})...`);
        
        try {
            // 1. FORJAR
            const { filename, code } = await cerebro.generateCode(promptTecnico);
            
            // Guardamos en la sala temporal aislada
            currentTempPath = path.join(tempDir, filename);

            const codigoLimpio = code.replace("```typescript", "").replace("```ts", "").replaceAll("```", "").trim();
            await fs.writeFile(currentTempPath, codigoLimpio, 'utf-8');
            console.log(`[👷 OBRERO]: Archivo guardado en taller temporal como '${filename}'. Ejecutando Linter...`);

            // 2. TESTEAR (Si la ruta ../config/env está mal, fallará aquí de forma segura)
            await execAsync(`npx tsc --project tsconfig.json --noEmit`);
            
            // 3. ASCENSO DEL CÓDIGO (Producción)
            console.log(`[👷 OBRERO]: ✅ ¡Sintaxis perfecta! Compilación superada.`);
            
            const finalPath = path.join(finalDir, filename);
            await fs.rename(currentTempPath, finalPath); // Lo movemos a producción solo cuando es seguro
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
            
            return; 

        } catch (error: any) {
            const tsErrorDetails = error.stdout || error.stderr || error.message;
            console.error(`[👷 OBRERO]: ❌ Fallo en compilación.`);
            
            // 🧹 Borramos el archivo malo del taller temporal
            if (currentTempPath) {
                await fs.unlink(currentTempPath).catch(() => {});
            }

            if (intentoActual < maxIntentos) {
                console.log(`[👷 OBRERO]: 🧠 Retroalimentando a la IA con el error para que lo corrija...`);
                promptTecnico += `\n\n⚠️ ATENCIÓN: El código falló con este error de TypeScript:\n${tsErrorDetails}\n\nPor favor, devuelve el CÓDIGO CORREGIDO completo.`;
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