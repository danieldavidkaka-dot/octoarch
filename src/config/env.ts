import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 1. Cargar el archivo .env
// Buscamos el .env en la raíz del proyecto (un nivel arriba de src)
const envPath = path.resolve(__dirname, '../.env');

// Verificación de existencia para depuración (opcional pero útil)
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    // Si no encuentra la ruta específica, intenta la carga por defecto
    dotenv.config(); 
}

// 2. Definir el ESQUEMA (Las Reglas del Guardia)
const envSchema = z.object({
  // CORRECCIÓN PORT: 
  // 1. Recibimos un string (o undefined).
  // 2. Si es undefined, ponemos el default como STRING '18789'.
  // 3. Finalmente, transformamos todo a Number.
  PORT: z.string().default('18789').transform((val) => parseInt(val, 10)),
  
  // Regla: Debe ser uno de estos 3 valores.
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // CORRECCIÓN GEMINI_API_KEY:
  // Quitamos el objeto de configuración que causaba el error de tipos.
  // Al poner .min(10), Zod validará que exista y tenga longitud.
  GEMINI_API_KEY: z.string().min(10, "❌ CRÍTICO: La GEMINI_API_KEY falta o es muy corta."),
  
  // Rutas (Las construimos dinámicamente, pero las validamos como strings)
  // Usamos process.cwd() para asegurar que la ruta sea absoluta desde donde ejecutas el comando
  WORKSPACE_DIR: z.string().default(path.resolve(process.cwd(), 'workspace')),
  MEMORY_DIR: z.string().default(path.resolve(process.cwd(), 'memory')),
  LOGS_DIR: z.string().default(path.resolve(process.cwd(), 'logs')),
});

// 3. Validar
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('\n🔥 ERROR CRÍTICO DE CONFIGURACIÓN (Zod):');
  _env.error.issues.forEach((issue) => {
    // Formateo limpio del error
    const pathString = issue.path.join('.');
    console.error(`   ❌ [${pathString}]: ${issue.message}`);
  });
  console.error('\n👉 Por favor, crea o revisa tu archivo .env en la raíz del proyecto.');
  console.error(`👉 Ruta esperada: ${envPath}\n`);
  process.exit(1); // Matamos la app aquí para no dañar nada
}

// 4. Exportar la configuración limpia y tipada
export const env = {
  ..._env.data,
  // Añadimos getters extra lógicos
  isDev: _env.data.NODE_ENV === 'development',
  isProd: _env.data.NODE_ENV === 'production',
};