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

## Dependencies
New dependencies and framework APIs used for the first time, or "None".
Per item:

- <name> <exact version>
  Why: why it is needed.
  Rejected: the alternative (the standard library or an installed dependency).
  Checked: <source>, YYYY-MM-DD | Not verified against current docs
  Notes: deprecations or breaking changes that matter, or "None".

Research: [NNN-research](NNN-research.md), or "–".

## Migration and rollback
Only if relevant. Otherwise "N/A".

## Implementation risks
```

Rules:
- Every step can be verified on its own.
- Every acceptance criterion appears in the Coverage table.
- No steps outside the scope of the brief.
- Every new dependency is listed under Dependencies.

## Research file

Only when needed (see Plan in SKILL.md). File: `docs/plans/NNN-research.md`

```markdown
# Research NNN: Title

Plan: [NNN-name](NNN-name.md)
Created: YYYY-MM-DD

## R1: <the question>
Decision: what was chosen.
Rationale: why.
Alternatives considered: what else was evaluated and why it was rejected.
Sources: <link or tool>, YYYY-MM-DD
```

## Steps added by done

`/idea done` adds one step per finding at the end of the Steps list. It never
changes, reorders or renumbers existing steps:

```markdown
- [ ] S7: Add the empty-state message to the export page.
  Finding: missing, AC3
  Evidence: src/export/page.tsx has no branch for zero listings.
```
