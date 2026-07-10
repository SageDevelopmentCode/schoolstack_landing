export const APPLICATION_STATUSES = [
  "draft",
  "submitted",
  "fee_pending",
  "under_review",
  "observation",
  "accepted",
  "enrolling",
  "declined",
  "withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

const TERMINAL_STATUSES = new Set<ApplicationStatus>(["declined", "withdrawn"]);

const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  draft: [],
  submitted: ["under_review", "accepted", "declined", "withdrawn"],
  fee_pending: ["under_review", "accepted", "declined", "withdrawn"],
  under_review: ["observation", "accepted", "declined", "withdrawn"],
  observation: ["accepted", "declined", "withdrawn"],
  accepted: ["declined", "withdrawn"],
  enrolling: ["withdrawn"],
  declined: [],
  withdrawn: [],
};

export class ApplicationStatusTransitionError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApplicationStatusTransitionError";
    this.code = code;
    this.status = status;
  }
}

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return (APPLICATION_STATUSES as readonly string[]).includes(value);
}

export function isTerminalApplicationStatus(status: ApplicationStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}

export function getAllowedStatusTransitions(
  currentStatus: ApplicationStatus,
): ApplicationStatus[] {
  return ALLOWED_TRANSITIONS[currentStatus] ?? [];
}

export function canTransitionApplicationStatus(
  fromStatus: string,
  toStatus: string,
): boolean {
  if (!isApplicationStatus(fromStatus) || !isApplicationStatus(toStatus)) {
    return false;
  }
  return getAllowedStatusTransitions(fromStatus).includes(toStatus);
}

export function assertApplicationStatusTransition(
  fromStatus: string,
  toStatus: string,
): void {
  if (!isApplicationStatus(toStatus)) {
    throw new ApplicationStatusTransitionError(
      `"${toStatus}" is not a valid application status.`,
      "invalid_status",
      400,
    );
  }

  if (!isApplicationStatus(fromStatus)) {
    throw new ApplicationStatusTransitionError(
      `Cannot transition from "${fromStatus}".`,
      "invalid_current_status",
      400,
    );
  }

  if (fromStatus === toStatus) {
    throw new ApplicationStatusTransitionError(
      "Application is already in this status.",
      "same_status",
      400,
    );
  }

  if (!canTransitionApplicationStatus(fromStatus, toStatus)) {
    throw new ApplicationStatusTransitionError(
      `Cannot move from "${fromStatus}" to "${toStatus}".`,
      "invalid_transition",
      400,
    );
  }
}

export type ApplicationDecisionAction = {
  status: ApplicationStatus;
  label: string;
  variant: "primary" | "secondary" | "danger";
};

export function getApplicationDecisionActions(
  currentStatus: string,
): ApplicationDecisionAction[] {
  if (!isApplicationStatus(currentStatus)) {
    return [];
  }

  switch (currentStatus) {
    case "submitted":
    case "fee_pending":
      return [
        { status: "under_review", label: "Mark under review", variant: "secondary" },
        { status: "accepted", label: "Accept", variant: "primary" },
        { status: "declined", label: "Decline", variant: "danger" },
      ];
    case "under_review":
      return [
        { status: "observation", label: "Schedule observation", variant: "secondary" },
        { status: "accepted", label: "Accept", variant: "primary" },
        { status: "declined", label: "Decline", variant: "danger" },
      ];
    case "observation":
      return [
        { status: "accepted", label: "Accept", variant: "primary" },
        { status: "declined", label: "Decline", variant: "danger" },
      ];
    case "accepted":
      return [
        { status: "withdrawn", label: "Withdraw", variant: "secondary" },
        { status: "declined", label: "Decline", variant: "danger" },
      ];
    case "enrolling":
      return [
        { status: "withdrawn", label: "Withdraw", variant: "danger" },
      ];
    default:
      return [];
  }
}

export function activityActionForStatusChange(
  toStatus: ApplicationStatus,
): string {
  switch (toStatus) {
    case "under_review":
      return "application.under_review";
    case "observation":
      return "application.observation";
    case "accepted":
      return "application.accepted";
    case "declined":
      return "application.declined";
    case "withdrawn":
      return "application.withdrawn";
    default:
      return "application.status_changed";
  }
}

export function activitySummaryForStatusChange(
  toStatus: ApplicationStatus,
): string {
  switch (toStatus) {
    case "under_review":
      return "Application marked under review";
    case "observation":
      return "Application moved to observation";
    case "accepted":
      return "Application accepted";
    case "declined":
      return "Application declined";
    case "withdrawn":
      return "Application withdrawn";
    default:
      return `Application status changed to ${toStatus}`;
  }
}
