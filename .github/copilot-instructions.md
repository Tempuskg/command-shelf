# Command Shelf — Copilot Instructions

## Project Overview

Command Shelf is an open-source VS Code extension (MIT license) that provides a sidebar TreeView for saving, organizing, and running terminal commands. Commands are stored in `.vscode/command-shelf.json`, scoped per workspace. TypeScript, esbuild bundler, ES2020 target.

## Architecture

Three-layer architecture: **data → view → commands**, wired in the entry point.

| Module | File | Role |
|---|---|---|
| Entry point | `src/extension.ts` | Activate/deactivate, register commands and providers |
| Models | `src/models.ts` | Interfaces: `ShelfCommand`, `ShelfGroup`, `ShelfData` |
| Data layer | `src/CommandStore.ts` | CRUD on `.vscode/command-shelf.json`, file watch, event emitter |
| View layer | `src/CommandShelfProvider.ts` | `TreeDataProvider<ShelfItem>` + `TreeDragAndDropController` |
| View items | `src/CommandShelfItem.ts` | `TreeItem` subclasses for group and command nodes |

**Dependency direction**: `extension.ts` → `CommandStore` + `CommandShelfProvider` → `CommandShelfItem` + `models.ts`. No circular dependencies. The store knows nothing about the view.

## Key Design Decisions (v1)

- **Flat groups only** — no nesting. `group` field is a plain string, not a path.
- **Workspace-only** — no global shelf. One shelf per workspace.
- **Single named terminal** — reuse `"Command Shelf"` terminal for all runs via `sendText()`.
- **Group reference by label** (not ID) — `commands[].group` matches `groups[].label`. Renaming a group must atomically update all referencing commands.
- **No `tasks.json` integration** — independent of VS Code's task system.
- **Atomic writes** — write to temp file, then rename, to prevent corruption.

## Data Model (`.vscode/command-shelf.json`)

```json
{
  "version": 1,
  "commands": [
    { "id": "<uuid>", "label": "Start Dev", "command": "npm run dev", "group": "Dev", "sortOrder": 0 }
  ],
  "groups": [
    { "id": "<uuid>", "label": "Dev", "sortOrder": 0 }
  ]
}
```

- IDs are UUIDs generated via `crypto.randomUUID()`.
- `sortOrder` is an integer driving display order within scope.
- `group` is `string | null` — null means ungrouped.

## TypeScript Interfaces (`src/models.ts`)

```typescript
interface ShelfCommand { id: string; label: string; command: string; group: string | null; sortOrder: number; }
interface ShelfGroup { id: string; label: string; sortOrder: number; }
interface ShelfData { version: number; commands: ShelfCommand[]; groups: ShelfGroup[]; }
```

## VS Code Commands

| ID | Trigger |
|---|---|
| `commandShelf.addCommand` | View title bar `$(add)` |
| `commandShelf.editCommand` | Context menu on command |
| `commandShelf.deleteCommand` | Context menu on command |
| `commandShelf.runCommand` | Inline `$(play)` on command + click |
| `commandShelf.copyCommand` | Context menu on command |
| `commandShelf.addGroup` | View title bar `$(new-folder)` |
| `commandShelf.editGroup` | Context menu on group |
| `commandShelf.deleteGroup` | Context menu on group |

Context values: commands use `"shelfCommand"`, groups use `"shelfGroup"`.

## Security Rules

- Validate JSON schema on load — drop invalid entries with a warning, never execute them.
- Labels are display-only — never interpolate into file paths, commands, or code.
- Enforce max label length (100 chars).
- File path is always `workspaceFolders[0].uri` + `.vscode/command-shelf.json` — no user-controlled path segments.
- Command strings are sent to terminal as-is (user-authored, same trust model as typing in a terminal).
- Use atomic writes (temp file → rename) for all file mutations.

## Coding Conventions

- Strict TypeScript (`strict: true` in tsconfig).
- Module system: NodeNext.
- Use VS Code API idioms: `EventEmitter`, `TreeDataProvider`, `TreeDragAndDropController`, `FileSystemWatcher`.
- Keep modules focused — one concept per file, no god classes.
- No circular dependencies between modules.
- Minimal external dependencies — prefer VS Code built-in APIs.

## Wiki

The `wiki/` directory is a persistent knowledge base. See `wiki/SCHEMA.md` for full conventions:
- Pages live in `wiki/pages/`, use YAML frontmatter, kebab-case filenames.
- Internal links use `[[page-name]]` wikilink syntax.
- Sources in `wiki/sources/` are **immutable** — never modify them.
- Every page needs a "See Also" section with cross-references.
- Update `wiki/index.md` and `wiki/log.md` when adding/changing pages.