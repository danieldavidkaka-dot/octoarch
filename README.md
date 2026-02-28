# 🐙 OctoArch - The Cognitive Runtime

[![AI for Good](https://img.shields.io/badge/AI-Make_the_world_a_better_place-success)](#) [![Free Venezuela](https://img.shields.io/badge/Free-Venezuela_🇻🇪_|_Free_the_world_❤️-ff0000)](#)

![OctoArch](assets/wmremove-transformed.png)

# 📱 OctoArch WhatsApp Interface

El módulo de WhatsApp de OctoArch no es un simple bot transaccional. Es la puerta de enlace móvil al **Cognitive Runtime**, permitiéndote ejecutar flujos de trabajo complejos, administrar servidores (vía MCP) y procesar documentos directamente desde tu teléfono mediante la librería `whatsapp-web.js`.

## ✨ Características Principales

- 🧠 **Conexión Directa al Cognitive Core**: Cada número de teléfono mantiene una sesión aislada con memoria a corto plazo (Garbage Collector y TTL integrados).
- 📸 **Flujo InvoDex Zero-Friction**: Envía la foto de una factura sin texto. El sistema auto-detectará la intención (`INVODEX`), extraerá los 9 campos fiscales, generará el JSON y lo inyectará en el ERP vía MCP.
- 🔀 **Enrutamiento por Roles**: Usa prefijos como `octo dev`, `octo research` o `octo chat` para forzar a la IA a adoptar perfiles específicos con herramientas pre-asignadas.
- 💾 **Auto-Guardado Local**: Los documentos procesados (como las facturas) se respaldan automáticamente en `workspace/invodex_wa/`.
- 🔐 **Autenticación Persistente**: Inicias sesión una sola vez con código QR; la sesión se cifra y guarda en `workspace/auth_wa/`.

## 🚀 Inicialización y Uso

El servicio de WhatsApp está profundamente integrado en el ciclo de vida de OctoArch. **No necesitas iniciarlo por separado.**

1. **Arranca el Servidor Principal**:
   Desde la raíz del proyecto OctoArch, ejecuta:
   ```bash
   npm run dev
Escanea el Código QR:
En tu terminal aparecerá un código QR. Abre WhatsApp en tu celular > Ajustes > Dispositivos vinculados > Vincular un dispositivo, y escanea la pantalla.

¡Listo! Verás en consola ✅ ¡CONECTADO! Octoarch v4.0 ya tiene WhatsApp y está pensando.

💬 Comandos y Sintaxis
El agente reacciona automáticamente a mensajes enviados a su chat:

Modo Zero-Friction (Recomendado para PYMES):

Envía una foto (Ej. Factura). El sistema asume INVODEX automáticamente.

Comando de Diagnóstico:

!ping -> Retorna el estado del servidor.

Comando Multi-Agente:

octo chat ¿Qué puedes hacer? -> Modo conversacional seguro.

octo dev revisa la carpeta src -> Modo Desarrollador (Acceso a terminal y archivos).

octo research investiga el clima local -> Modo Investigador (Acceso a Puppeteer).

octo [cualquier orden] -> Modo Automático. El sistema deducirá el mejor rol.

📂 Arquitectura del Módulo
El servicio ya no vive en una carpeta aislada, forma parte del núcleo de herramientas:

Plaintext
octoarch_core/
├── src/
│   ├── tools/
│   │   └── whatsapp.ts        # 📱 Motor de WhatsApp Web JS y Enrutador
│   ├── core/
│   │   └── llm.ts             # 🧠 Cerebro cognitivo que procesa los mensajes
│   └── index.ts               # 🚀 Orquestador que inicializa el servicio
├── workspace/
│   ├── auth_wa/               # 🔐 Archivos de sesión de WhatsApp (¡Ignorado en Git!)
│   └── invodex_wa/            # 💾 JSONs de facturas auto-guardados
🛠️ Notas de Seguridad
Restricción de Origen: Actualmente, el código está configurado con if (!msg.fromMe) return; para que solo responda a mensajes enviados por ti mismo (ideal para testing y uso personal). Para habilitarlo como servicio al cliente, comenta esa línea con precaución.

Privacidad: Las imágenes enviadas se procesan en base64 en memoria y se envían a Gemini. Asegúrate de cumplir con tus políticas de privacidad de datos corporativos.