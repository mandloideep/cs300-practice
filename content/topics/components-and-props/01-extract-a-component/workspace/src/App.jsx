export default function App() {
  return (
    <div className="page">
      <main>
        <h1>Course catalog</h1>
        <p className="lead">Courses offered next term.</p>
        <section className="card-grid">
          <article className="card"><h2>Programming II</h2><p>Level: foundation</p></article>
          <article className="card"><h2>Client-Side Web Development</h2><p>Level: advanced</p></article>
          <article className="card"><h2>Database Systems</h2><p>Level: advanced</p></article>
        </section>
      </main>
    </div>
  );
}
