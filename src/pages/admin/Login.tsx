import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Button, Field, Input } from "@/components/ui";
import { useAuth } from "@/components/admin/AuthContext";

export default function AdminLogin() {
  const { session, member, signIn, configured } = useAuth();
  const loc = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (session && member) return <Navigate to={loc.state?.from ?? "/admin"} replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      // Never distinguish "no such account" from "wrong password" — that's an
      // account-enumeration oracle.
      setError("Those details didn't work.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ground)] px-5">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-7 shadow-card">
        <div className="mb-6 flex items-center gap-2.5">
          <img src="/assets/Sun.svg" alt="" className="h-7 w-7" />
          <span className="text-[1.05rem] font-semibold tracking-[-0.02em]">Welmnt CRM</span>
        </div>

        {!configured ? (
          <p className="text-[0.9rem] leading-relaxed text-ink-soft">
            Supabase isn't configured. Fill in <code>.env</code> and reload.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4">
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </Field>
            {error && <p className="text-[0.84rem] text-k3">{error}</p>}
            <Button type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
            <p className="text-[0.76rem] leading-relaxed text-ink-faint">
              Accounts are created by an admin. Public signup is disabled.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
