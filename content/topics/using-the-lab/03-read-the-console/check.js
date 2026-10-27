const LOADED = "App.jsx ran once, when the page loaded.";
const CLICKED = "The button was clicked.";

export default async function check({ document, console, wait }) {
  const logs = () => console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const loads = logs().filter((text) => text === LOADED).length;
  const button = [...document.querySelectorAll("main button")].find(
    (candidate) => candidate.textContent.trim() === "Say hello to the console"
  );
  const before = logs().filter((text) => text === CLICKED).length;
  button?.click();
  await wait(50);
  const after = logs().filter((text) => text === CLICKED).length;

  return [
    {
      id: "load-message-once",
      title: "The load message is printed once per run",
      pass: loads === 1,
      hint:
        loads === 0
          ? `The console has no line that reads ${LOADED} Type the first card above export default function App() and run.`
          : `The load message appears ${loads} times. Keep exactly one console.log above export.`
    },
    {
      id: "button-renders",
      title: "The page has a Say hello to the console button",
      pass: button !== undefined && button.previousElementSibling?.matches("ul.plan") === true,
      hint: "Add the button line after the closing </ul> tag, inside main."
    },
    {
      id: "click-message",
      title: "A click prints The button was clicked.",
      pass: button !== undefined && after === before + 1,
      hint: button
        ? "The checks clicked the button and nothing was printed. The handler should call console.log, spelled in full, and the button needs onClick={handleClick}."
        : "There is no button to click yet."
    }
  ];
}
