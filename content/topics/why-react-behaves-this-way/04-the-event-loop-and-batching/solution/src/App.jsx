import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);

  function handleAdd() {
    setCount(count + 1);
    setTotal(total + 4.99);
    console.log("In the handler, count is", count);
    console.log("In the handler, the page shows", document.querySelector(".count").textContent);
    setTimeout(() => {
      console.log("After a timer, the page shows", document.querySelector(".count").textContent);
    }, 0);
  }

  return (
    <main>
      <h1>Cart</h1>
      <p className="lead">
        <span className="count">Bottles of cooking oil: {count}</span>, ${total.toFixed(2)}
      </p>
      <button type="button" onClick={handleAdd}>Add a bottle</button>
    </main>
  );
}
