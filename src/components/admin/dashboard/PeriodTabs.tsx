import type { PeriodKey } from "@/types/dashboard";

const TABS: { value: PeriodKey; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
];

export function PeriodTabs({
  value,
  onChange,
}: {
  value: PeriodKey;
  onChange: (p: PeriodKey) => void;
}) {
  return (
    <div className="inline-flex gap-1 rounded-xl border border-line bg-band/60 p-1">
      {TABS.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`rounded-lg px-3 py-1.5 text-[0.85rem] font-medium transition-colors ${
            value === t.value
              ? "bg-surface text-ink shadow-sm"
              : "text-ink-faint hover:text-ink-soft"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
