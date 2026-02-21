import { FileTool } from '../tools/files';
import { ShellTool } from '../tools/shell';
import { Logger } from '../utils/logger';

export class AgentExecutor {
    static async execute(opName: string, args: any, activeRole: string): Promise<string> {
        let isAllowed = true;
        let denyReason = "";

        // 🛡️ Validación Estricta de RBAC
        if (activeRole === 'CHAT') {
            if (['executeCommand', 'createFile', 'readFile', 'inspectWeb'].includes(opName)) {
                isAllowed = false;
                denyReason = "Modo Seguro (Chat) no permite herramientas.";
            }
        } 
        else if ((activeRole === 'CFO_ADVISOR' || activeRole === 'RESEARCHER') && ['executeCommand', 'createFile'].includes(opName)) {
            isAllowed = false;
            denyReason = "Rol Read-Only no permite modificar el sistema.";
        }

        if (!isAllowed) {
            Logger.warn(`🛡️ BLOCKED: ${opName} en modo ${activeRole}`);
            return `❌ [BLOCKED]: Operación '${opName}' denegada (${denyReason}).`;
        }

        // ⚙️ Ejecución Directa
        try {
            if (opName === 'readFile') {
                const content = await FileTool.readFile(args.path);
                return `\n--- RESULTADO DE LEER ${args.path} ---\n${content.substring(0, 5000)}\n`;
            }
            if (opName === 'createFile') {
                const res = await FileTool.writeFile(args.path, args.content);
                return `\n--- RESULTADO DE CREAR ARCHIVO ---\n${res}\n`;
            }
            if (opName === 'executeCommand') {
                const output = await ShellTool.execute(args.command);
                return `\n--- RESULTADO DE TERMINAL (${args.command}) ---\n${output.substring(0, 3000)}\n`;
            }
            if (opName === 'inspectWeb') {
                const { BrowserTool } = require('../tools/browser');
                const report = await BrowserTool.inspect(args.url);
                return `\n--- RESULTADO DE NAVEGADOR (${args.url}) ---\n${report}\n`;
            }
            
            return `❌ Herramienta desconocida: ${opName}`;
        } catch (error: any) {
            return `❌ [ERROR EJECUCIÓN en ${opName}]: ${error.message}`;
        }
    }
}