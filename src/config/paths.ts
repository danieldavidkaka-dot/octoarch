import * as path from 'path';

const ROOT_DIR = process.cwd();

export const PATHS = {
    ROOT: ROOT_DIR,
    // 🔒 WORKSPACE: La "caja de arena" segura
    WORKSPACE: path.join(ROOT_DIR, 'workspace'),
    // 🧠 MEMORIA: Donde se guarda el Markdown
    MEMORY: path.join(ROOT_DIR, 'memory'),
};