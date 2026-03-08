import { SchemaType } from '@google/generative-ai';
import { env } from '../config/env'; // <-- IMPORTANTE: Importa siempre env
import { promises as fs } from 'fs'; // Importar el módulo 'fs/promises' para operaciones de sistema de archivos asíncronas

/**
 * Analiza un fragmento de código para identificar funciones, su longitud y nivel de anidamiento.
 * NOTA: Esta es una implementación simplificada que utiliza expresiones regulares y conteo básico
 * debido a la restricción de no usar APIs o librerías externas (como un parser AST).
 * Puede que no detecte todas las formas de funciones o anidamiento de manera exhaustiva.
 *
 * @param code El string de código a analizar.
 * @returns Un array de objetos, cada uno describiendo una función encontrada.
 */
function getFunctionComplexity(code: string): { name: string, loc: number, nesting: number }[] {
    const functions: { name: string, loc: number, nesting: number }[] = [];
    // Regex para detectar funciones: funciones nombradas, anónimas, de flecha (asignadas o no), y métodos.
    // Es una aproximación y puede ser imprecisa.
    const functionStartRegex = /(?:(?:async\s+)?function\s+(?<name1>\w+)?\s*\(.*?\)\s*{|(?<name2>\w+)\s*:\s*(?:async\s+)?function\s*\(.*?\)\s*{|(?<name3>\w+)?\s*=\s*(?:async\s+)?\(.*?\)\s*=>\s*{)/g;

    let match;
    while ((match = functionStartRegex.exec(code)) !== null) {
        const funcStartPos = match.index;
        // Intentar obtener el nombre de la función de los grupos de captura.
        const funcName = match.groups?.name1 || match.groups?.name2 || match.groups?.name3 || 'anonymous_or_arrow_function';

        let openBraces = 0;
        let funcEndPos = -1;
        let currentNesting = 0;
        let maxNesting = 0;
        let funcContentLines = 0;

        // Búsqueda del cuerpo de la función para LOC y anidamiento.
        // Esto asume que el bloque de la función es un bloque coherente delimitado por llaves.
        for (let i = funcStartPos; i < code.length; i++) {
            if (code[i] === '{') {
                openBraces++;
                if (openBraces > 1) { // Solo contar anidamiento dentro del cuerpo de la función
                    currentNesting++;
                    if (currentNesting > maxNesting) maxNesting = currentNesting;
                }
            } else if (code[i] === '}') {
                openBraces--;
                if (openBraces === 0) {
                    funcEndPos = i;
                    break;
                }
                currentNesting--;
            }
            if (openBraces > 0 && code[i] === '\n') { // Contar líneas dentro de la función
                funcContentLines++;
            }
        }

        if (funcEndPos !== -1) {
            functions.push({ name: funcName, loc: funcContentLines + 1, nesting: maxNesting }); // +1 para la llave de cierre
        }
    }
    return functions;
}

/**
 * Encuentra líneas de código idénticas duplicadas en múltiples archivos.
 * Esto es un análisis de texto plano y no considera duplicación semántica.
 *
 * @param allFileContents Un mapa donde la clave es la ruta del archivo y el valor es su contenido.
 * @returns Un array de strings, cada uno describiendo una línea duplicada y los archivos donde se encontró.
 */
async function findDuplication(allFileContents: Map<string, string>): Promise<string[]> {
    const duplicatedLinesInfo: string[] = [];
    const lineOccurrences = new Map<string, { count: number, files: Set<string> }>();

    for (const [filePath, content] of allFileContents.entries()) {
        const lines = content.split('\n')
            .map(line => line.trim())
            .filter(line =>
                line.length > 10 && // Ignorar líneas muy cortas que a menudo son ruido
                !line.startsWith('//') && // Ignorar comentarios de una sola línea
                !line.startsWith('/*') && // Ignorar inicio de comentarios multilínea
                !line.startsWith('*') && // Ignorar líneas dentro de comentarios multilínea
                !line.match(/^\s*[{};,\])]\s*$/) // Ignorar líneas que solo contienen llaves, puntos y comas, etc.
            );

        for (const line of lines) {
            if (lineOccurrences.has(line)) {
                const entry = lineOccurrences.get(line)!;
                entry.count++;
                entry.files.add(filePath);
            } else {
                lineOccurrences.set(line, { count: 1, files: new Set([filePath]) });
            }
        }
    }

    for (const [line, { count, files }] of lineOccurrences.entries()) {
        // Considerar duplicación si la misma línea aparece en al menos dos archivos diferentes.
        if (count > 1 && files.size > 1) {
            duplicatedLinesInfo.push(`- Línea duplicada: "${line}" (en ${Array.from(files).join(', ')})`);
        }
    }
    return duplicatedLinesInfo;
}

export const tool = {
    name: "octoarch_code_audit_and_refactor_tool",
    description: "La Herramienta de Auditoría y Refactorización de Código Interno (Asistida) de OctoArch lee y analiza módulos de código fuente internos para identificar complejidades innecesarias, duplicación de código y áreas que no cumplen con los estándares de OctoArch. Genera un plan de refactorización o sugerencias detalladas para mejorar la calidad, mantenibilidad y eficiencia del código base, sin ejecutar cambios directamente. Esta herramienta no utiliza APIs externas, su análisis se basa en lectura directa de archivos y heurísticas internas. Úsala para obtener una visión profunda de la salud del código y para planificar mejoras.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            filePaths: {
                type: SchemaType.ARRAY,
                description: "Una lista de rutas de archivos de módulos de código fuente internos de OctoArch a analizar (ej: ['src/core/llm.ts', 'src/core/tool_orchestrator.ts', 'src/channels/whatsapp.ts']). Las rutas deben ser relativas al directorio de ejecución.",
                items: {
                    type: SchemaType.STRING
                }
            }
        },
        required: ["filePaths"]
    },
    execute: async (args: { filePaths: string[] }): Promise<string> => {
        const { filePaths } = args;
        let refactoringPlan = "--- Plan de Auditoría y Refactorización de Código de OctoArch ---\n\n";
        const allFileContents = new Map<string, string>(); // Almacena el contenido de todos los archivos para el análisis global.

        if (!filePaths || filePaths.length === 0) {
            return "❌ Error: No se proporcionaron rutas de archivos para el análisis. Por favor, especifica al menos un archivo para auditar.";
        }

        refactoringPlan += "### Resultados del Análisis por Archivo ###\n\n";

        for (const filePath of filePaths) {
            try {
                const content = await fs.readFile(filePath, 'utf8');
                allFileContents.set(filePath, content);
                refactoringPlan += `#### Archivo: \`${filePath}\` ####\n`;

                const lines = content.split('\n');
                if (lines.length > 400) { // Umbral arbitrario para archivos grandes
                    refactoringPlan += `- ⚠️ **Archivo Grande:** El archivo contiene ${lines.length} líneas. Considera dividirlo en módulos más pequeños y con responsabilidades más específicas para mejorar la mantenibilidad y la legibilidad. Esto facilita la colaboración y reduce la superficie de errores.\n`;
                }

                // Análisis básico de complejidad de funciones
                const functions = getFunctionComplexity(content);
                if (functions.length === 0 && lines.length > 50) {
                     refactoringPlan += `- 💡 **Estructura:** No se detectaron funciones claras en este archivo (o es un archivo de configuración/datos puro). Si es código ejecutable, asegúrate de que esté bien modularizado en funciones con nombres descriptivos.\n`;
                }
                for (const func of functions) {
                    if (func.loc > 60) { // Umbral arbitrario para funciones largas
                        refactoringPlan += `- 📏 **Función Larga:** La función \`${func.name}\` tiene ${func.loc} líneas. Podría beneficiarse de ser dividida en funciones más pequeñas y cohesivas, cada una con una única responsabilidad (Principio de Responsabilidad Única).\n`;
                    }
                    if (func.nesting > 3) { // Umbral arbitrario para anidamiento profundo
                        refactoringPlan += `- 🌳 **Anidamiento Profundo:** La función \`${func.name}\` tiene un nivel de anidamiento de ${func.nesting}. Considera refactorizar con "guard clauses" (cláusulas de guarda), extrayendo lógica compleja a funciones auxiliares o usando patrones de diseño para reducir la complejidad ciclomatica y mejorar la legibilidad.\n`;
                    }
                }

                // Detección de "números mágicos" o strings literales repetidos
                // Se buscan números de al menos 2 dígitos que no sean flotantes, versiones o parte de identificadores.
                const magicNumberRegex = /(?<![.\w-])\b\d{2,}(?!\.\d|\w)\b/g;
                let numMatch;
                const magicNumbers = new Set<string>();
                while ((numMatch = magicNumberRegex.exec(content)) !== null) {
                    magicNumbers.add(numMatch[0]);
                }
                if (magicNumbers.size > 0) {
                    refactoringPlan += `- 🧙 **Valores Mágicos:** Se encontraron números literales sin nombre (ej: ${Array.from(magicNumbers).slice(0, 5).join(', ')}). Considera definirlos como constantes con nombres descriptivos para mejorar la legibilidad, facilitar la actualización y reducir errores.\n`;
                }

                // Detección de uso de 'any' (indicador de tipado débil)
                const anyRegex = /\b:\s*any\b/g;
                let anyMatch;
                const anyUsages = new Set<string>();
                while ((anyMatch = anyRegex.exec(content)) !== null) {
                    const lineStart = content.lastIndexOf('\n', anyMatch.index) + 1;
                    const lineEnd = content.indexOf('\n', anyMatch.index);
                    const line = content.substring(lineStart, lineEnd !== -1 ? lineEnd : content.length).trim();
                    anyUsages.add(line);
                }
                if (anyUsages.size > 0) {
                    refactoringPlan += `- 👻 **Tipado Débil (any):** Se detectó el uso del tipo \`any\` en varias ocasiones (ej: ${Array.from(anyUsages).slice(0, 3).join('; ')}). Para un código más robusto y mantenible, intenta definir tipos más específicos. Esto mejora la seguridad en tiempo de compilación y la autocompletado en IDEs.\n`;
                }


                refactoringPlan += "\n";

            } catch (error: any) {
                refactoringPlan += `#### ❌ Error al procesar \`${filePath}\` ####\n`;
                refactoringPlan += `- No se pudo leer el archivo: ${error.message}. Asegúrate de que la ruta sea correcta, que el archivo exista y que OctoArch tenga los permisos necesarios para leerlo.\n\n`;
            }
        }

        // Análisis global de duplicación entre todos los archivos leídos
        refactoringPlan += "\n### Análisis Global de Duplicación de Código ###\n\n";
        const duplicatedLines = await findDuplication(allFileContents);
        if (duplicatedLines.length > 0) {
            refactoringPlan += "🕵️ **Posible Duplicación de Código Identificada:**\n";
            refactoringPlan += duplicatedLines.map(d => `  ${d}`).join('\n') + '\n';
            refactoringPlan += "\n**Sugerencia General:** Considera extraer estas líneas o bloques de código duplicados a funciones, clases o módulos reutilizables para adherirte al principio DRY (Don't Repeat Yourself). La consolidación de lógica común reduce el tamaño del código, simplifica el mantenimiento y previene inconsistencias.\n";
        } else {
            refactoringPlan += "🎉 No se encontró duplicación de código significativa entre los archivos analizados (basado en un análisis simple por línea de texto). ¡Buen trabajo manteniendo tu código DRY!\n";
        }

        refactoringPlan += "\n--- Fin del Plan de Auditoría y Refactorización ---\n";

        return refactoringPlan;
    }
};