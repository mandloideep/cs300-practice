import { useState } from "react";
import { Caption, Chip, Choice, CodeView, Panel, Row } from "../kit.jsx";
import "./styles.css";

export const id = "label-for";

export const defaults = { label: "Name", id: "name", for: "none" };

const MODES = ["none", "match", "typo"];

function settings(props) {
  const label =
    typeof props.label === "string" && props.label.trim() !== "" && props.label.length <= 30
      ? props.label.trim()
      : defaults.label;
  const fieldId =
    typeof props.id === "string" && /^[A-Za-z][\w-]{0,29}$/.test(props.id) ? props.id : defaults.id;
  const mode = MODES.includes(props.for) ? props.for : defaults.for;
  return { label, id: fieldId, typo: typo(fieldId), mode };
}

function typo(value) {
  if (value.length >= 3 && value[1] !== value[2]) {
    return value[0] + value[2] + value[1] + value.slice(3);
  }
  return `${value}2`;
}

const STAGES = ["markup", "click", "reader", "rule"];

export function stepCount() {
  return STAGES.length;
}

function captionFor(stage, mode, { label, id: fieldId, typo: wrong }) {
  const linked = mode === "match";
  if (stage === "markup") {
    if (mode === "none") {
      return "A label and a field side by side. The label has no for attribute, so nothing ties it to the field.";
    }
    if (linked) {
      return `The label's for is "${fieldId}" and the field's id is "${fieldId}". They match, so the label belongs to the field.`;
    }
    const how = wrong.length === fieldId.length ? "Two letters swapped" : "One character extra";
    return `The label's for is "${wrong}" but the field's id is "${fieldId}". ${how}, and they no longer match.`;
  }
  if (stage === "click") {
    return linked
      ? `You click the word ${label}. The cursor lands in the field: clicking a label focuses the field it belongs to.`
      : `You click the word ${label}. Nothing happens: the browser cannot tell which field the label is for, so focus stays where it was.`;
  }
  if (stage === "reader") {
    return linked
      ? `A screen reader reaching the field says "${label}, edit text": the label's text is now the field's name.`
      : `A screen reader reaching the field says only "edit text". The field has no name, so the listener has to guess what to type.`;
  }
  return linked
    ? "The for attribute names the id of one field, and the two must match exactly, capital letters included. The name attribute is different: it is what the value is sent as."
    : `Choose for="${fieldId}" above and step through again: with a matching for, the click focuses the field and the field gets its name.`;
}

export default function LabelFor({ props, step, goTo }) {
  const setup = settings(props);
  const [mode, setMode] = useState(setup.mode);
  const stage = STAGES[Math.max(0, Math.min(STAGES.length - 1, step))];
  const linked = mode === "match";
  const clicked = step >= 1;
  const forValue = mode === "match" ? setup.id : mode === "typo" ? setup.typo : null;
  const lines = [
    forValue === null
      ? `<label>${setup.label}</label>`
      : `<label for="${forValue}">${setup.label}</label>`,
    `<input id="${setup.id}" name="${setup.id}" type="text" />`,
  ];
  const marks = mode === "match" ? { 0: "good", 1: "good" } : mode === "typo" ? { 0: "error" } : {};

  return (
    <div className="label-for">
      <Choice
        legend="The label's for attribute"
        options={[
          { value: "none", label: "No for" },
          { value: "match", label: `for="${setup.id}"` },
          { value: "typo", label: `for="${setup.typo}"` },
        ]}
        value={mode}
        onChange={setMode}
      />
      <Row>
        <Panel title="The markup">
          <CodeView lines={lines} marks={marks} label="The label and the field" />
          <p className="label-for__verdict">
            {mode === "none" ? (
              <Chip tone="muted">No for: not connected</Chip>
            ) : linked ? (
              <Chip tone="success">✓ for matches the id</Chip>
            ) : (
              <Chip tone="danger">✗ for does not match the id</Chip>
            )}
          </p>
        </Panel>
        <Panel title="The page">
          <div className="label-for__form">
            <span className="label-for__row">
              <button type="button" className="label-for__label" onClick={() => goTo(1)}>
                <span className="visually-hidden">Click the label </span>
                {setup.label}
              </button>
              {clicked && <Chip tone="accent">clicked</Chip>}
            </span>
            <span
              className={`label-for__field${clicked && linked ? " is-focused" : ""}`}
              aria-hidden="true"
            >
              {clicked && linked && <span className="label-for__caret" />}
            </span>
            {clicked && (
              <span className="meta">
                {linked ? "The field has focus." : "No field has focus."}
              </span>
            )}
          </div>
          {step >= 2 && (
            <div className="label-for__reader">
              <span className="meta">A screen reader says</span>
              <span className={`label-for__speech${linked ? "" : " is-missing"}`}>
                {linked ? `"${setup.label}, edit text"` : '"edit text"'}
              </span>
            </div>
          )}
        </Panel>
      </Row>
      <Caption>{captionFor(stage, mode, setup)}</Caption>
    </div>
  );
}
