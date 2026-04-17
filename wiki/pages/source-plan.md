---
title: "Source Summary: PLAN.md"
tags: [source-summary]
sources: [PLAN.md]
created: 2026-04-15
updated: 2026-04-15
---

# Source Summary: PLAN.md

Summary of the original project plan document (`PLAN.md`), the founding source for the Command Shelf wiki.

---

## Source

- **File**: `PLAN.md` (project root)
- **Type**: Project blueprint / design document
- **Created**: 2026-04-15

## Key Content

### Project Definition
Command Shelf is an open-source (MIT) TypeScript VS Code extension providing a sidebar TreeView for saving, organizing, and running terminal commands. Workspace-scoped, stored in `.vscode/command-shelf.json`.

### Architecture
Five modules: `extension.ts` (entry), `models.ts` (interfaces), `CommandStore.ts` (data layer), `CommandShelfProvider.ts` (TreeView + DnD), `CommandShelfItem.ts` (TreeItem subclass).

### Data Model
JSON schema with `version`, `commands[]`, and `groups[]`. Commands reference groups by label. Sort order drives display ordering.

### Implementation Phases
1. **Scaffold**: npm init, TypeScript, esbuild, package.json manifest
2. **Data Layer**: CommandStore with CRUD, atomic writes, file watcher
3. **TreeView**: TreeDataProvider + TreeDragAndDropController
4. **Commands & UX**: 8 registered commands (add/edit/delete/run/copy command, add/edit/delete group)
5. **Polish & Open Source**: Icon, README, CHANGELOG, LICENSE, CONTRIBUTING, CI, issue templates
6. **Security**: Snyk scan, input validation

### Design Decisions
- Storage in `.vscode/command-shelf.json` (git-trackable)
- Flat groups only (no nesting)
- Workspace-only scope (no global shelf)
- Single named terminal reuse
- Group reference by label (not ID)
- No tasks.json integration
- Atomic file writes

### Open Source Strategy
MIT license, SemVer, GitHub Releases, VS Code Marketplace, GitHub Actions CI, CONTRIBUTING.md, Contributor Covenant.

### Future Considerations
- Per-command `cwd`
- Environment variables
- Community features: nested groups, global shelf, command variables, import/export

## Pages Derived From This Source

All initial wiki pages were derived from this source:
- [[overview]], [[architecture]], [[data-model]], [[command-store]], [[tree-view]]
- [[commands]], [[terminal-integration]], [[ux-flows]]
- [[decisions]], [[open-source]], [[security]]
- [[glossary]], [[vs-code-extension-api]]

---

## See Also

- [[overview]]
- [[architecture]]
- [[decisions]]
