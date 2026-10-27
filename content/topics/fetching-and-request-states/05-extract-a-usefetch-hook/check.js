export default async function check({ document, inspector, network, wait }) {
  const select = document.querySelector("select");
  const choose = (value) => {
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  };
  const alert = () => document.querySelector('[role="alert"]');
  const retryButton = () => [...(alert()?.querySelectorAll("button") ?? [])].find((button) => /retry/i.test(button.textContent));
  const isLoading = () => /Loading products/.test(document.body.textContent);
  const untilSettled = async (limit) => {
    await wait(50);
    for (let elapsed = 0; elapsed < limit && isLoading(); elapsed += 100) {
      await wait(100);
    }
  };
  const laptopsRequests = () =>
    network.filter((request) => {
      try {
        return new URL(request.url).pathname.endsWith("/products/category/laptops");
      } catch {
        return false;
      }
    });

  const app = inspector.components.find((component) => component.name === "App");
  const stateCount = app?.state.length ?? 0;

  const start = select?.value ?? "beauty";
  await untilSettled(8000);
  const cards = document.querySelectorAll(".product").length;
  const alertAtStart = alert()?.textContent.trim() ?? "";

  choose("laptops");
  await untilSettled(8000);
  const before = laptopsRequests().length;
  const buttonShown = Boolean(retryButton());
  if (buttonShown) {
    retryButton().click();
    await untilSettled(8000);
  }
  const added = laptopsRequests().length - before;

  choose(start);
  await untilSettled(8000);

  return [
    {
      id: "hook-state-lives-in-app",
      title: "App lists the category and the two state values the hook declares",
      pass: stateCount === 3,
      hint:
        stateCount < 3
          ? `App has ${stateCount} state value(s). The hook should keep the attempt counter and the request object with useState, and App should call it at the top level.`
          : `App has ${stateCount} state values. The hook needs exactly two, the attempt counter and the request object, and App keeps only the category.`
    },
    {
      id: "products-render",
      title: "The products load through the hook",
      pass: cards > 0 && !alertAtStart,
      hint: alertAtStart
        ? `The page shows "${alertAtStart}" Check that the hook passes url to loadJson and stores the parsed body as data.`
        : "No product cards are on the page. App should read products from data.products and render ProductList when status is success."
    },
    {
      id: "retry-still-works",
      title: "The Retry button calls the hook's retry and sends a new request",
      pass: buttonShown && added === 1,
      hint: !buttonShown
        ? "Choosing Laptops did not show the error state with a Retry button. Run the checks with Fixtures selected, where the laptops route answers 503 on purpose."
        : `Pressing Retry sent ${added} requests. retry should change the attempt counter, which is in the effect's dependency array.`
    }
  ];
}
