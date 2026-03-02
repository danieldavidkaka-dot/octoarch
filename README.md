# 🐙 OctoArch - The Cognitive Runtime

[![AI for Good](https://img.shields.io/badge/AI-Make_the_world_a_better_place-success)](#) [![Free Venezuela](https://img.shields.io/badge/Free-Venezuela_🇻🇪_|_Free_the_world_❤️-ff0000)](#)

![OctoArch](assets/wmremove-transformed.png)

OctoArch is not a simple transactional bot. It is an advanced Cognitive Runtime and Autonomous Agent, allowing you to execute complex workflows, manage servers (via MCP), process documents via WhatsApp, and autonomously monitor corporate inboxes (Gmail).

With **version 4.6**, the system has reached an Enterprise-Ready standard, featuring a dynamic Skills Loader, centralized byte-level security, persistent OAuth2 integrations, and strict anti-hallucination protocols.

## ✨ Key Features

* **🧠 Cognitive Core & Memory:** Each interaction (API, WS, WhatsApp) maintains an isolated session with short-term memory, context compression, and an integrated Garbage Collector (TTL).
* **📧 Autonomous Inbox Processing:** An integrated CronJob monitors authorized Gmail accounts every 15 minutes. It auto-detects unread invoices/documents, validates their bytes, and securely downloads them to the workspace without human intervention.
* **📸 InvoDex Zero-Friction Flow:** Send a photo of an invoice via WhatsApp. The system auto-detects the intent (`INVODEX`), extracts tax fields via visual AI, generates a deterministic JSON, and injects it into the ERP via MCP.
* **🎮 Dynamic Skills System:** Teach OctoArch new abilities on the fly. By placing Markdown (`.md`) manuals in `workspace/skills/`, the AI can load and apply new logic (e.g., UI/UX design rules, specific coding standards) without restarting the server.
* **🔀 Virtual C-Suite & Role Routing:** Use prefixes like `octo cfo`, `octo cmo`, or `octo dev` to force the AI to adopt specific executive profiles with pre-assigned RBAC (Role-Based Access Control) permissions.
* **🛡️ Military-Grade File Security:** The system NEVER trusts reported mimetypes or file extensions. It uses a centralized `FileValidator` for "Magic Numbers" byte-level analysis to block malicious payloads (e.g., an `.exe` disguised as a `.jpg`), whether they arrive via WhatsApp or Gmail.
* **🥷 Stealth Web Inspection:** Powered by Puppeteer Extra and Stealth Plugins, OctoArch can navigate, bypass basic anti-bot systems, and synthesize data from the web natively.

## 🚀 Initialization and Usage

The multicanal services (WhatsApp, HTTP/WS API, and CronJobs) are deeply integrated into the OctoArch lifecycle. 

**Start the Main Server:**
From the root of the project, run:
```bash
npm run dev

Connect your Channels:

WhatsApp: A QR code will appear in your terminal. Scan it to link the agent to your phone.

Gmail (First time only): The system uses a persistent OAuth2 refresh token stored in workspace/token.json.

Frontend: A static web server automatically boots up serving the frontend/ directory.

💬 Commands and Syntax (WhatsApp Module)
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
│   ├── config/              # Environment variables and path resolution
│   ├── core/
│   │   ├── llm.ts               # 🧠 Cognitive brain (Gemini 2.5 Flash)
│   │   ├── tool_orchestrator.ts # 🛠️ Execution delegator (Native vs MCP)
│   │   └── prompt_manager.ts    # 🎭 Centralized Dictionary for Roles
│   ├── tools/
│   │   ├── whatsapp.ts          # 📱 WA Engine & Router
│   │   ├── gmail.ts             # 📧 OAuth2 Mail Reader & Downloader
│   │   ├── browser.ts           # 🥷 Stealth Puppeteer Scraper
│   │   └── skill_loader.ts      # 🎮 Dynamic Markdown Skill injector
│   ├── utils/
│   │   └── file_validator.ts    # 🛡️ Centralized Magic Number byte-scanner
│   └── index.ts             # 🚀 Orchestrator & CronJob Manager
├── workspace/
│   ├── skills/              # 📚 Dynamic .md manuals (e.g., frontend-design.md)
│   ├── auth_wa/             # 🔐 WhatsApp session files
│   └── factura_correos/     # 💾 Auto-saved attachments from Gmail

🛠️ Security Notes
Origin Restriction: Currently configured with if (!msg.fromMe) return; so it only responds to your own messages. Comment this out to deploy as a customer service bot.

Anti-Hallucination: The LLM temperature is deliberately frozen at 0.1 for critical roles (CFO/InvoDex).

Data Privacy: Images and documents are processed in memory (Base64/Buffers) and evaluated locally before any action is taken. Ensure you comply with corporate policies when connecting to external APIs.