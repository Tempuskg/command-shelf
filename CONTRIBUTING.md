# Contributing

## Development Setup

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Run `npm run compile`.
4. Press `F5` in VS Code or Cursor to start an Extension Development Host. This runs the default build task (`npm run watch`) and opens a second editor window with the extension loaded. No extra extensions are required for the build task.

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

## Releases

Releases are triggered by pushing a version tag (for example `v0.0.7`).

1. Update `version` in `package.json` and add a `CHANGELOG.md` entry.
2. Commit and push to `main`.
3. Create and push the tag:

```powershell
git tag v0.0.7
git push origin v0.0.7
```

The [Release workflow](.github/workflows/release.yml) will:

- lint, build, and package a `.vsix`
- create a GitHub Release with the VSIX attached
- publish to the VS Code Marketplace when `VSCE_PAT` is configured
- publish to Open VSX when `OVSX_PAT` is configured

### Repository secrets

| Secret | Purpose |
| --- | --- |
| `VSCE_PAT` | [Azure DevOps PAT](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#publishing-extensions) with Marketplace **Manage** scope |
| `OVSX_PAT` | [Open VSX access token](https://open-vsx.org/user-settings/tokens) for Cursor and other Open VSX editors |

If a secret is not set, that publish step is skipped and the GitHub Release still completes.