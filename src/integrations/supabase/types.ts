// Hand-written to match supabase/migrations. Regenerate with
// `supabase gen types typescript --linked > src/integrations/supabase/types.ts`
// once the project exists.

export type CohortStatus = "draft" | "upcoming" | "running" | "completed" | "cancelled";
export type LeadStatus = "new" | "contacted" | "qualified" | "trial_booked" | "won" | "lost" | "junk";
export type EnrollmentStatus = "reserved" | "paid" | "active" | "completed" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type FollowUpStatus = "pending" | "completed" | "missed";

export type Program = {
  id: string;
  slug: string;
  title: string;
  title_ar: string | null;
  age_min: number;
  age_max: number;
  price_egp: number;
  sessions_count: number;
  duration_weeks: number;
  summary: string | null;
  summary_ar: string | null;
  outcomes: string[];
  accent: string;
  sort_order: number;
  is_active: boolean;
}

/** The anon-visible shape. meeting_url and notes are column-revoked — never here. */
export type PublicCohort = {
  id: string;
  program_id: string;
  name: string;
  starts_on: string;
  ends_on: string | null;
  weekday: number | null;
  start_time: string | null;
  timezone: string;
  seats_total: number;
  seats_taken: number;
  status: CohortStatus;
  instructor: string | null;
}

export type Cohort = PublicCohort & {
  meeting_url: string | null;
  notes: string | null;
};

export type Lead = {
  id: string;
  parent_name: string;
  phone: string;
  email: string | null;
  child_name: string | null;
  child_age: number | null;
  program_id: string | null;
  cohort_id: string | null;
  message: string | null;
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbc: string | null;
  fbp: string | null;
  status: LeadStatus;
  assigned_to: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

export type LeadInsert = {
  parent_name: string;
  phone: string;
  email?: string | null;
  child_name?: string | null;
  child_age?: number | null;
  program_id?: string | null;
  cohort_id?: string | null;
  message?: string | null;
  source?: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  fbc?: string | null;
  fbp?: string | null;
}

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  lead_id: string | null;
  created_at: string;
}

export type Enrollment = {
  id: string;
  customer_id: string;
  cohort_id: string;
  child_name: string;
  child_age: number | null;
  amount_egp: number;
  status: EnrollmentStatus;
  sold_by: string | null;
  created_at: string;
}

export type Payment = {
  id: string;
  enrollment_id: string;
  provider: string;
  provider_ref: string | null;
  amount_egp: number;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
}

export type FollowUp = {
  id: string;
  lead_id: string;
  scheduled_date: string;
  owner_id: string | null;
  notes: string | null;
  status: FollowUpStatus;
  completed_at: string | null;
  created_at: string;
}

export type TeamMember = {
  id: string;
  auth_uid: string | null;
  name: string;
  email: string;
  role_id: string | null;
  is_active: boolean;
  created_at: string;
}

export type CurrentTeamMember = {
  id: string;
  name: string;
  email: string;
  role_key: string | null;
}

export type CohortSession = {
  id: string;
  cohort_id: string;
  idx: number;
  title: string | null;
  scheduled_at: string | null;
  status: string;
  created_at: string;
}

export type AssessmentSubmission = {
  id: string;
  parent_name: string | null;
  phone: string | null;
  email: string | null;
  child_age: number | null;
  answers: unknown;
  scores: unknown;
  lead_id: string | null;
  created_at: string;
}

export type Role = {
  id: string;
  key: string;
  label: string;
}

export type RolePermission = {
  role_id: string;
  resource: string;
  action: string;
}

/**
 * supabase-js resolves every query against this map. A table missing from it does
 * not merely lose its types — the client collapses to `never` and the call stops
 * compiling, which is why every table in the migrations appears here.
 */
type Tbl<Row, Ins = Partial<Row>, Upd = Partial<Row>> = {
  Row: Row;
  Insert: Ins;
  Update: Upd;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      programs: Tbl<Program>;
      cohorts: Tbl<Cohort>;
      cohort_sessions: Tbl<CohortSession>;
      leads: Tbl<Lead, LeadInsert>;
      customers: Tbl<Customer>;
      enrollments: Tbl<Enrollment>;
      payments: Tbl<Payment>;
      follow_ups: Tbl<FollowUp, Partial<FollowUp> & { lead_id: string; scheduled_date: string }>;
      assessment_submissions: Tbl<AssessmentSubmission>;
      roles: Tbl<Role>;
      role_permissions: Tbl<RolePermission>;
      team_members: Tbl<TeamMember>;
    };
    Views: Record<string, never>;
    Functions: {
      user_has_permission: {
        Args: { p_resource: string; p_action: string };
        Returns: boolean;
      };
      current_team_member: {
        Args: Record<string, never>;
        Returns: CurrentTeamMember[];
      };
      get_dashboard: {
        Args: { p_period: string };
        Returns: unknown;   // jsonb — shaped by src/types/dashboard.ts
      };
    };
    Enums: {
      cohort_status: CohortStatus;
      lead_status: LeadStatus;
      enrollment_status: EnrollmentStatus;
      payment_status: PaymentStatus;
      followup_status: FollowUpStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
