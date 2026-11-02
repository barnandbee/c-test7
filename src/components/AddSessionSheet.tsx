import { CATEGORIES } from "../data/categories";
import { activitiesForPicker } from "../lib/activities";
import { DAY_NAMES, formatShort, fromIso } from "../lib/dates";
import type { Activity, AppData } from "../types";
import { Sheet } from "./Sheet";

interface Props {
  data: AppData;
  date: string;
  onPick: (a: Activity) => void;
  onClose: () => void;
}

function PickList({ items, onPick }: { items: Activity[]; onPick: (a: Activity) => void }) {
  return (
    <ul class="pick">
      {items.map((a) => (
        <li key={a.id}>
          <button type="button" style={{ "--c": `var(--${a.category})` }} onClick={() => onPick(a)}>
            <span class="t">{a.title}</span>
            <span class="meta">
              {CATEGORIES[a.category].one}
              {a.duration && ` · ${a.duration}`}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function AddSessionSheet({ data, date, onPick, onClose }: Props) {
  const { favourites, others } = activitiesForPicker(data);
  const day = DAY_NAMES[(fromIso(date).getDay() + 6) % 7];
  return (
    <Sheet title={`Add to ${day} ${formatShort(date)}`} onClose={onClose}>
      {favourites.length > 0 && (
        <>
          <h3 class="pick-title">★ Favourites</h3>
          <PickList items={favourites} onPick={onPick} />
        </>
      )}
      <h3 class="pick-title">{favourites.length > 0 ? "Everything else" : "All activities"}</h3>
      <PickList items={others} onPick={onPick} />
    </Sheet>
  );
}
