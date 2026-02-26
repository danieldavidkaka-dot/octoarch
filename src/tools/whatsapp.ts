import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import fs from 'fs'; // 📁 Importamos File System
import path from 'path'; // 🗺️ Importamos Path para las rutas
import { Logger } from '../utils/logger';
import { IntelligenceCore, getBrain } from '../core/llm'; 

export class WhatsAppService {
    private static client: Client;
    private static isReady: boolean = false;
    private static brain: IntelligenceCore; 

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
        'seo': 'SEO_AUDIT',
        'invodex': 'INVODEX',
        'factura': 'INVODEX'
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
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage', 
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--disable-gpu' 
                ]
            }
        });

        this.client.on('qr', (qr: string) => {
            Logger.info("📱 ¡NUEVO QR! Escanea este RÁPIDO con tu celular:");
            qrcode.generate(qr, { small: true });
        });

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

        this.client.on('message_create', async (msg: Message) => {
            if (msg.isStatus || (msg.type !== 'chat' && msg.type !== 'image') || !msg.body) return;

            if (!msg.fromMe) {
                return; // Solo responde a tus propios mensajes
            }

            if (msg.body === '!ping') {
                await msg.reply('🐙 Octoarch v4.0 Online, Ready & Seeing.');
                return;
            }

            if (msg.body.toLowerCase().startsWith('octo ')) {
                try {
                    const rawQuery = msg.body.substring(5).trim();
                    const firstWord = rawQuery.split(' ')[0].toLowerCase();
                    
                    let forcedIntent: string | null = null;
                    let finalQuery = rawQuery;

                    if (this.roleMap[firstWord]) {
                        forcedIntent = this.roleMap[firstWord];
    finalQuery = rawQuery.substring(firstWord.length).trim();
    
    // 🛡️ CORRECCIÓN: Si solo mandó el comando (ej: "octo invodex") y una foto, le damos un texto base
    if (finalQuery === "" && msg.hasMedia) {
        finalQuery = "Por favor, analiza la imagen adjunta y extrae la información requerida.";
    }

    Logger.info(`🔎 [WhatsApp] Modo detectado: ${forcedIntent}`);
} else {
                        Logger.info(`🔎 [WhatsApp] Modo detectado: AUTO (Sin restricciones)`);
                    }

                    await msg.react('🧠');

                    let imageBase64: string | null = null;

                    if (msg.hasMedia) {
                        Logger.info("📥 Descargando imagen adjunta desde WhatsApp...");
                        const media = await msg.downloadMedia();
                        
                        if (media && media.mimetype.startsWith('image/')) {
                            imageBase64 = `data:${media.mimetype};base64,${media.data}`;
                            Logger.info(`📸 Imagen procesada correctamente. Tipo: ${media.mimetype}`);
                        } else {
                            Logger.warn("⚠️ El archivo adjunto no es una imagen soportada.");
                        }
                    }

                    const aiResponse = await this.brain.generateResponse(msg.from, finalQuery, forcedIntent, imageBase64);

                    // 💾 LÓGICA DE GUARDADO EN CARPETA SEPARADA PARA INVODEX
                    if (forcedIntent === 'INVODEX') {
                        try {
                            const waOutputDir = path.join(process.cwd(), 'workspace', 'invodex_wa');
                            
                            // Crear la carpeta si no existe
                            if (!fs.existsSync(waOutputDir)) {
                                fs.mkdirSync(waOutputDir, { recursive: true });
                            }

                            // Limpiar el número de teléfono para usarlo en el nombre de archivo (ej: 58414..._1708999.json)
                            const safePhone = msg.from.replace(/[^a-zA-Z0-9]/g, '_');
                            const timestamp = Date.now();
                            const fileName = `factura_${safePhone}_${timestamp}.json`;
                            const filePath = path.join(waOutputDir, fileName);

                            // Extraer el JSON limpio (por si Gemini escupe texto alrededor de los backticks ```json ... ```)
                            let jsonContent = aiResponse;
                            const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                            if (jsonMatch) {
                                jsonContent = jsonMatch[1].trim();
                            }

                            // Guardar en disco
                            fs.writeFileSync(filePath, jsonContent, 'utf-8');
                            Logger.info(`💾 [InvoDex WA] JSON de factura guardado exitosamente en: ${filePath}`);
                        } catch (fsError) {
                            Logger.error("❌ Error guardando el JSON en workspace:", fsError);
                        }
                    }

                    await msg.react('✅');
                    await msg.reply(aiResponse);

                } catch (error) {
                    Logger.error("❌ Error en WhatsApp AI:", error);
                    await msg.react('❌');
                    await msg.reply("⚠️ Tuve un fallo crítico procesando la instrucción o imagen.");
                }
            }
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