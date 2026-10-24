#!/usr/bin/env node
// SessionStart hook for the plugin install. Prints the always-on rules so
// Claude Code adds them to the session context, like ~/.claude/rules does
// for a manual install.

const fs = require("node:fs");
const path = require("node:path");

const RULES_FILE = path.join(__dirname, "..", "rules", "AGENTS.md");

try {
  process.stdout.write(fs.readFileSync(RULES_FILE, "utf8"));
} catch {
  // Missing rules must never stop a session from starting.
}
process.exit(0);
