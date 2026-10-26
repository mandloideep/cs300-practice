const concept = {
  name: "Root rendering",
  week: 10,
  session: 1,
  summary: "createRoot owns the application container.",
  reference: "https://react.dev/reference/react-dom/client/createRoot"
};

export default function ConceptCard() {
  return (
    <article className="concept-card">
      <header>
        <p className="eyebrow">Week {concept.week}, Session {concept.session}</p>
        <h2>{concept.name}</h2>
      </header>
      <p>{concept.summary}</p>
      <footer>
        <a href={concept.reference}>Read the reference</a>
      </footer>
    </article>
  );
}
