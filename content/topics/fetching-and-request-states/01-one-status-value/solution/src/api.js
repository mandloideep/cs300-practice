export async function loadProducts() {
  const response = await fetch(import.meta.env.API_BASE + "/products?limit=8");
  if (!response.ok) {
    throw new Error(`The server answered with status ${response.status}.`);
  }
  const data = await response.json();
  return data.products;
}
