import { Caption, Chip, CodeView, Panel, Row, Stack, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "render-cycle";

export const defaults = { title: "Essence Mascara Lash Princess" };

function settings(props) {
  const title =
    typeof props.title === "string" && props.title.trim() !== ""
      ? props.title.trim()
      : defaults.title;
  return { title };
}

const CODE = [
  "function ProductCard({ product }) {",
  "  const [quantity, setQuantity] = useState(0);",
  "",
  "  function handleAdd() {",
  "    setQuantity(quantity + 1);",
  "  }",
  "",
  "  return (",
  "    <article>",
  "      <h3>{product.title}</h3>",
  "      <p>In cart: {quantity}</p>",
  "      <button onClick={handleAdd}>Add to cart</button>",
  "    </article>",
  "  );",
  "}",
];

const CYCLE = ["Set state", "Render", "Compare", "Commit"];

const STAGES = [
  {
    at: null,
    active: -1,
    marks: {},
    quantity: 0,
    stored: null,
    view: "page",
    shown: 0,
    caption: (s) =>
      `ProductCard has rendered once for ${s.title}: quantity is 0, and the page shows In cart: 0. Next you click Add to cart.`,
  },
  {
    at: "Set state",
    active: 4,
    marks: {},
    quantity: 0,
    stored: 1,
    view: "page",
    shown: 0,
    caption: () =>
      "You click Add to cart. handleAdd calls setQuantity(quantity + 1), which stores 1 and asks React to render ProductCard again. The page still shows 0: the setter does not touch it.",
  },
  {
    at: "Render",
    active: 1,
    marks: {},
    quantity: 1,
    stored: null,
    view: "page",
    shown: 0,
    caption: () =>
      "React calls ProductCard again, from the top. This time useState returns the stored 1, so quantity is 1 in this call, and every line of the function runs again.",
  },
  {
    at: "Compare",
    active: 10,
    marks: {},
    quantity: 1,
    stored: null,
    view: "compare",
    shown: 0,
    caption: () =>
      "The function returns new JSX, and React compares it with the JSX from the last render. The article, the title, and the button describe the same thing as before; only the number after In cart differs.",
  },
  {
    at: "Commit",
    active: -1,
    marks: {},
    quantity: 1,
    stored: null,
    view: "page",
    shown: 1,
    changed: true,
    caption: () =>
      "React commits the difference: it changes one text node on the page, from 0 to 1. The article, the heading, and the button are the same DOM nodes as before, untouched.",
  },
  {
    at: null,
    active: -1,
    marks: {},
    quantity: 1,
    stored: null,
    view: "page",
    shown: 1,
    caption: () =>
      "The browser paints In cart: 1. Every click repeats the cycle: set state, render, compare, commit. Other cards on the page do not run again, because their state did not change.",
  },
];

export function stepCount() {
  return STAGES.length;
}

function Page({ setup, shown, changed }) {
  return (
    <Panel title="The page (DOM)" sunken>
      <ul className="render-cycle__dom" aria-label="DOM nodes of the card">
        <li>
          <span className="render-cycle__tag">article</span>
          <ul>
            <li>
              <span className="render-cycle__tag">h3</span> {setup.title}
            </li>
            <li>
              <span className="render-cycle__tag">p</span> In cart:{" "}
              <span className={changed ? "render-cycle__text is-changed" : "render-cycle__text"}>
                {shown}
              </span>
              {changed && <Chip tone="accent">changed</Chip>}
            </li>
            <li>
              <span className="render-cycle__tag">button</span> Add to cart
            </li>
          </ul>
        </li>
      </ul>
    </Panel>
  );
}

function Compare({ setup }) {
  const rows = [
    { tag: "h3", before: setup.title, after: setup.title },
    { tag: "p", before: "In cart: 0", after: "In cart: 1" },
    { tag: "button", before: "Add to cart", after: "Add to cart" },
  ];
  return (
    <Panel title="Compare the JSX">
      <ul className="render-cycle__compare" aria-label="Last render compared with this render">
        {rows.map((row) => {
          const same = row.before === row.after;
          return (
            <li key={row.tag} className={same ? undefined : "is-different"}>
              <span className="render-cycle__tag">{row.tag}</span>
              <span>
                {same ? (
                  row.after
                ) : (
                  <>
                    {row.before} <span aria-hidden="true">→</span>
                    <span className="visually-hidden">becomes</span> {row.after}
                  </>
                )}
              </span>
              <Chip tone={same ? "muted" : "accent"}>{same ? "same" : "differs"}</Chip>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

export default function RenderCycle({ props, step }) {
  const setup = settings(props);
  const stage = stageAt(STAGES, step);
  return (
    <div className="render-cycle">
      <ol className="render-cycle__cycle" aria-label="The cycle">
        {CYCLE.map((name) => (
          <li key={name}>
            <Chip tone={stage.at === name ? "accent" : undefined}>
              {stage.at === name && <span className="visually-hidden">Now: </span>}
              {name}
            </Chip>
          </li>
        ))}
      </ol>
      <Row>
        <Panel title="ProductCard" className="render-cycle__code">
          <CodeView lines={CODE} active={stage.active} marks={stage.marks} label="ProductCard" />
        </Panel>
        <Stack>
          <Panel title="State">
            <p className="render-cycle__state">
              <span className="demo-mono">quantity</span> in this render{" "}
              <Chip tone="accent">{stage.quantity}</Chip>
              {stage.stored !== null && (
                <>
                  <span>stored for the next render</span>
                  <Chip tone="warning">{stage.stored}</Chip>
                </>
              )}
            </p>
          </Panel>
          {stage.view === "compare" ? (
            <Compare setup={setup} />
          ) : (
            <Page setup={setup} shown={stage.shown} changed={stage.changed} />
          )}
        </Stack>
      </Row>
      <Caption>{stage.caption(setup)}</Caption>
    </div>
  );
}
