"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  LayoutDashboard,
  MessageCircle,
  Rss,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { SchoolTeacherDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import DemoTeacherAttendancePage from "@/components/demo/shared/DemoTeacherAttendancePage";
import DemoTeacherCalendarPage from "@/components/demo/shared/DemoTeacherCalendarPage";
import DemoTeacherDashboardPage from "@/components/demo/shared/DemoTeacherDashboardPage";
import DemoTeacherMessagesPage from "@/components/demo/shared/DemoTeacherMessagesPage";
import DemoTeacherMyStudentsPage from "@/components/demo/shared/DemoTeacherMyStudentsPage";
import {
  TEACHER_DEMO_ACCENT,
  TEACHER_DEMO_STORY_THEME,
  applyTeacherDemoRuntime,
} from "@/components/demo/shared/teacher-demo-runtime";
import { demoStoryShellStyle } from "@/components/demo/shared/demo-story-theme";
import SchoolTeacherComingSoon from "@/components/school-teacher/SchoolTeacherComingSoon";
import { buildDemoTeacherBranding } from "@/data/school-demos/demo-portal-shared";
import { fraunces, dmSans } from "@/lib/fonts";

export type TeacherDemoNavTab =
  | "dashboard"
  | "students"
  | "messages"
  | "calendar"
  | "attendance"
  | "hours"
  | "feed"
  | "payroll"
  | "forms";

const DEMO_TEACHER = {
  name: "Jordan Taylor",
  initials: "JT",
};

const PRIMARY_NAV: { label: string; icon: LucideIcon; tab: TeacherDemoNavTab }[] = [
  { label: "Dashboard", icon: LayoutDashboard, tab: "dashboard" },
  { label: "My Students", icon: Users, tab: "students" },
  { label: "Messages", icon: MessageCircle, tab: "messages" },
  { label: "Calendar", icon: Calendar, tab: "calendar" },
  { label: "Attendance", icon: ClipboardList, tab: "attendance" },
];

const MORE_NAV: { label: string; icon: LucideIcon; tab: TeacherDemoNavTab }[] = [
  { label: "My Hours", icon: Clock, tab: "hours" },
  { label: "Feed", icon: Rss, tab: "feed" },
  { label: "Payroll", icon: CreditCard, tab: "payroll" },
  { label: "Forms & Docs", icon: FileText, tab: "forms" },
];

const COMING_SOON_LABELS: Partial<Record<TeacherDemoNavTab, string>> = {
  hours: "My Hours",
  feed: "Feed",
  payroll: "Payroll",
  forms: "Forms & Documents",
};

const TOUR_MOVE_MS = 900;
const TOUR_RESUME_MS = 2500;

const TEACHER_DEMO_TOUR_TABS: TeacherDemoNavTab[] = [
  "dashboard",
  "students",
  "messages",
  "calendar",
  "attendance",
];

function TeacherDemoNav({
  activeTab,
  onTabChange,
}: {
  activeTab: TeacherDemoNavTab;
  onTabChange: (tab: TeacherDemoNavTab) => void;
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
    <nav data-tour-nav="primary" className="flex flex-wrap items-center gap-2">
      {PRIMARY_NAV.map(({ label, icon: Icon, tab }) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            data-tour-id={`nav-${tab}`}
            onClick={() => onTabChange(tab)}
            className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-sm transition-colors"
            style={
              isActive
                ? {
                    color: TEACHER_DEMO_STORY_THEME.primaryDark,
                    backgroundColor: TEACHER_DEMO_STORY_THEME.primaryLight,
                    fontWeight: 600,
                  }
                : { color: TEACHER_DEMO_STORY_THEME.muted }
            }
          >
            <Icon className="pointer-events-none h-4 w-4" />
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
          className="flex cursor-pointer items-center gap-1 rounded-md px-3 py-1.5 text-sm font-body text-gray-600 transition-colors hover:bg-gray-50 hover:text-[var(--parent-primary)]"
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
                className="flex w-full cursor-pointer items-center gap-1.5 px-4 py-2 text-left text-sm font-body text-gray-700 transition-colors hover:bg-gray-50 hover:text-[var(--parent-primary)]"
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

export type SchoolTeacherDemoShellProps = {
  config: SchoolTeacherDemoConfig;
  initialTab?: TeacherDemoNavTab;
  disableTour?: boolean;
  hideNav?: boolean;
  onMount?: () => void;
  initialSelectedStudentId?: string;
  openInitialStudentDetailDelayMs?: number;
};

export default function SchoolTeacherDemoShell({
  config,
  initialTab = "dashboard",
  disableTour = false,
  hideNav = false,
  onMount,
  initialSelectedStudentId,
  openInitialStudentDetailDelayMs,
}: SchoolTeacherDemoShellProps) {
  applyTeacherDemoRuntime(config);
  const branding = buildDemoTeacherBranding();

  const [activeTab, setActiveTab] = useState<TeacherDemoNavTab>(initialTab);
  const [isTouring, setIsTouring] = useState(!disableTour);
  const [tourStep, setTourStep] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorClicking, setCursorClicking] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    onMount?.();
    // onMount is a one-time mount notification for lazy-load shells
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

    const tab = TEACHER_DEMO_TOUR_TABS[tourStep % TEACHER_DEMO_TOUR_TABS.length];
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
      className={`relative flex h-full flex-col ${fraunces.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)]`}
      style={demoStoryShellStyle(TEACHER_DEMO_STORY_THEME)}
      data-teacher-portal
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
              backgroundColor: TEACHER_DEMO_ACCENT,
              boxShadow: `0 0 0 3px color-mix(in srgb, ${TEACHER_DEMO_ACCENT} 25%, transparent), 0 2px 8px color-mix(in srgb, ${TEACHER_DEMO_ACCENT} 40%, transparent)`,
            }}
          />
        </motion.div>
      ) : null}

      {!hideNav ? (
        <header
          className="z-40 shrink-0 border-b"
          style={{
            backgroundColor: TEACHER_DEMO_STORY_THEME.white,
            borderColor: TEACHER_DEMO_STORY_THEME.line,
          }}
        >
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-6">
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

            <div className="flex flex-1 justify-center">
              <TeacherDemoNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <div
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full"
              style={{ backgroundColor: TEACHER_DEMO_ACCENT }}
            >
              <span className="text-xs font-semibold font-body text-white">
                {DEMO_TEACHER.initials}
              </span>
            </div>
          </div>
        </header>
      ) : null}

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white">
        {activeTab === "dashboard" ? <DemoTeacherDashboardPage /> : null}
        {activeTab === "students" ? (
          <DemoTeacherMyStudentsPage
            initialSelectedStudentId={
              initialSelectedStudentId ??
              (openInitialStudentDetailDelayMs ? "student-emma" : undefined)
            }
          />
        ) : null}
        {activeTab === "messages" ? <DemoTeacherMessagesPage /> : null}
        {activeTab === "calendar" ? <DemoTeacherCalendarPage /> : null}
        {activeTab === "attendance" ? <DemoTeacherAttendancePage /> : null}
        {comingSoonLabel ? (
          <SchoolTeacherComingSoon branding={branding} featureLabel={comingSoonLabel} />
        ) : null}
      </main>
    </div>
  );
}
