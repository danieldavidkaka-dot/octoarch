# 🐙 OctoArch - The Cognitive Runtime

[![AI for Good](https://img.shields.io/badge/AI-Make_the_world_a_better_place-success)](#) [![Free Venezuela](https://img.shields.io/badge/Free-Venezuela_🇻🇪_|_Free_the_world_❤️-ff0000)](#)

![OctoArch](assets/wmremove-transformed.png)

# 🐙 OctoArch - The Cognitive Runtime

[![AI for Good](https://img.shields.io/badge/AI-Make_the_world_a_better_place-success)](#) [![Free Venezuela](https://img.shields.io/badge/Free-Venezuela_🇻🇪_|_Free_the_world_❤️-ff0000)](#)

![OctoArch](assets/wmremove-transformed.png)

OctoArch is not a simple transactional bot. It is an advanced Cognitive Runtime and Autonomous Agent, allowing you to execute complex workflows, manage servers (via MCP), process documents via WhatsApp/Telegram, and autonomously monitor corporate inboxes (Gmail).

With version 5.0, the system has reached a new paradigm: Swarm Intelligence, Multi-Model Orchestration, and Infinite Stateful Memory. OctoArch can now write, debug, and dynamically inject its own TypeScript code into its neural network at runtime, achieving true self-evolution without human intervention or server restarts.

## ✨ Key Features

* **🧠 Infinite Cognitive Memory (Supabase):** The era of bot amnesia is over. Each interaction maintains an isolated, multi-tenant session backed by a PostgreSQL cloud database (Supabase). The system safely isolates client data (`client_id` and `session_id`) and seamlessly restores context after server reboots.
* **🌐 Multi-Model Architecture (Gemini + DeepSeek):** OctoArch acts as a Virtual CEO (powered by Google Gemini) handling rapid, empathetic orchestration. For complex logical, mathematical, or coding challenges, it autonomously delegates tasks to specialized secondary models (like DeepSeek) via dynamic tools, maximizing precision and token efficiency.
* **🤖 Swarm Intelligence & Autonomous Tool Forging:** When the AI needs a tool it doesn't possess, it spawns a specialized Sub-Agent (Worker). This Worker writes the required TypeScript module in an isolated sandbox (`src/temp_tools`), safely consumes API keys via an injected secrets briefcase (`WORKER_SECRETS`), runs a linter (`tsc`), auto-corrects syntax errors, and promotes the code to production (`src/dynamic_tools`).
* **📧 Autonomous Inbox Processing:** An integrated CronJob monitors authorized Gmail accounts every 15 minutes. It auto-detects unread invoices/documents, validates their bytes, and securely downloads them to the workspace without human intervention.
* **📸 InvoDex Zero-Friction Flow:** Send a photo of an invoice via WhatsApp. The system auto-detects the intent (INVODEX), extracts tax fields via visual AI, generates a deterministic JSON, and injects it into the ERP via MCP.
* **🎮 Dynamic Skills System:** Teach OctoArch new abilities on the fly. By placing Markdown (`.md`) manuals in `workspace/skills/`, the AI can load and apply new contextual logic (e.g., UI/UX design rules, specific coding standards).
* **🔀 Virtual C-Suite & Role Routing:** Use prefixes like `octo cfo`, `octo cmo`, or `octo dev` to force the AI to adopt specific executive profiles with pre-assigned RBAC (Role-Based Access Control) permissions.
* **🛡️ Military-Grade Security:** The system NEVER trusts reported mimetypes. It uses a centralized FileValidator for "Magic Numbers" byte-level analysis. Furthermore, Sub-Agents are strictly prohibited from hardcoding secrets, relying entirely on a Zod-validated environment schema.

## 🚀 Initialization and Usage

The omnichannel services (WhatsApp, Telegram, HTTP/WS API, and CronJobs) are deeply integrated into the OctoArch lifecycle.

**Start the Main Server:**
From the root of the project, run:

```bash
npm run start

(Use npm run dev only if you are manually coding the core, to enable Nodemon).

Connect your Channels:

WhatsApp: A QR code will appear in your terminal. Scan it to link the agent to your phone.

Telegram: The bot token from your .env connects instantly via Polling.

Gmail (First time only): The system uses a persistent OAuth2 refresh token stored in workspace/token.json.

Frontend: A static web server automatically boots up serving the frontend/ directory with live WebSocket updates.

💬 Commands and Syntax (Omnichannel Module)
The agent automatically reacts to messages sent to its chat.

Zero-Friction Mode (InvoDex): Send an image directly. The system automatically parses the invoice.

Diagnostic: !ping -> Returns the server and vision status.

C-Suite Commands:

octo cfo analyze this budget -> Chief Financial Officer Mode (Strict, analytical, terminal tools blocked).

octo cmo review this campaign -> Chief Marketing Officer Mode (Creative, persuasive).

octo dev check the src folder -> Developer Mode (Access to terminal, shell commands, local files, and Skills).

octo research latest AI news -> Researcher Mode (Access to web inspection and synthesis).

octo chat What can you do? -> Safe Conversational Mode (All system-modifying tools blocked).

📂 Module Architecture
The service relies on a Clean Architecture pattern, strictly separating the AI logic from tool execution:

octoarch_core/
├── src/
│   ├── config/              # Environment variables, Zod schemas, and WORKER_SECRETS
│   ├── core/
│   │   ├── llm.ts               # 🧠 Cognitive CEO brain (Slim Architecture)
│   │   ├── tool_orchestrator.ts # 🛠️ Execution delegator (Native, MCP, Dynamic)
│   │   ├── dynamic_registry.ts  # 🔌 Hot-Swap tool loader (require.cache cleaner)
│   │   └── session_manager.ts   # 🐘 Supabase cloud memory synchronization
│   ├── swarm/               # 🧬 Sub-Agent Auto-Programming System
│   │   ├── worker.ts            # Autonomous coding logic & self-correction
│   │   └── coder_llm.ts         # High-precision strict coding LLM interface
│   ├── temp_tools/          # 🛡️ Safe sandbox for Worker compilation
│   ├── dynamic_tools/       # 🚀 Auto-generated TypeScript tools promoted to production
│   ├── tools/
│   │   ├── whatsapp.ts          # 📱 WA Engine & Router
│   │   ├── telegram.ts          # ✈️ Telegram Engine
│   │   ├── gmail.ts             # 📧 OAuth2 Mail Reader & Downloader
│   │   ├── browser.ts           # 🥷 Stealth Puppeteer Scraper
│   │   └── skill_loader.ts      # 🎮 Dynamic Markdown Context injector
│   ├── utils/
│   │   └── file_validator.ts    # 🛡️ Centralized Magic Number byte-scanner
│   └── index.ts             # 🚀 Orchestrator, WS Server & CronJob Manager
├── workspace/
│   ├── skills/              # 📚 Dynamic .md manuals
│   └── auth_wa/             # 🔐 WhatsApp session files

Gemini ha dicho
¡Entendido, Arquitecto! 🛠️🐙

Aquí tienes el README.md completamente limpio, formateado profesionalmente en Markdown y listo para copiar y pegar en tu repositorio. He ajustado los bloques de código y las listas para que se rendericen perfectamente en GitHub.

Copia el siguiente bloque de código y reemplaza el contenido de tu archivo README.md:

Markdown
# 🐙 OctoArch - The Cognitive Runtime

[![AI for Good](https://img.shields.io/badge/AI-Make_the_world_a_better_place-success)](#) [![Free Venezuela](https://img.shields.io/badge/Free-Venezuela_🇻🇪_|_Free_the_world_❤️-ff0000)](#)

![OctoArch](assets/wmremove-transformed.png)

OctoArch is not a simple transactional bot. It is an advanced Cognitive Runtime and Autonomous Agent, allowing you to execute complex workflows, manage servers (via MCP), process documents via WhatsApp/Telegram, and autonomously monitor corporate inboxes (Gmail).

With version 5.0, the system has reached a new paradigm: Swarm Intelligence, Multi-Model Orchestration, and Infinite Stateful Memory. OctoArch can now write, debug, and dynamically inject its own TypeScript code into its neural network at runtime, achieving true self-evolution without human intervention or server restarts.

## ✨ Key Features

* **🧠 Infinite Cognitive Memory (Supabase):** The era of bot amnesia is over. Each interaction maintains an isolated, multi-tenant session backed by a PostgreSQL cloud database (Supabase). The system safely isolates client data (`client_id` and `session_id`) and seamlessly restores context after server reboots.
* **🌐 Multi-Model Architecture (Gemini + DeepSeek):** OctoArch acts as a Virtual CEO (powered by Google Gemini) handling rapid, empathetic orchestration. For complex logical, mathematical, or coding challenges, it autonomously delegates tasks to specialized secondary models (like DeepSeek) via dynamic tools, maximizing precision and token efficiency.
* **🤖 Swarm Intelligence & Autonomous Tool Forging:** When the AI needs a tool it doesn't possess, it spawns a specialized Sub-Agent (Worker). This Worker writes the required TypeScript module in an isolated sandbox (`src/temp_tools`), safely consumes API keys via an injected secrets briefcase (`WORKER_SECRETS`), runs a linter (`tsc`), auto-corrects syntax errors, and promotes the code to production (`src/dynamic_tools`).
* **📧 Autonomous Inbox Processing:** An integrated CronJob monitors authorized Gmail accounts every 15 minutes. It auto-detects unread invoices/documents, validates their bytes, and securely downloads them to the workspace without human intervention.
* **📸 InvoDex Zero-Friction Flow:** Send a photo of an invoice via WhatsApp. The system auto-detects the intent (INVODEX), extracts tax fields via visual AI, generates a deterministic JSON, and injects it into the ERP via MCP.
* **🎮 Dynamic Skills System:** Teach OctoArch new abilities on the fly. By placing Markdown (`.md`) manuals in `workspace/skills/`, the AI can load and apply new contextual logic (e.g., UI/UX design rules, specific coding standards).
* **🔀 Virtual C-Suite & Role Routing:** Use prefixes like `octo cfo`, `octo cmo`, or `octo dev` to force the AI to adopt specific executive profiles with pre-assigned RBAC (Role-Based Access Control) permissions.
* **🛡️ Military-Grade Security:** The system NEVER trusts reported mimetypes. It uses a centralized FileValidator for "Magic Numbers" byte-level analysis. Furthermore, Sub-Agents are strictly prohibited from hardcoding secrets, relying entirely on a Zod-validated environment schema.

## 🚀 Initialization and Usage

The omnichannel services (WhatsApp, Telegram, HTTP/WS API, and CronJobs) are deeply integrated into the OctoArch lifecycle.

**Start the Main Server:**
From the root of the project, run:

```bash
npm run start
(Use npm run dev only if you are manually coding the core, to enable Nodemon).

Connect your Channels:

WhatsApp: A QR code will appear in your terminal. Scan it to link the agent to your phone.

Telegram: The bot token from your .env connects instantly via Polling.

Gmail (First time only): The system uses a persistent OAuth2 refresh token stored in workspace/token.json.

Frontend: A static web server automatically boots up serving the frontend/ directory with live WebSocket updates.

💬 Commands and Syntax (Omnichannel Module)
The agent automatically reacts to messages sent to its chat.

Zero-Friction Mode (InvoDex): Send an image directly. The system automatically parses the invoice.

Diagnostic: !ping -> Returns the server and vision status.

C-Suite Commands:

octo cfo analyze this budget -> Chief Financial Officer Mode (Strict, analytical, terminal tools blocked).

octo cmo review this campaign -> Chief Marketing Officer Mode (Creative, persuasive).

octo dev check the src folder -> Developer Mode (Access to terminal, shell commands, local files, and Skills).

octo research latest AI news -> Researcher Mode (Access to web inspection and synthesis).

octo chat What can you do? -> Safe Conversational Mode (All system-modifying tools blocked).

📂 Module Architecture
The service relies on a Clean Architecture pattern, strictly separating the AI logic from tool execution:

Plaintext
octoarch_core/
├── src/
│   ├── config/              # Environment variables, Zod schemas, and WORKER_SECRETS
│   ├── core/
│   │   ├── llm.ts               # 🧠 Cognitive CEO brain (Slim Architecture)
│   │   ├── tool_orchestrator.ts # 🛠️ Execution delegator (Native, MCP, Dynamic)
│   │   ├── dynamic_registry.ts  # 🔌 Hot-Swap tool loader (require.cache cleaner)
│   │   └── session_manager.ts   # 🐘 Supabase cloud memory synchronization
│   ├── swarm/               # 🧬 Sub-Agent Auto-Programming System
│   │   ├── worker.ts            # Autonomous coding logic & self-correction
│   │   └── coder_llm.ts         # High-precision strict coding LLM interface
│   ├── temp_tools/          # 🛡️ Safe sandbox for Worker compilation
│   ├── dynamic_tools/       # 🚀 Auto-generated TypeScript tools promoted to production
│   ├── tools/
│   │   ├── whatsapp.ts          # 📱 WA Engine & Router
│   │   ├── telegram.ts          # ✈️ Telegram Engine
│   │   ├── gmail.ts             # 📧 OAuth2 Mail Reader & Downloader
│   │   ├── browser.ts           # 🥷 Stealth Puppeteer Scraper
│   │   └── skill_loader.ts      # 🎮 Dynamic Markdown Context injector
│   ├── utils/
│   │   └── file_validator.ts    # 🛡️ Centralized Magic Number byte-scanner
│   └── index.ts             # 🚀 Orchestrator, WS Server & CronJob Manager
├── workspace/
│   ├── skills/              # 📚 Dynamic .md manuals
│   └── auth_wa/             # 🔐 WhatsApp session files
🛠️ Security Notes
Origin Restriction: Currently configured so it only responds to your authorized numbers/chats. Modify the router logic to deploy as a public customer service bot.

Anti-Hallucination: The LLM temperature is deliberately frozen at 0.1 for critical roles (CFO/InvoDex) to ensure deterministic outputs.

Data Privacy: Images and documents are processed in memory (Base64/Buffers) and evaluated locally. Client memory state is securely stored and partitioned in Supabase using Tenant IDs.