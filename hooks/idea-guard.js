#!/usr/bin/env node
// PreToolUse hook for the /idea skill. While docs/backlog/.intake-lock exists,
// it blocks file writes outside the allowed folders: every Edit, Write and
// NotebookEdit, and Bash or PowerShell commands that look like file writes. The shell check covers common commands; it is not a sandbox.
// A lock older than MAX_LOCK_AGE_MS is treated as left over and ignored.
// Exit 2 blocks the tool call, exit 0 lets the normal permission flow decide.

const fs = require("node:fs");
const path = require("node:path");

const LOCK_FILE = "docs/backlog/.intake-lock";
const DEFAULT_ALLOWED = [path.join("docs", "backlog")];
const MAX_LOCK_AGE_MS = 2 * 60 * 60 * 1000;

const FILE_TOOLS = new Set(["Edit", "Write", "NotebookEdit"]);
const SHELL_TOOLS = new Set(["Bash", "PowerShell"]);
const DISCARD_TARGETS = new Set(["/dev/null", "$null", "nul"]);
const SHELLS = new Set(["bash", "sh", "zsh", "pwsh", "powershell"]);

// Commands that write, move or delete every path argument.
const ALL_PATHS = new Set([
  "rm", "rmdir", "unlink", "shred", "touch", "mkdir", "truncate", "tee", "mv",
  "del", "erase", "rd", "move", "ren",
]);
// Commands that write only their last path argument.
const LAST_PATH = new Set(["cp", "ln", "install", "copy"]);
// Editors that change files in place when given -i.
const IN_PLACE = new Set(["sed", "perl"]);

// PowerShell cmdlets and aliases whose named parameters take values.
const PS_CONTENT = new Set(["set-content", "sc", "add-content", "ac", "out-file"]);
const PS_COPY = new Set(["copy-item", "cpi"]);
const PS_OTHER = new Set([
  "new-item", "ni", "remove-item", "ri", "move-item", "mi", "rename-item", "rni", "clear-content",
]);
const PS_PATH_PARAMS = new Set(["path", "literalpath", "filepath", "destination"]);
const PS_SWITCHES = new Set([
  "force", "recurse", "whatif", "confirm", "passthru", "nonewline", "append", "noclobber", "verbose",
]);

// Subcommands that change project files without naming them.
const PROJECT_WRITERS = {
  npm: new Set(["install", "i", "add", "uninstall", "remove", "rm", "update", "up"]),
  pnpm: new Set(["install", "i", "add", "remove", "rm", "update", "up"]),
  yarn: new Set(["install", "add", "remove", "upgrade"]),
  bun: new Set(["install", "i", "add", "remove", "rm", "update"]),
  pip: new Set(["install", "uninstall"]),
  pip3: new Set(["install", "uninstall"]),
  git: new Set([
    "checkout", "switch", "restore", "reset", "clean", "apply", "stash", "mv", "rm",
    "merge", "rebase", "pull", "cherry-pick",
  ]),
};

const readStdin = () => {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
};

const readActiveLock = (lockPath) => {
  let stat;
  try {
    stat = fs.statSync(lockPath);
  } catch {
    return null;
  }
  if (Date.now() - stat.mtimeMs > MAX_LOCK_AGE_MS) return null;

  const folders = fs
    .readFileSync(lockPath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return { folders: folders.length > 0 ? folders : DEFAULT_ALLOWED };
};

const isInside = (target, folder) => {
  const relative = path.relative(folder, target);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
};

// Remove heredoc and here-string bodies, so their text is not read as commands.
const stripHeredocs = (command) =>
  command
    .replace(/(<<-?[ \t]*(['"]?)(\w+)\2)([^\n]*)\n[\s\S]*?\n[ \t]*\3[ \t]*(?=\r?\n|$)/g, "$1$4")
    .replace(/@(['"])\r?\n[\s\S]*?\r?\n\1@/g, '""');

const tokenize = (command, shell) => {
  const tokens = [];
  let word = "";
  let inWord = false;
  let quote = null;

  const pushWord = () => {
    if (inWord) tokens.push({ word });
    word = "";
    inWord = false;
  };

  for (let i = 0; i < command.length; i++) {
    const ch = command[i];
    const next = command[i + 1];

    if (quote) {
      if (ch === quote) quote = null;
      else word += ch;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      inWord = true;
    } else if (ch === "\\" && shell === "Bash" && next !== undefined && next !== "\n") {
      word += next;
      inWord = true;
      i++;
    } else if (ch === "\n" || ch === ";") {
      pushWord();
      tokens.push({ separator: true });
    } else if (/\s/.test(ch)) {
      pushWord();
    } else if ((ch === "&" || ch === "|") && next === ch) {
      pushWord();
      tokens.push({ separator: true });
      i++;
    } else if (ch === "&" && next === ">") {
      pushWord();
      word = "&";
      inWord = true;
    } else if (ch === "&" || ch === "|") {
      pushWord();
      tokens.push({ separator: true });
    } else if (ch === ">") {
      // A lone fd number or & before > belongs to the redirect, not a word.
      if (inWord && /^(\d|&)$/.test(word)) {
        word = "";
        inWord = false;
      } else {
        pushWord();
      }
      if (command[i + 1] === ">") i++;
      const duplicate = command[i + 1] === "&";
      if (duplicate) i++;
      tokens.push({ redirect: true, duplicate });
    } else {
      word += ch;
      inWord = true;
    }
  }
  pushWord();
  return tokens;
};

const splitSegments = (tokens) => {
  const segments = [[]];
  for (const token of tokens) {
    if (token.separator) segments.push([]);
    else segments[segments.length - 1].push(token);
  }
  return segments.filter((segment) => segment.length > 0);
};

const psTargets = (name, args) => {
  const named = [];
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    const match = /^-([a-z]+)(?::(.*))?$/i.exec(args[i]);
    if (!match) {
      positional.push(args[i]);
      continue;
    }
    const param = match[1].toLowerCase();
    if (PS_SWITCHES.has(param)) continue;
    const value = match[2] !== undefined ? match[2] : args[++i];
    if (value !== undefined && PS_PATH_PARAMS.has(param)) named.push({ param, value });
  }

  if (PS_COPY.has(name)) {
    const destinations = named.filter(({ param }) => param === "destination").map(({ value }) => value);
    return destinations.length > 0 ? destinations : positional.slice(1, 2);
  }
  const namedPaths = named.map(({ value }) => value);
  return PS_CONTENT.has(name) ? [...namedPaths, ...positional.slice(0, 1)] : [...namedPaths, ...positional];
};

const inPlaceTargets = (name, args) => {
  const inPlace = args.some((arg) => /^-[a-zA-Z]*i/.test(arg) || arg.startsWith("--in-place"));
  if (!inPlace) return [];

  const positional = [];
  let hasScriptOption = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const scriptOption =
      /^-(e|f)$|^--(expression|file)$/.test(arg) || (name === "perl" && /^-[a-zA-Z]*e$/.test(arg));
    if (scriptOption) {
      hasScriptOption = true;
      i++;
    } else if (!arg.startsWith("-")) {
      positional.push(arg);
    }
  }
  // Without -e or -f, the first positional argument is the script.
  return hasScriptOption ? positional : positional.slice(1);
};

const commandTargets = (name, args, depth) => {
  if (SHELLS.has(name)) {
    const index = args.findIndex((arg) => /^-(c|command)$/i.test(arg));
    if (index === -1 || args[index + 1] === undefined || depth >= 3) return [];
    const shell = name.startsWith("p") ? "PowerShell" : "Bash";
    return shellTargets(args[index + 1], shell, depth + 1);
  }

  const writers = PROJECT_WRITERS[name];
  if (writers && args.length > 0 && writers.has(args[0].toLowerCase())) {
    return [{ reason: `${name} ${args[0]}` }];
  }

  const toPaths = (list) => list.map((target) => ({ target }));
  if (IN_PLACE.has(name)) return toPaths(inPlaceTargets(name, args));
  if (PS_CONTENT.has(name) || PS_COPY.has(name) || PS_OTHER.has(name)) return toPaths(psTargets(name, args));

  const positional = args.filter((arg) => !arg.startsWith("-"));
  if (ALL_PATHS.has(name)) return toPaths(positional);
  if (LAST_PATH.has(name)) return toPaths(positional.slice(-1));
  return [];
};

const segmentTargets = (segment, depth) => {
  const targets = [];
  const words = [];
  for (let i = 0; i < segment.length; i++) {
    const token = segment[i];
    if (!token.redirect) {
      words.push(token.word);
      continue;
    }
    const next = segment[i + 1];
    if (next && next.word !== undefined) {
      i++;
      if (!token.duplicate) targets.push({ target: next.word });
    }
  }

  while (words.length > 0 && (/^[A-Za-z_]\w*=/.test(words[0]) || words[0] === "sudo")) words.shift();
  if (words.length === 0) return targets;

  const name = path.basename(words[0]).toLowerCase().replace(/\.exe$/, "");
  return [...targets, ...commandTargets(name, words.slice(1), depth)];
};

const shellTargets = (command, shell, depth = 0) =>
  splitSegments(tokenize(stripHeredocs(command), shell)).flatMap((segment) =>
    segmentTargets(segment, depth),
  );

const toolTargets = (toolName, toolInput) => {
  if (FILE_TOOLS.has(toolName)) {
    const filePath = toolInput.file_path || toolInput.notebook_path;
    return filePath ? [{ target: filePath }] : [];
  }
  if (SHELL_TOOLS.has(toolName) && typeof toolInput.command === "string") {
    return shellTargets(toolInput.command, toolName);
  }
  return [];
};

// Returns the descriptions of the blocked writes, or an empty list.
const findBlocked = (input, env) => {
  const projectDir = env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const lockPath = path.resolve(projectDir, LOCK_FILE);
  const lock = readActiveLock(lockPath);
  if (!lock) return [];

  const workDir = input.cwd || projectDir;
  const allowed = lock.folders.map((folder) => path.resolve(projectDir, folder));
  const isAllowed = (target) => {
    if (DISCARD_TARGETS.has(target.toLowerCase())) return true;
    const resolved = path.resolve(workDir, target);
    return isInside(resolved, lockPath) || allowed.some((folder) => isInside(resolved, folder));
  };

  return toolTargets(input.tool_name, input.tool_input || {})
    .filter(({ target }) => target === undefined || !isAllowed(target))
    .map(({ target, reason }) => reason || target);
};

const main = () => {
  let input;
  try {
    input = JSON.parse(readStdin());
  } catch {
    // Never block because of input the hook does not understand.
    process.exit(0);
  }

  const blocked = findBlocked(input, process.env);
  if (blocked.length > 0) {
    process.stderr.write(
      `idea intake is running: only the intake folders may change. Blocked: ${blocked.join(", ")}. ` +
        `Do not delete ${LOCK_FILE} to get past this. Stop and tell the user; ` +
        "the user deletes the lock if no /idea command is running.\n",
    );
    process.exit(2);
  }
  process.exit(0);
};

main();
