import type { ApplicationDetail } from '@/lib/admissions/application-detail';
import {
  buildApplicationFormSteps,
  computeApplicationFormStepStatuses,
  summarizeApplicationFormProgress,
  type ApplicationFormStepWithStatus,
} from '@/lib/admissions/application-form-steps';
import { FEE_STATUS_LABELS } from '@/lib/admissions/application-status-ui';
import {
  buildEnrollmentTimelineMeta,
  checklistItemStatusLabel,
  checklistItemTypeLabel,
  resolveChecklistProgress,
  type EnrollmentChecklistItem,
  type EnrollmentChecklistItemInstance,
  type EnrollmentChecklistItemStatus,
  type LoadedEnrollmentChecklist,
} from '@/lib/admissions/enrollment-checklist';
import type { ParentChildRecordSection } from '@/lib/parent/parent-children-utils';
import type { AuthorizedPickupContact, PickupContactInput } from '@/lib/parent/parent-portal-pickup-api';
import type { HealthAllergySeverity } from '@/lib/student-health/types';

/*
 * Pure view helpers for the parent mobile Children tab (no React). Everything
 * is derived from the loaded profile; nothing is invented.
 */

/* ------------------------------------------------------------------ */
/* Snapshot                                                            */
/* ------------------------------------------------------------------ */

export function formatBirthDate(value: string): string | null {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function calculateAge(value: string, now: Date = new Date()): number | null {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  const birth = new Date(y, m - 1, d);
  let age = now.getFullYear() - birth.getFullYear();
  const hadBirthday =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!hadBirthday) age -= 1;
  return age >= 0 ? age : null;
}

/* ------------------------------------------------------------------ */
/* Record tabs                                                         */
/* ------------------------------------------------------------------ */

export type RecordTab = {
  id: ParentChildRecordSection;
  label: string;
  icon: 'document-text-outline' | 'clipboard-outline' | 'people-outline' | 'heart-outline' | 'car-outline';
};

/** Same show/hide rules as the Story workspace. */
export function buildRecordTabs({
  hasChecklist,
  hasStudent,
}: {
  hasChecklist: boolean;
  hasStudent: boolean;
}): RecordTab[] {
  const tabs: RecordTab[] = [
    { id: 'application', label: 'Application', icon: 'document-text-outline' },
  ];
  if (hasChecklist) tabs.push({ id: 'checklist', label: 'Enrollment', icon: 'clipboard-outline' });
  if (hasStudent) {
    tabs.push({ id: 'teachers', label: 'Teachers', icon: 'people-outline' });
    tabs.push({ id: 'health', label: 'Health', icon: 'heart-outline' });
    tabs.push({ id: 'pickup', label: 'Pickup', icon: 'car-outline' });
  }
  return tabs;
}

/* ------------------------------------------------------------------ */
/* Step lists                                                          */
/* ------------------------------------------------------------------ */

export type GardenStepState = 'done' | 'current' | 'todo';
export type GardenChipTone = 'success' | 'warning' | 'alert' | 'info' | 'neutral';

export type RecordStep = {
  id: string;
  title: string;
  meta: string | null;
  state: GardenStepState;
  chip: { label: string; tone: GardenChipTone } | null;
};

function isDoneStatus(status: string): boolean {
  return status === 'completed' || status === 'waived';
}

/** The first unfinished step is "current"; the rest are "to do". */
function withStepStates<T extends { status: string }>(rows: T[]): (T & { state: GardenStepState })[] {
  let currentAssigned = false;
  return rows.map((row) => {
    if (isDoneStatus(row.status)) return { ...row, state: 'done' as const };
    if (!currentAssigned) {
      currentAssigned = true;
      return { ...row, state: 'current' as const };
    }
    return { ...row, state: 'todo' as const };
  });
}

export function statusChip(status: EnrollmentChecklistItemStatus | string): {
  label: string;
  tone: GardenChipTone;
} {
  const known: EnrollmentChecklistItemStatus[] = ['not_started', 'in_progress', 'completed', 'waived'];
  const label = known.includes(status as EnrollmentChecklistItemStatus)
    ? checklistItemStatusLabel(status as EnrollmentChecklistItemStatus)
    : status.replace(/_/g, ' ');
  if (status === 'completed' || status === 'waived') return { label, tone: 'success' };
  if (status === 'in_progress') return { label, tone: 'warning' };
  return { label, tone: 'neutral' };
}

function stepKindLabel(kind: ApplicationFormStepWithStatus['kind']): string {
  if (kind === 'acknowledgments') return 'Acknowledgments';
  if (kind === 'fee') return 'Fee';
  return 'Form';
}

function formatShortDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export type ApplicationStepsView = {
  title: string;
  subtitle: string | null;
  steps: RecordStep[];
  rawSteps: ApplicationFormStepWithStatus[];
  completed: number;
  total: number;
};

export function buildApplicationStepsView(application: ApplicationDetail): ApplicationStepsView {
  const feeStatus = application.feeStatus ?? 'not_required';
  const steps = buildApplicationFormSteps(application.schema, application.feeConfig);
  const withStatus = computeApplicationFormStepStatuses(steps, {
    applicationStatus: application.status,
    stepIndex: application.stepIndex,
    feeStatus,
  });
  const progress = summarizeApplicationFormProgress(withStatus);

  const subtitleParts: string[] = [];
  if (application.status !== 'draft' && application.submittedAt) {
    subtitleParts.push(`Submitted ${formatShortDay(application.submittedAt)}`);
  }
  if (application.feeConfig.enabled && feeStatus !== 'not_required') {
    const feeLabel = FEE_STATUS_LABELS[feeStatus] ?? feeStatus.replace(/_/g, ' ');
    subtitleParts.push(`Fee ${feeLabel.toLowerCase()}`);
  }

  return {
    title: application.formTitle,
    subtitle: subtitleParts.length ? subtitleParts.join(' · ') : null,
    rawSteps: withStatus,
    steps: withStepStates(withStatus).map((step) => ({
      id: step.id,
      title: step.label,
      meta: stepKindLabel(step.kind),
      state: step.state,
      chip: step.state === 'done' ? null : statusChip(step.status),
    })),
    completed: progress.completed,
    total: progress.total,
  };
}

export type EnrollmentStepsView = {
  title: string;
  steps: RecordStep[];
  completed: number;
  total: number;
  isComplete: boolean;
};

function instanceFor(
  checklist: LoadedEnrollmentChecklist,
  item: EnrollmentChecklistItem,
): EnrollmentChecklistItemInstance | undefined {
  return checklist.instances.find((instance) => instance.templateItemId === item.id);
}

export function buildEnrollmentStepsView(checklist: LoadedEnrollmentChecklist): EnrollmentStepsView {
  const rows = checklist.items.map((item) => {
    const instance = instanceFor(checklist, item);
    return { item, instance, status: instance?.status ?? 'not_started' };
  });
  const progress = resolveChecklistProgress(checklist);
  return {
    title: checklist.title,
    steps: withStepStates(rows).map(({ item, instance, status, state }) => {
      const meta = [
        checklistItemTypeLabel(item.type),
        item.required ? null : 'Optional',
        buildEnrollmentTimelineMeta(item, instance) ?? null,
      ]
        .filter(Boolean)
        .join(' · ');
      return {
        id: item.id,
        title: item.label,
        meta: meta || null,
        state,
        chip: state === 'done' ? null : statusChip(status),
      };
    }),
    completed: progress.completed,
    total: progress.total,
    isComplete: progress.total > 0 && progress.completed >= progress.total,
  };
}

/** Required items still waiting on the family (same rule as `incompleteChecklistItems`). */
export function nextChecklistSteps(
  checklist: LoadedEnrollmentChecklist | null,
): { itemId: string; label: string; typeLabel: string; status: EnrollmentChecklistItemStatus }[] {
  if (!checklist) return [];
  return checklist.items
    .map((item) => ({ item, status: instanceFor(checklist, item)?.status ?? 'not_started' }))
    .filter(({ item, status }) => item.required && (status === 'not_started' || status === 'in_progress'))
    .map(({ item, status }) => ({
      itemId: item.id,
      label: item.label,
      typeLabel: checklistItemTypeLabel(item.type),
      status,
    }));
}

/** Toast copy after a checklist item finishes, by item type. */
export function checklistCompletedToast(item: EnrollmentChecklistItem): {
  title: string;
  description: string;
} {
  switch (item.type) {
    case 'acknowledgment':
      return { title: 'Signed and submitted', description: `${item.label} is done.` };
    case 'document_sign':
    case 'document_sign_pdf':
      return { title: 'Document signed', description: `${item.label} is done.` };
    case 'form':
      return { title: 'Form submitted', description: `${item.label} is done.` };
    case 'file_upload':
      return { title: 'Files uploaded', description: `${item.label} is done.` };
    case 'payment':
      return { title: 'Payment recorded', description: `${item.label} is done.` };
    default:
      return { title: 'Step complete', description: `${item.label} is done.` };
  }
}

/* ------------------------------------------------------------------ */
/* Enrollment files                                                    */
/* ------------------------------------------------------------------ */

export function buildChecklistFileStoragePath(input: {
  organizationId: string;
  checklistId: string;
  instanceId: string;
  fileName: string;
  fileId?: string;
}): string {
  const fileId = input.fileId ?? `${Date.now()}`;
  const safeName = input.fileName.replace(/[/\\]/g, '_');
  return `${input.organizationId}/enrollment-checklists/${input.checklistId}/${input.instanceId}/${fileId}_${safeName}`;
}

/** Existing draft answers for a checklist form, as strings keyed by field id. */
export function checklistFormDraftValues(
  responses: Record<string, unknown> | null | undefined,
): Record<string, string> {
  const fields = responses?.fields;
  if (!fields || typeof fields !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields as Record<string, unknown>)) {
    if (typeof value === 'string') out[key] = value;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Health                                                              */
/* ------------------------------------------------------------------ */

export type HealthFormValues =
  | { type: 'allergy'; allergen: string; severity: HealthAllergySeverity; treatmentNotes: string }
  | {
      type: 'medication';
      name: string;
      dose: string;
      timeOfDay: string;
      instructions: string;
      startDate: string;
      ongoing: boolean;
    }
  | { type: 'update'; title: string; details: string; startDate: string };

export function healthValuesToPayload(values: HealthFormValues): Record<string, unknown> {
  if (values.type === 'allergy') {
    return {
      allergen: values.allergen,
      severity: values.severity,
      treatmentNotes: values.treatmentNotes,
    };
  }
  if (values.type === 'medication') {
    return {
      name: values.name,
      dose: values.dose,
      timeOfDay: values.timeOfDay,
      instructions: values.instructions,
      startDate: values.startDate,
      ongoing: values.ongoing,
    };
  }
  return { title: values.title, details: values.details, startDate: values.startDate };
}

/** The field that must be filled before saving, per item type. */
export function healthRequiredFieldError(values: HealthFormValues): string | null {
  if (values.type === 'allergy' && !values.allergen.trim()) return 'Add the allergen.';
  if (values.type === 'medication' && !values.name.trim()) return 'Add the medication name.';
  if (values.type === 'update' && !values.title.trim()) return 'Add a title.';
  return null;
}

export function healthItemNoun(type: HealthFormValues['type']): string {
  if (type === 'allergy') return 'Allergy';
  if (type === 'medication') return 'Medication';
  return 'Health update';
}

/* ------------------------------------------------------------------ */
/* Pickup                                                              */
/* ------------------------------------------------------------------ */

export const EMPTY_PICKUP_FORM: PickupContactInput = {
  firstName: '',
  lastName: '',
  relationship: '',
  phone: '',
  notes: '',
};

export function formatContactName(contact: Pick<AuthorizedPickupContact, 'firstName' | 'lastName'>): string {
  return [contact.firstName, contact.lastName].filter(Boolean).join(' ').trim() || 'Contact';
}

export function pickupFormErrors(values: PickupContactInput): {
  firstName: string | null;
  lastName: string | null;
} {
  return {
    firstName: values.firstName.trim() ? null : 'First name is required.',
    lastName: values.lastName.trim() ? null : 'Last name is required.',
  };
}

/** Trim and null-out empty optional fields (same payload as the Story form). */
export function normalizePickupForm(values: PickupContactInput): PickupContactInput {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    relationship: values.relationship?.trim() || null,
    phone: values.phone?.trim() || null,
    notes: values.notes?.trim() || null,
  };
}
