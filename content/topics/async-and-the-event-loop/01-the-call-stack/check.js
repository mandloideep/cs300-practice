const NESTED = [
  "start placeOrder",
  "start prepare",
  "start pack",
  "end pack",
  "end prepare",
  "end placeOrder"
];

export default async function check({ console, wait }) {
  const lines = () => console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const shipStack = () => lines().find((line) => line.startsWith("Error: Stack inside ship") || /\bship\b.*@/.test(line));
  for (let i = 0; i < 40 && !lines().includes("start ship"); i++) await wait(50);
  for (let i = 0; i < 10 && !shipStack(); i++) await wait(50);

  const all = lines();
  const nested = all.filter((line) => NESTED.includes(line));
  const packStack = all.find((line) => /pack[\s\S]*\n[\s\S]*prepare[\s\S]*\n[\s\S]*placeOrder/.test(line));
  const ship = shipStack();

  return [
    {
      id: "last-in-first-out",
      title: "Each function ends before the function that called it",
      pass: nested.join(" / ") === NESTED.join(" / "),
      hint: `The start and end lines read: ${nested.join(", ") || "nothing"}. Each function should log start, make its call, then log end.`
    },
    {
      id: "stack-inside-pack",
      title: "The stack printed inside pack names pack, prepare, and placeOrder",
      pass: packStack !== undefined,
      hint: 'Inside pack, log new Error("Stack inside pack").stack, the stack property and not the error itself.'
    },
    {
      id: "ship-after-script",
      title: "The timer's ship runs after script done",
      pass: all.includes("script done") && all.indexOf("start ship") > all.indexOf("script done"),
      hint: all.includes("start ship")
        ? 'Log "script done" as the last line of the file; ship should still come after it.'
        : "Nothing printed start ship. Pass function ship() { ... } to setTimeout with a delay of 0, inside placeOrder."
    },
    {
      id: "ship-stack-alone",
      title: "The stack inside ship has ship and nothing under it",
      pass: ship !== undefined && /ship/.test(ship.replace("Stack inside ship", "")) && !/placeOrder|prepare/.test(ship),
      hint: ship
        ? "The stack inside ship still shows placeOrder, so ship was called directly. Hand the function to setTimeout instead of calling it."
        : 'Inside ship, log new Error("Stack inside ship").stack after "start ship".'
    }
  ];
}
