# Afterhive — Agent Guide

Monorepo for the Afterhive MVP: platform backoffice, tenant admin, member portal, marketplace, and background worker.

## Git workflow

**Always start a new branch for each ticket.** Do not implement Linear issues directly on `main`.

1. Confirm the Linear issue ID and title (e.g. `MAN-151`, suspend tenant).
2. Create a branch from up-to-date `main`:

```bash
git checkout main
git pull
git checkout -b man-151-us-003-suspend-tenant
```

3. Do the work on that branch only.
4. Run checks before opening a PR:

```bash
pnpm typecheck
pnpm test
```

5. Commit with a message that references the ticket when relevant.
6. Push the branch and open a PR from the feature branch into `main`.
7. Update the Linear issue after implementation — see **Linear** below.

When the user asks to **push**, always push **and** open the PR in the same turn (unless a PR for that branch already exists). Then update Linear for that ticket.

### Branch naming

Use lowercase, hyphenated names tied to the Linear issue:

| Pattern | Example |
|---------|---------|
| `man-<id>-<short-slug>` | `man-151-us-003-suspend-tenant` |
| Linear `gitBranchName` | Copy from the issue when available |

One branch per ticket. Do not mix unrelated stories on the same branch.

## Project layout

| Path | Role |
|------|------|
| `apps/platform` | Platform admin (`basePath`: `/platform`, port 3001) |
| `apps/admin` | Tenant staff admin (`basePath`: `/app`, port 3002) |
| `apps/portal` | Member portal |
| `apps/marketplace` | Public marketplace |
| `apps/worker` | Background jobs |
| `packages/api` | Auth, use-case procedures, route helpers |
| `packages/domain` | Policy engine, domain types |
| `packages/db` | Drizzle schema and migrations |
| `packages/ui` | MUI theme and shared shell |
| `packages/shared` | Env, logger, i18n |
| `docs/` | Specs, epics, screen maps, procedures |

## Local development

```bash
cp .env.example .env
pnpm install
pnpm dev:infra
pnpm db:migrate && pnpm db:seed
```

Run apps individually:

```bash
pnpm --filter @afterhive/platform dev   # http://localhost:3001/platform
pnpm --filter @afterhive/admin dev      # http://localhost:3002/app
```

Required env for auth URLs: `ADMIN_APP_URL`, `PLATFORM_APP_URL` (see `.env.example`).

Demo credentials come from `pnpm db:seed` (platform admin, tenant staff, owner).

## Implementation order

Follow `docs/14-delivery/03-implementation-order.md`. Phase 0 foundations first. Linear project: [Afterhive](https://linear.app/manuweb/project/afterhive-9438c620d7c3).

## Linear

Keep the Linear issue in sync with the branch and PR lifecycle. Use the Linear MCP (`save_issue`) or the Linear UI.

| When | Linear update |
|------|----------------|
| Start work on a ticket | Set status to **In Progress** |
| Implementation complete (checks pass, PR opened) | Update the issue: link the PR (attachment or description), confirm acceptance criteria in the PR body; keep **In Progress** until merge |
| PR merged to `main` | Set status to **Done** (e.g. during `/continue`) |

Do not leave a ticket in **Backlog** or **In Progress** after the PR is merged. Do not mark **Done** before the PR is merged unless the user explicitly asks.

When picking up the next ticket after merge, use `/continue`: pull `main`, delete the feature branch, mark the merged issue **Done**, then set the next issue **In Progress** and create its branch.

## Code conventions

- Business logic lives in `packages/api`, `packages/domain`, and `packages/shared` — not in Next.js route files when avoidable.
- Better Auth is configured per app with explicit `ADMIN_APP_URL` / `PLATFORM_APP_URL`; do not derive auth URLs from generic `APP_URL` alone.
- Add colocated `*.test.ts` for new or changed business logic; run `pnpm test`.
- Keep imports at the top of files; use exhaustive `switch` with `never` for discriminated unions.
- Match existing naming and structure; prefer minimal diffs scoped to the ticket.

## Specs traceability

| Artifact | Location |
|----------|----------|
| Epics & user stories | `docs/14-delivery/02-epics-and-stories.md` |
| Procedures (PROC-*) | `docs/09-api-and-events/02-procedure-catalog.md` |
| Screens (SCR-*) | `docs/08-app-surfaces/` |
| Permissions | `docs/06-permissions/` |

Link commits and PRs to the Linear issue when possible. PR bodies must include `Fixes MAN-<id>` — see **Pull requests** below.

## Pull requests

- One PR per ticket / branch.
- **Push implies PR:** if the user says push (or commit and push), push to origin and create the PR with `gh pr create` before finishing — do not stop at push only.
- **Linear auto-link:** include `Fixes MAN-<id>` in the PR body (GitHub + Linear integration). Use the exact Linear issue identifier, e.g. `Fixes MAN-186`. Place it after the summary (or in a dedicated line at the top of the body).
- **Cursor automations:** triggers fire on PR **opened** or **pushed**, not on reopen. If an automation was skipped or disabled on the first run, close the PR and create a new one (`gh pr create`), or push a new commit to the branch — do not rely on `gh pr reopen`.
- Summary: what changed and why (not a file list).
- Test plan: commands run (`pnpm test`, manual URLs, seed data used).
- Do not commit `.env` or secrets.

Example PR body:

```markdown
## Summary
- …

Fixes MAN-186

## Test plan
- [x] `pnpm typecheck`
- [x] `pnpm test`
```
