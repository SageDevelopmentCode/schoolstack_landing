/** Admin content overrides for river-oak-academy. */

export const demoEvents = [
  {
    id: "c1",
    title: "Introductory Call Block — Admissions",
    date: "2026-04-18",
    type: "event",
  },
  {
    id: "c2",
    title: "Campus Tour — St. Johns Studio",
    date: "2026-04-25",
    type: "event",
  },
  {
    id: "c3",
    title: "Children's Business Fair Planning",
    date: "2026-05-10",
    type: "event",
  },
  {
    id: "c4",
    title: "Trial Week Orientation — Elementary Studio",
    date: "2026-05-15",
    type: "deadline",
  },
  {
    id: "c5",
    title: "Outdoor Classroom Open House",
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
    phone: "(904) 555-0142",
    childName: "Ethan Mitchell",
    childAge: 6,
    status: "new",
    tags: ["Spark Studio", "Introductory Call", "Outdoor Learning"],
    date: "12 minutes ago",
    message:
      "We're looking for a learner-driven school where our son can build independence and real skills. Interested in Spark Studio and would love to schedule an introductory call.",
    flowId: "flow-5",
    responses: {
      f29: "Sarah Mitchell",
      f30: "smitchell@email.com",
      f31: "Spark Studio",
      f32: "Ethan Mitchell",
      f33: "Age 6",
    },
  },
  {
    id: "l1",
    type: "contact",
    name: "David Chen",
    email: "dchen@email.com",
    phone: "(904) 555-0198",
    childName: "Maya Chen",
    childAge: 9,
    status: "new",
    tags: ["Elementary Studio", "Children's Business Fair"],
    date: "45 minutes ago",
    message:
      "Our daughter thrives with hands-on projects. We heard about the Children's Business Fair and want to learn more about Elementary Studio.",
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
    phone: "(904) 555-0218",
    childName: null,
    childAge: null,
    status: "contacted",
    tags: ["Middle School Studio", "Campus Tour"],
    date: "3 hours ago",
    message:
      "Our 7th grader is ready for more independence and real-world challenges. We'd like to tour the Middle School Studio and learn about apprenticeships.",
    flowId: "flow-1",
    responses: {
      f1: "Jennifer",
      f2: "Walsh",
      f3: "jwalsh@email.com",
      f4: "(904) 555-0218",
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
    phone: "(904) 555-0391",
    childName: "Tyler Brooks",
    childAge: 5,
    status: "scheduled",
    tags: ["Introductory Call", "Trial Week"],
    date: "Yesterday",
    message:
      "Introductory call scheduled for next week — family interested in trial week after the initial conversation.",
    flowId: "flow-4",
    responses: {
      f20: "Amanda Brooks",
      f21: "abrooks@email.com",
      f22: "(904) 555-0391",
      f23: "Tyler Brooks",
      f24: "5",
      f25: "2026-04-22",
      f26: "10:00 AM",
      f27: "Spark Studio 2026–27",
      f28: "Family call scheduled — discuss learner-driven model and tour.",
    },
  },
  {
    id: "l4",
    type: "contact",
    name: "Rachel Nguyen",
    email: "rnguyen@email.com",
    phone: "(904) 555-0477",
    childName: null,
    childAge: null,
    status: "new",
    tags: ["Tuition", "Sibling Discount"],
    date: "2 hours ago",
    message:
      "Interested in enrolling two learners — wondering about sibling discounts and Florida scholarship programs.",
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
    subject: "Spring Studio Update — St. Johns Campus",
    preview:
      "Quest showcases, outdoor classroom highlights, and upcoming Children's Business Fair details...",
    date: "2 days ago",
    body: `<p>Dear River Oak Families,</p><p>Spring is in full swing at our St. Johns campus. Learners are wrapping up multi-week Quests and preparing for upcoming exhibitions.</p><p>Reminder: the Children's Business Fair is coming up — young entrepreneurs are planning products, pricing, and marketing strategies.</p><p>Warm regards,<br/>River Oak Academy Team</p>`,
    attachments: ["spring_studio_update.pdf"],
  },
  {
    id: "em2",
    to: "smitchell@email.com",
    from: "admin@mudkitchen.co",
    subject: "Re: Introductory Call — Spark Studio for Ethan",
    preview:
      "Thank you for your interest in River Oak Academy! We'd love to connect about Spark Studio...",
    date: "1 hour ago",
    body: `<p>Hi Sarah,</p><p>Thank you for reaching out about Spark Studio for Ethan. We'd love to schedule an introductory call to learn more about your family and answer your questions about our learner-driven model.</p><p>Our process typically begins with a call, then a campus tour, followed by a trial period. Please reply with a few times that work for a 30-minute conversation.</p><p>Best,<br/>River Oak Academy Admissions</p>`,
    attachments: [],
  },
  {
    id: "em3",
    to: "All Prospective Families",
    from: "admin@mudkitchen.co",
    subject: "Tuition & Florida Scholarship Programs — Info Session",
    preview:
      "Learn about monthly tuition, sibling discounts, and Florida scholarship program options...",
    date: "1 week ago",
    body: `<p>Dear Families,</p><h3>Tuition Overview</h3><ul><li>Spark Studio full day: $1,400/month</li><li>Elementary & Middle School Studios: $1,400/month</li><li>Future Launch Pad (ages 14–18): $1,300/month</li><li>Sibling discounts available — confirm current rates with admissions</li></ul><p>Join us to learn how River Oak makes learner-driven education accessible in St. Johns.</p>`,
    attachments: ["tuition_overview.pdf"],
  },
  {
    id: "em4",
    to: "All Guides",
    from: "admin@mudkitchen.co",
    subject: "Admissions Flow Reminder — Call, Tour, Application, Trial",
    preview:
      "Reminder on the enrollment path for prospective families exploring Spark through Middle School studios...",
    date: "2 weeks ago",
    body: `<p>Team,</p><p>Quick reminder on our admissions flow:</p><ol><li>Respond to introductory call inquiries within 48 hours</li><li>Schedule a campus tour for interested families</li><li>Send application materials after the initial conversation</li><li>Arrange a trial period (one to two weeks up to a full session)</li><li>Meet for a decision together with the family</li></ol><p>Currently serving learners ages 4–14, with Future Launch Pad for ages 14–18.</p>`,
    attachments: [],
  },
];

export const adminContentOverrides = {
  demoEvents,
  demoLeads,
  demoEmails,
  admissionsSubtitle:
    "Introductory call inquiries and campus tours for families exploring Spark, Elementary, and Middle School studios — learner-driven education in St. Johns, FL.",
};
