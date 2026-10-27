import { Box, Caption, Chip, CodeView, Panel, Row, Stack, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "equality";

export const defaults = {};

const OBJECT_LINES = [
  'const a = { title: "Apple" };',
  'const b = { title: "Apple" };',
  "const c = a;",
];

const STAGES = [
  {
    expression: "5 === 5",
    steps: [],
    result: true,
    caption:
      "=== asks whether two values have the same type and the same value. Both are the number 5, so it is true.",
  },
  {
    expression: '"5" === 5',
    steps: [],
    result: false,
    caption:
      "A string and a number. === never converts, and a string is not a number, so it is false.",
  },
  {
    expression: '"5" == 5',
    steps: ["5 == 5"],
    result: true,
    caption:
      'Two equal signs convert first. == turns the string "5" into the number 5, then compares 5 with 5, so it is true.',
  },
  {
    expression: '0 == ""',
    steps: ["0 == 0"],
    result: true,
    caption:
      'The empty string converts to the number 0, so 0 == "" is true, while 0 === "" is false. Surprises like this one are why this course writes ===.',
  },
  {
    expression: "null == undefined",
    steps: [],
    result: true,
    caption:
      "== treats null and undefined as equal to each other and to nothing else. null === undefined is false: they are different types.",
  },
  {
    expression: "a === b",
    objects: true,
    steps: [],
    result: false,
    caption:
      "a and b look the same, but each object literal makes a new object. For objects, === asks whether both sides are the same object, and these are two.",
  },
  {
    expression: "a === c",
    objects: true,
    steps: [],
    result: true,
    caption:
      "const c = a copies the reference, not the object, so a and c point at the same object 1 and === is true. A change through c shows up through a.",
  },
  {
    expression: "a.title === b.title",
    objects: true,
    steps: ['"Apple" === "Apple"'],
    result: true,
    caption:
      "To ask whether two objects hold the same data, compare the values inside them, such as an id or a title. == would not help: a == b is false too.",
  },
];

export function stepCount() {
  return STAGES.length;
}

function Result({ value }) {
  return <Chip tone={value ? "accent" : "muted"}>{value ? "✓ true" : "✗ false"}</Chip>;
}

function Memory({ expression }) {
  const reads = expression === "a === b" ? ["a", "b"] : expression === "a === c" ? ["a", "c"] : [];
  const variable = (name, target) => (
    <li className={reads.includes(name) ? "equality__ref is-read" : "equality__ref"}>
      <span className="equality__name">{name}</span>
      <span aria-hidden="true" className="equality__arrow">
        →
      </span>
      <span>{target}</span>
    </li>
  );
  return (
    <Panel title="Memory" sunken>
      <div className="equality__memory">
        <ul className="equality__refs" aria-label="Variables">
          {variable("a", "object 1")}
          {variable("b", "object 2")}
          {variable("c", "object 1")}
        </ul>
        <ul className="equality__objects" aria-label="Objects">
          <li>
            <Box label="object 1" className="equality__object">
              <span className="demo-mono">{'{ title: "Apple" }'}</span>
            </Box>
          </li>
          <li>
            <Box label="object 2" className="equality__object">
              <span className="demo-mono">{'{ title: "Apple" }'}</span>
            </Box>
          </li>
        </ul>
      </div>
    </Panel>
  );
}

export default function Equality({ step }) {
  const index = Math.max(0, Math.min(STAGES.length - 1, step));
  const stage = stageAt(STAGES, index);
  const history = STAGES.slice(0, index + 1);
  return (
    <div className="equality">
      <Stack>
        <Box tone="accent" className="equality__now">
          <span className="equality__label">Now comparing</span>
          <ol className="equality__chain" aria-label="How it is worked out">
            {[stage.expression, ...stage.steps].map((text) => (
              <li key={text} className="demo-mono">
                {text}
              </li>
            ))}
            <li>
              <Result value={stage.result} />
            </li>
          </ol>
        </Box>
        <Row>
          {stage.objects && (
            <Stack>
              <CodeView lines={OBJECT_LINES} label="The objects" />
              <Memory expression={stage.expression} />
            </Stack>
          )}
          <Panel title="Comparisons so far">
            <table className="demo-table equality__table">
              <thead>
                <tr>
                  <th scope="col">Expression</th>
                  <th scope="col">Result</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, at) => (
                  <tr key={row.expression} className={at === index ? "is-active" : undefined}>
                    <td className="demo-mono">{row.expression}</td>
                    <td>
                      <Result value={row.result} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </Row>
      </Stack>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
