// Stub owned by the editor and layout stream until the inspector stream replaces this file.
export default function InspectorPane({ session, step }) {
  const commits = session.inspectorCommits.length;
  const names = [
    ...new Set((session.latestCommit?.components ?? []).map((component) => component.name)),
  ];
  const views = step.inspector?.views;

  return (
    <section className="pane pane--inspector" aria-labelledby="inspector-heading">
      <div className="pane__header">
        <h2 id="inspector-heading">Inspector</h2>
        <span className="meta">
          {commits} {commits === 1 ? "commit" : "commits"} received
        </span>
      </div>
      <p className="meta">
        The inspector draws component boundaries, re-render flashes, and the component tree here.
        {views?.length > 0 && ` This step opens with: ${views.join(", ")}.`}
      </p>
      {names.length > 0 && (
        <p className="meta">Components in the latest commit: {names.join(", ")}.</p>
      )}
    </section>
  );
}
