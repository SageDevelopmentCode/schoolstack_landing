"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { FadeInView } from "@/components/ui/FadeInView";
import { ACCENT_HIGHLIGHT, BOLD_HEADING } from "@/components/home/bright-styles";

const WITHOUT = [
  {
    label: "Enrollment tracking",
    detail: "Spreadsheet with family names, tour dates, and status columns maintained manually.",
  },
  {
    label: "Family communication",
    detail: "Email chains and group texts — no way to ensure everyone received the right info.",
  },
  {
    label: "Tuition collection",
    detail: "Manual invoices via Venmo, Zelle, or bank transfer. Chasing payments every month.",
  },
  {
    label: "Staff coordination",
    detail: "Separate group chats, shared Google Docs, and calendar invites across three platforms.",
  },
  {
    label: "Operations overview",
    detail: "No single view of the school. Context switching between apps to answer basic questions.",
  },
];

const WITH = [
  {
    label: "Enrollment tracking",
    detail: "Lead pipeline with status, tour scheduling, and enrollment agreements all in one place.",
  },
  {
    label: "Family communication",
    detail: "Parent portal with updates, documents, and messaging — one channel for all families.",
  },
  {
    label: "Tuition collection",
    detail: "Automated invoicing, online payment, and billing history visible to parents and admin.",
  },
  {
    label: "Staff coordination",
    detail: "Teacher workspace with shared calendar, student roster, SOPs, and activity feed.",
  },
  {
    label: "Operations overview",
    detail: "Admin dashboard showing leads, finances, attendance, and school calendar in one view.",
  },
];

export default function SagefieldBeforeAfter() {
  const [showWith, setShowWith] = useState(false);

  const items = showWith ? WITH : WITHOUT;

  return (
    <section className="bg-white px-3 py-12 lg:px-6">
      <div className="mx-auto max-w-[1400px] px-3 md:px-6 lg:px-10">
        <div className="mb-12 max-w-[600px]">
          <FadeInView>
            <p className="font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay">
              Before &amp; after
            </p>
          </FadeInView>
          <FadeInView delay={0.08}>
            <h2 className={`mt-5 text-[clamp(1.9rem,3.5vw,2.6rem)] ${BOLD_HEADING}`}>
              What changed with <span className={ACCENT_HIGHLIGHT}>MudKitchen.</span>
            </h2>
          </FadeInView>
          <FadeInView delay={0.14}>
            <p className="mt-4 font-secondary text-[16px] leading-relaxed text-[#1d1a16]/70">
              Microschool founders don&apos;t lack tools — they have too many disconnected ones. The
              difference isn&apos;t a new feature. It&apos;s having one system that holds everything.
            </p>
          </FadeInView>
        </div>

        <FadeInView delay={0.18}>
          <div className="mb-8 max-w-full overflow-x-auto">
            <div className="flex w-full max-w-full items-center rounded-pill border border-black/10 bg-[#F7F5F2] p-1 sm:inline-flex sm:w-auto">
              <button
                type="button"
                onClick={() => setShowWith(false)}
                className={`relative isolate flex h-8 flex-1 cursor-pointer items-center justify-center rounded-pill px-2.5 font-secondary text-[11px] font-semibold leading-none transition-all duration-200 sm:h-9 sm:flex-none sm:px-5 sm:text-[13px] ${
                  !showWith ? "bg-white text-[#1d1a16] shadow-sm" : "text-[#1d1a16]/55"
                }`}
              >
                <span className="relative z-10 inline-flex items-center whitespace-nowrap">
                  <span className="sm:hidden">Without a system</span>
                  <span className="hidden sm:inline">Without an operating system</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowWith(true)}
                className={`relative isolate flex h-8 flex-1 cursor-pointer items-center justify-center rounded-pill px-2.5 font-secondary text-[11px] font-semibold leading-none transition-all duration-200 sm:h-9 sm:flex-none sm:px-5 sm:text-[13px] ${
                  showWith ? "bg-white text-[#1d1a16] shadow-sm" : "text-[#1d1a16]/55"
                }`}
              >
                <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap sm:gap-2">
                  <Image
                    src="/images/Logo.png"
                    alt=""
                    width={18}
                    height={18}
                    className="h-3.5 w-3.5 shrink-0 object-contain sm:h-[18px] sm:w-[18px]"
                    aria-hidden
                  />
                  With MudKitchen
                </span>
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={showWith ? "with" : "without"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className={`mb-6 inline-flex items-center gap-2 rounded-pill border px-4 py-1.5 font-secondary text-[11px] font-semibold uppercase tracking-widest ${
                  showWith
                    ? "border-[#E4F5EC] bg-[#E4F5EC] text-[#1d1a16]"
                    : "border-clay/25 bg-clay/10 text-clay"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${showWith ? "bg-[#1d1a16]" : "bg-clay"}`} />
                {showWith ? "With MudKitchen" : "Without an operating system"}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.16, 1, 0.3, 1],
                      delay: i * 0.05,
                    }}
                    className={`rounded-[24px] border bg-white p-5 ${
                      showWith ? "border-[#E4F5EC]" : "border-black/10"
                    }`}
                  >
                    <div className="mb-3 flex items-start gap-2.5">
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          showWith ? "border-[#E4F5EC] bg-[#E4F5EC]" : "border-clay/25 bg-clay/10"
                        }`}
                      >
                        {showWith ? (
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden>
                            <path
                              d="M1.5 4.5L3.5 6.5L7.5 2.5"
                              stroke="#1d1a16"
                              strokeWidth="1.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden>
                            <path
                              d="M2 2L7 7M7 2L2 7"
                              stroke="#A05C45"
                              strokeWidth="1.4"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="font-secondary text-[13.5px] font-semibold text-[#1d1a16]">
                        {item.label}
                      </span>
                    </div>
                    <p className="font-secondary text-[13px] leading-relaxed text-[#1d1a16]/70">
                      {item.detail}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </FadeInView>
      </div>
    </section>
  );
}
