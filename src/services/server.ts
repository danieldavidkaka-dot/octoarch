import { WebSocketServer, WebSocket } from 'ws';
import express from 'express';
import http from 'http';
import cors from 'cors';
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
                const { message, forcedIntent, imageBase64 } = req.body;
                
                if (!message) {
                    return res.status(400).json({ error: "El campo 'message' es obligatorio" });
                }

                Logger.info(`[API HTTP] Solicitud entrante: "${message.substring(0, 50)}..." [Modo: ${forcedIntent || 'Auto'}]`);

                // 🚀 ¡AQUÍ ESTÁ LA MAGIA! Ahora sí le pasamos imageBase64 al cerebro
                const aiResponse = await this.brain.generateResponse(message, forcedIntent, imageBase64);

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

                    if (parsed.type === "agent:turn" && parsed.data) {
                        userText = parsed.data.message;
                        forcedIntent = parsed.data.forcedIntent || null;
                    } else if (parsed.message) {
                        userText = parsed.message;
                    } else {
                        userText = raw;
                    }

                    Logger.info(`[WS] Procesando solicitud: "${userText.substring(0, 50)}..." [Modo: ${forcedIntent || 'Auto'}]`);

                    const aiResponse = await this.brain.generateResponse(userText, forcedIntent);

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