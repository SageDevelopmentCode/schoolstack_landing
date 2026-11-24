/** Admin content overrides for heartsong-cottage-school. Fictional product-demo records, not real families. */

export const demoEvents = [
  { id: "c1", title: "Family meeting — First/Second Grade", date: "2026-12-01", type: "event" },
  { id: "c2", title: "Winter festival", date: "2026-12-17", type: "event" },
  { id: "c3", title: "Review Third/Fourth waitlist", date: "2026-12-03", type: "internal" },
  { id: "c4", title: "December tuition due", date: "2026-12-01", type: "internal" },
];

export const demoLeads = [
  {
    id: "l0",
    type: "contact",
    name: "Maya Chen",
    email: "maya.chen@email.com",
    phone: "(801) 555-0142",
    childName: "Iris",
    childAge: "7",
    status: "new",
    tags: ["First/Second Grade", "UFA"],
    date: "12 minutes ago",
    message: "Iris will be in 2nd grade. We homeschool and plan to use our UFA scholarship. Is there room in First/Second?",
    flowId: "flow-5",
    responses: { f29: "Maya Chen", f30: "maya.chen@email.com", f31: "First/Second Grade (ages 6–8)", f32: "", f33: "" },
  },
  {
    id: "l1",
    type: "waitlist",
    name: "Andre Williams",
    email: "andre.williams@email.com",
    phone: "(385) 555-0198",
    childName: "Theo",
    childAge: "9",
    status: "new",
    tags: ["Third/Fourth Grade", "Waitlist", "Siblings"],
    date: "40 minutes ago",
    message: "Please add Theo to the Third/Fourth waitlist. His sister applied for First/Second; we'd enroll either one on their own.",
    flowId: "flow-3",
    responses: { f16: "Andre Williams", f17: "andre.williams@email.com", f18: "Third/Fourth Grade (ages 8–10)", f19: true },
  },
  {
    id: "l2",
    type: "contact",
    name: "Priya Shah",
    email: "priya.shah@email.com",
    phone: "(801) 555-0218",
    childName: "Arjun",
    childAge: "11",
    status: "contacted",
    tags: ["Fifth/Sixth Grade", "OpenEd"],
    date: "3 hours ago",
    message: "Arjun would join Fifth/Sixth. How does reimbursement through OpenEd work with the monthly tuition?",
    flowId: "flow-1",
    responses: {
      f1: "Priya",
      f2: "Shah",
      f3: "priya.shah@email.com",
      f4: "(801) 555-0218",
      f5: "Arjun",
      f6: "11",
      f7: "5th",
      f8: "Fifth/Sixth Grade (ages 10–12)",
      f9: "",
      f10: true,
    },
  },
];

export const demoEmails = [
  {
    id: "em1",
    to: "All Families",
    from: "admin@mudkitchen.co",
    subject: "December tuition and the winter festival",
    preview: "December tuition is due on the 1st. Join us for our winter festival on the 17th...",
    date: "2 days ago",
    body: `<p>Dear families,</p><p>December tuition is due on the 1st. You'll find your invoice and receipts in the parent portal.</p><p>Heartsong Cottage School</p>`,
    attachments: [],
  },
  {
    id: "em2",
    to: "maya.chen@email.com",
    from: "admin@mudkitchen.co",
    subject: "Re: First/Second Grade",
    preview: "Thank you for applying. We'd love to meet Iris...",
    date: "1 hour ago",
    body: `<p>Hi Maya,</p><p>Thank you for applying. We'd love to meet Iris. We'll send her enrollment checklist after we talk.</p><p>Heartsong Cottage School</p>`,
    attachments: [],
  },
];

export const adminContentOverrides = {
  demoEvents,
  demoLeads,
  demoEmails,
  admissionsSubtitle: "Applications and waitlists for First/Second, Third/Fourth and Fifth/Sixth Grade.",
};
