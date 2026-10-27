import { Caption, Chip, CodeView, Panel, Row, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "preventdefault";

export const defaults = { title: "Portfolio" };

const ORIGIN = "localhost:5173/";

const STARTER = ["Profile card", "Landing page", "Reading list"];

function readTitle(props) {
  const title = typeof props.title === "string" ? props.title.trim() : "";
  return title !== "" && title.length <= 30 ? title : defaults.title;
}

const CODE = [
  'form.addEventListener("submit", (event) => {',
  "  event.preventDefault();",
  '  const title = new FormData(form).get("title").trim();',
  '  projects.push({ title, category: "New", done: false });',
  "  renderProjects();",
  "});",
];

const SIDES = [{ name: "With preventDefault" }, { name: "Without preventDefault" }];

function stages(title) {
  const query = `?${new URLSearchParams({ title }).toString()}`;
  return [
    {
      with: { field: title, items: STARTER, url: ORIGIN },
      without: { field: title, items: STARTER, url: ORIGIN },
      active: -1,
      caption: `Two copies of the same page. You have typed ${title} in the field of each. The only difference is one line in the submit listener.`,
    },
    {
      with: { field: title, items: STARTER, url: ORIGIN, submit: true },
      without: { field: title, items: STARTER, url: ORIGIN, submit: true },
      active: 0,
      caption:
        "You press Enter in each field. The browser fires a submit event on the form, and before doing anything else it runs the form's listeners.",
    },
    {
      with: {
        field: title,
        items: [...STARTER, title],
        url: ORIGIN,
        cancelled: true,
      },
      without: {
        field: title,
        items: [...STARTER, title],
        url: ORIGIN,
      },
      active: 1,
      caption: `Both listeners add ${title} and render it, so for a moment the pages agree. On the left, event.preventDefault() has told the browser to skip what a submit normally does.`,
    },
    {
      with: {
        field: title,
        items: [...STARTER, title],
        url: ORIGIN,
        note: "Default skipped",
      },
      without: {
        field: title,
        items: [...STARTER, title],
        url: `${ORIGIN}${query}`,
        loading: true,
      },
      active: -1,
      caption: `After the listener returns, the browser does the default on the right: it sends the field values to the form's address and loads the answer as a new page. With no action attribute, that is this page again, with ${query} added because the field is named title.`,
    },
    {
      with: { field: title, items: [...STARTER, title], url: ORIGIN },
      without: {
        field: "",
        items: STARTER,
        url: `${ORIGIN}${query}`,
        fresh: true,
      },
      active: -1,
      caption: `The new page runs app.js from the top, so projects is the starter list again, the field is empty, and ${title} is gone. The left page never reloaded and still shows four projects.`,
    },
    {
      with: { field: title, items: [...STARTER, title], url: ORIGIN },
      without: { field: "", items: STARTER, url: `${ORIGIN}${query}` },
      active: 1,
      caption:
        "A submit listener that changes the page needs event.preventDefault() as its first line, or the browser throws the change away with a reload.",
    },
  ];
}

export function stepCount() {
  return 6;
}

function MiniPage({ side, state }) {
  const status = state.loading
    ? null
    : `${state.items.length} of ${state.items.length} projects shown.`;
  return (
    <Panel title={side.name} className="preventdefault__side">
      <p className="preventdefault__address">
        <span className="visually-hidden">Address: </span>
        <span className="demo-mono">{state.url}</span>
        {state.loading && <Chip tone="warning">↻ loading</Chip>}
        {state.fresh && <Chip tone="danger">new page</Chip>}
        {state.note && <Chip tone="success">✓ no reload</Chip>}
        {state.cancelled && <Chip tone="success">✓ default cancelled</Chip>}
      </p>
      <div
        className={state.loading ? "preventdefault__page is-loading" : "preventdefault__page"}
        aria-label="The page"
        role="group"
      >
        {state.loading ? (
          <p className="demo-empty">Loading the new page…</p>
        ) : (
          <>
            <ul className="preventdefault__items" aria-label="Projects">
              {state.items.map((item, index) => (
                <li
                  key={item}
                  className={index >= STARTER.length ? "preventdefault__new" : undefined}
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="preventdefault__status meta">{status}</p>
            <div className="preventdefault__form">
              <span
                className={
                  state.submit ? "preventdefault__field is-submit" : "preventdefault__field"
                }
              >
                <span className="visually-hidden">Field holds: </span>
                {state.field || <span className="preventdefault__placeholder">empty</span>}
              </span>
              <span className="preventdefault__button">Add project</span>
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}

export default function PreventDefault({ props, step }) {
  const title = readTitle(props);
  const stage = stageAt(stages(title), step);
  return (
    <div className="preventdefault">
      <Row>
        <MiniPage side={SIDES[0]} state={stage.with} />
        <MiniPage side={SIDES[1]} state={stage.without} />
      </Row>
      <p className="preventdefault__diff">
        Both copies run this listener, except that the right one has no{" "}
        <Chip tone="muted">event.preventDefault();</Chip> line.
      </p>
      <CodeView lines={CODE} active={stage.active} label="app.js, the left copy" />
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
