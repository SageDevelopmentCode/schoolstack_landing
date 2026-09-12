import type { EnrollmentBillingStatus } from "./types";

export type TuitionFamilyListVisibility = "active" | "unenrolled" | "excluded";

export type TuitionFamilyEnrollmentRef = {
  enrollmentId: string;
  programId: string;
  status: EnrollmentBillingStatus;
};

export function classifyTuitionFamilyListVisibility(input: {
  enrollments: TuitionFamilyEnrollmentRef[];
  assignmentEnrollmentIds: string[];
  chargeCount: number;
  isProgramBillingEnabled: (programId: string) => boolean;
}): TuitionFamilyListVisibility {
  const hasBillingEnabledEnrollment = input.enrollments.some((enrollment) =>
    input.isProgramBillingEnabled(enrollment.programId),
  );

  const hasBillingEnabledAssignment = input.assignmentEnrollmentIds.some(
    (enrollmentId) => {
      const enrollment = input.enrollments.find(
        (item) => item.enrollmentId === enrollmentId,
      );
      return enrollment
        ? input.isProgramBillingEnabled(enrollment.programId)
        : false;
    },
  );

  const hasBillableActivity =
    hasBillingEnabledEnrollment || hasBillingEnabledAssignment || input.chargeCount > 0;

  if (!hasBillableActivity) {
    return "excluded";
  }

  const hasActiveEnrollment = input.enrollments.some(
    (enrollment) =>
      enrollment.status === "enrolled" &&
      input.isProgramBillingEnabled(enrollment.programId),
  );

  return hasActiveEnrollment ? "active" : "unenrolled";
}
