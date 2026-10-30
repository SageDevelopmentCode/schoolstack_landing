import type { ProgramFlowBinding } from "./enrollment-flow-program-bindings";

export function programFlowProblems(binding: ProgramFlowBinding): string[] {
  const issues: string[] = [];
  const { applyForm, checklist } = binding;

  if (!applyForm) {
    issues.push("No application");
  } else if (applyForm.status === "draft") {
    issues.push("Application is a draft");
  }

  if (checklist && checklist.status === "draft") {
    issues.push("Checklist is a draft");
  }

  return issues;
}

export function programsNeedingAttention(
  bindings: ProgramFlowBinding[],
): ProgramFlowBinding[] {
  return bindings.filter((binding) => programFlowProblems(binding).length > 0);
}

export function firstAttentionProgramId(
  bindings: ProgramFlowBinding[],
): string | null {
  const first = programsNeedingAttention(bindings)[0];
  return first?.program.id ?? null;
}
