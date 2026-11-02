import { useRef, useState } from "preact/hooks";
import { CATEGORIES, CATEGORY_ORDER } from "../data/categories";
import { setTarget } from "../lib/targets";
import { backupFileName, exportJson, parseBackup } from "../lib/backup";
import { today } from "../lib/dates";
import type { AppData } from "../types";
import type { Update } from "../app";

interface Props {
  data: AppData;
  update: Update;
  onImport: (data: AppData) => void;
  toast: (msg: string) => void;
  onAbout: () => void;
}

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function SettingsView({ data, update, onImport, toast, onAbout }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState("");

  const onFile = async (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    setImportError("");
    try {
      const result = parseBackup(await file.text());
      const ok = confirm(
        `Replace everything in the app with this backup?\n\n` +
          `It has ${result.sessions} sessions and ${result.customActivities} of your own activities.\n` +
          `What’s on this device now will be lost unless you export it first.`,
      );
      if (!ok) return;
      onImport(result.data);
      toast("Backup restored");
    } catch (err) {
      setImportError((err as Error).message);
    }
  };

  return (
    <>
      <section aria-labelledby="targets-title">
        <h2 id="targets-title">Weekly targets</h2>
        <div class="targets">
          {CATEGORY_ORDER.map((c) => {
            const n = data.settings.targets[c];
            return (
              <div class="target" key={c} style={{ "--c": `var(--${c})` }}>
                <span class="target-name" id={`t-${c}`}>
                  {CATEGORIES[c].label}
                  {CATEGORIES[c].optional && <small> (optional, doesn’t affect streaks)</small>}
                </span>
                <div class="stepper" role="group" aria-labelledby={`t-${c}`}>
                  <button type="button" aria-label={`Fewer ${CATEGORIES[c].label.toLowerCase()}`} disabled={n <= 0} onClick={() => update((d) => setTarget(d, c, n - 1))}>
                    −
                  </button>
                  <output aria-live="polite">{n}</output>
                  <button type="button" aria-label={`More ${CATEGORIES[c].label.toLowerCase()}`} disabled={n >= 14} onClick={() => update((d) => setTarget(d, c, n + 1))}>
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <p class="muted small">Changes apply to every week, including past ones.</p>
      </section>

      <section aria-labelledby="backup-title">
        <h2 id="backup-title">Back up and restore</h2>
        <p>
          Your data lives only in this browser. Export a backup now and then, and use it to move your data to another
          device.
        </p>
        <div class="actions">
          <button
            type="button"
            class="btn"
            onClick={() => {
              download(backupFileName(today()), exportJson(data));
              toast("Backup exported");
            }}
          >
            Export backup
          </button>
          <button type="button" class="btn-plain" onClick={() => fileInput.current?.click()}>
            Import backup…
          </button>
          <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={onFile} />
        </div>
        {importError && (
          <p class="field-error" role="alert">
            {importError}
          </p>
        )}
        <p class="muted small">
          {data.sessions.length} sessions and {data.customActivities.filter((a) => !a.deleted).length} of your own
          activities on this device.
        </p>
      </section>

      <section aria-labelledby="app-title">
        <h2 id="app-title">App</h2>
        <button type="button" class="btn-plain" onClick={onAbout}>
          About this app
        </button>
      </section>
    </>
  );
}
