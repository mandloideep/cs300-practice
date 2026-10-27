import { useState } from "react";

export default function App() {
  const [quantity, setQuantity] = useState(0);

  function addThree() {
    setQuantity(quantity + 1);
    setQuantity(quantity + 1);
    setQuantity(quantity + 1);
  }

  function addOneAndReport() {
    setQuantity(quantity + 1);
    setTimeout(() => {
      console.log("Quantity a moment later:", quantity);
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
