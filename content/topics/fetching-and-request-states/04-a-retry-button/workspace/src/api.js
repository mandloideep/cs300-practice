export async function loadProducts(category, signal) {
  const response = await fetch(import.meta.env.API_BASE + "/products/category/" + category + "?limit=4", { signal });
  if (!response.ok) {
    throw new Error(`The server answered with status ${response.status}.`);
  }
  const data = await response.json();
  return data.products;
}
