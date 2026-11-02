import { useEffect, useRef, useState } from "preact/hooks";
import type { Activity, AppData } from "./types";
import { loadData, saveData } from "./lib/storage";
import { addDays, DAY_NAMES, formatShort, fromIso, mondayOf, today } from "./lib/dates";
import { addSession, removeSession, setDone } from "./lib/sessions";
import { MORE_VIDEOS } from "./data/library";
import { Lanes } from "./components/Lanes";
import { Diary } from "./components/Diary";
import { Library } from "./components/Library";
import { Toast, useToast } from "./components/Toast";
import { AboutDialog } from "./components/AboutDialog";

export function App() {
  const [initial] = useState(loadData);
  const [data, setData] = useState<AppData>(initial.data);
  const [monday, setMonday] = useState(() => mondayOf(today()));
  const [aboutOpen, setAboutOpen] = useState(false);
  const toast = useToast();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // Never write over stored data we couldn't read.
    if (initial.error) return;
    if (!saveData(data)) toast.show("Couldn’t save. Your browser storage may be full.");
  }, [data]);

  const thisMonday = mondayOf(today());
  const sunday = addDays(monday, 6);

  const onAdd = (activity: Activity, dayIndex: number) => {
    setData((d) => addSession(d, activity, addDays(monday, dayIndex)));
    toast.show(`Added ${activity.short} to ${DAY_NAMES[dayIndex]}`);
  };

  return (
    <>
      <header class="band">
        <div class="wrap top">
          <div>
            <h1>Training week</h1>
            <p class="sub">Pick from the library, add to a day, tap to mark done.</p>
          </div>
          <nav class="weeknav" aria-label="Change week">
            <button type="button" onClick={() => setMonday(addDays(monday, -7))} aria-label="Previous week">
              ‹
            </button>
            <span class="range" aria-live="polite">
              {formatShort(monday)} – {formatShort(sunday)}
              {fromIso(sunday).getFullYear() !== new Date().getFullYear() && ` ${fromIso(sunday).getFullYear()}`}
            </span>
            <button type="button" onClick={() => setMonday(addDays(monday, 7))} aria-label="Next week">
              ›
            </button>
            {monday !== thisMonday && (
              <button type="button" onClick={() => setMonday(thisMonday)}>
                This week
              </button>
            )}
          </nav>
        </div>
      </header>

      <main class="wrap">
        {initial.error && (
          <p class="alert" role="alert">
            {initial.error}
          </p>
        )}

        <Lanes sessions={data.sessions} monday={monday} targets={data.settings.targets} />

        <h2>Diary</h2>
        <Diary
          sessions={data.sessions}
          monday={monday}
          onToggle={(s) => {
            setData((d) => setDone(d, s.id, !s.done));
            if (!s.done) toast.show(`${s.snapshot.short} done`);
          }}
          onRemove={(s) => setData((d) => removeSession(d, s.id))}
        />
        <p class="hint">Filled circle = done. Ring = planned. Tap a session to mark it done, tap again to undo.</p>

        <h2>Library</h2>
        <Library onAdd={onAdd} />

        <footer class="foot">
          <p>
            Follow-along videos:{" "}
            <a href={MORE_VIDEOS[0].url} target="_blank" rel="noopener">
              {MORE_VIDEOS[0].label}
            </a>{" "}
            and{" "}
            <a href={MORE_VIDEOS[1].url} target="_blank" rel="noopener">
              {MORE_VIDEOS[1].label}
            </a>{" "}
            both have plenty more once you’ve worked through these. Your diary is saved on this device only.
          </p>
          <p>
            <button type="button" class="linkish" onClick={() => setAboutOpen(true)}>
              About this app
            </button>
          </p>
        </footer>
      </main>

      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <Toast state={toast} />
    </>
  );
}
