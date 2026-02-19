import puppeteer, { type ConsoleMessage, type HTTPResponse } from 'puppeteer';
import { Logger } from '../utils/logger';

export class BrowserTool {
    static async inspect(url: string): Promise<string> {
        Logger.info(`🌎 Navegando a: ${url}`);
        
        try {
            // Lanzamos un navegador oculto optimizado
            const browser = await puppeteer.launch({ 
                headless: true, 
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage', 
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu'
                ] 
            });
            
            const page = await browser.newPage();
            
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
            
            await browser.close();

            const report = [
                `--- REPORTE DE INSPECCIÓN (${url}) ---`,
                // Limitamos los logs de consola para no contaminar la memoria de la IA
                consoleLogs.length > 0 ? `🔥 LOGS DE RED:\n${consoleLogs.join('\n').substring(0, 500)}` : "✅ Consola limpia.",
                // 🧠 MEMORIA AMPLIADA: Le damos hasta 8000 caracteres para leer noticias reales
                `📄 CONTENIDO VISIBLE:\n${bodyHTML.substring(0, 8000)}... (truncado por memoria)`
            ].join('\n\n');

            return report;

        } catch (error: any) {
            return `❌ Error navegando: ${error.message}`;
        }
    }
}