import { Box, Caption, Cells, Chip, CodeView, Panel, Row, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "mutation-vs-copy";

export const defaults = {
  items: ["Mascara", "Powder", "Apple"],
  add: "Kiwi",
};

function cleanText(value, max) {
  return typeof value === "string" && value.trim() !== "" && value.trim().length <= max
    ? value.trim()
    : null;
}

function settings(props) {
  const items =
    Array.isArray(props.items) &&
    props.items.length >= 1 &&
    props.items.length <= 6 &&
    props.items.every((item) => cleanText(item, 24) !== null)
      ? props.items.map((item) => item.trim())
      : defaults.items;
  const add = cleanText(props.add, 24) ?? defaults.add;
  return { items, add };
}

function products(count) {
  return count === 1 ? "1 product in stock" : `${count} products in stock`;
}

function stages({ items, add }) {
  const before = items;
  const after = [...items, add];
  const n = before.length;
  const m = after.length;
  const a = (list) => ({ name: "A", items: list, fresh: list.length > n });
  const b = { name: "B", items: after, fresh: true };
  return [
    {
      left: { active: -1, arrays: [a(before)], held: "A", passed: null, same: null, screen: n },
      right: { active: -1, arrays: [a(before)], held: "A", passed: null, same: null, screen: n },
      caption: `React holds the items array from the last render, array A, and the screen shows ${n}. Both sides add ${add}.`,
    },
    {
      left: { active: 0, arrays: [a(after)], held: "A", passed: null, same: null, screen: n },
      right: { active: 0, arrays: [a(before), b], held: "A", passed: null, same: null, screen: n },
      caption: `On the left, push puts ${add} into array A itself, the array React is holding. On the right, the spread copies the items of A into a new array B and adds ${add}; A keeps its ${n}.`,
    },
    {
      left: { active: 1, arrays: [a(after)], held: "A", passed: "A", same: null, screen: n },
      right: { active: 0, arrays: [a(before), b], held: "A", passed: "B", same: null, screen: n },
      caption:
        "Both sides call setItems. The left hands React array A, the same array it already holds. The right hands it array B.",
    },
    {
      left: { active: -1, arrays: [a(after)], held: "A", passed: "A", same: true, screen: n },
      right: { active: -1, arrays: [a(before), b], held: "A", passed: "B", same: false, screen: n },
      caption:
        "React compares the old state with the new one using Object.is. Same array on the left, so React skips the render. A different array on the right, so React renders App again.",
    },
    {
      left: { active: -1, arrays: [a(after)], held: "A", passed: "A", same: true, screen: n },
      right: { active: -1, arrays: [a(before), b], held: "B", passed: "B", same: false, screen: m },
      caption: `The left screen still says ${n} although array A holds ${m}: nothing re-rendered, and no error appears. The right screen says ${m}, and React now holds array B.`,
    },
    {
      left: { active: -1, arrays: [a(after)], held: "A", passed: "A", same: true, screen: n },
      right: { active: -1, arrays: [a(before), b], held: "B", passed: "B", same: false, screen: m },
      caption:
        "A setter needs a new array or object. push, splice, sort, and assigning to a property change the one React holds, so its equality check sees no change.",
    },
  ];
}

export function stepCount(props) {
  return stages(settings(props)).length;
}

function Side({ title, lines, state, verdict }) {
  return (
    <Panel title={title} className="mutation-vs-copy__side">
      <CodeView lines={lines} active={state.active} label={`${title} code`} />
      <ul className="mutation-vs-copy__arrays" aria-label={`${title}: arrays in memory`}>
        {state.arrays.map((array) => (
          <li key={array.name}>
            <Box
              tone={state.held === array.name ? "accent" : undefined}
              className="mutation-vs-copy__array"
            >
              <span className="mutation-vs-copy__array-head">
                <span className="mutation-vs-copy__array-name">Array {array.name}</span>
                {state.held === array.name && <Chip tone="accent">React holds</Chip>}
              </span>
              <Cells
                items={array.items}
                marks={array.fresh ? { [array.items.length - 1]: "success" } : {}}
                label={`Array ${array.name}`}
                showIndex={false}
              />
            </Box>
          </li>
        ))}
      </ul>
      <dl className="mutation-vs-copy__facts">
        <div>
          <dt>setItems gets</dt>
          <dd>
            {state.passed === null ? (
              <Chip tone="muted">not called yet</Chip>
            ) : (
              <Chip>array {state.passed}</Chip>
            )}
          </dd>
        </div>
        <div>
          <dt>Object.is(before, after)</dt>
          <dd>
            {state.same === null ? (
              <Chip tone="muted">not checked yet</Chip>
            ) : state.same ? (
              <Chip tone="danger">true: render skipped</Chip>
            ) : (
              <Chip tone="success">false: App renders</Chip>
            )}
          </dd>
        </div>
        <div>
          <dt>Screen</dt>
          <dd>
            <Chip tone={verdict?.tone}>{products(state.screen)}</Chip>
            {verdict && <span className="mutation-vs-copy__verdict">{verdict.word}</span>}
          </dd>
        </div>
      </dl>
    </Panel>
  );
}

export default function MutationVsCopy({ props, step }) {
  const setup = settings(props);
  const all = stages(setup);
  const stage = stageAt(all, step);
  const settled = step >= all.length - 2;
  return (
    <div className="mutation-vs-copy">
      <Row>
        <Side
          title="Push in place"
          lines={["items.push(product);", "setItems(items);"]}
          state={stage.left}
          verdict={settled ? { tone: "danger", word: "out of date" } : null}
        />
        <Side
          title="Spread a copy"
          lines={["setItems([...items, product]);"]}
          state={stage.right}
          verdict={settled ? { tone: "success", word: "up to date" } : null}
        />
      </Row>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
