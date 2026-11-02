import type { ComponentChildren } from "preact";
import { useEffect, useRef } from "preact/hooks";

interface Props {
  title: string;
  onClose: () => void;
  children: ComponentChildren;
  /** Extra class, e.g. "about". */
  class?: string;
}

/**
 * A modal dialog that slides up from the bottom on phones.
 * Mount it to open; it calls onClose on Escape, backdrop tap or the close button.
 */
export function Sheet({ title, onClose, children, class: cls }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useRef(`sheet-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    const el = ref.current!;
    if (!el.open) el.showModal();
    return () => {
      if (el.open) el.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      class={`sheet${cls ? ` ${cls}` : ""}`}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div class="sheet-head">
        <h2 id={titleId}>{title}</h2>
        <button type="button" class="icon-btn" aria-label="Close" onClick={onClose}>
          ×
        </button>
      </div>
      <div class="sheet-body">{children}</div>
    </dialog>
  );
}
