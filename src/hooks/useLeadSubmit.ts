import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAttribution } from "@/lib/attribution";
import { newEventId, trackLead } from "@/lib/pixel";
import type { LeadInsert } from "@/integrations/supabase/types";

/**
 * What a lead is worth to the pixel. Not the 3,000 EGP price — that is a SALE.
 * This is the programme price times a deliberately conservative close rate, so the
 * value Meta optimises on isn't fiction. Revisit once there is a real close rate
 * in the CRM; until then under-claiming is the safe direction.
 */
const LEAD_VALUE_EGP = 300;

export interface LeadFormValues {
  parent_name: string;
  phone: string;
  email?: string;
  child_name?: string;
  child_age?: number;
  program_id?: string | null;
  cohort_id?: string | null;
  message?: string;
  source?: string;
}

/**
 * The one public write in the whole app.
 *
 * `leads` is INSERT-only for anon and has no SELECT policy, so this cannot read the
 * row back — `.select()` after insert would fail. Fire and confirm, don't echo.
 */
export function useLeadSubmit() {
  return useMutation({
    mutationFn: async (values: LeadFormValues) => {
      if (!supabase) {
        // No project yet. Don't pretend it worked — say so, and keep the entry
        // so nothing a parent typed is silently thrown away during setup.
        console.warn("[welmnt] Supabase not configured — lead not persisted:", values);
        throw new Error("NOT_CONFIGURED");
      }
      const attribution = getAttribution();
      // One id, two reports. The pixel fires it from the browser and the row keeps
      // it so a Conversions API send can be deduplicated against the same event
      // instead of counting the lead twice.
      const eventId = newEventId();
      const payload: LeadInsert = {
        parent_name: values.parent_name.trim(),
        phone: values.phone.trim(),
        email: values.email?.trim() || null,
        child_name: values.child_name?.trim() || null,
        child_age: values.child_age ?? null,
        program_id: values.program_id ?? null,
        cohort_id: values.cohort_id ?? null,
        message: values.message?.trim() || null,
        source: values.source ?? "website",
        utm_source: attribution.utm_source ?? null,
        utm_medium: attribution.utm_medium ?? null,
        utm_campaign: attribution.utm_campaign ?? null,
        utm_content: attribution.utm_content ?? null,
        utm_term: attribution.utm_term ?? null,
        fbc: attribution.fbc ?? null,
        fbp: attribution.fbp ?? null,
        meta_event_id: eventId,
      };
      const { error } = await supabase.from("leads").insert(payload);
      if (error) throw error;
      // Only after the row is safely written. Reporting a conversion Meta will
      // optimise toward, for a lead that failed to save, is the worst outcome here.
      trackLead(LEAD_VALUE_EGP, eventId);
      return true;
    },
  });
}
