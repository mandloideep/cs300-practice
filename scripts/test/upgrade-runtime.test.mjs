// Exercises the runtime upgrade against a temporary git repository with a recording runner, so
// nothing is installed and the real pins are never touched.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, beforeEach, describe, it } from "node:test";
import {
  parseArguments,
  PACKAGES,
  runUpgrade,
  UpgradeError,
  upgradePlan,
  UsageError,
} from "../lib/upgrade.mjs";

const PINNED = { react: "19.2.8", "react-dom": "19.2.8", "react-router": "8.3.0" };

let root;

function git(...args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" });
}

function writePackage(versions) {
  writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({ name: "fixture", dependencies: versions }, null, 2) + "\n",
  );
}

function writeManifest(versions) {
  mkdirSync(path.join(root, "public", "runtime"), { recursive: true });
  writeFileSync(
    path.join(root, "public", "runtime", "manifest.json"),
    JSON.stringify({ packages: versions }, null, 2) + "\n",
  );
}

// A runner that records commands and imitates what npm install and build:runtime write.
function recorder(options = {}) {
  const commands = [];
  const run = ([command, args]) => {
    commands.push([command, ...args].join(" "));
    if (args[0] === "install" && !options.skipInstall) {
      const versions = { ...PINNED };
      for (const spec of args.slice(2)) {
        const [name, version] = spec.split("@");
        versions[name] = version;
      }
      writePackage(versions);
    }
    if (args[1] === "build:runtime")
      writeManifest(JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).dependencies);
  };
  return { commands, run };
}

describe("parseArguments", () => {
  it("reads two exact versions and the dry-run flag", () => {
    assert.deepEqual(parseArguments(["19.2.9", "8.3.1"]), {
      reactVersion: "19.2.9",
      routerVersion: "8.3.1",
      dryRun: false,
    });
    assert.equal(parseArguments(["19.2.9", "8.3.1", "--dry-run"]).dryRun, true);
  });

  it("refuses ranges, missing versions, and unknown options", () => {
    assert.throws(() => parseArguments(["^19.2.9", "8.3.1"]), UsageError);
    assert.throws(() => parseArguments(["19.2.9"]), UsageError);
    assert.throws(() => parseArguments(["19.2.9", "8.3.1", "--force"]), UsageError);
  });
});

describe("upgradePlan", () => {
  it("installs the three packages with save-exact, then builds and verifies", () => {
    const plan = upgradePlan("19.2.9", "8.3.1");
    assert.deepEqual(plan.commands, [
      [
        "npm",
        ["install", "--save-exact", "react@19.2.9", "react-dom@19.2.9", "react-router@8.3.1"],
      ],
      ["npm", ["run", "build:runtime"]],
      ["npm", ["run", "verify:runtime"]],
    ]);
    assert.equal(plan.commitMessage, "Upgrade the runtime to React 19.2.9 and React Router 8.3.1");
  });
});

describe("runUpgrade", () => {
  before(() => {
    root = mkdtempSync(path.join(tmpdir(), "cs300-upgrade-"));
    git("init", "--quiet");
    git("config", "user.email", "test@example.com");
    git("config", "user.name", "Test");
  });

  after(() => rmSync(root, { recursive: true, force: true }));

  beforeEach(() => {
    writePackage(PINNED);
    writeManifest(PINNED);
    git("add", "--all");
    git("commit", "--quiet", "--allow-empty", "-m", "fixture");
  });

  it("refuses to run with uncommitted changes to a tracked file", () => {
    writePackage({ ...PINNED, react: "0.0.0" });
    const { commands, run } = recorder();
    assert.throws(
      () => runUpgrade({ root, reactVersion: "19.2.9", routerVersion: "8.3.1", run, log() {} }),
      (error) => error instanceof UpgradeError && error.message.includes("package.json"),
    );
    assert.deepEqual(commands, []);
    git("checkout", "--", "package.json");
  });

  it("runs install, build:runtime, and verify:runtime in order and prints the commit message", () => {
    const { commands, run } = recorder();
    const lines = [];
    const result = runUpgrade({
      root,
      reactVersion: "19.2.9",
      routerVersion: "8.3.1",
      run,
      log: (line) => lines.push(line),
    });
    assert.deepEqual(commands, [
      "npm install --save-exact react@19.2.9 react-dom@19.2.9 react-router@8.3.1",
      "npm run build:runtime",
      "npm run verify:runtime",
    ]);
    assert.deepEqual(result.before, PINNED);
    const output = lines.join("\n");
    assert.match(output, /react 19\.2\.8 -> 19\.2\.9/);
    assert.match(output, /"Upgrade the runtime to React 19\.2\.9 and React Router 8\.3\.1"/);
    assert.match(output, /inspector open/);
    git("checkout", "--", ".");
  });

  it("fails when the install did not leave the requested pins", () => {
    const { run } = recorder({ skipInstall: true });
    assert.throws(
      () => runUpgrade({ root, reactVersion: "19.2.9", routerVersion: "8.3.1", run, log() {} }),
      (error) =>
        error instanceof UpgradeError && /package\.json has react 19\.2\.8/.test(error.message),
    );
    git("checkout", "--", ".");
  });

  it("changes nothing in a dry run", () => {
    const { commands, run } = recorder();
    const lines = [];
    runUpgrade({
      root,
      reactVersion: "19.2.9",
      routerVersion: "8.3.1",
      dryRun: true,
      run,
      log: (line) => lines.push(line),
    });
    assert.deepEqual(commands, []);
    assert.equal(git("status", "--porcelain"), "");
    const output = lines.join("\n");
    for (const name of PACKAGES) assert.match(output, new RegExp(`would run .*${name}@`));
    assert.match(output, /dry run; nothing was changed/);
  });
});
