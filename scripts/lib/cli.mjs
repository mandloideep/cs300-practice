// A small option parser for the scripts: positional arguments, --name value or --name=value, and
// bare --flag switches.

export class UsageError extends Error {}

// parseOptions(["a", "--area", "react", "--kind=vanilla"], ["area", "kind"])
//   -> { positional: ["a"], options: { area: "react", kind: "vanilla" } }
// parseOptions(["--all"], [], ["all"]) -> { positional: [], options: { all: true } }
export function parseOptions(argv, names, flags = []) {
  const positional = [];
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const argument = argv[i];
    if (!argument.startsWith("--")) {
      positional.push(argument);
      continue;
    }
    const equals = argument.indexOf("=");
    const name = equals === -1 ? argument.slice(2) : argument.slice(2, equals);
    if (flags.includes(name)) {
      if (equals !== -1) throw new UsageError(`--${name} takes no value`);
      options[name] = true;
      continue;
    }
    if (!names.includes(name)) throw new UsageError(`unknown option --${name}`);
    const value = equals === -1 ? argv[++i] : argument.slice(equals + 1);
    if (value === undefined || value.startsWith("--")) {
      throw new UsageError(`--${name} needs a value`);
    }
    options[name] = value;
  }
  return { positional, options };
}
