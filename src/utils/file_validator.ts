import { fromBuffer } from 'file-type'; // 🛡️ Nombre correcto para la versión 16.5.4
import { Logger } from './logger';

export class FileValidator {
    // 🛡️ LISTA BLANCA (AllowList): Solo permitimos formatos de facturas e imágenes
    private static readonly ALLOWED_MIMES = new Set([
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp'
    ]);

    /**
     * Analiza los bytes crudos de un archivo para descubrir su verdadera identidad,
     * ignorando por completo la extensión que el usuario le haya puesto.
     */
    static async validateBuffer(buffer: Buffer, originalName: string): Promise<{ isValid: boolean, mime: string, ext: string }> {
        try {
            // fromBuffer lee la cabecera hexadecimal (Magic Numbers) del buffer
            const typeInfo = await fromBuffer(buffer);

            // Si no tiene firma reconocible, es un archivo de texto plano, un script raro o está corrupto
            if (!typeInfo) {
                Logger.warn(`🛡️ [FileValidator] Archivo rechazado (${originalName}): No se pudo determinar el tipo real por sus bytes.`);
                return { isValid: false, mime: 'unknown', ext: 'unknown' };
            }

            // Si la firma real del archivo no está en nuestra Lista Blanca, lo bloqueamos
            if (!this.ALLOWED_MIMES.has(typeInfo.mime)) {
                Logger.warn(`🚨 [FileValidator] BLOQUEO DE SEGURIDAD: Intentaron colar un archivo no permitido. Nombre falso: '${originalName}', Tipo real: '${typeInfo.mime}'`);
                return { isValid: false, mime: typeInfo.mime, ext: typeInfo.ext };
            }

            return { isValid: true, mime: typeInfo.mime, ext: typeInfo.ext };

        } catch (error: any) {
            Logger.error(`❌ [FileValidator] Error analizando los bytes de ${originalName}:`, error);
            return { isValid: false, mime: 'error', ext: 'error' };
        }
    }
}