const EXPECTED = {
  1: ["1 sync", "1 microtask", "1 timer"],
  2: ["2 sync", "2 first then", "2 queueMicrotask", "2 second then", "2 timer"],
  3: ["3 microtask", "3 first timer", "3 microtask from the timer", "3 second timer", "3 timer from the microtask"],
  4: ["4 before await", "4 sync after the call", "4 after await", "4 timer"]
};

export default async function check({ console, wait }) {
  const lines = () => console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  for (let i = 0; i < 60 && !lines().includes("4 timer"); i++) await wait(50);
  await wait(50);
  const all = lines();

  const puzzle = (n) => {
    const actual = all.filter((line) => line.startsWith(`${n} `));
    return {
      title: `Puzzle ${n} prints its ${EXPECTED[n].length} lines in event loop order`,
      pass: actual.join(" / ") === EXPECTED[n].join(" / "),
      hint:
        actual.length === 0
          ? `Puzzle ${n} printed nothing. Add its function and start it with the setTimeout line at the end of the file.`
          : `Puzzle ${n} printed ${actual.join(", ")}. Compare its code with the step, line by line.`
    };
  };

  return [
    {
      id: "puzzle-one",
      ...puzzle(1)
    },
    {
      id: "puzzle-two",
      ...puzzle(2)
    },
    {
      id: "puzzle-three",
      ...puzzle(3)
    },
    {
      id: "puzzle-four",
      ...puzzle(4)
    }
  ];
}
