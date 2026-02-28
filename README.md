# 🐙 OctoArch - The Cognitive Runtime

[![AI for Good](https://img.shields.io/badge/AI-Make_the_world_a_better_place-success)](#) [![Free Venezuela](https://img.shields.io/badge/Free-Venezuela_🇻🇪_|_Free_the_world_❤️-ff0000)](#)

![OctoArch](assets/wmremove-transformed.png)

# 📱 OctoArch WhatsApp Interface

The OctoArch WhatsApp module is not a simple transactional bot. It is the mobile gateway to the **Cognitive Runtime**, allowing you to execute complex workflows, manage servers (via MCP), and process documents directly from your phone using the `whatsapp-web.js` library.

## ✨ Key Features

- 🧠 **Direct Connection to the Cognitive Core**: Each phone number maintains an isolated session with short-term memory (Integrated Garbage Collector and TTL).
- 📸 **InvoDex Zero-Friction Flow**: Send a photo of an invoice without text. The system will auto-detect the intent (`INVODEX`), extract the 9 tax fields, generate the JSON, and inject it into the ERP via MCP.
- 🔀 **Role Routing**: Use prefixes like `octo dev`, `octo research`, or `octo chat` to force the AI to adopt specific profiles with pre-assigned tools.
- 💾 **Local Auto-Save**: Processed documents (like invoices) are automatically backed up in `workspace/invodex_wa/`.
- 🔐 **Persistent Authentication**: Log in only once with a QR code; the session is encrypted and saved in `workspace/auth_wa/`.

## 🚀 Initialization and Usage

The WhatsApp service is deeply integrated into the OctoArch lifecycle. **You do not need to start it separately.**

1. **Start the Main Server**:
   From the root of the OctoArch project, run:
   ```bash
   npm run dev

   Scan the QR Code:
A QR code will appear in your terminal. Open WhatsApp on your phone > Settings > Linked devices > Link a device, and scan the screen.

Ready! You will see the following message in the console: ✅ ¡CONECTADO! Octoarch v4.0 ya tiene WhatsApp y está pensando.

💬 Commands and Syntax
The agent automatically reacts to messages sent to its chat:

Zero-Friction Mode (Recommended for SMBs):

Send a photo (e.g., Invoice). The system automatically assumes INVODEX.

Diagnostic Command:

!ping -> Returns the server status.

Multi-Agent Command:

octo chat What can you do? -> Safe conversational mode.

octo dev check the src folder -> Developer Mode (Access to terminal and files).

octo research investigate local weather -> Researcher Mode (Access to Puppeteer).

octo [any prompt] -> Auto Mode. The system will deduce the best role.

📂 Module Architecture
The service no longer lives in an isolated folder, it is part of the core tools:

octoarch_core/
├── src/
│   ├── tools/
│   │   └── whatsapp.ts        # 📱 WhatsApp Web JS Engine and Router
│   ├── core/
│   │   └── llm.ts             # 🧠 Cognitive brain that processes messages
│   └── index.ts               # 🚀 Orchestrator that initializes the service
├── workspace/
│   ├── auth_wa/               # 🔐 WhatsApp session files (Ignored in Git!)
│   └── invodex_wa/            # 💾 Auto-saved invoice JSONs

🛠️ Security Notes
Origin Restriction: Currently, the code is configured with if (!msg.fromMe) return; so that it only responds to messages sent by yourself (ideal for testing and personal use). To enable it as a customer service tool, comment out that line with caution.

Privacy: Sent images are processed in base64 in memory and sent to Gemini. Ensure you comply with your corporate data privacy policies.