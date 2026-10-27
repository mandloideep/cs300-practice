import { useState } from "react";
import { Caption, CodeView, Panel, Row, Slider } from "../kit.jsx";
import "./styles.css";

export const id = "box-model";

export const defaults = { width: 240, padding: 24, border: 4, margin: 16 };

const LIMITS = {
  width: [120, 320],
  padding: [0, 32],
  border: [0, 12],
  margin: [0, 32],
};

const CONTENT_HEIGHT = 40;

function settings(props) {
  const out = {};
  for (const [key, [min, max]] of Object.entries(LIMITS)) {
    const value = props[key];
    out[key] =
      typeof value === "number" && Number.isFinite(value) && value >= min && value <= max
        ? Math.round(value)
        : defaults[key];
  }
  return out;
}

const STAGES = [
  { layers: 0, sizing: null },
  { layers: 1, sizing: null },
  { layers: 2, sizing: null },
  { layers: 3, sizing: null },
  { layers: 3, sizing: "content-box" },
  { layers: 3, sizing: "border-box" },
];

export function stepCount() {
  return STAGES.length;
}

function measure({ width, padding, border, margin }, sizing) {
  const sides = 2 * padding + 2 * border;
  const box = sizing === "border-box" ? Math.max(width, sides) : width + sides;
  return { box, content: box - sides, outer: box + 2 * margin };
}

function captionFor(index, values, sizes) {
  const { width, padding, border, margin } = values;
  const p = padding;
  const b = border;
  switch (index) {
    case 0:
      return `width: ${width}px sets the content area, the part that holds the text. So far that is the whole box.`;
    case 1:
      return `padding: ${p}px adds space inside the box, on all four sides of the content. The element's background fills it.`;
    case 2:
      return `border: ${b}px wraps the padding. It is the edge you can see.`;
    case 3:
      return `margin: ${margin}px is outside the border: transparent space that keeps neighbors away. It is never part of the box's measured width.`;
    case 4:
      return `By default, box-sizing is content-box, so width is the content alone. The box measures ${width} + 2 × ${p} + 2 × ${b} = ${sizes.box}px, wider than the width you set.`;
    default:
      return sizes.content > 0
        ? `With box-sizing: border-box, width is the whole box up to the border, so it measures ${sizes.box}px. The content shrinks to ${width} - 2 × ${p} - 2 × ${b} = ${sizes.content}px to make room.`
        : `With box-sizing: border-box, width is the whole box, but padding and border already take ${2 * p + 2 * b}px, so the content shrinks to 0 and the box grows to ${sizes.box}px.`;
  }
}

function Rect({ x, y, w, h, scaleX, scaleY, className, children }) {
  return (
    <div
      className={className}
      style={{
        left: `${(x / scaleX) * 100}%`,
        top: `${(y / scaleY) * 100}%`,
        width: `${(w / scaleX) * 100}%`,
        height: `${(h / scaleY) * 100}%`,
      }}
    >
      {children}
    </div>
  );
}

function Ruler({ x, w, scale, label, tone }) {
  return (
    <div className={`box-model__ruler box-model__ruler--${tone}`}>
      <span
        className="box-model__bar"
        style={{ left: `${(x / scale) * 100}%`, width: `${(w / scale) * 100}%` }}
      />
      <span className="box-model__ruler-label" style={{ paddingLeft: `${(x / scale) * 100}%` }}>
        {label}
      </span>
    </div>
  );
}

export default function BoxModel({ props, step }) {
  const setup = settings(props);
  const index = Math.max(0, Math.min(STAGES.length - 1, step));
  const stage = STAGES[index];
  const [values, setValues] = useState(setup);
  const set = (key) => (value) => setValues((current) => ({ ...current, [key]: value }));
  const shown = {
    width: values.width,
    padding: stage.layers >= 1 ? values.padding : 0,
    border: stage.layers >= 2 ? values.border : 0,
    margin: stage.layers >= 3 ? values.margin : 0,
  };
  const sizing = stage.sizing ?? "content-box";
  const sizes = measure(shown, sizing);
  const { padding: p, border: b, margin: m } = shown;
  const scaleX = values.width + 2 * (LIMITS.padding[1] + LIMITS.border[1] + LIMITS.margin[1]);
  const height = CONTENT_HEIGHT + 2 * (p + b + m);
  const area = { scaleX, scaleY: height };

  const lines = [".card {"];
  if (stage.sizing) lines.push(`  box-sizing: ${stage.sizing};`);
  lines.push(`  width: ${values.width}px;`);
  if (stage.layers >= 1) lines.push(`  padding: ${values.padding}px;`);
  if (stage.layers >= 2) lines.push(`  border: ${values.border}px solid;`);
  if (stage.layers >= 3) lines.push(`  margin: ${values.margin}px;`);
  lines.push("}");
  const fresh = [
    "  width:",
    "  padding:",
    "  border:",
    "  margin:",
    "  box-sizing:",
    "  box-sizing:",
  ][index];
  const active = lines.findIndex((line) => line.startsWith(fresh));
  const widthX = sizing === "border-box" ? m : m + b + p;

  return (
    <div className="box-model">
      <Row>
        <Panel title="styles.css">
          <CodeView lines={lines} active={active} label="styles.css" />
          <div className="box-model__sliders">
            {stage.layers >= 1 && (
              <Slider
                label="padding"
                min={LIMITS.padding[0]}
                max={LIMITS.padding[1]}
                step={2}
                value={values.padding}
                onChange={set("padding")}
                unit="px"
              />
            )}
            {stage.layers >= 2 && (
              <Slider
                label="border"
                min={LIMITS.border[0]}
                max={LIMITS.border[1]}
                value={values.border}
                onChange={set("border")}
                unit="px"
              />
            )}
            {stage.layers >= 3 && (
              <Slider
                label="margin"
                min={LIMITS.margin[0]}
                max={LIMITS.margin[1]}
                step={2}
                value={values.margin}
                onChange={set("margin")}
                unit="px"
              />
            )}
          </div>
        </Panel>
        <Panel title="The box, to scale">
          <div className="box-model__drawing" aria-hidden="true">
            <div className="box-model__area" style={{ aspectRatio: `${scaleX} / ${height}` }}>
              {m > 0 && (
                <Rect
                  {...area}
                  x={0}
                  y={0}
                  w={sizes.outer}
                  h={height}
                  className="box-model__margin"
                />
              )}
              <Rect
                {...area}
                x={m}
                y={m}
                w={sizes.box}
                h={height - 2 * m}
                className="box-model__border"
              />
              <Rect
                {...area}
                x={m + b}
                y={m + b}
                w={sizes.box - 2 * b}
                h={height - 2 * m - 2 * b}
                className="box-model__padding"
              />
              <Rect
                {...area}
                x={m + b + p}
                y={m + b + p}
                w={sizes.content}
                h={CONTENT_HEIGHT}
                className="box-model__content"
              >
                <span>{sizes.content}</span>
              </Rect>
            </div>
            <Ruler
              x={widthX}
              w={values.width}
              scale={scaleX}
              label={`width: ${values.width}px`}
              tone="set"
            />
            {stage.sizing && (
              <Ruler
                x={m}
                w={sizes.box}
                scale={scaleX}
                label={`measured: ${sizes.box}px`}
                tone={sizes.box === values.width ? "matches" : "measured"}
              />
            )}
          </div>
          <ul className="box-model__legend" aria-label="Layers">
            <li>
              <span className="box-model__swatch box-model__content" />
              content {sizes.content}px
            </li>
            {stage.layers >= 1 && (
              <li>
                <span className="box-model__swatch box-model__padding" />
                padding {p}px
              </li>
            )}
            {stage.layers >= 2 && (
              <li>
                <span className="box-model__swatch box-model__border" />
                border {b}px
              </li>
            )}
            {stage.layers >= 3 && (
              <li>
                <span className="box-model__swatch box-model__margin" />
                margin {m}px
              </li>
            )}
          </ul>
          {stage.sizing && (
            <table className="demo-table box-model__table">
              <thead>
                <tr>
                  <th scope="col">box-sizing</th>
                  <th scope="col">Content</th>
                  <th scope="col">Measured</th>
                </tr>
              </thead>
              <tbody>
                {["content-box", "border-box"].map((name) => {
                  const row = measure(shown, name);
                  return (
                    <tr key={name} className={name === sizing ? "is-active" : undefined}>
                      <th scope="row" className="demo-mono">
                        {name}
                      </th>
                      <td>{row.content}px</td>
                      <td>{row.box}px</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Panel>
      </Row>
      <Caption>{captionFor(index, { ...values, ...shown }, sizes)}</Caption>
    </div>
  );
}
