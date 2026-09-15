import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui";
import { EmptyState, ErrorNote, PageHeader, Panel, StatusBadge, Table, Td } from "@/components/admin/ui";
import { shortDate } from "@/lib/format";

const today = () => new Date().toISOString().slice(0, 10);

interface Row {
  id: string;
  lead_id: string;
  scheduled_date: string;
  notes: string | null;
  status: string;
  leads: { parent_name: string; phone: string; status: string } | null;
}

export default function FollowUps() {
  const qc = useQueryClient();

  const rows = useQuery({
    queryKey: ["admin", "follow-ups"],
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("follow_ups")
        .select("id,lead_id,scheduled_date,notes,status,leads(parent_name,phone,status)")
        .eq("status", "pending")
        .order("scheduled_date")
        .limit(200);
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
    enabled: Boolean(supabase),
  });

  const close = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "completed" | "missed" }) => {
      const { error } = await supabase!
        .from("follow_ups")
        .update({ status, completed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "follow-ups"] });
      qc.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });

  const t = today();
  const groups: [string, Row[], string][] = [
    ["Overdue", rows.data?.filter((r) => r.scheduled_date < t) ?? [], "var(--k3)"],
    ["Today", rows.data?.filter((r) => r.scheduled_date === t) ?? [], "var(--k1)"],
    ["Upcoming", rows.data?.filter((r) => r.scheduled_date > t) ?? [], "var(--ink-faint)"],
  ];

  return (
    <>
      <PageHeader title="Follow-ups" subtitle="The queue. Work it top down." />
      <ErrorNote error={rows.error ?? close.error} />

      {rows.data && rows.data.length === 0 && (
        <Panel>
          <EmptyState title="Queue is clear" hint="Nothing pending. Book follow-ups from a lead." />
        </Panel>
      )}

      <div className="space-y-6">
        {groups.map(([label, items, tone]) =>
          items.length ? (
            <section key={label}>
              <h2 className="mb-2 flex items-center gap-2 text-[1rem] font-semibold" style={{ color: tone }}>
                {label}
                <span className="rounded-full bg-band px-2 py-0.5 text-[0.74rem] text-ink-faint">
                  {items.length}
                </span>
              </h2>
              <Panel>
                <Table head={["Due", "Parent", "Phone", "Lead status", "Notes", ""]}>
                  {items.map((r) => (
                    <tr key={r.id} className="hover:bg-band/40">
                      <Td className="whitespace-nowrap font-medium">{shortDate(r.scheduled_date)}</Td>
                      <Td>{r.leads?.parent_name ?? "—"}</Td>
                      <Td>
                        <a
                          href={`tel:${r.leads?.phone ?? ""}`}
                          className="text-ink-soft hover:text-[var(--ember)]"
                        >
                          {r.leads?.phone ?? "—"}
                        </a>
                      </Td>
                      <Td>{r.leads?.status && <StatusBadge value={r.leads.status} />}</Td>
                      <Td className="max-w-xs text-ink-soft">{r.notes ?? "—"}</Td>
                      <Td>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            className="!px-3 !py-1 text-[0.78rem]"
                            onClick={() => close.mutate({ id: r.id, status: "completed" })}
                          >
                            Done
                          </Button>
                          <Button
                            variant="quiet"
                            className="!px-2 !py-1 text-[0.78rem]"
                            onClick={() => close.mutate({ id: r.id, status: "missed" })}
                          >
                            Missed
                          </Button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </Table>
              </Panel>
            </section>
          ) : null
        )}
      </div>
    </>
  );
}
