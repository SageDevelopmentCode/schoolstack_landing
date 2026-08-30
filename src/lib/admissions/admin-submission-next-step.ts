import {
  adminApplicationStatusLabel,
  applicationSubmissionNeedsAdminAction,
} from "./application-status-ui";
import type { AdminApplicationSubmission } from "./application-submissions";

export type SubmissionNextStepTone = "success" | "warning" | "info" | "alert" | "purple";

export type SubmissionNextStepKind =
  | "admin_action"
  | "waiting_family"
  | "complete"
  | "closed";

export type SubmissionNextStepPresentation = "chip" | "cta";

export type SubmissionNextStep = {
  primary: string;
  secondary?: string;
  tone: SubmissionNextStepTone;
  kind: SubmissionNextStepKind;
  presentation: SubmissionNextStepPresentation;
};

function progressSecondary(
  summary: AdminApplicationSubmission["applicationProgressSummary"],
): string | undefined {
  if (!summary || summary.total <= 0) return undefined;
  return `${summary.completed}/${summary.total} complete`;
}

function enrollmentSecondary(
  summary: AdminApplicationSubmission["enrollmentSummary"],
): string | undefined {
  if (!summary || summary.total <= 0) return undefined;
  return `${summary.completed}/${summary.total} complete`;
}

function draftAwaitingPayment(submission: AdminApplicationSubmission): boolean {
  const progress = submission.applicationProgressSummary;
  if (!submission.feeEnabled) return false;
  if (submission.feeStatus !== "pending" && submission.feeStatus !== "fee_pending") {
    return false;
  }
  if (!progress || progress.total <= 0) return false;
  return progress.completed >= progress.total - 1;
}

export function deriveSubmissionNextStep(
  submission: AdminApplicationSubmission,
): SubmissionNextStep {
  const { status, enrollmentSummary, postSubmitSummary } = submission;

  if (status === "enrolled") {
    return {
      primary: "All set",
      tone: "success",
      kind: "complete",
      presentation: "chip",
    };
  }

  if (status === "declined" || status === "withdrawn") {
    return {
      primary: "Closed",
      tone: "info",
      kind: "closed",
      presentation: "chip",
    };
  }

  if (status === "draft") {
    if (draftAwaitingPayment(submission)) {
      return {
        primary: "Awaiting payment",
        secondary: progressSecondary(submission.applicationProgressSummary),
        tone: "warning",
        kind: "waiting_family",
        presentation: "chip",
      };
    }

    return {
      primary: "Awaiting family",
      secondary: progressSecondary(submission.applicationProgressSummary),
      tone: "warning",
      kind: "waiting_family",
      presentation: "chip",
    };
  }

  if (status === "accepted") {
    return {
      primary: "Start enrollment",
      tone: "info",
      kind: "admin_action",
      presentation: "cta",
    };
  }

  if (status === "enrolling") {
    if (enrollmentSummary?.tone === "complete") {
      return {
        primary: "All set",
        tone: "success",
        kind: "complete",
        presentation: "chip",
      };
    }

    return {
      primary: "Complete enrollment",
      secondary: enrollmentSecondary(enrollmentSummary),
      tone: "warning",
      kind: "admin_action",
      presentation: "cta",
    };
  }

  if (applicationSubmissionNeedsAdminAction(status)) {
    if (status === "submitted") {
      return {
        primary: "Review application",
        tone: "info",
        kind: "admin_action",
        presentation: "cta",
      };
    }

    return {
      primary: adminApplicationStatusLabel(status),
      secondary: postSubmitSummary?.label,
      tone: "info",
      kind: "admin_action",
      presentation: "cta",
    };
  }

  if (postSubmitSummary && postSubmitSummary.tone === "pending") {
    return {
      primary: "Schedule next step",
      secondary: postSubmitSummary.label,
      tone: "warning",
      kind: "admin_action",
      presentation: "chip",
    };
  }

  return {
    primary: "—",
    tone: "info",
    kind: "closed",
    presentation: "chip",
  };
}
