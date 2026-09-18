/** Admin content overrides for acton-academy-placer. */

export const demoEvents = [
  {
    id: "c1",
    title: "Parent Info Session — Roseville Campus",
    date: "2026-04-18",
    type: "event",
  },
  {
    id: "c2",
    title: "Parent Info Session — Sacramento Campus",
    date: "2026-05-08",
    type: "event",
  },
  {
    id: "c3",
    title: "Learner Audition Day — Discovery Studio",
    date: "2026-04-25",
    type: "deadline",
  },
  {
    id: "c4",
    title: "Parent Guide Follow-Up Block",
    date: "2026-04-16",
    type: "internal",
  },
  {
    id: "c5",
    title: "Parent Info Session — Rocklin Campus",
    date: "2026-05-22",
    type: "event",
  },
];

export const demoLeads = [
  {
    id: "l0",
    type: "contact",
    name: "Sarah Mitchell",
    email: "smitchell@email.com",
    phone: "(916) 555-0142",
    childName: "Ethan Mitchell",
    childAge: 6,
    status: "new",
    tags: ["Threshold Studio", "Parent Guide", "Roseville Campus"],
    date: "12 minutes ago",
    message:
      "Downloaded the parent guide and would love to learn more about Threshold Studio. Our son seems bored in his current school.",
    flowId: "flow-5",
    responses: {
      f29: "Sarah Mitchell",
      f30: "smitchell@email.com",
      f31: "Threshold Studio",
      f32: "Ethan Mitchell",
      f33: "Age 6 / 1st grade",
    },
  },
  {
    id: "l1",
    type: "contact",
    name: "David Chen",
    email: "dchen@email.com",
    phone: "(916) 555-0198",
    childName: "Maya Chen",
    childAge: 4,
    status: "new",
    tags: ["Spark Studio", "Sacramento Campus", "Parent Info Session"],
    date: "45 minutes ago",
    message:
      "Interested in Spark Studio for our daughter. Would like to attend a parent info session at the Sacramento campus.",
    flowId: "flow-3",
    responses: {
      f16: "David Chen",
      f17: "dchen@email.com",
      f18: "Maya Chen",
      f19: false,
    },
  },
  {
    id: "l2",
    type: "contact",
    name: "Jennifer Walsh",
    email: "jwalsh@email.com",
    phone: "(916) 555-0218",
    childName: null,
    childAge: null,
    status: "contacted",
    tags: ["Discovery Studio", "Audition Process", "Rocklin Campus"],
    date: "3 hours ago",
    message:
      "Our 7th grader is stressed about grades and not engaged. We'd like to learn about the audition process and Discovery Studio.",
    flowId: "flow-1",
    responses: {
      f1: "Jennifer",
      f2: "Walsh",
      f3: "jwalsh@email.com",
      f4: "(916) 555-0218",
      f5: "Lucas Walsh",
      f6: "2012-03-15",
      f7: "7th",
      f8: "Discovery Studio",
      f9: "2026-08-01",
      f10: true,
    },
  },
  {
    id: "l3",
    type: "contact",
    name: "Amanda Brooks",
    email: "abrooks@email.com",
    phone: "(916) 555-0391",
    childName: "Tyler Brooks",
    childAge: 15,
    status: "scheduled",
    tags: ["Launchpad Studio", "Parent Info Session", "Roseville Campus"],
    date: "Yesterday",
    message:
      "Info session follow-up — family call scheduled to discuss Launchpad Studio and the audition process.",
    flowId: "flow-4",
    responses: {
      f20: "Amanda Brooks",
      f21: "abrooks@email.com",
      f22: "(916) 555-0391",
      f23: "Tyler Brooks",
      f24: "15",
      f25: "2026-04-22",
      f26: "10:00 AM",
      f27: "Launchpad Studio 2026–27",
      f28: "Family call scheduled — discuss learner-driven model and audition steps.",
    },
  },
  {
    id: "l4",
    type: "contact",
    name: "Rachel Nguyen",
    email: "rnguyen@email.com",
    phone: "(916) 555-0477",
    childName: null,
    childAge: null,
    status: "new",
    tags: ["Tuition", "Parent Guide", "Sacramento Campus"],
    date: "2 hours ago",
    message:
      "Requested the parent guide and have questions about tuition for two children at different studio levels.",
    flowId: "flow-3",
    responses: {
      f16: "Rachel Nguyen",
      f17: "rnguyen@email.com",
      f18: "Two learners",
      f19: false,
    },
  },
];

export const demoEmails = [
  {
    id: "em1",
    to: "All Enrolled Families",
    from: "admin@mudkitchen.co",
    subject: "Spring Studio Update — Placer Region Campuses",
    preview:
      "Learner exhibitions, parent info session dates, and audition reminders across Roseville, Sacramento, and Rocklin...",
    date: "2 days ago",
    body: `<p>Dear Acton Families,</p><p>Spring is in full swing across our Placer region campuses. Learners are wrapping up quests and preparing for upcoming exhibitions.</p><p>Reminder: parent info sessions are scheduled for April and May at each campus. Prospective families can also start with our free Parent Guide before attending.</p><p>Warm regards,<br/>Acton Academy Placer Team</p>`,
    attachments: ["spring_studio_update.pdf"],
  },
  {
    id: "em2",
    to: "smitchell@email.com",
    from: "admin@mudkitchen.co",
    subject: "Re: Parent Guide — Threshold Studio for Ethan",
    preview:
      "Thank you for your interest in Acton Academy Placer! We'd love to connect about Threshold Studio...",
    date: "1 hour ago",
    body: `<p>Hi Sarah,</p><p>Thank you for downloading the Parent Guide and reaching out about Threshold Studio for Ethan. We'd love to schedule a conversation to learn more about your family.</p><p>Our process typically begins with a parent info session, followed by a family meetup and learner audition day. Please reply with your preferred campus — Roseville, Sacramento, or Rocklin.</p><p>Best,<br/>Acton Academy Placer Admissions</p>`,
    attachments: [],
  },
  {
    id: "em3",
    to: "All Prospective Families",
    from: "admin@mudkitchen.co",
    subject: "Parent Info Sessions — April & May 2026",
    preview:
      "Join us to learn about learner-driven education, studio pathways, and the audition process...",
    date: "1 week ago",
    body: `<p>Dear Families,</p><h3>Upcoming Info Sessions</h3><ul><li>April 18 — Roseville campus</li><li>May 8 — Sacramento campus</li><li>May 22 — Rocklin campus</li></ul><h3>Tuition (confirm with school)</h3><ul><li>TK–8: $11,500 per year</li><li>Grades 9–12: $13,500 per year</li><li>11-month school calendar</li></ul><p>Start with our free Parent Guide or attend an info session to learn more.</p>`,
    attachments: ["parent_guide_overview.pdf"],
  },
  {
    id: "em4",
    to: "All Guides",
    from: "admin@mudkitchen.co",
    subject: "Admissions Flow Reminder — Info Session, Meetup, Audition",
    preview:
      "Reminder on the enrollment path for prospective families exploring Spark through Launchpad studios...",
    date: "2 weeks ago",
    body: `<p>Team,</p><p>Quick reminder on our admissions flow:</p><ol><li>Respond to parent guide and info session inquiries within 48 hours</li><li>Invite families to a parent info session at their preferred campus</li><li>Schedule a family meetup and learner audition day</li><li>Send application link after audition</li></ol><p>We serve ages 4–18 across Spark, Threshold, Discovery, and Launchpad studios at Roseville, Sacramento, and Rocklin campuses.</p>`,
    attachments: [],
  },
];

export const adminContentOverrides = {
  demoEvents,
  demoLeads,
  demoEmails,
  admissionsSubtitle:
    "Parent guide requests and info session signups for families exploring Spark, Threshold, Discovery, and Launchpad studios across Roseville, Sacramento, and Rocklin.",
};
