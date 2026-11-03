import type { Rosette } from "../lib/rosettes";

const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 1 });

/** Pleated rosette outline: points alternating between two radii. */
function pleats(cx: number, cy: number, outer: number, inner: number, count: number): string {
  return Array.from({ length: count * 2 }, (_, i) => {
    const r = i % 2 ? inner : outer;
    const a = (Math.PI * i) / count - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

const PLEATS = pleats(40, 38, 34, 28, 18);

function RosetteBadge({ r }: { r: Rosette }) {
  const size = [...r.mark].length > 3 ? 13 : [...r.mark].length > 2 ? 16 : 20;
  return (
    <svg viewBox="0 0 80 104" width="80" height="104" aria-hidden="true" class="rosette-svg">
      {/* Ribbon tails with a V cut */}
      <path d="M26,56 L14,100 L22,94 L28,102 L38,62 Z" class="tail" />
      <path d="M54,56 L66,100 L58,94 L52,102 L42,62 Z" class="tail tail-2" />
      <polygon points={PLEATS} class="pleats" />
      <circle cx="40" cy="38" r="26" class="ring" />
      <circle cx="40" cy="38" r="21" class="centre" />
      <text x="40" y="38" dy="0.36em" text-anchor="middle" class="mark" style={{ fontSize: `${size}px` }}>
        {r.mark}
      </text>
    </svg>
  );
}

export function RosetteGrid({ rosettes }: { rosettes: Rosette[] }) {
  return (
    <ul class="rosettes">
      {rosettes.map((r) => (
        <li
          key={r.id}
          class={`rosette${r.won ? " won" : ""}`}
          style={{ "--c": r.colour === "award" ? "var(--award)" : `var(--${r.colour})` }}
        >
          <RosetteBadge r={r} />
          <span class="rosette-name">{r.name}</span>
          <span class="rosette-desc">{r.description}</span>
          {r.won ? (
            <span class="rosette-status">✓ Won</span>
          ) : (
            <>
              <span class="meter" aria-hidden="true">
                <span style={{ width: `${(r.value / r.goal) * 100}%` }} />
              </span>
              <span class="rosette-status muted">
                {fmt(r.value)} of {fmt(r.goal)}
                {r.unit ? ` ${r.unit}` : ""}
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
