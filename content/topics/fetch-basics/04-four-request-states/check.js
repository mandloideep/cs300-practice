export default async function check({ document, network, wait }) {
  const button = document.querySelector("#load");
  const list = document.querySelector("#products");
  const status = () => document.querySelector("#status")?.textContent.trim();
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
  const statusRightAfterClick = status();
  const disabledRightAfterClick = button?.disabled === true;
  const listClearedRightAfterClick = list?.children.length === 0;
  for (
    let elapsed = 0;
    elapsed < 8000 && (productRequests().length === before || productRequests().some((request) => request.state === "pending"));
    elapsed += 100
  ) {
    await wait(100);
  }
  await wait(50);
  const latest = productRequests().at(-1);
  const items = document.querySelectorAll("#products li").length;
  const statusAfter = status();
  const enabledAfter = button?.disabled === false;
  const settledWell =
    (latest?.state === "ok" && items > 0 && statusAfter === `${items} products loaded.`) ||
    (latest?.state === "ok" && items === 0 && statusAfter === "No products found.") ||
    (latest !== undefined && latest.state !== "ok" && statusAfter?.startsWith("Could not load products."));

  return [
    {
      id: "loading-state-shows",
      title: "The loading state shows before the request settles",
      pass: statusRightAfterClick === "Loading products..." && disabledRightAfterClick && listClearedRightAfterClick,
      hint: `Right after the click the status reads "${statusRightAfterClick}" and the button is ${disabledRightAfterClick ? "disabled" : "enabled"}. Disable the button, clear the list, and write "Loading products..." before the await.`
    },
    {
      id: "success-restores-the-button",
      title: "After the request settles the button is enabled again",
      pass: latest !== undefined && enabledAfter,
      hint: "The button should be enabled in a finally block so that it comes back after success and after failure alike."
    },
    {
      id: "error-and-empty-states",
      title: "The page shows the outcome of the request",
      pass: settledWell,
      hint: `The request ended ${latest?.state ?? "without being made"} and the status reads "${statusAfter}". Throw when response.ok is false, write "No products found." when the array is empty, and write "Could not load products." with the error message in catch.`
    }
  ];
}
