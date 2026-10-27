import {
  Suspense,
  use,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import DemoFrame from "../demos/DemoFrame.jsx";
import { demoEntry, hasDemo, loadDemo, readProps } from "../demos/index.js";
import { setExplanationsOpen, useProgress } from "../progress/store.js";
import Question from "./Question.jsx";
import { StepRunContext } from "./runContext.js";
import "../styles/content.css";

const LINK_LABELS = { lecture: "Lecture", reading: "Reading", reference: "Reference" };

// The step's compiled HTML with its placeholders (docs/CONTRACTS.md section 7) filled through
// portals once the HTML is in the page: every explainer whose component is built replaces its
// text fallback, and every predict and quiz becomes a radio group. Under the title come the
// topic's and the step's links and, when the step has a Read more section, the control for the
// "Keep explanations open" preference, which opens or closes every Read more at once.
//
// The HTML object is memoized because React writes innerHTML again whenever the
// dangerouslySetInnerHTML object is new, which would detach the mounted explainers and close any
// panel the student opened.
export default function StepExplanation({ topic, step, stepCount, children }) {
  const contentRef = useRef(null);
  const html = useMemo(() => ({ __html: step.html ?? "" }), [step.html]);
  const progress = useProgress();
  const run = useContext(StepRunContext);
  const explanationsOpen = progress.preferences.explanationsOpen;
  const hasReadMore = (step.html ?? "").includes('<details class="read-more">');
  const placeholders = usePlaceholders(contentRef, step.html);
  const questions = new Map((step.questions ?? []).map((question) => [question.id, question]));

  useEffect(() => {
    for (const details of contentRef.current?.querySelectorAll("details.read-more") ?? []) {
      details.open = explanationsOpen;
    }
  }, [explanationsOpen, step.html]);

  return (
    <section className="pane pane--explanation" aria-labelledby="step-heading">
      <p className="eyebrow">
        Step {step.n} of {stepCount}
      </p>
      <h2 id="step-heading" className="step-title">
        {step.title}
      </h2>
      <StepLinks links={[...(topic?.links ?? []), ...(step.links ?? [])]} />
      {hasReadMore && <KeepOpen checked={explanationsOpen} />}
      <div ref={contentRef} className="step-content" dangerouslySetInnerHTML={html} />
      {placeholders.map(({ element, kind, id, props }, index) => {
        let content = null;
        if (kind === "demo" && hasDemo(id)) {
          content = (
            <Suspense fallback={null}>
              <MountedDemo id={id} props={props} />
            </Suspense>
          );
        } else if (kind !== "demo" && questions.get(id)?.kind === kind && topic) {
          content = (
            <Question
              topicId={topic.id}
              n={step.n}
              question={questions.get(id)}
              readyRunId={run?.readyRunId ?? null}
              hasRunner={Boolean(run)}
            />
          );
        }
        return content && createPortal(content, element, `${kind}-${id}-${index}`);
      })}
      {children}
    </section>
  );
}

const SELECTOR = "[data-demo], [data-predict], [data-quiz]";

// Every placeholder inside the rendered HTML, with its kind, id, and props, found again whenever
// the HTML changes; they exist only once React has written the HTML, so they are read after it.
function usePlaceholders(ref, html) {
  const [elements, setElements] = useState([]);
  useLayoutEffect(() => {
    const found = [...(ref.current?.querySelectorAll(SELECTOR) ?? [])].map((element) => {
      const { demo, predict, quiz, props } = element.dataset;
      if (demo) return { element, kind: "demo", id: demo, props: readProps(props) };
      return { element, kind: predict ? "predict" : "quiz", id: predict ?? quiz };
    });
    setElements(found);
  }, [ref, html]);
  return elements;
}

function MountedDemo({ id, props }) {
  const module = use(loadDemo(id));
  return <DemoFrame entry={demoEntry(id)} module={module} props={props} />;
}

function StepLinks({ links }) {
  if (links.length === 0) return null;
  return (
    <ul className="step-links" aria-label="Lectures and readings">
      {links.map((link, index) => (
        <li key={index}>
          <span className="step-links__kind">{LINK_LABELS[link.kind] ?? link.kind}</span>{" "}
          <a href={link.url} target="_blank" rel="noreferrer">
            {link.title}
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function KeepOpen({ checked }) {
  const id = useId();
  return (
    <p className="keep-open">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => setExplanationsOpen(event.target.checked)}
      />
      <label htmlFor={id}>Keep explanations open</label>
    </p>
  );
}
