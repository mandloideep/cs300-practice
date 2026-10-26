import { useEffect, useState } from "react";

function Search() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    if (query === "") return;
    fetch(import.meta.env.API_BASE + "/items/" + query)
      .then((response) => response.json())
      .then((data) => setResult(data.query));
  }, [query]);

  return (
    <section>
      <label>
        Query
        <input id="query" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <p id="result">{result ? `Results for ${result}` : "No results yet"}</p>
    </section>
  );
}

function Count() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    fetch(import.meta.env.API_BASE + "/count")
      .then((response) => response.json())
      .then((data) => setCount(data.count));
  }, []);

  return <p id="count">{count === null ? "Counting" : `${count} items`}</p>;
}

export default function App() {
  const [note, setNote] = useState("");

  async function check() {
    const response = await fetch(import.meta.env.API_BASE + "/check");
    const data = await response.json();
    setNote(`Checked ${data.count}`);
  }

  return (
    <main>
      <Search />
      <Count />
      <button type="button" id="check" onClick={check}>
        Check
      </button>
      <p id="note">{note}</p>
    </main>
  );
}
