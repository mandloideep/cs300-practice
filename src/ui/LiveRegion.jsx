// A visually hidden polite live region. Screen readers announce each new message once the user
// pauses; keying the text by message id makes a repeated message announce again.
export default function LiveRegion({ message }) {
  return (
    <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
      {message && <span key={message.id}>{message.text}</span>}
    </div>
  );
}
