# Contributing to OctoArch 🐙

Thank you for your interest in improving OctoArch! This project was born with the vision of creating a local, modular, and stateful *Cognitive Runtime* highly capable of integrating with any system via the MCP protocol. 

With the release of v4.2+, OctoArch now strictly follows **Clean Architecture** principles and enterprise-grade security standards.

## How can you help?

Currently, the core cognitive engine is highly stable and modularized. The areas where the community can add the most value are:

1. **MCP (Model Context Protocol) Servers:** If you build an MCP server to connect OctoArch with Notion, Spotify, Home Assistant, SQL databases, or commercial ERPs (like SAP/Profit Plus), please open a PR to add it to our recommended integrations list!
2. **Cognitive Loop & Orchestration:** * Improvements in reasoning and memory management should go to `src/core/llm.ts`.
   * Improvements in tool execution, delegation, and local-bypass logic should go to `src/core/tool_orchestrator.ts`.
3. **Native Tools:** New system plugins in the `src/tools/` directory (e.g., advanced web scraping, native PDF generation).

## Development Guidelines

1. **Clean Architecture (No "God Classes"):** Use strict TypeScript. Keep functions small and modular. Do not overload `llm.ts` with execution logic; always delegate tool execution to `tool_orchestrator.ts`.
2. **Security First (Zero-Trust):** * If you add a tool that modifies the file system (`FileTool`), you **MUST** include mathematical validations against *Path Traversal* attacks (normalizing and strictly comparing prefixes with the workspace path).
   * If you add shell execution (`ShellTool`), you **MUST** use a strict AllowList and avoid commands that can exfiltrate data (like `type`, `cat`, or `echo`).
3. **Agnosticism:** The core of OctoArch should **never** depend on specific databases or commercial ERPs. Keep specific business logic (like InvoDex's SQL/API calls) inside isolated MCP connectors or generic Webhook tools.
4. **Memory Management:** OctoArch is a stateful system. If you implement features that consume RAM (like Puppeteer tabs or conversation sessions), you must ensure they have proper cleanup mechanisms (e.g., `finally` blocks closing pages, TTL Garbage Collectors).

## Pull Request (PR) Process

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/MyNewTool`).
3. Commit your changes with descriptive messages.
4. Test your changes locally ensuring the Cognitive Loop and the Security Shields (Path Traversal) are not broken.
5. Push to the branch (`git push origin feature/MyNewTool`).
6. Open a Pull Request detailing what problem your code solves and how to test it.

---
*Happy coding, let's build the future of autonomous systems together!* 🐙