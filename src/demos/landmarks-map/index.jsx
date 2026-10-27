import { Caption, Chip, Panel, Row } from "../kit.jsx";
import "./styles.css";

export const id = "landmarks-map";

const ORDER = ["header", "nav", "main", "aside", "footer"];

export const defaults = { regions: ORDER };

const REGIONS = {
  header: {
    role: "banner",
    sketch: ["CS300 Study Group"],
    caption:
      "The top block becomes <header>. At the top level of the page, a screen reader lists it as banner: the site's name and logo.",
  },
  nav: {
    role: "navigation",
    sketch: ["About", "Meeting times", "Join"],
    caption:
      "The group of links becomes <nav>, listed as navigation. A screen reader user can jump straight to the links.",
  },
  main: {
    role: "main",
    sketch: ["About the group", "When we meet", "Join the group"],
    caption:
      "The content block becomes <main>, listed as main. The sections inside it are not on the list: a section becomes a landmark only when it has a name, from aria-label or aria-labelledby.",
  },
  aside: {
    role: "complementary",
    sketch: ["Next meeting: Tuesday, 4 pm"],
    caption:
      "The side block becomes <aside>, listed as complementary: related to the page, but not its main point.",
  },
  footer: {
    role: "content info",
    sketch: ["Run by students, for students."],
    caption:
      "The bottom block becomes <footer>. At the top level of the page it is listed as content info: who runs the page, and its fine print.",
  },
};

const WORDS = ["No", "One", "Two", "Three", "Four", "Five"];

function settings(props) {
  const list = Array.isArray(props.regions) ? props.regions : [];
  const known = ORDER.filter((key) => list.includes(key));
  return { regions: known.length ? known : defaults.regions };
}

function stages({ regions }) {
  const count = WORDS[regions.length];
  return [
    {
      done: 0,
      lit: null,
      caption:
        "Every region is a <div>. On screen the page looks fine, but a screen reader finds no landmarks, so it has nothing to jump to.",
    },
    ...regions.map((key, index) => ({ done: index + 1, lit: key, caption: REGIONS[key].caption })),
    {
      done: regions.length,
      lit: null,
      caption: `${count} ${regions.length === 1 ? "landmark" : "landmarks"}, in page order. A screen reader user can list them and jump straight to the one they want, the way you skim a page with your eyes.`,
    },
  ];
}

export function stepCount(props) {
  return stages(settings(props)).length;
}

function Region({ name, converted, lit, children, className = "" }) {
  const classes = [
    "landmarks-map__region",
    converted && "is-converted",
    lit && "is-lit",
    className,
  ].filter(Boolean);
  return (
    <div className={classes.join(" ")}>
      <span className="landmarks-map__tag">
        {lit && <span className="visually-hidden">Now: </span>}
        {converted ? `<${name}>` : "<div>"}
      </span>
      {children}
    </div>
  );
}

function Sketch({ lines }) {
  return (
    <span className="landmarks-map__sketch" aria-hidden="true">
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </span>
  );
}

export default function LandmarksMap({ props, step }) {
  const { regions } = settings(props);
  const all = stages({ regions });
  const stage = all[Math.max(0, Math.min(all.length - 1, step))];
  const done = new Set(regions.slice(0, stage.done));
  const has = (key) => regions.includes(key);
  const region = (key, extra) => (
    <Region
      name={key}
      converted={done.has(key)}
      lit={stage.lit === key}
      className={`landmarks-map__region--${key}`}
    >
      <Sketch lines={REGIONS[key].sketch} />
      {extra}
    </Region>
  );
  const nav = has("nav") ? region("nav") : null;
  const listed = regions.filter((key) => done.has(key));

  return (
    <div className="landmarks-map">
      <Row>
        <div className="landmarks-map__page" role="group" aria-label="The page in miniature">
          {has("header") ? region("header", nav) : nav}
          {(has("main") || has("aside")) && (
            <div className="landmarks-map__middle">
              {has("main") && region("main")}
              {has("aside") && region("aside")}
            </div>
          )}
          {has("footer") && region("footer")}
        </div>
        <Panel title="What a screen reader lists" sunken>
          {listed.length === 0 ? (
            <p className="demo-empty">No landmarks found.</p>
          ) : (
            <ol className="landmarks-map__list" aria-label="Landmarks, in page order">
              {listed.map((key) => (
                <li key={key} className={stage.lit === key ? "is-lit" : undefined}>
                  <Chip tone={stage.lit === key ? "accent" : undefined}>
                    {stage.lit === key && <span className="visually-hidden">New: </span>}
                    {REGIONS[key].role}
                  </Chip>
                  <span className="demo-mono meta">&lt;{key}&gt;</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </Row>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
