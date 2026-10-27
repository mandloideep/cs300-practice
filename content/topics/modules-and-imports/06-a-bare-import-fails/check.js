export default async function check({ document, console }) {
  const updated = document.querySelector("#updated")?.textContent.trim() ?? "";
  const inlineScripts = [...document.body.querySelectorAll("script:not([src])")].filter((script) =>
    script.textContent.includes("date-fns")
  );
  const rows = document.querySelectorAll("#grades li").length;
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const datesAt = lines.indexOf("dates.js ran");
  const mainAt = lines.indexOf("main.js ran");

  return [
    {
      id: "updated-line",
      title: "The page says when it was updated",
      pass: /^Updated [A-Z][a-z]+ \d{1,2}$/.test(updated) && rows === 5,
      hint: `The last line reads "${updated}". Set the #updated element's textContent to formatUpdated(new Date()) in src/main.js, after the rows render.`
    },
    {
      id: "no-inline-script",
      title: "The pasted inline script is gone",
      pass: inlineScripts.length === 0,
      hint: 'index.html still has the inline <script type="module"> that imports "date-fns". Delete it, from its opening tag to its </script>.'
    },
    {
      id: "dates-module-ran",
      title: "dates.js runs before main.js",
      pass: datesAt !== -1 && mainAt !== -1 && datesAt < mainAt,
      hint: 'The console should show "dates.js ran" above "main.js ran". Import formatUpdated from "./dates.js", with the ./ at the start.'
    }
  ];
}
