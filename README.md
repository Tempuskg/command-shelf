# Command Shelf

Command Shelf is a VS Code and Cursor IDE extension that adds a sidebar for saving, grouping, and running terminal commands from the current workspace.

Commands are stored in `.vscode/command-shelf.json`, so they stay local to the workspace and can be checked into source control when that makes sense for a team.

## Features

- Save commands with a label and command string.
- Organize commands into flat groups.
- Drag and drop commands to reorder them or move them between groups.
- Run commands directly from the tree view.
- Copy saved commands to the clipboard.
- Choose how each command runs:
  - `active`: send the command to the focused terminal, falling back to a shared `Command Shelf` terminal.
  - `dedicated`: reuse a terminal created specifically for that command.
- React to external edits to `.vscode/command-shelf.json`.

## Usage

1. Open the `Command Shelf` view from the activity bar.
2. Select `Add Command` to create a saved command.
3. Enter a label, the command text, an optional group, and the terminal mode.
4. Run the command from the inline play button or the context menu.

## Installation

### VS Code

Install [Command Shelf](https://marketplace.visualstudio.com/items?itemName=darrenjmcleod.command-shelf) from the VS Code Marketplace, or install a `.vsix` release from GitHub.

### Cursor IDE

Cursor uses the Open VSX registry instead of the VS Code Marketplace. You can install Command Shelf in any of these ways:

1. Search for **Command Shelf** in Cursor's Extensions view (if the extension is published to Open VSX).
2. Download a `.vsix` from [GitHub Releases](https://github.com/Tempuskg/command-shelf/releases) and run **Extensions: Install from VSIX...** from the Command Palette.
3. Drag and drop the `.vsix` file onto the Extensions view.

Command Shelf uses standard VS Code extension APIs and stores data in `.vscode/command-shelf.json`, so workspace shelves work the same in both editors.

## Data File

Command Shelf stores data in `.vscode/command-shelf.json` using this shape:

```json
{
  "version": 1,
  "commands": [
    {
      "id": "b8e6f80b-2f05-4af5-9db4-2fa0cfa36cfa",
      "label": "Start Dev Server",
      "command": "npm run dev",
      "group": "Development",
      "sortOrder": 0,
      "terminalMode": "active"
    }
  ],
  "groups": [
    {
      "id": "9295db6d-7f84-4e38-a45e-87fd6edacd28",
      "label": "Development",
      "sortOrder": 0
    }
  ]
}
```

## Development

### Prerequisites

- Node.js 20+
- npm
- VS Code 1.85.0+ or Cursor IDE 0.40+

### Setup

```bash
npm install
```

### Commands

```bash
npm run compile
npm run watch
npm run lint
```

Press `F5` in VS Code or Cursor to launch an Extension Development Host.

### Packaging

```bash
npx vsce package --allow-package-all-secrets --skip-license
```

## Roadmap

Potential future additions include:

- per-command working directory support
- import and export helpers
- one-off terminal-mode overrides at run time
- global command shelves across workspaces

## Contributing

See `CONTRIBUTING.md` for development workflow and contribution guidelines.

## License

MIT. See `LICENSE`.