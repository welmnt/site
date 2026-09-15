import { Link } from "react-router-dom";
import { Card, FiveMark, LinkButton, Pill, Section, accentVar } from "@/components/ui";
import { usePrograms } from "@/hooks/usePrograms";
import { egp } from "@/lib/format";

export default function Programmes() {
  const { data: programs } = usePrograms();

  return (
    <>
      <Section
        label="Programmes"
        index={1}
        title="Three programmes. One per stage of growing up."
        lede="Each runs eight live sessions across two months, online, in a small group. Same shape, same price — what changes is what a child at that age can actually use."
      />

      <div className="mx-auto max-w-measure space-y-5 px-5 pb-16">
        {programs.map((p, i) => (
          <Card key={p.slug} className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <FiveMark on={i + 1} style={{ color: accentVar(p.accent) }} />
                <Pill tone={accentVar(p.accent)}>
                  Ages {p.age_min}–{p.age_max}
                </Pill>
                {p.title_ar && (
                  <span dir="rtl" className="text-[0.92rem] text-ink-faint">
                    {p.title_ar}
                  </span>
                )}
              </div>
              <h2
                className="mt-3 text-[1.55rem] font-semibold tracking-[-0.02em]"
                style={{ color: accentVar(p.accent) }}
              >
                {p.title}
              </h2>
              <p className="mt-2 max-w-2xl font-body text-[0.98rem] leading-relaxed text-ink-soft">
                {p.summary}
              </p>
              {p.outcomes.length > 0 && (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {p.outcomes.map((o) => (
                    <li key={o} className="flex gap-2.5 text-[0.9rem] text-ink-soft">
                      <span style={{ color: accentVar(p.accent) }} aria-hidden="true">
                        ✓
                      </span>
                      {o}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex shrink-0 flex-col gap-3 border-t border-line-soft pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <div>
                <div className="text-[1.5rem] font-semibold tracking-[-0.02em]">
                  {egp(p.price_egp)}
                </div>
                <div className="text-[0.82rem] text-ink-faint">
                  {p.sessions_count} sessions · {p.duration_weeks} weeks
                </div>
              </div>
              <LinkButton to={`/programmes/${p.slug}`} variant="ghost">
                Details
              </LinkButton>
              <Link
                to={`/enrol?programme=${p.slug}`}
                className="text-center text-[0.86rem] font-medium"
                style={{ color: accentVar(p.accent) }}
              >
                Book a place →
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
