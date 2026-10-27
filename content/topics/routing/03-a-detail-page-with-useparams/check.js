export default async function check({ document, wait }) {
  const heading = () => document.querySelector("main h1")?.textContent.trim() ?? "";
  const navLink = (path) => document.querySelector(`nav a[href="${path}"]`);
  const productLinks = () => [...document.querySelectorAll('.product-list a[href^="/products/"]')];

  navLink("/products")?.click();
  await wait(100);
  const links = productLinks();
  const linkCount = links.length;
  const first = links[0];
  const firstTitle = first?.textContent.trim() ?? "";
  const firstHref = first?.getAttribute("href") ?? "";

  first?.click();
  await wait(100);
  const detailHeading = heading();
  const price = document.querySelector("main .product-price")?.textContent.trim() ?? "";
  const back = [...document.querySelectorAll('main a[href="/products"]')][0];

  back?.click();
  await wait(100);
  const listHeading = heading();
  navLink("/")?.click();
  await wait(100);

  return [
    {
      id: "product-links-in-list",
      title: "Each product title in the list is a Link to /products/<id>",
      pass: linkCount === 6 && /^\/products\/\d+$/.test(firstHref),
      hint: `The list has ${linkCount} product links. Wrap each title in a Link whose to is /products/ followed by the product's id.`
    },
    {
      id: "detail-page-from-the-url",
      title: "Opening a product shows that product's title and price",
      pass: Boolean(first) && detailHeading === firstTitle && /^\$\d/.test(price),
      hint:
        detailHeading.startsWith("No product")
          ? "The detail page says no product has the id. useParams returns a string, so compare with Number(id)."
          : `After opening "${firstTitle}" the heading is "${detailHeading}". Add a Route with path /products/:id that renders ProductPage, and read the id with useParams.`
    },
    {
      id: "back-link-returns",
      title: "The detail page links back to the products list",
      pass: Boolean(back) && listHeading === "Products",
      hint: "The detail page should hold a Link to /products, and pressing it should render the Products page again."
    }
  ];
}
