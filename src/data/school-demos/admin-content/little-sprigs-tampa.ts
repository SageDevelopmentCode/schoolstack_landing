/** Admin content overrides for little-sprigs-tampa. */

export const demoEvents = [
  {
    id: "c1",
    title: "Little Sprigs Park Meetup",
    date: "2026-04-19",
    type: "event",
  },
  {
    id: "c2",
    title: "Homeschool Village Open House",
    date: "2026-05-03",
    type: "event",
  },
  {
    id: "c3",
    title: "Community Inquiry Follow-Up Block",
    date: "2026-04-14",
    type: "internal",
  },
  {
    id: "c4",
    title: "Kitchen & Garden Gathering",
    date: "2026-05-17",
    type: "event",
  },
  {
    id: "c5",
    title: "New Family Welcome Call — Jasmine",
    date: "2026-04-16",
    type: "event",
  },
];

export const demoLeads = [
  {
    id: "l0",
    type: "contact",
    name: "Jasmine Rivera",
    email: "jrivera@email.com",
    phone: "(813) 555-0142",
    childName: "Amara Rivera",
    childAge: 4,
    status: "new",
    tags: ["Little Sprigs Meetup", "Community Inquiry"],
    date: "12 minutes ago",
    message:
      "We're new to Tampa Bay and looking for a play-based community for our 4-year-old. Interested in learning about upcoming Little Sprigs meetups.",
    flowId: "flow-5",
    responses: {
      f29: "Jasmine Rivera",
      f30: "jrivera@email.com",
      f31: "Little Sprigs Meetups",
      f32: "Amara Rivera",
      f33: "Age 4",
    },
  },
  {
    id: "l1",
    type: "contact",
    name: "Marcus Thompson",
    email: "mthompson@email.com",
    phone: "(813) 555-0198",
    childName: "Eli Thompson",
    childAge: 7,
    status: "new",
    tags: ["Homeschool Village Microschool", "Community Inquiry"],
    date: "45 minutes ago",
    message:
      "Interested in The Homeschool Village microschool for our 2nd grader — also curious how Little Sprigs meetups work for younger siblings.",
    flowId: "flow-3",
    responses: {
      f16: "Marcus Thompson",
      f17: "mthompson@email.com",
      f18: "Eli Thompson",
      f19: false,
    },
  },
  {
    id: "l2",
    type: "contact",
    name: "Keisha Williams",
    email: "kwilliams@email.com",
    phone: "(813) 555-0218",
    childName: null,
    childAge: null,
    status: "contacted",
    tags: ["Kitchen & Garden", "Community Inquiry"],
    date: "3 hours ago",
    message:
      "Homeschooling family interested in the Kitchen & Garden gatherings — would love to connect with like-minded families in the area.",
    flowId: "flow-1",
    responses: {
      f1: "Keisha",
      f2: "Williams",
      f3: "kwilliams@email.com",
      f4: "(813) 555-0218",
      f5: "Maya Williams",
      f6: "2018-03-15",
      f7: "1st",
      f8: "Kitchen & Garden Events",
      f9: "2026-04-01",
      f10: true,
    },
  },
  {
    id: "l3",
    type: "contact",
    name: "Angela Brooks",
    email: "abrooks@email.com",
    phone: "(813) 555-0391",
    childName: "Noah Brooks",
    childAge: 9,
    status: "scheduled",
    tags: ["Private Tutoring", "Community Inquiry"],
    date: "Yesterday",
    message:
      "Looking into private tutoring after school — also want to learn more about the Little Sprigs community for our younger child.",
    flowId: "flow-4",
    responses: {
      f20: "Angela Brooks",
      f21: "abrooks@email.com",
      f22: "(813) 555-0391",
      f23: "Noah Brooks",
      f24: "9",
      f25: "2026-04-18",
      f26: "10:00 AM",
      f27: "Private Tutoring",
      f28: "Follow-up call scheduled to discuss tutoring and Little Sprigs meetups.",
    },
  },
  {
    id: "l4",
    type: "contact",
    name: "Rachel Nguyen",
    email: "rnguyen@email.com",
    phone: "(813) 555-0477",
    childName: null,
    childAge: null,
    status: "new",
    tags: ["Little Sprigs Meetup", "Community Inquiry"],
    date: "2 hours ago",
    message:
      "Found Little Sprigs through a friend — we'd love to join the next meetup and learn about the community.",
    flowId: "flow-3",
    responses: {
      f16: "Rachel Nguyen",
      f17: "rnguyen@email.com",
      f18: "Lily Nguyen",
      f19: false,
    },
  },
];

export const demoEmails = [
  {
    id: "em1",
    to: "All Little Sprigs Families",
    from: "admin@mudkitchen.co",
    subject: "Upcoming Little Sprigs Meetup — Park Gathering",
    preview:
      "Join us for our next twice-monthly meetup — details on location and what to bring...",
    date: "2 days ago",
    body: `<p>Dear Little Sprigs Families,</p><p>Our next <strong>twice-monthly meetup</strong> is coming up! We'll gather at a Tampa Bay park location — check the Little Sprigs of Tampa Facebook page for the latest details.</p><p>Bring water, sun protection, and a picnic blanket. Children are welcome to explore, play, and connect with our community.</p><p>With warmth,<br/>The Homeschool Village Team</p>`,
    attachments: [],
  },
  {
    id: "em2",
    to: "jrivera@email.com",
    from: "admin@mudkitchen.co",
    subject: "Re: Community Inquiry — Little Sprigs Meetups",
    preview:
      "Thank you for your interest in Little Sprigs! We'd love to welcome your family to our next gathering...",
    date: "1 hour ago",
    body: `<p>Hi Jasmine,</p><p>Thank you for reaching out about Little Sprigs meetups for Amara. We'd love to welcome your family to our play-based community!</p><p>Little Sprigs meets twice each month at The Homeschool Village and at various park locations around Tampa Bay. Visit the Little Sprigs of Tampa Facebook page for the latest meetup details.</p><p>Best,<br/>The Homeschool Village Team</p>`,
    attachments: [],
  },
  {
    id: "em3",
    to: "All Community Families",
    from: "admin@mudkitchen.co",
    subject: "April Newsletter — Garden Season & Community Gatherings",
    preview:
      "Spring in the garden, upcoming meetups, and Kitchen & Garden event details...",
    date: "1 week ago",
    body: `<p>Dear Families,</p><h3>🌿 Community Highlights</h3><ul><li>Little Sprigs park meetup — check Facebook for details</li><li>Kitchen & Garden gathering — hands-on food and soil exploration</li><li>Homeschool Village open house for families exploring our microschool</li></ul><h3>📅 Stay Connected</h3><ul><li>Follow Little Sprigs of Tampa on Facebook for meetup updates</li><li>Call 813-563-6098 or email thehomeschoolvillageinc@gmail.com with questions</li></ul><p>Thank you for being part of our village!</p>`,
    attachments: ["april_community_newsletter.pdf"],
  },
  {
    id: "em4",
    to: "All Staff",
    from: "admin@mudkitchen.co",
    subject: "Staff Reminder — Community Inquiry Follow-Up",
    preview:
      "Reminder on responding to meetup and community inquiries from prospective families...",
    date: "2 weeks ago",
    body: `<p>Team,</p><p>Quick reminder on our community inquiry flow:</p><ol><li>Respond to inquiries within 2 business days</li><li>Direct meetup questions to the Little Sprigs Facebook page</li><li>Schedule welcome calls for families interested in the broader Homeschool Village programs</li><li>Do not share private address details — service area is Temple Terrace / Tampa Bay</li></ol><p>Microschool inquiries — route to Charlene for program fit conversation.</p>`,
    attachments: [],
  },
];

export const adminContentOverrides = {
  demoEvents,
  demoLeads,
  demoEmails,
  admissionsSubtitle:
    "Meetup and community inquiries from Tampa Bay families exploring Little Sprigs and The Homeschool Village.",
};
