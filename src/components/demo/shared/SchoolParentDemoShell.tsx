"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  FileText,
  Heart,
  Home,
  MessageCircle,
  Phone,
  Rss,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { SchoolParentDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import DemoParentBillingPage from "@/components/demo/shared/DemoParentBillingPage";
import DemoParentCalendarPage from "@/components/demo/shared/DemoParentCalendarPage";
import DemoParentChildrenPage from "@/components/demo/shared/DemoParentChildrenPage";
import DemoParentEnrollmentTab from "@/components/demo/shared/DemoParentEnrollmentTab";
import DemoParentHomePage from "@/components/demo/shared/DemoParentHomePage";
import {
  PARENT_DEMO_STORY_THEME,
  applyParentDemoRuntime,
} from "@/components/demo/shared/parent-demo-runtime";
import { demoStoryShellStyle } from "@/components/demo/shared/demo-story-theme";
import SchoolParentComingSoon from "@/components/school-parent/SchoolParentComingSoon";
import {
  buildDemoParentBranding,
  DEMO_PARENT_FEATURES,
  DEMO_PARENT_USER_PROFILE,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
  resolveDemoParentSchoolName,
} from "@/data/school-demos/demo-portal-shared";
import { fraunces, dmSans } from "@/lib/fonts";

export type ParentDemoNavTab =
  | "home"
  | "enrollment"
  | "children"
  | "billing"
  | "messages"
  | "calendar"
  | "feed"
  | "forms"
  | "volunteer"
  | "emergency-contacts";

const DEMO_PARENT = {
  name: "Sarah Mitchell",
  initials: "SM",
};

const PRIMARY_NAV: { label: string; icon: LucideIcon; tab: ParentDemoNavTab }[] = [
  { label: "Home", icon: Home, tab: "home" },
  { label: "Enrollment", icon: ClipboardCheck, tab: "enrollment" },
  { label: "My Children", icon: Users, tab: "children" },
  { label: "Tuition & Billing", icon: CreditCard, tab: "billing" },
  { label: "Calendar", icon: Calendar, tab: "calendar" },
];

const MORE_NAV: { label: string; icon: LucideIcon; tab: ParentDemoNavTab }[] = [
  { label: "Messages", icon: MessageCircle, tab: "messages" },
  { label: "Feed", icon: Rss, tab: "feed" },
  { label: "Forms & Documents", icon: FileText, tab: "forms" },
  { label: "Volunteer Opportunities", icon: Heart, tab: "volunteer" },
  { label: "Emergency Contacts", icon: Phone, tab: "emergency-contacts" },
];

const COMING_SOON_LABELS: Partial<Record<ParentDemoNavTab, string>> = {
  messages: "Messages",
  feed: "Feed",
  forms: "Forms & Documents",
  volunteer: "Volunteer Opportunities",
  "emergency-contacts": "Emergency Contacts",
};

const TOUR_MOVE_MS = 950;
const TOUR_RESUME_MS = 1500;

const PARENT_DEMO_TOUR_TABS: ParentDemoNavTab[] = [
  "home",
  "enrollment",
  "children",
  "calendar",
  "billing",
];

function ParentDemoNav({
  activeTab,
  onTabChange,
}: {
  activeTab: ParentDemoNavTab;
  onTabChange: (tab: ParentDemoNavTab) => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const moreRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [moreOpen]);

  function openMore() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 6, left: rect.left + rect.width / 2 });
    }
    setMoreOpen((value) => !value);
  }

  return (
    <nav data-tour-nav="primary" className="flex flex-wrap items-center gap-1">
      {PRIMARY_NAV.map(({ label, icon: Icon, tab }) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            data-tour-id={`nav-${tab}`}
            onClick={() => onTabChange(tab)}
            className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-xs transition-colors sm:px-3 sm:text-sm"
            style={
              isActive
                ? {
                    color: PARENT_DEMO_STORY_THEME.primaryDark,
                    backgroundColor: PARENT_DEMO_STORY_THEME.primaryLight,
                    fontWeight: 600,
                  }
                : { color: PARENT_DEMO_STORY_THEME.muted }
            }
          >
            <Icon className="pointer-events-none h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {label}
          </button>
        );
      })}

      <div ref={moreRef}>
        <button
          ref={btnRef}
          type="button"
          data-tour-id="nav-more"
          onClick={openMore}
          className="flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-body text-gray-600 transition-colors hover:bg-gray-50 sm:px-3 sm:text-sm"
        >
          More
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`}
            strokeWidth={2.5}
          />
        </button>

        {moreOpen ? (
          <div
            className="fixed z-[9999] w-52 -translate-x-1/2 overflow-hidden rounded-lg border border-gray-100 bg-white py-1.5 shadow-lg"
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
          >
            {MORE_NAV.map(({ label, icon: Icon, tab }) => (
              <button
                key={tab}
                type="button"
                data-tour-id={`nav-${tab}`}
                onClick={() => {
                  onTabChange(tab);
                  setMoreOpen(false);
                }}
                className="flex w-full cursor-pointer items-center gap-1.5 px-4 py-2 text-left text-sm font-body text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </nav>
  );
}

export type SchoolParentDemoShellProps = {
  config: SchoolParentDemoConfig;
  initialTab?: ParentDemoNavTab;
  disableTour?: boolean;
  hideNav?: boolean;
  onMount?: () => void;
};

export default function SchoolParentDemoShell({
  config,
  initialTab = "home",
  disableTour = false,
  hideNav = false,
  onMount,
}: SchoolParentDemoShellProps) {
  applyParentDemoRuntime(config);
  const branding = buildDemoParentBranding();
  const schoolName = resolveDemoParentSchoolName();

  const [activeTab, setActiveTab] = useState<ParentDemoNavTab>(initialTab);
  const [isTouring, setIsTouring] = useState(!disableTour);
  const [tourStep, setTourStep] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorClicking, setCursorClicking] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    onMount?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTargetCenter = useCallback((targetId: string) => {
    const root = containerRef.current;
    if (!root) return null;
    const target = root.querySelector(
      `[data-tour-nav="primary"] [data-tour-id="${targetId}"]`,
    );
    if (!target || !(target instanceof HTMLElement)) return null;
    const rootRect = root.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    return {
      x: targetRect.left - rootRect.left + targetRect.width / 2,
      y: targetRect.top - rootRect.top + targetRect.height / 2,
    };
  }, []);

  useEffect(() => {
    if (!isTouring || disableTour) return;

    const tab = PARENT_DEMO_TOUR_TABS[tourStep % PARENT_DEMO_TOUR_TABS.length];
    let cancelled = false;
    const timers: number[] = [];
    const schedule = (fn: () => void, delay: number) => {
      const id = window.setTimeout(() => {
        if (!cancelled) fn();
      }, delay);
      timers.push(id);
    };

    schedule(() => {
      const position = getTargetCenter(`nav-${tab}`);
      if (position) {
        setCursorPos(position);
        setCursorVisible(true);
      }

      schedule(() => {
        setActiveTab(tab);
        setCursorClicking(true);
        schedule(() => setCursorClicking(false), 350);
        schedule(() => setTourStep((value) => value + 1), 2000);
      }, TOUR_MOVE_MS);
    }, 60);

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [disableTour, getTargetCenter, isTouring, tourStep]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const handleTourMouseEnter = useCallback(() => {
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    setIsTouring(false);
    setCursorVisible(false);
  }, []);

  const handleTourMouseLeave = useCallback(() => {
    if (disableTour) return;
    resumeTimerRef.current = window.setTimeout(() => {
      setTourStep(0);
      setIsTouring(true);
    }, TOUR_RESUME_MS);
  }, [disableTour]);

  const comingSoonLabel = COMING_SOON_LABELS[activeTab];

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleTourMouseEnter}
      onMouseLeave={handleTourMouseLeave}
      className={`relative flex h-full min-h-[700px] flex-col ${fraunces.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)]`}
      style={demoStoryShellStyle(PARENT_DEMO_STORY_THEME)}
      data-parent-portal
    >
      {cursorVisible ? (
        <motion.div
          className="pointer-events-none absolute z-[100]"
          animate={{ x: cursorPos.x - 10, y: cursorPos.y - 10 }}
          transition={{ duration: TOUR_MOVE_MS / 1000, ease: [0.25, 1, 0.5, 1] }}
          style={{ top: 0, left: 0 }}
        >
          <motion.div
            animate={cursorClicking ? { scale: 0.7 } : { scale: 1 }}
            transition={{ duration: 0.15 }}
            className="h-5 w-5 rounded-full"
            style={{
              backgroundColor: PARENT_DEMO_STORY_THEME.primary,
              boxShadow: `0 0 0 3px color-mix(in srgb, ${PARENT_DEMO_STORY_THEME.primary} 25%, transparent), 0 2px 8px color-mix(in srgb, ${PARENT_DEMO_STORY_THEME.primary} 40%, transparent)`,
            }}
          />
        </motion.div>
      ) : null}

      {!hideNav ? (
        <header
          className="z-40 shrink-0 border-b px-4 py-3 sm:px-6"
          style={{
            backgroundColor: PARENT_DEMO_STORY_THEME.white,
            borderColor: PARENT_DEMO_STORY_THEME.line,
          }}
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 gap-y-2">
            <div className="flex shrink-0 items-center">
              <Image
                src="/images/schoolstack-logo.png"
                alt="MudKitchen"
                width={40}
                height={40}
                priority
                className="h-8 w-auto shrink-0 object-contain"
              />
            </div>

            <div className="flex min-w-0 flex-1 justify-center overflow-x-auto">
              <ParentDemoNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <div
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full"
              style={{ backgroundColor: PARENT_DEMO_STORY_THEME.primary }}
            >
              <span className="text-xs font-semibold font-body text-white">
                {DEMO_PARENT.initials}
              </span>
            </div>
          </div>
        </header>
      ) : null}

      <main
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        style={{ backgroundColor: PARENT_DEMO_STORY_THEME.paper }}
      >
        {activeTab === "home" ? <DemoParentHomePage /> : null}
        {activeTab === "enrollment" ? <DemoParentEnrollmentTab /> : null}
        {activeTab === "children" ? <DemoParentChildrenPage /> : null}
        {activeTab === "calendar" ? <DemoParentCalendarPage /> : null}
        {activeTab === "billing" ? <DemoParentBillingPage /> : null}
        {comingSoonLabel ? (
          <SchoolParentComingSoon
            branding={branding}
            schoolSlug={DEMO_PORTAL_SLUG}
            schoolName={schoolName}
            organizationId={DEMO_PORTAL_ORG_ID}
            featureKey={activeTab}
            featureLabel={comingSoonLabel}
            userProfile={DEMO_PARENT_USER_PROFILE}
          />
        ) : null}
      </main>
    </div>
  );
}
