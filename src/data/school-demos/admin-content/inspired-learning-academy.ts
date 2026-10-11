/** Admin content overrides for inspired-learning-academy. */

export const demoEvents = [
  {
    id: "c1",
    title: "Fit-check tour block — prospective families",
    date: "2026-10-21",
    type: "event",
  },
  {
    id: "c2",
    title: "15-minute call — middle school inquiry",
    date: "2026-10-16",
    type: "event",
  },
  {
    id: "c3",
    title: "Admissions inquiry review",
    date: "2026-10-14",
    type: "internal",
  },
  {
    id: "c4",
    title: "High school waiting-list follow-up",
    date: "2026-10-23",
    type: "internal",
  },
  {
    id: "c5",
    title: "New family tour — Maya",
    date: "2026-10-20",
    type: "event",
  },
];

export const demoLeads = [
  {
    id: "l0",
    type: "contact",
    name: "Maya Chen",
    email: "maya.chen@email.com",
    phone: "(214) 555-0142",
    childName: "Evan Chen",
    childAge: 12,
    status: "new",
    tags: ["Schedule a Tour", "Middle School"],
    date: "12 minutes ago",
    message:
      "We're in Allen and looking at 7th grade for 2026–2027. We'd like a fit-check tour to see the Tuesday–Thursday campus days. We understand middle school spots are limited.",
    flowId: "flow-5",
    responses: {
      f29: "Maya Chen",
      f30: "maya.chen@email.com",
      f31: "Schedule a tour",
      f32: "Evan Chen",
      f33: "7th Grade",
    },
  },
  {
    id: "l1",
    type: "contact",
    name: "Andre Williams",
    email: "andre.williams@email.com",
    phone: "(214) 555-0198",
    childName: "Jordan Williams",
    childAge: 15,
    status: "new",
    tags: ["High School", "Waiting List"],
    date: "40 minutes ago",
    message:
      "Our 10th grader is interested, and we saw that high school is waiting list only for 2026–2027. Can we still tour and join the list?",
    flowId: "flow-3",
    responses: {
      f16: "Andre Williams",
      f17: "andre.williams@email.com",
      f18: "Jordan Williams",
      f19: false,
    },
  },
  {
    id: "l2",
    type: "contact",
    name: "Priya Shah",
    email: "priya.shah@email.com",
    phone: "(214) 555-0218",
    childName: "Leah Shah",
    childAge: 13,
    status: "contacted",
    tags: ["Middle School", "TEFA"],
    date: "3 hours ago",
    message:
      "Asking about the hybrid week for an 8th grader in Plano, and whether Inspired is authorized to accept TEFA funds. We are not asking for a funding amount.",
    flowId: "flow-1",
    responses: {
      f1: "Priya",
      f2: "Shah",
      f3: "priya.shah@email.com",
      f4: "(214) 555-0218",
      f5: "Leah Shah",
      f6: "2013-03-02",
      f7: "8th",
      f8: "Middle school",
      f9: "2026-08-01",
      f10: true,
    },
  },
  {
    id: "l3",
    type: "contact",
    name: "Chris Alvarez",
    email: "chris.alvarez@email.com",
    phone: "(214) 555-0391",
    childName: "Sofia Alvarez",
    childAge: 11,
    status: "scheduled",
    tags: ["15-Minute Call", "6th Grade"],
    date: "Yesterday",
    message:
      "Not ready for a tour yet. We'd like a 15-minute call about whether Inspired is a fit for a capable 6th grader who wants more ownership.",
    flowId: "flow-4",
    responses: {
      f20: "Chris Alvarez",
      f21: "chris.alvarez@email.com",
      f22: "(214) 555-0391",
      f23: "Sofia Alvarez",
      f24: "11",
      f25: "2026-10-16",
      f26: "10:00 AM",
      f27: "15-minute call",
      f28: "Questions about fit before we schedule a tour.",
    },
  },
  {
    id: "l4",
    type: "contact",
    name: "Dana Brooks",
    email: "dana.brooks@email.com",
    phone: "(214) 555-0477",
    childName: null,
    childAge: null,
    status: "new",
    tags: ["Tuition", "Sibling Discount"],
    date: "2 hours ago",
    message:
      "Two students — one middle school, one high school. Asking about published 2026–2027 tuition, the $350 registration fee, and the sibling discount. We know high school is waiting list only.",
    flowId: "flow-3",
    responses: {
      f16: "Dana Brooks",
      f17: "dana.brooks@email.com",
      f18: "Two students",
      f19: false,
    },
  },
];

export const demoEmails = [
  {
    id: "em1",
    to: "Prospective Families",
    from: "admin@mudkitchen.co",
    subject: "2026–2027 fit-check tours — Inspired Learning Academy",
    preview:
      "Middle school has limited spots. High school is waiting list only. Tours are a low-pressure way to see the hybrid week...",
    date: "2 days ago",
    body: `<p>Hello,</p><p>This is a concept preview for Inspired Learning Academy in Allen, Texas. For 2026–2027, middle school has limited spots and high school is waiting list only.</p><p>A fit-check tour is a relaxed 30-minute visit. Campus days are Tuesday–Thursday, 9:00 am–3:45 pm. Monday and Friday are remote.</p><p>Published tuition is $12,970 annually, or $1,297 per month for 10 months. Annual registration is $350. Ask the office about sibling discounts and TEFA. This preview does not confirm current availability.</p><p>Inspired Learning Academy<br/>office@inspiredlearningacademy.org · (214) 509-8449</p>`,
    attachments: [],
  },
  {
    id: "em2",
    to: "maya.chen@email.com",
    from: "admin@mudkitchen.co",
    subject: "Re: Fit-check tour for Evan — 7th grade",
    preview:
      "Thank you for asking about a tour. Middle school spots for 2026–2027 are limited...",
    date: "1 hour ago",
    body: `<p>Hi Maya,</p><p>Thank you for your interest in Inspired Learning Academy for Evan. A fit-check tour is a relaxed 30-minute visit to see classes and talk about whether the school is a strong fit.</p><p>Middle school spots for 2026–2027 are limited. This note is sample admin copy for the concept preview — it was not sent to your family.</p><p>Best,<br/>Inspired Learning Academy Office</p>`,
    attachments: [],
  },
  {
    id: "em3",
    to: "Enrolled Families",
    from: "admin@mudkitchen.co",
    subject: "Hybrid week reminder — campus Tue–Thu",
    preview:
      "Campus Tuesday through Thursday, 9:00 am–3:45 pm. Remote Monday and Friday, 9:15 am–3:45 pm...",
    date: "1 week ago",
    body: `<p>Hello families,</p><p>A reminder of the five-day week at Inspired Learning Academy:</p><ul><li>Campus: Tuesday, Wednesday, and Thursday, 9:00 am–3:45 pm</li><li>Remote: Monday and Friday, 9:15 am–3:45 pm, with virtual check-ins</li></ul><p>This is sample preview copy, not an official school newsletter.</p>`,
    attachments: [],
  },
  {
    id: "em4",
    to: "Admissions Team",
    from: "admin@mudkitchen.co",
    subject: "Inquiry follow-up — tours, waitlist, and TEFA",
    preview:
      "Do not promise a high school seat. Do not quote a TEFA amount. Tours and 15-minute calls stay low-pressure...",
    date: "2 weeks ago",
    body: `<p>Team,</p><p>When following up on concept-preview inquiries:</p><ol><li>Offer a fit-check tour or a 15-minute call. Do not invent a booking link.</li><li>Middle school: limited spots for 2026–2027.</li><li>High school: waiting list only. Do not imply an open seat.</li><li>TEFA: the school states it is authorized to accept funds. Do not quote an amount or promise eligibility.</li></ol><p>Office: (214) 509-8449 · office@inspiredlearningacademy.org</p>`,
    attachments: [],
  },
];

export const adminContentOverrides = {
  demoEvents,
  demoLeads,
  demoEmails,
  admissionsSubtitle:
    "Fit-check tours and 15-minute calls for grades 6–12 in Allen. 2026–2027: limited middle school spots; high school waiting list only.",
};
