import { Caption, Chip, CodeView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "truthy-falsy";

export const defaults = {};

const CODE = [
  "if (value) {",
  '  console.log("truthy");',
  "} else {",
  '  console.log("falsy");',
  "}",
];

const GROUPS = [
  {
    values: [],
    falsy: null,
    caption:
      "An if turns its value into true or false before it picks a branch. Only eight values turn into false; they are called falsy, and every other value is truthy.",
  },
  {
    values: ["false"],
    falsy: true,
    caption: "false is falsy, of course: the else branch runs and logs falsy. That is 1 of 8.",
  },
  {
    values: ["0", "-0", "0n"],
    falsy: true,
    caption: "Zero in every number form is falsy: 0, -0, and the BigInt 0n. That makes 4 of 8.",
  },
  {
    values: ['""'],
    falsy: true,
    caption: 'The empty string "", with no characters at all, is falsy. 5 of 8.',
  },
  {
    values: ["null", "undefined"],
    falsy: true,
    caption: "null and undefined, the two ways of saying no value, are falsy. 7 of 8.",
  },
  {
    values: ["NaN"],
    falsy: true,
    caption:
      "NaN, the not-a-number result of arithmetic that made no sense, is the eighth and last.",
  },
  {
    values: ['"0"', '"false"'],
    falsy: false,
    caption:
      'A string with anything in it is truthy, even "0" and "false". The if branch runs and logs truthy.',
  },
  {
    values: ["[]", "{}"],
    falsy: false,
    caption:
      "Every object is truthy, an empty array and an empty object too. Being empty does not make an object falsy.",
  },
  {
    values: [],
    falsy: null,
    caption:
      "Eight falsy values, and everything else is truthy. To ask whether an array is empty, test its length: items.length is falsy only when it is 0, so if (items.length) skips an empty array.",
  },
];

export function stepCount() {
  return GROUPS.length;
}

function Bin({ title, values, empty, fresh }) {
  return (
    <Panel title={title} className="truthy-falsy__bin">
      {values.length === 0 ? (
        <p className="demo-empty">{empty}</p>
      ) : (
        <ul className="truthy-falsy__values" aria-label={title}>
          {values.map((value) => (
            <li key={value}>
              <Chip tone={fresh.has(value) ? "accent" : undefined}>
                <span className="demo-mono">{value}</span>
              </Chip>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export default function TruthyFalsy({ step }) {
  const index = Math.max(0, Math.min(GROUPS.length - 1, step));
  const stage = stageAt(GROUPS, step);
  const seen = GROUPS.slice(0, index + 1);
  const falsy = seen.filter((group) => group.falsy === true).flatMap((group) => group.values);
  const truthy = seen.filter((group) => group.falsy === false).flatMap((group) => group.values);
  const fresh = new Set(stage.values);
  const active = stage.falsy === null ? -1 : stage.falsy ? 3 : 1;

  return (
    <div className="truthy-falsy">
      <div className="truthy-falsy__top">
        <CodeView lines={CODE} active={active} label="The if" />
        <Panel title="Dropped in now" sunken>
          {stage.values.length === 0 ? (
            <p className="demo-empty">{index === 0 ? "Nothing yet." : "Every value is sorted."}</p>
          ) : (
            <p className="truthy-falsy__now">
              {stage.values.map((value) => (
                <span key={value} className="demo-mono truthy-falsy__value">
                  {value}
                </span>
              ))}
              <span aria-hidden="true">→</span>
              <Chip tone={stage.falsy ? "danger" : "success"}>
                {stage.falsy ? "falsy, else runs" : "truthy, if runs"}
              </Chip>
            </p>
          )}
        </Panel>
      </div>
      <div className="truthy-falsy__bins">
        <Bin
          title={`Falsy: ${falsy.length} of 8`}
          values={falsy}
          empty="None found yet."
          fresh={fresh}
        />
        <Bin
          title="Truthy: everything else"
          values={truthy}
          empty="None tried yet."
          fresh={fresh}
        />
      </div>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
