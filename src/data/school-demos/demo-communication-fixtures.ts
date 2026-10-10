import type { TeacherClassroomOption } from "@/lib/classroom-signups/types";
import type { BulletinPost } from "@/lib/school-bulletin/types";
import type {
  TeacherFormSignatureRow,
  TeacherParentForm,
} from "@/lib/school-teacher/forms-documents/types";
import { DEMO_PORTAL_ORG_ID } from "@/data/school-demos/demo-portal-shared";

export const DEMO_PARENT_NIGHT_BULLETIN_ID = "bulletin-parent-night";
export const DEMO_BULLETIN_DRAFT_ID = "bulletin-picture-day";
export const DEMO_FIELD_TRIP_FORM_ID = "form-field-trip-permission";

const PARENT_NIGHT_BODY =
  "Join us Thursday, September 26 at 6:00 PM in the Community Room. Meet your child's teachers and see classroom work from the first month.";

function bulletinPost(
  post: Omit<BulletinPost, "organizationId" | "programIds" | "attachments"> &
    Partial<Pick<BulletinPost, "programIds" | "attachments">>,
): BulletinPost {
  return {
    organizationId: DEMO_PORTAL_ORG_ID,
    programIds: [],
    attachments: [],
    ...post,
  };
}

export function buildDemoParentNightBulletinPost(): BulletinPost {
  return bulletinPost({
    id: DEMO_PARENT_NIGHT_BULLETIN_ID,
    title: "Parent Night is Thursday",
    body: PARENT_NIGHT_BODY,
    status: "published",
    audiences: ["parents"],
    publishedAt: "2026-09-18T14:00:00.000Z",
    createdAt: "2026-09-18T13:00:00.000Z",
    updatedAt: "2026-09-18T14:00:00.000Z",
  });
}

export function buildDemoParentBulletinPosts(): BulletinPost[] {
  return [
    buildDemoParentNightBulletinPost(),
    bulletinPost({
      id: "bulletin-pickup",
      title: "Updated pickup procedures",
      body: "Please review the updated pickup procedures in the family handbook before Friday dismissal. No form is required.",
      status: "published",
      audiences: ["parents"],
      publishedAt: "2026-09-16T15:30:00.000Z",
      createdAt: "2026-09-16T15:00:00.000Z",
      updatedAt: "2026-09-16T15:30:00.000Z",
    }),
  ];
}

export function buildDemoAdminBulletinPosts(): BulletinPost[] {
  return [
    ...buildDemoParentBulletinPosts(),
    bulletinPost({
      id: DEMO_BULLETIN_DRAFT_ID,
      title: "Picture day is next Thursday",
      body: "Students should wear dress code. Families do not need to send anything — just have children on campus Thursday, October 16.",
      status: "draft",
      audiences: ["parents"],
      createdAt: "2026-10-08T16:00:00.000Z",
      updatedAt: "2026-10-08T16:20:00.000Z",
    }),
  ];
}

export function buildDemoTeacherFormClassrooms(): TeacherClassroomOption[] {
  return [
    { id: "classroom-oak", name: "Oak Room", familyCount: 12, role: "lead" },
    { id: "classroom-maple", name: "Maple Room", familyCount: 10, role: "lead" },
  ];
}

export function buildDemoTeacherForms(): TeacherParentForm[] {
  return [
    {
      id: DEMO_FIELD_TRIP_FORM_ID,
      title: "Botanical garden field trip permission",
      description: "Permission and signature for the May 9 garden visit.",
      formType: "builder",
      formCategory: "general",
      status: "active",
      audienceType: "classrooms",
      classroomIds: ["classroom-oak"],
      classroomNames: ["Oak Room"],
      familyIds: [],
      familyNames: [],
      dueDate: "2026-10-16",
      requireSignature: true,
      fields: [
        {
          id: "field-permission",
          type: "checkbox",
          label: "I give permission for my child to attend.",
          required: true,
        },
        {
          id: "field-signature",
          type: "signature",
          label: "Parent or guardian signature",
          required: true,
        },
      ],
      totalFamilies: 3,
      signedFamilies: 1,
      createdAt: "2026-09-20T12:00:00.000Z",
      updatedAt: "2026-10-02T12:00:00.000Z",
    },
    {
      id: "form-photo-release",
      title: "Picture day photo release",
      description: "Tell us whether your child's photo can appear in the yearbook.",
      formType: "builder",
      formCategory: "general",
      status: "active",
      audienceType: "families",
      classroomIds: [],
      classroomNames: [],
      familyIds: ["family-mitchell", "family-rivera", "family-chen"],
      familyNames: ["Mitchell Family", "Rivera Family", "Chen Family"],
      dueDate: "2026-10-24",
      requireSignature: true,
      fields: [
        {
          id: "field-release",
          type: "multiple_choice",
          label: "May we use your child's photo?",
          required: true,
          options: ["Yes", "No"],
        },
      ],
      totalFamilies: 3,
      signedFamilies: 2,
      createdAt: "2026-09-22T12:00:00.000Z",
      updatedAt: "2026-10-04T12:00:00.000Z",
    },
  ];
}

export function buildDemoTeacherFormResponses(): Record<string, TeacherFormSignatureRow[]> {
  return {
    [DEMO_FIELD_TRIP_FORM_ID]: [
      {
        id: "sig-field-trip-mitchell",
        formId: DEMO_FIELD_TRIP_FORM_ID,
        familyName: "Mitchell Family",
        studentNames: ["Emma Mitchell"],
        status: "signed",
        signedAt: "2026-10-02",
      },
      {
        id: "sig-field-trip-rivera",
        formId: DEMO_FIELD_TRIP_FORM_ID,
        familyName: "Rivera Family",
        studentNames: ["Emma Rivera"],
        status: "pending",
        signedAt: null,
      },
      {
        id: "sig-field-trip-chen",
        formId: DEMO_FIELD_TRIP_FORM_ID,
        familyName: "Chen Family",
        studentNames: ["Noah Chen"],
        status: "pending",
        signedAt: null,
      },
    ],
    "form-photo-release": [
      {
        id: "sig-photo-mitchell",
        formId: "form-photo-release",
        familyName: "Mitchell Family",
        studentNames: ["Emma Mitchell"],
        status: "signed",
        signedAt: "2026-10-03",
      },
      {
        id: "sig-photo-rivera",
        formId: "form-photo-release",
        familyName: "Rivera Family",
        studentNames: ["Emma Rivera"],
        status: "signed",
        signedAt: "2026-10-04",
      },
      {
        id: "sig-photo-chen",
        formId: "form-photo-release",
        familyName: "Chen Family",
        studentNames: ["Noah Chen"],
        status: "pending",
        signedAt: null,
      },
    ],
  };
}
