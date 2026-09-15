import { FiveMark, LinkButton } from "@/components/ui";

export default function ThankYou() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <img src="/assets/Sun.svg" alt="" className="mx-auto h-16 w-16" />
      <FiveMark on={5} className="mt-6 text-[var(--ember)]" />
      <h1 className="mt-4 text-[2rem] font-semibold tracking-[-0.03em]">We've got it.</h1>
      <p className="mt-4 font-body text-[1.02rem] leading-relaxed text-ink-soft">
        Someone from Welmnt will call you within one working day to confirm your child's
        group and answer anything you want to ask. If it's urgent, write to{" "}
        <a href="mailto:info@welmnt.me" className="text-[var(--ember)] underline underline-offset-4">
          info@welmnt.me
        </a>
        .
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <LinkButton to="/programmes" variant="ghost">
          Back to the programmes
        </LinkButton>
      </div>
    </div>
  );
}
