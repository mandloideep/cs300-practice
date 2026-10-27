import { Suspense, use, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DemoFrame from "../demos/DemoFrame.jsx";
import { demoEntry, hasDemo, loadDemo, readProps } from "../demos/index.js";
import "../styles/content.css";

// The step's compiled HTML, with every explainer placeholder (docs/CONTRACTS.md section 7.1)
// replaced by its component through a portal once the HTML is in the page. A placeholder whose id
// has no component yet keeps its text fallback.
//
// The HTML object is memoized because React writes innerHTML again whenever the
// dangerouslySetInnerHTML object is new, which would detach the mounted explainers and close any
// panel the student opened.
export default function StepExplanation({ step, stepCount, children }) {
  const contentRef = useRef(null);
  const html = useMemo(() => ({ __html: step.html ?? "" }), [step.html]);
  const demos = usePlaceholders(contentRef, step.html, "[data-demo]", (element) => ({
    id: element.dataset.demo,
    props: readProps(element.dataset.props),
  }));

  return (
    <section className="pane pane--explanation" aria-labelledby="step-heading">
      <p className="eyebrow">
        Step {step.n} of {stepCount}
      </p>
      <h2 id="step-heading" className="step-title">
        {step.title}
      </h2>
      <div ref={contentRef} className="step-content" dangerouslySetInnerHTML={html} />
      {demos.map(({ element, id, props }, index) =>
        hasDemo(id)
          ? createPortal(
              <Suspense fallback={null}>
                <MountedDemo id={id} props={props} />
              </Suspense>,
              element,
              `${id}-${index}`,
            )
          : null,
      )}
      {children}
    </section>
  );
}

// The elements matching `selector` inside the rendered HTML, each with what `read` takes from
// its attributes, found again whenever the HTML changes.
function usePlaceholders(ref, html, selector, read) {
  const [elements, setElements] = useState([]);
  const readRef = useRef(read);
  useLayoutEffect(() => {
    const found = ref.current
      ? [...ref.current.querySelectorAll(selector)].map((element) => ({
          element,
          ...readRef.current(element),
        }))
      : [];
    // The placeholders exist only once React has written the HTML, so they are read after it.
    setElements(found);
  }, [ref, html, selector]);
  return elements;
}

function MountedDemo({ id, props }) {
  const module = use(loadDemo(id));
  return <DemoFrame entry={demoEntry(id)} module={module} props={props} />;
}
