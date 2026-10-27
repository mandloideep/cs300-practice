// The narrow layout is measured after asking the parent to narrow the result pane with the `resize`
// message pinned in CONTRACTS 4.4 (Phase 4): `{ type: "resize", width: 480 }` from the iframe, and
// `width: null` to restore the pane. The result pane that handles the message arrives with the
// runtime branch; until it is merged the pane keeps its own width, and when that width is 768px or
// more the stacked layout is read from the plain stylesheet rules instead of the page.
const NARROW = 480;
const TABLET = 768;
const DESKTOP = 1024;

function resize(width) {
  globalThis.__LAB__?.post?.({ type: "resize", width });
}

function labRules(document) {
  const sheet = [...document.styleSheets].find(
    (candidate) => candidate.ownerNode?.getAttribute?.("data-lab-file") === "styles.css"
  );
  return sheet ? [...sheet.cssRules] : [];
}

function mediaRule(rules, minWidth) {
  return rules.find((rule) => {
    if (!rule.media) return false;
    const match = /min-width:\s*(\d+)px/.exec(rule.media.mediaText);
    return match !== null && Number(match[1]) === minWidth;
  });
}

function styleRule(rules, selector) {
  return rules.find(
    (rule) =>
      rule.selectorText &&
      rule.selectorText.split(",").map((part) => part.trim()).includes(selector)
  );
}

function columnCount(value) {
  if (!value) return 0;
  const repeat = /repeat\(\s*(\d+)\s*,/.exec(value);
  if (repeat) return Number(repeat[1]);
  return value.trim().split(/\s+/).length;
}

export default async function check({ document, wait }) {
  resize(NARROW);
  await wait(150);

  const width = document.documentElement.clientWidth;
  const cards = [...document.querySelectorAll(".card")];
  const lefts = cards.map((card) => card.getBoundingClientRect().left);
  const tops = cards.map((card) => card.getBoundingClientRect().top);
  const oneColumn =
    cards.length === 3 &&
    Math.max(...lefts) - Math.min(...lefts) <= 1 &&
    tops.every((top, index) => index === 0 || top > tops[index - 1]);
  const brand = document.querySelector(".brand");
  const nav = document.querySelector("nav");
  const headerStacked =
    Boolean(brand && nav) && nav.getBoundingClientRect().top >= brand.getBoundingClientRect().bottom - 1;

  resize(null);

  const rules = labRules(document);
  const baseCards = styleRule(rules, ".cards");
  const baseHeader = styleRule(rules, ".site-header");
  const baseStacked =
    columnCount(baseCards?.style.gridTemplateColumns) === 1 &&
    baseHeader?.style.flexDirection === "column";
  const narrowMeasured = width < TABLET;
  const stacked = narrowMeasured ? oneColumn && headerStacked : baseStacked;

  const tablet = mediaRule(rules, TABLET);
  const tabletRules = tablet ? [...tablet.cssRules] : [];
  const tabletCards = columnCount(styleRule(tabletRules, ".cards")?.style.gridTemplateColumns);
  const tabletHeader = styleRule(tabletRules, ".site-header")?.style.flexDirection;

  const desktop = mediaRule(rules, DESKTOP);
  const desktopCards = columnCount(
    styleRule(desktop ? [...desktop.cssRules] : [], ".cards")?.style.gridTemplateColumns
  );

  return [
    {
      id: "stacked-below-768",
      title: "Below 768px the header stacks and the cards sit in one column",
      pass: stacked,
      hint: narrowMeasured
        ? `At ${width}px the cards ${oneColumn ? "stack" : "do not stack"} and the header ${headerStacked ? "stacks" : "does not stack"}. The plain rules describe the narrow layout; keep the column rules inside @media (min-width: 768px).`
        : "The plain .cards rule should keep grid-template-columns: 1fr and .site-header should keep flex-direction: column; the wider layouts belong inside media queries."
    },
    {
      id: "two-columns-from-768",
      title: "From 768px the header is a row and the cards have two columns",
      pass: tabletCards === 2 && tabletHeader === "row",
      hint: tablet
        ? `Inside @media (min-width: 768px) the cards get ${tabletCards} column(s) and the header's flex-direction is ${tabletHeader ?? "unset"}. It needs repeat(2, 1fr) and flex-direction: row.`
        : "Add an @media (min-width: 768px) block with rules for .site-header and .cards."
    },
    {
      id: "three-columns-from-1024",
      title: "From 1024px the cards have three columns",
      pass: desktopCards === 3,
      hint: desktop
        ? `Inside @media (min-width: 1024px) the cards get ${desktopCards} column(s); set grid-template-columns: repeat(3, 1fr).`
        : "Add an @media (min-width: 1024px) block with a .cards rule."
    }
  ];
}
