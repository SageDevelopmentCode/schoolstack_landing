"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  ClipboardList,
  MessageSquare,
  Users,
} from "lucide-react";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import AdminQuickActionsCard from "@/components/school-admin/ui/story/AdminQuickActionsCard";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentDatePill from "@/components/school-parent/ui/ParentDatePill";
import ParentAttentionItem from "@/components/school-parent/ui/ParentAttentionItem";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import BulletinMiniFeed from "@/components/bulletin/BulletinMiniFeed";
import TeacherStudentStoryCard from "@/components/school-teacher/TeacherStudentStoryCard";
import {
  greetingParts,
  type TeacherDashboardFocusIcon,
  type TeacherDashboardSummary,
} from "@/lib/school-teacher/teacher-dashboard-summary";
import { parseEventDate } from "@/lib/committees/calendar-utils";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { schoolTeacherPath } from "@/lib/organization-settings/teacher-routes";
import type { OrganizationBranding, OrganizationFeatures } from "@/lib/organization-settings/types";
import type { StaffUserProfile } from "@/lib/staff/teacher-portal-access";
import type { StaffPortalRole } from "@/lib/staff/staff-members";

type TeacherDashboardPageProps = {
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

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

const MAX_STUDENT_CARDS = 6;

function portalRoleLabel(role: StaffPortalRole | null): string {
  if (role === "teacher") return "Teacher";
  if (role === "staff") return "Staff";
  return "Staff member";
}

function firstName(displayName: string): string {
  const part = displayName.trim().split(/\s+/).filter(Boolean)[0];
  return part ?? displayName;
}

function focusItemIcon(icon: TeacherDashboardFocusIcon, theme: ParentThemeTokens) {
  switch (icon) {
    case "message":
      return <MessageSquare className="h-4 w-4" style={{ color: theme.primary }} />;
    case "calendar":
      return <Calendar className="h-4 w-4" style={{ color: theme.primary }} />;
    case "students":
      return <Users className="h-4 w-4" style={{ color: theme.primary }} />;
    case "signups":
      return <ClipboardList className="h-4 w-4" style={{ color: theme.primary }} />;
  }
}

function focusItemIconBg(icon: TeacherDashboardFocusIcon): string {
  switch (icon) {
    case "message":
      return "#E8F0F5";
    case "calendar":
      return "#EEF7EF";
    case "students":
      return "#FFF4D9";
    case "signups":
      return "#E9F2EA";
  }
}

export default function TeacherDashboardPage({
  branding: _branding,
  organizationId,
  slug,
  schoolName,
  features,
  userProfile,
  roleTitle,
  portalRole,
  initialSummary,
  previewMode = false,
  teacherBasePath,
}: TeacherDashboardPageProps) {
  const { theme } = useParentTheme();
  const [summary, setSummary] = useState(initialSummary);
  const [prevInitialSummary, setPrevInitialSummary] = useState(initialSummary);

  if (initialSummary !== prevInitialSummary) {
    setPrevInitialSummary(initialSummary);
    setSummary(initialSummary);
  }

  const messagesHref = teacherBasePath
    ? `${teacherBasePath}/messages`
    : schoolTeacherPath(slug, "messages");
  const calendarHref = teacherBasePath
    ? `${teacherBasePath}/calendar`
    : schoolTeacherPath(slug, "calendar");
  const myStudentsHref = teacherBasePath
    ? `${teacherBasePath}/my_students`
    : schoolTeacherPath(slug, "my_students");

  const refreshUnreadCount = useCallback(async () => {
    if (previewMode || !features.teacher?.messages) return;
    try {
      const params = new URLSearchParams({
        organizationId,
        schoolName,
      });
      const response = await fetch(
        `/api/teacher-portal/messages/unread-count?${params.toString()}`,
      );
      if (!response.ok) return;
      const data = (await response.json()) as { unreadCount?: number };
      const unreadCount =
        typeof data.unreadCount === "number" ? data.unreadCount : 0;
      setSummary((prev) => ({
        ...prev,
        messagesUnreadCount: unreadCount,
        metrics: prev.metrics.map((metric) =>
          metric.id === "unread-messages"
            ? { ...metric, value: String(unreadCount) }
            : metric,
        ),
      }));
    } catch {
      // Keep last known count on refresh failure.
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

  const name = firstName(userProfile.displayName);
  const { prefix: greetingPrefix, emoji: greetingEmoji } = greetingParts();
  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const nextEvent = summary.upcomingEvents[0] ?? null;
  const myStudentsEnabled = Boolean(features.teacher?.my_students);
  const messagesEnabled = Boolean(features.teacher?.messages);
  const calendarEnabled = Boolean(features.teacher?.calendar);
  const studentCount = summary.assignedStudents.length;
  const visibleStudents = summary.assignedStudents.slice(0, MAX_STUDENT_CARDS);
  const hasMoreStudents = summary.assignedStudents.length > MAX_STUDENT_CARDS;

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

  const quickActionsForAdminCard = summary.quickActions.map((action) => ({
    id: action.id,
    title: action.title,
    subtitle: action.subtitle,
    href: action.href,
  }));

  const startHereTitle =
    summary.focusItems.length > 0
      ? `${summary.focusItems.length} thing${summary.focusItems.length === 1 ? "" : "s"} need your attention`
      : "You're all caught up";

  return (
    <div className="min-h-full w-full" style={{ backgroundColor: theme.paper }}>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7 px-4 py-6 sm:px-8 sm:py-8 lg:px-[68px] lg:py-10">
        <motion.header
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end sm:gap-5"
        >
          <div>
            <ParentSectionKicker theme={theme}>
              {schoolName} staff
            </ParentSectionKicker>
            <ParentDisplayHeading theme={theme} as="h1">
              {greetingPrefix}, {name}.{" "}
              <span aria-hidden="true">{greetingEmoji}</span>
            </ParentDisplayHeading>
            <p className="mt-2 text-[15px]" style={{ color: theme.muted }}>
              {previewMode
                ? `Previewing ${schoolName}'s staff portal as ${userProfile.displayName}.`
                : `Here's your classroom picture for ${dayName}.`}
            </p>
            <p className="mt-1 text-sm" style={{ color: theme.muted }}>
              {roleTitle || "Staff"} · {portalRoleLabel(portalRole)}
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <ParentDatePill theme={theme} />
          </div>
        </motion.header>

        <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.45fr_0.85fr]">
          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
            <ParentCard theme={theme} variant="today" className="relative">
              <ParentSectionKicker theme={theme}>Start here</ParentSectionKicker>
              <h3
                className="mb-4 text-base font-semibold"
                style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
              >
                {startHereTitle}
              </h3>
              {summary.focusItems.length > 0 ? (
                summary.focusItems.map((item) => (
                  <div key={item.id}>
                    <Link href={item.href} className="block hover:opacity-90">
                      <ParentAttentionItem
                        theme={theme}
                        icon={focusItemIcon(item.icon, theme)}
                        title={item.title}
                        subtitle={item.subtitle}
                        iconBg={focusItemIconBg(item.icon)}
                      />
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm" style={{ color: theme.muted }}>
                  No urgent tasks right now. Check back for messages and school updates.
                </p>
              )}
            </ParentCard>
          </motion.div>

          <motion.aside custom={2} initial="hidden" animate="visible" variants={fadeUp}>
            <ParentCard theme={theme} variant="primary" className="h-full">
              <ParentSectionKicker theme={theme} light>
                Classroom snapshot
              </ParentSectionKicker>
              <h3
                className="mb-3 text-base font-semibold text-white"
                style={{ fontFamily: theme.fontDisplay }}
              >
                {snapshotTitle}
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: "#D5E3D9" }}>
                {snapshotBody}
              </p>
              {nextEvent ? (
                <div
                  className="mt-3 rounded-[14px] p-3"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <b className="block text-[13px] text-white">{nextEvent.title}</b>
                  <span className="text-xs" style={{ color: "#D4E0D7" }}>
                    {parseEventDate(nextEvent.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                    {!nextEvent.isAllDay && nextEvent.time
                      ? ` · ${nextEvent.time}`
                      : ""}
                  </span>
                </div>
              ) : null}
              {calendarEnabled ? (
                <div className="mt-4">
                  <ParentTextLink theme={theme} href={calendarHref} light>
                    View school calendar
                  </ParentTextLink>
                </div>
              ) : null}
            </ParentCard>
          </motion.aside>
        </div>

        {summary.metrics.length > 0 ? (
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="grid grid-cols-1 gap-[13px] sm:grid-cols-2 xl:grid-cols-3"
          >
            {summary.metrics.map((metric) => (
              <AdminMetricCard
                key={metric.id}
                theme={theme}
                value={metric.value}
                label={metric.label}
                accent={metric.accent}
              />
            ))}
          </motion.div>
        ) : null}

        {myStudentsEnabled ? (
          <motion.section custom={4} initial="hidden" animate="visible" variants={fadeUp}>
            <h3
              className="mb-3.5 font-heading text-2xl font-semibold tracking-[-0.03em]"
              style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
            >
              Your students
            </h3>
            {studentCount === 0 ? (
              <ParentCard theme={theme}>
                <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
                  No learners assigned yet — your administrator can link students to you
                  from the staff directory.
                </p>
              </ParentCard>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleStudents.map((student, index) => (
                    <TeacherStudentStoryCard
                      key={student.id}
                      student={student}
                      theme={theme}
                      myStudentsHref={myStudentsHref}
                      index={index}
                    />
                  ))}
                </div>
                {hasMoreStudents ? (
                  <div className="mt-4">
                    <ParentTextLink theme={theme} href={myStudentsHref}>
                      View all {studentCount} students
                    </ParentTextLink>
                  </div>
                ) : null}
              </>
            )}
          </motion.section>
        ) : null}

        <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1fr_1.15fr]">
          {summary.bulletinEnabled || messagesEnabled ? (
            <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
              <ParentCard theme={theme}>
                <ParentSectionKicker theme={theme}>School updates</ParentSectionKicker>
                <h3
                  className="mb-4 text-base font-semibold"
                  style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                >
                  {summary.bulletinEnabled ? "From your school" : "Messages"}
                </h3>
                {summary.bulletinEnabled ? (
                  <BulletinMiniFeed theme={theme} posts={summary.bulletinPosts} />
                ) : null}
                {messagesEnabled ? (
                  <div className={summary.bulletinEnabled ? "mt-4 border-t border-[#E7ECE7] pt-4" : ""}>
                    {!summary.bulletinEnabled ? (
                      <div className="flex items-center gap-3.5">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full"
                          style={{ backgroundColor: theme.infoBg }}
                        >
                          <MessageSquare className="h-4 w-4" style={{ color: theme.info }} />
                        </div>
                        <div>
                          <strong className="block text-sm" style={{ color: theme.ink }}>
                            {summary.messagesUnreadCount > 0
                              ? `${summary.messagesUnreadCount} unread message${summary.messagesUnreadCount === 1 ? "" : "s"}`
                              : "Messages from families and staff"}
                          </strong>
                          <p className="m-0 text-xs" style={{ color: "#78858A" }}>
                            {summary.messagesUnreadCount > 0
                              ? "Families are waiting on your response."
                              : "Check your inbox for school communications."}
                          </p>
                        </div>
                      </div>
                    ) : null}
                    <div className={summary.bulletinEnabled ? "" : "mt-4"}>
                      <ParentTextLink theme={theme} href={messagesHref}>
                        Open messages
                      </ParentTextLink>
                    </div>
                  </div>
                ) : null}
              </ParentCard>
            </motion.div>
          ) : null}

          {calendarEnabled ? (
            <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp}>
              <ParentCard theme={theme}>
                <ParentSectionKicker theme={theme}>Coming up</ParentSectionKicker>
                <h3
                  className="mb-4 text-base font-semibold"
                  style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                >
                  At a glance
                </h3>
                {summary.upcomingEvents.length === 0 ? (
                  <p
                    className="mb-0 text-[13px] leading-relaxed"
                    style={{ color: "#65747A" }}
                  >
                    No upcoming events yet. School events will show up here.
                  </p>
                ) : (
                  <p
                    className="mb-0 text-[13px] leading-relaxed"
                    style={{ color: "#65747A" }}
                  >
                    {summary.upcomingEvents.map((event, index) => {
                      const dateLabel = parseEventDate(event.date).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" },
                      );
                      return (
                        <span key={event.id}>
                          {index > 0 ? <br /> : null}
                          {dateLabel} · {event.title}
                        </span>
                      );
                    })}
                  </p>
                )}
                <div className="mt-4">
                  <ParentTextLink theme={theme} href={calendarHref}>
                    View full calendar
                  </ParentTextLink>
                </div>
              </ParentCard>
            </motion.div>
          ) : null}
        </div>

        {summary.quickActions.length > 0 ? (
          <motion.div custom={7} initial="hidden" animate="visible" variants={fadeUp}>
            <ParentCard theme={theme} className="!p-0">
              <AdminQuickActionsCard theme={theme} actions={quickActionsForAdminCard} />
            </ParentCard>
          </motion.div>
        ) : null}

        <p className="text-xs" style={{ color: theme.muted }}>
          Need access changes? Contact your school administrator.
        </p>
      </div>
    </div>
  );
}
