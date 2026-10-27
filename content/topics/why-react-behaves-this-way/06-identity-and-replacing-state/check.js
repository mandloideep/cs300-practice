export default async function check({ document, console, wait }) {
  const logs = () => console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const rows = () => document.querySelectorAll(".task-list li").length;
  const before = rows();
  const from = logs().length;
  [...document.querySelectorAll("button")]
    .find((candidate) => candidate.textContent.trim() === "Add the next item")
    ?.click();
  await wait(50);
  const after = rows();
  const lines = logs().slice(from);
  const lead = document.querySelector(".lead")?.textContent.trim();

  return [
    {
      id: "a-new-array",
      title: "The handler makes a new array instead of changing the old one",
      pass: lines.includes("Same array as before? false"),
      hint: 'Build const nextItems = [...items, next] and log "Same array as before?" with nextItems === items before calling setItems.'
    },
    {
      id: "page-shows-the-new-item",
      title: "One click adds one row to the page",
      pass: before === 1 && after === 2,
      hint: `The list went from ${before} to ${after} row(s). Pass the new array to setItems; React skips the render when it gets the same array back.`
    },
    {
      id: "count-follows",
      title: "The count above the list follows the array",
      pass: lead === `Items in the cart: ${after}` && lines.includes(`The new array holds ${after} items`),
      hint: 'After setItems(nextItems), log "The new array holds", nextItems.length, "items".'
    }
  ];
}
