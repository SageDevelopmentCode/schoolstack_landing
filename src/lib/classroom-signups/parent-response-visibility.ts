import type { ClassroomSignupResponse } from "./types";

const ANONYMIZED_RESPONSE_PLACEHOLDER = {
  familyName: "",
  guardianName: "",
  guardianEmail: "",
  studentId: "",
  studentName: "",
  note: null,
} as const;

export function anonymizeClassroomSignupResponseForParent(
  response: ClassroomSignupResponse,
): ClassroomSignupResponse {
  return {
    ...response,
    ...ANONYMIZED_RESPONSE_PLACEHOLDER,
  };
}

export function toParentVisibleSignupResponses(
  responses: ClassroomSignupResponse[],
  viewerFamilyId: string,
): ClassroomSignupResponse[] {
  return responses.map((response) =>
    response.familyId === viewerFamilyId
      ? response
      : anonymizeClassroomSignupResponseForParent(response),
  );
}
