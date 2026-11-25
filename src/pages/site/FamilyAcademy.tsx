import { useEffect, useState } from "react";
import { Button, Card, Field, FiveMark, Input, Select, Section } from "@/components/ui";
import { supabase } from "@/integrations/supabase/client";
import { getAttribution } from "@/lib/attribution";

/**
 * /tiktok-family-academy — the page a school reads before saying yes to hosting.
 *
 * Written for a principal or counsellor who has never heard of Welmnt and is a
 * little sceptical: real photos from Edition 3, who is on stage and why they are
 * qualified, what the morning is, what we ask of the school, and one form.
 *
 * Same rule as /schools: TikTok appears as a named programme with links to the
 * press, not as a logo, until TikTok (via POD) approves the use of its mark.
 *
 * The form writes to `leads` like the parent form, but it does NOT fire the Meta
 * Lead event: a school request is not a parent booking, and counting it as one
 * would teach the parent campaigns the wrong thing.
 */

const PRESS = [
  [
    "Identity Magazine",
    "https://identity-mag.com/in-collaboration-with-welmnt-and-the-international-school-of-choueifat-tiktok-launches-second-edition-of-family-academy-in-egypt-to-enhance-digital-safety-and-combat-cyberbullying/",
  ],
  [
    "Egyptian Gazette",
    "https://egyptian-gazette.com/entertainment/tiktok-launches-2nd-edition-of-family-academy-in-egypt/",
  ],
];

const MORNING = [
  {
    t: "20 min",
    h: "Arrive & assess",
    b: "Parents scan a QR code and answer a short parenting assessment on their phone: about 25 statements in Egyptian Arabic, five minutes. Paper copies for anyone who prefers them.",
    k: "var(--k1)",
  },
  {
    t: "75 min",
    h: "Workshop: “Connected, Not Controlled”",
    b: "Led by Dr. Walaa Elgammal. Connection before correction, the five parenting patterns with the room's own results live on screen, why teenagers hide their online life, and words for the hard conversations at home.",
    k: "var(--k2)",
  },
  {
    t: "45 min",
    h: "Panel + TikTok's safety tools, live",
    b: "Hazem moderates Dr. Walaa and your school counsellor: what the school sees, rules made with the teen, the first hour after something goes wrong online. Family Pairing, Screen Time, Time Away and Wind Down set up on a real phone. Then open questions.",
    k: "var(--k5)",
  },
  {
    t: "20 min",
    h: "Take-home",
    b: "Every parent leaves with their personal report and the family digital-wellness guide, and time to meet the speakers and the school team.",
    k: "var(--k4)",
  },
];

const WALAA = [
  ["PhD in Mental Health", ""],
  ["Multiple diplomas in parenting", ""],
  [
    "3 Family Academy events with TikTok",
    "Edition 2 at The International School of Choueifat; Edition 3 at AIS New Cairo and AIS Sheikh Zayed.",
  ],
  ["TV appearances on parenting and mental health", ""],
  ["300,000+ followers on social media", "Parents already know her voice before they walk in."],
];

const FROM_SCHOOL = [
  "A hall for 150+ people, with a sound system and two wireless microphones, a projector or large screen, seating and air conditioning",
  "The invitation sent to every parent WhatsApp group, plus your usual email or app. We write it; parents register on welmnt.me",
  "At least 30 teachers attending, as part of their professional development",
  "Open to parents from outside the school, registered in advance and with ID at the gate",
  "Your counsellor or psychologist on the panel",
  "One contact person for logistics, the gate and security",
  "A date confirmed at least 10 days ahead, with photos and filming allowed",
];

const FROM_US = [
  "Speakers, workshop, panel and moderation",
  "The invitation, the registration page and reminders to every registered parent",
  "The assessment, a personal report for every parent, and an anonymous summary for the school",
  "Branding, printed guides and material",
  "A professional film crew, with photos and a short video for your own channels",
  "Your school named as an Edition 3 host school",
];

const LOGOS = [
  ["choueifat-wide.svg", "The International School of Choueifat"],
  ["ministry.png", "Ministry of Social Solidarity"],
  ["newvision.png", "New Vision International School"],
  ["kawmeya.png", "Kawmeya Language School"],
  ["nature.png", "Nature International School"],
  ["sungate.png", "Sungate Language School"],
];

const FAQ = [
  ["What does it cost the school?", "Nothing. The programme is funded through TikTok's Family Academy; Welmnt runs the day."],
  ["Who attends?", "Parents and teachers. Students don't attend this edition."],
  ["What language is it in?", "Arabic, as at AIS. Your counsellor can answer in English if they prefer."],
  ["How many people do we need?", "We plan for 150 or more. A larger hall lets parents from nearby schools join, which we promote ourselves."],
  ["When can it happen?", "We book Edition 3 dates in December and January, around your calendar. One morning, three hours."],
];

function Photo({ src, cap, className = "" }: { src: string; cap: string; className?: string }) {
  return (
    <figure className={`relative overflow-hidden rounded-2xl bg-line-soft ${className}`}>
      <img src={src} alt={cap} loading="lazy" className="h-full w-full object-cover" />
      <figcaption className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-0.5 text-[0.72rem] font-medium text-white">
        {cap}
      </figcaption>
    </figure>
  );
}

function Tick({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 font-body text-[0.93rem] leading-relaxed text-ink-soft">
      <span aria-hidden="true" style={{ color }}>
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

function HostForm() {
  const [v, setV] = useState({ name: "", role: "", school: "", phone: "", email: "", when: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState<Record<string, string>>({});
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setV((x) => ({ ...x, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (v.name.trim().length < 2) next.name = "Please enter your name.";
    if (v.school.trim().length < 2) next.school = "Which school is this for?";
    if (v.phone.trim().length < 6) next.phone = "We need a number we can reach you on.";
    setErr(next);
    if (Object.keys(next).length) return;
    if (!supabase) {
      setState("error");
      return;
    }
    setState("sending");
    const a = getAttribution();
    const { error } = await supabase.from("leads").insert({
      parent_name: v.name.trim(),
      phone: v.phone.trim(),
      email: v.email.trim() || null,
      message: `HOST SCHOOL · ${v.school.trim()} · role: ${v.role || "—"} · preferred: ${v.when || "—"}`,
      source: "tiktok-family-academy",
      utm_source: a.utm_source ?? null,
      utm_medium: a.utm_medium ?? null,
      utm_campaign: a.utm_campaign ?? null,
      utm_content: a.utm_content ?? null,
    } as never);
    setState(error ? "error" : "sent");
  }

  if (state === "sent") {
    return (
      <div className="py-6 text-center">
        <FiveMark on={5} className="mb-4 text-[var(--ember)]" />
        <h3 className="text-[1.3rem] font-semibold">Thank you. We'll call you within one working day.</h3>
        <p className="mt-2 font-body text-ink-soft">
          In the meantime, the brochure has everything in one place.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" error={err.name}>
          <Input value={v.name} onChange={set("name")} autoComplete="name" required />
        </Field>
        <Field label="Your role">
          <Select value={v.role} onChange={set("role")}>
            <option value="">Choose…</option>
            <option>Principal / Head of School</option>
            <option>Counsellor / Psychologist</option>
            <option>Teacher / Staff</option>
            <option>Parent / PTA</option>
          </Select>
        </Field>
      </div>
      <Field label="School" error={err.school}>
        <Input value={v.school} onChange={set("school")} required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone / WhatsApp" error={err.phone}>
          <Input value={v.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" placeholder="01x xxxx xxxx" required />
        </Field>
        <Field label="Work email" hint="Optional">
          <Input type="email" value={v.email} onChange={set("email")} autoComplete="email" />
        </Field>
      </div>
      <Field label="When would suit you?">
        <Select value={v.when} onChange={set("when")}>
          <option value="">Not sure yet</option>
          <option>December</option>
          <option>January</option>
          <option>February or later</option>
        </Select>
      </Field>
      <Button type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Request a date for my school"}
      </Button>
      {state === "error" && (
        <p className="rounded-xl border border-k3/30 bg-k3/5 px-4 py-3 text-[0.86rem] text-k3">
          Something went wrong sending that. Please email hazem@welmnt.me and we'll take it from there.
        </p>
      )}
    </form>
  );
}

export default function FamilyAcademy() {
  useEffect(() => {
    const prev = document.title;
    document.title = "TikTok Family Academy · Host a free morning at your school — Welmnt";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-line-soft">
        <div className="mx-auto grid max-w-measure gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-5 flex items-center gap-3 text-[var(--ember)]">
              <FiveMark on={5} />
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em]">
                TikTok Family Academy · Egypt · Edition 3
              </span>
            </div>
            <h1 className="text-[2.1rem] font-semibold leading-[1.12] tracking-[-0.03em] sm:text-[2.8rem]">
              A free morning for your parents and teachers, on raising teenagers online.
            </h1>
            <p className="mt-5 max-w-xl font-body text-[1.05rem] leading-relaxed text-ink-soft">
              Family Academy is TikTok's programme for parents and teachers on digital safety and
              teenagers' wellbeing. Welmnt has delivered it in Egypt since Edition 2. Edition 3 opened
              at both campuses of the American International School in Egypt in November 2026, and
              we are now choosing the last host schools in Cairo.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#host"
                className="rounded-xl bg-[var(--ember)] px-5 py-3 text-[0.95rem] font-medium text-white transition-all hover:brightness-110"
              >
                Host it at your school
              </a>
              <a
                href="/assets/Welmnt-TikTok-Family-Academy-Brochure.pdf"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-line px-5 py-3 text-[0.95rem] font-medium text-ink transition-colors hover:bg-surface"
              >
                Download the brochure (PDF)
              </a>
            </div>
            <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4">
              {[
                ["3 hrs", "one morning"],
                ["150+", "parents & teachers"],
                ["0 EGP", "cost to the school"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="text-[1.6rem] font-semibold tracking-[-0.02em] text-[var(--ember)]">{n}</dt>
                  <dd className="text-[0.8rem] text-ink-faint">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Photo src="/assets/tfa/walaa.jpg" cap="The workshop · AIS New Cairo" className="col-span-2 aspect-[16/9]" />
            <Photo src="/assets/tfa/demo.jpg" cap="Safety tools, live" className="aspect-[4/3]" />
            <Photo src="/assets/tfa/parents.jpg" cap="Parents in the room" className="aspect-[4/3]" />
          </div>
        </div>
      </section>

      {/* ── Track record ─────────────────────────────────────────────────── */}
      <section className="border-b border-line-soft bg-surface">
        <div className="mx-auto grid max-w-measure gap-6 px-5 py-12 md:grid-cols-2">
          <Card>
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-k5">Edition 3 · November 2026</div>
            <p className="mt-2 font-body text-[0.97rem] leading-relaxed text-ink-soft">
              American International School in Egypt: <b className="font-semibold text-ink">Main Campus, New Cairo</b> (22 Nov)
              and <b className="font-semibold text-ink">West Campus, Sheikh Zayed</b> (23 Nov), with the school counsellors on the panel.
            </p>
          </Card>
          <Card>
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-k2">Edition 2 · November 2025</div>
            <p className="mt-2 font-body text-[0.97rem] leading-relaxed text-ink-soft">
              <b className="font-semibold text-ink">150+ parents</b> at The International School of Choueifat, 6th of October,
              with TikTok's Head of Communications for MENA on the panel. Covered by{" "}
              {PRESS.map(([n, u], i) => (
                <span key={n}>
                  {i > 0 && " and "}
                  <a href={u} target="_blank" rel="noreferrer noopener" className="underline underline-offset-4 hover:text-ink">
                    {n}
                  </a>
                </span>
              ))}
              .
            </p>
          </Card>
        </div>
      </section>

      {/* ── The morning ──────────────────────────────────────────────────── */}
      <Section
        label="The morning"
        index={1}
        title="Three hours, four moments."
        lede="A typical run is 9:00 to 12:00 on a school day; timings move to fit your calendar. The workshop and the panel are in Arabic."
      >
        <ol className="grid list-none gap-4 md:grid-cols-2">
          {MORNING.map((m) => (
            <li key={m.h} className="rounded-2xl border border-line bg-surface p-6 shadow-card">
              <div className="text-[1.3rem] font-semibold tracking-[-0.02em]" style={{ color: m.k }}>
                {m.t}
              </div>
              <h3 className="mt-1 text-[1.05rem] font-semibold">{m.h}</h3>
              <p className="mt-2 font-body text-[0.93rem] leading-relaxed text-ink-soft">{m.b}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── People ───────────────────────────────────────────────────────── */}
      <section className="border-y border-line-soft bg-surface">
        <div className="mx-auto max-w-measure px-5 py-14 sm:py-20">
          <div className="mb-3 flex items-center gap-3 text-k2">
            <FiveMark on={2} />
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em]">On stage</span>
          </div>
          <h2 className="text-[1.7rem] font-semibold tracking-[-0.02em] sm:text-[2.2rem]">Who your parents will hear from.</h2>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <Card className="grid gap-6 sm:grid-cols-[9rem_1fr]">
              <img src="/assets/walaa.jpg" alt="Dr. Walaa Elgammal" className="h-36 w-36 rounded-2xl object-cover" />
              <div>
                <h3 className="text-[1.35rem] font-semibold tracking-[-0.02em]">Dr. Walaa Elgammal</h3>
                <p className="mt-1 text-[0.9rem] text-ink-faint">Leads the workshop and sits on every panel.</p>
                <ul className="mt-4 space-y-2.5">
                  {WALAA.map(([h, d]) => (
                    <li key={h} className="flex gap-2.5">
                      <span aria-hidden="true" className="text-k2">✓</span>
                      <span>
                        <span className="text-[0.95rem] font-medium">{h}</span>
                        {d && <span className="block font-body text-[0.86rem] text-ink-soft">{d}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
            <div className="grid gap-6">
              <Card className="flex items-center gap-4">
                <img src="/assets/hazem.jpg" alt="Hazem Abdelghany" className="h-16 w-16 rounded-xl object-cover" />
                <div>
                  <div className="font-semibold">Hazem Abdelghany</div>
                  <div className="font-body text-[0.88rem] leading-snug text-ink-soft">
                    Founder, Welmnt. Moderates the panel and walks parents through TikTok's safety tools. Your single point of contact.
                  </div>
                </div>
              </Card>
              <Card className="flex items-center gap-4">
                <div className="flex h-16 w-16 flex-none items-center justify-center rounded-xl border-2 border-dashed border-k5/50 text-k5">
                  <FiveMark on={5} />
                </div>
                <div>
                  <div className="font-semibold">Your counsellor or psychologist</div>
                  <div className="font-body text-[0.88rem] leading-snug text-ink-soft">
                    Joins the panel so parents hear what the school sees. We send the questions a week ahead.
                  </div>
                </div>
              </Card>
              <div className="grid grid-cols-2 gap-3">
                <Photo src="/assets/tfa/panel.jpg" cap="The panel · AIS" className="aspect-[4/3]" />
                <Photo src="/assets/tfa/dad.jpg" cap="Mums and dads" className="aspect-[4/3]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hosting ──────────────────────────────────────────────────────── */}
      <Section
        label="Hosting"
        index={3}
        title="What makes a great morning."
        lede="These decide how full the hall is, so we agree them with every host school before we confirm a date."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <div className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-k5">From your school</div>
            <ul className="space-y-2.5">
              {FROM_SCHOOL.map((x) => (
                <Tick key={x} color="var(--k5)">{x}</Tick>
              ))}
            </ul>
          </Card>
          <Card>
            <div className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--ember)]">From Welmnt, at no cost</div>
            <ul className="space-y-2.5">
              {FROM_US.map((x) => (
                <Tick key={x} color="var(--ember)">{x}</Tick>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      {/* ── Welmnt ───────────────────────────────────────────────────────── */}
      <section className="border-y border-line-soft bg-surface">
        <div className="mx-auto max-w-measure px-5 py-14">
          <h2 className="text-[1.5rem] font-semibold tracking-[-0.02em]">Welmnt: 5,000+ students reached</h2>
          <p className="mt-3 max-w-2xl font-body text-[0.98rem] leading-relaxed text-ink-soft">
            Welmnt is a mental-health education company for Egyptian schools and families: protection through
            education, not referral after harm. Before Family Academy, we ran bullying and wellbeing awareness
            sessions school by school. Schools and partners:
          </p>
          <div className="mt-7 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {LOGOS.map(([f, n]) => (
              <div key={f} className="flex h-16 items-center justify-center rounded-xl border border-line bg-white p-2.5">
                <img src={`/assets/logos/${f}`} alt={n} title={n} className="max-h-full max-w-full object-contain" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <Section label="Questions" index={4} title="What schools ask us first.">
        <dl className="grid gap-4 md:grid-cols-2">
          {FAQ.map(([q, a]) => (
            <Card key={q}>
              <dt className="font-semibold">{q}</dt>
              <dd className="mt-1.5 font-body text-[0.93rem] leading-relaxed text-ink-soft">{a}</dd>
            </Card>
          ))}
        </dl>
      </Section>

      {/* ── Host form ────────────────────────────────────────────────────── */}
      <section id="host" className="scroll-mt-20 border-t border-line-soft bg-surface">
        <div className="mx-auto grid max-w-measure gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <div className="mb-3 flex items-center gap-3 text-[var(--ember)]">
              <FiveMark on={5} />
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em]">Next step</span>
            </div>
            <h2 className="text-[1.7rem] font-semibold tracking-[-0.02em] sm:text-[2.1rem]">Host it at your school.</h2>
            <p className="mt-4 font-body text-[1rem] leading-relaxed text-ink-soft">
              Leave your details and we'll call you within one working day to find a date, at the school or online.
            </p>
            <ol className="mt-6 space-y-3 font-body text-[0.95rem] text-ink-soft">
              <li><b className="font-semibold text-ink">1 · Say yes.</b> Your principal's OK on the points above, and a short video of the hall.</li>
              <li><b className="font-semibold text-ink">2 · Pick the date.</b> We fit the morning to your calendar and confirm it in writing.</li>
              <li><b className="font-semibold text-ink">3 · Send the invite.</b> We hand you a ready invitation and link. Everything after that is ours.</li>
            </ol>
            <p className="mt-6 text-[0.86rem] text-ink-faint">
              Or write to{" "}
              <a href="mailto:hazem@welmnt.me" className="text-[var(--ember)] underline underline-offset-4">
                hazem@welmnt.me
              </a>
            </p>
          </div>
          <Card>
            <HostForm />
          </Card>
        </div>
      </section>
    </>
  );
}
