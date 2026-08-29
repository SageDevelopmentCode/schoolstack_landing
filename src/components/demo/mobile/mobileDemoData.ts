export type MobileDemoStudent = {
  id: string;
  name: string;
  grade: string;
  classroom: string;
  initials: string;
  color: string;
  guardian: string;
  guardianPhone: string;
};

export type MobileDemoLeadStatus = "new" | "contacted" | "emailed";
export type MobileDemoLeadFlow = "school-year" | "summer";

export type MobileDemoLead = {
  id: string;
  name: string;
  email: string;
  childName: string;
  childGrade: string;
  status: MobileDemoLeadStatus;
  flow: MobileDemoLeadFlow;
  tags: string[];
  date: string;
  message: string;
};

export type MobileDemoChild = {
  id: string;
  name: string;
  initials: string;
  color: string;
};

export type MobileDemoInvoice = {
  id: string;
  childId: string;
  description: string;
  dueDate: string;
  amount: number;
};

export const MOBILE_DEMO_STUDENTS: MobileDemoStudent[] = [
  {
    id: "s1",
    name: "Emma Johnson",
    grade: "2nd Grade",
    classroom: "Primary",
    initials: "EJ",
    color: "#5B8DEF",
    guardian: "Sarah Johnson",
    guardianPhone: "(602) 555-0141",
  },
  {
    id: "s2",
    name: "Liam Chen",
    grade: "1st Grade",
    classroom: "Primary",
    initials: "LC",
    color: "#34A853",
    guardian: "Michael Chen",
    guardianPhone: "(602) 555-0182",
  },
  {
    id: "s3",
    name: "Sophia Martinez",
    grade: "Kindergarten",
    classroom: "Early Childhood",
    initials: "SM",
    color: "#E8710A",
    guardian: "Elena Martinez",
    guardianPhone: "(602) 555-0193",
  },
  {
    id: "s4",
    name: "Noah Williams",
    grade: "3rd Grade",
    classroom: "Elementary",
    initials: "NW",
    color: "#8B5CF6",
    guardian: "James Williams",
    guardianPhone: "(602) 555-0204",
  },
  {
    id: "s5",
    name: "Ava Thompson",
    grade: "Kindergarten",
    classroom: "Early Childhood",
    initials: "AT",
    color: "#EC4899",
    guardian: "Rachel Thompson",
    guardianPhone: "(602) 555-0215",
  },
  {
    id: "s6",
    name: "Ethan Davis",
    grade: "2nd Grade",
    classroom: "Primary",
    initials: "ED",
    color: "#14B8A6",
    guardian: "Karen Davis",
    guardianPhone: "(602) 555-0226",
  },
  {
    id: "s7",
    name: "Mia Rodriguez",
    grade: "1st Grade",
    classroom: "Primary",
    initials: "MR",
    color: "#F59E0B",
    guardian: "Carlos Rodriguez",
    guardianPhone: "(602) 555-0237",
  },
  {
    id: "s8",
    name: "Lucas Park",
    grade: "3rd Grade",
    classroom: "Elementary",
    initials: "LP",
    color: "#6366F1",
    guardian: "Jennifer Park",
    guardianPhone: "(602) 555-0248",
  },
  {
    id: "s9",
    name: "Isabella Nguyen",
    grade: "2nd Grade",
    classroom: "Primary",
    initials: "IN",
    color: "#EF4444",
    guardian: "Linh Nguyen",
    guardianPhone: "(602) 555-0259",
  },
];

export const MOBILE_DEMO_LEADS: MobileDemoLead[] = [
  {
    id: "l1",
    name: "Jessamine Mumtaz",
    email: "jmumtaz@email.com",
    childName: "Sofia Mumtaz",
    childGrade: "4th Grade",
    status: "new",
    flow: "school-year",
    tags: ["Schedule a Visit", "2026–27 Enrollment"],
    date: "12 min ago",
    message:
      "Interested in enrollment for our 4th grader — would love a tour and help understanding enrollment options.",
  },
  {
    id: "l2",
    name: "Diana Foster",
    email: "diana@email.com",
    childName: "Noah Foster",
    childGrade: "Kindergarten",
    status: "new",
    flow: "summer",
    tags: ["Summer 2026"],
    date: "18 min ago",
    message: "Looking for summer program options for my 5-year-old.",
  },
  {
    id: "l3",
    name: "Robert Kim",
    email: "rkim@gmail.com",
    childName: "Hannah Kim",
    childGrade: "3rd Grade",
    status: "contacted",
    flow: "school-year",
    tags: ["School Year", "Financial Aid"],
    date: "5 hours ago",
    message: "Interested in fall enrollment for my daughter in 3rd grade.",
  },
  {
    id: "l4",
    name: "Priya Patel",
    email: "ppatel@email.com",
    childName: "Raj Patel",
    childGrade: "2nd Grade",
    status: "emailed",
    flow: "school-year",
    tags: ["School Year"],
    date: "Mar 20",
    message: "Submitted waitlist form — hoping for a spot this fall.",
  },
  {
    id: "l5",
    name: "Mark Sullivan",
    email: "msullivan@email.com",
    childName: "Alex Sullivan",
    childGrade: "1st Grade",
    status: "new",
    flow: "summer",
    tags: ["Summer 2026"],
    date: "3 hours ago",
    message: "Looking for summer options for my son, age 7.",
  },
];

export const MOBILE_DEMO_CHILDREN: MobileDemoChild[] = [
  { id: "emma", name: "Emma", initials: "E", color: "#5B8DEF" },
  { id: "liam", name: "Liam", initials: "L", color: "#34A853" },
];

export const MOBILE_DEMO_INVOICES: MobileDemoInvoice[] = [
  {
    id: "inv-1",
    childId: "emma",
    description: "Spring tuition — Emma",
    dueDate: "Mar 1, 2026",
    amount: 425,
  },
  {
    id: "inv-2",
    childId: "emma",
    description: "Activity fee — Emma",
    dueDate: "Mar 1, 2026",
    amount: 75,
  },
  {
    id: "inv-3",
    childId: "liam",
    description: "Spring tuition — Liam",
    dueDate: "Mar 1, 2026",
    amount: 425,
  },
];

export type AttendanceStatus = "checked_in" | "checked_out" | "absent" | "not_marked";

export const DEFAULT_ATTENDANCE: Record<string, AttendanceStatus> = {
  s1: "checked_in",
  s2: "checked_in",
  s3: "absent",
  s4: "checked_in",
  s5: "checked_in",
  s6: "checked_out",
  s7: "checked_in",
  s8: "not_marked",
  s9: "checked_in",
};
