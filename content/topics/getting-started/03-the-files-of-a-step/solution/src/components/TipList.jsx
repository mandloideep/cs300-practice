export default function TipList({ tips }) {
  return (
    <ul className="tips">
      {tips.map((tip) => (
        <li key={tip}>{tip}</li>
      ))}
    </ul>
  );
}
