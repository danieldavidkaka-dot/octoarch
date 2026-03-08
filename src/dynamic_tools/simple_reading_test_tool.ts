import { SchemaType } from '@google/generative-ai';
import { env } from '../config/env';

export const tool = {
    name: "simple_reading_test_tool",
    description: "Esta herramienta lee el contenido del archivo 'package.json' del entorno actual y lo devuelve como una cadena de texto. Úsala para verificar la funcionalidad básica de lectura de archivos en el Obrero de Software.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {},
        required: []
    },
    execute: async (args: any): Promise<string> => {
        try {
            // Usamos fetch para obtener el archivo package.json desde el servidor local
            const response = await fetch('http://localhost:3000/package.json');
            if (!response.ok) {
                return `Error al leer package.json: ${response.status} ${response.statusText}`;
            }
            const content = await response.text();
            return content;
        } catch (error: any) {
            return `Error inesperado: ${error.message}`;
        }
    }
};