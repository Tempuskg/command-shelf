---
title: UX Flows
tags: [ux, commands]
sources: [PLAN.md]
created: 2026-04-15
updated: 2026-04-15
---

# UX Flows

Detailed user interaction sequences for each Command Shelf operation.

---

## Add Command

1. User clicks **+** in the Command Shelf title bar (or runs `commandShelf.addCommand` from command palette).
2. `showInputBox` prompts: *"Command label"* (e.g. "Start Dev Server").
   - Validation: non-empty, max 100 chars.
3. `showInputBox` prompts: *"Terminal command"* (e.g. "npm run dev").
   - Validation: non-empty.
4. If groups exist, `showQuickPick` prompts: *"Add to group?"* with options: `[group1, group2, ..., (No Group)]`.
   - If no groups exist, this step is skipped (command is ungrouped).
5. `CommandStore.addCommand(label, command, group)` is called.
6. Tree refreshes. New command appears at the bottom of its group (or ungrouped section).

## Edit Command

1. User right-clicks a command → **Edit Command**.
2. `showInputBox` prompts: *"Command label"*, pre-filled with current label.
3. `showInputBox` prompts: *"Terminal command"*, pre-filled with current command string.
4. `CommandStore.editCommand(id, { label, command })` is called.
5. Tree refreshes.

## Delete Command

1. User right-clicks a command → **Delete Command**.
2. `showWarningMessage` prompts: *"Delete 'Start Dev Server'?"* with `[Yes, No]`.
3. On confirmation, `CommandStore.deleteCommand(id)` is called.
4. Tree refreshes.

## Run Command

1. User clicks the **▶** inline button on a command (or clicks the command item itself, or right-click → **Run Command**).
2. Extension finds or creates the `"Command Shelf"` terminal.
3. `terminal.show(true)` — shows terminal without stealing editor focus.
4. `terminal.sendText(commandString)` — executes the command.

## Copy Command

1. User right-clicks a command → **Copy Command**.
2. `vscode.env.clipboard.writeText(commandString)`.
3. Optional: brief info message *"Copied to clipboard"*.

## Add Group

1. User clicks the **folder+** icon in the title bar (or runs `commandShelf.addGroup`).
2. `showInputBox` prompts: *"Group name"* (e.g. "Build").
   - Validation: non-empty, no duplicates with existing group names.
3. `CommandStore.addGroup(label)` is called.
4. Tree refreshes. New empty group appears.

## Rename Group

1. User right-clicks a group → **Rename Group**.
2. `showInputBox` prompts: *"Group name"*, pre-filled with current name.
   - Validation: non-empty, no duplicates (excluding self).
3. `CommandStore.editGroup(id, newLabel)` is called (cascades to all commands in the group).
4. Tree refreshes.

## Delete Group

1. User right-clicks a group → **Delete Group**.
2. If the group has commands, `showWarningMessage` prompts: *"Delete group 'Build'? Commands in this group will be moved to ungrouped."* with `[Delete Group, Cancel]`.
   - Alternatively: *"Delete group and all its commands?"* with `[Keep Commands, Delete All, Cancel]`.
3. `CommandStore.deleteGroup(id, keepCommands)` is called.
4. Tree refreshes.

## Drag and Drop (Reorder / Move)

1. User drags a command item.
2. Valid drop targets: another command (insert before it), a group header (append to group), root area (move to ungrouped).
3. On drop, the provider computes the new group and sort order.
4. `CommandStore.reorder(id, targetGroup, newSortOrder)` is called.
5. Tree refreshes.

Dragging groups to reorder them among other groups follows the same pattern but only updates group `sortOrder`.

---

## See Also

- [[commands]]
- [[tree-view]]
- [[terminal-integration]]
- [[command-store]]
