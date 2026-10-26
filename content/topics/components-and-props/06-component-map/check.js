export default async function check({ document, inspector }) {
  const names = inspector.components.map((component) => component.name);
  const count = (name) => names.filter((item) => item === name).length;
  const page = document.querySelector(".page");
  const order = page ? [...page.children].map((element) => element.tagName.toLowerCase()).join(" ") : "";
  return [
    {
      id: "header-and-footer",
      title: "SiteHeader and SiteFooter render",
      pass: count("SiteHeader") === 1 && count("SiteFooter") === 1,
      hint: `The inspector sees ${count("SiteHeader")} SiteHeader and ${count("SiteFooter")} SiteFooter. Import both files at the top of App.jsx and use each tag once.`
    },
    {
      id: "tree-matches-map",
      title: "The tree matches the component map",
      pass:
        names[0] === "App" &&
        names[1] === "SiteHeader" &&
        names[names.length - 1] === "SiteFooter" &&
        count("CourseCard") === 4 &&
        count("Card") === 5,
      hint: "The tree should read App, SiteHeader, four CourseCard components each holding a Card, the advising Card, then SiteFooter. Check where the two new tags sit inside App."
    },
    {
      id: "landmarks-in-order",
      title: "The page reads header, main, footer",
      pass: order === "header main footer" && /NEIU Computer Science/.test(document.querySelector("header")?.textContent ?? ""),
      hint: `The page wrapper contains: ${order || "nothing"}. Put <SiteHeader siteName="NEIU Computer Science" /> before <main> and <SiteFooter /> after </main>.`
    }
  ];
}
