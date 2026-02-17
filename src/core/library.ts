// src/core/library.ts
// EL CEREBRO LÓGICO (Solo Funciones)
// v5.0 - Elite Solutions Architect (Generalist Mode)

// 👇 IMPORTANTE: Importamos los datos desde el archivo templates.ts
import { ARCH_LIBRARY } from './templates';

/**
 * 🕵️‍♂️ DETECTOR DE INTENCIÓN (v5.0)
 * Analiza el prompt del usuario y decide qué template usar.
 */
export function detectIntent(prompt: string): string {
    const p = prompt.toLowerCase();
    
    // 1. Gestión y Producto
    if (p.includes("prd") || p.includes("requisitos") || p.includes("user stories") || p.includes("historias de usuario")) return "PRD_MASTER";
    if (p.includes("api") || p.includes("swagger") || p.includes("endpoint") || p.includes("openapi")) return "API_DESIGNER";
    
    // 2. Infraestructura y Docs
    if (p.includes("docker") || p.includes("deploy") || p.includes("ci/cd") || p.includes("pipeline") || p.includes("nube")) return "DEVOPS_PRO";
    if (p.includes("readme") || p.includes("documentación") || p.includes("manual") || p.includes("guía")) return "README_GOD";

    // 3. Investigación y Navegación (Browser Capability)
    if (p.includes("navega") || p.includes("visita") || p.includes("url") || p.includes("lee la web") || p.includes("http")) return "RESEARCHER";

    // 4. Seguridad y Fixes
    if (p.includes("seguridad") || p.includes("vulnerable") || p.includes("owasp")) return "LOGIC";
    if (p.includes("error") || p.includes("bug") || p.includes("fix") || p.includes("repara")) return "FIX";
    
    // 5. Razonamiento Profundo
    if (p.includes("piensa") || p.includes("analiza") || p.includes("razona") || p.includes("investiga")) return "R1_THINK";
    
    // 6. Arquitectura y Datos
    if (p.includes("base de datos") || p.includes("sql") || p.includes("schema") || p.includes("db")) return "DB_ARCHITECT";
    if (p.includes("arquitectura") || p.includes("estructura") || p.includes("blueprint")) return "BLUEPRINT";
    
    // 7. UI/UX
    if (p.includes("diseño") || p.includes("ui") || p.includes("ux") || p.includes("componente")) return "SKETCH_TO_UI";
    if (p.includes("diagrama") || p.includes("flujo")) return "FLOW";

    // Default: Modo Constructor Generalista
    return "DEV"; 
}

/**
 * 🏭 PROCESADOR DE TEMPLATES
 * 1. Inyecta el INPUT del usuario.
 * 2. Resuelve las variables {{VAR}} tomando la primera opción por defecto (Server-Side).
 */
export function applyTemplate(key: string, userInput: string): string {
    let template = ARCH_LIBRARY[key] || ARCH_LIBRARY["DEV"];

    // 1. Inyectar el Input
    template = template.replace("{{INPUT}}", userInput);

    // 2. Procesar Variables {{VAR:Nombre:Opcion1,Opcion2}}
    const varRegex = /{{VAR:[^:]+:([^,}]*)[^}]*}}/g;
    template = template.replace(varRegex, "$1");

    return template;
}

/**
 * 🧠 CONSTRUCTOR DEL CEREBRO (v5.0 - GENERALISTA)
 * Define la personalidad de Arquitecto de Élite sin sesgos de proyecto.
 */
export function buildSystemPrompt(memory: string, context: string, task: string): string {
    return `
    ERES OCTOARCH (v5.0 - Elite Solutions Architect).
    
    [TU PERFIL]:
    Eres un Ingeniero de Software Principal y Arquitecto de Sistemas políglota.
    No estás atado a un solo proyecto. Tu especialidad es analizar problemas complejos,
    diseñar soluciones escalables y escribir código limpio (Clean Code/SOLID) en cualquier lenguaje.
    
    [TU MENTALIDAD]:
    1. AGNOSTICISMO: No asumas que trabajamos en Fintech, Plazofy o InvoDex salvo que el usuario lo mencione explícitamente.
    2. EFICIENCIA: Prefieres soluciones simples y robustas sobre complejidad innecesaria (KISS/YAGNI).
    3. CIENTÍFICO: Si no sabes algo, usas tus herramientas (Browser) para investigarlo antes de responder.

    [TUS HERRAMIENTAS]:
    1. FILESYSTEM: 
       - 'read': IMPRESCINDIBLE leer archivos antes de editarlos para entender el contexto.
       - 'create': Para crear o sobrescribir archivos con código completo.
    
    2. TERMINAL: 
       - 'execute': Comandos seguros (npm, node, git, ls).

    3. BROWSER:
       - 'inspect': Para leer documentación técnica, investigar errores o buscar datos en tiempo real.
    
    [CONTEXTO (MEMORIA DE SESIÓN)]:
    ${memory}

    [ESTADO ACTUAL DEL WORKSPACE]:
    ${context}

    [TAREA A REALIZAR]:
    ${task}

    ---------------------------------------------------
    [PROTOCOLO DE RESPUESTA - STRICT JSON]:
    Para actuar, DEBES responder EXCLUSIVAMENTE con este formato JSON.
    
    {
        "thought": "1. Voy a investigar X en la web. 2. Luego crearé la estructura del proyecto.",
        "operations": [
            { "action": "inspect", "url": "https://docs.tecnologia.com" },
            { "action": "execute", "command": "npm init -y" },
            { "action": "create", "path": "src/main.ts", "content": "..." }
        ]
    }

    [REGLAS]:
    1. Si el modo es 'R1_THINK', ignora el JSON y usa formato <think>...</think>.
    2. Si editas código, devuelve el archivo COMPLETO, no solo diffs.
    3. Asegúrate de que el JSON sea válido (escapa comillas dobles dentro del contenido).
    `;
}