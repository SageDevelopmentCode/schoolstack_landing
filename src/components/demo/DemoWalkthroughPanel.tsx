"use client";

import { CalendarDays, ClipboardCheck, ClipboardList, CreditCard, GitBranch, Globe, LayoutDashboard, Link2, MessageCircle } from "lucide-react";
import Image from "next/image";
import type { ComponentType, CSSProperties } from "react";
import type {
  DemoWalkthroughIcon,
  DemoWalkthroughStep,
} from "@/data/school-demos/walkthrough-placeholder";

const STEP_ICONS: Record<DemoWalkthroughIcon, ComponentType<{ className?: string }>> = {
  globe: Globe,
  calendarDays: CalendarDays,
  layoutDashboard: LayoutDashboard,
  gitBranch: GitBranch,
  link: Link2,
  clipboardCheck: ClipboardCheck,
  creditCard: CreditCard,
  clipboardList: ClipboardList,
  messageCircle: MessageCircle,
};

interface Props {
  schoolName: string;
  schoolLogo: { src: string; alt: string; width?: number; height?: number };
  steps: DemoWalkthroughStep[];
  activeStep?: number;
  onStepSelect: (index: number) => void;
}

function getStepStyleVars(theme: DemoWalkthroughStep["theme"]): CSSProperties {
  return {
    "--step-bg": theme.bg,
    "--step-bg-hover": theme.bgHover,
    "--step-bg-active": theme.bgActive,
    "--step-border": theme.border,
    "--step-icon-bg": theme.iconBg,
    "--step-icon-color": theme.iconColor,
    "--step-title-color": theme.titleColor,
    "--step-desc-color": theme.descColor,
    "--step-connector": theme.connector,
  } as CSSProperties;
}

export default function DemoWalkthroughPanel({
  schoolName,
  schoolLogo,
  steps,
  activeStep = 0,
  onStepSelect,
}: Props) {
  return (
    <aside className="hidden lg:flex flex-col h-screen w-[20%] min-w-[280px] shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
      <div className="flex flex-col flex-1 px-6 py-8">
        <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Image
              src="/images/Logo.png"
              alt="MudKitchen"
              width={28}
              height={28}
              className="h-7 w-auto shrink-0 object-contain"
            />
            <span className="truncate font-display text-sm font-semibold text-clay">
              MudKitchen
            </span>
          </div>
          <div className="h-6 w-px shrink-0 bg-gray-200" aria-hidden />
          <div className="flex min-w-0 flex-1 items-center justify-end">
            <Image
              src={schoolLogo.src}
              alt={schoolLogo.alt}
              width={schoolLogo.width ?? 100}
              height={schoolLogo.height ?? 28}
              className="h-7 w-auto max-w-[120px] object-contain object-right"
            />
          </div>
        </div>

        <div className="mb-6">
          <h1 className="font-display text-xl font-medium leading-snug text-gray-900">
            {schoolName}
          </h1>
          <p className="mt-3 text-[11px] font-secondary font-semibold uppercase tracking-wider text-gray-400">
            Step {activeStep + 1} of {steps.length}
          </p>
        </div>

        <nav className="flex-1" aria-label="Walkthrough steps">
          <ol className="space-y-0">
            {steps.map((step, i) => {
              const isActive = i === activeStep;
              const isPast = i < activeStep;
              const { theme } = step;
              const Icon = STEP_ICONS[step.icon];
              const stepNum = i + 1;

              return (
                <li key={step.id} className="flex gap-2">
                  <div className="flex w-7 shrink-0 flex-col items-center pt-1">
                    <div
                      className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2 ring-white transition-transform duration-200 ${
                        isActive ? "scale-105" : ""
                      }`}
                      style={{
                        backgroundColor: theme.iconBg,
                        color: theme.iconColor,
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                    </div>
                    <span
                      className="mt-0.5 text-[9px] font-bold font-secondary leading-none"
                      style={{ color: theme.iconBg }}
                      aria-hidden
                    >
                      {stepNum}
                    </span>
                    {i < steps.length - 1 && (
                      <div
                        className="mt-2 w-0.5 flex-1 min-h-4"
                        style={{
                          backgroundColor: isPast ? theme.connector : "#E5E7EB",
                        }}
                        aria-hidden
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onStepSelect(i)}
                    aria-current={isActive ? "step" : undefined}
                    data-active={isActive}
                    style={getStepStyleVars(theme)}
                    className="group mb-4 flex-1 rounded-md border px-3.5 py-3 text-left transition-all duration-200 cursor-pointer
                      bg-[var(--step-bg)] border-[color-mix(in_srgb,var(--step-border)_55%,transparent)]
                      hover:-translate-y-0.5 hover:border-[var(--step-border)] hover:bg-[var(--step-bg-hover)] hover:shadow-md
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--step-border)] focus-visible:ring-offset-2
                      data-[active=true]:border-[var(--step-border)] data-[active=true]:bg-[var(--step-bg-active)] data-[active=true]:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className="text-[10px] font-semibold uppercase tracking-wider"
                          style={{ color: theme.descColor }}
                        >
                          Step {stepNum}
                        </p>
                        <p
                          className="mt-0.5 text-sm font-semibold font-secondary leading-snug"
                          style={{ color: theme.titleColor }}
                        >
                          {step.title}
                        </p>
                      </div>
                      {isActive ? (
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold font-secondary uppercase tracking-wide"
                          style={{
                            backgroundColor: theme.iconBg,
                            color: theme.iconColor,
                          }}
                        >
                          Viewing
                        </span>
                      ) : (
                        <span className="shrink-0 text-[10px] font-secondary text-gray-400 group-hover:text-gray-500">
                          Click to view
                        </span>
                      )}
                    </div>
                    <p
                      className="mt-1.5 text-xs font-secondary leading-relaxed"
                      style={{ color: theme.descColor }}
                    >
                      {step.description}
                    </p>
                    {isActive && step.talkingPoint && (
                      <p
                        className="mt-2 text-xs font-secondary leading-relaxed italic"
                        style={{ color: theme.descColor }}
                      >
                        &ldquo;{step.talkingPoint}&rdquo;
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </aside>
  );
}
