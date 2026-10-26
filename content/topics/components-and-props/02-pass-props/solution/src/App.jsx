function CourseCard({ title, level }) {
  return (
    <article className="card">
      <h2>{title}</h2>
      <p>Level: {level}</p>
    </article>
  );
}

export default function App() {
  return (
    <div className="page">
      <main>
        <h1>Course catalog</h1>
        <p className="lead">Courses offered next term.</p>
        <section className="card-grid">
          <CourseCard title="Programming II" level="foundation" />
          <CourseCard title="Client-Side Web Development" level="advanced" />
          <CourseCard title="Database Systems" level="advanced" />
        </section>
      </main>
    </div>
  );
}
