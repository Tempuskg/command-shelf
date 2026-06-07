# Changelog

All notable changes to this project will be documented in this file.

## 0.0.7 - 2026-06-07

- Lowered the VS Code engine requirement to `^1.85.0` so the extension installs in Cursor IDE and other Open VSX-compatible editors.
- Added extension development launch and build tasks for VS Code and Cursor.
- Replaced the external `$esbuild-watch` problem matcher with an inline matcher so F5 works without installing extra extensions.
- Documented Cursor IDE installation and compatibility in the README.
- Fixed CI by tracking `package-lock.json` for reproducible `npm ci` installs.
- Added a GitHub Actions release workflow for tagged releases and optional Marketplace/Open VSX publishing.
- Excluded `node_modules` from VSIX packaging via `.vscodeignore`.
- Switched packaging to `@vscode/vsce` (the deprecated `vsce` package does not support `--skip-license`).

## 0.0.5 - 2026-04-22

- Fixed Marketplace icon to match the sidebar icon design (blue rounded square, shelf lines, bookmark ribbon).

## 0.0.4 - 2026-04-22

- Added a dedicated Marketplace icon so the listing uses branded artwork instead of the default placeholder.

## 0.0.3 - 2026-04-22

- Updated the Marketplace publisher metadata for the public release.
- Prepared and published the extension from the `darrenjmcleod` publisher namespace.

## 0.0.2 - 2026-04-22

- Added per-command terminal targeting with `active` and `dedicated` modes.
- Reused dedicated terminals per command using command IDs.
- Added tree tooltip hints for commands that run in dedicated terminals.
- Packaged the extension as a VSIX for local installation and validation.

## 0.0.1 - 2026-04-17

- Initial release of Command Shelf.
- Added workspace-local command storage in `.vscode/command-shelf.json`.
- Added command and group CRUD flows.
- Added drag-and-drop reordering and group moves.
- Added inline command execution and clipboard copy support.