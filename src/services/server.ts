import { WebSocketServer, WebSocket } from 'ws';
import express from 'express';
import http from 'http';
import cors from 'cors';
import fs from 'fs'; // 📁 Importamos File System para el auto-guardado
import path from 'path'; // 🗺️ Importamos Path
import { Logger } from '../utils/logger';
import { IntelligenceCore, getBrain } from '../core/llm';

export class OctoServer {
    private wss: WebSocketServer | null = null;
    private httpServer: http.Server | null = null;
    private app: express.Express;
    private port: number;
    private brain: IntelligenceCore;

    constructor(port: number) {
        this.port = port;
        this.brain = getBrain();
        this.app = express();

        // 🛡️ CONFIGURACIÓN HTTP PARA LA EXTENSIÓN Y VISIÓN (INVODEX)
        // Permitimos peticiones desde cualquier página web (CORS)
        this.app.use(cors());
        
        // 📦 AUMENTAMOS EL LÍMITE A 50MB: Crucial para recibir imágenes Base64 sin que el server colapse
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ limit: '50mb', extended: true }));

        this.setupRoutes();
    }

    private setupRoutes() {
        // 🌐 ENDPOINT PARA LA EXTENSIÓN CHROME (>arch)
        this.app.post('/api/chat', async (req, res) => {
            try {
                // 🚀 EXTRAEMOS EL POSIBLE clientId DEL FRONTEND
                const { message, forcedIntent, imageBase64, clientId } = req.body;
                
                if (!message) {
                    return res.status(400).json({ error: "El campo 'message' es obligatorio" });
                }

                // Si la extensión no manda ID, le asignamos uno estático por defecto
                const sessionId = clientId || "chrome_extension";

                Logger.info(`[API HTTP] Solicitud entrante: "${message.substring(0, 50)}..." [Modo: ${forcedIntent || 'Auto'}, Sesión: ${sessionId}]`);

                // 🚀 AQUÍ ESTÁ EL CAMBIO: Le pasamos el sessionId al cerebro
                const aiResponse = await this.brain.generateResponse(sessionId, message, forcedIntent, imageBase64);

                // 💾 LÓGICA DE GUARDADO EN CARPETA SEPARADA PARA INVODEX (EXTENSIÓN WEB)
                if (forcedIntent === 'INVODEX') {
                    try {
                        const extOutputDir = path.join(process.cwd(), 'workspace', 'invodex_ext');
                        
                        // Crear la carpeta si no existe
                        if (!fs.existsSync(extOutputDir)) {
                            fs.mkdirSync(extOutputDir, { recursive: true });
                        }
                        
                        // Limpiar la sesión para usarla en el nombre de archivo
                        const safeSession = sessionId.replace(/[^a-zA-Z0-9]/g, '_');
                        const timestamp = Date.now();
                        const fileName = `factura_web_${safeSession}_${timestamp}.json`;
                        const filePath = path.join(extOutputDir, fileName);

                        // Extraer el JSON limpio
                        let jsonContent = aiResponse;
                        const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                        if (jsonMatch) {
                            jsonContent = jsonMatch[1].trim();
                        }

                        // Guardar en disco
                        fs.writeFileSync(filePath, jsonContent, 'utf-8');
                        Logger.info(`💾 [InvoDex Web] JSON de factura guardado exitosamente en: ${filePath}`);
                    } catch (fsError) {
                        Logger.error("❌ Error guardando el JSON web en workspace:", fsError);
                    }
                }

                res.json({
                    success: true,
                    response: aiResponse
                });

            } catch (error: any) {
                Logger.error('❌ Error en Endpoint HTTP:', error);
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }

    start() {
        // Unimos Express y WebSockets en el mismo servidor HTTP
        this.httpServer = http.createServer(this.app);
        this.wss = new WebSocketServer({ server: this.httpServer });

        // --- LÓGICA WEBSOCKET (Mantiene vivo el Frontend React) ---
        this.wss.on('connection', (ws: WebSocket) => {
            Logger.info('Cliente conectado desde la web (WebSocket)');

            ws.on('message', async (message: string) => {
                try {
                    const raw = message.toString();
                    const parsed = JSON.parse(raw);
                    
                    let userText = "";
                    let forcedIntent: string | null = null;
                    // Extraemos un posible ID del mensaje WS
                    let sessionId = parsed.clientId || "web_socket_client";

                    if (parsed.type === "agent:turn" && parsed.data) {
                        userText = parsed.data.message;
                        forcedIntent = parsed.data.forcedIntent || null;
                    } else if (parsed.message) {
                        userText = parsed.message;
                    } else {
                        userText = raw;
                    }

                    Logger.info(`[WS] Procesando solicitud: "${userText.substring(0, 50)}..." [Modo: ${forcedIntent || 'Auto'}, Sesión: ${sessionId}]`);

                    // 🚀 AQUÍ ESTÁ EL CAMBIO: Le pasamos el sessionId al cerebro
                    const aiResponse = await this.brain.generateResponse(sessionId, userText, forcedIntent);

                    ws.send(JSON.stringify({
                        type: 'response',
                        content: aiResponse,
                        done: true
                    }));

                } catch (error: any) {
                    Logger.error('❌ Error procesando mensaje WS:', error);
                    ws.send(JSON.stringify({ type: 'error', content: error.message }));
                }
            });
        });

        // Iniciar el servidor unificado
        this.httpServer.listen(this.port, () => {
            Logger.info(`Octoarch Server v4.0 (Híbrido HTTP/WS) escuchando en el puerto ${this.port}`);
            Logger.info(`Endpoint Extensión: POST http://localhost:${this.port}/api/chat`);
        });
    }

    stop() {
        if (this.wss) this.wss.close();
        if (this.httpServer) this.httpServer.close();
    }
}