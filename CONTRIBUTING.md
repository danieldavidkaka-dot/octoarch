Contributing to OctoArch 🐙
Thank you for your interest in improving OctoArch! This project was born with the vision of creating a local, modular, and stateful Cognitive Runtime highly capable of integrating with any system via the MCP protocol.

With the release of v4.2+, OctoArch now strictly follows Clean Architecture principles and enterprise-grade security standards.

How can you help?
Currently, the core cognitive engine is highly stable and modularized. The areas where the community can add the most value are:

MCP (Model Context Protocol) Servers: If you build an MCP server to connect OctoArch with Notion, Spotify, Home Assistant, SQL databases, or commercial ERPs (like SAP/Profit Plus), please open a PR to add it to our recommended integrations list!

Cognitive Loop & Orchestration: * Improvements in reasoning and memory management should go to src/core/llm.ts.

Improvements in tool execution, delegation, and local-bypass logic should go to src/core/tool_orchestrator.ts.

Prompt Engineering & Virtual C-Suite: * All system instructions, C-Suite roles (CFO, CMO, DEV), and context injections are centralized in src/core/prompt_manager.ts. If you want to add a new role (e.g., CTO or HR_MANAGER), this is the only file you need to modify.

Native Tools: New system plugins in the src/tools/ directory (e.g., advanced web scraping, native PDF generation).

Development Guidelines
Clean Architecture (No "God Classes" or Scattered Templates): Use strict TypeScript. Keep functions small and modular. Do not overload llm.ts with execution logic. Furthermore, do not create separate .ts or .txt files for prompts; always use the PromptManager.

Security First (Zero-Trust & Enterprise-Grade): * File System: If you add a tool that modifies the file system (FileTool), you MUST include mathematical validations against Path Traversal attacks (normalizing and strictly comparing prefixes with the workspace path).

Terminal: If you add shell execution (ShellTool), you MUST use a strict AllowList and avoid commands that can exfiltrate data.

Data Ingestion: If your tool receives files from external sources (like WhatsApp or HTTP), you MUST validate the file's "Magic Numbers" at the byte level (using file-type). Never trust the provided mimetype.

API Protection: Any new HTTP endpoints must be protected by the Rate Limiter configured in server.ts.

Anti-Hallucination Standards: OctoArch is built for business environments. When tweaking the LLM parameters or adding financial/analytical roles, prioritize deterministic outputs (e.g., temperature: 0.1) over creative guessing.

Agnosticism: The core of OctoArch should never depend on specific databases or commercial ERPs. Keep specific business logic (like InvoDex's SQL/API calls) inside isolated MCP connectors or generic Webhook tools.

Memory Management: OctoArch is a stateful system. If you implement features that consume RAM (like Puppeteer tabs or conversation sessions), you must ensure they have proper cleanup mechanisms (e.g., finally blocks closing pages, TTL Garbage Collectors).

Pull Request (PR) Process
Fork the repository.

Create your feature branch (git checkout -b feature/MyNewTool).

Commit your changes with descriptive messages.

Test your changes locally ensuring the Cognitive Loop, Role-Based Access Control (RBAC), and the Security Shields are not broken.

Push to the branch (git push origin feature/MyNewTool).

Open a Pull Request detailing what problem your code solves and how to test it.

Happy coding, let's build the future of autonomous systems together! 🐙