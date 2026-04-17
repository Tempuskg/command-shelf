---
title: Design Decisions
tags: [decision]
sources: [PLAN.md]
created: 2026-04-15
updated: 2026-04-15
---

# Design Decisions

Key design choices for Command Shelf v1, with rationale and alternatives considered.

---

## 1. Storage: `.vscode/command-shelf.json`

**Decision**: Store commands in a JSON file at `.vscode/command-shelf.json`.

**Rationale**:
- **Workspace-scoped by nature** — the file lives in the project, not in global VS Code state.
- **Git-trackable** — teams can commit and share the command shelf.
- **Human-readable** — users can hand-edit the file if needed.
- **Inspectable** — easy to debug, no hidden state.
- **Portable** — works if the user switches editors or machines (the file is just JSON).

**Alternatives considered**:
- `ExtensionContext.workspaceState`: Hidden, not git-trackable, not human-readable. Rejected.
- `settings.json` contribution: Would pollute the settings namespace and mix concerns. Rejected.
- SQLite / IndexedDB: Overkill for a flat list of commands. Rejected.

---

## 2. Groups: Flat Only (No Nesting)

**Decision**: Groups are one level deep. No groups-within-groups.

**Rationale**:
- **Simplicity** — Most users have 5-20 commands. Deep nesting adds complexity without proportional value.
- **TreeView simplicity** — Nested groups would complicate `getChildren()`, drag-and-drop target resolution, and the data model.
- **UX clarity** — Flat groups are scannable at a glance. Nesting hides things.

**Alternatives considered**:
- Nested groups (tree of groups): Deferred to post-v1 if community demand exists.
- Tags instead of groups: More flexible but harder to render in a TreeView. Could be a future addition.

---

## 3. Scope: Workspace-Only

**Decision**: No global shelf in v1. Commands exist only per workspace.

**Rationale**:
- **Matches the use case** — "common commands for *this* project" is the primary need.
- **Avoids complexity** — Global + workspace merge logic, conflict resolution, and two-pane UI are significant work.
- **Clear mental model** — One shelf, one workspace, one file.

**Alternatives considered**:
- Global + workspace dual shelf: Deferred to post-v1.
- User-settings-based global shelf: Would work but mixes concerns with workspace commands.

---

## 4. Terminal Reuse

**Decision**: Reuse a single named terminal `"Command Shelf"`.

**Rationale**:
- **No terminal clutter** — Running 10 commands doesn't spawn 10 terminals.
- **Scrollback context** — Users can see previous command output.
- **User override** — Users who want separate terminals can open them manually.

**Alternatives considered**:
- New terminal per run: Clutters the panel. Rejected for v1.
- User-configurable (per-command or per-group terminals): Good idea, deferred to post-v1.

---

## 5. Group Reference by Label (Not ID)

**Decision**: `commands[].group` is a string matching `groups[].label`, not a UUID.

**Rationale**:
- **Human-readable JSON** — When hand-editing the file, `"group": "Build"` is clearer than `"group": "a1b2c3d4-..."`.
- **Simpler mental model** — The group name *is* the identity for the user.
- **Trade-off acknowledged** — Renaming a group requires updating all referencing commands. The [[command-store]] handles this atomically.

**Alternatives considered**:
- Reference by ID: More robust but worse DX for hand-editing. Rejected for v1.

---

## 6. No `tasks.json` Integration

**Decision**: Command Shelf is independent of VS Code's built-in task system.

**Rationale**:
- **Different purpose** — tasks.json is for build system integration with problem matchers, dependencies, etc. Command Shelf is a simple "run this string in a terminal" tool.
- **Simpler UX** — The whole point is to be easier than editing tasks.json.
- **No conflict** — Both can coexist. Users who need problem matchers use tasks.json; users who want quick commands use Command Shelf.

---

## 7. Atomic File Writes

**Decision**: Write to `.tmp` then rename, rather than writing directly.

**Rationale**:
- Prevents data loss if the process crashes mid-write.
- Rename is atomic on most filesystems (NTFS, ext4, APFS).
- Minimal overhead for a small JSON file.

---

## See Also

- [[overview]]
- [[data-model]]
- [[command-store]]
- [[terminal-integration]]
- [[architecture]]
