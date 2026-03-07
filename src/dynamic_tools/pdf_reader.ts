import { SchemaType } from '@google/generative-ai';
import { join } from 'node:path';

export const tool = {
    name: "read_pdf_text",
    description: "Lee un archivo PDF desde la carpeta 'workspace/' y devuelve su contenido de texto. " +
                 "Debido a las restricciones del entorno (no se permiten librerías externas para parsing de PDF), " +
                 "esta herramienta leerá el archivo y confirmará su existencia y tamaño, pero no puede " +
                 "extraer el texto real del PDF. Maneja errores como archivos no encontrados.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            filename: { type: SchemaType.STRING, description: "El nombre del archivo PDF a leer desde la carpeta 'workspace/' (ej: 'documento.pdf')." }
        },
        required: ["filename"]
    },
    execute: async (args: { filename: string }): Promise<string> => {
        const filePath = join(process.cwd(), 'workspace', args.filename);
        const fileUrl = new URL(`file://${filePath}`).href; // Convertir ruta local a URL con protocolo file://

        try {
            // Usar fetch nativo de Node.js para acceder al sistema de archivos a través del protocolo file://
            // Esto lee los bytes crudos del archivo.
            const response = await fetch(fileUrl);

            // Para file://, un archivo no encontrado generalmente lanza un error antes de llegar aquí.
            // Sin embargo, esta verificación es buena práctica para fetch en general.
            if (!response.ok) {
                throw new Error(`Error al acceder al archivo: ${response.status} ${response.statusText || 'Estado desconocido'}`);
            }

            // Leer el contenido del archivo como un ArrayBuffer
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer); // Convertir ArrayBuffer a Buffer de Node.js

            // --- LIMITACIÓN CRÍTICA ---
            // En este punto, 'buffer' contiene los bytes crudos del PDF.
            // La extracción de texto legible por humanos de un PDF requiere una librería de parsing de PDF dedicada.
            // El error anterior indicó que 'pdf-parse' no está disponible y no se permiten librerías externas.
            // Las APIs nativas de Node.js no proporcionan capacidades de parsing de PDF.

            // Por lo tanto, no se puede cumplir con la parte de "extraer su contenido de texto" de forma precisa.
            // Se devolverá un mensaje indicando que el archivo fue leído pero la extracción de texto no es soportada.

            return `Archivo '${args.filename}' leído exitosamente (${buffer.length} bytes). ` +
                   `La extracción de texto de PDFs no es soportada sin librerías externas en este entorno.`;

        } catch (error: any) {
            // Manejar errores específicos de 'archivo no encontrado' o de acceso.
            if (error.code === 'ENOENT' || error.message.includes('no such file or directory')) {
                return `Error: El archivo PDF '${args.filename}' no fue encontrado en la carpeta 'workspace/'.`;
            }
            // Capturar otros errores potenciales (ej: URL mal formada, permisos, etc.)
            return `Error al leer el archivo PDF '${args.filename}': ${error.message}`;
        }
    }
};