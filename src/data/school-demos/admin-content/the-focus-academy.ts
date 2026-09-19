/** Admin content overrides for the-focus-academy. */

export const demoEvents = [
  {
    id: "c1",
    title: "Virtual Parent Information Session",
    date: "2026-04-18",
    type: "event",
  },
  {
    id: "c2",
    title: "2026–27 Enrollment Review",
    date: "2026-04-11",
    type: "internal",
  },
  {
    id: "c3",
    title: "Family Conversation Block — Karolyn Miller",
    date: "2026-04-16",
    type: "event",
  },
  {
    id: "c4",
    title: "4-Day Program Orientation Planning",
    date: "2026-05-01",
    type: "deadline",
  },
  {
    id: "c5",
    title: "2-Day Program Interest List Review",
    date: "2026-04-22",
    type: "internal",
  },
];

export const demoLeads = [
  {
    id: "l0",
    type: "contact",
    name: "Sarah Mitchell",
    email: "smitchell@email.com",
    phone: "(901) 555-0142",
    childName: "Ethan Mitchell",
    childAge: null,
    status: "new",
    tags: ["4-Day Program", "Twice-Exceptional", "2026–27 Enrollment"],
    date: "12 minutes ago",
    message:
      "Interested in the 4-Day Program for our twice-exceptional 7th grader — currently homeschooling and looking for a smaller, strengths-based community in the Memphis area.",
    flowId: "flow-5",
    responses: {
      f29: "Sarah Mitchell",
      f30: "smitchell@email.com",
      f31: "4-Day Program",
      f32: "Ethan Mitchell",
      f33: "7th Grade",
    },
  },
  {
    id: "l1",
    type: "contact",
    name: "James Porter",
    email: "jporter@email.com",
    phone: "(901) 555-0198",
    childName: "Noah Porter",
    childAge: 12,
    status: "new",
    tags: ["2-Day Program", "Homeschool"],
    date: "45 minutes ago",
    message:
      "Registered independent homeschooler looking at the 2-Day option — would love to learn how curriculum menus work with our existing materials.",
    flowId: "flow-3",
    responses: {
      f16: "James Porter",
      f17: "jporter@email.com",
      f18: "Noah Porter",
      f19: false,
    },
  },
  {
    id: "l2",
    type: "contact",
    name: "Angela Reyes",
    email: "areyes@email.com",
    phone: "(901) 555-0218",
    childName: null,
    childAge: null,
    status: "contacted",
    tags: ["Info Session", "Gifted & Neurodivergent"],
    date: "3 hours ago",
    message:
      "Saw the virtual parent information session link — interested in learning more about how FOCUS supports gifted middle-school boys.",
    flowId: "flow-1",
    responses: {
      f1: "Angela",
      f2: "Reyes",
      f3: "areyes@email.com",
      f4: "(901) 555-0218",
      f5: "Marcus Reyes",
      f6: "2013-06-10",
      f7: "6th",
      f8: "Not sure yet",
      f9: "2026-08-01",
      f10: true,
    },
  },
  {
    id: "l3",
    type: "contact",
    name: "David Thompson",
    email: "dthompson@email.com",
    phone: "(901) 555-0391",
    childName: "Caleb Thompson",
    childAge: 13,
    status: "scheduled",
    tags: ["Conversation Scheduled", "4-Day Program"],
    date: "Yesterday",
    message:
      "Initial conversation completed — family interested in 4-Day program for fall 2026.",
    flowId: "flow-4",
    responses: {
      f20: "David Thompson",
      f21: "dthompson@email.com",
      f22: "(901) 555-0391",
      f23: "Caleb Thompson",
      f24: "13",
      f25: "2026-04-18",
      f26: "10:00 AM",
      f27: "4-Day Program 2026–27",
      f28: "Initial conversation completed — family interested in 4-Day program for fall 2026.",
    },
  },
  {
    id: "l4",
    type: "contact",
    name: "Michelle Grant",
    email: "mgrant@email.com",
    phone: "(901) 555-0477",
    childName: null,
    childAge: null,
    status: "new",
    tags: ["2-Day Program", "Umbrella School"],
    date: "2 hours ago",
    message:
      "Enrolled under an umbrella school — wondering if the 2-Day Tuesday/Thursday option would work with our current curriculum.",
    flowId: "flow-3",
    responses: {
      f16: "Michelle Grant",
      f17: "mgrant@email.com",
      f18: "Tyler Grant",
      f19: false,
    },
  },
];

export const demoEmails = [
  {
    id: "em1",
    to: "All Interested Families",
    from: "admin@mudkitchen.co",
    subject: "Virtual Parent Information Session — April 18",
    preview:
      "Join us for a virtual parent information session to explore The FOCUS Academy's vision for twice-exceptional learners...",
    date: "2 days ago",
    body: `<p>Dear Families,</p><p>We invite you to our upcoming <strong>Virtual Parent Information Session</strong> on April 18th. Come meet us, explore our vision, and discover how The FOCUS Academy can make a difference in your child's educational journey.</p><p>Reply to this email or use our inquiry form to request your meeting link.</p><p>Warm regards,<br/>The FOCUS Academy Team</p>`,
    attachments: [],
  },
  {
    id: "em2",
    to: "smitchell@email.com",
    from: "admin@mudkitchen.co",
    subject: "Re: 4-Day Program for Ethan",
    preview:
      "Thank you for your interest in The FOCUS Academy! We'd love to connect and learn more about Ethan...",
    date: "1 hour ago",
    body: `<p>Hi Sarah,</p><p>Thank you for reaching out about the 4-Day Program for Ethan. We'd love to schedule a conversation to learn more about your family's goals and answer your questions about our strengths-based approach for twice-exceptional learners.</p><p>Please reply with a few times that work, or email us at info@thefocusacademy.org.</p><p>Best,<br/>The FOCUS Academy Admissions</p>`,
    attachments: [],
  },
  {
    id: "em3",
    to: "All Enrolled Families",
    from: "admin@mudkitchen.co",
    subject: "April Update — Program Options & 2026–27 Enrollment",
    preview:
      "Now accepting applications for the 2026–27 school year. Program schedules and tuition overview inside...",
    date: "1 week ago",
    body: `<p>Dear FOCUS Families,</p><h3>2026–27 Enrollment</h3><p>We are currently accepting applications for the 2026–27 school year and would love to connect with interested families.</p><h3>Program Reminder</h3><ul><li>4-Day Program: Monday–Thursday, 8:30 a.m.–2:30 p.m.</li><li>2-Day Program: Monday/Wednesday or Tuesday/Thursday, 8:30 a.m.–2:30 p.m.</li></ul><p>Thank you for being part of our community!</p>`,
    attachments: [],
  },
  {
    id: "em4",
    to: "All Staff",
    from: "admin@mudkitchen.co",
    subject: "Staff Planning — Family Conversation Protocol",
    preview:
      "Reminder on family conversation follow-up and enrollment next steps for prospective families...",
    date: "2 weeks ago",
    body: `<p>Team,</p><p>Quick reminder on our admissions flow:</p><ol><li>Respond to inquiry within 48 hours</li><li>Schedule a low-pressure family conversation</li><li>Share program details (4-Day vs 2-Day) based on family needs</li><li>Send enrollment link when family is ready to proceed</li></ol><p>Do not collect sensitive medical information on the general inquiry form.</p>`,
    attachments: [],
  },
];

export const adminContentOverrides = {
  demoEvents,
  demoLeads,
  demoEmails,
  admissionsSubtitle:
    "Family conversations and enrollment inquiries for gifted and neurodivergent middle-school boys in the Memphis area.",
};
