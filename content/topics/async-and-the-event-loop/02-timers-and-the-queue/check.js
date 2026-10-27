export default async function check({ console, wait }) {
  const lines = () => console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const find = (label) => lines().findIndex((line) => line.startsWith(`${label} after `));
  const ms = (label) => Number(lines()[find(label)]?.match(/after (\d+) ms$/)?.[1]);
  for (let i = 0; i < 60 && find("Flashcards done") === -1; i++) await wait(50);
  await wait(150);

  const set = find("Timers set");
  const reading = find("Reading done");
  const flashcards = find("Flashcards done");
  const finished = find("Long calculation finished");

  return [
    {
      id: "delay-order",
      title: "The timers run in the order of their delays, after the script",
      pass: set !== -1 && reading > set && flashcards > reading,
      hint:
        reading === -1
          ? 'Set the three timers with setTimeout(() => stamp("..."), delay) and then stamp("Timers set").'
          : "Reading done (100 ms) should print before Flashcards done (200 ms), and both after Timers set."
    },
    {
      id: "timers-wait-for-the-stack",
      title: "The overdue timers wait until the long calculation ends",
      pass: finished !== -1 && reading > finished && ms("Reading done") >= 240,
      hint:
        finished === -1
          ? 'Add the busy loop that runs until Date.now() passes busyUntil, then stamp("Long calculation finished").'
          : `Reading done printed after ${ms("Reading done")} ms. The busy loop should keep the stack busy for 250 ms after the timers are set.`
    },
    {
      id: "break-cancelled",
      title: "The break timer is cancelled and never fires",
      pass: find("Break skipped") !== -1 && find("Break over") === -1,
      hint:
        find("Break over") !== -1
          ? "Break over still printed. Keep the id from setTimeout in breakTimer and pass it to clearTimeout."
          : 'After the loop, call clearTimeout(breakTimer) and stamp("Break skipped").'
    }
  ];
}
