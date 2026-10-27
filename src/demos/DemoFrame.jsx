import { useEffect, useId, useState } from "react";
import { prefersReducedMotion, useReducedMotion } from "./motion.js";
import "../styles/demos.css";

export const STEP_INTERVAL_MS = 1600;

// The frame every explainer shares, per docs/CONTRACTS.md section 7.1: the title and the
// description that names the figure for assistive technology, the stage the explainer draws for
// `step`, and the Play, Pause, Back, Step, and Reset controls. It never plays on its own; Play
// advances one stage every STEP_INTERVAL_MS and stops at the last. Under reduced motion it opens
// on the last stage, and Back, Step, and Reset still move between stages.
//
// Controls use aria-disabled rather than disabled so that a keyboard user who steps to the end
// keeps focus on the Step button instead of losing it to the page.
export default function DemoFrame({ entry, module, props = {} }) {
  const Demo = module.default;
  const total = Math.max(1, Math.floor(Number(module.stepCount?.(props)) || 1));
  const last = total - 1;
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(() => (prefersReducedMotion() ? last : 0));
  const [playing, setPlaying] = useState(false);
  const [resets, setResets] = useState(0);
  const titleId = useId();
  const descriptionId = useId();
  const current = Math.min(step, last);

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      setStep(Math.min(current + 1, last));
      if (current + 1 >= last) setPlaying(false);
    }, STEP_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [playing, current, last]);

  function play() {
    if (current >= last) setStep(0);
    setPlaying(true);
  }

  function goTo(next) {
    setPlaying(false);
    setStep(Math.max(0, Math.min(last, next)));
  }

  function reset() {
    setPlaying(false);
    setStep(0);
    setResets((count) => count + 1);
  }

  const stepping = total > 1;

  return (
    <figure
      className="demo-frame"
      data-demo-id={entry.id}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <figcaption className="demo-frame__header">
        <span id={titleId} className="demo-frame__title">
          {entry.title}
        </span>
        <span id={descriptionId} className="demo-frame__description">
          {entry.description}
        </span>
      </figcaption>
      <div className="demo-frame__stage">
        <Demo
          key={resets}
          props={props}
          step={current}
          total={total}
          reducedMotion={reducedMotion}
          goTo={goTo}
        />
      </div>
      <div className="demo-frame__controls" role="group" aria-label={`${entry.title} controls`}>
        {stepping && (
          <>
            <Control primary onClick={playing ? () => setPlaying(false) : play}>
              {playing ? "Pause" : "Play"}
            </Control>
            <Control disabled={current === 0} onClick={() => goTo(current - 1)}>
              Back
            </Control>
            <Control disabled={current === last} onClick={() => goTo(current + 1)}>
              Step
            </Control>
          </>
        )}
        <Control onClick={reset}>Reset</Control>
        {stepping && (
          <span className="demo-frame__position meta">
            Stage {current + 1} of {total}
          </span>
        )}
      </div>
    </figure>
  );
}

function Control({ disabled = false, primary = false, onClick, children }) {
  return (
    <button
      type="button"
      className={primary ? "button button--small button--primary" : "button button--small"}
      aria-disabled={disabled || undefined}
      onClick={() => {
        if (!disabled) onClick();
      }}
    >
      {children}
    </button>
  );
}
