# 🐙 OctoArch v4.2 - Autonomous Orchestration Engine

[![AI for Good](https://img.shields.io/badge/AI-Make_the_world_a_better_place-success)](#) [![Free Venezuela](https://img.shields.io/badge/Free-Venezuela_🇻🇪_|_Free_the_world_❤️-ff0000)](#)

![Captura de OctoArch en funcionamiento](assets/wmremove-transformed.jpeg)

**OctoArch** es un motor de orquestación autónoma local... impulsado por **Google Gemini 2.5 Flash**. Diseñado para operar como un "Sistema Operativo Cognitivo", permite la administración de servidores, automatización de tareas y navegación web compleja a través de interfaces de lenguaje natural (Web Terminal y WhatsApp).

## 🚀 Estado Actual (v4.2 - Enterprise Stable)

El sistema ha evolucionado de un prototipo de chatbot a un **Agente Autónomo de Nivel Producción** con capacidad de ejecución real, memoria persistente a corto plazo y ruteo determinista.

### 🧠 Arquitectura Cognitiva Core
* **Intelligence Core (Singleton):** Motor centralizado que gestiona el estado global del sistema, evitando fugas de memoria y manteniendo un contexto coherente.
* **Enrutamiento Determinista (Nativo):** Utiliza *Function Calling* nativo de la API de Gemini. El agente ya no adivina formatos JSON, sino que ejecuta herramientas a través de esquemas tipados estrictos (`SchemaType`), reduciendo a cero las alucinaciones de formato.
* **Memoria Stateful Nativa:** Mantiene un historial de conversación fluido y eficiente inyectado directamente en el objeto `Content[]` de la API, permitiendo al agente recordar contextos y ejecutar tareas de múltiples turnos.
* **Bucle Cognitivo (Cognitive Loop):** El sistema no solo ejecuta herramientas, sino que *lee* sus propios resultados técnicos (logs de terminal, texto de webs, errores) y formula una respuesta final humana basada en esa evidencia.
* **Protocolo Anti-Alucinación:** Reglas estrictas en el Kernel que prohíben inventar datos. Si no puede usar una herramienta, reporta el error real al usuario en lugar de simularlo.

### 🛡️ Seguridad y Roles (RBAC)
El sistema implementa un Firewall lógico basado en roles para proteger el host local, procesado en un módulo dedicado (`AgentExecutor`):

| Rol | Alias (WhatsApp) | Permisos | Descripción |
| :--- | :--- | :--- | :--- |
| **AUTO / DEV** | `dev`, `root` | ✅ Todo | Acceso total: Shell, Filesystem (Write), Browser. |
| **RESEARCHER** | `research` | 👁️ Solo Lectura | Navegación Web y Lectura de Archivos. **Bloquea** escritura y terminal. |
| **CHAT** | `chat`, `seguro` | ❌ Ninguno | Modo seguro. Solo conversación. Herramientas desactivadas. |

### 🛠️ Herramientas Integradas (Toolchain)
1.  **BrowserTool (`inspectWeb`):** Navegador *headless* avanzado impulsado por un **Browser Pool**. Mantiene una instancia maestra de Puppeteer en memoria RAM y recicla pestañas (`newPage`), permitiendo inspeccionar múltiples URLs en segundos. Incluye *Stealth Mode* para evadir anti-bots.
2.  **ShellTool (`executeCommand`):** Ejecución tipada de comandos de terminal (npm, git, python, etc.) con límites de tiempo (timeout) y extracción de *stdout/stderr*.
3.  **FileTool (`readFile`/`createFile`):** Gestión del sistema de archivos con prevención estricta de ataques de *Path Traversal*.

---

## 📱 Interfaz Remota (WhatsApp)

OctoArch incluye un servidor de WhatsApp (`whatsapp-web.js`) que actúa como canal de comando remoto seguro, integrado directamente con la inteligencia del agente.

### Sintaxis de Comandos
El sistema utiliza un **Enrutador de Intenciones** basado en la primera palabra del mensaje:

`octo [ROL] [INSTRUCCIÓN]`

#### Ejemplos de uso:

* **Investigación Web de Alto Rendimiento:**
    > `octo research investiga las páginas de example.com y de wikipedia.org. Dime de qué trata cada una.`
    *(Nota: El sistema rechazará intentos de usar la terminal en este modo).*

* **Desarrollo / DevOps (Root):**
    > `octo dev verifica qué versión de node tenemos y crea un archivo test_nativo.txt en el workspace.`

* **Chat Casual (Con Memoria Activa):**
    > `octo chat ¿recuerdas cómo se llamaba el archivo que acabamos de crear?`

* **Modo Auto (Cuidado):**
    > `octo revisa el servidor.`
    *(Si no se especifica rol, asume permisos totales).*

---

## 💻 Instalación y Despliegue

### Requisitos
* Node.js v18+
* Google Gemini API Key
* Cuenta de WhatsApp (para vincular)

### Iniciar el Cerebro (Backend + WhatsApp)
```bash
npm install
npm run dev