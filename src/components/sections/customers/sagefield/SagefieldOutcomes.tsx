"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BookOpen, LayoutDashboard, Users } from "lucide-react";
import { FadeInView } from "@/components/ui/FadeInView";
import SagefieldOutcomeDemoPreview from "@/components/demo/sagefield/SagefieldOutcomeDemoPreview";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { ACCENT_HIGHLIGHT, BOLD_HEADING, DARK_PILL, GROUP_TINTS } from "@/components/home/bright-styles";

const TABS = [
  {
    id: "parent" as const,
    label: "Parent",
    icon: Users,
    tint: GROUP_TINTS.parent,
    outcome: "Keep families informed",
    tagline: "Parents have a single place for everything related to their child's school experience.",
    items: [
      "Tuition access and payment history",
      "School news and announcements",
      "Direct communication with staff",
      "Class schedule and calendar",
      "Documents and forms",
      "Visibility into their child's daily experience",
    ],
  },
  {
    id: "teacher" as const,
    label: "Teacher",
    icon: BookOpen,
    tint: GROUP_TINTS.teacher,
    outcome: "Give teachers one place to work",
    tagline: "Teachers see their students, their schedule, and their responsibilities in one workspace.",
    items: [
      "Daily attendance tracking",
      "Student roster and profiles",
      "Shared school calendar",
      "Activity feed and updates",
      "Documents and SOPs",
      "Payroll and hours visibility",
    ],
  },
  {
    id: "admin" as const,
    label: "Admin",
    icon: LayoutDashboard,
    tint: GROUP_TINTS.admin,
    outcome: "Run operations without spreadsheets",
    tagline: "Administrators run the whole school from one coordinated system.",
    items: [
      "Lead and tour management",
      "Parent and student records",
      "School finances and invoicing",
      "Calendar and event coordination",
      "Marketing and outreach tools",
      "Staff management and scheduling",
    ],
  },
];

type TabId = (typeof TABS)[number]["id"];

export default function SagefieldOutcomes() {
  const [activeTab, setActiveTab] = useState<TabId>("parent");

  const current = TABS.find((t) => t.id === activeTab)!;
  const ActiveIcon = current.icon;

  return (
    <section id="outcomes" className="overflow-x-hidden bg-white px-3 py-12 lg:overflow-visible lg:px-6">
      <div className="mx-auto max-w-[1400px] overflow-x-hidden pl-3 pr-0 md:pl-6 lg:px-10">
        <div className="max-w-[640px] pr-6 lg:pr-0">
          <FadeInView>
            <p className="font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay">
              What we helped Sage Field run
            </p>
          </FadeInView>
          <FadeInView delay={0.08}>
            <h2 className={`mt-5 text-[clamp(1.9rem,3.5vw,2.6rem)] ${BOLD_HEADING}`}>
              Four outcomes. <span className={ACCENT_HIGHLIGHT}>One platform.</span>
            </h2>
          </FadeInView>
          <FadeInView delay={0.14}>
            <p className="mt-4 font-secondary text-[16px] leading-relaxed text-[#1d1a16]/70">
              The platform didn&apos;t just provide features — it gave every person in the school a clear
              operating surface so everyone could do their job without chasing information.
            </p>
          </FadeInView>
        </div>

        <FadeInView delay={0.18}>
          <div className="relative mt-12 mr-6 inline-flex items-center gap-1 rounded-pill border border-black/10 bg-[#F7F5F2] p-1 lg:mr-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative z-10 flex h-9 cursor-pointer items-center gap-2 rounded-pill px-5 font-secondary text-[13px] font-semibold transition-colors duration-200 ${
                    isActive ? "text-[#1d1a16]" : "text-[#1d1a16]/55 hover:text-[#1d1a16]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sagefield-tab-indicator"
                      className="absolute inset-0 z-[-1] rounded-pill"
                      style={{ backgroundColor: tab.tint }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                  <Icon size={14} aria-hidden />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </FadeInView>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_1fr]"
            >
              <div
                className="mr-6 rounded-[28px] p-6 lg:mr-0 lg:p-8"
                style={{ backgroundColor: current.tint }}
              >
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80">
                    <ActiveIcon size={16} className="text-clay" aria-hidden />
                  </div>
                  <span className="font-secondary text-[11px] font-semibold uppercase tracking-widest text-clay">
                    {current.outcome}
                  </span>
                </div>

                <p className="mb-6 font-secondary text-[16px] leading-relaxed text-[#1d1a16]/75">
                  {current.tagline}
                </p>

                <div className="space-y-2.5">
                  {current.items.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white">
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden>
                          <path
                            d="M1.5 4.5L3.5 6.5L7.5 2.5"
                            stroke="#1d1a16"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span className="font-secondary text-[14px] leading-snug text-[#1d1a16]/75">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <SagefieldOutcomeDemoPreview role={activeTab} />
            </motion.div>
          </AnimatePresence>
        </div>

        <FadeInView delay={0.12}>
          <div className="mr-6 mt-14 flex flex-col items-start justify-between gap-5 rounded-[28px] border border-black/8 bg-[#F7F5F2] px-7 py-6 sm:flex-row sm:items-center lg:mr-0">
            <div>
              <p className="font-secondary text-[15px] font-semibold text-[#1d1a16]">
                Ready to see the platform for your school?
              </p>
              <p className="mt-1 font-secondary text-[13px] text-[#1d1a16]/60">
                Walk through it live with someone who runs a microschool.
              </p>
            </div>
            <a href={BOOK_DEMO_HASH_HREF} className={`${DARK_PILL} h-11 shrink-0`}>
              Book a demo
              <ArrowRight size={14} aria-hidden />
            </a>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
