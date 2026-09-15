import { useSearchParams } from "react-router-dom";
import { Card, FiveMark, Section } from "@/components/ui";
import { LeadForm } from "@/components/site/LeadForm";
import { PROGRAM_FACTS } from "@/content/programs";
import { egp } from "@/lib/format";

export default function Enrol() {
  const [params] = useSearchParams();
  const slug = params.get("programme") ?? undefined;

  return (
    <div className="mx-auto grid max-w-measure gap-10 px-5 py-14 lg:grid-cols-[0.85fr_1.15fr]">
      <div>
        <FiveMark on={5} className="mb-4 text-[var(--ember)]" />
        <h1 className="text-[2rem] font-semibold leading-tight tracking-[-0.03em]">
          Book a place
        </h1>
        <p className="mt-4 font-body text-[1rem] leading-relaxed text-ink-soft">
          Leave your details and we'll call you. Nothing is charged at this stage — we
          confirm the right group for your child's age first.
        </p>
        <ul className="mt-7 space-y-3 border-t border-line-soft pt-6">
          {[
            [`${PROGRAM_FACTS.sessions} live sessions`, `over ${PROGRAM_FACTS.weeks} weeks`],
            [egp(PROGRAM_FACTS.priceEgp), "per child, all in"],
            [PROGRAM_FACTS.mode, "no recordings to catch up on alone"],
            [PROGRAM_FACTS.instructor, "teaches the sessions"],
          ].map(([a, b]) => (
            <li key={a} className="flex flex-col">
              <span className="text-[0.98rem] font-medium">{a}</span>
              <span className="text-[0.85rem] text-ink-faint">{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <Card>
        <LeadForm defaultProgramSlug={slug} source={slug ? `enrol:${slug}` : "enrol"} />
      </Card>
    </div>
  );
}
