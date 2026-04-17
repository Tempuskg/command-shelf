---
title: VS Code Extension API
tags: [vs-code-api]
sources: [PLAN.md]
created: 2026-04-15
updated: 2026-04-15
---

# VS Code Extension API

VS Code API patterns and concepts used by Command Shelf.

---

## TreeView API

### `TreeDataProvider<T>`

The core interface for supplying data to a tree view.

- `getTreeItem(element: T): TreeItem` — Returns the visual representation of an element.
- `getChildren(element?: T): T[]` — Returns children of an element (or root elements if `undefined`).
- `onDidChangeTreeData: Event<T | undefined>` — Signal to refresh the tree. Fire with `undefined` to refresh everything.

### `TreeItem`

Represents a single row in the tree.

Key properties:
- `label` — Display text
- `description` — Secondary text (dimmed, right-aligned)
- `tooltip` — Hover text
- `iconPath` — Icon (use `ThemeIcon` for built-in icons)
- `collapsibleState` — `None`, `Collapsed`, or `Expanded`
- `contextValue` — String that controls which menu items appear (matched by `when` clauses in `package.json`)
- `command` — A `Command` object to execute when the item is clicked

### `TreeDragAndDropController<T>`

Enables drag-and-drop within a tree view.

- `dragMimeTypes: string[]` — MIME types for drag data
- `dropMimeTypes: string[]` — MIME types accepted on drop
- `handleDrag(source: T[], dataTransfer: DataTransfer)` — Serialize dragged items
- `handleDrop(target: T | undefined, dataTransfer: DataTransfer)` — Handle the drop

Registered via `vscode.window.createTreeView()` options.

### `createTreeView(viewId, options)`

Creates and registers a tree view. The `viewId` must match the one declared in `package.json` under `contributes.views`.

---

## Views Container API

### Activity Bar Icon

Declared in `package.json`:

```json
"contributes": {
  "viewsContainers": {
    "activitybar": [{
      "id": "commandShelf",
      "title": "Command Shelf",
      "icon": "resources/command-shelf-icon.svg"
    }]
  },
  "views": {
    "commandShelf": [{
      "id": "commandShelfView",
      "name": "Command Shelf"
    }]
  }
}
```

---

## Commands API

### `registerCommand(commandId, handler)`

Registers a command handler. The `commandId` must match entries in `package.json` under `contributes.commands`.

### Input Boxes

- `vscode.window.showInputBox({ prompt, value, validateInput })` — Single-line text input with optional pre-fill and validation.

### Quick Picks

- `vscode.window.showQuickPick(items, { placeHolder })` — Dropdown selection from a list.

### Warning Messages

- `vscode.window.showWarningMessage(message, ...items)` — Modal/non-modal warning with action buttons.

---

## Terminal API

### `createTerminal(name)`

Creates a new integrated terminal with the given name.

### `window.terminals`

Array of all active terminals. Use `.find()` to locate a named terminal.

### `Terminal.sendText(text, addNewline?)`

Sends text to the terminal. If `addNewline` is `true` (default), the command executes immediately.

### `Terminal.show(preserveFocus?)`

Shows the terminal panel. If `preserveFocus` is `true`, the editor keeps focus.

---

## FileSystemWatcher

`vscode.workspace.createFileSystemWatcher(globPattern)` — Watches for file changes.

Events: `onDidCreate`, `onDidChange`, `onDidDelete`.

Used by [[command-store]] to detect external edits to `command-shelf.json`.

---

## Event Emitter

`vscode.EventEmitter<T>` — Standard event emitter pattern.

- `.event` — The `Event<T>` to expose publicly.
- `.fire(data)` — Emit an event.
- `.dispose()` — Clean up.

Used by [[command-store]] for `onDidChange` and by [[tree-view]] for `onDidChangeTreeData`.

---

## Clipboard API

`vscode.env.clipboard.writeText(text)` — Writes text to the system clipboard.

---

## Workspace API

`vscode.workspace.workspaceFolders` — Array of workspace folder URIs. Command Shelf uses `[0]` (the first/primary workspace folder) as the root for `.vscode/command-shelf.json`.

---

## See Also

- [[tree-view]]
- [[commands]]
- [[command-store]]
- [[terminal-integration]]
- [[architecture]]
