import { Card, FiveMark, LinkButton, Section } from "@/components/ui";

const VALUES = [
  ["Innovation", "New methods where the old ones stopped working."],
  ["Collaboration", "With schools, with parents, with the people already in a child's life."],
  ["Awareness", "Naming things early, before they need a specialist."],
  ["Inclusivity", "Every school type, every income, same programme."],
  ["Curiosity", "A child who asks questions about themselves keeps the habit."],
];

export default function About() {
  return (
    <>
      <section className="border-b border-line-soft">
        <div className="mx-auto max-w-measure px-5 py-14 sm:py-20">
          <FiveMark on={5} className="mb-5 text-[var(--ember)]" />
          <h1 className="max-w-3xl text-[2.1rem] font-semibold leading-[1.12] tracking-[-0.03em] sm:text-[2.8rem]">
            Schools should protect children, not refer them.
          </h1>
          <p className="mt-5 max-w-2xl font-body text-[1.05rem] leading-relaxed text-ink-soft">
            Welmnt was founded in Cairo in 2024 on a single disagreement with how mental
            health reaches young people here: it arrives late, it arrives clinical, and it
            arrives after something has already gone wrong. We think the work belongs
            earlier — as education, at the age a child can use it.
          </p>
        </div>
      </section>

      <Section
        label="The story"
        index={1}
        title="Where this came from"
        lede="Welmnt began as a mental-health education programme for Egyptian schools — instructor-led sessions plus a platform that gave students assessments and personal tasks, parents reports on their own child, and schools a picture across every grade. It went through an incubator, raised grants, and signed its first schools."
      >
        <Card>
          <p className="font-body text-[0.98rem] leading-relaxed text-ink-soft">
            In November 2025 TikTok chose Welmnt as its partner for the second Egyptian
            edition of the Family Academy. That put the same thesis in front of a national
            audience: teach the family, not just the child, and do it before the harm.
            What you see today is that work, opened directly to parents.
          </p>
        </Card>
      </Section>

      <Section label="The people" index={3} title="Who runs it">
        <div className="grid gap-5 sm:grid-cols-2">
          <Card>
            <img src="/assets/walaa.jpg" alt="" className="h-20 w-20 rounded-xl object-cover" />
            <h3 className="mt-4 text-[1.15rem] font-semibold">Dr. Walaa Elgammal</h3>
            <p className="mt-1 text-[0.85rem] text-ink-faint">Clinical lead — teaches the programmes</p>
            <p className="mt-3 font-body text-[0.94rem] leading-relaxed text-ink-soft">
              PhD, with more than twenty years of clinical practice. Ran the parent workshop
              on cyberbullying and adolescent mental health at TikTok's Family Academy.
            </p>
          </Card>
          <Card>
            <img src="/assets/hazem.jpg" alt="" className="h-20 w-20 rounded-xl object-cover" />
            <h3 className="mt-4 text-[1.15rem] font-semibold">Hazem Abdelghany</h3>
            <p className="mt-1 text-[0.85rem] text-ink-faint">Founder</p>
            <p className="mt-3 font-body text-[0.94rem] leading-relaxed text-ink-soft">
              Founded Welmnt in 2024 and moderated the Family Academy panel. Builds the
              platform, the assessment and the schools programme.
            </p>
          </Card>
        </div>
      </Section>

      <Section label="What we hold to" index={5} title="Five values">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map(([t, d], i) => (
            <Card key={t}>
              <FiveMark on={i + 1} style={{ color: `var(--k${i + 1})` }} className="mb-3" />
              <h3 className="text-[1rem] font-semibold" style={{ color: `var(--k${i + 1})` }}>
                {t}
              </h3>
              <p className="mt-2 font-body text-[0.92rem] leading-relaxed text-ink-soft">{d}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section label="Next step" index={5} title="Want your child in the next group?">
        <LinkButton to="/enrol">Book a place</LinkButton>
      </Section>
    </>
  );
}
