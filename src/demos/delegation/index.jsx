import { useState } from "react";
import { Caption, Chip, CodeView, Panel } from "../kit.jsx";
import "./styles.css";

export const id = "delegation";

export const defaults = {
  items: [
    { title: "Profile card", category: "HTML" },
    { title: "Landing page", category: "CSS" },
    { title: "Reading list", category: "JavaScript" },
  ],
};

const STAGE_COUNT = 7;

const CODE = [
  'list.addEventListener("click", (event) => {',
  '  const button = event.target.closest(".remove");',
  "  if (!button) return;",
  '  const item = button.closest("li");',
  '  const title = item.querySelector(".title").textContent;',
  "  const index = projects.findIndex((project) => project.title === title);",
  "  projects.splice(index, 1);",
  "  renderProjects();",
  "});",
];

const PARTS = {
  title: { selector: "span.title", noun: "the title" },
  category: { selector: "span.category", noun: "the category" },
  remove: { selector: "button.remove", noun: "the Remove button" },
};

function readItems(props) {
  if (!Array.isArray(props.items)) return defaults.items;
  const items = props.items
    .map((entry) => {
      if (typeof entry === "string") return { title: entry, category: "New" };
      if (entry && typeof entry === "object" && typeof entry.title === "string") {
        return {
          title: entry.title,
          category: typeof entry.category === "string" ? entry.category : "New",
        };
      }
      return null;
    })
    .filter((entry) => entry && entry.title.trim() !== "" && entry.title.length <= 40)
    .slice(0, 5);
  const titles = new Set(items.map((entry) => entry.title));
  return items.length >= 2 && titles.size === items.length ? items : defaults.items;
}

function walk(part) {
  return part === "remove"
    ? [{ name: "button.remove", match: true }]
    : [PARTS[part].selector, "li", "ul#project-list", "main", "body", "html"].map((name) => ({
        name,
        match: false,
      }));
}

function view(step, click, items) {
  const found = click.part === "remove";
  const title = items[click.index].title;
  const part = PARTS[click.part];
  const stages = [
    {
      active: -1,
      marks: {},
      caption:
        "One click listener sits on the list, not on any button. Click any part of an item below, or press Step to click Remove beside " +
        `${title}.`,
    },
    {
      active: -1,
      marks: {},
      target: true,
      caption: `You click ${part.noun} of ${title}. That element, ${part.selector}, is event.target: where the event started.`,
    },
    {
      active: 0,
      marks: {},
      target: true,
      listening: true,
      caption: `The click bubbles up to the list, and the list's listener runs. event.target is still ${part.selector}, while event.currentTarget is the list, the element whose listener is running.`,
    },
    {
      active: 1,
      marks: { 0: "done" },
      target: true,
      listening: true,
      walk: true,
      caption: found
        ? 'closest(".remove") starts at event.target and checks it first. The button itself matches, so button is that Remove button.'
        : `closest(".remove") starts at ${part.selector} and walks up through every ancestor. None of them has the class remove, so it returns null.`,
    },
    found
      ? {
          active: 3,
          marks: { 0: "done", 1: "done", 2: "done" },
          target: true,
          listening: true,
          walk: true,
          item: true,
          caption: `button is not null, so the guard lets it through. button.closest("li") walks up to the item, and its title says which project this is: ${title}.`,
        }
      : {
          active: 2,
          marks: { 0: "done", 1: "done" },
          target: true,
          listening: true,
          walk: true,
          caption:
            "button is null, so if (!button) return; ends the listener here. A click on a title or between items is not one this listener cares about.",
        },
    found
      ? {
          active: 7,
          marks: { 0: "done", 1: "done", 2: "done", 3: "done", 4: "done", 5: "done", 6: "done" },
          removed: true,
          caption: `The listener removes ${title} from the projects array and calls renderProjects, which rebuilds the list from the array. The item is gone.`,
        }
      : {
          active: -1,
          marks: { 0: "done", 1: "done", 2: "good" },
          caption:
            "Nothing changed: the list still holds every item. Try the Remove button instead.",
        },
    {
      active: -1,
      marks: {},
      removed: found,
      caption:
        "One listener handles every item, including items a later submit adds, because their clicks bubble to the same list. That is event delegation.",
    },
  ];
  return stages[Math.max(0, Math.min(STAGE_COUNT - 1, step))];
}

export function stepCount() {
  return STAGE_COUNT;
}

export default function Delegation({ props, step, goTo }) {
  const items = readItems(props);
  const [click, setClick] = useState({ index: Math.min(1, items.length - 1), part: "remove" });
  const stage = view(step, click, items);

  function press(index, part) {
    setClick({ index, part });
    goTo(1);
  }

  function partClass(index, part, base) {
    const hit = stage.target && click.index === index && click.part === part;
    return hit ? `${base} delegation__part is-target` : `${base} delegation__part`;
  }

  return (
    <div className="delegation">
      <div className="delegation__layout">
        <Panel title="The page" className="delegation__page">
          <div className={stage.listening ? "delegation__list is-listening" : "delegation__list"}>
            <p className="delegation__listener">
              <span className="demo-mono">ul#project-list</span>
              <Chip tone={stage.listening ? "accent" : undefined}>
                {stage.listening ? "listener runs" : "1 click listener"}
              </Chip>
            </p>
            <ul className="delegation__items" aria-label="Projects">
              {items.map((item, index) => {
                const removed = stage.removed && click.index === index;
                const isItem = stage.item && click.index === index;
                const classes = [
                  "delegation__item",
                  removed && "is-removed",
                  isItem && "is-item",
                ].filter(Boolean);
                return (
                  <li key={item.title} className={classes.join(" ")}>
                    {removed ? (
                      <span className="delegation__gone">
                        <span className="visually-hidden">Removed: </span>
                        {item.title}
                      </span>
                    ) : (
                      <>
                        <span className="delegation__text">
                          <button
                            type="button"
                            className={partClass(index, "title", "delegation__title")}
                            aria-label={`Click the title ${item.title}`}
                            onClick={() => press(index, "title")}
                          >
                            {item.title}
                          </button>
                          <button
                            type="button"
                            className={partClass(index, "category", "delegation__category")}
                            aria-label={`Click the category ${item.category} of ${item.title}`}
                            onClick={() => press(index, "category")}
                          >
                            {item.category}
                          </button>
                        </span>
                        <button
                          type="button"
                          className={partClass(index, "remove", "delegation__remove")}
                          aria-label={`Click Remove beside ${item.title}`}
                          onClick={() => press(index, "remove")}
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          {stage.target && (
            <p className="delegation__facts">
              <span>
                event.target: <Chip tone="accent">{PARTS[click.part].selector}</Chip>
              </span>
              {stage.listening && (
                <span>
                  event.currentTarget: <Chip>ul#project-list</Chip>
                </span>
              )}
            </p>
          )}
          {stage.walk && (
            <div className="delegation__walk">
              <span className="demo-mono">{`closest(".remove"):`}</span>
              <ol aria-label='closest(".remove") checks'>
                {walk(click.part).map((entry) => (
                  <li key={entry.name}>
                    <Chip tone={entry.match ? "success" : "muted"}>
                      {entry.match ? "✓" : "✗"} {entry.name}
                    </Chip>
                  </li>
                ))}
                {click.part !== "remove" && (
                  <li>
                    <Chip tone="danger">null</Chip>
                  </li>
                )}
              </ol>
            </div>
          )}
        </Panel>
        <CodeView lines={CODE} active={stage.active} marks={stage.marks} label="app.js" />
      </div>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
