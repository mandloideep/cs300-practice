export default async function check({ document, console, inspector }) {
  const root = document.querySelector("#root");
  const outside = document.querySelector("#outside");
  const heading = root ? root.querySelector("h1") : null;

  return [
    {
      id: "outside-root",
      title: "index.html shows its own paragraph outside the root",
      pass: Boolean(outside) && Boolean(root) && !root.contains(outside),
      hint: "Add <p id=\"outside\"> to index.html on the line just above <div id=\"root\"></div>, not inside it."
    },
    {
      id: "main-ran",
      title: "The console shows that main.jsx ran and found the root",
      pass: console.some((entry) => entry.text.startsWith("main.jsx found")),
      hint: "Add console.log(\"main.jsx found\", document.getElementById(\"root\")); to src/main.jsx on its own line above createRoot."
    },
    {
      id: "app-inside-root",
      title: "App renders the new heading inside the root",
      pass: Boolean(heading) && heading.textContent.trim() === "Hello from App.jsx",
      hint: "Change the h1 in src/App.jsx to read exactly Hello from App.jsx."
    },
    {
      id: "app-component",
      title: "The inspector shows the App component",
      pass: inspector.components.some((component) => component.name === "App"),
      hint: "Keep App as a function component exported with export default App; and rendered by main.jsx."
    }
  ];
}
