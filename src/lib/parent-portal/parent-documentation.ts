import { getParentOnboardingItems } from "@/lib/organization-settings/parent-onboarding";
import {
  isParentFeatureEnabled,
  isParentNavPathEnabled,
  schoolParentPath,
  schoolParentRootPath,
  schoolProgramParentPath,
} from "@/lib/organization-settings/parent-routes";
import type { OrganizationFeatures, ParentFeatures } from "@/lib/organization-settings/types";

export type ParentDocPortalScope = "any" | "main" | "coop";

export type ParentDocGuideStep = {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
};

export type ParentDocGuide = {
  id: string;
  title: string;
  category: string;
  summary: string;
  keywords: string[];
  steps: ParentDocGuideStep[];
  portalScope?: ParentDocPortalScope;
  requiredFeatures?: {
    parent?: Partial<ParentFeatures>;
    parentPath?: { feature: string; subtab?: string };
  };
};

export type ParentDocumentationContext = {
  slug: string;
  features: OrganizationFeatures;
  coopModeEnabled: boolean;
  bulletinEnabled?: boolean;
  programSlug?: string;
  parentNavBasePath?: string;
  previewBasePath?: string;
};

type ParentDocActionPath =
  | { feature: string; subtab?: string; query?: string }
  | { route: "notifications" }
  | { route: "apply" };

type ParentDocGuideTemplate = Omit<ParentDocGuide, "steps"> & {
  requiresOnboarding?: boolean;
  requiresBulletin?: boolean;
  steps: Array<{
    title: string;
    description: string;
    action?: {
      label: string;
      path: ParentDocActionPath;
    };
  }>;
};

function buildGuideTemplates(): ParentDocGuideTemplate[] {
  return [
    {
      id: "review-home-dashboard",
      title: "Review your home dashboard",
      category: "Getting started",
      summary:
        "Your home page shows what needs attention, upcoming events, and quick links to key areas.",
      keywords: ["home", "dashboard", "portal", "start"],
      portalScope: "any",
      requiredFeatures: { parent: { portal: true } },
      steps: [
        {
          title: "Open your home page",
          description:
            "The home page is your starting point each time you sign in to the parent portal.",
          action: {
            label: "Go to home",
            path: { feature: "portal" },
          },
        },
        {
          title: "Check Start here",
          description:
            "The Start here card highlights action items like onboarding tasks, enrollment steps, and classroom sign-ups.",
        },
        {
          title: "Browse upcoming events",
          description:
            "The events card shows what's coming up on the school calendar for your family.",
        },
      ],
    },
    {
      id: "complete-onboarding-todos",
      title: "Complete today's to-dos",
      category: "Getting started",
      summary:
        "Work through your onboarding checklist so your family is set up for the school year.",
      keywords: ["onboarding", "to-do", "checklist", "setup"],
      portalScope: "any",
      requiresOnboarding: true,
      requiredFeatures: { parent: { portal: true } },
      steps: [
        {
          title: "Open your to-do list",
          description:
            "From the home page, tap Review today's to-dos in the Start here card.",
          action: {
            label: "Go to home",
            path: { feature: "portal" },
          },
        },
        {
          title: "Complete each item",
          description:
            "Follow the links for billing, messages, health forms, and other setup tasks your school has configured.",
        },
        {
          title: "Check back as items are added",
          description:
            "Your school may add new onboarding steps throughout the year.",
        },
      ],
    },
    {
      id: "sign-enrollment-agreement",
      title: "Sign your enrollment agreement",
      category: "Getting started",
      summary:
        "Review and sign enrollment agreements when your school sends them for your child.",
      keywords: ["enrollment", "agreement", "sign", "contract", "e-sign"],
      portalScope: "any",
      requiredFeatures: { parent: { portal: true } },
      steps: [
        {
          title: "Open your apply dashboard",
          description:
            "Click your name in the header, then choose Your applications to open your apply dashboard.",
          action: {
            label: "Open apply dashboard",
            path: { route: "apply" },
          },
        },
        {
          title: "Open the enrollment page",
          description:
            "Find your child's application and open the enrollment page. Urgent agreement alerts on your home page Start here card link here too.",
        },
        {
          title: "Review, sign, and submit",
          description:
            "Read the agreement terms, complete any required fields, and submit the signed agreement so enrollment can continue.",
        },
      ],
    },
    {
      id: "read-school-bulletin",
      title: "Read school bulletin updates",
      category: "Getting started",
      summary:
        "Catch up on school announcements, flyers, and attachments posted by your school.",
      keywords: ["bulletin", "announcements", "updates", "school news", "flyer"],
      portalScope: "any",
      requiresBulletin: true,
      requiredFeatures: { parent: { portal: true } },
      steps: [
        {
          title: "Open school updates on home",
          description:
            "Recent bulletin posts appear at the top of your home page when your school publishes them.",
          action: {
            label: "Go to home",
            path: { feature: "portal" },
          },
        },
        {
          title: "Browse posts and attachments",
          description:
            "Tap a post to read the full message and open any linked images or files.",
        },
        {
          title: "Check your notification center",
          description:
            "New bulletin posts also appear in the bell icon so you can catch up later.",
        },
      ],
    },
    {
      id: "check-notification-center",
      title: "Check your notification center",
      category: "Notifications",
      summary:
        "See recent messages, bulletin posts, calendar reminders, and enrollment updates in one place.",
      keywords: ["notifications", "bell", "alerts", "updates", "activity"],
      portalScope: "any",
      requiredFeatures: { parent: { portal: true } },
      steps: [
        {
          title: "Open the bell icon",
          description:
            "Tap the bell in the header to open your notification center from any page.",
          action: {
            label: "Go to home",
            path: { feature: "portal" },
          },
        },
        {
          title: "Review recent activity",
          description:
            "Scroll through updates from the last 30 days, grouped by type.",
        },
        {
          title: "Jump to the source",
          description:
            "Tap a notification to open the related message, event, bulletin post, or enrollment task.",
        },
      ],
    },
    {
      id: "manage-notification-settings",
      title: "Manage email notification preferences",
      category: "Account",
      summary:
        "Choose which email addresses receive portal notifications for your family.",
      keywords: ["email", "notifications", "settings", "preferences", "account"],
      portalScope: "any",
      requiredFeatures: { parent: { portal: true } },
      steps: [
        {
          title: "Open your profile menu",
          description:
            "Click your name in the header to open account options.",
        },
        {
          title: "Go to Notification settings",
          description:
            "Choose Notification settings to manage where your family receives email alerts.",
          action: {
            label: "Open notification settings",
            path: { route: "notifications" },
          },
        },
        {
          title: "Save your changes",
          description:
            "Add or remove notification emails, then save. Your login email is included by default.",
        },
      ],
    },
    {
      id: "open-apply-dashboard",
      title: "Open your apply dashboard",
      category: "Applications",
      summary:
        "View application status, continue drafts, and access enrollment checklists for your family.",
      keywords: ["apply", "application", "dashboard", "enrollment", "checklist", "admissions"],
      portalScope: "any",
      requiredFeatures: { parent: { portal: true } },
      steps: [
        {
          title: "Open your profile menu",
          description:
            "Click your name or avatar in the header to open account options.",
        },
        {
          title: "Choose Your applications",
          description:
            "Select Your applications to open your family's apply dashboard.",
          action: {
            label: "Open apply dashboard",
            path: { route: "apply" },
          },
        },
        {
          title: "Open an application card",
          description:
            "View application status, continue a draft, or start or continue enrollment for checklist items and agreements.",
        },
      ],
    },
    {
      id: "view-pay-invoices",
      title: "View and pay invoices",
      category: "Billing",
      summary: "See outstanding tuition and fees and pay online when your school accepts payments.",
      keywords: ["billing", "tuition", "invoice", "payment", "pay"],
      portalScope: "any",
      requiredFeatures: { parent: { billing: true } },
      steps: [
        {
          title: "Open Billing",
          description: "View your family's invoices, payment history, and account balance.",
          action: {
            label: "Open Billing",
            path: { feature: "billing" },
          },
        },
        {
          title: "Select an invoice",
          description: "Tap an open invoice to see line items and payment options.",
        },
        {
          title: "Pay online",
          description:
            "If your school has online payments enabled, you can pay directly from the invoice.",
        },
      ],
    },
    {
      id: "setup-tuition-payment-schedule",
      title: "Set up your tuition payment schedule",
      category: "Billing",
      summary:
        "Confirm how and when your family will pay tuition when a payment schedule is required.",
      keywords: ["billing", "tuition", "schedule", "payment plan", "setup"],
      portalScope: "any",
      requiredFeatures: { parent: { billing: true } },
      steps: [
        {
          title: "Open Billing",
          description:
            "If your school requires a schedule, Billing shows Schedule needed on the summary tab.",
          action: {
            label: "Open Billing",
            path: { feature: "billing" },
          },
        },
        {
          title: "Review each child's plan",
          description:
            "Select a child to see tuition details and confirm the payment schedule your school offers.",
        },
        {
          title: "Confirm your schedule",
          description:
            "Follow the prompts to choose due dates and payment methods so future invoices can be generated.",
        },
      ],
    },
    {
      id: "send-message-to-school",
      title: "Send a message to the school",
      category: "Messages",
      summary: "Reach teachers and staff through the parent portal messaging inbox.",
      keywords: ["messages", "inbox", "contact", "teacher", "email"],
      portalScope: "any",
      requiredFeatures: { parent: { messages: true } },
      steps: [
        {
          title: "Open Messages",
          description: "Your inbox shows conversations with the school and other families.",
          action: {
            label: "Open Messages",
            path: { feature: "messages" },
          },
        },
        {
          title: "Start a new conversation",
          description: "Use the compose button to message teachers, staff, or school groups.",
        },
        {
          title: "Reply to existing threads",
          description: "Tap any conversation to read and respond to messages.",
        },
      ],
    },
    {
      id: "view-family-calendar",
      title: "View your family calendar",
      category: "Calendar",
      summary: "See school events, deadlines, and activities on your family calendar.",
      keywords: ["calendar", "events", "schedule", "dates"],
      portalScope: "any",
      requiredFeatures: { parent: { calendar: true } },
      steps: [
        {
          title: "Open Calendar",
          description: "Browse upcoming events by month or list view.",
          action: {
            label: "Open Calendar",
            path: { feature: "calendar" },
          },
        },
        {
          title: "Check event details",
          description: "Tap an event to see the time, location, and any notes from the school.",
        },
        {
          title: "Use the home page shortcut",
          description:
            "The home page also shows your next upcoming event with a link to the full calendar.",
        },
      ],
    },
    {
      id: "update-student-health",
      title: "Update student health info",
      category: "Your children",
      summary: "Keep health records, allergies, and emergency contacts up to date for each child.",
      keywords: ["children", "health", "allergies", "medical", "emergency"],
      portalScope: "any",
      requiredFeatures: { parent: { children: true } },
      steps: [
        {
          title: "Open Your children",
          description: "Select the child whose records you want to update.",
          action: {
            label: "Open children",
            path: { feature: "children" },
          },
        },
        {
          title: "Go to the Health section",
          description:
            "Open a child's profile and navigate to the Health tab to update medical information.",
        },
        {
          title: "Save your changes",
          description:
            "Make sure to save after updating allergies, medications, or emergency contacts.",
        },
      ],
    },
    {
      id: "complete-enrollment-checklist",
      title: "Complete your enrollment checklist",
      category: "Applications",
      summary:
        "Work through required enrollment forms and documents for each child after acceptance.",
      keywords: ["enrollment", "checklist", "forms", "documents", "tasks"],
      portalScope: "any",
      requiredFeatures: { parent: { portal: true } },
      steps: [
        {
          title: "Open your apply dashboard",
          description:
            "Click your name in the header, then choose Your applications to open your apply dashboard.",
          action: {
            label: "Open apply dashboard",
            path: { route: "apply" },
          },
        },
        {
          title: "Start or continue enrollment",
          description:
            "Find your child's application and tap Start enrollment or Continue enrollment.",
        },
        {
          title: "Complete each checklist item",
          description:
            "Work through forms, uploads, and any required agreement on the enrollment page.",
        },
      ],
    },
    {
      id: "join-committee",
      title: "Join a committee workspace",
      category: "Committees",
      summary: "Participate in school committees, view tasks, and collaborate with other parents.",
      keywords: ["committee", "volunteer", "workspace", "tasks"],
      portalScope: "any",
      requiredFeatures: { parent: { committees: true } },
      steps: [
        {
          title: "Open Committees",
          description: "See committees you belong to and any open invitations.",
          action: {
            label: "Open Committees",
            path: { feature: "committees" },
          },
        },
        {
          title: "Accept an invitation",
          description: "If you've been invited, accept to join the committee workspace.",
        },
        {
          title: "View tasks and updates",
          description: "Check the committee board for assigned tasks and shared documents.",
        },
      ],
    },
    {
      id: "classroom-signup",
      title: "Sign up to help in the classroom",
      category: "Classroom",
      summary: "Volunteer for classroom activities and sign up for available slots.",
      keywords: ["classroom", "volunteer", "signup", "help"],
      portalScope: "any",
      requiredFeatures: { parent: { classroom_signups: true } },
      steps: [
        {
          title: "Check Start here on home",
          description:
            "Open classroom sign-up opportunities from the Start here card on your home page.",
          action: {
            label: "Go to home",
            path: { feature: "portal" },
          },
        },
        {
          title: "Pick a slot",
          description: "Browse available dates and times, then reserve a spot that works for you.",
        },
        {
          title: "Manage your sign-ups",
          description: "Return to the sign-up page to view or change your reservations.",
        },
      ],
    },
    {
      id: "browse-curriculum-guides",
      title: "Browse curriculum guides",
      category: "Co-op",
      summary: "Access co-op curriculum documents and discussion threads for your program.",
      keywords: ["curriculum", "guides", "co-op", "documents", "pdf"],
      portalScope: "coop",
      requiredFeatures: { parent: { curriculum: true } },
      steps: [
        {
          title: "Open Curriculum",
          description: "View curriculum guides organized by topic or week.",
          action: {
            label: "Open Curriculum",
            path: { feature: "curriculum" },
          },
        },
        {
          title: "Read a guide",
          description: "Select a guide from the sidebar to open the document or discussion.",
        },
        {
          title: "Join the discussion",
          description: "Some guides include a general discussion thread for co-op families.",
        },
      ],
    },
    {
      id: "view-supply-list",
      title: "View your supply list",
      category: "Co-op",
      summary: "See required supplies for your co-op program and track what you've gathered.",
      keywords: ["supply", "list", "co-op", "materials", "shopping"],
      portalScope: "coop",
      requiredFeatures: { parent: { supply_list: true } },
      steps: [
        {
          title: "Open Supply list",
          description: "Browse items organized by category or student.",
          action: {
            label: "Open Supply list",
            path: { feature: "supply_list" },
          },
        },
        {
          title: "Review required items",
          description: "Check quantities, notes, and any links to purchase items.",
        },
        {
          title: "Track your progress",
          description: "Mark items as you collect them so your family stays on track.",
        },
      ],
    },
    {
      id: "check-teaching-schedule",
      title: "Check the teaching schedule",
      category: "Co-op",
      summary: "See who is teaching each week and view your family's assigned teaching days.",
      keywords: ["teaching", "schedule", "co-op", "rotation", "assignments"],
      portalScope: "coop",
      requiredFeatures: { parent: { teaching_schedule: true } },
      steps: [
        {
          title: "Open Teaching schedule",
          description: "View the co-op teaching rotation for the school year.",
          action: {
            label: "Open Teaching schedule",
            path: { feature: "teaching_schedule" },
          },
        },
        {
          title: "Find your family's weeks",
          description: "Look for your family name on assigned teaching dates.",
        },
        {
          title: "Plan ahead",
          description: "Use the schedule to prepare for upcoming teaching responsibilities.",
        },
      ],
    },
    {
      id: "connect-coop-families",
      title: "Connect with other co-op families",
      category: "Co-op",
      summary: "See other families in your co-op and send messages to stay connected.",
      keywords: ["co-op", "families", "directory", "message", "community"],
      portalScope: "coop",
      requiredFeatures: { parent: { messages: true } },
      steps: [
        {
          title: "Scroll to your co-op section",
          description:
            "On the home page, find See who else is in your co-op below your children.",
          action: {
            label: "Go to home",
            path: { feature: "portal" },
          },
        },
        {
          title: "Browse co-op families",
          description: "View other enrolled families and their learners in your program.",
        },
        {
          title: "Send a message",
          description: "Use the message button next to a family to start a conversation.",
        },
      ],
    },
    {
      id: "switch-portal-context",
      title: "Switch between school and program portal",
      category: "Co-op",
      summary:
        "Move between your school's main parent portal and your co-op program portal.",
      keywords: ["switch", "portal", "program", "co-op", "context"],
      portalScope: "coop",
      steps: [
        {
          title: "Open the portal switcher",
          description:
            "Use the menu in the header to see your available portals.",
        },
        {
          title: "Select a portal",
          description:
            "Choose the main school portal or your co-op program portal depending on what you need.",
        },
        {
          title: "Each portal has its own home",
          description:
            "Program portals show co-op-specific features like curriculum, supply lists, and teaching schedules.",
        },
      ],
    },
  ];
}

export function resolveParentActionHref(
  context: ParentDocumentationContext,
  path: ParentDocActionPath,
): string {
  const { slug, programSlug, parentNavBasePath, previewBasePath } = context;

  if ("route" in path) {
    if (path.route === "notifications") {
      if (previewBasePath) {
        return `${previewBasePath}/parent/notifications`;
      }
      return `${schoolParentRootPath(slug)}/notifications`;
    }
    if (path.route === "apply") {
      if (previewBasePath) {
        return `${previewBasePath}/apply`;
      }
      return `/school/${slug}/apply`;
    }
  }

  let base: string;
  if (previewBasePath) {
    if (programSlug) {
      base = path.subtab
        ? `${previewBasePath}/parent/p/${programSlug}/${path.feature}/${path.subtab}`
        : `${previewBasePath}/parent/p/${programSlug}/${path.feature}`;
    } else {
      base = path.subtab
        ? `${previewBasePath}/parent/${path.feature}/${path.subtab}`
        : `${previewBasePath}/parent/${path.feature}`;
    }
  } else if (parentNavBasePath) {
    base = path.subtab
      ? `${parentNavBasePath}/${path.feature}/${path.subtab}`
      : `${parentNavBasePath}/${path.feature}`;
  } else if (programSlug) {
    base = schoolProgramParentPath(slug, programSlug, path.feature, path.subtab);
  } else {
    base = schoolParentPath(slug, path.feature, path.subtab);
  }

  if (path.query) {
    return `${base}?${path.query}`;
  }
  return base;
}

function isPortalScopeEnabled(
  portalScope: ParentDocPortalScope | undefined,
  coopModeEnabled: boolean,
): boolean {
  const scope = portalScope ?? "any";
  if (scope === "any") return true;
  if (scope === "coop") return coopModeEnabled;
  if (scope === "main") return !coopModeEnabled;
  return true;
}

function isGuideEnabled(
  context: ParentDocumentationContext,
  guide: ParentDocGuideTemplate,
): boolean {
  if (!isPortalScopeEnabled(guide.portalScope, context.coopModeEnabled)) {
    return false;
  }

  if (guide.requiresOnboarding) {
    const items = getParentOnboardingItems(context.features);
    if (items.length === 0) {
      return false;
    }
  }

  if (guide.requiresBulletin && !context.bulletinEnabled) {
    return false;
  }

  const required = guide.requiredFeatures;
  if (!required) return true;

  if (required.parent) {
    for (const [key, enabled] of Object.entries(required.parent)) {
      if (!enabled) continue;
      if (!isParentFeatureEnabled(context.features, key)) {
        return false;
      }
    }
  }

  if (required.parentPath) {
    const { feature, subtab } = required.parentPath;
    if (!isParentNavPathEnabled(context.features, feature, subtab)) {
      return false;
    }
  }

  return true;
}

export function buildParentDocumentationGuides(
  context: ParentDocumentationContext,
): ParentDocGuide[] {
  const templates = buildGuideTemplates();

  return templates
    .filter((guide) => isGuideEnabled(context, guide))
    .map((guide) => ({
      id: guide.id,
      title: guide.title,
      category: guide.category,
      summary: guide.summary,
      keywords: guide.keywords,
      portalScope: guide.portalScope,
      requiredFeatures: guide.requiredFeatures,
      steps: guide.steps.map((step) => ({
        title: step.title,
        description: step.description,
        action: step.action
          ? {
              label: step.action.label,
              href: resolveParentActionHref(context, step.action.path),
            }
          : undefined,
      })),
    }));
}

export function groupParentDocumentationByCategory(
  guides: ParentDocGuide[],
): Array<{ category: string; guides: ParentDocGuide[] }> {
  const order: string[] = [];
  const map = new Map<string, ParentDocGuide[]>();

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
