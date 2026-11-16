"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import { useDashboardAttendanceModel } from "@/components/school-admin/attendance/useDashboardAttendanceModel";
import type { AttendanceFilterKey } from "@/components/school-admin/dashboard/garden/GardenAttendanceBoard";
import type { StaffClassroomOption } from "@/lib/school-admin/classrooms";
import type { AdminEnrolledStudentSummary } from "@/lib/school-admin/enrolled-students";
import type {
  AttendanceRosterStudent,
  AttendanceRosterSummary,
} from "@/lib/school-admin/attendance/attendance-types";
import { filterStudentsByClassroomName } from "@/lib/school-teacher/filter-students-by-classroom";
import {
  buildTeacherDocumentationGuides,
  groupTeacherDocumentationByCategory,
  type TeacherDocGuide,
} from "@/lib/school-teacher/teacher-documentation";
import {
  greetingParts,
  type TeacherDashboardFocusItem,
  type TeacherDashboardSummary,
} from "@/lib/school-teacher/teacher-dashboard-summary";
import { shouldShowTeacherDashboardAttendanceSection } from "@/lib/school-teacher/teacher-dashboard-attendance";
import {
  buildTeacherDaySteps,
  teacherDashboardStatusLine,
} from "@/lib/school-teacher/teacher-dashboard-day";
import {
  resolveTeacherDashboardWorkspaceTabs,
  type TeacherDashboardWorkspaceTab,
} from "@/lib/school-teacher/teacher-dashboard-workspace";
import {
  isTeacherFeatureEnabled,
  schoolTeacherPath,
  teacherDocumentationPath,
} from "@/lib/organization-settings/teacher-routes";
import type { OrganizationBranding, OrganizationFeatures } from "@/lib/organization-settings/types";
import type { StaffUserProfile } from "@/lib/staff/teacher-portal-access";
import type { StaffPortalRole } from "@/lib/staff/staff-members";

export type TeacherDashboardPageProps = {
  organizationId: string;
  slug: string;
  schoolName: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  userProfile: StaffUserProfile;
  roleTitle: string | null;
  portalRole: StaffPortalRole | null;
  initialSummary: TeacherDashboardSummary;
  previewMode?: boolean;
  teacherBasePath?: string;
};

export const MAX_STUDENT_CARDS = 6;
const WORKSPACE_PARAM = "workspace";
const WORKSPACE_ANCHOR_ID = "teacher-dashboard-workspace";

const EMPTY_SUMMARY: AttendanceRosterSummary = {
  totalStudents: 0,
  presentCount: 0,
  absentCount: 0,
  pickedUpCount: 0,
  notMarkedCount: 0,
};
const EMPTY_STUDENTS: AttendanceRosterStudent[] = [];

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function portalRoleLabel(role: StaffPortalRole | null): string {
  if (role === "teacher") return "Teacher";
  if (role === "staff") return "Staff";
  return "Staff member";
}

function firstName(displayName: string): string {
  const part = displayName.trim().split(/\s+/).filter(Boolean)[0];
  return part ?? displayName;
}

function isWorkspaceTab(value: string | null): value is TeacherDashboardWorkspaceTab {
  return value === "attendance" || value === "classrooms" || value === "students";
}

/**
 * Staff Dashboard view-model: the same data rules as the old story page
 * (focus items, workspace tabs, unread refresh, drawers, guides) plus the
 * shared attendance model. Garden markup only reads from here.
 * Must render inside `AttendanceApiProvider` (teacher attendance API).
 */
export function useTeacherDashboardModel(props: TeacherDashboardPageProps) {
  const {
    organizationId,
    slug,
    schoolName,
    features,
    userProfile,
    initialSummary,
    previewMode = false,
    teacherBasePath,
  } = props;
  const { theme, adminCompat } = useParentTheme();

  const [summary, setSummary] = useState(initialSummary);
  const [prevInitialSummary, setPrevInitialSummary] = useState(initialSummary);
  if (initialSummary !== prevInitialSummary) {
    setPrevInitialSummary(initialSummary);
    setSummary(initialSummary);
  }

  const [classroomSidebar, setClassroomSidebar] = useState<StaffClassroomOption | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<AdminEnrolledStudentSummary | null>(null);
  const [activeGuide, setActiveGuide] = useState<TeacherDocGuide | null>(null);
  const [requestedTab, setRequestedTab] = useState<TeacherDashboardWorkspaceTab | null>(null);
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilterKey>("all");
  const [rollCallOpen, setRollCallOpen] = useState(false);

  const featureHref = useCallback(
    (feature: string) =>
      teacherBasePath ? `${teacherBasePath}/${feature}` : schoolTeacherPath(slug, feature),
    [slug, teacherBasePath],
  );
  const messagesHref = featureHref("messages");
  const calendarHref = featureHref("calendar");
  const myStudentsHref = featureHref("my_students");
  const attendanceHref = featureHref("attendance");

  const attendanceEnabled = isTeacherFeatureEnabled(features, "attendance");
  const showAttendanceSection = shouldShowTeacherDashboardAttendanceSection(
    attendanceEnabled,
    summary.attendanceToday,
  );
  const myStudentsEnabled = Boolean(features.teacher?.my_students);
  const messagesEnabled = Boolean(features.teacher?.messages);
  const calendarEnabled = Boolean(features.teacher?.calendar);

  /* ---------------- Workspace tabs (same rules, tab kept in the URL) ---------------- */

  const { tabs: workspaceTabs, defaultTab } = useMemo(
    () =>
      resolveTeacherDashboardWorkspaceTabs({
        showAttendanceSection,
        myStudentsEnabled,
        classroomCount: summary.staffClassrooms.length,
      }),
    [showAttendanceSection, myStudentsEnabled, summary.staffClassrooms.length],
  );
  const activeWorkspaceTab: TeacherDashboardWorkspaceTab | null =
    requestedTab && workspaceTabs.some((tab) => tab.key === requestedTab)
      ? requestedTab
      : defaultTab;

  // Read ?workspace= once after mount (no SSR mismatch, no navigation).
  useEffect(() => {
    if (previewMode && teacherBasePath === "#") return;
    const value = new URLSearchParams(window.location.search).get(WORKSPACE_PARAM);
    if (isWorkspaceTab(value)) queueMicrotask(() => setRequestedTab(value));
  }, [previewMode, teacherBasePath]);

  const setWorkspaceTab = useCallback(
    (tab: TeacherDashboardWorkspaceTab) => {
      setRequestedTab(tab);
      if (previewMode && teacherBasePath === "#") return; // marketing demo: leave the URL alone
      try {
        const url = new URL(window.location.href);
        if (tab === defaultTab) url.searchParams.delete(WORKSPACE_PARAM);
        else url.searchParams.set(WORKSPACE_PARAM, tab);
        window.history.replaceState(window.history.state, "", url.toString());
      } catch {
        // URL sync is a convenience only.
      }
    },
    [defaultTab, previewMode, teacherBasePath],
  );

  /* ---------------- Attendance (shared model, teacher API) ---------------- */

  const attendanceToday = summary.attendanceToday;
  const att = useDashboardAttendanceModel({
    organizationId,
    date: attendanceToday?.date ?? "",
    students: attendanceToday?.students ?? EMPTY_STUDENTS,
    summary: attendanceToday?.summary ?? EMPTY_SUMMARY,
    attendanceHref,
    previewMode,
    operationalErrorSurface: "teacher_portal",
    enabled: showAttendanceSection,
    silentLoadErrors: true,
    onSummaryChange: (nextSummary) => {
      setSummary((prev) =>
        prev.attendanceToday
          ? { ...prev, attendanceToday: { ...prev.attendanceToday, summary: nextSummary } }
          : prev,
      );
    },
  });
  const todaySummary = attendanceToday?.summary ?? EMPTY_SUMMARY;
  const daySteps = useMemo(() => buildTeacherDaySteps(todaySummary), [todaySummary]);
  const rollCallDoneToday = todaySummary.totalStudents > 0 && todaySummary.notMarkedCount === 0;

  /** Open the Attendance tab on a status filter and bring the roster into view. */
  const showRoster = useCallback(
    (filter: AttendanceFilterKey) => {
      setAttendanceFilter(filter);
      setWorkspaceTab("attendance");
      if (!att.viewingToday) att.jumpToToday();
      requestAnimationFrame(() => {
        document
          .getElementById(WORKSPACE_ANCHOR_ID)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [att, setWorkspaceTab],
  );

  const showWorkspace = useCallback(
    (tab: TeacherDashboardWorkspaceTab) => {
      setWorkspaceTab(tab);
      requestAnimationFrame(() => {
        document
          .getElementById(WORKSPACE_ANCHOR_ID)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [setWorkspaceTab],
  );

  /* ---------------- Messages unread refresh (unchanged) ---------------- */

  const refreshUnreadCount = useCallback(async () => {
    if (previewMode || !features.teacher?.messages) return;
    try {
      const params = new URLSearchParams({ organizationId, schoolName });
      const response = await fetch(
        `/api/teacher-portal/messages/unread-count?${params.toString()}`,
      );
      if (!response.ok) return;
      const data = (await response.json()) as { unreadCount?: number };
      const unreadCount = typeof data.unreadCount === "number" ? data.unreadCount : 0;
      setSummary((prev) => ({ ...prev, messagesUnreadCount: unreadCount }));
    } catch {
      // Keep last known count on refresh failure. intentionally silent
    }
  }, [previewMode, features.teacher?.messages, organizationId, schoolName]);

  useEffect(() => {
    if (previewMode) return;
    const onFocus = () => {
      void refreshUnreadCount();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [previewMode, refreshUnreadCount]);

  /* ---------------- Focus queue: server items, kept in step with live counts ---------------- */

  const focusItems = useMemo<TeacherDashboardFocusItem[]>(() => {
    return summary.focusItems.flatMap((item) => {
      if (item.id === "attendance-not-marked" && summary.attendanceToday) {
        const count = summary.attendanceToday.summary.notMarkedCount;
        if (count <= 0) return [];
        return [{ ...item, title: `Mark attendance for ${plural(count, "student")}` }];
      }
      if (item.id === "unread-messages") {
        const count = summary.messagesUnreadCount;
        if (count <= 0) return [];
        return [{ ...item, title: `Reply to ${plural(count, "unread message")}` }];
      }
      return [item];
    });
  }, [summary.focusItems, summary.attendanceToday, summary.messagesUnreadCount]);

  /* ---------------- Drawers ---------------- */

  // Escape closes the student detail first; the classroom drawer (GSidePanel)
  // handles its own Escape and ignores it while a student is open on top.
  useEffect(() => {
    if (!selectedStudent) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedStudent(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStudent]);

  const classroomSidebarStudents = useMemo(() => {
    if (!classroomSidebar) return [];
    return filterStudentsByClassroomName(summary.assignedStudents, classroomSidebar.name);
  }, [classroomSidebar, summary.assignedStudents]);

  const selectedStudentRef = useRef(selectedStudent);
  useEffect(() => {
    selectedStudentRef.current = selectedStudent;
  });
  const closeClassroomSidebar = useCallback(() => {
    if (selectedStudentRef.current) return;
    setClassroomSidebar(null);
  }, []);

  /* ---------------- Guides ---------------- */

  const howToGuides = useMemo(
    () =>
      buildTeacherDocumentationGuides({
        slug,
        features,
        bulletinEnabled: summary.bulletinEnabled,
        teacherBasePath,
      }),
    [slug, features, summary.bulletinEnabled, teacherBasePath],
  );
  const groupedHowToGuides = useMemo(
    () => groupTeacherDocumentationByCategory(howToGuides),
    [howToGuides],
  );
  const documentationHref = useMemo(
    () => teacherDocumentationPath(slug, { teacherBasePath }),
    [slug, teacherBasePath],
  );
  const openGuide = useCallback((guide: TeacherDocGuide) => setActiveGuide(guide), []);
  const closeGuide = useCallback(() => setActiveGuide(null), []);

  /* ---------------- Copy (existing strings) ---------------- */

  const name = firstName(userProfile.displayName);
  const { prefix: greetingPrefix, emoji: greetingEmoji } = greetingParts();
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const studentCount = summary.assignedStudents.length;
  const snapshotTitle =
    studentCount > 0
      ? `${studentCount} learner${studentCount === 1 ? "" : "s"} in your care`
      : "Your classroom";
  const snapshotBody =
    studentCount > 0
      ? `You're assigned to ${studentCount} enrolled learner${studentCount === 1 ? "" : "s"} at ${schoolName}.`
      : myStudentsEnabled
        ? "No learners are assigned to you yet. Your administrator can link students from the staff directory."
        : `Welcome to ${schoolName}'s staff portal.`;

  const showSchoolUpdates = !summary.bulletinEnabled && messagesEnabled;
  const messagesPromo = {
    title:
      summary.messagesUnreadCount > 0
        ? `${summary.messagesUnreadCount} unread message${summary.messagesUnreadCount === 1 ? "" : "s"}`
        : "Messages from families and staff",
    subtitle:
      summary.messagesUnreadCount > 0
        ? "Families are waiting on your response."
        : "Check your inbox for school communications.",
  };

  /** Header status line, built only from data (same wording as the mobile teacher Home). */
  const statusLine = teacherDashboardStatusLine({
    focusCount: focusItems.length,
    attendance: showAttendanceSection ? todaySummary : null,
    unreadMessages: messagesEnabled ? summary.messagesUnreadCount : null,
  });

  return {
    props,
    theme,
    adminCompat,
    previewMode,
    summary,
    // hrefs
    messagesHref,
    calendarHref,
    myStudentsHref,
    attendanceHref,
    documentationHref,
    // features
    showAttendanceSection,
    myStudentsEnabled,
    messagesEnabled,
    calendarEnabled,
    // header
    name,
    greetingPrefix,
    greetingEmoji,
    todayLabel,
    statusLine,
    // focus + snapshot
    focusItems,
    snapshotTitle,
    snapshotBody,
    studentCount,
    nextEvent: summary.upcomingEvents[0] ?? null,
    showSchoolUpdates,
    messagesPromo,
    // workspace
    workspaceAnchorId: WORKSPACE_ANCHOR_ID,
    workspaceTabs,
    activeWorkspaceTab,
    setWorkspaceTab,
    showWorkspace,
    // attendance
    att,
    todaySummary,
    daySteps,
    rollCallDoneToday,
    attendanceFilter,
    setAttendanceFilter,
    showRoster,
    rollCallOpen,
    openRollCall: () => setRollCallOpen(true),
    closeRollCall: () => setRollCallOpen(false),
    // students + classrooms
    visibleStudents: summary.assignedStudents.slice(0, MAX_STUDENT_CARDS),
    hasMoreStudents: summary.assignedStudents.length > MAX_STUDENT_CARDS,
    classroomSidebar,
    openClassroom: setClassroomSidebar,
    closeClassroomSidebar,
    classroomSidebarStudents,
    selectedStudent,
    setSelectedStudent,
    // guides
    howToGuides,
    groupedHowToGuides,
    activeGuide,
    openGuide,
    closeGuide,
  };
}

export type TeacherDashboardModel = ReturnType<typeof useTeacherDashboardModel>;
