---
title: Data Model
tags: [data-model, storage]
sources: [PLAN.md]
created: 2026-04-15
updated: 2026-04-15
---

# Data Model

All persistent state is stored in a single JSON file: **`.vscode/command-shelf.json`** in the workspace root. This file is the source of truth.

---

## Schema

```json
{
  "version": 1,
  "commands": [
    {
      "id": "a1b2c3d4-...",
      "label": "Start Dev Server",
      "command": "npm run dev",
      "group": "Dev",
      "sortOrder": 0
    },
    {
      "id": "e5f6g7h8-...",
      "label": "Run Tests",
      "command": "npm test",
      "group": null,
      "sortOrder": 0
    }
  ],
  "groups": [
    {
      "id": "i9j0k1l2-...",
      "label": "Dev",
      "sortOrder": 0
    }
  ]
}
```

## Fields

### `version`

Integer. Schema version for forward compatibility. Currently `1`. When the schema changes in the future, the loader can migrate old formats.

### `commands[]`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` (UUID) | Yes | Unique identifier, generated via `crypto.randomUUID()` |
| `label` | `string` | Yes | Display name shown in the sidebar |
| `command` | `string` | Yes | The terminal command string to execute |
| `group` | `string \| null` | Yes | References `groups[].label`, or `null` for ungrouped |
| `sortOrder` | `number` | Yes | Ordering position within the command's group (or among ungrouped) |

### `groups[]`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` (UUID) | Yes | Unique identifier |
| `label` | `string` | Yes | Display name, also used as the foreign key from `commands[].group` |
| `sortOrder` | `number` | Yes | Ordering position among groups at the root level |

## TypeScript Interfaces

Defined in `src/models.ts`:

```typescript
interface ShelfCommand {
  id: string;
  label: string;
  command: string;
  group: string | null;
  sortOrder: number;
}

interface ShelfGroup {
  id: string;
  label: string;
  sortOrder: number;
}

interface ShelfData {
  version: number;
  commands: ShelfCommand[];
  groups: ShelfGroup[];
}
```

## Design Notes

- **Group reference by label** (not ID): Simpler for humans editing the JSON manually. The trade-off is that renaming a group requires updating all commands that reference it — the [[command-store]] handles this atomically.
- **`sortOrder`** is a simple integer. On drag-and-drop, sort orders are recomputed for the affected scope. See [[tree-view]] for the reordering algorithm.
- **No nested groups for v1**: The `group` field is a flat string, not a path. See [[decisions]] for rationale.
- **`null` group**: Commands with `group: null` appear at the root level of the tree, outside any group folder.

## Validation

On load, the [[command-store]] validates:
- `version` is a supported number
- Every command has a non-empty `id`, `label`, and `command`
- Every `commands[].group` that is non-null matches an existing `groups[].label`
- No duplicate `id` values

Invalid entries are silently dropped with a warning logged to the output channel, rather than failing the entire load.

---

## See Also

- [[command-store]]
- [[architecture]]
- [[decisions]]
- [[glossary]]
