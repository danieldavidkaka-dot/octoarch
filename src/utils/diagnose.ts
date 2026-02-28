import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { Logger } from './logger';
import * as fs from 'fs';
import * as path from 'path';

export async function runDiagnosis() {
    console.log('\n🏥 === DIAGNÓSTICO DE SISTEMA OCTOARCH v4.0 ===');
    let hasError = false;

    // 1. Chequeo de Entorno (.env)
    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.length < 10) {
        Logger.error('❌ GEMINI_API_KEY no válida o faltante en .env');
        hasError = true;
    } else {
        // 🛡️ SEGURIDAD: Mostramos solo los últimos 4 dígitos para confirmar carga exitosa
        const maskedKey = env.GEMINI_API_KEY.slice(-4);
        console.log(`✅ API Key configurada (termina en: ****${maskedKey}).`);
    }

    // 2. Chequeo de Workspace
    const workspacePath = env.WORKSPACE_DIR; // Usamos la ruta oficial de env.ts
    if (!fs.existsSync(workspacePath)) {
        console.log('⚠️ Workspace no existe. Creando...');
        fs.mkdirSync(workspacePath, { recursive: true });
    }
    console.log(`✅ Workspace: ${workspacePath}`);

    // 3. Chequeo de Conectividad y VPN
    try {
        console.log('⏳ Verificando IP pública...');
        const res = await fetch('http://ip-api.com/json', { signal: AbortSignal.timeout(5000) });
        const data: any = await res.json();
        
        console.log(`📍 Ubicación detectada: ${data.country} (${data.query})`);
        
        if (data.countryCode === 'VE') {
            Logger.error('❌ PELIGRO: IP de Venezuela detectada. Google bloqueará la API.');
            Logger.warn('💡 SOLUCIÓN: Activa tu VPN (TunnelBear/NordVPN) antes de iniciar.');
            hasError = true;
        } else {
            console.log('✅ Conexión segura (Fuera de zona restringida).');
        }
    } catch (e) {
        Logger.warn('⚠️ No se pudo verificar la IP pública. Asegúrate de tener internet.');
    }

    // 4. Prueba de Fuego con Gemini (Usando el SDK oficial)
    if (!hasError) {
        try {
            console.log('🧠 Probando conexión con Gemini...');
            const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
            // Usamos gemini-1.5-flash para el ping porque es el más estable
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            
            await model.generateContent("ping");
            console.log('✅ Conexión con Google AI: ESTABLE.');
            
        } catch (e: any) {
            Logger.error(`❌ Error conectando a Google: ${e.message}`);
            // No marcamos hasError = true aquí para permitir que el servidor intente iniciar igual
        }
    }

    console.log('===============================================\n');
}