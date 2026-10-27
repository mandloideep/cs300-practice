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
  const list = document.querySelector("#project-list");
  const items = () => [...document.querySelectorAll("#project-list li")];
  const status = () => document.querySelector("#status")?.textContent.trim();
  const release = guardSubmits(document);

  const countAtStart = items().length;
  const buttonsAtStart = items().filter((item) => item.querySelector("button.remove")).length;
  const allTypeButton = items().every((item) => item.querySelector("button.remove")?.type === "button");

  input.value = "Check project";
  form?.requestSubmit();
  await wait(50);
  const added = items().find((item) => item.querySelector(".title")?.textContent === "Check project");
  const countAfterAdd = items().length;
  added?.querySelector("button.remove")?.click();
  await wait(50);
  const stillThere = items().some((item) => item.querySelector(".title")?.textContent === "Check project");
  const countAfterRemove = items().length;
  const statusAfterRemove = status();
  release();

  return [
    {
      id: "remove-button-on-every-item",
      title: "Every item has a Remove button of type button",
      pass: countAtStart > 0 && buttonsAtStart === countAtStart && allTypeButton,
      hint: "Each li should contain a button.remove with type set to \"button\", created in renderProjects and appended with the two spans."
    },
    {
      id: "one-listener-on-the-list",
      title: "Clicking Remove takes the project out of the array and the list",
      pass: added !== undefined && !stillThere && countAfterRemove === countAfterAdd - 1 && statusAfterRemove === `${countAfterRemove} of ${countAfterRemove} projects shown.`,
      hint:
        added === undefined
          ? "The form from Step 5 should still add a project; the check could not add one to remove."
          : stillThere
            ? "Clicking the Remove button did not remove the item. Listen for click on the list, find the button with event.target.closest(\".remove\"), splice the project out of the array, and call renderProjects."
            : `After the removal the status reads "${statusAfterRemove}"; renderProjects should write the count from the array, so the array and the page agree.`
    },
    {
      id: "works-for-added-items",
      title: "The listener works for an item added after the script ran",
      pass: list !== null && added !== undefined && !stillThere,
      hint: "A project added with the form should be removable by its own button without any new listener, because the one listener lives on the list."
    }
  ];
}
