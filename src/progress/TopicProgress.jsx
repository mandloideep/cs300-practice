import ProgressNote from "./ProgressNote.jsx";
import { topicCompletion } from "./store.js";

// Per-topic completion; shows nothing for an untouched topic unless `showEmpty` asks for the
// "Not started" line.
export default function TopicProgress({ topic, progress, showEmpty = false }) {
  const { done, total, complete } = topicCompletion(progress, topic);
  if (total === 0) return null;
  if (done === 0 && !showEmpty) return null;
  const label = complete
    ? "Complete"
    : done === 0
      ? `Not started, ${total} ${total === 1 ? "step" : "steps"}`
      : `${done} of ${total} steps complete`;

  return (
    <ProgressNote
      done={done}
      total={total}
      complete={complete}
      label={label}
      name={`${topic.title} progress`}
    />
  );
}
