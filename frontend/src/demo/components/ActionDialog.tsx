import { ArrowDownToLine, EyeOff, X } from "lucide-react";
import { useCallback, useEffect, useRef, type FormEvent } from "react";

export type DemoDialogAction = "shield" | "unshield";

const DIALOG_COPY: Record<
  DemoDialogAction,
  { eyebrow: string; title: string; description: string; button: string }
> = {
  shield: {
    eyebrow: "Protocol simulation",
    title: "Fund private state",
    description:
      "Simulate a shield operation using the protocol's fixed-note reference use case. No transaction will be signed or submitted.",
    button: "Run shield simulation",
  },
  unshield: {
    eyebrow: "Protocol simulation",
    title: "Unshield note",
    description:
      "Model note consumption and a recipient-bound CT output. No transaction will be signed or submitted.",
    button: "Run unshield simulation",
  },
};

export function ActionDialog({
  action,
  onClose,
  onConfirm,
}: {
  action: DemoDialogAction;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const copy = DIALOG_COPY[action];
  const requestClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const controls = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (controls.length === 0) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [action, requestClose]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onConfirm();
  };

  const ActionIcon = action === "shield" ? EyeOff : ArrowDownToLine;

  return (
    <div className="demo-dialog-backdrop" role="presentation" onMouseDown={requestClose}>
      <section
        ref={dialogRef}
        className="demo-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="demo-dialog-header">
          <div>
            <span className="demo-eyebrow">{copy.eyebrow}</span>
            <h2 id="demo-dialog-title">{copy.title}</h2>
          </div>
          <button
            ref={closeButtonRef}
            className="demo-icon-button"
            type="button"
            onClick={requestClose}
            aria-label="Close dialog"
            title="Close"
          >
            <X aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={submit}>
          <p className="demo-dialog-description">{copy.description}</p>

          <div className="demo-dialog-amount">
            <span>Amount</span>
            <strong>100 CT</strong>
            <small>Local reference fixture denomination</small>
          </div>

          <div className="demo-dialog-route">
            <span>{action === "shield" ? "Destination" : "Recipient"}</span>
            <strong>
              {action === "shield" ? "Private balance" : "Connected public account"}
            </strong>
          </div>

          <div className="demo-dialog-actions">
            <button
              className="demo-button demo-button--quiet"
              type="button"
              onClick={requestClose}
            >
              Cancel
            </button>
            <button
              className="demo-button demo-button--primary"
              type="submit"
            >
              <ActionIcon aria-hidden="true" />
              {copy.button}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
