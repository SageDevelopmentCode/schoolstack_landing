/** Admin content overrides for freedom-prep-academy. */

export const demoEvents = [
  {
    id: "c1",
    title: "Enrollment Info Session — Online Guided Pathway",
    date: "2026-04-18",
    type: "event",
  },
  {
    id: "c2",
    title: "Microschool Open House — Mesa Area",
    date: "2026-04-22",
    type: "event",
  },
  {
    id: "c3",
    title: "Learning Center Visit Day — East Valley",
    date: "2026-04-25",
    type: "event",
  },
  {
    id: "c4",
    title: "2026–27 Enrollment Application Review",
    date: "2026-04-15",
    type: "deadline",
  },
  {
    id: "c5",
    title: "Family Support Guide Check-ins — April",
    date: "2026-04-16",
    type: "internal",
  },
];

export const demoLeads = [
  {
    id: "l0",
    type: "contact",
    name: "Miriam Hernandez",
    email: "mhernandez@email.com",
    phone: "(480) 555-0187",
    childName: "Sofia Hernandez",
    childAge: null,
    status: "new",
    tags: ["Microschools", "K–5", "Mesa"],
    date: "8 minutes ago",
    message:
      "Interested in a microschool option for our 3rd grader. We want small-group learning with a caring guide and flexibility for our family schedule.",
    flowId: "flow-5",
    responses: {
      f29: "Miriam Hernandez",
      f30: "mhernandez@email.com",
      f31: "Microschools",
      f32: "Sofia Hernandez",
      f33: "3rd Grade",
    },
  },
  {
    id: "l1",
    type: "contact",
    name: "James Okonkwo",
    email: "jokonkwo@email.com",
    phone: "(602) 555-0143",
    childName: "Aiden Okonkwo",
    childAge: 13,
    status: "new",
    tags: ["Online Guided", "6–8", "85224"],
    date: "32 minutes ago",
    message:
      "Looking for online guided instruction with live support for our 7th grader. Need a flexible schedule that still includes regular advisor check-ins.",
    flowId: "flow-3",
    responses: {
      f16: "James Okonkwo",
      f17: "jokonkwo@email.com",
      f18: "Aiden Okonkwo",
      f19: false,
    },
  },
  {
    id: "l2",
    type: "contact",
    name: "Lisa Tran",
    email: "ltran@email.com",
    phone: "(623) 555-0291",
    childName: null,
    childAge: null,
    status: "contacted",
    tags: ["Learning Centers", "9–12", "85301"],
    date: "3 hours ago",
    message:
      "Our high schooler learns online but needs in-person connection a few days a week. Curious about learning center locations and activities near Glendale.",
    flowId: "flow-1",
    responses: {
      f1: "Lisa",
      f2: "Tran",
      f3: "ltran@email.com",
    },
  },
];

export const demoEmails = [
  {
    id: "e1",
    subject: "Re: Microschool inquiry — Freedom Prep Academy",
    preview: "Thank you for reaching out about microschool options in the Mesa area...",
    date: "Today",
    unread: true,
  },
  {
    id: "e2",
    subject: "2026–27 Enrollment — Online Guided pathway overview",
    preview: "Here is an overview of our online guided program and next steps...",
    date: "Yesterday",
    unread: false,
  },
  {
    id: "e3",
    subject: "Learning Center visit — East Valley scheduling",
    preview: "We have availability for a learning center visit next week...",
    date: "Apr 14",
    unread: false,
  },
];

export const admissionsSubtitle =
  "Review family inquiries about learning pathways, grade bands, and enrollment for Arizona K–12 families.";

export const adminContentOverrides = {
  demoLeads,
  demoEvents,
  demoEmails,
  admissionsSubtitle,
};
