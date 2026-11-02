import { useState } from "preact/hooks";
import { completeSession, exerciseLogDefaults, mergeExerciseRows, setDone } from "../lib/sessions";
import { formatTime } from "../lib/paces";
import { parseMinutes, parseNumber } from "../lib/numbers";
import { formatShort } from "../lib/dates";
import type { Activity, AppData, ExerciseLog, Session } from "../types";
import type { Update } from "../app";
import { Sheet } from "./Sheet";

interface Props {
  data: AppData;
  session: Session;
  activity: Activity | undefined;
  justDone: boolean;
  update: Update;
  onClose: () => void;
  toast: (msg: string) => void;
}

const str = (n: number | undefined) => (n === undefined ? "" : String(n));

function minutesText(n: number | undefined): string {
  if (n === undefined) return "";
  return Number.isInteger(n) ? String(n) : formatTime(n * 60);
}

export function SessionSheet({ data, session, activity, justDone, update, onClose, toast }: Props) {
  const log = session.log ?? {};
  const cat = session.snapshot.category;
  const isRun = cat === "easy" || cat === "spice";
  const showDistance = isRun || cat === "bonus";
  const exerciseRows: ExerciseLog[] = log.exercises?.length
    ? mergeExerciseRows(activity, log.exercises)
    : exerciseLogDefaults(data.sessions.filter((s) => s.id !== session.id), activity, session.date);
  const showExercises = exerciseRows.length > 0;
  const showWeight = cat === "strength" && !showExercises;

  const [distance, setDistance] = useState(str(log.distanceKm));
  const [duration, setDuration] = useState(minutesText(log.durationMin));
  const [effort, setEffort] = useState(str(log.effort));
  const [weight, setWeight] = useState(str(log.weightKg));
  const [note, setNote] = useState(log.note ?? "");
  const [rows, setRows] = useState(
    exerciseRows.map((r) => ({ name: r.name, sets: str(r.sets), reps: str(r.reps), weightKg: str(r.weightKg) })),
  );

  const km = parseNumber(distance);
  const mins = parseMinutes(duration);
  const pace = isRun && km && mins ? formatTime((mins * 60) / km) : "";

  const save = (e: Event) => {
    e.preventDefault();
    update((d) =>
      completeSession(d, session.id, {
        distanceKm: showDistance ? km : undefined,
        durationMin: mins,
        effort: parseNumber(effort),
        weightKg: showWeight ? parseNumber(weight) : undefined,
        note,
        exercises: showExercises
          ? rows.map((r) => ({ name: r.name, sets: parseNumber(r.sets), reps: parseNumber(r.reps), weightKg: parseNumber(r.weightKg) }))
          : undefined,
      }),
    );
    toast(justDone ? `${session.snapshot.short} done` : "Details saved");
    onClose();
  };

  const setRow = (i: number, key: "sets" | "reps" | "weightKg", value: string) =>
    setRows(rows.map((r, j) => (j === i ? { ...r, [key]: value } : r)));

  return (
    <Sheet title={justDone ? `Done: ${session.snapshot.short}` : session.snapshot.title} onClose={onClose}>
      <form class="form" onSubmit={save}>
        <p class="muted">
          {formatShort(session.date)}. {justDone ? "Add any details you want to keep. All optional." : "Edit the details or undo."}
        </p>
        <div class="field-row">
          {showDistance && (
            <label class="field">
              <span>Distance (km)</span>
              <input inputMode="decimal" value={distance} onInput={(e) => setDistance(e.currentTarget.value)} placeholder="5" />
            </label>
          )}
          <label class="field">
            <span>Time (min or m:ss)</span>
            <input inputMode="decimal" value={duration} onInput={(e) => setDuration(e.currentTarget.value)} placeholder="30" />
          </label>
        </div>
        {pace && <p class="pace-result">Average pace: {pace} /km</p>}
        <label class="field">
          <span>Effort (1 = very easy, 10 = flat out)</span>
          <select value={effort} onChange={(e) => setEffort(e.currentTarget.value)}>
            <option value="">Not recorded</option>
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i} value={String(i + 1)}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
        {showWeight && (
          <label class="field">
            <span>Weight used (kg)</span>
            <input inputMode="decimal" value={weight} onInput={(e) => setWeight(e.currentTarget.value)} placeholder="5" />
          </label>
        )}
        {showExercises && (
          <fieldset class="ex-log">
            <legend>Exercises</legend>
            <p class="muted small">Filled in from last time, or from the plan. Clear a row to skip it.</p>
            {rows.map((r, i) => (
              <div class="ex-row" key={i}>
                <span class="ex-name">{r.name}</span>
                <label>
                  <span>Sets</span>
                  <input inputMode="numeric" value={r.sets} onInput={(e) => setRow(i, "sets", e.currentTarget.value)} />
                </label>
                <label>
                  <span>Reps</span>
                  <input inputMode="numeric" value={r.reps} onInput={(e) => setRow(i, "reps", e.currentTarget.value)} />
                </label>
                <label>
                  <span>kg</span>
                  <input inputMode="decimal" value={r.weightKg} onInput={(e) => setRow(i, "weightKg", e.currentTarget.value)} />
                </label>
              </div>
            ))}
          </fieldset>
        )}
        <label class="field">
          <span>Note</span>
          <textarea rows={2} maxLength={500} value={note} onInput={(e) => setNote(e.currentTarget.value)} />
        </label>
        <div class="actions">
          <button type="submit" class="btn">
            {justDone ? "Save details" : "Save"}
          </button>
          {justDone ? (
            <button type="button" class="btn-plain" onClick={onClose}>
              Skip
            </button>
          ) : (
            <button
              type="button"
              class="btn-plain"
              onClick={() => {
                update((d) => setDone(d, session.id, false));
                toast(`${session.snapshot.short} marked not done`);
                onClose();
              }}
            >
              Mark as not done
            </button>
          )}
        </div>
      </form>
    </Sheet>
  );
}
