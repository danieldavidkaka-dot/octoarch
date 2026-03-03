import { AgentExecutor } from './agent_executor';
import { ShellTool } from '../tools/shell';
import { FileTool } from '../tools/files';

// 🛑 MAGIA DE TESTING: "Apagamos" las herramientas reales. 
// Así evitamos que los tests modifiquen tu computadora de verdad.
jest.mock('../tools/shell');
jest.mock('../tools/files');
jest.mock('../tools/browser');
jest.mock('../tools/gmail');
jest.mock('../tools/skill_loader');

describe('🛡️ Pruebas de Seguridad (RBAC): AgentExecutor', () => {

    beforeEach(() => {
        // Limpiamos los rastros antes de cada test
        jest.clearAllMocks();
        
        // Configuramos los simulacros: Si el escudo los deja pasar, devolverán esto
        (ShellTool.execute as jest.Mock).mockResolvedValue('Simulated Shell Output');
        (FileTool.readFile as jest.Mock).mockResolvedValue('Simulated File Content');
    });

    it('🚨 Debe BLOQUEAR al rol CHAT de usar cualquier herramienta', async () => {
        const result = await AgentExecutor.execute('readFile', { path: 'test.txt' }, 'CHAT');
        
        // Verificamos que el guardia lo detuvo
        expect(result).toContain('[BLOCKED]');
        expect(result).toContain('Modo Seguro (Chat)');
        
        // Verificamos matemáticamente que la herramienta NUNCA fue llamada
        expect(FileTool.readFile).not.toHaveBeenCalled();
    });

    it('🚨 Debe BLOQUEAR al rol CFO de usar comandos de terminal (executeCommand)', async () => {
        // Intentamos un ataque: El CFO quiere ejecutar comandos
        const result = await AgentExecutor.execute('executeCommand', { command: 'rm -rf /' }, 'CFO');
        
        expect(result).toContain('[BLOCKED]');
        expect(result).toContain('no permite modificar el sistema base');
        expect(ShellTool.execute).not.toHaveBeenCalled();
    });

    it('✅ Debe PERMITIR al rol CFO usar herramientas seguras de lectura', async () => {
        // El CFO leyendo un reporte es una operación legítima
        const result = await AgentExecutor.execute('readFile', { path: 'report.txt' }, 'CFO');
        
        expect(result).not.toContain('[BLOCKED]');
        expect(result).toContain('Simulated File Content');
        expect(FileTool.readFile).toHaveBeenCalled(); // Se llamó a la herramienta exitosamente
    });

    it('🔥 Debe PERMITIR al rol DEV usar comandos de terminal', async () => {
        // El desarrollador tiene privilegios de superusuario
        const result = await AgentExecutor.execute('executeCommand', { command: 'npm install' }, 'DEV');
        
        expect(result).not.toContain('[BLOCKED]');
        expect(result).toContain('Simulated Shell Output');
        expect(ShellTool.execute).toHaveBeenCalled();
    });
});