import { Link } from "react-router-dom";
import { Card, FiveMark, LinkButton, Pill, Section, accentVar } from "@/components/ui";
import { usePrograms } from "@/hooks/usePrograms";
import { PROGRAM_FACTS } from "@/content/programs";
import { egp } from "@/lib/format";

export default function Home() {
  const { data: programs } = usePrograms();

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-line-soft">
        <div className="mx-auto grid max-w-measure items-center gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <FiveMark on={5} className="mb-5 text-[var(--ember)]" />
            <h1 className="text-[2.1rem] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[3rem]">
              Empowering young minds,
              <br />
              <span className="text-[var(--ember)]">one step at a time.</span>
            </h1>
            <p className="mt-5 max-w-xl font-body text-[1.06rem] leading-relaxed text-ink-soft">
              Live online programmes that teach children and teenagers how their own minds
              work — before a problem needs a therapist. Eight sessions over two months, in
              small groups, led by Dr. Walaa Elgammal.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <LinkButton to="/enrol">Book a place</LinkButton>
              <LinkButton to="/programmes" variant="ghost">
                See the three programmes
              </LinkButton>
            </div>
            <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-line-soft pt-6">
              {[
                ["8", "live sessions"],
                ["2", "months"],
                [egp(PROGRAM_FACTS.priceEgp), "per child"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="text-[1.3rem] font-semibold tracking-[-0.02em]">{v}</dt>
                  <dd className="text-[0.82rem] text-ink-faint">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <img
              src="/assets/LandingImage1.svg"
              alt="Children learning together"
              className="w-full"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* ── Proof ────────────────────────────────────────────────────────── */}
      <section className="border-b border-line-soft bg-surface">
        <div className="mx-auto max-w-measure px-5 py-8">
          <p className="font-body text-[0.95rem] leading-relaxed text-ink-soft">
            <strong className="font-ui font-semibold text-ink">
              Welmnt was TikTok's named partner
            </strong>{" "}
            for the second Egyptian edition of the Family Academy, at the International
            School of Choueifat — a programme on digital safety and adolescent mental
            health for parents and teachers.{" "}
            <Link to="/schools" className="text-[var(--ember)] underline underline-offset-4">
              Read the case study
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── The thesis ───────────────────────────────────────────────────── */}
      <Section
        label="Why this exists"
        index={1}
        title="Most help arrives after the damage."
        lede="A child is sent to a specialist once something has already broken — the grades, the sleep, the friendship, the silence at dinner. We think that's the wrong end of the problem. Teach a child to read their own mind at the right age and most of it never gets that far. This is education, not therapy."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Protection, not repair", "Skills taught before they're needed, at the age they land."],
            ["Live and small", "Real sessions with a real person, in groups small enough to be seen in."],
            ["Built for here", "Egyptian children, Egyptian homes, in the language they actually speak."],
          ].map(([t, d], i) => (
            <Card key={t}>
              <FiveMark on={i + 1} className="mb-3 text-[var(--ember)]" />
              <h3 className="text-[1.02rem] font-semibold">{t}</h3>
              <p className="mt-2 font-body text-[0.93rem] leading-relaxed text-ink-soft">{d}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ── Programmes ───────────────────────────────────────────────────── */}
      <Section
        label="The programmes"
        index={2}
        title="Three age groups, because a seven-year-old and a sixteen-year-old need different things."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {programs.map((p) => (
            <Card key={p.slug} className="flex flex-col">
              <div className="flex items-center justify-between">
                <Pill tone={accentVar(p.accent)}>
                  Ages {p.age_min}–{p.age_max}
                </Pill>
                {p.title_ar && (
                  <span dir="rtl" className="text-[0.92rem] text-ink-faint">
                    {p.title_ar}
                  </span>
                )}
              </div>
              <h3
                className="mt-4 text-[1.28rem] font-semibold tracking-[-0.02em]"
                style={{ color: accentVar(p.accent) }}
              >
                {p.title}
              </h3>
              <p className="mt-2 flex-1 font-body text-[0.93rem] leading-relaxed text-ink-soft">
                {p.summary}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-line-soft pt-4">
                <span className="text-[0.88rem] text-ink-soft">
                  {p.sessions_count} sessions · {egp(p.price_egp)}
                </span>
                <Link
                  to={`/programmes/${p.slug}`}
                  className="text-[0.88rem] font-medium"
                  style={{ color: accentVar(p.accent) }}
                >
                  Details →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* ── Who teaches ──────────────────────────────────────────────────── */}
      <section className="border-y border-line-soft bg-surface">
        <div className="mx-auto grid max-w-measure items-center gap-8 px-5 py-14 sm:grid-cols-[auto_1fr]">
          <img
            src="/assets/walaa.jpg"
            alt="Dr. Walaa Elgammal"
            className="h-28 w-28 rounded-2xl object-cover sm:h-36 sm:w-36"
          />
          <div>
            <FiveMark on={3} className="mb-3 text-k5" />
            <h2 className="text-[1.5rem] font-semibold tracking-[-0.02em]">
              Led by Dr. Walaa Elgammal
            </h2>
            <p className="mt-3 max-w-2xl font-body text-[0.98rem] leading-relaxed text-ink-soft">
              PhD, with more than twenty years in clinical practice. She ran the parent
              workshop at TikTok's Family Academy on cyberbullying and adolescent mental
              health. She teaches these programmes herself.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <Section
        label="Next step"
        index={5}
        title="Tell us your child's age. We'll tell you which group fits."
        lede="No payment at this stage. We'll call you, answer your questions, and hold a place if it's right."
      >
        <LinkButton to="/enrol">Book a place</LinkButton>
      </Section>
    </>
  );
}
