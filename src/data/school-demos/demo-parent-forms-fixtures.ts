import type {
  ParentFormListItem,
  ParentFormResponseSummary,
  ParentFormsDocumentsPageBundle,
} from "@/lib/school-parent/forms-documents/types";
import type { TeacherParentForm } from "@/lib/school-teacher/forms-documents/types";
import { classifyParentFormListStatus } from "@/lib/school-parent/forms-documents/utils";
import {
  buildDemoTeacherForms,
  DEMO_FIELD_TRIP_FORM_ID,
} from "@/data/school-demos/demo-communication-fixtures";

/*
 * Parent demo › Forms & Documents (Sarah Mitchell). The demo's "today" is
 * Nov 21, 2026: one form due soon, one overdue, two signed, so the next-up,
 * overdue and progress cards all have something to show.
 */

function item(
  form: TeacherParentForm,
  status: ParentFormResponseSummary["status"],
  studentNames: string[],
  signedAt: string | null = null,
): ParentFormListItem {
  const response: ParentFormResponseSummary = {
    id: `demo-parent-response-${form.id}`,
    formId: form.id,
    status,
    signedAt,
    studentNames,
    responses: signedAt ? { signerName: "Sarah Mitchell" } : {},
  };
  return { form, response, listStatus: classifyParentFormListStatus(status) };
}

const ALLERGY_PLAN: TeacherParentForm = {
  id: "form-allergy-action-plan",
  title: "Allergy action plan",
  description: "Confirm Jake's allergy plan and emergency medication instructions for this year.",
  formType: "builder",
  formCategory: "general",
  status: "active",
  audienceType: "families",
  classroomIds: [],
  classroomNames: [],
  familyIds: ["family-mitchell"],
  familyNames: ["Mitchell Family"],
  dueDate: "2026-11-14",
  requireSignature: true,
  fields: [
    { id: "field-allergens", type: "short_text", label: "Known allergens", required: true },
    {
      id: "field-epipen",
      type: "multiple_choice",
      label: "Does your child carry an epinephrine auto-injector?",
      required: true,
      options: ["Yes", "No"],
    },
    { id: "field-allergy-signature", type: "signature", label: "Parent or guardian signature", required: true },
  ],
  totalFamilies: 1,
  signedFamilies: 0,
  createdAt: "2026-10-30T12:00:00.000Z",
  updatedAt: "2026-10-30T12:00:00.000Z",
};

const HANDBOOK: TeacherParentForm = {
  id: "form-family-handbook",
  title: "Family handbook acknowledgment",
  description: "Confirm you've read the 2026–27 family handbook.",
  formType: "builder",
  formCategory: "general",
  status: "active",
  audienceType: "families",
  classroomIds: [],
  classroomNames: [],
  familyIds: ["family-mitchell"],
  familyNames: ["Mitchell Family"],
  dueDate: "2026-09-05",
  requireSignature: true,
  fields: [
    {
      id: "field-handbook-ack",
      type: "checkbox",
      label: "I have read and agree to the family handbook.",
      required: true,
    },
    { id: "field-handbook-signature", type: "signature", label: "Parent or guardian signature", required: true },
  ],
  totalFamilies: 12,
  signedFamilies: 12,
  createdAt: "2026-08-20T12:00:00.000Z",
  updatedAt: "2026-09-02T12:00:00.000Z",
};

export function buildDemoParentFormsBundle(): ParentFormsDocumentsPageBundle {
  const teacherForms = buildDemoTeacherForms();
  const fieldTrip = teacherForms.find((form) => form.id === DEMO_FIELD_TRIP_FORM_ID);
  const photoRelease = teacherForms.find((form) => form.id === "form-photo-release");

  const items: ParentFormListItem[] = [];
  if (fieldTrip) {
    items.push(item({ ...fieldTrip, dueDate: "2026-11-25" }, "pending", ["Emma Mitchell"]));
  }
  items.push(item(ALLERGY_PLAN, "overdue", ["Jake Mitchell"]));
  if (photoRelease) {
    items.push(
      item(photoRelease, "signed", ["Emma Mitchell", "Jake Mitchell"], "2026-10-12T16:20:00.000Z"),
    );
  }
  items.push(
    item(HANDBOOK, "signed", ["Emma Mitchell", "Jake Mitchell", "Liam Mitchell"], "2026-09-02T18:05:00.000Z"),
  );
  return { items };
}
