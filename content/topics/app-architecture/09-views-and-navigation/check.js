export default async function check({ document, wait }) {
  const navButton = (view) => document.querySelector(`nav button[data-view="${view}"]`);
  const title = () => document.querySelector("#view-title")?.textContent.trim();
  const message = () => document.querySelector("#message")?.textContent.trim();
  const form = document.querySelector("#search-form");
  const current = (view) => navButton(view)?.getAttribute("aria-current") === "page";

  const browseTitleAtStart = title();
  const browseCurrentAtStart = current("browse") && !current("bookmarks");

  navButton("bookmarks")?.click();
  await wait(50);
  const shelfTitle = title();
  const shelfMessage = message();
  const formHiddenOnShelf = form?.hidden === true;
  const shelfCurrent = current("bookmarks") && !current("browse");
  const savedCards = document.querySelectorAll("#results .book-card").length;
  const shelfMessageMatches =
    savedCards === 0 ? shelfMessage === "No bookmarks yet. Browse and save a book first." : shelfMessage === `${savedCards} saved books.`;
  const focusOnTitle = document.activeElement === document.querySelector("#view-title");

  navButton("browse")?.click();
  await wait(50);
  const browseTitleAfter = title();
  const formVisibleAfter = form?.hidden === false;
  const browseCurrentAfter = current("browse") && !current("bookmarks");

  return [
    {
      id: "bookmarks-view",
      title: "The Bookmarks button shows the shelf and hides the form",
      pass: shelfTitle === "Your reading shelf." && formHiddenOnShelf && shelfMessageMatches && focusOnTitle,
      hint: `After clicking Bookmarks the heading reads "${shelfTitle}", the form is ${formHiddenOnShelf ? "hidden" : "visible"}, and the message reads "${shelfMessage}". The nav listener should call setState({ view }) and focus the heading, and render should apply bookmarksView.`
    },
    {
      id: "browse-view-returns",
      title: "The Browse button brings the search screen back",
      pass: browseTitleAtStart === "Find your next read." && browseTitleAfter === "Find your next read." && formVisibleAfter,
      hint: `After clicking Browse the heading reads "${browseTitleAfter}" and the form is ${formVisibleAfter ? "visible" : "hidden"}. render should set form.hidden from state.view and apply browseView.`
    },
    {
      id: "current-button-marked",
      title: "aria-current follows the view on the navigation buttons",
      pass: browseCurrentAtStart && shelfCurrent && browseCurrentAfter,
      hint: "In render, loop over the nav buttons and set aria-current=\"page\" on the one whose data-view equals state.view, removing it from the other."
    }
  ];
}
