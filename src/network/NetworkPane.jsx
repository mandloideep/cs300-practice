// Stub owned by the editor and layout stream until the network stream replaces this file.
export default function NetworkPane({ session }) {
  const requests = session.networkRequests.length;

  return (
    <section className="pane pane--network" aria-labelledby="network-heading">
      <div className="pane__header">
        <h2 id="network-heading">Network</h2>
        <span className="meta">
          {requests} {requests === 1 ? "request" : "requests"} received
        </span>
      </div>
      <p className="meta">Each request your code makes appears here with its state and timing.</p>
    </section>
  );
}
