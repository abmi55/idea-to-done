---
name: idea
description: Idea intake from first description to verified delivery. Brief, approval, plan, implementation and verification against acceptance criteria, with a backlog in docs/backlog and plans in docs/plans. Started manually with /idea only.
disable-model-invocation: true
argument-hint: "<description> | answer|approve|plan|start|done|drop NNN [text] | list"
---

# Idea intake

Arguments: $ARGUMENTS

If the line above shows no arguments, or an unreplaced placeholder, take the
arguments from the user's message instead: everything after `/idea`.

Start every mode by listing the files in `docs/backlog` with a file search
tool. If the folder does not exist, the backlog is empty.

## Language

Write backlog and plan documents, and talk to the user, in the language the
user writes in, unless the project's CLAUDE.md specifies another language.
Translate the section headings of the templates into that language. Keep
status names, command names, IDs (Q1, A1, AC1, S1), code, file names, commands
and error messages unchanged.

## Choose the mode

Look at the first word of the arguments:

| First word | Mode |
|---|---|
| `list` | List |
| `answer NNN <answers>` | Answer |
| `approve NNN` | Approve |
| `plan NNN` | Plan |
| `start NNN` | Start |
| `done NNN` | Done |
| `drop NNN <reason>` | Drop |
| (empty) | Show the table above as help and stop |
| anything else | New idea, the full arguments are the description |

NNN is the backlog number. Accept both `7` and `007`. If the file does not
exist: say so and stop.

## Rules for all modes

- Read the status in the backlog file before you do anything. If the command
  does not fit the status: say which status the file has and which command
  applies. Stop.
- Status changes only through these commands. "Ok", "sounds good" or similar
  in chat is not an approval. Point to `/idea approve NNN`.
- Before status PLANNED: do not change project files. The only allowed writes
  are `docs/backlog/NNN-*.md` and `docs/plans/NNN-*.md`.
- Never implement during intake, even if the idea seems small or obvious.
- Never present guesses as findings. State explicitly what was not inspected.
- On every status change: add a line under History in the backlog file (date,
  new status, command).

File format and statuses: see [backlog-format.md](backlog-format.md).

## New idea

1. Compare with the existing backlog files. If an existing idea covers the same
   thing: say so, suggest `/idea answer NNN` on it, and create no new file
   until the user confirms.
2. Number: highest existing NNN + 1, three digits. Name: 2–4 words in
   kebab-case, ASCII only.
3. Judge the size:
   - Small idea (at most 2–3 files, no change to data models or APIs): read
     the files directly and write a lite brief.
   - Otherwise: do the code inspection through a read-only subagent, such as
     Explore in Claude Code, so the main context is not filled with file
     contents. Give the subagent the idea and ask for affected modules, files,
     data models, APIs, reusable code and a list of inspected files. If no
     subagent is available, read the files directly.
4. If the idea is too vague to write acceptance criteria: create the file with
   status IDEA and only Problem and Questions. Stop.
5. Otherwise: write the full brief from [brief-template.md](brief-template.md).
6. Challenge the idea (see below).
7. Reply in chat with: the file path, a 2–3 line summary, the questions, any
   conflicts and the next command. Stop.

## Challenge the idea

Say so explicitly if the idea:
- duplicates existing functionality,
- conflicts with the architecture or an earlier decision (search
  `docs/backlog`, `docs/plans` and any ADR or architecture documents),
- has high cost for low value,
- is better solved another way.

Report the conflict and the reasoning. Do not resolve it silently. The
decision belongs to the user.

## Questions

- Ask at most five open questions, the most important ones, numbered Q1, Q2 …
- Write every other uncertainty as a numbered assumption A1, A2 … that the
  user can correct.

## Answer

Requires status IDEA.
1. Map the answers to the Q numbers, for example "Q1: yes, Q3: admins only".
2. Record them under Decisions.
3. Update the brief: remove answered questions, adjust scope, acceptance
   criteria and assumptions.
4. If the answers raise new important questions: ask them. At most five open
   in total.
5. Show what changed. Stop.

## Approve

The gate depends on the current status:
- IDEA to REFINED: the brief must be complete, with no open questions and at
  least one acceptance criterion. Otherwise: list what is missing and stop. If
  the brief proposes a split: carry it out (see Splitting).
- REFINED with a plan to PLANNED: the plan file must exist and be linked.
- REFINED without a plan: say that `/idea plan NNN` is needed first.
- Any other status: say there is nothing to approve.

## Plan

Requires status REFINED.
1. Read the brief and the decisions. Inspect the code again if needed, with
   the same rules as for a new idea.
2. Write `docs/plans/NNN-name.md` from [plan-template.md](plan-template.md).
3. Every step names the acceptance criteria it satisfies. Every acceptance
   criterion is covered by at least one step.
4. Link the plan in the backlog file.
5. Stop and ask for `/idea approve NNN`.

## Start

Requires status PLANNED.
1. Check whether the brief is stale. If the project is a git repository: run
   `git log --since=<brief date> --name-only` and compare with the files in
   the impact analysis and the plan. If affected files have changed: report
   which ones and ask whether to update the plan or run it anyway. Stop until
   the user answers.
2. Set status IN PROGRESS.
3. Carry out the plan steps in order. After each step: check it off in the
   plan and give a short step report (what, which files, how it was verified).
4. New ideas that come up during the work are never started. Create an IDEA
   file of 1–2 lines without a brief, continue, and mention it in the step
   report.
5. If something requires a deviation from the plan that changes scope or
   acceptance criteria: stop and ask.

## Done

Requires status IN PROGRESS and all plan steps checked off.
1. Verify every acceptance criterion with evidence: a test that ran, a command
   and its output, or a described manual check.
2. Fill in the Verification table in the backlog file.
3. If a criterion is not met: keep IN PROGRESS and report what is missing.
4. If all are met: set status DONE.

## Drop

Allowed for every status except DONE. Set status DROPPED and record the
reason. If the status was IN PROGRESS: list the code changes already made.
Revert nothing without asking.

## List

Read all files in `docs/backlog`. Show a table with number, title, status and
next command, grouped by status.

## Splitting

If the work cannot be delivered and verified as one unit: propose a split in
the Size section of the brief and explain it. There is no fixed size limit.
When the brief is approved:
- create one backlog file per part, with new numbers, status IDEA, its part of
  the brief and a link to the parent,
- set the parent's status to SPLIT and list the parts in it.

Each part then goes through its own brief, plan and approvals.
