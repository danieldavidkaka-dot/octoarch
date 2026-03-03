/**
 * Octoarch v4.9 - The Cognitive Runtime
 * Copyright (c) 2026 Daniel David Barrios
 * License: MIT (Open Core)
 */

import { OctoServer } from './services/server';
import { Logger } from './utils/logger';
import { env } from './config/env';
import { MemorySystem } from './core/memory';
import { runDiagnosis } from './utils/diagnose'; 
import { WhatsAppService } from './tools/whatsapp';
import { MCPManager } from './core/mcp_manager'; // 🔌 Importamos el gestor MCP
import { GmailTool } from './tools/gmail'; // 📧 NUEVO: Herramienta de Gmail
import cron from 'node-cron'; // ⏱️ NUEVO: Reloj interno
import express from 'express';
import path from 'path';
import fs from 'fs';

async function main() {
  await runDiagnosis();

  // 1. DEFINIR LA RUTA DEL FRONTEND CON PRECISIÓN QUIRÚRGICA
  // Usamos process.cwd() para asegurarnos que parte desde la raíz del proyecto
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
    // 0. Inicializar Conexiones Externas (MCP) ANTES del cerebro
    await MCPManager.getInstance().connectServer(
        "servidor-invodex",
        "npx", 
        ["ts-node", path.join(__dirname, "mcp_invodex_mock.ts")]
    );

    // 1. Inicializar Memoria
    await MemorySystem.initialize();
    
    // 2. Inicializar WhatsApp (Generará el QR en terminal)
    WhatsAppService.initialize(); 

    // 3. Iniciar Cerebro (Servidor API)
    const server = new OctoServer(env.PORT);
    server.start();

    // 4. Iniciar Web (Frontend)
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

    // ⏱️ 5. INICIAR EL CORAZÓN AUTOMÁTICO (CRONJOB)
    Logger.info(`⏱️ Iniciando reloj interno: Revisión de Gmail automática cada 15 minutos.`);
    
    // El formato '*/15 * * * *' significa "Ejecutar cada 15 minutos"
    cron.schedule('*/15 * * * *', async () => {
        Logger.info(`🔄 [CRON] Despertando para revisar bandeja de entrada de Gmail...`);
        try {
            const report = await GmailTool.fetchUnreadInvoices();
            
            if (!report.includes("No hay correos nuevos")) {
                Logger.info(`📬 [CRON] Tarea completada. Resultados:\n${report}`);
                
                // 💡 TIP ARQUITECTO: Si en el futuro quieres que te avise por WhatsApp 
                // cuando descargue algo en automático, descomenta esto y pon tu número:
                // await WhatsAppService.sendMessage('58414XXXXXXX@c.us', `🐙 *InvoDex Auto:*\nAcabo de procesar nuevos correos:\n\n${report}`);
            } else {
                Logger.info(`📭 [CRON] Bandeja revisada. Sin novedades.`);
            }
        } catch (cronError) {
            Logger.error(`❌ [CRON] Error revisando Gmail:`, cronError);
        }
    });

  } catch (error) {
    Logger.error('🔥 Error iniciando:', error);
  }
}

main();