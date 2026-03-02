import { FileValidator } from './file_validator';

describe('🛡️ Pruebas de Seguridad: FileValidator', () => {

    // Creamos "Bytes" simulados (Magic Numbers reales)
    // Hexadecimal para un PDF real (%PDF-)
    const realPdfBytes = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A]); 
    
    // Hexadecimal para un ejecutable Windows real (.exe / MZ)
    const realExeBytes = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);

    it('✅ Debe APROBAR un archivo PDF legítimo', async () => {
        const result = await FileValidator.validateBuffer(realPdfBytes, 'factura_real.pdf');
        
        // Nuestras aserciones (lo que esperamos que pase matemáticamente)
        expect(result.isValid).toBe(true);
        expect(result.mime).toBe('application/pdf');
    });

    it('🚨 Debe BLOQUEAR un archivo .exe malicioso disfrazado de .jpg', async () => {
        // Simulamos el ataque: un .exe pero con nombre falso
        const result = await FileValidator.validateBuffer(realExeBytes, 'virus_disfrazado.jpg');
        
        // Esperamos que el escudo lo detecte y lo rechace
        expect(result.isValid).toBe(false);
        expect(result.mime).not.toBe('image/jpeg'); // Confirmamos que descubrió que NO es una imagen
    });

    it('⚠️ Debe BLOQUEAR un archivo de texto plano o corrupto', async () => {
        const textBuffer = Buffer.from("Hola, soy un texto sin magic numbers");
        const result = await FileValidator.validateBuffer(textBuffer, 'documento.txt');
        
        expect(result.isValid).toBe(false);
    });

});