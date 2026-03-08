import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config();

export class CoderLLM {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY; 
        if (!apiKey) {
            console.error("❌ CRÍTICO: Falta GEMINI_API_KEY en el archivo .env.");
            process.exit(1);
        }
        
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async generateCode(prompt: string): Promise<{ filename: string, code: string }> {
        try {
            // 🏷️ LOG: Así sabremos que el nuevo formato irrompible está activo
            console.log(`[🧠 Cerebro Obrero]: Consultando a Gemini (Motor 2.5 Flash - Modo Etiquetas activo)...`);
            
            // 🚨 EL CAMBIO MAESTRO: Adiós JSON
            const systemInstruction = `Eres un Obrero de Software de nivel Senior. 
            Tu única misión es escribir código TypeScript perfecto basado en las instrucciones.
            
            REGLAS ESTRICTAS DE RESPUESTA:
            1. NO devuelvas JSON. El formato JSON se rompe con el código complejo.
            2. Sugiere un nombre de archivo corto en snake_case (ej: 'logger_analyzer').
            3. Tu respuesta final DEBE usar exactamente estas dos etiquetas para separar la información:

            <filename>nombre_sugerido.ts</filename>
            <code>
            // Escribe todo el código TypeScript aquí
            </code>

            No agregues texto fuera de estas etiquetas.`;

            const model = this.genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash", 
                systemInstruction: systemInstruction 
            });

            const result = await model.generateContent(prompt);
            const responseText = result.response.text() || "";
            
            // 🕵️‍♂️ Extracción con Regex (Inmune a problemas de formato/comillas/saltos de línea)
            const filenameMatch = responseText.match(/<filename>([\s\S]*?)<\/filename>/i);
            const codeMatch = responseText.match(/<code>([\s\S]*?)<\/code>/i);

            if (!filenameMatch || !codeMatch) {
                // Si por alguna razón rarísima la IA no usa las etiquetas
                throw new Error("El Obrero no respetó el formato de etiquetas <filename> y <code>.");
            }
            
            let filename = filenameMatch[1].trim();
            let code = codeMatch[1].trim();
            
            // Limpiamos los backticks de markdown por si la IA los pone dentro del bloque <code>
            code = code.replace(/^```(typescript|ts|javascript|js)?\n/i, '');
            code = code.replace(/```\s*$/i, '');
            
            if (!filename.endsWith('.ts')) {
                filename += '.ts';
            }
            
            return {
                filename: filename.trim(),
                code: code.trim()
            };

        } catch (error: any) {
            console.error("[🧠 Cerebro Obrero] Fallo catastrófico en la forja:", error.message);
            throw error;
        }
    }
}