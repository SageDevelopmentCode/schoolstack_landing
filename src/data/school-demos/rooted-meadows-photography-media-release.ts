import { addMarkdownSubsectionBreaks } from "@/lib/admissions/markdown-textarea";

export type EnrollmentContractSection = {
  id: string;
  title: string;
  body: string;
};

export type DocumentConsentOption = {
  value: string;
  label: string;
};

const ROOTED_MEADOWS_PHOTOGRAPHY_MEDIA_RELEASE_SECTIONS_RAW: EnrollmentContractSection[] = [
  {
    id: "photo-release-1",
    title: "Photography and Media Release",
    body: `## Purpose of Photography/Video

The school may photograph, film, or record students during school activities, events, or programs for educational, promotional, or informational purposes. Because of modern marketing practices, these pictures and videos are vital to being able to promote and demonstrate the capabilities and possibilities of our school for fundraising and enrollment. These images may appear in:

- School newsletters or yearbook
- School website or social media pages
- Classroom projects
- Local news media
- Printed promotional materials

## Permission and Release

Please read and select one option below.

### Full use permission

**YES, I give permission for full use of any pictures my child is in.**

I hereby give Rooted Meadows Waldorf School permission to photograph, video record, and/or audio record my child. I grant the school the right to use these images or recordings for the purposes listed above, without compensation.

I understand that my child's first name, grade level, or classroom may be used, but no other personal information will be shared without additional consent.

### Limited use permission

**ONLY use pictures where the front of my child's face is not exposed.**

This means your child might possibly be in a photo or video as an "extra" where their back or side is shown. I understand that the school will make reasonable efforts to try to exclude my child from photos and media materials, but sometimes they get caught in the action of a photo or video.

---

I certify that I am the parent or legal guardian and that I have the authority to grant permission.`,
  },
];

export const ROOTED_MEADOWS_PHOTOGRAPHY_MEDIA_RELEASE_SECTIONS: EnrollmentContractSection[] =
  ROOTED_MEADOWS_PHOTOGRAPHY_MEDIA_RELEASE_SECTIONS_RAW.map((section) => ({
    ...section,
    body: addMarkdownSubsectionBreaks(section.body),
  }));

export const ROOTED_MEADOWS_PHOTOGRAPHY_MEDIA_RELEASE_CONSENT_OPTIONS: DocumentConsentOption[] =
  [
    {
      value: "full_use",
      label: "YES, I give permission for full use of any pictures my child is in.",
    },
    {
      value: "no_face",
      label:
        "ONLY use pictures where the front of my child's face is not exposed.",
    },
  ];
