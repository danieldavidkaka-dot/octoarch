import fs from 'fs/promises';
import path from 'path';
import { PATHS } from '../config/paths';
import { Logger } from './logger';

interface CacheEntry<T> {
    data: T;
    expiry: number;
}

export class CacheSystem {
    private static readonly CACHE_DIR = path.join(PATHS.WORKSPACE, '.cache');
    private static readonly DEFAULT_TTL = 1000 * 60 * 60 * 24; // 24 Horas por defecto

    // Inicializa la carpeta oculta de cache
    static async init() {
        try {
            await fs.mkdir(this.CACHE_DIR, { recursive: true });
        } catch {}
    }

    private static getFilePath(key: string): string {
        // Sanitizar key para que sea un nombre de archivo válido
        const safeKey = key.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
        return path.join(this.CACHE_DIR, `${safeKey}.json`);
    }

    static async set(key: string, data: any, ttlMs: number = this.DEFAULT_TTL) {
        const entry: CacheEntry<any> = {
            data,
            expiry: Date.now() + ttlMs
        };
        
        try {
            await this.init();
            const filepath = this.getFilePath(key);
            
            // 🛡️ REFACTOR (Cortafuegos de Concurrencia): Escritura Atómica
            // 1. Creamos un nombre de archivo temporal único
            const tempFilepath = `${filepath}.${Date.now()}_${Math.random().toString(36).substring(2, 8)}.tmp`;
            
            // 2. Escribimos los datos en el archivo temporal de forma segura
            await fs.writeFile(tempFilepath, JSON.stringify(entry), 'utf8');
            
            // 3. Renombramos el archivo de golpe. A nivel de SO esto es una operación atómica,
            // garantizando que nunca se corromperá el archivo final si hay colisiones.
            await fs.rename(tempFilepath, filepath);
            
        } catch (error) {
            Logger.warn('⚠️ No se pudo guardar en caché:', error);
        }
    }

    static async get<T>(key: string): Promise<T | null> {
        try {
            const filepath = this.getFilePath(key);
            const raw = await fs.readFile(filepath, 'utf8');
            const entry: CacheEntry<T> = JSON.parse(raw);

            if (Date.now() > entry.expiry) {
                // Expiró, lo borramos
                await fs.unlink(filepath).catch(() => {});
                return null;
            }

            return entry.data;
        } catch {
            return null; // No existe o error de lectura
        }
    }

    static async clear() {
        try {
            const files = await fs.readdir(this.CACHE_DIR);
            for (const file of files) {
                await fs.unlink(path.join(this.CACHE_DIR, file));
            }
            Logger.info('🧹 Caché purgado correctamente.');
        } catch {}
    }
}