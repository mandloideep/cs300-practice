export default function SearchBox({ query, onChange }) {
  return (
    <label className="search">
      Search
      <input type="search" value={query} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
