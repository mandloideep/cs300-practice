export default async function check({ document, network, wait }) {
  const isLoading = () => /Loading products/.test(document.body.textContent);
  for (let elapsed = 0; elapsed < 8000 && isLoading(); elapsed += 100) {
    await wait(100);
  }
  const productRequests = () =>
    network.filter((request) => {
      try {
        return new URL(request.url).pathname.endsWith("/products");
      } catch {
        return false;
      }
    });
  for (let elapsed = 0; elapsed < 2000 && productRequests().some((request) => request.state === "pending"); elapsed += 100) {
    await wait(100);
  }
  const requests = productRequests();
  const settled = requests.filter((request) => request.state !== "aborted");
  const ok = settled.filter((request) => request.state === "ok");
  const alert = document.querySelector('[role="alert"]')?.textContent.trim();
  const cards = document.querySelectorAll(".product--card").length;
  return [
    {
      id: "one-products-request",
      title: "One request to /products settles ok",
      pass: settled.length === 1 && ok.length === 1,
      hint:
        requests.length === 0
          ? "The network panel shows no request to /products. Replace the throw in src/api.js with a fetch of import.meta.env.API_BASE + \"/products?limit=8\"."
          : `The panel shows ${settled.length} settled request(s) to /products with state ${settled.map((request) => request.state).join(", ") || "none"}. An aborted row from the development double run is expected; exactly one row should end ok. Check the fixture controls or the chosen preset.`
    },
    {
      id: "uses-api-base",
      title: "The request is built from import.meta.env.API_BASE",
      pass: requests.length > 0 && requests.every((request) => request.source !== "other"),
      hint:
        requests.length === 0
          ? "No request to /products was made yet, so there is no URL to inspect. Write the fetch in src/api.js first."
          : "The request goes to a fixed address instead of the chosen API source. Start the URL with import.meta.env.API_BASE so the toolbar selector can switch servers."
    },
    {
      id: "products-render",
      title: "The loaded products render as cards",
      pass: !isLoading() && !alert && cards > 0,
      hint: alert
        ? `The page shows "${alert}" Open the network panel to see what the request returned, and check that the fixture controls are not forcing a failure.`
        : isLoading()
          ? "The page is still loading. Make sure loadProducts returns or throws in every case."
          : "No product cards are on the page. loadProducts should return data.products, the array inside the response, not the whole object."
    }
  ];
}
