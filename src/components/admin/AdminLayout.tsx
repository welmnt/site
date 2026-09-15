import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const NAV: [string, string][] = [
  ["/admin", "Overview"],
  ["/admin/leads", "Leads"],
  ["/admin/follow-ups", "Follow-ups"],
  ["/admin/cohorts", "Cohorts"],
  ["/admin/enrollments", "Enrollments"],
  ["/admin/customers", "Customers"],
  ["/admin/payments", "Payments"],
  ["/admin/team", "Team"],
];

export function AdminGuard() {
  const { ready, configured, session, member } = useAuth();
  const loc = useLocation();

  if (!configured) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <h1 className="text-[1.4rem] font-semibold">The CRM isn't connected yet</h1>
        <p className="mt-3 font-body text-[0.97rem] leading-relaxed text-ink-soft">
          Create the Supabase project, run the migrations in <code>supabase/migrations</code>,
          then copy <code>.env.example</code> to <code>.env</code> and fill in the project URL
          and anon key.
        </p>
      </div>
    );
  }
  if (!ready) return <div className="px-5 py-24 text-center text-ink-faint">Loading…</div>;
  if (!session) return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;
  if (!member) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <h1 className="text-[1.4rem] font-semibold">No access</h1>
        <p className="mt-3 font-body text-[0.97rem] text-ink-soft">
          This account is signed in but is not an active Welmnt team member.
        </p>
      </div>
    );
  }
  return <Outlet />;
}

export function AdminLayout() {
  const { member, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--ground)]">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-2.5">
            <img src="/assets/Sun.svg" alt="" className="h-6 w-6" />
            <span className="font-semibold tracking-[-0.02em]">Welmnt</span>
            <span className="rounded-md bg-band px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider text-ink-faint">
              CRM
            </span>
          </div>
          <div className="flex items-center gap-3 text-[0.85rem]">
            <span className="text-ink-soft">
              {member?.name}
              {member?.role_key && (
                <span className="ml-1.5 text-ink-faint">· {member.role_key}</span>
              )}
            </span>
            <button onClick={signOut} className="text-ink-faint hover:text-ink">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-6 px-5 py-6">
        <nav className="hidden w-48 shrink-0 lg:block">
          <ul className="sticky top-6 space-y-0.5">
            {NAV.map(([to, label]) => (
              <li key={to}>
                <NavLink
                  end={to === "/admin"}
                  to={to}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 text-[0.88rem] transition-colors ${
                      isActive
                        ? "bg-[var(--ember)]/10 font-medium text-[var(--ember)]"
                        : "text-ink-soft hover:bg-band hover:text-ink"
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main className="min-w-0 flex-1">
          <div className="mb-5 flex gap-1.5 overflow-x-auto lg:hidden">
            {NAV.map(([to, label]) => (
              <NavLink
                key={to}
                end={to === "/admin"}
                to={to}
                className={({ isActive }) =>
                  `shrink-0 rounded-lg px-3 py-1.5 text-[0.82rem] ${
                    isActive ? "bg-[var(--ember)] text-white" : "bg-surface text-ink-soft"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
