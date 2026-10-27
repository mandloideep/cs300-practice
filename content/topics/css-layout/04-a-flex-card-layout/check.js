export default async function check({ document }) {
  const view = document.defaultView;
  const cards = [...document.querySelectorAll(".card")];
  const widths = cards.map((card) => card.getBoundingClientRect().width);
  const spread = widths.length > 0 ? Math.max(...widths) - Math.min(...widths) : null;
  const columns = cards.every((card) => {
    const style = view.getComputedStyle(card);
    return style.display === "flex" && style.flexDirection === "column";
  });
  const loose = cards.filter((card) => {
    const actions = card.querySelector(".card-actions");
    if (!actions) return true;
    const style = view.getComputedStyle(card);
    const inner = card.getBoundingClientRect().bottom - parseFloat(style.paddingBottom) - parseFloat(style.borderBottomWidth);
    return Math.abs(inner - actions.getBoundingClientRect().bottom) > 1;
  });

  return [
    {
      id: "cards-share-the-width",
      title: "The three cards are the same width",
      pass: cards.length === 3 && spread <= 1,
      hint: `The widest card is ${spread === null ? "unknown" : Math.round(spread)}px wider than the narrowest. Add flex: 1; to the .card rule.`
    },
    {
      id: "card-is-a-column",
      title: "Each card is a flex column",
      pass: cards.length === 3 && columns,
      hint: "Add display: flex; and flex-direction: column; to the .card rule."
    },
    {
      id: "actions-at-the-bottom",
      title: "The links sit at the bottom of every card",
      pass: cards.length === 3 && columns && loose.length === 0,
      hint: `${loose.length} card(s) have their links above the bottom. Add a .card-actions rule with margin-top: auto;.`
    }
  ];
}
