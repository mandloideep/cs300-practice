export default async function check({ document, console, wait }) {
  const words = () =>
    console.filter((entry) => /^(Start|End|X|Y|Z)$/.test(entry.text)).map((entry) => entry.text);
  for (let elapsed = 0; elapsed < 3000 && !words().includes("Z"); elapsed += 100) {
    await wait(100);
  }
  const order = words().join(" ");
  const status = document.querySelector("#status")?.textContent.trim();
  return [
    {
      id: "order-is-start-x-end-y-z",
      title: "The console shows Start, X, End, Y, Z in that order",
      pass: order === "Start X End Y Z",
      hint: `The console shows "${order}". demo should log X, await delay(1000), then log Y and Z, and it should be called between Start and End.`
    },
    {
      id: "status-after-the-wait",
      title: "The status line changes after the wait",
      pass: status === "The wait is over.",
      hint: `The status line reads "${status}". Set status.textContent to "The wait is over." after the await in demo.`
    }
  ];
}
