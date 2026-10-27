export default async function check({ document, console }) {
  const status = document.querySelector("#status")?.textContent.trim();
  const items = [...document.querySelectorAll("#project-list li")];
  const doneItems = items.filter((item) => item.classList.contains("done"));
  const classLogged = console.some((entry) => entry.text === "first project classes: done");
  return [
    {
      id: "status-text",
      title: "The status line counts the finished projects",
      pass: status === "1 of 3 projects done.",
      hint: `The status line reads "${status}" but should read "1 of 3 projects done.". Set status.textContent from finished.length and projects.length.`
    },
    {
      id: "first-item-done",
      title: "The first project carries the done class",
      pass: items.length === 3 && items[0].classList.contains("done") && !items[1].classList.contains("done"),
      hint: "Only the first li should have the done class. Add it with projects[0].classList.add(\"done\")."
    },
    {
      id: "counts-the-done-items",
      title: "The done items are selected by class and logged",
      pass: doneItems.length === 1 && classLogged,
      hint: 'The console should show "first project classes: done", and document.querySelectorAll("#project-list li.done") should find exactly one item.'
    }
  ];
}
