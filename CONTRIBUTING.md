# Contributing to OctoArch 🐙

Thank you for your interest in improving OctoArch! This project was born with the vision of creating a local, modular, and stateful Cognitive Runtime highly capable of integrating with any system via the MCP protocol and native tools.

With the release of **v4.6+**, OctoArch strictly follows Clean Architecture principles, enterprise-grade security standards, and features a dynamic Skills architecture.

## How can you help?

Currently, the core cognitive engine is highly stable. The areas where the community can add the most value are:

1.  **Dynamic Skills (Zero-Code):** You don't need to know TypeScript to contribute! Write highly-optimized Markdown manuals (`.md`) teaching the AI specific frameworks or workflows, and submit them to the `workspace/skills/` directory.
2.  **MCP (Model Context Protocol) Servers:** If you build an MCP server to connect OctoArch with Notion, Spotify, Home Assistant, SQL databases, or commercial ERPs (like SAP/Profit Plus), please open a PR to add it to our recommended integrations list.
3.  **Native Tools:** Build new system plugins in the `src/tools/` directory (e.g., native PDF generation, advanced calendar management).
4.  **Cognitive Loop:** Improvements in reasoning, context compression, and memory management in `src/core/llm.ts`.

## Development Guidelines

### 1. Clean Architecture (No "God Classes")
Use strict TypeScript. Keep functions small and modular. Do not overload `llm.ts` with execution logic. Delegations must pass through `tool_orchestrator.ts`. Do not create random `.ts` or `.txt` files for core prompts; always use the `PromptManager`.

### 2. Security First (Zero-Trust & Enterprise-Grade)
* **Data Ingestion (CRITICAL):** If your tool receives files from external sources (WhatsApp, Gmail, HTTP), you **MUST NEVER** trust the provided mimetype or extension. You must pass the raw buffer through `FileValidator.validateBuffer(buffer, name)` to verify its "Magic Numbers".
* **File System:** If you add a tool that modifies the file system, you MUST include mathematical validations against Path Traversal attacks (normalizing and strictly comparing prefixes with the workspace path).
* **Terminal:** Shell execution (`ShellTool`) MUST use a strict AllowList. Never allow commands that can easily exfiltrate data (like `curl` or `echo` to arbitrary locations) without heavy sanitization.

### 3. API Protection
Any new HTTP endpoints added to `server.ts` must be protected by the global Rate Limiter to prevent DoS attacks.

### 4. Anti-Hallucination Standards
OctoArch is built for business environments. When tweaking LLM parameters or adding analytical roles, prioritize deterministic outputs (`temperature: 0.1`) over creative guessing.

### 5. Agnosticism
The core of OctoArch should never depend on specific databases or commercial ERPs. Keep specific business logic inside isolated MCP connectors or Dynamic Skills.

### 6. Memory Management
OctoArch is a stateful system. If you implement features that consume RAM (like Puppeteer tabs in `browser.ts` or conversation sessions), you must ensure they have proper cleanup mechanisms (e.g., `finally` blocks closing pages, TTL Garbage Collectors).

## Pull Request (PR) Process

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/MyNewTool`).
3.  Commit your changes with descriptive messages.
4.  Test your changes locally ensuring the Cognitive Loop, Role-Based Access Control (RBAC), and Security Shields (`FileValidator`) are not broken.
5.  Push to the branch (`git push origin feature/MyNewTool`).
6.  Open a Pull Request detailing what problem your code solves and how to test it.

Happy coding, let's build the future of autonomous systems together! 🐙