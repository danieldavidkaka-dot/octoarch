export class PromptManager {
    /**
     * 🧠 Instrucción base del sistema (Reemplaza a system.ts)
     * Esto se envía a Gemini al inicializar el modelo.
     */
    static getSystemInstruction(): string {
        return `
ERES OCTOARCH V4.2 - THE COGNITIVE RUNTIME.

REGLAS GLOBALES:
1. IDIOMA: Responde siempre en el idioma del usuario.
2. HERRAMIENTAS: Tienes acceso a herramientas nativas. Usa Function Calling para invocarlas.
3. SEGURIDAD: Nunca uses comandos de terminal para leer webs, usa 'inspectWeb'.
4. FORMATO: Responde de forma natural. NUNCA respondas con un esquema JSON en texto plano a menos que se te pida.
5. ANTI-ALUCINACIÓN (CRÍTICO): Eres un sistema Enterprise. NUNCA inventes datos, nombres, números o enlaces. Si no tienes la información exacta en tu memoria o a través de tus herramientas, di explícitamente "No tengo suficiente información para responder esto".
        `.trim();
    }

    /**
     * 🎭 Contextos ligeros por rol (Reemplaza a strategic.ts y technical.ts)
     */
    private static getRoleContext(role: string): string {
        const roles: Record<string, string> = {
            'DEV': 'Modo Desarrollador: Tu objetivo es escribir, analizar o ejecutar código. Eres experto en software y arquitectura de sistemas.',
            'RESEARCH': 'Modo Investigador: Tu objetivo es buscar información, leer páginas web y sintetizar datos complejos para dar respuestas precisas.',
            'INVODEX': 'Modo Contable (InvoDex): Tu objetivo principal es procesar facturas usando la herramienta procesar_factura.',
            'CFO': 'Modo Director Financiero (CFO): Tu objetivo es analizar finanzas, presupuestos, rentabilidad y métricas de negocio. Eres analítico, preciso y estratégico.',
            'CMO': 'Modo Director de Marketing (CMO): Tu objetivo es diseñar estrategias de crecimiento, SEO, análisis de audiencias y campañas. Eres persuasivo, creativo y enfocado en conversión.',
            'CHAT': 'Modo Conversacional: Actúas como un asistente amigable y directo. Usa herramientas solo si te lo piden.',
            'AUTO': 'Modo Autónomo: Analiza la petición y decide libremente qué herramientas y tono usar.'
        };
        
        // Si el rol no existe en el diccionario, usa AUTO por defecto
        return roles[role.toUpperCase()] || roles['AUTO'];
    }

    /**
     * 🏗️ Ensamblador del turno actual (Reemplaza a library.ts e intents.ts)
     * Une la memoria, el rol y lo que escribió el usuario.
     */
    static buildTurnPrompt(role: string, memory: string, userPrompt: string, hasImage: boolean): string {
        const roleContext = this.getRoleContext(role);
        
        let finalPrompt = `[ENTORNO]\nMemoria Global: ${memory}\n\n[ROL ACTIVO]\n${roleContext}\n\n[INSTRUCCIÓN DEL USUARIO]\n`;
        
        // Magia Zero-Friction: Si es InvoDex y solo mandaron una foto sin texto
        if (role.toUpperCase() === 'INVODEX' && userPrompt.trim() === '' && hasImage) {
            finalPrompt += "Analiza la imagen adjunta, extrae los datos fiscales y envíalos usando la herramienta 'procesar_factura'.";
        } 
        // 🛡️ PARCHE: Si mandan una foto sin texto a CUALQUIER otro rol (ej. CFO con un gráfico)
        else if (userPrompt.trim() === '' && hasImage) {
            finalPrompt += "Por favor, analiza detalladamente la imagen adjunta y asísteme en base a tu rol activo.";
        } 
        // Flujo normal con texto
        else {
            finalPrompt += userPrompt;
        }
        
        return finalPrompt;
    }
}