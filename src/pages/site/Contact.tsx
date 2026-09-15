import { Card, FiveMark, Section } from "@/components/ui";
import { LeadForm } from "@/components/site/LeadForm";

const ROUTES = [
  ["Parents", "A place for your child, or a question before you decide.", "k2"],
  ["Schools", "Bringing a programme onto your grounds.", "k5"],
  ["Brands & partners", "Building a programme around a campaign or a platform.", "k1"],
];

export default function Contact() {
  return (
    <>
      <section className="border-b border-line-soft">
        <div className="mx-auto max-w-measure px-5 py-14">
          <FiveMark on={5} className="mb-5 text-[var(--ember)]" />
          <h1 className="text-[2.1rem] font-semibold tracking-[-0.03em]">Contact Welmnt</h1>
          <p className="mt-4 max-w-2xl font-body text-[1.02rem] leading-relaxed text-ink-soft">
            Write to{" "}
            <a
              href="mailto:info@welmnt.me"
              className="text-[var(--ember)] underline underline-offset-4"
            >
              info@welmnt.me
            </a>
            , or leave your details below and we'll come to you.
          </p>
        </div>
      </section>

      <Section label="Who you are" index={2} title="Three doors, one inbox">
        <div className="grid gap-4 sm:grid-cols-3">
          {ROUTES.map(([t, d, k], i) => (
            <Card key={t}>
              <FiveMark on={i + 1} style={{ color: `var(--${k})` }} className="mb-3" />
              <h3 className="text-[1rem] font-semibold" style={{ color: `var(--${k})` }}>
                {t}
              </h3>
              <p className="mt-2 font-body text-[0.92rem] leading-relaxed text-ink-soft">{d}</p>
            </Card>
          ))}
        </div>
      </Section>

      <section className="border-t border-line-soft bg-surface">
        <div className="mx-auto grid max-w-measure gap-10 px-5 py-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-[1.5rem] font-semibold tracking-[-0.02em]">Send us a message</h2>
            <p className="mt-3 font-body text-[0.97rem] leading-relaxed text-ink-soft">
              We answer within one working day.
            </p>
            <p className="mt-6 text-[0.84rem] leading-relaxed text-ink-faint">
              Welmnt for Educational and Technical Services LLC
              <br />
              Cairo, Egypt
              <br />
              <a
                href="https://www.linkedin.com/company/welmnt"
                target="_blank"
                rel="noreferrer noopener"
                className="underline underline-offset-4 hover:text-ink"
              >
                LinkedIn
              </a>
            </p>
          </div>
          <Card>
            <LeadForm source="contact" />
          </Card>
        </div>
      </section>
    </>
  );
}
