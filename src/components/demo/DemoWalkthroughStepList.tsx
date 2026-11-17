"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BadgePercent,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  GitBranch,
  Globe,
  Heart,
  LayoutDashboard,
  Link2,
  MessageCircle,
  Smartphone,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";
import { Tape, Tick } from "@/components/garden/ui";
import { TAPES } from "@/components/home-garden/assets";
import type {
  DemoWalkthroughIcon,
  DemoWalkthroughStep,
} from "@/data/school-demos/walkthrough-placeholder";

const STEP_ICONS: Record<
  DemoWalkthroughIcon,
  ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  globe: Globe,
  calendarDays: CalendarDays,
  layoutDashboard: LayoutDashboard,
  gitBranch: GitBranch,
  link: Link2,
  clipboardCheck: ClipboardCheck,
  creditCard: CreditCard,
  clipboardList: ClipboardList,
  messageCircle: MessageCircle,
  badgePercent: BadgePercent,
  users: Users,
  heart: Heart,
  smartphone: Smartphone,
};

type StepState = "done" | "active" | "upcoming";

const DOT: Record<StepState, string> = {
  done: "bg-[var(--sf-forest)] text-white",
  active:
    "scale-[1.08] border-2 border-[var(--sf-ink)] bg-[var(--sf-butter)] text-[var(--sf-ink)] shadow-[0_3px_0_0_var(--sf-ink)]",
  upcoming:
    "bg-[var(--sf-paper)] text-[var(--sf-ink)]/50 ring-2 ring-inset ring-[var(--sf-ink)]/15",
};

const CARD: Record<StepState, string> = {
  done: "border-[var(--sf-ink)]/10 bg-white hover:-translate-y-0.5 hover:border-[var(--sf-ink)] hover:shadow-[0_4px_0_0_var(--sf-ink)] focus-visible:border-[var(--sf-ink)]",
  active:
    "border-[var(--sf-ink)] bg-white shadow-[0_6px_0_0_var(--sf-ink)] hover:!rotate-0 focus-visible:!rotate-0",
  upcoming:
    "border-[var(--sf-ink)]/10 bg-white/70 hover:-translate-y-0.5 hover:border-[var(--sf-ink)] hover:bg-white hover:shadow-[0_4px_0_0_var(--sf-ink)] focus-visible:border-[var(--sf-ink)]",
};

const EYEBROW: Record<StepState, string> = {
  done: "text-[var(--sf-forest)]",
  active: "text-[var(--sf-forest)]",
  upcoming: "text-[var(--sf-soft)]",
};

const EASE = [0.22, 1, 0.36, 1] as const;

interface Props {
  steps: DemoWalkthroughStep[];
  activeStep: number;
  onStepSelect: (index: number) => void;
  /** Tighter spacing when rendered inside the mobile sheet */
  compact?: boolean;
}

export default function DemoWalkthroughStepList({
  steps,
  activeStep,
  onStepSelect,
  compact = false,
}: Props) {
  const reduce = useReducedMotion();

  return (
    <nav aria-label="Walkthrough steps">
      <ol className={compact ? "space-y-1" : "space-y-1.5"}>
        {steps.map((step, i) => {
          const state: StepState =
            i < activeStep ? "done" : i === activeStep ? "active" : "upcoming";
          const isActive = state === "active";
          const Icon = STEP_ICONS[step.icon];
          const isLast = i === steps.length - 1;

          return (
            <li key={step.id} className="flex gap-3">
              <div
                className={`flex w-8 shrink-0 flex-col items-center ${compact ? "pt-2.5" : "pt-3.5"}`}
                aria-hidden="true"
              >
                <span
                  className={`relative z-10 grid h-[31px] w-[31px] shrink-0 place-items-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${DOT[state]}`}
                >
                  {state === "done" ? (
                    <Tick
                      className="h-[22px] w-[22px]"
                      color="#fff"
                      fill="transparent"
                    />
                  ) : (
                    <Icon className="h-4 w-4" strokeWidth={2.4} />
                  )}
                </span>
                {!isLast &&
                  (state === "done" ? (
                    <span className="mt-1.5 w-0.5 min-h-3 flex-1 rounded-full bg-[var(--sf-forest)]" />
                  ) : (
                    <span className="mt-1.5 min-h-3 flex-1 border-l-2 border-dashed border-[var(--sf-ink)]/20" />
                  ))}
              </div>

              <button
                type="button"
                onClick={() => onStepSelect(i)}
                aria-current={isActive ? "step" : undefined}
                style={isActive ? { rotate: "-0.6deg" } : undefined}
                className={`relative mb-2 flex-1 cursor-pointer rounded-[22px] border-2 p-3.5 text-left transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 ${CARD[state]}`}
              >
                {isActive ? (
                  <Tape
                    color={TAPES[i % TAPES.length]}
                    className="-top-2.5 right-6 h-5 w-14 rotate-3"
                  />
                ) : null}
                <span
                  className={`block text-[10px] font-extrabold uppercase tracking-[0.18em] ${EYEBROW[state]}`}
                >
                  Step {i + 1}
                </span>
                <span className="mt-0.5 block text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">
                  {step.title}
                </span>
                <AnimatePresence initial={false}>
                  {isActive ? (
                    <motion.span
                      key="detail"
                      className="block overflow-hidden"
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      <span className="mt-2 block text-[13px] leading-relaxed text-[var(--sf-ink)]/75">
                        {step.description}
                      </span>
                      {step.talkingPoint ? (
                        <span className="mt-3 flex gap-2 rounded-xl bg-[var(--sf-peach)]/55 px-3 py-2.5 text-[12.5px] italic leading-relaxed text-[var(--sf-ink)]/80">
                          <span
                            className="sf-display -mt-1 text-2xl not-italic leading-none text-[var(--sf-clay-deep)]"
                            aria-hidden="true"
                          >
                            &ldquo;
                          </span>
                          <span>{step.talkingPoint}</span>
                        </span>
                      ) : null}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
