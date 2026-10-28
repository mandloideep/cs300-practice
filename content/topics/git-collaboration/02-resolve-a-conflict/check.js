const MARKER = /^(<{7}|={7}|>{7})/m;

function type(input, text) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  setter.call(input, text);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function cartCount(document) {
  const text = document.querySelector(".cart-summary")?.textContent ?? "";
  const match = /^(\d+) items?\b/.exec(text.trim());
  return match ? Number(match[1]) : null;
}

export default async function check({ document, wait }) {
  const root = document.querySelector("#root");
  const heading = root?.querySelector("h1")?.textContent.trim() ?? null;
  const rendered = heading === "Campus Shop";
  const search = document.querySelector('.search input[type="search"]');
  const summary = document.querySelector(".cart-summary");
  const titles = () =>
    [...document.querySelectorAll(".product .title")].map((title) => title.textContent.trim());

  let filtered = [];
  if (search) {
    type(search, "hoo");
    await wait(50);
    filtered = titles();
    type(search, "");
    await wait(50);
  }
  const all = titles();

  const before = cartCount(document);
  document.querySelector(".product button")?.click();
  await wait(50);
  const after = cartCount(document);

  return [
    {
      id: "no-markers",
      title: "App.jsx compiles and no conflict marker is left",
      pass: rendered && !MARKER.test(root?.textContent ?? ""),
      hint: "The page renders only when every <<<<<<<, =======, and >>>>>>> line is gone from src/App.jsx. Replace each marked region with the lines that keep both features."
    },
    {
      id: "both-features-render",
      title: "The search box and the cart summary both render",
      pass: Boolean(search) && Boolean(summary),
      hint: !search
        ? "The search box is missing. Keep the SearchBox import and <SearchBox query={query} onChange={setQuery} /> from the HEAD side."
        : "The cart summary is missing. Keep the CartSummary import and <CartSummary items={cart} /> from the cart-summary side."
    },
    {
      id: "search-filters",
      title: "Typing hoo in the search box leaves only the Hoodie",
      pass: filtered.length === 1 && filtered[0] === "Hoodie" && all.length === 4,
      hint: "Pass the filtered list, products={shown}, to ProductList, and keep the query state and the shown filter from the HEAD side."
    },
    {
      id: "cart-counts",
      title: "Add to cart adds one item to the cart summary",
      pass: before !== null && after === before + 1,
      hint: "Keep the cart state from the cart-summary side and pass onAdd={(product) => setCart([...cart, product])} to the same ProductList that receives products={shown}."
    }
  ];
}
