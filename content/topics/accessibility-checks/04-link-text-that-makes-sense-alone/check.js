export default async function check({ document, wait }) {
  const navLink = (path) => document.querySelector(`nav a[href="${path}"]`);
  const nameOf = (link) => {
    const text = link.textContent.trim();
    if (text) return text;
    return [...link.querySelectorAll("img")]
      .map((image) => image.getAttribute("alt")?.trim() ?? "")
      .join(" ")
      .trim();
  };

  navLink("/products")?.click();
  await wait(150);
  const links = [...document.querySelectorAll("a[href]")];
  const named = links.map((link) => ({ name: nameOf(link), href: link.getAttribute("href") }));
  const productLinks = [...document.querySelectorAll("main .product-list a")];
  const titlesAreLinks =
    productLinks.length > 0 &&
    productLinks.every((link) => {
      const title = link.closest("li")?.querySelector(".product-title")?.textContent.trim();
      return Boolean(title) && link.textContent.trim() === title;
    });
  const clash = named.find((link) =>
    named.some((other) => other !== link && other.name === link.name && other.href !== link.href)
  );
  const logo = document.querySelector("header a.logo");
  const logoName = logo ? nameOf(logo) : "";

  navLink("/")?.click();
  await wait(100);

  return [
    {
      id: "product-links-name-the-product",
      title: "Every link in the product list is named by the product's title",
      pass: titlesAreLinks,
      hint:
        productLinks.length === 0
          ? "The product list has no links. Make each product's title a Link to its page."
          : "A link in the product list does not read as the product's title. Make the title the Link and delete the View details link."
    },
    {
      id: "no-two-links-share-a-name",
      title: "No two links with the same text go to different pages",
      pass: !clash,
      hint: clash
        ? `More than one link is named "${clash.name || "(no name)"}" and they go to different pages. Give each link text that says where it goes.`
        : ""
    },
    {
      id: "logo-link-has-a-name",
      title: "The logo link is named by its image's alt text",
      pass: logoName.length > 0,
      hint: !logo
        ? "The header has no logo link. Keep the Link with className=\"logo\" around the image."
        : "The logo link has no name. Give its img an alt that says where the link goes, such as alt=\"Shop home\"."
    }
  ];
}
