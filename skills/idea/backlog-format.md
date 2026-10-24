# Backlog format

Location: `docs/backlog/NNN-name.md`, one file per idea. NNN has three digits.

## Statuses

| Status | Meaning | Next command |
|---|---|---|
| IDEA | New or being refined | `answer`, `approve` |
| REFINED | Brief approved | `plan`, then `approve` |
| PLANNED | Plan approved | `start` |
| IN PROGRESS | Being implemented | `done` |
| DONE | All acceptance criteria verified | – |
| DROPPED | Cancelled, reason recorded | – |
| SPLIT | Divided into separate backlog files | (the parts' commands) |

## Full file

```markdown
# NNN: Title

Status: IDEA
Created: YYYY-MM-DD
Plan: –
Parent: –
Parts: –

## Brief
(from brief-template.md)

## Decisions
- Q1: …

## Verification
| AC | Result | Evidence |
|---|---|---|

## History
- YYYY-MM-DD IDEA (/idea)
- YYYY-MM-DD IN PROGRESS (/idea start NNN) base: <git commit hash>
```

The base hash is written only in git repositories. `/idea done` uses it to
find changed files.

## Short file for ideas found during other work

```markdown
# NNN: Title

Status: IDEA
Created: YYYY-MM-DD
Found during: NNN, step Sx

1–2 lines about the idea.
```
