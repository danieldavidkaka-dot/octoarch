# 🌍 Contexto Global - OctoArch v5.0

## 1. Identidad del Proyecto
OctoArch es un Agente de Inteligencia Artificial de grado empresarial (Enterprise-Ready) con capacidades de **Inteligencia de Enjambre (Swarm Intelligence) y Auto-Evolución**. Está diseñado para orquestar herramientas locales, escribir su propio código, y conectarse a sistemas remotos de forma autónoma. Su objetivo es automatizar flujos de trabajo empresariales, financieros (InvoDex) y de desarrollo a través de una arquitectura omnicanal (WhatsApp, Telegram, WebSockets y API HTTP).

## 2. Stack Tecnológico Base
* **Entorno:** Node.js + TypeScript (`ts-node` para compilación y ejecución en caliente).
* **Motor de IA Principal:** Google Gemini API (`gemini-2.5-flash`).
* **Sub-Motor de Código:** `CoderLLM` (Instancia de alta precisión para forjado de código sin alucinaciones).
* **Frameworks de Red:** Express.js (HTTP API, Health Checks, Rate Limiting) + `ws` (WebSockets).
* **Canales de Comunicación:** WhatsApp (vía `whatsapp-web.js` con Puppeteer) y Telegram (Polling nativo).
* **Protocolo de Herramientas:** Function Calling nativo, MCP (Model Context Protocol), y Hot-Swapping de Módulos Dinámicos.
* **Integraciones Core:** API de Gmail (Lectura automática y descarga segura de facturas), CronJobs (`node-cron`) para tareas programadas, y un Sistema de Skills dinámico (`.md`) para inyectar contexto sin latencia.

## 3. Arquitectura Limpia (Reglas Estrictas)
El sistema está diseñado bajo el principio de separación de responsabilidades:
* **El Cerebro (`src/core/llm.ts`):** Arquitectura "Slim". Solo gestiona la comunicación con Google Gemini, maneja la memoria y el contexto (vía `PromptManager.ts` y `SessionManager.ts`). NO ejecuta herramientas.
* **El Orquestador (`src/core/tool_orchestrator.ts`):** Recibe las peticiones del cerebro y decide si enviarlas a herramientas estáticas (`agent_executor.ts`), a servidores externos (`mcp_manager.ts`), o a herramientas forjadas por la IA (`dynamic_registry.ts`).
* **El Sistema Swarm (`src/swarm/`):** Un hilo independiente donde un "Obrero" (`worker.ts`) programa herramientas en TypeScript, las compila, corrige sus propios errores, y las promueve a producción (`src/dynamic_tools/`).
* **Seguridad (RBAC):** Existe un Control de Acceso Basado en Roles estricto. Roles como `CFO`, `CMO` o `INVODEX` tienen prohibido ejecutar comandos de terminal (`executeCommand`) o modificar archivos del sistema base.

## 4. Flujos Principales de Negocio

### 4.1. Auto-Programación (Sistema Swarm)
Cuando OctoArch necesita una herramienta técnica nueva, el Orquestador invoca a `spawner.ts`. El Obrero (Sub-Agente) escribe el código usando una plantilla estricta de Gemini, lo compila en la RAM, y si pasa las pruebas, el `DynamicRegistry` limpia la caché de Node.js e inyecta la nueva herramienta al Cerebro en tiempo real (Hot-Swap) sin reiniciar el servidor.

### 4.2. InvoDex (Zero-Friction Accounting)
Módulo contable automatizado. Cuando un usuario envía una imagen de una factura por WhatsApp/Telegram, o el CronJob lee una de Gmail:
1. Valida la integridad del archivo a nivel de bytes (`FileValidator`).
2. Extrae la data mediante IA visual.
3. Formatea un JSON estricto mediante Bypass local.
4. Envía la data a un ERP simulado vía MCP (`procesar_factura`).
5. Guarda respaldos locales seguros.

### 4.3. Sistema de Roles (C-Suite Virtual)
OctoArch cambia su personalidad y nivel de acceso en tiempo real usando prefijos (ej. `octo cfo ...`):
* `DEV` / `AUTO`: Acceso total al sistema, terminal y Sistema Swarm.
* `RESEARCH`: Acceso a lectura web y síntesis de datos.
* `CFO`: Análisis financiero y presupuestario.
* `CMO`: Estrategias de marketing y crecimiento.
* `CHAT`: Modo seguro conversacional (Herramientas bloqueadas).

## 5. Estándares de Código para la IA
* NUNCA usar `require()` dinámicos dentro de funciones estáticas, **CON LA ÚNICA EXCEPCIÓN** de `src/core/dynamic_registry.ts` (donde es estrictamente necesario para el Hot-Swapping y la limpieza de caché). En el resto del proyecto, usar `import` estáticos al inicio del archivo.
* Las herramientas forjadas dinámicamente DEBEN exportar un objeto `tool` compatible con la interfaz nativa de Gemini `FunctionDeclaration`.
* NUNCA usar expresiones regulares (Regex) para analizar JSONs complejos si se puede evitar.
* Todo log debe pasar por la clase utilitaria `Logger` (`src/utils/logger.ts`).
* Las llaves de API y configuraciones sensibles SIEMPRE se leen desde `src/config/env.ts` o `process.env`.