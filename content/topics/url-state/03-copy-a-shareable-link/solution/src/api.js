export function productsUrl() {
  return import.meta.env.API_BASE + "/products?limit=8";
}

export function productUrl(id) {
  return import.meta.env.API_BASE + "/products/" + id;
}

export async function loadJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    const error = new Error("The server answered with status " + response.status + ".");
    error.status = response.status;
    throw error;
  }
  return response.json();
}
