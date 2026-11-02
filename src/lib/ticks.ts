/** Round axis ticks from 0 up to at least `max`, about `count` of them, on 1/2/5 steps. */
export function niceTicks(max: number, count = 4): number[] {
  if (!(max > 0)) return [0, 1];
  const raw = max / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw)!;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let t = 0; t <= top + step / 2; t += step) ticks.push(Math.round(t * 1000) / 1000);
  return ticks;
}

/** Show every nth label so they don't collide: fits `count` labels of `labelWidth` px into `width` px. */
export function labelEvery(count: number, width: number, labelWidth: number): number {
  if (count <= 1) return 1;
  return Math.max(1, Math.ceil((count * labelWidth) / width));
}
