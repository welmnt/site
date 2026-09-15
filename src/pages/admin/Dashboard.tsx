import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ErrorNote } from "@/components/admin/ui";
import { PeriodTabs } from "@/components/admin/dashboard/PeriodTabs";
import { KpiCard, type ChartPoint } from "@/components/admin/dashboard/KpiCard";
import { LeaksBand } from "@/components/admin/dashboard/LeaksBand";
import { Agents, CohortFill, Funnel, Sources } from "@/components/admin/dashboard/Panels";
import { count, egp } from "@/components/admin/dashboard/format";
import type { DashboardData, PeriodKey, SeriesPoint } from "@/types/dashboard";

/** Pull one metric out of the aligned series into the card's chart shape. */
function series(rows: SeriesPoint[], c: keyof SeriesPoint, p: keyof SeriesPoint): ChartPoint[] {
  return rows.map((r) => ({
    x: r.label,
    plabel: r.plabel,
    prev: Number(r[p]),
    cur: r.future ? null : Number(r[c]),
    curRaw: Number(r[c]),
    future: r.future,
  }));
}

export default function Dashboard() {
  const [period, setPeriod] = useState<PeriodKey>("month");

  const q = useQuery<DashboardData>({
    queryKey: ["admin", "dashboard", period],
    queryFn: async () => {
      const { data, error } = await supabase!.rpc("get_dashboard", { p_period: period });
      if (error) throw error;
      return data as unknown as DashboardData;
    },
    enabled: Boolean(supabase),
  });

  const d = q.data;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[1.45rem] font-semibold tracking-[-0.02em]">Dashboard</h1>
          <p className="mt-1 text-[0.85rem] text-ink-faint">
            {d?.period.label ?? "Loading…"}
            {d && (
              // Say out loud what is being compared. The comparison is like for
              // like — the elapsed part of this period against the same stretch
              // of the last one — so a half-finished month doesn't read as a
              // collapse for 29 days.
              <span className="ml-1.5 text-ink-faint/70">
                · {d.period.start} → {d.period.end} vs {d.period.prev_start} → {d.period.prev_end}
              </span>
            )}
          </p>
        </div>
        <PeriodTabs value={period} onChange={setPeriod} />
      </div>

      <ErrorNote error={q.error} />

      {q.isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl border border-line bg-surface" />
          ))}
        </div>
      )}

      {d && (
        <>
          <LeaksBand leaks={d.leaks} />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="New leads" value={count(d.pulse.new_leads.current)}
              current={d.pulse.new_leads.current} previous={d.pulse.new_leads.previous}
              fmt={count} series={series(d.series, "leads_c", "leads_p")}
            />
            <KpiCard
              label="Children enrolled" value={count(d.pulse.enrolled.current)}
              current={d.pulse.enrolled.current} previous={d.pulse.enrolled.previous}
              fmt={count} series={series(d.series, "enr_c", "enr_p")}
            />
            <KpiCard
              label="Collected" value={egp(d.pulse.collected.current)}
              current={d.pulse.collected.current} previous={d.pulse.collected.previous}
              fmt={egp} series={series(d.series, "rev_c", "rev_p")}
            />
            <KpiCard
              label="Outstanding" value={egp(d.pulse.outstanding.current)}
              current={d.pulse.outstanding.current} previous={d.pulse.outstanding.previous}
              fmt={egp} downIsGood hideChart
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <CohortFill cohorts={d.cohorts} />
            <Funnel funnel={d.funnel} />
            <div className="space-y-3">
              <Agents agents={d.agents} />
              <Sources sources={d.sources} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
