import * as React from "react";
import { Link } from "react-router-dom";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/* ── Button ─────────────────────────────────────────────────────────────── */
type Variant = "primary" | "ghost" | "quiet";
const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--ember)] text-white hover:brightness-110 shadow-[0_10px_24px_-14px_var(--ember)]",
  ghost:
    "border border-line text-ink hover:border-[var(--ember)] hover:text-[var(--ember)] bg-surface",
  quiet: "text-ink-soft hover:text-ink",
};
const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-[0.94rem] font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ember)] disabled:opacity-50 disabled:pointer-events-none";

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={cx(base, variants[variant], className)} {...props} />;
}

export function LinkButton({
  to,
  variant = "primary",
  className,
  children,
}: {
  to: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link to={to} className={cx(base, variants[variant], className)}>
      {children}
    </Link>
  );
}

/* ── Five-mark ──────────────────────────────────────────────────────────────
   The assessment's five-point scale, abstracted into a section index. It is the
   site's signature: colour and count both carry meaning, so it is never decoration. */
export function FiveMark({
  on = 1,
  className,
  style,
}: {
  on?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={cx("fivemark", className)} style={style} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} data-on={i <= on ? "1" : "0"} />
      ))}
    </span>
  );
}

/* ── Section furniture ──────────────────────────────────────────────────── */
export function Section({
  label,
  index = 1,
  accent = "var(--ember)",
  title,
  lede,
  children,
  className,
}: {
  label?: string;
  index?: number;
  accent?: string;
  title?: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("mx-auto w-full max-w-measure px-5 py-14 sm:py-20", className)}>
      {label && (
        <div className="mb-3 flex items-center gap-3" style={{ color: accent }}>
          <FiveMark on={index} />
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em]">{label}</span>
        </div>
      )}
      {title && (
        <h2 className="max-w-3xl text-[1.7rem] font-semibold leading-tight tracking-[-0.02em] sm:text-[2.2rem]">
          {title}
        </h2>
      )}
      {lede && (
        <p className="mt-4 max-w-2xl font-body text-[1.02rem] leading-relaxed text-ink-soft">
          {lede}
        </p>
      )}
      {children && <div className="mt-8">{children}</div>}
    </section>
  );
}

export function Card({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-line bg-surface p-6 shadow-card transition-colors",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ── Form field ─────────────────────────────────────────────────────────── */
export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.82rem] font-medium text-ink-soft">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-[0.76rem] text-ink-faint">{hint}</span>}
      {error && <span className="mt-1 block text-[0.76rem] text-k3">{error}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[0.95rem] text-ink placeholder:text-ink-faint focus:border-[var(--ember)] focus:outline-none focus:ring-2 focus:ring-[var(--ember)]/20";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(inputClass, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cx(inputClass, "appearance-none", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(inputClass, "min-h-24 resize-y", props.className)} />;
}

/* ── Misc ───────────────────────────────────────────────────────────────── */
export function Pill({
  children,
  tone = "var(--ember)",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.72rem] font-semibold"
      style={{ color: tone, background: `color-mix(in oklab, ${tone} 12%, transparent)` }}
    >
      {children}
    </span>
  );
}

export function accentVar(accent: string) {
  return `var(--${accent || "k1"})`;
}
