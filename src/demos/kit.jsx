import { useId } from "react";

// Drawing pieces shared by the explainers. Each one is plain markup with the classes in
// src/styles/demos.css, so that every explainer reads the same, follows the color scheme, and
// wraps at phone width.

// What the current stage shows, in words; announced politely as the stage changes.
export function Caption({ children }) {
  return (
    <p className="demo-caption" aria-live="polite">
      {children}
    </p>
  );
}

export function Row({ children, className = "" }) {
  return <div className={`demo-row ${className}`.trim()}>{children}</div>;
}

export function Stack({ children, className = "" }) {
  return <div className={`demo-stack ${className}`.trim()}>{children}</div>;
}

export function Panel({ title, children, sunken = false, className = "" }) {
  const id = useId();
  const classes = ["demo-panel", sunken && "demo-panel--sunken", className].filter(Boolean);
  return (
    <section className={classes.join(" ")} aria-labelledby={title ? id : undefined}>
      {title && (
        <p id={id} className="demo-panel__title">
          {title}
        </p>
      )}
      {children}
    </section>
  );
}

// Lines of code with some marked: `active` is the line running now; `marks` maps a line index
// to "done", "error", or "good". Indexes start at 0. A line too long for the column wraps with
// its continuation indented two characters past the line's own indentation.
export function CodeView({ lines, active = -1, marks = {}, label }) {
  return (
    <pre className="demo-code" aria-label={label}>
      <code>
        {lines.map((line, index) => {
          const state = index === active ? "active" : marks[index];
          const indent = /^ */.exec(line)[0].length;
          return (
            <span
              key={index}
              className={state ? `demo-code__line is-${state}` : "demo-code__line"}
              style={indent > 0 ? { "--demo-indent": `${indent}ch` } : undefined}
            >
              {index === active && <span className="visually-hidden">Running now: </span>}
              {line.trim() === "" ? " " : line.slice(indent)}
            </span>
          );
        })}
      </code>
    </pre>
  );
}

// tone: "accent", "success", "warning", "danger", "muted", or none.
export function Chip({ tone, children, className = "" }) {
  const classes = ["demo-chip", tone && `demo-chip--${tone}`, className].filter(Boolean);
  return <span className={classes.join(" ")}>{children}</span>;
}

export function Box({ label, tone, children, className = "", as: Tag = "div", ...rest }) {
  const classes = ["demo-box", tone && `demo-box--${tone}`, className].filter(Boolean);
  return (
    <Tag className={classes.join(" ")} {...rest}>
      {label && <span className="demo-box__label">{label}</span>}
      {children}
    </Tag>
  );
}

// The lines a console shows; `fresh` is how many at the end appeared at this stage.
export function ConsoleView({ lines, fresh = 0, label = "Console" }) {
  return (
    <Panel title={label} sunken>
      {lines.length === 0 ? (
        <p className="demo-empty">Nothing logged yet.</p>
      ) : (
        <ol className="demo-console">
          {lines.map((line, index) => {
            const text = typeof line === "string" ? line : line.text;
            const error = typeof line === "object" && line.error;
            const isNew = index >= lines.length - fresh;
            const classes = [error && "is-error", isNew && "is-new"].filter(Boolean).join(" ");
            return (
              <li key={index} className={classes || undefined}>
                {text}
              </li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}

// A radio group drawn as pills, for an explainer's own switch between cases.
export function Choice({ legend, options, value, onChange }) {
  const name = useId();
  return (
    <fieldset className="demo-choice">
      <legend>{legend}</legend>
      {options.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}

export function TextField({ label, value, onChange, spellCheck = false }) {
  return (
    <label className="demo-field">
      <span>{label}</span>
      <input
        type="text"
        value={value}
        spellCheck={spellCheck}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function Slider({ label, min, max, step = 1, value, onChange, unit = "" }) {
  return (
    <label className="demo-field">
      <span>
        {label}: {value}
        {unit}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

// Array-like cells with their indexes; `active` is the index being read, `marks` maps an index
// to a tone.
export function Cells({ items, active = -1, marks = {}, label, showIndex = true }) {
  return (
    <ol className="demo-cells" aria-label={label}>
      {items.map((item, index) => {
        const tone = index === active ? "accent" : marks[index];
        return (
          <li key={index} className={tone ? `demo-cell demo-box--${tone}` : "demo-cell"}>
            {showIndex && <span className="demo-cell__index">[{index}]</span>}
            <span>{item}</span>
          </li>
        );
      })}
    </ol>
  );
}

// Stage data helper: the stage for `step`, clamped to the list.
export function stageAt(stages, step) {
  return stages[Math.max(0, Math.min(stages.length - 1, step))];
}
