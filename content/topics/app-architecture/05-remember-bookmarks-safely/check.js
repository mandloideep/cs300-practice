function stored() {
  const text = localStorage.getItem("coursehub-bookmarks");
  if (text === null) return [];
  try {
    const value = JSON.parse(text);
    return Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

export default async function check({ document, wait }) {
  const buttons = () => [...document.querySelectorAll("#results button[data-action='bookmark']")];
  const warning = document.querySelector("#storage-warning");
  const pressedAtStart = buttons().filter((button) => button.getAttribute("aria-pressed") === "true").length;
  const storedAtStart = stored();
  const loadMatches = storedAtStart !== null && storedAtStart.length === pressedAtStart;

  const first = buttons().find((button) => button.getAttribute("aria-pressed") === "false");
  const id = first?.dataset.id;
  first?.click();
  await wait(50);
  const afterSave = stored();
  const saved = afterSave !== null && afterSave.some((book) => book.id === id);
  const warningHidden = warning !== null && warning.hidden === true && warning.textContent === "";
  buttons().find((button) => button.dataset.id === id)?.click();
  await wait(50);
  const afterRemove = stored();
  const removed = afterRemove !== null && !afterRemove.some((book) => book.id === id);

  return [
    {
      id: "save-on-change",
      title: "Saving and removing a bookmark writes the array to storage",
      pass: saved && removed,
      hint: saved
        ? "After removing the bookmark the stored array still holds the book. saveBookmarks(bookmarks) should run after every change, before renderBooks."
        : "After saving a book the stored JSON under coursehub-bookmarks does not include it. Call saveBookmarks(bookmarks) in the click listener."
    },
    {
      id: "warning-hidden-after-save",
      title: "The storage warning stays hidden after a successful save",
      pass: warningHidden,
      hint: warning === null
        ? "index.html needs the p#storage-warning paragraph with the hidden attribute after the form."
        : "A successful save should call showStorageWarning(\"\") so the paragraph is hidden again."
    },
    {
      id: "load-on-start",
      title: "The pressed buttons on load match the stored bookmarks",
      pass: loadMatches,
      hint: "On load, bookmarks should come from loadBookmarks(), which returns the stored array or [] when nothing valid is stored."
    }
  ];
}
