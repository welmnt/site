import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, ErrorNote, PageHeader, Panel, StatusBadge, Table, Td } from "@/components/admin/ui";
import { shortDate } from "@/lib/format";

export default function Team() {
  const rows = useQuery({
    queryKey: ["admin", "team"],
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("team_members")
        .select("*,roles(key,label)")
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(supabase),
  });

  return (
    <>
      <PageHeader title="Team" subtitle="Who can sign in, and what they may touch." />
      <ErrorNote error={rows.error} />
      <Panel>
        {rows.data?.length ? (
          <Table head={["Name", "Email", "Role", "Linked login", "Active", "Added"]}>
            {rows.data.map((m: any) => (
              <tr key={m.id} className="hover:bg-band/40">
                <Td className="font-medium">{m.name}</Td>
                <Td className="text-ink-soft">{m.email}</Td>
                <Td>{m.roles?.label ?? "—"}</Td>
                <Td className="text-ink-faint">{m.auth_uid ? "yes" : "not linked"}</Td>
                <Td><StatusBadge value={m.is_active ? "active" : "cancelled"} /></Td>
                <Td className="text-ink-faint">{shortDate(m.created_at)}</Td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyState title="No team members" />
        )}
      </Panel>

      <div className="mt-5 rounded-xl border border-line bg-surface p-5">
        <h2 className="text-[0.98rem] font-semibold">Adding a salesperson</h2>
        <ol className="mt-3 space-y-1.5 text-[0.88rem] text-ink-soft">
          <li>1. Create the user in the Supabase dashboard (public signup stays disabled).</li>
          <li>
            2. Insert a <code>team_members</code> row with that <code>auth.users.id</code> and the{" "}
            <code>sales</code> role.
          </li>
        </ol>
        <p className="mt-3 text-[0.8rem] leading-relaxed text-ink-faint">
          A login on its own grants nothing. Permission comes from the role, is checked
          inside every policy, and is re-checked on the server for every read and write —
          so a signed-in account with no team row sees an empty database, not a partial one.
        </p>
      </div>
    </>
  );
}
