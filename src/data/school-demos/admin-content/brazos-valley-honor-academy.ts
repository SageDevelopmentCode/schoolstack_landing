/** Admin content overrides for brazos-valley-honor-academy. */

export const demoEvents = [
  {
    id: "c1",
    title: "Spring Rodeo — Community Fundraiser",
    date: "2026-04-12",
    type: "event",
  },
  {
    id: "c2",
    title: "Visit Day — Prospective Families",
    date: "2026-04-18",
    type: "event",
  },
  {
    id: "c3",
    title: "September Tuition Invoice Review",
    date: "2026-04-11",
    type: "internal",
  },
  {
    id: "c4",
    title: "Enrollment & Assessment Fee Deadline",
    date: "2026-04-15",
    type: "deadline",
  },
  {
    id: "c5",
    title: "Christmas in the Country Planning",
    date: "2026-04-22",
    type: "event",
  },
];

export const demoLeads = [
  {
    id: "l0",
    type: "contact",
    name: "Sarah Mitchell",
    email: "smitchell@email.com",
    phone: "(832) 555-0142",
    childName: "Emma Mitchell",
    childAge: null,
    status: "new",
    tags: ["Schedule a Visit", "K–2", "Hybrid Model"],
    date: "12 minutes ago",
    message:
      "Interested in BVHA's three-day hybrid model for our kindergartener. Would like to schedule a visit and learn about tuition and enrollment fees.",
    flowId: "flow-5",
    responses: {
      f29: "Sarah Mitchell",
      f30: "smitchell@email.com",
      f31: "K–2",
      f32: "Emma Mitchell",
      f33: "Kindergarten",
    },
  },
  {
    id: "l1",
    type: "contact",
    name: "David Chen",
    email: "dchen@email.com",
    phone: "(979) 555-0198",
    childName: "Lucas Chen",
    childAge: 9,
    status: "new",
    tags: ["Grades 3–7", "Ability-Focused"],
    date: "45 minutes ago",
    message:
      "Our 4th grader needs a Christian education option with more individualized pacing. Curious about the Tue–Thu schedule and how ability-based learning works.",
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
    phone: "(832) 555-0218",
    childName: null,
    childAge: null,
    status: "contacted",
    tags: ["Schedule a Visit", "Sibling Discount"],
    date: "5 hours ago",
    message:
      "We have two children (2nd and 5th grade) and are interested in the sibling discount. Would like to visit and discuss enrollment for September.",
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
    subject: "Re: Visit request — Brazos Valley Honor Academy",
    preview: "Thank you for your interest in BVHA. We would love to schedule a visit...",
    date: "Today",
    unread: true,
  },
  {
    id: "e2",
    subject: "September tuition invoice — Mitchell family",
    preview: "Your monthly tuition invoice for September is ready for review...",
    date: "Yesterday",
    unread: false,
  },
  {
    id: "e3",
    subject: "Enrollment forms — Chen family",
    preview: "Here are the enrollment and assessment forms for Lucas...",
    date: "Apr 14",
    unread: false,
  },
];

export const admissionsSubtitle =
  "Review family inquiries about visits, the three-day hybrid model, tuition, and K–7 enrollment.";

export const adminContentOverrides = {
  demoLeads,
  demoEvents,
  demoEmails,
  admissionsSubtitle,
};
