export default async function check({ document, wait }) {
  const buttons = () => [...document.querySelectorAll("#results button[data-action='bookmark']")];
  const cards = document.querySelectorAll("#results .book-card").length;
  const allUnpressed = buttons().every((button) => button.getAttribute("aria-pressed") === "false" && button.textContent.trim() === "Bookmark");

  const first = buttons()[0];
  const id = first?.dataset.id;
  first?.querySelector("span")?.click();
  await wait(50);
  const afterClick = buttons().find((button) => button.dataset.id === id);
  const pressed = afterClick?.getAttribute("aria-pressed") === "true" && afterClick.textContent.trim() === "Saved - remove";
  const focused = afterClick !== undefined && document.activeElement === afterClick;
  afterClick?.click();
  await wait(50);
  const afterSecondClick = buttons().find((button) => button.dataset.id === id);
  const released = afterSecondClick?.getAttribute("aria-pressed") === "false";

  return [
    {
      id: "every-card-has-a-button",
      title: "Every card has an unpressed Bookmark button with a data-id",
      pass: cards > 0 && buttons().length === cards && allUnpressed && buttons().every((button) => button.dataset.id),
      hint: "bookCard should return a button with type=\"button\", data-action=\"bookmark\", data-id, aria-pressed, and the text Bookmark when saved is false."
    },
    {
      id: "click-toggles-saved",
      title: "A click saves the book and a second click removes it",
      pass: pressed && released,
      hint: pressed
        ? "The second click did not release the button. When the book is already saved, filter it out of bookmarks and render again."
        : "Clicking the span inside the button did not mark the book saved. Listen for click on app, find the button with closest, add the book to bookmarks, and call renderBooks(shownBooks)."
    },
    {
      id: "focus-stays-on-the-card",
      title: "After the re-render the focus is on the replacement button",
      pass: focused,
      hint: "After renderBooks replaces the cards, find the button with the same data-id among the new buttons and call focus() on it."
    }
  ];
}
