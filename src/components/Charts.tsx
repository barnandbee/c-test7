import type { ComponentChildren } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { labelEvery, niceTicks } from "../lib/ticks";

/** Width of an element, kept up to date. */
function useWidth<T extends HTMLElement>(): [preact.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 1 });

interface Tip {
  x: number;
  y: number;
  value: string;
  label: string;
}

function Tooltip({ tip }: { tip: Tip | null }) {
  if (!tip) return null;
  return (
    <div class="chart-tip" style={{ left: `${tip.x}px`, top: `${tip.y}px` }} aria-hidden="true">
      <b>{tip.value}</b>
      <span>{tip.label}</span>
    </div>
  );
}

const PAD = { top: 12, right: 8, bottom: 26, left: 34 };

/** Column with a 4px rounded top and a square base. */
function columnPath(x: number, y: number, w: number, h: number): string {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

function YAxis({ ticks, y, width }: { ticks: number[]; y: (v: number) => number; width: number }) {
  return (
    <g class="axis">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} class="grid" />
          <text x={PAD.left - 6} y={y(t)} dy="0.32em" text-anchor="end">
            {fmt(t)}
          </text>
        </g>
      ))}
    </g>
  );
}

export interface Column {
  label: string;
  /** Full label for the tooltip, e.g. "Week of 26 Oct". */
  longLabel: string;
  value: number;
}

/** A single-series column chart. Hover or focus a column to see its value. */
export function ColumnChart({ data, unit, title, height = 190 }: { data: Column[]; unit: string; title: string; height?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [tip, setTip] = useState<Tip | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(0, ...data.map((d) => d.value));
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1];
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = height - PAD.top - PAD.bottom;
  const band = data.length ? plotW / data.length : 0;
  const barW = Math.min(24, band * 0.6);
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;
  const every = labelEvery(data.length, plotW, 46);

  const show = (i: number) => {
    const d = data[i];
    setActive(i);
    setTip({ x: PAD.left + band * i + band / 2, y: y(d.value), value: `${fmt(d.value)} ${unit}`, label: d.longLabel });
  };
  const hide = () => {
    setActive(null);
    setTip(null);
  };

  return (
    <div class="chart" ref={ref}>
      {width > 0 && (
        <svg width={width} height={height} role="group" aria-label={title} onPointerLeave={hide}>
          <YAxis ticks={ticks} y={y} width={width} />
          {data.map((d, i) => {
            const x = PAD.left + band * i;
            const h = (d.value / top) * plotH;
            return (
              <g key={i}>
                {d.value > 0 && (
                  <path
                    d={columnPath(x + (band - barW) / 2, y(d.value), barW, h)}
                    class={`col${active === i ? " active" : ""}`}
                  />
                )}
                {i % every === (data.length - 1) % every && (
                  <text x={x + band / 2} y={height - 8} text-anchor="middle" class="axis-label">
                    {d.label}
                  </text>
                )}
                {/* Hit target: the whole band, bigger than the mark */}
                <rect
                  x={x}
                  y={PAD.top}
                  width={band}
                  height={plotH}
                  class="hit"
                  tabIndex={0}
                  role="img"
                  aria-label={`${d.longLabel}: ${fmt(d.value)} ${unit}`}
                  onPointerMove={() => show(i)}
                  onFocus={() => show(i)}
                  onBlur={hide}
                />
              </g>
            );
          })}
          <line x1={PAD.left} x2={width - PAD.right} y1={y(0)} y2={y(0)} class="baseline" />
        </svg>
      )}
      <Tooltip tip={tip} />
    </div>
  );
}

export interface LinePoint {
  label: string;
  value: number;
}

/**
 * A single-series line chart with dots. Hover anywhere to snap to the nearest
 * point; with keyboard focus, use the arrow keys.
 */
export function LineChart({ data, unit, title, height = 160 }: { data: LinePoint[]; unit: string; title: string; height?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(0, ...data.map((d) => d.value));
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1];
  const plotW = Math.max(0, width - PAD.left - PAD.right - 8);
  const plotH = height - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + 8 + (data.length <= 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;
  const every = labelEvery(data.length, plotW, 46);
  const path = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join("");

  const nearest = (clientX: number, svg: SVGSVGElement) => {
    const px = clientX - svg.getBoundingClientRect().left;
    let best = 0;
    data.forEach((_, i) => {
      if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i;
    });
    return best;
  };

  const tip: Tip | null =
    active === null ? null : { x: x(active), y: y(data[active].value), value: `${fmt(data[active].value)} ${unit}`, label: data[active].label };

  return (
    <div class="chart" ref={ref}>
      {width > 0 && data.length > 0 && (
        <svg
          width={width}
          height={height}
          tabIndex={0}
          role="img"
          aria-label={`${title}. ${data.length} entries, latest ${fmt(data[data.length - 1].value)} ${unit}. Use arrow keys to step through.`}
          onPointerMove={(e) => setActive(nearest(e.clientX, e.currentTarget))}
          onPointerLeave={() => setActive(null)}
          onFocus={() => setActive(data.length - 1)}
          onBlur={() => setActive(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setActive(Math.max(0, (active ?? 0) - 1));
            else if (e.key === "ArrowRight") setActive(Math.min(data.length - 1, (active ?? 0) + 1));
            else return;
            e.preventDefault();
          }}
        >
          <YAxis ticks={ticks} y={y} width={width} />
          {active !== null && <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + plotH} class="crosshair" />}
          <path d={path} class="line" />
          {data.map((d, i) => (
            <circle key={i} cx={x(i)} cy={y(d.value)} r={active === i ? 6 : 4} class="dot" />
          ))}
          {data.map(
            (d, i) =>
              i % every === (data.length - 1) % every && (
                <text
                  key={`l${i}`}
                  x={i === data.length - 1 && data.length > 1 ? x(i) + 6 : x(i)}
                  y={height - 8}
                  text-anchor={i === data.length - 1 && data.length > 1 ? "end" : "middle"}
                  class="axis-label"
                >
                  {d.label}
                </text>
              ),
          )}
        </svg>
      )}
      <Tooltip tip={tip} />
    </div>
  );
}

/** The figures behind a chart, for reading without hovering. */
export function ChartTable({ caption, head, rows }: { caption: string; head: [string, string]; rows: [string, string][] }) {
  return (
    <details class="chart-table">
      <summary>Show as a table</summary>
      <table>
        <caption class="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{head[0]}</th>
            <th scope="col">{head[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([a, b], i) => (
            <tr key={i}>
              <th scope="row">{a}</th>
              <td>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

export function StatTile({ label, value, sub }: { label: string; value: ComponentChildren; sub?: string }) {
  return (
    <div class="tile">
      <span class="tile-label">{label}</span>
      <span class="tile-value">{value}</span>
      {sub && <span class="tile-sub">{sub}</span>}
    </div>
  );
}
