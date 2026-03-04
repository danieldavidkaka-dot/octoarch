import fs from 'fs';
import path from 'path';
import { WebSocket } from 'ws'; // 🌐 Importamos WebSocket

const COLORS = {
    INFO: '\x1b[36m',  // Cyan
    WARN: '\x1b[33m',  // Amarillo
    ERROR: '\x1b[31m', // Rojo
    RESET: '\x1b[0m'
};

export class Logger {
    private static logDir = path.resolve(process.cwd(), 'logs');
    // 🌐 NUEVO: Aquí guardaremos las pantallas web que estén viendo en vivo
    private static wsClients: Set<WebSocket> = new Set();

    private static getLogFileName(): string {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        return path.join(this.logDir, `octoarch-${today}.log`);
    }

    private static ensureDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    private static sanitize(input: string): string {
        if (!input || typeof input !== 'string') return input;
        return input.replace(/(AIza)[a-zA-Z0-9_-]{35}/g, '$1****REDACTED****');
    }

    // 🌐 NUEVO: Método para conectar la web al Logger
    public static addClient(ws: WebSocket) {
        this.wsClients.add(ws);
        ws.on('close', () => this.wsClients.delete(ws));
    }

    private static write(level: 'INFO' | 'WARN' | 'ERROR', message: string, data?: any) {
        this.ensureDir();
        const timestamp = new Date().toISOString().substring(11, 19);
        const safeMessage = this.sanitize(message);
        
        let safeDataConsole = '';
        let safeDataFile = '';

        if (data !== undefined) {
            const rawDataConsole = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
            safeDataConsole = `\n${this.sanitize(rawDataConsole)}`;
            const rawDataFile = typeof data === 'string' ? data : JSON.stringify(data);
            safeDataFile = ` ${this.sanitize(rawDataFile)}`;
        }

        // 1. Salida Consola
        const color = COLORS[level];
        console.log(`${color}[${timestamp}] ${level}:${COLORS.RESET} ${safeMessage}${safeDataConsole}`);

        // 2. Salida Archivo
        const logLine = `[${new Date().toISOString()}] [${level}] ${safeMessage}${safeDataFile}\n`;
        try { fs.appendFileSync(this.getLogFileName(), logLine); } catch (e) {}

        // 🌐 3. Salida WEB (WebSockets)
        const webLog = {
            time: timestamp,
            level: level,
            message: safeMessage,
            data: data !== undefined ? safeDataConsole : ''
        };
        const wsMessage = JSON.stringify(webLog);
        
        // Enviamos el log a todos los navegadores conectados
        this.wsClients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(wsMessage);
            }
        });
    }

    static info(msg: string, data?: any) { this.write('INFO', msg, data); }
    static warn(msg: string, data?: any) { this.write('WARN', msg, data); }
    static error(msg: string, data?: any) { this.write('ERROR', msg, data); }
}