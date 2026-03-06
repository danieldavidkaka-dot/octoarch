import { FileTool } from '../tools/files';
import { ShellTool } from '../tools/shell';
import { BrowserTool } from '../tools/browser';
import { GmailTool } from '../tools/gmail'; 
import { SkillLoader } from '../tools/skill_loader';
import { MemoryWriterTool } from '../tools/memory_writer'; // 🧠 NUEVO: Importación del Motor de Auto-Aprendizaje
import { Logger } from '../utils/logger';
import { ForgeTool } from '../tools/forge_tool'; // 🔨 NUEVO: El puente al Obrero

export class AgentExecutor {
    static async execute(opName: string, args: any, activeRole: string): Promise<string> {
        let isAllowed = true;
        let denyReason = "";
        const role = activeRole.toUpperCase();

        if (role === 'CHAT') {
            // 🛡️ Agregamos 'write_skill' y 'forge_new_tool' a la lista de bloqueos del CHAT
            if (['executeCommand', 'createFile', 'readFile', 'inspectWeb', 'checkGmail', 'loadSkill', 'write_skill', 'forge_new_tool'].includes(opName)) {
                isAllowed = false;
                denyReason = "Modo Seguro (Chat) no permite herramientas.";
            }
        } 
        else if (['CFO', 'CMO', 'RESEARCH', 'INVODEX'].includes(role) && ['executeCommand', 'createFile', 'write_skill', 'forge_new_tool'].includes(opName)) {
            // 🛡️ Bloqueamos 'write_skill' y 'forge_new_tool' para roles que no deben modificar el sistema
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
            if (opName === 'loadSkill') {
                Logger.info(`🎮 Cargando Skill: ${args.skillName}`);
                return await SkillLoader.load(args.skillName);
            }
            
            // 🧠 NUEVA CONEXIÓN: Auto-Aprendizaje
            if (opName === 'write_skill') {
                Logger.info(`💾 Escribiendo nueva Skill en memoria permanente: ${args.filename}`);
                const result = await MemoryWriterTool.execute(args);
                return `\n--- RESULTADO DE MEMORY WRITER ---\n${result}\n`;
            }

            // 🔨 NUEVO: El Puente al Obrero (Sistema Swarm)
            if (opName === 'forge_new_tool') {
                Logger.info(`🤖 Ejecutando orden de auto-programación al Sistema Swarm`);
                const result = await ForgeTool.execute(args);
                return `\n--- RESULTADO DE LA FORJA (SISTEMA SWARM) ---\n${result}\n`;
            }
            
            return `❌ Herramienta desconocida: ${opName}`;
        } catch (error: any) {
            return `❌ [ERROR EJECUCIÓN en ${opName}]: ${error.message}`;
        }
    }
}