import { useEffect, useRef, useState } from "preact/hooks";
import type { Activity, AppData, CustomActivity } from "./types";
import { loadData, saveData } from "./lib/storage";
import { addDays, DAY_NAMES, formatShort, fromIso, mondayOf, today } from "./lib/dates";
import { addSession, removeSession, setDone } from "./lib/sessions";
import { deleteCustomActivity, findActivity, saveCustomActivity } from "./lib/activities";
import { hrefFor, useRoute, type Route } from "./route";
import { Toast, useToast } from "./components/Toast";
import { AboutDialog } from "./components/AboutDialog";
import { AddSessionSheet } from "./components/AddSessionSheet";
import { SessionSheet } from "./components/SessionSheet";
import { ActivityEditor } from "./components/ActivityEditor";
import { CalendarSheet } from "./components/CalendarSheet";
import { WeekView } from "./views/WeekView";
import { LibraryView } from "./views/LibraryView";
import { PacesView } from "./views/PacesView";
import { SettingsView } from "./views/SettingsView";
import { StatsView } from "./views/StatsView";
import { UpdateBanner } from "./components/UpdateBanner";

type Modal =
  | { kind: "about" }
  | { kind: "add"; date: string }
  | { kind: "session"; id: string; justDone: boolean }
  | { kind: "calendar"; id: string }
  | { kind: "edit"; activity: CustomActivity; isNew: boolean };

export type Update = (fn: (d: AppData) => AppData) => void;

const TABS: [Route, string][] = [
  ["week", "Week"],
  ["library", "Library"],
  ["paces", "Paces"],
  ["stats", "Stats"],
  ["settings", "Settings"],
];

const SUBTITLES: Record<Route, string> = {
  week: "Pick from the library, add to a day, tap to mark done.",
  library: "Tap an activity for details. Star your favourites.",
  paces: "Your training paces, worked out from your 5km time.",
  stats: "Streaks, distance and progress over time.",
  settings: "Weekly targets, backups and app details.",
};

export function App() {
  const [initial] = useState(loadData);
  const [data, setData] = useState<AppData>(initial.data);
  const [monday, setMonday] = useState(() => mondayOf(today()));
  const [modal, setModal] = useState<Modal | null>(null);
  // Saving stays off while stored data couldn't be read, until a backup is restored.
  const [saveBlocked, setSaveBlocked] = useState(Boolean(initial.error));
  const route = useRoute();
  const toast = useToast();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // Never write over stored data we couldn't read.
    if (saveBlocked) return;
    if (!saveData(data)) toast.show("Couldn’t save. Your browser storage may be full.");
  }, [data]);

  const update: Update = (fn) => setData(fn);
  const thisMonday = mondayOf(today());
  const sunday = addDays(monday, 6);
  const showWeekNav = route === "week" || route === "library";

  const addToDate = (activity: Activity, date: string) => {
    update((d) => addSession(d, activity, date));
    const dayName = DAY_NAMES[(fromIso(date).getDay() + 6) % 7];
    toast.show(`Added ${activity.short} to ${dayName}`);
  };

  const modalSession =
    modal?.kind === "session" || modal?.kind === "calendar" ? data.sessions.find((s) => s.id === modal.id) : undefined;

  return (
    <>
      <a class="skip" href="#main">
        Skip to content
      </a>
      <header class="band">
        <div class="wrap top">
          <div>
            <h1>Training week</h1>
            <p class="sub">{SUBTITLES[route]}</p>
          </div>
          {showWeekNav && (
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
          )}
        </div>
      </header>

      <main class="wrap" id="main">
        {saveBlocked && initial.error && (
          <p class="alert" role="alert">
            {initial.error}
          </p>
        )}

        {route === "week" && (
          <WeekView
            data={data}
            monday={monday}
            onAddTo={(date) => setModal({ kind: "add", date })}
            onToggle={(s) => {
              if (s.done) {
                setModal({ kind: "session", id: s.id, justDone: false });
              } else {
                update((d) => setDone(d, s.id, true));
                setModal({ kind: "session", id: s.id, justDone: true });
              }
            }}
            onRemove={(s) => update((d) => removeSession(d, s.id))}
            onCalendar={(s) => setModal({ kind: "calendar", id: s.id })}
          />
        )}
        {route === "library" && (
          <LibraryView
            data={data}
            monday={monday}
            update={update}
            onAdd={(a, dayIndex) => addToDate(a, addDays(monday, dayIndex))}
            onEdit={(activity, isNew) => setModal({ kind: "edit", activity, isNew })}
          />
        )}
        {route === "paces" && <PacesView data={data} update={update} />}
        {route === "stats" && <StatsView data={data} />}
        {route === "settings" && (
          <SettingsView
            data={data}
            update={update}
            onImport={(d) => {
              setSaveBlocked(false);
              setData(d);
            }}
            toast={toast.show}
            onAbout={() => setModal({ kind: "about" })}
          />
        )}
      </main>

      <nav class="tabs" aria-label="Sections">
        {TABS.map(([r, label]) => (
          <a key={r} href={hrefFor(r)} aria-current={route === r ? "page" : undefined}>
            {label}
          </a>
        ))}
      </nav>

      {modal?.kind === "about" && <AboutDialog onClose={() => setModal(null)} />}
      {modal?.kind === "add" && (
        <AddSessionSheet
          data={data}
          date={modal.date}
          onPick={(a) => {
            addToDate(a, modal.date);
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "session" && modalSession && (
        <SessionSheet
          data={data}
          session={modalSession}
          activity={findActivity(data, modalSession.activityId)}
          justDone={modal.justDone}
          update={update}
          onClose={() => setModal(null)}
          toast={toast.show}
        />
      )}
      {modal?.kind === "calendar" && modalSession && (
        <CalendarSheet
          data={data}
          session={modalSession}
          activity={findActivity(data, modalSession.activityId)}
          onClose={() => setModal(null)}
          toast={toast.show}
        />
      )}
      {modal?.kind === "edit" && (
        <ActivityEditor
          initial={modal.activity}
          isNew={modal.isNew}
          onSave={(a) => {
            update((d) => saveCustomActivity(d, a));
            toast.show(modal.isNew ? `Created ${a.title.trim()}` : `Saved ${a.title.trim()}`);
            setModal(null);
          }}
          onDelete={
            modal.isNew
              ? undefined
              : () => {
                  update((d) => deleteCustomActivity(d, modal.activity.id));
                  toast.show(`Deleted ${modal.activity.title}`);
                  setModal(null);
                }
          }
          onClose={() => setModal(null)}
        />
      )}
      <UpdateBanner onOfflineReady={() => toast.show("Ready to use offline")} />
      <Toast state={toast} />
    </>
  );
}
