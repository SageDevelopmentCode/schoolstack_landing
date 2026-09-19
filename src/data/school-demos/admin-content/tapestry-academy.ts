/** Admin content overrides for tapestry-academy. */

export const demoEvents = [
  {
    id: "c1",
    title: "2026–27 Virtual Info Call",
    date: "2026-04-22",
    type: "event",
  },
  {
    id: "c2",
    title: "Friday Enrichment Open House",
    date: "2026-04-17",
    type: "event",
  },
  {
    id: "c3",
    title: "Admissions Inquiry Review",
    date: "2026-04-11",
    type: "internal",
  },
  {
    id: "c4",
    title: "Shadow Day — Foundations Cohort",
    date: "2026-05-01",
    type: "event",
  },
  {
    id: "c5",
    title: "New Family Welcome Call — Jennifer",
    date: "2026-04-18",
    type: "event",
  },
];

export const demoLeads = [
  {
    id: "l0",
    type: "contact",
    name: "Jennifer Martinez",
    email: "jmartinez@email.com",
    phone: "(561) 555-0142",
    childName: "Sofia Martinez",
    childAge: 9,
    status: "new",
    tags: ["Microschool", "Schedule a Virtual Call"],
    date: "12 minutes ago",
    message:
      "We're interested in the 2-day microschool option for our daughter entering 4th grade. Would love to schedule a virtual call to learn more about the Foundations Cohort for 2026–27.",
    flowId: "flow-5",
    responses: {
      f29: "Jennifer Martinez",
      f30: "jmartinez@email.com",
      f31: "Tapestry Academy Microschool",
      f32: "Sofia Martinez",
      f33: "Grade 4",
    },
  },
  {
    id: "l1",
    type: "contact",
    name: "David Okonkwo",
    email: "dokonkwo@email.com",
    phone: "(561) 555-0198",
    childName: "Amara Okonkwo",
    childAge: 7,
    status: "new",
    tags: ["Friday Enrichment", "Homeschool Family"],
    date: "45 minutes ago",
    message:
      "We homeschool and are looking for a Friday enrichment community for our 7-year-old. Can you share more about the ages 5–8 group and what a typical Friday looks like?",
    flowId: "flow-3",
    responses: {
      f16: "David Okonkwo",
      f17: "dokonkwo@email.com",
      f18: "Amara Okonkwo",
      f19: false,
    },
  },
  {
    id: "l2",
    type: "contact",
    name: "Rachel Stein",
    email: "rstein@email.com",
    phone: "(561) 555-0218",
    childName: null,
    childAge: null,
    status: "contacted",
    tags: ["Homeschool Commons", "Enrollment Inquiry"],
    date: "3 hours ago",
    message:
      "Interested in the Homeschool Commons for our two children (ages 10 and 13). What does weekly participation look like and how flexible is the schedule?",
    flowId: "flow-1",
    responses: {
      f1: "Rachel",
      f2: "Stein",
      f3: "rstein@email.com",
      f4: "(561) 555-0218",
      f5: "Two students",
      f6: "2014-08-10",
      f7: "6th",
      f8: "Homeschool Commons",
      f9: "2026-08-01",
      f10: true,
    },
  },
  {
    id: "l3",
    type: "contact",
    name: "Michael Torres",
    email: "mtorres@email.com",
    phone: "(561) 555-0391",
    childName: "Lucas Torres",
    childAge: 15,
    status: "scheduled",
    tags: ["High School Cohort", "Shadow Day"],
    date: "Yesterday",
    message:
      "Our son is entering 10th grade and we're exploring alternatives to traditional school. Interested in the High School Cohort and scheduling a shadow day.",
    flowId: "flow-4",
    responses: {
      f20: "Michael Torres",
      f21: "mtorres@email.com",
      f22: "(561) 555-0391",
      f23: "Lucas Torres",
      f24: "15",
      f25: "2026-04-25",
      f26: "10:00 AM",
      f27: "Shadow day",
      f28: "High School Cohort — 4-day microschool interest.",
    },
  },
  {
    id: "l4",
    type: "contact",
    name: "Sarah Mitchell",
    email: "smitchell@email.com",
    phone: "(561) 555-0477",
    childName: null,
    childAge: null,
    status: "new",
    tags: ["Step Up Scholarship", "2026–27"],
    date: "2 hours ago",
    message:
      "We have Step Up PEP scholarship and are interested in the microschool. Can you confirm current scholarship acceptance and help us understand the enrollment process?",
    flowId: "flow-3",
    responses: {
      f16: "Sarah Mitchell",
      f17: "smitchell@email.com",
      f18: "Two students",
      f19: false,
    },
  },
];

export const demoEmails = [
  {
    id: "em1",
    to: "All Prospective Families",
    from: "admin@mudkitchen.co",
    subject: "2026–27 Enrollment — Tapestry Academy",
    preview:
      "Flexible microschool and homeschool programs in East Boca Raton — schedule a virtual call to explore the right fit for your family...",
    date: "2 days ago",
    body: `<p>Dear Tapestry Families,</p><p>Thank you for your interest in Tapestry Academy. We offer flexible 2- to 4-day microschool options, Friday enrichment, and a homeschool community for families in Grades K–12.</p><p>We encourage families to begin with a brief conversation so our team can help you explore programs and next steps for the 2026–27 school year.</p><p>Warm regards,<br/>Tapestry Academy Admissions</p>`,
    attachments: ["2026_27_program_overview.pdf"],
  },
  {
    id: "em2",
    to: "jmartinez@email.com",
    from: "admin@mudkitchen.co",
    subject: "Re: Microschool inquiry for Sofia",
    preview:
      "Thank you for reaching out about the 2-day microschool. We'd love to schedule a virtual call to discuss the Foundations Cohort...",
    date: "1 hour ago",
    body: `<p>Hi Jennifer,</p><p>Thank you for your interest in Tapestry Academy for Sofia. Our microschool offers personalized 2- to 4-day learning built around academics, projects, mentorship, and community.</p><p>We'd be glad to schedule a 15–30 minute virtual call to walk through program options and the enrollment process. Please reply with a few times that work for you.</p><p>Best,<br/>Tapestry Academy Admissions<br/>inspire@tapestryacademy.com</p>`,
    attachments: [],
  },
  {
    id: "em3",
    to: "All Enrolled Families",
    from: "admin@mudkitchen.co",
    subject: "April Newsletter — Community & Events",
    preview:
      "Friday enrichment updates, field trip reminders, and important dates for Tapestry families...",
    date: "1 week ago",
    body: `<p>Dear Tapestry Families,</p><h3>📚 Program Reminders</h3><ul><li>Microschool: flexible 2- to 4-day schedules by cohort</li><li>Friday Enrichment: full-day hands-on learning for homeschool families</li><li>Homeschool Commons: weekly community enrichment</li></ul><h3>📅 Upcoming</h3><ul><li>Friday Enrichment Open House — April 17</li><li>Shadow Day — Foundations Cohort — May 1</li></ul><p>Thank you for being part of our learning community!</p>`,
    attachments: ["april_newsletter.pdf"],
  },
  {
    id: "em4",
    to: "All Staff",
    from: "admin@mudkitchen.co",
    subject: "Admissions Follow-Up — Inquiry Protocol",
    preview:
      "Reminder on virtual call scheduling and enrollment inquiry follow-up for prospective families...",
    date: "2 weeks ago",
    body: `<p>Team,</p><p>Quick reminder on our inquiry flow:</p><ol><li>Respond to admissions inquiries promptly</li><li>Offer a virtual call or tour as the first next step</li><li>Explain microschool, Friday enrichment, and Homeschool Commons options</li><li>Confirm current scholarship and program details with admissions before promising specifics</li></ol><p>Office: 1699 S. Federal Hwy, Suite 100, Boca Raton, FL 33432 · 561-287-6201</p>`,
    attachments: [],
  },
];

export const adminContentOverrides = {
  demoEvents,
  demoLeads,
  demoEmails,
  admissionsSubtitle:
    "Admissions conversations for families exploring microschool, Friday enrichment, and Homeschool Commons programs in East Boca Raton for the 2026–27 school year.",
};
