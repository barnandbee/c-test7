import { useState } from "preact/hooks";
import { exerciseVideoUrl } from "../lib/activities";
import { DAY_NAMES } from "../lib/dates";
import type { Activity } from "../types";

interface Props {
  activity: Activity;
  onAdd: (a: Activity, dayIndex: number) => void;
}

export function ActivityCard({ activity: a, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const bodyId = `b-${a.id}`;
  return (
    <article class="item" style={{ "--c": `var(--${a.category})` }}>
      <button type="button" class="head" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen(!open)}>
        <span class="t">{a.title}</span>
        <span class="time">{a.duration}</span>
      </button>
      <div class="body" id={bodyId} hidden={!open}>
        {a.description && <p>{a.description}</p>}
        {a.steps && a.steps.length > 0 && (
          <ol>
            {a.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        )}
        {a.exercises?.map((e, i) => (
          <div class="ex" key={i}>
            <b>{e.name}</b>
            <span class="dose">{e.dose}</span>
            <p>{e.howTo}</p>
            <a href={exerciseVideoUrl(e.name)} target="_blank" rel="noopener">
              Watch how to do a {e.name.toLowerCase()}
            </a>
          </div>
        ))}
        {a.links && a.links.length > 0 && (
          <div class="links">
            {a.links.map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noopener">
                {l.label}
              </a>
            ))}
          </div>
        )}
        <div class="addrow">
          <span>Add to</span>
          {DAY_NAMES.map((d, i) => (
            <button type="button" key={d} aria-label={`Add ${a.short} to ${d}`} onClick={() => onAdd(a, i)}>
              {d}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}
