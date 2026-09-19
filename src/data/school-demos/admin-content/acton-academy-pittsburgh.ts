/** Admin content overrides for acton-academy-pittsburgh. */

export const demoEvents = [
  {
    id: "c1",
    title: "Campus Tour — Wexford Studio",
    date: "2026-04-18",
    type: "event",
  },
  {
    id: "c2",
    title: "Scholarship Info Session",
    date: "2026-05-08",
    type: "event",
  },
  {
    id: "c3",
    title: "Pre-K–8 Application Review",
    date: "2026-04-11",
    type: "internal",
  },
  {
    id: "c4",
    title: "Learner Visit Day — Elementary Studio",
    date: "2026-05-15",
    type: "deadline",
  },
  {
    id: "c5",
    title: "Book-a-Call Follow-Up Block — Meghan",
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
    phone: "(724) 555-0142",
    childName: "Ethan Mitchell",
    childAge: 6,
    status: "new",
    tags: ["Elementary Studio", "Book a Call", "Pre-K–8 Application"],
    date: "12 minutes ago",
    message:
      "Our son seems bored in his current school and we'd love to learn more about the learner-driven model. Interested in Elementary Studio for fall enrollment.",
    flowId: "flow-5",
    responses: {
      f29: "Sarah Mitchell",
      f30: "smitchell@email.com",
      f31: "Elementary Studio",
      f32: "Ethan Mitchell",
      f33: "Age 6 / 1st grade",
    },
  },
  {
    id: "l1",
    type: "contact",
    name: "David Chen",
    email: "dchen@email.com",
    phone: "(724) 555-0198",
    childName: "Maya Chen",
    childAge: 4,
    status: "new",
    tags: ["Spark Studio", "Scholarship Inquiry"],
    date: "45 minutes ago",
    message:
      "Looking into Spark Studio for our daughter. Also interested in scholarship and flexible tuition options.",
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
    phone: "(724) 555-0218",
    childName: null,
    childAge: null,
    status: "contacted",
    tags: ["Middle School Studio", "Campus Tour"],
    date: "3 hours ago",
    message:
      "Our 7th grader is stressed about grades and not engaged. We'd like to schedule a campus tour and learn how Acton differs from traditional school.",
    flowId: "flow-1",
    responses: {
      f1: "Jennifer",
      f2: "Walsh",
      f3: "jwalsh@email.com",
      f4: "(724) 555-0218",
      f5: "Lucas Walsh",
      f6: "2012-03-15",
      f7: "7th",
      f8: "Middle School Studio",
      f9: "2026-08-01",
      f10: true,
    },
  },
  {
    id: "l3",
    type: "contact",
    name: "Amanda Brooks",
    email: "abrooks@email.com",
    phone: "(724) 555-0391",
    childName: "Tyler Brooks",
    childAge: 9,
    status: "scheduled",
    tags: ["Book a Call", "Elementary Studio"],
    date: "Yesterday",
    message:
      "Book-a-call follow-up — family call scheduled for next week to discuss studio fit and enrollment process.",
    flowId: "flow-4",
    responses: {
      f20: "Amanda Brooks",
      f21: "abrooks@email.com",
      f22: "(724) 555-0391",
      f23: "Tyler Brooks",
      f24: "9",
      f25: "2026-04-22",
      f26: "10:00 AM",
      f27: "Elementary Studio 2026–27",
      f28: "Family call scheduled — discuss learner-driven model and tour.",
    },
  },
  {
    id: "l4",
    type: "contact",
    name: "Rachel Nguyen",
    email: "rnguyen@email.com",
    phone: "(724) 555-0477",
    childName: null,
    childAge: null,
    status: "new",
    tags: ["Tuition", "Sibling Discount"],
    date: "2 hours ago",
    message:
      "Interested in enrolling two children — wondering about sibling discount and scholarship eligibility.",
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
    subject: "Spring Studio Update — Wexford Campus",
    preview:
      "Learner showcases, scholarship reminders, and upcoming campus tour dates for prospective families...",
    date: "2 days ago",
    body: `<p>Dear Acton Families,</p><p>Spring is in full swing at our Wexford studio. Learners are wrapping up five-week projects and preparing for upcoming showcases.</p><p>Reminder: scholarship applications for the 2026–27 school year close May 15. Families with two or more enrolled learners automatically receive a 10% sibling discount.</p><p>Warm regards,<br/>Acton Academy Pittsburgh Team</p>`,
    attachments: ["spring_studio_update.pdf"],
  },
  {
    id: "em2",
    to: "smitchell@email.com",
    from: "admin@mudkitchen.co",
    subject: "Re: Book a Call — Elementary Studio for Ethan",
    preview:
      "Thank you for your interest in Acton Academy Pittsburgh! We'd love to connect about Elementary Studio...",
    date: "1 hour ago",
    body: `<p>Hi Sarah,</p><p>Thank you for reaching out about Elementary Studio for Ethan. We'd love to schedule a conversation to learn more about your family and answer your questions about the learner-driven model.</p><p>Our process typically begins with a call, then a campus tour, followed by a learner visit. Please reply with a few times that work for a 30-minute call.</p><p>Best,<br/>Acton Academy Pittsburgh Admissions</p>`,
    attachments: [],
  },
  {
    id: "em3",
    to: "All Prospective Families",
    from: "admin@mudkitchen.co",
    subject: "Scholarship & Flexible Tuition — Info Session May 8",
    preview:
      "Learn about annual tuition, scholarship support up to $6,000, and the 10% sibling discount...",
    date: "1 week ago",
    body: `<p>Dear Families,</p><h3>Tuition & Access</h3><ul><li>Annual tuition: $11,500 per child</li><li>Eligible families may receive up to $6,000 in scholarship support</li><li>10% sibling discount for two or more enrolled children</li></ul><h3>Upcoming</h3><ul><li>May 8 — Scholarship info session</li><li>May 15 — Scholarship application deadline</li></ul><p>Join us to learn how Acton makes learner-driven education accessible.</p>`,
    attachments: ["tuition_overview.pdf"],
  },
  {
    id: "em4",
    to: "All Guides",
    from: "admin@mudkitchen.co",
    subject: "Admissions Flow Reminder — Call, Tour, Visit, Enroll",
    preview:
      "Reminder on the enrollment path for prospective families exploring Pre-K–8 applications...",
    date: "2 weeks ago",
    body: `<p>Team,</p><p>Quick reminder on our admissions flow:</p><ol><li>Respond to book-a-call inquiries within 48 hours</li><li>Schedule a campus tour for interested families</li><li>Arrange a learner visit day in the appropriate studio</li><li>Send application link after tour and visit</li></ol><p>Currently accepting applications for Pre-K through 8th grade. Launchpad Studio (ages 16–18) remains coming soon — do not promise availability.</p>`,
    attachments: [],
  },
];

export const adminContentOverrides = {
  demoEvents,
  demoLeads,
  demoEmails,
  admissionsSubtitle:
    "Book-a-call inquiries and campus tours for families exploring Spark, Elementary, and Middle School studios — currently accepting Pre-K–8 applications.",
};
