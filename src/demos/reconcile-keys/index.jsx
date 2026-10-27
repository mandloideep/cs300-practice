import { useState } from "react";
import { Caption, Chip, Choice, Panel, Row } from "../kit.jsx";
import "./styles.css";

export const id = "reconcile-keys";

export const defaults = {
  items: [
    { id: 16, title: "Apple", price: 1.99 },
    { id: 20, title: "Cooking Oil", price: 4.99 },
    { id: 1, title: "Essence Mascara Lash Princess", price: 9.99 },
    { id: 3, title: "Powder Canister", price: 14.99 },
    { id: 6, title: "Calvin Klein CK One", price: 49.99 },
    { id: 8, title: "Dior J'adore", price: 89.99 },
  ],
  change: "reverse",
  added: { id: 2, title: "Eyeshadow Palette with Mirror", price: 19.99 },
  keys: "index",
};

const LETTERS = "ABCDEFGHIJ";
const KEYS = [
  { value: "index", label: "key={index}" },
  { value: "id", label: "key={product.id}" },
];

function cleanItem(item) {
  if (!item || typeof item !== "object") return null;
  const okId =
    (typeof item.id === "number" && Number.isFinite(item.id)) ||
    (typeof item.id === "string" && item.id !== "");
  if (!okId || typeof item.title !== "string" || item.title.trim() === "") return null;
  const price =
    typeof item.price === "number" && Number.isFinite(item.price) && item.price >= 0
      ? item.price
      : null;
  return { id: item.id, title: item.title.trim(), price };
}

function settings(props) {
  const given = Array.isArray(props.items) ? props.items.map(cleanItem).filter(Boolean) : [];
  const unique = new Set(given.map((item) => item.id)).size === given.length;
  const items =
    given.length >= 2 && given.length <= 6 && unique ? given : defaults.items.map(cleanItem);
  const change = props.change === "prepend" ? "prepend" : "reverse";
  const addedGiven = cleanItem(props.added);
  const added =
    addedGiven && !items.some((item) => item.id === addedGiven.id)
      ? addedGiven
      : !items.some((item) => item.id === defaults.added.id)
        ? cleanItem(defaults.added)
        : { id: "new", title: "New product", price: null };
  const keys = props.keys === "id" ? "id" : "index";
  return { items, change, added, keys };
}

export function stepCount() {
  return 6;
}

function changeLabel({ items, change, added }) {
  if (change === "prepend") return `Add ${added.title} at the top`;
  const ascending =
    items.every((item) => item.price !== null) &&
    items.every((item, index) => index === 0 || items[index - 1].price <= item.price);
  return ascending ? "Show highest price first" : "Reverse the order";
}

function reconcile(setup, keys) {
  const before = setup.items.map((item, index) => ({ ...item, node: LETTERS[index] }));
  const next =
    setup.change === "prepend" ? [setup.added, ...setup.items] : [...setup.items].reverse();
  const keyOf = (item, index) => (keys === "index" ? index : item.id);
  const nodes = new Map(before.map((item, index) => [keyOf(item, index), item.node]));
  let spare = before.length;
  const after = next.map((item, index) => {
    const key = keyOf(item, index);
    const node = nodes.get(key) ?? LETTERS[spare++];
    const old = before.find((row) => row.node === node);
    const status = !old
      ? "new"
      : old.title !== item.title
        ? "rewritten"
        : before.indexOf(old) !== index
          ? "moved"
          : "kept";
    return { ...item, key, node, was: old ? old.title : null, status };
  });
  return { before: before.map((item, index) => ({ ...item, key: keyOf(item, index) })), after };
}

const price = (value) => (value === null ? "" : `$${value.toFixed(2)}`);

const STATUS = {
  new: { tone: "accent", text: "new row" },
  rewritten: { tone: "warning", text: "text rewritten" },
  moved: { tone: "success", text: "moved" },
  kept: { tone: "muted", text: "kept" },
};

function Elements({ rows, matched }) {
  return (
    <Panel title="Elements this render returns">
      <ol className="reconcile-keys__elements" aria-label="Elements and their keys">
        {rows.map((row) => (
          <li key={`${row.key}-${row.title}`}>
            <Chip>key {String(row.key)}</Chip>
            <span className="reconcile-keys__title">{row.title}</span>
            {matched && (
              <span className="reconcile-keys__match">
                {row.was === null
                  ? "no match: React makes a new row"
                  : `matches row ${row.node}, which showed ${row.was}`}
              </span>
            )}
          </li>
        ))}
      </ol>
    </Panel>
  );
}

function Page({ rows, values, setValue, showStatus, highlight }) {
  return (
    <Panel title="The page, one DOM row per letter" sunken>
      <ul className="reconcile-keys__rows" aria-label="Rows on the page">
        {rows.map((row) => {
          const value = values[row.node] ?? "0";
          const typed = highlight && value !== "0" && value !== "";
          const correct = typed && row.title === row.typedBeside;
          const classes = ["reconcile-keys__row"];
          if (typed) classes.push(correct ? "is-right" : "is-wrong");
          return (
            <li key={row.node} className={classes.join(" ")}>
              <span className="reconcile-keys__node">
                <span className="visually-hidden">Row </span>
                {row.node}
              </span>
              <span className="reconcile-keys__item">
                <span className="reconcile-keys__title">{row.title}</span>
                <span className="reconcile-keys__price">{price(row.price)}</span>
                {showStatus && (
                  <Chip tone={STATUS[row.status].tone}>{STATUS[row.status].text}</Chip>
                )}
                {typed && (
                  <Chip tone={correct ? "success" : "danger"}>
                    {correct ? "✓ right item" : `✗ typed for ${row.typedBeside}`}
                  </Chip>
                )}
              </span>
              <input
                type="number"
                min="0"
                className="reconcile-keys__input"
                aria-label={`Quantity in row ${row.node}, ${row.title}`}
                value={value}
                onChange={(event) => setValue(row.node, event.target.value)}
              />
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

function captionFor(step, setup, keys, result, rows, values, label) {
  const keyText = keys === "index" ? "key={index}" : "key={product.id}";
  const first = result.after[0];
  if (step === 0) {
    return `The order sheet renders with ${keyText}, one row per product. ${setup.items[0].title}'s field holds ${values.A || "0"}, typed by you: it lives in that row's input element on the page, not in React. Type in any field to try your own.`;
  }
  if (step === 1) {
    const how =
      keys === "index"
        ? "The keys still count positions from 0, so they no longer belong to the same products."
        : "Each key is still its product's id.";
    return `You press ${label}. App renders again and returns the rows in the new order. ${how}`;
  }
  if (step === 2) {
    return first.was === null
      ? `React matches each new element to the old one with the same key. ${first.title} has a key no old element had, so it gets a new row; the others match their own rows.`
      : first.was === first.title
        ? `React matches each new element to the old one with the same key. Key ${first.key} is ${first.title} in both renders, so it matches its own row, wherever it now sits.`
        : `React matches each new element to the old one with the same key. Key ${first.key} is now ${first.title}, but it matches row ${first.node}, which showed ${first.was}.`;
  }
  if (step === 3) {
    const rewritten = result.after.some((row) => row.status === "rewritten");
    const created = result.after.some((row) => row.status === "new");
    if (rewritten) {
      return `React updates each matched row in place: it rewrites the title and the price${created ? " and adds a row at the end" : ""}. The input elements stay where they are, because nothing in the JSX told React to change them.`;
    }
    return `React keeps every row with its own product and puts the rows in the new order${created ? ", with one new row for the new item" : ""}. Nothing is rewritten, and each input moves with its row.`;
  }
  if (step === 4) {
    const typed = rows.filter((row) => {
      const value = values[row.node] ?? "0";
      return value !== "0" && value !== "";
    });
    if (typed.length === 0)
      return "No field holds a number. Type one in a field, then step back and run the change again.";
    const wrong = typed.some((row) => row.title !== row.typedBeside);
    const what = typed
      .map((row) =>
        row.title === row.typedBeside
          ? `The ${values[row.node]} you typed for ${row.typedBeside} is still beside it.`
          : `The ${values[row.node]} you typed for ${row.typedBeside} now sits beside ${row.title}.`,
      )
      .join(" ");
    return wrong
      ? `${what} The input stayed in its place while the products changed around it.`
      : `${what} Each input moved with its product.`;
  }
  return "A key tells React which item an element is. An index describes a position, so after a reorder or an insert it points at a different item; an id from the data stays with its item. Use the id.";
}

export default function ReconcileKeys({ props, step, goTo }) {
  const setup = settings(props);
  const [keys, setKeys] = useState(setup.keys);
  const [values, setValues] = useState({ A: "3" });
  const current = Math.max(0, Math.min(5, step));
  const result = reconcile(setup, keys);
  const label = changeLabel(setup);
  const typedBeside = Object.fromEntries(result.before.map((row) => [row.node, row.title]));
  const committed = current >= 3;
  const rows = (committed ? result.after : result.before).map((row) => ({
    ...row,
    typedBeside: typedBeside[row.node] ?? null,
  }));
  const setValue = (node, value) => setValues((old) => ({ ...old, [node]: value }));

  return (
    <div className="reconcile-keys">
      <Choice legend="Keys" options={KEYS} value={keys} onChange={setKeys} />
      <p className="reconcile-keys__change">
        <button
          type="button"
          className="reconcile-keys__press"
          aria-pressed={current >= 1}
          onClick={() => goTo(current >= 1 ? 0 : 1)}
        >
          {label}
        </button>
        <Chip tone={current >= 1 ? "accent" : "muted"}>{current >= 1 ? "pressed" : "not yet"}</Chip>
      </p>
      <Row>
        <Elements rows={current >= 1 ? result.after : result.before} matched={current === 2} />
        <Page
          rows={rows}
          values={values}
          setValue={setValue}
          showStatus={current === 3}
          highlight={current >= 4}
        />
      </Row>
      <Caption>{captionFor(current, setup, keys, result, rows, values, label)}</Caption>
    </div>
  );
}
