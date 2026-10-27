function stored() {
  try {
    const value = JSON.parse(localStorage.getItem("project-browser"));
    return Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

function guardSubmits(document) {
  const guard = (event) => {
    if (!event.defaultPrevented) event.preventDefault();
  };
  document.addEventListener("submit", guard);
  return () => document.removeEventListener("submit", guard);
}

export default async function check({ document, wait }) {
  const form = document.querySelector("#add-form");
  const input = document.querySelector("#new-title");
  const items = () => [...document.querySelectorAll("#project-list li")];
  const release = guardSubmits(document);
  const titles = () => items().map((item) => item.querySelector(".title")?.textContent);
  const matches = (saved) => saved !== null && saved.map((project) => project.title).join("|") === titles().join("|");

  input.value = "Check project";
  form?.requestSubmit();
  await wait(50);
  const afterAdd = stored();
  const addMatches = matches(afterAdd) && afterAdd.some((project) => project.title === "Check project");

  items()
    .find((item) => item.querySelector(".title")?.textContent === "Check project")
    ?.querySelector("button.remove")
    ?.click();
  await wait(50);
  const afterRemove = stored();
  const removeMatches = matches(afterRemove) && !afterRemove.some((project) => project.title === "Check project");
  release();

  return [
    {
      id: "storage-matches-the-list",
      title: "The stored JSON is an array of the projects on the page",
      pass: afterRemove !== null && matches(afterRemove),
      hint: "localStorage should hold the projects array as JSON under the key project-browser. Save with localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))."
    },
    {
      id: "add-saves",
      title: "Adding a project saves the new list",
      pass: addMatches,
      hint: "After a submit the stored array should include the new project. Call saveProjects() right after projects.push."
    },
    {
      id: "remove-saves",
      title: "Removing a project saves the new list",
      pass: removeMatches,
      hint: "After a removal the stored array should no longer include the project. Call saveProjects() right after projects.splice."
    }
  ];
}
