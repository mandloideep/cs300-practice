const status = document.querySelector("#status");
const list = document.querySelector("#products");
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

async function loadProducts() {
  button.disabled = true;
  list.replaceChildren();
  status.textContent = "Loading products...";
  try {
    const response = await fetch(import.meta.env.API_BASE + "/products?limit=8");
    if (!response.ok) {
      throw new Error(`The server answered with status ${response.status}.`);
    }
    const data = await response.json();
    if (data.products.length === 0) {
      status.textContent = "No products found.";
      return;
    }
    renderProducts(data.products);
  } catch (error) {
    console.error("Loading failed:", error);
    status.textContent = "Could not load products. " + error.message;
  } finally {
    button.disabled = false;
  }
}

button.addEventListener("click", loadProducts);
