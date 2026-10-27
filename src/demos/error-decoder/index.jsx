import { Caption, Chip, CodeView, ConsoleView, Panel, Row, Stack } from "../kit.jsx";
import "./styles.css";

export const id = "error-decoder";

const ERRORS = {
  "not-defined": {
    type: "ReferenceError",
    message: "total is not defined",
    lines: ["const subtotal = 9.99 + 14.99;", "console.log(total);"],
    column: 13,
    means:
      "Line 2 uses the name total, but nothing called total was declared where that line can see it.",
    check:
      "The spelling and capitals (this code declared subtotal), that the const or let comes before the line, and that it is not declared inside another function or block.",
  },
  "undefined-property": {
    type: "TypeError",
    message: "Cannot read properties of undefined (reading 'title')",
    lines: [
      'const products = [{ title: "Apple", price: 1.99 }];',
      "console.log(products[1].title);",
    ],
    column: 25,
    means:
      "The value just before .title is undefined, and undefined has no properties. products has one item, at index 0, so products[1] is undefined.",
    check:
      "The part right before .title: an index past the end, a property name spelled differently from the data, or data that has not arrived yet. Log that part, or use ?. where missing is normal.",
  },
  "not-a-function": {
    type: "TypeError",
    message: "product.map is not a function",
    lines: [
      'const product = { title: "Apple", price: 1.99 };',
      "product.map((item) => item.title);",
    ],
    column: 9,
    means:
      "The parentheses call product.map, but product is one object, not an array, so product.map is undefined, and undefined cannot be called.",
    check:
      "What the value really is: log it. An object where you expected an array, a misspelled method name, or parentheses after something that is not a function.",
  },
  "null-property": {
    type: "TypeError",
    message: "Cannot read properties of null (reading 'addEventListener')",
    lines: [
      'const button = document.querySelector("#add");',
      'button.addEventListener("click", () => console.log("Added"));',
    ],
    column: 8,
    means:
      "querySelector found no element matching #add and returned null, and null has no properties.",
    check:
      "The selector against the HTML: the same id spelling, # for an id and . for a class, and a script that runs after the element exists.",
  },
  "assignment-to-constant": {
    type: "TypeError",
    message: "Assignment to constant variable.",
    lines: ["const count = 0;", "count = count + 1;"],
    column: 7,
    means: "count was declared with const, and a const variable cannot be given a new value.",
    check:
      "Use let for a variable that changes. In React, never assign to state: call its setter, as in setCount(count + 1).",
  },
  "not-iterable": {
    type: "TypeError",
    message: "items is not iterable",
    lines: ["let items;", 'const next = [...items, "Kiwi"];'],
    column: 18,
    means: "Spread needs an array, or something else it can loop over, and items is undefined.",
    check:
      "That items holds an array before this line: its starting value, the name of the state variable, or a prop that was never passed.",
  },
};

export const defaults = {
  errors: [
    "not-defined",
    "undefined-property",
    "not-a-function",
    "null-property",
    "assignment-to-constant",
  ],
};

function settings(props) {
  const errors = Array.isArray(props.errors)
    ? [
        ...new Set(
          props.errors.filter((key) => typeof key === "string" && Object.hasOwn(ERRORS, key)),
        ),
      ]
    : [];
  return { errors: errors.length >= 2 ? errors : defaults.errors };
}

export function stepCount(props) {
  return settings(props).errors.length + 1;
}

function line(key) {
  const error = ERRORS[key];
  return (
    <>
      <span className="error-decoder__trace">{`Uncaught ${error.type}: ${error.message}`}</span>
      <span className="error-decoder__trace error-decoder__trace--at">
        at main.js:2:{error.column}
      </span>
    </>
  );
}

function Anatomy({ errorKey }) {
  const error = ERRORS[errorKey];
  const parts = [
    { text: "Uncaught", says: "no catch took the error, so the script stopped here" },
    { text: error.type, says: "the kind of error" },
    { text: error.message, says: "what went wrong, in the words of the browser" },
    {
      text: `main.js:2:${error.column}`,
      says: "the file, line, and column; in the lab, click it to jump there",
    },
  ];
  return (
    <Panel title="How to read it">
      <ol className="error-decoder__parts" aria-label="The parts of an error message">
        {parts.map((part) => (
          <li key={part.text}>
            <Chip tone="danger">{part.text}</Chip>
            <span>{part.says}</span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

export default function ErrorDecoder({ props, step, goTo }) {
  const { errors } = settings(props);
  const current = Math.max(0, Math.min(errors.length, step));
  const key = current === 0 ? errors[0] : errors[current - 1];
  const error = ERRORS[key];
  return (
    <div className="error-decoder">
      <ul className="error-decoder__index" aria-label="Jump to a message">
        <li>
          <button
            type="button"
            className="error-decoder__jump"
            aria-pressed={current === 0}
            onClick={() => goTo(0)}
          >
            How to read one
          </button>
        </li>
        {errors.map((item, index) => (
          <li key={item}>
            <button
              type="button"
              className="error-decoder__jump"
              aria-pressed={current === index + 1}
              onClick={() => goTo(index + 1)}
            >
              {ERRORS[item].message}
            </button>
          </li>
        ))}
      </ul>
      <Stack>
        <ConsoleView lines={[{ error: true, text: line(key) }]} />
        {current === 0 ? (
          <Anatomy errorKey={key} />
        ) : (
          <>
            <CodeView lines={error.lines} marks={{ 1: "error" }} label="main.js" />
            <Row>
              <Panel title="What it means">
                <p className="error-decoder__text">{error.means}</p>
              </Panel>
              <Panel title="What to check">
                <p className="error-decoder__text">{error.check}</p>
              </Panel>
            </Row>
          </>
        )}
      </Stack>
      <Caption>
        {current === 0
          ? `Read an error in four parts: Uncaught means nothing caught it, ${error.type} is the kind, then comes the message, and last where it happened, line 2 of main.js. Pick a message above, or step through them.`
          : `${error.type}: ${error.message}, thrown by line 2. ${error.means}`}
      </Caption>
    </div>
  );
}
