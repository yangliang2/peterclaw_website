# Agent Workflow — peterclaw_website

## Startup Protocol (MANDATORY — Do This Before Any Task)

Every agent MUST complete the following before starting any task:

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

## Queue Discipline (MANDATORY)

Multica runs one task per agent at a time — repeated @mentions queue up, not merge.

- **Rule A**: Same thread, same agent — do NOT @mention again while the previous run is still queued or running. Post supplemental notes as plain replies (no mention). Wait for completion, then send one merged @mention with the final instruction.
- **Rule B**: In non-delegation contexts (examples, templates, code blocks) do NOT use a clickable `mention://agent/<uuid>` link. Use a broken placeholder like `mention://agent/<UUID>` (UUID in angle brackets) so the platform does not treat it as a trigger.
- **Rule C**: If queued runs are stacking up, cancel stale tasks — do NOT keep @mentioning to nudge:
  ```bash
  multica issue runs <issue-id>
  multica issue cancel-task <task-id> --issue <issue-id>
  ```

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
