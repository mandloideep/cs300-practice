export default async function check({ document, wait }) {
  const navLink = (path) => document.querySelector(`nav a[href="${path}"]`);
  const isLoading = () => /Loading products/.test(document.body.textContent);
  const settle = async () => {
    await wait(50);
    for (let elapsed = 0; elapsed < 8000 && isLoading(); elapsed += 100) {
      await wait(100);
    }
  };
  const type = (input, text) => {
    const setter = Object.getOwnPropertyDescriptor(document.defaultView.HTMLInputElement.prototype, "value").set;
    setter.call(input, text);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };
  const choose = (select, value) => {
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  };
  const shown = () => document.querySelector(".share code")?.textContent.trim() ?? "";

  navLink("/products")?.click();
  await settle();
  const plain = shown();
  const input = document.querySelector('input[type="search"]');
  const select = document.querySelector("select");
  if (select) choose(select, "beauty");
  await wait(100);
  if (input) type(input, "red");
  await wait(100);
  const filtered = shown();
  const params = new URLSearchParams(filtered.split("?")[1] ?? "");
  const copyButton = [...document.querySelectorAll("main button")].find((button) => /copy/i.test(button.textContent));
  copyButton?.click();
  await wait(300);
  const status = [...document.querySelectorAll('main [role="status"]')].map((node) => node.textContent.trim());
  const reported = status.some((text) => /copied|could not copy/i.test(text));
  if (input) type(input, "");
  await wait(100);
  if (select) choose(select, "all");
  await wait(100);

  navLink("/")?.click();
  await wait(50);

  return [
    {
      id: "address-shown-on-the-page",
      title: "The page shows the current path and query string",
      pass: plain === "/products" && filtered.startsWith("/products?") && params.get("q") === "red" && params.get("category") === "beauty",
      hint:
        plain === ""
          ? "No <code> element shows the address. Render shareable, built from location.pathname and location.search, inside the share line."
          : `The share line reads "${filtered}" after choosing Beauty and typing red; it should be /products followed by both parameters.`
    },
    {
      id: "copy-reports-back",
      title: "Pressing Copy link reports whether the copy succeeded",
      pass: Boolean(copyButton) && reported,
      hint: copyButton
        ? "After pressing Copy link no status message appeared. Both the then and the catch of writeText should call setCopied with a message."
        : "There is no Copy link button on the Products page."
    }
  ];
}
