import { useEffect, useId, useRef } from "react";

// A modal built on the native dialog element, which traps focus, closes on Escape, and returns
// focus to the control that opened it.
export default function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  wide = false,
}) {
  const ref = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={wide ? "dialog dialog--wide" : "dialog"}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      {open && (
        <>
          <div className="dialog__header">
            <h2 id={titleId}>{title}</h2>
            <button type="button" className="button button--quiet" onClick={onClose}>
              Close
            </button>
          </div>
          {description && (
            <p id={descriptionId} className="dialog__description">
              {description}
            </p>
          )}
          {children}
          {actions && <div className="dialog__actions">{actions}</div>}
        </>
      )}
    </dialog>
  );
}

export function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onCancel }) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      actions={
        <>
          <button type="button" className="button button--danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button type="button" className="button" onClick={onCancel}>
            Cancel
          </button>
        </>
      }
    />
  );
}
