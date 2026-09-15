import { Card, FiveMark, LinkButton, Section } from "@/components/ui";

/**
 * One claim from the 2024 site is deliberately NOT carried over: it asserted the team
 * held an LPC licence plus CBT and DBT certifications. LPC is a US state licence and
 * none of it is verifiable from anything we hold. Publishing it on a site aimed at
 * parents and schools is a real exposure. The honest answer is below instead.
 * If the certifications are real, say so and they go back in.
 */

const PARENTS = [
  [
    "Is this therapy?",
    "No. Welmnt is education. We teach children how their own minds work, the way a school teaches anything else. If something comes up that needs clinical help, we tell you plainly and point you to it — we don't treat it ourselves.",
  ],
  [
    "Who actually teaches the sessions?",
    "Dr. Walaa Elgammal, who holds a PhD and has more than twenty years in clinical practice. She ran the parent workshop at TikTok's Family Academy in November 2025.",
  ],
  [
    "How big is a group?",
    "Small enough that every child speaks. If a group fills, we open the next one rather than stretch it.",
  ],
  [
    "What if my child misses a session?",
    "Tell us and we'll work it out. These are live sessions, not recordings — the value is in the room, so we'd rather help a child catch up with the group than hand over a video.",
  ],
  [
    "Do I need to attend with my child?",
    "No. The programmes run for the child. A parent track is something we're working on separately.",
  ],
  [
    "How do I know which group my child belongs in?",
    "By age — 5 to 9, 10 to 13, or 14 to 17. If your child sits near a boundary we'll talk it through with you before confirming.",
  ],
];

const SCHOOLS = [
  [
    "Can you run this inside our school?",
    "Yes. That's where Welmnt started. We run an Awareness Day for the parent body, or a Whole-School Day across students, parents and teachers. See Schools & Events.",
  ],
  [
    "Does it work in a government school?",
    "Yes. Where phones and internet can't be assumed, the assessment runs on paper. The programme itself doesn't change.",
  ],
  [
    "What do we get afterwards?",
    "A written report. For a Whole-School Day that includes a picture across grades, with themes flagged for the school's attention.",
  ],
];

function Group({ title, items, from }: { title: string; items: string[][]; from: number }) {
  return (
    <Section label={title} index={from} title={title}>
      <div className="space-y-3">
        {items.map(([q, a]) => (
          <Card key={q}>
            <h3 className="text-[1.02rem] font-semibold">{q}</h3>
            <p className="mt-2 font-body text-[0.95rem] leading-relaxed text-ink-soft">{a}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export default function FAQ() {
  return (
    <>
      <section className="border-b border-line-soft">
        <div className="mx-auto max-w-measure px-5 py-14">
          <FiveMark on={5} className="mb-5 text-[var(--ember)]" />
          <h1 className="text-[2.1rem] font-semibold tracking-[-0.03em]">Questions</h1>
        </div>
      </section>
      <Group title="For parents" items={PARENTS} from={1} />
      <Group title="For schools and partners" items={SCHOOLS} from={4} />
      <Section label="Still unsure" index={5} title="Ask us directly.">
        <LinkButton to="/contact">Contact Welmnt</LinkButton>
      </Section>
    </>
  );
}
