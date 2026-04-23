# Contributing

## Development Setup

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Run `npm run compile`.
4. Press `F5` in VS Code to start an Extension Development Host.

## Development Workflow

1. Create a focused branch for the change.
2. Keep changes scoped to one concern when possible.
3. Run `npm run lint` and `npm run compile` before opening a pull request.
4. If the change affects extension behavior, verify it in the Extension Development Host.

## Code Guidelines

- Keep the architecture aligned with the current split between data, view, and command registration layers.
- Preserve workspace-local storage in `.vscode/command-shelf.json`.
- Prefer small, explicit changes over broad refactors.
- Keep command labels user-facing only; do not use them in file paths or other trusted contexts.
- Maintain compatibility with existing command shelf files when evolving the schema.

## Pull Requests

Pull requests should include:

- a clear problem statement
- the implementation approach
- verification steps
- screenshots or recordings when UI behavior changes materially

## Reporting Issues

Use the issue templates for bug reports and feature requests where possible.

## Code of Conduct

By participating in this project, you agree to follow the Code of Conduct in `CODE_OF_CONDUCT.md`.