export default async function check({ document, inspector, network, wait }) {
  const heading = () => document.querySelector("main h1")?.textContent.trim() ?? "";
  const navLink = (path) => document.querySelector(`nav a[href="${path}"]`);
  const isLoading = () => /Loading products/.test(document.body.textContent);
  const productRequests = () =>
    network.filter((request) => {
      try {
        return new URL(request.url).pathname.endsWith("/products");
      } catch {
        return false;
      }
    });

  const before = productRequests().length;
  navLink("/products")?.click();
  await wait(50);
  for (let elapsed = 0; elapsed < 8000 && isLoading(); elapsed += 100) {
    await wait(100);
  }
  const requested = productRequests().length > before;
  const settledOk = productRequests().some((request) => request.state === "ok");
  const items = document.querySelectorAll(".product-list li").length;
  const alert = document.querySelector('[role="alert"]')?.textContent.trim() ?? "";
  const page = inspector.components.find((component) => component.name === "ProductsPage");
  const app = inspector.components.find((component) => component.name === "App");

  navLink("/")?.click();
  await wait(50);

  return [
    {
      id: "list-page-requests-products",
      title: "Opening the Products page sends a request to /products",
      pass: requested && settledOk,
      hint: requested
        ? `The request to /products ended ${productRequests().at(-1)?.state}. Check the API source and the fixture controls.`
        : "No request to /products was sent. Call useFetch(productsUrl()) at the top of ProductsPage."
    },
    {
      id: "list-renders-from-the-response",
      title: "The list renders the products the server answered with",
      pass: items === 8 && !alert,
      hint: alert
        ? `The page shows "${alert}" Open the Network view to see what the request returned.`
        : `The list shows ${items} products. Inside the success branch, give ProductList data.products, the array inside the response.`
    },
    {
      id: "hook-state-under-the-page",
      title: "The request state belongs to ProductsPage, not to App",
      pass: (app?.state.length ?? 0) === 0 && (!page || page.state.length === 2),
      hint:
        (app?.state.length ?? 0) > 0
          ? "App holds state. The hook should be called from ProductsPage, so that the page owns its request."
          : `ProductsPage holds ${page?.state.length ?? 0} state values; after it calls useFetch it should hold the hook's two.`
    }
  ];
}
