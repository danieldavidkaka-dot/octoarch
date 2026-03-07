Contexto Global - OctoArch v5.0
1. Identidad del Proyecto
OctoArch es un Agente de Inteligencia Artificial de grado empresarial (Enterprise-Ready) con capacidades de Inteligencia de Enjambre (Swarm Intelligence), Auto-Evolución y Arquitectura Multi-Modelo. Está diseñado para orquestar herramientas locales, escribir su propio código, y conectarse a sistemas remotos de forma autónoma. Su objetivo es automatizar flujos de trabajo empresariales, financieros (InvoDex) y de desarrollo a través de una arquitectura omnicanal (WhatsApp, Telegram, WebSockets y API HTTP).

2. Stack Tecnológico Base
Entorno: Node.js + TypeScript (ts-node para compilación y ejecución en caliente).

Motor de IA Principal (El CEO): Google Gemini API (gemini-2.5-flash / Pro) para orquestación, empatía y velocidad.

Motor Lógico Secundario (El Consultor): DeepSeek API (vía herramientas Swarm) para razonamiento matemático, código y lógica compleja bajo demanda.

Memoria y Base de Datos: Supabase (PostgreSQL) para Memoria Infinita Stateful y separación Multi-Tenant (client_id, session_id).

Sub-Motor de Código: CoderLLM (Instancia de alta precisión para forjado de código sin alucinaciones).

Frameworks de Red: Express.js (HTTP API, Health Checks, Rate Limiting) + ws (WebSockets).

Canales de Comunicación: WhatsApp (vía whatsapp-web.js con Puppeteer) y Telegram (Polling nativo).

Protocolo de Herramientas: Function Calling nativo, MCP (Model Context Protocol), y Hot-Swapping de Módulos Dinámicos.

3. Arquitectura Limpia (Reglas Estrictas)
El sistema está diseñado bajo el principio de separación de responsabilidades:

El Cerebro (src/core/llm.ts): Arquitectura "Slim". Solo gestiona la comunicación con Google Gemini, maneja la memoria persistente en la nube (vía Supabase y SessionManager.ts) y el contexto. NO ejecuta herramientas.

El Orquestador (src/core/tool_orchestrator.ts): Recibe las peticiones del cerebro y decide si enviarlas a herramientas estáticas, a servidores externos (MCP), o a herramientas forjadas por la IA.

El Sistema Swarm (src/swarm/ o src/core/worker.ts): Un hilo independiente donde un "Obrero" programa herramientas en TypeScript en una sala de aislamiento segura (src/temp_tools/), las compila, corrige sus propios errores, y las promueve a producción (src/dynamic_tools/).

Seguridad (RBAC y Secretos): * Control de Acceso Basado en Roles estricto (Roles bloqueados como CFO, CHAT no pueden usar terminal).

Inyección segura de variables de entorno: El Obrero NUNCA hardcodea API Keys. Las consume estrictamente desde el maletín env.WORKER_SECRETS.

4. Flujos Principales de Negocio
4.1. Auto-Programación (Sistema Swarm)
Cuando OctoArch necesita una herramienta técnica nueva, el Orquestador invoca al Obrero. El Obrero escribe el código usando una plantilla estricta y lo guarda en src/temp_tools/. Lo compila en este entorno aislado, y solo si pasa las pruebas de sintaxis, lo mueve a src/dynamic_tools/. El DynamicRegistry detecta el cambio, limpia la caché de Node.js e inyecta la nueva herramienta al Cerebro en tiempo real (Hot-Swap) sin reiniciar el servidor ni arriesgar la estabilidad.

4.2. Delegación Multi-Modelo
OctoArch actúa como Director General. Resuelve el 90% de las consultas generales directamente con Gemini para ahorrar latencia y costos. Cuando detecta un problema de lógica pura o código complejo, usa herramientas dinámicas (como consultar_deepseek) para enviar un prompt limpio y aislado a modelos expertos (DeepSeek), retornando la respuesta procesada al usuario.

4.3. InvoDex (Zero-Friction Accounting)
Módulo contable automatizado. Cuando un usuario envía una imagen de una factura o el CronJob lee una de Gmail:

Valida la integridad del archivo a nivel de bytes (FileValidator).

Extrae la data mediante IA visual.

Formatea un JSON estricto mediante Bypass local.

Envía la data a un ERP simulado vía MCP (procesar_factura).

Guarda respaldos locales seguros.

4.4. Sistema de Roles (C-Suite Virtual)
OctoArch cambia su personalidad y nivel de acceso en tiempo real usando prefijos (ej. octo cfo ...):

DEV / AUTO: Acceso total al sistema, terminal y Sistema Swarm.

RESEARCH: Acceso a lectura web y síntesis de datos.

CFO: Análisis financiero y presupuestario.

CMO: Estrategias de marketing y crecimiento.

CHAT: Modo seguro conversacional (Herramientas bloqueadas).

5. Estándares de Código para la IA
NUNCA usar require() dinámicos dentro de funciones estáticas, CON LA ÚNICA EXCEPCIÓN de src/core/dynamic_registry.ts.

Las herramientas forjadas dinámicamente DEBEN exportar un objeto tool compatible con la interfaz nativa de Gemini FunctionDeclaration.

Al crear herramientas dinámicas que conecten a APIs externas, SIEMPRE extraer las contraseñas de env.WORKER_SECRETS importando env desde ../config/env.

Todo log debe pasar por la clase utilitaria Logger (src/utils/logger.ts).