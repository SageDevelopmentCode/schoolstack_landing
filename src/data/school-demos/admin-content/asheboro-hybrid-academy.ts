/** Admin content overrides for asheboro-hybrid-academy. */

export const demoEvents = [
  {
    id: "c1",
    title: "2026–27 Enrollment Information Session",
    date: "2026-04-22",
    type: "event",
  },
  {
    id: "c2",
    title: "Hybrid Model Q&A — Prospective Families",
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
    title: "High School Campus Day Tour Block",
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
    name: "Jennifer Walsh",
    email: "jwalsh@email.com",
    phone: "(336) 555-0142",
    childName: "Ethan Walsh",
    childAge: 8,
    status: "new",
    tags: ["Elementary School", "Ask About Enrollment"],
    date: "12 minutes ago",
    message:
      "We're interested in the elementary hybrid schedule — Mondays and Thursdays on campus with guided work at home. Would love to start an admissions conversation for 2026–27.",
    flowId: "flow-5",
    responses: {
      f29: "Jennifer Walsh",
      f30: "jwalsh@email.com",
      f31: "Elementary school",
      f32: "Ethan Walsh",
      f33: "Grade 3",
    },
  },
  {
    id: "l1",
    type: "contact",
    name: "Marcus Thompson",
    email: "mthompson@email.com",
    phone: "(336) 555-0198",
    childName: "Olivia Thompson",
    childAge: 15,
    status: "new",
    tags: ["High School", "Hybrid Model"],
    date: "45 minutes ago",
    message:
      "Our daughter is entering 10th grade. Can you explain the Mon/Tue/Thu high school campus rhythm and what parent support looks like at home?",
    flowId: "flow-3",
    responses: {
      f16: "Marcus Thompson",
      f17: "mthompson@email.com",
      f18: "Olivia Thompson",
      f19: false,
    },
  },
  {
    id: "l2",
    type: "contact",
    name: "Rachel Kim",
    email: "rkim@email.com",
    phone: "(336) 555-0218",
    childName: null,
    childAge: null,
    status: "contacted",
    tags: ["Middle School", "Enrollment Inquiry"],
    date: "3 hours ago",
    message:
      "Looking into middle school for our 6th grader. Interested in how AHA partners with parents as co-teachers between campus days.",
    flowId: "flow-1",
    responses: {
      f1: "Rachel",
      f2: "Kim",
      f3: "rkim@email.com",
      f4: "(336) 555-0218",
      f5: "Noah Kim",
      f6: "2014-08-10",
      f7: "6th",
      f8: "Middle school",
      f9: "2026-08-01",
      f10: true,
    },
  },
  {
    id: "l3",
    type: "contact",
    name: "David Chen",
    email: "dchen@email.com",
    phone: "(336) 555-0391",
    childName: "Lucas Chen",
    childAge: 12,
    status: "scheduled",
    tags: ["AHA Warriors", "Athletics"],
    date: "Yesterday",
    message:
      "Inquiry follow-up — our son is interested in Warrior athletics alongside the hybrid program. Can admissions connect us with athletics contact?",
    flowId: "flow-4",
    responses: {
      f20: "David Chen",
      f21: "dchen@email.com",
      f22: "(336) 555-0391",
      f23: "Lucas Chen",
      f24: "12",
      f25: "2026-04-25",
      f26: "10:00 AM",
      f27: "Athletics",
      f28: "Interested in volleyball and soccer options.",
    },
  },
  {
    id: "l4",
    type: "contact",
    name: "Sarah Mitchell",
    email: "smitchell@email.com",
    phone: "(336) 555-0477",
    childName: null,
    childAge: null,
    status: "new",
    tags: ["Tuition / Enrollment", "2026–27"],
    date: "2 hours ago",
    message:
      "We have two children considering AHA for next year. Interested in the enrollment process and whether a multi-student discount applies.",
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
    subject: "2026–27 Enrollment Information — Asheboro Hybrid Academy",
    preview:
      "Start with a conversation about hybrid learning, campus schedules, and the admissions process for the upcoming school year...",
    date: "2 days ago",
    body: `<p>Dear AHA Families,</p><p>Thank you for your interest in Asheboro Hybrid Academy. Space may be limited in many grades — we encourage families to begin with an admissions conversation so our team can explain the current enrollment process and available options.</p><p>Please confirm grade-level availability and requirements directly with our office before making plans.</p><p>Warm regards,<br/>Asheboro Hybrid Academy Admissions</p>`,
    attachments: ["2026_27_enrollment_overview.pdf"],
  },
  {
    id: "em2",
    to: "jwalsh@email.com",
    from: "admin@mudkitchen.co",
    subject: "Re: Elementary hybrid inquiry for Ethan",
    preview:
      "Thank you for reaching out about elementary hybrid learning at AHA. We'd love to discuss the Mon/Thu campus rhythm...",
    date: "1 hour ago",
    body: `<p>Hi Jennifer,</p><p>Thank you for your interest in Asheboro Hybrid Academy for Ethan. Our elementary program meets on campus Mondays and Thursdays from 8:30 AM to 3:00 PM, with teacher-created plans for guided learning at home.</p><p>We'd be glad to schedule a conversation about the 2026–27 enrollment process. Please reply with a few times that work for you.</p><p>Best,<br/>AHA Admissions<br/>admissions@asheborohybridacademy.com</p>`,
    attachments: [],
  },
  {
    id: "em3",
    to: "All Enrolled Families",
    from: "admin@mudkitchen.co",
    subject: "April Newsletter — Warriors & Campus Updates",
    preview:
      "Hybrid schedule reminders, athletics updates, and important dates for AHA families...",
    date: "1 week ago",
    body: `<p>Dear AHA Families,</p><h3>📚 Hybrid Reminders</h3><ul><li>Elementary & middle: Mondays & Thursdays on campus</li><li>High school: Mondays, Tuesdays & Thursdays on campus</li><li>Campus hours: 8:30 AM–3:00 PM</li></ul><h3>🏆 Athletics</h3><ul><li>Warrior athletics opportunities beyond the academic day</li><li>Contact athletics@asheborohybridacademy.com for program questions</li></ul><p>Thank you for partnering with us in your child's education!</p>`,
    attachments: ["april_newsletter.pdf"],
  },
  {
    id: "em4",
    to: "All Staff",
    from: "admin@mudkitchen.co",
    subject: "Admissions Follow-Up — Hybrid Inquiry Protocol",
    preview:
      "Reminder on admissions conversations and enrollment inquiry follow-up for prospective families...",
    date: "2 weeks ago",
    body: `<p>Team,</p><p>Quick reminder on our inquiry flow:</p><ol><li>Respond to admissions inquiries promptly</li><li>Explain hybrid campus vs. home rhythms by grade band</li><li>Direct athletics questions to athletics@asheborohybridacademy.com</li><li>Confirm current enrollment process — do not promise specific grade openings</li></ol><p>Phone availability: Mondays, Tuesdays, and Thursdays · 8:30 AM–3:00 PM.</p>`,
    attachments: [],
  },
];

export const adminContentOverrides = {
  demoEvents,
  demoLeads,
  demoEmails,
  admissionsSubtitle:
    "Admissions conversations for families exploring elementary, middle, and high school hybrid learning, athletics, and 2026–27 enrollment options at Asheboro Hybrid Academy.",
};
