import { SchemaType } from '@google/generative-ai';
import * as os from 'os';

export const tool = {
    name: "get_free_ram_mb",
    description: "Obtiene la cantidad de RAM libre disponible en el servidor en megabytes (MB). Útil para monitorear el rendimiento del sistema o verificar la disponibilidad de recursos.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {},
        required: []
    },
    execute: async (): Promise<string> => {
        const freeMemoryBytes = os.freemem();
        const freeMemoryMB = freeMemoryBytes / (1024 * 1024);
        return `RAM libre: ${freeMemoryMB.toFixed(2)} MB`;
    }
};