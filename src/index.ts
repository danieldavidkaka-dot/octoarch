import { OctoServer } from './services/server';
import { Logger } from './utils/logger';
import { env } from './config/env';
import { MemorySystem } from './core/memory';
import { runDiagnosis } from './utils/diagnose'; 
import express from 'express';
import path from 'path';
import fs from 'fs';

async function main() {
  await runDiagnosis();

  // 1. DEFINIR LA RUTA DEL FRONTEND CON PRECISIÓN QUIRÚRGICA
  // Usamos process.cwd() para asegurarnos que parte desde C:\Octoarch4.0
  const frontendPath = path.join(process.cwd(), 'frontend');

  console.log('\n🔍 === DIAGNÓSTICO DE FRONTEND ===');
  console.log(`📂 Buscando web en: ${frontendPath}`);
  
  if (fs.existsSync(path.join(frontendPath, 'index.html'))) {
      console.log('✅ index.html ENCONTRADO. La web debería cargar.');
  } else {
      console.error('❌ ERROR CRÍTICO: No existe "index.html" en esa carpeta.');
      console.error('⚠️ Asegúrate de que la carpeta "frontend" tenga archivos dentro.');
  }
  console.log('==================================\n');

  try {
    await MemorySystem.initialize();
    
    // Iniciar Cerebro
    const server = new OctoServer(env.PORT);
    server.start();

    // Iniciar Web
    const app = express();
    app.use(express.static(frontendPath)); // Servir archivos estáticos
    
    // Ruta de respaldo por si falla la carga automática
    app.get('/', (req, res) => {
        res.send(`
            <h1>⚠️ Error de Carga</h1>
            <p>El servidor funciona, pero no encuentra tu <b>index.html</b>.</p>
            <p>Ruta buscada: ${frontendPath}</p>
            <p>Verifica que tus archivos HTML estén ahí.</p>
        `);
    });

    app.listen(8080, () => {
        Logger.info('🌐 WEB ONLINE: http://localhost:8080');
    });

  } catch (error) {
    Logger.error('🔥 Error iniciando:', error);
  }
}

main();