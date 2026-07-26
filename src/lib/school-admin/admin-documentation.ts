import {
  isAdminFeatureEnabled,
  isAdminNavPathEnabled,
  schoolAdminPath,
} from "@/lib/organization-settings/admin-routes";
import type { AdminFeatures, OrganizationFeatures } from "@/lib/organization-settings/types";

export type AdminDocGuideStep = {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
};

export type AdminDocGuide = {
  id: string;
  title: string;
  category: string;
  summary: string;
  keywords: string[];
  steps: AdminDocGuideStep[];
  requiredFeatures?: {
    admin?: Partial<AdminFeatures>;
    adminPath?: { feature: string; subtab?: string };
  };
};

type AdminDocGuideTemplate = Omit<AdminDocGuide, "steps"> & {
  steps: Array<{
    title: string;
    description: string;
    action?: {
      label: string;
      path: { feature: string; subtab?: string; query?: string };
    };
  }>;
};

function flowsPath(slug: string, flow: "apply" | "checklist"): string {
  return `${schoolAdminPath(slug, "admissions", "flows")}?flow=${flow}`;
}

function buildGuideTemplates(slug: string): AdminDocGuideTemplate[] {
  return [
    {
      id: "complete-setup-checklist",
      title: "Complete the admissions setup checklist",
      category: "Getting started",
      summary:
        "Walk through programs, Stripe, your apply form, enrollment checklist, and going live.",
      keywords: ["setup", "onboarding", "getting started", "dashboard"],
      steps: [
        {
          title: "Open your dashboard",
          description:
            "The setup checklist on the dashboard shows what's left before families can apply.",
          action: {
            label: "Open dashboard",
            path: { feature: "dashboard" },
          },
        },
        {
          title: "Finish each step",
          description:
            "Work through programs, payments, apply form, enrollment checklist, and submissions in order.",
        },
      ],
    },
    {
      id: "create-programs",
      title: "Create programs",
      category: "Getting started",
      summary:
        "Programs define grade levels and school years — required before apply forms and checklists.",
      keywords: ["program", "grade", "school year", "admissions"],
      requiredFeatures: {
        admin: { admissions: true },
        adminPath: { feature: "admissions", subtab: "programs" },
      },
      steps: [
        {
          title: "Go to Programs",
          description: "Create a program for each offering families can apply to.",
          action: {
            label: "Open Programs",
            path: { feature: "admissions", subtab: "programs" },
          },
        },
        {
          title: "Add program details",
          description:
            "Set the name, type, status, dates, and capacity. Save each program before linking forms.",
        },
      ],
    },
    {
      id: "build-publish-apply-form",
      title: "Build and publish your apply form",
      category: "Admissions — Apply",
      summary:
        "Create the public application families complete when they first apply.",
      keywords: ["apply form", "application form", "publish", "enrollment flows"],
      requiredFeatures: {
        admin: { admissions: true },
        adminPath: { feature: "admissions", subtab: "flows" },
      },
      steps: [
        {
          title: "Open Enrollment Flows",
          description: "Select your apply form or create one if you haven't yet.",
          action: {
            label: "Open apply form builder",
            path: { feature: "admissions", subtab: "flows", query: "flow=apply" },
          },
        },
        {
          title: "Build your steps and questions",
          description:
            "Add sections for student info, family details, and custom questions.",
        },
        {
          title: "Publish the form",
          description:
            "Publishing makes the form available on your public apply link.",
        },
      ],
    },
    {
      id: "share-apply-link",
      title: "Share your apply link",
      category: "Admissions — Apply",
      summary: "Copy the public link and share it with families.",
      keywords: ["share", "link", "apply", "website", "email"],
      requiredFeatures: {
        admin: { admissions: true },
        adminPath: { feature: "admissions", subtab: "flows" },
      },
      steps: [
        {
          title: "Publish your apply form",
          description: "The link only works after the form is published.",
        },
        {
          title: "Copy the apply link",
          description:
            "In the form editor, open Share and choose Copy apply link.",
          action: {
            label: "Open apply form",
            path: { feature: "admissions", subtab: "flows", query: "flow=apply" },
          },
        },
        {
          title: "Share with families",
          description:
            "Send the link by email, add it to your website, or post on social media.",
        },
      ],
    },
    {
      id: "configure-application-fee",
      title: "Configure an application fee",
      category: "Admissions — Apply",
      summary: "Collect an optional fee before families submit their application.",
      keywords: ["fee", "payment", "application fee", "stripe"],
      requiredFeatures: {
        admin: { admissions: true },
        adminPath: { feature: "admissions", subtab: "flows" },
      },
      steps: [
        {
          title: "Open your apply form",
          description: "Fees are configured in the apply form builder.",
          action: {
            label: "Open apply form",
            path: { feature: "admissions", subtab: "flows", query: "flow=apply" },
          },
        },
        {
          title: "Enable the application fee",
          description:
            "Set the fee label and amount. Connect Stripe under Payments if you haven't yet.",
        },
      ],
    },
    {
      id: "add-post-submit-steps",
      title: "Add post-submit steps (tour, interview, shadow day)",
      category: "Admissions — Apply",
      summary:
        "After submitting, families can book tours, interviews, or shadow days from their dashboard.",
      keywords: ["tour", "interview", "shadow day", "observation", "post-submit"],
      requiredFeatures: {
        admin: { admissions: true },
        adminPath: { feature: "admissions", subtab: "flows" },
      },
      steps: [
        {
          title: "Open your apply form",
          description: "Post-submit steps live in the apply form settings.",
          action: {
            label: "Open apply form",
            path: { feature: "admissions", subtab: "flows", query: "flow=apply" },
          },
        },
        {
          title: "Add post-submit actions",
          description:
            "Enable campus tour, family interview, or shadow/observation day scheduling.",
        },
        {
          title: "Set availability",
          description:
            "Configure open slots under Schedule or in the form's availability editors.",
          action: {
            label: "Open Schedule",
            path: { feature: "schedule" },
          },
        },
      ],
    },
    {
      id: "review-submissions",
      title: "Review application submissions",
      category: "Admissions — Submissions",
      summary: "View and filter all family applications in one place.",
      keywords: ["submissions", "applications", "review", "list"],
      requiredFeatures: {
        admin: { admissions: true },
        adminPath: { feature: "admissions", subtab: "submissions" },
      },
      steps: [
        {
          title: "Open Submissions",
          description:
            "See guardian contact info, student name, status, and enrollment progress.",
          action: {
            label: "Open Submissions",
            path: { feature: "admissions", subtab: "submissions" },
          },
        },
        {
          title: "Filter by status or form",
          description: "Use the status chips and form filter to find what you need.",
        },
        {
          title: "Open a submission",
          description:
            "Click a row to open the detail panel with overview, history, and payments.",
        },
      ],
    },
    {
      id: "accept-decline-application",
      title: "Accept or decline an application",
      category: "Admissions — Submissions",
      summary: "Move applications through your review workflow.",
      keywords: ["accept", "decline", "under review", "observation", "withdraw"],
      requiredFeatures: {
        admin: { admissions: true },
        adminPath: { feature: "admissions", subtab: "submissions" },
      },
      steps: [
        {
          title: "Open the submission",
          description: "Find the application in Submissions and open the detail panel.",
          action: {
            label: "Open Submissions",
            path: { feature: "admissions", subtab: "submissions" },
          },
        },
        {
          title: "Update status",
          description:
            "Mark under review, schedule observation, accept, decline, or withdraw as needed.",
        },
      ],
    },
    {
      id: "start-enrollment",
      title: "Start enrollment for an accepted student",
      category: "Admissions — Submissions",
      summary:
        "Send the enrollment checklist to the family after you accept their application.",
      keywords: ["start enrollment", "checklist", "accepted"],
      requiredFeatures: {
        admin: { admissions: true },
        adminPath: { feature: "admissions", subtab: "submissions" },
      },
      steps: [
        {
          title: "Accept the application",
          description: "The application must be in Accepted status first.",
          action: {
            label: "Open Submissions",
            path: { feature: "admissions", subtab: "submissions" },
          },
        },
        {
          title: "Click Start enrollment",
          description:
            "Choose checklist variants if prompted, then confirm. The family sees items on their apply dashboard.",
        },
      ],
    },
    {
      id: "mark-enrolled",
      title: "Mark a student as enrolled",
      category: "Admissions — Submissions",
      summary:
        "Unlock the full parent portal once enrollment is complete (or skip the checklist).",
      keywords: ["enrolled", "enrollment complete", "parent portal"],
      requiredFeatures: {
        admin: { admissions: true },
        adminPath: { feature: "admissions", subtab: "submissions" },
      },
      steps: [
        {
          title: "Open the accepted or enrolling submission",
          description: "Find the student in Submissions.",
          action: {
            label: "Open Submissions",
            path: { feature: "admissions", subtab: "submissions" },
          },
        },
        {
          title: "Mark as enrolled",
          description:
            "Use Mark as enrolled when the checklist is done — or to skip remaining items. This unlocks the full parent portal.",
        },
      ],
    },
    {
      id: "add-second-parent",
      title: "Add a second parent or guardian",
      category: "Admissions — Submissions",
      summary:
        "Give another parent access to the same family portal (e.g. spouse or co-guardian).",
      keywords: [
        "second parent",
        "dad",
        "mom",
        "guardian",
        "spouse",
        "portal access",
        "parent 2",
      ],
      requiredFeatures: {
        admin: { admissions: true },
        adminPath: { feature: "admissions", subtab: "submissions" },
      },
      steps: [
        {
          title: "Open the submission",
          description: "Go to Submissions and open the family's application.",
          action: {
            label: "Open Submissions",
            path: { feature: "admissions", subtab: "submissions" },
          },
        },
        {
          title: "Add parent in Family portal access",
          description:
            "On the Overview tab, click Add parent. Enter name and email — an account is created automatically.",
        },
        {
          title: "Tell them how to sign in",
          description:
            "They sign in at your apply dashboard URL with that email and the usual one-time code.",
        },
      ],
    },
    {
      id: "view-submission-payments",
      title: "View application payments",
      category: "Admissions — Submissions",
      summary: "See application fees and enrollment charges for a submission.",
      keywords: ["payments", "fees", "application fee", "enrollment payment"],
      requiredFeatures: {
        admin: { admissions: true },
        adminPath: { feature: "admissions", subtab: "submissions" },
      },
      steps: [
        {
          title: "Open the submission",
          description: "Open the detail panel for the application.",
          action: {
            label: "Open Submissions",
            path: { feature: "admissions", subtab: "submissions" },
          },
        },
        {
          title: "Open the Payments tab",
          description: "View fee status, charges, and payment history for that application.",
        },
      ],
    },
    {
      id: "build-publish-checklist",
      title: "Build and publish an enrollment checklist",
      category: "Admissions — Enrollment flows",
      summary:
        "Create the checklist families complete after you start enrollment.",
      keywords: ["checklist", "enrollment", "documents", "agreement"],
      requiredFeatures: {
        admin: { admissions: true },
        adminPath: { feature: "admissions", subtab: "flows" },
      },
      steps: [
        {
          title: "Open Enrollment Flows",
          description: "Switch to your enrollment checklist or create one.",
          action: {
            label: "Open checklist builder",
            path: { feature: "admissions", subtab: "flows", query: "flow=checklist" },
          },
        },
        {
          title: "Add checklist items",
          description:
            "Include documents, forms, uploads, payments, and acknowledgments.",
        },
        {
          title: "Publish the checklist",
          description: "Families only see published checklists when enrollment starts.",
        },
      ],
    },
    {
      id: "link-checklist-to-program",
      title: "Link a checklist to a program",
      category: "Admissions — Enrollment flows",
      summary: "Each program needs a checklist before you can start enrollment.",
      keywords: ["program", "checklist", "link"],
      requiredFeatures: {
        admin: { admissions: true },
        adminPath: { feature: "admissions", subtab: "flows" },
      },
      steps: [
        {
          title: "Open the checklist builder",
          description: "Select the enrollment checklist you want to link.",
          action: {
            label: "Open checklist builder",
            path: { feature: "admissions", subtab: "flows", query: "flow=checklist" },
          },
        },
        {
          title: "Choose the program",
          description:
            "Use the program dropdown to assign this checklist to the right program.",
        },
      ],
    },
    {
      id: "connect-stripe",
      title: "Connect Stripe for payments",
      category: "Payments",
      summary:
        "Required for application fees, enrollment payments, and tuition invoicing.",
      keywords: ["stripe", "payments", "connect", "credit card"],
      requiredFeatures: {
        admin: { admissions: true },
        adminPath: { feature: "admissions", subtab: "payments" },
      },
      steps: [
        {
          title: "Open Payments",
          description: "Start Stripe Connect onboarding from the Payments page.",
          action: {
            label: "Open Payments",
            path: { feature: "admissions", subtab: "payments" },
          },
        },
        {
          title: "Complete Stripe setup",
          description:
            "Submit business details and enable charges and payouts. Return here to confirm status.",
        },
      ],
    },
    {
      id: "set-tour-interview-availability",
      title: "Set tour and interview availability",
      category: "Schedule",
      summary: "Define when families can book campus tours and family interviews.",
      keywords: ["tour", "interview", "availability", "schedule", "slots"],
      requiredFeatures: {
        admin: { schedule: true },
        adminPath: { feature: "schedule" },
      },
      steps: [
        {
          title: "Open Schedule",
          description: "Go to the Tours & interviews tab.",
          action: {
            label: "Open Schedule",
            path: { feature: "schedule" },
          },
        },
        {
          title: "Add or edit availability slots",
          description: "Open or close time slots families can book from their dashboard.",
        },
      ],
    },
    {
      id: "set-shadow-day-availability",
      title: "Set shadow day availability",
      category: "Schedule",
      summary: "Define school days families can select for observation visits.",
      keywords: ["shadow day", "observation", "availability", "schedule"],
      requiredFeatures: {
        admin: { schedule: true },
        adminPath: { feature: "schedule" },
      },
      steps: [
        {
          title: "Open Schedule",
          description: "Go to the Shadow days tab.",
          action: {
            label: "Open Schedule",
            path: { feature: "schedule" },
          },
        },
        {
          title: "Configure observation days",
          description: "Set which days are available for whole-day shadow visits.",
        },
      ],
    },
    {
      id: "view-scheduled-visits",
      title: "View scheduled visits",
      category: "Schedule",
      summary: "See all tours, interviews, and shadow days families have booked.",
      keywords: ["visits", "scheduled", "tour", "interview", "calendar"],
      requiredFeatures: {
        admin: { schedule: true },
        adminPath: { feature: "schedule" },
      },
      steps: [
        {
          title: "Open Schedule",
          description: "Use the All visits tab to see upcoming bookings.",
          action: {
            label: "Open Schedule",
            path: { feature: "schedule" },
          },
        },
        {
          title: "Open linked submissions",
          description: "Jump to the related application from a visit when needed.",
        },
      ],
    },
    {
      id: "setup-tuition-rate-plan",
      title: "Set up a tuition rate plan",
      category: "Tuition",
      summary: "Configure rates, payment schedules, and fees for enrolled families.",
      keywords: ["tuition", "rate plan", "billing", "rates"],
      requiredFeatures: {
        admin: { my_school: true },
        adminPath: { feature: "my_school", subtab: "tuition" },
      },
      steps: [
        {
          title: "Open Tuition",
          description: "Start the setup wizard or edit an existing rate plan.",
          action: {
            label: "Open Tuition",
            path: { feature: "my_school", subtab: "tuition" },
          },
        },
        {
          title: "Complete wizard steps",
          description:
            "Set program tiers, rates, payment options, additional fees, then review and activate.",
        },
      ],
    },
    {
      id: "manage-tuition-assignments",
      title: "Manage family tuition assignments",
      category: "Tuition",
      summary: "View balances, adjust assignments, and sync enrolled students.",
      keywords: ["tuition", "families", "assignment", "balance", "billing"],
      requiredFeatures: {
        admin: { my_school: true },
        adminPath: { feature: "my_school", subtab: "tuition" },
      },
      steps: [
        {
          title: "Open Tuition",
          description: "View the Families panel for billing summaries.",
          action: {
            label: "Open Tuition",
            path: { feature: "my_school", subtab: "tuition" },
          },
        },
        {
          title: "Edit or sync assignments",
          description:
            "Adjust tiers, discounts, or sync assignments for newly enrolled students.",
        },
      ],
    },
    {
      id: "send-tuition-invoice",
      title: "Send a tuition invoice",
      category: "Tuition",
      summary: "Email an invoice so families can pay from the parent portal.",
      keywords: ["invoice", "send", "tuition", "payment", "email"],
      requiredFeatures: {
        admin: { my_school: true },
        adminPath: { feature: "my_school", subtab: "tuition" },
      },
      steps: [
        {
          title: "Open Tuition",
          description: "Find the family in the Families panel.",
          action: {
            label: "Open Tuition",
            path: { feature: "my_school", subtab: "tuition" },
          },
        },
        {
          title: "Send invoice",
          description:
            "Send an invoice email for a charge. Families pay online from their billing tab.",
        },
      ],
    },
    {
      id: "create-committee-workspace",
      title: "Create a committee workspace",
      category: "Committees",
      summary: "Set up a committee with tasks, resources, calendar, and members.",
      keywords: ["committee", "workspace", "volunteer", "create"],
      requiredFeatures: {
        admin: { committees: true },
        adminPath: { feature: "committees" },
      },
      steps: [
        {
          title: "Open Committees",
          description: "Create a new workspace from a template or blank.",
          action: {
            label: "Open Committees",
            path: { feature: "committees" },
          },
        },
        {
          title: "Configure the workspace",
          description:
            "Add about info, resources, calendar events, and tasks for members.",
        },
      ],
    },
    {
      id: "invite-committee-members",
      title: "Invite committee members",
      category: "Committees",
      summary: "Add parents or volunteers to a committee workspace.",
      keywords: ["committee", "invite", "member", "volunteer"],
      requiredFeatures: {
        admin: { committees: true },
        adminPath: { feature: "committees" },
      },
      steps: [
        {
          title: "Open the committee",
          description: "Select the committee workspace from the list.",
          action: {
            label: "Open Committees",
            path: { feature: "committees" },
          },
        },
        {
          title: "Go to Members",
          description: "Add name and email, then send the invite.",
        },
      ],
    },
  ];
}

function resolveActionHref(
  slug: string,
  path: { feature: string; subtab?: string; query?: string },
): string {
  if (path.query?.startsWith("flow=")) {
    const flow = path.query.replace("flow=", "") as "apply" | "checklist";
    return flowsPath(slug, flow);
  }

  const base = schoolAdminPath(slug, path.feature, path.subtab);
  if (path.query) {
    return `${base}?${path.query}`;
  }
  return base;
}

function isGuideEnabled(
  features: OrganizationFeatures,
  guide: AdminDocGuideTemplate,
): boolean {
  const required = guide.requiredFeatures;
  if (!required) return true;

  if (required.admin) {
    for (const [key, enabled] of Object.entries(required.admin)) {
      if (!enabled) continue;
      if (!isAdminFeatureEnabled(features, key)) {
        return false;
      }
    }
  }

  if (required.adminPath) {
    const { feature, subtab } = required.adminPath;
    if (!isAdminNavPathEnabled(features, feature, subtab)) {
      return false;
    }
  }

  return true;
}

export function buildAdminDocumentationGuides(
  slug: string,
  features: OrganizationFeatures,
): AdminDocGuide[] {
  const templates = buildGuideTemplates(slug);

  return templates
    .filter((guide) => isGuideEnabled(features, guide))
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
              href: resolveActionHref(slug, step.action.path),
            }
          : undefined,
      })),
    }));
}

export function groupAdminDocumentationByCategory(
  guides: AdminDocGuide[],
): Array<{ category: string; guides: AdminDocGuide[] }> {
  const order: string[] = [];
  const map = new Map<string, AdminDocGuide[]>();

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
