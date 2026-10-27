function guardSubmits(document) {
  const prevented = [];
  const guard = (event) => {
    prevented.push(event.defaultPrevented);
    if (!event.defaultPrevented) event.preventDefault();
  };
  document.addEventListener("submit", guard);
  return { prevented, release: () => document.removeEventListener("submit", guard) };
}

export default async function check({ document, console, wait }) {
  const form = document.querySelector("#add-form");
  const input = document.querySelector("#new-title");
  const status = () => document.querySelector("#status")?.textContent.trim();
  const items = () => [...document.querySelectorAll("#project-list li")];
  const mainLogs = () => console.filter((entry) => entry.text === "main heard a submit from add-form").length;
  const guard = guardSubmits(document);

  const countAtStart = items().length;
  const logsAtStart = mainLogs();

  input.value = "   ";
  form?.requestSubmit();
  await wait(50);
  const countAfterEmpty = items().length;
  const statusAfterEmpty = status();

  input.value = "Check project";
  form?.requestSubmit();
  await wait(50);
  const added = items().find((item) => item.querySelector(".title")?.textContent === "Check project");
  const countAfterAdd = items().length;
  const statusAfterAdd = status();
  const fieldAfterAdd = input.value;
  const logsAfterAdd = mainLogs();
  added?.remove();
  guard.release();

  return [
    {
      id: "submit-is-prevented",
      title: "The submit listener prevents the page reload",
      pass: guard.prevented.length === 2 && guard.prevented.every(Boolean),
      hint: "The form's default action still runs on submit. Call event.preventDefault() as the first line of the submit listener."
    },
    {
      id: "submit-adds-a-project",
      title: "A submitted title is added to the list and an empty one is refused",
      pass:
        countAfterEmpty === countAtStart &&
        statusAfterEmpty === "Type a project title first." &&
        added !== undefined &&
        countAfterAdd === countAtStart + 1 &&
        statusAfterAdd === `${countAtStart + 1} of ${countAtStart + 1} projects shown.` &&
        fieldAfterAdd === "",
      hint:
        countAfterEmpty !== countAtStart || statusAfterEmpty !== "Type a project title first."
          ? "Submitting spaces should add nothing and set the status to Type a project title first.; trim the value and return early when it is empty."
          : added === undefined
            ? "Submitting a title should push an object onto projects and call renderProjects so a new li appears."
            : "After a submit the status should count the new project and form.reset() should clear the field."
    },
    {
      id: "submit-bubbles-to-main",
      title: "The submit bubbles up to the listener on main",
      pass: logsAfterAdd >= logsAtStart + 2,
      hint: 'The console should show "main heard a submit from add-form" once per submit. Add a submit listener on the main element that logs event.target.id.'
    }
  ];
}
