## Package manager

Use pnpm exclusively.

- Use `pnpm install` instead of `npm install`.
- Use `pnpm add` instead of `npm install <package>`.
- Commit `pnpm-lock.yaml`.
- Do not create or commit `package-lock.json` or `yarn.lock`.

## Git workflow

Work in small, reviewable increments.

Before committing:

1. Run `pnpm build`.
2. Review `git status`.
3. Review `git diff`.
4. Confirm that generated files and secrets are not included.

Prefer one logical change per commit.

Do not amend, rebase, force-push, delete branches, or rewrite Git history unless explicitly requested.

Before creating a commit, report:

- Changed files
- Implemented behavior
- Verification performed
- Proposed commit message