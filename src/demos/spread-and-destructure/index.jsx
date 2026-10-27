import { Caption, Chip, CodeView, Panel, Stack, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "spread-and-destructure";

export const defaults = {};

const LINES = [
  'const product = { id: 16, title: "Apple", price: 1.99 };',
  "const copy = { ...product };",
  "const sale = { ...product, price: 1.49 };",
  "const prices = [1.99, 4.99];",
  "const more = [...prices, 9.99];",
  "const { title, price } = product;",
  "const [first, second] = more;",
  "const { id, ...rest } = sale;",
];

const APPLE = { id: 16, title: "Apple", price: 1.99 };

const VARIABLES = [
  { line: 0, name: "product", ref: "object 1", value: APPLE },
  { line: 1, name: "copy", ref: "object 2", value: APPLE },
  { line: 2, name: "sale", ref: "object 3", value: { ...APPLE, price: 1.49 } },
  { line: 3, name: "prices", ref: "array 4", value: [1.99, 4.99] },
  { line: 4, name: "more", ref: "array 5", value: [1.99, 4.99, 9.99] },
  { line: 5, name: "title", value: "Apple" },
  { line: 5, name: "price", value: 1.99 },
  { line: 6, name: "first", value: 1.99 },
  { line: 6, name: "second", value: 4.99 },
  { line: 7, name: "id", value: 16 },
  { line: 7, name: "rest", ref: "object 6", value: { title: "Apple", price: 1.49 } },
];

const CAPTIONS = [
  "product holds a new object, object 1, with three properties.",
  "The spread copies every property of product into a new object, object 2. copy looks the same, but copy === product is false: they are two different objects.",
  "Properties are copied in order, so the price written after the spread replaces the copied one. sale has 1.49; product still has 1.99.",
  "An array is an object too: prices holds array 4.",
  "Spread works inside an array literal: the items of prices, then 9.99, in a new array 5. prices still has two items.",
  "Destructuring pulls properties out by name into new variables, title and price. product is only read, never changed.",
  "Array destructuring takes items by position, so first and second get the first two items of more. const [count, setCount] = useState(0) uses the same pattern.",
  "...rest collects the properties you did not name into a new object, object 6. Spread builds a new object or array; destructuring names the parts of one.",
];

function format(value) {
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(format).join(", ")}]`;
  if (value && typeof value === "object") {
    const parts = Object.entries(value).map(([key, item]) => `${key}: ${format(item)}`);
    return `{ ${parts.join(", ")} }`;
  }
  return String(value);
}

export function stepCount() {
  return LINES.length;
}

export default function SpreadAndDestructure({ step }) {
  const current = Math.max(0, Math.min(LINES.length - 1, step));
  const shown = VARIABLES.filter((variable) => variable.line <= current);
  const marks = Object.fromEntries(LINES.map((_, index) => [index, "done"]).slice(0, current));
  return (
    <div className="spread-and-destructure">
      <Stack>
        <CodeView lines={LINES} active={current} marks={marks} label="main.js" />
        <Panel title="Variables" sunken>
          <ul className="spread-and-destructure__vars" aria-label="Variables so far">
            {shown.map((variable) => {
              const fresh = variable.line === current;
              return (
                <li
                  key={variable.name}
                  className={
                    fresh
                      ? "spread-and-destructure__var spread-and-destructure__var--fresh"
                      : "spread-and-destructure__var"
                  }
                >
                  <span className="spread-and-destructure__name">{variable.name}</span>
                  <span className="spread-and-destructure__tags">
                    {fresh && <Chip tone="accent">new</Chip>}
                    {variable.ref && <Chip>{variable.ref}</Chip>}
                  </span>
                  <span className="spread-and-destructure__value demo-mono">
                    {format(variable.value)}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </Stack>
      <Caption>{stageAt(CAPTIONS, current)}</Caption>
    </div>
  );
}
