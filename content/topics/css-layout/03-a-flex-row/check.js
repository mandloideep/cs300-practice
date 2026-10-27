export default async function check({ document }) {
  const view = document.defaultView;
  const header = document.querySelector(".site-header");
  const brand = document.querySelector(".brand");
  const nav = document.querySelector("nav");
  const headerStyle = header ? view.getComputedStyle(header) : null;
  const navStyle = nav ? view.getComputedStyle(nav) : null;
  const headerBox = header?.getBoundingClientRect();
  const brandBox = brand?.getBoundingClientRect();
  const navBox = nav?.getBoundingClientRect();
  const ready = Boolean(headerBox && brandBox && navBox);

  const sameRow = ready && brandBox.right <= navBox.left + 1 && navBox.top < brandBox.bottom;
  const contentRight = ready ? headerBox.right - parseFloat(headerStyle.paddingRight) : 0;
  const atEnd = ready && Math.abs(navBox.right - contentRight) <= 1;
  const centerOf = (box) => box.top + box.height / 2;
  const centered = ready && Math.abs(centerOf(navBox) - centerOf(brandBox)) <= 2;

  return [
    {
      id: "header-is-a-row",
      title: "The site name and the nav share one row",
      pass: headerStyle?.display === "flex" && sameRow,
      hint: "Add display: flex; to the .site-header rule so its two children become items on one row."
    },
    {
      id: "nav-at-the-end",
      title: "The nav sits at the right edge of the header",
      pass: headerStyle?.display === "flex" && atEnd,
      hint: "Add justify-content: space-between; to .site-header to push the nav to the end of the main axis."
    },
    {
      id: "nav-centered",
      title: "The nav is centered on the cross axis",
      pass: headerStyle?.display === "flex" && centered,
      hint: "Add align-items: center; to .site-header so the links sit level with the middle of the site name."
    },
    {
      id: "links-spaced-with-gap",
      title: "The nav is a flex row with a 1rem gap",
      pass: navStyle?.display === "flex" && navStyle?.columnGap === "16px",
      hint: "Add a nav rule with display: flex; and gap: 1rem; at the end of the stylesheet."
    }
  ];
}
