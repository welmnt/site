import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, ErrorNote, PageHeader, Panel, Table, Td } from "@/components/admin/ui";
import { shortDate } from "@/lib/format";

export default function Customers() {
  const rows = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("customers")
        .select("*,enrollments(id)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(supabase),
  });

  return (
    <>
      <PageHeader title="Customers" subtitle="Parents who have paid at least once." />
      <ErrorNote error={rows.error} />
      <Panel>
        {rows.data?.length ? (
          <Table head={["Name", "Phone", "Email", "Children enrolled", "Since"]}>
            {rows.data.map((c: any) => (
              <tr key={c.id} className="hover:bg-band/40">
                <Td className="font-medium">{c.name}</Td>
                <Td>
                  <a href={`tel:${c.phone}`} className="text-ink-soft hover:text-[var(--ember)]">
                    {c.phone}
                  </a>
                </Td>
                <Td className="text-ink-soft">{c.email ?? "—"}</Td>
                <Td>{c.enrollments?.length ?? 0}</Td>
                <Td className="text-ink-faint">{shortDate(c.created_at)}</Td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyState title="No customers yet" />
        )}
      </Panel>
    </>
  );
}
