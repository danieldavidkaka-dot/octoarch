import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
// Usaremos dotenv directo para no depender de la estructura completa de tu repo principal aún
import * as dotenv from 'dotenv';
dotenv.config();

export class CoderLLM {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("❌ CRÍTICO: Falta GEMINI_API_KEY en el archivo .env de tu nuevo repo.");
            process.exit(1);
        }
        
        this.genAI = new GoogleGenerativeAI(apiKey);
        
        // 🛡️ INSTRUCCIÓN DE SISTEMA DRACONIANA (Evolucionada a JSON)
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-2.5-flash", 
            systemInstruction: `Eres un Obrero de Software de nivel Senior. 
            Tu única misión es escribir código TypeScript perfecto basado en las instrucciones.
            
            REGLAS ESTRICTAS DE RESPUESTA:
            1. Analiza de qué trata el módulo y sugiere un nombre de archivo corto y descriptivo (ej: 'weather_api', 'math_utils'). NO incluyas la extensión '.ts' en el nombre.
            2. Devuelve el código TypeScript completo sin bloques de Markdown (sin \`\`\`typescript).
            3. CERO explicaciones o saludos.`,
            generationConfig: {
                temperature: 0.0,
                // Obligamos a la IA a responder con un objeto JSON perfecto
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        filename: {
                            type: SchemaType.STRING,
                            description: "Nombre sugerido para el archivo, en snake_case y sin la extensión .ts"
                        },
                        code: {
                            type: SchemaType.STRING,
                            description: "El código TypeScript en texto crudo, listo para guardar y compilar"
                        }
                    },
                    required: ["filename", "code"]
                }
            }
        });
    }

    // 🚀 Cambiamos la firma para que devuelva un objeto con ambas cosas
    async generateCode(prompt: string): Promise<{ filename: string, code: string }> {
        try {
            console.log(`[🧠 Cerebro Obrero]: Procesando prompt...`);
            const result = await this.model.generateContent(prompt);
            
            // La IA devolverá un JSON string, lo parseamos
            const responseData = JSON.parse(result.response.text());
            
            let code = responseData.code;
            let filename = responseData.filename;
            
            // 🧹 PARCHE DE SEGURIDAD (Limpieza de Markdown por si acaso)
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
            console.error("[🧠 Cerebro Obrero] Fallo catastrófico en la generación:", error.message);
            throw error;
        }
    }
}