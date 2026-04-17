---
title: Security
tags: [security]
sources: [PLAN.md]
created: 2026-04-15
updated: 2026-04-15
---

# Security

Security considerations for Command Shelf, covering input validation, file handling, and terminal execution.

---

## Threat Model

Command Shelf runs as a VS Code extension with the same permissions as VS Code itself. The primary attack surface is:

1. **Malicious `.vscode/command-shelf.json`** — A crafted JSON file in a cloned repo could contain unexpected data.
2. **Command injection via labels** — Labels are displayed in the UI but should never be executed.
3. **Path traversal** — File paths should not escape the `.vscode/` directory.

## Mitigations

### JSON Schema Validation

On load, the [[command-store]] validates the entire JSON structure:
- `version` must be a supported integer.
- `commands` and `groups` must be arrays.
- Each entry must have required fields with correct types.
- IDs must be strings; labels and commands must be non-empty strings.
- Invalid entries are dropped with a warning, not executed.

### Label Sanitization

- Labels are used only for display in `TreeItem.label` and as group references.
- Labels are never interpolated into file paths, terminal commands, or code.
- Max length enforced (100 chars) to prevent UI overflow.

### Command Execution

- The `command` field is sent directly to the terminal via `sendText()`. This is **by design** — the user explicitly saved this command to run it.
- No shell escaping or sanitization is applied to commands, because the user authored them. This is the same trust model as typing in a terminal.
- **Important**: Users should review `.vscode/command-shelf.json` when cloning untrusted repos, just as they should review `.vscode/tasks.json` and `.vscode/launch.json`.

### File Path Safety

- The extension only reads/writes `.vscode/command-shelf.json` in the current workspace root.
- The file path is constructed from `vscode.workspace.workspaceFolders[0].uri` + `.vscode/command-shelf.json` — no user-controlled path segments.
- No dynamic file creation based on user input (labels, commands, etc.).

### Atomic Writes

Writes use a temp-file-then-rename strategy to prevent corruption. See [[decisions]].

## Snyk Scanning

Per project policy, all new TypeScript source files are scanned with Snyk Code before release. Any findings are addressed and rescanned until clean.

## OWASP Relevance

| OWASP Top 10 Category | Relevance | Status |
|---|---|---|
| A01: Broken Access Control | N/A — local extension, no auth | Not applicable |
| A02: Cryptographic Failures | No crypto used | Not applicable |
| A03: Injection | Terminal commands are user-authored, not interpolated | Mitigated by design |
| A04: Insecure Design | JSON file in untrusted repo | Documented risk, user must review |
| A05: Security Misconfiguration | N/A — no server | Not applicable |
| A06: Vulnerable Components | Minimal dependencies | Monitored via Snyk |
| A07: Auth Failures | N/A — no auth | Not applicable |
| A08: Data Integrity Failures | Atomic writes prevent corruption | Mitigated |
| A09: Logging Failures | N/A — local tool | Not applicable |
| A10: SSRF | N/A — no network requests | Not applicable |

---

## See Also

- [[command-store]]
- [[decisions]]
- [[open-source]]
- [[data-model]]
