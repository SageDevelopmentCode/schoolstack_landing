import {
  isTeacherFeatureEnabled,
  isTeacherNavPathEnabled,
  schoolTeacherPath,
} from "@/lib/organization-settings/teacher-routes";
import type { OrganizationFeatures, TeacherFeatures } from "@/lib/organization-settings/types";

export type TeacherDocGuideStep = {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
};

export type TeacherDocGuide = {
  id: string;
  title: string;
  category: string;
  summary: string;
  keywords: string[];
  steps: TeacherDocGuideStep[];
  requiredFeatures?: {
    teacher?: Partial<TeacherFeatures>;
    teacherPath?: { feature: string; subtab?: string };
  };
};

export type TeacherDocumentationContext = {
  slug: string;
  features: OrganizationFeatures;
  bulletinEnabled?: boolean;
  teacherBasePath?: string;
};

type TeacherDocActionPath = {
  feature: string;
  subtab?: string;
  query?: string;
};

type TeacherDocGuideTemplate = Omit<TeacherDocGuide, "steps"> & {
  requiresBulletin?: boolean;
  steps: Array<{
    title: string;
    description: string;
    action?: {
      label: string;
      path: TeacherDocActionPath;
    };
  }>;
};

function resolveTeacherActionHref(
  context: TeacherDocumentationContext,
  path: TeacherDocActionPath,
): string {
  const base = context.teacherBasePath
    ? `${context.teacherBasePath}/${path.feature}${path.subtab ? `/${path.subtab}` : ""}`
    : schoolTeacherPath(context.slug, path.feature, path.subtab);

  return path.query ? `${base}?${path.query}` : base;
}

function buildGuideTemplates(): TeacherDocGuideTemplate[] {
  return [
    {
      id: "review-teacher-dashboard",
      title: "Review your teacher dashboard",
      category: "Getting started",
      summary:
        "Your dashboard shows what needs attention, your classrooms, assigned students, and school updates.",
      keywords: ["dashboard", "home", "overview", "start"],
      requiredFeatures: { teacher: { dashboard: true } },
      steps: [
        {
          title: "Open your dashboard",
          description:
            "The dashboard is your home base each time you sign in to the staff portal.",
          action: {
            label: "Go to dashboard",
            path: { feature: "dashboard" },
          },
        },
        {
          title: "Check Start here",
          description:
            "The Start here card highlights unread messages, today's events, open sign-ups, and other tasks that need your attention.",
        },
        {
          title: "Browse your classrooms and students",
          description:
            "Scroll down to see your assigned classrooms and student cards with quick links to rosters and profiles.",
        },
      ],
    },
    {
      id: "check-start-here-tasks",
      title: "Check Start here tasks",
      category: "Getting started",
      summary:
        "Work through the focus items at the top of your dashboard so nothing important is missed.",
      keywords: ["start here", "tasks", "attention", "focus"],
      requiredFeatures: { teacher: { dashboard: true } },
      steps: [
        {
          title: "Open your dashboard",
          description:
            "Focus items appear in the Start here card when you have unread messages, events today, or sign-ups needing responses.",
          action: {
            label: "Go to dashboard",
            path: { feature: "dashboard" },
          },
        },
        {
          title: "Tap a focus item",
          description:
            "Each item links directly to the relevant page — messages, calendar, sign-ups, or your student roster.",
        },
      ],
    },
    {
      id: "read-school-bulletin",
      title: "Read school bulletin updates",
      category: "Getting started",
      summary:
        "School-wide announcements and flyers are posted in the bulletin for staff and families.",
      keywords: ["bulletin", "announcements", "updates", "news"],
      requiresBulletin: true,
      requiredFeatures: { teacher: { dashboard: true } },
      steps: [
        {
          title: "Open the School Bulletin",
          description:
            "Tap the School Bulletin button in the top-right of your dashboard to browse recent posts.",
          action: {
            label: "Go to dashboard",
            path: { feature: "dashboard" },
          },
        },
        {
          title: "Read a post",
          description:
            "Select any announcement to read the full message and view attached images or PDFs.",
        },
      ],
    },
    {
      id: "review-assigned-students",
      title: "Review your assigned students",
      category: "Your students",
      summary:
        "See every learner assigned to you, with grade, program, and classroom details.",
      keywords: ["students", "roster", "assigned", "learners"],
      requiredFeatures: {
        teacher: { my_students: true },
        teacherPath: { feature: "my_students" },
      },
      steps: [
        {
          title: "Open My Students",
          description:
            "Your full roster lists all students assigned to you, with search and program filters.",
          action: {
            label: "Open My Students",
            path: { feature: "my_students" },
          },
        },
        {
          title: "Click a student row",
          description:
            "Open a student's profile to see enrollment details, family contact info, and health records.",
        },
      ],
    },
    {
      id: "browse-students-by-classroom",
      title: "Browse students by classroom",
      category: "Your students",
      summary:
        "Filter your roster by classroom group when you teach multiple classes.",
      keywords: ["classroom", "group", "filter", "roster"],
      requiredFeatures: {
        teacher: { my_students: true },
        teacherPath: { feature: "my_students" },
      },
      steps: [
        {
          title: "Open My Students",
          description:
            "Make sure you are on the My students tab (not All students).",
          action: {
            label: "Open My Students",
            path: { feature: "my_students" },
          },
        },
        {
          title: "Use classroom filter pills",
          description:
            "Tap a classroom name — like Goated Class — to show only students in that group. Use All groups to reset.",
        },
        {
          title: "Or start from your dashboard",
          description:
            "On the dashboard, tap View students on a classroom card to open the filtered roster.",
        },
      ],
    },
    {
      id: "open-student-profile",
      title: "Open a student profile",
      category: "Your students",
      summary:
        "View a student's enrollment, family contacts, and health information from the roster or dashboard.",
      keywords: ["profile", "student", "details", "health"],
      requiredFeatures: {
        teacher: { my_students: true },
        teacherPath: { feature: "my_students" },
      },
      steps: [
        {
          title: "Find the student",
          description:
            "Open My Students or tap View profile on a student card from your dashboard.",
          action: {
            label: "Open My Students",
            path: { feature: "my_students" },
          },
        },
        {
          title: "Open the profile panel",
          description:
            "Click a student row or card to open the side panel with Overview, Family, and Health tabs.",
        },
      ],
    },
    {
      id: "check-messages-inbox",
      title: "Check your inbox",
      category: "Messages",
      summary:
        "See unread messages from families and staff in one place.",
      keywords: ["messages", "inbox", "unread", "email"],
      requiredFeatures: {
        teacher: { messages: true },
        teacherPath: { feature: "messages" },
      },
      steps: [
        {
          title: "Open Messages",
          description:
            "Your inbox shows conversations with families and other staff members at your school.",
          action: {
            label: "Open Messages",
            path: { feature: "messages" },
          },
        },
        {
          title: "Check unread threads",
          description:
            "Unread conversations are highlighted. Your dashboard Start here card also shows a count when messages need a reply.",
        },
      ],
    },
    {
      id: "reply-to-family-message",
      title: "Reply to a family message",
      category: "Messages",
      summary:
        "Respond to a parent or guardian directly from the messages inbox.",
      keywords: ["reply", "message", "family", "parent"],
      requiredFeatures: {
        teacher: { messages: true },
        teacherPath: { feature: "messages" },
      },
      steps: [
        {
          title: "Open the conversation",
          description:
            "Select a thread from your inbox to read the full message history.",
          action: {
            label: "Open Messages",
            path: { feature: "messages" },
          },
        },
        {
          title: "Write and send your reply",
          description:
            "Type your response in the message box and send. Families receive your reply in their parent portal.",
        },
      ],
    },
    {
      id: "view-upcoming-events",
      title: "View upcoming school events",
      category: "Calendar",
      summary:
        "See what's coming up on the school calendar for planning and classroom prep.",
      keywords: ["calendar", "events", "schedule", "upcoming"],
      requiredFeatures: {
        teacher: { calendar: true },
        teacherPath: { feature: "calendar" },
      },
      steps: [
        {
          title: "Open Calendar",
          description:
            "Browse the school calendar by month, week, or day to see all scheduled events.",
          action: {
            label: "Open Calendar",
            path: { feature: "calendar" },
          },
        },
        {
          title: "Click an event",
          description:
            "Select any event to see the date, time, location, and description.",
        },
      ],
    },
    {
      id: "see-todays-schedule",
      title: "See what's on today",
      category: "Calendar",
      summary:
        "Quickly check today's events from your dashboard or the calendar.",
      keywords: ["today", "schedule", "events", "calendar"],
      requiredFeatures: {
        teacher: { calendar: true },
        teacherPath: { feature: "calendar" },
      },
      steps: [
        {
          title: "Check your dashboard",
          description:
            "Today's events appear in the Classroom snapshot sidebar and in Start here when something is scheduled for today.",
          action: {
            label: "Go to dashboard",
            path: { feature: "dashboard" },
          },
        },
        {
          title: "Open the full calendar",
          description:
            "For the complete day view, open Calendar and switch to day or week view.",
          action: {
            label: "Open Calendar",
            path: { feature: "calendar" },
          },
        },
      ],
    },
    {
      id: "review-signup-sheets",
      title: "Review open signup sheets",
      category: "Classroom signups",
      summary:
        "See volunteer sign-up sheets for classroom events and track who has signed up.",
      keywords: ["signups", "volunteer", "classroom", "events"],
      requiredFeatures: {
        teacher: { classroom_signups: true },
        teacherPath: { feature: "classroom_signups" },
      },
      steps: [
        {
          title: "Open Classroom signups",
          description:
            "Your sign-up sheets list open and past volunteer requests for your classrooms.",
          action: {
            label: "Open Classroom signups",
            path: { feature: "classroom_signups" },
          },
        },
        {
          title: "Open a signup sheet",
          description:
            "Click a sheet to see slots, roles, and which families have volunteered.",
        },
      ],
    },
    {
      id: "follow-up-unfilled-slots",
      title: "Follow up on unfilled slots",
      category: "Classroom signups",
      summary:
        "Identify sign-up sheets that still need volunteers and send reminders to families.",
      keywords: ["unfilled", "slots", "volunteer", "reminder"],
      requiredFeatures: {
        teacher: { classroom_signups: true },
        teacherPath: { feature: "classroom_signups" },
      },
      steps: [
        {
          title: "Check your dashboard",
          description:
            "Start here highlights sign-up sheets with open slots that need attention.",
          action: {
            label: "Go to dashboard",
            path: { feature: "dashboard" },
          },
        },
        {
          title: "Review open slots",
          description:
            "Open the signup sheet and note which roles or time slots are still empty.",
        },
        {
          title: "Message families",
          description:
            "Use Messages to reach out to parents who haven't signed up yet.",
          action: {
            label: "Open Messages",
            path: { feature: "messages" },
          },
        },
      ],
    },
  ];
}

function isGuideEnabled(
  context: TeacherDocumentationContext,
  guide: TeacherDocGuideTemplate,
): boolean {
  if (guide.requiresBulletin && !context.bulletinEnabled) {
    return false;
  }

  const required = guide.requiredFeatures;
  if (!required) return true;

  if (required.teacher) {
    for (const [key, enabled] of Object.entries(required.teacher)) {
      if (!enabled) continue;
      if (!isTeacherFeatureEnabled(context.features, key)) {
        return false;
      }
    }
  }

  if (required.teacherPath) {
    const { feature } = required.teacherPath;
    if (!isTeacherNavPathEnabled(context.features, feature)) {
      return false;
    }
  }

  return true;
}

export function buildTeacherDocumentationGuides(
  context: TeacherDocumentationContext,
): TeacherDocGuide[] {
  const templates = buildGuideTemplates();

  return templates
    .filter((guide) => isGuideEnabled(context, guide))
    .map((guide) => ({
      id: guide.id,
      title: guide.title,
      category: guide.category,
      summary: guide.summary,
      keywords: guide.keywords,
      requiredFeatures: guide.requiredFeatures,
      steps: guide.steps.map((step) => ({
        title: step.title,
        description: step.description,
        action: step.action
          ? {
              label: step.action.label,
              href: resolveTeacherActionHref(context, step.action.path),
            }
          : undefined,
      })),
    }));
}

export function groupTeacherDocumentationByCategory(
  guides: TeacherDocGuide[],
): Array<{ category: string; guides: TeacherDocGuide[] }> {
  const order: string[] = [];
  const map = new Map<string, TeacherDocGuide[]>();

  for (const guide of guides) {
    if (!map.has(guide.category)) {
      map.set(guide.category, []);
      order.push(guide.category);
    }
    map.get(guide.category)!.push(guide);
  }

  return order.map((category) => ({
    category,
    guides: map.get(category) ?? [],
  }));
}
