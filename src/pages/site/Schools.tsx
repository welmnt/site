import { Card, FiveMark, LinkButton, Pill, Section } from "@/components/ui";

/**
 * The B2B door — Catalyst's /business, in Welmnt's subject.
 *
 * Two deliberate omissions, carried over from the Sep-2026 dossier:
 *   · No per-school pricing. POD sits between Welmnt and TikTok's budget; publishing
 *     the $3k/$6k figures caps the ceiling and hands over the floor.
 *   · No TikTok logo. The name appears as cited fact with links to the press —
 *     no mark, no implied endorsement.
 */

const PROGRAMMES = [
  {
    name: "Awareness Day",
    who: "Parents",
    shape: "Three hours",
    accent: "var(--k1)",
    body: "A workshop, a panel and an open floor — run inside the school, for the parent body. The format that ran at the Family Academy.",
    includes: [
      "Interactive parent workshop",
      "Moderated panel with the school's own staff",
      "The parenting assessment, with a personal report per parent",
      "A written summary to the school afterwards",
    ],
  },
  {
    name: "Whole-School Day",
    who: "Students, parents and teachers",
    shape: "Full day",
    accent: "var(--k5)",
    body: "Three parallel tracks across one day, so the same language reaches the children, the people raising them and the people teaching them.",
    includes: [
      "Age-banded student sessions",
      "Parent workshop and panel",
      "Teacher track on spotting and responding",
      "School-level report by grade, with themes flagged",
    ],
  },
];

const TIMELINE = [
  ["Weeks 1–3", "Contract, school outreach, assessment build"],
  ["Weeks 4–5", "First events delivered"],
  ["Weeks 6–7", "Remaining events delivered"],
  ["Week 8", "Reporting and handover"],
];

export default function Schools() {
  return (
    <>
      <section className="border-b border-line-soft">
        <div className="mx-auto max-w-measure px-5 py-14 sm:py-20">
          <FiveMark on={5} className="mb-5 text-[var(--ember)]" />
          <h1 className="max-w-3xl text-[2.1rem] font-semibold leading-[1.12] tracking-[-0.03em] sm:text-[2.8rem]">
            Welmnt inside schools — and alongside the brands that fund it.
          </h1>
          <p className="mt-5 max-w-2xl font-body text-[1.05rem] leading-relaxed text-ink-soft">
            We run mental-health and digital-safety programmes on school grounds, for the
            whole community around a child. Schools bring the distribution. Partners bring
            the reach. We bring the psychology and the reporting.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <LinkButton to="/contact">Talk to us about your school</LinkButton>
          </div>
        </div>
      </section>

      {/* ── Case study ───────────────────────────────────────────────────── */}
      <section className="border-b border-line-soft bg-surface">
        <div className="mx-auto max-w-measure px-5 py-14">
          <div className="flex items-center gap-3 text-k5">
            <FiveMark on={5} />
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em]">
              Case study
            </span>
          </div>
          <h2 className="mt-3 max-w-3xl text-[1.75rem] font-semibold tracking-[-0.02em] sm:text-[2.1rem]">
            TikTok Family Academy, Egypt — second edition
          </h2>
          <p className="mt-4 max-w-2xl font-body text-[1rem] leading-relaxed text-ink-soft">
            In November 2025, TikTok ran the second Egyptian edition of its Family Academy
            at the International School of Choueifat in 6th of October City. It was billed
            in national press as being held in collaboration with Welmnt and the school.
            TikTok brought the product and platform layer, Welmnt the psychological and
            educational layer, and the school the community.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Venue", "International School of Choueifat, 6th of October"],
              ["Audience", "Parents, teachers and press"],
              ["Welmnt's role", "Panel moderation and the parent workshop"],
              ["Built for it", "An Arabic parenting assessment with instant reports"],
            ].map(([k, v]) => (
              <Card key={k}>
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  {k}
                </div>
                <div className="mt-2 text-[0.95rem] leading-snug">{v}</div>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="flex items-center gap-4">
              <img src="/assets/hazem.jpg" alt="" className="h-16 w-16 rounded-xl object-cover" />
              <div>
                <div className="font-medium">Hazem Abdelghany</div>
                <div className="text-[0.85rem] text-ink-faint">
                  Founder, Welmnt — moderated the panel
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <img src="/assets/walaa.jpg" alt="" className="h-16 w-16 rounded-xl object-cover" />
              <div>
                <div className="font-medium">Dr. Walaa Elgammal</div>
                <div className="text-[0.85rem] text-ink-faint">
                  Ran the parent workshop
                </div>
              </div>
            </div>
          </div>

          <p className="mt-8 text-[0.85rem] text-ink-faint">
            Coverage:{" "}
            <a
              className="underline underline-offset-4 hover:text-ink"
              href="https://identity-mag.com/in-collaboration-with-welmnt-and-the-international-school-of-choueifat-tiktok-launches-second-edition-of-family-academy-in-egypt-to-enhance-digital-safety-and-combat-cyberbullying/"
              target="_blank"
              rel="noreferrer noopener"
            >
              Identity Magazine
            </a>
            {" · "}
            <a
              className="underline underline-offset-4 hover:text-ink"
              href="https://egyptian-gazette.com/entertainment/tiktok-launches-2nd-edition-of-family-academy-in-egypt/"
              target="_blank"
              rel="noreferrer noopener"
            >
              Egyptian Gazette
            </a>
          </p>
        </div>
      </section>

      {/* ── The two school programmes ────────────────────────────────────── */}
      <Section
        label="What we run"
        index={2}
        title="Two formats. Pick per school."
        lede="Both work across government, national and international schools. Where phones and internet can't be assumed, the assessment runs on paper instead of a QR code — the programme doesn't change."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {PROGRAMMES.map((p, i) => (
            <Card key={p.name} className="flex flex-col">
              <div className="flex items-center gap-3">
                <FiveMark on={i + 2} style={{ color: p.accent }} />
                <Pill tone={p.accent}>{p.shape}</Pill>
              </div>
              <h3
                className="mt-4 text-[1.35rem] font-semibold tracking-[-0.02em]"
                style={{ color: p.accent }}
              >
                {p.name}
              </h3>
              <div className="mt-1 text-[0.85rem] text-ink-faint">For: {p.who}</div>
              <p className="mt-3 font-body text-[0.95rem] leading-relaxed text-ink-soft">
                {p.body}
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {p.includes.map((x) => (
                  <li key={x} className="flex gap-2.5 text-[0.9rem] text-ink-soft">
                    <span aria-hidden="true" style={{ color: p.accent }}>
                      ✓
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-[0.88rem] text-ink-faint">
          Pricing is quoted per engagement, against the mix of schools and formats. Ask us.
        </p>
      </Section>

      {/* ── Delivery ─────────────────────────────────────────────────────── */}
      <Section
        label="How it runs"
        index={4}
        title="Eight weeks from signature to report."
      >
        <ol className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIMELINE.map(([w, d], i) => (
            <li key={w} className="rounded-2xl border border-line bg-surface p-6 shadow-card">
              <FiveMark on={i + 1} className="mb-3 text-[var(--ember)]" />
              <div className="text-[0.95rem] font-semibold">{w}</div>
              <div className="mt-1.5 font-body text-[0.9rem] leading-relaxed text-ink-soft">
                {d}
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        label="Next step"
        index={5}
        title="Bringing this to your school, or building a programme around a brand?"
      >
        <LinkButton to="/contact">Get in touch</LinkButton>
      </Section>
    </>
  );
}
