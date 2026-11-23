/** Admin content overrides for meadows-bee-farm. Fictional product-demo records, not real families. */

export const demoEvents = [
  { id: "c1", title: "Wednesday Young Farmers", date: "2026-12-02", type: "event" },
  { id: "c2", title: "Wednesday Young Farmers", date: "2026-12-09", type: "event" },
  { id: "c3", title: "Review scholarship requests", date: "2026-12-03", type: "internal" },
  { id: "c4", title: "Order Level One badges", date: "2026-12-07", type: "internal" },
  { id: "c5", title: "Young Farmer Starts family day", date: "2026-12-12", type: "event" },
];

export const demoLeads = [
  {
    id: "l0",
    type: "contact",
    name: "Maya Chen",
    email: "maya.chen@email.com",
    phone: "(802) 555-0142",
    childName: "Iris",
    childAge: "7",
    status: "new",
    tags: ["Wednesday Young Farmers", "Scholarship"],
    date: "12 minutes ago",
    message: "Iris loves animals and wants to start her Livestock badge. Could she join the January Wednesdays, and how do scholarships work?",
    flowId: "flow-5",
    responses: { f29: "Maya Chen", f30: "maya.chen@email.com", f31: "Wednesday Young Farmers (5–10)", f32: "", f33: "" },
  },
  {
    id: "l1",
    type: "contact",
    name: "Andre Williams",
    email: "andre.williams@email.com",
    phone: "(802) 555-0198",
    childName: "Theo",
    childAge: "9",
    status: "new",
    tags: ["Homeschool Wednesdays"],
    date: "40 minutes ago",
    message: "We homeschool in Londonderry. Theo finished Farm Connections Level One; can he keep going on Wednesdays?",
    flowId: "flow-5",
    responses: { f29: "Andre Williams", f30: "andre.williams@email.com", f31: "Homeschool Wednesdays", f32: "", f33: "" },
  },
  {
    id: "l2",
    type: "contact",
    name: "Priya Shah",
    email: "priya.shah@email.com",
    phone: "(802) 555-0218",
    childName: "Arjun",
    childAge: "5",
    status: "contacted",
    tags: ["Family day", "Allergy"],
    date: "3 hours ago",
    message: "Signing up the four of us for the family day. Arjun has a dairy allergy; we'll bring his food.",
    flowId: "flow-5",
    responses: { f29: "Priya Shah", f30: "priya.shah@email.com", f31: "Young Farmer Starts family day", f32: "", f33: "" },
  },
];

export const demoEmails = [
  {
    id: "em1",
    to: "Young Farmer Families",
    from: "admin@mudkitchen.co",
    subject: "January Wednesdays are open",
    preview: "Sign up for January 13, 20 and 27. $40 a session, scholarships on request...",
    date: "2 days ago",
    body: `<p>Dear families,</p><p>January Wednesdays are open for sign-up. Please dress for the weather, wear waterproof shoes and label everything.</p><p>Meadows Bee Farm</p>`,
    attachments: [],
  },
  {
    id: "em2",
    to: "maya.chen@email.com",
    from: "admin@mudkitchen.co",
    subject: "Re: January Wednesdays",
    preview: "We'd love to have Iris. I've noted the scholarship request...",
    date: "1 hour ago",
    body: `<p>Hi Maya,</p><p>We'd love to have Iris on the farm. I've noted your scholarship request and will send her sign-up checklist this week.</p><p>Meadows Bee Farm</p>`,
    attachments: [],
  },
];

export const adminContentOverrides = {
  demoEvents,
  demoLeads,
  demoEmails,
  admissionsSubtitle: "Sign-ups for Wednesday Young Farmers, family days and Homeschool Wednesdays.",
};
