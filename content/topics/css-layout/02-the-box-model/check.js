export default async function check({ document }) {
  const view = document.defaultView;
  const main = document.querySelector("main");
  const card = document.querySelector(".card");
  const cardStyle = card ? view.getComputedStyle(card) : null;
  const mainStyle = main ? view.getComputedStyle(main) : null;
  const cardBox = card?.getBoundingClientRect();
  const mainBox = main?.getBoundingClientRect();
  const overflow = cardBox && mainBox ? Math.round(cardBox.right - mainBox.right) : null;

  return [
    {
      id: "card-has-padding",
      title: "The card has 1.5rem of padding on every side",
      pass: cardStyle?.paddingLeft === "24px" && cardStyle?.paddingTop === "24px",
      hint: `The card's padding is ${cardStyle?.paddingLeft ?? "unknown"}. Add padding: 1.5rem; to the .card rule.`
    },
    {
      id: "border-box-everywhere",
      title: "Every element uses box-sizing: border-box",
      pass: cardStyle?.boxSizing === "border-box" && mainStyle?.boxSizing === "border-box",
      hint: "Add the *, *::before, *::after rule with box-sizing: border-box; at the top of the stylesheet."
    },
    {
      id: "card-fits-inside-main",
      title: "The card's right edge stays inside main",
      pass: overflow !== null && overflow <= 0 && cardStyle?.paddingLeft === "24px",
      hint:
        overflow === null
          ? "The page needs a main element with a .card inside it."
          : `The card's right edge sits ${overflow}px past main's border. With border-box, width: 100% includes the padding and border.`
    }
  ];
}
