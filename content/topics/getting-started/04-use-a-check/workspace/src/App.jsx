console.log("App.jsx ran once, when the page loaded.");

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
      </ul>
      <button type="button" onClick={handleClick}>Say hello to the console</button>
    </main>
  );
}
