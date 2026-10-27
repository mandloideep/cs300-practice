export default async function check({ document, console: entries, wait }) {
  const heading = () => document.querySelector("main h1")?.textContent.trim() ?? "";
  const navLink = (path) => document.querySelector(`nav a[href="${path}"]`);
  const unmatched = () => entries.filter((entry) => /No routes matched/.test(entry.text)).length;

  const warningsBefore = unmatched();
  navLink("/deals")?.click();
  await wait(100);
  const notFoundHeading = heading();
  const homeLink = document.querySelector('main a[href="/"]');
  const warningsAfter = unmatched();

  homeLink?.click();
  await wait(100);
  const homeHeading = heading();

  return [
    {
      id: "unknown-address-shows-not-found",
      title: "An address that matches no route renders NotFoundPage",
      pass: notFoundHeading === "Page not found",
      hint:
        notFoundHeading === ""
          ? "Pressing Deals shows nothing. Add a Route with path \"*\" that renders NotFoundPage."
          : `Pressing Deals shows "${notFoundHeading}" instead of the not-found page.`
    },
    {
      id: "not-found-links-home",
      title: "The not-found page links to the home page",
      pass: Boolean(homeLink) && homeHeading === "Welcome to the shop",
      hint: "NotFoundPage should hold a Link to /, and pressing it should render the home page."
    },
    {
      id: "no-unmatched-warning",
      title: "The router no longer warns about an unmatched location",
      pass: warningsAfter === warningsBefore,
      hint: "The console still warns No routes matched. The \"*\" route should be inside Routes so that every address matches something."
    }
  ];
}
