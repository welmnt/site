import { useNavigate } from "react-router-dom";
import type { DashboardData } from "@/types/dashboard";
import { egp } from "./format";

/**
 * Money quietly leaving, as chips that go straight to the page that stops it.
 *
 * Deliberately NOT period-bounded: a lead nobody called in August is still
 * uncalled today. Scoping these to the selected period would hide the oldest
 * problems, which are the worst ones.
 */
export function LeaksBand({ leaks }: { leaks: DashboardData["leaks"] }) {
  const navigate = useNavigate();

  const chips = [
    { n: leaks.uncontacted_48h, label: "Never contacted >48h", tone: "var(--k3)", to: "/admin/leads" },
    { n: leaks.overdue_follow_ups, label: "Follow-ups overdue", tone: "var(--k3)", to: "/admin/follow-ups" },
    {
      n: leaks.underfilled_soon,
      label: "Cohorts starting soon with empty seats",
      tone: "var(--k3)",
      to: "/admin/cohorts",
    },
    {
      n: leaks.unpaid_reserved,
      label: `Reserved, unpaid · ${egp(leaks.unpaid_amount)}`,
      tone: "var(--amber)",
      to: "/admin/enrollments",
    },
    { n: leaks.stalled_7d, label: "Stalled >7d", tone: "var(--amber)", to: "/admin/leads" },
    { n: leaks.missed_follow_ups, label: "Missed follow-ups", tone: "var(--amber)", to: "/admin/follow-ups" },
    { n: leaks.today_follow_ups, label: "Due today", tone: "var(--k1)", to: "/admin/follow-ups" },
  ].filter((c) => c.n > 0);

  if (chips.length === 0) {
    return (
      <div className="rounded-xl border border-k2/30 bg-k2/5 px-4 py-2.5 text-[0.86rem] text-k2">
        Nothing leaking — every lead is contacted, every follow-up is current.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c) => (
        <button
          key={c.label}
          onClick={() => navigate(c.to)}
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.76rem] font-semibold transition-opacity hover:opacity-75"
          style={{
            color: c.tone,
            borderColor: `color-mix(in oklab, ${c.tone} 35%, transparent)`,
            background: `color-mix(in oklab, ${c.tone} 10%, transparent)`,
          }}
        >
          <span className="text-[0.88rem] font-bold">{c.n}</span>
          {c.label}
        </button>
      ))}
    </div>
  );
}
