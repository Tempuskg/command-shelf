# Changelog

All notable changes to this project will be documented in this file.

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