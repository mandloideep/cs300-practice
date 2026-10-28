export default async function check({ document }) {
  const heading = document.querySelector("main h1");
  const paragraph = document.querySelector("main p");
  const items = [...document.querySelectorAll("main ul.plan li")].map((item) => item.textContent.trim());

  return [
    {
      id: "heading-kept",
      title: "The heading still reads My first week in CS300",
      pass: heading?.textContent.trim() === "My first week in CS300",
      hint: "Neither edit changes the h1 line; if it changed, press Reset to starter and type the two edits again."
    },
    {
      id: "paragraph-changed",
      title: "The sentence is the new one",
      pass: paragraph?.textContent.trim() === "This page is a small React app, and I just changed it.",
      hint: "Replace the whole p line with the line in the first card, then press Run."
    },
    {
      id: "plan-listed",
      title: "A list of three items follows the sentence",
      pass:
        items.length === 3 &&
        items[0] === "Read the explanation" &&
        items[2] === "Run and look" &&
        paragraph?.nextElementSibling?.matches("ul.plan") === true,
      hint: `The page has ${items.length} list item(s). Type the ul with className="plan" and its three li lines after the p line.`
    }
  ];
}
