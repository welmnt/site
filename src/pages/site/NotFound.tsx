import { LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="text-[2rem] font-semibold tracking-[-0.03em]">Page not found</h1>
      <p className="mt-3 font-body text-[1rem] text-ink-soft">
        That link doesn't lead anywhere. It may have moved.
      </p>
      <LinkButton to="/" className="mt-7">
        Back home
      </LinkButton>
    </div>
  );
}
