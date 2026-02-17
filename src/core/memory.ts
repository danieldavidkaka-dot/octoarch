import * as fs from 'fs/promises';
import * as path from 'path';
import { PATHS } from '../config/paths';

export class MemorySystem {
    
    static async initialize() {
        await fs.mkdir(PATHS.MEMORY, { recursive: true });
        const memPath = path.join(PATHS.MEMORY, 'global_context.md');
        
        try { 
            await fs.access(memPath); 
        } catch { 
            const initial = `# MEMORIA DE OCTOARCH (v2.0)
## 👤 PERFIL
- Rol: Arquitecto de Software Senior.
- Estilo: Clean Architecture, TypeScript estricto.

## 🚀 PROYECTOS ACTIVOS
### 1. InvoDex (Facturación AI)
- Stack: AI, Node.js, SAP, Profit Plus.
- Estado: Diseño de arquitectura.

### 2. Plazofy (Fintech)
- Stack: Node.js, TypeScript.
- Objetivo: Backend financiero seguro y frontend super hermosos
`;
            await fs.writeFile(memPath, initial);
        }
    }

    static async recall(): Promise<string> {
        try {
            return await fs.readFile(path.join(PATHS.MEMORY, 'global_context.md'), 'utf8');
        } catch { return ""; }
    }
}