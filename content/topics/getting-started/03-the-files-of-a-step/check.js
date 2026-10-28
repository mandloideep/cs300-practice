export default async function check({ document }) {
  const tips = [...document.querySelectorAll("main ul.tips li")].map((item) => item.textContent.trim());

  return [
    {
      id: "tips-kept",
      title: "The three starter tips are still listed",
      pass:
        tips[0] === "Read the explanation before you type." &&
        tips[1] === "Run after every edit." &&
        tips[2] === "Read the console when the result looks wrong.",
      hint: "The edit adds a line to src/tips.js and changes none of the others; if one changed, press Reset to starter and type the edit again."
    },
    {
      id: "tip-added",
      title: "A fourth tip says to open a file from the tree",
      pass: tips.length === 4 && tips[3] === "Open a file from the tree beside the code.",
      hint: `The page lists ${tips.length} tip(s). Open src/tips.js from the tree, add the line from the card after the third tip, and press Run.`
    }
  ];
}
