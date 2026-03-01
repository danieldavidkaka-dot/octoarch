# 🐙 OctoArch - The Cognitive Runtime

[![AI for Good](https://img.shields.io/badge/AI-Make_the_world_a_better_place-success)](#) [![Free Venezuela](https://img.shields.io/badge/Free-Venezuela_🇻🇪_|_Free_the_world_❤️-ff0000)](#)

![OctoArch](assets/wmremove-transformed.png)

The OctoArch WhatsApp module is not a simple transactional bot. It is the mobile gateway to the Cognitive Runtime, allowing you to execute complex workflows, manage servers (via MCP), and process documents directly from your phone using the whatsapp-web.js library.

With version 4.2, the module has been upgraded to an Enterprise-Ready standard, featuring byte-level security, centralized prompt management, and strict anti-hallucination protocols.

✨ Key Features
🧠 Direct Connection to the Cognitive Core: Each phone number maintains an isolated session with short-term memory (Integrated Garbage Collector and TTL).

📸 InvoDex Zero-Friction Flow: Send a photo of an invoice without text. The system will auto-detect the intent (INVODEX), extract the tax fields via visual AI, generate a deterministic JSON, and inject it into the ERP via MCP.

🔀 Virtual C-Suite & Role Routing: Use prefixes like octo cfo, octo cmo, or octo dev to force the AI to adopt specific executive profiles with pre-assigned RBAC (Role-Based Access Control) permissions.

🛡️ Military-Grade File Security: The system no longer trusts WhatsApp's reported mimetypes. It uses "Magic Numbers" byte-level validation (file-type buffer analysis) to block malicious payloads (e.g., an .exe disguised as a .jpg).

💾 Local Auto-Save: Processed documents (like invoices) are automatically backed up in workspace/invodex_wa/.

🔐 Persistent Authentication: Log in only once with a QR code; the session is encrypted and saved in workspace/auth_wa/.

🚀 Initialization and Usage
The WhatsApp service is deeply integrated into the OctoArch lifecycle. You do not need to start it separately.

Start the Main Server:
From the root of the OctoArch project, run:

npm run dev

Scan the QR Code:
A QR code will appear in your terminal. Open WhatsApp on your phone > Settings > Linked devices > Link a device, and scan the screen.

Ready! You will see the following message in the console: ✅ ¡CONECTADO! Octoarch v4.2 ya tiene WhatsApp y está pensando.

💬 Commands and Syntax
The agent automatically reacts to messages sent to its chat.

Zero-Friction Mode (Recommended for SMBs/Accounting):

Send a photo (e.g., Invoice). The system automatically assumes the INVODEX role, parses the image, and skips unnecessary conversational text.

Diagnostic Command:

!ping -> Returns the server and vision status.

Virtual C-Suite & Multi-Agent Commands:

octo cfo analyze this budget -> Chief Financial Officer Mode (Strict, analytical, focuses on ROI and metrics. Terminal tools blocked).

octo cmo review this campaign -> Chief Marketing Officer Mode (Creative, persuasive, focuses on conversion and SEO).

octo dev check the src folder -> Developer Mode (Access to terminal, shell commands, and local files).

octo research investigate local weather -> Researcher Mode (Access to web inspection and data synthesis).

octo chat What can you do? -> Safe Conversational Mode (All system-modifying tools are blocked).

octo [any prompt] -> Auto Mode. The system will deduce the best role automatically.

📂 Module Architecture
The service relies on a clean, centralized architecture, eliminating old Regex-based templates:

octoarch_core/
├── src/
│   ├── tools/
│   │   └── whatsapp.ts        # 📱 WhatsApp Web JS Engine, Router & Byte-Scanner
│   ├── core/
│   │   ├── llm.ts             # 🧠 Cognitive brain (Gemini 2.5 Flash + Tool Orchestrator)
│   │   └── prompt_manager.ts  # 🎭 Centralized Dictionary for Roles and System Instructions
│   └── index.ts               # 🚀 Orchestrator that initializes the service
├── workspace/
│   ├── auth_wa/               # 🔐 WhatsApp session files (Ignored in Git!)
│   └── invodex_wa/            # 💾 Auto-saved invoice JSONs

🛠️ Security Notes
Origin Restriction: Currently, the code is configured with if (!msg.fromMe) return; so that it only responds to messages sent by yourself (ideal for testing and personal use). To enable it as a customer service tool, comment out that line with caution.

Anti-Hallucination: The LLM temperature is deliberately frozen at 0.1 for deterministic outputs in critical roles (like CFO or InvoDex).

Privacy: Sent images are processed in base64 in memory and sent to Google Gemini. Ensure you comply with your corporate data privacy policies before uploading sensitive financial data.