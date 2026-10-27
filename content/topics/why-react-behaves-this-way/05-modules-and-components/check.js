export default async function check({ document, console, inspector, wait }) {
  const logs = () => console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const lines = logs();
  const cardRuns = lines.filter((text) => text === "ProductCard.jsx ran").length;
  const cardIndex = lines.indexOf("ProductCard.jsx ran");
  const appIndex = lines.indexOf("App.jsx ran");
  const cards = inspector.components.filter((component) => component.name === "ProductCard");
  const from = logs().length;
  [...document.querySelectorAll(".product button")]
    .find((candidate) => candidate.textContent.trim() === "Add one")
    ?.click();
  await wait(50);
  const clicked = logs().slice(from);

  return [
    {
      id: "module-runs-once",
      title: "ProductCard.jsx runs once, before App.jsx",
      pass: cardRuns === 1 && appIndex !== -1 && cardIndex < appIndex,
      hint:
        cardRuns === 0
          ? 'Move ProductCard into src/ProductCard.jsx, start the file with console.log("ProductCard.jsx ran"), and import it in App.jsx.'
          : `ProductCard.jsx ran ${cardRuns} time(s); App.jsx should log "App.jsx ran" above export default function App, and the import goes at the top.`
    },
    {
      id: "three-cards-from-the-module",
      title: "Three ProductCard components render from the one module",
      pass: cards.length === 3 && document.querySelectorAll(".product").length === 3,
      hint: `The inspector sees ${cards.length} ProductCard component(s). Export the component with export default function ProductCard and import it as ProductCard.`
    },
    {
      id: "cards-still-work",
      title: "Add one still adds to the cart",
      pass: clicked.includes("Added to the cart: 1 x Essence Mascara Lash Princess"),
      hint: "The handler moved with the component; keep handleAdd inside ProductCard."
    }
  ];
}
