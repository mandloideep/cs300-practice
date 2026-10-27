export default async function check({ document }) {
  const view = document.defaultView;
  const color = (element) => (element ? view.getComputedStyle(element).color : null);
  const warning = document.querySelector(".card.is-warning");
  const plain = document.querySelector(".card:not(.is-warning)");
  const warningLink = warning?.querySelector("a");
  const plainLink = plain?.querySelector("a");
  const sheet = document.querySelector('style[data-lab-file="styles.css"]')?.textContent ?? "";
  const important = /!\s*important/i.test(sheet);
  const borderColor = warning ? view.getComputedStyle(warning).borderTopColor : null;

  return [
    {
      id: "warning-text-wins",
      title: "The warning card's text is brown and its border is yellow",
      pass: color(warning) === "rgb(122, 77, 0)" && borderColor === "rgb(242, 169, 0)",
      hint:
        borderColor !== "rgb(242, 169, 0)"
          ? "Add a .is-warning rule that sets border-color and color from the custom properties."
          : "The border changed but the text did not: the main article.card rule is more specific than .is-warning. Replace its selector with .card."
    },
    {
      id: "no-important",
      title: "The stylesheet does not use !important",
      pass: !important,
      hint: "Remove !important and win on specificity instead: simplify main article.card to .card."
    },
    {
      id: "links-inherit",
      title: "Each card's link takes its card's text color",
      pass:
        Boolean(warningLink) &&
        Boolean(plainLink) &&
        color(warningLink) === color(warning) &&
        color(plainLink) === color(plain) &&
        color(plain) === "rgb(0, 61, 165)",
      hint: "Add a .card a rule with color: inherit; so each link uses the color of the card it sits in."
    }
  ];
}
