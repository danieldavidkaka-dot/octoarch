import puppeteer, { Browser, type ConsoleMessage, type HTTPResponse } from 'puppeteer';
import { Logger } from '../utils/logger';

export class BrowserTool {
    // 🏆 SINGLETON: La instancia maestra del navegador
    private static browserInstance: Browser | null = null;
    
    // 🛡️ GESTIÓN DE MEMORIA: Temporizador para cerrar el navegador si no se usa
    private static idleTimeout: NodeJS.Timeout | null = null;
    private static readonly IDLE_TIME_MS = 5 * 60 * 1000; // 5 minutos de inactividad

    // Método para obtener o encender el navegador maestro
    private static async getBrowser(): Promise<Browser> {
        if (!this.browserInstance) {
            Logger.info('🌐 Iniciando Browser Pool (Puppeteer Maestro en segundo plano)...');
            this.browserInstance = await puppeteer.launch({ 
                headless: true, 
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage', 
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu'
                ] 
            });
        }
        
        // 🛡️ Cada vez que pedimos el navegador, cancelamos el apagado automático
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
            this.idleTimeout = null;
        }
        
        return this.browserInstance;
    }

    // 🛡️ Método para programar el apagado tras inactividad
    private static scheduleIdleShutdown() {
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
        }
        
        this.idleTimeout = setTimeout(async () => {
            if (this.browserInstance) {
                Logger.info('💤 Inactividad web detectada (5 min). Apagando Puppeteer para liberar RAM...');
                try {
                    await this.browserInstance.close();
                } catch (e) {
                    Logger.error('❌ Error al cerrar Puppeteer:', e);
                } finally {
                    this.browserInstance = null;
                    this.idleTimeout = null;
                }
            }
        }, this.IDLE_TIME_MS);
    }

    static async inspect(url: string): Promise<string> {
        Logger.info(`🌎 Navegando a: ${url}`);
        let page;
        
        try {
            // Usamos la instancia global compartida
            const browser = await this.getBrowser();
            
            // Solo abrimos una pestaña nueva (súper rápido)
            page = await browser.newPage();
            
            // 🕵️ EVASIÓN: Disfrazamos a Puppeteer como un navegador real para pasar bloqueos Anti-Bot
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            
            const consoleLogs: string[] = [];

            // 👂 ESCUCHAMOS A LA CONSOLA
            page.on('console', (msg: ConsoleMessage) => {
                const type = msg.type();
                if (type === 'error' || type === 'warning') {
                    consoleLogs.push(`[${type.toUpperCase()}] ${msg.text()}`);
                }
            });

            // Capturamos errores de red
            page.on('response', (response: HTTPResponse) => {
                if (!response.ok()) {
                    consoleLogs.push(`[NETWORK ERROR] ${response.status()} en ${response.url()}`);
                }
            });

            // 🚀 CORRECCIÓN DE RENDIMIENTO: 
            // - 'domcontentloaded': Obtiene el texto y no espera a los anuncios.
            // - timeout 45000: Le da tiempo suficiente para pasar validaciones Cloudflare.
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
            
            // Extraer texto limpio (inner Text es más eficiente que HTML)
            const bodyHTML = await page.evaluate(() => document.body.innerText);
            
            // ❌ IMPORTANTE: Cerramos solo la pestaña, NO el navegador
            await page.close();

            const report = [
                `--- REPORTE DE INSPECCIÓN (${url}) ---`,
                // Limitamos los logs de consola para no contaminar la memoria de la IA
                consoleLogs.length > 0 ? `🔥 LOGS DE RED:\n${consoleLogs.join('\n').substring(0, 500)}` : "✅ Consola limpia.",
                // 🧠 MEMORIA AMPLIADA: Le damos hasta 8000 caracteres para leer noticias reales
                `📄 CONTENIDO VISIBLE:\n${bodyHTML.substring(0, 8000)}... (truncado por memoria)`
            ].join('\n\n');

            // 🛡️ Al terminar la tarea, activamos la cuenta regresiva de apagado
            this.scheduleIdleShutdown();

            return report;

        } catch (error: any) {
            // Si algo falla, intentamos cerrar la pestaña huérfana para no tener fugas de RAM
            if (page) await page.close().catch(() => {});
            
            // 🛡️ Incluso si falla, activamos la cuenta regresiva
            this.scheduleIdleShutdown();
            
            return `❌ Error navegando: ${error.message}`;
        }
    }
}