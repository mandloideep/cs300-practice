const DATA_FILE = "products.json";

export function productsUrl() {
  return import.meta.env.BASE_URL + "data/" + DATA_FILE;
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
