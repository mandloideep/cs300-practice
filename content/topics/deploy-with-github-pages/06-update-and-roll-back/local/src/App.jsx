const topics = [
  { title: "Git basics", done: true },
  { title: "Git collaboration", done: true },
  { title: "Deploy with GitHub Pages", done: false },
];

function App() {
  return (
    <main>
      <h1>Study plan</h1>
      <ul className="topics">
        {topics.map((topic) => (
          <li key={topic.title} className={topic.done ? "done" : undefined}>
            {topic.title}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
