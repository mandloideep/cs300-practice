export default async function check({ document, console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);
  const inline = [...document.querySelectorAll('script[type="module"]:not([src])')].some((script) =>
    script.textContent.includes('"study-format"')
  );

  return [
    {
      id: "sessions-listed",
      title: "The starter line still lists the study sessions",
      pass: has("Study sessions in minutes: [25,50,90]"),
      hint: "Keep the sessions array and its console.log from the starter in src/main.js."
    },
    {
      id: "no-bare-import-on-the-page",
      title: "index.html no longer has a module that imports study-format by name",
      pass: !inline,
      hint: "Delete the inline script type=\"module\" from index.html; the browser cannot resolve a bare name such as study-format."
    },
    {
      id: "formatted-by-path",
      title: "Every session is formatted by the package, imported by its path",
      pass:
        has("25 minutes is 25 min") && has("50 minutes is 50 min") && has("90 minutes is 1 h 30 min"),
      hint: "Import formatMinutes from \"../node_modules/study-format/index.js\" at the top of src/main.js, then log one line per session."
    }
  ];
}
