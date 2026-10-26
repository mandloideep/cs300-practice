export default async function check({ document, inspector }) {
  const root = document.querySelector("#root");
  const greetings = root ? [...root.querySelectorAll("h2")] : [];
  const heading = root ? root.querySelector("h1") : null;
  const greetingCount = inspector.components.filter((component) => component.name === "Greeting").length;

  return [
    {
      id: "three-greetings",
      title: "Three greetings render under the new heading",
      pass:
        Boolean(heading) &&
        heading.textContent.trim() === "My first component" &&
        greetings.length === 3 &&
        greetings.every((greeting) => greeting.textContent.trim() === "Hello, welcome to our site!"),
      hint: "Replace the h1 in App.jsx with <h1>My first component</h1> followed by three <Greeting /> lines, and make Greeting return the h2."
    },
    {
      id: "greeting-components",
      title: "The inspector shows three Greeting components",
      pass: greetingCount === 3,
      hint: "Import Greeting from \"./Greeting.jsx\" in App.jsx and use it as <Greeting />, with a capital G, three times."
    },
    {
      id: "counter-still-works",
      title: "The counter still counts",
      pass: /Count is \d+/.test(root ? root.textContent : ""),
      hint: "The button should still read Count is followed by a number. Compare App.jsx with the review panel if it disappeared."
    }
  ];
}
