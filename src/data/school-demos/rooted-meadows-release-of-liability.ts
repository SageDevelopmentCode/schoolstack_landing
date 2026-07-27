import { addMarkdownSubsectionBreaks } from "@/lib/admissions/markdown-textarea";

export type EnrollmentContractSection = {
  id: string;
  title: string;
  body: string;
};

const ROOTED_MEADOWS_RELEASE_OF_LIABILITY_SECTIONS_RAW: EnrollmentContractSection[] = [
  {
    id: "liability-1",
    title: "Release of Liability & Indemnity",
    body: `This Waiver, Release of Liability and Indemnity (hereinafter "Agreement") is entered into by and between Rooted Meadows Waldorf School ("School") and the undersigned participant(s) and/or their parent(s) or guardian(s) ("Participant" or "Releasor"). This Agreement includes and applies to the homeowners (school hosts), affiliates, managers, members, agents, teachers, assistants, staff, volunteers, and other representatives of Rooted Meadows Waldorf School.

## Waiver and Release of Liability

By signing this Agreement, I, the undersigned Participant or parent/guardian of a minor Participant, acknowledge and assume the inherent risks associated with all activities at Rooted Meadows Waldorf School, including but not limited to participation in classes and on the school farm, field trips, transportation, and other school-related events, activities, or clubs, the above hereafter known as ("Activities").

I hereby release, discharge, indemnify and hold harmless Rooted Meadows Waldorf School, its homeowners (school hosts), teachers, assistants, agents, staff, and volunteers from any and all liability, claims, or causes of action, known or unknown, for injuries, damages, or losses of any kind arising from my or my child's participation in the Activities. This release includes, but is not limited to, claims arising from the negligence of the School or its representatives.

I understand and agree that my participation, or my child's participation, is voluntary and entirely at our own risk. I also agree to indemnify and hold harmless the Rooted Meadows Waldorf School, its homeowners (school hosts), teachers, assistants, agents, staff, and volunteers against any and all claims, suits, or actions brought by me, my child, or anyone on our behalf for damages or injuries related to the Activities. In addition, I agree to indemnify and hold harmless the Rooted Meadows Waldorf School, its homeowners (school hosts), teachers, assistants, agents, staff, and volunteers against any and all claims, suits, or actions brought by a health care provider for Participant or Releasor or Participant's child for subrogation or health care reimbursement purposes.

## Indemnification and Notice of Activities

I consent to my child's participation in all school activities, including transportation-related events with the understanding that I will be informed of such activities through notices sent home, via email or other communication platform, or at teacher-parent meetings. I agree to indemnify and hold harmless the school and all associated with the named school for any liability arising from these activities and acknowledge that it is my responsibility to ensure receipt of these notices.

## Duration and Governing Law

This Agreement remains in effect for the duration of my or my child's participation in any and all School activities whether enrolled or not in the school.

---

I certify that I am the parent or legal guardian and that I accept and agree to the terms stated above.`,
  },
];

export const ROOTED_MEADOWS_RELEASE_OF_LIABILITY_SECTIONS: EnrollmentContractSection[] =
  ROOTED_MEADOWS_RELEASE_OF_LIABILITY_SECTIONS_RAW.map((section) => ({
    ...section,
    body: addMarkdownSubsectionBreaks(section.body),
  }));
