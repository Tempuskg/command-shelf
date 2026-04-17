# Command Shelf — LLM Wiki Schema

This file defines the conventions, structure, and workflows for maintaining the Command Shelf project wiki. It is intended to be read by an LLM agent acting as wiki maintainer.

---

## Purpose

This wiki is a **persistent, compounding knowledge base** for the Command Shelf VS Code extension project. It captures architecture decisions, API patterns, VS Code extension concepts, implementation details, and project evolution — all maintained by LLMs, all in markdown.

The wiki sits between raw sources (plans, docs, conversations) and the humans working on the project. It is the canonical place to understand *what this project is, how it works, and why decisions were made*.

---

## Directory Structure

```
wiki/
├── SCHEMA.md              ← You are here. LLM instructions for wiki maintenance.
├── index.md               ← Content catalog: every page listed with link + summary.
├── log.md                 ← Chronological append-only activity log.
├── sources/               ← Raw source documents (immutable, LLM reads but never modifies).
│   └── ...
└── pages/                 ← LLM-maintained wiki pages (markdown, interlinked).
    ├── overview.md
    ├── architecture.md
    ├── data-model.md
    ├── commands.md
    ├── tree-view.md
    ├── command-store.md
    ├── open-source.md
    ├── decisions.md
    ├── glossary.md
    └── ...
```

---

## Conventions

### Page Format

Every wiki page follows this template:

```markdown
---
title: Page Title
tags: [tag1, tag2]
sources: [source-filename.md]
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# Page Title

Brief summary paragraph.

---

## Section Heading

Content...

---

## See Also

- [[related-page]]
- [[another-page]]
```

**Rules:**
- YAML frontmatter is required on every page.
- `tags` use lowercase kebab-case: `vs-code-api`, `tree-view`, `data-model`.
- `sources` lists which raw source documents informed this page.
- `created` and `updated` are ISO dates.
- Internal links use `[[page-name]]` Obsidian-style wikilinks (filename without `.md`).
- Every page must have a "See Also" section with at least one cross-reference.
- Headings use `##` for sections (the page title is the only `#`).

### Naming

- Page filenames: lowercase kebab-case, e.g. `command-store.md`, `tree-view.md`.
- One concept per page. If a page grows beyond ~300 lines, split it.
- Prefer specific pages over monolithic ones.

### Cross-References

- When mentioning a concept that has its own page, link to it: `[[glossary]]`, `[[data-model]]`.
- When creating a new page, add links to it from all relevant existing pages.
- When updating a page, check if new content warrants links to/from other pages.

### Sources

- Raw sources live in `wiki/sources/` and are **immutable** — the LLM reads them but never modifies them.
- Sources can be: plan documents, conversation transcripts, external docs, API references, articles.
- Each source should have a companion summary page in `wiki/pages/` tagged with `source-summary`.

---

## Workflows

### Ingest a New Source

1. Place the raw source in `wiki/sources/`.
2. Read the source thoroughly.
3. Create or update a summary page in `wiki/pages/` (tag: `source-summary`).
4. Update **all affected pages** — architecture, decisions, glossary, etc.
5. Add new pages for any new concepts, entities, or components introduced.
6. Update cross-references on all touched pages.
7. Update `wiki/index.md` with any new or changed pages.
8. Append an entry to `wiki/log.md`.

### Answer a Question

1. Read `wiki/index.md` to find relevant pages.
2. Read those pages.
3. Synthesize an answer with citations to wiki pages.
4. If the answer reveals new knowledge worth preserving, file it as a new page or update existing pages.
5. Append a query entry to `wiki/log.md`.

### Lint / Health Check

Periodically check for:
- **Orphan pages**: pages with no inbound links from other pages.
- **Dead links**: `[[wikilinks]]` pointing to pages that don't exist.
- **Stale content**: pages whose `updated` date is much older than recent source ingests.
- **Missing pages**: concepts frequently mentioned but lacking their own page.
- **Contradictions**: claims on one page that conflict with another.
- **Incomplete frontmatter**: missing tags, sources, or dates.

Report findings and fix them. Append a lint entry to `wiki/log.md`.

### Update After Code Changes

When the codebase changes significantly:
1. Identify which wiki pages are affected by the change.
2. Update those pages to reflect the new state.
3. If the change introduces new concepts/components, create pages for them.
4. Update `wiki/index.md` and `wiki/log.md`.

---

## Tags Taxonomy

| Tag | Use For |
|---|---|
| `overview` | High-level project summary |
| `architecture` | Module structure, layers, data flow |
| `data-model` | JSON schemas, interfaces, types |
| `vs-code-api` | VS Code extension API patterns |
| `tree-view` | TreeDataProvider, TreeView, drag-and-drop |
| `commands` | Registered VS Code commands |
| `terminal` | Terminal integration, command execution |
| `storage` | File I/O, persistence, workspace scoping |
| `ux` | User experience, menus, input flows |
| `decision` | Design decisions and rationale |
| `open-source` | Licensing, contributing, CI, community |
| `source-summary` | Summary of a raw source document |
| `glossary` | Term definitions |
| `security` | Input validation, OWASP, Snyk |

---

## Index Format

`wiki/index.md` entries follow this format:

```markdown
## Category Name

| Page | Summary | Tags |
|---|---|---|
| [[page-name]] | One-line description | `tag1`, `tag2` |
```

---

## Log Format

`wiki/log.md` entries follow this format:

```markdown
## [YYYY-MM-DD] action | Subject

Description of what was done. Pages created/updated listed.
```

Actions: `ingest`, `query`, `lint`, `update`, `create`.

---

## Scope

This wiki covers:
- The Command Shelf VS Code extension (architecture, implementation, decisions)
- VS Code extension API patterns relevant to this project
- Open-source project management (CI, releases, contributing)
- Security considerations

This wiki does **not** cover:
- General TypeScript/JavaScript knowledge (assume the reader knows these)
- Unrelated VS Code extensions
- Personal notes or ephemeral tasks (use session memory for those)
