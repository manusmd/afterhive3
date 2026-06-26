# Cursor Automations drafts

## Test business logic on PRs

### Draft summary

| Field | Value |
|-------|--------|
| Name | Afterhive business logic tests |
| Description | On PRs touching business logic, add missing unit tests and run `pnpm test`. |
| Trigger | Pull request opened or updated (non-draft) |
| Tools | Comment on PR, manage check run |
| Instructions | Review changed logic in `packages/api`, `packages/domain`, `packages/shared`; add colocated `*.test.ts`; run `pnpm test`; comment results; fail check if tests missing or failing |
| To finish in editor | GitHub repo + default branch (no remote configured in this repo yet) |

### Create it

Open the **Agents Window** and say:

> Create a Cursor automation from `.cursor/automations/test-business-logic-prefill.json`

After the Automations editor opens, set the GitHub repository and branch, then save.
