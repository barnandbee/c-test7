import { useEffect, useRef, useState } from "preact/hooks";
import { registerSW } from "virtual:pwa-register";

/**
 * Registers the service worker that makes the app work offline. When a new
 * version has been deployed, offers a reload instead of reloading by itself.
 */
export function UpdateBanner({ onOfflineReady }: { onOfflineReady: () => void }) {
  const [needRefresh, setNeedRefresh] = useState(false);
  const update = useRef<((reload?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    update.current = registerSW({
      onNeedRefresh: () => setNeedRefresh(true),
      onOfflineReady,
    });
  }, []);

  if (!needRefresh) return null;
  return (
    <div class="update-banner" role="status">
      <span>A new version of the app is ready.</span>
      <button type="button" class="btn" onClick={() => update.current?.(true)}>
        Reload
      </button>
      <button type="button" class="btn-plain" onClick={() => setNeedRefresh(false)}>
        Later
      </button>
    </div>
  );
}
