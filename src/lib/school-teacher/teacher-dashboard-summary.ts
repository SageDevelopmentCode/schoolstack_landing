import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listStaffClassroomsForTeacher,
  type StaffClassroomOption,
} from "@/lib/school-admin/classrooms";
import {
  listAssignedEnrolledStudents,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import { greetingParts } from "@/lib/school-admin/dashboard-summary";
import { getTeacherMessagesUnreadCount } from "@/lib/messages/unread-count-api";
import { schoolTeacherPath } from "@/lib/organization-settings/teacher-routes";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import { dateKey } from "@/lib/committees/calendar-utils";
import {
  listUpcomingEventsForOrg,
} from "@/lib/school-events/events";
import { formatEventTimeRange } from "@/lib/school-events/calendar-time";
import type { OrganizationEvent } from "@/lib/school-events/types";
import type { BulletinPost } from "@/lib/school-bulletin/types";
import { loadHomeBulletinPosts } from "@/lib/school-bulletin/posts";
import { getStaffMemberIdForUser } from "@/lib/staff/teacher-portal-access";
import {
  listClassroomSignupResponsesBySignupIds,
  listTeacherClassroomSignups,
} from "@/lib/classroom-signups/load-teacher-signups";
import { computeSignupMetrics } from "@/lib/classroom-signups/utils";
import { loadAttendanceRoster } from "@/lib/school-admin/attendance/attendance-roster";
import type {
  AttendanceRosterStudent,
  AttendanceRosterSummary,
} from "@/lib/school-admin/attendance/attendance-types";
import { reportOperationalError } from "@/lib/operational-errors";

export type TeacherDashboardFocusIcon =
  | "message"
  | "calendar"
  | "students"
  | "signups"
  | "attendance";

export type TeacherDashboardFocusItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: TeacherDashboardFocusIcon;
};

export type TeacherDashboardSummary = {
  focusItems: TeacherDashboardFocusItem[];
  assignedStudents: AdminEnrolledStudentSummary[];
  upcomingEvents: OrganizationEvent[];
  messagesUnreadCount: number;
  bulletinEnabled: boolean;
  bulletinPosts: BulletinPost[];
  staffClassrooms: StaffClassroomOption[];
  staffMemberId: string | null;
  attendanceToday: {
    date: string;
    summary: AttendanceRosterSummary;
    students: AttendanceRosterStudent[];
  } | null;
};

function teacherFeatureEnabled(
  features: OrganizationFeatures,
  key: string,
): boolean {
  const teacher = features.teacher;
  if (!teacher || typeof teacher !== "object") return false;
  return Boolean((teacher as Record<string, boolean>)[key]);
}

function findEventToday(events: OrganizationEvent[]): OrganizationEvent | null {
  const todayKey = dateKey(new Date());
  return events.find((event) => event.date === todayKey) ?? null;
}

export async function fetchTeacherDashboardSummary(
  supabase: SupabaseClient,
  admin: SupabaseClient,
  organizationId: string,
  slug: string,
  features: OrganizationFeatures,
  options: {
    schoolName: string;
    userId?: string;
    staffMemberId?: string | null;
    teacherBasePath?: string;
  },
): Promise<TeacherDashboardSummary> {
  const messagesEnabled = teacherFeatureEnabled(features, "messages");
  const calendarEnabled = teacherFeatureEnabled(features, "calendar");
  const myStudentsEnabled = teacherFeatureEnabled(features, "my_students");
  const signupsEnabled = teacherFeatureEnabled(features, "classroom_signups");
  const attendanceEnabled = teacherFeatureEnabled(features, "attendance");
  const bulletinEnabled = Boolean(features.admin?.bulletin);
  const todayKey = dateKey(new Date());

  let staffMemberId = options.staffMemberId ?? null;
  if (!staffMemberId && options.userId) {
    staffMemberId = await getStaffMemberIdForUser(
      supabase,
      options.userId,
      organizationId,
    );
  }

  const [
    assignedStudents,
    upcomingEvents,
    messagesUnreadCount,
    bulletinPosts,
    staffClassrooms,
  ] = await Promise.all([
    myStudentsEnabled && staffMemberId
      ? listAssignedEnrolledStudents(supabase, organizationId, staffMemberId)
      : Promise.resolve([] as AdminEnrolledStudentSummary[]),
    calendarEnabled
      ? listUpcomingEventsForOrg(supabase, organizationId, 3)
      : Promise.resolve([] as OrganizationEvent[]),
    messagesEnabled && options.userId
      ? getTeacherMessagesUnreadCount(
          admin,
          supabase,
          organizationId,
          options.userId,
          options.schoolName,
        ).catch((err) => {
          void reportOperationalError({
            supabase: admin,
            surface: "teacher_portal",
            organizationId,
            operation: "dashboard.load_messages_unread_count",
            error:
              err instanceof Error
                ? err.message
                : "Failed to load messages unread count.",
            severity: "warning",
            notify: true,
            actor: { type: "system" },
            cause: err,
          });
          return 0;
        })
      : Promise.resolve(0),
    loadHomeBulletinPosts({
      supabase,
      signedUrlClient: admin,
      organizationId,
      bulletinEnabled,
      viewer: "teacher",
      limit: 25,
    }),
    myStudentsEnabled && staffMemberId
      ? listStaffClassroomsForTeacher(supabase, organizationId, staffMemberId)
      : Promise.resolve([] as StaffClassroomOption[]),
  ]);

  const messagesHref = options.teacherBasePath
    ? `${options.teacherBasePath}/messages`
    : schoolTeacherPath(slug, "messages");
  const calendarHref = options.teacherBasePath
    ? `${options.teacherBasePath}/calendar`
    : schoolTeacherPath(slug, "calendar");
  const myStudentsHref = options.teacherBasePath
    ? `${options.teacherBasePath}/my_students`
    : schoolTeacherPath(slug, "my_students");
  const signupsHref = options.teacherBasePath
    ? `${options.teacherBasePath}/classroom_signups`
    : schoolTeacherPath(slug, "classroom_signups");
  const attendanceHref = options.teacherBasePath
    ? `${options.teacherBasePath}/attendance`
    : schoolTeacherPath(slug, "attendance");

  const attendanceToday = attendanceEnabled
    ? await loadAttendanceRoster(admin, organizationId, todayKey)
        .then((roster) => ({
          date: roster.date,
          summary: roster.summary,
          students: roster.students,
        }))
        .catch((err) => {
          void reportOperationalError({
            supabase: admin,
            surface: "teacher_portal",
            organizationId,
            operation: "dashboard.load_attendance_roster",
            error:
              err instanceof Error
                ? err.message
                : "Failed to load today's attendance roster.",
            severity: "warning",
            notify: true,
            actor: { type: "system" },
            cause: err,
          });
          return null;
        })
    : null;

  let signups: Awaited<ReturnType<typeof listTeacherClassroomSignups>> = [];
  let responsesBySignupId: Record<string, import("@/lib/classroom-signups/types").ClassroomSignupResponse[]> = {};
  if (signupsEnabled && staffMemberId) {
    signups = await listTeacherClassroomSignups(admin, organizationId, staffMemberId);
    responsesBySignupId = await listClassroomSignupResponsesBySignupIds(
      admin,
      organizationId,
      signups.map((signup) => signup.id),
    );
  }
  const signupMetrics = computeSignupMetrics(signups, responsesBySignupId);

  const focusItems: TeacherDashboardFocusItem[] = [];

  if (messagesEnabled && messagesUnreadCount > 0) {
    focusItems.push({
      id: "unread-messages",
      icon: "message",
      title: `Reply to ${messagesUnreadCount} unread message${messagesUnreadCount === 1 ? "" : "s"}`,
      subtitle: "Families and staff are waiting on your response",
      href: messagesHref,
    });
  }

  const eventToday = calendarEnabled ? findEventToday(upcomingEvents) : null;
  if (eventToday && focusItems.length < 3) {
    focusItems.push({
      id: `event-today-${eventToday.id}`,
      icon: "calendar",
      title: `${eventToday.title} today`,
      subtitle: eventToday.isAllDay
        ? "All day"
        : formatEventTimeRange(eventToday),
      href: calendarHref,
    });
  }

  if (
    attendanceEnabled &&
    attendanceToday &&
    attendanceToday.summary.notMarkedCount > 0 &&
    focusItems.length < 3
  ) {
    const count = attendanceToday.summary.notMarkedCount;
    focusItems.push({
      id: "attendance-not-marked",
      icon: "attendance",
      title: `Mark attendance for ${count} student${count === 1 ? "" : "s"}`,
      subtitle: "Today's roster still has unmarked students",
      href: attendanceHref,
    });
  }

  if (
    signupsEnabled &&
    signupMetrics.needsAttentionCount > 0 &&
    focusItems.length < 3
  ) {
    focusItems.push({
      id: "open-signups",
      icon: "signups",
      title: `${signupMetrics.needsAttentionCount} signup${signupMetrics.needsAttentionCount === 1 ? "" : "s"} need responses`,
      subtitle: "Some slots or roles are still unfilled",
      href: signupsHref,
    });
  }

  if (
    myStudentsEnabled &&
    assignedStudents.length > 0 &&
    focusItems.length < 3
  ) {
    focusItems.push({
      id: "review-roster",
      icon: "students",
      title: "Review your student roster",
      subtitle: `${assignedStudents.length} learner${assignedStudents.length === 1 ? "" : "s"} assigned to you`,
      href: myStudentsHref,
    });
  }

  return {
    focusItems: focusItems.slice(0, 3),
    assignedStudents,
    upcomingEvents,
    messagesUnreadCount,
    bulletinEnabled,
    bulletinPosts,
    staffClassrooms,
    staffMemberId,
    attendanceToday,
  };
}

export { greetingParts };
