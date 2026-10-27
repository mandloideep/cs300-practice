import { useState } from "react";
import { Caption, Chip } from "../kit.jsx";
import "./styles.css";

export const id = "props-flow";

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

const STAGE_COUNT = 6;

function readCategory(props) {
  return CATEGORIES.some((option) => option.id === props.category && option.id !== "all")
    ? props.category
    : defaults.category;
}

function visible(category) {
  return category === "all"
    ? PRODUCTS
    : PRODUCTS.filter((product) => product.category === category);
}

function caption(step, from, to) {
  const label = CATEGORIES.find((option) => option.id === to).label;
  const count = visible(to).length;
  return [
    `Data flows down: App owns category, now "${from}", and passes it to CategoryFilter and ProductList as a prop. ProductList passes each product down to a ProductCard. Click a category, or press Step to click ${label}.`,
    `You click ${label}. The button lives in CategoryFilter, which cannot change category itself. Its onClick calls onSelect("${to}"), the function App passed down.`,
    `The event has travelled up: onSelect is App's handleSelect, which calls setCategory("${to}"). App's state changes, and the children still show the old value until React renders.`,
    `React calls App again. App passes the new category, "${to}", down to both children, so the ${label} button is pressed now.`,
    `ProductList filters with the new prop and passes ${count} product${count === 1 ? "" : "s"} down, one to each ProductCard. Three levels, one value, all in agreement.`,
    "Data down as props, events up as calls to functions the parent passed down. The child never reached into App; it only called onSelect.",
  ][Math.max(0, Math.min(STAGE_COUNT - 1, step))];
}

export function stepCount() {
  return STAGE_COUNT;
}

export default function PropsFlow({ props, step, goTo }) {
  const [trace, setTrace] = useState(() => ({ from: "all", to: readCategory(props) }));
  const current = Math.max(0, Math.min(STAGE_COUNT - 1, step));
  const shown = current >= 3 ? trace.to : trace.from;
  const appState = current >= 2 ? trace.to : trace.from;
  const down = current === 0 || current === 3;
  const up = current === 1 || current === 2;
  const cardsFlow = current === 0 || current === 4;

  function click(next) {
    if (next === shown) return;
    setTrace({ from: shown, to: next });
    goTo(1);
  }

  return (
    <div className="props-flow">
      <div className={current === 2 ? "props-flow__comp is-hot" : "props-flow__comp"}>
        <p className="props-flow__head">
          <span className="props-flow__name">App</span>
          <span className="props-flow__level meta">level 1</span>
        </p>
        <p className="props-flow__line">
          <span className="meta">state</span>
          <Chip tone={current === 2 ? "warning" : "accent"}>category = &quot;{appState}&quot;</Chip>
          {current === 2 && <Chip tone="warning">just changed</Chip>}
        </p>
        <div className="props-flow__children">
          <div className={current === 1 ? "props-flow__comp is-hot" : "props-flow__comp"}>
            <p className="props-flow__head">
              <span className="props-flow__name">CategoryFilter</span>
              <span className="props-flow__level meta">level 2</span>
            </p>
            <p className="props-flow__line">
              <span aria-hidden="true" className="props-flow__arrow">
                ↓
              </span>
              <Chip tone={down ? "accent" : undefined}>category=&quot;{shown}&quot;</Chip>
              <Chip>onSelect</Chip>
            </p>
            <div className="props-flow__buttons" role="group" aria-label="Category">
              {CATEGORIES.map((option) => {
                const clicked = up && option.id === trace.to;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={shown === option.id}
                    className={clicked ? "props-flow__button is-clicked" : "props-flow__button"}
                    onClick={() => click(option.id)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {up && (
              <p className="props-flow__line">
                <span aria-hidden="true" className="props-flow__arrow">
                  ↑
                </span>
                <Chip tone="warning">onSelect(&quot;{trace.to}&quot;)</Chip>
                <span className="meta">to App</span>
              </p>
            )}
          </div>
          <div className="props-flow__comp">
            <p className="props-flow__head">
              <span className="props-flow__name">ProductList</span>
              <span className="props-flow__level meta">level 2</span>
            </p>
            <p className="props-flow__line">
              <span aria-hidden="true" className="props-flow__arrow">
                ↓
              </span>
              <Chip tone={down ? "accent" : undefined}>category=&quot;{shown}&quot;</Chip>
              <Chip>items</Chip>
            </p>
            <ul className="props-flow__cards" aria-label="ProductCard components">
              {visible(current >= 4 ? trace.to : trace.from).map((product) => (
                <li
                  key={product.id}
                  className={cardsFlow ? "props-flow__card is-flow" : "props-flow__card"}
                >
                  <span className="props-flow__card-head">
                    <span className="props-flow__card-name">ProductCard</span>
                    <span className="props-flow__level meta">level 3</span>
                  </span>
                  <span className="props-flow__card-prop">
                    <span aria-hidden="true">↓ </span>product: {product.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Caption>{caption(current, trace.from, trace.to)}</Caption>
    </div>
  );
}
