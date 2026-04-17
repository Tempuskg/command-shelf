---
title: Glossary
tags: [glossary]
sources: [PLAN.md]
created: 2026-04-15
updated: 2026-04-15
---

# Glossary

Key terms used throughout the Command Shelf project.

---

## Command Shelf
The name of the extension and the sidebar panel. A "shelf" of saved terminal commands.

## Shelf Command
A single saved terminal command with a label, command string, optional group, and sort order. Represented by the `ShelfCommand` interface. See [[data-model]].

## Shelf Group
A named container for organizing related commands. Flat (one level, no nesting). Represented by the `ShelfGroup` interface. See [[data-model]].

## Shelf Data
The top-level data structure (`ShelfData` interface) containing the version, commands array, and groups array. Serialized as `.vscode/command-shelf.json`. See [[data-model]].

## CommandStore
The data layer class that manages all CRUD operations on the shelf data, file I/O, and change notifications. See [[command-store]].

## CommandShelfProvider
The `TreeDataProvider` + `TreeDragAndDropController` that renders the sidebar tree and handles drag-and-drop. See [[tree-view]].

## ShelfItem
A `TreeItem` subclass used by the provider to represent either a group node or a command node in the sidebar tree. See [[tree-view]].

## Sort Order
An integer (`sortOrder`) on each command and group that determines display order. Managed by the [[command-store]], updated on drag-and-drop.

## Context Value
The `TreeItem.contextValue` string that controls which context menu items appear. Commands use `"shelfCommand"`, groups use `"shelfGroup"`. See [[tree-view]] and [[commands]].

## Named Terminal
A VS Code integrated terminal created with the name `"Command Shelf"`. Reused across command runs. See [[terminal-integration]].

## Workspace Scope
Commands are stored per-workspace in `.vscode/command-shelf.json`, not globally. Each VS Code workspace has its own independent shelf. See [[decisions]].

## Atomic Write
The strategy of writing to a `.tmp` file then renaming over the target, preventing data corruption on crash. See [[command-store]] and [[decisions]].

## TreeDataProvider
A VS Code API interface that supplies data to a `TreeView`. Must implement `getTreeItem()` and `getChildren()`. See [[vs-code-extension-api]].

## TreeDragAndDropController
A VS Code API interface that enables drag-and-drop in a `TreeView`. Must implement `handleDrag()` and `handleDrop()`. See [[vs-code-extension-api]].

## VSIX
The packaging format for VS Code extensions (`.vsix` file). Built with `vsce package`. See [[open-source]].

---

## See Also

- [[data-model]]
- [[architecture]]
- [[vs-code-extension-api]]
