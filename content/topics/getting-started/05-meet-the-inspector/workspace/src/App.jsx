import { useState } from "react";

console.log("App.jsx ran once, when the page loaded.");

function Tally({ label }) {
  const [count, setCount] = useState(0);

  return (
    <p className="counter">
      <button type="button" onClick={() => setCount(count + 1)}>
        {label}
      </button>
      <span>Count: {count}</span>
    </p>
  );
}

export default function App() {
  function handleClick() {
    console.log("The button was clicked.");
  }

  return (
    <main>
      <h1>My first week in CS300</h1>
      <p>This page is a small React app, and I just changed it.</p>
      <ul className="plan">
        <li>Read the explanation</li>
        <li>Type the edit</li>
        <li>Run and look</li>
        <li>Read the checks</li>
      </ul>
      <button type="button" onClick={handleClick}>Say hello to the console</button>
      <h2>Next up</h2>
      <p>The inspector, which shows the parts of this page.</p>
      <Tally label="Runs" />
    </main>
  );
}
