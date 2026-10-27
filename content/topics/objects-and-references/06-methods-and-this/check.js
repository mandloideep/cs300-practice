export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);

  return [
    {
      id: "method-reads-this",
      title: "cart.describe() reads the owner and the items through this",
      pass: has("Alice has 2 items in the cart"),
      hint: "Add describe() to the cart, returning a template literal with this.owner and this.items.length, and log cart.describe()."
    },
    {
      id: "this-is-the-object-before-the-dot",
      title: "The same function called on Bob's cart describes Bob's cart",
      pass: has("Bob has 0 items in the cart"),
      hint: "Make bobsCart with owner \"Bob\", an empty items array, and describe: cart.describe, then log bobsCart.describe()."
    },
    {
      id: "wrapper-keeps-the-cart",
      title: "An arrow wrapper calls describe on the cart later",
      pass: has("Later: Alice has 2 items in the cart"),
      hint: "Write const describeLater = () => cart.describe(); and log describeLater() with the label \"Later:\"."
    }
  ];
}
