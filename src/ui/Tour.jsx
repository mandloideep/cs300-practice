import { useEffect, useLayoutEffect, useRef } from "react";
import { getProgress, markTour } from "../progress/store.js";
import Dialog from "./Dialog.jsx";
import { closeTour, offerTour, openTour, showStop, useTour } from "./tourStore.js";

// The step-page tour of docs/CONTRACTS.md section 7.6: five stops, each a dialog at the bottom of
// the window that scrolls one part of the page to the top and outlines it, with Back, Next, and
// Skip. It opens on its own on the
// first edit step a browser visits, until finishing or skipping it stores the date in progress,
// and the header's Tour button opens it again. Automated browsers (navigator.webdriver) are not
// interrupted by the automatic opening, so that scripted runs of the site see the page itself.
export const STOPS = [
  {
    targets: [".pane--explanation"],
    title: "The explanation",
    text: "Start here. It says what the step builds, shows the idea moving, and lists the edits to type, each with a sentence that says why.",
  },
  {
    targets: [".pane--editor"],
    title: "The editor",
    text: "Type the edits into these files, one tab per file. Your changes are kept in this browser, and Reset to starter brings the original back.",
  },
  {
    targets: [".pane--editor .toolbar .button--primary"],
    title: "Run",
    text: "Run compiles your files and loads the page fresh. Inside the editor, Ctrl+Enter or ⌘+Enter does the same.",
  },
  {
    targets: [".pane--result"],
    title: "The result",
    text: "Your code running as a real page. Look here after every run, and click and type in it like any page.",
  },
  {
    targets: [".pane--console", ".pane--checks"],
    title: "The console and the checks",
    text: "The console shows what your code logged and any error, with a link to its line. The checks say what the step expects; when every one passes, the step is complete.",
  },
];

// Mounted by an edit step: offers the tour to the header and opens it once per browser.
export default function Tour() {
  const { open, stop } = useTour();

  useEffect(() => {
    const withdraw = offerTour();
    const automated = typeof navigator !== "undefined" && navigator.webdriver;
    const frame = requestAnimationFrame(() => {
      if (!getProgress().tour.stepPage && !automated) openTour();
    });
    return () => {
      cancelAnimationFrame(frame);
      withdraw();
    };
  }, []);

  return <TourDialog open={open} stop={Math.min(stop, STOPS.length - 1)} />;
}

// Stays mounted while the step page is, so that Dialog closes the native dialog itself and the
// browser returns focus to the control that opened it.
function TourDialog({ open, stop }) {
  const current = STOPS[stop];
  const last = stop === STOPS.length - 1;
  const nextRef = useRef(null);

  useLayoutEffect(() => {
    if (!open) return undefined;
    const elements = current.targets.flatMap((selector) => [
      ...document.querySelectorAll(selector),
    ]);
    elements.forEach((element) => element.classList.add("tour-target"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    elements[0]?.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
    return () => elements.forEach((element) => element.classList.remove("tour-target"));
  }, [open, current]);

  useEffect(() => {
    if (open) nextRef.current?.focus();
  }, [open, stop]);

  function finish() {
    markTour("stepPage");
    closeTour();
  }

  return (
    <Dialog
      open={open}
      onClose={finish}
      title="Tour of the step page"
      className="tour-dialog"
      actions={
        <>
          <button
            ref={nextRef}
            type="button"
            className="button button--primary"
            onClick={last ? finish : () => showStop(stop + 1)}
          >
            {last ? "Finish" : "Next"}
          </button>
          {stop > 0 && (
            <button type="button" className="button" onClick={() => showStop(stop - 1)}>
              Back
            </button>
          )}
          {!last && (
            <button
              type="button"
              className="button button--quiet tour-dialog__skip"
              onClick={finish}
            >
              Skip the tour
            </button>
          )}
        </>
      }
    >
      <div className="tour-dialog__stop" aria-live="polite">
        <p className="eyebrow">
          Stop {stop + 1} of {STOPS.length}
        </p>
        <h3>{current.title}</h3>
        <p>{current.text}</p>
      </div>
    </Dialog>
  );
}
