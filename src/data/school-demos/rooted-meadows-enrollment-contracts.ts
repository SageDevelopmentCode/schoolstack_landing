export type EnrollmentContractSection = {
  id: string;
  title: string;
  body: string;
};

export type EnrollmentOutcomePathId =
  | "conditional-support"
  | "standard-enrollment"
  | "better-fit-referral";

export const ROOTED_MEADOWS_C1_SECTIONS: EnrollmentContractSection[] = [
  {
    id: "1-1",
    title: "1. Program Description & Schedule",
    body: "Rooted Meadows Waldorf School offers a nature-centered, play-based learning environment for Pre-K through Elementary students. Our program runs Monday through Friday, 8:00 AM to 3:00 PM, with optional after-care until 5:30 PM. Students participate in outdoor learning, project-based study, and community-focused activities aligned with each season.",
  },
  {
    id: "1-2",
    title: "2. Tuition & Payment Policy",
    body: "Tuition is due on the first of each month. A 5-day grace period is provided. Accounts more than 10 days past due may result in a temporary enrollment hold. Families experiencing hardship are encouraged to contact the director to discuss payment arrangements. All fees are non-refundable once the program month has begun.",
  },
  {
    id: "1-3",
    title: "3. Health & Wellness Standards",
    body: "Students must be symptom-free for 24 hours before returning to school after illness. Please do not send your child with fever, vomiting, or signs of a communicable illness. The school follows local public health guidance and may require additional protocols during community health events. Up-to-date immunization records or an approved exemption must be on file.",
  },
  {
    id: "1-4",
    title: "4. Acknowledgment & Agreement",
    body: "By signing below, I confirm that I have read and understand all sections of the Program Description and Key Policies document. I agree to the terms outlined herein and commit to supporting the Rooted Meadows community through my participation, communication, and adherence to the policies described.",
  },
];

export const ROOTED_MEADOWS_C2_SECTIONS: EnrollmentContractSection[] = [
  {
    id: "2-1",
    title: "1. Core Commitments",
    body: "As a member of the Rooted Meadows community, I commit to treating all students, staff, and families with dignity and respect. I will communicate concerns directly and constructively through appropriate channels, maintain confidentiality about individual children and families, and actively support a culture of inclusion, curiosity, and kindness.",
  },
  {
    id: "2-2",
    title: "2. Respectful Communication",
    body: "I agree to address disagreements or concerns calmly and directly with the appropriate staff member. I will refrain from posting negative or identifying comments about students, families, or staff on social media or other public platforms. I understand that repeated or serious violations of community communication standards may result in a required meeting with the director.",
  },
  {
    id: "2-3",
    title: "3. Acknowledgment",
    body: "By signing below, I confirm that I have read and agree to uphold the Rooted Meadows Community Agreement for the duration of my child's enrollment. I understand that this agreement exists to protect the safety, wellbeing, and dignity of every member of our school community.",
  },
];

const CONDITIONAL_PREFIX_SECTIONS: EnrollmentContractSection[] = [
  {
    id: "cs-1",
    title: "1. Collaborative Support Plan",
    body: "This agreement outlines a structured, collaborative support plan between Rooted Meadows Waldorf School and the family. Together we will identify specific developmental goals, classroom accommodations, and communication rhythms that support the child's successful integration into our program while honoring Waldorf principles of rhythm, reverence, and whole-child development.",
  },
  {
    id: "cs-2",
    title: "2. Trial Period & Review Checkpoints",
    body: "Enrollment begins with a six-to-eight-week trial period during which teachers and guides will observe the child's adaptation to classroom rhythm, social engagement, and developmental readiness. Formal review checkpoints occur at weeks three and six. At each checkpoint, the admissions team and lead guide will meet with the family to share observations and adjust the support plan as needed.",
  },
  {
    id: "cs-3",
    title: "3. Transition to Full Enrollment",
    body: "Upon successful completion of the trial period and collaborative review, the family may transition to the Standard Enrollment Agreement. If, at any checkpoint, the school and family determine that additional support or a different educational environment would better serve the child, Rooted Meadows will work thoughtfully with the family on next steps — including referrals to programs that may be a stronger fit.",
  },
];

export const ROOTED_MEADOWS_STANDARD_ENROLLMENT_SECTIONS: EnrollmentContractSection[] =
  [
    ...ROOTED_MEADOWS_C1_SECTIONS.map((s) => ({
      ...s,
      title: s.title.replace(/^\d+\.\s*/, (m) => m),
    })),
    ...ROOTED_MEADOWS_C2_SECTIONS.map((s, i) => ({
      ...s,
      id: `std-${s.id}`,
      title: `${ROOTED_MEADOWS_C1_SECTIONS.length + i + 1}. ${s.title.replace(/^\d+\.\s*/, "")}`,
    })),
  ];

export const ROOTED_MEADOWS_CONDITIONAL_SUPPORT_SECTIONS: EnrollmentContractSection[] =
  [
    ...CONDITIONAL_PREFIX_SECTIONS,
    ...ROOTED_MEADOWS_C1_SECTIONS.map((s, i) => ({
      ...s,
      id: `cond-${s.id}`,
      title: `${CONDITIONAL_PREFIX_SECTIONS.length + i + 1}. ${s.title.replace(/^\d+\.\s*/, "")}`,
    })),
    ...ROOTED_MEADOWS_C2_SECTIONS.map((s, i) => ({
      ...s,
      id: `cond-${s.id}`,
      title: `${CONDITIONAL_PREFIX_SECTIONS.length + ROOTED_MEADOWS_C1_SECTIONS.length + i + 1}. ${s.title.replace(/^\d+\.\s*/, "")}`,
    })),
  ];

export const ROOTED_MEADOWS_BETTER_FIT_REFERRAL_TEMPLATE = {
  subject: "Admissions update from Rooted Meadows Waldorf School",
  body: `Dear {{parentName}},

Thank you for sharing {{childName}} with us during the admissions process and for the care you have taken in exploring whether Rooted Meadows is the right fit for your family.

After thoughtful review — including your application and observation visit — we have determined that another educational environment may currently be a better fit for {{childName}}'s needs at this time. This decision reflects our commitment to placing each child where they can thrive, not a judgment about your family or your child's potential.

We would like to share a thoughtful suggestion that may align with what you are seeking:

{{schoolSuggestion}}

We are grateful for the opportunity to know your family and wish you warmth and clarity as you continue your search. Please do not hesitate to reach out if we can support you further.

With care,
The Admissions Team
Rooted Meadows Waldorf School`,
};

const REFERRAL_BODY_PARTS =
  ROOTED_MEADOWS_BETTER_FIT_REFERRAL_TEMPLATE.body.split("{{schoolSuggestion}}");

export const REFERRAL_TEMPLATE_PARTS = {
  subject: ROOTED_MEADOWS_BETTER_FIT_REFERRAL_TEMPLATE.subject,
  beforeSuggestionTemplate: REFERRAL_BODY_PARTS[0] ?? "",
  afterSuggestionTemplate: REFERRAL_BODY_PARTS[1] ?? "",
};

export function interpolateReferralTemplatePart(
  part: string,
  vars: { parentName: string; childName: string },
): string {
  return part
    .replace(/\{\{parentName\}\}/g, vars.parentName)
    .replace(/\{\{childName\}\}/g, vars.childName);
}

export function getReferralTemplateParts(
  parentName: string,
  childName: string,
): {
  subject: string;
  beforeSuggestion: string;
  afterSuggestion: string;
} {
  const vars = { parentName, childName };
  return {
    subject: ROOTED_MEADOWS_BETTER_FIT_REFERRAL_TEMPLATE.subject,
    beforeSuggestion: interpolateReferralTemplatePart(
      REFERRAL_TEMPLATE_PARTS.beforeSuggestionTemplate,
      vars,
    ),
    afterSuggestion: interpolateReferralTemplatePart(
      REFERRAL_TEMPLATE_PARTS.afterSuggestionTemplate,
      vars,
    ),
  };
}

export function formatSchoolSuggestionLine(schoolSuggestion?: string): string {
  const trimmed = schoolSuggestion?.trim();
  if (!trimmed) return "• [School name]";
  return trimmed.startsWith("•") ? trimmed : `• ${trimmed}`;
}

export type ParentPortalStep = { id: string; label: string };

export const ROOTED_MEADOWS_PARENT_PORTAL_STEPS: ParentPortalStep[] = [
  { id: "fees", label: "Fees" },
  { id: "forms", label: "Health forms" },
  { id: "release", label: "Photo release" },
  { id: "records", label: "Immunization" },
  { id: "agreements", label: "Agreements" },
];

export type EnrollmentPathConfig = {
  id: EnrollmentOutcomePathId;
  title: string;
  subtitle: string;
  parentPortalSteps?: ParentPortalStep[];
  documentTitle: string;
  sendLabel: string;
  kind: "contract" | "referral";
};

export const ROOTED_MEADOWS_ENROLLMENT_PATHS: EnrollmentPathConfig[] = [
  {
    id: "standard-enrollment",
    title: "Standard Enrollment Agreement",
    subtitle:
      "When the child is admitted into the program without the extra review path.",
    parentPortalSteps: ROOTED_MEADOWS_PARENT_PORTAL_STEPS,
    documentTitle: "Standard Enrollment Agreement",
    sendLabel: "Standard Enrollment Agreement",
    kind: "contract",
  },
  {
    id: "conditional-support",
    title: "Conditional Support Agreement",
    subtitle: "When the child is admissible with a collaborative support plan.",
    parentPortalSteps: ROOTED_MEADOWS_PARENT_PORTAL_STEPS,
    documentTitle: "Conditional Support Agreement",
    sendLabel: "Conditional Support Agreement",
    kind: "contract",
  },
  {
    id: "better-fit-referral",
    title: "Decline / better-fit school path",
    subtitle:
      "Not a contract — an admin outcome with a referral message when another environment may be a better fit.",
    documentTitle: "Referral message",
    sendLabel: "Better-fit referral",
    kind: "referral",
  },
];

export function getEnrollmentSendLabel(pathId: EnrollmentOutcomePathId): string {
  const path = ROOTED_MEADOWS_ENROLLMENT_PATHS.find((p) => p.id === pathId);
  return path?.sendLabel ?? pathId;
}

export function getEnrollmentContractSections(
  pathId: EnrollmentOutcomePathId,
): EnrollmentContractSection[] {
  switch (pathId) {
    case "conditional-support":
      return ROOTED_MEADOWS_CONDITIONAL_SUPPORT_SECTIONS;
    case "standard-enrollment":
      return ROOTED_MEADOWS_STANDARD_ENROLLMENT_SECTIONS;
    default:
      return [];
  }
}

export function applyEnrollmentTemplate(
  template: string,
  vars: { parentName: string; childName: string; schoolSuggestion?: string },
): string {
  return template
    .replace(/\{\{parentName\}\}/g, vars.parentName)
    .replace(/\{\{childName\}\}/g, vars.childName)
    .replace(
      /\{\{schoolSuggestion\}\}/g,
      formatSchoolSuggestionLine(vars.schoolSuggestion),
    );
}

export function getReferralEmailPreview(vars: {
  parentName: string;
  childName: string;
  schoolSuggestion?: string;
}): { subject: string; body: string } {
  return {
    subject: ROOTED_MEADOWS_BETTER_FIT_REFERRAL_TEMPLATE.subject,
    body: applyEnrollmentTemplate(
      ROOTED_MEADOWS_BETTER_FIT_REFERRAL_TEMPLATE.body,
      vars,
    ),
  };
}

export function getPostSendLeadUpdate(pathId: EnrollmentOutcomePathId): {
  status: string;
  message: string;
} {
  switch (pathId) {
    case "conditional-support":
      return {
        status: "enrolling",
        message: "Conditional support agreement sent — awaiting signature.",
      };
    case "standard-enrollment":
      return {
        status: "enrolling",
        message: "Enrollment agreement sent — awaiting signature.",
      };
    case "better-fit-referral":
      return {
        status: "referral",
        message: "Referred to better-fit programs.",
      };
  }
}
