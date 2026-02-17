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

    // Inicializa carpetas vitales
    static async initWorkspace() {
        await fs.mkdir(PATHS.WORKSPACE, { recursive: true });
        await fs.mkdir(PATHS.MEMORY, { recursive: true });
        await fs.mkdir(path.join(PATHS.WORKSPACE, 'temp'), { recursive: true });
    }

    // Validador de Seguridad (The Firewall)
    private static validatePath(requestedPath: string): string {
        // 1. Resolver ruta absoluta
        const fullPath = path.resolve(PATHS.WORKSPACE, requestedPath);
        
        // 2. Anti-Path Traversal (evitar ../../../)
        if (!fullPath.startsWith(path.resolve(PATHS.WORKSPACE))) {
            throw new Error(`🚫 SEGURIDAD: Intento de escape del workspace: ${requestedPath}`);
        }

        // 3. Bloqueo de archivos sensibles/basura
        for (const pattern of this.DENIED_PATTERNS) {
            if (fullPath.includes(pattern)) {
                throw new Error(`🚫 SEGURIDAD: Acceso denegado a patrón restringido: ${pattern}`);
            }
        }

        return fullPath;
    }

    static async writeFile(filePath: string, content: string): Promise<string> {
        try {
            const safePath = this.validatePath(filePath);
            
            // Crear directorios si no existen
            await fs.mkdir(path.dirname(safePath), { recursive: true });
            
            // Backup automático simple (sobrescribe el anterior)
            try {
                await fs.copyFile(safePath, `${safePath}.bak`);
            } catch {} // Ignorar si no existe

            await fs.writeFile(safePath, content, 'utf8');
            Logger.info(`📝 Archivo escrito: ${filePath}`);
            return `✅ Archivo creado/actualizado: ${filePath}`;
        } catch (error: any) {
            Logger.error(`❌ Error escribiendo archivo ${filePath}`, error);
            return `❌ Error FileTool: ${error.message}`;
        }
    }

    static async readFile(filePath: string): Promise<string> {
        try {
            const safePath = this.validatePath(filePath);
            
            // Chequeo de tamaño antes de leer
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

            // Filtrado inteligente
            const cleanList = entries
                .filter(e => !this.DENIED_PATTERNS.some(p => e.name.includes(p)))
                .map(e => {
                    const type = e.isDirectory() ? 'DIR ' : 'FILE';
                    return `[${type}] ${e.name}`;
                });

            if (cleanList.length === 0) return "(Carpeta vacía)";
            
            // Paginación forzada para no saturar contexto
            if (cleanList.length > 50) {
                return cleanList.slice(0, 50).join('\n') + `\n... (+${cleanList.length - 50} ocultos)`;
            }

            return cleanList.join('\n');
        } catch (error: any) {
            return `❌ Error listando archivos: ${error.message}`;
        }
    }
}