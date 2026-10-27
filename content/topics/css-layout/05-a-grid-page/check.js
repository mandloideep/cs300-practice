export default async function check({ document }) {
  const view = document.defaultView;
  const body = document.body;
  const bodyStyle = view.getComputedStyle(body);
  const tracks = bodyStyle.display === "grid" ? bodyStyle.gridTemplateColumns.split(" ").length : 0;
  const header = document.querySelector(".site-header");
  const footer = document.querySelector(".site-footer");
  const sidebar = document.querySelector(".sidebar");
  const catalog = document.querySelector(".catalog");
  const cardGrid = document.querySelector(".card-grid");
  const contentWidth = body.clientWidth - parseFloat(bodyStyle.paddingLeft) - parseFloat(bodyStyle.paddingRight);
  const spans = (element) => element && Math.abs(element.getBoundingClientRect().width - contentWidth) <= 1;
  const sideBySide =
    sidebar &&
    catalog &&
    sidebar.getBoundingClientRect().right <= catalog.getBoundingClientRect().left &&
    Math.abs(sidebar.getBoundingClientRect().top - catalog.getBoundingClientRect().top) <= 1;
  const gridStyle = cardGrid ? view.getComputedStyle(cardGrid) : null;
  const cardColumns = gridStyle?.display === "grid" ? gridStyle.gridTemplateColumns.split(" ").length : 0;

  return [
    {
      id: "body-is-a-two-column-grid",
      title: "The body is a grid with two columns",
      pass: tracks === 2,
      hint:
        bodyStyle.display === "grid"
          ? `The grid has ${tracks} column(s). Set grid-template-columns: 14rem 1fr; on body.`
          : "Add display: grid; to the body rule, with grid-template-columns and a gap."
    },
    {
      id: "header-and-footer-span",
      title: "The header and footer span both columns, with the sidebar beside the main content",
      pass: tracks === 2 && spans(header) && spans(footer) && Boolean(sideBySide),
      hint: "Add a rule for .site-header and .site-footer with grid-column: 1 / -1;."
    },
    {
      id: "cards-are-a-grid",
      title: "The cards sit in a grid of their own with a 1rem gap",
      pass: cardColumns >= 1 && gridStyle?.columnGap === "16px",
      hint: "Add a .card-grid rule with display: grid;, repeat(auto-fit, minmax(8rem, 1fr)) columns, and gap: 1rem;."
    }
  ];
}
