"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  ClipboardCheck,
  CreditCard,
  FileText,
  Heart,
  Home,
  MessageCircle,
  Phone,
  Rss,
  Users,
} from "lucide-react";
import type { SchoolParentDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import DemoParentBillingPage from "@/components/demo/shared/DemoParentBillingPage";
import DemoParentCalendarPage from "@/components/demo/shared/DemoParentCalendarPage";
import DemoParentChildrenPage from "@/components/demo/shared/DemoParentChildrenPage";
import DemoParentEnrollmentTab from "@/components/demo/shared/DemoParentEnrollmentTab";
import DemoParentHomePage from "@/components/demo/shared/DemoParentHomePage";
import DemoParentEmergencyContactsPage from "@/components/demo/shared/parent-garden/DemoParentEmergencyContactsPage";
import DemoParentFeedPage from "@/components/demo/shared/parent-garden/DemoParentFeedPage";
import DemoParentVolunteerPage from "@/components/demo/shared/parent-garden/DemoParentVolunteerPage";
import DemoParentFormsDocumentsPage from "@/components/demo/shared/parent-garden/DemoParentFormsDocumentsPage";
import DemoParentMessagesPage from "@/components/demo/shared/parent-garden/DemoParentMessagesPage";
import DemoPortalGardenHeader, {
  type DemoPortalNavEntry,
} from "@/components/demo/shared/DemoPortalGardenHeader";
import {
  PARENT_DEMO_STORY_THEME,
  applyParentDemoRuntime,
} from "@/components/demo/shared/parent-demo-runtime";
import { demoStoryShellStyle } from "@/components/demo/shared/demo-story-theme";
import { getTourTargetCenter } from "@/components/demo/shared/tour-cursor-position";
import { fraunces, dmSans } from "@/lib/fonts/local";

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

const PRIMARY_NAV: DemoPortalNavEntry<ParentDemoNavTab>[] = [
  { label: "Home", icon: Home, tab: "home", iconSlug: "home" },
  { label: "Enrollment", icon: ClipboardCheck, tab: "enrollment", iconSlug: "clipboard-list" },
  { label: "My Children", icon: Users, tab: "children", iconSlug: "users" },
  { label: "Tuition & Billing", icon: CreditCard, tab: "billing", iconSlug: "credit-card" },
  { label: "Calendar", icon: Calendar, tab: "calendar", iconSlug: "calendar-days" },
];

const MORE_NAV: DemoPortalNavEntry<ParentDemoNavTab>[] = [
  { label: "Messages", icon: MessageCircle, tab: "messages", iconSlug: "message-square" },
  { label: "Feed", icon: Rss, tab: "feed", iconSlug: "megaphone" },
  { label: "Forms & Documents", icon: FileText, tab: "forms", iconSlug: "file-text" },
  { label: "Volunteer Opportunities", icon: Heart, tab: "volunteer", iconSlug: "heart" },
  { label: "Emergency Contacts", icon: Phone, tab: "emergency-contacts", iconSlug: "heart-pulse" },
];


const TOUR_MOVE_MS = 950;
const TOUR_RESUME_MS = 1500;

const PARENT_DEMO_TOUR_TABS: ParentDemoNavTab[] = [
  "home",
  "enrollment",
  "children",
  "calendar",
  "billing",
];

export type SchoolParentDemoShellProps = {
  config: SchoolParentDemoConfig;
  initialTab?: ParentDemoNavTab;
  disableTour?: boolean;
  hideNav?: boolean;
  desktopEmbed?: boolean;
  onMount?: () => void;
};

export default function SchoolParentDemoShell({
  config,
  initialTab = "home",
  disableTour = false,
  hideNav = false,
  desktopEmbed = false,
  onMount,
}: SchoolParentDemoShellProps) {
  applyParentDemoRuntime(config);

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
      `[data-tour-nav="primary"] [data-nav-key="${targetId}"]`,
    );
    if (!target) return null;
    return getTourTargetCenter(root, target);
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
      className={`relative flex h-full min-h-[700px] flex-col ${fraunces.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)] ${desktopEmbed ? "min-w-[1100px] w-[1100px]" : ""}`}
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
        <DemoPortalGardenHeader
          theme={PARENT_DEMO_STORY_THEME}
          primary={PRIMARY_NAV}
          more={MORE_NAV}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          initials={DEMO_PARENT.initials}
          personName={DEMO_PARENT.name}
          ariaLabel="Parent portal"
          testIdPrefix="parent-demo-header"
          messagesUnreadCount={activeTab === "messages" ? 0 : 1}
        />
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
        {activeTab === "messages" ? <DemoParentMessagesPage /> : null}
        {activeTab === "forms" ? <DemoParentFormsDocumentsPage /> : null}
        {activeTab === "feed" ? <DemoParentFeedPage onNavigate={setActiveTab} /> : null}
        {activeTab === "volunteer" ? <DemoParentVolunteerPage /> : null}
        {activeTab === "emergency-contacts" ? <DemoParentEmergencyContactsPage /> : null}
      </main>
    </div>
  );
}
