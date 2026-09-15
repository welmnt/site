import { useNavigate } from "react-router-dom";
import type { DashboardData } from "@/types/dashboard";
import { compact, egp } from "./format";
import { shortDate } from "@/lib/format";

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-ink-faint">
          {title}
        </h2>
        {hint && <span className="text-[0.72rem] text-ink-faint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

/* ── Funnel ─────────────────────────────────────────────────────────────── */
export function Funnel({ funnel }: { funnel: DashboardData["funnel"] }) {
  const steps = [
    ["Leads", funnel.leads],
    ["Contacted", funnel.contacted],
    ["Qualified", funnel.qualified],
    ["Booked", funnel.booked],
    ["Paid", funnel.paid],
  ] as const;
  const max = Math.max(1, funnel.leads);

  return (
    <Panel title="Funnel" hint="leads created this period">
      <div className="space-y-1.5">
        {steps.map(([name, n], i) => {
          const prev = i === 0 ? null : steps[i - 1][1];
          const conv = prev ? Math.round((n / prev) * 100) : null;
          return (
            <div key={name} className="flex items-center gap-2 text-[0.8rem]">
              <span className="w-[4.5rem] shrink-0 text-ink-faint">{name}</span>
              <span
                className="flex h-6 items-center rounded-md px-2 text-[0.78rem] font-bold"
                style={{
                  width: `${Math.max(9, (n / max) * 100)}%`,
                  background: "color-mix(in oklab, var(--ember) 22%, transparent)",
                  color: "var(--ember-ink)",
                }}
              >
                {n}
              </span>
              {conv !== null && (
                <span className="shrink-0 text-[0.7rem] text-ink-faint">{conv}%</span>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* ── Cohort fill ────────────────────────────────────────────────────────────
   Welmnt's own panel, and the one Catalyst has no equivalent of. In a live
   business an empty seat at kickoff is revenue that can never be recovered —
   the group has already started. So this outranks everything except the leaks. */
export function CohortFill({ cohorts }: { cohorts: DashboardData["cohorts"] }) {
  const navigate = useNavigate();

  return (
    <Panel title="Cohort fill" hint="upcoming and running">
      {cohorts.length === 0 ? (
        <p className="text-[0.82rem] text-ink-faint">
          No cohorts open. Parents have nothing to book onto.
        </p>
      ) : (
        <div className="space-y-2.5">
          {cohorts.map((c) => {
            const pct = c.seats_total ? (c.seats_taken / c.seats_total) * 100 : 0;
            const tone = `var(--${c.accent || "k1"})`;
            const urgent = c.days_out >= 0 && c.days_out <= 21 && c.seats_taken < c.seats_total;
            return (
              <button
                key={c.id}
                onClick={() => navigate("/admin/cohorts")}
                className="w-full text-left"
              >
                <div className="flex items-baseline justify-between gap-2 text-[0.8rem]">
                  <span className="truncate font-medium">{c.name}</span>
                  <span className="shrink-0 text-ink-faint">
                    {c.seats_taken}/{c.seats_total}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-band">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.max(2, pct)}%`, background: tone }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[0.7rem]">
                  <span className="text-ink-faint">
                    {c.programme} · {shortDate(c.starts_on)}
                  </span>
                  <span className={urgent ? "font-semibold text-k3" : "text-ink-faint"}>
                    {c.days_out < 0
                      ? "running"
                      : c.days_out === 0
                        ? "starts today"
                        : `in ${c.days_out}d`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

/* ── Agents ─────────────────────────────────────────────────────────────── */
const initials = (n: string) =>
  n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export function Agents({ agents }: { agents: DashboardData["agents"] }) {
  return (
    <Panel title="Team" hint="this period">
      {agents.length === 0 ? (
        <p className="text-[0.82rem] text-ink-faint">Nobody on the team yet.</p>
      ) : (
        <ul>
          {agents.map((a, i) => (
            <li
              key={a.id}
              className="flex items-center gap-2.5 border-b border-line-soft py-2 text-[0.82rem] last:border-0"
            >
              <span className="w-3 shrink-0 text-[0.72rem] font-semibold text-ink-faint">
                {i + 1}
              </span>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ember)]/12 text-[0.62rem] font-bold text-[var(--ember-ink)]">
                {initials(a.name)}
              </span>
              <span className="flex-1 truncate">{a.name}</span>
              <span className="shrink-0 text-ink-faint">{a.assigned} assigned</span>
              <span className="w-14 shrink-0 text-right font-semibold">
                {compact(a.revenue)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/* ── Where leads came from ──────────────────────────────────────────────── */
export function Sources({ sources }: { sources: DashboardData["sources"] }) {
  const max = Math.max(1, ...sources.map((s) => s.leads));
  return (
    <Panel title="Where leads came from" hint="this period">
      {sources.length === 0 ? (
        <p className="text-[0.82rem] text-ink-faint">No leads this period.</p>
      ) : (
        <div className="space-y-2">
          {sources.map((s) => (
            <div key={s.source} className="flex items-center gap-2 text-[0.8rem]">
              <span className="w-24 shrink-0 truncate text-ink-soft">{s.source}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-band">
                <span
                  className="block h-full rounded-full bg-k5"
                  style={{ width: `${(s.leads / max) * 100}%` }}
                />
              </span>
              <span className="w-8 shrink-0 text-right font-semibold">{s.leads}</span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

export { Panel, egp };
