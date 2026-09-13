export const ENROLLMENT_ENROLLED_STATUS = "enrolled" as const;

/**
 * Patch for transitioning an enrollment to enrolled.
 * Sets enrolled_at only on first transition; DB trigger is a safety net.
 */
export function enrollmentEnrolledStatusPatch(
  existingEnrolledAt: string | null | undefined,
): {
  status: typeof ENROLLMENT_ENROLLED_STATUS;
  enrolled_at?: string;
} {
  if (existingEnrolledAt) {
    return { status: ENROLLMENT_ENROLLED_STATUS };
  }
  return {
    status: ENROLLMENT_ENROLLED_STATUS,
    enrolled_at: new Date().toISOString(),
  };
}

export function newEnrollmentAsEnrolledRow(input: {
  organization_id: string;
  student_id: string;
  program_id: string;
  classroom_id?: string | null;
}) {
  const enrolledAt = new Date().toISOString();
  return {
    ...input,
    status: ENROLLMENT_ENROLLED_STATUS,
    enrolled_at: enrolledAt,
  };
}
