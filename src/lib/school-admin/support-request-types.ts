export type SupportRequestStatus =
  | "open"
  | "in_progress"
  | "completed"
  | "cancelled";

export const SUPPORT_REQUEST_STATUSES: SupportRequestStatus[] = [
  "open",
  "in_progress",
  "completed",
  "cancelled",
];

export const SUPPORT_REQUEST_STATUS_META: Record<
  SupportRequestStatus,
  { label: string; pill: string }
> = {
  open: {
    label: "Open",
    pill: "bg-clay-soft text-clay border-clay/20",
  },
  in_progress: {
    label: "In progress",
    pill: "bg-accent-highlight text-accent border-accent-soft",
  },
  completed: {
    label: "Completed",
    pill: "bg-surface-soft text-text-muted border-border",
  },
  cancelled: {
    label: "Cancelled",
    pill: "bg-surface-soft text-text-faint border-border",
  },
};

export const SUPPORT_REQUEST_TOPIC_LABELS: Record<string, string> = {
  general: "General question",
  bug: "Something isn't working",
  "application-forms": "Application forms",
  enrollment: "Enrollment",
  billing: "Billing",
  feature: "Feature request",
  other: "Other",
};

export type AdminSupportRequestRow = {
  id: string;
  organization_id: string;
  organization_slug: string;
  organization_name: string;
  submitted_by_user_id: string;
  submitter_email: string;
  topic: string;
  subject: string | null;
  description: string;
  source_page_path: string | null;
  attachments: Array<{
    id: string;
    fileName: string;
    storagePath: string;
    mimeType: string | null;
    sizeBytes: number | null;
  }>;
  status: SupportRequestStatus;
  created_at: string;
  updated_at: string;
};

export function formatSupportRequestTopic(topic: string): string {
  return SUPPORT_REQUEST_TOPIC_LABELS[topic] ?? topic;
}

export function parseSupportRequestStatus(
  value: string,
): SupportRequestStatus | null {
  return SUPPORT_REQUEST_STATUSES.includes(value as SupportRequestStatus)
    ? (value as SupportRequestStatus)
    : null;
}
