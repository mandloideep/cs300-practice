export default async function check({ document, console, wait }) {
  const logs = () => console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const shown = () => /Bottles of cooking oil: (\d+)/.exec(document.querySelector(".count")?.textContent ?? "")?.[1] ?? null;
  const start = shown();
  const from = logs().length;
  const button = [...document.querySelectorAll("button")].find(
    (candidate) => candidate.textContent.trim() === "Add a bottle"
  );
  button?.click();
  const later = `After a timer, the page shows Bottles of cooking oil: ${Number(start) + 1}`;
  for (let i = 0; i < 40 && !logs().slice(from).includes(later); i++) await wait(50);
  const lines = logs().slice(from);
  const inHandler = lines.indexOf(`In the handler, the page shows Bottles of cooking oil: ${start}`);
  const afterTimer = lines.indexOf(later);

  return [
    {
      id: "handler-sees-the-old-count",
      title: "Inside the handler, count is still the value of this render",
      pass: start !== null && lines.includes(`In the handler, count is ${start}`),
      hint: "Keep the console.log of count right after the two setters; it prints the count from before the click."
    },
    {
      id: "page-not-yet-updated",
      title: "Inside the handler, the page still shows the old count",
      pass: inHandler !== -1,
      hint: 'After the first log, log "In the handler, the page shows" with document.querySelector(".count").textContent.'
    },
    {
      id: "timer-sees-the-new-page",
      title: "A timer started in the handler sees the updated page",
      pass: afterTimer > inHandler && inHandler !== -1,
      hint: 'Start a setTimeout with a delay of 0 in the handler and log "After a timer, the page shows" with the same textContent.'
    }
  ];
}
