import { Caption, Chip, CodeView, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "lifting-state";

export const defaults = { category: "beauty" };

const PRODUCTS = [
  { id: 1, title: "Essence Mascara Lash Princess", category: "beauty" },
  { id: 3, title: "Powder Canister", category: "beauty" },
  { id: 6, title: "Calvin Klein CK One", category: "fragrances" },
  { id: 8, title: "Dior J'adore", category: "fragrances" },
  { id: 16, title: "Apple", category: "groceries" },
  { id: 20, title: "Cooking Oil", category: "groceries" },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "beauty", label: "Beauty" },
  { id: "fragrances", label: "Fragrances" },
  { id: "groceries", label: "Groceries" },
];

const BEFORE = ["<main>", "  <CategoryFilter />", "  <ProductList items={products} />", "</main>"];

const AFTER = [
  "<main>",
  "  <CategoryFilter category={category} onSelect={handleSelect} />",
  "  <ProductList items={products} category={category} />",
  "</main>",
];

function readCategory(props) {
  return CATEGORIES.some((option) => option.id === props.category && option.id !== "all")
    ? props.category
    : defaults.category;
}

function stages(pick) {
  const label = CATEGORIES.find((option) => option.id === pick).label;
  const count = PRODUCTS.filter((product) => product.category === pick).length;
  return [
    {
      owner: "filter",
      value: "all",
      list: "all",
      code: BEFORE,
      caption:
        "CategoryFilter owns the category in its own useState. ProductList shows every product. Each component keeps its own variables to itself.",
    },
    {
      owner: "filter",
      value: pick,
      list: "all",
      hot: "filter",
      code: BEFORE,
      caption: `You click ${label}. CategoryFilter sets its state to "${pick}" and its button is pressed, but ProductList still shows all six products.`,
    },
    {
      owner: "filter",
      value: pick,
      list: "all",
      blocked: true,
      code: BEFORE,
      marks: { 2: "error" },
      caption:
        "ProductList cannot read a sibling's state. Props only flow down from a parent, and App passes ProductList nothing about the category. The two parts of the page disagree.",
    },
    {
      owner: "app",
      value: "all",
      list: "all",
      moving: true,
      code: BEFORE,
      caption:
        "The fix: move the state up to the closest component that contains both, which is App. The useState line leaves CategoryFilter and goes into App.",
    },
    {
      owner: "app",
      value: "all",
      list: "all",
      passed: true,
      code: AFTER,
      marks: { 1: "good", 2: "good" },
      caption:
        "App passes category down to both children as a prop, and passes handleSelect down to CategoryFilter as onSelect, so the filter can ask for a change.",
    },
    {
      owner: "app",
      value: pick,
      list: pick,
      passed: true,
      hot: "app",
      code: AFTER,
      caption: `You click ${label} again. CategoryFilter calls onSelect("${pick}"), App's state changes, and both children get "${pick}": the button is pressed and the list shows ${count} products.`,
    },
    {
      owner: "app",
      value: pick,
      list: pick,
      passed: true,
      code: AFTER,
      caption:
        "When two components need the same value, it lives in their closest common parent, which passes it down to both. That is lifting state up.",
    },
  ];
}

export function stepCount() {
  return 7;
}

function Buttons({ value }) {
  return (
    <ul className="lifting-state__buttons" aria-label="Category buttons">
      {CATEGORIES.map((option) => (
        <li
          key={option.id}
          className={
            option.id === value ? "lifting-state__button is-pressed" : "lifting-state__button"
          }
        >
          {option.id === value && <span className="visually-hidden">Pressed: </span>}
          {option.label}
        </li>
      ))}
    </ul>
  );
}

export default function LiftingState({ props, step }) {
  const pick = readCategory(props);
  const stage = stageAt(stages(pick), step);
  const inFilter = stage.owner === "filter";
  const stateChip = (
    <Chip tone={stage.moving ? "warning" : "accent"}>
      state: category = &quot;{stage.value}&quot;
    </Chip>
  );
  const visible =
    stage.list === "all" ? PRODUCTS : PRODUCTS.filter((product) => product.category === stage.list);
  const filterValue = inFilter || stage.passed ? stage.value : "all";

  return (
    <div className="lifting-state">
      <div className={stage.hot === "app" ? "lifting-state__comp is-hot" : "lifting-state__comp"}>
        <p className="lifting-state__head">
          <span className="lifting-state__name">App</span>
          {!inFilter && stateChip}
          {stage.moving && <Chip tone="warning">↑ moved here</Chip>}
        </p>
        <div className="lifting-state__children">
          <div
            className={
              stage.hot === "filter" ? "lifting-state__comp is-hot" : "lifting-state__comp"
            }
          >
            <p className="lifting-state__head">
              <span className="lifting-state__name">CategoryFilter</span>
              {inFilter && stateChip}
              {stage.passed && (
                <Chip tone="success">↓ prop: category = &quot;{stage.value}&quot;</Chip>
              )}
            </p>
            <Buttons value={filterValue} />
          </div>
          {stage.blocked && (
            <p className="lifting-state__blocked">
              <Chip tone="danger">✗ no way across</Chip>
            </p>
          )}
          <div className="lifting-state__comp">
            <p className="lifting-state__head">
              <span className="lifting-state__name">ProductList</span>
              {stage.passed ? (
                <Chip tone="success">↓ prop: category = &quot;{stage.value}&quot;</Chip>
              ) : (
                <Chip tone="muted">no category</Chip>
              )}
            </p>
            <ul className="lifting-state__products" aria-label="Products shown">
              {visible.map((product) => (
                <li key={product.id}>{product.title}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <CodeView lines={stage.code} marks={stage.marks} label="What App returns" />
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
