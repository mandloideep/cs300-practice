export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);

  return [
    {
      id: "slice-copies-a-range",
      title: "slice copies the first three and the last two and leaves the queue alone",
      pass:
        has('First three: ["Alice","Bob","Charlie"]') &&
        has('Last two: ["Diana","Eve"]') &&
        has('queue after slice: ["Alice","Bob","Charlie","Diana","Eve"]'),
      hint: "Log queue.slice(0, 3), queue.slice(-2), and then queue itself."
    },
    {
      id: "splice-removes-in-place",
      title: "splice removes Bob and Charlie from the queue and returns them",
      pass: has('Helped: ["Bob","Charlie"]') && has('queue after splice: ["Alice","Diana","Eve"]'),
      hint: "Call queue.splice(1, 2), log what it returned as \"Helped:\", then log queue."
    },
    {
      id: "splice-inserts",
      title: "splice with a count of 0 inserts Frank at index 1",
      pass: has('Frank joins: ["Alice","Frank","Diana","Eve"]'),
      hint: "Call queue.splice(1, 0, \"Frank\") and log queue as \"Frank joins:\"."
    },
    {
      id: "to-spliced-copies",
      title: "toSpliced returns the queue without Alice and leaves the queue alone",
      pass:
        has('Next up: ["Frank","Diana","Eve"]') &&
        has('queue unchanged: ["Alice","Frank","Diana","Eve"]'),
      hint: "Make afterAlice with queue.toSpliced(0, 1), then log it and queue."
    }
  ];
}
