export default async function check({ document, network, wait }) {
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

  const start = select?.value ?? "beauty";
  await untilSettled(8000);
  choose("laptops");
  await untilSettled(8000);
  const errorShown = Boolean(alert());
  const buttonShown = Boolean(retryButton());

  const before = laptopsRequests().length;
  let loadingAfterClick = false;
  if (buttonShown) {
    retryButton().click();
    await wait(50);
    loadingAfterClick = isLoading();
    await untilSettled(8000);
  }
  const added = laptopsRequests().length - before;

  choose(start);
  await untilSettled(8000);

  return [
    {
      id: "retry-button-in-error-state",
      title: "The error state shows a Retry button",
      pass: errorShown && buttonShown,
      hint: errorShown
        ? "The error message shows but has no Retry button inside it. Put a button in the error branch whose onClick calls setAttempt(attempt + 1)."
        : "Choosing Laptops did not reach the error state. Run the checks with Fixtures selected, where the laptops route answers 503 on purpose."
    },
    {
      id: "retry-sends-a-new-request",
      title: "Pressing Retry shows the loading state and sends one new request",
      pass: buttonShown && loadingAfterClick && added === 1,
      hint: !buttonShown
        ? "There is no Retry button to press yet."
        : added === 0
          ? "Pressing Retry sent no request. Add attempt to the effect's dependency array so the effect runs again when it changes."
          : `Pressing Retry sent ${added} requests${loadingAfterClick ? "" : " and the loading state did not show"}. The effect should set the loading state and send exactly one request per run.`
    }
  ];
}
