---
name: idea
description: Idea intake from first description to verified delivery. Brief, approval, plan, implementation and verification against acceptance criteria, with one folder per task and a status register in docs/backlog. Started manually with /idea only.
disable-model-invocation: true
argument-hint: "<description> | answer|approve|plan|start|done|drop NNN [text] | list"
---

# Idea intake

Arguments: $ARGUMENTS

If the line above shows no arguments, or an unreplaced placeholder, take the
arguments from the user's message instead: everything after `/idea`.

Start every mode by reading `docs/backlog/status.md` and listing the task
folders in `docs/backlog` with a file search tool. If the folder does not
exist, the backlog is empty.

## Language

Write backlog and plan documents, and talk to the user, in the language the
user writes in, unless the project's CLAUDE.md specifies another language.
Translate the section headings of the templates into that language. Keep
status names, command names, IDs (Q1, A1, AC1, S1, BC1), code, file names,
commands and error messages unchanged.

Write the public files from `/idea done` (`CHANGELOG.md` and the decision
record) in the project's language: the language the project's CLAUDE.md
specifies, otherwise the language of the existing `CHANGELOG.md` or
`README.md`, otherwise the user's language.

## Project instructions

Project instructions (CLAUDE.md, AGENTS.md) take precedence over this skill
for paths, language, conventions and tooling. A project can define its own:
- backlog folder, instead of `docs/backlog`,
- decisions folder, instead of `docs/decisions`,
- changelog file, instead of `CHANGELOG.md`.

Use the project's path everywhere this skill names the default.

If the project defines its own idea or planning process: follow the project,
tell the user about the overlap, and do not run both processes.

## Git

Planning is private. Delivered work and its reasons are public.
- `docs/backlog/` is planning. Never commit it and never stage files in it.
- On the first New idea in a project (no `docs/backlog/status.md` yet), and
  if the project is a git repository: check with
  `git check-ignore -q docs/backlog/` whether the folder is ignored. If not:
  tell the user and recommend adding `docs/backlog/` to `.gitignore`. Do not
  edit `.gitignore` without asking.
- `CHANGELOG.md` and `docs/decisions/` are public. `/idea done` writes them.

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

NNN is the task number. Accept both `7` and `007`. If the task folder
`docs/backlog/NNN-*/` does not exist: say so and stop.

## Rules for all modes

- Read the status in `discussion.md` before you do anything. If the command
  does not fit the status: say which status the task has and which command
  applies. Stop.
- Status changes only through these commands. "Ok", "sounds good" or similar
  in chat is not an approval. Point to `/idea approve NNN`.
- Before status PLANNED: do not change project files. The only allowed writes
  are files in `docs/backlog/`.
- Never implement during intake, even if the idea seems small or obvious.
- Never present guesses as findings. State explicitly what was not inspected.
- On every status change: add a line under History in `discussion.md` (date,
  new status, command) and update the task's line in `docs/backlog/status.md`
  in the same step. See [backlog-format.md](backlog-format.md).
- Intake lock: New idea, Answer and Plan create the empty file
  `docs/backlog/.intake-lock` as their first write and delete it as their
  last action, also when they stop early. If the project uses another backlog
  folder, still create the lock at `docs/backlog/.intake-lock` and write the
  project's folder in it, one per line. The optional hook in
  `hooks/idea-guard.js` uses the file to block other writes, and ignores a
  lock older than 2 hours.
- If the hook blocks a write: stop and tell the user what was blocked. Never
  delete the lock file to get past the block.

File format, statuses and the register: see
[backlog-format.md](backlog-format.md).

## New idea

1. Compare with the existing tasks. If an existing idea covers the same
   thing: say so, suggest `/idea answer NNN` on it, and create no new folder
   until the user confirms.
2. Number: highest existing NNN + 1, three digits. Name: 2–4 words in
   kebab-case, ASCII only. Create the folder `docs/backlog/NNN-name/`.
3. Judge the size:
   - Small idea (at most 2–3 files, no change to data models or APIs): read
     the files directly and write a lite brief.
   - Otherwise: do the code inspection through a read-only subagent, such as
     Explore in Claude Code, so the main context is not filled with file
     contents. Give the subagent the idea and ask for affected modules, files,
     data models, APIs, reusable code and a list of inspected files. If no
     subagent is available, read the files directly.
4. If the idea is too vague to write acceptance criteria: create
   `discussion.md` with status IDEA and only Problem and Questions. Add the
   task to `status.md`. Stop.
5. Otherwise: write `discussion.md` from
   [discussion-template.md](discussion-template.md).
6. Add the task to Queue in `status.md`.
7. Challenge the idea (see below).
8. Run the quality check (see below).
9. Reply in chat with: the folder path, a 2–3 line summary, the questions,
   any conflicts, the verdict, failing check items, the `.gitignore` advice
   from Git if it applies, and the next command. If the verdict is `kill`:
   suggest `/idea drop NNN` but change no status. Stop.

Done when:
- [ ] `discussion.md` exists with status IDEA and a History line.
- [ ] The task is in `status.md`.
- [ ] The quality check ran and its result is in the reply.
- [ ] The Challenge section ends with a verdict.
- [ ] `docs/backlog/.intake-lock` is deleted.

## Challenge the idea

Say so explicitly if the idea:
- duplicates existing functionality,
- conflicts with the architecture or an earlier decision (search
  `docs/backlog`, `docs/decisions` and any ADR or architecture documents),
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
Do not write the result into `discussion.md`.

## Questions

- Choose questions with the areas in [brief-checklist.md](brief-checklist.md).
  Pick the ones with the highest impact multiplied by uncertainty.
- Ask at most five open questions, numbered Q1, Q2 … Use the question form in
  [discussion-template.md](discussion-template.md): a full question that ends
  with `?`, a "Why" sentence, a recommendation with a reason, and options A–D
  when there are real alternatives.
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
  missing and stop. Fill in Approved behavior (behavior and out of scope)
  from the acceptance criteria, Out of scope and the decisions, and show it in
  the reply. If the brief proposes a split: carry it out (see Splitting).
- REFINED with a plan to PLANNED: `plan.md` must exist and be linked.
- REFINED without a plan: say that `/idea plan NNN` is needed first.
- Any other status: say there is nothing to approve.

Done when:
- [ ] The status changed, with a History line and an updated `status.md`, or
  the reply lists what is missing.
- [ ] At IDEA to REFINED: Approved behavior is filled in.

## Plan

Requires status REFINED.
1. Read the brief, the decisions and Approved behavior. Inspect the code
   again if needed, with the same rules as for a new idea.
2. Research only when needed: if the brief has a real technology choice under
   Options, or an unknown blocks the plan, write
   `docs/backlog/NNN-name/research.md` from the research format in
   [plan-template.md](plan-template.md). Link it in the plan and sum up each
   decision there in one line.
3. Check current sources for every new dependency and every framework API the
   plan uses for the first time. Use a documentation tool if one is available
   (such as Context7), otherwise the official documentation or the package
   registry. Check the latest stable version, deprecation, maintenance (last
   release) and that the planned API exists in that version. If no source can
   be checked: write "Not verified against current docs". Never present
   versions or APIs from memory as checked.
4. Write `docs/backlog/NNN-name/plan.md` from
   [plan-template.md](plan-template.md). Approved behavior is the reference:
   no step goes outside it.
5. Every step names the acceptance criteria it satisfies. Every acceptance
   criterion is covered by at least one step.
6. Link the plan in `discussion.md`.
7. Stop and ask for `/idea approve NNN`.

Done when:
- [ ] `plan.md` exists and is linked in `discussion.md`.
- [ ] Every acceptance criterion is in the Coverage table.
- [ ] Every new dependency and new API has a source and date, or says it
      was not verified.
- [ ] `docs/backlog/.intake-lock` is deleted.

## Start

Requires status PLANNED, or IN PROGRESS to resume.

First check Now in `status.md`. If Now holds another task: warn, name that
task and its "Left off" line, and ask whether to continue. Stop until the
user answers. If the user continues: move the other task to Paused/Dropped
with its "left off" text. Its status stays IN PROGRESS.

Then move this task to Now in `status.md`.

If the status is IN PROGRESS: skip steps 1 and 2 and keep the base hash in
the History. Continue with the first step that is not checked off, including
steps added by `/idea done`. Then follow steps 3–7.

1. Check whether the brief is stale. If the project is a git repository: run
   `git log --since=<brief date> --name-only` and compare with the files in
   the impact analysis and the plan. If affected files have changed: report
   which ones and ask whether to update the plan or run it anyway. Stop until
   the user answers.
2. Set status IN PROGRESS. If the project is a git repository: write the
   output of `git rev-parse HEAD` in the History line as `base: <hash>`.
3. Carry out the plan steps in order. After each step: check it off in the
   plan and give a short step report (what, which files, how it was verified).
4. After each step report, and every time Start stops to ask: update
   "Left off:" under Now in `status.md` with where the work stopped and what
   is next.
5. New ideas that come up during the work are never started. Create a task
   folder with a short `discussion.md` of 1–2 lines and status IDEA, add it to
   Queue in `status.md`, continue, and mention it in the step report.
6. If something requires a deviation from the plan that changes scope or
   acceptance criteria: stop and ask.
7. Never add a dependency that is not in the Dependencies section of the
   approved plan. If one is needed: stop and ask. Install the exact version
   in the plan. If the check date is more than 30 days old: check the version
   again first and report any change before you install.

Done when:
- [ ] The task is in Now, and Now holds no other task.
- [ ] Every finished step is checked off and has a step report.
- [ ] "Left off:" says where the work stopped and what is next.
- [ ] The History line from the first start has the base hash, if the
      project uses git. A resume adds no new base hash.

## Done

Requires status IN PROGRESS and all plan steps checked off.
1. Check the code against the intent. A checked-off step is not evidence.
   - Use a read-only subagent, such as Explore in Claude Code, if one is
     available. Otherwise read the files directly.
   - Give it the brief, the decisions, Approved behavior, the plan and the
     acceptance criteria. It checks every acceptance criterion and every
     step, whatever the checkbox says.
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
   delete code on your own. Keep status IN PROGRESS, report the findings,
   update "Left off:" and point to `/idea start NNN`. Stop.
3. If there are no findings: leave the plan unchanged. Verify every acceptance
   criterion with evidence: a test that ran, a command and its output, or a
   described manual check.
4. Fill in the Verification table in `discussion.md`.
5. If a criterion is not met: keep IN PROGRESS and report what is missing.
6. If all are met: set status DONE and move the task from Now to Done in
   `status.md`. Then write the public files from
   [decision-template.md](decision-template.md):
   - a line in `CHANGELOG.md` under Unreleased (create the file if missing),
   - the decision record `docs/decisions/NNN-name.md`.

Done when:
- [ ] The intent check ran and the reply names the scope method.
- [ ] Findings are new steps at the end of the plan, or the plan is unchanged.
- [ ] The Verification table is filled in, or the reply says what is missing.
- [ ] At DONE: the task is under Done in `status.md`, and `CHANGELOG.md` and
      the decision record are written.

## Drop

Allowed for every status except DONE. Set status DROPPED, record the reason
and move the task to Paused/Dropped in `status.md`. If the status was IN
PROGRESS: list the code changes already made. Revert nothing without asking.

Done when:
- [ ] The status is DROPPED with a reason, a History line and an updated
      `status.md`.

## List

Read `docs/backlog/status.md` and the `discussion.md` in every task folder.
Show a table with number, title, status and next command, grouped by the
sections of `status.md`. Show the "Left off:" line under Now.

Report every disagreement, and change nothing:
- a task folder without a line in `status.md`, or a line without a folder,
- a status in `status.md` that differs from `discussion.md`,
- a task in the wrong section, or more than one task in Now.

Done when:
- [ ] Every task folder is in the table.
- [ ] Every disagreement is in the reply, or the reply says there are none.

## Splitting

If the work cannot be delivered and verified as one unit: propose a split in
the Size section of the brief and explain it. There is no fixed size limit.
When the brief is approved:
- create one task folder per part, with new numbers, a `discussion.md` with
  status IDEA, its part of the brief and a link to the parent,
- set the parent's status to SPLIT and list the parts in it,
- add the parts to Queue and move the parent to Done in `status.md`.

Each part then goes through its own brief, plan and approvals.
