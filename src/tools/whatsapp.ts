import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { Logger } from '../utils/logger';
import { IntelligenceCore, getBrain } from '../core/llm'; // 🧠 Importamos el Cerebro global

export class WhatsAppService {
    private static client: Client;
    private static isReady: boolean = false;
    private static brain: IntelligenceCore; // 🧠 Instancia del cerebro

    // 🗺️ DICCIONARIO DE ROLES (Aliases para WhatsApp)
    private static roleMap: Record<string, string> = {
        'chat': 'CHAT',
        'seguro': 'CHAT',
        'dev': 'DEV',
        'root': 'DEV',
        'research': 'RESEARCHER',
        'web': 'RESEARCHER',
        'cfo': 'CFO_ADVISOR',
        'finanzas': 'CFO_ADVISOR',
        'cmo': 'MARKETING_GURU',
        'legal': 'LEGAL_DRAFT',
        'copy': 'COPYWRITER',
        'seo': 'SEO_AUDIT'
    };

    static async initialize() {
        Logger.info("📱 Iniciando servicio de WhatsApp (Modo Robusto con Roles)...");

        // Inicializamos el cerebro para WhatsApp
        this.brain = getBrain();

        this.client = new Client({
            restartOnAuthFail: true, 
            authStrategy: new LocalAuth({
                clientId: "octoarch_v4_session", 
                dataPath: 'workspace/auth_wa'
            }),
            webVersionCache: {
                type: 'remote',
                remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
            },
            puppeteer: {
                headless: true,
                timeout: 60000, 
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage', 
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--disable-gpu' 
                ]
            }
        });

        // 1. GENERACIÓN DE QR
        this.client.on('qr', (qr: string) => {
            Logger.info("📱 ¡NUEVO QR! Escanea este RÁPIDO con tu celular:");
            qrcode.generate(qr, { small: true });
        });

        // 2. ESTADOS DE CONEXIÓN
        this.client.on('authenticated', () => {
            Logger.info("🔑 ¡Autenticado correctamente! Cargando chats...");
        });

        this.client.on('auth_failure', (msg) => {
            Logger.error("❌ Falló la autenticación. Borra la carpeta 'auth_wa' y reinicia.", msg);
        });

        this.client.on('ready', () => {
            Logger.info("✅ ¡CONECTADO! Octoarch v4.0 ya tiene WhatsApp y está pensando.");
            this.isReady = true;
        });

        // 3. ESCUCHA DE MENSAJES
        this.client.on('message_create', async (msg: Message) => {
            // Ignorar estados o mensajes vacíos
            if (msg.isStatus || msg.type !== 'chat' || !msg.body) return;

            // 🔒 BLOQUEO DE SEGURIDAD (OWNER ONLY)
            // Si el mensaje NO fue escrito por ti (desde tu cuenta), se ignora de inmediato.
            if (!msg.fromMe) {
                return;
            }

            // Si es un comando simple de prueba, responde rápido y sale
            if (msg.body === '!ping') {
                await msg.reply('🐙 Octoarch v4.0 Online & Ready.');
                return;
            }

            // 🧠 CONEXIÓN AL CEREBRO DE GEMINI Y ENRUTADOR DE ROLES
            if (msg.body.toLowerCase().startsWith('octo ')) {
                try {
                    // Quitamos la palabra "octo " del inicio
                    const rawQuery = msg.body.substring(5).trim();
                    
                    // Extraemos la primera palabra para ver si es un comando de ROL
                    const firstWord = rawQuery.split(' ')[0].toLowerCase();
                    
                    let forcedIntent: string | null = null;
                    let finalQuery = rawQuery;

                    // Verificamos si la primera palabra coincide con nuestro diccionario de roles
                    if (this.roleMap[firstWord]) {
                        forcedIntent = this.roleMap[firstWord];
                        // Le quitamos el comando de rol a la oración para no confundir a la IA
                        finalQuery = rawQuery.substring(firstWord.length).trim();
                        Logger.info(`🔎 [WhatsApp] Modo detectado: ${forcedIntent}`);
                    } else {
                        Logger.info(`🔎 [WhatsApp] Modo detectado: AUTO (Sin restricciones)`);
                    }

                    // Reaccionamos para indicar que empezamos a procesar
                    await msg.react('🧠');

                    // 🚀 AQUÍ ESTÁ EL CAMBIO: Pasamos msg.from (el número de teléfono) como sessionId
                    const aiResponse = await this.brain.generateResponse(msg.from, finalQuery, forcedIntent);

                    // Reaccionamos con un check y enviamos la respuesta
                    await msg.react('✅');
                    await msg.reply(aiResponse);

                } catch (error) {
                    Logger.error("❌ Error en WhatsApp AI:", error);
                    await msg.react('❌');
                    await msg.reply("⚠️ Tuve un fallo crítico procesando la instrucción.");
                }
            }
        });

        // 4. INICIALIZACIÓN
        try {
            await this.client.initialize();
        } catch (error) {
            Logger.error("❌ Error fatal iniciando WhatsApp", error);
        }
    }

    static async sendMessage(to: string, message: string) {
        if (!this.isReady) {
            Logger.error("⚠️ WhatsApp no está listo para enviar mensajes.");
            return;
        }
        try {
            await this.client.sendMessage(to, message);
            Logger.info(`📤 Mensaje automático enviado a ${to}`);
        } catch (error) {
            Logger.error("❌ Error enviando mensaje automático", error);
        }
    }
}