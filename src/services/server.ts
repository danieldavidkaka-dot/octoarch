import { WebSocketServer, WebSocket } from 'ws';
import { Logger } from '../utils/logger';
import { IntelligenceCore } from '../core/llm';

export class OctoServer {
  private wss: WebSocketServer | null = null;
  private port: number;
  private brain: IntelligenceCore;

  constructor(port: number) {
    this.port = port;
    // 👇 ESTO ES LO QUE FALTABA: Inicializar el cerebro
    this.brain = new IntelligenceCore(); 
  }

  start() {
    this.wss = new WebSocketServer({ port: this.port });

    this.wss.on('listening', () => {
      Logger.info(`🐙 Octoarch Server v3.0 escuchando en el puerto ${this.port}`);
    });

    this.wss.on('connection', (ws: WebSocket) => {
      Logger.info('🔌 Cliente conectado');

      ws.on('message', async (message: string) => {
        try {
          const raw = message.toString();
          const parsed = JSON.parse(raw);
          
          // Extraer el texto del usuario según el formato
          let userText = "";
          if (parsed.type === "agent:turn" && parsed.data) {
              userText = parsed.data.message;
          } else if (parsed.message) {
              userText = parsed.message;
          } else {
              userText = raw;
          }

          Logger.info(`📩 Procesando solicitud: "${userText.substring(0, 50)}..."`);

          // 👇 AQUÍ LA MAGIA: El cerebro genera la respuesta
          const aiResponse = await this.brain.generateResponse(userText);

          // Enviamos respuesta al cliente
          ws.send(JSON.stringify({ 
            type: 'response', 
            content: aiResponse,
            done: true 
          }));

        } catch (error: any) {
          Logger.error('❌ Error procesando mensaje:', error);
          ws.send(JSON.stringify({ type: 'error', content: error.message }));
        }
      });
    });
  }

  stop() {
    if (this.wss) this.wss.close();
  }
}