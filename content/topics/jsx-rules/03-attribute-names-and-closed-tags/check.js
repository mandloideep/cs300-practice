function warns(console, name) {
  const pattern = new RegExp("\\b" + name + "\\b");
  return console.some((entry) => entry.text.includes("Invalid DOM property") && pattern.test(entry.text));
}

export default async function check({ document, console }) {
  const label = document.querySelector(".search label");
  const input = document.querySelector(".search input");

  return [
    {
      id: "no-class-warning",
      title: "The console has no Invalid DOM property warning for class",
      pass: !warns(console, "class"),
      hint: "The console shows Invalid DOM property `class`. Did you mean `className`? Write className=\"search\" on the div in FindConcept."
    },
    {
      id: "no-for-warning",
      title: "The console has no Invalid DOM property warning for for",
      pass: !warns(console, "for"),
      hint: "The console shows Invalid DOM property `for`. Did you mean `htmlFor`? Write htmlFor=\"concept-search\" on the label."
    },
    {
      id: "label-matches-input",
      title: "The label points at the search input",
      pass: Boolean(label) && Boolean(input) && label.htmlFor === input.id && input.id === "concept-search",
      hint: "The label's htmlFor and the input's id must both be concept-search, and both must sit inside the div with the search class."
    }
  ];
}
