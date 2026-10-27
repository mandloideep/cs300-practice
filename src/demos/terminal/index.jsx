import { Caption } from "../kit.jsx";
import "./styles.css";

export const id = "terminal";

export const defaults = {
  cwd: "cs300",
  commands: [
    {
      command: "node -v",
      output: ["v24.19.0"],
      note: "node -v prints the version of Node.js. A version that starts with v24 is the one our course uses.",
    },
    {
      command: "npm create vite@latest my-first-react -- --template react",
      output: [
        "◇  Scaffolding project in /Users/you/cs300/my-first-react...",
        "│",
        "└  Done. Now run:",
        "",
        "  cd my-first-react",
        "  npm install",
        "  npm run dev",
      ],
      note: "The Vite creator asks its two questions, makes the my-first-react folder from the React template, and prints the three commands to run next.",
    },
    {
      command: "cd my-first-react",
      output: [],
      note: "cd moves the terminal into the new folder, so the prompt now shows my-first-react. It prints nothing when it works.",
    },
    {
      command: "npm install",
      output: ["added 19 packages, and audited 20 packages in 1s", "", "found 0 vulnerabilities"],
      note: "npm install downloads React, Vite, and the packages they depend on into node_modules and records the exact versions in package-lock.json. Your counts may differ.",
    },
    {
      command: "npm run dev",
      output: [
        "> my-first-react@0.0.0 dev",
        "> vite",
        "",
        "  VITE v8.2.4  ready in 336 ms",
        "",
        "  ➜  Local:   http://localhost:5173/",
        "  ➜  Network: use --host to expose",
        "  ➜  press h + enter to show help",
      ],
      running: true,
      note: "npm run dev starts Vite's development server, which keeps running: no new prompt appears. Open the Local address in your browser, and press Ctrl+C here to stop it.",
    },
  ],
};

const MAX_COMMANDS = 9;
const FOLDER = /^[\w.@~-]+$/;

function clean(entry) {
  if (!entry || typeof entry !== "object") return null;
  const command = typeof entry.command === "string" ? entry.command.trim() : "";
  if (command === "") return null;
  const raw = Array.isArray(entry.output)
    ? entry.output
    : typeof entry.output === "string"
      ? entry.output.split("\n")
      : [];
  const output = raw.filter((line) => typeof line === "string");
  const note = typeof entry.note === "string" && entry.note.trim() !== "" ? entry.note.trim() : "";
  return { command, output, note, running: entry.running === true };
}

function settings(props) {
  const given = Array.isArray(props.commands)
    ? props.commands.map(clean).filter(Boolean).slice(0, MAX_COMMANDS)
    : [];
  const commands = given.length >= 2 ? given : defaults.commands.map(clean);
  const cwd = typeof props.cwd === "string" && FOLDER.test(props.cwd) ? props.cwd : defaults.cwd;
  return { commands, cwd };
}

function nextFolder(path, command) {
  const match = /^cd\s+(\S+)$/.exec(command);
  if (!match) return path;
  const parts = match[1].split("/").filter((part) => part !== "" && part !== ".");
  return parts.reduce(
    (current, part) =>
      part === ".." ? (current.length > 1 ? current.slice(0, -1) : current) : [...current, part],
    path,
  );
}

function session({ commands, cwd }) {
  let path = [cwd];
  return commands.map((entry) => {
    const folder = path[path.length - 1];
    path = nextFolder(path, entry.command);
    return { ...entry, folder, after: path[path.length - 1] };
  });
}

export function stepCount(props) {
  return settings(props).commands.length + 1;
}

function caption(ran, setup, step) {
  if (step === 0) {
    return `The terminal is open in the ${setup.cwd} folder and waits at the prompt for a command. Press Step to run the first one.`;
  }
  const last = ran[ran.length - 1];
  if (last.note) return last.note;
  const printed =
    last.output.length > 0
      ? "Its output appears under it."
      : "It printed nothing, which usually means it worked.";
  const still = last.running ? " It keeps running until you press Ctrl+C." : "";
  return `You ran ${last.command}. ${printed}${still}`;
}

function Prompt({ folder }) {
  return (
    <span className="terminal__prompt">
      {folder}
      <span aria-hidden="true"> $</span>
    </span>
  );
}

export default function Terminal({ props, step }) {
  const setup = settings(props);
  const all = session(setup);
  const count = Math.max(0, Math.min(all.length, step));
  const ran = all.slice(0, count);
  const last = ran[ran.length - 1];
  const waiting = !last || !last.running;
  const folder = last ? last.after : setup.cwd;
  const next = all[count];

  return (
    <div className="terminal">
      <div className="terminal__window">
        <div className="terminal__bar" aria-hidden="true">
          <span className="terminal__dots">
            <span />
            <span />
            <span />
          </span>
          <span className="terminal__name">Terminal: {folder}</span>
        </div>
        <ol className="terminal__session" aria-label="Terminal session">
          {ran.map((entry, index) => {
            const fresh = index === ran.length - 1;
            const stopped = entry.running && !fresh;
            return (
              <li key={index} className={fresh ? "terminal__entry is-new" : "terminal__entry"}>
                <p className="terminal__line">
                  <Prompt folder={entry.folder} />{" "}
                  <span className="terminal__command">{entry.command}</span>
                </p>
                {entry.output.length > 0 && (
                  <samp className="terminal__output">{entry.output.join("\n")}</samp>
                )}
                {stopped && <samp className="terminal__output terminal__stop">^C</samp>}
              </li>
            );
          })}
          <li className="terminal__entry">
            {waiting ? (
              <p className="terminal__line">
                <Prompt folder={folder} /> <span className="terminal__cursor" aria-hidden="true" />
                <span className="visually-hidden">waiting for a command</span>
              </p>
            ) : (
              <p className="terminal__line terminal__busy">Running. Press Ctrl+C to stop it.</p>
            )}
          </li>
        </ol>
      </div>
      <p className="terminal__next">
        {next ? (
          <>
            <span className="terminal__next-label">
              {waiting ? "Next command" : "After Ctrl+C, the next command"}
            </span>{" "}
            <code>{next.command}</code>
          </>
        ) : (
          <span className="terminal__next-label">End of the session</span>
        )}
      </p>
      <Caption>{caption(ran, setup, step)}</Caption>
    </div>
  );
}
