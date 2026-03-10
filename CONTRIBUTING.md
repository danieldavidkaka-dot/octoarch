# Contributing to OctoArch 🐙

Thank you for your interest in improving OctoArch! This project was born with the vision of creating a local, modular, and stateful Cognitive Runtime highly capable of integrating with any system via the MCP protocol, native tools, Unified Cognitive Orchestration, and Autonomous Swarm Intelligence.

With the release of v5.0+, OctoArch strictly follows Clean Architecture principles, enterprise-grade security standards, and features a revolutionary Auto-Programming pipeline (Hot-Swapping) backed by Infinite Cloud Memory and the **AIEOS (AI Entity Object Specification)** standard for deterministic, mathematical persona management.

## 🤝 How can you help?
Currently, the core cognitive engine is highly stable. The areas where the community can add the most value are:

* **AIEOS Persona Forging:** Design new mathematical identities (JSON) for the `src/identity/vault/`. We need specialized agents (e.g., Legal Counsel, Data Scientist) perfectly tuned with specific `logic_weight`, `risk_tolerance`, and PBAC capabilities following the `IAieosIdentity.ts` contract.
* **Swarm Intelligence & Bounded Autonomy:** Refining the iteration logic in `src/swarm/worker.ts`. We currently enforce a 3-iteration limit for standard tasks and 5 iterations for `octo sw` authorized flows. Help us optimize the self-correction prompts to fix complex TypeScript errors within these limits.
* **Dynamic Skills (Zero-Code):** Write highly-optimized Markdown manuals (`.md`) teaching the AI specific frameworks or workflows, and submit them to the `workspace/skills/` directory.
* **MCP (Model Context Protocol) Servers:** Build connectors for Notion, SAP, SQL databases, or custom ERPs and submit them to our integrations list.
* **Security & Path Jailing:** Improving the `FileTool` validation logic to ensure absolute isolation. We use strict path normalization and segment checking to prevent any form of escape from the workspace.

## 🛠️ Development Guidelines

### 1. Clean Architecture & Sandbox Isolation
Use strict TypeScript. Keep functions small and modular. Do not overload `llm.ts` with execution logic. Delegations must pass through `tool_orchestrator.ts`. If extending the Swarm, isolate the logic within `src/swarm/` and utilize the `src/temp_tools/` sandbox. Never promote code to `src/dynamic_tools/` without a successful `npx tsc --noEmit` validation.

### 2. Security First (The Titanium Cage Model)
* **Zero-Trust Default:** OctoArch defaults to the `CHAT` persona (Sandbox mode) if no role is specified. Never restore the "God Mode" by default.
* **PBAC via AIEOS (CRITICAL):** Tool execution is now governed by the active persona's DNA. Never bypass the `allowed_tools` or `access_level` defined in the AIEOS JSON. 
* **Path Jailing (CRITICAL):** All file operations must pass through `validatePath`. We use a zero-trust model where `path.resolve` and segment-based filtering prevent Path Traversal. Never use `fs` directly without a validated safe path.
* **Data Ingestion:** If your tool receives files, you MUST NOT trust mimetypes. Pass the buffer through `FileValidator.validateBuffer()` to verify "Magic Numbers".
* **Worker Secrets:** Sub-Agents are strictly prohibited from hardcoding secrets. AI-generated tools must consume credentials exclusively from `env.WORKER_SECRETS`.
* **Bounded Autonomy:** Do not bypass the iteration counters (`maxIterations`). This is our primary defense against "Tool Obsession" and infinite API credit consumption.

### 3. API Protection & Anti-Zombies
Any new child process spawned via `spawner.ts` must include a `SIGKILL` timeout (default 3 mins) to prevent "zombie" processes from hanging in the OS. All HTTP endpoints must be protected by the global Rate Limiter.

### 4. Anti-Hallucination & Dynamic Temperature Standards
We have moved away from static temperatures in the core runtime. Ensure that when adding new LLM calls, you respect the dynamic temperature injected by the `PromptManager` based on the active AIEOS persona's `creativity_weight`. For Worker tasks (CoderLLM), prioritize deterministic outputs (temperature: `0.0` - `0.1`). The CoderLLM must always enforce strict XML-style tagging (`<filename>`, `<code>`) and flawless TypeScript syntax.

### 5. Multi-Tenant Isolation
Ensure strict isolation using `client_id` and `session_id` in Supabase to prevent data bleed. When contributing to the `DynamicRegistry`, ensure `delete require.cache` is used properly to prevent memory leaks during hot-reloads.

## 🚀 Pull Request (PR) Process
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/MyNewTool`).
3. Commit your changes with descriptive messages.
4. **Security Check:** Ensure your changes don't break the Path Jailing, PBAC AIEOS filters, or the Iteration Limiters.
5. Push to the branch (`git push origin feature/MyNewTool`).
6. Open a Pull Request detailing the problem solved and the security tests performed.

## ⚖️ License Notice
By contributing to OctoArch, you agree that your contributions will be licensed under its **Apache 2.0 License**.

Happy coding, let's build the future of autonomous systems together! 🐙