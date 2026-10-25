# Backlog format

Location: `docs/backlog/`, one folder per task. NNN has three digits.

```text
docs/backlog/
├── status.md          register for all tasks
├── .intake-lock       exists only while an intake command runs
└── NNN-name/
    ├── discussion.md  brief, decisions, approved behavior, verification, history
    ├── research.md    only when needed, written by `plan`
    └── plan.md        written by `plan`
```

`docs/backlog/` is private planning. It is not committed (see Git in
SKILL.md).

## Statuses

| Status | Meaning | Next command |
|---|---|---|
| IDEA | New or being refined | `answer`, `approve` |
| REFINED | Brief approved | `plan`, then `approve` |
| PLANNED | Plan approved | `start` |
| IN PROGRESS | Being implemented | `start` (resume), `done` |
| DONE | All acceptance criteria verified | – |
| DROPPED | Cancelled, reason recorded | – |
| SPLIT | Divided into separate tasks | (the parts' commands) |

## discussion.md

```markdown
# NNN: Title

Status: IDEA
Created: YYYY-MM-DD
Plan: –
Parent: –
Parts: –

## Brief
(sections 1–10 and Challenge from discussion-template.md)

## Decisions
- Q1: …

## Approved behavior
(from discussion-template.md, written at approve IDEA to REFINED)

## Verification
| AC | Result | Evidence |
|---|---|---|

## History
- YYYY-MM-DD IDEA (/idea)
- YYYY-MM-DD IN PROGRESS (/idea start NNN) base: <git commit hash>
```

The base hash is written only in git repositories. `/idea done` uses it to
find changed files.

## Short discussion.md for ideas found during other work

```markdown
# NNN: Title

Status: IDEA
Created: YYYY-MM-DD
Found during: NNN, step Sx

1–2 lines about the idea.
```

## status.md

The register for all tasks. One line per task: number, title, status and a
link to the folder.

```markdown
# Status

## Now
- 007 CSV export – IN PROGRESS – [007-csv-export](007-csv-export/)

Left off: S3 done. Next: S4, add the download button.

## Queue
- 008 Dark mode – PLANNED – [008-dark-mode](008-dark-mode/)
- 009 Saved searches – IDEA – [009-saved-searches](009-saved-searches/)

## Done
- 004 Login rate limit – DONE – [004-login-rate-limit](004-login-rate-limit/)
- 005 Reports – SPLIT into 008, 009 – [005-reports](005-reports/)

## Paused/Dropped
- 006 Search rewrite – IN PROGRESS, paused, left off: S2 done, next S3 – [006-search-rewrite](006-search-rewrite/)
- 003 Offline mode – DROPPED – [003-offline-mode](003-offline-mode/)
```

Rules:
- Now holds at most one task: the task that `/idea start` works on. When Now
  is empty, it says "–" and "Left off: –".
- Queue holds IDEA, REFINED and PLANNED tasks, in number order.
- Done holds DONE and SPLIT tasks.
- Paused/Dropped holds DROPPED tasks, and IN PROGRESS tasks that left Now
  without being done. A paused line keeps its "left off" text.
- Every status change updates the task's line in `status.md` in the same step
  as the History line in `discussion.md`. Both must show the same status.
- Create `status.md` with the four sections when the first task is created.
