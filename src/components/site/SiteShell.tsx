import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FiveMark } from "@/components/ui";

const NAV = [
  { to: "/programmes", label: "Programmes" },
  { to: "/schools", label: "Schools & Events" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Welmnt — home">
      <img src="/assets/Sun.svg" alt="" className="h-8 w-8" />
      <span className="text-[1.15rem] font-semibold tracking-[-0.02em]">Welmnt</span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line-soft bg-[var(--ground)]/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-measure items-center justify-between gap-4 px-5">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-[0.88rem] transition-colors ${
                  isActive ? "text-[var(--ember)]" : "text-ink-soft hover:text-ink"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
          <Link
            to="/enrol"
            className="ml-2 rounded-xl bg-[var(--ember)] px-4 py-2 text-[0.88rem] font-medium text-white transition-all hover:brightness-110"
          >
            Book a place
          </Link>
        </nav>
        <button
          className="rounded-lg border border-line p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Menu"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              d={open ? "M3 3l12 12M15 3L3 15" : "M2 5h14M2 9h14M2 13h14"}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>
      </div>
      {open && (
        <div className="border-t border-line-soft bg-surface px-5 py-3 md:hidden">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className="block rounded-lg px-2 py-2.5 text-[0.95rem] text-ink-soft"
            >
              {n.label}
            </NavLink>
          ))}
          <Link
            to="/enrol"
            className="mt-2 block rounded-xl bg-[var(--ember)] px-4 py-2.5 text-center text-[0.95rem] font-medium text-white"
          >
            Book a place
          </Link>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line-soft bg-surface">
      <div className="mx-auto grid max-w-measure gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs font-body text-[0.9rem] leading-relaxed text-ink-soft">
            Empowering young minds, one step at a time.
          </p>
          <FiveMark on={5} className="mt-4 text-[var(--ember)]" />
        </div>
        <div>
          <h3 className="mb-3 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Programmes
          </h3>
          <ul className="space-y-2 text-[0.9rem] text-ink-soft">
            <li><Link to="/programmes/ages-5-9" className="hover:text-ink">Ages 5–9</Link></li>
            <li><Link to="/programmes/ages-10-13" className="hover:text-ink">Ages 10–13</Link></li>
            <li><Link to="/programmes/ages-14-17" className="hover:text-ink">Ages 14–17</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Welmnt
          </h3>
          <ul className="space-y-2 text-[0.9rem] text-ink-soft">
            <li><Link to="/schools" className="hover:text-ink">Schools &amp; Events</Link></li>
            <li><Link to="/about" className="hover:text-ink">About</Link></li>
            <li><Link to="/faq" className="hover:text-ink">FAQ</Link></li>
            <li><Link to="/privacy" className="hover:text-ink">Privacy</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Contact
          </h3>
          <ul className="space-y-2 text-[0.9rem] text-ink-soft">
            <li><a href="mailto:info@welmnt.me" className="hover:text-ink">info@welmnt.me</a></li>
            <li>
              <a
                href="https://www.linkedin.com/company/welmnt"
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-ink"
              >
                LinkedIn
              </a>
            </li>
          </ul>
          <p className="mt-4 text-[0.78rem] leading-relaxed text-ink-faint">
            Welmnt for Educational and Technical Services LLC · Cairo, Egypt
          </p>
        </div>
      </div>
      <div className="border-t border-line-soft">
        <div className="mx-auto max-w-measure px-5 py-5 text-[0.78rem] text-ink-faint">
          © {new Date().getFullYear()} Welmnt. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
