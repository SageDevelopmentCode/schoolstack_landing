/** Admin content overrides for roots-and-wings-microschool. */

export const demoEvents = [
  {
    id: "c1",
    title: "K–2 Family Conversation — New Inquiries",
    date: "2026-04-18",
    type: "event",
  },
  {
    id: "c2",
    title: "Friday Field Trip — Desert Botanical Garden",
    date: "2026-04-25",
    type: "event",
  },
  {
    id: "c3",
    title: "Q2 ESA Tuition Invoice Review",
    date: "2026-04-11",
    type: "internal",
  },
  {
    id: "c4",
    title: "Parent Progress Updates — April",
    date: "2026-04-15",
    type: "deadline",
  },
  {
    id: "c5",
    title: "Enrollment Conversation Block — Julie",
    date: "2026-04-16",
    type: "event",
  },
];

export const demoLeads = [
  {
    id: "l0",
    type: "contact",
    name: "Sarah Mitchell",
    email: "smitchell@email.com",
    phone: "(480) 555-0142",
    childName: "Emma Mitchell",
    childAge: null,
    status: "new",
    tags: ["K–2 Availability", "ESA", "Schedule a Conversation"],
    date: "12 minutes ago",
    message:
      "Interested in K–2 availability for our kindergartener. Looking for a smaller school with more individualized support and ongoing parent feedback.",
    flowId: "flow-5",
    responses: {
      f29: "Sarah Mitchell",
      f30: "smitchell@email.com",
      f31: "K–2 Program",
      f32: "Emma Mitchell",
      f33: "Kindergarten",
    },
  },
  {
    id: "l1",
    type: "contact",
    name: "David Chen",
    email: "dchen@email.com",
    phone: "(602) 555-0198",
    childName: "Lucas Chen",
    childAge: 8,
    status: "new",
    tags: ["Grades 3–8", "ESA"],
    date: "45 minutes ago",
    message:
      "Our 3rd grader needs more personalized attention than his current school provides. Curious about schedule, ESA funding, and how technology is used.",
    flowId: "flow-3",
    responses: {
      f16: "David Chen",
      f17: "dchen@email.com",
      f18: "Lucas Chen",
      f19: false,
    },
  },
  {
    id: "l2",
    type: "contact",
    name: "Jennifer Walsh",
    email: "jwalsh@email.com",
    phone: "(480) 555-0218",
    childName: null,
    childAge: null,
    status: "contacted",
    tags: ["K–2 Availability", "North Mesa"],
    date: "5 hours ago",
    message:
      "Would like to schedule a conversation about enrollment for our 1st grader. Interested in the hands-on learning approach.",
    flowId: "flow-1",
    responses: {
      f1: "Jennifer",
      f2: "Walsh",
      f3: "jwalsh@email.com",
    },
  },
];

export const demoEmails = [
  {
    id: "e1",
    subject: "Re: K–2 availability inquiry — Roots and Wings Microschool",
    preview: "Thank you for reaching out about K–2 enrollment...",
    date: "Today",
    unread: true,
  },
  {
    id: "e2",
    subject: "ESA tuition invoice — Q2 2026",
    preview: "Your quarterly tuition invoice is ready for review...",
    date: "Yesterday",
    unread: false,
  },
  {
    id: "e3",
    subject: "April progress update — Emma Mitchell",
    preview: "Here is an update on Emma's reading and math progress...",
    date: "Apr 14",
    unread: false,
  },
];

export const admissionsSubtitle =
  "Review family inquiries about K–2 availability, ESA funding, and enrollment conversations.";

export const adminContentOverrides = {
  demoLeads,
  demoEvents,
  demoEmails,
  admissionsSubtitle,
};
