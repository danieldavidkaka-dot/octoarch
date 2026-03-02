import { google } from 'googleapis';
import fs from 'fs';
import readline from 'readline';

// 1. Leer las credenciales que descargaste
const CREDENTIALS_PATH = './workspace/credentials.json';
const TOKEN_PATH = './workspace/token.json';

const credentialsRaw = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
const credentials = JSON.parse(credentialsRaw);

// Las apps de escritorio usan la llave "installed"
const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// 2. Generar la URL de autorización
const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline', // CRÍTICO: Esto nos da el Refresh Token infinito
    prompt: 'consent',      // CRÍTICO: Fuerza a Google a mostrarnos la pantalla de permisos
    scope: ['https://mail.google.com/'], // Permiso total sobre Gmail
});

console.log('====================================================');
console.log('🔐 AUTORIZACIÓN OAUTH2 PARA OCTOARCH');
console.log('====================================================\n');
console.log('1. Abre esta URL en tu navegador web:');
console.log('\n', authUrl, '\n');
console.log('2. Inicia sesión con el correo de prueba que configuraste.');
console.log('3. Google dirá "Google hasn\'t verified this app". Haz clic en "Advanced" y luego en "Go to OctoArch (unsafe)".');
console.log('4. Concede los permisos.');
console.log('5. Al final, serás redirigido a una página que probablemente diga "No se puede acceder a este sitio" (localhost).');
console.log('6. Copia TODA la URL de esa página rota y pégala aquí abajo.\n');

// 3. Capturar el código desde la consola
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('👉 Pega la URL completa aquí: ', async (url) => {
    try {
        // Extraemos el código de la URL
        const codeMatch = url.match(/code=([^&]+)/);
        if (!codeMatch) throw new Error("No se encontró el 'code' en la URL.");
        
        const code = decodeURIComponent(codeMatch[1]);
        
        // 4. Intercambiar el código por los tokens
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        
        // 5. Guardar el token de por vida
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
        console.log('\n✅ ¡ÉXITO! Tu token infinito ha sido guardado en:', TOKEN_PATH);
        console.log('Ya puedes borrar este script (get_token.ts). OctoArch ya tiene acceso a la matriz.');
    } catch (error) {
        console.error('❌ Error obteniendo el token:', error);
    } finally {
        rl.close();
    }
});