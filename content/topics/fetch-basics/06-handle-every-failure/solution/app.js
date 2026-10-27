const status = document.querySelector("#status");
const list = document.querySelector("#products");
const form = document.querySelector("#search-form");
const button = document.querySelector("#load");

function renderProducts(products) {
  list.replaceChildren();
  for (const product of products) {
    const item = document.createElement("li");
    const title = document.createElement("span");
    title.className = "title";
    title.textContent = product.title;
    const price = document.createElement("span");
    price.className = "price";
    price.textContent = `$${product.price.toFixed(2)}`;
    item.append(title, price);
    list.append(item);
  }
  status.textContent = `${products.length} products loaded.`;
}

let loading = false;

async function loadProducts(query) {
  if (loading) return;
  loading = true;
  button.disabled = true;
  list.setAttribute("aria-busy", "true");
  list.replaceChildren();
  status.textContent = "Loading products...";
  try {
    const url = `${import.meta.env.API_BASE}/products/search?q=${encodeURIComponent(query)}&limit=8`;
    console.log("Requesting", url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`The server answered with status ${response.status}.`);
    }
    const data = await response.json();
    if (data.products.length === 0) {
      status.textContent = `No products match "${query}".`;
      return;
    }
    renderProducts(data.products);
  } catch (error) {
    console.error("Loading failed:", error);
    if (error instanceof TypeError) {
      status.textContent = "Could not reach the server. Check the connection and the API source, then try again.";
    } else if (error instanceof SyntaxError) {
      status.textContent = "The server answered, but not with JSON this page can read.";
    } else {
      status.textContent = "Could not load products. " + error.message;
    }
  } finally {
    loading = false;
    button.disabled = false;
    list.setAttribute("aria-busy", "false");
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = new FormData(form).get("q").trim();
  if (!query) {
    status.textContent = "Type something to search for.";
    return;
  }
  loadProducts(query);
});
