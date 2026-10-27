import { useState } from "react";

export default function App() {
  const [quantity, setQuantity] = useState(0);

  function addThree() {
    setQuantity((current) => current + 1);
    setQuantity((current) => current + 1);
    setQuantity((current) => current + 1);
  }

  function addOneAndReport() {
    const next = quantity + 1;
    setQuantity(next);
    setTimeout(() => {
      console.log("Quantity a moment later:", next);
    }, 200);
  }

  return (
    <main>
      <h1>Cart</h1>
      <p className="lead">Apples in the cart: {quantity}</p>
      <div className="cart-controls">
        <button type="button" onClick={addThree}>Add three</button>
        <button type="button" onClick={addOneAndReport}>Add one and report</button>
      </div>
    </main>
  );
}
