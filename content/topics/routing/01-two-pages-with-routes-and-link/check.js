export default async function check({ document, wait }) {
  const heading = () => document.querySelector("main h1")?.textContent.trim() ?? "";
  const link = (path) => document.querySelector(`nav a[href="${path}"]`);
  const items = () => document.querySelectorAll(".product-list li").length;

  const startHeading = heading();
  const homeLink = link("/");
  const productsLink = link("/products");

  productsLink?.click();
  await wait(100);
  const productsHeading = heading();
  const productsCount = items();
  homeLink?.click();
  await wait(100);
  const backHeading = heading();

  return [
    {
      id: "home-route-renders",
      title: "The / route renders HomePage on its own",
      pass: startHeading === "Welcome to the shop" && document.querySelectorAll("main").length === 1,
      hint:
        document.querySelectorAll("main").length > 1
          ? "More than one page is on the screen. Each page belongs in its own Route inside Routes, so that only the matched one renders."
          : `The page heading is "${startHeading}". The Route with path "/" should render HomePage.`
    },
    {
      id: "nav-has-two-links",
      title: "A nav holds a Link to / and a Link to /products",
      pass: Boolean(homeLink) && Boolean(productsLink),
      hint: "Add a nav inside BrowserRouter with <Link to=\"/\"> and <Link to=\"/products\">; Link renders an <a> whose href is the path."
    },
    {
      id: "link-switches-page",
      title: "Pressing Products renders ProductsPage, and Home brings the home page back",
      pass: productsHeading === "Products" && productsCount === 6 && backHeading === "Welcome to the shop",
      hint:
        productsHeading !== "Products"
          ? `After pressing Products the heading is "${productsHeading}". The Route with path "/products" should render ProductsPage, and the link should be a Link, not a plain <a>.`
          : `The products page shows ${productsCount} items and pressing Home then shows "${backHeading}".`
    }
  ];
}
