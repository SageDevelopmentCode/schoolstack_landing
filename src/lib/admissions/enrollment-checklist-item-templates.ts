import { ROOTED_MEADOWS_STANDARD_ENROLLMENT_SECTIONS } from "@/data/school-demos/rooted-meadows-enrollment-contracts";
import { newAdmissionsId } from "./application-form-schema";
import {
  createChecklistItemKey,
  type ChecklistItemType,
  type EnrollmentChecklistItem,
} from "./enrollment-checklist-schema";

export type ChecklistItemTemplateId =
  | "standard_enrollment_agreement"
  | "photo_release"
  | "assumption_of_risk"
  | "health_emergency_form"
  | "medication_plan"
  | "immunization_records"
  | "health_information"
  | "authorized_pickup"
  | "registration_fee";

export type ChecklistItemTemplate = {
  id: ChecklistItemTemplateId;
  label: string;
  description: string;
  type: ChecklistItemType;
  required: boolean;
  build: () => EnrollmentChecklistItem;
};

const PHOTO_RELEASE_SECTIONS = [
  {
    id: "5-1",
    title: "1. Permission to Photograph & Record",
    body: "I, the undersigned parent or legal guardian, hereby grant permission to photograph, video record, and otherwise capture images or likenesses of my child during school activities, programs, field trips, events, and related educational experiences.",
  },
  {
    id: "5-2",
    title: "2. Scope of Use",
    body: "All photographs, videos, and other media captured by school staff are the property of the school. The school may edit, crop, or enhance media for use in materials including the website, social media, newsletters, and print publications.",
  },
  {
    id: "5-3",
    title: "3. Parent/Guardian Acknowledgment",
    body: "By signing below, I confirm my selected consent level and release the school from any claims arising from the use of photographs or recordings of my child as described in this agreement.",
  },
];

const ASSUMPTION_OF_RISK_SECTIONS = [
  {
    id: "6-1",
    title: "Releasor Acknowledgment & Signature",
    body: "I, the undersigned parent or legal guardian, acknowledge that participation in school programs involves inherent risks including but not limited to outdoor and nature-based activities, physical movement, and field excursions. I voluntarily assume all such risks and release the school from any liability for injury or loss arising from participation in school activities.",
  },
];

function buildFromTemplate(
  template: Pick<ChecklistItemTemplate, "label" | "type" | "required">,
  overrides: Partial<EnrollmentChecklistItem> = {},
): EnrollmentChecklistItem {
  const id = newAdmissionsId();
  return {
    id,
    itemKey: createChecklistItemKey(template.label),
    label: template.label,
    type: template.type,
    required: template.required,
    metadata: {},
    ...overrides,
  };
}

const TEMPLATE_DEFS: Omit<ChecklistItemTemplate, "build">[] = [
  {
    id: "standard_enrollment_agreement",
    label: "Standard Enrollment Agreement",
    description: "Multi-section agreement with per-section signatures.",
    type: "document_sign",
    required: true,
  },
  {
    id: "photo_release",
    label: "Photo Release Form",
    description: "Consent levels with signature acknowledgment.",
    type: "document_sign",
    required: true,
  },
  {
    id: "assumption_of_risk",
    label: "Assumption of Risk",
    description: "Warning banner with liability release signature.",
    type: "document_sign",
    required: true,
  },
  {
    id: "health_emergency_form",
    label: "Emergency Contact, Health & Immunization Form",
    description: "Emergency contacts, physician, and insurance fields.",
    type: "form",
    required: true,
  },
  {
    id: "medication_plan",
    label: "Emergency Medication Plan",
    description: "Medication details with parent signature.",
    type: "form",
    required: false,
  },
  {
    id: "immunization_records",
    label: "Proof of Immunizations",
    description: "Families upload immunization records.",
    type: "file_upload",
    required: true,
  },
  {
    id: "health_information",
    label: "Health Information Form",
    description: "Health exam options with parent signature.",
    type: "acknowledgment",
    required: true,
  },
  {
    id: "authorized_pickup",
    label: "Additional Authorized Pickup",
    description: "Authorized pickup contacts with signature.",
    type: "form",
    required: false,
  },
  {
    id: "registration_fee",
    label: "Pay Registration Fee",
    description: "Collect a one-time enrollment fee.",
    type: "payment",
    required: true,
  },
];

function buildItemForTemplate(def: Omit<ChecklistItemTemplate, "build">): EnrollmentChecklistItem {
  switch (def.id) {
    case "standard_enrollment_agreement":
      return buildFromTemplate(def, {
        document: {
          kind: "inline_sections",
          sections: ROOTED_MEADOWS_STANDARD_ENROLLMENT_SECTIONS.map((s) => ({
            ...s,
            id: newAdmissionsId(),
          })),
        },
      });
    case "photo_release":
      return buildFromTemplate(def, {
        document: {
          kind: "inline_sections",
          sections: PHOTO_RELEASE_SECTIONS.map((s) => ({
            ...s,
            id: newAdmissionsId(),
          })),
          consentOptions: [
            { value: "FULL", label: "Full consent — all uses described above" },
            { value: "LIMITED", label: "Limited consent — internal use only" },
            { value: "NO", label: "No consent — do not photograph my child" },
          ],
        },
      });
    case "assumption_of_risk":
      return buildFromTemplate(def, {
        document: {
          kind: "inline_sections",
          sections: ASSUMPTION_OF_RISK_SECTIONS.map((s) => ({
            ...s,
            id: newAdmissionsId(),
          })),
          showWarningBanner: true,
        },
      });
    case "health_emergency_form":
      return buildFromTemplate(def, {
        formSchema: {
          id: newAdmissionsId(),
          title: def.label,
          fields: [
            { id: newAdmissionsId(), label: "Emergency contact name", type: "text", required: true },
            { id: newAdmissionsId(), label: "Emergency contact phone", type: "tel", required: true },
            { id: newAdmissionsId(), label: "Relationship to child", type: "text", required: true },
            { id: newAdmissionsId(), label: "Physician name", type: "text", required: true },
            { id: newAdmissionsId(), label: "Clinic / practice", type: "text", required: true },
            { id: newAdmissionsId(), label: "Physician phone", type: "tel", required: true },
            { id: newAdmissionsId(), label: "Insurance provider", type: "text", required: false },
            { id: newAdmissionsId(), label: "Policy number", type: "text", required: false },
            { id: newAdmissionsId(), label: "Preferred hospital", type: "text", required: false },
          ],
        },
      });
    case "medication_plan":
      return buildFromTemplate(def, {
        required: false,
        formSchema: {
          id: newAdmissionsId(),
          title: def.label,
          fields: [
            { id: newAdmissionsId(), label: "Medication name", type: "text", required: true },
            { id: newAdmissionsId(), label: "Condition / reason", type: "text", required: true },
            { id: newAdmissionsId(), label: "Dosage & instructions", type: "textarea", required: true, rows: 3 },
          ],
        },
      });
    case "immunization_records":
      return buildFromTemplate(def, {
        fileUpload: {
          accept: ".pdf,.jpg,.jpeg,.png",
          maxFiles: 3,
          helpText: "Upload your child's immunization records or exemption documentation.",
        },
      });
    case "health_information":
      return buildFromTemplate(def, {
        acknowledgment: {
          body: "Please select the option that applies to your child's most recent health examination, then sign below.",
          options: [
            {
              value: "A",
              label:
                "Option A — My child has had a health examination within the past 12 months.",
            },
            {
              value: "B",
              label:
                "Option B — I will provide proof of a health examination within 30 days of enrollment.",
            },
          ],
        },
      });
    case "authorized_pickup":
      return buildFromTemplate(def, {
        required: false,
        formSchema: {
          id: newAdmissionsId(),
          title: def.label,
          fields: [
            { id: newAdmissionsId(), label: "Authorized person name", type: "text", required: true },
            { id: newAdmissionsId(), label: "Relationship", type: "text", required: true },
            { id: newAdmissionsId(), label: "Phone number", type: "tel", required: true },
          ],
        },
      });
    case "registration_fee":
      return buildFromTemplate(def, {
        payment: {
          label: "Registration fee",
          amountCents: 15000,
        },
      });
  }
}

export const CHECKLIST_ITEM_TEMPLATES: ChecklistItemTemplate[] = TEMPLATE_DEFS.map(
  (def) => ({
    ...def,
    build: () => buildItemForTemplate(def),
  }),
);

export function createDefaultChecklistItems(): EnrollmentChecklistItem[] {
  const defaultIds: ChecklistItemTemplateId[] = [
    "standard_enrollment_agreement",
    "health_emergency_form",
    "medication_plan",
    "immunization_records",
    "health_information",
    "photo_release",
    "assumption_of_risk",
    "authorized_pickup",
    "registration_fee",
  ];
  return defaultIds.map((id) => createItemFromTemplate(id));
}

export function createItemFromTemplate(
  templateId: ChecklistItemTemplateId,
): EnrollmentChecklistItem {
  const template = CHECKLIST_ITEM_TEMPLATES.find((t) => t.id === templateId);
  if (!template) throw new Error(`Unknown template: ${templateId}`);
  return template.build();
}
