# 🛡️ OctoArch Security Policy

Information security and the integrity of enterprise systems are the highest priority in the development of OctoArch. We take any vulnerability that could affect the local environment, tool execution, or data processing very seriously.

## 📌 Supported Versions

Currently, only the most recent versions receive security patches and core architecture updates.

| Version | Security Support | Notes |
| :--- | :--- | :--- |
| **v4.8.x** | ✅ Supported | Current architecture with RBAC and FileValidator. |
| **v4.5.x** | ⚠️ Limited | Critical patches only. |
| **< v4.4** | ❌ Unsupported | Please upgrade to v4.8+. |

## 🕵️‍♂️ How to Report a Vulnerability

**Please DO NOT open a public "Issue" to report a security flaw.** Making it public before a patch is available puts all OctoArch users at risk.

If you discover a vulnerability (e.g., an RBAC role system bypass, a terminal command injection, or a failure in forensic file validation), please report it privately:

1. **Via GitHub:** Go to the **Security** > **Advisories** tab and click on "Report a vulnerability" to create a private report.
2. **Via Email:** Send a direct email to the project's lead maintainer with the technical details and steps to reproduce the flaw.

### ⏱️ What to Expect
We are committed to investigating all legitimate reports. You will receive an acknowledgment of receipt within 48 hours, followed by a technical evaluation and an estimated timeline for the patch release (Hotfix).

## 🧬 Security Scope

Our threat model considers the following components critical:
* **AgentExecutor (RBAC):** Unauthorized privilege escalation (e.g., the `CHAT` role executing `DEV` commands).
* **FileValidator:** "Magic Numbers" scanner evasion or injection of malware disguised as images/documents.
* **Prompt Injection:** Attempts to force the LLM to reveal environment variables (`env.ts`) or credentials (`tokens.json`).

Any findings in these areas will be treated with the utmost severity. Thank you for helping us keep OctoArch an impenetrable fortress! 🐙