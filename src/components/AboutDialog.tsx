import { useEffect, useRef } from "preact/hooks";

const logoUrl = `${import.meta.env.BASE_URL}bass-moultapps-logo.jpg`;

export function AboutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      class="about"
      aria-labelledby="about-title"
      onClose={onClose}
      onClick={(e) => {
        // Click on the backdrop closes the dialog.
        if (e.target === ref.current) onClose();
      }}
    >
      <img src={logoUrl} alt="Bass Moultapps logo: a stained-glass peacock in shades of blue" width={160} height={157} />
      <h2 id="about-title">Training week</h2>
      <p>
        Made by <strong>Bass Moultapps</strong>.
      </p>
      <p class="muted">A weekly pick list for runs, strength and mobility. Everything is stored on this device; nothing is sent anywhere.</p>
      <form method="dialog">
        <button type="submit" class="btn">
          Close
        </button>
      </form>
    </dialog>
  );
}
