// The runtime upgrade: pins react, react-dom, and react-router to exact versions, rebuilds
// public/runtime/, and verifies it in a browser. upgrade-runtime.mjs is the command line;
// this module holds the steps so that scripts/test/ can exercise them with a recording runner.

import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { UsageError } from "./cli.mjs";

export const PACKAGES = ["react", "react-dom", "react-router"];
const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

export class UpgradeError extends Error {}
export { UsageError };

export const USAGE =
  "Usage: npm run upgrade:runtime -- <react-version> <react-router-version> [--dry-run]\n" +
  "Example: npm run upgrade:runtime -- 19.2.8 8.3.0";

// ["19.2.8", "8.3.0", "--dry-run"] -> { reactVersion, routerVersion, dryRun }
export function parseArguments(argv) {
  const flags = argv.filter((argument) => argument.startsWith("--"));
  const positional = argv.filter((argument) => !argument.startsWith("--"));
  for (const flag of flags) {
    if (flag !== "--dry-run") throw new UsageError(`unknown option ${flag}`);
  }
  if (positional.length !== 2) {
    throw new UsageError("expected a React version and a React Router version");
  }
  for (const version of positional) {
    if (!EXACT_VERSION.test(version)) {
      throw new UsageError(`${version} is not an exact version such as 19.2.8`);
    }
  }
  return { reactVersion: positional[0], routerVersion: positional[1], dryRun: flags.length > 0 };
}

// Tracked files with uncommitted changes, as git lists them.
export function dirtyFiles(root) {
  const output = execFileSync("git", ["status", "--porcelain", "--untracked-files=no"], {
    cwd: root,
    encoding: "utf8",
  });
  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3));
}

export function pinnedVersions(root) {
  const manifest = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  return Object.fromEntries(PACKAGES.map((name) => [name, manifest.dependencies?.[name] ?? null]));
}

export function builtVersions(root) {
  const manifest = JSON.parse(
    readFileSync(path.join(root, "public", "runtime", "manifest.json"), "utf8"),
  );
  return Object.fromEntries(PACKAGES.map((name) => [name, manifest.packages?.[name] ?? null]));
}

export function upgradePlan(reactVersion, routerVersion) {
  const versions = {
    react: reactVersion,
    "react-dom": reactVersion,
    "react-router": routerVersion,
  };
  const specs = PACKAGES.map((name) => `${name}@${versions[name]}`);
  return {
    versions,
    commands: [
      ["npm", ["install", "--save-exact", ...specs]],
      ["npm", ["run", "build:runtime"]],
      ["npm", ["run", "verify:runtime"]],
    ],
    commitMessage: `Upgrade the runtime to React ${reactVersion} and React Router ${routerVersion}`,
  };
}

export function formatCommand([command, args]) {
  return [command, ...args].join(" ");
}

// Runs one command in root with inherited output; throws when it fails.
export function runCommand([command, args], root) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.error)
    throw new UpgradeError(`${formatCommand([command, args])}: ${result.error.message}`);
  if (result.status !== 0) {
    throw new UpgradeError(`${formatCommand([command, args])} exited with status ${result.status}`);
  }
}

function differences(expected, actual, source) {
  return PACKAGES.filter((name) => expected[name] !== actual[name]).map(
    (name) => `${source} has ${name} ${actual[name] ?? "(missing)"}, expected ${expected[name]}`,
  );
}

// The whole upgrade. Returns the plan and the versions before it ran.
// `run` receives ([command, args], root) and is only replaced by tests.
export function runUpgrade({
  root,
  reactVersion,
  routerVersion,
  dryRun = false,
  run = runCommand,
  log = console.log,
}) {
  const dirty = dirtyFiles(root);
  if (dirty.length > 0) {
    throw new UpgradeError(
      "the working tree has uncommitted changes to tracked files:\n" +
        dirty.map((file) => `  ${file}`).join("\n") +
        "\nCommit or discard them first, so that the upgrade is the only change.",
    );
  }

  const before = pinnedVersions(root);
  const plan = upgradePlan(reactVersion, routerVersion);
  const unchanged = PACKAGES.filter((name) => before[name] === plan.versions[name]);
  if (unchanged.length === PACKAGES.length) {
    log(
      `upgrade:runtime: ${PACKAGES.map((name) => `${name}@${before[name]}`).join(", ")} are already pinned; rebuilding anyway`,
    );
  } else {
    for (const name of PACKAGES) {
      log(`upgrade:runtime: ${name} ${before[name] ?? "(unpinned)"} -> ${plan.versions[name]}`);
    }
  }

  for (const command of plan.commands) {
    if (dryRun) {
      log(`upgrade:runtime: would run ${formatCommand(command)}`);
    } else {
      log(`\nupgrade:runtime: ${formatCommand(command)}`);
      run(command, root);
    }
  }

  if (!dryRun) {
    const problems = [
      ...differences(plan.versions, pinnedVersions(root), "package.json"),
      ...differences(plan.versions, builtVersions(root), "public/runtime/manifest.json"),
    ];
    if (problems.length > 0) {
      throw new UpgradeError(
        "the upgrade did not end with the requested versions:\n" +
          problems.map((problem) => `  ${problem}`).join("\n"),
      );
    }
  }

  log(
    [
      "",
      dryRun
        ? "upgrade:runtime: dry run; nothing was changed."
        : "upgrade:runtime: package.json, package-lock.json, and public/runtime/ are updated and verified.",
      "",
      "Remaining check: run npm run dev and look at a React step with the inspector open,",
      "for example #/topic/state-usestate/1, then run npm run lint, npm run build, and npm test.",
      "",
      "Then commit the pins and the runtime together:",
      "",
      "  git add package.json package-lock.json public/runtime",
      `  git commit -m ${JSON.stringify(plan.commitMessage)}`,
    ].join("\n"),
  );

  return { before, ...plan };
}
