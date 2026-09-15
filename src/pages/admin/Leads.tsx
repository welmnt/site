import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { EmptyState, ErrorNote, PageHeader, Panel, StatusBadge, Table, Td } from "@/components/admin/ui";
import { dateTime, shortDate } from "@/lib/format";
import type { Lead, LeadStatus } from "@/integrations/supabase/types";

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "trial_booked", "won", "lost", "junk"];

export default function Leads() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<Lead | null>(null);

  const leads = useQuery({
    queryKey: ["admin", "leads", filter, search],
    queryFn: async () => {
      let q = supabase!
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (filter !== "all") q = q.eq("status", filter);
      if (search.trim()) {
        const s = `%${search.trim()}%`;
        q = q.or(`parent_name.ilike.${s},phone.ilike.${s},child_name.ilike.${s}`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Lead[];
    },
    enabled: Boolean(supabase),
  });

  const team = useQuery({
    queryKey: ["admin", "team-active"],
    queryFn: async () => {
      const { data } = await supabase!
        .from("team_members")
        .select("id,name")
        .eq("is_active", true)
        .order("name");
      return (data ?? []) as { id: string; name: string }[];
    },
    enabled: Boolean(supabase),
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Lead> }) => {
      const { error } = await supabase!.from("leads").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "leads"] });
      qc.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });

  return (
    <>
      <PageHeader
        title="Leads"
        subtitle="Every parent who asked for a place. Newest first."
        actions={
          <>
            <Input
              placeholder="Search name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56"
            />
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value as LeadStatus | "all")}
              className="w-40"
            >
              <option value="all">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
          </>
        }
      />
      <ErrorNote error={leads.error ?? update.error} />

      <Panel>
        {leads.isLoading ? (
          <EmptyState title="Loading…" />
        ) : leads.data?.length ? (
          <Table head={["Parent", "Phone", "Child", "Source", "Status", "Owner", "Arrived", ""]}>
            {leads.data.map((l) => (
              <tr key={l.id} className="hover:bg-band/40">
                <Td className="font-medium">{l.parent_name}</Td>
                <Td>
                  <a href={`tel:${l.phone}`} className="text-ink-soft hover:text-[var(--ember)]">
                    {l.phone}
                  </a>
                </Td>
                <Td className="text-ink-soft">
                  {l.child_name ?? "—"}
                  {l.child_age ? <span className="text-ink-faint"> · {l.child_age}</span> : null}
                </Td>
                <Td className="text-ink-faint">{l.utm_source ?? l.source}</Td>
                <Td>
                  <Select
                    value={l.status}
                    onChange={(e) =>
                      update.mutate({ id: l.id, patch: { status: e.target.value as LeadStatus } })
                    }
                    className="w-32 !px-2 !py-1 text-[0.8rem]"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <Select
                    value={l.assigned_to ?? ""}
                    onChange={(e) =>
                      update.mutate({ id: l.id, patch: { assigned_to: e.target.value || null } })
                    }
                    className="w-32 !px-2 !py-1 text-[0.8rem]"
                  >
                    <option value="">Unassigned</option>
                    {team.data?.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </Select>
                </Td>
                <Td className="whitespace-nowrap text-ink-faint">{shortDate(l.created_at)}</Td>
                <Td>
                  <button
                    onClick={() => setOpen(l)}
                    className="text-[0.82rem] font-medium text-[var(--ember)]"
                  >
                    Open
                  </button>
                </Td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyState
            title="Nothing here"
            hint={filter === "all" ? "No leads yet." : `No leads with status “${filter}”.`}
          />
        )}
      </Panel>

      {open && <LeadDrawer lead={open} onClose={() => setOpen(null)} />}
    </>
  );
}

/* ── Drawer: the detail + the one action a rep takes most (book a follow-up) ── */
function LeadDrawer({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const qc = useQueryClient();
  const [date, setDate] = useState(new Date(Date.now() + 864e5).toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const history = useQuery({
    queryKey: ["admin", "lead-followups", lead.id],
    queryFn: async () => {
      const { data } = await supabase!
        .from("follow_ups")
        .select("*")
        .eq("lead_id", lead.id)
        .order("scheduled_date", { ascending: false });
      return data ?? [];
    },
    enabled: Boolean(supabase),
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase!.from("follow_ups").insert({
        lead_id: lead.id,
        scheduled_date: date,
        notes: notes.trim() || null,
      });
      if (error) throw error;
      // Booking a follow-up means the rep touched this lead. Record that too, so
      // "new" never silently means "worked".
      await supabase!
        .from("leads")
        .update({ last_contacted_at: new Date().toISOString() })
        .eq("id", lead.id);
    },
    onSuccess: () => {
      setNotes("");
      qc.invalidateQueries({ queryKey: ["admin", "lead-followups", lead.id] });
      qc.invalidateQueries({ queryKey: ["admin", "follow-ups"] });
      qc.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <aside
        className="h-full w-full max-w-md overflow-y-auto bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[1.25rem] font-semibold tracking-[-0.02em]">{lead.parent_name}</h2>
            <p className="mt-1 text-[0.86rem] text-ink-faint">Arrived {dateTime(lead.created_at)}</p>
          </div>
          <button onClick={onClose} className="text-ink-faint hover:text-ink" aria-label="Close">
            ✕
          </button>
        </div>

        <dl className="grid grid-cols-2 gap-3 border-y border-line-soft py-4 text-[0.88rem]">
          {[
            ["Phone", lead.phone],
            ["Email", lead.email ?? "—"],
            ["Child", lead.child_name ?? "—"],
            ["Age", lead.child_age ? String(lead.child_age) : "—"],
            ["Source", lead.source],
            ["Campaign", lead.utm_campaign ?? "—"],
            ["Last contacted", lead.last_contacted_at ? dateTime(lead.last_contacted_at) : "never"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-ink-faint">
                {k}
              </dt>
              <dd className="mt-0.5 break-words">{v}</dd>
            </div>
          ))}
        </dl>

        {lead.message && (
          <div className="mt-4">
            <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-ink-faint">
              What they wrote
            </h3>
            <p className="mt-1.5 font-body text-[0.92rem] leading-relaxed text-ink-soft">
              {lead.message}
            </p>
          </div>
        )}

        <div className="mt-6">
          <h3 className="mb-3 text-[0.95rem] font-semibold">Book a follow-up</h3>
          <div className="grid gap-3">
            <Field label="When">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Notes">
              <Textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What was said, what to do next…"
              />
            </Field>
            <Button onClick={() => add.mutate()} disabled={add.isPending}>
              {add.isPending ? "Saving…" : "Add follow-up"}
            </Button>
            <ErrorNote error={add.error} />
          </div>
        </div>

        {history.data && history.data.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-[0.95rem] font-semibold">History</h3>
            <ul className="space-y-2">
              {history.data.map((f: any) => (
                <li key={f.id} className="rounded-lg border border-line-soft p-3 text-[0.86rem]">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{shortDate(f.scheduled_date)}</span>
                    <StatusBadge value={f.status} />
                  </div>
                  {f.notes && <p className="mt-1.5 text-ink-soft">{f.notes}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
