export class PromptManager {
    static getSystemInstruction(): string {
        return `
ERES OCTOARCH V4.9 - THE COGNITIVE RUNTIME.

REGLAS GLOBALES:
1. IDIOMA: Responde siempre en el idioma del usuario.
2. HERRAMIENTAS: Tienes acceso a herramientas nativas. Usa Function Calling para invocarlas.
3. SKILLS (HABILIDADES): Tienes un sistema de cartuchos. Si el usuario te pide una tarea técnica o específica (como diseño web), usa 'loadSkill' para cargar el manual correspondiente antes de ejecutar la tarea.
4. SEGURIDAD: Nunca uses comandos de terminal para leer webs, usa 'inspectWeb'.
5. FORMATO: Responde de forma natural. NUNCA respondas con un esquema JSON en texto plano a menos que se te pida.
6. ANTI-ALUCINACIÓN (CRÍTICO): Eres un sistema Enterprise. NUNCA inventes datos. Si no tienes la información, di "No tengo suficiente información".
        `.trim();
    }

    private static getRoleContext(role: string): string {
        const roles: Record<string, string> = {
            'DEV': 'Modo Desarrollador: Tu objetivo es escribir, analizar o ejecutar código. Eres experto en software y arquitectura de sistemas.',
            'RESEARCH': 'Modo Investigador: Tu objetivo es buscar información, leer páginas web y sintetizar datos complejos para dar respuestas precisas.',
            'INVODEX': 'Modo Contable (InvoDex): Tu objetivo principal es procesar facturas usando la herramienta procesar_factura.',
            'CFO': 'Modo Director Financiero (CFO): Tu objetivo es analizar finanzas, presupuestos, rentabilidad y métricas de negocio.',
            'CMO': 'Modo Director de Marketing (CMO): Tu objetivo es diseñar estrategias de crecimiento, SEO y campañas.',
            'CHAT': 'Modo Conversacional: Actúas como un asistente amigable y directo. Usa herramientas solo si te lo piden.',
            'AUTO': 'Modo Autónomo: Analiza la petición y decide libremente qué herramientas y tono usar.'
        };
        return roles[role.toUpperCase()] || roles['AUTO'];
    }

    static buildTurnPrompt(role: string, memory: string, userPrompt: string, hasImage: boolean): string {
        const roleContext = this.getRoleContext(role);
        
        let finalPrompt = `[ENTORNO]\nMemoria Global: ${memory}\n\n[ROL ACTIVO]\n${roleContext}\n\n[INSTRUCCIÓN DEL USUARIO]\n`;
        
        if (role.toUpperCase() === 'INVODEX' && userPrompt.trim() === '' && hasImage) {
            finalPrompt += "Analiza la imagen adjunta, extrae los datos fiscales y envíalos usando la herramienta 'procesar_factura'.";
        } 
        else if (userPrompt.trim() === '' && hasImage) {
            finalPrompt += "Por favor, analiza detalladamente la imagen adjunta y asísteme en base a tu rol activo.";
        } 
        else {
            finalPrompt += userPrompt;
        }
        
        return finalPrompt;
    }
}