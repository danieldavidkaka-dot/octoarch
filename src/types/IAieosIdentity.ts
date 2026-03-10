/**
 * AIEOS (AI Entity Object Specification) - v1.1
 * Contrato estricto que define el "ADN Digital" de las Personas/Agentes del sistema.
 */

export interface IPsychology {
    /** Valor de 0.0 a 1.0 que define el peso de la lógica matemática vs intuición */
    logic_weight: number;
    /** Valor de 0.0 a 1.0 que define la libertad creativa (0 = estricto, 1 = imaginativo) */
    creativity_weight: number;
    /** Nivel de tolerancia al riesgo (0.0 = bloqueo estricto ante duda, 1.0 = arriesgado) */
    risk_tolerance: number;
    /** Rasgos de personalidad principales (ej. ["analítico", "escéptico", "meticuloso"]) */
    traits: string[];
}

export interface ILinguistics {
    /** Valor de 0.0 a 1.0 que define el nivel de formalidad (1.0 = corporativo estricto) */
    formality: number;
    /** Tono general de la conversación (ej. "directo", "empático", "autoritario") */
    tone: string;
    /** Palabras o frases que el agente tiene prohibido usar bajo cualquier contexto (ej. ["creo", "quizás"]) */
    forbidden_words: string[];
    /** Nivel de complejidad léxica (ej. "alta", "media", "baja") */
    lexical_complexity: 'baja' | 'media' | 'alta' | 'tecnica';
}

export interface IMotivations {
    /** El objetivo principal inquebrantable del agente (ej. "Proteger la salud financiera de InvoDex") */
    primary_directive: string;
    /** Reglas éticas estrictas (PBAC) que el agente no puede violar bajo ninguna circunstancia */
    moral_compass: string[];
    /** Objetivos secundarios o de evolución a corto plazo */
    evolution_goals: string[];
}

export interface ICapabilities {
    /** Nivel de acceso al sistema para la Jaula de Titanio */
    access_level: 'read_only' | 'sandbox' | 'admin';
    /** Lista blanca de herramientas que este agente tiene permiso explícito de usar (ej. ["leer_factura", "calcular_roi"]) */
    allowed_tools: string[];
    /** Habilidades especializadas que el agente reconoce poseer */
    specialized_skills: string[];
}

export interface IAieosIdentity {
    /** Nombre único y técnico de la identidad (ej. "cfo_invodex") */
    id: string;
    /** Rol principal legible por humanos (ej. "CFO Principal") */
    role: string;
    /** Versión del ADN de esta identidad para auditoría (ej. "1.0.0") */
    version: string;
    
    // === LOS 4 PILARES COGNITIVOS ===
    psychology: IPsychology;
    linguistics: ILinguistics;
    motivations: IMotivations;
    capabilities: ICapabilities;
}