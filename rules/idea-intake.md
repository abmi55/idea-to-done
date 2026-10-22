## Ideas and new features

The process for ideas lives in the `/idea` skill. These rules always apply:

- If I describe a new idea, feature or behavior change in chat that is not
  covered by a plan with status PLANNED: do not implement and do not start
  intake. Ask once per idea, in my language: "This sounds like a new idea.
  Run `/idea`?" and wait.
- No question is needed for: a bug fix, a step in an approved plan, a small
  change of a few lines (text, rename, config value), or when I write
  "skip intake".
- Ideas that come up during other work are never started. Create
  `docs/backlog/NNN-name.md` with status IDEA and 1–2 lines, continue the
  current step and mention the idea in the step report.
- Never implement a backlog item that does not have status PLANNED.
- Project instructions (CLAUDE.md, AGENTS.md) take precedence over these
  rules for paths, language, conventions and tooling. If the project defines
  its own idea or planning process, follow the project, mention the overlap
  and do not run both.
