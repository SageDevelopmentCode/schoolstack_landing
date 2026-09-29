// Demo data lifted from the website demos (AdminDashboardDemo, the teacher and
// parent demo fixtures), with one family (the Riveras) threaded through all
// three portals so the story reads as one school.
import { img } from "./tokens";

export const SCHOOL = { name: "MudKitchen Microschool", short: "MudKitchen", today: "Monday, May 11", weekday: "Monday" };

// ─── School admin ───────────────────────────────────────────────────────────

export const ADMIN_FOCUS = [
  { title: "8 applications need review", subtitle: "Families are waiting on your next step.", cta: "Review now", icon: "application" },
  { title: "3 shadow day requests", subtitle: "Open slots this week for visiting families.", cta: "Schedule", icon: "schedule" },
  { title: "1 student not marked yet", subtitle: "Today's attendance is almost complete.", cta: "Mark attendance", icon: "attendance" },
] as const;

export const ADMIN_SIGNAL = {
  headline: "24 enrolled · 8 awaiting review",
  body: "MudKitchen has steady enrollment momentum. Review applications to keep families moving through the pipeline.",
  cta: "View admissions",
};

export const ADMIN_METRICS = [
  { value: 22, label: "Active applications", accent: "forest", format: (n: number) => String(Math.round(n)) },
  { value: 6, label: "Shadow days this month", accent: "sky", format: (n: number) => String(Math.round(n)) },
  { value: 12480, label: "Collected this month", accent: "gold", format: (n: number) => `$${Math.round(n).toLocaleString("en-US")}` },
  { value: 4, label: "Unread messages", accent: "berry", format: (n: number) => String(Math.round(n)) },
] as const;

export const ADMIN_ATTENDANCE = [
  { name: "Emma Rivera", status: "present" },
  { name: "Noah Chen", status: "picked_up" },
  { name: "Ava Brooks", status: "absent" },
  { name: "Liam Patel", status: "present" },
] as const;

export const FLOW_FILTERS = [
  { label: "All Forms", count: null },
  { label: "Discovery Call", count: 3 },
  { label: "Apply Now Form", count: 6 },
  { label: "Enrollment Checklist", count: 4 },
  { label: "Waitlist Signup", count: 2 },
  { label: "Book a Campus Tour", count: 2 },
] as const;

export type LeadStatus = "new" | "contacted" | "application_sent" | "enrolled" | "in_review";

export const LEADS: {
  form: string;
  name: string;
  email: string;
  child: string;
  childMeta: string;
  photo?: string;
  status: LeadStatus;
  date: string;
  isNew?: boolean;
  rivera?: boolean;
}[] = [
  { form: "Discovery Call", name: "Jennifer Walsh", email: "jwalsh@email.com", child: "Ethan Walsh", childMeta: "8th Grade", status: "new", date: "12 minutes ago", isNew: true },
  { form: "Enrollment Checklist", name: "Sarah Rivera", email: "sarah.rivera@email.com", child: "Emma Rivera", childMeta: "Age 9", photo: img.emma, status: "contacted", date: "1 hour ago", rivera: true },
  { form: "Waitlist Signup", name: "Diana Foster", email: "diana@email.com", child: "Noah Foster", childMeta: "Age 5", photo: img.noah, status: "new", date: "18 minutes ago" },
  { form: "Apply Now Form", name: "Priya Patel", email: "priya.patel@email.com", child: "Raj Patel", childMeta: "Age 7", photo: img.raj, status: "contacted", date: "Yesterday" },
  { form: "Book a Campus Tour", name: "Claire Beaumont", email: "claire.b@email.com", child: "Lily Beaumont", childMeta: "Age 6", photo: img.lily, status: "in_review", date: "2 days ago" },
  { form: "Apply Now Form", name: "Jerome Watkins", email: "jwatkins@email.com", child: "Tyler Watkins", childMeta: "Age 10", photo: img.liam, status: "enrolled", date: "3 days ago" },
  { form: "Discovery Call", name: "Robert Kim", email: "rkim@email.com", child: "Hannah Kim", childMeta: "Age 8", photo: img.ava, status: "application_sent", date: "4 days ago" },
];

export const LEAD_FILTERS = [
  { key: "all", label: "All", count: 17 },
  { key: "new", label: "New", count: 3 },
  { key: "contacted", label: "Contacted", count: 2 },
  { key: "application_sent", label: "App Sent", count: 1 },
  { key: "enrolled", label: "Enrolled", count: 1 },
  { key: "lost", label: "Lost", count: 2 },
] as const;

export const ADMIN_ROSTER = [
  { name: "Emma Rivera", family: "Rivera Family", grade: "3rd", program: "Lower Elementary", classroom: null as string | null, teacher: null as string | null, photo: img.emma, emma: true },
  { name: "Noah Chen", family: "Chen Family", grade: "1st", program: "Primary", classroom: "Maple Room", teacher: "Jordan Taylor", photo: img.noah },
  { name: "Ava Brooks", family: "Brooks Family", grade: "5th", program: "Upper Elementary", classroom: "Cedar Room", teacher: "Ms. Kim", photo: img.ava },
  { name: "Liam Patel", family: "Patel Family", grade: "2nd", program: "Lower Elementary", classroom: "Oak Room", teacher: "Jordan Taylor", photo: img.liam },
  { name: "Sophia Nguyen", family: "Nguyen Family", grade: "4th", program: "Upper Elementary", classroom: "Cedar Room", teacher: "Ms. Kim", photo: img.lily },
  { name: "Mason Foster", family: "Foster Family", grade: "K", program: "Primary", classroom: "Maple Room", teacher: "Jordan Taylor", photo: img.mason },
  { name: "Olivia Martinez", family: "Martinez Family", grade: "3rd", program: "Lower Elementary", classroom: "Oak Room", teacher: "Jordan Taylor", photo: null },
];

export const ADMIN_STUDENTS = [
  { name: "Emma Rivera", initials: "ER", color: "#5E7C68", grade: "3rd", teacher: "Jordan Taylor", flags: [] as string[] },
  { name: "Liam Torres", initials: "LT", color: "#38BDF8", grade: "4th", teacher: "Mr. Davis", flags: ["Allergies"] },
  { name: "Ava Chen", initials: "AC", color: "#EC4899", grade: "1st", teacher: "Ms. Kim", flags: ["Allergies", "Medical"] },
  { name: "Noah Foster", initials: "NF", color: "#F59E0B", grade: "K", teacher: "Ms. Johnson", flags: [] },
  { name: "Sophia Patel", initials: "SP", color: "#A78BFA", grade: "3rd", teacher: "Ms. Hughes", flags: [] },
  { name: "Isabelle Clarke", initials: "IC", color: "#8B5CF6", grade: "6th", teacher: "Mr. Reynolds", flags: ["Medical"] },
  { name: "Tyler Watkins", initials: "TW", color: "#22C55E", grade: "4th", teacher: "Mr. Davis", flags: [] },
  { name: "Chidera Okonkwo", initials: "CO", color: "#F97316", grade: "3rd", teacher: "Ms. Hughes", flags: [] },
  { name: "Marcus Webb", initials: "MW", color: "#F97316", grade: "5th", teacher: "Ms. Carter", flags: ["Medical"] },
];

export const EMMA_PROFILE = {
  name: "Emma Rivera",
  meta: "3rd · Oak Room · Jordan Taylor",
  info: [
    ["Full Name", "Emma Rivera"],
    ["Date of Birth", "Apr 12, 2017"],
    ["Grade", "3rd"],
    ["Classroom", "Oak Room"],
    ["Teacher", "Jordan Taylor"],
    ["Parent / Guardian", "Sarah Rivera"],
  ],
  immunizations: [
    ["MMR (Measles, Mumps, Rubella)", "Sep 2019"],
    ["DTaP (Diphtheria, Tetanus, Pertussis)", "Sep 2019"],
    ["Varicella (Chickenpox)", "Sep 2019"],
    ["Hepatitis B", "Mar 2018"],
    ["Polio (IPV)", "Sep 2019"],
    ["Flu (Annual)", "Sep 2026"],
  ],
};

export const STUDENT_TABS = [
  { label: "Profile", color: "#5E7C68" },
  { label: "Health", color: "#EF4444" },
  { label: "Pickup", color: "#F59E0B" },
  { label: "Immunizations", color: "#8B5CF6" },
  { label: "Emergency", color: "#F97316" },
  { label: "Paperwork", color: "#38BDF8" },
  { label: "Billing", color: "#22C55E" },
];

export const FIN_STATS = [
  { label: "Total Revenue", value: 47320, suffix: "", tone: "success" },
  { label: "Total Expenses", value: 31840, suffix: "", tone: "error" },
  { label: "Net Profit", value: 15480, suffix: "", tone: "accent" },
  { label: "Burn Rate", value: 2653, suffix: "/mo", tone: "warning" },
] as const;

export const MONTHLY_REVENUE = [
  { month: "May", revenue: 3200, expenses: 2800 },
  { month: "Jun", revenue: 8400, expenses: 4100 },
  { month: "Jul", revenue: 9200, expenses: 4300 },
  { month: "Aug", revenue: 7100, expenses: 5200 },
  { month: "Sep", revenue: 9800, expenses: 5400 },
  { month: "Oct", revenue: 10200, expenses: 5500 },
  { month: "Nov", revenue: 9600, expenses: 5200 },
  { month: "Dec", revenue: 5800, expenses: 3200 },
  { month: "Jan", revenue: 9400, expenses: 5300 },
  { month: "Feb", revenue: 9600, expenses: 5400 },
  { month: "Mar", revenue: 9800, expenses: 5500 },
  { month: "Apr", revenue: 4200, expenses: 2600 },
];

export const BUDGET_CATS = [
  { name: "Personnel", emoji: "👥", planned: 24000, actual: 17280, tone: "accent" },
  { name: "Facilities", emoji: "🏫", planned: 8400, actual: 4872, tone: "info" },
  { name: "Program Supplies", emoji: "📚", planned: 2600, actual: 2912, tone: "warning" },
  { name: "Operations", emoji: "⚙️", planned: 4800, actual: 2112, tone: "purple" },
  { name: "Marketing", emoji: "📣", planned: 2000, actual: 600, tone: "accentBright" },
  { name: "Other", emoji: "📦", planned: 1600, actual: 240, tone: "textTertiary" },
] as const;

// ─── Teacher portal ─────────────────────────────────────────────────────────

export const TEACHER = { name: "Jordan Taylor", first: "Jordan", initials: "JT", role: "Lead Teacher · Teacher" };

export const TEACHER_FOCUS = [
  { title: "Reply to 3 unread messages", subtitle: "Families and staff are waiting on your response", icon: "message" },
  { title: "Staff Meeting today", subtitle: "8:30 AM – 9:15 AM", icon: "calendar" },
  { title: "1 student not marked yet", subtitle: "Finish today's attendance before pickup", icon: "attendance" },
] as const;

export const TEACHER_STUDENTS = [
  { first: "Emma", grade: "3rd", program: "Lower Elementary", photo: img.emma },
  { first: "Noah", grade: "1st", program: "Primary", photo: img.noah },
  { first: "Ava", grade: "5th", program: "Upper Elementary", photo: img.ava },
  { first: "Liam", grade: "2nd", program: "Lower Elementary", photo: img.liam },
  { first: "Sophia", grade: "4th", program: "Upper Elementary", photo: img.lily },
  { first: "Mason", grade: "K", program: "Primary", photo: img.mason },
  { first: "Olivia", grade: "3rd", program: "Lower Elementary", photo: null },
  { first: "Ethan", grade: "1st", program: "Primary", photo: img.raj },
];

export const TEACHER_THREADS = [
  { title: "Rivera Family", subtitle: "Emma Rivera · 3rd", color: "#5E7C68", preview: "Emma will be picked up early today around 2:30.", time: "1:45 PM", unread: 2 },
  { title: "Chen Family", subtitle: "Noah Chen · 1st", color: "#8EBDCB", preview: "Thanks for the update on today's nature walk.", time: "Yesterday", unread: 0 },
  { title: "School Office", subtitle: "Admissions team", color: "#A9667C", preview: "Can you cover the Maple Room shadow visit on Thursday?", time: "Thu", unread: 1 },
];

export const RIVERA_THREAD = [
  { own: false, name: "Sarah Rivera", time: "1:10 PM", body: "Hi Jordan! Emma will be picked up early today around 2:30. Her grandmother is coming instead of me." },
];
export const RIVERA_REPLY = "Thanks for letting me know, Sarah. I'll have Emma ready at the front desk at 2:30.";

export const TEACHER_EVENTS = [
  { day: 11, title: "Staff Meeting", time: "8:30 AM", tone: "sky" },
  { day: 13, title: "Nature Walk", time: "10:00 AM", tone: "sage" },
  { day: 14, title: "Art Showcase", time: "5:30 PM", tone: "berry", next: true },
  { day: 22, title: "Field Day", time: "All day", tone: "sun", next: true },
] as const;

// ─── Parent mobile app ──────────────────────────────────────────────────────

export const PARENT = { first: "Sarah", last: "Mitchell", date: "Monday, May 11" };

export const PARENT_EVENTS = [
  { title: "Spring art showcase", meta: "Thursday, May 14 · 5:30 PM" },
  { title: "Field day", meta: "Friday, May 22 · All day" },
  { title: "Last day of school", meta: "Friday, June 5" },
];

export const BILLING = {
  due: "$1,250.00",
  dueLabel: "Due May 15",
  forLine: "Emma · May tuition",
  remaining: "$4,500.00",
  subtitle: "4 payments remaining · $4,500.00 left this school year",
};

export const CHILDREN = [
  { first: "Emma", status: "Enrolling", tone: "info", line: "3rd grade · Lower Elementary", photo: img.emma },
  { first: "Jake", status: "Enrolled", tone: "success", line: "1st grade · Primary", photo: img.jake },
  { first: "Liam", status: "Enrolled", tone: "success", line: "Kindergarten · Primary", photo: img.liam },
] as const;

export const CHECKLIST = [
  { title: "Program Description", icon: "document-text-outline", bg: "#E2EDD9", done: true },
  { title: "Community Agreement", icon: "people-outline", bg: "#DCEBF2", sign: true },
  { title: "Health form", icon: "heart-outline", bg: "#F8E0E7", done: true },
  { title: "Medication Plan", icon: "medkit-outline", bg: "#F3EAD6", done: true },
  { title: "Immunizations", icon: "shield-checkmark-outline", bg: "#E8E4F0", upload: true },
  { title: "Health Info", icon: "clipboard-outline", bg: "#E2EDD9" },
  { title: "Photo Release", icon: "camera-outline", bg: "#DCEBF2" },
  { title: "Assumption of Risk", icon: "warning-outline", bg: "#F3EAD6" },
  { title: "Authorized Pickup", icon: "person-add-outline", bg: "#F8E0E7" },
  { title: "Pay Registration Fee", icon: "card-outline", bg: "#E2EDD9" },
] as const;

export const PARENT_THREADS = [
  { name: "Jordan Taylor", sub: "Emma · Oak Room", preview: "Emma loved the nature walk today!", time: "2:14 PM", unread: true, color: "#5E7C68" },
  { name: "School Office", sub: "MudKitchen Microschool", preview: "Picture day is next Thursday.", time: "Yesterday", unread: false, color: "#A9667C" },
  { name: "Ms. Kim", sub: "Jake · Maple Room", preview: "Jake's reading log looks great.", time: "Fri", unread: false, color: "#8EBDCB" },
  { name: "Mr. Davis", sub: "Liam · Cedar Room", preview: "Reminder: rain boots tomorrow.", time: "Thu", unread: false, color: "#E4BD65" },
];

export const PARENT_AGENDA = [
  { day: "MON", date: "11", title: "Staff Meeting (no drop-off change)", meta: "8:30 AM · School-wide" },
  { day: "WED", date: "13", title: "Nature Walk — Elementary", meta: "10:00 AM · Emma, Jake" },
  { day: "THU", date: "14", title: "Spring art showcase", meta: "5:30 PM · Main building" },
  { day: "FRI", date: "22", title: "Field day", meta: "All day · Back field" },
];

export const PARENT_FORMS = [
  { title: "Field trip permission", meta: "Emma · Nature Walk", status: "Signed" },
  { title: "Photo release", meta: "Jake", status: "Signed" },
  { title: "Community agreement", meta: "Emma", status: "Signed" },
  { title: "Allergy action plan", meta: "Liam", status: "Needs action" },
];
