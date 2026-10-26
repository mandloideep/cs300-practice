const pattern = /^(After render|Rendering): the page shows (\d+) cards$/;

export default async function check({ document, console, wait }) {
  const logs = () => console.filter((entry) => pattern.test(entry.text));
  const filterButton = (label) =>
    [...document.querySelectorAll(".filter button")].find((button) => button.textContent.trim() === label);
  const cards = () => document.querySelectorAll(".product").length;

  const before = logs().length;
  filterButton("Beauty")?.click();
  await wait(100);
  const onScreen = cards();
  const fresh = logs().slice(before);
  const last = fresh.at(-1) ? pattern.exec(fresh.at(-1).text) : null;
  filterButton("All")?.click();
  await wait(100);

  return [
    {
      id: "effect-logs-after-render",
      title: "A click logs an After render line from the effect",
      pass: last !== null && last[1] === "After render",
      hint:
        last === null
          ? "Pressing Beauty logged no line. Put the console.log inside useEffect(() => { ... }) in App, with no second argument."
          : "The line still starts with Rendering, so it runs in the body of App. Move it into useEffect so that it runs after the page is updated."
    },
    {
      id: "count-matches-screen",
      title: "The number in the newest line matches the cards on the screen",
      pass: last !== null && Number(last[2]) === onScreen,
      hint:
        last === null
          ? "There is no line to compare yet; fix the first check first."
          : `After pressing Beauty the screen shows ${onScreen} cards and the newest line says ${last[2]}. Code in the body of App runs before React updates the page; code in an effect runs after.`
    }
  ];
}
