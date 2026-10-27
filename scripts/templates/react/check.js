export default async function check({ document, inspector }) {
  const heading = document.querySelector("main h1");
  const paragraph = document.querySelector("main p");
  const app = inspector.components.find((component) => component.name === "App");

  return [
    {
      id: "app-renders",
      title: "App renders the heading",
      pass: app !== undefined && heading !== null && heading.textContent.trim() !== "",
      hint: "App should return a main element with an h1 inside it."
    },
    {
      id: "paragraph-renders",
      title: "A paragraph follows the heading",
      pass: paragraph !== null && paragraph.textContent.includes("first edit block"),
      hint: "Add the p element inside main, after the h1 and before the closing main tag."
    }
  ];
}
