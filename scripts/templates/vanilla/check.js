export default async function check({ document, console }) {
  const heading = document.querySelector("main h1");
  const paragraph = document.querySelector("main p");
  const errors = console.filter((entry) => entry.level === "error");

  return [
    {
      id: "no-errors",
      title: "The script runs without an error",
      pass: errors.length === 0,
      hint: "Open the console and read the first error; it names the line that failed."
    },
    {
      id: "paragraph-renders",
      title: "A paragraph follows the heading",
      pass: heading !== null && paragraph !== null && paragraph.textContent.includes("first edit block"),
      hint: "Create the p element with document.createElement and append it to main."
    }
  ];
}
