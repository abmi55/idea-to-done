# Decision record and changelog

`/idea done` writes both files when it sets status DONE. They are public and
are committed with the delivered work. Write them in the project's language
(see Language in SKILL.md).

## Decision record

File: `docs/decisions/NNN-name.md`, same NNN and name as the task folder.

```markdown
# NNN: Title

Date: YYYY-MM-DD

## Summary
1–2 lines on what was built.

## Why
The problem it solves and for whom, from the brief.

## Decisions
- Chosen: <option> – <one line on why>
- Rejected: <option> – <one line on why not>

## Behavior
From Approved behavior in the discussion file: behavior and out of scope.

## Verification
1–3 lines on how the acceptance criteria were verified, such as the tests
that ran.
```

Rules:
- No open questions, no history, no plan steps and no step reports.
- No links into `docs/backlog/`. That folder is not committed.
- Decisions lists the options from the brief and the answers that changed the
  scope. If there was no real choice: one line with the chosen approach.

## Changelog line

File: `CHANGELOG.md` in the project root, in the
[Keep a Changelog](https://keepachangelog.com) format.

- Add one line under `## [Unreleased]`, in the group that fits: Added (new
  feature), Changed (changed behavior), Fixed (bug fix) or Removed.
- Create the group heading if it is missing. Keep the order Added, Changed,
  Fixed, Removed.
- The line describes the change for a user of the project and links the
  decision record:
  `- Export listings as CSV ([007](docs/decisions/007-csv-export.md))`
- If `CHANGELOG.md` does not exist, create it:

```markdown
# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- …
```
