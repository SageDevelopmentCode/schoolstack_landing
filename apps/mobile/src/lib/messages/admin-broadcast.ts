export const ADMIN_BROADCAST_MAX_RECIPIENTS = 200;
export const ADMIN_BROADCAST_CONFIRM_THRESHOLD = 10;

export type AdminBroadcastAudienceState = {
  programIds: string[];
  classroomIds: string[];
  gradeValues: string[];
  guardianIds: string[];
};

export type AdminBroadcastOptionProgram = {
  id: string;
  name: string;
};

export type AdminBroadcastOptionClassroom = {
  id: string;
  name: string;
  programId: string | null;
  programName: string | null;
};

export type BroadcastPreviewResponse = {
  count: number;
  recipientNames: string[];
  exceedsLimit: boolean;
};

export type BroadcastFailure = {
  guardianId: string;
  name: string;
  error: string;
};

export type BroadcastSendResponse = {
  sentCount: number;
  failedCount: number;
  failures: BroadcastFailure[];
};

export class BroadcastSendError extends Error {
  failures: BroadcastFailure[];

  constructor(message: string, failures: BroadcastFailure[] = []) {
    super(message);
    this.name = 'BroadcastSendError';
    this.failures = failures;
  }
}

const DEFAULT_MAX_NAMES = 3;
const DEFAULT_MAX_LENGTH = 120;

export type FormatBroadcastRecipientSummaryOptions = {
  maxNames?: number;
  maxLength?: number;
};

export function formatBroadcastRecipientSummary(
  names: string[],
  options?: FormatBroadcastRecipientSummaryOptions,
): string {
  const trimmed = names.map((name) => name.trim()).filter(Boolean);
  if (trimmed.length === 0) return '';

  const maxNames = options?.maxNames ?? DEFAULT_MAX_NAMES;
  const maxLength = options?.maxLength ?? DEFAULT_MAX_LENGTH;

  let summary = '';
  if (trimmed.length === 1) {
    summary = trimmed[0]!;
  } else if (trimmed.length === 2) {
    summary = `${trimmed[0]} and ${trimmed[1]}`;
  } else if (trimmed.length <= maxNames) {
    const last = trimmed[trimmed.length - 1];
    const rest = trimmed.slice(0, -1);
    summary = `${rest.join(', ')}, and ${last}`;
  } else {
    const shown = trimmed.slice(0, maxNames);
    const others = trimmed.length - maxNames;
    summary = `${shown.join(', ')}, and ${others} other${others === 1 ? '' : 's'}`;
  }

  if (summary.length <= maxLength) {
    return summary;
  }

  return `${summary.slice(0, maxLength - 1).trimEnd()}…`;
}

export function emptyAdminBroadcastAudience(): AdminBroadcastAudienceState {
  return {
    programIds: [],
    classroomIds: [],
    gradeValues: [],
    guardianIds: [],
  };
}

export function hasAdminBroadcastAudienceSelection(
  audience: AdminBroadcastAudienceState,
): boolean {
  return (
    audience.programIds.length > 0 ||
    audience.classroomIds.length > 0 ||
    audience.gradeValues.length > 0 ||
    audience.guardianIds.length > 0
  );
}

export function continueRecipientsLabel(
  audience: AdminBroadcastAudienceState,
  previewCount: number,
  previewExceedsLimit: boolean,
): string {
  if (previewCount === 0 && !hasAdminBroadcastAudienceSelection(audience)) {
    return 'Continue';
  }

  const countLabel = previewExceedsLimit
    ? `${previewCount} parents selected (limit is 200)`
    : `${previewCount} parent${previewCount === 1 ? '' : 's'} selected`;

  return `${countLabel} • Continue`;
}

export function broadcastSendButtonLabel(
  previewCount: number,
  formattedRecipientNames: string,
): string {
  if (previewCount > 0 && previewCount <= 3 && formattedRecipientNames) {
    return `Send to ${formattedRecipientNames}`;
  }
  if (previewCount > 0) {
    return `Send to ${previewCount}`;
  }
  return 'Send bulk message';
}

export function newBroadcastBatchId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `batch-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
