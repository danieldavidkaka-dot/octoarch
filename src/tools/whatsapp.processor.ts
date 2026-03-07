import { Message } from 'whatsapp-web.js';
import fs from 'fs';
import path from 'path';
import { Logger } from '../utils/logger';
import { IntelligenceCore } from '../core/llm';
import { FileValidator } from '../utils/file_validator';
import { SkillLoader } from './skill_loader';

export class WhatsAppProcessor {

    /**
     * Punto de entrada para procesar mensajes de WhatsApp
     */
    static async handle(
        msg: Message,
        brain: IntelligenceCore,
        roleMap: Record<string, string>
    ) {
        // 🔒 Filtros iniciales
        // 🔒 Filtros iniciales de Seguridad Estricta
        if (msg.isStatus || (msg.type !== 'chat' && msg.type !== 'image')) return;
        
        // 🛡️ REGLA DE ORO: Solo escuchar el chat "Tú" (Message Yourself)
        if (msg.to !== msg.from) return;
        
        if (!msg.fromMe) return;
        if (!msg.body && !msg.hasMedia) return;

        // Comando de salud
        if (msg.body === '!ping') {
            await msg.reply('🐙 OctoArch v5.0 Online, Secure & Seeing.');
            return;
        }

        const bodyStr = msg.body || "";
        const isCommand = bodyStr.toLowerCase().startsWith('octo ');
        const isDirectImage = !isCommand && msg.hasMedia;

        if (isCommand || isDirectImage) {
            try {
                const { forcedIntent, finalQuery } = await this.parseCommand(bodyStr, roleMap, isCommand, isDirectImage);
                
                let query = finalQuery;
if (query.trim() === "" && msg.hasMedia) {
    // 🧠 Prompt abierto para que Gemini use su criterio visual
    query = "He recibido esta imagen. ¿Puedes decirme de qué trata o responder de forma natural según su contenido?";
}

                if (forcedIntent) Logger.info(`🔎 [WhatsApp] Modo activo: ${forcedIntent}`);
                await msg.react('🧠').catch(() => {});

                // 📸 Procesar imagen si existe
                const imageBase64 = msg.hasMedia ? await this.processImage(msg) : null;
                if (imageBase64 === null && msg.hasMedia) return; // Rechazado por seguridad

                // 🧠 Generar respuesta con IA
                const aiResponse = await brain.generateResponse(msg.from, query, forcedIntent, imageBase64);

                // 💾 Guardar JSON si es modo INVODEX
                if (forcedIntent === 'INVODEX') {
                    await this.saveInvoDexJSON(msg, aiResponse);
                }

                await msg.react('✅').catch(() => {});
                await msg.reply(aiResponse);

            } catch (error) {
                Logger.error("❌ Error en WhatsApp AI:", error);
                await msg.react('❌').catch(() => {});
                await msg.reply("⚠️ Tuve un fallo crítico procesando la instrucción o imagen.");
            }
        }
    }

    /**
     * Parsea el comando y determina el intent y query final
     */
    private static async parseCommand(
        bodyStr: string,
        roleMap: Record<string, string>,
        isCommand: boolean,
        isDirectImage: boolean
    ) {
        let forcedIntent: string | null = null;
        let finalQuery = bodyStr;

        if (isCommand) {
            const rawQuery = bodyStr.substring(5).trim();
            const words = rawQuery.split(' ');
            const firstWord = words[0].toLowerCase();
            
            // 🎮 Flujo Skill Bypass
            if (firstWord === 'skill' && words.length > 1) {
                const skillName = words[1];
                const remainingQuery = words.slice(2).join(' ');
                forcedIntent = 'AUTO';
                Logger.info(`🎮 [WhatsApp] Bypass de Skill: '${skillName}'`);
                
                const skillContent = await SkillLoader.load(skillName);
                finalQuery = `${remainingQuery}\n\n[INYECCIÓN DE SISTEMA]:\n${skillContent}`;
            }
            // 🎩 Flujo C-Suite (octo cfo, octo cmo, etc)
            else if (roleMap[firstWord]) {
                forcedIntent = roleMap[firstWord];
                finalQuery = rawQuery.substring(firstWord.length).trim();
            }
            // 🔄 Flujo AUTO sin prefijo
            else {
                finalQuery = rawQuery;
                Logger.info(`🔎 [WhatsApp] Modo detectado: AUTO`);
            }
        }
        // 🖼️ Imagen directa sin comando → INVODEX
        // 🖼️ Imagen directa sin comando → Modo AUTO (Criterio de IA)
else if (isDirectImage) {
    forcedIntent = 'AUTO';
    Logger.info(`🔎 [WhatsApp] Imagen directa → Modo: AUTO (Visión General)`);
}

        return { forcedIntent, finalQuery };
    }

    /**
     * Procesa y valida la imagen adjunta con FileValidator
     */
    private static async processImage(msg: Message): Promise<string | null> {
        if (!msg.hasMedia) return null;
        
        Logger.info("📥 Descargando imagen adjunta desde WhatsApp...");
        const media = await msg.downloadMedia();
        if (!media?.data) return null;

        try {
            const buffer = Buffer.from(media.data, 'base64');
            const validation = await FileValidator.validateBuffer(buffer, media.filename || 'whatsapp_media');

            if (validation.isValid && validation.mime.startsWith('image/')) {
                Logger.info(`📸 Imagen verificada a nivel de bytes. Tipo real: ${validation.mime}`);
                return `data:${validation.mime};base64,${media.data}`;
            } else {
                Logger.warn(`🛡️ [ALERTA DE SEGURIDAD] Archivo bloqueado. Reportado: ${media.mimetype}, Real: ${validation.mime}`);
                await msg.reply("🛡️ Archivo rechazado. Nuestro escáner de seguridad determinó que no es una imagen válida.");
                return null;
            }
        } catch (secError) {
            Logger.error("❌ Error verificando el archivo adjunto:", secError);
            return null;
        }
    }

    /**
     * Guarda el JSON de factura en workspace/invodex_wa/
     */
    private static async saveInvoDexJSON(msg: Message, aiResponse: string) {
        try {
            const waOutputDir = path.join(process.cwd(), 'workspace', 'invodex_wa');
            if (!fs.existsSync(waOutputDir)) {
                fs.mkdirSync(waOutputDir, { recursive: true });
            }

            const safePhone = msg.from.replace(/[^a-zA-Z0-9]/g, '_');
            const timestamp = Date.now();
            const fileName = `factura_${safePhone}_${timestamp}.json`;
            const filePath = path.join(waOutputDir, fileName);

            // Extraer JSON si viene en code block
            let jsonContent = aiResponse;
            const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                jsonContent = jsonMatch[1].trim();
            }

            fs.writeFileSync(filePath, jsonContent, 'utf-8');
            Logger.info(`💾 [InvoDex WA] JSON guardado en: ${filePath}`);
        } catch (fsError) {
            Logger.error("❌ Error guardando el JSON en workspace:", fsError);
        }
    }
}