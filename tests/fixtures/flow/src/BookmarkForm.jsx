export default function BookmarkForm({ onAdd }) {
  return (
    <div>
      <button type="button" className="add" onClick={() => onAdd("Vite guide")}>
        Add
      </button>
      <button type="button" className="note" onClick={() => console.log("noted")}>
        Note
      </button>
    </div>
  );
}
