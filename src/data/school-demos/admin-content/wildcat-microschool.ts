/** Admin content overrides for wildcat-microschool. Fictional product-demo records, not school testimonials. */

export const demoEvents = [
  {
    id: "c1",
    title: "Follow up — learning pod question",
    date: "2026-10-14",
    type: "event",
  },
  {
    id: "c2",
    title: "Waitlist question — sample inquiry",
    date: "2026-10-16",
    type: "event",
  },
  {
    id: "c3",
    title: "Review sample admissions notes",
    date: "2026-10-15",
    type: "internal",
  },
  {
    id: "c4",
    title: "Point family to the current contact page",
    date: "2026-10-21",
    type: "internal",
  },
];

export const demoLeads = [
  {
    id: "l0",
    type: "contact",
    name: "Maya Chen",
    email: "maya.chen@email.com",
    phone: "(603) 555-0142",
    childName: null,
    childAge: null,
    status: "new",
    tags: ["General question", "Haverhill"],
    date: "12 minutes ago",
    message:
      "We live near Haverhill and would like to ask how the homeschool learning pod works. This is sample preview data and was not sent to the school.",
    flowId: "flow-5",
    responses: {
      f29: "Maya Chen",
      f30: "maya.chen@email.com",
      f31: "General question",
      f32: "",
      f33: "",
    },
  },
  {
    id: "l1",
    type: "waitlist",
    name: "Andre Williams",
    email: "andre.williams@email.com",
    phone: "(603) 555-0198",
    childName: null,
    childAge: null,
    status: "new",
    tags: ["Waitlist question"],
    date: "40 minutes ago",
    message:
      "Asking how the waitlist form works. This sample does not mean a seat is open or that a child was added to a list.",
    flowId: "flow-3",
    responses: {
      f16: "Andre Williams",
      f17: "andre.williams@email.com",
      f18: "",
      f19: false,
    },
  },
  {
    id: "l2",
    type: "contact",
    name: "Priya Shah",
    email: "priya.shah@email.com",
    phone: "(603) 555-0218",
    childName: null,
    childAge: null,
    status: "contacted",
    tags: ["Nature-based learning"],
    date: "3 hours ago",
    message:
      "Curious about outdoor learning on the forestland the school describes. Not asking for a street address.",
    flowId: "flow-1",
    responses: {
      f1: "Priya",
      f2: "Shah",
      f3: "priya.shah@email.com",
      f4: "(603) 555-0218",
      f5: "",
      f6: "",
      f7: "",
      f8: "General question",
      f9: "",
      f10: false,
    },
  },
  {
    id: "l3",
    type: "contact",
    name: "Chris Alvarez",
    email: "chris.alvarez@email.com",
    phone: "(603) 555-0391",
    childName: null,
    childAge: null,
    status: "new",
    tags: ["General question"],
    date: "Yesterday",
    message:
      "Looking for the school's current contact page so we can write them directly. This preview message stays inside the demo.",
    flowId: "flow-5",
    responses: {
      f29: "Chris Alvarez",
      f30: "chris.alvarez@email.com",
      f31: "General question",
      f32: "",
      f33: "",
    },
  },
];

export const demoEmails = [
  {
    id: "em1",
    to: "Prospective Families",
    from: "admin@mudkitchen.co",
    subject: "A question about the Wildcat learning pod",
    preview:
      "Sample preview note. Wildcat has not published tuition, ages, or current openings on the pages used for this concept...",
    date: "2 days ago",
    body: `<p>Hello,</p><p>This is sample admin copy for a Wildcat Microschool concept preview in Haverhill, New Hampshire. It was not sent by the school.</p><p>Wildcat describes itself as a homeschool learning pod with student-driven, hands-on learning. The school's current contact page is https://wildcatmicroschool.weebly.com/contact.html.</p><p>Do not quote tuition, an age range, a schedule, or open seats. Those details were not on the retrieved site.</p>`,
    attachments: [],
  },
  {
    id: "em2",
    to: "maya.chen@email.com",
    from: "admin@mudkitchen.co",
    subject: "Re: Question about the learning pod",
    preview:
      "Thank you for the sample question. A real message belongs on the school's current contact page...",
    date: "1 hour ago",
    body: `<p>Hi Maya,</p><p>This note is sample preview copy. It was not delivered to you or to Wildcat Microschool.</p><p>For a real question, use https://wildcatmicroschool.weebly.com/contact.html. A waitlist form on that page is separate from a general message and does not confirm availability.</p><p>Wildcat Microschool Office</p>`,
    attachments: [],
  },
  {
    id: "em3",
    to: "Admissions Team",
    from: "admin@mudkitchen.co",
    subject: "Sample follow-up — contact page and waitlist",
    preview:
      "Keep general questions and waitlist questions separate. Do not promise a seat or a current-year calendar...",
    date: "1 week ago",
    body: `<p>Team,</p><p>When walking through this concept:</p><ol><li>General questions go to the current contact page.</li><li>Waitlist questions are a separate process and do not prove that spots are open.</li><li>The calendar label stays 2025–2026. Do not rename it.</li><li>The March 2024 robotics story is a past blog post, not a current program.</li></ol>`,
    attachments: [],
  },
];

export const adminContentOverrides = {
  demoEvents,
  demoLeads,
  demoEmails,
  admissionsSubtitle:
    "Sample questions about the Haverhill homeschool learning pod. This preview does not show current openings.",
};
