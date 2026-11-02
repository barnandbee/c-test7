import { Sheet } from "./Sheet";

const logoUrl = `${import.meta.env.BASE_URL}bass-moultapps-logo.jpg`;

export function AboutDialog({ onClose }: { onClose: () => void }) {
  return (
    <Sheet title="About" onClose={onClose} class="about">
      <img src={logoUrl} alt="Bass Moultapps logo: a stained-glass peacock in shades of blue" width={160} height={157} />
      <h3>Training week</h3>
      <p>
        Made by <strong>Bass Moultapps</strong>.
      </p>
      <p class="muted">A weekly pick list for runs, strength and mobility. Everything is stored on this device; nothing is sent anywhere.</p>
      <button type="button" class="btn" onClick={onClose}>
        Close
      </button>
    </Sheet>
  );
}
