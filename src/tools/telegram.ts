import TelegramBot from 'node-telegram-bot-api';
import { env } from '../config/env';
import { Logger } from '../utils/logger';
import { IntelligenceCore, getBrain } from '../core/llm';

export class TelegramService {
    private static bot: TelegramBot | null = null;
    private static brain: IntelligenceCore;
    private static isReady: boolean = false;

    // 🛡️ SEGURIDAD: Coloca aquí tu ID de Telegram para que nadie más pueda usar tu bot.
    // Si lo dejas vacío, le responderá a cualquiera (no recomendado en producción).
    private static ALLOWED_USERS: number[] = []; 

    static async initialize() {
        if (!env.TELEGRAM_BOT_TOKEN) {
            Logger.warn("⚠️ TELEGRAM_BOT_TOKEN no encontrado en .env. El servicio de Telegram estará inactivo.");
            return;
        }

        Logger.info("✈️ Iniciando servicio de Telegram (Modo Robusto & Omnicanal)...");
        this.brain = getBrain();

        try {
            // Inicializamos el bot en modo "polling" (escuchando activamente)
            this.bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, { polling: true });

            this.bot.on('polling_error', (error) => {
                Logger.error("❌ Error de red en Telegram:", error.message);
            });

            this.bot.on('message', async (msg) => {
                const chatId = msg.chat.id;
                const userId = msg.from?.id;
                const text = msg.text || "";

                // 1. Filtro de Seguridad (Opcional pero recomendado)
                if (this.ALLOWED_USERS.length > 0 && userId && !this.ALLOWED_USERS.includes(userId)) {
                    Logger.warn(`🛡️ Intento de acceso no autorizado en Telegram del usuario ID: ${userId}`);
                    return;
                }

                // Ignoramos mensajes sin texto por ahora (imágenes/audios se pueden agregar luego)
                if (!text) return;

                if (text === '/start' || text === '!ping') {
                    await this.bot?.sendMessage(chatId, '🐙 OctoArch v5.0 Online, Secure & Ready en Telegram.');
                    return;
                }

                Logger.info(`✈️ [Telegram] Mensaje recibido de ${msg.from?.first_name || 'Usuario'}: ${text.substring(0, 50)}...`);

                // 2. Le indicamos a la IA visualmente que estamos en la terminal
                this.bot?.sendChatAction(chatId, 'typing').catch(() => {});

                try {
                    // 3. Conectamos al cerebro central (Usamos el ID de Telegram como sessionId)
                    // Prefijamos con 'TG_' para no mezclar memorias a corto plazo con WhatsApp si hablan a la vez
                    const sessionId = `TG_${chatId}`;
                    const aiResponse = await this.brain.generateResponse(sessionId, text, 'AUTO', null);

                    await this.bot?.sendMessage(chatId, aiResponse, { parse_mode: 'Markdown' });

                } catch (error: any) {
                    Logger.error("❌ Error en Telegram AI:", error);
                    await this.bot?.sendMessage(chatId, "⚠️ Tuve un fallo crítico procesando la instrucción en Telegram.").catch(() => {});
                }
            });

            this.isReady = true;
            Logger.info("✅ ¡CONECTADO! OctoArch v5.0 ya tiene Telegram y está escuchando.");

        } catch (error) {
            Logger.error("❌ Error fatal iniciando Telegram", error);
        }
    }

    static async sendMessage(chatId: string | number, message: string) {
        if (!this.isReady || !this.bot) {
            Logger.error("⚠️ Telegram no está listo para enviar mensajes.");
            return;
        }
        try {
            await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
            Logger.info(`📤 Mensaje automático enviado por Telegram a ${chatId}`);
        } catch (error) {
            Logger.error("❌ Error enviando mensaje por Telegram", error);
        }
    }
}