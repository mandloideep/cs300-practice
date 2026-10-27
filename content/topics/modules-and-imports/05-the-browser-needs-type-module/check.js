export default async function check({ document, console }) {
  const headScripts = [...document.head.querySelectorAll("script[src]")];
  const bodyScripts = [...document.body.querySelectorAll("script[src]")];
  const allModules = [...headScripts, ...bodyScripts].every((script) => script.type === "module");
  const rows = [...document.querySelectorAll("#grades li")].map((item) => item.textContent.trim());
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);

  return [
    {
      id: "script-in-head",
      title: "The script tag sits in the head",
      pass: headScripts.length === 1 && bodyScripts.length === 0,
      hint:
        bodyScripts.length > 0
          ? "A script tag is still inside <body>. Delete it there and keep the one under the stylesheet link."
          : "The <head> should hold one <script> with src=\"/src/main.js\", under the stylesheet link."
    },
    {
      id: "rows-render",
      title: "The five curved rows render",
      pass: rows.length === 5 && rows[0] === "Alice: 100 (A)" && lines.includes("main.js ran"),
      hint:
        rows.length === 0
          ? "The list is empty. Read the top of the console: an import error usually means the tag lost type=\"module\"."
          : `The first row reads "${rows[0]}" but should read "Alice: 100 (A)".`
    },
    {
      id: "still-a-module",
      title: "The script is loaded as a module",
      pass: headScripts.length + bodyScripts.length > 0 && allModules,
      hint: 'The script tag needs type="module", or the browser loads main.js as a classic script and rejects its import lines.'
    }
  ];
}
