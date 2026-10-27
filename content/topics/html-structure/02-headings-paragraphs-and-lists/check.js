export default async function check({ document }) {
  const h1s = document.querySelectorAll("body h1").length;
  const h2s = document.querySelectorAll("body h2").length;
  const deeper = document.querySelectorAll("body h3, body h4, body h5, body h6").length;
  const strong = document.querySelector("body p strong");
  const bullets = document.querySelector("body ul");
  const bulletItems = bullets ? bullets.querySelectorAll(":scope > li").length : 0;
  const numbered = document.querySelector("body ol");
  const numberedItems = numbered ? numbered.querySelectorAll(":scope > li").length : 0;

  return [
    {
      id: "heading-outline",
      title: "One h1, two h2 sections, and an important word in a paragraph",
      pass: h1s === 1 && h2s === 2 && deeper === 0 && Boolean(strong),
      hint:
        h1s !== 1 || h2s !== 2 || deeper > 0
          ? `The page has ${h1s} h1, ${h2s} h2, and ${deeper} deeper heading(s). It should have one h1 and two h2, with no other levels.`
          : "Wrap the word everyone in <strong> inside the second paragraph."
    },
    {
      id: "bullet-list",
      title: "A bulleted list with three meeting times",
      pass: bulletItems === 3,
      hint: `The ul has ${bulletItems} li item(s). Add the three meetings as <li> elements inside <ul>.`
    },
    {
      id: "numbered-steps",
      title: "A numbered list with three steps",
      pass: numberedItems === 3,
      hint: `The ol has ${numberedItems} li item(s). Add the three steps as <li> elements inside <ol>.`
    }
  ];
}
