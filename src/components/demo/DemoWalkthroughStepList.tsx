"use client";

import {
  BadgePercent,
  CalendarDays,
  Check,
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
import type {
  DemoWalkthroughIcon,
  DemoWalkthroughStep,
} from "@/data/school-demos/walkthrough-placeholder";

const STEP_ICONS: Record<
  DemoWalkthroughIcon,
  ComponentType<{ className?: string }>
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

const INK = "#1d1a16";

interface Props {
  steps: DemoWalkthroughStep[];
  activeStep: number;
  accentColor: string;
  onStepSelect: (index: number) => void;
  /** Tighter spacing when rendered inside the mobile sheet */
  compact?: boolean;
}

export default function DemoWalkthroughStepList({
  steps,
  activeStep,
  accentColor,
  onStepSelect,
  compact = false,
}: Props) {
  return (
    <nav aria-label="Walkthrough steps">
      <ol className={compact ? "space-y-1.5" : "space-y-2"}>
        {steps.map((step, i) => {
          const isActive = i === activeStep;
          const isPast = i < activeStep;
          const Icon = STEP_ICONS[step.icon];
          const stepNum = i + 1;

          return (
            <li key={step.id} className="flex gap-2.5">
              <div
                className={`flex w-8 shrink-0 flex-col items-center ${compact ? "pt-2" : "pt-3"}`}
              >
                <div
                  className="relative z-10 grid h-[31px] w-[31px] shrink-0 place-items-center rounded-full transition-transform duration-200"
                  style={{
                    backgroundColor: isPast
                      ? accentColor
                      : isActive
                        ? `color-mix(in srgb, ${accentColor} 14%, white)`
                        : "#F4F1EC",
                    color: isPast ? "#FFFFFF" : isActive ? accentColor : `${INK}99`,
                    transform: isActive ? "scale(1.05)" : undefined,
                    boxShadow: isActive
                      ? "0 8px 24px rgba(0,0,0,0.08)"
                      : undefined,
                  }}
                >
                  {isPast ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : (
                    <Icon className="h-4 w-4" aria-hidden />
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="mt-2 w-0.5 min-h-3 flex-1"
                    style={{
                      backgroundColor: isPast
                        ? accentColor
                        : "rgba(0,0,0,0.08)",
                    }}
                    aria-hidden
                  />
                )}
              </div>

              <button
                type="button"
                onClick={() => onStepSelect(i)}
                aria-current={isActive ? "step" : undefined}
                className={`group mb-1 flex-1 cursor-pointer text-left transition-all duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1d1a16]/30 ${
                  isActive
                    ? "rounded-[24px] bg-white p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.06]"
                    : "rounded-[24px] p-3.5 ring-1 ring-black/10 hover:bg-white/60"
                }`}
              >
                <p
                  className="font-secondary text-[10px] font-bold uppercase tracking-[0.13em]"
                  style={{ color: isActive ? accentColor : `${INK}99` }}
                >
                  Step {stepNum}
                </p>
                <p className="font-secondary mt-0.5 text-sm font-semibold leading-snug text-[#1d1a16]">
                  {step.title}
                </p>
                {isActive && (
                  <>
                    <p className="font-secondary mt-2 text-xs leading-relaxed text-[#1d1a16]/65">
                      {step.description}
                    </p>
                    {step.talkingPoint ? (
                      <p className="font-secondary mt-2 text-xs leading-relaxed italic text-[#1d1a16]/55">
                        &ldquo;{step.talkingPoint}&rdquo;
                      </p>
                    ) : null}
                  </>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
