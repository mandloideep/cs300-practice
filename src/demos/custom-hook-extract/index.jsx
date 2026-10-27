import { Caption, Chip, CodeView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "custom-hook-extract";

export const defaults = { storageKey: "shop-saved-products", name: "saved" };

function settings(props) {
  const storageKey =
    typeof props.storageKey === "string" && /^[\w-]{1,32}$/.test(props.storageKey)
      ? props.storageKey
      : defaults.storageKey;
  const name =
    typeof props.name === "string" && /^[a-z][A-Za-z0-9]{1,15}$/.test(props.name)
      ? props.name
      : defaults.name;
  return { storageKey, name, setter: `set${name[0].toUpperCase()}${name.slice(1)}` };
}

function beforeCode({ storageKey, name, setter }) {
  return [
    `const [${name}, ${setter}] = useState(() => {`,
    `  const stored = window.localStorage.getItem("${storageKey}");`,
    "  return stored === null ? [] : JSON.parse(stored);",
    "});",
    "useEffect(() => {",
    `  window.localStorage.setItem("${storageKey}", JSON.stringify(${name}));`,
    `}, [${name}]);`,
  ];
}

const HOOK = [
  "export function useLocalStorage(key, initialValue) {",
  "  const [value, setValue] = useState(() => {",
  "    const stored = window.localStorage.getItem(key);",
  "    return stored === null ? initialValue : JSON.parse(stored);",
  "  });",
  "  useEffect(() => {",
  "    window.localStorage.setItem(key, JSON.stringify(value));",
  "  }, [key, value]);",
  "  return [value, setValue];",
  "}",
];

function afterCode({ storageKey, name, setter }) {
  return [`const [${name}, ${setter}] = useLocalStorage("${storageKey}", []);`];
}

function range(from, to, mark) {
  const marks = {};
  for (let index = from; index <= to; index += 1) marks[index] = mark;
  return marks;
}

function stages(setup) {
  const { storageKey, name } = setup;
  return [
    {
      before: {},
      showAfter: false,
      caption: `Inside App, two hook calls keep ${name} in localStorage: useState reads the stored value once, and useEffect writes it back whenever it changes.`,
    },
    {
      before: range(0, 3, "good"),
      showAfter: false,
      caption: `The first call: useState with a function, so the storage is read once, on the first render. When nothing is stored under "${storageKey}", it starts from [].`,
    },
    {
      before: range(4, 6, "good"),
      showAfter: false,
      caption: `The second call: useEffect writes ${name} as JSON after every render in which ${name} changed.`,
    },
    {
      before: {},
      hook: {},
      showAfter: true,
      renames: true,
      caption: `To reuse this, move the two calls into a function whose name starts with use. What was specific to App becomes a parameter or a local name.`,
    },
    {
      before: range(0, 3, "good"),
      hook: range(1, 4, "good"),
      showAfter: true,
      caption: `The same useState call, now in the hook. Only the names changed: "${storageKey}" became key, [] became initialValue, and ${name} became value.`,
    },
    {
      before: range(4, 6, "good"),
      hook: range(5, 7, "good"),
      showAfter: true,
      caption: `The same useEffect call. Its dependencies list key as well as value, because the key is a parameter now and could change.`,
    },
    {
      before: {},
      hook: { 8: "good" },
      app: { 0: "good" },
      showAfter: true,
      caption: `The hook returns the pair, like useState, so App swaps seven lines for one call with the key and the starting value.`,
    },
    {
      before: {},
      hook: {},
      app: {},
      showAfter: true,
      calls: true,
      caption: `Both versions make the same calls in the same order while App renders: useState, then useEffect. So the state still belongs to App, and a second component calling the hook gets a state of its own.`,
    },
  ];
}

export function stepCount() {
  return 8;
}

function Calls() {
  return (
    <ol className="custom-hook-extract__calls" aria-label="Hook calls while App renders">
      <li>
        <Chip tone="accent">1 useState</Chip>
      </li>
      <li>
        <Chip tone="accent">2 useEffect</Chip>
      </li>
    </ol>
  );
}

export default function CustomHookExtract({ props, step }) {
  const setup = settings(props);
  const stage = stageAt(stages(setup), step);
  return (
    <div className="custom-hook-extract">
      <div className="custom-hook-extract__columns">
        <Panel title="Before: inside App" className="custom-hook-extract__col">
          <CodeView lines={beforeCode(setup)} marks={stage.before} label="App.jsx, before" />
          {stage.calls && <Calls />}
        </Panel>
        <Panel
          title="After: a hook and one call"
          className={
            stage.showAfter ? "custom-hook-extract__col" : "custom-hook-extract__col is-empty"
          }
        >
          {stage.showAfter ? (
            <>
              <p className="custom-hook-extract__file meta">useLocalStorage.js</p>
              <CodeView lines={HOOK} marks={stage.hook} label="useLocalStorage.js" />
              <p className="custom-hook-extract__file meta">App.jsx</p>
              <CodeView lines={afterCode(setup)} marks={stage.app} label="App.jsx, after" />
              {stage.calls && <Calls />}
            </>
          ) : (
            <p className="demo-empty">Not written yet.</p>
          )}
        </Panel>
      </div>
      {stage.renames && (
        <ul className="custom-hook-extract__renames" aria-label="What became a parameter">
          <li>
            <Chip>&quot;{setup.storageKey}&quot;</Chip> → <Chip tone="accent">key</Chip>
          </li>
          <li>
            <Chip>[]</Chip> → <Chip tone="accent">initialValue</Chip>
          </li>
          <li>
            <Chip>{setup.name}</Chip> → <Chip tone="accent">value</Chip>
          </li>
        </ul>
      )}
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
