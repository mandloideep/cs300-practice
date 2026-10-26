export default function BookmarkList({ bookmarks }) {
  return (
    <ul>
      {bookmarks.map((title) => (
        <li key={title}>{title}</li>
      ))}
    </ul>
  );
}
