export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);
  const cartText =
    '{"owner":"Alice","items":[{"title":"Notebook","price":4.5,"quantity":2},{"title":"Pens","price":3,"quantity":1}]}';

  return [
    {
      id: "stringify-makes-a-string",
      title: "JSON.stringify turns the cart into a string with no keys of its own",
      pass: has(`As text: ${cartText}`) && has("Type of text: string") && has("text.owner: undefined"),
      hint: "Make const text = JSON.stringify(cart), then log text, typeof text, and text.owner with their labels."
    },
    {
      id: "parse-makes-new-objects",
      title: "JSON.parse builds new objects, so changing them leaves the cart alone",
      pass: has("Restored owner: Alice") && has("Same object? false") && has("cart quantity: 2"),
      hint: "Make const restored = JSON.parse(text), log restored.owner and restored === cart, change restored.items[0].quantity, and log cart.items[0].quantity."
    },
    {
      id: "json-drops-what-it-cannot-carry",
      title: "The round trip drops the function and undefined and turns the date into a string",
      pass:
        has('Keys before: ["id","placed","coupon","formatTotal"]') &&
        has('Keys after: ["id","placed"]') &&
        has("placed before: object after: string") &&
        has("placed after: 2026-10-27T15:00:00.000Z"),
      hint: "Make roundTrip with JSON.parse(JSON.stringify(order)), then log Object.keys of both objects, typeof placed on each, and roundTrip.placed."
    }
  ];
}
