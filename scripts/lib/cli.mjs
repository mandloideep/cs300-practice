// A small option parser for the scripts: positional arguments plus --name value or --name=value.

export class UsageError extends Error {}

// parseOptions(["a", "--area", "react", "--kind=vanilla"], ["area", "kind"])
//   -> { positional: ["a"], options: { area: "react", kind: "vanilla" } }
export function parseOptions(argv, names) {
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
    if (!names.includes(name)) throw new UsageError(`unknown option --${name}`);
    const value = equals === -1 ? argv[++i] : argument.slice(equals + 1);
    if (value === undefined || value.startsWith("--")) {
      throw new UsageError(`--${name} needs a value`);
    }
    options[name] = value;
  }
  return { positional, options };
}
