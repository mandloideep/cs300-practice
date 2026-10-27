import { useState } from "react";

const shelf = ["Apple", "Cooking Oil", "Powder Canister", "Dior J'adore"];

export default function App() {
  const [items, setItems] = useState([{ id: 1, title: "Essence Mascara Lash Princess" }]);

  function handleAdd() {
    const next = { id: items.length + 1, title: shelf[(items.length - 1) % shelf.length] };
    const nextItems = [...items, next];
    console.log("Same array as before?", nextItems === items);
    setItems(nextItems);
    console.log("The new array holds", nextItems.length, "items");
  }

  return (
    <main>
      <h1>Cart</h1>
      <p className="lead">Items in the cart: {items.length}</p>
      <button type="button" onClick={handleAdd}>Add the next item</button>
      <ul className="task-list">
        {items.map((item) => (
          <li key={item.id} className="task">
            {item.title}
          </li>
        ))}
      </ul>
    </main>
  );
}
