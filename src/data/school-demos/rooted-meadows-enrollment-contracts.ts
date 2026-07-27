import { addMarkdownSubsectionBreaks } from "@/lib/admissions/markdown-textarea";

export type EnrollmentContractSection = {
  id: string;
  title: string;
  body: string;
};

export type EnrollmentOutcomePathId =
  | "conditional-support"
  | "standard-enrollment"
  | "better-fit-referral";

const ROOTED_MEADOWS_STANDARD_ENROLLMENT_SECTIONS_RAW: EnrollmentContractSection[] = [
  {
    id: "std-1",
    title: "Enrollment Agreement, Definitions, and Tuition",
    body: `## Rooted Meadows School Enrollment Agreement

Rooted Meadows School welcomes you and your child(ren) into our Waldorf educational community. We are eager to partner with you to create an incredible and rich learning environment for your child(ren).

## Vision & Mission

At the Rooted Meadows School, we envision our Waldorf community will be a stabilizing force of goodness and wellness as they love life and learning, feel compassionately, and act purposefully in their stewardship for their families and the world.

By embracing the body, mind and soul of each human, grounding in core virtues of character, and guided by Rudolph Steiner's principles applicable to childhood education and community, we can provide a rich environment that enables children and the community to be courageous, creative and a caring connection between humanity, the earth, and themselves.

This Enrollment Agreement outlines the terms, conditions, and expectations necessary to support and sustain our school, our mission and vision, and the quality of education at Rooted Meadows School (RMS), a private institution providing Waldorf education for grades K-8 in Rigby, Idaho.

By signing, parents or legal guardians acknowledge their obligations regarding tuition, fees, community participation, and adherence to school policies. This agreement is binding and ensures the school's operational stability.

*Note: Some sentences within this enrollment agreement are italicized; those sentences are purely informational and are not legally binding.*

## Definitions

1. **Agreement** — This Rooted Meadows School Enrollment Agreement.
2. **RMS** — The Rooted Meadows School legal entity, and when applicable, school administrators or school campus temporarily located at 3833 E 200 N, Rigby, ID.
3. **Child(ren)** — The student(s) enrolled under this Agreement. When terms address Child(ren) individually, "Child" will be used.
4. **You** — The parent(s) or guardian(s) of the Child(ren) who sign, or are otherwise bound by, this Agreement.
5. **Contracted School Year** — 2026/27 School Year

## Acceptance and Reservation

1. To be enrolled at RMS and have a spot reserved, each Child, or You on behalf of each Child, must have: (1) received an official form of acceptance from RMS, (2) signed the Rooted Meadows School Enrollment agreement, and (3) paid a $500 supplies fee + $150 activities fee within 2 weeks of receiving the Enrollment contract.
2. The activities + supplies fees are nonrefundable. This fee is critical for teachers to obtain materials needed for the upcoming school year and demonstrates meaningful commitment from parents and guardians, both of which are essential for a successful school year.

## New Student Trial Period and Placement Review

To ensure our educational environment is a supportive match, all newly enrolled students enter under a six-week trial period for ongoing observation and review. Because Rooted Meadows is not currently equipped to offer extensive, formal special education resources, we can only admit and retain students whose needs can be met with care and integrity within our standard classroom setting.

If, after enrollment, Rooted Meadows faculty and staff determine that additional information would help us better understand a child's learning needs, families may be asked to obtain further evaluation, at their own expense, and share the results with the school.

When recommendations include accommodations, therapeutic services, or academic support, our faculty and staff will carefully determine what can be realistically and readily supported within the school's current resources. In some cases, a child may benefit from outside services, such as speech or occupational therapy, which are arranged and funded by the family. Note that arrangements must not interfere with main lesson attendance.

If at any point in time, we determine that the scope and depth of support a child needs is beyond our offerings and resources, then it is our responsibility and right to terminate the child's enrollment and equip the family with information and suggestions for educational plans that we feel will support the child and ensure they have meaningful access to their education moving forward.

## Tuition and Incidental Charges

1. Tuition for each Child is due on the 1st of every month during the Contracted School Year. Tuition for each Child is due every month during the Contracted School Year even in cases of absence due to illness, travel, etc. Predictable payments to RMS are necessary to provide a consistent, high quality education for our students. As a courtesy, RMS will email you about a week before the 1st of each month.
2. If RMS has not received a tuition payment for each Child in full by the 10th of a month, You will pay a late fee of $50. And if you fail to pay tuition and late fees by the end of the month, RMS may determine Child(ren) cannot attend RMS until the owed balance is paid in full. If tuition remains unpaid by the 10th of the following month the outstanding balance will again accrue another late fee of $50 per month until paid in full.
3. Incidental Charges, which are occasional costs that include but are not limited to trip fees, festivals, personal supply or merchandise purchases, and event costs, that occur during a month are due the 1st of the following month. All other timelines, late fees, and obligations concerning late tuition described above also apply to the late payments of Incidental Charges.
4. You will pay a $25 service charge if payment check or ACH is returned by the bank for insufficient funds.
5. Child(ren)'s re-enrollment at RMS any year following the Contracted School Year is contingent upon full satisfaction of any unpaid balances You owe to RMS.
6. All tuition and Incidental Charges are nonrefundable. You agree to pay all amounts explicitly due under this Agreement and all costs caused by failure to pay those amounts including but not limited to collection fees, mediation costs, and attorney's fees, if applicable.

By signing below, I/we acknowledge that I/we have read and understood the terms above and agree to the tuition and incidental charge obligations described herein.`,
  },
  {
    id: "std-2",
    title: "Tuition Summary, Additional Fees, and Withdrawal",
    body: `## Tuition Summary

Full Names will show once contract selections are made.

### Tuition

Grade 5 — $7,200.00

### Additional Fees

**Supply Fee**

- Supply fee: $500.00
- Selection TBD

**Activity Fee**

- Activity fee: $150.00
- Selection TBD

### Total Cost

(includes $0.00 initial payment due at signing)

## Additional Fees

**Supply Fee**

Supply fee is due upon signing of the contract to reserve your child's spot.

**Activity Fee**

Activity fee is due no later than July 1, 2026 to maintain your reservation.

## Withdrawal and Termination

1. The cost of providing education is not lessened by the failure of a student to attend classes. By signing this contract, you agree unconditionally, unless due to reasons stated in section 2, to pay tuition, fees, and other charges for the full academic year unless the school receives in writing, on or before June 30th for the upcoming contracted school year of 2026/27 a notification of withdrawal of the student from the school for the upcoming school year. This tuition agreement covers the entire academic school year. Previously paid fees and deposits are non refundable.
2. To withdraw Child(ren) during the Contracted School Year, a 30-day written notice is required. Tuition, at the same regular tuition level, will continue to be owed every month of the Contracted School Year until the child's vacant spot is filled, unless withdrawal is due to the tuition payee(s) loss of work or death, or a work-required relocation out of a reasonable commuting distance of 40 minutes from RMS (measured by standard driving time from RMS's address).
3. RMS may exclude any Child from attendance, temporarily or permanently, under any circumstances deemed at the sole and exclusive discretion of RMS, if said attendance is to be interfering with the health, safety or educational development of the Child or any other student(s), or whose progress or conduct is unsatisfactory to School policy, or are more than 30 days past due on payment of tuition or other fees owed to the school. RMS further reserves the right to deny continued enrollment, or re-enrollment, to any Child if RMS reasonably concludes that Your actions (including inappropriate verbal, written or email communications) are inconsistent or are non-supportive of the educational environment or counterproductive to a positive working relationship between RMS and that student's parents or guardians.

Such exclusion is the last resort option and appropriate efforts for resolution will be made to help rectify the situation and continue the student's enrollment in RMS. Decisions under this clause will be made after consulting with the parent or guardian and with the guidance of the Pedagogical Council and the School Policy Handbooks, determining if the continued enrollment of one or more Child(ren) is not in the best interest of the other children in the class or RMS, or Your involvement or in some cases lack of involvement is not supportive to the school community's mission and vision. Such decisions will include written notice and an opportunity for a meeting with RMS and such as outlined in the School Policy Handbook.

In this circumstance — due to the financial obligations RMS maintains each year and the cash flow that is based on the number of students enrolled at the beginning of the school year, the remaining tuition obligation will be 50% of the previously determined tuition for each relevant Child each month, until the Child's vacant spot is filled or the Contracted School Year ends. Fees and tuition deposits are nonrefundable.

By signing below, I/we acknowledge that I/we have read and understood the tuition summary, additional fees, and withdrawal and termination terms described herein.`,
  },
  {
    id: "std-3",
    title: "Community and Classroom Support",
    body: `## Community and Classroom Support

1. Your example, involvement, and support of the school community and the Waldorf educational philosophy is an integral part of enrolling Child(ren) at RMS. Your support as a member of the school community's mission and vision includes participating, to the best of Your abilities, in the activities and work of RMS which includes but not limited to festivals, support in the classroom, fundraising activities, serving on a committee, and volunteering as needs arise.
2. You understand that at RMS, the parent-teacher relationship and understanding is paramount, and it is essential that You understand the Waldorf curriculum and its underlying Steiner philosophy. And to properly support the teachers in their work with Your Child(ren), You agree to attend: regularly scheduled class meetings, once a semester educational forums whether online or in person, and parent-teacher conferences during the Contracted School Year. (For more details on community expectations see the Parent & Student Handbook.)
3. You will promote and contribute to our annual donations campaign to whatever extent You determine your family is fiscally able, and volunteer and participate at fundraiser events.

Tuition and fees do not fully cover the cost of educating children at our school, but rather represents our desire to make a Waldorf education accessible to as broad a population as possible.

By signing below, I/we acknowledge that I/we have read and understood the community and classroom support expectations described herein and agree to participate to the best of our abilities.`,
  },
  {
    id: "std-4",
    title: "Indemnification and Conditional Operational Benchmarks",
    body: `## Indemnification

1. You are responsible, upon written request of RMS, for the replacement cost of any supplies, materials or equipment which Your Child(ren) breaks or damages.
2. You agree that RMS and its agents, officers, employees, and designees are not responsible for damages to or theft of personal property brought onto the RMS campus.
3. You agree to waive, release, discharge, indemnify and hold harmless RMS from any claims for damages, death, personal injury, or property damage which You or your child(ren) may have or may accrue as a result of participation in RMS's programs and related activities and events. RMS agrees to perform all duties and responsibilities necessary to maintain a safe, secure, and supervised environment, and will take reasonable measures to ensure the safety and well-being of all children in its care. You agree to Your Child(ren)'s participation in RMS's programs and related activities, and acknowledge that You assume all risks of harm, whether known or unknown.
4. If You or Your Child(ren), or Your agents, employees, or designees, through negligence or an intentional act, cause injuries, damages, or losses to RMS, RMS personnel, or students, parents, teachers, administrators, or third parties associated with or visiting the RMS campus, You agree to indemnify RMS against those losses including but not limited to attorney's fees, costs, and damages.

## Conditional Operational Benchmarks

### Conditional Operations, Program Modifications, and Delayed Opening

Rooted Meadows reserves the right to modify its schedule, alter planned programs, or delay the opening of the school year if minimum enrollment and funding thresholds are not met. The operational benchmarks and sequential steps are outlined as follows:

- **Step 1: Program Simplification** — In the event of insufficient enrollment or funding to sustain the initially planned faculty and facility costs, Rooted Meadows' first course of action will be to simplify the school schedule and faculty and reduce extracurricular programs.
- **Step 2: Delayed Opening** — If simplification is insufficient to ensure financial viability, opening may be delayed subject to the following benchmarks:
  - **Fall Term Benchmark:** To open for the standard school year on August 17th, Rooted Meadows must secure a minimum of 35 enrolled students and $85,555 in funding by July 31st, before the 1st tuition payment is due.
  - **Winter Term Benchmark (Delayed Start):** If the July 31st benchmarks are not met, operations will be postponed. To open for a delayed start on January 5th, Rooted Meadows must achieve a minimum of 35 enrolled students and $85,555 in funding by December 1st.

### Refund and Re-enrollment Policy for Delayed Start

If Rooted Meadows must trigger a delayed start on July 31st and you choose to enroll your student in a different school rather than waiting for the January 5th opening, the Supplies and Activities fees will be fully refunded. Families who opt for a refund retain the right to re-enroll their student for the January 5th start date, provided the December 1st benchmarks are met and space is available.

By signing below, I/we acknowledge that I/we have read and understood the indemnification terms and conditional operational benchmarks described herein.`,
  },
  {
    id: "std-5",
    title: "General Provisions, Payment Plan, and Final Acknowledgment",
    body: `## General Provisions

1. **Calendar:** RMS does not follow the Jefferson County School Districts calendar.
2. **Data Privacy:** RMS handles student and family information with respect and privacy in compliance with applicable laws to nonprofit private educational organizations.
3. **Incorporated Documents:** The Parent and Student Handbook is incorporated into the terms of this Agreement by reference and all terms and conditions in the Parent and Student Handbook apply to this Agreement. You agree to accept the policies, rules, and regulations of RMS as stated in the Parent and Student Handbook, and elsewhere, and as modified from time to time. RMS will attempt to make changes applicable only to the next Contracted School Year, however, when deemed necessary, changes may be made effective immediately and notice of changes to the Handbook will be communicated in writing electronically.
4. **Non-Discrimination:** RMS admits students without regard to race, color, national origin, sex, or religion. Acceptance is subject to RMS's ability to meet the student's educational needs.
5. **Force Majeure:** RMS will do its best to remain open as long as we are not mandated by a governing body to close, and we have sufficient staffing and funding to effectively operate. In the case of forced or necessitated closure, RMS's duties and obligations under this Agreement shall be suspended immediately without notice during all periods that RMS is closed because of force majeure events including, but not limited to, any fire, act of God, war, governmental action, act of terrorism, epidemic, pandemic or any other event beyond RMS's control. If such an event occurs, RMS's duties and obligations under this Agreement may be immediately postponed/suspended without notice until such time as RMS, in its sole discretion, may safely reopen and resume performance. RMS may also alter its calendar and scheduled vacations, and/or extend the Contracted School Year, in its sole discretion as needed in response to the above stated incident. Sole financial remedy for a force majeure event is future service as determined by the school and not a tuition refund.
6. **Governing Law:** This Agreement is governed by the laws of the State of Idaho.
7. **Severability:** If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions continue in full force and effect.
8. **Dispute Resolution:** Any disputes arising under this Agreement are first addressed through good-faith mediation before pursuing arbitration or litigation.
9. **Entire Agreement and Amendments:** This contract constitutes the entire agreement between the parties; any amendments must be made in writing and signed by both parties.
10. **Binding Agreement:** This agreement is binding and effective upon You, and Your agents, successors, and assignees. You confirm that You have read this document in full before signing it and understand that it is a binding legal obligation.

## Payment Plan

### 1 Pay Plan

- August 1 — 100% of tuition

### 2 Pay Plan

- August 1 — 50% of tuition
- February 1 — 50% of tuition

### 10 Pay Plan

- August 1 — 10% of tuition
- September 1 — 10% of tuition
- October 1 — 10% of tuition
- November 1 — 10% of tuition
- December 1 — 10% of tuition
- January 1 — 10% of tuition
- February 1 — 10% of tuition
- March 1 — 10% of tuition
- April 1 — 10% of tuition
- May 1 — 10% of tuition

### Monthly Payment Plan

- August 1 — 8.33% of tuition
- September 1 — 8.33% of tuition
- October 1 — 8.33% of tuition
- November 1 — 8.33% of tuition
- December 1 — 8.33% of tuition
- January 1 — 8.33% of tuition
- February 1 — 8.33% of tuition
- March 1 — 8.33% of tuition
- April 1 — 8.33% of tuition
- May 1 — 8.33% of tuition
- June 1 — 8.33% of tuition
- July 1 — 8.37% of tuition

## Sign and Complete Your Contract

This agreement shall be binding and effective upon the undersigned, their agents, successors, and assignees. The undersigned, (each) being parent(s) or guardian(s) of the child(ren) named above, states that he and/or she has read this document in full before signing it and understands that it is a binding legal obligation.

By signing below, I/we confirm that I/we have read this Enrollment Agreement in full and understand that it is a binding legal obligation.`,
  },
];

export const ROOTED_MEADOWS_STANDARD_ENROLLMENT_SECTIONS: EnrollmentContractSection[] =
  ROOTED_MEADOWS_STANDARD_ENROLLMENT_SECTIONS_RAW.map((section) => ({
    ...section,
    body: addMarkdownSubsectionBreaks(section.body),
  }));

const ROOTED_MEADOWS_CONDITIONAL_SUPPORT_SECTIONS_RAW: EnrollmentContractSection[] = [
  {
    id: "cond-addendum-1",
    title: "Addendum: Conditional Enrollment & Support Requirements",
    body: `Due to possible concerns from the observation or parents noting previous learning needs, this Enrollment Contract is contingent upon the completion of the following requirements. Failure to meet these conditions by 6th week of classes may result in the rescission of admission or a revision of the student's placement.

- **Submission of Professional Evaluations:** The Parent/Guardian agrees to have their child closely observed by their classroom teacher and if determined needed, have a comprehensive neurodevelopmental or psychoeducational evaluation, or a speech-language/literacy assessment, or any other needed evaluation to be able to provide learning and classroom accommodations. The Parent/Guardian will provide Rooted Meadows School with official copies of any of the observations completed.

- **Development of a Personalized Education Plan (PEP):** Continued enrollment is subject to the successful development and implementation of a PEP if determined needed. The Parent/Guardian agrees to participate in a pedagogical consultation with the classroom teacher and school leadership to determine necessary and realistic classroom accommodations.

- **Acknowledgment of Service Limits:** Rooted Meadows School at this time can provide basic specialized support through the Idaho Public School system if desired or the Parent/Guardian acknowledges that if the student's needs need external support they can seek private professional care at the family's expense as a condition of continued attendance.

- **Progress Review:** Our goal is to always ensure that a child is in a setting where they can access their education. If we determine that a child is not making adequate progress after 3 months using the PEP in place then we will work with the teacher and parent to create an amended PEP or terminate the child's enrollment and support the parents as they transition to an academic setting that is better equipped to support the child.

By signing below, I/we acknowledge that I/we have read and understood the conditions of this admission and agree to provide the required documentation and participation within the specified timeframe.`,
  },
];

export const ROOTED_MEADOWS_CONDITIONAL_SUPPORT_SECTIONS: EnrollmentContractSection[] =
  ROOTED_MEADOWS_CONDITIONAL_SUPPORT_SECTIONS_RAW.map((section) => ({
    ...section,
    body: addMarkdownSubsectionBreaks(section.body),
  }));

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
