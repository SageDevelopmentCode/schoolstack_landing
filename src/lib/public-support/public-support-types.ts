import {
  SUPPORT_REQUEST_STATUSES,
  type SupportRequestStatus,
  parseSupportRequestStatus,
} from "@/lib/school-admin/support-request-types";

export type PublicSupportRequestTopic =
  | "general"
  | "bug"
  | "billing"
  | "feature"
  | "other";

export const PUBLIC_SUPPORT_REQUEST_TOPICS: PublicSupportRequestTopic[] = [
  "general",
  "bug",
  "billing",
  "feature",
  "other",
];

export const PUBLIC_SUPPORT_REQUEST_TOPIC_LABELS: Record<
  PublicSupportRequestTopic,
  string
> = {
  general: "General question",
  bug: "Something isn't working",
  billing: "Billing",
  feature: "Feature request",
  other: "Other",
};

export type PublicSupportRequestRow = {
  id: string;
  submitter_name: string;
  submitter_email: string;
  topic: string;
  description: string;
  source_page_path: string | null;
  status: SupportRequestStatus;
  created_at: string;
  updated_at: string;
};

export function formatPublicSupportRequestTopic(topic: string): string {
  return (
    PUBLIC_SUPPORT_REQUEST_TOPIC_LABELS[
      topic as PublicSupportRequestTopic
    ] ?? topic
  );
}

export {
  SUPPORT_REQUEST_STATUSES,
  parseSupportRequestStatus,
  type SupportRequestStatus,
};
