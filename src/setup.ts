import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { google } from 'googleapis';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
};

const colors = {
    reset: "\x1b[0m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    magenta: "\x1b[35m"
};

async function main() {
    console.log(`\n${colors.cyan}====================================================`);
    console.log(`🐙 OCTOARCH SETUP WIZARD`);
    console.log(`====================================================${colors.reset}\n`);

    const workspacePath = path.resolve(process.cwd(), 'workspace');
    if (!fs.existsSync(workspacePath)) {
        fs.mkdirSync(workspacePath, { recursive: true });
    }

    console.log(`${colors.yellow}>> Verificando entorno virtual (.env)...${colors.reset}`);
    const envPath = path.resolve(process.cwd(), '.env');
    
    if (!fs.existsSync(envPath)) {
        console.log(`${colors.magenta}No se encontró configuración. Vamos a crearla.${colors.reset}`);
        const geminiKey = await question('🔑 Pega tu GEMINI_API_KEY: ');
        const telegramToken = await question('✈️  (Opcional) Pega tu TELEGRAM_BOT_TOKEN (Enter para omitir): ');
        
        let envContent = `PORT=18789\nNODE_ENV=development\nGEMINI_API_KEY=${geminiKey}\n`;
        if (telegramToken) envContent += `TELEGRAM_BOT_TOKEN=${telegramToken}\n`;

        fs.writeFileSync(envPath, envContent);
        console.log(`${colors.green}✅ Archivo .env creado exitosamente.${colors.reset}\n`);
    } else {
        console.log(`${colors.green}✅ Archivo .env detectado.${colors.reset}\n`);
    }

    console.log(`${colors.yellow}>> Verificando conexiones de Gmail...${colors.reset}`);
    const credentialsPath = path.join(workspacePath, 'credentials.json');
    const tokenPath = path.join(workspacePath, 'token.json');

    if (!fs.existsSync(credentialsPath)) {
        console.log(`${colors.red}❌ Faltan las credenciales de Google (credentials.json).${colors.reset}`);
        console.log(`Para activar la lectura automática de correos, descarga el archivo desde Google Cloud y guárdalo en: ${credentialsPath}`);
        console.log(`Puedes continuar sin esto, pero el CronJob de Gmail mostrará advertencias.\n`);
    } else if (!fs.existsSync(tokenPath)) {
        console.log(`${colors.magenta}Iniciando emparejamiento con Google Cloud...${colors.reset}`);
        try {
            const credentialsRaw = fs.readFileSync(credentialsPath, 'utf-8');
            const credentials = JSON.parse(credentialsRaw);
            const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
            const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                prompt: 'consent',
                scope: ['https://mail.google.com/'],
            });

            console.log('\n1️⃣  Abre esta URL en tu navegador web:');
            console.log(`${colors.cyan}${authUrl}${colors.reset}\n`);
            console.log('2️⃣  Inicia sesión y concede los permisos avanzados.');
            console.log('3️⃣  Serás redirigido a una página rota (localhost). Copia TODA la URL de esa página.\n');

            const url = await question('👉 Pega la URL completa aquí: ');
            
            const codeMatch = url.match(/code=([^&]+)/);
            if (!codeMatch) throw new Error("No se encontró el parámetro 'code' en la URL.");
            
            const code = decodeURIComponent(codeMatch[1]);
            const { tokens } = await oAuth2Client.getToken(code);
            
            fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
            console.log(`${colors.green}\n✅ ¡ÉXITO! Token infinito guardado. Gmail está conectado.${colors.reset}\n`);
        } catch (error) {
            console.log(`${colors.red}\n❌ Error durante el emparejamiento: ${error}${colors.reset}\n`);
        }
    } else {
         console.log(`${colors.green}✅ Matriz de Gmail conectada (Tokens detectados).${colors.reset}\n`);
    }

    console.log(`\n${colors.cyan}====================================================`);
    console.log(`🚀 INSTALACIÓN COMPLETADA`);
    console.log(`Para encender el orquestador ejecuta: npm run dev`);
    console.log(`====================================================${colors.reset}\n`);
    
    rl.close();
}

main();