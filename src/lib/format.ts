export const egp = (n: number) =>
  new Intl.NumberFormat("en-EG", { maximumFractionDigits: 0 }).format(n) + " EGP";

export const shortDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";

export const dateTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—";

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const seatsLabel = (taken: number, total: number) => {
  const left = Math.max(0, total - taken);
  if (left === 0) return "Full";
  if (left <= 3) return `${left} seat${left === 1 ? "" : "s"} left`;
  return `${total - taken} of ${total} seats open`;
};
