---
title: CommandStore
tags: [storage, vs-code-api]
sources: [PLAN.md]
created: 2026-04-15
updated: 2026-04-15
---

# CommandStore

`CommandStore` (`src/CommandStore.ts`) is the data layer. It owns all reads and writes to `.vscode/command-shelf.json` and exposes an event-driven API for the view layer.

---

## Responsibilities

1. **Load** — Read and parse the JSON file on activation; create it with empty defaults if missing.
2. **Save** — Write the current state back to disk (atomic: write to temp file, then rename).
3. **CRUD** — Add, edit, delete commands and groups.
4. **Reorder** — Update `sortOrder` and `group` assignment for drag-and-drop.
5. **Watch** — Monitor the JSON file for external edits (user hand-editing, git checkout, another editor) and reload.
6. **Notify** — Fire `onDidChange` after every mutation or external reload so the [[tree-view]] can refresh.

## API Surface

```typescript
class CommandStore {
  // Events
  readonly onDidChange: vscode.Event<void>;

  // Lifecycle
  load(): Promise<void>;
  dispose(): void;

  // Read
  getCommands(): ShelfCommand[];
  getGroups(): ShelfGroup[];
  getCommandsByGroup(groupLabel: string | null): ShelfCommand[];

  // Command CRUD
  addCommand(label: string, command: string, group?: string): Promise<ShelfCommand>;
  editCommand(id: string, updates: Partial<Pick<ShelfCommand, 'label' | 'command' | 'group'>>): Promise<void>;
  deleteCommand(id: string): Promise<void>;

  // Group CRUD
  addGroup(label: string): Promise<ShelfGroup>;
  editGroup(id: string, newLabel: string): Promise<void>;
  deleteGroup(id: string, keepCommands: boolean): Promise<void>;

  // Reorder (drag-and-drop)
  reorder(id: string, targetGroup: string | null, newSortOrder: number): Promise<void>;
}
```

## Key Behaviors

### Atomic Writes

`save()` writes to a temporary file (`.vscode/command-shelf.json.tmp`) then renames it over the original. This prevents corruption if VS Code or the OS crashes mid-write.

### File Watcher

A `vscode.FileSystemWatcher` on `.vscode/command-shelf.json` triggers `load()` on external changes. To avoid reacting to our own writes, the watcher is briefly suppressed during `save()`.

### Group Rename Cascade

When `editGroup(id, newLabel)` is called, all commands whose `group` matches the old label are updated to reference `newLabel`. This is done in a single save pass.

### Group Deletion

`deleteGroup(id, keepCommands)`:
- If `keepCommands` is `true`, commands in the group are moved to ungrouped (`group: null`).
- If `keepCommands` is `false`, commands in the group are deleted.

### Sort Order Management

New commands get `sortOrder = max(existing in same scope) + 1`. On reorder, affected items have their sort orders recomputed as sequential integers to avoid gaps and collisions.

### ID Generation

Uses `crypto.randomUUID()` (available in Node.js 19+ and all modern VS Code runtimes). IDs are opaque strings — never displayed to users, only used internally for identity.

---

## See Also

- [[data-model]]
- [[architecture]]
- [[tree-view]]
- [[terminal-integration]]
