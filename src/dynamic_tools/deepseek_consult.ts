import { SchemaType } from '@google/generative-ai';
import { env } from '../config/env';

export const tool = {
    name: "consultar_deepseek",
    description: "Consulta al modelo avanzado DeepSeek para resolver problemas complejos de lógica",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            prompt: { type: SchemaType.STRING, description: "El problema o pregunta a consultar con el modelo DeepSeek." }
        },
        required: ["prompt"]
    },
    execute: async (args: { prompt: string }): Promise<string> => {
        const deepseekApiKey = env.WORKER_SECRETS.DEEPSEEK_API_KEY;

        if (!deepseekApiKey) {
            throw new Error("DEEPSEEK_API_KEY no está configurada en las variables de entorno.");
        }

        try {
            const response = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${deepseekApiKey}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        { role: "user", content: args.prompt }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error al consultar DeepSeek: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            
            if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
                return data.choices[0].message.content;
            } else {
                throw new Error("Respuesta inesperada de DeepSeek: no se encontró contenido en la respuesta.");
            }
        } catch (error: any) {
            console.error("Error en consultar_deepseek:", error);
            throw new Error(`Fallo al comunicarse con DeepSeek: ${error.message}`);
        }
    }
};