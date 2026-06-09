"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { FadeInView } from "@/components/ui/FadeInView";

type Step = {
  number: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    number: "01",
    title: "Show us how your school runs now.",
    body: "We review your forms, spreadsheets, payments, and workflows so we can map the cleanest transition.",
  },
  {
    number: "02",
    title: "We build your setup inside MudKitchen.",
    body: "We organize the essentials, help migrate what matters, and get your school configured without making you start from zero.",
  },
  {
    number: "03",
    title: "Go live with support.",
    body: "We walk you through the system, answer questions, and help your team make the move with confidence.",
  },
];

const SOURCE_TOOLS = [
  { label: "Google Sheets", bg: "rgba(66,133,244,0.18)" },
  { label: "Email forms", bg: "rgba(234,67,53,0.18)" },
  { label: "Square payments", bg: "rgba(255,255,255,0.08)" },
  { label: "Google Docs", bg: "rgba(66,133,244,0.12)" },
];

const SETUP_ITEMS: { label: string; status: "Ready" | "Imported" | "In progress" }[] = [
  { label: "Enrollment form", status: "Ready" },
  { label: "Student records", status: "Imported" },
  { label: "Tuition billing", status: "In progress" },
  { label: "Parent portal", status: "Ready" },
  { label: "Staff access", status: "Imported" },
];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Ready: { bg: "rgba(74,170,100,0.2)", color: "#7AE2A0" },
  Imported: { bg: "rgba(160,92,69,0.25)", color: "#E8D5C8" },
  "In progress": { bg: "rgba(245,208,128,0.15)", color: "#F5D080" },
};

const PROGRESS_STEPS = ["Kickoff", "Setup", "Review", "Go Live"];
const LAUNCH_ITEMS = ["Team walkthrough complete", "Families notified", "School is live"];

const STEP_PREVIEWS = [
  /* 01 — Bring what you have */
  <div key="show" className="flex items-center justify-center w-full p-6 lg:p-8">
    <div className="w-full max-w-[340px] space-y-3">
      <p
        className="text-[10px] uppercase tracking-widest font-secondary font-semibold mb-4"
        style={{ color: "rgba(247,241,231,0.35)" }}
      >
        What you bring
      </p>
      <div className="space-y-2">
        {SOURCE_TOOLS.map((tool) => (
          <div
            key={tool.label}
            className="flex items-center gap-3 rounded-md px-3.5 py-2.5"
            style={{ backgroundColor: tool.bg, border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: "rgba(247,241,231,0.35)" }}
            />
            <span className="text-[12px] font-secondary" style={{ color: "rgba(247,241,231,0.65)" }}>
              {tool.label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 py-1">
        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(160,92,69,0.4)" }} />
        <span className="text-[10px] font-secondary shrink-0" style={{ color: "#A05C45" }}>
          we map the transition
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(160,92,69,0.4)" }} />
      </div>
      <div
        className="rounded-md px-4 py-3 text-center"
        style={{
          backgroundColor: "rgba(160,92,69,0.18)",
          border: "1px solid rgba(160,92,69,0.38)",
        }}
      >
        <span className="text-[12px] font-secondary font-semibold" style={{ color: "#E8D5C8" }}>
          One MudKitchen workspace
        </span>
      </div>
    </div>
  </div>,

  /* 02 — Setup progress */
  <div key="build" className="flex items-center justify-center w-full p-6 lg:p-8">
    <div className="w-full max-w-[360px]">
      <p
        className="text-[10px] uppercase tracking-widest font-secondary font-semibold mb-4"
        style={{ color: "rgba(247,241,231,0.35)" }}
      >
        Setup progress
      </p>
      <div className="space-y-2">
        {SETUP_ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-md px-3.5 py-2.5"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor:
                    item.status !== "In progress"
                      ? "rgba(74,170,100,0.2)"
                      : "rgba(245,208,128,0.12)",
                  border: `1px solid ${item.status !== "In progress" ? "rgba(74,170,100,0.4)" : "rgba(245,208,128,0.35)"}`,
                }}
              >
                {item.status !== "In progress" ? (
                  <Check size={9} style={{ color: "#7AE2A0" }} />
                ) : (
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "#F5D080" }}
                  />
                )}
              </div>
              <span className="text-[12px] font-secondary" style={{ color: "rgba(247,241,231,0.65)" }}>
                {item.label}
              </span>
            </div>
            <span
              className="text-[10px] font-secondary font-medium px-2.5 py-0.5 rounded-full shrink-0"
              style={{
                backgroundColor: STATUS_STYLE[item.status].bg,
                color: STATUS_STYLE[item.status].color,
              }}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>,

  /* 03 — Go live */
  <div key="live" className="flex items-center justify-center w-full p-6 lg:p-8">
    <div className="w-full max-w-[340px]">
      {/* Onboarding progress bar */}
      <div className="mb-7">
        <div className="flex items-end justify-between mb-3">
          {PROGRESS_STEPS.map((label, i) => {
            const isLast = i === PROGRESS_STEPS.length - 1;
            return (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: isLast ? "#A05C45" : "rgba(255,255,255,0.1)",
                    border: isLast ? "none" : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {isLast ? (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  ) : (
                    <Check size={10} style={{ color: "rgba(247,241,231,0.45)" }} />
                  )}
                </div>
                <span
                  className="text-[9px] font-secondary font-medium"
                  style={{ color: isLast ? "#E8D5C8" : "rgba(247,241,231,0.3)" }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="h-full w-full rounded-full" style={{ backgroundColor: "#A05C45" }} />
        </div>
      </div>

      {/* Launch checklist */}
      <div className="space-y-3">
        {LAUNCH_ITEMS.map((item) => (
          <div key={item} className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{
                backgroundColor: "rgba(74,170,100,0.2)",
                border: "1px solid rgba(74,170,100,0.4)",
              }}
            >
              <Check size={10} style={{ color: "#7AE2A0" }} />
            </div>
            <span className="text-[13px] font-secondary" style={{ color: "rgba(247,241,231,0.65)" }}>
              {item}
            </span>
          </div>
        ))}
      </div>
      <p
        className="text-center text-[11px] mt-5 font-secondary"
        style={{ color: "rgba(247,241,231,0.3)" }}
      >
        Your school is ready. Families can enroll today.
      </p>
    </div>
  </div>,
];

export default function WorkflowSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="bg-dark-panel py-28 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-16">
        {/* Heading */}
        <div className="text-center max-w-[560px] mx-auto">
          <FadeInView>
            <span
              className="inline-flex items-center gap-1.5 rounded-pill text-[11px] font-medium uppercase tracking-widest px-3.5 py-1.5 bg-white/10 border border-white/15 font-secondary"
              style={{ color: "rgba(247,241,231,0.75)" }}
            >
              Guided setup
            </span>
          </FadeInView>
          <FadeInView delay={0.08}>
            <h2
              className="font-display text-[clamp(1.9rem,3.5vw,2.75rem)] leading-[1.05] mt-5"
              style={{ color: "#F7F1E7" }}
            >
              Get MudKitchen running
              <br />
              <em style={{ color: "#E8D5C8", fontStyle: "italic" }}>without starting over.</em>
            </h2>
          </FadeInView>
          <FadeInView delay={0.14}>
            <p
              className="text-[16px] leading-relaxed mt-4"
              style={{ color: "rgba(247,241,231,0.60)" }}
            >
              New software usually creates more work before it saves any. We help move the
              important pieces over, set things up with you, and make the switch feel simple.
            </p>
          </FadeInView>
        </div>

        {/* Stepper */}
        <div className="mt-16 flex flex-col lg:flex-row gap-3 lg:gap-8 lg:items-start">
          {/* Mobile: horizontal step pills */}
          <div
            className="flex gap-2 overflow-x-auto pb-1 lg:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {STEPS.map((step, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="shrink-0 rounded-pill text-[11px] font-semibold font-secondary px-4 h-8 cursor-pointer transition-all duration-200"
                style={{
                  backgroundColor: active === i ? "#A05C45" : "rgba(255,255,255,0.08)",
                  color: active === i ? "#ffffff" : "rgba(247,241,231,0.55)",
                }}
              >
                {step.number}
              </button>
            ))}
          </div>

          {/* Desktop: vertical step sidebar */}
          <div className="hidden lg:block w-[280px] shrink-0 relative">
            <div
              className="absolute top-5 bottom-5 pointer-events-none"
              style={{
                left: "27px",
                borderLeft: "1px dashed rgba(247,241,231,0.12)",
              }}
              aria-hidden="true"
            />
            <div className="flex flex-col gap-1">
              {STEPS.map((step, i) => {
                const isActive = active === i;
                return (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className="relative flex flex-col w-full text-left px-4 py-3.5 rounded-md cursor-pointer transition-all duration-200"
                    style={{
                      backgroundColor: isActive ? "rgba(255,255,255,0.07)" : "transparent",
                      borderLeft: isActive ? "2px solid #A05C45" : "2px solid transparent",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-semibold font-secondary mt-0.5 transition-all duration-200 relative z-10"
                        style={{
                          backgroundColor: isActive ? "#A05C45" : "rgba(255,255,255,0.1)",
                          color: isActive ? "#ffffff" : "rgba(247,241,231,0.5)",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span
                        className="text-[13px] leading-snug font-medium font-secondary transition-all duration-200"
                        style={{ color: isActive ? "#F7F1E7" : "rgba(247,241,231,0.4)" }}
                      >
                        {step.title}
                      </span>
                    </div>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="text-[12px] leading-relaxed mt-2 pl-[34px] font-secondary"
                        style={{ color: "rgba(247,241,231,0.5)" }}
                      >
                        {step.body}
                      </motion.p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: preview panel */}
          <div
            className="flex-1 min-w-0 rounded-lg overflow-hidden"
            style={{
              backgroundColor: "rgba(255,255,255,0.055)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            {/* Mobile: step title + body */}
            <div
              className="lg:hidden p-6 pb-0"
            >
              <span
                className="inline-flex items-center rounded-pill text-[10px] font-semibold uppercase tracking-widest px-3 py-1 font-secondary mb-3"
                style={{ backgroundColor: "#A05C45", color: "#ffffff" }}
              >
                Step {STEPS[active].number}
              </span>
              <h3
                className="font-display text-[1.25rem] font-medium leading-snug"
                style={{ color: "#F7F1E7" }}
              >
                {STEPS[active].title}
              </h3>
              <p
                className="text-sm leading-relaxed mt-2 font-secondary"
                style={{ color: "rgba(247,241,231,0.55)" }}
              >
                {STEPS[active].body}
              </p>
            </div>

            {/* Desktop: step badge */}
            <div className="hidden lg:flex items-center gap-3 px-8 pt-8">
              <span
                className="inline-flex items-center rounded-pill text-[10px] font-semibold uppercase tracking-widest px-3 py-1 font-secondary"
                style={{ backgroundColor: "#A05C45", color: "#ffffff" }}
              >
                Step {STEPS[active].number}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="min-h-[260px] flex items-center justify-center"
              >
                {STEP_PREVIEWS[active]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Reassurance + CTAs */}
        <div
          className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-5 pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p
            className="text-[13px] text-center sm:text-left font-secondary max-w-[460px]"
            style={{ color: "rgba(247,241,231,0.38)" }}
          >
            Designed for founder-led schools that want a better system, not a complicated implementation.
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <a
              href="/get-started"
              className="inline-flex items-center gap-1.5 rounded-pill text-[13px] font-medium font-secondary px-5 h-10 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
              style={{ backgroundColor: "#A05C45", color: "#ffffff" }}
            >
              Book a Demo
              <ArrowRight size={14} />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-[13px] font-secondary hover:opacity-80 transition-all duration-200"
              style={{ color: "rgba(247,241,231,0.5)" }}
            >
              See how setup works
              <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
