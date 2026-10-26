import SiteHeader from "./SiteHeader.jsx";
import SiteFooter from "./SiteFooter.jsx";

function Card({ children }) {
  return <article className="card">{children}</article>;
}

function CourseCard({ title, level = "all levels" }) {
  const heading = title.toUpperCase();
  return (
    <Card>
      <h2>{heading}</h2>
      <p>Level: {level}</p>
    </Card>
  );
}

export default function App() {
  return (
    <div className="page">
      <SiteHeader siteName="NEIU Computer Science" />
      <main>
        <h1>Course catalog</h1>
        <p className="lead">Courses offered next term.</p>
        <section className="card-grid">
          <CourseCard title="Programming II" level="foundation" />
          <CourseCard title="Client-Side Web Development" level="advanced" />
          <CourseCard title="Database Systems" level="advanced" />
          <CourseCard title="Web Accessibility Workshop" />
          <Card>
            <h2>Not sure where to start?</h2>
            <p>Meet with your advisor before registration opens.</p>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
