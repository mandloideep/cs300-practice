import { Caption, Cells, Chip, CodeView, ConsoleView, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "array-index-walk";

export const defaults = {
  items: ["Alice", "Bob", "Charlie", "Diana"],
  name: "names",
  compare: "<=",
};

const IDENTIFIER = /^[a-z_$][\w$]{0,15}$/;

function settings(props) {
  const items =
    Array.isArray(props.items) &&
    props.items.length >= 1 &&
    props.items.length <= 6 &&
    props.items.every(
      (item) =>
        (typeof item === "string" && item.length <= 12 && !/["\\`$]/.test(item)) ||
        (typeof item === "number" && Number.isFinite(item)),
    )
      ? props.items
      : defaults.items;
  const name =
    typeof props.name === "string" && IDENTIFIER.test(props.name) && props.name !== "i"
      ? props.name
      : defaults.name;
  const compare = props.compare === "<" ? "<" : "<=";
  return { items, name, compare };
}

function literal(item) {
  return typeof item === "string" ? `"${item}"` : String(item);
}

function code({ items, name, compare }) {
  return [
    `const ${name} = [${items.map(literal).join(", ")}];`,
    `for (let i = 0; i ${compare} ${name}.length; i++) {`,
    "  console.log(`${i + 1}. ${" + name + "[i]}`);",
    "}",
  ];
}

function stages({ items, name, compare }) {
  const length = items.length;
  const last = length - 1;
  const passes = compare === "<=" ? length + 1 : length;
  const list = [
    {
      i: null,
      line: 0,
      logs: 0,
      caption: `${name} holds ${length} ${length === 1 ? "item" : "items"} at the indexes 0 to ${last}. The last index is length - 1, which is ${last}.`,
    },
  ];
  for (let i = 0; i < passes; i += 1) {
    const past = i >= length;
    const value = past ? "undefined" : String(items[i]);
    list.push({
      i,
      line: 2,
      logs: i + 1,
      past,
      caption: past
        ? `i is ${i}, and ${i} ${compare} ${length} is still true, so the loop runs once more. ${name}[${i}] is past the end: JavaScript gives undefined without an error, and the log prints ${i + 1}. undefined.`
        : `i is ${i}, and ${i} ${compare} ${length} is true, so the body runs. ${name}[${i}] is ${literal(items[i])}, and the log prints ${i + 1}. ${value}.`,
    });
  }
  list.push({
    i: passes,
    line: 1,
    logs: passes,
    stop: true,
    caption:
      compare === "<="
        ? `i is ${passes}, and ${passes} <= ${length} is false, so the loop stops. One pass too many: with < instead of <=, the loop would stop at ${length} and never read past the end.`
        : `i is ${passes}, and ${passes} < ${length} is false, so the loop stops after the last index, ${last}. With <, i never reaches ${length}, so nothing reads past the end.`,
  });
  return list;
}

export function stepCount(props) {
  return stages(settings(props)).length;
}

export default function ArrayIndexWalk({ props, step }) {
  const setup = settings(props);
  const stage = stageAt(stages(setup), step);
  const { items, name, compare } = setup;
  const length = items.length;
  const cells = items.map(literal);
  const showGhost = stage.past || (stage.stop && compare === "<=");
  const marks = {};
  if (stage.past) marks[length] = "danger";
  if (showGhost) cells.push("undefined");
  const lines = Array.from({ length: stage.logs }, (_, index) =>
    index < length ? `${index + 1}. ${items[index]}` : `${index + 1}. undefined`,
  );
  const testing = stage.i !== null;
  const holds = testing && (compare === "<=" ? stage.i <= length : stage.i < length);

  return (
    <div className="array-index-walk">
      <CodeView lines={code(setup)} active={stage.line} label="main.js" />
      <div className="array-index-walk__state">
        <Chip tone={testing ? "accent" : "muted"}>
          <span className="demo-mono">i = {testing ? stage.i : "not yet"}</span>
        </Chip>
        <Chip>
          <span className="demo-mono">
            {name}.length = {length}
          </span>
        </Chip>
        {testing && (
          <Chip tone={holds ? "success" : "danger"}>
            <span className="demo-mono">
              {stage.i} {compare} {length}: {String(holds)}
            </span>
          </Chip>
        )}
      </div>
      <div className={showGhost ? "array-index-walk__cells has-ghost" : "array-index-walk__cells"}>
        <Cells
          items={cells}
          active={stage.past || stage.stop || !testing ? -1 : stage.i}
          marks={marks}
          label={name}
        />
        {showGhost && (
          <p className="array-index-walk__note">
            Index {length} is past the end: no item lives there.
          </p>
        )}
      </div>
      <ConsoleView lines={lines} fresh={stage.stop || !testing ? 0 : 1} />
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
