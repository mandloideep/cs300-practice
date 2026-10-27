import { Box, Caption, Chip, CodeView, Panel, Stack, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "json-roundtrip";

export const defaults = {};

const ISO = "2026-10-27T15:30:00.000Z";

const PROPERTIES = [
  { key: "version", group: 1, memory: "1", json: "1", parsed: "1", fate: "kept" },
  { key: "ids", group: 1, memory: "[1, 6]", json: "[1,6]", parsed: "[1, 6]", fate: "kept" },
  {
    key: "savedAt",
    group: 2,
    memory: `new Date("${ISO}")`,
    json: `"${ISO}"`,
    parsed: `"${ISO}", a string`,
    fate: "changed",
  },
  { key: "note", group: 3, memory: "undefined", json: null, parsed: null, fate: "dropped" },
  {
    key: "describe",
    group: 3,
    memory: "a function",
    prose: true,
    json: null,
    parsed: null,
    fate: "dropped",
  },
  { key: "total", group: 4, memory: "NaN", json: "null", parsed: "null", fate: "changed" },
  { key: "limit", group: 4, memory: "Infinity", json: "null", parsed: "null", fate: "changed" },
  {
    key: "tags",
    group: 5,
    memory: 'new Map([["sale", true]])',
    json: "{}",
    parsed: "{}, an empty object",
    fate: "changed",
  },
];

const TEXT = `{"version":1,"ids":[1,6],"savedAt":"${ISO}","total":null,"limit":null,"tags":{}}`;

const LINES = ["const text = JSON.stringify(saved);", "const back = JSON.parse(text);"];

const STAGES = [
  {
    line: -1,
    written: 0,
    text: false,
    parsed: false,
    caption:
      "saved is an object in memory with eight properties: numbers, an array, a Date, undefined, NaN, Infinity, a Map, and a method. JSON.stringify is about to write it as text.",
  },
  {
    line: 0,
    written: 1,
    text: false,
    parsed: false,
    caption:
      "Numbers and arrays of numbers are plain data, so version and ids are written as they are.",
  },
  {
    line: 0,
    written: 2,
    text: false,
    parsed: false,
    caption:
      "A Date is not plain data. JSON.stringify calls its toJSON method, so savedAt is written as a string of the date and time in UTC.",
  },
  {
    line: 0,
    written: 3,
    text: false,
    parsed: false,
    caption:
      "JSON has no undefined and no functions. Properties holding either are left out of the text entirely, so note and describe are gone.",
  },
  {
    line: 0,
    written: 4,
    text: false,
    parsed: false,
    caption: "JSON numbers cannot be NaN or Infinity, so total and limit are written as null.",
  },
  {
    line: 0,
    written: 5,
    text: false,
    parsed: false,
    caption:
      "A Map keeps its entries where JSON.stringify does not look, so tags is written as an empty object, {}.",
  },
  {
    line: 0,
    written: 5,
    text: true,
    parsed: false,
    caption:
      "text is one string holding six of the eight properties, the form localStorage stores. Nothing in it says that savedAt was a Date or that tags held an entry.",
  },
  {
    line: 1,
    written: 5,
    text: true,
    parsed: true,
    caption:
      "JSON.parse builds a new object from the text. version and ids come back; savedAt is a string, total and limit are null, tags is empty, and note and describe are missing.",
  },
  {
    line: -1,
    written: 5,
    text: true,
    parsed: true,
    caption:
      "Store only what JSON carries: strings, numbers, true and false, null, arrays, and plain objects. Turn a date string back into a Date with new Date(back.savedAt) when you read it.",
  },
];

const FATES = {
  kept: { tone: "success", label: "✓ kept" },
  changed: { tone: "warning", label: "≠ changed" },
  dropped: { tone: "danger", label: "✗ dropped" },
};

export function stepCount() {
  return STAGES.length;
}

function Property({ property, stage }) {
  const written = property.group <= stage.written;
  const fate = FATES[property.fate];
  return (
    <li>
      <Box
        tone={written ? fate.tone : undefined}
        className={
          written && property.json === null
            ? "json-roundtrip__prop json-roundtrip__prop--dropped"
            : "json-roundtrip__prop"
        }
      >
        <span className="json-roundtrip__head">
          <span className="json-roundtrip__key">{property.key}</span>
          {written && <Chip tone={fate.tone}>{fate.label}</Chip>}
        </span>
        <dl className="json-roundtrip__values">
          <div>
            <dt>In memory</dt>
            <dd className={property.prose ? undefined : "demo-mono"}>{property.memory}</dd>
          </div>
          <div>
            <dt>In the text</dt>
            <dd
              className={
                !written ? "json-roundtrip__none" : property.json === null ? undefined : "demo-mono"
              }
            >
              {!written ? "not written yet" : property.json === null ? "left out" : property.json}
            </dd>
          </div>
          {stage.parsed && (
            <div>
              <dt>Parsed back</dt>
              <dd className={property.parsed === null ? undefined : "demo-mono"}>
                {property.parsed === null ? "missing" : property.parsed}
              </dd>
            </div>
          )}
        </dl>
      </Box>
    </li>
  );
}

export default function JsonRoundtrip({ step }) {
  const stage = stageAt(STAGES, step);
  const marks = stage.line === 1 ? { 0: "done" } : {};
  return (
    <div className="json-roundtrip">
      <Stack>
        <CodeView lines={LINES} active={stage.line} marks={marks} label="main.js" />
        <Panel title="The properties of saved">
          <ul className="json-roundtrip__props" aria-label="The properties of saved">
            {PROPERTIES.map((property) => (
              <Property key={property.key} property={property} stage={stage} />
            ))}
          </ul>
        </Panel>
        {stage.text && (
          <Panel title="text" sunken>
            <p className="json-roundtrip__text demo-mono">{TEXT}</p>
          </Panel>
        )}
      </Stack>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
