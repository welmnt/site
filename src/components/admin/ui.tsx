import * as React from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[1.45rem] font-semibold tracking-[-0.02em]">{title}</h1>
        {subtitle && <p className="mt-1 text-[0.88rem] text-ink-faint">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-line bg-surface ${className}`}>
      {children}
    </div>
  );
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-[0.88rem]">
        <thead>
          <tr className="border-b border-line bg-band/50">
            {head.map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-ink-faint"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

const TONES: Record<string, string> = {
  new: "var(--k4)",
  contacted: "var(--k1)",
  qualified: "var(--k5)",
  trial_booked: "var(--amber)",
  won: "var(--k2)",
  lost: "var(--ink-faint)",
  junk: "var(--ink-faint)",
  pending: "var(--amber)",
  completed: "var(--k2)",
  missed: "var(--k3)",
  reserved: "var(--k4)",
  paid: "var(--k2)",
  active: "var(--k5)",
  cancelled: "var(--ink-faint)",
  refunded: "var(--k3)",
  failed: "var(--k3)",
  draft: "var(--ink-faint)",
  upcoming: "var(--k1)",
  running: "var(--k2)",
};

export function StatusBadge({ value }: { value: string }) {
  const tone = TONES[value] ?? "var(--ink-faint)";
  return (
    <span
      className="inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[0.74rem] font-semibold capitalize"
      style={{ color: tone, background: `color-mix(in oklab, ${tone} 14%, transparent)` }}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="px-5 py-14 text-center">
      <p className="text-[0.98rem] font-medium">{title}</p>
      {hint && <p className="mt-1.5 text-[0.86rem] text-ink-faint">{hint}</p>}
    </div>
  );
}

export function Stat({
  label,
  value,
  tone = "var(--ink)",
  hint,
}: {
  label: string;
  value: React.ReactNode;
  tone?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </div>
      <div className="mt-1.5 text-[1.6rem] font-semibold tracking-[-0.02em]" style={{ color: tone }}>
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[0.78rem] text-ink-faint">{hint}</div>}
    </div>
  );
}

export function ErrorNote({ error }: { error: unknown }) {
  if (!error) return null;
  const msg = error instanceof Error ? error.message : String(error);
  return (
    <div className="mb-4 rounded-xl border border-k3/30 bg-k3/5 px-4 py-3 text-[0.86rem] text-k3">
      {msg}
    </div>
  );
}
