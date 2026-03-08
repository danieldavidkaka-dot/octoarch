import { SchemaType } from '@google/generative-ai';
import { env } from '../config/env'; // <-- IMPORTANTE: Importa siempre env

export const tool = {
    name: "get_current_system_time",
    description: "Una herramienta sencilla para obtener la hora actual del sistema. No requiere parámetros y devuelve la fecha y hora local del sistema, así como la hora UTC.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {},
        required: []
    },
    execute: async (): Promise<string> => {
        const now = new Date();
        const localTimeString = now.toLocaleString();
        const utcTimeString = now.toISOString();
        
        // No se usan llaves secretas ya que esta herramienta no se conecta a servicios externos.
        // const miLlave = env.WORKER_SECRETS.NOMBRE_DE_LA_LLAVE; 

        return `La hora actual del sistema (local) es: ${localTimeString}. La hora actual del sistema (UTC) es: ${utcTimeString}.`;
    }
};