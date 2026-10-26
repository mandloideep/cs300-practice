export async function loadProducts(signal) {
  const response = await fetch(import.meta.env.API_BASE + "/products?limit=8", { signal });
  if (!response.ok) {
    throw new Error(`The server answered with status ${response.status}.`);
  }
  const data = await response.json();
  return data.products;
}
