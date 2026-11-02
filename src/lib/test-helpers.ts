import type { Category, Session } from "../types";

let n = 0;

/** Build a session for tests. */
export function s(date: string, category: Category, opts: Partial<Session> & { legs?: boolean; neck?: boolean } = {}): Session {
  const { legs, neck, ...rest } = opts;
  n += 1;
  return {
    id: `t${n}`,
    activityId: `${category}-x`,
    date,
    done: false,
    snapshot: { title: category, short: category, category, ...(legs ? { legs } : {}), ...(neck ? { neck } : {}) },
    ...rest,
  };
}
