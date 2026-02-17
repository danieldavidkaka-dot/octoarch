import puppeteer, { type ConsoleMessage, type HTTPResponse } from 'puppeteer';
import { Logger } from '../utils/logger';

export class BrowserTool {
    static async inspect(url: string): Promise<string> {
        Logger.info(`🌎 Navegando a: ${url}`);
        
        try {
            // Lanzamos un navegador oculto (Headless)
            const browser = await puppeteer.launch({ 
                headless: true, // "new" ya no se usa, true es lo correcto
                args: ['--no-sandbox'] 
            });
            
            const page = await browser.newPage();
            const consoleLogs: string[] = [];

            // 👂 ESCUCHAMOS A LA CONSOLA
            page.on('console', (msg: ConsoleMessage) => {
                const type = msg.type();
                // <--- CORRECCIÓN: Usamos 'warning' (palabra completa) para calmar a TypeScript
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

            // Navegar y esperar (Timeout de 10s para no colgarse)
            await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 });
            
            // Extraer HTML
            const bodyHTML = await page.evaluate(() => document.body.innerText);
            
            await browser.close();

            const report = [
                `--- REPORTE DE INSPECCIÓN (${url}) ---`,
                consoleLogs.length > 0 ? `🔥 ERRORES ENCONTRADOS:\n${consoleLogs.join('\n')}` : "✅ Consola limpia.",
                `📄 CONTENIDO VISIBLE:\n${bodyHTML.substring(0, 500)}... (truncado)`
            ].join('\n\n');

            return report;

        } catch (error: any) {
            return `❌ Error navegando: ${error.message}`;
        }
    }
}