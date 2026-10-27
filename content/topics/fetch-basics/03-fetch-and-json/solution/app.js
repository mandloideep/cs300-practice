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
  const response = await fetch(import.meta.env.API_BASE + "/products?limit=8");
  console.log("response status", response.status, "ok", response.ok);
  const data = await response.json();
  console.log("data has", Object.keys(data));
  renderProducts(data.products);
}

button.addEventListener("click", loadProducts);
