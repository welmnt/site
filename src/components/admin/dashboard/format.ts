export const egp = (n: number) => `${Math.round(n).toLocaleString()} EGP`;
export const count = (n: number) => n.toLocaleString();

export const compact = (n: number) =>
  Math.abs(n) >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `${n}`;

/** Null when there's no prior baseline — "new" is honest, "+100%" is not. */
export const deltaPct = (current: number, previous: number): number | null =>
  previous ? ((current - previous) / Math.abs(previous)) * 100 : null;

export const deltaLabel = (d: number | null) =>
  d === null ? "new" : `${d >= 0 ? "▲" : "▼"} ${Math.abs(d).toFixed(0)}%`;
