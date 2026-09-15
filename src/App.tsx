import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { SiteFooter, SiteHeader } from "@/components/site/SiteShell";
import { AuthProvider } from "@/components/admin/AuthContext";
import { AdminGuard, AdminLayout } from "@/components/admin/AdminLayout";
import { captureAttribution } from "@/lib/attribution";

import Home from "@/pages/site/Home";
import Programmes from "@/pages/site/Programmes";
import ProgrammeDetail from "@/pages/site/ProgrammeDetail";
import Schools from "@/pages/site/Schools";
import About from "@/pages/site/About";
import FAQ from "@/pages/site/FAQ";
import Contact from "@/pages/site/Contact";
import Privacy from "@/pages/site/Privacy";
import Enrol from "@/pages/site/Enrol";
import ThankYou from "@/pages/site/ThankYou";
import NotFound from "@/pages/site/NotFound";

import AdminLogin from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import Leads from "@/pages/admin/Leads";
import FollowUps from "@/pages/admin/FollowUps";
import Cohorts from "@/pages/admin/Cohorts";
import Enrollments from "@/pages/admin/Enrollments";
import Customers from "@/pages/admin/Customers";
import Payments from "@/pages/admin/Payments";
import Team from "@/pages/admin/Team";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

const site = (el: React.ReactNode) => <SiteLayout>{el}</SiteLayout>;

export default function App() {
  // First touch wins — by the time a parent fills the form the query string is gone.
  useEffect(() => {
    captureAttribution();
  }, []);

  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        {/* public */}
        <Route path="/" element={site(<Home />)} />
        <Route path="/programmes" element={site(<Programmes />)} />
        <Route path="/programmes/:slug" element={site(<ProgrammeDetail />)} />
        <Route path="/schools" element={site(<Schools />)} />
        <Route path="/about" element={site(<About />)} />
        <Route path="/faq" element={site(<FAQ />)} />
        <Route path="/contact" element={site(<Contact />)} />
        <Route path="/privacy" element={site(<Privacy />)} />
        <Route path="/enrol" element={site(<Enrol />)} />
        <Route path="/thank-you" element={site(<ThankYou />)} />

        {/* admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminGuard />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="follow-ups" element={<FollowUps />} />
            <Route path="cohorts" element={<Cohorts />} />
            <Route path="enrollments" element={<Enrollments />} />
            <Route path="customers" element={<Customers />} />
            <Route path="payments" element={<Payments />} />
            <Route path="team" element={<Team />} />
          </Route>
        </Route>

        <Route path="*" element={site(<NotFound />)} />
      </Routes>
    </AuthProvider>
  );
}
