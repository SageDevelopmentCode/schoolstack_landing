"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  LayoutDashboard,
  MessageCircle,
  Rss,
  Users,
} from "lucide-react";
import type { SchoolTeacherDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import DemoTeacherAttendancePage from "@/components/demo/shared/DemoTeacherAttendancePage";
import DemoTeacherHoursPage from "@/components/demo/shared/DemoTeacherHoursPage";
import DemoTeacherFormsDocumentsPage from "@/components/demo/shared/DemoTeacherFormsDocumentsPage";
import DemoTeacherFeedPage from "@/components/demo/shared/teacher-garden/DemoTeacherFeedPage";
import DemoTeacherPayrollPage from "@/components/demo/shared/teacher-garden/DemoTeacherPayrollPage";
import DemoTeacherCalendarPage from "@/components/demo/shared/DemoTeacherCalendarPage";
import DemoTeacherDashboardPage from "@/components/demo/shared/DemoTeacherDashboardPage";
import DemoPortalGardenHeader, {
  type DemoPortalNavEntry,
} from "@/components/demo/shared/DemoPortalGardenHeader";
import DemoTeacherMessagesPage from "@/components/demo/shared/DemoTeacherMessagesPage";
import DemoTeacherMyStudentsPage from "@/components/demo/shared/DemoTeacherMyStudentsPage";
import {
  TEACHER_DEMO_ACCENT,
  TEACHER_DEMO_STORY_THEME,
  applyTeacherDemoRuntime,
} from "@/components/demo/shared/teacher-demo-runtime";
import { demoStoryShellStyle } from "@/components/demo/shared/demo-story-theme";
import { getTourTargetCenter } from "@/components/demo/shared/tour-cursor-position";
import { fraunces, dmSans } from "@/lib/fonts/local";

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

const PRIMARY_NAV: DemoPortalNavEntry<TeacherDemoNavTab>[] = [
  { label: "Dashboard", icon: LayoutDashboard, tab: "dashboard", iconSlug: "layout-dashboard" },
  { label: "My Students", icon: Users, tab: "students", iconSlug: "users" },
  { label: "Messages", icon: MessageCircle, tab: "messages", iconSlug: "message-square" },
  { label: "Calendar", icon: Calendar, tab: "calendar", iconSlug: "calendar-days" },
  { label: "Attendance", icon: ClipboardList, tab: "attendance", iconSlug: "clipboard-list" },
];

const MORE_NAV: DemoPortalNavEntry<TeacherDemoNavTab>[] = [
  { label: "My Hours", icon: Clock, tab: "hours", iconSlug: "clock" },
  { label: "Feed", icon: Rss, tab: "feed", iconSlug: "megaphone" },
  { label: "Payroll", icon: CreditCard, tab: "payroll", iconSlug: "wallet" },
  { label: "Forms & Docs", icon: FileText, tab: "forms", iconSlug: "file-text" },
];


const TOUR_MOVE_MS = 900;
const TOUR_RESUME_MS = 2500;

const TEACHER_DEMO_TOUR_TABS: TeacherDemoNavTab[] = [
  "dashboard",
  "students",
  "messages",
  "calendar",
  "attendance",
];

export type SchoolTeacherDemoShellProps = {
  config: SchoolTeacherDemoConfig;
  initialTab?: TeacherDemoNavTab;
  disableTour?: boolean;
  hideNav?: boolean;
  desktopEmbed?: boolean;
  onMount?: () => void;
  initialSelectedStudentId?: string;
  openInitialStudentDetailDelayMs?: number;
};

export default function SchoolTeacherDemoShell({
  config,
  initialTab = "dashboard",
  disableTour = false,
  hideNav = false,
  desktopEmbed = false,
  onMount,
  initialSelectedStudentId,
  openInitialStudentDetailDelayMs,
}: SchoolTeacherDemoShellProps) {
  applyTeacherDemoRuntime(config);

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
      `[data-tour-nav="primary"] [data-nav-key="${targetId}"]`,
    );
    if (!target) return null;
    return getTourTargetCenter(root, target);
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
      const position = getTargetCenter(tab);
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

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleTourMouseEnter}
      onMouseLeave={handleTourMouseLeave}
      className={`relative flex h-full flex-col ${fraunces.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)] ${desktopEmbed ? "min-w-[1100px] w-[1100px]" : ""}`}
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
        <DemoPortalGardenHeader
          theme={TEACHER_DEMO_STORY_THEME}
          primary={PRIMARY_NAV}
          more={MORE_NAV}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          initials={DEMO_TEACHER.initials}
          personName={DEMO_TEACHER.name}
          ariaLabel="Staff portal"
          testIdPrefix="teacher-demo-header"
        />
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
        {activeTab === "hours" ? <DemoTeacherHoursPage /> : null}
        {activeTab === "feed" ? <DemoTeacherFeedPage onNavigate={setActiveTab} /> : null}
        {activeTab === "forms" ? <DemoTeacherFormsDocumentsPage openFormId={null} interactive /> : null}
        {activeTab === "payroll" ? <DemoTeacherPayrollPage onNavigate={setActiveTab} /> : null}
      </main>
    </div>
  );
}
