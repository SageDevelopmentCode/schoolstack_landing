import type { ApplicationSection } from "@/lib/admissions/application-form-schema";

const SEVERITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

function allergyFields(index: number) {
  const prefix = `allergy_${index}`;
  return [
    {
      id: `${prefix}`,
      label: `Allergy ${index}`,
      type: "text" as const,
      required: false,
      placeholder: "Food or environmental allergy",
    },
    {
      id: `${prefix}_severity`,
      label: `Allergy ${index} — severity`,
      type: "radio" as const,
      required: false,
      options: SEVERITY_OPTIONS,
    },
    {
      id: `${prefix}_treatment`,
      label: `Allergy ${index} — treatment`,
      type: "textarea" as const,
      required: false,
      rows: 2,
      placeholder: "Treatment used in case of a reaction",
    },
  ];
}

function conditionFields(index: number) {
  const prefix = `condition_${index}`;
  return [
    {
      id: `${prefix}`,
      label: `Medical condition ${index}`,
      type: "text" as const,
      required: false,
      placeholder: "Chronic medical condition or special need",
    },
    {
      id: `${prefix}_treatment`,
      label: `Medical condition ${index} — treatment or therapies`,
      type: "textarea" as const,
      required: false,
      rows: 2,
    },
  ];
}

function emergencyContactFields(index: number) {
  const prefix = `emergency_contact_${index}`;
  return [
    {
      id: `${prefix}_name`,
      label: `Emergency contact ${index} — full name`,
      type: "text" as const,
      required: true,
    },
    {
      id: `${prefix}_address`,
      label: `Emergency contact ${index} — address`,
      type: "address" as const,
      required: true,
    },
    {
      id: `${prefix}_phone`,
      label: `Emergency contact ${index} — telephone number`,
      type: "tel" as const,
      required: true,
    },
  ];
}

export const ROOTED_MEADOWS_HEALTH_EMERGENCY_FORM_SCHEMA: ApplicationSection = {
  id: "health-emergency",
  title: "Health & Emergency",
  description:
    "Please list all food or environmental diagnosed allergies that your child has, including the severity of the reaction and what treatment is used in case of a reaction. Please list any chronic medical conditions or special needs the child has and any treatment or therapy we should be aware of.",
  fields: [
    ...allergyFields(1),
    ...allergyFields(2),
    ...allergyFields(3),
    ...conditionFields(1),
    ...conditionFields(2),
    {
      id: "medication_self_admin",
      label: "Student self-administration",
      type: "checkbox",
      required: false,
      helpText:
        "As a parent, I understand that Rooted Meadows Waldorf School teachers cannot administer medication, without permission from parents, to students other than emergency life-saving medications. I have discussed with my child the safety and dosage requirements of self-administering their medication. The medication needs to be registered at the office and will be stored with the teacher in a locked cabinet.",
    },
    {
      id: "medication_authorized_adult",
      label: "Authorized adult administration",
      type: "checkbox",
      required: false,
      helpText:
        "I have explained to the child's main teacher the procedure for administering the needed medications to my child and authorize him/her to administer medications that are registered in the school system during school hours.",
    },
    ...emergencyContactFields(1),
    ...emergencyContactFields(2),
    {
      id: "parent_signature",
      label: "Parent/Guardian signature (type full legal name)",
      type: "text",
      required: true,
      helpText:
        "I certify that I am the parent or legal guardian and that all information provided is accurate and complete to the best of my knowledge. I authorize Rooted Meadows Waldorf School to take necessary action in case of a medical emergency involving my child according to the Emergency Medical Authorization stated above.",
    },
  ],
  stepNotice: {
    placement: "bottom",
    body: "In the event of an emergency where I cannot be reached, I authorize Rooted Meadows Waldorf School to obtain and provide emergency medical treatment for me or my child as deemed necessary, including first aid, CPR, and emergency transport. I understand that I am responsible for all medical expenses incurred and that the School and its representatives are not liable for any costs or outcomes associated with such treatment.",
  },
};
