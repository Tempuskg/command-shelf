---
title: Terminal Integration
tags: [terminal, vs-code-api]
sources: [PLAN.md]
created: 2026-04-15
updated: 2026-04-15
---

# Terminal Integration

When a user runs a command from the shelf, it executes in the VS Code integrated terminal.

---

## Execution Strategy

**Single named terminal, reused across runs.**

1. Look for an existing terminal named `"Command Shelf"` via `vscode.window.terminals.find(t => t.name === 'Command Shelf')`.
2. If found, reuse it.
3. If not found (first run, or user closed it), create a new one via `vscode.window.createTerminal('Command Shelf')`.
4. Show the terminal: `terminal.show(preserveFocus)` — `preserveFocus: true` keeps the editor focused; the terminal panel opens but doesn't steal focus.
5. Send the command: `terminal.sendText(commandString)`.

## Why a Single Named Terminal

- **Simplicity**: Users see one consistent terminal for shelf commands.
- **Context**: Previous command output remains visible (scrollback).
- **User override**: Users can still open additional terminals manually if they need parallel execution.
- **No orphan terminals**: Avoids spawning a new terminal on every click, which would clutter the terminal panel.

See [[decisions]] for the full rationale.

## Behavior Details

- `sendText(command)` appends a newline by default, which executes the command immediately.
- The command runs in whatever shell the terminal is using (user's default shell).
- The working directory is the workspace root (the terminal inherits the workspace folder).
- No `cwd` override per command in v1 — all commands run from workspace root.

## Future Considerations

- **Per-command `cwd`**: Add an optional `cwd` field to `ShelfCommand` so commands can run in subdirectories.
- **Environment variables**: Add optional `env` overrides per command.
- **Terminal per group**: Option to have each group use its own named terminal.
- **Output capture**: Capture terminal output for logging or notification on success/failure.

---

## See Also

- [[commands]]
- [[command-store]]
- [[decisions]]
- [[ux-flows]]
