---
title: Tree View
tags: [tree-view, vs-code-api]
sources: [PLAN.md]
created: 2026-04-15
updated: 2026-04-15
---

# Tree View

The sidebar UI is implemented as a VS Code `TreeView` with a custom `TreeDataProvider` and `TreeDragAndDropController`.

---

## Components

### `CommandShelfProvider` (`src/CommandShelfProvider.ts`)

Implements:
- `vscode.TreeDataProvider<ShelfItem>` — supplies tree structure to VS Code
- `vscode.TreeDragAndDropController<ShelfItem>` — handles drag-and-drop reordering

### `ShelfItem` (`src/CommandShelfItem.ts`)

A `vscode.TreeItem` subclass that represents either a **group node** or a **command node**.

| Property | Group Node | Command Node |
|---|---|---|
| `collapsibleState` | `Expanded` (default) | `None` |
| `contextValue` | `"shelfGroup"` | `"shelfCommand"` |
| `iconPath` | `ThemeIcon("folder")` | `ThemeIcon("terminal")` |
| `command` (on click) | — (toggles collapse) | Runs `commandShelf.runCommand` |
| `description` | Command count | The command string (dimmed) |
| `tooltip` | Group name | Full command string |

## Tree Structure

```
Command Shelf (sidebar)
├── 📁 Dev (group, sortOrder: 0)
│   ├── 🖥 Start Dev Server  — npm run dev
│   └── 🖥 Watch Tests       — npm test -- --watch
├── 📁 Deploy (group, sortOrder: 1)
│   └── 🖥 Deploy Staging    — ./deploy.sh staging
├── 🖥 Lint All              — npm run lint          (ungrouped)
└── 🖥 Clean                 — rm -rf dist/          (ungrouped)
```

**Root level** shows:
1. Groups, sorted by `sortOrder`
2. Ungrouped commands, sorted by `sortOrder`

**Inside a group**: commands sorted by `sortOrder`.

## `getChildren()` Logic

```
getChildren(element?)
  if element is undefined (root):
    return [...groups sorted by sortOrder, ...ungrouped commands sorted by sortOrder]
  if element is a group:
    return commands where group === element.label, sorted by sortOrder
  else:
    return [] (commands have no children)
```

## Drag and Drop

**MIME type**: `application/vnd.code.tree.commandShelfView`

### `handleDrag(sources, dataTransfer)`
Serializes the dragged items' IDs into the data transfer.

### `handleDrop(target, dataTransfer)`
1. Deserialize the source item IDs.
2. Determine the target group:
   - Dropped on a group → that group's label
   - Dropped on a command inside a group → that command's group
   - Dropped on root / ungrouped command → `null`
3. Determine the new `sortOrder`:
   - Dropped on a specific item → insert before that item's sortOrder
   - Dropped on a group header → append to end of group
4. Call `CommandStore.reorder(id, targetGroup, newSortOrder)`.

### Refresh

The provider listens to `CommandStore.onDidChange` and fires `_onDidChangeTreeData.fire()` to trigger a full tree refresh.

---

## Registration

In `extension.ts`:

```typescript
const treeView = vscode.window.createTreeView('commandShelfView', {
  treeDataProvider: provider,
  dragAndDropController: provider,
  canSelectMany: false,
});
```

The view ID `commandShelfView` matches the contribution in `package.json`.

---

## See Also

- [[command-store]]
- [[commands]]
- [[architecture]]
- [[vs-code-extension-api]]
- [[ux-flows]]
