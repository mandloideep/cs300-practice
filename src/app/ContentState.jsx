import PageTitle from "./PageTitle.jsx";

export function Loading() {
  return (
    <p className="meta" role="status">
      Loading…
    </p>
  );
}

export function ContentMissing({ standalone = false }) {
  const Heading = standalone ? "h1" : "h2";
  return (
    <div className="notice">
      {standalone && <PageTitle>No content yet</PageTitle>}
      <Heading>No content yet</Heading>
      <p>
        The compiled content was not found. Run <code>npm run build:content</code> (or{" "}
        <code>npm run dev</code>, which runs it first) to generate <code>public/content/</code>.
      </p>
    </div>
  );
}

export function ContentError({ message, standalone = false }) {
  const Heading = standalone ? "h1" : "h2";
  return (
    <div className="notice notice--error" role="alert">
      {standalone && <PageTitle>Content error</PageTitle>}
      <Heading>The content could not be loaded</Heading>
      <p>{message}</p>
    </div>
  );
}

export function NotFoundNotice({ what, standalone = false, children }) {
  const Heading = standalone ? "h1" : "h2";
  return (
    <div className="notice">
      {standalone && <PageTitle>{`${what} not found`}</PageTitle>}
      <Heading>{what} not found</Heading>
      {children}
    </div>
  );
}

// Renders the right empty or error state for a loader result, or null when the result is ok.
// Pass `standalone` when the state replaces the whole page, so that it supplies the h1 and title.
export function contentFallback(result, { standalone = false } = {}) {
  if (result.status === "missing") return <ContentMissing standalone={standalone} />;
  if (result.status === "error") {
    return <ContentError message={result.message} standalone={standalone} />;
  }
  return null;
}
