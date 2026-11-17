import type { PublicTourFieldType } from "@/lib/admissions/public-tour-settings";

/** Steps of the public tour page wizard (Schedule → Tours & interviews → Public tour page). */
export type PublicTourWizardStepId = "words" | "times" | "questions" | "share";

export type PublicTourWizardStep = {
  id: PublicTourWizardStepId;
  /** Short label in the stepper. */
  label: string;
  /** One line under the label in the stepper (sm and up). */
  hint: string;
  /** Heading of the step card. */
  title: string;
  /** One sentence under the heading. */
  lead: string;
};

export const PUBLIC_TOUR_WIZARD_STEPS: readonly PublicTourWizardStep[] = [
  {
    id: "words",
    label: "Words",
    hint: "Headline and intro",
    title: "Words families see first",
    lead: "Your headline and intro sit above the calendar on your tour page.",
  },
  {
    id: "times",
    label: "Times",
    hint: "Open tour times",
    title: "Open tour times",
    lead: "Families can only book times you open.",
  },
  {
    id: "questions",
    label: "Questions",
    hint: "Booking form",
    title: "Questions on the booking form",
    lead: "Families answer these after they pick a time.",
  },
  {
    id: "share",
    label: "Share",
    hint: "Send families the link",
    title: "Share your tour page",
    lead: "Send the link anywhere families ask about visiting.",
  },
] as const;

export const PUBLIC_TOUR_SHARE_IDEAS = [
  {
    id: "email",
    title: "Reply to families who ask about visits",
    body: "Paste the link into your email so they can pick a time themselves.",
  },
  {
    id: "newsletter",
    title: "Add it to your newsletter",
    body: "A short “Come and see us” line with the link brings in new families.",
  },
  {
    id: "website",
    title: "Put it on your school website",
    body: "Link a “Book a tour” button on your admissions page.",
  },
] as const;

export const PUBLIC_TOUR_FIELD_TYPE_LABELS: Record<PublicTourFieldType, string> = {
  text: "Short text",
  textarea: "Long text",
  email: "Email",
  phone: "Phone",
  select: "Dropdown",
  checkbox: "Checkbox",
  children_repeat: "Children list",
};

export const PUBLIC_TOUR_TURNED_OFF_COPY =
  "Your tour page is turned off. Use Need help? and we'll switch it on.";

export function questionCountLabel(total: number, required: number): string {
  const questions = `${total} ${total === 1 ? "question" : "questions"}`;
  return required > 0 ? `${questions} · ${required} required` : questions;
}
