import fs from 'fs';
import path from 'path';

// Colores para la terminal
const COLORS = {
    INFO: '\x1b[36m',  // Cyan
    WARN: '\x1b[33m',  // Amarillo
    ERROR: '\x1b[31m', // Rojo
    RESET: '\x1b[0m'
};

export class Logger {
    private static logDir = path.resolve(process.cwd(), 'logs');

    private static getLogFileName(): string {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        return path.join(this.logDir, `octoarch-${today}.log`);
    }

    private static ensureDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    // 🛡️ NUEVO: Filtro de sanitización global para evitar fuga de credenciales
    private static sanitize(input: string): string {
        if (!input || typeof input !== 'string') return input;
        // Las API Keys de Google Gemini siempre empiezan con "AIza" y tienen 39 caracteres
        return input.replace(/(AIza)[a-zA-Z0-9_-]{35}/g, '$1****REDACTED****');
    }

    private static write(level: 'INFO' | 'WARN' | 'ERROR', message: string, data?: any) {
        this.ensureDir();
        const timestamp = new Date().toISOString().substring(11, 19); // HH:MM:SS
        
        // 🛡️ SANITIZAR TEXTOS ANTES DE IMPRIMIR O GUARDAR
        const safeMessage = this.sanitize(message);
        
        let safeDataConsole = '';
        let safeDataFile = '';

        if (data !== undefined) {
            // Formato bonito para consola (con saltos de línea)
            const rawDataConsole = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
            safeDataConsole = `\n${this.sanitize(rawDataConsole)}`;
            
            // Formato compacto para archivo (una sola línea)
            const rawDataFile = typeof data === 'string' ? data : JSON.stringify(data);
            safeDataFile = ` ${this.sanitize(rawDataFile)}`;
        }

        // 1. Salida Consola (Bonita y Segura)
        const color = COLORS[level];
        console.log(`${color}[${timestamp}] ${level}:${COLORS.RESET} ${safeMessage}${safeDataConsole}`);

        // 2. Salida Archivo (Persistente y Segura)
        const logLine = `[${new Date().toISOString()}] [${level}] ${safeMessage}${safeDataFile}\n`;
        try {
            fs.appendFileSync(this.getLogFileName(), logLine);
        } catch (e) {
            console.error("❌ Fallo crítico escribiendo logs en disco.");
        }
    }

    static info(msg: string, data?: any) { this.write('INFO', msg, data); }
    static warn(msg: string, data?: any) { this.write('WARN', msg, data); }
    static error(msg: string, data?: any) { this.write('ERROR', msg, data); }
}