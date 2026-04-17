---
title: Commands
tags: [commands, ux]
sources: [PLAN.md]
created: 2026-04-15
updated: 2026-04-15
---

# Commands

All user-facing operations are registered as VS Code commands in `src/extension.ts`.

---

## Command Registry

| Command ID | Title | Icon | Trigger Location |
|---|---|---|---|
| `commandShelf.addCommand` | Add Command | `$(add)` | View title bar |
| `commandShelf.editCommand` | Edit Command | `$(edit)` | Context menu on command |
| `commandShelf.deleteCommand` | Delete Command | `$(trash)` | Context menu on command |
| `commandShelf.runCommand` | Run Command | `$(play)` | Inline button on command; also triggers on click |
| `commandShelf.copyCommand` | Copy Command | `$(copy)` | Context menu on command |
| `commandShelf.addGroup` | Add Group | `$(new-folder)` | View title bar |
| `commandShelf.editGroup` | Rename Group | `$(edit)` | Context menu on group |
| `commandShelf.deleteGroup` | Delete Group | `$(trash)` | Context menu on group |

## Menu Configuration

### View Title (top of sidebar)

```
view/title when view == commandShelfView:
  - commandShelf.addCommand  (group: navigation)  → always visible (+)
  - commandShelf.addGroup    (group: navigation)  → always visible (folder+)
```

### Command Item — Inline

```
view/item/context when viewItem == shelfCommand (inline):
  - commandShelf.runCommand  → ▶ play button on the right
```

### Command Item — Context Menu

```
view/item/context when viewItem == shelfCommand:
  - commandShelf.runCommand     (group: 1_run)
  - commandShelf.copyCommand    (group: 2_clipboard)
  - commandShelf.editCommand    (group: 3_edit)
  - commandShelf.deleteCommand  (group: 3_edit)
```

### Group Item — Context Menu

```
view/item/context when viewItem == shelfGroup:
  - commandShelf.editGroup    (group: 1_edit)
  - commandShelf.deleteGroup  (group: 1_edit)
```

## Command Implementations

See [[ux-flows]] for the detailed user interaction sequences for each command.

---

## See Also

- [[ux-flows]]
- [[tree-view]]
- [[architecture]]
- [[terminal-integration]]
