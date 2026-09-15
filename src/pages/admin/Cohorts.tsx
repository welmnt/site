import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button, Field, Input, Select } from "@/components/ui";
import { EmptyState, ErrorNote, PageHeader, Panel, StatusBadge, Table, Td } from "@/components/admin/ui";
import { seatsLabel, shortDate, WEEKDAYS } from "@/lib/format";
import { usePrograms } from "@/hooks/usePrograms";
import type { Cohort, CohortStatus } from "@/integrations/supabase/types";

const STATUSES: CohortStatus[] = ["draft", "upcoming", "running", "completed", "cancelled"];

export default function Cohorts() {
  const qc = useQueryClient();
  const { data: programs } = usePrograms();
  const [creating, setCreating] = useState(false);

  const rows = useQuery({
    queryKey: ["admin", "cohorts"],
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("cohorts")
        .select("*")
        .order("starts_on", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(supabase),
  });

  const patch = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Cohort> }) => {
      const { error } = await supabase!.from("cohorts").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "cohorts"] }),
  });

  return (
    <>
      <PageHeader
        title="Cohorts"
        subtitle="A cohort is a real group with a start date and a seat count — that's what a parent buys."
        actions={<Button onClick={() => setCreating((v) => !v)}>{creating ? "Cancel" : "New cohort"}</Button>}
      />
      <ErrorNote error={rows.error ?? patch.error} />

      {creating && <CohortForm onDone={() => setCreating(false)} />}

      <Panel>
        {rows.data?.length ? (
          <Table head={["Cohort", "Programme", "Starts", "Runs", "Seats", "Status", "Instructor"]}>
            {rows.data.map((c: any) => {
              const p = programs.find((x) => x.id === c.program_id);
              return (
                <tr key={c.id} className="hover:bg-band/40">
                  <Td className="font-medium">{c.name}</Td>
                  <Td className="text-ink-soft">{p?.title ?? "—"}</Td>
                  <Td className="whitespace-nowrap">{shortDate(c.starts_on)}</Td>
                  <Td className="whitespace-nowrap text-ink-soft">
                    {c.weekday !== null ? WEEKDAYS[c.weekday].slice(0, 3) : "—"}
                    {c.start_time ? ` ${String(c.start_time).slice(0, 5)}` : ""}
                  </Td>
                  <Td>
                    <span className={c.seats_taken >= c.seats_total ? "text-k3" : "text-ink-soft"}>
                      {c.seats_taken}/{c.seats_total}
                    </span>
                    <span className="ml-2 text-[0.78rem] text-ink-faint">
                      {seatsLabel(c.seats_taken, c.seats_total)}
                    </span>
                  </Td>
                  <Td>
                    <Select
                      value={c.status}
                      onChange={(e) => patch.mutate({ id: c.id, patch: { status: e.target.value as CohortStatus } })}
                      className="w-32 !px-2 !py-1 text-[0.8rem]"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Select>
                  </Td>
                  <Td className="text-ink-soft">{c.instructor ?? "—"}</Td>
                </tr>
              );
            })}
          </Table>
        ) : (
          <EmptyState title="No cohorts yet" hint="Create one so the site has dates to show." />
        )}
      </Panel>
    </>
  );
}

function CohortForm({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const { data: programs } = usePrograms();
  const [v, setV] = useState({
    program_id: programs[0]?.id ?? "",
    name: "",
    starts_on: "",
    weekday: "6",
    start_time: "17:00",
    seats_total: "12",
    instructor: "Dr. Walaa Elgammal",
    meeting_url: "",
  });

  const create = useMutation({
    mutationFn: async () => {
      const programme = programs.find((p) => p.id === v.program_id);
      const start = new Date(v.starts_on);
      // 8 sessions, one a week — the end date is derivable, so derive it rather than
      // asking for something the operator can get wrong.
      const weeks = programme?.duration_weeks ?? 8;
      const end = new Date(start);
      end.setDate(end.getDate() + weeks * 7);

      const { error } = await supabase!.from("cohorts").insert({
        program_id: v.program_id,
        name: v.name.trim(),
        starts_on: v.starts_on,
        ends_on: end.toISOString().slice(0, 10),
        weekday: Number(v.weekday),
        start_time: v.start_time,
        seats_total: Number(v.seats_total),
        instructor: v.instructor.trim() || null,
        meeting_url: v.meeting_url.trim() || null,
        status: "draft",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "cohorts"] });
      onDone();
    },
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setV((s) => ({ ...s, [k]: e.target.value }));

  return (
    <div className="mb-5 rounded-xl border border-line bg-surface p-5">
      <ErrorNote error={create.error} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Programme">
          <Select value={v.program_id} onChange={set("program_id")}>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.age_min}–{p.age_max})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Name" hint="e.g. October — Ages 10–13">
          <Input value={v.name} onChange={set("name")} />
        </Field>
        <Field label="Starts on">
          <Input type="date" value={v.starts_on} onChange={set("starts_on")} />
        </Field>
        <Field label="Weekly on">
          <Select value={v.weekday} onChange={set("weekday")}>
            {WEEKDAYS.map((d, i) => (
              <option key={d} value={i}>{d}</option>
            ))}
          </Select>
        </Field>
        <Field label="Time">
          <Input type="time" value={v.start_time} onChange={set("start_time")} />
        </Field>
        <Field label="Seats">
          <Input type="number" min={1} value={v.seats_total} onChange={set("seats_total")} />
        </Field>
        <Field label="Instructor">
          <Input value={v.instructor} onChange={set("instructor")} />
        </Field>
        <Field label="Meeting link" hint="Staff only — never shown publicly.">
          <Input value={v.meeting_url} onChange={set("meeting_url")} placeholder="https://…" />
        </Field>
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={() => create.mutate()} disabled={create.isPending || !v.name || !v.starts_on}>
          {create.isPending ? "Creating…" : "Create cohort"}
        </Button>
        <Button variant="quiet" onClick={onDone}>Cancel</Button>
      </div>
      <p className="mt-3 text-[0.78rem] text-ink-faint">
        New cohorts start as <strong>draft</strong> — invisible on the site. Switch to
        “upcoming” when you want parents to see it.
      </p>
    </div>
  );
}
