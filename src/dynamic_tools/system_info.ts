import { SchemaType } from '@google/generative-ai';
import { env } from '../config/env';
import os from 'os';

export const tool = {
    name: "system_info",
    description: "Obtiene información básica del sistema operativo y hardware, incluyendo la plataforma (sistema operativo), arquitectura del procesador y el tiempo de actividad del sistema en horas. Útil para diagnósticos y registros del entorno de ejecución.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {},
        required: []
    },
    execute: async (args: any): Promise<string> => {
        const platform = os.platform();
        const architecture = os.arch();
        const uptimeHours = os.uptime() / 3600;

        const result = {
            platform,
            architecture,
            uptime_hours: uptimeHours
        };

        return JSON.stringify(result);
    }
};