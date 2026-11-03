import type { AppData, Session } from "../types";
import { Lanes } from "../components/Lanes";
import { Diary } from "../components/Diary";

interface Props {
  data: AppData;
  monday: string;
  onAddTo: (date: string) => void;
  onToggle: (s: Session) => void;
  onRemove: (s: Session) => void;
  onCalendar: (s: Session) => void;
}

export function WeekView({ data, monday, onAddTo, onToggle, onRemove, onCalendar }: Props) {
  return (
    <>
      <Lanes sessions={data.sessions} monday={monday} targets={data.settings.targets} />
      <h2>Diary</h2>
      <Diary sessions={data.sessions} monday={monday} onAddTo={onAddTo} onToggle={onToggle} onRemove={onRemove} onCalendar={onCalendar} />
      <p class="hint">
        Filled circle = done. Ring = planned. Tap a session to mark it done and add details. Tap a done session to edit
        its details or undo it. The calendar button adds a planned session to your phone’s calendar.
      </p>
    </>
  );
}
