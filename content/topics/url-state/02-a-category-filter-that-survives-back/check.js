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
  const titles = () => [...document.querySelectorAll(".product-list .product-title")].map((link) => link.textContent.trim());

  navLink("/products")?.click();
  await settle();
  const input = document.querySelector('input[type="search"]');
  const select = document.querySelector("select");
  if (select) choose(select, "fragrances");
  await wait(100);
  const fragrances = titles();
  const selectedAfterChoice = select?.value;
  if (input) type(input, "coco");
  await wait(100);
  const combined = titles();
  const selectedAfterTyping = select?.value;
  const valueAfterTyping = input?.value;
  if (input) type(input, "");
  await wait(100);
  if (select) choose(select, "all");
  await wait(100);
  const restored = titles().length;

  navLink("/")?.click();
  await wait(50);

  return [
    {
      id: "category-filters-the-list",
      title: "Choosing Fragrances narrows the list to the three fragrances",
      pass: Boolean(select) && selectedAfterChoice === "fragrances" && fragrances.length === 3 && restored === 8,
      hint: !select
        ? "There is no category select on the Products page."
        : selectedAfterChoice !== "fragrances"
          ? "The select snaps back after a choice. Its value should be category, read from the address, and handleCategory should write the chosen value."
          : `With Fragrances chosen the list shows ${fragrances.length} products; the filter should compare product.category with category unless category is all.`
    },
    {
      id: "filters-combine",
      title: "Typing coco keeps the category and leaves one product",
      pass: combined.length === 1 && selectedAfterTyping === "fragrances" && valueAfterTyping === "coco",
      hint:
        selectedAfterTyping !== "fragrances"
          ? "Typing in the search box dropped the category. handleSearch should copy searchParams into a new URLSearchParams before setting q."
          : `With Fragrances and coco the list shows ${combined.length} products; both conditions should apply in the filter.`
    }
  ];
}
