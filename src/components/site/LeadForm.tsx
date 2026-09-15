import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { usePrograms } from "@/hooks/usePrograms";
import { useLeadSubmit } from "@/hooks/useLeadSubmit";

/**
 * The single public write surface.
 *
 * Age drives the programme, not the other way round — a parent knows their child's
 * age, not which band we named it. Picking the band for them removes the one place
 * this form could confuse someone.
 */
export function LeadForm({
  defaultProgramSlug,
  source = "website",
}: {
  defaultProgramSlug?: string;
  source?: string;
}) {
  const { data: programs } = usePrograms();
  const submit = useLeadSubmit();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    parent_name: "",
    phone: "",
    email: "",
    child_name: "",
    child_age: "",
    program_slug: defaultProgramSlug ?? "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const age = Number(values.child_age);
  const bandForAge = Number.isFinite(age) && age > 0
    ? programs.find((p) => age >= p.age_min && age <= p.age_max)
    : undefined;
  const chosen = programs.find((p) => p.slug === values.program_slug) ?? bandForAge;
  const ageOutOfRange = Boolean(values.child_age) && Number.isFinite(age) && !bandForAge;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (values.parent_name.trim().length < 2) next.parent_name = "Please enter your name.";
    if (values.phone.trim().length < 6) next.phone = "We need a number we can reach you on.";
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      await submit.mutateAsync({
        parent_name: values.parent_name,
        phone: values.phone,
        email: values.email || undefined,
        child_name: values.child_name || undefined,
        child_age: values.child_age ? Number(values.child_age) : undefined,
        program_id: chosen?.id ?? null,
        message: values.message || undefined,
        source,
      });
      navigate("/thank-you");
    } catch {
      /* surfaced below — never swallow it silently */
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" error={errors.parent_name}>
          <Input value={values.parent_name} onChange={set("parent_name")} autoComplete="name" required />
        </Field>
        <Field label="Phone / WhatsApp" error={errors.phone}>
          <Input
            value={values.phone}
            onChange={set("phone")}
            inputMode="tel"
            autoComplete="tel"
            placeholder="01x xxxx xxxx"
            required
          />
        </Field>
      </div>

      <Field label="Email" hint="Optional — we'll send the schedule here.">
        <Input type="email" value={values.email} onChange={set("email")} autoComplete="email" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Child's name" hint="Optional">
          <Input value={values.child_name} onChange={set("child_name")} />
        </Field>
        <Field
          label="Child's age"
          error={ageOutOfRange ? "Our programmes run from 5 to 17." : undefined}
          hint={bandForAge ? `That's ${bandForAge.title} — ages ${bandForAge.age_min}–${bandForAge.age_max}.` : undefined}
        >
          <Input
            type="number"
            min={3}
            max={19}
            value={values.child_age}
            onChange={set("child_age")}
            inputMode="numeric"
          />
        </Field>
      </div>

      <Field label="Programme" hint="We'll confirm the right group with you on the call.">
        <Select value={values.program_slug || chosen?.slug || ""} onChange={set("program_slug")}>
          <option value="">Not sure yet</option>
          {programs.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.title} · ages {p.age_min}–{p.age_max}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Anything you'd like us to know?" hint="Optional">
        <Textarea value={values.message} onChange={set("message")} rows={3} />
      </Field>

      <Button type="submit" disabled={submit.isPending}>
        {submit.isPending ? "Sending…" : "Request a place"}
      </Button>

      {submit.isError && (
        <p className="rounded-xl border border-k3/30 bg-k3/5 px-4 py-3 text-[0.86rem] text-k3">
          {(submit.error as Error).message === "NOT_CONFIGURED"
            ? "The booking system isn't connected yet. Please reach us at info@welmnt.me and we'll take it from there."
            : "Something went wrong sending that. Please try again, or email info@welmnt.me."}
        </p>
      )}

      <p className="text-[0.78rem] leading-relaxed text-ink-faint">
        We use your details only to contact you about Welmnt programmes. We never sell or
        share them. See our <a href="/privacy" className="underline">privacy notice</a>.
      </p>
    </form>
  );
}
