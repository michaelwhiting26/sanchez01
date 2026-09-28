/** Calendar-date helpers on YYYY-MM-DD strings, in UTC, with no time-zone drift. */
const DAY_MS = 86_400_000;

/** Parse YYYY-MM-DD into a UTC day number; undefined if not a real calendar date. */
export function parseIsoDay(s: string): number | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return undefined;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = Date.UTC(y, mo - 1, d);
  const back = new Date(t);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d)
    return undefined;
  return t / DAY_MS;
}

export const formatIsoDay = (day: number): string =>
  new Date(day * DAY_MS).toISOString().slice(0, 10);
