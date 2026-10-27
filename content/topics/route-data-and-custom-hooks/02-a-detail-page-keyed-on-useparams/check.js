export default async function check({ document, network, wait }) {
  const heading = () => document.querySelector("main h1")?.textContent.trim() ?? "";
  const navLink = (path) => document.querySelector(`nav a[href="${path}"]`);
  const isLoading = () => /Loading product/.test(document.body.textContent);
  const settle = async () => {
    await wait(50);
    for (let elapsed = 0; elapsed < 8000 && isLoading(); elapsed += 100) {
      await wait(100);
    }
  };
  const requestsTo = (path) =>
    network.filter((request) => {
      try {
        return new URL(request.url).pathname.endsWith(path);
      } catch {
        return false;
      }
    });

  navLink("/products")?.click();
  await settle();
  const first = document.querySelector('.product-list a[href="/products/1"]');
  const firstTitle = first?.textContent.trim() ?? "";
  const before = requestsTo("/products/1").length;
  first?.click();
  await settle();
  const requestedOne = requestsTo("/products/1").length > before;
  const okOne = requestsTo("/products/1").some((request) => request.state === "ok");
  const detailHeading = heading();
  const description = document.querySelectorAll("main p").length;

  const next = [...document.querySelectorAll('main a[href="/products/2"]')][0];
  const beforeTwo = requestsTo("/products/2").length;
  next?.click();
  await settle();
  const requestedTwo = requestsTo("/products/2").length > beforeTwo;
  const secondHeading = heading();

  navLink("/")?.click();
  await wait(50);

  return [
    {
      id: "detail-page-requests-the-product",
      title: "Opening a product sends a request to /products/<id>",
      pass: requestedOne && okOne,
      hint: requestedOne
        ? `The request to /products/1 ended ${requestsTo("/products/1").at(-1)?.state}. Check the API source.`
        : "Opening a product sent no request. Call useFetch(productUrl(id)) at the top of ProductPage."
    },
    {
      id: "detail-renders-from-the-response",
      title: "The detail page shows the title the server answered with",
      pass: Boolean(first) && detailHeading === firstTitle && description >= 3,
      hint:
        detailHeading === ""
          ? "The detail page has no heading. In the success branch, render data.title, data.category, data.price, and data.description."
          : `The detail page heading is "${detailHeading}"; it should be the product's title from data.`
    },
    {
      id: "new-id-sends-a-new-request",
      title: "Pressing Next product sends a request for the next id and redraws",
      pass: Boolean(next) && requestedTwo && secondHeading !== detailHeading && secondHeading !== "",
      hint: !next
        ? "The success branch should hold a Link to /products/ followed by Number(id) + 1."
        : requestedTwo
          ? "A request for product 2 was sent but the page kept the old product."
          : "Pressing Next product changed the address but sent no request. The hook's effect depends on url, so the page should pass productUrl(id), which changes with the id."
    }
  ];
}
