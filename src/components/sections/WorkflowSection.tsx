"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MonitorPlay,
  Globe,
  CalendarCheck,
  Sparkles,
  Layers,
  ArrowRight,
  Play,
  Check,
} from "lucide-react";
import { FadeInView } from "@/components/ui/FadeInView";
import type { LucideIcon } from "lucide-react";

type Step = {
  number: string;
  icon: LucideIcon;
  title: string;
  shortTitle: string;
  body: string;
  cta: string;
  footnote: string;
  href: string;
};

const STEPS: Step[] = [
  {
    number: "01",
    icon: MonitorPlay,
    title: "Watch the 2-minute tour",
    shortTitle: "Tour",
    body: "See how one tool replaces spreadsheets, emails, and scattered apps.",
    cta: "Watch the Tour",
    footnote: "2 min · No signup",
    href: "#",
  },
  {
    number: "02",
    icon: Globe,
    title: "Explore a sample microschool",
    shortTitle: "Explore",
    body: "Click through enrollment, billing, and parent communication like it's your own school.",
    cta: "Explore the Demo School",
    footnote: "No account needed",
    href: "#",
  },
  {
    number: "03",
    icon: CalendarCheck,
    title: "See your workflows in a live demo",
    shortTitle: "Demo",
    body: "Walk through your actual processes with the founder who runs a real microschool.",
    cta: "Book a Live Demo",
    footnote: "30 min · No pressure",
    href: "/get-started",
  },
  {
    number: "04",
    icon: Sparkles,
    title: "Start a guided free trial",
    shortTitle: "Trial",
    body: "We'll help you set up enrollments, families, and staff so you're not starting from scratch.",
    cta: "Start Free Trial",
    footnote: "No credit card required",
    href: "#",
  },
  {
    number: "05",
    icon: Layers,
    title: "Go live with confidence",
    shortTitle: "Go Live",
    body: "Pick a plan once it's working for your school—no pressure, no contracts.",
    cta: "View Pricing",
    footnote: "Cancel anytime",
    href: "#pricing",
  },
];

const TRIAL_FEATURES = [
  "Website builder + hosting",
  "Enrollment & lead management",
  "Parent communication portal",
  "Billing & payment processing",
  "Staff scheduling & tasks",
  "Document storage & e-signing",
  "Reporting dashboard",
];

const PRICING_PLANS = [
  { name: "Starter", price: "$79", note: "Up to 30 students", featured: false },
  { name: "Growth", price: "$149", note: "Up to 100 students", featured: true },
  { name: "Full", price: "$249", note: "Unlimited students", featured: false },
];

const CALENDAR_DATES = [13, 14, 15, 16, 17, 20, 21, 22, 23, 24];
const CALENDAR_AVAILABLE = [14, 17, 21];

const STEP_PREVIEWS = [
  /* 01 — Tour */
  <div
    key="tour"
    className="flex flex-col items-center justify-center gap-4 w-full px-8 py-10"
  >
    <div
      className="w-16 h-16 rounded-full flex items-center justify-center"
      style={{
        backgroundColor: "rgba(160,92,69,0.25)",
        border: "1px solid rgba(160,92,69,0.4)",
      }}
    >
      <Play size={24} style={{ color: "#E8D5C8" }} fill="#E8D5C8" />
    </div>
    <div className="w-full max-w-[280px] space-y-2">
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full w-[35%] rounded-full"
          style={{ backgroundColor: "#A05C45" }}
        />
      </div>
      <div className="flex justify-between">
        <span
          className="text-[11px] font-mono"
          style={{ color: "rgba(247,241,231,0.3)" }}
        >
          0:48
        </span>
        <span
          className="text-[11px] font-mono"
          style={{ color: "rgba(247,241,231,0.3)" }}
        >
          2:14
        </span>
      </div>
    </div>
    <p
      className="text-[12px] text-center"
      style={{ color: "rgba(247,241,231,0.35)" }}
    >
      Product tour · 2 min 14 sec
    </p>
  </div>,

  /* 02 — Explore sample microschool */
  <div key="explore" className="flex items-center justify-center w-full p-6">
    <div
      className="w-full max-w-[420px] rounded-lg overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div
        className="flex gap-0 border-b"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          backgroundColor: "rgba(255,255,255,0.03)",
        }}
      >
        {["Enrollment", "Billing", "Messages"].map((tab, idx) => (
          <div
            key={tab}
            className="px-4 py-2.5 text-[11px] font-secondary font-medium"
            style={{
              color: idx === 0 ? "#E8D5C8" : "rgba(247,241,231,0.35)",
              borderBottom:
                idx === 0 ? "2px solid #A05C45" : "2px solid transparent",
            }}
          >
            {tab}
          </div>
        ))}
      </div>
      <div
        className="p-4 space-y-2.5"
        style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
      >
        <div className="flex items-center justify-between">
          <div
            className="h-4 w-28 rounded"
            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          />
          <div
            className="h-6 w-20 rounded-full"
            style={{
              backgroundColor: "rgba(160,92,69,0.25)",
              border: "1px solid rgba(160,92,69,0.35)",
            }}
          />
        </div>
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="flex items-center gap-3 rounded-md px-3 py-2.5"
            style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
          >
            <div
              className="w-6 h-6 rounded-full shrink-0"
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            />
            <div className="flex-1 space-y-1.5">
              <div
                className="h-2.5 rounded w-3/4"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              />
              <div
                className="h-2 rounded w-1/2"
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              />
            </div>
            <div
              className="h-5 w-14 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            />
          </div>
        ))}
      </div>
    </div>
  </div>,

  /* 03 — Demo booking */
  <div key="demo" className="flex items-center justify-center w-full p-6">
    <div
      className="w-full max-w-[300px] rounded-md p-5"
      style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
    >
      <p
        className="text-center text-[11px] uppercase tracking-widest font-secondary mb-4"
        style={{ color: "rgba(247,241,231,0.4)" }}
      >
        June 2026
      </p>
      <div className="grid grid-cols-5 gap-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-secondary pb-1"
            style={{ color: "rgba(247,241,231,0.3)" }}
          >
            {d}
          </div>
        ))}
        {CALENDAR_DATES.map((d) => (
          <button
            key={d}
            className="text-center text-[12px] rounded-lg py-1.5 font-secondary transition-all"
            style={{
              backgroundColor: CALENDAR_AVAILABLE.includes(d)
                ? "rgba(160,92,69,0.3)"
                : "rgba(255,255,255,0.05)",
              color: CALENDAR_AVAILABLE.includes(d)
                ? "#E8D5C8"
                : "rgba(247,241,231,0.4)",
              border: CALENDAR_AVAILABLE.includes(d)
                ? "1px solid rgba(160,92,69,0.4)"
                : "1px solid transparent",
            }}
          >
            {d}
          </button>
        ))}
      </div>
      <p
        className="text-center text-[11px] mt-3"
        style={{ color: "rgba(247,241,231,0.3)" }}
      >
        Highlighted dates have open slots
      </p>
    </div>
  </div>,

  /* 04 — Trial checklist */
  <div key="trial" className="flex items-center justify-center w-full p-8">
    <div className="w-full max-w-[360px]">
      <p
        className="text-[12px] font-semibold font-secondary uppercase tracking-widest mb-5"
        style={{ color: "rgba(247,241,231,0.4)" }}
      >
        Guided setup · 30 days free
      </p>
      <div className="space-y-2.5">
        {TRIAL_FEATURES.map((f) => (
          <div key={f} className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{
                backgroundColor: "rgba(160,92,69,0.2)",
                border: "1px solid rgba(160,92,69,0.4)",
              }}
            >
              <Check size={11} style={{ color: "#E8D5C8" }} />
            </div>
            <span
              className="text-[13px] font-secondary"
              style={{ color: "rgba(247,241,231,0.6)" }}
            >
              {f}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>,

  /* 05 — Pricing mini cards */
  <div key="pricing" className="flex items-center justify-center w-full p-8">
    <div className="flex gap-3 w-full max-w-[460px]">
      {PRICING_PLANS.map((p) => (
        <div
          key={p.name}
          className="flex-1 rounded-md p-4 flex flex-col gap-1.5"
          style={{
            backgroundColor: p.featured
              ? "rgba(160,92,69,0.15)"
              : "rgba(255,255,255,0.04)",
            border: p.featured
              ? "1px solid rgba(160,92,69,0.35)"
              : "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <span
            className="text-[11px] font-secondary font-semibold uppercase tracking-widest"
            style={{ color: p.featured ? "#E8D5C8" : "rgba(247,241,231,0.4)" }}
          >
            {p.name}
          </span>
          <span
            className="font-display font-medium"
            style={{ color: "#F7F1E7", fontSize: "1.4rem" }}
          >
            {p.price}
            <span className="text-[12px] opacity-50">/mo</span>
          </span>
          <span
            className="text-[11px] font-secondary"
            style={{ color: "rgba(247,241,231,0.4)" }}
          >
            {p.note}
          </span>
        </div>
      ))}
    </div>
  </div>,
];

export default function WorkflowSection() {
  const [active, setActive] = useState(0);
  const ActiveIcon: LucideIcon = STEPS[active].icon;

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
              How it works
            </span>
          </FadeInView>
          <FadeInView delay={0.08}>
            <h2
              className="font-display text-[clamp(1.9rem,3.5vw,2.75rem)] leading-[1.05] mt-5"
              style={{ color: "#F7F1E7" }}
            >
              From curious to running.
              <br />
              <em style={{ color: "#E8D5C8", fontStyle: "italic" }}>
                No friction.
              </em>
            </h2>
          </FadeInView>
          <FadeInView delay={0.14}>
            <p
              className="text-[16px] leading-relaxed mt-4"
              style={{ color: "rgba(247,241,231,0.60)" }}
            >
              Each step is designed to give you more confidence, not ask more of
              you.
            </p>
          </FadeInView>
        </div>

        {/* Stepper */}
        <div className="mt-16 flex flex-col lg:flex-row gap-3 lg:gap-8 lg:items-start">
          {/* Mobile: horizontal scrollable step pills */}
          <div
            className="flex gap-2 overflow-x-auto pb-1 lg:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {STEPS.map((step, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="shrink-0 rounded-pill text-[11px] font-semibold font-secondary px-3.5 h-8 cursor-pointer transition-all duration-200"
                style={{
                  backgroundColor:
                    active === i ? "#A05C45" : "rgba(255,255,255,0.08)",
                  color: active === i ? "#ffffff" : "rgba(247,241,231,0.55)",
                }}
              >
                {step.number} · {step.shortTitle}
              </button>
            ))}
          </div>

          {/* Desktop: vertical step sidebar */}
          <div className="hidden lg:block w-[260px] shrink-0 relative">
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
                    className="relative flex items-start gap-3 w-full text-left px-4 py-3.5 rounded-md cursor-pointer transition-all duration-200"
                    style={{
                      backgroundColor: isActive
                        ? "rgba(255,255,255,0.07)"
                        : "transparent",
                      borderLeft: isActive
                        ? "2px solid #A05C45"
                        : "2px solid transparent",
                    }}
                  >
                    <span
                      className="shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-semibold font-secondary mt-0.5 transition-all duration-200 relative z-10"
                      style={{
                        backgroundColor: isActive
                          ? "#A05C45"
                          : "rgba(255,255,255,0.1)",
                        color: isActive ? "#ffffff" : "rgba(247,241,231,0.5)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="text-[13px] leading-snug font-medium font-secondary transition-all duration-200"
                      style={{
                        color: isActive ? "#F7F1E7" : "rgba(247,241,231,0.4)",
                      }}
                    >
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: content panel */}
          <div
            className="flex-1 min-w-0 rounded-lg overflow-hidden"
            style={{
              backgroundColor: "rgba(255,255,255,0.055)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="p-8 lg:p-10 flex flex-col"
              >
                {/* Step badge + icon */}
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="inline-flex items-center rounded-pill text-[10px] font-semibold uppercase tracking-widest px-3 py-1 font-secondary"
                    style={{ backgroundColor: "#A05C45", color: "#ffffff" }}
                  >
                    Step {STEPS[active].number}
                  </span>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
                  >
                    <ActiveIcon size={16} style={{ color: "#E8D5C8" }} />
                  </div>
                </div>

                {/* Title + body */}
                <h3
                  className="font-display text-[1.4rem] font-medium leading-snug"
                  style={{ color: "#F7F1E7" }}
                >
                  {STEPS[active].title}
                </h3>
                <p
                  className="text-sm leading-relaxed mt-2"
                  style={{ color: "rgba(247,241,231,0.55)" }}
                >
                  {STEPS[active].body}
                </p>

                {/* Preview area */}
                <div
                  className="mt-6 rounded-md min-h-[240px] flex items-center justify-center"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.15)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {STEP_PREVIEWS[active]}
                </div>

                {/* CTA */}
                <div className="mt-6 flex items-center gap-4 flex-wrap">
                  <a
                    href={STEPS[active].href}
                    className="inline-flex items-center gap-1.5 rounded-pill text-[13px] font-medium font-secondary px-5 h-10 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
                    style={{ backgroundColor: "#A05C45", color: "#ffffff" }}
                  >
                    {STEPS[active].cta}
                    <ArrowRight size={14} />
                  </a>
                  <span
                    className="text-[12px]"
                    style={{ color: "rgba(247,241,231,0.35)" }}
                  >
                    {STEPS[active].footnote}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
