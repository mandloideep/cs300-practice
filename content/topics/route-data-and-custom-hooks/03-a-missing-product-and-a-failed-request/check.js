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
  document.querySelector('.product-list a[href="/products/8"]')?.click();
  await settle();
  const lastRequest = requestsTo("/products/8").at(-1);
  const answered404 = lastRequest?.status === 404;
  const missingHeading = heading();
  const alert = document.querySelector('[role="alert"]');
  const retryButton = [...document.querySelectorAll("main button")].find((button) => /retry/i.test(button.textContent));
  const backLink = document.querySelector('main a[href="/products"]');

  navLink("/")?.click();
  await wait(50);

  return [
    {
      id: "missing-product-reads-well",
      title: "A 404 for a product renders the missing-product heading",
      pass: answered404 && missingHeading === "No product has the id 8",
      hint: !answered404
        ? `The request for product 8 ended with status ${lastRequest?.status ?? "none"}. Run the checks with Fixtures selected, where product 8 answers 404 on purpose.`
        : alert
          ? "Product 8 still shows the alert. Attach the status to the error in loadJson, store the whole error in the hook, and branch on error.status === 404."
          : `Product 8 shows "${missingHeading}" instead of the missing-product heading.`
    },
    {
      id: "no-retry-for-a-missing-product",
      title: "The missing-product branch has no Retry button and keeps the way back",
      pass: answered404 && !retryButton && Boolean(backLink),
      hint: !answered404
        ? "This check needs the 404 that the fixtures answer for product 8; run the checks with Fixtures selected."
        : retryButton
          ? "The missing-product page still offers Retry. Only the branch for other errors should render the button."
          : "The missing-product page should keep the Back to the products link below the branches."
    }
  ];
}
