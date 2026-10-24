# Plan template

File: `docs/plans/NNN-name.md`

```markdown
# Plan NNN: Title

Brief: [NNN-name](../backlog/NNN-name.md)
Created: YYYY-MM-DD

## Overview
2–3 lines on the approach.

## Steps
- [ ] S1: What is done.
  Files: …
  Satisfies: AC1
  Verification: test, command or manual check.
- [ ] S2: …

## Coverage
| AC | Steps |
|---|---|
| AC1 | S1, S3 |

## Test strategy
Which tests are added or changed, and how they run.

## Migration and rollback
Only if relevant. Otherwise "N/A".

## Implementation risks
```

Rules:
- Every step can be verified on its own.
- Every acceptance criterion appears in the Coverage table.
- No steps outside the scope of the brief.

## Steps added by done

`/idea done` adds one step per finding at the end of the Steps list. It never
changes, reorders or renumbers existing steps:

```markdown
- [ ] S7: Add the empty-state message to the export page.
  Finding: missing, AC3
  Evidence: src/export/page.tsx has no branch for zero listings.
```
