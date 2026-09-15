import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select } from "@/components/ui";
import { EmptyState, ErrorNote, PageHeader, Panel, StatusBadge, Table, Td } from "@/components/admin/ui";
import { egp, shortDate } from "@/lib/format";
import type { EnrollmentStatus } from "@/integrations/supabase/types";

const STATUSES: EnrollmentStatus[] = [
  "reserved", "paid", "active", "completed", "cancelled", "refunded",
];

export default function Enrollments() {
  const qc = useQueryClient();

  const rows = useQuery({
    queryKey: ["admin", "enrollments"],
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("enrollments")
        .select("*,customers(name,phone),cohorts(name,starts_on)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(supabase),
  });

  const patch = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EnrollmentStatus }) => {
      const { error } = await supabase!.from("enrollments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "enrollments"] });
      qc.invalidateQueries({ queryKey: ["admin", "cohorts"] });
      qc.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });

  return (
    <>
      <PageHeader title="Enrollments" subtitle="One row per child, per cohort." />
      <ErrorNote error={rows.error ?? patch.error} />
      <Panel>
        {rows.data?.length ? (
          <Table head={["Child", "Age", "Parent", "Cohort", "Starts", "Amount", "Status"]}>
            {rows.data.map((e: any) => (
              <tr key={e.id} className="hover:bg-band/40">
                <Td className="font-medium">{e.child_name}</Td>
                <Td className="text-ink-soft">{e.child_age ?? "—"}</Td>
                <Td className="text-ink-soft">
                  {e.customers?.name ?? "—"}
                  <span className="block text-[0.78rem] text-ink-faint">{e.customers?.phone}</span>
                </Td>
                <Td>{e.cohorts?.name ?? "—"}</Td>
                <Td className="whitespace-nowrap text-ink-soft">{shortDate(e.cohorts?.starts_on)}</Td>
                <Td>{egp(e.amount_egp)}</Td>
                <Td>
                  <Select
                    value={e.status}
                    onChange={(ev) =>
                      patch.mutate({ id: e.id, status: ev.target.value as EnrollmentStatus })
                    }
                    className="w-32 !px-2 !py-1 text-[0.8rem]"
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
            title="No enrollments yet"
            hint="A seat is taken the moment an enrollment exists — the cohort's count updates itself."
          />
        )}
      </Panel>
    </>
  );
}
