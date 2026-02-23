# 🐙 OctoArch v4.2 - The Cognitive Runtime

[![AI for Good](https://img.shields.io/badge/AI-Make_the_world_a_better_place-success)](#) [![Free Venezuela](https://img.shields.io/badge/Free-Venezuela_🇻🇪_|_Free_the_world_❤️-ff0000)](#)

![OctoArch](assets/wmremove-transformed.png)

**OctoArch** is not just another chatbot. It is an open-source **Cognitive Runtime Environment** powered by Gemini 2.5 Flash. It is designed to orchestrate local workflows, perform deep web research, and connect to any external ecosystem using Anthropic's **MCP (Model Context Protocol)**.

Its native interface isn't a standard web dashboard; it lives directly in your terminal and via **WhatsApp**, giving you a complete systems orchestrator in the palm of your hand.

---

## ✨ Core Features

* 🧠 **Self-Correcting Cognitive Loop:** If a terminal command fails or a web extraction throws an error, OctoArch reads the `stderr` logs, enters *Fix Mode*, and autonomously retries the operation.
* 🔌 **Universal MCP Support:** Built on an *Open Core* architecture. Hot-plug Python, Go, Node.js scripts, or databases to the cognitive engine. OctoArch reads your MCP server tools and decides when to use them.
* 📱 **Headless WhatsApp Interface:** Includes a built-in `whatsapp-web.js` server. Send terminal commands, receive generated PDFs, or request deep web research directly to your phone.
* 🛡️ **Secure Local Execution:** Strict Role-Based Access Control (RBAC) and Path Traversal prevention. The agent operates strictly within an isolated `/workspace` directory.

---

## 📦 Tech Stack & Core Dependencies

OctoArch is built to be fast, modular, and reliable:
* **`@google/generative-ai`**: Core cognitive engine (Gemini 2.5 Flash with native Function Calling).
* **`@modelcontextprotocol/sdk`**: Standardized communication protocol for external tools.
* **`whatsapp-web.js`**: Headless mobile communication bridge.
* **`puppeteer`**: Web extraction and anti-bot evasion for deep research.
* **`express` & `ws`**: Hybrid HTTP/WebSocket server for frontend integrations.

---

## 🚀 Quick Start

### Prerequisites
* Node.js (v18 or higher)
* A free API Key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. Clone this repository:
   ```bash
   git clone [https://github.com/danieldavidkaka-dot/octoarch.git](https://github.com/danieldavidkaka-dot/octoarch.git)
   cd octoarch
Install dependencies:

Bash
npm install
Setup your environment:
Rename the .env.example file to .env and inject your Gemini API Key:

Fragmento de código
PORT=18789
NODE_ENV=development
GEMINI_API_KEY=your_api_key_here
Ignite the engine!

Bash
npm run dev
On first boot, a QR code will appear in your terminal. Scan it with WhatsApp to link the agent.

🛠️ Routing Architecture (Roles)
OctoArch uses a dynamic intent detection system. Send commands from your CLI or WhatsApp using the following structure:

octo [ROLE] [INSTRUCTION]

Usage Examples:
Development / DevOps (Root):

octo dev check our node version and create a test.txt file in the workspace.

Deep Web Research:

octo research investigate example.com pages. Tell me what it's about and summarize.

Casual Chat (With Active Memory):

octo chat do you remember the name of the file we just created?

Auto Mode:

octo analyze this text... (If no role is specified, the system auto-assigns the best context).

🤝 Roadmap & Contributions
This core is 100% Open Source. Our goal is for the community to expand OctoArch's horizons by building new MCP servers (e.g., Home Automation, ERP databases, Spotify, Notion).

If you are interested in building an MCP connector or improving the cognitive engine, please read our CONTRIBUTING.md file.

📄 License
This project is licensed under the MIT License. See the LICENSE file for details.