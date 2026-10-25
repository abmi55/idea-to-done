# Discussion template

The brief in `docs/backlog/NNN-name/discussion.md`. Keep each point as short
as the idea allows. A section that does not apply is written as "N/A" on one
line. A lite brief (small idea) may have N/A in sections 6–10.

## 1. Problem
What it solves, for whom, and how we know it worked.

## 2. Restated scope
What you understood, in your own words.

## 3. Open questions
Q1 … Q5, at most five. Each question has this form:

```markdown
- Q1: <A full question that ends with a question mark?>
  Why: <one sentence on what the answer changes>
  Recommendation: <your answer> – <one sentence on why>
  Options: A) … B) … C) … (only when there are real alternatives)
```

### Assumptions
A1, A2 … Every assumption the user can correct.

### Deferred
Questions that did not fit within the five, each with one line on why it can
wait. "None" if empty.

## 4. Acceptance criteria
Observable conditions for "done". One per line, with an ID. Write criteria
that describe behavior as Given/When/Then. Criteria that do not describe
behavior may use free form.
- AC1: Given a signed-in user with two listings, When they click Export, Then
  a CSV file with two rows and a header row is downloaded.
- AC2: The README describes the export under Features.

## 5. Out of scope

## 6. Edge cases and non-functional concerns
Errors, empty states, permissions, performance, security, privacy, backwards
compatibility.

## 7. Impact analysis
Affected modules, files, data models, APIs and code that can be reused.

Inspected files:
- …

Not inspected:
- …

## 8. Options
Only if there is a real choice: 2–3 options with trade-offs and a
recommendation. Otherwise one proposal.

## 9. Risks and dependencies
Migrations, breaking changes, external services, anything hard to undo.

## 10. Size
Can it be delivered and verified as one unit? If not: a proposed split into
parts that can be delivered independently, with reasoning.

## Challenge
Conflicts with existing functionality, architecture or earlier decisions, or
"None found". End with:

```markdown
Verdict: go | needs-clarification | kill – <one sentence on why>
```

## Approved behavior
Written by `/idea approve NNN` when the status goes from IDEA to REFINED.
Before that: "–". It is the reference for the plan and for `/idea done`.

### Behavior
What the delivered work does, in a few short lines, based on the acceptance
criteria and the decisions.

### Out of scope
What it does not do, taken from section 5 and the decisions.
