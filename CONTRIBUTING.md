# Contributing to OctoArch 🐙

Thank you for your interest in improving OctoArch! This project was born with the vision of creating a local, modular *Cognitive Runtime* highly capable of integrating with any system via the MCP protocol.

## How can you help?

Currently, the core cognitive engine is highly stable. The areas where the community can add the most value are:

1. **MCP (Model Context Protocol) Servers:** If you build an MCP server to connect OctoArch with Notion, Spotify, Home Assistant, or terminal tools, please open a PR to add it to our recommended integrations list!
2. **Cognitive Loop Improvements:** Optimizations in `src/core/llm.ts` to reduce token consumption and improve reasoning speed.
3. **Native Tools:** New system plugins in the `src/tools/` directory.

## Development Guidelines

1. **Clean Code:** Use strict TypeScript. Keep functions small, modular, and well-documented.
2. **Security First:** If you add a tool that modifies the file system or executes commands (`ShellTool` / `FileTool`), you must include strict validations against *Path Traversal* attacks and limit the allowed command scope.
3. **Agnosticism:** The core of OctoArch should not depend on specific databases or commercial ERPs. Keep specific business logic inside isolated MCP connectors.

## Pull Request (PR) Process

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/MyNewTool`).
3. Commit your changes with descriptive messages.
4. Push to the branch (`git push origin feature/MyNewTool`).
5. Open a Pull Request detailing what problem your code solves and how to test it.