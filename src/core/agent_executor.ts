import { FileTool } from '../tools/files';
import { ShellTool } from '../tools/shell';
import { BrowserTool } from '../tools/browser';
import { GmailTool } from '../tools/gmail'; 
import { SkillLoader } from '../tools/skill_loader'; // 🧠 NUEVO: Importación del Loader
import { Logger } from '../utils/logger';

export class AgentExecutor {
    static async execute(opName: string, args: any, activeRole: string): Promise<string> {
        let isAllowed = true;
        let denyReason = "";
        const role = activeRole.toUpperCase();

        if (role === 'CHAT') {
            if (['executeCommand', 'createFile', 'readFile', 'inspectWeb', 'checkGmail', 'loadSkill'].includes(opName)) {
                isAllowed = false;
                denyReason = "Modo Seguro (Chat) no permite herramientas.";
            }
        } 
        else if (['CFO', 'CMO', 'RESEARCH', 'INVODEX'].includes(role) && ['executeCommand', 'createFile'].includes(opName)) {
            isAllowed = false;
            denyReason = `El rol ${role} es de procesamiento/lectura, no permite modificar el sistema base.`;
        }

        if (!isAllowed) {
            Logger.warn(`🛡️ BLOCKED: ${opName} en modo ${role}`);
            return `❌ [BLOCKED]: Operación '${opName}' denegada (${denyReason}).`;
        }

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
                const report = await BrowserTool.inspect(args.url);
                return `\n--- RESULTADO DE NAVEGADOR (${args.url}) ---\n${report}\n`;
            }
            if (opName === 'checkGmail') {
                Logger.info(`🕵️‍♀️ Ejecutando herramienta de Gmail para el rol: ${role}`);
                const report = await GmailTool.fetchUnreadInvoices();
                return `\n--- RESULTADO DE GMAIL ---\n${report}\n`;
            }
            // 🧠 NUEVA CONEXIÓN: Ejecución de Skills
            if (opName === 'loadSkill') {
                Logger.info(`🎮 Cargando Skill: ${args.skillName}`);
                return await SkillLoader.load(args.skillName);
            }
            
            return `❌ Herramienta desconocida: ${opName}`;
        } catch (error: any) {
            return `❌ [ERROR EJECUCIÓN en ${opName}]: ${error.message}`;
        }
    }
}