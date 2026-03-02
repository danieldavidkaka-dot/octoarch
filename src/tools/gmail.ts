import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { Logger } from '../utils/logger';
import { FileValidator } from '../utils/file_validator'; // 🛡️ ESCUDO IMPORTADO

export class GmailTool {
    private static authClient: any = null;

    // 🔐 1. Inicializa el cliente
    private static async getAuth() {
        if (this.authClient) return this.authClient;

        const credentialsPath = path.resolve(process.cwd(), 'workspace/credentials.json');
        const tokenPath = path.resolve(process.cwd(), 'workspace/token.json');

        if (!fs.existsSync(credentialsPath) || !fs.existsSync(tokenPath)) {
            throw new Error('❌ Faltan las credenciales OAuth2 de Gmail en el workspace.');
        }

        const creds = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
        const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
        
        const { client_secret, client_id, redirect_uris } = creds.installed || creds.web;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        oAuth2Client.setCredentials(tokens);

        this.authClient = oAuth2Client;
        return oAuth2Client;
    }

    // 📥 2. Lee los correos y DESCARGA los adjuntos
    static async fetchUnreadInvoices(): Promise<string> {
        try {
            Logger.info('📧 Conectando a la matriz de Gmail para descargar facturas...');
            const auth = await this.getAuth();
            const gmail = google.gmail({ version: 'v1', auth });

            const res = await gmail.users.messages.list({
                userId: 'me',
                q: 'is:unread has:attachment',
                maxResults: 3 
            });

            const messages = res.data.messages;
            if (!messages || messages.length === 0) {
                return "📭 No hay correos nuevos con facturas pendientes.";
            }

            let report = `📬 Se encontraron ${messages.length} correos nuevos con adjuntos:\n\n`;

            // 📁 Preparamos la carpeta destino
            const downloadFolder = path.resolve(process.cwd(), 'workspace/factura_correos');
            if (!fs.existsSync(downloadFolder)) {
                fs.mkdirSync(downloadFolder, { recursive: true });
            }

            for (const msg of messages) {
                const msgData = await gmail.users.messages.get({ userId: 'me', id: msg.id! });
                const payload = msgData.data.payload;
                
                const headers = payload?.headers || [];
                const subject = headers.find(h => h.name === 'Subject')?.value || 'Sin Asunto';
                const from = headers.find(h => h.name === 'From')?.value || 'Desconocido';
                
                report += `--- CORREO ---\nDe: ${from}\nAsunto: ${subject}\nID Interno: ${msg.id}\n`;

                const parts = payload?.parts || [];
                const attachments = parts.filter(part => part.filename && part.body?.attachmentId);

                if (attachments.length > 0) {
                    for (const att of attachments) {
                        // 📥 DESCARGA DEL ARCHIVO MÁGICO
                        const attachData = await gmail.users.messages.attachments.get({
                            userId: 'me',
                            messageId: msg.id!,
                            id: att.body!.attachmentId!
                        });

                        const buffer = Buffer.from(attachData.data.data!, 'base64');

                        // 🛡️ VALIDACIÓN FORENSE DE BYTES
                        const validation = await FileValidator.validateBuffer(buffer, att.filename!);

                        if (!validation.isValid) {
                            report += `🚨 [BLOQUEADO] El archivo '${att.filename}' no pasó los controles de seguridad (Tipo real: ${validation.mime}).\n`;
                            continue; // Ignora el archivo y no lo guarda
                        }

                        // Si pasó el filtro, lo guardamos
                        const filePath = path.join(downloadFolder, att.filename!);
                        fs.writeFileSync(filePath, buffer);
                        
                        report += `✅ Adjunto descargado y guardado en: workspace/factura_correos/${att.filename}\n`;
                    }
                } else {
                    report += `⚠️ No se encontraron archivos adjuntos compatibles.\n`;
                }

                // 🛡️ MARCADO COMO LEÍDO
                await gmail.users.messages.modify({
                    userId: 'me',
                    id: msg.id!,
                    requestBody: { removeLabelIds: ['UNREAD'] }
                });
            }

            return report;
        } catch (error: any) {
            Logger.error('❌ Error leyendo Gmail:', error);
            return `❌ Fallo al conectar con Gmail: ${error.message}`;
        }
    }
}