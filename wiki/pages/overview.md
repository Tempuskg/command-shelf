---
title: Overview
tags: [overview]
sources: [PLAN.md]
created: 2026-04-15
updated: 2026-04-15
---

# Overview

**Command Shelf** is an open-source VS Code extension that lets users save common terminal commands as clickable items in a sidebar view. Instead of retyping or hunting through shell history, users build a persistent shelf of commands — organized into groups, reorderable via drag-and-drop, and runnable with a single click.

---

## Problem

Developers repeatedly type the same terminal commands: build scripts, test runners, deploy commands, docker invocations, environment setup. VS Code's `tasks.json` exists but is verbose, JSON-heavy, and awkward to edit. Shell aliases are global, not project-specific, and invisible in the IDE.

## Solution

A sidebar panel called "Command Shelf" that provides:
- **Add** named commands with a few keystrokes (no JSON editing)
- **Organize** commands into flat groups (e.g. "Build", "Deploy", "Database")
- **Run** any command with one click — executes in the integrated terminal
- **Reorder** via drag-and-drop within and between groups
- **Workspace-scoped** — each project has its own shelf, stored in `.vscode/command-shelf.json`
- **Git-trackable** — the JSON file can be committed so the whole team shares the same shelf

## Scope (v1)

- Workspace-only (no global shelf)
- Flat groups (one level, no nesting)
- Single reusable terminal for execution
- Commands run from workspace root (no per-command `cwd`)

## Tech Stack

- **Language**: TypeScript
- **Platform**: VS Code Extension API
- **Build**: esbuild
- **Storage**: JSON file (`.vscode/command-shelf.json`)
- **License**: MIT

---

## See Also

- [[architecture]]
- [[decisions]]
- [[open-source]]
- [[commands]]
