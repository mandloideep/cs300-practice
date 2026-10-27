export function productsUrl(category) {
  return import.meta.env.API_BASE + "/products/category/" + category + "?limit=4";
}

export async function loadJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`The server answered with status ${response.status}.`);
  }
  return response.json();
}
