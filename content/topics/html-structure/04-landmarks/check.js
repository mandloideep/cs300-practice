export default async function check({ document }) {
  const count = (selector) => document.querySelectorAll(`body ${selector}`).length;
  const landmarks = { header: count("header"), nav: count("nav"), main: count("main"), footer: count("footer") };
  const navInHeader = Boolean(document.querySelector("body header nav"));
  const sections = [...document.querySelectorAll("body main > section")];
  const sectionsStartWithHeading = sections.every((section) => section.firstElementChild?.tagName === "H2");
  const divs = count("div");

  const missing = Object.entries(landmarks)
    .filter(([, n]) => n !== 1)
    .map(([name, n]) => `${n} ${name}`);

  return [
    {
      id: "four-landmarks",
      title: "One header with the nav inside it, one main, and one footer",
      pass: missing.length === 0 && navInHeader,
      hint:
        missing.length > 0
          ? `The page has ${missing.join(", ")}; each landmark should appear exactly once.`
          : "The nav sits outside the header; the links block belongs inside the top block."
    },
    {
      id: "three-sections",
      title: "Three sections inside main, each starting with an h2",
      pass: sections.length === 3 && sectionsStartWithHeading,
      hint: `main holds ${sections.length} section(s) as direct children. Each of the three groups becomes a <section> whose first element is its <h2>.`
    },
    {
      id: "no-wrapper-divs",
      title: "No div is left on the page",
      pass: divs === 0,
      hint: `${divs} div element(s) remain. Every div on this page has a landmark that says what it is.`
    }
  ];
}
