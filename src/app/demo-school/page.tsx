"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CalendarDays, School, LayoutDashboard, BookOpen, Users } from "lucide-react";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

const AdminDashboardDemo = dynamic(
  () => import("@/components/sections/AdminDashboardDemo"),
  { ssr: false }
);
const TeacherDashboardDemo = dynamic(
  () => import("@/components/sections/TeacherDashboardDemo"),
  { ssr: false }
);
const ParentDashboardDemo = dynamic(
  () => import("@/components/sections/ParentDashboardDemo"),
  { ssr: false }
);

type TabId = "admin" | "teacher" | "parent";

const TABS: { id: TabId; label: string; description: string; icon: React.ElementType }[] = [
  {
    id: "admin",
    label: "Admin View",
    description: "Enrollment, billing, reporting & school operations",
    icon: LayoutDashboard,
  },
  {
    id: "teacher",
    label: "Teacher View",
    description: "Attendance, lesson plans, hours & communication",
    icon: BookOpen,
  },
  {
    id: "parent",
    label: "Parent View",
    description: "Forms, payments, messages & daily updates",
    icon: Users,
  },
];

export default function DemoSchoolPage() {
  const [activeTab, setActiveTab] = useState<TabId>("admin");

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen"
        style={{ backgroundColor: "var(--color-surface, #FAF7F2)" }}
      >
        {/* Hero */}
        <section className="pt-28 pb-10 text-center px-6">

          <h1
            className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05]"
            style={{ color: "#2A1F1A" }}
          >
            Click through a real school.
            <br />
            <em style={{ color: "#A05C45", fontStyle: "italic" }}>
              No signup needed.
            </em>
          </h1>

          <p
            className="text-[17px] leading-relaxed mt-4 max-w-[520px] mx-auto"
            style={{ color: "rgba(42,31,26,0.6)" }}
          >
            Explore enrollment, billing, parent communication, and daily
            operations — exactly as your school would use it.
          </p>
        </section>

        {/* Tab switcher bar + CTA */}
        <div className="w-[95%] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
          {/* Tabs */}
          <div
            className="flex gap-1 p-1 rounded-xl"
            style={{
              backgroundColor: "rgba(42,31,26,0.06)",
              border: "1px solid rgba(42,31,26,0.1)",
            }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium font-secondary transition-all duration-200 cursor-pointer"
                  style={{
                    color: isActive ? "#ffffff" : "rgba(42,31,26,0.5)",
                    backgroundColor: isActive ? "#A05C45" : "transparent",
                  }}
                >
                  <tab.icon size={13} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* CTA */}
          <a
            href="/get-started"
            className="inline-flex items-center gap-2 text-white text-[13px] font-medium font-secondary rounded-pill px-5 h-10 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 shrink-0"
            style={{ backgroundColor: "#A05C45" }}
          >
            <CalendarDays size={14} />
            See this with your school
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Active tab description */}
        <div className="w-[95%] mx-auto mb-3">
          <AnimatePresence mode="wait">
            <motion.p
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="text-[12px] font-secondary"
              style={{ color: "rgba(42,31,26,0.45)" }}
            >
              {TABS.find((t) => t.id === activeTab)?.description}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Demo container — 95% width, fixed height, internally scrollable */}
        <div
          className="w-[95%] mx-auto rounded-2xl shadow-xl overflow-hidden"
          style={{
            height: "85vh",
            border: "1px solid rgba(42,31,26,0.12)",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="w-full h-full overflow-y-auto overflow-x-hidden"
            >
              {activeTab === "admin" && (
                <AdminDashboardDemo disableTour={true} defaultSidebarExpanded={true} />
              )}
              {activeTab === "teacher" && (
                <TeacherDashboardDemo disableTour={true} />
              )}
              {activeTab === "parent" && (
                <ParentDashboardDemo disableTour={true} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom CTA strip */}
        <section
          className="w-[95%] mx-auto mt-8 mb-20 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{
            backgroundColor: "rgba(160,92,69,0.07)",
            border: "1px solid rgba(160,92,69,0.18)",
          }}
        >
          <div>
            <p
              className="font-display text-[1.4rem] leading-snug"
              style={{ color: "#2A1F1A" }}
            >
              Want to see this with{" "}
              <em style={{ color: "#A05C45", fontStyle: "italic" }}>your</em>{" "}
              school's data?
            </p>
            <p
              className="text-[14px] mt-1.5"
              style={{ color: "rgba(42,31,26,0.55)" }}
            >
              30-minute live walkthrough with the founder · No pressure, no
              commitment
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/get-started"
              className="inline-flex items-center gap-2 text-white text-sm font-medium font-secondary rounded-pill px-7 h-11 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
              style={{ backgroundColor: "#A05C45" }}
            >
              Book a Live Demo
              <ArrowRight size={14} />
            </a>
            <span
              className="text-[12px] font-secondary"
              style={{ color: "rgba(42,31,26,0.4)" }}
            >
              Free · 30 min
            </span>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
