import { Navigate, useParams } from "react-router-dom";
import { Card, FiveMark, LinkButton, Pill, Section, accentVar } from "@/components/ui";
import { LeadForm } from "@/components/site/LeadForm";
import { usePrograms, useOpenCohorts } from "@/hooks/usePrograms";
import { egp, seatsLabel, shortDate, WEEKDAYS } from "@/lib/format";

export default function ProgrammeDetail() {
  const { slug } = useParams();
  const { data: programs } = usePrograms();
  const programme = programs.find((p) => p.slug === slug);
  const { data: cohorts } = useOpenCohorts(programme?.id);

  if (programs.length && !programme) return <Navigate to="/programmes" replace />;
  if (!programme) return null;

  const tone = accentVar(programme.accent);

  return (
    <>
      <section className="border-b border-line-soft">
        <div className="mx-auto max-w-measure px-5 py-14 sm:py-16">
          <div className="flex flex-wrap items-center gap-3">
            <FiveMark on={5} style={{ color: tone }} />
            <Pill tone={tone}>
              Ages {programme.age_min}–{programme.age_max}
            </Pill>
            {programme.title_ar && (
              <span dir="rtl" className="text-[0.95rem] text-ink-faint">
                {programme.title_ar}
              </span>
            )}
          </div>
          <h1
            className="mt-4 text-[2.1rem] font-semibold tracking-[-0.03em] sm:text-[2.7rem]"
            style={{ color: tone }}
          >
            {programme.title}
          </h1>
          <p className="mt-4 max-w-2xl font-body text-[1.05rem] leading-relaxed text-ink-soft">
            {programme.summary}
          </p>
          <dl className="mt-8 grid max-w-2xl grid-cols-2 gap-5 border-t border-line-soft pt-6 sm:grid-cols-4">
            {[
              [String(programme.sessions_count), "live sessions"],
              [`${programme.duration_weeks} wks`, "start to finish"],
              ["Online", "small groups"],
              [egp(programme.price_egp), "per child"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="text-[1.2rem] font-semibold tracking-[-0.02em]">{v}</dt>
                <dd className="text-[0.8rem] text-ink-faint">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {programme.outcomes.length > 0 && (
        <Section label="What changes" index={2} accent={tone} title="What your child walks away with">
          <div className="grid gap-4 sm:grid-cols-2">
            {programme.outcomes.map((o, i) => (
              <Card key={o}>
                <FiveMark on={i + 1} className="mb-3" style={{ color: tone }} />
                <p className="font-body text-[0.97rem] leading-relaxed">{o}</p>
              </Card>
            ))}
          </div>
        </Section>
      )}

      <Section label="Upcoming groups" index={3} accent={tone} title="When the next group starts">
        {cohorts.length === 0 ? (
          <Card>
            <p className="font-body text-[0.97rem] leading-relaxed text-ink-soft">
              Dates for the next group aren't published yet. Leave your details below and
              we'll come to you first when they are.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {cohorts.map((c) => {
              const full = c.seats_taken >= c.seats_total;
              return (
                <Card key={c.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[1.05rem] font-semibold">{c.name}</h3>
                      <p className="mt-1 text-[0.88rem] text-ink-soft">
                        Starts {shortDate(c.starts_on)}
                        {c.weekday !== null && ` · ${WEEKDAYS[c.weekday]}s`}
                        {c.start_time && ` at ${c.start_time.slice(0, 5)}`}
                      </p>
                    </div>
                    <Pill tone={full ? "var(--ink-faint)" : tone}>
                      {seatsLabel(c.seats_taken, c.seats_total)}
                    </Pill>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      <section className="border-t border-line-soft bg-surface">
        <div className="mx-auto grid max-w-measure gap-10 px-5 py-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <FiveMark on={5} className="mb-3" style={{ color: tone }} />
            <h2 className="text-[1.6rem] font-semibold tracking-[-0.02em]">Book a place</h2>
            <p className="mt-3 max-w-md font-body text-[0.98rem] leading-relaxed text-ink-soft">
              No payment now. We'll call you, answer what you want to ask, and hold a seat
              if this is the right group for your child.
            </p>
            <LinkButton to="/contact" variant="quiet" className="mt-4 px-0">
              Rather ask a question first →
            </LinkButton>
          </div>
          <Card>
            <LeadForm defaultProgramSlug={programme.slug} source={`programme:${programme.slug}`} />
          </Card>
        </div>
      </section>
    </>
  );
}
