# Command Shelf Wiki — Index

> Auto-maintained by LLM. Last updated: 2026-04-15.

---

## Overview

| Page | Summary | Tags |
|---|---|---|
| [[overview]] | High-level project summary — what Command Shelf is and why it exists | `overview` |

## Architecture & Implementation

| Page | Summary | Tags |
|---|---|---|
| [[architecture]] | Module breakdown, data flow, and layer responsibilities | `architecture` |
| [[data-model]] | `.vscode/command-shelf.json` schema — commands, groups, versioning | `data-model`, `storage` |
| [[command-store]] | `CommandStore` class — CRUD, file I/O, watchers, event emitter | `storage`, `vs-code-api` |
| [[tree-view]] | `CommandShelfProvider` — TreeDataProvider, drag-and-drop controller | `tree-view`, `vs-code-api` |
| [[commands]] | All registered VS Code commands — IDs, triggers, UX flows | `commands`, `ux` |
| [[terminal-integration]] | How commands execute in the VS Code integrated terminal | `terminal`, `vs-code-api` |

## Design

| Page | Summary | Tags |
|---|---|---|
| [[decisions]] | Key design decisions with rationale — storage, groups, scope, terminal reuse | `decision` |
| [[ux-flows]] | User interaction flows — add, edit, delete, run, group, reorder | `ux`, `commands` |

## Project & Community

| Page | Summary | Tags |
|---|---|---|
| [[open-source]] | Open-source strategy — license, CI, releases, contributing, Code of Conduct | `open-source` |
| [[security]] | Input validation, OWASP considerations, Snyk scanning | `security` |

## Reference

| Page | Summary | Tags |
|---|---|---|
| [[glossary]] | Key terms and definitions used throughout the project | `glossary` |
| [[vs-code-extension-api]] | VS Code API patterns relevant to Command Shelf (TreeView, commands, terminals) | `vs-code-api` |

## Source Summaries

| Page | Summary | Tags |
|---|---|---|
| [[source-plan]] | Summary of the original PLAN.md — project blueprint and phase breakdown | `source-summary` |
