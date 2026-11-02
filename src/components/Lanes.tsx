import { CATEGORIES } from "../data/categories";
import { weekSummary } from "../lib/targets";
import type { Category, Session } from "../types";

interface Props {
  sessions: Session[];
  monday: string;
  targets: Record<Category, number>;
}

export function Lanes({ sessions, monday, targets }: Props) {
  const lanes = weekSummary(sessions, monday, targets);
  return (
    <section class="track" aria-label="Weekly targets">
      {lanes.map((l) => {
        const slots = Math.max(l.target, l.done + l.planned);
        return (
          <div class="lane" key={l.category} style={{ "--c": `var(--${l.category})` }}>
            <div class="name">
              {CATEGORIES[l.category].label}
              <small>{CATEGORIES[l.category].note}</small>
            </div>
            <div class="tokens" aria-hidden="true">
              {Array.from({ length: slots }, (_, i) => (
                <span class={`tok ${i < l.done ? "done" : i < l.done + l.planned ? "planned" : ""}`} />
              ))}
            </div>
            <div class={`count${l.met ? " met" : ""}`}>
              {l.done} of {l.target} done
              {l.planned > 0 && <span class="visually-hidden">, {l.planned} planned</span>}
            </div>
            {l.note && <div class="lane-note">{l.note}</div>}
          </div>
        );
      })}
    </section>
  );
}
