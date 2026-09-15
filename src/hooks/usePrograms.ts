import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FALLBACK_PROGRAMS } from "@/content/programs";
import type { Program, PublicCohort } from "@/integrations/supabase/types";

/** Live programmes, falling back to the local copy deck when there's no project yet. */
export function usePrograms() {
  return useQuery<Program[]>({
    queryKey: ["programs"],
    queryFn: async () => {
      if (!supabase) return FALLBACK_PROGRAMS;
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error || !data?.length) return FALLBACK_PROGRAMS;
      return data as Program[];
    },
    initialData: FALLBACK_PROGRAMS,
  });
}

export function useProgram(slug: string | undefined) {
  const { data } = usePrograms();
  return data.find((p) => p.slug === slug);
}

/**
 * Open cohorts for a programme.
 *
 * The column list is deliberate: `meeting_url` and `notes` are REVOKED from anon in
 * migration 0002. Selecting `*` here would 403 the whole query in production, which
 * is exactly the behaviour we want — it fails loudly rather than leaking.
 */
const PUBLIC_COHORT_COLS =
  "id,program_id,name,starts_on,ends_on,weekday,start_time,timezone,seats_total,seats_taken,status,instructor";

export function useOpenCohorts(programId?: string) {
  return useQuery<PublicCohort[]>({
    queryKey: ["cohorts", programId ?? "all"],
    queryFn: async () => {
      if (!supabase) return [];
      let q = supabase
        .from("cohorts")
        .select(PUBLIC_COHORT_COLS)
        .in("status", ["upcoming", "running"])
        .order("starts_on");
      if (programId) q = q.eq("program_id", programId);
      const { data, error } = await q;
      if (error) return [];
      return (data ?? []) as unknown as PublicCohort[];
    },
    initialData: [],
  });
}
