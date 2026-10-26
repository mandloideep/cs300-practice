import { topicCompletion } from "./store.js";

// One line of per-topic completion with a small bar; shows nothing for an untouched topic unless
// `showEmpty` asks for the "Not started" line.
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
    <p className={complete ? "meta progress-note is-complete" : "meta progress-note"}>
      <span>
        {complete && <span aria-hidden="true">{"✓ "}</span>}
        {label}
      </span>
      <span
        className="progress-bar"
        role="progressbar"
        aria-label={`${topic.title} progress`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-valuetext={label}
      >
        <span className="progress-bar__fill" style={{ width: `${(100 * done) / total}%` }} />
      </span>
    </p>
  );
}
