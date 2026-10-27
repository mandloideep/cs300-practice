export default async function check({ document, console, wait }) {
  const letters = () =>
    console.filter((entry) => /^[A-E]$/.test(entry.text)).map((entry) => entry.text);
  for (let elapsed = 0; elapsed < 3000 && !letters().includes("D"); elapsed += 100) {
    await wait(100);
  }
  const order = letters().join(" ");
  const status = document.querySelector("#status")?.textContent.trim();
  return [
    {
      id: "order-is-a-c-e-b-d",
      title: "The console shows A, C, E, B, D in that order",
      pass: order === "A C E B D",
      hint: `The console shows "${order}". Wrap B in a setTimeout with delay 0, add a setTimeout with delay 1000 for D after C, and log E after it.`
    },
    {
      id: "status-written-twice",
      title: "The status line is written by the script and again by the one second timer",
      pass: status === "The one second timer finished, long after the script.",
      hint: `The status line reads "${status}". The script should write "The script finished. Both timers are still waiting." and the D callback should replace it a second later.`
    }
  ];
}
