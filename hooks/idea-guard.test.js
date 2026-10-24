const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const HOOK = path.join(__dirname, "idea-guard.js");
const LOCK_NAME = ".idea-intake.lock";

const makeProject = ({ locked, lockContent = "" }) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "idea-guard-"));
  fs.mkdirSync(path.join(dir, "docs", "backlog"), { recursive: true });
  fs.mkdirSync(path.join(dir, "src"), { recursive: true });
  if (locked) fs.writeFileSync(path.join(dir, LOCK_NAME), lockContent);
  return dir;
};

// Tests may run inside Claude Code, so CLAUDE_PROJECT_DIR is removed unless a test sets it.
const runHook = (stdin, env = {}) => {
  const { CLAUDE_PROJECT_DIR, ...baseEnv } = process.env;
  return spawnSync(process.execPath, [HOOK], { input: stdin, encoding: "utf8", env: { ...baseEnv, ...env } });
};

const writeCall = (cwd, filePath) =>
  JSON.stringify({ cwd, tool_name: "Write", tool_input: { file_path: filePath } });

const shellCall = (cwd, command, toolName = "Bash") =>
  JSON.stringify({ cwd, tool_name: toolName, tool_input: { command } });

const statusOf = (dir, command, toolName) => runHook(shellCall(dir, command, toolName)).status;

test("blocks a source file while the lock exists", () => {
  const dir = makeProject({ locked: true });
  const result = runHook(writeCall(dir, "src/x.ts"));
  assert.strictEqual(result.status, 2);
  assert.match(result.stderr, /idea intake is running/);
  assert.match(result.stderr, /Do not delete \.idea-intake\.lock/);
});

test("allows a backlog file while the lock exists", () => {
  const dir = makeProject({ locked: true });
  assert.strictEqual(runHook(writeCall(dir, "docs/backlog/001-x.md")).status, 0);
});

test("allows a plan file given as an absolute path while the lock exists", () => {
  const dir = makeProject({ locked: true });
  const absolute = path.join(dir, "docs", "plans", "001-x.md");
  assert.strictEqual(runHook(writeCall(dir, absolute)).status, 0);
});

test("allows writing the lock file itself", () => {
  const dir = makeProject({ locked: true });
  assert.strictEqual(runHook(writeCall(dir, LOCK_NAME)).status, 0);
});

test("allows any file without the lock", () => {
  const dir = makeProject({ locked: false });
  assert.strictEqual(runHook(writeCall(dir, "src/x.ts")).status, 0);
});

test("ignores the old lock path in docs/backlog", () => {
  const dir = makeProject({ locked: false });
  fs.writeFileSync(path.join(dir, "docs", "backlog", ".intake-lock"), "");
  assert.strictEqual(runHook(writeCall(dir, "src/x.ts")).status, 0);
});

test("blocks a path that escapes the allowed folder with ..", () => {
  const dir = makeProject({ locked: true });
  assert.strictEqual(runHook(writeCall(dir, "docs/backlog/../../src/x.ts")).status, 2);
});

test("blocks a NotebookEdit outside the allowed folders", () => {
  const dir = makeProject({ locked: true });
  const call = JSON.stringify({ cwd: dir, tool_name: "NotebookEdit", tool_input: { notebook_path: "a.ipynb" } });
  assert.strictEqual(runHook(call).status, 2);
});

test("uses only the folders listed in the lock file", () => {
  const dir = makeProject({ locked: true, lockContent: "planning/ideas\nplanning/plans\n" });
  assert.strictEqual(runHook(writeCall(dir, "planning/ideas/001-x.md")).status, 0);
  assert.strictEqual(runHook(writeCall(dir, "planning/plans/001-x.md")).status, 0);
  assert.strictEqual(runHook(writeCall(dir, "docs/plans/001-x.md")).status, 2);
  assert.strictEqual(runHook(writeCall(dir, "docs/backlog/001-x.md")).status, 2);
});

test("does not block on input it cannot parse", () => {
  assert.strictEqual(runHook("not json").status, 0);
});

test("finds the lock through CLAUDE_PROJECT_DIR when cwd is a subfolder", () => {
  const dir = makeProject({ locked: true });
  const subfolder = path.join(dir, "src");
  const env = { CLAUDE_PROJECT_DIR: dir };
  assert.strictEqual(runHook(writeCall(subfolder, path.join(subfolder, "a.ts")), env).status, 2);
  assert.strictEqual(runHook(writeCall(subfolder, "a.ts"), env).status, 2);
  assert.strictEqual(runHook(writeCall(subfolder, "../docs/backlog/001-x.md"), env).status, 0);
});

test("ignores a lock older than two hours", () => {
  const dir = makeProject({ locked: true });
  const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
  fs.utimesSync(path.join(dir, LOCK_NAME), threeHoursAgo, threeHoursAgo);
  assert.strictEqual(runHook(writeCall(dir, "src/x.ts")).status, 0);
});

test("blocks Bash redirects and in-place edits outside the allowed folders", () => {
  const dir = makeProject({ locked: true });
  assert.strictEqual(statusOf(dir, "echo hi > src/x.ts"), 2);
  assert.strictEqual(statusOf(dir, "echo hi >>src/x.ts"), 2);
  assert.strictEqual(statusOf(dir, "ls && printf x | tee src/x.ts"), 2);
  assert.strictEqual(statusOf(dir, "sed -i 's/a/b/' src/x.ts"), 2);
  assert.strictEqual(statusOf(dir, "perl -pi -e 's/a/b/' src/x.ts"), 2);
  assert.strictEqual(statusOf(dir, "rm -rf src"), 2);
  assert.strictEqual(statusOf(dir, "mv docs/backlog/a.md src/a.md"), 2);
  assert.strictEqual(statusOf(dir, "cp docs/backlog/a.md src/"), 2);
  assert.strictEqual(statusOf(dir, 'bash -c "echo hi > src/x.ts"'), 2);
});

test("allows Bash commands that read or write only allowed files", () => {
  const dir = makeProject({ locked: true });
  assert.strictEqual(statusOf(dir, "echo hi > docs/backlog/001-x.md"), 0);
  assert.strictEqual(statusOf(dir, "cat src/a.ts 2>/dev/null | grep foo"), 0);
  assert.strictEqual(statusOf(dir, "npm test 2>&1"), 0);
  assert.strictEqual(statusOf(dir, "sed -n 1,20p src/a.ts"), 0);
  assert.strictEqual(statusOf(dir, "cp src/a.ts docs/plans/a.ts"), 0);
  assert.strictEqual(statusOf(dir, `rm ${LOCK_NAME}`), 0);
  assert.strictEqual(statusOf(dir, "git status && git log --oneline -5"), 0);
});

test("reads heredoc bodies as text, not as commands", () => {
  const dir = makeProject({ locked: true });
  assert.strictEqual(statusOf(dir, "cat <<'EOF' > docs/backlog/001-x.md\nrm -rf src\nEOF"), 0);
  assert.strictEqual(statusOf(dir, "cat <<EOF > src/x.ts\nhello\nEOF"), 2);
});

test("blocks package installs and git commands that change files", () => {
  const dir = makeProject({ locked: true });
  const result = runHook(shellCall(dir, "npm install lodash"));
  assert.strictEqual(result.status, 2);
  assert.match(result.stderr, /npm install/);
  assert.strictEqual(statusOf(dir, "git checkout -- src/x.ts"), 2);
  assert.strictEqual(statusOf(dir, "pip install requests"), 2);
});

test("blocks PowerShell writes outside the allowed folders", () => {
  const dir = makeProject({ locked: true });
  assert.strictEqual(statusOf(dir, 'Set-Content -Path src/x.ts -Value "hi"', "PowerShell"), 2);
  assert.strictEqual(statusOf(dir, "New-Item -ItemType File -Force src/x.ts", "PowerShell"), 2);
  assert.strictEqual(statusOf(dir, "Remove-Item -Recurse -Force src", "PowerShell"), 2);
  assert.strictEqual(statusOf(dir, '"hi" | Out-File src\\x.ts', "PowerShell"), 2);
});

test("allows PowerShell commands that read or write only allowed files", () => {
  const dir = makeProject({ locked: true });
  assert.strictEqual(statusOf(dir, 'Set-Content -Path docs/backlog/x.md -Value "hi"', "PowerShell"), 0);
  assert.strictEqual(statusOf(dir, "Get-Content src/x.ts", "PowerShell"), 0);
  assert.strictEqual(statusOf(dir, "Copy-Item src/a.ts -Destination docs/plans/", "PowerShell"), 0);
  assert.strictEqual(statusOf(dir, "Write-Output hi 2>$null", "PowerShell"), 0);
});

test("allows shell writes without the lock", () => {
  const dir = makeProject({ locked: false });
  assert.strictEqual(statusOf(dir, "echo hi > src/x.ts"), 0);
});
