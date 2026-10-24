#!/usr/bin/env node
// PreToolUse hook for the /idea skill. While docs/backlog/.intake-lock exists,
// it blocks Edit, Write and NotebookEdit outside the allowed folders.
// Exit 2 blocks the tool call, exit 0 lets the normal permission flow decide.

const fs = require("node:fs");
const path = require("node:path");

const LOCK_FILE = path.join("docs", "backlog", ".intake-lock");
const DEFAULT_ALLOWED = [path.join("docs", "backlog"), path.join("docs", "plans")];

const readStdin = () => {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
};

const readAllowedFolders = (lockPath) => {
  const lines = fs
    .readFileSync(lockPath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  // The intake files themselves must always stay writable.
  return lines.length > 0 ? [path.join("docs", "backlog"), ...lines] : DEFAULT_ALLOWED;
};

const isInside = (target, folder) => {
  const relative = path.relative(folder, target);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
};

const decide = (input) => {
  const projectDir = input.cwd || process.cwd();
  const lockPath = path.join(projectDir, LOCK_FILE);
  if (!fs.existsSync(lockPath)) return 0;

  const toolInput = input.tool_input || {};
  const filePath = toolInput.file_path || toolInput.notebook_path;
  if (!filePath) return 0;

  const target = path.resolve(projectDir, filePath);
  const allowed = readAllowedFolders(lockPath).map((folder) => path.resolve(projectDir, folder));
  return allowed.some((folder) => isInside(target, folder)) ? 0 : 2;
};

const main = () => {
  let input;
  try {
    input = JSON.parse(readStdin());
  } catch {
    // Never block because of input the hook does not understand.
    process.exit(0);
  }

  if (decide(input) === 2) {
    process.stderr.write(
      "idea intake is running: only docs/backlog and docs/plans may change. " +
        "Delete docs/backlog/.intake-lock if no /idea command is running.\n",
    );
    process.exit(2);
  }
  process.exit(0);
};

main();
