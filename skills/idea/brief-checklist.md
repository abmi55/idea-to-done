# Brief checklist

Run this list against the brief after you write or update it. Every item is a
yes/no question. Fix the brief and run the list again, at most 3 rounds. Report
the items that still fail in chat, not in `discussion.md`.

A lite brief skips the items marked (full).

## Quality items

- BC1: Is every acceptance criterion that describes behavior written as
  `Given …, When …, Then …`? Criteria that do not describe behavior, such as
  documentation, may use free form.
- BC2: Can every acceptance criterion be checked by a test, a command or a
  concrete manual check, without follow-up questions?
- BC3: Is every vague word ("fast", "simple", "secure", "works well",
  "user-friendly") replaced by a measurable value or a concrete condition?
- BC4: Are there no TODO markers, placeholders or "???" left?
- BC5: Does Out of scope name at least one thing that a reader could expect
  but that is not included?
- BC6: Is every uncertainty either an open question (Q) or a numbered
  assumption (A)?
- BC7 (full): Are errors, empty states and permissions covered, or marked
  N/A with a reason?
- BC8 (full): Does the impact analysis list inspected and not inspected files?

## Areas for questions

Scan the brief against these areas. Mark each one Clear, Partial or Missing.
Ask questions only for Partial or Missing areas where the answer changes the
scope, the acceptance criteria or the plan.

- Scope and boundaries
- Users, roles and permissions
- Data: entities, fields, lifecycle, volume
- Flow and UX: main path, errors, empty and loading states
- Edge cases and failure handling
- Security and privacy
- Performance and limits
- Integrations and external dependencies
- Terminology: one name for one thing
- Testability of the acceptance criteria
