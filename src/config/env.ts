import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 1. Cargar el archivo .env (INTACTO)
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config(); 
}

// 2. Definir el ESQUEMA (Las Reglas del Guardia)
const envSchema = z.object({
  PORT: z.string().default('18789').transform((val) => parseInt(val, 10)),
  
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  GEMINI_API_KEY: z.string().min(10, "❌ CRÍTICO: La GEMINI_API_KEY falta o es muy corta."),

  TELEGRAM_BOT_TOKEN: z.string().default(''),
  
  // 🐘 Credenciales de Supabase (Requeridas)
  SUPABASE_URL: z.string().url("❌ CRÍTICO: SUPABASE_URL debe ser una URL válida."),
  SUPABASE_KEY: z.string().min(20, "❌ CRÍTICO: SUPABASE_KEY falta o es muy corta."),
  
  // 🛠️ Llaves para el Obrero (Opcionales por ahora)
  TAVILY_API_KEY: z.string().optional(),      // Herramienta para buscar en Internet
  OPENWEATHER_API_KEY: z.string().optional(), // Herramienta para ver el clima
  
  WORKSPACE_DIR: z.string().default(path.resolve(process.cwd(), 'workspace')),
  MEMORY_DIR: z.string().default(path.resolve(process.cwd(), 'memory')),
  LOGS_DIR: z.string().default(path.resolve(process.cwd(), 'logs')),
});

// 3. Validar (¡Restaurado!)
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('\n🔥 ERROR CRÍTICO DE CONFIGURACIÓN (Zod):');
  _env.error.issues.forEach((issue) => {
    const pathString = issue.path.join('.');
    console.error(`   ❌ [${pathString}]: ${issue.message}`);
  });
  console.error('\n👉 Por favor, revisa tu archivo .env en la raíz del proyecto.\n');
  process.exit(1); 
}

// Extraemos la data de forma segura (el "!" calma a TypeScript)
const envData = _env.data!;

// 4. Exportar la configuración limpia y tipada
export const env = {
  ...envData,
  isDev: envData.NODE_ENV === 'development',
  isProd: envData.NODE_ENV === 'production',
  
  // 💉 El Maletín del Obrero
  // Agrupamos las llaves aquí para pasárselas fácilmente al sub-agente
  WORKER_SECRETS: {
      TAVILY_API_KEY: envData.TAVILY_API_KEY,
      OPENWEATHER_API_KEY: envData.OPENWEATHER_API_KEY,
      // Le pasamos las llaves de Supabase a las herramientas dinámicas:
      SUPABASE_URL: envData.SUPABASE_URL,
      SUPABASE_ANON_KEY: envData.SUPABASE_KEY // Mapeamos el nombre para que la herramienta lo reconozca
  }
};