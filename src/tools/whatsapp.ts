import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { Logger } from '../utils/logger';
import { IntelligenceCore, getBrain } from '../core/llm';
import { WhatsAppProcessor } from './whatsapp.processor'; // 👈 Nuevo import

export class WhatsAppService {
    private static client: Client;
    private static isReady: boolean = false;
    private static brain: IntelligenceCore;

    // 🗺️ DICCIONARIO DE ROLES
    private static roleMap: Record<string, string> = {
        'chat': 'CHAT', 'seguro': 'CHAT', 'dev': 'DEV', 'root': 'DEV',
        'research': 'RESEARCH', 'web': 'RESEARCH', 'cfo': 'CFO',
        'finanzas': 'CFO', 'cmo': 'CMO', 'marketing': 'CMO',
        'invodex': 'INVODEX', 'factura': 'INVODEX'
    };

    static async initialize() {
        Logger.info("📱 Iniciando servicio de WhatsApp (Modo Robusto con Roles, Visión y Auto-Guardado)...");
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
                    '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas', '--no-first-run', '--disable-gpu'
                ]
            }
        });

        // 📡 Event listeners
        this.client.on('qr', (qr: string) => {
            Logger.info("📱 ¡NUEVO QR! Escanea este RÁPIDO con tu celular:");
            qrcode.generate(qr, { small: true });
        });

        this.client.on('authenticated', () => Logger.info("🔑 ¡Autenticado correctamente!"));
        this.client.on('auth_failure', (msg) => Logger.error("❌ Falló autenticación. Borra 'auth_wa' y reinicia.", msg));
        this.client.on('ready', () => {
            Logger.info("✅ ¡CONECTADO! Octoarch v5.0 ya tiene WhatsApp y está pensando.");
            this.isReady = true;
        });

        // 🎯 Delegar procesamiento al módulo externo
        this.client.on('message_create', async (msg: Message) => {
            await WhatsAppProcessor.handle(msg, this.brain, this.roleMap);
        });

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