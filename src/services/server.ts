import { WebSocketServer, WebSocket } from 'ws';
import express from 'express';
import http from 'http';
import cors from 'cors';
import fs from 'fs'; 
import path from 'path'; 
import rateLimit from 'express-rate-limit'; // 🛡️ NUEVO: Escudo Anti-DoS
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

        this.configureMiddleware();
        this.setupRoutes();
    }

    private configureMiddleware() {
        // Permitimos peticiones desde cualquier página web (CORS)
        this.app.use(cors());
        
        // 📦 AUMENTAMOS EL LÍMITE A 50MB: Crucial para recibir imágenes Base64 sin que el server colapse
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ limit: '50mb', extended: true }));

        // 🛡️ SHIELD ANTI-DOS (Rate Limiter)
        // Límite: 30 peticiones por minuto por cada IP. Si se pasan, reciben un error 429.
        const apiLimiter = rateLimit({
            windowMs: 1 * 60 * 1000, // 1 minuto
            max: 30, // Máximo de peticiones por ventana
            message: { error: "Demasiadas peticiones. Por favor, intenta de nuevo en un minuto." },
            standardHeaders: true, // Retorna info de límite en los headers `RateLimit-*`
            legacyHeaders: false, // Desactiva los headers antiguos `X-RateLimit-*`
        });

        // Aplicar el limitador SOLAMENTE a las rutas de la API, no al Health Check
        this.app.use('/api/', apiLimiter);
    }

    private setupRoutes() {
        // 🩺 HEALTH CHECK ENDPOINT (Para monitoreo de Uptime)
        this.app.get('/health', (req, res) => {
            res.status(200).json({ 
                status: 'online', 
                version: '4.2',
                timestamp: new Date().toISOString()
            });
        });

        // 🌐 ENDPOINT PARA LA EXTENSIÓN CHROME (>arch) y API EXTERNAS
        this.app.post('/api/chat', async (req, res) => {
            try {
                // 🚀 EXTRAEMOS EL POSIBLE clientId DEL FRONTEND
                const { message, forcedIntent, imageBase64, clientId } = req.body;
                
                if (!message && !imageBase64) {
                    return res.status(400).json({ error: "Debes enviar un 'message' o una 'imageBase64'" });
                }

                // Si la extensión no manda ID, le asignamos uno estático por defecto
                const sessionId = clientId || "chrome_extension";

                Logger.info(`[API HTTP] Solicitud entrante: "${(message || 'Imagen adjunta').substring(0, 50)}..." [Modo: ${forcedIntent || 'Auto'}, Sesión: ${sessionId}]`);

                // 🚀 AQUÍ ESTÁ EL CAMBIO: Le pasamos el sessionId al cerebro
                const aiResponse = await this.brain.generateResponse(sessionId, message || "", forcedIntent, imageBase64);

                // 💾 LÓGICA DE GUARDADO EN CARPETA SEPARADA PARA INVODEX (EXTENSIÓN WEB)
                if (forcedIntent === 'INVODEX') {
                    try {
                        const extOutputDir = path.join(process.cwd(), 'workspace', 'invodex_ext');
                        
                        if (!fs.existsSync(extOutputDir)) {
                            fs.mkdirSync(extOutputDir, { recursive: true });
                        }
                        
                        const safeSession = sessionId.replace(/[^a-zA-Z0-9]/g, '_');
                        const timestamp = Date.now();
                        const fileName = `factura_web_${safeSession}_${timestamp}.json`;
                        const filePath = path.join(extOutputDir, fileName);

                        let jsonContent = aiResponse;
                        const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                        if (jsonMatch) {
                            jsonContent = jsonMatch[1].trim();
                        }

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
        this.wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
            const ip = req.socket.remoteAddress || 'Desconocida';
            Logger.info(`🌐 Cliente conectado desde la web (WebSocket) - IP: ${ip}`);

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
            Logger.info(`OctoArch Server v4.2 (Híbrido HTTP/WS) escuchando en el puerto ${this.port}`);
            Logger.info(`🛡️ Rate Limiter Activo (Max 30 req/min por IP)`);
            Logger.info(`🩺 Health Check: GET http://localhost:${this.port}/health`);
            Logger.info(`🤖 API Chat: POST http://localhost:${this.port}/api/chat`);
        });
    }

    stop() {
        if (this.wss) this.wss.close();
        if (this.httpServer) this.httpServer.close();
    }
}