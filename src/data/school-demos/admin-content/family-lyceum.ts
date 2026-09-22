/** Admin content overrides for family-lyceum. */

export const demoEvents = [
  {
    id: "c1",
    title: "FIREFLY Preschool Open House",
    date: "2026-04-18",
    type: "event",
  },
  {
    id: "c2",
    title: "Campus Tour — Elementary & Junior High",
    date: "2026-04-22",
    type: "event",
  },
  {
    id: "c3",
    title: "Hybrid Schedule Q&A — New Families",
    date: "2026-04-11",
    type: "event",
  },
  {
    id: "c4",
    title: "Tuition Conversation Block — Renae",
    date: "2026-04-16",
    type: "event",
  },
  {
    id: "c5",
    title: "Field Trip — Utah State Capitol",
    date: "2026-04-25",
    type: "event",
  },
];

export const demoLeads = [
  {
    id: "l0",
    type: "contact",
    name: "Amanda Foster",
    email: "afoster@email.com",
    phone: "(801) 555-0142",
    childName: "Lily Foster",
    childAge: 4,
    status: "new",
    tags: ["FIREFLY", "Preschool", "Schedule a Conversation"],
    date: "18 minutes ago",
    message:
      "Interested in FIREFLY for our 4-year-old. Looking for a Montessori-inspired preschool with a caring community and small class sizes.",
    flowId: "flow-5",
    responses: {
      f29: "Amanda Foster",
      f30: "afoster@email.com",
      f31: "FIREFLY Preschool",
      f32: "Lily Foster",
      f33: "Age 4",
    },
  },
  {
    id: "l1",
    type: "contact",
    name: "Michael Torres",
    email: "mtorres@email.com",
    phone: "(801) 555-0198",
    childName: "Sofia Torres",
    childAge: 8,
    status: "new",
    tags: ["Elementary", "Hybrid Schedule"],
    date: "52 minutes ago",
    message:
      "We are exploring hybrid options for our 2nd grader. Curious about the Mon/Wed/Fri vs Tue/Thu/Fri tracks and how home days work.",
    flowId: "flow-3",
    responses: {
      f16: "Michael Torres",
      f17: "mtorres@email.com",
      f18: "Sofia Torres",
      f19: false,
    },
  },
  {
    id: "l2",
    type: "contact",
    name: "Rachel Kim",
    email: "rkim@email.com",
    phone: "(801) 555-0218",
    childName: "Ethan Kim",
    childAge: 13,
    status: "contacted",
    tags: ["Junior High", "FLARE & TORCH"],
    date: "4 hours ago",
    message:
      "Would like to schedule a conversation about junior high enrollment. Interested in the flipped classroom model and mentor expectations.",
    flowId: "flow-1",
    responses: {
      f1: "Rachel",
      f2: "Kim",
      f3: "rkim@email.com",
    },
  },
];

export const demoEmails = [
  {
    id: "e1",
    subject: "Re: FIREFLY preschool inquiry — Family Lyceum",
    preview: "Thank you for reaching out about FIREFLY enrollment...",
    date: "Today",
    unread: true,
  },
  {
    id: "e2",
    subject: "Hybrid schedule overview — Mon/Wed/Fri track",
    preview: "Here is an overview of the in-person and home learning rhythm...",
    date: "Yesterday",
    unread: false,
  },
  {
    id: "e3",
    subject: "Tuition & payment options — 2026–27",
    preview: "Following up on our conversation about part-time and full-time hybrid tuition...",
    date: "Apr 14",
    unread: false,
  },
];

export const admissionsSubtitle =
  "Review family inquiries about FIREFLY preschool, hybrid schedules, and junior high enrollment.";

export const adminContentOverrides = {
  demoLeads,
  demoEvents,
  demoEmails,
  admissionsSubtitle,
};
