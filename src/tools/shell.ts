import { exec } from 'child_process';
import path from 'path';
import { PATHS } from '../config/paths';
import { Logger } from '../utils/logger';

// 🔒 LA JAULA DE SEGURIDAD (ALLOWLIST STRICTA)
const ALLOWED_COMMANDS = new Set([
    'npm', 'node', 'npx', 
    'ls', 'dir', 'echo', 
    'mkdir', 'cd', 'git', 'tsc', 'type'
]);

export const ShellTool = {
    execute: async (command: string): Promise<string> => {
        const cleanCommand = command.trim();
        // Extraer el programa principal (ej: "npm install" -> "npm")
        const program = cleanCommand.split(' ')[0]; 

        // 1. Validación de Seguridad
        if (!ALLOWED_COMMANDS.has(program)) {
            Logger.warn(`🛡️ Comando bloqueado: ${program}`);
            return `⛔ SEGURIDAD: El comando '${program}' no está permitido. Solo uso interno.`;
        }

        Logger.info(`💻 [SHELL] Ejecutando: "${cleanCommand}"`);

        return new Promise((resolve) => {
            // 2. Configuración de Ejecución con TIMEOUT
            exec(cleanCommand, { 
                cwd: PATHS.WORKSPACE, 
                timeout: 60000, // 60 segundos máximo de ejecución
                maxBuffer: 1024 * 1024 // 1MB de log máximo
            }, (error, stdout, stderr) => {
                
                // Formateo de salida para que la IA lo entienda mejor
                let output = "";
                
                if (stdout) {
                    output += `✅ STDOUT:\n${stdout.trim()}\n`;
                }
                
                if (stderr) {
                    // NPM suele tirar advertencias en stderr, no siempre es error fatal
                    output += `⚠️ STDERR:\n${stderr.trim()}\n`;
                }

                if (error) {
                    if (error.killed) {
                        output += `\n❌ ERROR: El comando excedió el tiempo límite (60s) y fue terminado.`;
                    } else {
                        output += `\n❌ ERROR EXIT CODE: ${error.code || 'Unknown'}`;
                    }
                }

                resolve(output || "✅ (Comando ejecutado sin salida)");
            });
        });
    }
};