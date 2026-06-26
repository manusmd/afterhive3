# Linear Export Notes

## Purpose

Field mapping when importing epics/stories to Linear.

## Recommended Linear structure

| Afterhive | Linear |
|-----------|--------|
| EPIC-* | Project or Epic |
| US-* | Issue |
| AC bullets | Issue description checklist |
| SCR-* | Label `screen:SCR-...` |
| PROC-* | Label `api:PROC-...` |
| ENT-* | Label `entity:ENT-...` |

## Issue title format

`[US-110] CSV import leads with error report`

## Dependencies

Link blocks: Phase N+1 epic blocked by Phase N exit criteria

## Labels

`mvp`, `portal`, `billing`, `club-sport`, `platform`, `marketplace-post-mvp`

## Import

**Status:** Synced to Linear project [Afterhive](https://linear.app/manuweb/project/afterhive-9438c620d7c3) (team Manuweb).

- 18 epic parent issues (`MAN-148` … `MAN-169`)
- 1 setup issue: [SETUP-001 / MAN-211](https://linear.app/manuweb/issue/MAN-211) (blocks Phase 0 epics)
- 45 user story sub-issues with AC checklists
- 9 phase milestones (Phase 0–8)
- Epic-level `blockedBy` dependencies per implementation order

Re-sync from docs if epics/stories change in [02-epics-and-stories.md](02-epics-and-stories.md).

## Source of truth

Docs remain canonical for spec detail; Linear tracks delivery status.

## Architecture note (synced 2026-06-26)

- **Four Next.js apps:** `apps/platform`, `apps/admin`, `apps/portal`, `apps/marketplace` + `apps/worker`
- **No NestJS**, no monolithic `apps/web`
- Canonical doc: [00-overview/04-app-surfaces-and-repo.md](../00-overview/04-app-surfaces-and-repo.md)
