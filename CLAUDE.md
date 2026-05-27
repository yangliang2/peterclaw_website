# Claude Agent Rules — peterclaw_website

## Startup Protocol (MANDATORY — Do This Before Any Task)

Every Claude agent MUST complete the following before starting any task:

```bash
multica repo checkout https://github.com/yangliang2/peterclaw-squad-private
```

Then read in order:
1. `team/ROLES.md` — who does what, delegation priority
2. `team/PROTOCOL.md` — collaboration rules, Git workflow, content review gate
3. `team/MENTION_MAP.md` — **required before writing any @mention**
4. `context/CURRENT_STATUS.md` — current project state (if it exists)

Only begin task work after completing the above.

## Mention Format Rule (MANDATORY)

When delegating or escalating in any Multica issue comment, ALL @mentions MUST use the
full link syntax:

```
[@Name](mention://agent/<UUID>)
```

A plain `@Name` or bare name does NOT trigger the agent — the task will never be delivered.

Look up UUIDs in `peterclaw-squad-private/team/MENTION_MAP.md`. Never guess a UUID.

## Issue Creation Rule (MANDATORY)

Every `multica issue create` call MUST include the project ID to prevent "orphan issues":

```bash
multica issue create --title "..." --project 833434fa-85a4-4616-8d98-2f32c91abc58 ...
```

Failure to include the project ID will cause automation tasks to fail.

## Git Identity

All commits must use the owner's GitHub identity:

```bash
git config user.name "yangliang2"
git config user.email "littlekyang@gmail.com"
```

## Branch Rule

- **Only `main`**. Do not create feature branches or PRs from agent branches.
- Run `git worktree list` to locate the main worktree. Work there.
- Push directly to `origin/main`.

## Conflict Safety

```bash
git pull origin main --rebase
git push origin main
```

Never force-push. Report unresolvable conflicts in the issue.

## What Not to Commit

- API keys, tokens, or secrets
- Subscription or billing details
- Any financial information
- Large binary files without prior approval
