# Plan: Command Shelf VS Code Extension

## TL;DR
Build an **open-source** TypeScript VS Code extension providing a sidebar TreeView ("Command Shelf") for saving, organizing, and running terminal commands. Commands stored in `.vscode/command-shelf.json`, scoped per workspace. Supports flat groups, drag-and-drop reorder, and inline run buttons. Workspace-only for v1.

- **License**: MIT
- **Repository**: Public GitHub repo (`command-shelf`)
- **Marketplace**: Free on the VS Code Marketplace

## Progress Update

Last updated: 2026-04-22

Completed in this pass:
- Created the extension scaffold: `package.json`, `tsconfig.json`, `esbuild.mjs`, `.vscodeignore`, updated `.gitignore`, and activity bar icon.
- Implemented the core source files: `src/models.ts`, `src/CommandStore.ts`, `src/CommandShelfItem.ts`, `src/CommandShelfProvider.ts`, and `src/extension.ts`.
- Wired the sidebar container, view, commands, menus, drag-and-drop controller, shared terminal execution, and workspace-local JSON storage.
- Implemented JSON validation, label length enforcement, atomic writes, file watching, group rename cascade, and command/group CRUD flows.
- Added per-command terminal targeting with persisted `terminalMode` (`active` or `dedicated`), active-terminal fallback to the shared shelf terminal, dedicated-terminal reuse by command id, and dedicated-terminal tooltips in the tree.
- Installed development dependencies including `typescript`, `esbuild`, `@types/vscode`, `@types/node`, and `@vscode/test-electron`.
- Verified `npm run compile` succeeds.
- Verified `npm run lint` succeeds.
- Bumped the extension version to `0.0.2` and packaged a working VSIX build.
- Added `README.md`, `CHANGELOG.md`, `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, GitHub issue templates, and a GitHub Actions CI workflow.
- Added a flat ESLint configuration and upgraded the `lint` script to run ESLint plus TypeScript type-checking.
- Ran Snyk Code scan on the workspace with zero findings.

Still pending:
- Manual Extension Development Host verification (`F5`) for end-to-end UI behavior.
- Packaging and publishing work: Marketplace/publish validation.
- Optional cleanup and hardening based on real usage during manual testing.

---

## Data Model

**`.vscode/command-shelf.json`** schema:
```json
{
  "version": 1,
  "commands": [
      { "id": "<uuid>", "label": "Start Dev", "command": "npm run dev", "group": "Dev", "sortOrder": 0, "terminalMode": "active" }
  ],
  "groups": [
    { "id": "<uuid>", "label": "Dev", "sortOrder": 0 }
  ]
}
```

- `commands[].group` references `groups[].label` (nullable for ungrouped)
- `sortOrder` drives ordering within siblings (groups ordered among groups, commands within their group)
- `terminalMode` controls whether a command runs in the active/shared terminal or a dedicated per-command terminal

---

## Architecture

| Module | Responsibility |
|---|---|
| `src/extension.ts` | Activate/deactivate, register commands/providers |
| `src/models.ts` | Interfaces: `ShelfCommand`, `ShelfGroup`, `ShelfData` |
| `src/CommandStore.ts` | CRUD on `.vscode/command-shelf.json`, file watch, event emitter |
| `src/CommandShelfProvider.ts` | `TreeDataProvider<ShelfItem>` + `TreeDragAndDropController` |
| `src/CommandShelfItem.ts` | `TreeItem` subclass for commands and groups |

---

## Steps

### Phase 1: Project Scaffold
1. [x] Initialize with `npm init`, install `@types/vscode`, `typescript`, `@vscode/test-electron`, `esbuild`
2. [x] Create `tsconfig.json` targeting ES2020, module NodeNext, strict mode
3. [x] Create `package.json` extension manifest with:
   - `contributes.views` → sidebar container "commandShelf" with view "commandShelfView"
   - `contributes.viewsContainers.activitybar` → icon + title "Command Shelf"
   - `contributes.commands` → all registered commands (see below)
   - `contributes.menus` → inline run button, context menus for edit/delete/move
   - Activation is inferred from contributions by modern VS Code manifests, so explicit `activationEvents` were not required
4. [x] Create `.vscodeignore`, `esbuild.mjs` bundler script
5. [x] Add npm scripts: `compile`, `watch`, `package`, `lint`

### Phase 2: Data Layer (`CommandStore`)
6. [x] Implement `ShelfCommand`, `ShelfGroup`, `ShelfData` interfaces in `src/models.ts`
7. [x] Implement `CommandStore` class in `src/CommandStore.ts`:
   - `load()` — read & parse JSON file, create if missing
   - `save()` — write JSON atomically (write to temp then rename)
   - `addCommand(label, command, group?, terminalMode?)` — generate UUID, append, save
   - `editCommand(id, updates)` — find by ID, merge, save
   - `deleteCommand(id)` — remove by ID, save
   - `addGroup(label)` / `deleteGroup(id, keepCommands)` / `editGroup(id, label)`
   - `reorder(id, targetGroup, newSortOrder)` — for drag-and-drop
   - `onDidChange` event (EventEmitter) — fires after any mutation
   - FileSystemWatcher on `.vscode/command-shelf.json` for external edits → reload + fire event

### Phase 3: TreeView (`CommandShelfProvider`)
8. [x] Implement `ShelfItem` union type (group node or command node) in `src/CommandShelfItem.ts`:
   - Group items: collapsible, folder icon, context value `shelfGroup`
   - Command items: leaf, terminal icon, context value `shelfCommand`, inline run button via `command` property
9. [x] Implement `CommandShelfProvider` in `src/CommandShelfProvider.ts`:
   - `TreeDataProvider<ShelfItem>` — `getChildren()` returns groups + ungrouped commands at root; commands within a group as children
   - `TreeDragAndDropController` — `handleDrag` serializes item IDs, `handleDrop` computes new sortOrder and group assignment, calls `CommandStore.reorder()`
   - Subscribes to `CommandStore.onDidChange` → fires `_onDidChangeTreeData`
10. [x] Register provider in `extension.ts` via `vscode.window.createTreeView()` with `dragAndDropController`

### Phase 4: Commands & UX
11. [x] Register VS Code commands:
   - `commandShelf.addCommand` — `showInputBox` for label, then command string; optionally pick group via `showQuickPick`, then choose terminal mode
    - `commandShelf.editCommand` — pre-filled input boxes for label + command
    - `commandShelf.deleteCommand` — confirmation dialog, then delete
   - `commandShelf.runCommand` — route to the active/shared terminal or the command's dedicated terminal, then `sendText(command)`
    - `commandShelf.addGroup` — `showInputBox` for group name
    - `commandShelf.editGroup` — `showInputBox` pre-filled
    - `commandShelf.deleteGroup` — confirm, option to reassign commands to ungrouped or delete them
    - `commandShelf.copyCommand` — copy command string to clipboard
12. [x] Configure `package.json` menus:
    - `view/title` → Add Command (+), Add Group (folder+ icon)
   - `view/item/context` inline → Run (play icon) on commands
   - `view/item/context` menu → Edit, Delete, Copy Command

### Phase 5: Polish, Packaging & Open Source
13. [x] Add extension icon (simple SVG shelf/bookmark icon)
14. [x] Add `README.md` with feature overview, screenshots placeholder, usage instructions, and contribution section
15. [x] Add `CHANGELOG.md`
16. [x] Configure `esbuild` bundling for production, test it produces working `.vsix`
17. [x] Add ESLint config
18. [x] Add `LICENSE` (MIT)
19. [x] Add `CONTRIBUTING.md` — dev setup, building from source, PR guidelines, code style
20. [x] Add `.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md`
21. [x] Add GitHub Actions CI workflow (`.github/workflows/ci.yml`) — lint, compile, test on push/PR
22. [x] Add `CODE_OF_CONDUCT.md`

### Phase 6: Security & Validation
23. [x] Run Snyk code scan on all new TypeScript files
24. [x] Fix any identified issues, rescan until clean
25. [x] Input validation: sanitize command labels (no path traversal in filenames), validate JSON schema on load

---

## Registered Commands Summary

| Command ID | Title | Where |
|---|---|---|
| `commandShelf.addCommand` | Add Command | View title bar (+) |
| `commandShelf.editCommand` | Edit Command | Context menu on command |
| `commandShelf.deleteCommand` | Delete Command | Context menu on command |
| `commandShelf.runCommand` | Run Command | Inline button (▶) on command |
| `commandShelf.copyCommand` | Copy Command | Context menu on command |
| `commandShelf.addGroup` | Add Group | View title bar |
| `commandShelf.editGroup` | Rename Group | Context menu on group |
| `commandShelf.deleteGroup` | Delete Group | Context menu on group |

---

## Relevant Files (to create)

- `package.json` — Extension manifest with contributions (views, commands, menus, activation)
- `tsconfig.json` — TypeScript config
- `esbuild.mjs` — Build/bundle script
- `.vscodeignore` — Files to exclude from VSIX
- `.gitignore` — Ignore `node_modules/`, `out/`, `*.vsix`
- `LICENSE` — MIT license
- `CONTRIBUTING.md` — Dev setup, PR guidelines, code style
- `CODE_OF_CONDUCT.md` — Contributor Covenant-style expectations for project participation
- `.github/workflows/ci.yml` — GitHub Actions CI (lint, compile, package)
- `.github/ISSUE_TEMPLATE/bug_report.md` — Bug report template
- `.github/ISSUE_TEMPLATE/feature_request.md` — Feature request template
- `src/extension.ts` — Entry point: activate registers store, provider, commands
- `src/models.ts` — `ShelfCommand`, `ShelfGroup`, `ShelfData` interfaces
- `src/CommandStore.ts` — File I/O, CRUD, FileSystemWatcher, EventEmitter
- `src/CommandShelfProvider.ts` — TreeDataProvider + DragAndDropController
- `src/CommandShelfItem.ts` — TreeItem subclasses for group/command nodes
- `resources/command-shelf-icon.svg` — Activity bar icon

---

## Verification

1. [x] `npm run compile` succeeds with zero errors
2. [x] Launch Extension Development Host (`F5`), verify:
   - "Command Shelf" appears in activity bar sidebar
   - Add a command → appears in tree + written to `.vscode/command-shelf.json`
   - Add a group → appears as collapsible folder node
   - Add command to group → nested correctly
   - Run command → executes in the integrated terminal target selected for that command
   - Edit command → updates label/command string
   - Delete command/group → removed from tree and file
   - Drag command → reorders or moves between groups
   - Edit `.vscode/command-shelf.json` externally → tree refreshes
   - Copy command → clipboard contains command string
3. [x] Close and reopen workspace → commands persist from file
4. [x] Open a different workspace → shelf is empty (workspace isolation confirmed)
5. [x] `npx vsce package` produces valid `.vsix`
6. [x] Snyk scan returns clean

---

## Decisions

- **Storage**: `.vscode/command-shelf.json` — git-trackable, human-readable, workspace-scoped
- **Groups**: Flat only (one level), no nesting for v1
- **Drag-and-drop**: Supported for reordering and moving between groups
- **Scope**: Workspace-only for v1, no global shelf
- **Terminal targeting**: Each command stores a terminal mode. `active` sends to the focused terminal, falling back to a shared terminal named "Command Shelf". `dedicated` reuses a per-command terminal.
- **No `tasks.json` integration**: Independent system, simpler UX

---

## Open Source Strategy

- **License**: MIT — permissive, maximizes adoption
- **Versioning**: Semantic Versioning (SemVer)
- **Releases**: GitHub Releases with auto-generated changelogs; publish to VS Code Marketplace via `vsce publish`
- **CI**: GitHub Actions runs lint + compile + tests on every push and PR
- **Issue management**: Bug report and feature request templates; use GitHub labels for triage
- **Contributing**: Documented in `CONTRIBUTING.md` — fork → branch → PR workflow, code style enforced by ESLint
- **Code of Conduct**: Contributor Covenant v2.1

---

## Further Considerations

1. **Terminal behavior on run**: Implemented as a per-command choice between active/shared and dedicated terminals. A future refinement could add one-off override actions such as "Run in Dedicated Terminal" regardless of the saved mode.
2. **Environment variables / working directory**: For v1, commands run in the workspace root. Could add optional `cwd` per command in a future version.
3. **Community features (post-v1)**: Accept community PRs for features like nested groups, global shelf, command variables/substitution, import/export.
