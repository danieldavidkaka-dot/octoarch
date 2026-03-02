import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import fs from 'fs'; 
import path from 'path'; 
import { Logger } from '../utils/logger';
import { IntelligenceCore, getBrain } from '../core/llm'; 
import { FileValidator } from '../utils/file_validator'; // 🛡️ ESCUDO IMPORTADO
import { SkillLoader } from './skill_loader'; // 🎮 NUEVO: Importamos el cargador de Skills

export class WhatsAppService {
    private static client: Client;
    private static isReady: boolean = false;
    private static brain: IntelligenceCore; 

    // 🗺️ DICCIONARIO DE ROLES (Sincronizado con PromptManager)
    private static roleMap: Record<string, string> = {
        'chat': 'CHAT',
        'seguro': 'CHAT',
        'dev': 'DEV',
        'root': 'DEV',
        'research': 'RESEARCH',
        'web': 'RESEARCH',
        'cfo': 'CFO',
        'finanzas': 'CFO',
        'cmo': 'CMO',
        'marketing': 'CMO',
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
            Logger.info("✅ ¡CONECTADO! Octoarch v4.2 ya tiene WhatsApp y está pensando.");
            this.isReady = true;
        });

        this.client.on('message_create', async (msg: Message) => {
            // 1. Evitar estados y tipos no soportados
            if (msg.isStatus || (msg.type !== 'chat' && msg.type !== 'image')) return;
            if (!msg.fromMe) return; // Solo responde a tus propios mensajes

            // 2. Permitir pasar si tiene texto o si trae una imagen
            if (!msg.body && !msg.hasMedia) return;

            if (msg.body === '!ping') {
                await msg.reply('🐙 OctoArch v4.2 Online, Secure & Seeing.');
                return;
            }

            const bodyStr = msg.body || "";
            const isCommand = bodyStr.toLowerCase().startsWith('octo ');
            const isDirectImage = !isCommand && msg.hasMedia; // Flujo PYME rápido

            // 3. Solo operamos si es un comando explícito o una foto enviada directamente
            if (isCommand || isDirectImage) {
                try {
                    let forcedIntent: string | null = null;
                    let finalQuery = bodyStr;

                    if (isCommand) {
                        const rawQuery = bodyStr.substring(5).trim();
                        const words = rawQuery.split(' ');
                        const firstWord = words[0].toLowerCase();
                        
                        // 🎮 NUEVO FLUJO: Bypass de Skills Cero-Latencia
                        if (firstWord === 'skill' && words.length > 1) {
                            const skillName = words[1];
                            const remainingQuery = words.slice(2).join(' ');
                            
                            forcedIntent = 'DEV'; // Le damos poder de DEV para que pueda crear los archivos
                            Logger.info(`🎮 [WhatsApp] Bypass de Skill detectado: Inyectando '${skillName}' directamente en RAM.`);
                            
                            // Leemos el disco duro SIN gastar tokens de IA
                            const skillContent = await SkillLoader.load(skillName);
                            
                            // Fusionamos la instrucción del usuario con el manual completo
                            finalQuery = `${remainingQuery}\n\n[INYECCIÓN DE SISTEMA]:\n${skillContent}`;
                            
                        } 
                        // Flujo normal de C-Suite (octo cfo, octo cmo, etc)
                        else if (this.roleMap[firstWord]) {
                            forcedIntent = this.roleMap[firstWord];
                            finalQuery = rawQuery.substring(firstWord.length).trim();
                        } 
                        // Flujo normal sin prefijo
                        else {
                            finalQuery = rawQuery;
                            Logger.info(`🔎 [WhatsApp] Modo detectado: AUTO (Sin restricciones)`);
                        }
                    } else if (isDirectImage) {
                        forcedIntent = 'INVODEX';
                        Logger.info(`🔎 [WhatsApp] Imagen sin comando. Auto-asignando modo: INVODEX`);
                    }

                    if (finalQuery.trim() === "" && msg.hasMedia) {
                        finalQuery = "Por favor, analiza la imagen adjunta y extrae la información requerida.";
                    }

                    if (forcedIntent) Logger.info(`🔎 [WhatsApp] Modo activo: ${forcedIntent}`);

                    await msg.react('🧠');

                    let imageBase64: string | null = null;

                    if (msg.hasMedia) {
                        Logger.info("📥 Descargando imagen adjunta desde WhatsApp...");
                        const media = await msg.downloadMedia();
                        
                        if (media && media.data) {
                            try {
                                // 🛡️ ANÁLISIS FORENSE CENTRALIZADO
                                const buffer = Buffer.from(media.data, 'base64');
                                const validation = await FileValidator.validateBuffer(buffer, media.filename || 'whatsapp_media');

                                // Para el flujo PYME de WhatsApp verificamos que sea válido y que siga siendo una imagen
                                if (validation.isValid && validation.mime.startsWith('image/')) {
                                    imageBase64 = `data:${validation.mime};base64,${media.data}`;
                                    Logger.info(`📸 Imagen verificada a nivel de bytes. Tipo real: ${validation.mime}`);
                                } else {
                                    Logger.warn(`🛡️ [ALERTA DE SEGURIDAD] Archivo bloqueado. Tipo reportado: ${media.mimetype}, Tipo real: ${validation.mime}`);
                                    await msg.reply("🛡️ Archivo rechazado. Nuestro escáner de seguridad determinó que el archivo no es una imagen válida o permitida.");
                                    return; // 🚫 Aborta la ejecución
                                }
                            } catch (secError) {
                                Logger.error("❌ Error verificando el archivo adjunto:", secError);
                                return;
                            }
                        }
                    }

                    const aiResponse = await this.brain.generateResponse(msg.from, finalQuery, forcedIntent, imageBase64);

                    // 💾 LÓGICA DE GUARDADO EN CARPETA SEPARADA PARA INVODEX
                    if (forcedIntent === 'INVODEX') {
                        try {
                            const waOutputDir = path.join(process.cwd(), 'workspace', 'invodex_wa');
                            if (!fs.existsSync(waOutputDir)) fs.mkdirSync(waOutputDir, { recursive: true });

                            const safePhone = msg.from.replace(/[^a-zA-Z0-9]/g, '_');
                            const timestamp = Date.now();
                            const fileName = `factura_${safePhone}_${timestamp}.json`;
                            const filePath = path.join(waOutputDir, fileName);

                            let jsonContent = aiResponse;
                            const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                            if (jsonMatch) jsonContent = jsonMatch[1].trim();

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