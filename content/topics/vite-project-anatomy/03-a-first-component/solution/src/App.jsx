import { useState } from "react";
import Greeting from "./Greeting.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <section id="center">
      <div>
        <h1>My first component</h1>
        <Greeting />
        <Greeting />
        <Greeting />
        <p>
          Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
        </p>
      </div>
      <button type="button" className="counter" onClick={() => setCount((count) => count + 1)}>
        Count is {count}
      </button>
    </section>
  );
}

export default App;
