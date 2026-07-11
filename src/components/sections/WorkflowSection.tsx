"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  ClipboardList,
  Globe,
  Home,
  LayoutDashboard,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
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

// Compact hub visual — scaled from PainSection outer ring into 1000 × 420
const HUB_W = 1000;
const HUB_H = 420;
const HUB_CENTER = { x: 500, y: 210 };
const HUB_CARD = { l: 400, t: 155, w: 200, h: 110 };

const OUTER_PILL_RX = 38;
const OUTER_PILL_RY = 11;

function pillEdge(
  from: { x: number; y: number },
  to: { x: number; y: number },
  rx = OUTER_PILL_RX,
  ry = OUTER_PILL_RY,
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return from;
  const nx = dx / len;
  const ny = dy / len;
  const scale = 1 / Math.sqrt((nx / rx) ** 2 + (ny / ry) ** 2);
  return { x: from.x + nx * scale, y: from.y + ny * scale };
}

function cardEdge(toward: { x: number; y: number }) {
  return pillEdge(HUB_CENTER, toward, HUB_CARD.w / 2, HUB_CARD.h / 2);
}

// PainSection outer positions scaled: new_y = (old_y - 340) * (420/680) + 210
const TRANSITION_TOOLS = [
  { tool: "Google Forms", logo: "/images/competitors/GoogleForms.png", outer: { x: 500, y: 62 }, delay: 0 },
  { tool: "Venmo", logo: "/images/competitors/Venmo.png", outer: { x: 740, y: 104 }, delay: 0.2 },
  { tool: "PayPal", logo: "/images/competitors/Paypal.svg", outer: { x: 876, y: 156 }, delay: 0.4 },
  { tool: "Gmail", logo: "/images/competitors/Gmail.png", outer: { x: 876, y: 264 }, delay: 0.6 },
  { tool: "DocuSign", logo: "/images/competitors/DocuSign.png", outer: { x: 740, y: 316 }, delay: 0.8 },
  { tool: "Calendly", logo: "/images/competitors/Calendly.webp", outer: { x: 500, y: 358 }, delay: 1.0 },
  { tool: "Google Drive", logo: "/images/competitors/GoogleDrive.png", outer: { x: 260, y: 316 }, delay: 0.8 },
  { tool: "Google Docs", logo: "/images/competitors/GoogleDocs.png", outer: { x: 124, y: 264 }, delay: 0.6 },
  { tool: "Google Sheets", logo: "/images/competitors/GoogleSheets.png", outer: { x: 124, y: 156 }, delay: 0.4 },
  { tool: "Wix", logo: "/images/competitors/Wix.png", outer: { x: 260, y: 104 }, delay: 0.2 },
];

function Step1TransitionMobileVisual() {
  return (
    <div className="lg:hidden w-full max-w-[400px] mx-auto px-4 py-4 select-none">
      <p
        className="text-center text-[11px] font-medium uppercase tracking-widest mb-4 font-secondary"
        style={{ color: "rgba(247,241,231,0.45)" }}
      >
        Scattered today
      </p>

      <div className="flex flex-col gap-2">
        {TRANSITION_TOOLS.map((t, i) => (
          <motion.div
            key={t.tool}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span className="flex items-center gap-2 flex-1 min-w-0">
              <Image
                src={t.logo}
                alt={t.tool}
                width={18}
                height={18}
                className="shrink-0 object-contain"
              />
              <span
                className="text-[13px] font-secondary truncate"
                style={{ color: "rgba(247,241,231,0.85)" }}
              >
                {t.tool}
              </span>
            </span>
            <ArrowRight
              size={14}
              className="shrink-0"
              style={{ color: "rgba(160,92,69,0.6)" }}
              aria-hidden="true"
            />
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center">
        <div className="w-full flex items-center gap-3 mb-5" aria-hidden="true">
          <div
            className="flex-1 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(247,241,231,0.15))",
            }}
          />
          <ArrowRight
            size={14}
            className="rotate-90"
            style={{ color: "rgba(160,92,69,0.45)" }}
          />
          <div
            className="flex-1 h-px"
            style={{
              background:
                "linear-gradient(to left, transparent, rgba(247,241,231,0.15))",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col items-center gap-2 rounded-2xl px-8 py-5 w-full"
          style={{
            backgroundColor: "rgba(160,92,69,0.18)",
            border: "1px solid rgba(160,92,69,0.38)",
          }}
        >
          <Image
            src="/images/Logo.png"
            alt="MudKitchen"
            width={52}
            height={52}
            className="object-contain"
          />
          <span
            className="font-display text-[15px] tracking-tight"
            style={{ color: "#F7F1E7" }}
          >
            MudKitchen
          </span>
          <p
            className="text-[13px] font-secondary text-center leading-snug"
            style={{ color: "rgba(232,213,200,0.8)" }}
          >
            One workspace
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Step1TransitionVisual() {
  return (
    <div className="flex items-center justify-center w-full px-4 py-4 lg:px-6 lg:py-5 select-none">
      <Step1TransitionMobileVisual />

      <div className="hidden lg:block w-full max-w-[720px]">
        <div
          className="relative w-full"
          style={{ paddingBottom: `${(HUB_H / HUB_W) * 100}%` }}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox={`0 0 ${HUB_W} ${HUB_H}`}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            {TRANSITION_TOOLS.map((t) => {
              const start = pillEdge(t.outer, HUB_CENTER);
              const end = cardEdge(t.outer);
              return (
                <g key={t.tool}>
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="rgba(247,241,231,0.15)"
                    strokeWidth={1}
                  />
                  <motion.line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="#A05C45"
                    strokeOpacity={0.5}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeDasharray="4 20"
                    animate={{ strokeDashoffset: [0, -24] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      ease: "linear",
                      delay: t.delay,
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {TRANSITION_TOOLS.map((t) => (
            <div
              key={t.tool}
              className="absolute z-10"
              style={{
                left: `${(t.outer.x / HUB_W) * 100}%`,
                top: `${(t.outer.y / HUB_H) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <motion.span
                className="flex items-center gap-1 rounded-pill text-[8px] md:text-[10px] font-secondary px-2 md:px-2.5 py-0.5 md:py-1 whitespace-nowrap"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(247,241,231,0.75)",
                }}
                animate={{ opacity: [0.75, 1, 0.75] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: t.delay,
                }}
              >
                <Image
                  src={t.logo}
                  alt={t.tool}
                  width={12}
                  height={12}
                  className="shrink-0 object-contain"
                />
                {t.tool}
              </motion.span>
            </div>
          ))}

          <div
            className="absolute z-20 flex items-center justify-center rounded-lg"
            style={{
              left: `${(HUB_CARD.l / HUB_W) * 100}%`,
              top: `${(HUB_CARD.t / HUB_H) * 100}%`,
              width: `${(HUB_CARD.w / HUB_W) * 100}%`,
              height: `${(HUB_CARD.h / HUB_H) * 100}%`,
              backgroundColor: "rgba(160,92,69,0.18)",
              border: "1px solid rgba(160,92,69,0.38)",
            }}
          >
            <div className="flex flex-col items-center gap-0.5">
              <Image
                src="/images/Logo.png"
                alt="MudKitchen"
                width={36}
                height={36}
                className="object-contain"
              />
              <span
                className="text-[8px] md:text-[10px] font-secondary font-semibold whitespace-nowrap"
                style={{ color: "#E8D5C8" }}
              >
                One workspace
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type SetupStatus = "In progress" | "Complete";

type SetupMilestone = {
  label: string;
  description: string;
  details?: string[];
  icon: LucideIcon;
};

const SETUP_MILESTONES: SetupMilestone[] = [
  {
    label: "Branded school website",
    description:
      "Programs, philosophy, team pages, and enrollment — all on your school&apos;s site.",
    icon: Globe,
  },
  {
    label: "Enrollment forms",
    description:
      "Application forms and document checklists linked straight to the parent portal.",
    icon: ClipboardCheck,
  },
  {
    label: "Parent dashboard",
    description:
      "Families enroll, pay tuition, message staff, and stay updated in one place.",
    details: ["Enrollment & e-signatures", "Billing & payments", "Messages & calendar"],
    icon: Home,
  },
  {
    label: "Admin dashboard",
    description:
      "Admissions, student records, programs, staff, tuition, and finances — set up for your school.",
    details: ["Admissions & flows", "My School setup", "Finances & marketing"],
    icon: LayoutDashboard,
  },
  {
    label: "Teacher dashboard",
    description:
      "Teachers manage students, attendance, hours, messaging, and payroll in a focused workspace.",
    details: ["Students & attendance", "Hours & payroll", "Messages & feed"],
    icon: ClipboardList,
  },
  {
    label: "Team onboarding",
    description:
      "We train your admins and teachers so everyone is confident before families log in.",
    icon: UserPlus,
  },
];

const STATUS_STYLE: Record<SetupStatus, { bg: string; color: string }> = {
  "In progress": { bg: "rgba(245,208,128,0.15)", color: "#F5D080" },
  Complete: { bg: "rgba(74,170,100,0.2)", color: "#7AE2A0" },
};

const ICON_TILE_STYLE: Record<SetupStatus, { bg: string; border: string; color: string }> = {
  "In progress": { bg: "rgba(245,208,128,0.12)", border: "rgba(245,208,128,0.35)", color: "#F5D080" },
  Complete: { bg: "rgba(74,170,100,0.15)", border: "rgba(74,170,100,0.35)", color: "#7AE2A0" },
};

const ROW_H = 126;
const ROW_GAP = 10;
const ROW_STEP = ROW_H + ROW_GAP;
const SETUP_IN_PROGRESS_MS = 1200;
const SETUP_COMPLETE_MS = 700;
const SETUP_TRANSITION_S = 0.4;

function milestoneStatus(
  itemIndex: number,
  activeIndex: number,
  phase: "in_progress" | "complete",
): SetupStatus {
  if (itemIndex < activeIndex) return "Complete";
  if (itemIndex === activeIndex) return phase === "complete" ? "Complete" : "In progress";
  return "In progress";
}

function SetupMilestoneCard({
  milestone,
  status,
  isActive,
}: {
  milestone: SetupMilestone;
  status: SetupStatus;
  isActive: boolean;
}) {
  const Icon = milestone.icon;
  const tile = ICON_TILE_STYLE[status];

  return (
    <motion.div
      animate={{
        opacity: isActive ? 1 : 0.38,
        scale: isActive ? 1 : 0.98,
      }}
      transition={{ duration: SETUP_TRANSITION_S, ease: [0.16, 1, 0.3, 1] }}
      className="w-full shrink-0 rounded-lg px-4 py-3.5 flex items-center gap-3.5"
      style={{
        height: ROW_H,
        backgroundColor: isActive ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
        border: isActive
          ? "1px solid rgba(160,92,69,0.45)"
          : "1px solid rgba(255,255,255,0.06)",
        boxShadow: isActive ? "0 6px 20px rgba(0,0,0,0.15)" : "none",
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{
          backgroundColor: tile.bg,
          border: `1px solid ${tile.border}`,
        }}
      >
        <Icon size={18} style={{ color: tile.color }} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-[13px] font-secondary font-semibold leading-snug"
            style={{ color: "rgba(247,241,231,0.85)" }}
          >
            {milestone.label}
          </p>
          <motion.span
            key={status}
            initial={{ scale: 0.92, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="text-[10px] font-secondary font-medium px-2.5 py-0.5 rounded-full shrink-0"
            style={{
              backgroundColor: STATUS_STYLE[status].bg,
              color: STATUS_STYLE[status].color,
            }}
          >
            {status}
          </motion.span>
        </div>
        <p
          className="text-[11px] font-secondary leading-snug line-clamp-1"
          style={{ color: "rgba(247,241,231,0.5)" }}
        >
          {milestone.description}
        </p>
        {milestone.details && (
          <div className="flex flex-wrap gap-1.5">
            {milestone.details.map((detail) => (
              <span
                key={detail}
                className="text-[9px] font-secondary px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  color: "rgba(247,241,231,0.4)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {detail}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Step2SetupProgress() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const cycleLength = SETUP_MILESTONES.length;
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"in_progress" | "complete">("in_progress");
  const [instantScroll, setInstantScroll] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const updateHeight = () => setViewportHeight(el.offsetHeight);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (phase === "in_progress") {
      const id = setTimeout(() => setPhase("complete"), SETUP_IN_PROGRESS_MS);
      return () => clearTimeout(id);
    }

    const id = setTimeout(() => {
      const next = index + 1;
      setPhase("in_progress");
      if (next >= cycleLength) {
        setInstantScroll(true);
        setIndex(0);
        requestAnimationFrame(() => setInstantScroll(false));
      } else {
        setIndex(next);
      }
    }, SETUP_COMPLETE_MS);

    return () => clearTimeout(id);
  }, [index, phase, cycleLength]);

  const focusOffset = index * ROW_STEP;
  const trackY =
    viewportHeight > 0 ? viewportHeight / 2 - ROW_H / 2 - focusOffset : 0;
  const viewportVisibleH = ROW_H * 3 + ROW_GAP * 2;

  return (
    <div
      ref={viewportRef}
      className="relative w-full overflow-hidden px-6 pb-8 lg:px-8 lg:pb-10"
      style={{ height: viewportVisibleH }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12"
        style={{
          background:
            "linear-gradient(to bottom, rgba(46,74,60,0.85) 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12"
        style={{
          background:
            "linear-gradient(to top, rgba(46,74,60,0.85) 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <motion.div
        animate={{ y: trackY }}
        transition={
          instantScroll
            ? { duration: 0 }
            : { duration: SETUP_TRANSITION_S, ease: [0.16, 1, 0.3, 1] }
        }
        className="flex flex-col w-full"
        style={{ gap: ROW_GAP }}
      >
        {SETUP_MILESTONES.map((milestone, i) => (
          <SetupMilestoneCard
            key={milestone.label}
            milestone={milestone}
            status={milestoneStatus(i, index, phase)}
            isActive={i === index}
          />
        ))}
      </motion.div>
    </div>
  );
}

const PROGRESS_STEPS = ["Kickoff", "Setup", "Review", "Go Live"];
const LAUNCH_ITEMS = ["Team walkthrough complete", "Families notified", "School is live"];

const STEP_PREVIEWS = [
  /* 01 — Tools converge into one workspace */
  <Step1TransitionVisual key="show" />,

  /* 02 — Setup progress */
  <Step2SetupProgress key="build" />,

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
                className={`flex items-center justify-center ${active === 0 || active === 1 ? "min-h-[360px] lg:min-h-[400px]" : "min-h-[260px]"}`}
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
