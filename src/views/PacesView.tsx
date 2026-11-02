import { useState } from "preact/hooks";
import { computePaces, EASY_FACTORS, formatRange, formatTime, KM_PER_MILE, LONG_SECONDS_PER_KM, parseTime, TEMPO_SECONDS_PER_MILE } from "../lib/paces";
import { formatShort, fromIso, today } from "../lib/dates";
import type { AppData, PaceSettings } from "../types";
import type { Update } from "../app";

interface Props {
  data: AppData;
  update: Update;
}

const pct = (f: number) => `${Math.round((f - 1) * 100)}%`;

/** Read an optional "m:ss–m:ss" pair. Returns undefined when both are blank, null when invalid. */
function readRange(from: string, to: string): [number, number] | undefined | null {
  if (!from.trim() && !to.trim()) return undefined;
  const a = parseTime(from);
  const b = parseTime(to);
  if (a === null || b === null) return null;
  return a <= b ? [a, b] : [b, a];
}

export function PacesView({ data, update }: Props) {
  const p = data.settings.paces;
  const paces = computePaces(p);
  const [fiveK, setFiveK] = useState(p.fiveK ? formatTime(p.fiveK) : "");
  const [tenK, setTenK] = useState(p.tenK ? formatTime(p.tenK) : "");
  const [ownEasy, setOwnEasy] = useState(Boolean(p.easyOverride));
  const [easyFrom, setEasyFrom] = useState(p.easyOverride ? formatTime(p.easyOverride[0]) : "");
  const [easyTo, setEasyTo] = useState(p.easyOverride ? formatTime(p.easyOverride[1]) : "");
  const [ownTempo, setOwnTempo] = useState(Boolean(p.tempoOverride));
  const [tempoFrom, setTempoFrom] = useState(p.tempoOverride ? formatTime(p.tempoOverride[0]) : "");
  const [tempoTo, setTempoTo] = useState(p.tempoOverride ? formatTime(p.tempoOverride[1]) : "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const save = (e: Event) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const five = fiveK.trim() ? parseTime(fiveK) : undefined;
    const ten = tenK.trim() ? parseTime(tenK) : undefined;
    if (five === null) errs.fiveK = "Enter a time like 22:45.";
    if (ten === null) errs.tenK = "Enter a time like 49:55, or leave it blank.";
    const easy = ownEasy ? readRange(easyFrom, easyTo) : undefined;
    const tempo = ownTempo ? readRange(tempoFrom, tempoTo) : undefined;
    if (easy === null) errs.easy = "Enter both paces like 5:40 and 6:00.";
    if (tempo === null) errs.tempo = "Enter both paces like 4:50 and 5:00.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      setSaved(false);
      return;
    }
    const next: PaceSettings = {};
    if (five) next.fiveK = five;
    if (ten) next.tenK = ten;
    if (easy) next.easyOverride = easy;
    if (tempo) next.tempoOverride = tempo;
    next.updated = five !== p.fiveK || ten !== p.tenK ? today() : p.updated;
    if (!next.updated) delete next.updated;
    update((d) => ({ ...d, settings: { ...d.settings, paces: next } }));
    // Show what was understood, e.g. "22.45" becomes "22:45"
    setFiveK(five ? formatTime(five) : "");
    setTenK(ten ? formatTime(ten) : "");
    if (easy) [setEasyFrom, setEasyTo].forEach((f, i) => f(formatTime(easy[i])));
    if (tempo) [setTempoFrom, setTempoTo].forEach((f, i) => f(formatTime(tempo[i])));
    setSaved(true);
  };

  const err = (key: string) =>
    errors[key] && (
      <span class="field-error" id={`${key}-error`}>
        {errors[key]}
      </span>
    );

  return (
    <>
      {paces ? (
        <section class="paces" aria-labelledby="paces-title">
          <h2 id="paces-title">Your paces</h2>
          <dl class="pace-table">
            <div style={{ "--c": "var(--spice)" }}>
              <dt>5km race pace</dt>
              <dd>
                <b>{formatTime(paces.race)}</b> /km <small>{formatTime(p.fiveK!)} for 5km. Full effort.</small>
              </dd>
            </div>
            <div style={{ "--c": "var(--spice)" }}>
              <dt>10km race pace</dt>
              <dd>
                <b>{formatTime(paces.tenK)}</b> /km{" "}
                <small>
                  {formatTime(paces.tenKTime)} for 10km{paces.tenKPredicted ? ", predicted from your 5km" : ""}.
                </small>
              </dd>
            </div>
            <div style={{ "--c": "var(--spice)" }}>
              <dt>Tempo</dt>
              <dd>
                <b>{formatRange(paces.tempo)}</b> /km <small>Comfortably hard: you could only say a few words.</small>
              </dd>
            </div>
            <div style={{ "--c": "var(--easy)" }}>
              <dt>Easy</dt>
              <dd>
                <b>{formatRange(paces.easy)}</b> /km <small>Conversation pace.</small>
              </dd>
            </div>
            <div style={{ "--c": "var(--easy)" }}>
              <dt>Long run</dt>
              <dd>
                <b>{formatRange(paces.long)}</b> /km <small>Slower than 5km pace; you should still be able to chat.</small>
              </dd>
            </div>
            <div style={{ "--c": "var(--easy)" }}>
              <dt>Recovery</dt>
              <dd>
                <b>{formatRange(paces.recovery)}</b> /km <small>Slower than easy, after a hard day.</small>
              </dd>
            </div>
          </dl>
          {p.updated && <p class="muted small">Race times last updated {formatShort(p.updated)} {fromIso(p.updated).getFullYear()}.</p>}
          <p class="muted small">These show on matching run activities in the library.</p>
        </section>
      ) : (
        <p class="empty-state">Enter your current 5km time below to see your training paces.</p>
      )}

      <h2>Race times</h2>
      <form class="form" onSubmit={save} noValidate>
        <p class="muted">
          Use your best recent time or your watch’s race prediction. Update it whenever that changes and every pace here
          moves with it.
        </p>
        <div class="field-row">
          <label class="field">
            <span>5km time (m:ss)</span>
            <input
              inputMode="decimal"
              value={fiveK}
              onInput={(e) => setFiveK(e.currentTarget.value)}
              placeholder="22:45"
              aria-invalid={Boolean(errors.fiveK)}
              aria-describedby={errors.fiveK ? "fiveK-error" : undefined}
            />
            {err("fiveK")}
          </label>
          <label class="field">
            <span>10km time (optional)</span>
            <input
              inputMode="decimal"
              value={tenK}
              onInput={(e) => setTenK(e.currentTarget.value)}
              placeholder="49:55"
              aria-invalid={Boolean(errors.tenK)}
              aria-describedby={errors.tenK ? "tenK-error" : undefined}
            />
            {err("tenK")}
          </label>
        </div>

        <label class="check">
          <input type="checkbox" checked={ownEasy} onChange={(e) => setOwnEasy(e.currentTarget.checked)} />
          <span>Set my own easy pace</span>
        </label>
        {ownEasy && (
          <div class="field-row">
            <label class="field">
              <span>Easy from (/km)</span>
              <input inputMode="decimal" value={easyFrom} onInput={(e) => setEasyFrom(e.currentTarget.value)} placeholder="5:40" aria-describedby={errors.easy ? "easy-error" : undefined} />
            </label>
            <label class="field">
              <span>to (/km)</span>
              <input inputMode="decimal" value={easyTo} onInput={(e) => setEasyTo(e.currentTarget.value)} placeholder="6:00" />
            </label>
            {err("easy")}
          </div>
        )}
        <label class="check">
          <input type="checkbox" checked={ownTempo} onChange={(e) => setOwnTempo(e.currentTarget.checked)} />
          <span>Set my own tempo pace</span>
        </label>
        {ownTempo && (
          <div class="field-row">
            <label class="field">
              <span>Tempo from (/km)</span>
              <input inputMode="decimal" value={tempoFrom} onInput={(e) => setTempoFrom(e.currentTarget.value)} placeholder="4:50" aria-describedby={errors.tempo ? "tempo-error" : undefined} />
            </label>
            <label class="field">
              <span>to (/km)</span>
              <input inputMode="decimal" value={tempoTo} onInput={(e) => setTempoTo(e.currentTarget.value)} placeholder="5:00" />
            </label>
            {err("tempo")}
          </div>
        )}
        <div class="actions">
          <button type="submit" class="btn">
            Save
          </button>
          <span role="status" class="muted">
            {saved ? "Saved." : ""}
          </span>
        </div>
      </form>

      <details class="explain">
        <summary>How these are worked out</summary>
        <p>Everything is based on your 5km race pace (5km time ÷ 5).</p>
        <ul>
          <li>
            Tempo: {TEMPO_SECONDS_PER_MILE[0]}–{TEMPO_SECONDS_PER_MILE[1]} seconds per mile slower than 5km pace (about{" "}
            {Math.round(TEMPO_SECONDS_PER_MILE[0] / KM_PER_MILE)}–{Math.round(TEMPO_SECONDS_PER_MILE[1] / KM_PER_MILE)} seconds per km).
          </li>
          <li>
            Easy: {pct(EASY_FACTORS[0])}–{pct(EASY_FACTORS[1])} slower than 5km pace.
          </li>
          <li>
            Long run: {LONG_SECONDS_PER_KM[0]} seconds to {formatTime(LONG_SECONDS_PER_KM[1])} per km slower than 5km pace.
          </li>
          <li>Recovery: from the slow end of easy to 30 seconds per km slower.</li>
          <li>10km: your own time if you enter one, otherwise predicted from your 5km with Riegel’s formula.</li>
        </ul>
        <p>These are starting points. If your easy runs feel too hard at these paces, slow down or set your own range above.</p>
      </details>
    </>
  );
}
