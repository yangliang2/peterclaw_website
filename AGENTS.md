# Agent Workflow — peterclaw_website

## Git Identity

All commits must use the owner's GitHub identity. Never commit as an agent:

```bash
git config user.name "yangliang2"
git config user.email "littlekyang@gmail.com"
```

## Branch Rule

- **Only `main`**. Do not create feature branches or PRs from agent branches.
- The `main` branch is checked out in a dedicated worktree. Run `git worktree list` to locate it.
- Work in the `main` worktree and push directly to `origin/main`.

## Conflict Safety

If another agent pushed to `main` while you were working:

```bash
git pull origin main --rebase
git push origin main
```

Never force-push. If a conflict cannot be auto-resolved, report it in the issue and coordinate with the other agent.

## What Not to Commit

- API keys, tokens, or secrets
- Subscription or billing details
- Any financial information
- Large binary files without prior approval
