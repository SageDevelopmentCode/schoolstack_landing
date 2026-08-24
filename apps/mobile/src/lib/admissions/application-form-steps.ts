import type {
  ApplicationFormFeeConfig,
  ApplicationFormSchema,
} from '@/lib/admissions/application-form-schema';

const PROGRESS_KEY = '__progress';

export type ApplicationFormStep =
  | { kind: 'section'; id: string; label: string; sectionIndex: number }
  | { kind: 'acknowledgments'; id: 'acknowledgments'; label: string }
  | { kind: 'fee'; id: 'fee'; label: string };

export type ApplicationFormStepStatus = 'not_started' | 'in_progress' | 'completed';

export type ApplicationFormStepWithStatus = ApplicationFormStep & {
  status: ApplicationFormStepStatus;
};

export function buildApplicationFormSteps(
  schema: ApplicationFormSchema,
  feeConfig: ApplicationFormFeeConfig,
): ApplicationFormStep[] {
  const steps: ApplicationFormStep[] = schema.sections.map((section, sectionIndex) => ({
    kind: 'section',
    id: section.id,
    label: section.title,
    sectionIndex,
  }));

  if ((schema.acknowledgments ?? []).length > 0) {
    steps.push({
      kind: 'acknowledgments',
      id: 'acknowledgments',
      label: 'Acknowledgments',
    });
  }

  if (feeConfig.enabled) {
    steps.push({
      kind: 'fee',
      id: 'fee',
      label: feeConfig.label?.trim() || 'Application fee',
    });
  }

  return steps;
}

export function parseApplicationFormStepIndex(responses: unknown): number {
  const record =
    responses && typeof responses === 'object' && !Array.isArray(responses)
      ? (responses as Record<string, unknown>)
      : {};
  const progress =
    record[PROGRESS_KEY] && typeof record[PROGRESS_KEY] === 'object'
      ? (record[PROGRESS_KEY] as Record<string, unknown>)
      : {};
  const rawStep = progress.stepIndex;
  if (typeof rawStep !== 'number' || !Number.isFinite(rawStep) || rawStep < 0) {
    return 0;
  }
  return Math.floor(rawStep);
}

function feeStepStatus(feeStatus: string): ApplicationFormStepStatus {
  if (feeStatus === 'paid' || feeStatus === 'not_required' || feeStatus === 'waived') {
    return 'completed';
  }
  if (feeStatus === 'pending' || feeStatus === 'fee_pending') {
    return 'in_progress';
  }
  return 'not_started';
}

export function computeApplicationFormStepStatuses(
  steps: ApplicationFormStep[],
  input: {
    applicationStatus: string;
    stepIndex: number;
    feeStatus: string;
  },
): ApplicationFormStepWithStatus[] {
  const { applicationStatus, stepIndex, feeStatus } = input;
  const clampedIndex = Math.min(
    Math.max(0, stepIndex),
    Math.max(0, steps.length - 1),
  );

  if (applicationStatus === 'draft') {
    return steps.map((step, index) => {
      let status: ApplicationFormStepStatus = 'not_started';
      if (index < clampedIndex) {
        status = 'completed';
      } else if (index === clampedIndex) {
        status = 'in_progress';
      }
      return { ...step, status };
    });
  }

  return steps.map((step) => {
    if (step.kind === 'fee') {
      return { ...step, status: feeStepStatus(feeStatus) };
    }
    return { ...step, status: 'completed' as const };
  });
}

export function summarizeApplicationFormProgress(
  stepsWithStatus: ApplicationFormStepWithStatus[],
): { completed: number; total: number } {
  const total = stepsWithStatus.length;
  const completed = stepsWithStatus.filter((step) => step.status === 'completed').length;
  return { completed, total };
}
