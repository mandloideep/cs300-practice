export default async function check({ document, inspector, wait }) {
  const isLoading = () => /Loading products/.test(document.body.textContent);
  for (let elapsed = 0; elapsed < 8000 && isLoading(); elapsed += 100) {
    await wait(100);
  }
  const app = inspector.components.find((component) => component.name === "App");
  const state = app?.state ?? [];
  const value = state[0]?.value;
  const status = value && typeof value === "object" ? value.status : undefined;
  const loading = isLoading();
  const alert = document.querySelector('[role="alert"]')?.textContent.trim() ?? "";
  const cards = document.querySelectorAll(".product").length;
  const empty = /No products to show/.test(document.body.textContent);
  const branches = [loading, Boolean(alert), cards > 0 || empty].filter(Boolean).length;
  return [
    {
      id: "one-request-state",
      title: "App keeps the request in one state value with a status",
      pass: state.length === 1 && typeof status === "string",
      hint:
        state.length > 1
          ? `App has ${state.length} state values. Replace the loading, error, and products lines with one useState whose value is an object with status, products, and error.`
          : "App's one state value has no status property. Start it as { status: \"loading\", products: [], error: null }."
    },
    {
      id: "one-branch-at-a-time",
      title: "The page shows exactly one of loading, error, and the list",
      pass: branches === 1,
      hint:
        branches === 0
          ? "Nothing is on the page below the heading. Each render line should check request.status for one of the words loading, error, and success."
          : `The page shows ${branches} branches at once. Each render line should check request.status for one word, so that only one of them can be true.`
    },
    {
      id: "products-render",
      title: "The loaded products render as cards",
      pass: !loading && !alert && cards > 0,
      hint: alert
        ? `The page shows "${alert}" Open the Network view to see what the request returned, and check that the fixture controls are not forcing a failure.`
        : loading
          ? "The page is still loading. The then branch should store status \"success\" and the catch branch status \"error\"."
          : "No product cards are on the page. The success branch should render ProductList with request.products."
    }
  ];
}
