import { SchemaType } from '@google/generative-ai';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

export const tool = {
    name: "local_excel_reader",
    description: "Lee un archivo .xlsx desde la ruta 'workspace/' y devuelve su contenido en formato JSON. Cada hoja del libro de Excel se convierte en una clave en el objeto JSON resultante, con su valor siendo un array de objetos que representan las filas de datos de esa hoja.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            filename: {
                type: SchemaType.STRING,
                description: "El nombre del archivo .xlsx a leer (ej: 'datos.xlsx'). El archivo debe estar en la carpeta 'workspace/' y se buscará en la ruta absoluta 'process.cwd()/workspace/'."
            }
        },
        required: ["filename"]
    },
    execute: async (args: { filename: string }): Promise<string> => {
        try {
            const workspacePath = path.join(process.cwd(), 'workspace');
            const filePath = path.join(workspacePath, args.filename);

            // Verificar si el archivo existe
            if (!fs.existsSync(filePath)) {
                return JSON.stringify({ error: `El archivo '${args.filename}' no se encontró en la ruta esperada: '${workspacePath}'.` });
            }

            // Leer el buffer del archivo
            const fileBuffer = fs.readFileSync(filePath);

            // Parsear el libro de trabajo
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

            const allSheetsData: Record<string, any[]> = {};

            // Iterar sobre cada hoja y convertir a JSON
            workbook.SheetNames.forEach(sheetName => {
                const sheet = workbook.Sheets[sheetName];
                allSheetsData[sheetName] = XLSX.utils.sheet_to_json(sheet);
            });

            return JSON.stringify(allSheetsData);
        } catch (error: any) {
            return JSON.stringify({ error: `Error al leer o procesar el archivo Excel: ${error.message}` });
        }
    }
};