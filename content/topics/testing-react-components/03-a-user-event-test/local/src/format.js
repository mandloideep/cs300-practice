export function formatPrice(price) {
  return typeof price === "number" ? "$" + price.toFixed(2) : "Price not listed";
}
