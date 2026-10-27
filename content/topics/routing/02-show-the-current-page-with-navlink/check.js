export default async function check({ document, wait }) {
  const link = (path) => document.querySelector(`nav a[href="${path}"]`);
  const current = (path) => link(path)?.getAttribute("aria-current") === "page";
  const heading = () => document.querySelector("main h1")?.textContent.trim() ?? "";

  link("/")?.click();
  await wait(100);
  const homeCurrentAtHome = current("/");
  const productsCurrentAtHome = current("/products");

  link("/products")?.click();
  await wait(100);
  const productsHeading = heading();
  const productsCurrentAtProducts = current("/products");
  const homeCurrentAtProducts = current("/");

  link("/")?.click();
  await wait(100);

  return [
    {
      id: "navlink-marks-the-current-page",
      title: "The link to the current page carries aria-current=\"page\"",
      pass: homeCurrentAtHome && !productsCurrentAtHome && productsHeading === "Products" && productsCurrentAtProducts,
      hint:
        !homeCurrentAtHome && !productsCurrentAtProducts
          ? "No link is marked as current. Replace Link with NavLink in the nav; NavLink sets aria-current=\"page\" when its to matches the address."
          : "The marks do not follow the page. Each NavLink's to should be the path of the page it opens."
    },
    {
      id: "home-is-not-current-on-products",
      title: "On /products the Home link is not marked, because it has end",
      pass: productsCurrentAtProducts && !homeCurrentAtProducts,
      hint: "On the Products page both links are marked. Add the end prop to the Home link so that it matches only the exact address /."
    }
  ];
}
