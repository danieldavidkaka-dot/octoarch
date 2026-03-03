## 1. Identidad del Proyecto
OctoArch es un Agente de Inteligencia Artificial de grado empresarial (Enterprise-Ready) diseñado para orquestar herramientas locales y remotas de forma autónoma. Su objetivo es automatizar flujos de trabajo empresariales, financieros (InvoDex) y de desarrollo a través de múltiples canales (WhatsApp, WebSockets y API HTTP).

## 2. Stack Tecnológico Base
* **Entorno:** Node.js + TypeScript.
* **Motor de IA:** Google Gemini API (`gemini-2.5-flash`).
* **Frameworks de Red:** Express.js (HTTP API, Health Checks, Rate Limiting) + `ws` (WebSockets).
* **Canal Principal:** WhatsApp (vía `whatsapp-web.js` con Puppeteer).
* **Protocolo de Herramientas:** Function Calling nativo y MCP (Model Context Protocol).
* **Integraciones Core:** API de Gmail (Lectura automática y descarga segura de facturas), CronJobs (`node-cron`) para tareas programadas, y un Sistema de Skills dinámico (`.md`) para inyectar contexto sin latencia.

## 3. Arquitectura Limpia (Reglas Estrictas)
El sistema está diseñado bajo el principio de separación de responsabilidades:
* **El Cerebro (`src/core/llm.ts`):** Solo gestiona la comunicación con Google Gemini, maneja la memoria y el contexto (vía `PromptManager.ts`). NO ejecuta herramientas.
* **Las Manos (`src/core/tool_orchestrator.ts` y `agent_executor.ts`):** Reciben las peticiones del cerebro y ejecutan las herramientas de forma aislada.
* **Seguridad (RBAC):** Existe un Control de Acceso Basado en Roles estricto. Roles como `CFO`, `CMO` o `INVODEX` tienen prohibido ejecutar comandos de terminal (`executeCommand`) o modificar archivos del sistema base.
* **Anti-Alucinación:** El modelo está configurado con `temperature: 0.1`. El bot tiene estrictamente prohibido inventar datos financieros o de sistema.

## 4. Flujos Principales de Negocio
### 4.1. InvoDex (Zero-Friction Accounting)
Es el módulo contable automatizado. Cuando un usuario envía una imagen de una factura por WhatsApp sin texto, o el CronJob lee una de Gmail, el sistema:
1. Valida la integridad del archivo a nivel de bytes (`file-type`, `FileValidator`).
2. Asigna automáticamente el rol `INVODEX`.
3. Extrae la data mediante IA visual.
4. Ejecuta un Bypass local para formatear un JSON estricto.
5. Envía la data a un ERP simulado vía MCP (`procesar_factura`).
6. Guarda un respaldo local en `/workspace/invodex_wa`, `/workspace/invodex_ext` o `/workspace/factura_correos`.

### 4.2. Sistema de Roles (C-Suite Virtual)
OctoArch puede cambiar su personalidad y nivel de acceso en tiempo real usando prefijos en WhatsApp (ej. `octo cfo ...`):
* `DEV` / `AUTO`: Acceso total al sistema y terminal.
* `RESEARCH`: Acceso a lectura web y síntesis de datos.
* `CFO`: Análisis financiero y presupuestario.
* `CMO`: Estrategias de marketing y crecimiento.
* `CHAT`: Modo seguro conversacional (Herramientas bloqueadas).

## 5. Estándares de Código para la IA
* NUNCA usar `require()` dinámicos dentro de funciones; usar `import` estáticos al inicio del archivo.
* NUNCA usar expresiones regulares (Regex) para analizar JSONs complejos si se puede evitar.
* Todo log debe pasar por la clase utilitaria `Logger` (`src/utils/logger.ts`), nunca usar `console.log` directamente en producción.
* Las llaves de API y configuraciones sensibles SIEMPRE se leen desde `src/config/env.ts`.