import type { FaqItem } from "@/lib/faq";

/** FAQ on /features (also emitted as FAQPage JSON-LD). Facts checked against docs/features-research. */
export const FEATURES_FAQ: FaqItem[] = [
  {
    question: "Do admins, families and staff each get their own view?",
    answer:
      "Yes. School admins run the school from the admin portal. Families get a parent portal for billing, forms, messages and the calendar. Teachers get a staff portal for roll call, hours, students and messages. Everyone signs in to the same school.",
  },
  {
    question: "Is there a mobile app?",
    answer:
      "Yes. The MudKitchen app is on iPhone and Android for families, staff and admins. Everything also works in any web browser, on a phone or a computer.",
  },
  {
    question: "Can I turn features on and off?",
    answer:
      "Yes. We switch each portal's features on or off to match how your school runs, so families only see what you use. Some, like Committees for families, stay off until you're ready.",
  },
  {
    question: "Do the features share information?",
    answer:
      "Yes. A family enrolled through admissions flows into tuition and the parent portal. Classrooms decide who gets a form or signup. Teachers see their students' details. You don't copy data between tools.",
  },
  {
    question: "How do I see it with my own school?",
    answer:
      "Book a demo. You'll walk through MudKitchen with the founder who built it to run a real microschool, and see how each feature fits your school.",
  },
];
