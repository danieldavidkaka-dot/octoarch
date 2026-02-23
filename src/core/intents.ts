/**
 * OctoArch v4.2 - Intent Detection Module
 * Copyright (c) 2026 Daniel David Barrios
 * Licensed under GNU GPLv3
 */

/**
 * 🕵️‍♂️ DETECTOR DE INTENCIÓN HEURÍSTICO (v4.2)
 * Analiza el prompt del usuario usando un sistema de puntuación
 * con expresiones regulares para evitar colisiones de subcadenas.
 */
export function detectIntent(prompt: string): string {
    const p = prompt.toLowerCase();
    
    // --- 0. FAST PATH: INTERACCIÓN HUMANA DIRECTA ---
    // Si es un saludo seco, no necesitamos calcular puntuaciones
    if (p.match(/^(hola|hi|hello|buenos|saludos|hey|qué tal)$/i)) return "CHAT";
    if (p.match(/^(ayuda|help|qué puedes hacer)/i)) return "README_GOD";

    // --- 1. DICCIONARIO DE INTENCIONES Y PALABRAS CLAVE ---
    // Agrupamos los roles con sus triggers para evaluar el contexto global
    const intentDictionary: Record<string, string[]> = {
        "WHATSAPP_LINK": ["whatsapp", "mensaje", "qr", "chat"],
        "CFO_ADVISOR": ["costo", "presupuesto", "financiero", "roi", "burn rate"],
        "MARKETING_GURU": ["marketing", "mercado", "go-to-market", "lanzamiento"],
        "SEO_AUDIT": ["seo", "ranking", "keyword", "palabras clave"],
        "COPYWRITER": ["copy", "texto persuasivo", "blog", "post", "artículo"],
        "COLD_EMAIL": ["email frío", "venta por email", "cold email"],
        "LEGAL_DRAFT": ["legal", "contrato", "términos", "privacidad"],
        "PRD_MASTER": ["prd", "requisitos", "user stories", "historias de usuario", "pitch"],
        "API_DESIGNER": ["api", "swagger", "endpoint", "openapi"],
        "DEVOPS_PRO": ["docker", "deploy", "ci/cd", "pipeline", "nube"],
        "README_GOD": ["readme", "documentación", "manual", "guía"],
        "RESEARCHER": ["navega", "visita", "url", "lee la web", "http"],
        "LOGIC": ["seguridad", "vulnerable", "owasp"],
        "FIX": ["error", "bug", "fix", "repara"],
        "CODE_REVIEW": ["review", "revisa", "calidad", "lint"],
        "LEGACY_MODERNIZER": ["legacy", "migrar", "refactorizar"],
        "UNIT_TEST": ["test", "prueba", "qa", "coverage"],
        "R1_THINK": ["piensa", "analiza", "razona", "investiga"],
        "DB_ARCHITECT": ["base de datos", "sql", "schema", "db"],
        "BLUEPRINT": ["arquitectura", "estructura", "blueprint"],
        "SCRAPER": ["scrap", "extraer", "crawler"],
        "DATA": ["datos falsos", "mock", "generar datos"],
        "FFMPEG_WIZARD": ["ffmpeg", "video", "audio"],
        "MOBILE_DEV": ["móvil", "react native", "ios", "android"],
        "UI/UX": ["diseño", "ui", "ux", "figma"],
        "Qt_EMAIL": ["email html", "newsletter"],
        "FRONTEND_MASTER": ["componente", "tailwind", "css", "frontend"],
        "FLOW": ["diagrama", "flujo"]
    };

    // --- 2. MOTOR DE PUNTUACIÓN (SCORING ENGINE) ---
    let bestIntent = "DEV"; // Rol por defecto (Políglota)
    let highestScore = 0;

    for (const [intent, keywords] of Object.entries(intentDictionary)) {
        let currentScore = 0;

        for (const keyword of keywords) {
            // Usamos \b para buscar palabras exactas. 
            // Así "equipo" no activa "ui", y "curl" no activa "url".
            // Escapamos caracteres especiales por si hay frases como "ci/cd"
            const escapedKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
            
            const matches = p.match(regex);
            if (matches) {
                // Sumamos 1 punto por cada vez que se menciona la palabra clave
                currentScore += matches.length;
            }
        }

        // Si esta intención tiene más coincidencias semánticas que la anterior, gana
        if (currentScore > highestScore) {
            highestScore = currentScore;
            bestIntent = intent;
        }
    }

    // --- 3. OVERRIDE ESTRICTO (Casos especiales) ---
    // Si la puntuación fue un empate a 0, pero detectamos un comando InvoDex
    if (highestScore === 0 && p.includes("invodex")) {
        return "INVODEX";
    }

    return bestIntent;
}