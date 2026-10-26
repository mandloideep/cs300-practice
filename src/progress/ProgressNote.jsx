// One line of completion: the words, then a small bar that reads the same words to assistive
// technology. The checkmark is decoration; "Complete" carries the meaning.
export default function ProgressNote({ done, total, label, name, complete = done === total }) {
  return (
    <p className={complete ? "meta progress-note is-complete" : "meta progress-note"}>
      <span>
        {complete && <span aria-hidden="true">{"✓ "}</span>}
        {label}
      </span>
      <span
        className="progress-bar"
        role="progressbar"
        aria-label={name}
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
