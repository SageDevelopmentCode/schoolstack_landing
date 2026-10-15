export type EnrollmentQuestionKind =
  | "tuition_all"
  | "variable_cost"
  | "operating_cost"
  | "owner_pay"
  | "enrollment_all"
  | "done";

export type EnrollmentQuestionStep = {
  kind: EnrollmentQuestionKind;
};

export function buildEnrollmentQuestionSteps(): EnrollmentQuestionStep[] {
  return [
    { kind: "tuition_all" },
    { kind: "variable_cost" },
    { kind: "operating_cost" },
    { kind: "owner_pay" },
    { kind: "enrollment_all" },
    { kind: "done" },
  ];
}
