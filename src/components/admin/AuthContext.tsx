import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import type { CurrentTeamMember } from "@/integrations/supabase/types";

interface AuthState {
  ready: boolean;
  configured: boolean;
  session: Session | null;
  member: CurrentTeamMember | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [member, setMember] = useState<CurrentTeamMember | null>(null);
  const [ready, setReady] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (alive) setSession(data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    if (!session) {
      setMember(null);
      setReady(true);
      return;
    }
    let alive = true;
    /**
     * Authentication is not authorization. A Supabase login only proves the person
     * holds an account — `current_team_member` is what decides whether they are staff
     * here, and every table policy re-checks it server-side anyway.
     */
    supabase
      .rpc("current_team_member")
      .then(({ data, error }) => {
        if (!alive) return;
        setMember(!error && data?.length ? (data[0] as CurrentTeamMember) : null);
        setReady(true);
      });
    return () => {
      alive = false;
    };
  }, [session]);

  const value = useMemo<AuthState>(
    () => ({
      ready,
      configured: isSupabaseConfigured,
      session,
      member,
      signIn: async (email, password) => {
        if (!supabase) throw new Error("Supabase is not configured.");
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signOut: async () => {
        await supabase?.auth.signOut();
        setMember(null);
      },
    }),
    [ready, session, member]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
  return v;
}
