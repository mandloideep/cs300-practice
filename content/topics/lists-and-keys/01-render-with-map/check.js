export default async function check({ document }) {
  const items = [...document.querySelectorAll(".product-list > li")];
  const lead = document.querySelector(".lead")?.textContent ?? "";
  const count = Number.parseInt(lead, 10);
  const titles = items.map((item) => item.querySelector(".product-title")?.textContent.trim());
  const prices = items.map((item) => item.querySelector(".product-price")?.textContent.trim());
  return [
    {
      id: "six-items",
      title: "One list item per product",
      pass: items.length > 1 && items.length === count,
      hint: `The lead says ${count} products and the list has ${items.length} items. Replace the hand-written li with {products.map(...)} so every object becomes a row.`
    },
    {
      id: "items-from-data",
      title: "Each row shows a product title from the array",
      pass: titles.length > 1 && titles[0] === "Essence Mascara Lash Princess" && titles.includes("Cooking Oil"),
      hint: "Each li needs a span with className=\"product-title\" that renders {product.title}."
    },
    {
      id: "prices-formatted",
      title: "Prices show a dollar sign and two decimals",
      pass: prices.length > 1 && prices.every((price) => /^\$\d+\.\d\d$/.test(price ?? "")),
      hint: `The first price reads "${prices[0] ?? "nothing"}". Render ${"$"}{product.price.toFixed(2)} inside a span with className="product-price".`
    }
  ];
}
