import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, ErrorNote, PageHeader, Panel, Stat, StatusBadge, Table, Td } from "@/components/admin/ui";
import { egp, shortDate } from "@/lib/format";

const today = () => new Date().toISOString().slice(0, 10);

export default function Dashboard() {
  const stats = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => {
      const sb = supabase!;
      const [newLeads, openLeads, dueToday, overdue, paidEnr, revenue] = await Promise.all([
        sb.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
        sb.from("leads").select("id", { count: "exact", head: true })
          .in("status", ["new", "contacted", "qualified", "trial_booked"]),
        sb.from("follow_ups").select("id", { count: "exact", head: true })
          .eq("status", "pending").eq("scheduled_date", today()),
        sb.from("follow_ups").select("id", { count: "exact", head: true })
          .eq("status", "pending").lt("scheduled_date", today()),
        sb.from("enrollments").select("id", { count: "exact", head: true })
          .in("status", ["paid", "active", "completed"]),
        sb.from("payments").select("amount_egp").eq("status", "paid"),
      ]);
      const revenueTotal = (revenue.data ?? []).reduce(
        (s: number, r: { amount_egp: number }) => s + r.amount_egp,
        0
      );
      return {
        newLeads: newLeads.count ?? 0,
        openLeads: openLeads.count ?? 0,
        dueToday: dueToday.count ?? 0,
        overdue: overdue.count ?? 0,
        enrolled: paidEnr.count ?? 0,
        revenue: revenueTotal,
      };
    },
    enabled: Boolean(supabase),
  });

  const recent = useQuery({
    queryKey: ["admin", "recent-leads"],
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("leads")
        .select("id,parent_name,phone,child_age,status,created_at")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(supabase),
  });

  return (
    <>
      <PageHeader title="Overview" subtitle="Where the funnel stands right now." />
      <ErrorNote error={stats.error ?? recent.error} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="New leads" value={stats.data?.newLeads ?? "—"} tone="var(--k1)" hint="Untouched" />
        <Stat label="Open pipeline" value={stats.data?.openLeads ?? "—"} hint="Not yet won or lost" />
        <Stat
          label="Follow-ups overdue"
          value={stats.data?.overdue ?? "—"}
          tone={stats.data?.overdue ? "var(--k3)" : "var(--ink)"}
          hint={`${stats.data?.dueToday ?? 0} due today`}
        />
        <Stat label="Children enrolled" value={stats.data?.enrolled ?? "—"} tone="var(--k2)" />
        <Stat
          label="Collected"
          value={stats.data ? egp(stats.data.revenue) : "—"}
          tone="var(--k2)"
          hint="Payments marked paid"
        />
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[1.05rem] font-semibold">Latest leads</h2>
          <Link to="/admin/leads" className="text-[0.85rem] text-[var(--ember)]">
            All leads →
          </Link>
        </div>
        <Panel>
          {recent.data?.length ? (
            <Table head={["Parent", "Phone", "Child age", "Status", "Arrived"]}>
              {recent.data.map((l: any) => (
                <tr key={l.id}>
                  <Td className="font-medium">{l.parent_name}</Td>
                  <Td className="text-ink-soft">{l.phone}</Td>
                  <Td className="text-ink-soft">{l.child_age ?? "—"}</Td>
                  <Td><StatusBadge value={l.status} /></Td>
                  <Td className="text-ink-faint">{shortDate(l.created_at)}</Td>
                </tr>
              ))}
            </Table>
          ) : (
            <EmptyState title="No leads yet" hint="They'll appear here the moment a parent submits the form." />
          )}
        </Panel>
      </div>
    </>
  );
}
