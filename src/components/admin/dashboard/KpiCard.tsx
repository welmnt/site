import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { deltaLabel, deltaPct } from "./format";

export interface ChartPoint {
  x: string;
  plabel: string;
  prev: number;
  cur: number | null;   // null once the period runs past now, so the line stops
  curRaw: number;
  future: boolean;
}

function TooltipCard({
  active, payload, fmt,
}: { active?: boolean; payload?: { payload: ChartPoint }[]; fmt: (n: number) => string }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-[0.76rem] shadow-card">
      <div className="mb-1 font-semibold">{p.x}</div>
      <div className="flex items-center gap-2">
        <span className="inline-block h-0.5 w-3 rounded bg-[var(--ember)]" />
        <span className="text-ink-soft">This period</span>
        <span className="ml-auto font-semibold">{p.future ? "—" : fmt(p.curRaw)}</span>
      </div>
      <div className="mt-0.5 flex items-center gap-2">
        <span className="inline-block h-0 w-3 border-t-2 border-dashed border-[var(--ink-faint)]" />
        <span className="text-ink-soft">{p.plabel}</span>
        <span className="ml-auto text-ink-faint">{fmt(p.prev)}</span>
      </div>
    </div>
  );
}

/**
 * The signature of the Catalyst dashboard, kept: one number, its movement, and
 * the same stretch of last period drawn as a dashed line *behind* this one — so
 * "is this good?" is answered by the shape, without reading anything.
 */
export function KpiCard({
  label, value, current, previous, series, fmt, downIsGood = false, hideChart = false,
}: {
  label: string;
  value: string;
  current: number;
  previous: number;
  series?: ChartPoint[];
  fmt: (n: number) => string;
  downIsGood?: boolean;
  hideChart?: boolean;
}) {
  const d = deltaPct(current, previous);
  const good = d === null ? null : downIsGood ? d <= 0 : d >= 0;
  const deltaClass =
    good === null ? "text-ink-faint" : good ? "text-k2" : "text-k3";

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-[1.55rem] font-semibold tracking-[-0.02em]">{value}</span>
        <span className={`text-[0.76rem] font-semibold ${deltaClass}`}>{deltaLabel(d)}</span>
      </div>
      <div className="mt-3 h-16">
        {!hideChart && series && series.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 4, bottom: 2, left: 0, right: 0 }}>
              <YAxis hide domain={["dataMin", "dataMax"]} />
              <Tooltip
                content={<TooltipCard fmt={fmt} />}
                cursor={{ stroke: "var(--line)", strokeWidth: 1 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone" dataKey="prev" stroke="var(--ink-faint)" strokeWidth={1.5}
                strokeDasharray="3 3" dot={false} isAnimationActive={false}
              />
              <Line
                type="monotone" dataKey="cur" stroke="var(--ember)" strokeWidth={2.5}
                dot={false} isAnimationActive={false} connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
