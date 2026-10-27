import { Box, Caption, Chip, CodeView, ConsoleView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "string-immutability";

export const defaults = { value: "  Alice.Mandel@NEIU.edu  ", name: "email" };

const IDENTIFIER = /^[A-Za-z_$][\w$]{0,15}$/;
const RESERVED = new Set(["let", "const", "var", "if", "for", "new", "this", "console"]);

function settings(props) {
  const value =
    typeof props.value === "string" &&
    props.value.trim() !== "" &&
    props.value.length <= 40 &&
    !/["\\\n\r\t]/.test(props.value)
      ? props.value
      : defaults.value;
  const name =
    typeof props.name === "string" && IDENTIFIER.test(props.name) && !RESERVED.has(props.name)
      ? props.name
      : defaults.name;
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  return { value, name, trimmed, lower };
}

function keep(text) {
  return text.replaceAll(" ", "\u00a0");
}

function quote(text) {
  return `"${keep(text)}"`;
}

function code({ value, name }) {
  return [
    `let ${name} = ${quote(value)};`,
    `${name}.trim();`,
    `console.log(${name});`,
    `${name} = ${name}.trim().toLowerCase();`,
    `console.log(${name});`,
  ];
}

function stages({ value, name, trimmed, lower }) {
  const trimNote =
    trimmed === value
      ? " This one had no spaces at the ends, so the text matches, but it is still a separate result."
      : "";
  const lowerNote = lower === trimmed ? " This text had no capitals, so the letters match." : "";
  return [
    {
      line: 0,
      holds: "original",
      strings: [{ key: "original", text: value, status: "held" }],
      log: [],
      caption: `let ${name} makes a variable and stores the string ${quote(value)} in it, ${value.length} characters long.`,
    },
    {
      line: 1,
      holds: "original",
      strings: [
        { key: "original", text: value, status: "held" },
        { key: "trimmed", text: trimmed, status: "returned" },
      ],
      log: [],
      caption: `${name}.trim() returns a new string without the spaces at the ends. The original is not touched, and nothing stores the result.${trimNote}`,
    },
    {
      line: 2,
      holds: "original",
      strings: [
        { key: "original", text: value, status: "held" },
        { key: "trimmed", text: trimmed, status: "lost" },
      ],
      log: [value],
      caption: `The log prints ${name} exactly as it was. The trimmed string was never stored, so it is gone; calling a method did not change the string it was called on.`,
    },
    {
      line: 3,
      holds: "original",
      strings: [
        { key: "original", text: value, status: "held" },
        { key: "trimmed", text: trimmed, status: "returned" },
        { key: "lower", text: lower, status: "returned" },
      ],
      log: [value],
      caption: `The right side runs first. trim() returns a new string, and toLowerCase() runs on that result and returns another new string.${lowerNote}`,
    },
    {
      line: 3,
      holds: "lower",
      strings: [
        { key: "original", text: value, status: "lost" },
        { key: "trimmed", text: trimmed, status: "lost" },
        { key: "lower", text: lower, status: "held" },
      ],
      log: [value],
      caption: `Now the = assigns the final result back to ${name}. The variable changed which string it holds; no string changed. Nothing holds the original any more.`,
    },
    {
      line: 4,
      holds: "lower",
      strings: [{ key: "lower", text: lower, status: "held" }],
      log: [value, lower],
      caption: `The second log prints the clean string. With const, you would store the result under a new name instead, as in const clean = ${name}.trim().toLowerCase().`,
    },
  ];
}

export function stepCount(props) {
  return stages(settings(props)).length;
}

const STATUS = {
  held: { tone: "success", label: "stored" },
  returned: { tone: "accent", label: "returned, not stored" },
  lost: { tone: "muted", label: "nothing holds it" },
};

export default function StringImmutability({ props, step }) {
  const setup = settings(props);
  const stage = stageAt(stages(setup), step);
  const lines = code(setup);
  const held = stage.strings.find((item) => item.key === stage.holds);
  const marks = Object.fromEntries(
    lines.map((_, index) => [index, "done"]).filter(([index]) => index < stage.line),
  );
  return (
    <div className="string-immutability">
      <CodeView lines={lines} active={stage.line} marks={marks} label="main.js" />
      <div className="string-immutability__memory">
        <Panel title="Variable">
          <Box label={setup.name} tone="success">
            <span className="demo-mono string-immutability__text">
              {quote(held ? held.text : setup.value)}
            </span>
          </Box>
        </Panel>
        <Panel title="Strings">
          <ul className="string-immutability__strings" aria-label="Strings">
            {stage.strings.map((item) => (
              <li
                key={item.key}
                className={item.status === "lost" ? "string-immutability__lost" : undefined}
              >
                <span className="demo-mono string-immutability__text">{quote(item.text)}</span>
                <Chip tone={STATUS[item.status].tone}>{STATUS[item.status].label}</Chip>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <div className="string-immutability__console">
        <ConsoleView
          lines={stage.log.map(keep)}
          fresh={stage.line === 2 || stage.line === 4 ? 1 : 0}
        />
      </div>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
