import { Caption, Chip, CodeView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "url-as-state";

export const defaults = { typed: "red", address: "dior" };

const PRODUCTS = [
  "Essence Mascara Lash Princess",
  "Eyeshadow Palette with Mirror",
  "Powder Canister",
  "Red Lipstick",
  "Red Nail Polish",
  "Calvin Klein CK One",
  "Chanel Coco Noir Eau De",
  "Dior J'adore",
];

const CODE = [
  "const [searchParams, setSearchParams] = useSearchParams();",
  'const query = searchParams.get("q") ?? "";',
  "function handleSearch(event) {",
  "  const value = event.target.value;",
  "  setSearchParams(value ? { q: value } : {}, { replace: true });",
  "}",
  '<input type="search" value={query} onChange={handleSearch} />',
];

function readWord(value, fallback) {
  const word = typeof value === "string" ? value.trim() : "";
  return /^[A-Za-z][A-Za-z' ]{0,13}$/.test(word) ? word : fallback;
}

function address(query) {
  return query ? `/products?${new URLSearchParams({ q: query }).toString()}` : "/products";
}

function stages(typed, other) {
  const first = typed[0];
  return [
    {
      url: address(""),
      box: "",
      query: "",
      active: 1,
      caption:
        'The address is /products, with no query string. searchParams.get("q") is null, so query is "" and the list shows all eight products.',
    },
    {
      url: address(first),
      box: "",
      pending: first,
      query: "",
      direction: "box",
      active: 4,
      caption: `You type ${first} in the box. handleSearch does not store it anywhere in the component: it writes it into the address, which becomes ${address(first)}.`,
    },
    {
      url: address(first),
      box: first,
      query: first,
      active: 1,
      caption: `The address changed, so the router renders ProductsPage again. query is read from the address, "${first}", and the box and the list both follow it.`,
    },
    {
      url: address(typed),
      box: typed,
      query: typed,
      direction: "box",
      active: 4,
      caption: `You finish typing ${typed}. Each keystroke made the same trip through the address, and { replace: true } kept them from piling up as history entries.`,
    },
    {
      url: address(other),
      box: typed,
      query: typed,
      direction: "url",
      edited: true,
      active: -1,
      caption: `Now the other side: you change the address to ${address(other)} and press Enter, or open a link someone shared. The component did nothing yet.`,
    },
    {
      url: address(other),
      box: other,
      query: other,
      active: 1,
      caption: `The router renders ProductsPage with the new address. query is "${other}", so the box shows ${other} and the list is filtered to match, with no handler involved.`,
    },
    {
      url: address(""),
      box: "",
      query: "",
      direction: "box",
      active: 4,
      caption:
        "Clear the box and handleSearch writes {}, which removes the query string. The address is the one place the search lives, so it can be bookmarked, shared, and reached with Back.",
    },
  ];
}

export function stepCount() {
  return 7;
}

export default function UrlAsState({ props, step }) {
  const typed = readWord(props.typed, defaults.typed);
  const other = readWord(props.address, defaults.address);
  const stage = stageAt(stages(typed, other), step);
  const visible = PRODUCTS.filter((title) =>
    title.toLowerCase().includes(stage.query.toLowerCase()),
  );

  return (
    <div className="url-as-state">
      <p className={stage.edited ? "url-as-state__address is-edited" : "url-as-state__address"}>
        <span className="url-as-state__label">Address</span>
        <span className="demo-mono">{stage.url}</span>
      </p>
      <p className="url-as-state__direction">
        {stage.direction === "box" && <Chip tone="accent">box → address</Chip>}
        {stage.direction === "url" && <Chip tone="warning">address → box</Chip>}
        {!stage.direction && <Chip>address → query → box and list</Chip>}
      </p>
      <Panel title="ProductsPage" className="url-as-state__page">
        <p className="url-as-state__field">
          <span className="url-as-state__label">Search</span>
          <span
            className={
              stage.pending
                ? "url-as-state__box demo-mono is-pending"
                : "url-as-state__box demo-mono"
            }
          >
            <span className="visually-hidden">The box shows: </span>
            {stage.pending ?? stage.box}
          </span>
        </p>
        <p className="meta">
          query = &quot;{stage.query}&quot;, {visible.length} of {PRODUCTS.length} shown
        </p>
        {visible.length === 0 ? (
          <p className="demo-empty">No products match.</p>
        ) : (
          <ul className="url-as-state__list" aria-label="Products shown">
            {visible.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
        )}
      </Panel>
      <CodeView lines={CODE} active={stage.active} label="ProductsPage in App.jsx" />
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
