export default async function check({ document, console, network, wait }) {
  const button = document.querySelector("#load");
  const productRequests = () =>
    network.filter((request) => {
      try {
        return new URL(request.url).pathname.endsWith("/products");
      } catch {
        return false;
      }
    });
  const before = productRequests().length;
  button?.click();
  for (
    let elapsed = 0;
    elapsed < 8000 && (productRequests().length === before || productRequests().some((request) => request.state === "pending"));
    elapsed += 100
  ) {
    await wait(100);
  }
  const requests = productRequests();
  const latest = requests.at(-1);
  const items = document.querySelectorAll("#products li").length;
  const status = document.querySelector("#status")?.textContent.trim();
  const statusLogged = console.some((entry) => /^response status \d+ ok (true|false)$/.test(entry.text));
  return [
    {
      id: "one-request-settles-ok",
      title: "A click sends one request to /products that ends ok",
      pass: requests.length === before + 1 && latest?.state === "ok" && statusLogged,
      hint:
        requests.length === before
          ? "No request to /products was made. Replace the placeholder line with await fetch(import.meta.env.API_BASE + \"/products?limit=8\") and log response.status."
          : `The request ended in state ${latest?.state} with status ${latest?.status}. Check the fixture controls or the chosen preset, and log response.status and response.ok.`
    },
    {
      id: "uses-api-base",
      title: "The request is built from import.meta.env.API_BASE",
      pass: latest !== undefined && latest.source !== "other",
      hint: "The request goes to a fixed address instead of the chosen API source. Start the URL with import.meta.env.API_BASE so the toolbar selector can switch servers."
    },
    {
      id: "products-render",
      title: "The products from the response render as list items",
      pass: items > 0 && status === `${items} products loaded.`,
      hint: `The list has ${items} item(s) and the status reads "${status}". Read the body with await response.json() and pass data.products, the array inside the response, to renderProducts.`
    }
  ];
}
