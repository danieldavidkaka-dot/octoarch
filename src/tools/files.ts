import * as fs from 'fs/promises';
import * as path from 'path';
import { PATHS } from '../config/paths'; // Asegúrate de que paths.ts esté en src/config/
import { Logger } from '../utils/logger';

export class FileTool {
    private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // Límite 5MB
    private static readonly DENIED_PATTERNS = [
        'node_modules', '.git', '.env', '.DS_Store', 
        'package-lock.json', 'yarn.lock', 'dist', 'build'
    ];

    static async initWorkspace() {
        await fs.mkdir(PATHS.WORKSPACE, { recursive: true });
        await fs.mkdir(PATHS.MEMORY, { recursive: true });
        await fs.mkdir(path.join(PATHS.WORKSPACE, 'temp'), { recursive: true });
    }

    // 🛡️ Validador de Seguridad (Parcheado para Windows Path Traversal y Falsos Positivos)
    private static validatePath(requestedPath: string): string {
        const workspacePath = path.resolve(PATHS.WORKSPACE);
        const fullPath = path.resolve(workspacePath, requestedPath);
        
        // Anti-Path Traversal: Normalizar ambas rutas para comparación segura
        const normalizedWorkspace = path.normalize(workspacePath).toLowerCase();
        const normalizedFull = path.normalize(fullPath).toLowerCase();

        // Verificación matemática: la ruta final DEBE empezar EXACTAMENTE con el workspace
        if (!normalizedFull.startsWith(normalizedWorkspace + path.sep) &&
            normalizedFull !== normalizedWorkspace) {
            throw new Error(`🚫 SEGURIDAD CRÍTICA: Intento de escape del workspace bloqueado: ${requestedPath}`);
        }

        // 🛠️ FIX: Búsqueda exacta de segmentos para evitar que 'dist' bloquee 'distance.txt'
        const pathSegments = fullPath.split(path.sep);
        const fileName = path.basename(fullPath);

        for (const pattern of this.DENIED_PATTERNS) {
            // Si el patrón es un directorio exacto en la ruta, o si el archivo coincide exactamente
            if (pathSegments.includes(pattern) || fileName === pattern || (pattern.startsWith('.') && fileName.startsWith(pattern))) {
                throw new Error(`🚫 SEGURIDAD: Acceso denegado a patrón restringido: ${pattern}`);
            }
        }

        return fullPath;
    }

    static async writeFile(filePath: string, content: string): Promise<string> {
        try {
            const safePath = this.validatePath(filePath);
            
            await fs.mkdir(path.dirname(safePath), { recursive: true });
            
            try {
                await fs.copyFile(safePath, `${safePath}.bak`);
            } catch {} 

            await fs.writeFile(safePath, content, 'utf8');
            Logger.info(`📝 Archivo escrito de forma segura: ${filePath}`);
            return `✅ Archivo creado/actualizado: ${filePath}`;
        } catch (error: any) {
            Logger.error(`❌ Error escribiendo archivo ${filePath}`, error);
            return `❌ Error FileTool: ${error.message}`;
        }
    }

    static async readFile(filePath: string): Promise<string> {
        try {
            const safePath = this.validatePath(filePath);
            
            const stats = await fs.stat(safePath);
            if (stats.size > this.MAX_FILE_SIZE) {
                return `⚠️ El archivo es demasiado grande (${(stats.size/1024/1024).toFixed(2)}MB). Límite: 5MB.`;
            }

            const content = await fs.readFile(safePath, 'utf8');
            return content;
        } catch (error: any) {
            return `❌ No se pudo leer el archivo: ${error.message}`;
        }
    }

    static async listFiles(dirPath: string = './'): Promise<string> {
        try {
            const safePath = this.validatePath(dirPath);
            const entries = await fs.readdir(safePath, { withFileTypes: true });

            const cleanList = entries
                .filter(e => {
                    // 🛠️ FIX: Evitar que carpetas/archivos válidos se oculten por falsos positivos
                    return !this.DENIED_PATTERNS.some(pattern => 
                        e.name === pattern || (pattern.startsWith('.') && e.name.startsWith(pattern))
                    );
                })
                .map(e => {
                    const type = e.isDirectory() ? 'DIR ' : 'FILE';
                    return `[${type}] ${e.name}`;
                });

            if (cleanList.length === 0) return "(Carpeta vacía)";
            
            if (cleanList.length > 50) {
                return cleanList.slice(0, 50).join('\n') + `\n... (+${cleanList.length - 50} ocultos)`;
            }

            return cleanList.join('\n');
        } catch (error: any) {
            return `❌ Error listando archivos: ${error.message}`;
        }
    }
}