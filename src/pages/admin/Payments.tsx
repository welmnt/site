import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select } from "@/components/ui";
import { EmptyState, ErrorNote, PageHeader, Panel, Stat, Table, Td } from "@/components/admin/ui";
import { dateTime, egp } from "@/lib/format";
import type { PaymentStatus } from "@/integrations/supabase/types";

const STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];

export default function Payments() {
  const qc = useQueryClient();

  const rows = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("payments")
        .select("*,enrollments(child_name,customers(name,phone))")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(supabase),
  });

  const patch = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PaymentStatus }) => {
      const { error } = await supabase!
        .from("payments")
        .update({ status, paid_at: status === "paid" ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "payments"] });
      qc.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });

  const collected = (rows.data ?? [])
    .filter((p: any) => p.status === "paid")
    .reduce((s: number, p: any) => s + p.amount_egp, 0);
  const outstanding = (rows.data ?? [])
    .filter((p: any) => p.status === "pending")
    .reduce((s: number, p: any) => s + p.amount_egp, 0);

  return (
    <>
      <PageHeader title="Payments" subtitle="What has actually landed." />
      <ErrorNote error={rows.error ?? patch.error} />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Collected" value={egp(collected)} tone="var(--k2)" />
        <Stat label="Outstanding" value={egp(outstanding)} tone="var(--amber)" hint="Still pending" />
      </div>

      <Panel>
        {rows.data?.length ? (
          <Table head={["Child", "Parent", "Amount", "Provider", "Reference", "Paid at", "Status"]}>
            {rows.data.map((p: any) => (
              <tr key={p.id} className="hover:bg-band/40">
                <Td className="font-medium">{p.enrollments?.child_name ?? "—"}</Td>
                <Td className="text-ink-soft">{p.enrollments?.customers?.name ?? "—"}</Td>
                <Td>{egp(p.amount_egp)}</Td>
                <Td className="capitalize text-ink-soft">{p.provider}</Td>
                <Td className="text-ink-faint">{p.provider_ref ?? "—"}</Td>
                <Td className="whitespace-nowrap text-ink-faint">{dateTime(p.paid_at)}</Td>
                <Td>
                  <Select
                    value={p.status}
                    onChange={(e) => patch.mutate({ id: p.id, status: e.target.value as PaymentStatus })}
                    className="w-28 !px-2 !py-1 text-[0.8rem]"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </Td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyState
            title="No payments yet"
            hint="Once a payment provider is wired, its webhook writes here. Until then, record them by hand."
          />
        )}
      </Panel>
    </>
  );
}
