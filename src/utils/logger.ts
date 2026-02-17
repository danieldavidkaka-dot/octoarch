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

    private static write(level: 'INFO' | 'WARN' | 'ERROR', message: string, data?: any) {
        this.ensureDir();
        const timestamp = new Date().toISOString().substring(11, 19); // HH:MM:SS
        
        // 1. Salida Consola (Bonita)
        const color = COLORS[level];
        const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
        console.log(`${color}[${timestamp}] ${level}:${COLORS.RESET} ${message}${dataStr}`);

        // 2. Salida Archivo (Persistente)
        const logLine = `[${new Date().toISOString()}] [${level}] ${message} ${data ? JSON.stringify(data) : ''}\n`;
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