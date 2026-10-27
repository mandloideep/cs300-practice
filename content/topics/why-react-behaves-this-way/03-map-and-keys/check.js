function rows(document) {
  return [...document.querySelectorAll(".task-list li")].map((row) => ({
    title: row.querySelector("span")?.textContent.trim(),
    done: row.querySelector("button")?.getAttribute("aria-pressed") === "true",
    button: row.querySelector("button")
  }));
}

export default async function check({ document, inspector, wait }) {
  const keys = inspector.components.filter((component) => component.name === "TaskRow");
  const before = rows(document);
  before[0]?.button?.click();
  await wait(50);
  const marked = rows(document);
  const remove = [...document.querySelectorAll("button")].find(
    (candidate) => candidate.textContent.trim() === "Remove the first task"
  );
  remove?.click();
  await wait(50);
  const after = rows(document);

  return [
    {
      id: "three-rows",
      title: "The list starts with three TaskRow components",
      pass: before.length === 3 && keys.length === 3,
      hint: `The page shows ${before.length} row(s). Keep tasks.map rendering one TaskRow per task.`
    },
    {
      id: "mark-done-marks-one",
      title: "Mark done marks only the row it is in",
      pass: marked.length === 3 && marked[0].done && !marked[1].done && !marked[2].done,
      hint: "Each TaskRow keeps its own done state; the checks pressed Mark done on the first row only."
    },
    {
      id: "state-follows-the-task",
      title: "After the done task is removed, no remaining task shows as done",
      pass:
        after.length === 2 &&
        after[0].title === "Finish the cart lab" &&
        after.every((row) => !row.done),
      hint: after.some((row) => row.done)
        ? `"${after.find((row) => row.done).title}" shows as done, though nobody marked it. With key={index}, the first row's state stays with position 0; give each TaskRow key={task.id}.`
        : "Remove the first task should leave the other two tasks, starting with Finish the cart lab."
    }
  ];
}
