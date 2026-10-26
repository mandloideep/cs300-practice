export default async function check({ document, inspector, wait }) {
  const app = inspector.components.find((component) => component.name === "App");
  const sentence = () => document.querySelector(".viewport")?.textContent.trim() ?? null;
  const realWidth = window.innerWidth;
  const atStart = sentence();

  const original = Object.getOwnPropertyDescriptor(window, "innerWidth");
  let pretended = null;
  try {
    Object.defineProperty(window, "innerWidth", { value: 777, configurable: true, writable: true });
    window.dispatchEvent(new Event("resize"));
    await wait(100);
    pretended = sentence();
  } finally {
    if (original) Object.defineProperty(window, "innerWidth", original);
    else delete window.innerWidth;
    window.dispatchEvent(new Event("resize"));
    await wait(100);
  }

  return [
    {
      id: "width-shown",
      title: "The sentence shows the window width",
      pass: atStart !== null && atStart.includes(`${realWidth}px`),
      hint:
        atStart === null
          ? "No viewport paragraph is on the page. Render it under the lead sentence from the width state."
          : `The sentence reads "${atStart}" while the window is ${realWidth}px wide. Start the state from window.innerWidth.`
    },
    {
      id: "width-follows-resize",
      title: "A resize event updates the sentence",
      pass: pretended !== null && pretended.includes("777px") && pretended.includes("sit in a grid"),
      hint: `With the window pretending to be 777px wide and a resize event fired, the sentence read "${pretended}". Add a resize listener in an effect that calls setWidth(window.innerWidth), and remove it in the cleanup.`
    },
    {
      id: "width-is-state",
      title: "The width is state on App",
      pass: app?.state.length === 4,
      hint: `The inspector sees ${app?.state.length ?? 0} state value(s) on App; category, items, savedAt, and width make four. Keep the width in useState so that a change renders the sentence.`
    }
  ];
}
