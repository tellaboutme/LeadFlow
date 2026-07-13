# Contributing to LeadFlow

Thank you for considering a contribution.

## Before starting

1. Read the relevant file under `docs/`.
2. Search existing issues and pull requests.
3. Open or claim an issue before substantial work.
4. Never include secrets, personal leads or production credentials.

## Workflow

```text
issue → short-lived branch → draft PR → tests/manual evidence → squash merge
```

Branch format:

```text
type/issue-number-short-summary
```

Examples:

```text
feat/42-lead-search
fix/58-csv-unicode
docs/66-docker-setup
```

## Commits and PR titles

Use Conventional Commits:

```text
type(scope): imperative summary
```

The PR title becomes the squash commit on `main`.

## Local quality

Before opening a pull request, run:

Backend:

```powershell
cd backend
uv run ruff format --check .
uv run ruff check .
uv run mypy app
uv run pytest
```

Frontend:

```powershell
cd frontend
npm run lint
npm run typecheck
npm run test -- --run
npm run build
```

## Pull requests

- open as draft early;
- link the issue with `Closes #...`;
- keep scope focused;
- update the PR template completely;
- add screenshots for visual changes;
- add tests for behavior;
- document migrations and rollback;
- respond to every review conversation.

## Security

Do not report vulnerabilities publicly. Follow `SECURITY.md`.

## AI-assisted contributions

AI tools may be used, but the contributor is responsible for:

- understanding submitted code;
- verifying licenses;
- testing behavior;
- removing hallucinated APIs/dependencies;
- preventing secrets and personal data from entering prompts or commits;
- accurately describing what was manually verified.

## License

By contributing, you agree that your contribution will be licensed under the repository’s license once it is added.
