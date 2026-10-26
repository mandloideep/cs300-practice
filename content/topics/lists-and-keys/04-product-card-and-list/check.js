export default async function check({ document, console, inspector }) {
  const lists = inspector.components.filter((component) => component.name === "ProductList");
  const cards = inspector.components.filter((component) => component.name === "ProductCard");
  const rows = [...document.querySelectorAll(".product--row")];
  const boxes = [...document.querySelectorAll(".product--card")];
  const keyWarnings = console.filter((entry) => /unique ["']?key["']? prop/i.test(entry.text));
  return [
    {
      id: "two-product-lists",
      title: "App renders two ProductList components",
      pass: lists.length === 2 && lists.some((list) => list.props.variant === "row"),
      hint: `The inspector sees ${lists.length} ProductList components. Render <ProductList items={topRated} variant="row" /> and <ProductList items={visibleProducts} /> inside the fragment.`
    },
    {
      id: "cards-in-both-lists",
      title: "Every product is drawn by ProductCard",
      pass: cards.length === 8 && keyWarnings.length === 0,
      hint:
        keyWarnings.length > 0
          ? "React is warning about keys again. Keep key={product.id} on the li that the map callback returns."
          : `The inspector sees ${cards.length} ProductCard components; expected 2 top rated plus 6 in the grid. Replace the spans in ProductList with <ProductCard product={product} variant={variant} />.`
    },
    {
      id: "variants-differ",
      title: "The row and card variations look different",
      pass:
        rows.length === 2 &&
        boxes.length === 6 &&
        rows.every((row) => !row.querySelector(".product-meta")) &&
        boxes.every((box) => /rated/.test(box.querySelector(".product-meta")?.textContent ?? "")),
      hint: `Found ${rows.length} .product--row and ${boxes.length} .product--card articles. ProductCard should build its class from variant and show the category and rating only when variant is "card".`
    }
  ];
}
