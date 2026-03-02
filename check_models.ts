import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ No se encontró GEMINI_API_KEY en el archivo .env");
    process.exit(1);
}

async function checkModels() {
    console.log("📡 Conectando a la matriz de Google para verificar modelos...\n");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("✅ Modelos compatibles con OctoArch (generación de texto/código):\n");
            
            // Filtramos solo los que sirven para chat/código
            const chatModels = data.models.filter((m: any) => 
                m.supportedGenerationMethods?.includes("generateContent")
            );

            chatModels.forEach((m: any) => {
                const modelName = m.name.replace('models/', '');
                console.log(`💎 ID del Modelo : \x1b[36m${modelName}\x1b[0m`);
                console.log(`   Versión       : ${m.displayName}`);
                console.log(`   Cerebro (In)  : ${m.inputTokenLimit} tokens de lectura`);
                console.log(`   Cerebro (Out) : ${m.outputTokenLimit} tokens de escritura`);
                console.log("---------------------------------------------------");
            });

            console.log("\n💡 Sugerencia del Arquitecto:");
            console.log("Busca el modelo que diga 'pro' (ej. gemini-1.5-pro, gemini-2.0-pro).");
            console.log("Copia su 'ID del Modelo' y ponlo en tu código fuente.");
        } else {
            console.log("❌ Error leyendo la API de Google:", data);
        }
    } catch (error) {
        console.error("❌ Error de conexión:", error);
    }
}

checkModels();