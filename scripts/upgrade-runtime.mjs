// Upgrades the vendored React runtime in one command: pins react, react-dom, and react-router
// to the given exact versions, rebuilds public/runtime/, verifies it in headless Chromium, and
// prints the commit message to use and the one check that still needs a person.
//
// Refuses to run when a tracked file has uncommitted changes, so that the upgrade is the only
// change in the working tree and can be reverted with git checkout.
//
// Usage: npm run upgrade:runtime -- <react-version> <react-router-version> [--dry-run]

import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArguments, runUpgrade, UpgradeError, USAGE, UsageError } from "./lib/upgrade.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

try {
  const { reactVersion, routerVersion, dryRun } = parseArguments(process.argv.slice(2));
  runUpgrade({ root, reactVersion, routerVersion, dryRun });
} catch (error) {
  if (error instanceof UsageError) {
    console.error(`upgrade:runtime: ${error.message}\n${USAGE}`);
    process.exit(2);
  }
  if (error instanceof UpgradeError) {
    console.error(`upgrade:runtime: ${error.message}`);
    process.exit(1);
  }
  throw error;
}
