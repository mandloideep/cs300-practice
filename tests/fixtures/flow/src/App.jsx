import { useEffect, useState } from "react";
import BookmarkForm from "./BookmarkForm.jsx";
import BookmarkList from "./BookmarkList.jsx";
import Counter from "./Counter.jsx";

export default function App() {
  const [bookmarks, setBookmarks] = useState(["React docs", "MDN"]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "r") setReady(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function addBookmark(title) {
    setBookmarks((current) => [...current, title]);
  }

  return (
    <main>
      <p id="status">{ready ? "ready" : "loading"}</p>
      <BookmarkForm onAdd={addBookmark} />
      <BookmarkList bookmarks={bookmarks} />
      <Counter />
    </main>
  );
}
