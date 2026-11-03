import { DAY_NAMES, formatShort, today, weekDates } from "../lib/dates";
import { LEGS_BEFORE_SPICE, legsBeforeSpiceDates } from "../lib/spacing";
import { formatTime } from "../lib/paces";
import type { Session } from "../types";

interface Props {
  sessions: Session[];
  monday: string;
  onAddTo: (date: string) => void;
  onToggle: (s: Session) => void;
  onRemove: (s: Session) => void;
  onCalendar: (s: Session) => void;
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

/** A short summary of what was logged, e.g. "5.2 km · 29 min". */
export function logSummary(s: Session): string {
  const l = s.log;
  if (!l) return "";
  const bits: string[] = [];
  if (l.distanceKm) bits.push(`${l.distanceKm} km`);
  if (l.durationMin) bits.push(Number.isInteger(l.durationMin) ? `${l.durationMin} min` : formatTime(l.durationMin * 60));
  if (l.effort) bits.push(`effort ${l.effort}`);
  return bits.join(" · ");
}

export function Diary({ sessions, monday, onAddTo, onToggle, onRemove, onCalendar }: Props) {
  const todayIso = today();
  const warnDates = legsBeforeSpiceDates(sessions);
  return (
    <div class="diary">
      {weekDates(monday).map((date, i) => {
        const items = sessions.filter((s) => s.date === date);
        const label = `${DAY_NAMES[i]} ${formatShort(date)}`;
        return (
          <section class={`day${date === todayIso ? " today" : ""}`} key={date} aria-label={label}>
            <h3>
              {DAY_NAMES[i]} <span>{formatShort(date)}</span>
            </h3>
            {items.length === 0 ? (
              <div class="empty">Free</div>
            ) : (
              <div class="chips">
                {items.map((s) => {
                  const summary = s.done ? logSummary(s) : "";
                  return (
                    <div class={`chip${s.done ? " done" : ""}`} key={s.id} style={{ "--c": `var(--${s.snapshot.category})` }}>
                      <button type="button" class="tog" aria-pressed={s.done} title={s.snapshot.title} onClick={() => onToggle(s)}>
                        {s.snapshot.short}
                        {summary && <small>{summary}</small>}
                      </button>
                      {!s.done && (
                        <button type="button" class="rm cal" aria-label={`Add ${s.snapshot.short} to calendar`} onClick={() => onCalendar(s)}>
                          <CalendarIcon />
                        </button>
                      )}
                      <button type="button" class="rm" aria-label={`Remove ${s.snapshot.short}`} onClick={() => onRemove(s)}>
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {warnDates.has(date) && <div class="warn">{LEGS_BEFORE_SPICE}</div>}
            <button type="button" class="add-day" onClick={() => onAddTo(date)} aria-label={`Add a session to ${label}`}>
              + Add
            </button>
          </section>
        );
      })}
    </div>
  );
}
