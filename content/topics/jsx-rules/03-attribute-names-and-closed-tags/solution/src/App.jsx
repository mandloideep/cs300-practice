function RootFacts() {
  return (
    <>
      <dt>One root</dt>
      <dd>A component returns one element, and that element may hold many others.</dd>
      <dt>Fragment</dt>
      <dd>Empty tags group elements without adding an element to the page.</dd>
    </>
  );
}

function FindConcept() {
  return (
    <div className="search">
      <label htmlFor="concept-search">Find a concept</label>
      <input id="concept-search" type="search" placeholder="Try fragment" />
    </div>
  );
}

export default function App() {
  const course = "CS300";
  const topics = ["JSX expressions", "Root rendering"];

  return (
    <main>
      <h1>React, Vite, JSX, and Rendering</h1>
      <p>{course} renders {topics.length} concepts from data.</p>
      <p><strong>{topics[0]}:</strong> Values render inside braces.</p>
      <p>Week {9 + 1} covers {topics.join(" and ")}.</p>
      <FindConcept />
      <dl>
        <RootFacts />
      </dl>
    </main>
  );
}
