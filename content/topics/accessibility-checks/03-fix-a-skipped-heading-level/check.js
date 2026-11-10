export default async function check({ document, wait }) {
  const navLink = (path) => document.querySelector(`nav a[href="${path}"]`);

  navLink("/products")?.click();
  await wait(150);
  const headings = [...document.querySelectorAll("main h1, main h2, main h3, main h4, main h5, main h6")];
  const levels = headings.map((heading) => Number(heading.tagName.slice(1)));
  const skip = levels.findIndex((level, index) => index > 0 && level > levels[index - 1] + 1);
  const sections = [...document.querySelectorAll("main section")];
  const unnamed = sections.filter((section) => {
    const target = document.getElementById(section.getAttribute("aria-labelledby") ?? "");
    return !target || !/^H[1-6]$/.test(target.tagName) || target.textContent.trim() === "";
  });

  navLink("/")?.click();
  await wait(100);

  return [
    {
      id: "headings-do-not-skip",
      title: "The Products page's headings go down one level at a time",
      pass: levels[0] === 1 && levels.filter((level) => level === 1).length === 1 && skip === -1 && levels.length > 1,
      hint:
        skip !== -1
          ? `The headings go ${levels.map((level) => "h" + level).join(", ")}; h${levels[skip - 1]} is followed by h${levels[skip]}. Make the category headings h2.`
          : `The headings go ${levels.map((level) => "h" + level).join(", ") || "nowhere"}. The page needs one h1 followed by an h2 for each category.`
    },
    {
      id: "sections-are-named",
      title: "Each category section is named by its own heading",
      pass: sections.length > 0 && unnamed.length === 0,
      hint:
        sections.length === 0
          ? "The Products page has no section elements. Keep one section per category."
          : "A section has no name. Give its h2 an id and put the same value in the section's aria-labelledby."
    }
  ];
}
