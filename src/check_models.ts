import { env } from './config/env';

async function listModels() {
    console.log("🕵️‍♂️ Consultando a Google qué modelos tienes disponibles...");

    // Usamos la API REST directa para evitar confusiones con la librería
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${env.GEMINI_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("\n❌ ERROR DE API:", data.error.message);
            console.error("👉 Revisa que tu GEMINI_API_KEY en .env sea correcta.");
            return;
        }

        console.log("\n✅ LISTA OFICIAL DE MODELOS PARA TU CUENTA:");
        console.log("===========================================");

        // Filtramos solo los que sirven para chatear (generateContent)
        const models = data.models
            .filter((m: any) => m.supportedGenerationMethods.includes("generateContent"))
            .map((m: any) => m.name.replace("models/", "")); // Limpiamos el prefijo

        models.forEach((name: string) => {
            console.log(`👉 "${name}"`);
        });

        console.log("===========================================");
        console.log("💡 ELIGE UNO DE ARRIBA y ponlo en src/core/llm.ts");

    } catch (error: any) {
        console.error("\n❌ Error de conexión:", error.message);
    }
}

listModels();