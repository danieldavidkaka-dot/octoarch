import { FileValidator } from './file_validator';

describe('🛡️ Pruebas de Seguridad: FileValidator', () => {

    // Creamos "Bytes" simulados (Magic Numbers reales)
    
    // Fix Bug Silencioso #1: Header PDF mínimo confiable (26 bytes)
    const realPdfBytes = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type', 'utf8');
    
    // Hexadecimal para un ejecutable Windows real (.exe / MZ)
    const realExeBytes = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);

    // NUEVO: Imagen JPEG válida (Magic Numbers FF D8 FF E0) - Caso PYME
    const realJpegBytes = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]);

    it('✅ Debe APROBAR un archivo PDF legítimo', async () => {
        const result = await FileValidator.validateBuffer(realPdfBytes, 'factura_real.pdf');
        
        // Nuestras aserciones (lo que esperamos que pase matemáticamente)
        expect(result.isValid).toBe(true);
        expect(result.mime).toBe('application/pdf');
    });

    it('✅ Debe APROBAR una imagen JPEG legítima', async () => {
        const result = await FileValidator.validateBuffer(realJpegBytes, 'foto_factura.jpg');
        
        expect(result.isValid).toBe(true);
        expect(result.mime).toBe('image/jpeg');
    });

    it('🚨 Debe BLOQUEAR un archivo .exe malicioso disfrazado de .jpg', async () => {
        // Simulamos el ataque: un .exe pero con nombre falso
        const result = await FileValidator.validateBuffer(realExeBytes, 'virus_disfrazado.jpg');
        
        // Esperamos que el escudo lo detecte y lo rechace
        expect(result.isValid).toBe(false);
        
        // Fix Bug Silencioso #2: Aserción estricta de la identidad del malware
        expect(result.mime).toBe('application/x-msdownload'); 
    });

    it('⚠️ Debe BLOQUEAR un archivo de texto plano o corrupto', async () => {
        const textBuffer = Buffer.from("Hola, soy un texto sin magic numbers");
        const result = await FileValidator.validateBuffer(textBuffer, 'documento.txt');
        
        expect(result.isValid).toBe(false);
    });

});