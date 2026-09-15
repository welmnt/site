import { FiveMark } from "@/components/ui";

const BLOCKS: [string, string[]][] = [
  [
    "What we collect",
    [
      "What you type into a form on this site: your name, your phone number, and optionally your email, your child's first name and their age.",
      "Where you arrived from, if you came through an ad or a campaign link.",
      "If you complete the parenting assessment: your answers to it.",
    ],
  ],
  [
    "What we do with it",
    [
      "Contact you about the programme you asked about.",
      "Place your child in the right age group.",
      "Understand which of our campaigns bring families to us.",
    ],
  ],
  [
    "What we never do",
    [
      "Sell your details, or anyone's.",
      "Share them with another company for their own marketing.",
      "Publish anything that identifies a child.",
    ],
  ],
  [
    "Children",
    [
      "A child does not create an account on this site. A parent or guardian enrols them, and a parent or guardian can ask us to delete everything we hold at any time.",
      "Session content stays inside the session. We do not publish what a child says.",
    ],
  ],
  [
    "Your rights",
    [
      "Ask us what we hold about you. Ask us to correct it. Ask us to delete it.",
      "Write to info@welmnt.me and we will action it.",
    ],
  ],
];

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <FiveMark on={5} className="mb-5 text-[var(--ember)]" />
      <h1 className="text-[2rem] font-semibold tracking-[-0.03em]">Privacy</h1>
      <p className="mt-4 font-body text-[1rem] leading-relaxed text-ink-soft">
        Plain version: we collect what we need to call you back and put your child in the
        right group. Nothing else, and we don't pass it on.
      </p>
      <div className="mt-10 space-y-9">
        {BLOCKS.map(([h, items], i) => (
          <section key={h}>
            <div className="flex items-center gap-3" style={{ color: `var(--k${i + 1})` }}>
              <FiveMark on={i + 1} />
              <h2 className="text-[1.1rem] font-semibold">{h}</h2>
            </div>
            <ul className="mt-3 space-y-2">
              {items.map((x) => (
                <li key={x} className="font-body text-[0.96rem] leading-relaxed text-ink-soft">
                  {x}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-12 text-[0.82rem] text-ink-faint">
        Welmnt for Educational and Technical Services LLC · Cairo, Egypt · info@welmnt.me
      </p>
    </div>
  );
}
