const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const HOOK = path.join(__dirname, "idea-guard.js");

const makeProject = ({ locked, lockContent = "" }) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "idea-guard-"));
  fs.mkdirSync(path.join(dir, "docs", "backlog"), { recursive: true });
  if (locked) fs.writeFileSync(path.join(dir, "docs", "backlog", ".intake-lock"), lockContent);
  return dir;
};

const runHook = (stdin) => spawnSync(process.execPath, [HOOK], { input: stdin, encoding: "utf8" });

const writeCall = (cwd, filePath) =>
  JSON.stringify({ cwd, tool_name: "Write", tool_input: { file_path: filePath } });

test("blocks a source file while the lock exists", () => {
  const dir = makeProject({ locked: true });
  const result = runHook(writeCall(dir, "src/x.ts"));
  assert.strictEqual(result.status, 2);
  assert.match(result.stderr, /idea intake is running/);
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

test("allows any file without the lock", () => {
  const dir = makeProject({ locked: false });
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

test("uses the folders listed in the lock file", () => {
  const dir = makeProject({ locked: true, lockContent: "planning/ideas\n" });
  assert.strictEqual(runHook(writeCall(dir, "planning/ideas/001-x.md")).status, 0);
  assert.strictEqual(runHook(writeCall(dir, "docs/plans/001-x.md")).status, 2);
  assert.strictEqual(runHook(writeCall(dir, "docs/backlog/001-x.md")).status, 0);
});

test("does not block on input it cannot parse", () => {
  assert.strictEqual(runHook("not json").status, 0);
});
