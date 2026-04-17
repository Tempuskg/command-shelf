---
title: Architecture
tags: [architecture]
sources: [PLAN.md]
created: 2026-04-15
updated: 2026-04-15
---

# Architecture

Command Shelf follows a straightforward three-layer architecture: **data layer** → **view layer** → **command layer**, all wired together in the extension entry point.

---

## Module Map

| Module | File | Responsibility |
|---|---|---|
| Entry point | `src/extension.ts` | `activate()` initializes store, registers provider and commands; `deactivate()` disposes watchers |
| Models | `src/models.ts` | TypeScript interfaces for `ShelfCommand`, `ShelfGroup`, `ShelfData` |
| Data layer | `src/CommandStore.ts` | CRUD operations on `.vscode/command-shelf.json`, file watching, event emitter |
| View layer | `src/CommandShelfProvider.ts` | `TreeDataProvider<ShelfItem>` + `TreeDragAndDropController` |
| View items | `src/CommandShelfItem.ts` | `TreeItem` subclasses for group nodes and command nodes |

## Data Flow

```
User action (click/drag)
    ↓
VS Code command handler (extension.ts)
    ↓
CommandStore (CRUD mutation → write JSON → fire onDidChange)
    ↓
CommandShelfProvider (listens to onDidChange → refreshes TreeView)
    ↓
VS Code renders updated sidebar
```

For **run** operations, the flow branches:
```
commandShelf.runCommand
    ↓
Get or create named terminal "Command Shelf"
    ↓
terminal.sendText(command)
```

## File Ownership

- **`src/extension.ts`** owns the lifecycle: it creates the `CommandStore` singleton, the `CommandShelfProvider`, and registers all command handlers. It passes the store to both the provider and the command handlers.
- **`CommandStore`** owns the data: it is the single source of truth for the in-memory state and is responsible for syncing with the JSON file.
- **`CommandShelfProvider`** owns the view: it translates the store's data into `TreeItem` nodes and handles drag-and-drop.

## Dependencies Between Modules

```
extension.ts
    ├── CommandStore (creates, passes to provider + commands)
    ├── CommandShelfProvider (creates, registers as TreeDataProvider)
    └── command handlers (closures that reference store + provider)

CommandShelfProvider
    ├── CommandStore (reads data, listens to events)
    └── CommandShelfItem (creates TreeItem instances)

CommandStore
    └── models.ts (uses interfaces)
```

No circular dependencies. The store knows nothing about the view. The view reads from the store and listens for changes.

---

## See Also

- [[command-store]]
- [[tree-view]]
- [[data-model]]
- [[commands]]
