import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * The anon key ships in the browser by design — that is the contract, not a leak.
 * What it must never be is *trusted*: every table is default-deny, the only anon
 * write is an insert-only form table, and anything touching money or PII goes
 * through a permission-checked RPC. See supabase/README.md.
 *
 * The project does not exist yet (it lands on Abdullah's org), so the client is
 * allowed to be absent. The marketing site falls back to local content rather than
 * rendering an empty page — a brochure should not go blank because a database is
 * unreachable.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

export function requireSupabase(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env and fill in the project URL and anon key."
    );
  }
  return supabase;
}
