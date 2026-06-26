# pr-review

Address feedback on the current branch pull request: fetch review comments, fix blockers, verify, and push.

## Steps

1. Resolve the PR for the current branch:
   - `git branch --show-current`
   - `gh pr view --json number,title,url,state,body`
   - If no PR exists for this branch, stop and tell the user.

2. Fetch all review feedback:
   - `gh pr view --comments`
   - `gh api repos/{owner}/{repo}/pulls/{number}/comments`
   - `gh api repos/{owner}/{repo}/pulls/{number}/reviews`
   - Use `gh pr checks --json name,bucket,state,workflow,link` for failing CI

3. Summarize feedback before coding:
   - **Blockers** — must fix before merge
   - **Suggestions** — fix when reasonable and in scope
   - **Questions** — ask only if truly ambiguous

4. Implement requested changes:
   - Match existing project patterns and keep diffs surgical
   - Do not expand scope beyond the review feedback
   - Add or update regression tests for each blocker fix

5. Verify:
   - `pnpm typecheck`
   - `pnpm test`
   - Re-run any failing PR checks if applicable

6. Ship fixes to the same PR branch:
   - Commit only relevant files (exclude artifacts like `next-env.d.ts`)
   - Push to the PR branch
   - Reply with: blockers addressed, tests run, commit hash, PR URL

## Guardrails

- Treat reviewer **Blockers** as mandatory; do not mark done until each has a test or clear justification
- Prefer `gh` for all GitHub/PR operations
- Do not merge the PR unless the user explicitly asks
- Do not force-push unless the user explicitly asks
