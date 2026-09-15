/** Shape returned by the `get_dashboard` RPC. See supabase/migrations/…_dashboard.sql */

export type PeriodKey = "today" | "week" | "month" | "quarter";

export interface Metric {
  current: number;
  previous: number;
}

export interface SeriesPoint {
  label: string;   // this period's bucket, e.g. "08 Sep" / "14:00"
  plabel: string;  // the aligned bucket from last period, e.g. "08 Aug"
  future: boolean; // hasn't happened yet — the solid line stops here
  leads_c: number; leads_p: number;
  enr_c: number;   enr_p: number;
  rev_c: number;   rev_p: number;
}

export interface DashboardData {
  period: {
    key: PeriodKey; label: string;
    start: string; end: string; prev_start: string; prev_end: string;
  };
  pulse: {
    new_leads: Metric; enrolled: Metric; collected: Metric; outstanding: Metric;
  };
  series: SeriesPoint[];
  funnel: { leads: number; contacted: number; qualified: number; booked: number; paid: number };
  leaks: {
    uncontacted_48h: number; missed_follow_ups: number; overdue_follow_ups: number;
    today_follow_ups: number; stalled_7d: number;
    unpaid_reserved: number; unpaid_amount: number; underfilled_soon: number;
  };
  cohorts: {
    id: string; name: string; programme: string; accent: string;
    starts_on: string; status: string;
    seats_taken: number; seats_total: number; days_out: number;
  }[];
  agents: { id: string; name: string; assigned: number; won: number; revenue: number }[];
  sources: { source: string; leads: number }[];
}
