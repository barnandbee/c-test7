import { useState } from "preact/hooks";
import { buildIcs, icsFileName, minutesFromDuration } from "../lib/ics";
import { computePaces, paceLines } from "../lib/paces";
import { DAY_NAMES, formatShort, fromIso } from "../lib/dates";
import { download } from "../download";
import type { Activity, AppData, Session } from "../types";
import { Sheet } from "./Sheet";

interface Props {
  data: AppData;
  session: Session;
  activity: Activity | undefined;
  onClose: () => void;
  toast: (msg: string) => void;
}

/** The event notes: what to do, with your paces worked out for today. */
function describe(data: AppData, activity: Activity | undefined): string {
  if (!activity) return "";
  const parts: string[] = [];
  const paces = computePaces(data.settings.paces);
  if (paces && activity.paces?.length) {
    parts.push(paceLines(paces, activity.paces, activity.category === "spice").map((l) => `${l.label}: ${l.value}`).join("\n"));
  }
  if (activity.description) parts.push(activity.description);
  if (activity.steps?.length) parts.push(activity.steps.map((s, i) => `${i + 1}. ${s}`).join("\n"));
  if (activity.exercises?.length) parts.push(activity.exercises.map((e) => `• ${e.name}${e.dose ? ` (${e.dose})` : ""}`).join("\n"));
  if (activity.links?.length) parts.push(activity.links.map((l) => `${l.label}: ${l.url}`).join("\n"));
  return parts.join("\n\n");
}

export function CalendarSheet({ data, session, activity, onClose, toast }: Props) {
  const [allDay, setAllDay] = useState(false);
  const [time, setTime] = useState("07:00");
  const [minutes, setMinutes] = useState(String(minutesFromDuration(activity?.duration ?? "")));
  const day = DAY_NAMES[(fromIso(session.date).getDay() + 6) % 7];

  const save = (e: Event) => {
    e.preventDefault();
    const ics = buildIcs({
      uid: `${session.id}@training-week`,
      title: session.snapshot.title,
      description: describe(data, activity),
      date: session.date,
      time: allDay || !/^\d{2}:\d{2}$/.test(time) ? undefined : time,
      durationMin: Math.max(5, Math.min(600, Number(minutes) || 30)),
      url: `${location.origin}${import.meta.env.BASE_URL}`,
    });
    download(icsFileName(session.snapshot.title, session.date), ics, "text/calendar");
    toast("Calendar file ready");
    onClose();
  };

  return (
    <Sheet title="Add to calendar" onClose={onClose}>
      <form class="form" onSubmit={save}>
        <p>
          <strong>{session.snapshot.title}</strong>
          <br />
          <span class="muted">
            {day} {formatShort(session.date)}
          </span>
        </p>
        <label class="check">
          <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.currentTarget.checked)} />
          <span>All day</span>
        </label>
        {!allDay && (
          <div class="field-row">
            <label class="field">
              <span>Start time</span>
              <input type="time" value={time} onInput={(e) => setTime(e.currentTarget.value)} required />
            </label>
            <label class="field">
              <span>Length (minutes)</span>
              <input inputMode="numeric" value={minutes} onInput={(e) => setMinutes(e.currentTarget.value)} />
            </label>
          </div>
        )}
        <p class="muted small">
          This downloads a calendar file. On an iPhone, tap it to add the session to Calendar. The notes include the steps
          {activity?.paces?.length ? " and your current paces" : ""}.
        </p>
        <div class="actions">
          <button type="submit" class="btn">
            Download calendar file
          </button>
          <button type="button" class="btn-plain" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Sheet>
  );
}
