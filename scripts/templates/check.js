export default async function check({ document }) {
  const heading = document.querySelector("main h1");

  return [
    {
      id: "heading-renders",
      title: "The page has a heading",
      pass: heading !== null && heading.textContent.trim() !== "",
      hint: "Keep the h1 inside main. Replace this check with two to four checks about what this step changes."
    }
  ];
}
