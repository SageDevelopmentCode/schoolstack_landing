/** Admin content overrides for gathered-oak-farm. */

export const demoEvents = [
  {
    id: "c1",
    title: "Farm School Open House",
    date: "2026-04-19",
    type: "event",
  },
  {
    id: "c2",
    title: "Plan a Visit — Campus Tour Block",
    date: "2026-04-16",
    type: "event",
  },
  {
    id: "c3",
    title: "Enrollment Inquiry Review",
    date: "2026-04-11",
    type: "internal",
  },
  {
    id: "c4",
    title: "Middle School Info Session — North Fallbrook",
    date: "2026-05-03",
    type: "event",
  },
  {
    id: "c5",
    title: "New Family Welcome Call — Sarah",
    date: "2026-04-17",
    type: "event",
  },
];

export const demoLeads = [
  {
    id: "l0",
    type: "contact",
    name: "Sarah Mitchell",
    email: "smitchell@email.com",
    phone: "(760) 555-0142",
    childName: "Lucas Mitchell",
    childAge: 7,
    status: "new",
    tags: ["Monday Farm School", "Plan a Visit"],
    date: "12 minutes ago",
    message:
      "We're interested in Monday Farm School for our 2nd grader. Would love to plan a visit to see the barn and farm in person.",
    flowId: "flow-5",
    responses: {
      f29: "Sarah Mitchell",
      f30: "smitchell@email.com",
      f31: "Monday Farm School",
      f32: "Lucas Mitchell",
      f33: "Grade 2",
    },
  },
  {
    id: "l1",
    type: "contact",
    name: "David Chen",
    email: "dchen@email.com",
    phone: "(760) 555-0198",
    childName: "Emma Chen",
    childAge: 5,
    status: "new",
    tags: ["3-Day Academic + Farm", "Enrollment Inquiry"],
    date: "45 minutes ago",
    message:
      "Looking into the 3-day academic and farm track for our kindergartener — interested in small-group academics and afternoon farm time.",
    flowId: "flow-3",
    responses: {
      f16: "David Chen",
      f17: "dchen@email.com",
      f18: "Emma Chen",
      f19: false,
    },
  },
  {
    id: "l2",
    type: "contact",
    name: "Maria Gonzalez",
    email: "mgonzalez@email.com",
    phone: "(760) 555-0218",
    childName: null,
    childAge: null,
    status: "contacted",
    tags: ["Middle School", "North Fallbrook"],
    date: "3 hours ago",
    message:
      "Our 7th grader is interested in the middle school program. Can you share more about the Wednesday schedule in North Fallbrook?",
    flowId: "flow-1",
    responses: {
      f1: "Maria",
      f2: "Gonzalez",
      f3: "mgonzalez@email.com",
      f4: "(760) 555-0218",
      f5: "Sofia Gonzalez",
      f6: "2014-03-15",
      f7: "7th",
      f8: "Middle School",
      f9: "2026-08-01",
      f10: true,
    },
  },
  {
    id: "l3",
    type: "contact",
    name: "Jennifer Walsh",
    email: "jwalsh@email.com",
    phone: "(760) 555-0391",
    childName: "Owen Walsh",
    childAge: 4,
    status: "scheduled",
    tags: ["Junior Farm School", "Plan a Visit"],
    date: "Yesterday",
    message:
      "Inquiry follow-up — campus tour scheduled for next week. Interested in Junior Farm School afternoons.",
    flowId: "flow-4",
    responses: {
      f20: "Jennifer Walsh",
      f21: "jwalsh@email.com",
      f22: "(760) 555-0391",
      f23: "Owen Walsh",
      f24: "4",
      f25: "2026-04-19",
      f26: "10:00 AM",
      f27: "Junior Farm School",
      f28: "Campus tour scheduled for next week.",
    },
  },
  {
    id: "l4",
    type: "contact",
    name: "Rachel Kim",
    email: "rkim@email.com",
    phone: "(760) 555-0477",
    childName: null,
    childAge: null,
    status: "new",
    tags: ["Afternoon Electives"],
    date: "2 hours ago",
    message:
      "Our 3rd grader is already enrolled in the 3-day track — wondering about afternoon elective options for fall.",
    flowId: "flow-3",
    responses: {
      f16: "Rachel Kim",
      f17: "rkim@email.com",
      f18: "Mia Kim",
      f19: false,
    },
  },
];

export const demoEmails = [
  {
    id: "em1",
    to: "All Farm School Families",
    from: "admin@mudkitchen.co",
    subject: "Fall Program Updates — Gathered Oak Farm",
    preview:
      "Program details, elective offerings, and important dates for the upcoming semester at Gathered Oak Farm...",
    date: "2 days ago",
    body: `<p>Dear Gathered Oak Families,</p><p>As we prepare for the new semester, we wanted to share updates on program schedules, afternoon electives, and our middle school offering in North Fallbrook.</p><p>Please confirm current availability and tuition directly with our office — program details are subject to change.</p><p>Warm regards,<br/>Mindy and Nick Kinnier<br/>Gathered Oak Farm</p>`,
    attachments: ["fall_program_overview.pdf"],
  },
  {
    id: "em2",
    to: "smitchell@email.com",
    from: "admin@mudkitchen.co",
    subject: "Re: Plan a Visit — Monday Farm School for Lucas",
    preview:
      "Thank you for your interest in Monday Farm School! We'd love to schedule a visit to the farm...",
    date: "1 hour ago",
    body: `<p>Hi Sarah,</p><p>Thank you for reaching out about Monday Farm School for Lucas. We'd love to welcome your family for a visit — our 2,000-square-foot barn and 2.5-acre farm are best experienced in person.</p><p>Please reply with a few times that work, and we'll confirm a tour date.</p><p>Best,<br/>Gathered Oak Farm</p>`,
    attachments: [],
  },
  {
    id: "em3",
    to: "All Enrolled Families",
    from: "admin@mudkitchen.co",
    subject: "April Newsletter — Spring on the Farm",
    preview:
      "Garden planting, animal care updates, and upcoming community gatherings at Gathered Oak...",
    date: "1 week ago",
    body: `<p>Dear Gathered Oak Families,</p><h3>🌿 Farm Highlights</h3><ul><li>Spring garden planting in full swing</li><li>Chickens, goats, and pigs — animal care rotations underway</li><li>Oak grove exploration and nature observation</li></ul><h3>📅 Important Dates</h3><ul><li>April 19 — Farm School Open House</li><li>May 3 — Middle School Info Session (North Fallbrook)</li></ul><p>Thank you for being part of our farm school community!</p>`,
    attachments: ["april_newsletter.pdf"],
  },
  {
    id: "em4",
    to: "All Staff",
    from: "admin@mudkitchen.co",
    subject: "Staff Planning — Visit & Inquiry Follow-Up Protocol",
    preview:
      "Reminder on visit scheduling and enrollment inquiry follow-up for prospective families...",
    date: "2 weeks ago",
    body: `<p>Team,</p><p>Quick reminder on our inquiry flow:</p><ol><li>Respond to visit requests promptly</li><li>Schedule campus tours for interested families</li><li>Confirm program availability and current tuition</li><li>Send enrollment paperwork upon family confirmation</li></ol><p>Middle school inquiries — note North Fallbrook location. Do not collect sensitive student information on the general form.</p>`,
    attachments: [],
  },
];

export const adminContentOverrides = {
  demoEvents,
  demoLeads,
  demoEmails,
  admissionsSubtitle:
    "Enrollment inquiries and campus visits for families exploring Monday Farm School, the 3-day academic track, middle school, junior farm school, and afternoon electives.",
};
