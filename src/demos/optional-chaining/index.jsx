import { useState } from "react";
import { Box, Caption, Chip, Choice, CodeView, ConsoleView, Panel, Stack } from "../kit.jsx";
import "./styles.css";

export const id = "optional-chaining";

export const defaults = { data: "empty" };

const FALLBACK = '"No reviews yet"';

const DATA = {
  full: {
    label: "One review",
    lines: [
      "const product = {",
      '  title: "Apple",',
      '  reviews: [{ rating: 5, reviewerName: "Maya Patel" }],',
      "};",
    ],
    values: ["an object", "an array with 1 item", "an object", '"Maya Patel"'],
    plain: { text: "Maya Patel" },
  },
  empty: {
    label: "No reviews",
    lines: ["const product = {", '  title: "Apple",', "  reviews: [],", "};"],
    values: ["an object", "an empty array", "undefined"],
    plain: {
      error: true,
      text: "Uncaught TypeError: Cannot read properties of undefined (reading 'reviewerName')",
    },
  },
  loading: {
    label: "Not loaded yet",
    lines: ["let product;"],
    values: ["undefined"],
    plain: {
      error: true,
      text: "Uncaught TypeError: Cannot read properties of undefined (reading 'reviews')",
    },
  },
};

const LINKS = ["product", "?.reviews", "?.[0]", "?.reviewerName"];

const EXPRESSION = `const name = product?.reviews?.[0]?.reviewerName ?? ${FALLBACK};`;
const PLAIN = ["const name = product.reviews[0].reviewerName;", "console.log(name);"];

const STAGE_COUNT = 7;

function settings(props) {
  return { data: Object.hasOwn(DATA, props.data) ? props.data : defaults.data };
}

export function stepCount() {
  return STAGE_COUNT;
}

function linkState(data, link, step) {
  const { values } = DATA[data];
  const stopAt = values.length;
  if (step < link + 1) return { kind: "pending" };
  if (link < stopAt) return { kind: "walked", value: values[link] };
  if (link === stopAt) return { kind: "stopped" };
  return { kind: "skipped" };
}

function chainValue(data) {
  return DATA[data].values.length === LINKS.length
    ? DATA[data].values[LINKS.length - 1]
    : "undefined";
}

const WALK = {
  full: [
    "product is an object, so the walk can go on.",
    "product is not null or undefined, so ?.reviews reads on: reviews is an array with 1 item.",
    "The array is not null or undefined, so ?.[0] reads index 0: the first review, an object.",
    'The review is an object, so ?.reviewerName reads on and gets "Maya Patel". The walk reached the end.',
  ],
  empty: [
    "product is an object, so the walk can go on.",
    "product is not null or undefined, so ?.reviews reads on: reviews is an empty array.",
    "The array is not null or undefined, so ?.[0] reads index 0. The array is empty, so that gives undefined.",
    "The value on the left is undefined, so ?.reviewerName stops the walk right here. The whole chain is undefined, and there is no error.",
  ],
  loading: [
    "product is undefined: the data has not arrived yet. Reading the variable is fine; reading a property of it is not.",
    "The value on the left is undefined, so ?.reviews stops the walk right here. The whole chain is undefined, and there is no error.",
    "The walk already stopped, so ?.[0] is skipped.",
    "?.reviewerName is skipped too: nothing after the stop runs.",
  ],
};

function caption(data, step) {
  const found = chainValue(data);
  if (step === 0)
    return "The expression walks from product down to the name of the first reviewer, one link at a time. Each ?. checks the value on its left before it goes on.";
  if (step <= 4) return WALK[data][step - 1];
  if (step === 5) {
    return found === "undefined"
      ? `The chain gave undefined, so ?? supplies the fallback, ${FALLBACK}. ?? replaces only null and undefined; 0 and "" would be kept.`
      : `The chain gave ${found}, which is not null or undefined, so ?? keeps it and the fallback is not used.`;
  }
  return DATA[data].plain.error
    ? "With plain dots, nothing stops the walk. Reading a property of undefined throws this TypeError, and the log on the next line never runs."
    : "With this data, plain dots work too. Switch the data to see what they do when a value is missing.";
}

function Link({ text, state }) {
  if (state.kind === "pending") {
    return <Chip>{text}</Chip>;
  }
  if (state.kind === "walked") {
    return (
      <span className="optional-chaining__link">
        <Chip tone={state.value === "undefined" ? "warning" : "success"}>{text}</Chip>
        <span className="optional-chaining__value">→ {state.value}</span>
      </span>
    );
  }
  if (state.kind === "stopped") {
    return (
      <span className="optional-chaining__link">
        <Chip tone="danger">{text}</Chip>
        <span className="optional-chaining__value">stops here</span>
      </span>
    );
  }
  return (
    <span className="optional-chaining__link">
      <Chip tone="muted">{text}</Chip>
      <span className="optional-chaining__value">skipped</span>
    </span>
  );
}

export default function OptionalChaining({ props, step }) {
  const [data, setData] = useState(() => settings(props).data);
  const current = Math.max(0, Math.min(STAGE_COUNT - 1, step));
  const found = chainValue(data);
  const result = found === "undefined" ? FALLBACK : found;
  return (
    <div className="optional-chaining">
      <Choice
        legend="The data"
        options={Object.entries(DATA).map(([value, item]) => ({ value, label: item.label }))}
        value={data}
        onChange={setData}
      />
      <Stack>
        <CodeView lines={DATA[data].lines} label="The data" />
        {current < 6 ? (
          <>
            <CodeView lines={[EXPRESSION]} active={current >= 1 ? 0 : -1} label="The expression" />
            <Panel title="The walk">
              <ol className="optional-chaining__walk" aria-label="Links of the chain">
                {LINKS.map((text, link) => (
                  <li key={text}>
                    <Link text={text} state={linkState(data, link, current)} />
                  </li>
                ))}
                <li>
                  <span className="optional-chaining__link">
                    <Chip
                      tone={current >= 5 ? (found === "undefined" ? "accent" : "muted") : undefined}
                    >
                      ?? {FALLBACK}
                    </Chip>
                    {current >= 5 && (
                      <span className="optional-chaining__value">
                        {found === "undefined" ? "→ used" : "not needed"}
                      </span>
                    )}
                  </span>
                </li>
              </ol>
            </Panel>
            <Box label="name" tone={current >= 5 ? "success" : undefined}>
              <span className="demo-mono">{current >= 5 ? result : "not assigned yet"}</span>
            </Box>
          </>
        ) : (
          <>
            <CodeView
              lines={PLAIN}
              marks={{ 0: DATA[data].plain.error ? "error" : "good" }}
              label="Without optional chaining"
            />
            <ConsoleView lines={[DATA[data].plain]} fresh={1} />
          </>
        )}
      </Stack>
      <Caption>{caption(data, current)}</Caption>
    </div>
  );
}
