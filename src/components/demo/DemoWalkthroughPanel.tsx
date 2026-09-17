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
  MousePointerClick,
  Smartphone,
  Users,
} from "lucide-react";
import Image from "next/image";
import type { ComponentType } from "react";
import SchoolDemoWordmark, {
  type SchoolDemoLogo,
} from "@/components/demo/SchoolDemoWordmark";
import { outlineActiveRowStyle } from "@/components/school-admin/admissions/outline-item-styles";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import { ADMIN_RADIUS_CARD } from "@/components/school-admin/ui/story/AdminCard";
import type {
  DemoWalkthroughIcon,
  DemoWalkthroughStep,
} from "@/data/school-demos/walkthrough-placeholder";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

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
  badgePercent: BadgePercent,
  users: Users,
  heart: Heart,
  smartphone: Smartphone,
};

interface Props {
  schoolName: string;
  schoolLogo: SchoolDemoLogo;
  steps: DemoWalkthroughStep[];
  activeStep?: number;
  storyTheme: ParentThemeTokens;
  onStepSelect: (index: number) => void;
}

function DemoWalkthroughHeader({
  schoolName,
  schoolLogo,
  theme,
}: {
  schoolName: string;
  schoolLogo: SchoolDemoLogo;
  theme: ParentThemeTokens;
}) {
  return (
    <header className="mb-5">
      <AdminSectionKicker theme={theme}>Concept walkthrough</AdminSectionKicker>
      <h1
        className="mt-1.5 font-heading text-[clamp(1.25rem,2.5vw,1.5rem)] font-semibold leading-tight tracking-[-0.03em]"
        style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
      >
        {schoolName}
      </h1>
      <div
        className="mt-4 flex items-center gap-3 rounded-2xl border px-3 py-2.5"
        style={{
          backgroundColor: theme.cream,
          borderColor: theme.line,
        }}
      >
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5">
          <Image
            src="/images/Logo.png"
            alt="MudKitchen"
            width={24}
            height={24}
            className="h-6 w-auto shrink-0 object-contain"
          />
          <span
            className="text-center text-[10px] font-bold leading-tight"
            style={{ color: theme.coral }}
          >
            MudKitchen
          </span>
        </div>
        <div
          className="w-px shrink-0 self-stretch"
          style={{ backgroundColor: theme.line }}
          aria-hidden
        />
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <SchoolDemoWordmark
            logo={schoolLogo}
            className="h-8 w-auto max-w-[140px] object-contain text-center"
          />
        </div>
      </div>
    </header>
  );
}

function DemoWalkthroughHint({ theme }: { theme: ParentThemeTokens }) {
  return (
    <div
      className="mb-5 flex items-start gap-2.5 border p-3"
      style={{
        backgroundColor: theme.primarySoft,
        borderColor: theme.sage,
        borderRadius: ADMIN_RADIUS_CARD,
        boxShadow: theme.shadowCard,
      }}
    >
      <span
        className="grid h-[31px] w-[31px] shrink-0 place-items-center rounded-[10px]"
        style={{ backgroundColor: theme.cream }}
      >
        <MousePointerClick
          className="h-4 w-4"
          style={{ color: theme.primary }}
          aria-hidden
        />
      </span>
      <p
        className="text-xs leading-relaxed"
        style={{ color: theme.muted, fontFamily: theme.fontBody }}
      >
        Click each step below to walk through the flow.
      </p>
    </div>
  );
}

export default function DemoWalkthroughPanel({
  schoolName,
  schoolLogo,
  steps,
  activeStep = 0,
  storyTheme: theme,
  onStepSelect,
}: Props) {
  return (
    <aside
      className="hidden h-screen w-[20%] min-w-[280px] shrink-0 flex-col overflow-y-auto border-r lg:flex"
      style={{
        backgroundColor: theme.paper,
        borderColor: theme.line,
      }}
    >
      <div className="flex flex-1 flex-col px-5 py-7">
        <DemoWalkthroughHeader
          schoolName={schoolName}
          schoolLogo={schoolLogo}
          theme={theme}
        />

        <DemoWalkthroughHint theme={theme} />

        <nav className="flex-1" aria-label="Walkthrough steps">
          <ol className="space-y-2">
            {steps.map((step, i) => {
              const isActive = i === activeStep;
              const isPast = i < activeStep;
              const activeRowStyle = outlineActiveRowStyle(isActive, theme);
              const Icon = STEP_ICONS[step.icon];
              const stepNum = i + 1;

              return (
                <li key={step.id} className="flex gap-2.5">
                  <div className="flex w-8 shrink-0 flex-col items-center pt-3">
                    <div
                      className="relative z-10 grid h-[31px] w-[31px] shrink-0 place-items-center rounded-[10px] transition-transform duration-200"
                      style={{
                        backgroundColor: isPast
                          ? theme.primary
                          : isActive
                            ? theme.primarySoft
                            : theme.cream,
                        color: isPast ? theme.white : theme.primary,
                        boxShadow: isActive ? theme.shadowPill : undefined,
                        transform: isActive ? "scale(1.05)" : undefined,
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
                        className="mt-2 w-0.5 flex-1 min-h-3"
                        style={{
                          backgroundColor: isPast ? theme.primary : "#E9EFEA",
                        }}
                        aria-hidden
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onStepSelect(i)}
                    aria-current={isActive ? "step" : undefined}
                    className="group mb-1 flex-1 cursor-pointer border px-3.5 py-3 text-left transition-all duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{
                      borderRadius: ADMIN_RADIUS_CARD,
                      boxShadow: isActive ? theme.shadowCard : theme.shadowPill,
                      border: `1px solid ${
                        isActive
                          ? (activeRowStyle.borderColor ?? theme.sage)
                          : "#E0E7E0"
                      }`,
                      backgroundColor: isActive
                        ? activeRowStyle.backgroundColor
                        : theme.white,
                    }}
                  >
                    <p
                      className="text-[10px] font-extrabold uppercase tracking-[0.13em]"
                      style={{ color: "#729077" }}
                    >
                      Step {stepNum}
                    </p>
                    <p
                      className="mt-0.5 text-sm font-semibold leading-snug"
                      style={{
                        fontFamily: theme.fontBody,
                        color: theme.ink,
                      }}
                    >
                      {step.title}
                    </p>
                    {isActive && (
                      <p
                        className="mt-2 text-xs leading-relaxed"
                        style={{
                          fontFamily: theme.fontBody,
                          color: theme.muted,
                        }}
                      >
                        {step.description}
                      </p>
                    )}
                    {isActive && step.talkingPoint && (
                      <p
                        className="mt-2 text-xs leading-relaxed italic"
                        style={{
                          fontFamily: theme.fontBody,
                          color: theme.muted,
                        }}
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
