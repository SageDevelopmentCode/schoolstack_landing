import type { ApplicationFormVersion } from "@/lib/admissions/application-form-schema";
import { isApplyFormVersion } from "@/lib/admissions/application-forms";
import type { EnrollmentChecklistTemplate } from "@/lib/admissions/enrollment-checklist-templates";

export type FlowListSelection = {
  kind: "apply" | "checklist";
  id: string;
} | null;

export function shouldStartInEditor(params: {
  flowParam: string | null;
  applyIdParam: string | null;
  checklistIdParam: string | null;
  initialFlowSelection?: FlowListSelection;
  startOnOverview?: boolean;
}): boolean {
  if (params.initialFlowSelection) return true;
  if (params.startOnOverview === false) return true;
  if (params.applyIdParam || params.checklistIdParam) return true;
  if (params.flowParam === "apply" || params.flowParam === "checklist") return true;
  return false;
}

export function resolveFlowSelection(
  formRows: ApplicationFormVersion[],
  checklistRows: EnrollmentChecklistTemplate[],
  flowParam: string | null,
  applyIdParam: string | null,
  checklistIdParam: string | null,
  previous: FlowListSelection,
): FlowListSelection {
  if (
    checklistIdParam &&
    checklistRows.some((row) => row.id === checklistIdParam)
  ) {
    return { kind: "checklist", id: checklistIdParam };
  }
  if (applyIdParam && formRows.some((form) => form.id === applyIdParam)) {
    return { kind: "apply", id: applyIdParam };
  }

  const applyForm = formRows.find(
    (form) => isApplyFormVersion(form) && form.status !== "archived",
  );
  const checklist = checklistRows.find((row) => row.status !== "archived");

  if (flowParam === "checklist" && checklist) {
    return { kind: "checklist", id: checklist.id };
  }
  if (flowParam === "apply" && applyForm) {
    return { kind: "apply", id: applyForm.id };
  }

  if (
    previous?.kind === "apply" &&
    formRows.some((form) => form.id === previous.id)
  ) {
    return previous;
  }
  if (
    previous?.kind === "checklist" &&
    checklistRows.some((row) => row.id === previous.id)
  ) {
    return previous;
  }

  if (applyForm) return { kind: "apply", id: applyForm.id };
  if (checklist) return { kind: "checklist", id: checklist.id };
  if (formRows[0]) return { kind: "apply", id: formRows[0].id };
  if (checklistRows[0]) return { kind: "checklist", id: checklistRows[0].id };
  return null;
}

export function flowSelectionToSearchParams(
  selection: FlowListSelection,
): string {
  if (!selection) return "";
  const params = new URLSearchParams();
  if (selection.kind === "apply") {
    params.set("apply", selection.id);
  } else {
    params.set("checklist", selection.id);
  }
  return params.toString();
}
