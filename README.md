<div align="center">

# idea-to-done

**A Claude Code skill that takes an idea from first description to verified delivery, with a gate you approve at every step.**

[![Claude Code](https://img.shields.io/badge/Claude%20Code-skill-D97757)](https://code.claude.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Status](https://img.shields.io/badge/status-stable-brightgreen)

[Why](#why) · [Features](#features) · [Workflow](#workflow) · [Commands](#commands) · [Install](#install) · [Compatibility](#compatibility) · [Limitations](#limitations)

</div>

---

## Why

AI coding agents are fast at writing code. That speed is also the risk. Without a process, the same problems show up again and again:

| Problem | What happens |
|---|---|
| **Code before understanding** | A half-formed idea becomes code before anyone asks what problem it solves, for whom, or how to tell it worked. |
| **Silent scope creep** | The agent fills gaps on its own and builds more, or something else, than you meant. |
| **"Done" means "written"** | Nobody checks that the delivered change actually meets the requirements. |
| **Lost ideas** | An idea that comes up mid-task is either forgotten or started at once, and focus is lost. |
| **Vague approvals** | A casual "sounds good" in chat is read as permission to implement. |
| **Guesses presented as facts** | The agent describes code it never read as if it had inspected it. |

`/idea` fixes this with a simple order: **understand, plan, build, prove.**

## Features

- 🚦 **Explicit gates.** Status changes only through commands like `/idea approve 007`. A chat "ok" never counts, so you always know exactly what you approved.
- 🔒 **No code before an approved plan.** During intake the agent may read the codebase but writes only the backlog and plan documents.
- 🔗 **End-to-end traceability.** Questions (`Q1`), assumptions (`A1`) and acceptance criteria (`AC1`) get IDs. Every plan step names the criteria it satisfies, and `/idea done` verifies them one by one, with evidence.
- 🗣️ **Pushback built in.** The agent says so when an idea duplicates existing functionality, could reuse existing code, needs a dependency it could do without, conflicts with the architecture or costs more than it returns. Every brief ends with a verdict: `go`, `needs-clarification` or `kill`. The decision stays yours.
- ✅ **Self-checked briefs.** Before you see a brief, the agent checks it against a fixed list: testable Given/When/Then criteria, no vague words, a bounded scope. It fixes what it can and tells you what still fails.
- 💡 **Questions with a recommendation.** Every question says why it matters and what the agent recommends. Answer `Q1: rec` to accept it.
- 🧪 **Independent verification.** `/idea done` checks the code against the brief before anything counts as done. A checked-off step is not evidence. Gaps become new plan steps, typed `missing`, `partial`, `contradicts` or `unrequested`, so scope creep shows up too.
- 📦 **No surprise dependencies.** Every new dependency is listed in the plan with a reason and a rejected alternative. During `/idea start`, the agent stops and asks before adding one that is not in the approved plan.
- 📅 **Checked against current docs.** New dependencies and new framework APIs are checked against current documentation or the package registry, with source and date in the plan, so the plan does not rest on outdated training data. A real technology choice gets a short `research.md` with the decision, alternatives and sources.
- 🔍 **Honest about what was read.** Every brief lists the files that were inspected, and the ones that were not.
- ⏱️ **Stale-plan check.** `/idea start` uses `git log` to detect changes to affected files since the brief was written. It records the base commit, and `/idea done` uses it to find every file changed since then.
- 📥 **Capture without derailing.** Ideas that come up during other work become a two-line backlog file, and the current work continues.
- 🪶 **Light for small ideas.** A small idea gets a short brief, with `N/A` for sections that do not apply and no subagent.
- 🌍 **Speaks your language.** Briefs and plans are written in the language you write in, unless your project's `CLAUDE.md` says otherwise.
- 🧠 **Context-friendly.** The full process loads only when you run `/idea`. Only four always-on rules live in your global configuration.

## Workflow

```mermaid
flowchart LR
    IDEA -- approve --> REFINED -- "plan + approve" --> PLANNED -- start --> PROGRESS["IN PROGRESS"] -- done --> DONE
```

Any status except `DONE` can be dropped with `/idea drop`. An idea that is too large becomes `SPLIT` when its brief is approved.

| Status | Meaning |
|---|---|
| `IDEA` | New or being refined |
| `REFINED` | Brief approved |
| `PLANNED` | Plan approved |
| `IN PROGRESS` | Being implemented |
| `DONE` | All acceptance criteria verified |
| `DROPPED` | Cancelled, reason recorded |
| `SPLIT` | Divided into smaller parts, each with its own backlog file |

### What a brief contains

1. **Problem:** what it solves, for whom, and how we know it worked
2. **Restated scope** in the agent's own words
3. **Open questions:** at most five, each with a recommendation, plus numbered assumptions you can correct
4. **Acceptance criteria:** observable conditions for "done", written as Given/When/Then
5. **Out of scope**
6. **Edge cases and non-functional concerns:** errors, empty states, permissions, performance, security, privacy, backwards compatibility
7. **Impact analysis:** affected modules, files, data models and APIs, plus a list of inspected files
8. **Options:** only when there is a real choice, with a recommendation
9. **Risks and dependencies:** migrations, breaking changes, anything hard to undo
10. **Size:** a proposed split if the work cannot be delivered and verified as one unit

## Commands

| Command | Requires | Does |
|---|---|---|
| `/idea <description>` | – | Reads the code, creates a backlog file and writes the brief |
| `/idea answer NNN <answers>` | `IDEA` | Records your answers and updates the brief |
| `/idea approve NNN` | `IDEA` / `REFINED` | Approves the brief or the plan |
| `/idea plan NNN` | `REFINED` | Writes the implementation plan |
| `/idea start NNN` | `PLANNED` / `IN PROGRESS` | Checks for stale files, then implements step by step. On `IN PROGRESS`, continues with the steps not yet checked off, such as gaps found by `done` |
| `/idea done NNN` | `IN PROGRESS` | Checks the code against the brief, then verifies every acceptance criterion |
| `/idea drop NNN <reason>` | any except `DONE` | Cancels the idea and records why |
| `/idea list` | – | Shows the backlog |

### Example

```text
/idea Users should be able to export their listings as CSV
```

Claude creates `docs/backlog/001-csv-export.md` with a full brief and stops. Then:

```text
/idea answer 001 Q1: own listings only, Q2: rec
/idea approve 001
/idea plan 001
/idea approve 001
/idea start 001
/idea done 001
```

## Install

### As a Claude Code plugin (recommended)

The plugin gives you the skill, the always-on rules and the write guard in one step, and it can update itself.

```text
/plugin marketplace add abmi55/idea-to-done
/plugin install idea-to-done@idea-to-done
```

Restart Claude Code and type `/idea` to see the help. The full name `/idea-to-done:idea` also works, and is needed only if another skill or command is already called `idea`.

**Updates:** turn on automatic updates once in `/plugin` → **Marketplaces** → `idea-to-done` → **Enable auto-update**. Without it, run `/plugin marketplace update idea-to-done` to get the latest version.

> [!IMPORTANT]
> Did you install by copying files before? Remove `~/.claude/skills/idea`, `~/.claude/rules/idea-intake.md` and the `idea-guard.js` entry in `~/.claude/settings.json`. Otherwise Claude gets two copies of the skill and the rules.

### Manual install

A manual install does not update. Run `git pull` and copy the files again after each release.

<details>
<summary><b>macOS, Linux or Git Bash</b></summary>

```bash
git clone https://github.com/abmi55/idea-to-done.git
mkdir -p ~/.claude/skills ~/.claude/rules
cp -r idea-to-done/skills/idea ~/.claude/skills/
cp idea-to-done/rules/idea-intake.md ~/.claude/rules/
```

</details>

<details>
<summary><b>Windows PowerShell</b></summary>

```powershell
git clone https://github.com/abmi55/idea-to-done.git
New-Item -ItemType Directory -Force $HOME\.claude\skills, $HOME\.claude\rules | Out-Null
Copy-Item -Recurse idea-to-done\skills\idea $HOME\.claude\skills\
Copy-Item idea-to-done\rules\idea-intake.md $HOME\.claude\rules\
```

</details>

Restart Claude Code and type `/idea` to see the help.

> [!TIP]
> If a project's `CLAUDE.md` already has its own idea rules, remove them so Claude does not get two conflicting versions.

### Hard guarantee (optional, manual install only)

The plugin includes this hook already. By default, "no project files during intake" is an instruction. The hook in `hooks/idea-guard.js` makes it a technical block. While an intake command runs, the skill creates `.idea-intake.lock` in the project root. The hook then blocks writes outside `docs/backlog` and `docs/plans`:

- every Edit, Write and NotebookEdit,
- Bash and PowerShell commands that write files, such as `>` redirects, `sed -i`, `rm`, `mv`, `cp`, `Set-Content` and `Remove-Item`,
- package installs and git commands that change files, such as `npm install` and `git checkout`.

The skill deletes the lock when the command ends. A lock older than 2 hours counts as left over from an interrupted command, and the hook ignores it. If your project keeps intake files in other folders, list them in the lock file, one per line, and the hook allows only those. Without the lock file, the hook does nothing, so bug fixes and small changes still work. It needs Node, which Claude Code already uses.

Copy the hook:

```bash
mkdir -p ~/.claude/hooks
cp idea-to-done/hooks/idea-guard.js ~/.claude/hooks/
```

```powershell
New-Item -ItemType Directory -Force $HOME\.claude\hooks | Out-Null
Copy-Item idea-to-done\hooks\idea-guard.js $HOME\.claude\hooks\
```

Then add it to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|NotebookEdit|Bash|PowerShell",
        "hooks": [{ "type": "command", "command": "node ~/.claude/hooks/idea-guard.js" }]
      }
    ]
  }
}
```

Add `.idea-intake.lock` to each project's `.gitignore`.

## Compatibility

`/idea` is built and tested for **Claude Code**. The skill follows the open [Agent Skills](https://agentskills.io) format (`SKILL.md`), so other tools that support the format, such as OpenAI Codex, GitHub Copilot, Gemini CLI or Cursor, can likely load it too. These tools are not tested.

| Part | Claude Code | Other tools |
|---|---|---|
| Workflow, templates, backlog files | ✅ | ✅ Plain Markdown and instructions |
| Manual start only (`disable-model-invocation`) | ✅ | ⚠️ May be ignored, so the agent could start the skill on its own |
| Arguments (`/idea plan 007`) | ✅ | ⚠️ The skill falls back to reading them from your message |
| Read-only code inspection subagent | ✅ Explore | ⚠️ Uses a subagent if one exists, otherwise reads files directly |
| Always-on rules | ✅ `~/.claude/rules/` | ⚠️ Paste `rules/AGENTS.md` into your tool's `AGENTS.md` |

**Using another tool:** copy `skills/idea` into the skills folder your tool uses (see its documentation), and add the contents of `rules/AGENTS.md` to the project's or your global `AGENTS.md`.

## Repository layout

```text
skills/idea/
├── SKILL.md            modes, gates and rules
├── brief-template.md   the ten brief sections
├── brief-checklist.md  quality check and question areas
├── plan-template.md    plan format with a coverage table
└── backlog-format.md   statuses and file format
.claude-plugin/
├── plugin.json         plugin manifest
└── marketplace.json    lets users add this repository as a marketplace
hooks/
├── hooks.json          hook config for the plugin install
├── session-rules.js    SessionStart hook that loads the always-on rules
├── idea-guard.js       PreToolUse hook that blocks writes during intake
└── idea-guard.test.js  tests, run with node --test hooks/idea-guard.test.js
rules/
├── idea-intake.md      always-on rules for Claude Code
└── AGENTS.md           the same rules for tools that read AGENTS.md
```

In each project, the skill creates:

```text
docs/backlog/NNN-name.md   brief, decisions, verification and history
docs/plans/NNN-name.md     implementation plan
docs/plans/NNN-research.md research, only for a real technology choice
```

## Limitations

- Without the optional hook, "do not write project files during intake" is an instruction, not a technical block.
- The shell check in the hook recognizes common commands. It is not a sandbox: a write through a script, such as `python -c` or `node -e`, or through a command it does not know, is not blocked.
- If an intake command is interrupted, the lock file stays behind for up to 2 hours and blocks edits. Delete `.idea-intake.lock` to unlock sooner.
- The stale-plan check needs the project to be a git repository.
- The skill sets `disable-model-invocation: true`. Claude never starts it on its own, only you can, with `/idea`.

## License

[MIT](LICENSE) © 2026 Abbas Mirhazar
