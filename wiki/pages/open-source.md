---
title: Open Source
tags: [open-source]
sources: [PLAN.md]
created: 2026-04-15
updated: 2026-04-15
---

# Open Source

Command Shelf is an open-source project released under the MIT license.

---

## License

**MIT** — permissive, maximizes adoption. No restrictions on commercial use, modification, or distribution.

## Repository

Public GitHub repository: `command-shelf`. Contains all source code, wiki, CI, and issue templates.

## Distribution

- **VS Code Marketplace**: Published as a free extension via `vsce publish`.
- **GitHub Releases**: Each version tagged with a GitHub Release, including the `.vsix` artifact and auto-generated changelog.
- **Open VSIX**: Optionally publish to Open VSIX for non-Microsoft VS Code forks (VSCodium, etc.).

## Versioning

**Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH`
- `MAJOR`: Breaking changes to the command-shelf.json schema or removed features.
- `MINOR`: New features (e.g. new command, new UX capability).
- `PATCH`: Bug fixes, performance improvements.

## CI / CD

**GitHub Actions** (`.github/workflows/ci.yml`):
- Triggered on every push and pull request.
- Steps: install dependencies → lint (ESLint) → compile (TypeScript) → test.
- Future: automated `vsce package` and publish on tag push.

## Contributing

Documented in `CONTRIBUTING.md`:
1. Fork the repository.
2. Create a feature branch from `main`.
3. Make changes, ensure `npm run lint` and `npm run compile` pass.
4. Open a pull request with a clear description.
5. Code review by maintainers.

**Code style**: Enforced by ESLint configuration. No manual style discussions in PRs.

## Issue Management

GitHub issue templates:
- **Bug report** (`.github/ISSUE_TEMPLATE/bug_report.md`): Steps to reproduce, expected vs. actual behavior, VS Code version, OS.
- **Feature request** (`.github/ISSUE_TEMPLATE/feature_request.md`): Use case, proposed solution, alternatives considered.

Labels for triage: `bug`, `enhancement`, `good first issue`, `help wanted`, `documentation`, `duplicate`, `wontfix`.

## Code of Conduct

**Contributor Covenant v2.1** — standard open-source code of conduct. Documented in `CODE_OF_CONDUCT.md`.

---

## See Also

- [[overview]]
- [[decisions]]
- [[security]]
