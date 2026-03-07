import OpenAI from 'openai';
import * as dotenv from 'dotenv';
dotenv.config();

export class CoderLLM {
    private openai: OpenAI;

    constructor() {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            console.error("❌ CRÍTICO: Falta DEEPSEEK_API_KEY en el archivo .env.");
            process.exit(1);
        }
        
        // Conectamos el SDK de OpenAI a los servidores de DeepSeek
        this.openai = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: apiKey
        });
    }

    async generateCode(prompt: string): Promise<{ filename: string, code: string }> {
        try {
            console.log(`[🧠 Cerebro Obrero]: Consultando a DeepSeek... razonando paso a paso...`);
            
            // Instrucción implacable para domar la salida de DeepSeek
            const systemInstruction = `Eres un Obrero de Software de nivel Senior. 
            Tu única misión es escribir código TypeScript perfecto basado en las instrucciones.
            
            REGLAS ESTRICTAS DE RESPUESTA:
            1. Analiza de qué trata el módulo y sugiere un nombre de archivo corto en snake_case (ej: 'weather_api'). NO incluyas la extensión '.ts'.
            2. Tu respuesta final DEBE ser ÚNICAMENTE un objeto JSON válido con este formato exacto:
            {
                "filename": "nombre_sugerido",
                "code": "el código completo aquí"
            }
            3. NO envuelvas el JSON en bloques de código de markdown. CERO explicaciones o saludos. SOLO el JSON puro.`;

            const response = await this.openai.chat.completions.create({
                model: "deepseek-reasoner", // R1: Piensa antes de escribir
                messages: [
                    { role: "system", content: systemInstruction },
                    { role: "user", content: prompt }
                ]
            });
            
            // DeepSeek-Reasoner devuelve la respuesta final en 'content'.
            let responseText = response.choices[0].message.content || "{}";
            
            // 🧹 PARCHE DE SEGURIDAD EXTREMA: DeepSeek a veces ignora la regla 3 y pone markdown
            responseText = responseText.replace(/^```(json)?\n/i, '');
            responseText = responseText.replace(/```\s*$/i, '');
            
            const responseData = JSON.parse(responseText.trim());
            
            let code = responseData.code;
            let filename = responseData.filename;
            
            // Limpiamos el código TypeScript por si lo anidó dentro del JSON
            code = code.replace(/^```(typescript|ts|javascript|js)?\n/i, '');
            code = code.replace(/```\s*$/i, '');
            
            // Nos aseguramos de que termine en .ts
            if (!filename.endsWith('.ts')) {
                filename += '.ts';
            }
            
            return {
                filename: filename.trim(),
                code: code.trim()
            };

        } catch (error: any) {
            console.error("[🧠 Cerebro Obrero] Fallo catastrófico en la forja con DeepSeek:", error.message);
            throw error;
        }
    }
}