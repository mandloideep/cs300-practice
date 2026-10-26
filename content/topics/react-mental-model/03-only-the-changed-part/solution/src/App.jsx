import { useState } from "react";

function Header() {
  return (
    <header>
      <h1>Study tracker</h1>
      <p>This header never changes, so React has no reason to touch it.</p>
    </header>
  );
}

function ReviewPanel() {
  const total = 3;
  const [reviewed, setReviewed] = useState(0);

  return (
    <section>
      <p>Reviewed {reviewed} of {total} concepts.</p>
      <p>{reviewed === total ? "All concepts reviewed." : "Keep going."}</p>
      <button type="button" disabled={reviewed === total} onClick={() => setReviewed(reviewed + 1)}>
        Review one concept
      </button>
    </section>
  );
}

export default function App() {
  return (
    <main>
      <Header />
      <ReviewPanel />
    </main>
  );
}
