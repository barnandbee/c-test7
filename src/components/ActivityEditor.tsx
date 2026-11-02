import { useState } from "preact/hooks";
import { CATEGORIES, CATEGORY_ORDER } from "../data/categories";
import { ZONE_LABELS } from "../lib/paces";
import type { Category, CustomActivity, Exercise, Link, PaceZone } from "../types";
import { Sheet } from "./Sheet";

interface Props {
  initial: CustomActivity;
  isNew: boolean;
  onSave: (a: CustomActivity) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const ZONES: PaceZone[] = ["easy", "recovery", "tempo", "race"];

export function ActivityEditor({ initial, isNew, onSave, onDelete, onClose }: Props) {
  const [a, setA] = useState<CustomActivity>(initial);
  const [steps, setSteps] = useState((initial.steps ?? []).join("\n"));
  const [links, setLinks] = useState<Link[]>(initial.links ?? []);
  const [exercises, setExercises] = useState<Exercise[]>(initial.exercises ?? []);
  const [error, setError] = useState("");

  const set = <K extends keyof CustomActivity>(key: K, value: CustomActivity[K]) => setA({ ...a, [key]: value });
  const isRun = a.category === "easy" || a.category === "spice";

  const submit = (e: Event) => {
    e.preventDefault();
    if (!a.title.trim()) {
      setError("Give it a title.");
      return;
    }
    onSave({
      ...a,
      // Flags only apply to their own category
      legs: a.category === "strength" ? a.legs : undefined,
      neck: a.category === "mobility" ? a.neck : undefined,
      pace: isRun ? a.pace : undefined,
      steps: steps.split("\n"),
      links,
      exercises,
    });
  };

  const setLink = (i: number, patch: Partial<Link>) => setLinks(links.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const setEx = (i: number, patch: Partial<Exercise>) =>
    setExercises(exercises.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <Sheet title={isNew ? "New activity" : "Edit activity"} onClose={onClose} class="tall">
      <form class="form" onSubmit={submit} noValidate>
        <label class="field">
          <span>Title</span>
          <input
            value={a.title}
            onInput={(e) => set("title", e.currentTarget.value)}
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "title-error" : undefined}
          />
          {error && (
            <span class="field-error" id="title-error">
              {error}
            </span>
          )}
        </label>
        <label class="field">
          <span>Short name for the diary (optional)</span>
          <input value={a.short} onInput={(e) => set("short", e.currentTarget.value)} placeholder={a.title || "Uses the title"} />
        </label>
        <div class="field-row">
          <label class="field">
            <span>Category</span>
            <select value={a.category} onChange={(e) => set("category", e.currentTarget.value as Category)}>
              {CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {CATEGORIES[c].one}
                </option>
              ))}
            </select>
          </label>
          <label class="field">
            <span>Duration</span>
            <input value={a.duration} onInput={(e) => set("duration", e.currentTarget.value)} placeholder="30 min" />
          </label>
        </div>
        {isRun && (
          <label class="field">
            <span>Show my pace for</span>
            <select value={a.pace ?? ""} onChange={(e) => set("pace", (e.currentTarget.value || undefined) as PaceZone | undefined)}>
              <option value="">None</option>
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  {ZONE_LABELS[z]}
                </option>
              ))}
            </select>
          </label>
        )}
        {a.category === "strength" && (
          <label class="check">
            <input type="checkbox" checked={Boolean(a.legs)} onChange={(e) => set("legs", e.currentTarget.checked)} />
            <span>Works legs (warns if it’s the day before a spice run)</span>
          </label>
        )}
        {a.category === "mobility" && (
          <label class="check">
            <input type="checkbox" checked={Boolean(a.neck)} onChange={(e) => set("neck", e.currentTarget.checked)} />
            <span>Neck and shoulders focus (counts as the weekly neck session)</span>
          </label>
        )}
        <label class="field">
          <span>Description</span>
          <textarea rows={3} value={a.description} onInput={(e) => set("description", e.currentTarget.value)} />
        </label>
        <label class="field">
          <span>Steps (optional, one per line)</span>
          <textarea rows={4} value={steps} onInput={(e) => setSteps(e.currentTarget.value)} />
        </label>

        <fieldset class="group">
          <legend>Links (optional)</legend>
          {links.map((l, i) => (
            <div class="repeat" key={i}>
              <label class="field">
                <span>Label</span>
                <input value={l.label} onInput={(e) => setLink(i, { label: e.currentTarget.value })} />
              </label>
              <label class="field">
                <span>Web address</span>
                <input type="url" inputMode="url" value={l.url} onInput={(e) => setLink(i, { url: e.currentTarget.value })} placeholder="https://" />
              </label>
              <button type="button" class="btn-plain" onClick={() => setLinks(links.filter((_, j) => j !== i))}>
                Remove link
              </button>
            </div>
          ))}
          <button type="button" class="btn-plain" onClick={() => setLinks([...links, { label: "", url: "" }])}>
            + Add link
          </button>
        </fieldset>

        <fieldset class="group">
          <legend>Exercises (optional)</legend>
          {exercises.map((x, i) => (
            <div class="repeat" key={i}>
              <label class="field">
                <span>Name</span>
                <input value={x.name} onInput={(e) => setEx(i, { name: e.currentTarget.value })} />
              </label>
              <label class="field">
                <span>Sets, reps and weight</span>
                <input value={x.dose} onInput={(e) => setEx(i, { dose: e.currentTarget.value })} placeholder="10 reps · 5kg" />
              </label>
              <label class="field">
                <span>How to do it</span>
                <textarea rows={3} value={x.howTo} onInput={(e) => setEx(i, { howTo: e.currentTarget.value })} />
              </label>
              <button type="button" class="btn-plain" onClick={() => setExercises(exercises.filter((_, j) => j !== i))}>
                Remove exercise
              </button>
            </div>
          ))}
          <button type="button" class="btn-plain" onClick={() => setExercises([...exercises, { name: "", dose: "", howTo: "" }])}>
            + Add exercise
          </button>
        </fieldset>

        <div class="actions">
          <button type="submit" class="btn">
            {isNew ? "Create activity" : "Save changes"}
          </button>
          <button type="button" class="btn-plain" onClick={onClose}>
            Cancel
          </button>
          {onDelete && (
            <button
              type="button"
              class="btn-plain danger"
              onClick={() => {
                if (confirm(`Delete “${initial.title}”? Past sessions keep their history.`)) onDelete();
              }}
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </Sheet>
  );
}
