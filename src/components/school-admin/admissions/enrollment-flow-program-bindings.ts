import type { ApplicationFormVersion } from "@/lib/admissions/application-form-schema";
import { isApplyFormVersion } from "@/lib/admissions/application-forms";
import type { EnrollmentChecklistTemplate } from "@/lib/admissions/enrollment-checklist-templates";
import type { EnrollmentFlowProgramSummary } from "@/lib/school-admin/load-enrollment-flows-list-data";

export type ProgramFlowBinding = {
  program: EnrollmentFlowProgramSummary;
  applyForm?: ApplicationFormVersion;
  checklist?: EnrollmentChecklistTemplate;
};

export function buildProgramFlowBindings(
  programs: EnrollmentFlowProgramSummary[],
  forms: ApplicationFormVersion[],
  checklists: EnrollmentChecklistTemplate[],
): ProgramFlowBinding[] {
  const activeChecklists = checklists.filter((row) => row.status !== "archived");

  return programs.map((program) => ({
    program,
    applyForm: forms.find(
      (form) =>
        isApplyFormVersion(form) &&
        form.program_id === program.id &&
        form.status !== "archived",
    ),
    checklist: activeChecklists.find((row) => row.programId === program.id),
  }));
}

export function countProgramsWithCompleteFlow(bindings: ProgramFlowBinding[]): {
  complete: number;
  incomplete: number;
} {
  let complete = 0;
  let incomplete = 0;
  for (const binding of bindings) {
    if (binding.applyForm) {
      complete += 1;
    } else {
      incomplete += 1;
    }
  }
  return { complete, incomplete };
}
