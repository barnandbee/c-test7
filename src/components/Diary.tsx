import { DAY_NAMES, formatShort, today, weekDates } from "../lib/dates";
import { LEGS_BEFORE_SPICE, legsBeforeSpiceDates } from "../lib/spacing";
import type { Session } from "../types";

interface Props {
  sessions: Session[];
  monday: string;
  onToggle: (s: Session) => void;
  onRemove: (s: Session) => void;
}

export function Diary({ sessions, monday, onToggle, onRemove }: Props) {
  const todayIso = today();
  const warnDates = legsBeforeSpiceDates(sessions);
  return (
    <div class="diary">
      {weekDates(monday).map((date, i) => {
        const items = sessions.filter((s) => s.date === date);
        return (
          <section class={`day${date === todayIso ? " today" : ""}`} key={date} aria-label={`${DAY_NAMES[i]} ${formatShort(date)}`}>
            <h3>
              {DAY_NAMES[i]} <span>{formatShort(date)}</span>
            </h3>
            {items.length === 0 ? (
              <div class="empty">Free</div>
            ) : (
              <div class="chips">
                {items.map((s) => (
                  <div class={`chip${s.done ? " done" : ""}`} key={s.id} style={{ "--c": `var(--${s.snapshot.category})` }}>
                    <button type="button" class="tog" aria-pressed={s.done} title={s.snapshot.title} onClick={() => onToggle(s)}>
                      {s.snapshot.short}
                    </button>
                    <button type="button" class="rm" aria-label={`Remove ${s.snapshot.short}`} onClick={() => onRemove(s)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {warnDates.has(date) && <div class="warn">{LEGS_BEFORE_SPICE}</div>}
          </section>
        );
      })}
    </div>
  );
}
