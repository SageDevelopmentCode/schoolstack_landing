import { rootedMeadowsConfig } from "./rooted-meadows";

export type ApplicationFieldType =
  | "text"
  | "email"
  | "tel"
  | "date"
  | "select"
  | "textarea"
  | "radio"
  | "checkbox"
  | "file";

export interface ApplicationFieldOption {
  value: string;
  label: string;
}

export interface ApplicationField {
  id: string;
  label: string;
  type: ApplicationFieldType;
  placeholder?: string;
  required?: boolean;
  width?: "full" | "half";
  options?: ApplicationFieldOption[];
  rows?: number;
  helpText?: string;
}

export interface ApplicationSection {
  id: string;
  title: string;
  description?: string;
  fields: ApplicationField[];
}

export interface ApplicationAcknowledgment {
  id: string;
  label: string;
}

export const ROOTED_MEADOWS_APPLICATION_FEE = "$50";

export const ROOTED_MEADOWS_APPLICATION_COPY = {
  schoolName: "Rooted Meadows Waldorf School",
  externalLinkNote: "Linked from Apply Now on your school website",
  applicationFor: "Application for Rooted Meadows Waldorf School",
  heading: "Begin Your Application",
  intro:
    "We are honored that you are considering Rooted Meadows School for your child's educational journey. This application helps us get to know your child, your family, and whether our program is the right fit to support your child's growth with care and integrity.",
  helper:
    "Please complete the form below and upload any supporting documents that apply to your child. Complete and accurate information helps us thoughtfully consider whether Rooted Meadows is well equipped to support your child's social, emotional, and academic success. A $50 non-refundable application fee is collected at the end of this form.",
  documentsLabel: "Supporting documents",
  documentsHelp:
    "Upload any evaluations, reports, or other documents that help us understand your child's needs (optional at this stage).",
  saveAndContinue: "Save and continue",
  back: "Back",
  payApplicationFee: "Pay application fee",
} as const;

const gradeOptions = (
  rootedMeadowsConfig.form.studentFields?.gradeOptions ?? [
    { value: "k", label: "Kindergarten" },
    { value: "1", label: "1st Grade" },
    { value: "2", label: "2nd Grade" },
    { value: "3", label: "3rd Grade" },
    { value: "4", label: "4th Grade" },
    { value: "5", label: "5th Grade" },
    { value: "6", label: "6th Grade" },
    { value: "7", label: "7th Grade" },
    { value: "8", label: "8th Grade" },
  ]
).map((option) => ({ value: option.value, label: option.label }));

const communicationOptions: ApplicationFieldOption[] = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone call" },
  { value: "text", label: "Text message" },
];

export const ROOTED_MEADOWS_APPLICATION_SECTIONS: ApplicationSection[] = [
  {
    id: "parent-guardian",
    title: "Parent / Guardian Information",
    fields: [
      {
        id: "parentName",
        label: "Parent/guardian full name",
        type: "text",
        required: true,
        width: "half",
      },
      {
        id: "relationship",
        label: "Relationship to child",
        type: "text",
        required: true,
        width: "half",
      },
      {
        id: "email",
        label: "Email address",
        type: "email",
        required: true,
        width: "half",
      },
      {
        id: "phone",
        label: "Phone number",
        type: "tel",
        required: true,
        width: "half",
      },
      {
        id: "addressLine1",
        label: "Address line 1",
        type: "text",
        required: true,
        placeholder: "Street address",
      },
      {
        id: "addressLine2",
        label: "Address line 2",
        type: "text",
        placeholder: "Apt, suite, unit, etc. (optional)",
      },
      {
        id: "city",
        label: "City",
        type: "text",
        required: true,
        width: "half",
      },
      {
        id: "state",
        label: "State",
        type: "text",
        required: true,
        width: "half",
        placeholder: "ID",
      },
      {
        id: "zipCode",
        label: "ZIP code",
        type: "text",
        required: true,
        width: "half",
      },
      {
        id: "secondParent",
        label: "Second parent/guardian information",
        type: "textarea",
        rows: 3,
        placeholder: "Name, relationship, email, and phone (if applicable)",
      },
      {
        id: "preferredCommunication",
        label: "Preferred method of communication",
        type: "select",
        required: true,
        options: communicationOptions,
      },
      {
        id: "supportingDocuments",
        label: ROOTED_MEADOWS_APPLICATION_COPY.documentsLabel,
        type: "file",
        helpText: ROOTED_MEADOWS_APPLICATION_COPY.documentsHelp,
      },
    ],
  },
  {
    id: "student",
    title: "Student Information",
    fields: [
      {
        id: "childFullName",
        label: "Child full name",
        type: "text",
        required: true,
        width: "half",
      },
      {
        id: "preferredName",
        label: "Preferred name",
        type: "text",
        width: "half",
      },
      {
        id: "dateOfBirth",
        label: "Date of birth",
        type: "date",
        required: true,
        width: "half",
      },
      {
        id: "applyingGrade",
        label: "Applying grade",
        type: "select",
        required: true,
        width: "half",
        options: gradeOptions,
      },
      {
        id: "currentSetting",
        label: "Current school or educational setting",
        type: "text",
        required: true,
      },
      {
        id: "priorPrograms",
        label:
          "Has your child previously attended a school, microschool, homeschool, or learning program?",
        type: "radio",
        required: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "priorProgramsDetail",
        label: "If yes, please describe",
        type: "textarea",
        rows: 3,
      },
    ],
  },
  {
    id: "fit-and-support",
    title: "About Your Child & Family Fit",
    description:
      "Help us understand your family's goals and whether Rooted Meadows can support your child's growth. Complete and accurate information is essential to our admissions review.",
    fields: [
      {
        id: "whyRootedMeadows",
        label:
          "Why are you interested in Rooted Meadows, and what draws your family to a Waldorf-guided education?",
        type: "textarea",
        rows: 4,
        required: true,
      },
      {
        id: "childStrengths",
        label:
          "How would you describe your child's strengths, temperament, and interests?",
        type: "textarea",
        rows: 4,
        required: true,
      },
      {
        id: "partnershipHopes",
        label:
          "What are you hoping for in your child's school experience, and what kind of partnership do you want with the school?",
        type: "textarea",
        rows: 4,
        required: true,
      },
      {
        id: "readinessAndConcerns",
        label:
          "How does your child do socially with peers, and how do they respond to structure, transitions, and new environments?",
        type: "textarea",
        rows: 4,
        required: true,
      },
      {
        id: "supportNeeds",
        label:
          "Are there any academic, emotional, behavioral, sensory, or developmental concerns — including IEPs, 504 plans, evaluations, diagnoses, or outside therapies — we should understand?",
        type: "textarea",
        rows: 4,
        placeholder: "Share anything relevant, or write “None” if not applicable.",
      },
      {
        id: "observationSupport",
        label:
          "Is there anything that would help us support your child safely and appropriately during an observation visit?",
        type: "textarea",
        rows: 3,
        placeholder: "Optional",
      },
    ],
  },
];

export const ROOTED_MEADOWS_APPLICATION_ACKNOWLEDGMENTS: ApplicationAcknowledgment[] =
  [
    {
      id: "ackAdmissions",
      label:
        "I understand that admission is based on developmental readiness and observation, that complete and accurate information is essential to the review, and that Rooted Meadows must be able to meet my child's needs.",
    },
    {
      id: "ackHandbook",
      label:
        "I understand that all accepted families must read the Family Handbook prior to signing the enrollment contract.",
    },
  ];

/** Section 0 complete + partial section 1 — Sarah Whitmore (Applying). */
export const ROOTED_MEADOWS_DEMO_APPLYING_RESPONSES: Record<string, string> = {
  parentName: "Sarah Whitmore",
  relationship: "Mother",
  email: "jwalsh@email.com",
  phone: "(512) 555-0198",
  addressLine1: "184 Meadow Lane",
  addressLine2: "",
  city: "Boise",
  state: "ID",
  zipCode: "83702",
  secondParent: "James Whitmore — Father — jwhitmore@email.com — (512) 555-0199",
  preferredCommunication: "email",
  supportingDocuments: "ella_prior_school_summary.pdf",
  childFullName: "Ella Whitmore",
  preferredName: "Ella",
  dateOfBirth: "2017-04-12",
  applyingGrade: "3",
};

/** All sections complete — Sarah Whitmore (post-observation, Needs Contract). */
export const ROOTED_MEADOWS_DEMO_SARAH_COMPLETE_RESPONSES: Record<string, string> = {
  ...ROOTED_MEADOWS_DEMO_APPLYING_RESPONSES,
  currentSetting: "Public school (2nd grade, half-day)",
  priorPrograms: "yes",
  priorProgramsDetail:
    "Attended a traditional elementary school for first and second grade before exploring Waldorf-guided options.",
  whyRootedMeadows:
    "We want a smaller, Waldorf-guided environment where Ella can learn at a natural pace. The observation visit confirmed this feels like the right fit for our family.",
  childStrengths:
    "Creative, thoughtful, and drawn to art and outdoor play. Ella listens well in small groups and connects easily with gentle routines.",
  partnershipHopes:
    "We hope for a school that partners with parents and honors childhood. We want rhythm, clear communication, and a nurturing classroom culture.",
  readinessAndConcerns:
    "Ella did well during her observation visit and engaged warmly with the classroom rhythm. She may need a moment to warm up in new social settings.",
  supportNeeds: "None",
  observationSupport:
    "Ella responded well when a guide greeted her one-on-one before joining the group — helpful for future transitions.",
};

/** All sections complete — Diana Foster (Booking). */
export const ROOTED_MEADOWS_DEMO_BOOKING_RESPONSES: Record<string, string> = {
  parentName: "Diana Foster",
  relationship: "Mother",
  email: "diana@email.com",
  phone: "(512) 555-0142",
  addressLine1: "902 Willow Creek Rd",
  addressLine2: "Unit B",
  city: "Boise",
  state: "ID",
  zipCode: "83706",
  secondParent: "",
  preferredCommunication: "text",
  supportingDocuments: "",
  childFullName: "Noah Foster",
  preferredName: "Noah",
  dateOfBirth: "2020-03-14",
  applyingGrade: "k",
  currentSetting: "Homeschool co-op (2 days/week)",
  priorPrograms: "yes",
  priorProgramsDetail:
    "Participated in a local homeschool co-op for the past year with mixed-age group learning.",
  whyRootedMeadows:
    "We want a smaller, relationship-based school with a Waldorf rhythm. Noah thrives with hands-on learning and time outdoors.",
  childStrengths:
    "Curious, gentle, loves building and storytelling. Does well in small groups and responds warmly to calm routines.",
  partnershipHopes:
    "We hope for a school that partners with parents and honors childhood. We want clear communication and a nurturing classroom culture.",
  readinessAndConcerns:
    "Noah adjusts well to new environments when transitions are explained. He can be shy at first but opens up with familiar faces.",
  supportNeeds: "None",
  observationSupport:
    "A brief one-on-one hello before joining the group would help him feel comfortable.",
};

export const ROOTED_MEADOWS_APPLICATION_SECTION_COUNT =
  ROOTED_MEADOWS_APPLICATION_SECTIONS.length;
