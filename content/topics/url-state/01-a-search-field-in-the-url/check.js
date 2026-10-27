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
  const titles = () => [...document.querySelectorAll(".product-list .product-title")].map((link) => link.textContent.trim());

  navLink("/products")?.click();
  await settle();
  const input = document.querySelector('input[type="search"]');
  const allCount = titles().length;
  if (input) type(input, "red");
  await wait(100);
  const redTitles = titles();
  const valueAfterTyping = input?.value ?? "";
  if (input) type(input, "");
  await wait(100);
  const clearedCount = titles().length;

  if (input) type(input, "red");
  await wait(100);
  navLink("/products")?.click();
  await wait(100);
  const valueAfterNav = document.querySelector('input[type="search"]')?.value ?? "";
  const countAfterNav = titles().length;

  navLink("/")?.click();
  await wait(50);

  return [
    {
      id: "search-filters-the-list",
      title: "Typing red narrows the list to the products with red in the title",
      pass: allCount === 8 && valueAfterTyping === "red" && redTitles.length === 2 && redTitles.every((title) => /red/i.test(title)) && clearedCount === 8,
      hint: !input
        ? "There is no search input on the Products page."
        : valueAfterTyping !== "red"
          ? `After typing red the box shows "${valueAfterTyping}". The input's value should be query, read from the address, and handleSearch should write the typed value with setSearchParams.`
          : redTitles.length !== 2
            ? `With red in the box the list shows ${redTitles.length} products. The filter should read query from searchParams.get(\"q\").`
            : "Clearing the box should bring every product back; an empty value should remove q from the address."
    },
    {
      id: "search-lives-in-the-address",
      title: "Pressing Products in the nav opens the plain /products address with no search",
      pass: valueAfterNav === "" && countAfterNav === 8,
      hint: `With red in the box, pressing the Products link left "${valueAfterNav}" in the box and ${countAfterNav} products. The link goes to /products with no query string, so a search kept in the address is cleared by it; a search kept in useState is not.`
    }
  ];
}
