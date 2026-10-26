export default async function check({ document, console, inspector }) {
  const card = document.querySelector("article.concept-card");
  const text = (selector) => {
    const element = card ? card.querySelector(selector) : null;
    return element ? element.textContent.trim() : "";
  };
  const link = card ? card.querySelector("footer a") : null;

  return [
    {
      id: "card-from-data",
      title: "The card shows the concept's week, name, and summary",
      pass:
        text("header .eyebrow") === "Week 10, Session 1" &&
        text("header h2") === "Root rendering" &&
        text(":scope > p") === "createRoot owns the application container.",
      hint: "Inside article className=\"concept-card\", read each value from the object: {concept.week}, {concept.session}, {concept.name}, and {concept.summary}."
    },
    {
      id: "link-from-data",
      title: "The link points at the createRoot reference",
      pass: Boolean(link) && link.getAttribute("href") === "https://react.dev/reference/react-dom/client/createRoot",
      hint: "Write the footer link as <a href={concept.reference}> with braces and no quotes around the expression."
    },
    {
      id: "card-component",
      title: "The inspector shows ConceptCard inside App",
      pass: inspector.components.some((component) => component.name === "ConceptCard"),
      hint: "Import ConceptCard from \"./ConceptCard.jsx\" in App.jsx and add <ConceptCard /> at the end of main."
    },
    {
      id: "no-dom-property-warning",
      title: "The console has no Invalid DOM property warning",
      pass: !console.some((entry) => entry.text.includes("Invalid DOM property")),
      hint: "The console names the attribute to rename. In JSX, class is className and for is htmlFor."
    }
  ];
}
