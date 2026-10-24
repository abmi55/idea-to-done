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
status names, command names, IDs (Q1, A1, AC1, S1, BC1), code, file names,
commands and error messages unchanged.

## Project instructions

Project instructions (CLAUDE.md, AGENTS.md) take precedence over this skill
for paths, language, conventions and tooling. For example, use the project's
folder for plans or decisions instead of `docs/plans` if it defines one.

If the project defines its own idea or planning process: follow the project,
tell the user about the overlap, and do not run both processes.

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
- Intake lock: New idea, Answer and Plan create the empty file
  `docs/backlog/.intake-lock` as their first write and delete it as their
  last action, also when they stop early. If the project uses other folders
  than `docs/backlog` and `docs/plans`, write those folders in the lock file,
  one per line. The optional hook in `hooks/idea-guard.js` uses the file to
  block other writes.

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
7. Run the quality check (see below).
8. Reply in chat with: the file path, a 2–3 line summary, the questions, any
   conflicts, the verdict, failing check items and the next command. If the
   verdict is `kill`: suggest `/idea drop NNN` but change no status. Stop.

Done when:
- [ ] The backlog file exists with status IDEA and a History line.
- [ ] The quality check ran and its result is in the reply.
- [ ] The Challenge section ends with a verdict.
- [ ] `docs/backlog/.intake-lock` is deleted.

## Challenge the idea

Say so explicitly if the idea:
- duplicates existing functionality,
- conflicts with the architecture or an earlier decision (search
  `docs/backlog`, `docs/plans` and any ADR or architecture documents),
- has high cost for low value,
- is better solved another way,
- adds new code where existing code can be reused or extended,
- needs a new dependency where the standard library or an installed
  dependency is enough.

Report the conflict and the reasoning. Do not resolve it silently. The
decision belongs to the user.

End the Challenge section with `Verdict: go`, `needs-clarification` or `kill`
and one sentence on why. `kill` is a recommendation. Stopping an idea is a
valid outcome, not a failure.

## Quality check

Run [brief-checklist.md](brief-checklist.md) against the brief. Fix the brief
and run it again, at most 3 rounds. Report the items that still fail in chat.
Do not write the result into the backlog file.

## Questions

- Choose questions with the areas in [brief-checklist.md](brief-checklist.md).
  Pick the ones with the highest impact multiplied by uncertainty.
- Ask at most five open questions, numbered Q1, Q2 … Use the question form in
  [brief-template.md](brief-template.md): a full question that ends with `?`,
  a "Why" sentence, a recommendation with a reason, and options A–D when there
  are real alternatives.
- Write every other uncertainty as a numbered assumption A1, A2 … that the
  user can correct.
- Questions that do not fit within five and cannot be assumptions go under
  Deferred, each with one line on why it can wait.

## Answer

Requires status IDEA.
1. Map the answers to the Q numbers, for example "Q1: yes, Q3: admins only".
   `Qn: rec` means the recommendation for that question.
2. Record them under Decisions. Write the text of the chosen answer, never the
   word "rec".
3. Update the brief: remove answered questions, adjust scope, acceptance
   criteria and assumptions.
4. If the answers raise new important questions: ask them. At most five open
   in total.
5. Run the quality check.
6. Show what changed. Stop.

Done when:
- [ ] Every answer is under Decisions as text.
- [ ] No answered question is still open.
- [ ] The quality check ran and its result is in the reply.
- [ ] `docs/backlog/.intake-lock` is deleted.

## Approve

The gate depends on the current status:
- IDEA to REFINED: the brief must be complete, with no open questions, at
  least one acceptance criterion and every item in
  [brief-checklist.md](brief-checklist.md) passing. Otherwise: list what is
  missing and stop. If the brief proposes a split: carry it out (see
  Splitting).
- REFINED with a plan to PLANNED: the plan file must exist and be linked.
- REFINED without a plan: say that `/idea plan NNN` is needed first.
- Any other status: say there is nothing to approve.

Done when:
- [ ] The status changed and a History line was added, or the reply lists
  what is missing.

## Plan

Requires status REFINED.
1. Read the brief and the decisions. Inspect the code again if needed, with
   the same rules as for a new idea.
2. Research only when needed: if the brief has a real technology choice under
   Options, or an unknown blocks the plan, write `docs/plans/NNN-research.md`
   from the research format in [plan-template.md](plan-template.md). Link it
   in the plan and sum up each decision there in one line.
3. Check current sources for every new dependency and every framework API the
   plan uses for the first time. Use a documentation tool if one is available
   (such as Context7), otherwise the official documentation or the package
   registry. Check the latest stable version, deprecation, maintenance (last
   release) and that the planned API exists in that version. If no source can
   be checked: write "Not verified against current docs". Never present
   versions or APIs from memory as checked.
4. Write `docs/plans/NNN-name.md` from [plan-template.md](plan-template.md).
5. Every step names the acceptance criteria it satisfies. Every acceptance
   criterion is covered by at least one step.
6. Link the plan in the backlog file.
7. Stop and ask for `/idea approve NNN`.

Done when:
- [ ] The plan file exists and is linked in the backlog file.
- [ ] Every acceptance criterion is in the Coverage table.
- [ ] Every new dependency and new API has a source and date, or says it
      was not verified.
- [ ] `docs/backlog/.intake-lock` is deleted.

## Start

Requires status PLANNED.
1. Check whether the brief is stale. If the project is a git repository: run
   `git log --since=<brief date> --name-only` and compare with the files in
   the impact analysis and the plan. If affected files have changed: report
   which ones and ask whether to update the plan or run it anyway. Stop until
   the user answers.
2. Set status IN PROGRESS. If the project is a git repository: write the
   output of `git rev-parse HEAD` in the History line as `base: <hash>`.
3. Carry out the plan steps in order. After each step: check it off in the
   plan and give a short step report (what, which files, how it was verified).
4. New ideas that come up during the work are never started. Create an IDEA
   file of 1–2 lines without a brief, continue, and mention it in the step
   report.
5. If something requires a deviation from the plan that changes scope or
   acceptance criteria: stop and ask.
6. Never add a dependency that is not in the Dependencies section of the
   approved plan. If one is needed: stop and ask. Install the exact version
   in the plan. If the check date is more than 30 days old: check the version
   again first and report any change before you install.

Done when:
- [ ] Every finished step is checked off and has a step report.
- [ ] The History line has the base hash, if the project uses git.

## Done

Requires status IN PROGRESS and all plan steps checked off.
1. Check the code against the intent. A checked-off step is not evidence.
   - Use a read-only subagent, such as Explore in Claude Code, if one is
     available. Otherwise read the files directly.
   - Give it the brief, the decisions, the plan and the acceptance criteria.
     It checks every acceptance criterion and every step, whatever the
     checkbox says.
   - Scope: the files in the plan, plus `git diff --name-only <base>` if the
     History has a base hash. Without a base hash: only the files in the plan.
     Say in the reply which method was used.
   - Every finding has a gap type, a source (AC or step ID) and evidence (the
     file or area observed):
     - `missing`: the required work is not in the code.
     - `partial`: the work exists but does not fully meet the criterion.
     - `contradicts`: the code conflicts with the brief, the plan or a
       decision.
     - `unrequested`: the code does something no brief, plan or decision asks
       for.
2. If there are findings: add one new step per finding at the end of the plan,
   numbered after the highest existing step (see
   [plan-template.md](plan-template.md)). Never change, reorder or renumber
   existing steps. For `unrequested`, the step is "review or justify"; never
   delete code on your own. Keep status IN PROGRESS, report the findings and
   point to `/idea start NNN`. Stop.
3. If there are no findings: leave the plan unchanged. Verify every acceptance
   criterion with evidence: a test that ran, a command and its output, or a
   described manual check.
4. Fill in the Verification table in the backlog file.
5. If a criterion is not met: keep IN PROGRESS and report what is missing.
6. If all are met: set status DONE.

Done when:
- [ ] The intent check ran and the reply names the scope method.
- [ ] Findings are new steps at the end of the plan, or the plan is unchanged.
- [ ] The Verification table is filled in, or the reply says what is missing.

## Drop

Allowed for every status except DONE. Set status DROPPED and record the
reason. If the status was IN PROGRESS: list the code changes already made.
Revert nothing without asking.

Done when:
- [ ] The status is DROPPED with a reason and a History line.

## List

Read all files in `docs/backlog`. Show a table with number, title, status and
next command, grouped by status.

Done when:
- [ ] Every backlog file is in the table.

## Splitting

If the work cannot be delivered and verified as one unit: propose a split in
the Size section of the brief and explain it. There is no fixed size limit.
When the brief is approved:
- create one backlog file per part, with new numbers, status IDEA, its part of
  the brief and a link to the parent,
- set the parent's status to SPLIT and list the parts in it.

Each part then goes through its own brief, plan and approvals.
