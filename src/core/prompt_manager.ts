import fs from 'fs/promises';
import path from 'path';
import { Logger } from '../utils/logger';
import { IAieosIdentity } from '../types/IAieosIdentity';

export class PromptManager {
    // 🧠 Caché en memoria: Guardamos las identidades cargadas para no leer el disco en cada mensaje
    private static identityCache: Map<string, IAieosIdentity> = new Map();

    /**
     * 🧬 AIEOS: Carga el archivo JSON de la bóveda de identidades (Vault).
     */
    public static async loadIdentity(roleId: string): Promise<IAieosIdentity | null> {
        const normalizedRole = roleId.toLowerCase();
        
        // Si ya está en la memoria RAM, lo devolvemos al instante
        if (this.identityCache.has(normalizedRole)) {
            return this.identityCache.get(normalizedRole) || null;
        }

        try {
            // Ruta segura hacia la bóveda
            const vaultPath = path.resolve(process.cwd(), 'src', 'identity', 'vault');
            const filePath = path.join(vaultPath, `${normalizedRole}.aieos.json`);
            
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const identity: IAieosIdentity = JSON.parse(fileContent);
            
            // Guardamos en caché para la próxima vez
            this.identityCache.set(normalizedRole, identity);
            Logger.info(`🧬 [AIEOS] Identidad cargada en RAM: ${identity.role} (v${identity.version})`);
            
            return identity;
        } catch (error: any) {
            // Es normal que falle si el rol (ej. 'CHAT' o 'AUTO') no tiene un JSON forjado todavía.
            return null;
        }
    }

    /**
     * 🧬 AIEOS: Traduce el ADN matemático a un System Prompt estricto.
     * Reemplaza a tu antiguo getSystemInstruction()
     */
    public static async getSystemPrompt(roleId: string = 'octo_base'): Promise<string> {
        const identity = await this.loadIdentity(roleId);

        // FALLBACK: Si no existe el JSON (ej. modo CHAT), usamos tus reglas globales antiguas
        if (!identity) {
            return `
ERES OCTOARCH v5.0 - THE COGNITIVE RUNTIME.

REGLAS GLOBALES:
1. IDIOMA: Responde siempre en el idioma del usuario.
2. HERRAMIENTAS: Tienes acceso a herramientas nativas. Usa Function Calling para invocarlas.
3. SKILLS (HABILIDADES): Usa 'loadSkill' para cargar manuales de tareas específicas.
4. SEGURIDAD: Nunca uses comandos de terminal para leer webs.
5. FORMATO: Responde de forma natural. NUNCA respondas con un esquema JSON en texto plano a menos que se te pida.
6. ANTI-ALUCINACIÓN (CRÍTICO): Eres un sistema Enterprise. NUNCA inventes datos. Si no tienes la información, di "No tengo suficiente información".
            `.trim();
        }

        // 🏗️ CONSTRUCCIÓN DEL PROMPT BASADO EN EL JSON (Ej. Modo CFO)
        let prompt = `[SISTEMA DE IDENTIDAD ESTRICTA AIEOS v${identity.version}]\n`;
        prompt += `ROL ASIGNADO: ${identity.role}\n\n`;

        // Motivaciones
        prompt += `=== DIRECTIVA PRINCIPAL ===\n${identity.motivations.primary_directive}\n\n`;
        prompt += `=== BRÚJULA MORAL (REGLAS INQUEBRANTABLES) ===\n`;
        identity.motivations.moral_compass.forEach(rule => prompt += `- ${rule}\n`);
        prompt += `\n`;

        // Psicología
        prompt += `=== MATRIZ PSICOLÓGICA ===\n`;
        prompt += `- Nivel de Lógica: ${identity.psychology.logic_weight * 100}%\n`;
        prompt += `- Libertad Creativa: ${identity.psychology.creativity_weight * 100}% (Cíñete a los datos si esto es bajo)\n`;
        prompt += `- Tolerancia al Riesgo: ${identity.psychology.risk_tolerance * 100}%\n`;
        prompt += `- Rasgos clave: ${identity.psychology.traits.join(', ')}\n\n`;

        // Lingüística
        prompt += `=== REGLAS DE LENGUAJE ===\n`;
        prompt += `- Tono: ${identity.linguistics.tone}\n`;
        prompt += `- Nivel de Formalidad: ${identity.linguistics.formality * 100}%\n`;
        
        if (identity.linguistics.forbidden_words.length > 0) {
            prompt += `[ALERTA CRÍTICA] TIENES ESTRICTAMENTE PROHIBIDO USAR LAS SIGUIENTES PALABRAS O FRASES: ${identity.linguistics.forbidden_words.join(', ')}.\n\n`;
        }

        return prompt;
    }

    /**
     * 🧬 AIEOS: Calcula la "Temperatura" ideal para la API basándose en el ADN.
     */
    public static async getLlmTemperature(roleId: string): Promise<number> {
        const identity = await this.loadIdentity(roleId);
        // Si no hay ADN (ej. modo CHAT normal), usamos 0.7 para que sea conversacional
        if (!identity) return 0.7; 

        // Si hay ADN (ej. modo CFO), la temperatura la dicta el peso de creatividad
        return identity.psychology.creativity_weight; 
    }

    // ============================================================================
    // 🧠 LÓGICA DE TURNOS Y MEMORIA (Mantenida intacta de tu código original)
    // ============================================================================

    private static getRoleContext(role: string): string {
        // Mantenemos tus roles Legacy por si aún no tienen un JSON AIEOS
        const roles: Record<string, string> = {
            'DEV': 'Modo Desarrollador: Tu objetivo es escribir, analizar o ejecutar código. Eres experto en software.',
            'RESEARCH': 'Modo Investigador: Tu objetivo es buscar información, leer páginas web y sintetizar datos complejos.',
            'INVODEX': 'Modo Contable (InvoDex): Tu objetivo principal es procesar facturas usando la herramienta procesar_factura.',
            'CFO': 'Modo Director Financiero (CFO): El ADN AIEOS está activo. Actúa según tu matriz psicológica estricta.',
            'CMO': 'Modo Director de Marketing (CMO): Tu objetivo es diseñar estrategias de crecimiento y SEO.',
            'CHAT': 'Modo Conversacional: Actúas como un asistente amigable y directo.',
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