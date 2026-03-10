[![AI for Good](https://img.shields.io/badge/AI-Make_the_world_a_better_place-success)](#) [![Free Venezuela](https://img.shields.io/badge/Free-Venezuela_🇻🇪_|_Free_the_world_❤️-ff0000)](#)

![OctoArch](assets/wmremove-transformed.png)

OctoArch is not a simple transactional bot. It is an advanced Cognitive Runtime and Autonomous Agent, allowing you to execute complex workflows, manage servers (via MCP), process documents via WhatsApp/Telegram, and autonomously monitor corporate inboxes (Gmail).

With version 5.0, the system has reached a new paradigm: **AIEOS (AI Entity Object Specification)**, Swarm Intelligence, Single-Core Orchestration, and Zero-Trust Autonomy. OctoArch can now write, debug, and dynamically inject its own TypeScript code into its neural network at runtime, while morphing its personality based on mathematical DNA files under a strict "Titanium Cage" security model.

## ✨ Key Features

🧬 **AIEOS Digital DNA & Dynamic Temperature:** The system abandons text-based prompt roles. Personas are now defined via strict JSON contracts (`logic_weight`, `creativity_weight`, `risk_tolerance`). The Core reads this DNA and physically alters the Gemini API's Temperature and forbidden vocabulary in real-time, switching from a creative Growth Hacker (Temp: 0.85) to a robotic OCR processor (Temp: 0.00) in milliseconds.

🛡️ **Zero-Trust Architecture (Default Sandbox):** "God Mode" by default is dead. If no specific role is invoked, the system forcibly defaults to the `CHAT` concierge persona with restricted `sandbox` access, ensuring maximum security against prompt injections or accidental destructive commands.

🧠 **Infinite Cognitive Memory (Supabase):** Interaction-isolated, multi-tenant session backed by PostgreSQL. Restores context seamlessly after reboots.

🌐 **Unified Cognitive Core (Gemini 3.0):** Powered by the latest Gemini Flash engine. A single-core architecture for both the Virtual CEO and the specialized Swarm Workers, ensuring zero-latency handoffs.

⛓️ **Titanium Cage Security (Path Jailing & PBAC):** The system implements Policy-Based Access Control via AIEOS capabilities and a mathematical path validator. Any attempt by the AI to perform a Path Traversal attack (`../`) or access files outside the authorized workspace results in an immediate security block.

🤖 **Swarm Intelligence & Autonomous Tool Forging:** Spawns a Sub-Agent (Worker) in an isolated sandbox (`src/temp_tools`), consumes secrets via `WORKER_SECRETS`, runs `tsc` for validation, and promotes code to `src/dynamic_tools` via Hot-Swap.

📸 **InvoDex Zero-Friction Flow:** Visual AI extraction for invoices sent via WhatsApp/Telegram with deterministic JSON injection into ERPs via MCP.

## 🚀 Initialization and Usage
Start the Main Server:
```bash
npm run start

Connect your Channels:

WhatsApp: Scan the QR code in the terminal.

Telegram: Token connects instantly via Polling.

Gmail: OAuth2 persistent token managed in workspace/token.json.

💬 Commands and Personas (AIEOS DNA)
!ping: Returns server, vision, and sandbox status.

octo sw [task]: Swarm Mode - Activates the CoderLLM Worker (High Autonomy, 5 Iterations) to forge new tools.

octo chat [task]: Safe Mode - (Default) Concierge/Assistant. Friendly, high creativity, restricted to basic tools.

octo dev [task]: Software Engineer - Architecture & coding mode. Admin access, strict TypeScript, logic-driven.

octo cfo [task]: Chief Financial Officer - Mathematical analyst. Zero risk tolerance, strict PBAC compliance.

octo cmo [task]: Chief Marketing Officer - Growth Hacker. High creativity, ROI-focused, persuasive copywriter.

octo research [task]: OSINT Investigator - Zero hallucinations. Strict fact-checking, neutral academic tone.

octo invodex [task]: Fiscal Extractor - Robotic OCR engine. 0.0 Temperature, strict JSON output, validation algorithms.

📂 Module Architecture (Clean Architecture)

octoarch_core/
├── src/
│   ├── config/          # Zod schemas, env validation, and WORKER_SECRETS
│   ├── core/
│   │   ├── llm.ts               # 🧠 Cognitive CEO (Slim Architecture + Hot-Swap)
│   │   ├── prompt_manager.ts    # 🧬 AIEOS DNA Injector & Temperature Controller
│   │   ├── tool_orchestrator.ts # 🛠️ Execution delegator (RBAC Filter)
│   │   └── session_manager.ts   # 🐘 Cloud memory synchronization
│   ├── identity/        # 🧬 AIEOS Digital DNA Vault
│   │   └── vault/       # JSON Persona contracts (cfo, dev, cmo, etc.)
│   ├── types/           # 📜 Core TypeScript Interfaces (IAieosIdentity)
│   ├── swarm/           # 🧬 Sub-Agent Auto-Programming System
│   │   ├── spawner.ts           # 🏗️ Process forking & SIGKILL safety
│   │   ├── worker.ts            # 👷 Autonomous logic & iteration control
│   │   └── coder_llm.ts         # High-precision XML Tagged interface
│   ├── temp_tools/      # 🛡️ Safe sandbox for Worker compilation
│   ├── dynamic_tools/   # 🚀 Auto-generated tools (Production)
│   ├── tools/
│   │   ├── files.ts             # 📂 Secure File System (Path Jailing)
│   │   └── shell.ts             # 💻 Command execution (RBAC Protected)

OctoArch - Forging the future of autonomous systems, one iteration at a time.
## ⚖️ License
This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for details.