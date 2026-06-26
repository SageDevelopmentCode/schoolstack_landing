import type { ApplicationField } from "./rooted-meadows-application";

export const ROOTED_MEADOWS_OBSERVATION_COPY = {
  heading: "Reserve Your Child's Observation Visit",
  intro:
    "The best way for us to understand whether Rooted Meadows is the right fit for your child is to observe them in an educational setting. Please select an available time below for your child's observation visit. This visit helps us thoughtfully consider your child's developmental readiness and whether our current program is well equipped to support their needs. After the observation, you will receive an admissions update from our team.",
  dateTimeHeading: "Select a Date & Time",
  dateTimeSubheading: "Pick a day or time that works for your family",
  reserveObservation: "Reserve observation",
  confirmationHeading: "Observation reserved",
  confirmation:
    "Your child's observation has been reserved. Our team will follow up with any preparation details and next steps.",
  confirmationNoActionNeeded:
    "You're all set — no further action is needed from you right now.",
  confirmationChangePrompt: "Need to make a change?",
  confirmationReschedule: "Reschedule",
  confirmationCancel: "Cancel visit",
  confirmationQuestionsPrefix: "Questions?",
  confirmationEmail: "admissions@rootedmeadows.org",
  confirmationPhone: "(208) 557-1316",
  confirmationEmailCta: "Email us",
  confirmationPhoneCta: "Call (208) 557-1316",
} as const;

export const ROOTED_MEADOWS_OBSERVATION_FIELDS: ApplicationField[] = [
  {
    id: "preferredAdult",
    label: "Preferred adult attending",
    type: "text",
    placeholder: "Full name of parent or guardian attending",
    required: true,
    width: "full",
  },
  {
    id: "childNeedsSupport",
    label: "Child needs support during visit?",
    type: "radio",
    required: true,
    width: "full",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "visitNotes",
    label: "Anything we should know before the visit?",
    type: "textarea",
    placeholder: "Allergies, accommodations, or other helpful context",
    rows: 3,
    width: "full",
  },
];

export function getDefaultObservationDate(
  availability: Record<string, string[]>,
  minDate: string,
): string | null {
  return (
    Object.keys(availability)
      .filter((date) => date >= minDate && availability[date]?.length)
      .sort()[0] ?? null
  );
}

const AFTERNOON_SLOTS = ["3:30 PM", "4:00 PM", "4:30 PM"];

function buildMockAvailability(): Record<string, string[]> {
  const slots: Record<string, string[]> = {};
  const start = new Date(2026, 5, 1);
  const end = new Date(2026, 6, 31);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day === 0 || day === 6) continue;

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    slots[key] = AFTERNOON_SLOTS;
  }

  return slots;
}

export const ROOTED_MEADOWS_OBSERVATION_AVAILABILITY = buildMockAvailability();
