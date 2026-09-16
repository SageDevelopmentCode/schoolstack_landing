import type { PostSubmitSummary } from "@/lib/admissions/admin-post-submit-steps";
import type { EnrollmentProgressSummary } from "@/lib/admissions/enrollment-checklist-materialization";
import type { AdminApplicationSubmission } from "@/lib/admissions/application-submissions";

export type DemoSubmissionFlowField = {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
};

export type DemoSubmissionFlowStep = {
  id: string;
  title: string;
  fields: DemoSubmissionFlowField[];
};

export type DemoSubmissionLead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  childName: string | null;
  childAge: number | null;
  status: string;
  tags: string[];
  date: string;
  message: string | null;
  flowId: string;
  responses: Record<string, string | boolean>;
};

export const DEMO_SUBMISSION_FLOW_LABELS: Record<string, string> = {
  "flow-1": "Apply Now Form",
  "flow-2": "Enrollment Checklist",
  "flow-3": "Waitlist Signup",
  "flow-4": "Book a Campus Tour",
  "flow-5": "Schedule a Tour",
};

const DEMO_LEAD_ISO_BY_ID: Record<
  string,
  { createdAt: string; updatedAt: string; submittedAt: string | null }
> = {
  l0: {
    createdAt: "2026-04-15T11:48:00.000Z",
    updatedAt: "2026-04-15T11:48:00.000Z",
    submittedAt: null,
  },
  l1: {
    createdAt: "2026-04-15T11:42:00.000Z",
    updatedAt: "2026-04-15T11:42:00.000Z",
    submittedAt: null,
  },
  l2: {
    createdAt: "2026-04-15T07:00:00.000Z",
    updatedAt: "2026-04-15T09:15:00.000Z",
    submittedAt: null,
  },
  l3: {
    createdAt: "2026-03-20T10:00:00.000Z",
    updatedAt: "2026-03-20T14:30:00.000Z",
    submittedAt: "2026-03-20T14:30:00.000Z",
  },
  l4: {
    createdAt: "2026-04-15T09:00:00.000Z",
    updatedAt: "2026-04-15T09:00:00.000Z",
    submittedAt: null,
  },
  l5: {
    createdAt: "2026-03-15T08:00:00.000Z",
    updatedAt: "2026-03-16T11:00:00.000Z",
    submittedAt: "2026-03-16T11:00:00.000Z",
  },
  l6: {
    createdAt: "2026-02-10T08:00:00.000Z",
    updatedAt: "2026-04-01T16:00:00.000Z",
    submittedAt: "2026-02-12T10:00:00.000Z",
  },
};

function demoLeadTimestamps(lead: DemoSubmissionLead): {
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
} {
  const known = DEMO_LEAD_ISO_BY_ID[lead.id];
  if (known) return known;

  const idNum = Number.parseInt(lead.id.replace(/\D/g, ""), 10) || 0;
  const created = new Date("2026-04-01T12:00:00.000Z");
  created.setDate(created.getDate() - idNum * 2);
  const updated = new Date(created);
  updated.setHours(updated.getHours() + 4);

  return {
    createdAt: created.toISOString(),
    updatedAt: updated.toISOString(),
    submittedAt: null,
  };
}

function mapDemoLeadStatus(status: string, flowId: string): string {
  if (flowId === "flow-4") {
    switch (status) {
      case "requested":
        return "draft";
      case "scheduled":
      case "no_show":
        return "under_review";
      case "completed":
        return "submitted";
      case "cancelled":
        return "withdrawn";
      default:
        return "draft";
    }
  }

  switch (status) {
    case "new":
      return "draft";
    case "contacted":
      return "under_review";
    case "emailed":
    case "application_sent":
      return "submitted";
    case "enrolled":
      return "enrolled";
    case "enrolling":
      return "enrolling";
    case "in_progress":
      return "draft";
    case "in_review":
      return "under_review";
    case "lost":
      return "declined";
    default:
      return "draft";
  }
}

function inferProgramName(lead: DemoSubmissionLead): string | null {
  const programTag = lead.tags.find((tag) =>
    /school year|summer|enrollment|tour/i.test(tag),
  );
  if (programTag) return programTag;

  const responseProgram =
    lead.responses.f31 ??
    lead.responses.f27 ??
    lead.responses.f8 ??
    lead.responses.f19;
  if (typeof responseProgram === "string" && responseProgram.trim()) {
    return responseProgram.trim();
  }
  if (typeof responseProgram === "boolean") {
    return responseProgram ? "Summer program" : "School Year";
  }

  return null;
}

function inferStudentLabel(lead: DemoSubmissionLead): string | null {
  if (lead.childName?.trim()) return lead.childName.trim();

  const fromResponses = [
    lead.responses.f5,
    lead.responses.f18,
    lead.responses.f23,
    lead.responses.f32,
  ].find((value) => typeof value === "string" && value.trim());

  return typeof fromResponses === "string" ? fromResponses.trim() : null;
}

function enrichDemoSubmission(
  submission: AdminApplicationSubmission,
  lead: DemoSubmissionLead,
): AdminApplicationSubmission {
  const enriched: AdminApplicationSubmission = { ...submission };

  if (submission.status === "draft") {
    const completed =
      lead.id === "l2" ? 3 : lead.id === "l0" || lead.id === "l1" ? 1 : 2;
    enriched.applicationProgressSummary = {
      completed,
      total: 5,
      label: `${completed}/5 sections`,
    };
    enriched.stepIndex = Math.max(0, completed - 1);
    enriched.totalSteps = 5;
  }

  if (submission.status === "submitted") {
    enriched.submittedAt = enriched.submittedAt ?? enriched.updatedAt;
    enriched.hasPostSubmitActions = true;
    const postSubmitSummary: PostSubmitSummary =
      lead.id === "l3" || lead.id === "l5"
        ? { label: "Awaiting family", tone: "pending" }
        : { label: "Follow-up scheduled", tone: "scheduled" };
    enriched.postSubmitSummary = postSubmitSummary;
    enriched.feeEnabled = true;
    enriched.feeStatus = lead.id === "l3" || lead.id === "l6" ? "paid" : "pending";
  }

  if (submission.status === "under_review") {
    enriched.submittedAt = enriched.submittedAt ?? enriched.updatedAt;
    enriched.applicationProgressSummary = {
      completed: 5,
      total: 5,
      label: "5/5 sections",
    };
    enriched.stepIndex = 4;
    enriched.totalSteps = 5;
  }

  if (submission.status === "enrolling") {
    const enrollmentSummary: EnrollmentProgressSummary = {
      label: "3/8 required items",
      tone: "in_progress",
      completed: 3,
      total: 8,
      checklistStatus: "in_progress",
      paymentSummary: {
        hasPaymentItems: true,
        allPaid: false,
        allWaived: false,
      },
    };
    enriched.enrollmentSummary = enrollmentSummary;
    enriched.feeEnabled = true;
    enriched.feeStatus = "paid";
  }

  if (submission.status === "enrolled") {
    const enrollmentSummary: EnrollmentProgressSummary = {
      label: "Enrolled",
      tone: "complete",
      completed: 8,
      total: 8,
      checklistStatus: "completed",
      paymentSummary: {
        hasPaymentItems: true,
        allPaid: true,
        allWaived: false,
      },
    };
    enriched.enrollmentSummary = enrollmentSummary;
    enriched.submittedAt = enriched.submittedAt ?? enriched.updatedAt;
    enriched.feeEnabled = true;
    enriched.feeStatus = "paid";
  }

  return enriched;
}

export function mapDemoLeadToSubmission(
  lead: DemoSubmissionLead,
  flowLabel?: string,
): AdminApplicationSubmission {
  const formTitle =
    flowLabel ??
    DEMO_SUBMISSION_FLOW_LABELS[lead.flowId] ??
    "Application";
  const timestamps = demoLeadTimestamps(lead);
  const status = mapDemoLeadStatus(lead.status, lead.flowId);

  const base: AdminApplicationSubmission = {
    id: lead.id,
    status,
    feeStatus: "none",
    feeEnabled: false,
    formTitle,
    formSlug: lead.flowId,
    programName: inferProgramName(lead),
    guardianName: lead.name,
    primaryGuardianId: `guardian-${lead.id}`,
    contactEmail: lead.email,
    studentLabel: inferStudentLabel(lead),
    stepIndex: 0,
    totalSteps: 5,
    applicationProgressSummary: null,
    createdAt: timestamps.createdAt,
    submittedAt: timestamps.submittedAt,
    updatedAt: timestamps.updatedAt,
    hasPostSubmitActions: false,
    postSubmitSummary: null,
    enrollmentSummary: null,
  };

  return enrichDemoSubmission(base, lead);
}

export type DemoSubmissionMetrics = {
  activeCount: number;
  draftCount: number;
  submittedCount: number;
  enrolledCount: number;
  statusCounts: Record<string, number>;
};

export function computeDemoSubmissionMetrics(
  rows: AdminApplicationSubmission[],
): DemoSubmissionMetrics {
  const statusCounts: Record<string, number> = {};

  for (const row of rows) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
  }

  const withdrawnCount = statusCounts.withdrawn ?? 0;

  return {
    activeCount: rows.length - withdrawnCount,
    draftCount: statusCounts.draft ?? 0,
    submittedCount: statusCounts.submitted ?? 0,
    enrolledCount: statusCounts.enrolled ?? 0,
    statusCounts,
  };
}

export type DemoSubmissionFormOption = {
  key: string;
  label: string;
  count: number;
};

export function getDemoFormOptions(
  rows: AdminApplicationSubmission[],
): DemoSubmissionFormOption[] {
  const counts = new Map<string, { label: string; count: number }>();

  for (const row of rows) {
    const key = row.formSlug?.trim() || row.formTitle.trim();
    if (!key) continue;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { label: row.formTitle, count: 1 });
    }
  }

  return [...counts.entries()]
    .map(([key, value]) => ({ key, label: value.label, count: value.count }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getLatestSubmittedRow(
  rows: AdminApplicationSubmission[],
): AdminApplicationSubmission | null {
  let latest: AdminApplicationSubmission | null = null;

  for (const row of rows) {
    if (row.status !== "submitted") continue;
    if (
      !latest ||
      (row.submittedAt &&
        (!latest.submittedAt || row.submittedAt > latest.submittedAt))
    ) {
      latest = row;
    }
  }

  return latest;
}

export function mapDemoLeadsToSubmissions(
  leads: DemoSubmissionLead[],
): AdminApplicationSubmission[] {
  return leads.map((lead) => mapDemoLeadToSubmission(lead));
}

export function findDemoLeadForSubmission(
  leads: DemoSubmissionLead[],
  submissionId: string,
): DemoSubmissionLead | undefined {
  return leads.find((lead) => lead.id === submissionId);
}

export type DemoSubmissionActivityEntry = {
  id: string;
  at: string;
  actor: string;
  title: string;
  summary: string;
  variant: "mail" | "note" | "action";
};

const DEMO_STATUS_ACTIVITY_LABELS: Record<string, string> = {
  new: "Applying",
  contacted: "Under review",
  emailed: "Submitted",
  application_sent: "Submitted",
  enrolled: "Enrolled",
  lost: "Declined",
};

export function buildDemoSubmissionActivity(
  lead: DemoSubmissionLead,
): DemoSubmissionActivityEntry[] {
  const statusLabel =
    DEMO_STATUS_ACTIVITY_LABELS[lead.status] ?? lead.status.replace(/_/g, " ");
  const initial: DemoSubmissionActivityEntry[] = [
    {
      id: `${lead.id}-a0`,
      at: `${lead.date} · 9:02 AM`,
      actor: "System",
      title: "Submission received",
      summary: "Form submission received and queued for review.",
      variant: "mail",
    },
    {
      id: `${lead.id}-a1`,
      at: `${lead.date} · 9:03 AM`,
      actor: "Automation",
      title: "Confirmation sent",
      summary: `Confirmation email sent to ${lead.email}.`,
      variant: "mail",
    },
  ];

  if (lead.tags.length > 0) {
    initial.push({
      id: `${lead.id}-a2`,
      at: `${lead.date} · 10:15 AM`,
      actor: "Jordan M.",
      title: "Tags updated",
      summary: `Added tags: ${lead.tags.join(", ")}.`,
      variant: "note",
    });
  }

  if (lead.status !== "new") {
    initial.push({
      id: `${lead.id}-a3`,
      at: `${lead.date} · 2:40 PM`,
      actor: "Jordan M.",
      title: "Status updated",
      summary: `Status set to ${statusLabel}.`,
      variant: "action",
    });
  }

  return initial;
}

export function formatDemoSubmissionFieldAnswer(
  field: { type: string },
  raw: string | boolean | undefined,
): string {
  if (raw === undefined || raw === null) return "—";
  if (typeof raw === "string" && raw.trim() === "") return "—";
  if (field.type === "checkbox") {
    if (typeof raw === "boolean") return raw ? "Yes" : "No";
    const normalized = String(raw).toLowerCase();
    if (normalized === "true" || normalized === "yes" || normalized === "on" || normalized === "1") {
      return "Yes";
    }
    return "No";
  }
  return String(raw);
}

export function demoSubmissionStatusLabel(demoStatus: MobileDemoLeadStatusLike): string {
  switch (demoStatus) {
    case "new":
      return "Applying";
    case "contacted":
      return "Under review";
    case "emailed":
      return "Submitted";
    default:
      return demoStatus;
  }
}

export type MobileDemoLeadStatusLike = "new" | "contacted" | "emailed" | string;
