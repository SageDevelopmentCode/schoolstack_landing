"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Users,
  CreditCard,
  MessageCircle,
  Calendar,
  Rss,
  Heart,
  Phone,
  HelpCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Plus,
  Trash2,
  Upload,
  ClipboardCheck,
  Pill,
  ShieldCheck,
  Camera,
  AlertTriangle,
  UserPlus,
  PenLine,
  CheckCircle,
  Clock,
  Mail,
  Copy,
  BookOpen,
  ClipboardList,
  Send,
  Paperclip,
  Image,
  Download,
  Smile,
  MessageSquare,
  MapPin,
  Home,
  Gift,
  Car,
  CalendarDays,
  CalendarClock,
  ArrowRight,
  Smartphone,
  Landmark,
  Banknote,
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type ChildId = "emma" | "jake" | "liam";
type NavTab =
  | "home"
  | "enrollment"
  | "children"
  | "billing"
  | "messages"
  | "calendar"
  | "feed"
  | "forms"
  | "volunteer"
  | "emergency-contacts";
type ModalId =
  | null
  | "contract-1"
  | "contract-2"
  | "health-form"
  | "medication-plan"
  | "immunization"
  | "photo-release"
  | "assumption-of-risk"
  | "authorized-pickup"
  | "health-statement"
  | "registration-fee";
type ChildDetailTab = "teacher" | "attendance" | "learning" | "profile";

interface DemoMedication {
  id: string;
  name: string;
  condition: string;
  dosage: string;
}
interface DemoAuthorizedPerson {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}
interface DemoMessage {
  id: string;
  senderId: string;
  text: string;
  time: string;
}
interface DemoConversation {
  id: string;
  name: string;
  role: string;
  lastMsg: string;
  lastTime: string;
  unread: number;
  color: string;
}
interface DemoEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  category: string;
  color: string;
  description: string;
  program: "summer" | "school-year";
  location?: string;
  instructor?: string;
  whatToBring?: string[];
  attendees?: string[];
  rsvpRequired?: boolean;
}
interface DemoPost {
  id: string;
  author: string;
  role: string;
  time: string;
  text: string;
  color: string;
  attachments?: { type: "image"; src: string; name?: string }[];
}
type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";

const WEEKDAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];

interface HomeschoolDropInWeek {
  id: string;
  weekLabel: string;
  dateRange: string;
  defaultDays: Weekday[];
}

const JAKE_HOMESCHOOL_DROPIN_TX_ID = "jake-homeschool-dropin";

const HOMESCHOOL_DROPIN_RATE_PER_DAY = 100;

const HOMESCHOOL_DROPIN_WEEKS: HomeschoolDropInWeek[] = [
  {
    id: "apr-21",
    weekLabel: "Week of Apr 21",
    dateRange: "Apr 21–25, 2026",
    defaultDays: ["Wed"],
  },
  {
    id: "apr-28",
    weekLabel: "Week of Apr 28",
    dateRange: "Apr 28 – May 2, 2026",
    defaultDays: ["Tue", "Thu"],
  },
  {
    id: "may-5",
    weekLabel: "Week of May 5",
    dateRange: "May 5–9, 2026",
    defaultDays: ["Mon", "Wed", "Fri"],
  },
];

type PaymentPlan = "monthly" | "upfront";
type PaymentMethod = "card" | "ach" | "check";

const CARD_FEE_RATE = 0.029;
const ACH_FEE_RATE = 0.008;

const SCHOOL_YEAR_LABEL = "School Year 2026–27";
const BILLING_BANNER_SCHOOL_YEAR = "/images/stock/ImageFive.webp";
const BILLING_BANNER_HOMESCHOOL = "/images/stock/Homeschool2.webp";
const SCHOOL_YEAR_MONTHLY_TUITION = 1700;
const SCHOOL_YEAR_UPFRONT_TUITION = 17000;
const EMMA_SCHOOL_YEAR_TX_ID = "emma-school-year-tuition";
const LIAM_SCHOOL_YEAR_TX_ID = "liam-school-year-tuition";

const SCHOOL_YEAR_MONTHS = [
  { id: "aug-2026", label: "August 2026", short: "Aug" },
  { id: "sep-2026", label: "September 2026", short: "Sep" },
  { id: "oct-2026", label: "October 2026", short: "Oct" },
  { id: "nov-2026", label: "November 2026", short: "Nov" },
  { id: "dec-2026", label: "December 2026", short: "Dec" },
  { id: "jan-2027", label: "January 2027", short: "Jan" },
  { id: "feb-2027", label: "February 2027", short: "Feb" },
  { id: "mar-2027", label: "March 2027", short: "Mar" },
  { id: "apr-2027", label: "April 2027", short: "Apr" },
  { id: "may-2027", label: "May 2027", short: "May" },
];

const DEMO_SCHOOL_YEAR_MONTHS_PAID = 4;

interface DemoTransaction {
  id: string;
  desc: string;
  amount: string;
  date: string;
  status: "paid" | "pending";
  childId: ChildId;
  kind?: "standard" | "homeschool_dropin" | "school_year_tuition";
  scheduleNote?: string;
  schoolYearMonthId?: string;
}

function isHomeschoolDropIn(t: DemoTransaction): boolean {
  return t.kind === "homeschool_dropin";
}

function totalHomeschoolAmount(
  selections: Record<string, Weekday[]>,
): number {
  return HOMESCHOOL_DROPIN_WEEKS.reduce(
    (sum, w) => sum + homeschoolAmountForDays(selections[w.id] ?? []),
    0,
  );
}

function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function homeschoolAmountForDays(days: Weekday[]): number {
  return days.length * HOMESCHOOL_DROPIN_RATE_PER_DAY;
}

function initialHomeschoolSelections(): Record<string, Weekday[]> {
  return Object.fromEntries(
    HOMESCHOOL_DROPIN_WEEKS.map((w) => [w.id, [...w.defaultDays]]),
  );
}

function isSchoolYearTuition(t: DemoTransaction): boolean {
  return t.kind === "school_year_tuition";
}

function getSchoolYearAmount(plan: PaymentPlan): number {
  return plan === "monthly"
    ? SCHOOL_YEAR_MONTHLY_TUITION
    : SCHOOL_YEAR_UPFRONT_TUITION;
}

function getSchoolYearDescription(plan: PaymentPlan): string {
  return plan === "monthly"
    ? "May 2026 Tuition"
    : `${SCHOOL_YEAR_LABEL} Tuition`;
}

function getTxCheckoutAmount(
  t: DemoTransaction,
  plan: PaymentPlan,
  selections: Record<string, Weekday[]>,
): number {
  if (isHomeschoolDropIn(t)) return totalHomeschoolAmount(selections);
  if (isSchoolYearTuition(t)) return getSchoolYearAmount(plan);
  return parseFloat(t.amount.replace("$", "").replace(",", ""));
}

function getTxCheckoutDescription(
  t: DemoTransaction,
  plan: PaymentPlan,
): string {
  if (isSchoolYearTuition(t)) return getSchoolYearDescription(plan);
  return t.desc;
}

function getPaidTransactionsForMonth(
  paid: DemoTransaction[],
  monthId: string,
  checkoutMonthId?: string,
): DemoTransaction[] {
  return paid.filter((t) => {
    if (t.schoolYearMonthId === monthId) return true;
    if (
      checkoutMonthId &&
      monthId === checkoutMonthId &&
      isSchoolYearTuition(t) &&
      !t.schoolYearMonthId
    ) {
      return true;
    }
    return false;
  });
}

function getOtherPaidTransactions(paid: DemoTransaction[]): DemoTransaction[] {
  return paid.filter((t) => !t.schoolYearMonthId);
}

function getPendingBanner(t: DemoTransaction): string {
  return isHomeschoolDropIn(t) ? BILLING_BANNER_HOMESCHOOL : BILLING_BANNER_SCHOOL_YEAR;
}

interface DemoContact {
  label: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
}
interface DemoAttendance {
  date: string;
  checkIn: string;
  checkOut: string;
}
interface DemoLearningNote {
  date: string;
  note: string;
}

// ─── DEMO DATA ────────────────────────────────────────────────────────────────

const DEMO_CHILDREN = {
  emma: {
    id: "emma" as ChildId,
    name: "Emma Mitchell",
    grade: "Elementary",
    dob: "March 12, 2017",
    allergies: "Tree nuts, mild seasonal pollen",
    notes:
      "Loves art and outdoor activities. Thrives with visual learning approaches.",
    initials: "EM",
    color: "#7FA888",
    image:
      "/images/people/students/cristina-anne-costello-i8n-TbgzSUE-unsplash-thumb.webp",
    teachers: [
      {
        name: "Ms. Taylor Reyes",
        role: "Lead Teacher",
        email: "taylor@mudkitchen.co",
      },
      {
        name: "Ms. Nicole Park",
        role: "Co-Teacher",
        email: "nicole@mudkitchen.co",
      },
    ],
  },
  jake: {
    id: "jake" as ChildId,
    name: "Jake Mitchell",
    grade: "Pre-K",
    dob: "August 5, 2020",
    allergies: "None known",
    notes:
      "Very social and energetic. Enjoys music and movement-based activities.",
    initials: "JM",
    color: "#f29a8f",
    image: "/images/people/students/ibrahim-guetar-NUkjka_RqUE-unsplash-thumb.webp",
    teachers: [
      {
        name: "Ms. Paige Sun",
        role: "Lead Teacher",
        email: "paige@mudkitchen.co",
      },
    ],
  },
  liam: {
    id: "liam" as ChildId,
    name: "Liam Mitchell",
    grade: "Kindergarten",
    dob: "November 3, 2019",
    allergies: "None known",
    notes: "Curious and creative. Enjoys puzzles and building activities.",
    initials: "LM",
    color: "#a78bfa",
    image: "/images/people/students/vitaly-gariev-_z2Ii760I38-unsplash-thumb.webp",
    teachers: [
      {
        name: "Ms. Taylor Reyes",
        role: "Lead Teacher",
        email: "taylor@mudkitchen.co",
      },
    ],
  },
};

const CHILD_BILLING_META: Record<
  ChildId,
  { name: string; initials: string; color: string }
> = {
  emma: { name: "Emma", initials: "EM", color: DEMO_CHILDREN.emma.color },
  jake: { name: "Jake", initials: "JM", color: DEMO_CHILDREN.jake.color },
  liam: { name: "Liam", initials: "LM", color: DEMO_CHILDREN.liam.color },
};

const ATTENDANCE_DATA: DemoAttendance[] = [
  { date: "Apr 18, 2026", checkIn: "8:12 AM", checkOut: "3:05 PM" },
  { date: "Apr 17, 2026", checkIn: "8:20 AM", checkOut: "3:10 PM" },
  { date: "Apr 16, 2026", checkIn: "8:08 AM", checkOut: "3:00 PM" },
  { date: "Apr 15, 2026", checkIn: "8:15 AM", checkOut: "3:07 PM" },
  { date: "Apr 14, 2026", checkIn: "8:22 AM", checkOut: "3:15 PM" },
];

const LEARNING_NOTES: DemoLearningNote[] = [
  {
    date: "Apr 18, 2026",
    note: "Showed strong focus during the watercolor project — completed a full piece independently and helped a peer mix colors.",
  },
  {
    date: "Apr 14, 2026",
    note: "Excellent participation during morning circle. Asked thoughtful questions about the plant life cycle unit.",
  },
  {
    date: "Apr 10, 2026",
    note: "Made great progress on reading fluency. Read two pages aloud with confidence and correct pacing.",
  },
  {
    date: "Apr 7, 2026",
    note: "Collaborated well in the small group math activity. Demonstrated solid understanding of skip counting.",
  },
];

const DEMO_CONVERSATIONS: DemoConversation[] = [
  {
    id: "c1",
    name: "Ms. Taylor Reyes",
    role: "Lead Teacher",
    lastMsg: "Emma did wonderfully in today's project!",
    lastTime: "2m ago",
    unread: 2,
    color: "#7FA888",
  },
  {
    id: "c2",
    name: "Ms. Nicole Park",
    role: "Co-Teacher",
    lastMsg: "Just a reminder about the field trip form.",
    lastTime: "Yesterday",
    unread: 0,
    color: "#97C09B",
  },
  {
    id: "c3",
    name: "Mud Kitchen Office",
    role: "Admin",
    lastMsg: "Your enrollment checklist is almost complete.",
    lastTime: "Apr 17",
    unread: 1,
    color: "#4A6354",
  },
];

const DEMO_THREADS: Record<string, DemoMessage[]> = {
  c1: [
    {
      id: "m1",
      senderId: "teacher",
      text: "Hi Sarah! Just wanted to share that Emma had a wonderful day today.",
      time: "9:02 AM",
    },
    {
      id: "m2",
      senderId: "parent",
      text: "That's so great to hear, thank you!",
      time: "9:15 AM",
    },
    {
      id: "m3",
      senderId: "teacher",
      text: "She was especially engaged during our watercolor session this morning.",
      time: "9:17 AM",
    },
    {
      id: "m4",
      senderId: "parent",
      text: "She loves painting at home too. I'm so glad she's getting to do that at school.",
      time: "9:20 AM",
    },
    {
      id: "m5",
      senderId: "teacher",
      text: "Emma did wonderfully in today's project!",
      time: "10:45 AM",
    },
  ],
  c2: [
    {
      id: "m1",
      senderId: "teacher",
      text: "Hello! I wanted to reach out about next week's nature walk.",
      time: "Yesterday 2:00 PM",
    },
    {
      id: "m2",
      senderId: "parent",
      text: "Oh of course! What do we need to bring?",
      time: "Yesterday 3:30 PM",
    },
    {
      id: "m3",
      senderId: "teacher",
      text: "Just a reminder about the field trip form.",
      time: "Yesterday 4:00 PM",
    },
  ],
  c3: [
    {
      id: "m1",
      senderId: "teacher",
      text: "Hi Sarah, your enrollment checklist is almost complete. Just a few items remaining!",
      time: "Apr 17",
    },
    {
      id: "m2",
      senderId: "parent",
      text: "Thanks for the reminder, I'll get to those tonight.",
      time: "Apr 17",
    },
    {
      id: "m3",
      senderId: "teacher",
      text: "Your enrollment checklist is almost complete.",
      time: "Apr 17",
    },
  ],
};

const DEMO_EVENTS: DemoEvent[] = [
  {
    id: "e1",
    title: "First Day of Summer Session",
    date: "2026-06-15",
    time: "8:00 AM",
    category: "School",
    color: "#7FA888",
    description: "Welcome to Summer 2026! Drop-off begins at 7:45 AM.",
    program: "summer",
  },
  {
    id: "e2",
    title: "Nature Walk — Local Trail",
    date: "2026-06-18",
    time: "9:00 AM",
    category: "Field Trip",
    color: "#f29a8f",
    description:
      "Students will explore the nature trail. Please pack sunscreen and a water bottle.",
    program: "summer",
  },
  {
    id: "e3",
    title: "Art Showcase",
    date: "2026-06-24",
    time: "4:00 PM",
    category: "Event",
    color: "#97C09B",
    description:
      "Families are invited to view the students' artwork from week 1.",
    program: "summer",
  },
  {
    id: "e4",
    title: "No School — July 4th",
    date: "2026-07-04",
    category: "Holiday",
    color: "#CBD5E1",
    description: "School closed for Independence Day.",
    program: "summer",
  },
  {
    id: "e5",
    title: "Parent-Teacher Connections",
    date: "2026-07-09",
    time: "3:30 PM",
    endTime: "5:30 PM",
    category: "Meeting",
    color: "#4A6354",
    description:
      "Optional 15-minute check-ins with lead teachers. Sign up in advance.",
    program: "summer",
    location: "Main Classroom — Room 1",
    instructor: "Ms. Paige Sun",
    whatToBring: ["Questions for teacher", "Child's portfolio (optional)"],
    attendees: ["Emma Mitchell", "Liam Mitchell"],
    rsvpRequired: true,
  },
  {
    id: "e6",
    title: "Water Play Day",
    date: "2026-07-14",
    time: "10:00 AM",
    endTime: "12:00 PM",
    category: "Activity",
    color: "#BAE1FF",
    description:
      "Kids rotate through four water stations: sprinkler run, water table, splash pad, and water balloon toss. One of the most anticipated days of summer!",
    program: "summer",
    location: "Outdoor Play Area & Courtyard",
    instructor: "Ms. Paige Sun & Ms. Taylor Reyes",
    whatToBring: [
      "Swimsuit (worn under clothes)",
      "Change of clothes",
      "Towel",
      "Sunscreen (SPF 30+, applied before arrival)",
      "Labeled water bottle",
      "Bag for wet clothes",
    ],
    attendees: ["Emma Mitchell", "Liam Mitchell"],
    rsvpRequired: false,
  },
  {
    id: "e7",
    title: "Last Day of Summer Session",
    date: "2026-08-14",
    time: "8:00 AM",
    category: "School",
    color: "#7FA888",
    description: "Celebration day! Early pickup at 1:00 PM.",
    program: "summer",
  },
  {
    id: "e8",
    title: "Back to School Night",
    date: "2026-09-01",
    time: "6:00 PM",
    category: "Event",
    color: "#4A6354",
    description: "Meet your child&apos;s teachers and tour the classrooms.",
    program: "school-year",
  },
  {
    id: "e9",
    title: "First Day — School Year",
    date: "2026-09-08",
    time: "8:00 AM",
    category: "School",
    color: "#7FA888",
    description: "First day of the 2026–2027 school year!",
    program: "school-year",
  },
];

const DEMO_POSTS: DemoPost[] = [
  {
    id: "p1",
    author: "Ms. Taylor Reyes",
    role: "Lead Teacher",
    time: "2 hours ago",
    color: "#7FA888",
    text: "What an incredible morning! The students dove into our new plant life cycle unit with so much curiosity. We planted bean seeds and each child made a prediction about what would happen first — roots or a sprout. Can't wait to watch these grow! 🌱",
    attachments: [{ type: "image", src: "/images/stock/ImageOne.webp" }],
  },
  {
    id: "p2",
    author: "Ms. Nicole Park",
    role: "Co-Teacher",
    time: "Yesterday",
    color: "#97C09B",
    text: "Our watercolor session today was magical. The children mixed colors with such intention and care. We talked about how colors can show feelings — blues for calm, yellows for joy. The finished pieces are hanging in the hallway.",
  },
  {
    id: "p3",
    author: "Mud Kitchen Office",
    role: "Admin",
    time: "Apr 17",
    color: "#4A6354",
    text: "Reminder: Summer 2026 enrollment is now open for siblings of current students. Early enrollment closes April 30. Please complete your checklist to secure your spot!",
  },
  {
    id: "p4",
    author: "Ms. Taylor Reyes",
    role: "Lead Teacher",
    time: "Apr 15",
    color: "#7FA888",
    text: "We wrapped up our community helpers theme with a visit from a local librarian! Students got to ask questions and even check out a book to bring home. Thank you to everyone who donated books to our classroom library this month.",
    attachments: [{ type: "image", src: "/images/stock/ImageFour.webp" }],
  },
];

const DEMO_SEED_COMMENTS: Record<string, string[]> = {
  p1: [
    "So sweet! Emma came home talking about her bean seed 🌱",
    "Love this! Jake was so excited too.",
  ],
  p2: ["The painting is hanging on our fridge already ❤️"],
  p3: [],
  p4: ["What a great experience! Thank you for arranging this."],
};

const DEMO_SEED_REACTIONS: Record<string, string[]> = {
  p1: ["❤️", "🌱"],
  p2: ["❤️", "😊"],
  p3: [],
  p4: ["❤️", "👏"],
};

const PARENT_FEED_CLASSES = [
  {
    id: "elementary",
    label: "Elementary",
    color: "#7FA888",
    teachers: [
      { name: "Ms. Taylor Reyes", color: "#7FA888" },
      { name: "Ms. Nicole Park", color: "#97C09B" },
    ],
  },
  {
    id: "prek",
    label: "Pre-K",
    color: "#f29a8f",
    teachers: [
      { name: "Ms. Paige Sun", color: "#f29a8f" },
    ],
  },
  {
    id: "kindergarten",
    label: "Kindergarten",
    color: "#a78bfa",
    teachers: [
      { name: "Ms. Taylor Reyes", color: "#7FA888" },
    ],
  },
];

const DEMO_TRANSACTIONS: DemoTransaction[] = [
  {
    id: "t1",
    desc: "Registration Fee — Emma Mitchell",
    amount: "$75.00",
    date: "Mar 15, 2026",
    status: "paid",
    childId: "emma",
  },
  {
    id: EMMA_SCHOOL_YEAR_TX_ID,
    desc: "May 2026 Tuition",
    amount: "$0.00",
    date: "May 1, 2026",
    status: "pending",
    childId: "emma",
    kind: "school_year_tuition",
  },
  {
    id: LIAM_SCHOOL_YEAR_TX_ID,
    desc: "May 2026 Tuition",
    amount: "$0.00",
    date: "May 1, 2026",
    status: "pending",
    childId: "liam",
    kind: "school_year_tuition",
  },
  {
    id: JAKE_HOMESCHOOL_DROPIN_TX_ID,
    desc: "Homeschool Drop-In",
    amount: "$0.00",
    date: "Apr 18, 2026",
    status: "pending",
    childId: "jake",
    kind: "homeschool_dropin",
  },
  {
    id: "t4",
    desc: "After-Care — April",
    amount: "$180.00",
    date: "Apr 1, 2026",
    status: "paid",
    childId: "emma",
  },
  {
    id: "t-paid-nov-emma",
    desc: "November 2026 Tuition",
    amount: "$1,700.00",
    date: "Nov 1, 2026",
    status: "paid",
    childId: "emma",
    kind: "school_year_tuition",
    schoolYearMonthId: "nov-2026",
  },
  {
    id: "t-paid-nov-liam",
    desc: "November 2026 Tuition",
    amount: "$1,700.00",
    date: "Nov 1, 2026",
    status: "paid",
    childId: "liam",
    kind: "school_year_tuition",
    schoolYearMonthId: "nov-2026",
  },
  {
    id: "t-paid-oct-emma",
    desc: "October 2026 Tuition",
    amount: "$1,700.00",
    date: "Oct 1, 2026",
    status: "paid",
    childId: "emma",
    kind: "school_year_tuition",
    schoolYearMonthId: "oct-2026",
  },
  {
    id: "t-paid-oct-liam",
    desc: "October 2026 Tuition",
    amount: "$1,700.00",
    date: "Oct 1, 2026",
    status: "paid",
    childId: "liam",
    kind: "school_year_tuition",
    schoolYearMonthId: "oct-2026",
  },
  {
    id: "t-paid-sep-emma",
    desc: "September 2026 Tuition",
    amount: "$1,700.00",
    date: "Sep 1, 2026",
    status: "paid",
    childId: "emma",
    kind: "school_year_tuition",
    schoolYearMonthId: "sep-2026",
  },
  {
    id: "t-paid-aug-emma",
    desc: "August 2026 Tuition",
    amount: "$1,700.00",
    date: "Aug 1, 2026",
    status: "paid",
    childId: "emma",
    kind: "school_year_tuition",
    schoolYearMonthId: "aug-2026",
  },
  {
    id: "t-paid-aug-liam",
    desc: "August 2026 Tuition",
    amount: "$1,700.00",
    date: "Aug 1, 2026",
    status: "paid",
    childId: "liam",
    kind: "school_year_tuition",
    schoolYearMonthId: "aug-2026",
  },
];

const DEMO_CONTACTS: Record<ChildId, DemoContact[]> = {
  liam: [
    {
      label: "School Contact",
      name: "Mud Kitchen Office",
      relationship: "School",
      phone: "(555) 200-1234",
      email: "julius@trymudkitchen.com",
    },
    {
      label: "Parent — Mom",
      name: "Sarah Mitchell",
      relationship: "Mother",
      phone: "(555) 301-4567",
      email: "sarah.mitchell@email.com",
    },
    {
      label: "Parent — Dad",
      name: "Daniel Mitchell",
      relationship: "Father",
      phone: "(555) 301-7890",
      email: "daniel.mitchell@email.com",
    },
    {
      label: "Emergency Contact 1",
      name: "Linda Torres",
      relationship: "Grandmother",
      phone: "(555) 412-3344",
      email: "linda.torres@email.com",
    },
  ],
  emma: [
    {
      label: "School Contact",
      name: "Mud Kitchen Office",
      relationship: "School",
      phone: "(555) 200-1234",
      email: "julius@trymudkitchen.com",
    },
    {
      label: "Parent — Mom",
      name: "Sarah Mitchell",
      relationship: "Mother",
      phone: "(555) 301-4567",
      email: "sarah.mitchell@email.com",
    },
    {
      label: "Parent — Dad",
      name: "Daniel Mitchell",
      relationship: "Father",
      phone: "(555) 301-7890",
      email: "daniel.mitchell@email.com",
    },
    {
      label: "Emergency Contact 1",
      name: "Linda Torres",
      relationship: "Grandmother",
      phone: "(555) 412-3344",
      email: "linda.torres@email.com",
    },
  ],
  jake: [
    {
      label: "School Contact",
      name: "Mud Kitchen Office",
      relationship: "School",
      phone: "(555) 200-1234",
      email: "julius@trymudkitchen.com",
    },
    {
      label: "Parent — Mom",
      name: "Sarah Mitchell",
      relationship: "Mother",
      phone: "(555) 301-4567",
      email: "sarah.mitchell@email.com",
    },
    {
      label: "Parent — Dad",
      name: "Daniel Mitchell",
      relationship: "Father",
      phone: "(555) 301-7890",
      email: "daniel.mitchell@email.com",
    },
    {
      label: "Emergency Contact 1",
      name: "Linda Torres",
      relationship: "Grandmother",
      phone: "(555) 412-3344",
      email: "linda.torres@email.com",
    },
  ],
};

const C1_SECTIONS = [
  {
    id: "1-1",
    title: "1. Program Description & Schedule",
    body: "Mud Kitchen Private School offers a nature-centered, play-based learning environment for Pre-K through Elementary students. Our program runs Monday through Friday, 8:00 AM to 3:00 PM, with optional after-care until 5:30 PM. Students participate in outdoor learning, project-based study, and community-focused activities aligned with each season.",
  },
  {
    id: "1-2",
    title: "2. Tuition & Payment Policy",
    body: "Tuition is due on the first of each month. A 5-day grace period is provided. Accounts more than 10 days past due may result in a temporary enrollment hold. Families experiencing hardship are encouraged to contact the director to discuss payment arrangements. All fees are non-refundable once the program month has begun.",
  },
  {
    id: "1-3",
    title: "3. Health & Wellness Standards",
    body: "Students must be symptom-free for 24 hours before returning to school after illness. Please do not send your child with fever, vomiting, or signs of a communicable illness. The school follows local public health guidance and may require additional protocols during community health events. Up-to-date immunization records or an approved exemption must be on file.",
  },
  {
    id: "1-4",
    title: "4. Acknowledgment & Agreement",
    body: "By signing below, I confirm that I have read and understand all sections of the Program Description and Key Policies document. I agree to the terms outlined herein and commit to supporting the Mud Kitchen community through my participation, communication, and adherence to the policies described.",
  },
];

const C2_SECTIONS = [
  {
    id: "2-1",
    title: "1. Core Commitments",
    body: "As a member of the Mud Kitchen community, I commit to treating all students, staff, and families with dignity and respect. I will communicate concerns directly and constructively through appropriate channels, maintain confidentiality about individual children and families, and actively support a culture of inclusion, curiosity, and kindness.",
  },
  {
    id: "2-2",
    title: "2. Respectful Communication",
    body: "I agree to address disagreements or concerns calmly and directly with the appropriate staff member. I will refrain from posting negative or identifying comments about students, families, or staff on social media or other public platforms. I understand that repeated or serious violations of community communication standards may result in a required meeting with the director.",
  },
  {
    id: "2-3",
    title: "3. Acknowledgment",
    body: "By signing below, I confirm that I have read and agree to uphold the Mud Kitchen Community Agreement for the duration of my child's enrollment. I understand that this agreement exists to protect the safety, wellbeing, and dignity of every member of our school community.",
  },
];

const C5_SECTIONS = [
  {
    id: "5-1",
    title: "1. Permission to Photograph & Record",
    body: "I, the undersigned parent or legal guardian, hereby grant Mud Kitchen Private School permission to photograph, video record, and otherwise capture images or likenesses of my child during school activities, programs, field trips, events, and related educational experiences.",
  },
  {
    id: "5-2",
    title: "2. Scope of Use",
    body: "All photographs, videos, and other media captured by Mud Kitchen staff are the property of Mud Kitchen Private School. The School may edit, crop, or enhance media for use in materials including the website, social media, newsletters, and print publications. The School will not sell images to third parties.",
  },
  {
    id: "5-3",
    title: "3. Parent/Guardian Acknowledgment",
    body: "By signing below, I confirm my selected consent level and release Mud Kitchen Private School from any claims arising from the use of photographs or recordings of my child as described in this agreement. This release remains in effect for the duration of enrollment unless revoked in writing.",
  },
];

const C6_SECTIONS = [
  {
    id: "6-1",
    title: "Releasor Acknowledgment & Signature",
    body: "I, the undersigned parent or legal guardian, acknowledge that participation in Mud Kitchen Private School programs involves inherent risks including but not limited to outdoor and nature-based activities, physical movement, and field excursions. I voluntarily assume all such risks and release Mud Kitchen Private School, its directors, staff, and volunteers from any liability for injury or loss arising from participation in school activities. I have read this agreement in full and sign voluntarily.",
  },
];

const C7_SECTIONS = [
  {
    id: "7-1",
    title: "Authorization Statement",
    body: "I authorize the individuals listed above to pick up my child from Mud Kitchen Private School on my behalf. I understand that school staff may request photo identification from any authorized pickup person and that this list supersedes any prior pickup authorization on file. I accept full responsibility for ensuring that all listed individuals are aware of and agree to comply with school pickup procedures.",
  },
];

const C8_SECTIONS = [
  {
    id: "8-1",
    title: "Parent/Guardian Signature",
    body: "By signing below, I certify that the information provided in this Health Statement is accurate and complete to the best of my knowledge. I understand that Mud Kitchen Private School requires this documentation to ensure the health and safety of all enrolled students and that any changes to my child's health status should be reported to the school promptly.",
  },
];

// ─── SHARED SUB-COMPONENTS ───────────────────────────────────────────────────

function Avatar({
  initials,
  color,
  size = "md",
  src,
}: {
  initials: string;
  color: string;
  size?: "sm" | "md" | "lg";
  src?: string;
}) {
  const sz =
    size === "sm"
      ? "w-7 h-7 text-xs"
      : size === "lg"
        ? "w-12 h-12 text-base"
        : "w-9 h-9 text-sm";
  if (src) {
    return (
      <img
        src={src}
        alt={initials}
        loading="lazy"
        decoding="async"
        className={`${sz} rounded-full object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

function SignatureBlock({
  sectionKey,
  parentName,
  sigs,
  onSign,
}: {
  sectionKey: string;
  parentName: string;
  sigs: Record<string, string>;
  onSign: (key: string, name: string) => void;
}) {
  const [nameInput, setNameInput] = useState(parentName);
  const [editing, setEditing] = useState(false);
  const signed = sigs[sectionKey];

  if (signed && !editing) {
    return (
      <div className="mt-4 border border-emerald-200 rounded-xl bg-emerald-50 p-4">
        <p className="text-xs text-emerald-600 font-medium mb-1">Signed</p>
        <p
          className="text-2xl text-emerald-700"
          style={{ fontFamily: "'Georgia', cursive", fontStyle: "italic" }}
        >
          {signed}
        </p>
        <button
          onClick={() => setEditing(true)}
          className="mt-2 text-xs text-emerald-600 underline cursor-pointer"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 border border-gray-200 rounded-xl bg-gray-50 p-4">
      <p className="text-xs text-gray-500 font-medium mb-2">
        Parent / Guardian Signature
      </p>
      <input
        type="text"
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
        placeholder="Type your full name"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#4a7c59] mb-3"
      />
      <button
        disabled={!nameInput.trim()}
        onClick={() => {
          onSign(sectionKey, nameInput.trim());
          setEditing(false);
        }}
        className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[#4a7c59] text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-opacity"
      >
        Click to Sign
      </button>
    </div>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className="h-2 rounded-full bg-[#4a7c59] transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  children,
  inline = false,
}: {
  title: string;
  onClose?: () => void;
  children: React.ReactNode;
  inline?: boolean;
}) {
  if (inline) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-gray-800 text-base">{title}</h2>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    );
  }
  return (
    <div className="absolute inset-0 z-50 flex">
      <div className="flex-1" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="w-[420px] bg-white shadow-2xl flex flex-col h-full"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-semibold text-gray-800 text-base">{title}</h2>
          <button
            data-tour-id="modal-close"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </motion.div>
    </div>
  );
}

// ─── ENROLLMENT MODALS ───────────────────────────────────────────────────────

function ContractModal({
  contractId,
  sections,
  title,
  sigs,
  onSign,
  onClose,
  inline,
}: {
  contractId: string;
  sections: { id: string; title: string; body: string }[];
  title: string;
  sigs: Record<string, string>;
  onSign: (k: string, n: string) => void;
  onClose?: () => void;
  inline?: boolean;
}) {
  const signed = sections.filter((s) => sigs[s.id]).length;
  return (
    <ModalShell title={title} onClose={onClose} inline={inline}>
      <p className="text-xs text-gray-400 mb-4">
        {signed} of {sections.length} sections signed
      </p>
      <div className="space-y-6">
        {sections.map((s) => (
          <div key={s.id} className="border border-gray-100 rounded-xl p-4">
            <h3 className="font-semibold text-gray-700 text-sm mb-2">
              {s.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
            <SignatureBlock
              sectionKey={s.id}
              parentName="Sarah Mitchell"
              sigs={sigs}
              onSign={onSign}
            />
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

function HealthFormModal({
  sigs,
  onSign,
  onClose,
  saved,
  onSave,
  inline,
}: {
  sigs: Record<string, string>;
  onSign: (k: string, n: string) => void;
  onClose?: () => void;
  saved: boolean;
  onSave: () => void;
  inline?: boolean;
}) {
  const [form, setForm] = useState({
    ec1Name: "Linda Torres",
    ec1Phone: "(555) 412-3344",
    ec1Rel: "Grandmother",
    physician: "Dr. Karen Osei",
    clinic: "Greenview Pediatrics",
    physicianPhone: "(555) 900-2200",
    insurance: "BlueCross BlueShield",
    policyNum: "BCB-4492817",
    hospital: "St. Mary's Medical Center",
  });
  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));
  return (
    <ModalShell
      title="Emergency Contact, Health & Immunization Form"
      onClose={onClose}
      inline={inline}
    >
      <div className="space-y-5">
        <div className="bg-sage-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Emergency Contact
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Name", "ec1Name"],
              ["Relationship", "ec1Rel"],
              ["Phone", "ec1Phone"],
            ].map(([label, key]) => (
              <div key={key} className={key === "ec1Name" ? "col-span-2" : ""}>
                <label className="text-xs text-gray-500 mb-1 block">
                  {label}
                </label>
                <input
                  value={form[key as keyof typeof form]}
                  onChange={set(key as keyof typeof form)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4a7c59]"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-sage-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Physician & Insurance
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Physician", "physician"],
              ["Clinic", "clinic"],
              ["Physician Phone", "physicianPhone"],
              ["Insurance", "insurance"],
              ["Policy #", "policyNum"],
              ["Preferred Hospital", "hospital"],
            ].map(([label, key]) => (
              <div key={key}>
                <label className="text-xs text-gray-500 mb-1 block">
                  {label}
                </label>
                <input
                  value={form[key as keyof typeof form]}
                  onChange={set(key as keyof typeof form)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4a7c59]"
                />
              </div>
            ))}
          </div>
        </div>
        {!saved ? (
          <button
            onClick={onSave}
            className="w-full py-2.5 rounded-xl bg-[#4a7c59] text-white text-sm font-medium cursor-pointer hover:bg-[#3d6b4f] transition-colors"
          >
            Save Health Form
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 text-sm">
              <CheckCircle className="w-4 h-4" /> Form saved — please sign the
              sections below.
            </div>
            <SignatureBlock
              sectionKey="3-1"
              parentName="Sarah Mitchell"
              sigs={sigs}
              onSign={onSign}
            />
            <SignatureBlock
              sectionKey="3-2"
              parentName="Sarah Mitchell"
              sigs={sigs}
              onSign={onSign}
            />
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function MedicationPlanModal({
  sigs,
  onSign,
  onClose,
  meds,
  setMeds,
  saved,
  onSave,
  inline,
}: {
  sigs: Record<string, string>;
  onSign: (k: string, n: string) => void;
  onClose?: () => void;
  meds: DemoMedication[];
  setMeds: (m: DemoMedication[]) => void;
  saved: boolean;
  onSave: () => void;
  inline?: boolean;
}) {
  const addMed = () =>
    setMeds([
      ...meds,
      { id: Date.now().toString(), name: "", condition: "", dosage: "" },
    ]);
  const removeMed = (id: string) => setMeds(meds.filter((m) => m.id !== id));
  const updateMed = (id: string, field: keyof DemoMedication, val: string) =>
    setMeds(meds.map((m) => (m.id === id ? { ...m, [field]: val } : m)));
  return (
    <ModalShell title="Emergency Medication Plan (Optional)" onClose={onClose} inline={inline}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          List any medications your child may need during the school day or in
          an emergency.
        </p>
        {meds.map((med) => (
          <div
            key={med.id}
            className="border border-gray-100 rounded-xl p-4 bg-gray-50"
          >
            <div className="flex justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500">
                Medication
              </span>
              <button
                onClick={() => removeMed(med.id)}
                className="text-red-400 hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Medication Name", "name"],
                ["Condition/Reason", "condition"],
                ["Dosage", "dosage"],
              ].map(([label, field]) => (
                <div
                  key={field}
                  className={field === "name" ? "col-span-2" : ""}
                >
                  <label className="text-xs text-gray-400 mb-1 block">
                    {label}
                  </label>
                  <input
                    value={med[field as keyof DemoMedication]}
                    onChange={(e) =>
                      updateMed(
                        med.id,
                        field as keyof DemoMedication,
                        e.target.value,
                      )
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4a7c59] bg-white"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={addMed}
          className="flex items-center gap-1.5 text-sm text-[#4a7c59] hover:underline cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Medication
        </button>
        {!saved ? (
          <button
            onClick={onSave}
            disabled={meds.length === 0}
            className="w-full py-2.5 rounded-xl bg-[#4a7c59] text-white text-sm font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3d6b4f] transition-colors"
          >
            Save Plan
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 text-sm">
              <CheckCircle className="w-4 h-4" /> Plan saved — sign below to
              complete.
            </div>
            <SignatureBlock
              sectionKey="4-1"
              parentName="Sarah Mitchell"
              sigs={sigs}
              onSign={onSign}
            />
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function ImmunizationModal({
  count,
  onUpload,
  onClose,
  inline,
}: {
  count: number;
  onUpload: () => void;
  onClose?: () => void;
  inline?: boolean;
}) {
  const fakeFiles = Array.from(
    { length: count },
    (_, i) => `immunization_record_${i + 1}.pdf`,
  );
  return (
    <ModalShell title="Proof of Immunizations" onClose={onClose} inline={inline}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Upload your child&apos;s immunization records or approved exemption
          documents (PDF, JPG, PNG — max 10MB each).
        </p>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
          <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400 mb-3">Drag & drop files here</p>
          <button
            onClick={onUpload}
            className="px-4 py-2 rounded-lg bg-[#4a7c59] text-white text-sm font-medium cursor-pointer hover:bg-[#3d6b4f] transition-colors"
          >
            Choose File
          </button>
        </div>
        {fakeFiles.length > 0 && (
          <div className="space-y-2">
            {fakeFiles.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700">{f}</span>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
            ))}
          </div>
        )}
        {count > 0 && (
          <p className="text-xs text-emerald-600 text-center font-medium">
            {count} file{count > 1 ? "s" : ""} uploaded successfully
          </p>
        )}
      </div>
    </ModalShell>
  );
}

function PhotoReleaseModal({
  sigs,
  onSign,
  onClose,
  consent,
  onConsentSave,
  inline,
}: {
  sigs: Record<string, string>;
  onSign: (k: string, n: string) => void;
  onClose?: () => void;
  consent: "FULL" | "LIMITED" | "NO" | null;
  onConsentSave: (c: "FULL" | "LIMITED" | "NO") => void;
  inline?: boolean;
}) {
  const [selected, setSelected] = useState<"FULL" | "LIMITED" | "NO" | null>(
    consent,
  );
  const [consentSaved, setConsentSaved] = useState(!!consent);
  const options: {
    value: "FULL" | "LIMITED" | "NO";
    label: string;
    desc: string;
  }[] = [
    {
      value: "FULL",
      label: "Full Consent",
      desc: "Image may be used in all school materials including website, social media, and print.",
    },
    {
      value: "LIMITED",
      label: "Limited Consent",
      desc: "Internal materials only (newsletters to enrolled families). Not for public platforms.",
    },
    {
      value: "NO",
      label: "No Consent",
      desc: "No photography or video recording for school use. Child excluded from group photos.",
    },
  ];
  const allSigned = C5_SECTIONS.every((s) => sigs[s.id]);
  return (
    <ModalShell title="Photo Release Form" onClose={onClose} inline={inline}>
      <div className="space-y-5">
        {C5_SECTIONS.slice(0, 2).map((s) => (
          <div key={s.id} className="border border-gray-100 rounded-xl p-4">
            <h3 className="font-semibold text-gray-700 text-sm mb-2">
              {s.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
          </div>
        ))}
        <div className="border border-gray-100 rounded-xl p-4">
          <h3 className="font-semibold text-gray-700 text-sm mb-3">
            Select Your Consent Level
          </h3>
          <div className="space-y-2">
            {options.map((o) => (
              <label
                key={o.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selected === o.value ? "border-[#4a7c59] bg-sage-50" : "border-gray-100 hover:border-gray-200"}`}
              >
                <input
                  type="radio"
                  name="consent"
                  value={o.value}
                  checked={selected === o.value}
                  onChange={() => {
                    setSelected(o.value);
                    setConsentSaved(false);
                  }}
                  className="mt-0.5 accent-[#4a7c59]"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">{o.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{o.desc}</p>
                </div>
              </label>
            ))}
          </div>
          {!consentSaved && selected && (
            <button
              onClick={() => {
                onConsentSave(selected!);
                setConsentSaved(true);
              }}
              className="mt-3 w-full py-2.5 rounded-xl bg-[#4a7c59] text-white text-sm font-medium cursor-pointer hover:bg-[#3d6b4f] transition-colors"
            >
              Save Consent Level
            </button>
          )}
          {consentSaved && (
            <div className="mt-3 flex items-center gap-2 text-emerald-600 text-sm">
              <CheckCircle className="w-4 h-4" /> Consent level saved
            </div>
          )}
        </div>
        {consentSaved && (
          <div className="border border-gray-100 rounded-xl p-4">
            <h3 className="font-semibold text-gray-700 text-sm mb-2">
              {C5_SECTIONS[2].title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {C5_SECTIONS[2].body}
            </p>
            <SignatureBlock
              sectionKey="5-3"
              parentName="Sarah Mitchell"
              sigs={sigs}
              onSign={onSign}
            />
          </div>
        )}
        {!consentSaved && !allSigned && (
          <p className="text-xs text-gray-400 text-center">
            Save your consent level first to enable signing.
          </p>
        )}
      </div>
    </ModalShell>
  );
}

function AssumptionOfRiskModal({
  sigs,
  onSign,
  onClose,
  inline,
}: {
  sigs: Record<string, string>;
  onSign: (k: string, n: string) => void;
  onClose?: () => void;
  inline?: boolean;
}) {
  return (
    <ModalShell title="Assumption of Risk" onClose={onClose} inline={inline}>
      <div className="space-y-4">
        <div className="text-center text-xs text-gray-400 pb-2 border-b border-gray-100">
          <p className="font-semibold text-gray-600 text-sm">
            Mud Kitchen Private School
          </p>
          <p>Assumption of Risk & Release of Liability</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-xs text-amber-700 font-medium mb-1">
            Please read carefully before signing
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            I acknowledge that participation in Mud Kitchen Private School
            programs involves inherent risks, including outdoor and nature-based
            activities, physical movement, and field excursions. I voluntarily
            assume all such risks on behalf of my child and agree to hold Sage
            Field Private School, its directors, staff, and volunteers harmless
            from any liability for injury or loss arising from school
            participation.
          </p>
        </div>
        {C6_SECTIONS.map((s) => (
          <div key={s.id} className="border border-gray-100 rounded-xl p-4">
            <h3 className="font-semibold text-gray-700 text-sm mb-2">
              {s.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
            <SignatureBlock
              sectionKey={s.id}
              parentName="Sarah Mitchell"
              sigs={sigs}
              onSign={onSign}
            />
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

function AuthorizedPickupModal({
  sigs,
  onSign,
  onClose,
  persons,
  setPersons,
  saved,
  onSave,
  inline,
}: {
  sigs: Record<string, string>;
  onSign: (k: string, n: string) => void;
  onClose?: () => void;
  persons: DemoAuthorizedPerson[];
  setPersons: (p: DemoAuthorizedPerson[]) => void;
  saved: boolean;
  onSave: () => void;
  inline?: boolean;
}) {
  const addPerson = () =>
    setPersons([
      ...persons,
      { id: Date.now().toString(), name: "", relationship: "", phone: "" },
    ]);
  const removePerson = (id: string) =>
    setPersons(persons.filter((p) => p.id !== id));
  const updatePerson = (
    id: string,
    field: keyof DemoAuthorizedPerson,
    val: string,
  ) =>
    setPersons(persons.map((p) => (p.id === id ? { ...p, [field]: val } : p)));
  return (
    <ModalShell
      title="Additional Authorized Pickup (Optional)"
      onClose={onClose}
      inline={inline}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Add individuals authorized to pick up your child from school on your
          behalf.
        </p>
        {persons.map((person) => (
          <div
            key={person.id}
            className="border border-gray-100 rounded-xl p-4 bg-gray-50"
          >
            <div className="flex justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500">
                Authorized Person
              </span>
              <button
                onClick={() => removePerson(person.id)}
                className="text-red-400 hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Full Name", "name"],
                ["Relationship", "relationship"],
                ["Phone", "phone"],
              ].map(([label, field]) => (
                <div
                  key={field}
                  className={field === "name" ? "col-span-2" : ""}
                >
                  <label className="text-xs text-gray-400 mb-1 block">
                    {label}
                  </label>
                  <input
                    value={person[field as keyof DemoAuthorizedPerson]}
                    onChange={(e) =>
                      updatePerson(
                        person.id,
                        field as keyof DemoAuthorizedPerson,
                        e.target.value,
                      )
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4a7c59] bg-white"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={addPerson}
          className="flex items-center gap-1.5 text-sm text-[#4a7c59] hover:underline cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Person
        </button>
        {!saved ? (
          <button
            onClick={onSave}
            disabled={persons.length === 0}
            className="w-full py-2.5 rounded-xl bg-[#4a7c59] text-white text-sm font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3d6b4f] transition-colors"
          >
            Save List
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 text-sm">
              <CheckCircle className="w-4 h-4" /> List saved — sign below to
              complete.
            </div>
            {C7_SECTIONS.map((s) => (
              <div key={s.id} className="border border-gray-100 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 text-sm mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {s.body}
                </p>
                <SignatureBlock
                  sectionKey={s.id}
                  parentName="Sarah Mitchell"
                  sigs={sigs}
                  onSign={onSign}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function HealthStatementModal({
  sigs,
  onSign,
  onClose,
  option,
  onOptionSave,
  inline,
}: {
  sigs: Record<string, string>;
  onSign: (k: string, n: string) => void;
  onClose?: () => void;
  option: "A" | "B" | null;
  onOptionSave: (o: "A" | "B") => void;
  inline?: boolean;
}) {
  const [selected, setSelected] = useState<"A" | "B" | null>(option);
  const [optionSaved, setOptionSaved] = useState(!!option);
  return (
    <ModalShell title="Health Information Form" onClose={onClose} inline={inline}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          California law requires a health assessment or approved exemption for
          enrollment. Please select one of the following options.
        </p>
        <div className="space-y-3">
          {[
            {
              val: "A" as const,
              title: "Option A — Health Care Professional Examination",
              desc: "My child has received a health examination by a licensed health care professional within the past 18 months. I will provide documentation.",
            },
            {
              val: "B" as const,
              title: "Option B — Religious Exemption Affidavit",
              desc: "I am requesting a religious exemption from the health examination requirement. I will upload the required affidavit documentation.",
            },
          ].map((o) => (
            <label
              key={o.val}
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${selected === o.val ? "border-[#4a7c59] bg-sage-50" : "border-gray-100 hover:border-gray-200"}`}
            >
              <input
                type="radio"
                name="hsOption"
                value={o.val}
                checked={selected === o.val}
                onChange={() => {
                  setSelected(o.val);
                  setOptionSaved(false);
                }}
                className="mt-0.5 accent-[#4a7c59]"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">{o.title}</p>
                <p className="text-xs text-gray-400 mt-1">{o.desc}</p>
              </div>
            </label>
          ))}
        </div>
        {!optionSaved && selected && (
          <button
            onClick={() => {
              onOptionSave(selected!);
              setOptionSaved(true);
            }}
            className="w-full py-2.5 rounded-xl bg-[#4a7c59] text-white text-sm font-medium cursor-pointer hover:bg-[#3d6b4f] transition-colors"
          >
            Save Selection
          </button>
        )}
        {optionSaved && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 text-sm">
              <CheckCircle className="w-4 h-4" /> Selection saved — sign below
              to complete.
            </div>
            {C8_SECTIONS.map((s) => (
              <div key={s.id} className="border border-gray-100 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 text-sm mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {s.body}
                </p>
                <SignatureBlock
                  sectionKey={s.id}
                  parentName="Sarah Mitchell"
                  sigs={sigs}
                  onSign={onSign}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function RegistrationFeeModal({
  onPay,
  onClose,
  inline,
}: {
  onPay: () => void;
  onClose?: () => void;
  inline?: boolean;
}) {
  const [paid, setPaid] = useState(false);
  return (
    <ModalShell title="Registration Fee" onClose={onClose} inline={inline}>
      <div className="space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-sage-50 flex items-center justify-center mx-auto">
          <CreditCard className="w-7 h-7 text-[#4a7c59]" />
        </div>
        {!paid ? (
          <>
            <div>
              <p className="text-2xl font-semibold text-gray-800">$75.00</p>
              <p className="text-sm text-gray-400 mt-1">
                One-time registration fee
              </p>
            </div>
            <p className="text-sm text-gray-500">
              This fee secures your child&apos;s spot for the upcoming program.
              Payment is processed securely.
            </p>
            <button
              onClick={() => {
                setPaid(true);
                setTimeout(onPay, 800);
              }}
              className="w-full py-3 rounded-xl bg-[#4a7c59] text-white font-medium cursor-pointer hover:bg-[#3d6b4f] transition-colors"
            >
              Pay $75.00
            </button>
          </>
        ) : (
          <div className="py-4">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-semibold text-gray-800">Payment Successful!</p>
            <p className="text-sm text-gray-400 mt-1">
              Your registration is confirmed.
            </p>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

// ─── CHECKLIST VIEW ──────────────────────────────────────────────────────────

const CHECKLIST_ITEMS = [
  {
    id: 1,
    label: "Program Description & Key Policies",
    icon: FileText,
    required: true,
    modal: "contract-1" as ModalId,
    optional: false,
  },
  {
    id: 2,
    label: "Community Agreement",
    icon: Users,
    required: true,
    modal: "contract-2" as ModalId,
    optional: false,
  },
  {
    id: 3,
    label: "Emergency Contact, Health & Immunization Form",
    icon: Heart,
    required: true,
    modal: "health-form" as ModalId,
    optional: false,
  },
  {
    id: 4,
    label: "Emergency Medication Plan",
    icon: Pill,
    required: false,
    modal: "medication-plan" as ModalId,
    optional: true,
  },
  {
    id: 5,
    label: "Proof of Immunizations",
    icon: ShieldCheck,
    required: true,
    modal: "immunization" as ModalId,
    optional: false,
  },
  {
    id: 6,
    label: "Health Information Form",
    icon: ClipboardList,
    required: true,
    modal: "health-statement" as ModalId,
    optional: false,
  },
  {
    id: 7,
    label: "Photo Release Form",
    icon: Camera,
    required: true,
    modal: "photo-release" as ModalId,
    optional: false,
  },
  {
    id: 8,
    label: "Assumption of Risk",
    icon: AlertTriangle,
    required: true,
    modal: "assumption-of-risk" as ModalId,
    optional: false,
  },
  {
    id: 9,
    label: "Additional Authorized Pickup",
    icon: UserPlus,
    required: false,
    modal: "authorized-pickup" as ModalId,
    optional: true,
  },
  {
    id: 10,
    label: "Pay Registration Fee",
    icon: CreditCard,
    required: true,
    modal: "registration-fee" as ModalId,
    optional: false,
  },
];

// ─── ENROLLMENT PAGE (split-panel) ───────────────────────────────────────────

function EnrollmentPage({
  activeChildId,
  setActiveChildId,
  completions,
  enrolled,
  isJakePending,
  sigs,
  onSign,
  healthFormSaved,
  onHealthFormSave,
  medications,
  setMedications,
  medicationSaved,
  onMedicationSave,
  immunizationCount,
  onImmunizationUpload,
  photoConsent,
  onPhotoConsentSave,
  healthStatement,
  onHealthStatementSave,
  pickupPersons,
  setPickupPersons,
  pickupSaved,
  onPickupSave,
  feePaid,
  onFeePay,
}: {
  activeChildId: ChildId;
  setActiveChildId: (id: ChildId) => void;
  completions: boolean[];
  enrolled: boolean;
  isJakePending: boolean;
  sigs: Record<string, string>;
  onSign: (k: string, n: string) => void;
  healthFormSaved: boolean;
  onHealthFormSave: () => void;
  medications: DemoMedication[];
  setMedications: (m: DemoMedication[]) => void;
  medicationSaved: boolean;
  onMedicationSave: () => void;
  immunizationCount: number;
  onImmunizationUpload: () => void;
  photoConsent: "FULL" | "LIMITED" | "NO" | null;
  onPhotoConsentSave: (c: "FULL" | "LIMITED" | "NO") => void;
  healthStatement: "A" | "B" | null;
  onHealthStatementSave: (o: "A" | "B") => void;
  pickupPersons: DemoAuthorizedPerson[];
  setPickupPersons: (p: DemoAuthorizedPerson[]) => void;
  pickupSaved: boolean;
  onPickupSave: () => void;
  feePaid: boolean;
  onFeePay: () => void;
}) {
  const [activeItem, setActiveItem] = useState<ModalId>(
    CHECKLIST_ITEMS[0].modal,
  );

  const reqCompleted = CHECKLIST_ITEMS.filter(
    (i) => i.required && completions[i.id - 1],
  ).length;
  const reqTotal = CHECKLIST_ITEMS.filter((i) => i.required).length;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold font-heading text-gray-800">
              Enrollment
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Welcome back, Sarah — here&apos;s your enrollment progress.
            </p>
          </div>
          <ChildTabStrip
            activeChildId={activeChildId}
            onSwitch={setActiveChildId}
          />
        </div>
      </div>

      {isJakePending ? (
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
            <Clock className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">
                Application Under Review
              </p>
              <p className="text-sm text-amber-600 mt-1">
                Jake&apos;s application has been received and is currently
                being reviewed by the admissions team. You&apos;ll be
                notified by email once a decision has been made.
              </p>
              <p className="text-xs text-amber-500 mt-3">
                Submitted: April 10, 2026
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left sidebar */}
          <aside className="w-[30%] shrink-0 border-r border-gray-100 flex flex-col overflow-hidden">
            {/* Progress */}
            <div className="px-4 py-4 border-b border-gray-100 shrink-0">
              {enrolled && (
                <div className="flex items-center gap-1.5 mb-3 text-emerald-600">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">Enrollment Confirmed!</span>
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600">Progress</p>
                <span className="text-xs text-gray-400">
                  {reqCompleted}/{reqTotal}
                </span>
              </div>
              <ProgressBar value={reqCompleted} max={reqTotal} />
            </div>
            {/* Form list */}
            <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
              {CHECKLIST_ITEMS.map((item) => {
                const done = completions[item.id - 1];
                const Icon = item.icon;
                const isActive = activeItem === item.modal;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveItem(item.modal)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#4a7c59]/8 text-[#4a7c59]"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        done
                          ? "bg-emerald-100"
                          : isActive
                            ? "bg-[#4a7c59]/15"
                            : "bg-gray-100"
                      }`}
                    >
                      {done ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Icon
                          className={`w-3 h-3 ${isActive ? "text-[#4a7c59]" : "text-gray-400"}`}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-tight truncate">
                        {item.label}
                      </p>
                      {item.optional && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Optional
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right panel */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem}
                className="h-full"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeItem === "contract-1" && (
                  <ContractModal
                    inline
                    contractId="1"
                    sections={C1_SECTIONS}
                    title="Program Description & Key Policies"
                    sigs={sigs}
                    onSign={onSign}
                  />
                )}
                {activeItem === "contract-2" && (
                  <ContractModal
                    inline
                    contractId="2"
                    sections={C2_SECTIONS}
                    title="Community Agreement"
                    sigs={sigs}
                    onSign={onSign}
                  />
                )}
                {activeItem === "health-form" && (
                  <HealthFormModal
                    inline
                    sigs={sigs}
                    onSign={onSign}
                    saved={healthFormSaved}
                    onSave={onHealthFormSave}
                  />
                )}
                {activeItem === "medication-plan" && (
                  <MedicationPlanModal
                    inline
                    sigs={sigs}
                    onSign={onSign}
                    meds={medications}
                    setMeds={setMedications}
                    saved={medicationSaved}
                    onSave={onMedicationSave}
                  />
                )}
                {activeItem === "immunization" && (
                  <ImmunizationModal
                    inline
                    count={immunizationCount}
                    onUpload={onImmunizationUpload}
                  />
                )}
                {activeItem === "photo-release" && (
                  <PhotoReleaseModal
                    inline
                    sigs={sigs}
                    onSign={onSign}
                    consent={photoConsent}
                    onConsentSave={onPhotoConsentSave}
                  />
                )}
                {activeItem === "assumption-of-risk" && (
                  <AssumptionOfRiskModal
                    inline
                    sigs={sigs}
                    onSign={onSign}
                  />
                )}
                {activeItem === "authorized-pickup" && (
                  <AuthorizedPickupModal
                    inline
                    sigs={sigs}
                    onSign={onSign}
                    persons={pickupPersons}
                    setPersons={setPickupPersons}
                    saved={pickupSaved}
                    onSave={onPickupSave}
                  />
                )}
                {activeItem === "health-statement" && (
                  <HealthStatementModal
                    inline
                    sigs={sigs}
                    onSign={onSign}
                    option={healthStatement}
                    onOptionSave={onHealthStatementSave}
                  />
                )}
                {activeItem === "registration-fee" && (
                  <RegistrationFeeModal
                    inline
                    onPay={onFeePay}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

function ChecklistView({
  completions,
  onOpen,
  enrolled,
}: {
  completions: boolean[];
  onOpen: (modal: ModalId) => void;
  enrolled: boolean;
}) {
  const required = CHECKLIST_ITEMS.filter((i) => i.required);
  const completedRequired = required.filter((_, idx) => {
    const item = CHECKLIST_ITEMS.find(
      (ci) => ci.required && required.indexOf(ci) === idx,
    );
    return item ? completions[item.id - 1] : false;
  }).length;
  const reqCompleted = CHECKLIST_ITEMS.filter(
    (i) => i.required && completions[i.id - 1],
  ).length;
  const reqTotal = CHECKLIST_ITEMS.filter((i) => i.required).length;

  return (
    <div className="space-y-0">
      {enrolled && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-center gap-3 mb-4">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-emerald-800">
              Enrollment Confirmed!
            </p>
            <p className="text-sm text-emerald-600">
              All required steps are complete. We&apos;ll see you soon!
            </p>
          </div>
        </div>
      )}
      <div className="pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">
            Enrollment Progress
          </p>
          <span className="text-sm text-gray-400">
            {reqCompleted} / {reqTotal} required
          </span>
        </div>
        <ProgressBar value={reqCompleted} max={reqTotal} />
      </div>
      <div className="divide-y divide-gray-100">
        {CHECKLIST_ITEMS.map((item, idx) => {
          const done = completions[item.id - 1];
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              data-tour-id={idx === 0 ? "checklist-item-0" : undefined}
              onClick={() => onOpen(item.modal)}
              className="w-full flex items-center gap-4 py-4 hover:bg-gray-50 transition-colors text-left cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-emerald-100" : "bg-gray-100"}`}
              >
                {done ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Icon className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${done ? "text-gray-500 line-through" : "text-gray-700"}`}
                >
                  {item.label}
                </p>
                {item.optional && (
                  <span className="text-xs text-gray-400">Optional</span>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── OTHER PAGE VIEWS ────────────────────────────────────────────────────────

function ChildrenPage({
  activeChildId,
  onSwitchChild,
}: {
  activeChildId: ChildId;
  onSwitchChild: (id: ChildId) => void;
}) {
  const [detailTab, setDetailTab] = useState<ChildDetailTab>("teacher");
  const child = DEMO_CHILDREN[activeChildId];
  const tabs: { id: ChildDetailTab; label: string }[] = [
    { id: "teacher", label: "Teacher Info" },
    { id: "attendance", label: "Attendance" },
    { id: "learning", label: "Learning" },
    { id: "profile", label: "Profile" },
  ];
  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      <div className="flex flex-1 min-h-0">
        <ChildTabStrip
          layout="sidebar"
          activeChildId={activeChildId}
          onSwitch={onSwitchChild}
        />
        <div className="flex-1 min-w-0 overflow-y-auto px-6 py-5">
      <div className="flex border-b border-gray-100">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setDetailTab(t.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${detailTab === t.id ? "text-[#4a7c59] border-b-2 border-[#4a7c59]" : "text-gray-500 hover:text-gray-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-5">
        {detailTab === "teacher" && (
          <div className="space-y-3">
            {child.teachers.map((t) => (
              <div
                key={t.email}
                className="border border-gray-100 rounded-xl p-4 flex items-start gap-4"
              >
                <Avatar
                  initials={t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                  color="#7FA888"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                  <div className="flex gap-2 mt-3">
                    <a
                      href={`mailto:${t.email}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sage-50 text-[#4a7c59] text-xs font-medium hover:bg-sage-100 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" /> Email
                    </a>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sage-50 text-[#4a7c59] text-xs font-medium hover:bg-sage-100 transition-colors cursor-pointer">
                      <MessageCircle className="w-3.5 h-3.5" /> Message
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {detailTab === "attendance" && (
          <div className="space-y-2">
            {ATTENDANCE_DATA.map((a) => (
              <div
                key={a.date}
                className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3"
              >
                <p className="text-sm font-medium text-gray-700">{a.date}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span className="text-emerald-600 font-medium">
                    In {a.checkIn}
                  </span>
                  <span className="text-gray-400">Out {a.checkOut}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {detailTab === "learning" && (
          <div className="space-y-3">
            {LEARNING_NOTES.map((n) => (
              <div
                key={n.date}
                className="border-l-2 border-sage-200 pl-4 py-1"
              >
                <p className="text-xs text-gray-400 mb-1">{n.date}</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {n.note}
                </p>
              </div>
            ))}
          </div>
        )}
        {detailTab === "profile" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <Avatar
                initials={child.initials}
                color={child.color}
                size="lg"
                src={child.image}
              />
              <div>
                <p className="font-semibold text-gray-800">{child.name}</p>
                <p className="text-sm text-gray-400">{child.grade}</p>
              </div>
            </div>
            {[
              ["Date of Birth", child.dob],
              ["Grade", child.grade],
              ["Allergies / Health Notes", child.allergies],
              ["Additional Notes", child.notes],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="text-sm text-gray-700">{val}</p>
              </div>
            ))}
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
}

function HomeschoolDropInPaySidebar({
  childName,
  weeks,
  selections,
  onToggleDay,
  onClose,
  onConfirm,
  selectionOnly = false,
}: {
  childName: string;
  weeks: HomeschoolDropInWeek[];
  selections: Record<string, Weekday[]>;
  onToggleDay: (weekId: string, day: Weekday) => void;
  onClose: () => void;
  onConfirm: () => void;
  selectionOnly?: boolean;
}) {
  const [paid, setPaid] = useState(false);
  const total = weeks.reduce(
    (sum, w) => sum + homeschoolAmountForDays(selections[w.id] ?? []),
    0,
  );
  const hasSelection = weeks.some((w) => (selections[w.id] ?? []).length > 0);
  const overlayZ = selectionOnly ? "z-[60]" : "z-40";
  const panelZ = selectionOnly ? "z-[70]" : "z-50";

  return (
    <>
      <motion.div
        key="homeschool-pay-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={`absolute inset-0 bg-black/20 ${overlayZ}`}
        onClick={onClose}
      />
      <motion.div
        key="homeschool-pay-panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
        className={`absolute inset-y-0 right-0 w-[380px] bg-white shadow-2xl ${panelZ} flex flex-col`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-gray-800 text-base">
            Homeschool Drop-In
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!paid ? (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <p className="text-sm text-gray-500">
                Select the days {childName} will attend each week. Tuition is{" "}
                <span className="font-medium text-gray-700">
                  {formatMoney(HOMESCHOOL_DROPIN_RATE_PER_DAY)}
                </span>{" "}
                per day.
              </p>
              {weeks.map((week) => {
                const days = selections[week.id] ?? [];
                const weekTotal = homeschoolAmountForDays(days);
                return (
                  <div
                    key={week.id}
                    className="rounded-xl border border-gray-100 bg-gray-50/80 p-4"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {week.weekLabel}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {week.dateRange}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 tabular-nums shrink-0">
                        {formatMoney(weekTotal)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {WEEKDAYS.map((day) => {
                        const selected = days.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => onToggleDay(week.id, day)}
                            className={`min-w-[2.75rem] px-2.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                              selected
                                ? "bg-[#4a7c59] text-white border-[#4a7c59]"
                                : "bg-white text-gray-500 border-gray-200 hover:border-[#4a7c59]/40 hover:text-[#4a7c59]"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="shrink-0 px-5 py-4 border-t border-gray-100 bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">Total due</span>
                <span className="text-xl font-bold text-gray-900 tabular-nums">
                  {formatMoney(total)}
                </span>
              </div>
              <button
                type="button"
                disabled={!hasSelection}
                onClick={() => {
                  setPaid(true);
                  setTimeout(onConfirm, 800);
                }}
                className="w-full py-2.5 rounded-xl bg-[#4a7c59] text-white text-sm font-medium cursor-pointer hover:bg-[#3d6b4f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {selectionOnly ? "Save selection" : `Pay ${formatMoney(total)}`}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-5 py-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
            <p className="font-semibold text-gray-800">
              {selectionOnly ? "Days saved" : "Payment Successful!"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {selectionOnly
                ? `${formatMoney(total)} added to your checkout total.`
                : `${formatMoney(total)} processed for ${childName}&apos;s drop-in days.`}
            </p>
          </div>
        )}
      </motion.div>
    </>
  );
}

function InvoiceSidebar({ onClose }: { onClose: () => void }) {
  return (
    <>
      <motion.div
        key="invoice-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      <motion.div
        key="invoice-panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
        className="absolute inset-y-0 right-0 w-[300px] bg-white shadow-2xl z-50 flex flex-col overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Invoice</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">INV-2026-042</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status + amount */}
        <div className="px-5 py-4 border-b border-gray-100 bg-amber-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
              Pending
            </span>
            <p className="text-2xl font-bold text-gray-900">$1,700.00</p>
          </div>
          <p className="text-xs text-amber-700 mt-2">Due May 1, 2026</p>
        </div>

        {/* Details */}
        <div className="px-5 py-4 space-y-4 flex-1">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">For</p>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#7FA888] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                EM
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Emma Mitchell</p>
                <p className="text-xs text-gray-400">Elementary</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Program</p>
            <p className="text-sm text-gray-700 font-medium">School Year 2026–27 — May Tuition</p>
            <p className="text-xs text-gray-400 mt-0.5">Full-Time Program</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Line Items</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monthly Tuition</span>
                <span className="font-medium text-gray-800">$1,700.00</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between text-sm font-semibold">
                <span className="text-gray-800">Total</span>
                <span className="text-gray-900">$1,700.00</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Billing Contact</p>
            <p className="text-sm text-gray-700">Sarah Mitchell</p>
            <p className="text-xs text-gray-400 mt-0.5">sarah@mitchell.co</p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#4a7c59] text-white text-sm font-medium hover:bg-[#3d6b4f] transition-colors cursor-pointer"
          >
            Pay Now — $1,700.00
          </button>
          <button
            onClick={onClose}
            className="w-full mt-2 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </motion.div>
    </>
  );
}

function BillingCheckoutSidebar({
  txIds,
  initialPaymentPlan,
  homeschoolSelections,
  onClose,
  onConfirm,
  onOpenHomeschoolPay,
}: {
  txIds: string[];
  initialPaymentPlan: PaymentPlan;
  homeschoolSelections: Record<string, Weekday[]>;
  onClose: () => void;
  onConfirm: (plan: PaymentPlan, txIds: string[]) => void;
  onOpenHomeschoolPay: () => void;
}) {
  const [checkoutPlan, setCheckoutPlan] = useState<PaymentPlan>(initialPaymentPlan);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [paid, setPaid] = useState(false);

  const lineItems = txIds
    .map((id) => DEMO_TRANSACTIONS.find((t) => t.id === id))
    .filter((t): t is DemoTransaction => !!t);

  const subtotal = lineItems.reduce(
    (sum, t) => sum + getTxCheckoutAmount(t, checkoutPlan, homeschoolSelections),
    0,
  );

  const processingFee =
    paymentMethod === "card"
      ? subtotal * CARD_FEE_RATE
      : paymentMethod === "ach"
        ? subtotal * ACH_FEE_RATE
        : 0;

  const total = subtotal + processingFee;

  const homeschoolItem = lineItems.find(isHomeschoolDropIn);
  const homeschoolAmount = homeschoolItem
    ? getTxCheckoutAmount(homeschoolItem, checkoutPlan, homeschoolSelections)
    : 0;
  const canPay = !homeschoolItem || homeschoolAmount > 0;

  const feeLabel =
    paymentMethod === "card"
      ? `Card processing (${(CARD_FEE_RATE * 100).toFixed(1)}%)`
      : paymentMethod === "ach"
        ? `ACH processing (${(ACH_FEE_RATE * 100).toFixed(1)}%)`
        : null;

  return (
    <>
      <motion.div
        key="checkout-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      <motion.div
        key="checkout-panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
        className="absolute inset-y-0 right-0 w-[400px] bg-white shadow-2xl z-50 flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-gray-800 text-base">Review &amp; Pay</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!paid ? (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="border-b border-gray-100 pb-5 mb-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Payment Plan
                </h3>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setCheckoutPlan("monthly")}
                    className={`w-full text-left py-3 px-4 transition-colors cursor-pointer ${
                      checkoutPlan === "monthly"
                        ? "border-l-2 border-l-[#4a7c59] bg-[#4a7c59]/5"
                        : "hover:bg-gray-50/80"
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-800">
                      Monthly with Autopay
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatMoney(SCHOOL_YEAR_MONTHLY_TUITION)}/mo per child · charged
                      on the 1st
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutPlan("upfront")}
                    className={`w-full text-left py-3 px-4 transition-colors cursor-pointer ${
                      checkoutPlan === "upfront"
                        ? "border-l-2 border-l-[#4a7c59] bg-[#4a7c59]/5"
                        : "hover:bg-gray-50/80"
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-800">Pay in Full</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatMoney(SCHOOL_YEAR_UPFRONT_TUITION)} per child ·{" "}
                      {SCHOOL_YEAR_LABEL}
                    </p>
                  </button>
                </div>
              </div>

              <div className="border-b border-gray-100 pb-5 mb-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Receipt
                </h3>
                <div>
                  {lineItems.map((t, idx) => {
                    const meta = CHILD_BILLING_META[t.childId];
                    const amount = getTxCheckoutAmount(
                      t,
                      checkoutPlan,
                      homeschoolSelections,
                    );
                    const isHomeschool = isHomeschoolDropIn(t);
                    return (
                      <div
                        key={t.id}
                        className={`flex items-start gap-3 py-3 ${
                          idx > 0 ? "border-t border-gray-100" : ""
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: meta.color }}
                        >
                          {meta.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">
                            {meta.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {getTxCheckoutDescription(t, checkoutPlan)}
                          </p>
                          {isHomeschool && amount === 0 && (
                            <button
                              type="button"
                              onClick={onOpenHomeschoolPay}
                              className="mt-2 text-xs font-semibold text-[#4a7c59] hover:underline cursor-pointer"
                            >
                              Select days
                            </button>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-gray-800 tabular-nums shrink-0">
                          {formatMoney(amount)}
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between py-3 border-t border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Subtotal</span>
                    <span className="text-sm font-semibold text-gray-800 tabular-nums">
                      {formatMoney(subtotal)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pb-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Payment Method
                </h3>
                <div className="grid grid-cols-3 gap-2.5">
                  {(
                    [
                      { id: "card" as const, label: "Card", icon: CreditCard },
                      { id: "ach" as const, label: "ACH", icon: Landmark },
                      { id: "check" as const, label: "Check", icon: Banknote },
                    ] as const
                  ).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPaymentMethod(id)}
                      className={`flex flex-col items-center gap-1.5 rounded-md border p-3 transition-all cursor-pointer ${
                        paymentMethod === id
                          ? "border-[#4a7c59] bg-[#4a7c59]/5"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-semibold text-gray-700">{label}</span>
                    </button>
                  ))}
                </div>

                {paymentMethod === "check" && (
                  <div className="pt-4 border-l-2 border-gray-200 pl-4 mt-4 space-y-1.5">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Check instructions
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4">
                      <li>
                        Make check payable to{" "}
                        <span className="font-medium">Mud Kitchen</span>
                      </li>
                      <li>
                        Mail to: 1234 South Lamar Blvd, Austin, TX 78704 · Attn: Billing
                      </li>
                      <li>Include student name(s) and parent phone in the memo line</li>
                      <li>Please allow 5–7 business days for processing</li>
                    </ul>
                  </div>
                )}

                <div className="mt-5 space-y-2">
                  {feeLabel && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{feeLabel}</span>
                      <span className="font-medium text-gray-700 tabular-nums">
                        {formatMoney(processingFee)}
                      </span>
                    </div>
                  )}
                  {paymentMethod === "check" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Processing fee</span>
                      <span className="font-medium text-gray-700 tabular-nums">
                        {formatMoney(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-semibold pt-3 border-t border-gray-100">
                    <span className="text-gray-800">Total</span>
                    <span className="text-gray-900 tabular-nums">{formatMoney(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 px-5 py-4 border-t border-gray-100 bg-white">
              <button
                type="button"
                disabled={!canPay}
                onClick={() => {
                  setPaid(true);
                  setTimeout(() => onConfirm(checkoutPlan, txIds), 800);
                }}
                className="w-full py-2.5 rounded-lg bg-[#4a7c59] text-white text-sm font-medium cursor-pointer hover:bg-[#3d6b4f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Pay {formatMoney(total)}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full mt-2 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-5 py-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
            <p className="font-semibold text-gray-800">Payment Successful!</p>
            <p className="text-sm text-gray-400 mt-1">
              {formatMoney(total)} processed successfully.
            </p>
          </div>
        )}
      </motion.div>
    </>
  );
}

function BillingPage({
  paidInvoices,
  paymentPlan,
  onOpenCheckout,
  onOpenInvoice,
  homeschoolSelections,
  paidHomeschoolDetails,
  onOpenHomeschoolPay,
}: {
  activeChildId: ChildId;
  paidInvoices: Set<string>;
  paymentPlan: PaymentPlan;
  onOpenCheckout: (txIds: string[]) => void;
  onOpenInvoice: () => void;
  homeschoolSelections: Record<string, Weekday[]>;
  paidHomeschoolDetails: Record<string, { amount: string; scheduleNote: string }>;
  onOpenHomeschoolPay: (childId: ChildId) => void;
}) {
  const [childFilter, setChildFilter] = useState<ChildId | "all">("all");
  const [selectedHistoryMonthId, setSelectedHistoryMonthId] = useState(
    SCHOOL_YEAR_MONTHS[DEMO_SCHOOL_YEAR_MONTHS_PAID - 1].id,
  );

  const CHILD_IDS: ChildId[] = ["emma", "jake", "liam"];
  const childMeta: Record<ChildId, { name: string; initials: string; color: string }> = {
    emma: { name: "Emma", initials: "EM", color: DEMO_CHILDREN.emma.color },
    jake: { name: "Jake", initials: "JM", color: DEMO_CHILDREN.jake.color },
    liam: { name: "Liam", initials: "LM", color: DEMO_CHILDREN.liam.color },
  };

  const emmaTuitionPaid = paidInvoices.has(EMMA_SCHOOL_YEAR_TX_ID);
  const liamTuitionPaid = paidInvoices.has(LIAM_SCHOOL_YEAR_TX_ID);
  const fullTimeTuitionPaid = emmaTuitionPaid && liamTuitionPaid;

  const getDisplayAmount = (t: DemoTransaction): string => {
    if (paidHomeschoolDetails[t.id]) return paidHomeschoolDetails[t.id].amount;
    if (isHomeschoolDropIn(t)) {
      return formatMoney(totalHomeschoolAmount(homeschoolSelections));
    }
    if (isSchoolYearTuition(t)) {
      if (t.status === "paid") return t.amount;
      return formatMoney(getSchoolYearAmount(paymentPlan));
    }
    return t.amount;
  };

  const getDisplayDescription = (t: DemoTransaction): string => {
    if (isSchoolYearTuition(t) && t.status === "pending") {
      return getSchoolYearDescription(paymentPlan);
    }
    if (isSchoolYearTuition(t)) return t.desc;
    return t.desc;
  };

  const getListScheduleNote = (t: DemoTransaction): string | undefined => {
    if (isHomeschoolDropIn(t) || isSchoolYearTuition(t)) return undefined;
    return t.scheduleNote;
  };

  const parseAmount = (amount: string) =>
    parseFloat(amount.replace("$", "").replace(",", ""));

  const handlePayClick = (t: DemoTransaction) => {
    if (isHomeschoolDropIn(t)) {
      onOpenHomeschoolPay(t.childId);
      return;
    }
    onOpenCheckout([t.id]);
  };

  const filteredTx =
    childFilter === "all"
      ? DEMO_TRANSACTIONS
      : DEMO_TRANSACTIONS.filter((t) => t.childId === childFilter);

  const pending = filteredTx.filter(
    (t) => t.status === "pending" && !paidInvoices.has(t.id),
  );
  const paid = filteredTx.filter(
    (t) => t.status === "paid" || paidInvoices.has(t.id),
  );

  const totalDue = pending.reduce(
    (sum, t) => sum + parseAmount(getDisplayAmount(t)),
    0,
  );
  const nextDue = pending.length > 0 ? pending[0].date : null;

  const monthsPaidCount =
    DEMO_SCHOOL_YEAR_MONTHS_PAID + (fullTimeTuitionPaid ? 1 : 0);

  const getMonthStatus = (
    monthIndex: number,
  ): "paid" | "current" | "upcoming" => {
    if (monthIndex < monthsPaidCount) return "paid";
    if (monthIndex === monthsPaidCount) return "current";
    return "upcoming";
  };

  const selectedHistoryMonth = SCHOOL_YEAR_MONTHS.find(
    (m) => m.id === selectedHistoryMonthId,
  );
  const checkoutPaidMonthId =
    fullTimeTuitionPaid && monthsPaidCount > 0
      ? SCHOOL_YEAR_MONTHS[monthsPaidCount - 1].id
      : undefined;
  const monthFilteredPaid = getPaidTransactionsForMonth(
    paid,
    selectedHistoryMonthId,
    checkoutPaidMonthId,
  );
  const otherPaid = getOtherPaidTransactions(paid);

  const firstSchoolYearPendingIdx = pending.findIndex(
    (tx) => !isHomeschoolDropIn(tx),
  );

  const prevMonthsPaidRef = useRef(monthsPaidCount);
  useEffect(() => {
    if (monthsPaidCount > prevMonthsPaidRef.current) {
      setSelectedHistoryMonthId(
        SCHOOL_YEAR_MONTHS[monthsPaidCount - 1].id,
      );
    }
    prevMonthsPaidRef.current = monthsPaidCount;
  }, [monthsPaidCount]);

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">

      <div className="flex flex-1 min-h-0">
        {/* ── Child filter sidebar ─────────────────────────────────────── */}
        <aside className="w-44 shrink-0 border-r border-gray-100 flex flex-col py-2 px-2 overflow-hidden">
          <button
            onClick={() => setChildFilter("all")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-sm font-medium transition-colors cursor-pointer ${
              childFilter === "all"
                ? "bg-[#4a7c59]/8 text-gray-800"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
              <span className="text-[10px] text-gray-500 font-bold">All</span>
            </div>
            <span className="truncate">All children</span>
          </button>
          {CHILD_IDS.map((cid) => {
            const meta = childMeta[cid];
            const childPendingCount = DEMO_TRANSACTIONS.filter(
              (t) =>
                t.childId === cid &&
                t.status === "pending" &&
                !paidInvoices.has(t.id),
            ).length;
            const active = childFilter === cid;
            return (
              <button
                key={cid}
                onClick={() => setChildFilter(cid)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-[#4a7c59]/8 text-gray-800"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                  style={{ fontSize: 9, backgroundColor: meta.color }}
                >
                  {meta.initials[0]}
                </span>
                <span className="truncate flex-1 min-w-0">{meta.name}</span>
                {childPendingCount > 0 && (
                  <span className="text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-amber-400 text-white">
                    {childPendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        <div className="flex-1 min-w-0 overflow-y-auto px-6 py-5 space-y-5 pb-4">
          {/* ── Balance summary ──────────────────────────────────────────── */}
          <div className="flex items-start justify-between pb-4 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                Total Balance Due
              </p>
              <p className="text-3xl font-bold text-gray-900 leading-none">
                ${totalDue.toFixed(2)}
              </p>
              {nextDue && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full font-medium">
                  <Clock className="w-3 h-3" />
                  Next due {nextDue}
                </span>
              )}
              {totalDue === 0 && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                  <CheckCircle className="w-3 h-3" />
                  All paid
                </span>
              )}
            </div>
            {childFilter === "all" && pending.length > 0 ? (
              <button
                onClick={() => onOpenCheckout(pending.map((t) => t.id))}
                className="px-4 py-2 rounded-xl bg-[#4a7c59] text-white text-sm font-semibold hover:bg-[#3d6b4f] transition-colors cursor-pointer shadow-sm"
              >
                Pay All
              </button>
            ) : totalDue === 0 ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl">
                <CheckCircle className="w-3.5 h-3.5" />
                All clear
              </span>
            ) : null}
          </div>

      {/* ── Pending invoices ─────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Pending
          </h3>
          {pending.length > 0 && (
            <span className="text-xs text-amber-600 font-medium">
              {pending.length} invoice{pending.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="flex items-center gap-2 py-3 text-sm text-emerald-600">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              No pending invoices
              {childFilter !== "all" && (
                <span className="text-gray-400"> for {childMeta[childFilter].name}</span>
              )}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(3,300px)] gap-4">
            {pending.map((t, tIdx) => {
              const isHomeschool = isHomeschoolDropIn(t);
              const meta = childMeta[t.childId];
              const isTourTarget =
                !isHomeschool && tIdx === firstSchoolYearPendingIdx;
              const isInvoiceClickable = isTourTarget;

              return (
                <article
                  key={t.id}
                  data-tour-id={
                    isTourTarget ? "billing-pending-invoice" : undefined
                  }
                  onClick={isInvoiceClickable ? onOpenInvoice : undefined}
                  className={`flex flex-col w-full rounded-md overflow-hidden border border-gray-100 bg-white shadow-sm ${
                    isInvoiceClickable ? "cursor-pointer group" : ""
                  }`}
                >
                  <div className="relative h-32 overflow-hidden shrink-0">
                    <img
                      src={getPendingBanner(t)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={`w-full h-full object-cover ${
                        isInvoiceClickable
                          ? "transition-transform duration-500 group-hover:scale-105"
                          : ""
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute bottom-2.5 left-3 text-xs font-semibold text-white/90">
                      {isHomeschool ? "Homeschool Drop-In" : "Full-Time Program"}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: meta.color }}
                      >
                        {meta.initials}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-base font-medium text-gray-800 leading-snug ${
                            isInvoiceClickable
                              ? "group-hover:text-gray-900 transition-colors"
                              : ""
                          }`}
                        >
                          {getDisplayDescription(t)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 leading-snug">
                          Due {t.date} · {meta.name}
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                      <span className="font-semibold text-gray-800 text-base tabular-nums">
                        {getDisplayAmount(t)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePayClick(t);
                        }}
                        className="px-3.5 py-2 rounded-md bg-[#4a7c59] text-white text-sm font-medium cursor-pointer hover:bg-[#3d6b4f] transition-colors shrink-0"
                      >
                        {isHomeschool ? "Select days" : "Pay"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ── School year schedule ─────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {SCHOOL_YEAR_LABEL}
          </h3>
          <span className="text-xs text-gray-400">
            {`${monthsPaidCount} of ${SCHOOL_YEAR_MONTHS.length} months paid`}
          </span>
        </div>
        <div className="flex flex-wrap gap-2.5 mt-4">
          {SCHOOL_YEAR_MONTHS.map((m, monthIndex) => {
            const status = getMonthStatus(monthIndex);
            const isSelected = m.id === selectedHistoryMonthId;
            return (
              <button
                key={m.id}
                type="button"
                title={m.label}
                onClick={() => setSelectedHistoryMonthId(m.id)}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border px-3.5 py-3 min-w-[68px] min-h-[64px] cursor-pointer transition-all ${
                  isSelected ? "ring-2 ring-[#4a7c59] ring-offset-1" : ""
                } ${
                  status === "paid"
                    ? "border-emerald-100 bg-emerald-50"
                    : status === "current"
                      ? "border-amber-100 bg-amber-50"
                      : "border-gray-100 bg-gray-50"
                }`}
              >
                <span
                  className={`text-sm font-semibold leading-none ${
                    status === "paid"
                      ? "text-emerald-700"
                      : status === "current"
                        ? "text-amber-700"
                        : "text-gray-400"
                  }`}
                >
                  {m.short}
                </span>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full leading-none ${
                    status === "paid"
                      ? "bg-emerald-100 text-emerald-700"
                      : status === "current"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {status === "paid"
                    ? "Paid"
                    : status === "current"
                      ? "Current"
                      : "Upcoming"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Payment history ───────────────────────────────────────────── */}
      {paid.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Payment History
            {selectedHistoryMonth ? ` — ${selectedHistoryMonth.label}` : ""}
          </h3>
          {monthFilteredPaid.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              No payments for{" "}
              {selectedHistoryMonth?.label ?? "this month"}
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {monthFilteredPaid.map((t) => (
                <div key={t.id} className="flex items-center gap-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {getDisplayDescription(t)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t.date} · {childMeta[t.childId].name}
                      {getListScheduleNote(t) ? ` · ${getListScheduleNote(t)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-semibold text-gray-800 text-sm tabular-nums">
                      {getDisplayAmount(t)}
                    </span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                      Paid
                    </span>
                    <button
                      className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
                      title="Download receipt"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {otherPaid.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Other payments
              </h4>
              <div className="divide-y divide-gray-50">
                {otherPaid.map((t) => (
                  <div key={t.id} className="flex items-center gap-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {getDisplayDescription(t)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {t.date} · {childMeta[t.childId].name}
                        {getListScheduleNote(t) ? ` · ${getListScheduleNote(t)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-semibold text-gray-800 text-sm tabular-nums">
                        {getDisplayAmount(t)}
                      </span>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                        Paid
                      </span>
                      <button
                        className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
                        title="Download receipt"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
        </div>
      </div>
    </div>
  );
}

function MessagesPage({
  threads,
  setThreads,
  input,
  setInput,
  activeConv,
  setActiveConv,
}: {
  threads: Record<string, DemoMessage[]>;
  setThreads: (t: Record<string, DemoMessage[]>) => void;
  input: string;
  setInput: (v: string) => void;
  activeConv: string;
  setActiveConv: (id: string) => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const conv = DEMO_CONVERSATIONS.find((c) => c.id === activeConv)!;
  const messages = threads[activeConv] || [];

  const sendMsg = () => {
    if (!input.trim()) return;
    const newMsg: DemoMessage = {
      id: Date.now().toString(),
      senderId: "parent",
      text: input.trim(),
      time: "Just now",
    };
    setThreads({ ...threads, [activeConv]: [...messages, newMsg] });
    setInput("");
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [messages, activeConv]);

  return (
    <div className="flex flex-1 h-full border-t border-gray-100 overflow-hidden">
      <div className="w-64 border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">Messages</p>
        </div>
        <div className="overflow-y-auto flex-1">
          {DEMO_CONVERSATIONS.map((c) => (
            <button
              key={c.id}
              data-tour-id={`messages-conv-${c.id}`}
              onClick={() => setActiveConv(c.id)}
              className={`w-full flex items-start gap-3 p-3 text-left transition-colors cursor-pointer ${activeConv === c.id ? "bg-sage-50" : "hover:bg-gray-50"}`}
            >
              <Avatar
                initials={c.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
                color={c.color}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold text-gray-700 truncate">
                    {c.name}
                  </p>
                  {c.unread > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#4a7c59] text-white text-[10px] flex items-center justify-center flex-shrink-0">
                      {c.unread}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {c.lastMsg}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Avatar
            initials={conv.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
            color={conv.color}
            size="sm"
          />
          <div>
            <p className="text-sm font-semibold text-gray-700">{conv.name}</p>
            <p className="text-xs text-gray-400">{conv.role}</p>
          </div>
        </div>
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.senderId === "parent" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${m.senderId === "parent" ? "bg-[#4a7c59] text-white rounded-br-sm" : "bg-gray-100 text-gray-700 rounded-bl-sm"}`}
              >
                <p>{m.text}</p>
                <p
                  className={`text-[10px] mt-1 ${m.senderId === "parent" ? "text-white/60" : "text-gray-400"}`}
                >
                  {m.time}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 p-3 flex gap-2">
          <input
            data-tour-id="messages-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMsg()}
            placeholder="Type a message..."
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a7c59]"
          />
          <button
            data-tour-id="messages-send"
            onClick={sendMsg}
            className="p-2 rounded-xl bg-[#4a7c59] text-white cursor-pointer hover:bg-[#3d6b4f] transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CalendarPage({
  onEventClick,
}: {
  onEventClick: (e: DemoEvent) => void;
}) {
  const [month, setMonth] = useState(new Date(2026, 5, 1));
  const [program, setProgram] = useState<"summer" | "school-year">("summer");

  const year = month.getFullYear();
  const mon = month.getMonth();
  const firstDay = new Date(year, mon, 1).getDay();
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const days = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });
  const monthName = month.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const eventsThisMonth = DEMO_EVENTS.filter((e) => {
    const d = new Date(e.date);
    return (
      d.getFullYear() === year && d.getMonth() === mon && e.program === program
    );
  });
  const eventsForDay = (day: number) =>
    eventsThisMonth.filter((e) => new Date(e.date).getDate() === day);

  return (
    <div className="flex-1 p-6 border-t border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {[
              { val: "summer" as const, label: "Summer 2026" },
              { val: "school-year" as const, label: "School Year 26–27" },
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => setProgram(p.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${program === p.val ? "bg-[#4a7c59] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonth(new Date(year, mon - 1, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <span className="text-sm font-semibold text-gray-700 w-36 text-center">
              {monthName}
            </span>
            <button
              data-tour-id="calendar-next-month"
              onClick={() => setMonth(new Date(year, mon + 1, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="text-center text-xs text-gray-400 font-medium py-2"
            >
              {d}
            </div>
          ))}
          {days.map((day, i) => {
            const evs = day ? eventsForDay(day) : [];
            return (
              <div
                key={i}
                className={`min-h-[60px] p-1.5 rounded-lg ${day ? "hover:bg-gray-50 cursor-pointer" : ""}`}
              >
                {day && (
                  <p className="text-xs text-gray-600 font-medium mb-1">
                    {day}
                  </p>
                )}
                {evs.slice(0, 2).map((e) => (
                  <button
                    key={e.id}
                    data-tour-id={e.id === "e6" ? "calendar-event-e6" : undefined}
                    onClick={() => onEventClick(e)}
                    className="w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium mb-0.5 truncate cursor-pointer"
                    style={{ backgroundColor: e.color + "20", color: e.color }}
                  >
                    {e.title}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
    </div>
  );
}

function EventSidebar({
  event,
  onClose,
}: {
  event: DemoEvent;
  onClose: () => void;
}) {
  const dateStr = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <motion.div
        key="event-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      <motion.div
        key="event-panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
        className="absolute inset-y-0 right-0 w-[300px] bg-white shadow-2xl z-50 flex flex-col overflow-y-auto"
      >
        {/* Colour header */}
        <div
          className="px-5 pt-5 pb-4"
          style={{ backgroundColor: event.color + "18", borderBottom: `2px solid ${event.color}30` }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <span
                className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2"
                style={{ backgroundColor: event.color + "30", color: event.color }}
              >
                {event.category}
              </span>
              <h3 className="text-base font-bold text-gray-900 leading-snug">
                {event.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="mt-0.5 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors cursor-pointer flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Meta rows */}
        <div className="px-5 py-4 space-y-3 border-b border-gray-100">
          <div className="flex gap-3">
            <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Date</p>
              <p className="text-sm text-gray-700 font-medium">{dateStr}</p>
            </div>
          </div>
          {event.time && (
            <div className="flex gap-3">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Time</p>
                <p className="text-sm text-gray-700 font-medium">
                  {event.time}{event.endTime ? ` – ${event.endTime}` : ""}
                </p>
              </div>
            </div>
          )}
          {event.location && (
            <div className="flex gap-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Location</p>
                <p className="text-sm text-gray-700 font-medium">{event.location}</p>
              </div>
            </div>
          )}
          {event.instructor && (
            <div className="flex gap-3">
              <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Led by</p>
                <p className="text-sm text-gray-700 font-medium">{event.instructor}</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1.5">About</p>
          <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
        </div>

        {/* What to bring */}
        {event.whatToBring && event.whatToBring.length > 0 && (
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">What to Bring</p>
            <ul className="space-y-1.5">
              {event.whatToBring.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.color }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Attending children */}
        {event.attendees && event.attendees.length > 0 && (
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Your Children Attending</p>
            <div className="space-y-2">
              {event.attendees.map((name) => {
                const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2);
                return (
                  <div key={name} className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#7FA888] flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                      {initials}
                    </div>
                    <p className="text-sm text-gray-700">{name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RSVP / program badge */}
        <div className="px-5 py-4 flex-1 flex flex-col justify-end">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="capitalize">{event.program === "summer" ? "Summer 2026" : "School Year 26–27"}</span>
            {event.rsvpRequired !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full font-medium ${event.rsvpRequired ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}
              >
                {event.rsvpRequired ? "RSVP required" : "No RSVP needed"}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

function FormsPage({
  completions,
  onOpen,
}: {
  completions: boolean[];
  onOpen: (modal: ModalId) => void;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50 shadow-sm overflow-hidden">
      {CHECKLIST_ITEMS.map((item) => {
        const done = completions[item.id - 1];
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onOpen(item.modal)}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left cursor-pointer"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-emerald-100" : "bg-gray-100"}`}
            >
              {done ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Icon className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {item.label}
              </p>
              {item.optional && (
                <span className="text-xs text-gray-400">Optional</span>
              )}
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${done ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
            >
              {done ? "Complete" : "Pending"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function VolunteerPage() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-full bg-sage-50 flex items-center justify-center mb-4">
        <Heart className="w-7 h-7 text-[#4a7c59]" />
      </div>
      <h3 className="font-semibold text-gray-700 text-lg mb-2">
        No openings right now
      </h3>
      <p className="text-sm text-gray-400 text-center max-w-xs">
        We&apos;ll notify you when volunteer opportunities become available. Thank
        you for your willingness to support our community!
      </p>
      <button className="mt-6 px-5 py-2.5 rounded-xl bg-[#4a7c59] text-white text-sm font-medium cursor-pointer hover:bg-[#3d6b4f] transition-colors">
        Notify Me
      </button>
    </div>
  );
}

function EmergencyContactsPage({ activeChildId }: { activeChildId: ChildId }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const contacts = DEMO_CONTACTS[activeChildId];
  const copy = (val: string, key: string) => {
    navigator.clipboard.writeText(val).catch(() => {});
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1500);
  };
  return (
    <div className="space-y-3">
      {contacts.map((c, ci) => (
        <div
          key={ci}
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            {c.label}
          </p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-sage-100 flex items-center justify-center text-[#4a7c59] font-semibold text-sm">
              {c.name[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{c.name}</p>
              <p className="text-xs text-gray-400">{c.relationship}</p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { icon: Phone, label: "Phone", val: c.phone, key: `${ci}-phone` },
              { icon: Mail, label: "Email", val: c.email, key: `${ci}-email` },
            ].map(({ icon: Icon, label, val, key }) => (
              <div
                key={key}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-xs text-gray-700 font-medium">
                    {val}
                  </span>
                </div>
                <button
                  onClick={() => copy(val, key)}
                  className="p-1 rounded cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  {copiedField === key ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── HOME SIDEBARS ────────────────────────────────────────────────────────────

function HomeAttendanceSidebar({
  child,
  onClose,
}: {
  child: (typeof DEMO_CHILDREN)[ChildId];
  onClose: () => void;
}) {
  const firstName = child.name.split(" ")[0];
  return (
    <>
      <motion.div
        key="home-attendance-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      <motion.div
        key="home-attendance-panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
        className="absolute inset-y-0 right-0 w-[300px] bg-white shadow-2xl z-50 flex flex-col overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <img
            src={child.image}
            alt={firstName}
            loading="lazy"
            decoding="async"
            className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">{firstName}</p>
            <p className="text-xs text-gray-400">{child.grade}</p>
          </div>
          <button
            data-tour-id="home-attendance-sidebar-close"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section label */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Recent Attendance
          </p>
        </div>

        {/* Attendance rows */}
        <div className="flex flex-col divide-y divide-gray-50 flex-1">
          {ATTENDANCE_DATA.map((row) => (
            <div key={row.date} className="px-5 py-3.5">
              <p className="text-xs font-medium text-gray-500 mb-2">{row.date}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-xs text-gray-500">Drop-off</span>
                  <span className="text-xs font-semibold text-gray-800">{row.checkIn}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                  <span className="text-xs text-gray-500">Pickup</span>
                  <span className="text-xs font-semibold text-gray-800">{row.checkOut}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="px-5 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" strokeWidth={1.5} />
            <p className="text-xs text-gray-400">
              Real-time check-in on the SchoolLayer mobile app (Coming Soon).
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function HomeOnboardingSidebar({ onClose }: { onClose: () => void }) {
  // Pre-seeded completions matching Emma's state: contracts 1 & 2 + assumption of risk done
  const completedIds = new Set([1, 2, 3, 5, 6, 7, 8, 10]);
  const reqTotal = CHECKLIST_ITEMS.filter((i) => !i.optional).length;
  const reqCompleted = CHECKLIST_ITEMS.filter(
    (i) => !i.optional && completedIds.has(i.id),
  ).length;

  return (
    <>
      <motion.div
        key="home-onboarding-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      <motion.div
        key="home-onboarding-panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
        className="absolute inset-y-0 right-0 w-[300px] bg-white shadow-2xl z-50 flex flex-col overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#4a7c59]/10 flex items-center justify-center flex-shrink-0">
              <ClipboardCheck className="w-4 h-4 text-[#4a7c59]" />
            </div>
            <p className="text-sm font-semibold text-gray-800">Onboarding Checklist</p>
          </div>
          <button
            data-tour-id="home-onboarding-sidebar-close"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500">Enrollment Progress</p>
            <span className="text-xs text-gray-400">
              {reqCompleted} / {reqTotal} required
            </span>
          </div>
          <ProgressBar value={reqCompleted} max={reqTotal} />
        </div>

        {/* Checklist items — read-only */}
        <div className="flex flex-col divide-y divide-gray-50 flex-1">
          {CHECKLIST_ITEMS.map((item) => {
            const done = completedIds.has(item.id);
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 px-5 py-3.5"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-emerald-100" : "bg-gray-100"}`}
                >
                  {done ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${done ? "text-gray-400 line-through" : "text-gray-700"}`}>
                    {item.label}
                  </p>
                  {item.optional && (
                    <span className="text-[10px] text-gray-400">Optional</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Go to{" "}
            <span className="text-[#4a7c59] font-medium">Enrollment</span>{" "}
            to complete remaining steps.
          </p>
        </div>
      </motion.div>
    </>
  );
}

// ─── HOME DASHBOARD ───────────────────────────────────────────────────────────

function HomeDashboard({
  onTabChange,
  attendanceChildId,
  setAttendanceChildId,
  onboardingOpen,
  setOnboardingOpen,
  isEnrolledByChild,
}: {
  onTabChange: (t: NavTab) => void;
  attendanceChildId: ChildId | null;
  setAttendanceChildId: (id: ChildId | null) => void;
  onboardingOpen: boolean;
  setOnboardingOpen: (v: boolean) => void;
  isEnrolledByChild: Record<ChildId, boolean>;
}) {
  const [copied, setCopied] = useState(false);

  const referralLink = "schoollayer.app/refer/sarah-m";

  function copyReferralLink() {
    navigator.clipboard.writeText(referralLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const upcomingEvents = DEMO_EVENTS.slice(0, 3);

  function getEventDayMonth(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return {
      day: d.getDate(),
      month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    };
  }

  const QUICK_ACTIONS: {
    label: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    tab: NavTab;
  }[] = [
    { label: "Pay Tuition", icon: CreditCard, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", tab: "billing" },
    { label: "Messages", icon: MessageCircle, iconBg: "bg-blue-100", iconColor: "text-blue-600", tab: "messages" },
    { label: "Events", icon: CalendarDays, iconBg: "bg-violet-100", iconColor: "text-violet-600", tab: "calendar" },
    { label: "Attendance", icon: ClipboardList, iconBg: "bg-amber-100", iconColor: "text-amber-600", tab: "children" },
    { label: "School Feed", icon: Rss, iconBg: "bg-sky-100", iconColor: "text-sky-600", tab: "feed" },
    { label: "My Children", icon: Users, iconBg: "bg-rose-100", iconColor: "text-rose-600", tab: "children" },
    { label: "Volunteer", icon: Heart, iconBg: "bg-pink-100", iconColor: "text-pink-600", tab: "volunteer" },
    { label: "Help", icon: HelpCircle, iconBg: "bg-teal-100", iconColor: "text-teal-600", tab: "enrollment" },
  ];

  return (
    <div className="px-6 py-8 flex flex-col gap-8 max-w-6xl mx-auto w-full">
      {/* Banner */}
      <div className="relative h-48 rounded-2xl overflow-hidden shadow-sm">
        <img
          src="/images/stock/ImageOne.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
        <div className="absolute bottom-5 left-6">
          <p className="text-white/75 text-sm font-body">Good morning,</p>
          <p className="text-white text-3xl font-heading font-bold leading-tight">
            Sarah.
          </p>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start lg:items-stretch">
        {/* Left column */}
        <div className="flex flex-col gap-8">
          {/* My Children */}
          <section>
            <h2 className="text-base font-heading font-semibold text-gray-800 mb-4">
              My Children
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(Object.values(DEMO_CHILDREN) as (typeof DEMO_CHILDREN)[ChildId][]).map((child) => {
                const firstName = child.name.split(" ")[0];
                return (
                  <div
                    key={child.id}
                    data-tour-id={child.id === "emma" ? "home-child-emma" : undefined}
                    className="p-4 flex flex-col items-center gap-3"
                  >
                    <img
                      src={child.image}
                      alt={firstName}
                      width={64}
                      height={64}
                      loading="lazy"
                      decoding="async"
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                    <div className="text-center min-w-0 w-full">
                      <p className="text-sm font-semibold font-heading text-gray-800 truncate">
                        {firstName}
                      </p>
                      <p className="text-xs font-body text-gray-400 mt-0.5">
                        {child.grade}
                      </p>
                      {isEnrolledByChild[child.id] ? (
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                          <CheckCircle className="w-2.5 h-2.5" />
                          Enrolled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
                          <Clock className="w-2.5 h-2.5" />
                          Pending
                        </span>
                      )}
                    </div>
                    <button
                      data-tour-id={child.id === "emma" ? "home-attendance-emma" : undefined}
                      onClick={() => setAttendanceChildId(child.id)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold font-body text-[#4a7c59] bg-[#EEF5EF] rounded-xl hover:bg-[#ddeede] transition-colors cursor-pointer"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      Attendance
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Smartphone className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" strokeWidth={1.5} />
              <p className="text-xs text-gray-400">
                Check-in and pickup available on the SchoolLayer mobile app (Coming Soon).
              </p>
            </div>
          </section>

          {/* Referral Section */}
          <section
            className="rounded-2xl p-6 shadow-sm border border-[#c2ddc8]"
            style={{ background: "linear-gradient(135deg, #eef5ef 0%, #ddeede 100%)" }}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-[#4a7c59]/15 flex items-center justify-center">
                    <Gift className="w-3.5 h-3.5 text-[#4a7c59]" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-base font-heading font-semibold text-gray-800">
                    Refer a Family
                  </h2>
                  <span className="bg-[#4a7c59] text-white text-xs font-body px-2 py-0.5 rounded-full font-medium">
                    $150 gift card
                  </span>
                </div>
                <p className="text-sm font-body text-gray-600 leading-relaxed max-w-lg">
                  Know a family who&apos;d be a great fit for SchoolLayer? Share
                  your link and when they enroll and pay their registration fee,
                  you&apos;ll receive a $150 gift card of your choice.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:min-w-[260px]">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "3", label: "Referred" },
                    { value: "1", label: "Enrolled" },
                    { value: "$150", label: "Earned" },
                  ].map(({ value, label }) => (
                    <div
                      key={label}
                      className="text-center bg-white/70 rounded-xl py-2.5 px-2 border border-[#c2ddc8]"
                    >
                      <p className="text-base font-semibold font-heading text-gray-800">{value}</p>
                      <p className="text-xs font-body text-gray-500">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0 bg-white/70 border border-[#c2ddc8] rounded-xl px-3 py-2">
                    <p className="text-xs font-body text-gray-600 truncate">{referralLink}</p>
                  </div>
                  <button
                    onClick={copyReferralLink}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold font-body transition-colors whitespace-nowrap cursor-pointer ${
                      copied ? "bg-green-600 text-white" : "bg-[#4a7c59] text-white hover:bg-[#3d6b4a]"
                    }`}
                  >
                    {copied ? (
                      <><Check className="w-3.5 h-3.5" />Copied!</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" />Copy link</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-base font-heading font-semibold text-gray-800 mb-3">
              Quick Actions
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_ACTIONS.map(({ label, icon: Icon, iconBg, iconColor, tab }) => (
                <button
                  key={label}
                  onClick={() => onTabChange(tab)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors text-center cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-semibold font-body text-gray-700 leading-tight">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-8 lg:sticky lg:top-[65px] lg:self-start">
          {/* Onboarding checklist prompt */}
          <section>
            <h2 className="text-base font-heading font-semibold text-gray-800 mb-4">
              Get started
            </h2>
            <button
              data-tour-id="home-checklist-prompt"
              onClick={() => setOnboardingOpen(true)}
              className="w-full flex items-center gap-3 bg-[#4a7c59]/10 hover:bg-[#4a7c59]/15 border border-[#4a7c59]/20 rounded-2xl px-4 py-3 transition-colors text-left cursor-pointer"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#4a7c59]/15 flex items-center justify-center">
                <ClipboardCheck className="w-4 h-4 text-[#4a7c59]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold font-body text-[#4a7c59] leading-snug">
                  Complete your onboarding
                </p>
                <p className="text-xs font-body text-[#4a7c59]/70 mt-0.5">
                  Finish setting up your account
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#4a7c59]/60 flex-shrink-0" />
            </button>
          </section>

          {/* Upcoming Events */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-heading font-semibold text-gray-800">
                Upcoming events
              </h2>
              <button
                onClick={() => onTabChange("calendar")}
                className="flex items-center gap-1 text-xs font-body text-[#4a7c59] hover:underline cursor-pointer"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {upcomingEvents.map((evt) => {
                const { day, month } = getEventDayMonth(evt.date);
                return (
                  <div
                    key={evt.id}
                    className="flex items-center gap-3 py-3"
                  >
                    <div
                      className="flex-shrink-0 w-11 h-11 rounded-xl flex flex-col items-center justify-center"
                      style={{ backgroundColor: evt.color + "22" }}
                    >
                      <span className="text-xs font-semibold uppercase leading-none" style={{ color: evt.color }}>
                        {month}
                      </span>
                      <span className="text-base font-bold font-heading leading-tight" style={{ color: evt.color }}>
                        {day}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold font-heading text-gray-800 truncate">
                        {evt.title}
                      </p>
                      {evt.time && (
                        <p className="text-xs font-body text-gray-500 mt-0.5">{evt.time}</p>
                      )}
                      {evt.category && (
                        <span
                          className="inline-block mt-1 text-xs font-body font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: evt.color + "22", color: evt.color }}
                        >
                          {evt.category}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Tuition & Billing */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-heading font-semibold text-gray-800">
                Tuition &amp; billing
              </h2>
              <button
                onClick={() => onTabChange("billing")}
                className="flex items-center gap-1 text-xs font-body text-[#4a7c59] hover:underline cursor-pointer"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {/* School Year Tuition card */}
              <button
                onClick={() => onTabChange("billing")}
                className="rounded-2xl overflow-hidden bg-white border border-gray-100 flex flex-col group text-left cursor-pointer"
              >
                <div className="relative h-28 overflow-hidden">
                  <img
                    src="/images/stock/ImageFive.webp"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
                <div className="p-3.5 flex flex-col gap-2">
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-0.5">Emma &amp; Liam</p>
                    <p className="text-sm font-semibold text-gray-800 leading-snug">School Year Tuition</p>
                    <p className="text-xs text-gray-500 mt-0.5">$1,700/mo · Full-Time Program</p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 self-start px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: "#4a7c59" }}
                  >
                    View billing <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>

              {/* Extended Learning card */}
              <button
                onClick={() => onTabChange("billing")}
                className="rounded-2xl overflow-hidden bg-white border border-gray-100 flex flex-col group text-left cursor-pointer"
              >
                <div className="relative h-28 overflow-hidden">
                  <img
                    src="/images/stock/ImageNine.webp"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/80 text-gray-600 shadow-sm backdrop-blur-sm">
                    Optional
                  </span>
                </div>
                <div className="p-3.5 flex flex-col gap-2">
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-0.5">Emma, Jake, Liam</p>
                    <p className="text-sm font-semibold text-gray-800 leading-snug">Extended Learning (3:00 – 5pm)</p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 self-start px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: "#e07a3a" }}
                  >
                    Select plan <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Home sidebars */}
      <AnimatePresence>
        {attendanceChildId && (
          <HomeAttendanceSidebar
            key="home-attendance-sidebar"
            child={DEMO_CHILDREN[attendanceChildId]}
            onClose={() => setAttendanceChildId(null)}
          />
        )}
        {onboardingOpen && (
          <HomeOnboardingSidebar
            key="home-onboarding-sidebar"
            onClose={() => setOnboardingOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── HEADER & NAV ─────────────────────────────────────────────────────────────

const PRIMARY_NAV: {
  id: NavTab;
  label: string;
  icon: typeof ClipboardCheck;
}[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "enrollment", label: "Enrollment", icon: ClipboardCheck },
  { id: "children", label: "My Children", icon: Users },
  { id: "billing", label: "Tuition & Billing", icon: CreditCard },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "feed", label: "Feed", icon: Rss },
];

const MORE_NAV: { id: NavTab; label: string; icon: typeof FileText }[] = [
  { id: "forms", label: "Forms & Documents", icon: FileText },
  { id: "volunteer", label: "Volunteer Opportunities", icon: Heart },
  { id: "emergency-contacts", label: "Emergency Contacts", icon: Phone },
];

function DemoHeader({
  activeTab,
  onTabChange,
}: {
  activeTab: NavTab;
  onTabChange: (t: NavTab) => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node))
        setMoreOpen(false);
    };
    if (moreOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [moreOpen]);

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center flex-shrink-0">
      {/* Logo — left */}
      <div className="flex items-center gap-2 flex-1">
        <img
          src="/images/Logo.webp"
          alt="SchoolLayer"
          width={28}
          height={28}
          className="h-7 w-auto object-contain"
        />
        {/* <span className="text-sm font-semibold text-gray-700">SchoolLayer</span> */}
      </div>

      {/* Nav — center */}
      <nav className="flex items-center gap-1">
        {PRIMARY_NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            data-tour-id={`nav-${id}`}
            onClick={() => onTabChange(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${activeTab === id ? "text-[#4a7c59] bg-[#4a7c59]/8 font-semibold" : "text-gray-500 hover:text-[#4a7c59] hover:bg-gray-50"}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
        <div className="relative" ref={moreRef}>
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-[#4a7c59] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            More{" "}
            <ChevronDown
              className={`w-3 h-3 transition-transform ${moreOpen ? "rotate-180" : ""}`}
            />
          </button>
          {moreOpen && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5">
              {MORE_NAV.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    onTabChange(id);
                    setMoreOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${activeTab === id ? "text-[#4a7c59] bg-sage-50 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-[#4a7c59]"}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Avatar — right */}
      <div className="flex-1 flex justify-end">
        <Avatar initials="SM" color="#f29a8f" size="sm" />
      </div>
    </header>
  );
}

function ChildTabStrip({
  activeChildId,
  onSwitch,
  layout = "horizontal",
}: {
  activeChildId: ChildId;
  onSwitch: (id: ChildId) => void;
  layout?: "horizontal" | "sidebar";
}) {
  const children = Object.values(DEMO_CHILDREN) as (typeof DEMO_CHILDREN)[ChildId][];

  if (layout === "sidebar") {
    return (
      <aside className="w-56 shrink-0 border-r border-gray-100 flex flex-col py-2 px-2 overflow-hidden">
        {children.map((child) => {
          const active = activeChildId === child.id;
          return (
            <button
              key={child.id}
              data-tour-id={`child-tab-${child.id}`}
              onClick={() => onSwitch(child.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-sm font-medium transition-colors cursor-pointer ${
                active
                  ? "bg-[#4a7c59]/8 text-gray-800"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Avatar
                initials={child.initials}
                color={child.color}
                size="sm"
                src={child.image}
              />
              <span className="truncate flex-1 min-w-0">{child.name}</span>
            </button>
          );
        })}
        <button className="w-full flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-[#4a7c59] font-medium border border-dashed border-[#4a7c59]/30 hover:bg-sage-50 transition-colors cursor-pointer mt-1">
          <Plus className="w-3.5 h-3.5 shrink-0" /> New Application
        </button>
      </aside>
    );
  }

  return (
    <div className="flex gap-2 mb-5">
      {children.map((child) => (
        <button
          key={child.id}
          data-tour-id={`child-tab-${child.id}`}
          onClick={() => onSwitch(child.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer border ${activeChildId === child.id ? "bg-white border-gray-200 text-gray-800 shadow-sm" : "border-transparent text-gray-400 hover:text-gray-600"}`}
        >
          <Avatar
            initials={child.initials}
            color={child.color}
            size="sm"
            src={child.image}
          />
          {child.name}
        </button>
      ))}
      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-[#4a7c59] font-medium border border-dashed border-[#4a7c59]/30 hover:bg-sage-50 transition-colors cursor-pointer">
        <Plus className="w-3.5 h-3.5" /> New Application
      </button>
    </div>
  );
}

// ─── TOUR CONSTANTS ───────────────────────────────────────────────────────────

const TOUR_MOVE_MS = 950;
const TOUR_RESUME_MS = 1500;

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────

export default function ParentDashboardDemo({ initialTab = "home", disableTour = false, hideNav = false, onMount }: { initialTab?: NavTab; disableTour?: boolean; hideNav?: boolean; onMount?: () => void }) {
  const [activeNavTab, setActiveNavTab] = useState<NavTab>(initialTab);
  const [activeChildId, setActiveChildId] = useState<ChildId>("emma");
  const [openModal, setOpenModal] = useState<ModalId>(null);

  useEffect(() => {
    onMount?.();
    // onMount is a one-time mount notification for lazy-load shells
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Per-child signatures — Emma pre-seeded with contracts 1 & 2 + assumption of risk
  const [signaturesEmma, setSignaturesEmma] = useState<Record<string, string>>({
    "1-1": "Sarah Mitchell",
    "1-2": "Sarah Mitchell",
    "1-3": "Sarah Mitchell",
    "1-4": "Sarah Mitchell",
    "2-1": "Sarah Mitchell",
    "2-2": "Sarah Mitchell",
    "2-3": "Sarah Mitchell",
    "3-1": "Sarah Mitchell",
    "3-2": "Sarah Mitchell",
    "5-3": "Sarah Mitchell",
    "6-1": "Sarah Mitchell",
    "8-1": "Sarah Mitchell",
  });
  const [signaturesJake, setSignaturesJake] = useState<Record<string, string>>(
    {},
  );
  const [signaturesLiam, setSignaturesLiam] = useState<Record<string, string>>({
    "1-1": "Sarah Mitchell",
    "1-2": "Sarah Mitchell",
    "1-3": "Sarah Mitchell",
    "1-4": "Sarah Mitchell",
    "2-1": "Sarah Mitchell",
    "2-2": "Sarah Mitchell",
    "2-3": "Sarah Mitchell",
    "3-1": "Sarah Mitchell",
    "3-2": "Sarah Mitchell",
    "5-3": "Sarah Mitchell",
    "6-1": "Sarah Mitchell",
    "8-1": "Sarah Mitchell",
  });

  // Per-child form completion
  const [healthFormSaved, setHealthFormSaved] = useState<
    Record<ChildId, boolean>
  >({ emma: true, jake: false, liam: true });
  const [medicationSaved, setMedicationSaved] = useState<
    Record<ChildId, boolean>
  >({ emma: false, jake: false, liam: false });
  const [pickupSaved, setPickupSaved] = useState<Record<ChildId, boolean>>({
    emma: false,
    jake: false,
    liam: false,
  });
  const [photoConsent, setPhotoConsent] = useState<
    Record<ChildId, "FULL" | "LIMITED" | "NO" | null>
  >({ emma: "FULL", jake: null, liam: "FULL" });
  const [healthStatement, setHealthStatement] = useState<
    Record<ChildId, "A" | "B" | null>
  >({ emma: "A", jake: null, liam: "A" });
  const [immunizationCount, setImmunizationCount] = useState<
    Record<ChildId, number>
  >({ emma: 1, jake: 0, liam: 1 });
  const [feePaid, setFeePaid] = useState<Record<ChildId, boolean>>({
    emma: true,
    jake: false,
    liam: true,
  });
  const [medications, setMedications] = useState<
    Record<ChildId, DemoMedication[]>
  >({ emma: [], jake: [], liam: [] });
  const [pickupPersons, setPickupPersons] = useState<
    Record<ChildId, DemoAuthorizedPerson[]>
  >({ emma: [], jake: [], liam: [] });

  // Billing
  const [paidInvoices, setPaidInvoices] = useState<Set<string>>(new Set());
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>("monthly");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutTxIds, setCheckoutTxIds] = useState<string[]>([]);
  const [billingInvoiceSidebarOpen, setBillingInvoiceSidebarOpen] = useState(false);
  const [homeschoolSelections, setHomeschoolSelections] = useState(
    initialHomeschoolSelections,
  );
  const [paidHomeschoolDetails, setPaidHomeschoolDetails] = useState<
    Record<string, { amount: string; scheduleNote: string }>
  >({});
  const [homeschoolPayModal, setHomeschoolPayModal] = useState<{
    childId: ChildId;
    weeks: HomeschoolDropInWeek[];
    fromCheckout?: boolean;
  } | null>(null);

  const billingChildNames: Record<ChildId, string> = {
    emma: "Emma",
    jake: "Jake",
    liam: "Liam",
  };

  const toggleHomeschoolDay = useCallback((weekId: string, day: Weekday) => {
    setHomeschoolSelections((prev) => {
      const current = prev[weekId] ?? [];
      const next = current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day].sort(
            (a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b),
          );
      return { ...prev, [weekId]: next };
    });
  }, []);

  const openHomeschoolPay = useCallback(
    (childId: ChildId, fromCheckout = false) => {
      const bundlePending = DEMO_TRANSACTIONS.some(
        (t) =>
          t.id === JAKE_HOMESCHOOL_DROPIN_TX_ID &&
          t.childId === childId &&
          t.status === "pending" &&
          !paidInvoices.has(t.id),
      );
      if (!bundlePending) return;
      setHomeschoolPayModal({
        childId,
        weeks: HOMESCHOOL_DROPIN_WEEKS,
        fromCheckout,
      });
    },
    [paidInvoices],
  );

  const openCheckout = useCallback((txIds: string[]) => {
    setCheckoutTxIds(txIds);
    setCheckoutOpen(true);
  }, []);

  const handleCheckoutConfirm = useCallback(
    (plan: PaymentPlan, txIds: string[]) => {
      setPaymentPlan(plan);
      setPaidInvoices((prev) => new Set([...prev, ...txIds]));
      const homeschoolTx = txIds.find(
        (id) => id === JAKE_HOMESCHOOL_DROPIN_TX_ID,
      );
      if (homeschoolTx) {
        const total = totalHomeschoolAmount(homeschoolSelections);
        setPaidHomeschoolDetails((prev) => ({
          ...prev,
          [JAKE_HOMESCHOOL_DROPIN_TX_ID]: {
            amount: formatMoney(total),
            scheduleNote: `${HOMESCHOOL_DROPIN_WEEKS.length} weeks selected`,
          },
        }));
      }
      setCheckoutOpen(false);
      setCheckoutTxIds([]);
    },
    [homeschoolSelections],
  );

  const handleHomeschoolPayConfirm = useCallback(() => {
    if (!homeschoolPayModal) return;
    if (homeschoolPayModal.fromCheckout) {
      setHomeschoolPayModal(null);
      return;
    }
    const total = totalHomeschoolAmount(homeschoolSelections);
    setPaidHomeschoolDetails((prev) => ({
      ...prev,
      [JAKE_HOMESCHOOL_DROPIN_TX_ID]: {
        amount: formatMoney(total),
        scheduleNote: `${HOMESCHOOL_DROPIN_WEEKS.length} weeks selected`,
      },
    }));
    setPaidInvoices((prev) => new Set([...prev, JAKE_HOMESCHOOL_DROPIN_TX_ID]));
    setHomeschoolPayModal(null);
  }, [homeschoolPayModal, homeschoolSelections]);

  // Calendar event sidebar
  const [calendarSidebarEvent, setCalendarSidebarEvent] = useState<DemoEvent | null>(null);

  // Feed tab state
  const [feedReactions, setFeedReactions] = useState<Record<string, string[]>>(DEMO_SEED_REACTIONS);
  const [feedComments, setFeedComments] = useState<Record<string, string[]>>(DEMO_SEED_COMMENTS);
  const [feedCommentInputs, setFeedCommentInputs] = useState<Record<string, string>>({});
  const [feedSelectedPost, setFeedSelectedPost] = useState<DemoPost | null>(null);
  const [feedFilterClassId, setFeedFilterClassId] = useState<string | null>(null);
  const [feedFilterTeacherName, setFeedFilterTeacherName] = useState<string | null>(null);

  // Messages
  const [messageThreads, setMessageThreads] =
    useState<Record<string, DemoMessage[]>>(DEMO_THREADS);
  const [msgInput, setMsgInput] = useState("");
  const [msgActiveConv, setMsgActiveConv] = useState("c1");
  const [typingTarget, setTypingTarget] = useState<string | null>(null);

  // ── Home tab sidebar state ───────────────────────────────────────────────────
  const [homeAttendanceChildId, setHomeAttendanceChildId] = useState<ChildId | null>(null);
  const [homeOnboardingOpen, setHomeOnboardingOpen] = useState(false);

  // ── Tour state ──────────────────────────────────────────────────────────────
  const [isTouring, setIsTouring] = useState(!disableTour);
  const [tourStep, setTourStep] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorClicking, setCursorClicking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tourTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getTargetCenter = useCallback(
    (targetId: string): { x: number; y: number } | null => {
      if (!containerRef.current) return null;
      const el = containerRef.current.querySelector(
        `[data-tour-id="${targetId}"]`,
      );
      if (!el) return null;
      const containerRect = containerRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      return {
        x: elRect.left - containerRect.left + elRect.width / 2,
        y: elRect.top - containerRect.top + elRect.height / 2,
      };
    },
    [],
  );

  useEffect(() => {
    if (!typingTarget) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setMsgInput(typingTarget.slice(0, i));
      if (i >= typingTarget.length) {
        clearInterval(id);
        setTypingTarget(null);
      }
    }, 55);
    return () => {
      clearInterval(id);
      setMsgInput("");
    };
  }, [typingTarget]);

  const msgInputRef = useRef(msgInput);
  useEffect(() => {
    msgInputRef.current = msgInput;
  }, [msgInput]);

  const sendMsgFromTour = useCallback(() => {
    const text = msgInputRef.current.trim();
    if (!text) return;
    const newMsg: DemoMessage = {
      id: Date.now().toString(),
      senderId: "parent",
      text,
      time: "Just now",
    };
    setMessageThreads((prev) => ({
      ...prev,
      [msgActiveConv]: [...(prev[msgActiveConv] || []), newMsg],
    }));
    setMsgInput("");
  }, [msgActiveConv]);

  const tourSteps = useMemo(
    () => [
      {
        action: () => {
          setActiveNavTab("home");
          setHomeAttendanceChildId(null);
          setHomeOnboardingOpen(false);
        },
        targetId: "nav-home",
        holdMs: 1400,
        clickAnimation: true,
      },
      {
        action: () => {},
        targetId: "home-child-emma",
        holdMs: 1000,
        clickAnimation: false,
      },
      {
        action: () => setHomeAttendanceChildId("emma"),
        targetId: "home-attendance-emma",
        holdMs: 2200,
        clickAnimation: true,
      },
      {
        action: () => setHomeAttendanceChildId(null),
        targetId: "home-attendance-sidebar-close",
        holdMs: 700,
        clickAnimation: true,
      },
      {
        action: () => setHomeOnboardingOpen(true),
        targetId: "home-checklist-prompt",
        holdMs: 2000,
        clickAnimation: true,
      },
      {
        action: () => setHomeOnboardingOpen(false),
        targetId: "home-onboarding-sidebar-close",
        holdMs: 700,
        clickAnimation: true,
      },
      {
        action: () => {
          setActiveNavTab("enrollment");
          setActiveChildId("emma");
        },
        targetId: "nav-enrollment",
        holdMs: 1800,
        clickAnimation: true,
      },
      {
        action: () => setOpenModal("contract-1"),
        targetId: "checklist-item-0",
        holdMs: 2200,
        clickAnimation: true,
      },
      {
        action: () => setOpenModal(null),
        targetId: "modal-close",
        holdMs: 600,
        clickAnimation: true,
      },
      {
        action: () => setActiveChildId("jake"),
        targetId: "child-tab-jake",
        holdMs: 1800,
        clickAnimation: true,
      },
      {
        action: () => setActiveChildId("liam"),
        targetId: "child-tab-liam",
        holdMs: 1800,
        clickAnimation: true,
      },
      {
        action: () => {
          setActiveNavTab("billing");
          setActiveChildId("emma");
        },
        targetId: "nav-billing",
        holdMs: 1600,
        clickAnimation: true,
      },
      {
        action: () => setBillingInvoiceSidebarOpen(true),
        targetId: "billing-pending-invoice",
        holdMs: 2200,
        clickAnimation: true,
      },
      {
        action: () => { setActiveNavTab("messages"); setBillingInvoiceSidebarOpen(false); },
        targetId: "nav-messages",
        holdMs: 1400,
        clickAnimation: true,
      },
      {
        action: () => {
          const el = containerRef.current?.querySelector(
            '[data-tour-id="messages-conv-c2"]',
          );
          (el as HTMLElement)?.click();
        },
        targetId: "messages-conv-c2",
        holdMs: 1600,
        clickAnimation: true,
      },
      {
        action: () => {
          setMsgInput("");
          setTypingTarget("Sounds good, see you Thursday!");
        },
        targetId: "messages-input",
        holdMs: 2800,
        clickAnimation: true,
      },
      {
        action: () => sendMsgFromTour(),
        targetId: "messages-send",
        holdMs: 1000,
        clickAnimation: true,
      },
      {
        action: () => setActiveNavTab("calendar"),
        targetId: "nav-calendar",
        holdMs: 1400,
        clickAnimation: true,
      },
      {
        action: () => {
          const el = containerRef.current?.querySelector(
            '[data-tour-id="calendar-next-month"]',
          );
          (el as HTMLElement)?.click();
        },
        targetId: "calendar-next-month",
        holdMs: 1600,
        clickAnimation: true,
      },
      {
        action: () => {
          const el = containerRef.current?.querySelector(
            '[data-tour-id="calendar-event-e6"]',
          );
          (el as HTMLElement)?.click();
        },
        targetId: "calendar-event-e6",
        holdMs: 2400,
        clickAnimation: true,
      },
      {
        action: () => { setActiveNavTab("children"); setCalendarSidebarEvent(null); },
        targetId: "nav-children",
        holdMs: 1200,
        clickAnimation: true,
      },
      {
        action: () => setActiveChildId("liam"),
        targetId: "child-tab-liam",
        holdMs: 1800,
        clickAnimation: true,
      },
    ],
    [sendMsgFromTour],
  );

  useEffect(() => {
    if (!isTouring) return;
    const step = tourSteps[tourStep];
    let cancelled = false;

    // 1. Resolve target and start cursor glide (target visible from previous step's action)
    const t1 = setTimeout(() => {
      if (cancelled) return;
      const pos = getTargetCenter(step.targetId);
      if (pos) {
        setCursorPos(pos);
        setCursorVisible(true);
      }

      // 2. After cursor arrives, fire action + click pulse
      const t2 = setTimeout(() => {
        if (cancelled) return;
        step.action();

        if (step.clickAnimation) {
          setCursorClicking(true);
          setTimeout(() => {
            if (!cancelled) setCursorClicking(false);
          }, 350);
        }

        // 3. Hold, then advance
        const t3 = setTimeout(() => {
          if (!cancelled) setTourStep((prev) => (prev + 1) % tourSteps.length);
        }, step.holdMs);
        tourTimerRef.current = t3;
      }, TOUR_MOVE_MS);
      tourTimerRef.current = t2;
    }, 60);
    tourTimerRef.current = t1;

    return () => {
      cancelled = true;
      clearTimeout(t1);
      if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
    };
  }, [tourStep, isTouring]);

  useEffect(() => {
    return () => {
      if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const handleTourMouseEnter = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    setIsTouring(false);
    setCursorVisible(false);
  }, []);

  const handleTourMouseLeave = useCallback(() => {
    if (disableTour) return;
    resumeTimerRef.current = setTimeout(() => {
      setTourStep(0);
      setIsTouring(true);
    }, TOUR_RESUME_MS);
  }, [disableTour]);

  // Derived active signatures
  const activeSigs =
    activeChildId === "emma"
      ? signaturesEmma
      : activeChildId === "liam"
        ? signaturesLiam
        : signaturesJake;
  const setActiveSigs =
    activeChildId === "emma"
      ? setSignaturesEmma
      : activeChildId === "liam"
        ? setSignaturesLiam
        : setSignaturesJake;

  const handleSign = useCallback(
    (key: string, name: string) => {
      setActiveSigs((prev) => ({ ...prev, [key]: name }));
    },
    [activeChildId],
  );

  const FEED_EMOJIS = ["❤️", "👏", "😊", "🌱", "✨"];

  const toggleFeedReaction = (postId: string, emoji: string) => {
    const cur = feedReactions[postId] || [];
    setFeedReactions({
      ...feedReactions,
      [postId]: cur.includes(emoji) ? cur.filter((e) => e !== emoji) : [...cur, emoji],
    });
  };
  const addFeedComment = (postId: string) => {
    const text = (feedCommentInputs[postId] || "").trim();
    if (!text) return;
    setFeedComments({ ...feedComments, [postId]: [...(feedComments[postId] || []), text] });
    setFeedCommentInputs({ ...feedCommentInputs, [postId]: "" });
  };
  // Completion logic
  const sigs = activeSigs;
  const completions = [
    C1_SECTIONS.every((s) => sigs[s.id]), // 1
    C2_SECTIONS.every((s) => sigs[s.id]), // 2
    healthFormSaved[activeChildId] && !!sigs["3-1"] && !!sigs["3-2"], // 3
    !!sigs["4-1"], // 4 optional
    immunizationCount[activeChildId] > 0, // 5
    !!healthStatement[activeChildId] && !!sigs["8-1"], // 6
    !!photoConsent[activeChildId] && !!sigs["5-3"], // 7
    !!sigs["6-1"], // 8
    pickupSaved[activeChildId] && !!sigs["7-1"], // 9 optional
    feePaid[activeChildId], // 10
  ];

  const requiredItems = [0, 1, 2, 4, 5, 6, 7, 9]; // 0-indexed positions that are required
  const isEnrolled = requiredItems.every((i) => completions[i]);

  const isEnrolledByChild = useMemo((): Record<ChildId, boolean> => {
    const check = (childId: ChildId, childSigs: Record<string, string>): boolean => {
      const c = [
        C1_SECTIONS.every((s) => !!childSigs[s.id]),
        C2_SECTIONS.every((s) => !!childSigs[s.id]),
        healthFormSaved[childId] && !!childSigs["3-1"] && !!childSigs["3-2"],
        !!childSigs["4-1"],
        immunizationCount[childId] > 0,
        !!healthStatement[childId] && !!childSigs["8-1"],
        !!photoConsent[childId] && !!childSigs["5-3"],
        !!childSigs["6-1"],
        pickupSaved[childId] && !!childSigs["7-1"],
        feePaid[childId],
      ];
      return requiredItems.every((i) => c[i]);
    };
    return {
      emma: check("emma", signaturesEmma),
      jake: false,
      liam: check("liam", signaturesLiam),
    };
  }, [signaturesEmma, signaturesLiam, healthFormSaved, immunizationCount,
      healthStatement, photoConsent, feePaid, pickupSaved]);


  const pageTitle: Record<NavTab, string> = {
    home: "Home",
    enrollment: "Enrollment",
    children: "My Children",
    billing: "Tuition & Billing",
    messages: "Messages",
    calendar: "Calendar",
    feed: "Feed",
    forms: "Forms & Documents",
    volunteer: "Volunteer Opportunities",
    "emergency-contacts": "Emergency Contacts",
  };

  const isJakePending = activeChildId === "jake";

  return (
    <div
      ref={containerRef}
      className="demo-shell relative flex flex-col bg-white"
      style={{
        minHeight: "700px",
        fontFamily: "var(--font-body, system-ui, sans-serif)",
      }}
      onMouseEnter={handleTourMouseEnter}
      onMouseLeave={handleTourMouseLeave}
    >
      {!hideNav && <DemoHeader activeTab={activeNavTab} onTabChange={setActiveNavTab} />}

      <main className="flex-1 overflow-y-auto flex flex-col bg-white">
        {activeNavTab === "messages" || activeNavTab === "calendar" || activeNavTab === "feed" || activeNavTab === "home" || activeNavTab === "enrollment" ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNavTab}
              className="flex flex-col flex-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeNavTab === "home" && (
                <HomeDashboard
                  onTabChange={setActiveNavTab}
                  attendanceChildId={homeAttendanceChildId}
                  setAttendanceChildId={setHomeAttendanceChildId}
                  onboardingOpen={homeOnboardingOpen}
                  setOnboardingOpen={setHomeOnboardingOpen}
                  isEnrolledByChild={isEnrolledByChild}
                />
              )}
              {activeNavTab === "enrollment" && (
                <EnrollmentPage
                  key={activeChildId}
                  activeChildId={activeChildId}
                  setActiveChildId={setActiveChildId}
                  completions={completions}
                  enrolled={isEnrolled}
                  isJakePending={activeChildId === "jake"}
                  sigs={activeSigs}
                  onSign={handleSign}
                  healthFormSaved={healthFormSaved[activeChildId]}
                  onHealthFormSave={() =>
                    setHealthFormSaved((p) => ({ ...p, [activeChildId]: true }))
                  }
                  medications={medications[activeChildId]}
                  setMedications={(m) =>
                    setMedications((p) => ({ ...p, [activeChildId]: m }))
                  }
                  medicationSaved={medicationSaved[activeChildId]}
                  onMedicationSave={() =>
                    setMedicationSaved((p) => ({ ...p, [activeChildId]: true }))
                  }
                  immunizationCount={immunizationCount[activeChildId]}
                  onImmunizationUpload={() =>
                    setImmunizationCount((p) => ({
                      ...p,
                      [activeChildId]: p[activeChildId] + 1,
                    }))
                  }
                  photoConsent={photoConsent[activeChildId]}
                  onPhotoConsentSave={(c) =>
                    setPhotoConsent((p) => ({ ...p, [activeChildId]: c }))
                  }
                  healthStatement={healthStatement[activeChildId]}
                  onHealthStatementSave={(o) =>
                    setHealthStatement((p) => ({ ...p, [activeChildId]: o }))
                  }
                  pickupPersons={pickupPersons[activeChildId]}
                  setPickupPersons={(p) =>
                    setPickupPersons((prev) => ({ ...prev, [activeChildId]: p }))
                  }
                  pickupSaved={pickupSaved[activeChildId]}
                  onPickupSave={() =>
                    setPickupSaved((p) => ({ ...p, [activeChildId]: true }))
                  }
                  feePaid={feePaid[activeChildId]}
                  onFeePay={() =>
                    setFeePaid((p) => ({ ...p, [activeChildId]: true }))
                  }
                />
              )}
              {activeNavTab === "messages" && (
                <MessagesPage
                  threads={messageThreads}
                  setThreads={setMessageThreads}
                  input={msgInput}
                  setInput={setMsgInput}
                  activeConv={msgActiveConv}
                  setActiveConv={setMsgActiveConv}
                />
              )}
              {activeNavTab === "calendar" && (
                <CalendarPage onEventClick={(e) => setCalendarSidebarEvent(e)} />
              )}
              {activeNavTab === "feed" && (() => {
                const feedDisplayed = feedFilterTeacherName
                  ? DEMO_POSTS.filter((p) => p.author === feedFilterTeacherName)
                  : feedFilterClassId === "admin"
                    ? DEMO_POSTS.filter((p) => p.role === "Admin")
                    : feedFilterClassId
                      ? (() => {
                          const cls = PARENT_FEED_CLASSES.find((c) => c.id === feedFilterClassId);
                          if (!cls) return DEMO_POSTS;
                          return DEMO_POSTS.filter((p) => cls.teachers.some((t) => t.name === p.author));
                        })()
                      : DEMO_POSTS;
                return (
                  <div className="flex flex-1 border-t border-gray-100 overflow-hidden">
                    {/* Class / teacher filter sidebar */}
                    <aside className="w-52 shrink-0 border-r border-gray-100 flex flex-col p-4 gap-0.5 overflow-y-auto">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 pb-2">
                        Classes
                      </p>
                      {/* All Posts */}
                      <button
                        onClick={() => { setFeedFilterClassId(null); setFeedFilterTeacherName(null); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${!feedFilterClassId && !feedFilterTeacherName ? "bg-[#4a7c59]/8 text-gray-800" : "text-gray-400 hover:text-gray-600 hover:bg-black/5"}`}
                      >
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                          <span className="text-[10px] text-gray-500 font-bold">All</span>
                        </div>
                        <span className="text-sm font-medium truncate">All Posts</span>
                      </button>

                      {/* Class rows with teacher subitems */}
                      {PARENT_FEED_CLASSES.map((cls) => {
                        const isClassActive = feedFilterClassId === cls.id && !feedFilterTeacherName;
                        return (
                          <div key={cls.id}>
                            <button
                              onClick={() => { setFeedFilterClassId(cls.id); setFeedFilterTeacherName(null); }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${isClassActive ? "bg-[#4a7c59]/8 text-gray-800" : "text-gray-400 hover:text-gray-600 hover:bg-black/5"}`}
                            >
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                                style={{ backgroundColor: cls.color }}
                              >
                                {cls.label[0]}
                              </div>
                              <span className="text-sm font-medium truncate">{cls.label}</span>
                            </button>
                            {/* Teacher subitems */}
                            <div className="ml-3 flex flex-col gap-0.5 mt-0.5">
                              {cls.teachers.map((t) => {
                                const isTeacherActive = feedFilterTeacherName === t.name && feedFilterClassId === cls.id;
                                return (
                                  <button
                                    key={t.name}
                                    onClick={() => { setFeedFilterClassId(cls.id); setFeedFilterTeacherName(t.name); }}
                                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${isTeacherActive ? "bg-[#4a7c59]/8 text-gray-700" : "text-gray-400 hover:text-gray-600 hover:bg-black/5"}`}
                                  >
                                    <div
                                      className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0"
                                      style={{ backgroundColor: t.color }}
                                    >
                                      {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                    </div>
                                    <span className="text-xs truncate">{t.name.replace(/^Ms\. /, "")}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {/* Admin separator */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => { setFeedFilterClassId("admin"); setFeedFilterTeacherName(null); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${feedFilterClassId === "admin" ? "bg-[#4a7c59]/8 text-gray-800" : "text-gray-400 hover:text-gray-600 hover:bg-black/5"}`}
                        >
                          <div className="w-6 h-6 rounded-full bg-[#4A6354] flex items-center justify-center shrink-0">
                            <span className="text-[9px] text-white font-bold">SF</span>
                          </div>
                          <span className="text-sm font-medium truncate">Admin</span>
                        </button>
                      </div>
                    </aside>

                    {/* Posts column */}
                    <div className="flex-1 min-w-0 flex flex-col divide-y divide-gray-100 overflow-y-auto">
                      {feedDisplayed.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-12">No posts yet.</p>
                      ) : feedDisplayed.map((post) => (
                        <motion.div
                          key={post.id}
                          className="px-6 py-5 cursor-pointer hover:bg-gray-50/60 transition-colors"
                          onClick={() => setFeedSelectedPost(post)}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <div className="flex items-center gap-2.5 mb-3">
                            <Avatar
                              initials={post.author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              color={post.color}
                            />
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{post.author}</p>
                              <p className="text-xs text-gray-400">{post.role} · {post.time}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed mb-3">{post.text}</p>
                          {post.attachments?.map((att, i) =>
                            att.type === "image" ? (
                              <img
                                key={i}
                                src={att.src}
                                alt={att.name || ""}
                                loading="lazy"
                                decoding="async"
                                className="w-40 h-40 object-cover rounded-xl mb-3 shrink-0"
                              />
                            ) : null
                          )}
                          <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                            {FEED_EMOJIS.map((emoji) => {
                              const active = (feedReactions[post.id] || []).includes(emoji);
                              return (
                                <button
                                  key={emoji}
                                  onClick={(e) => { e.stopPropagation(); toggleFeedReaction(post.id, emoji); }}
                                  className={`px-2.5 py-1 rounded-full text-sm cursor-pointer transition-colors border ${active ? "bg-sage-50 border-sage-200" : "border-gray-100 hover:bg-gray-50"}`}
                                >
                                  {emoji}
                                </button>
                              );
                            })}
                            <button
                              onClick={(e) => { e.stopPropagation(); setFeedSelectedPost(post); }}
                              className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              {(feedComments[post.id] || []).length} comment
                              {(feedComments[post.id] || []).length !== 1 ? "s" : ""}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Post detail panel */}
                    <div className="w-80 shrink-0 border-l border-gray-100 flex flex-col overflow-hidden">
                      {feedSelectedPost ? (
                        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              initials={feedSelectedPost.author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              color={feedSelectedPost.color}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800">{feedSelectedPost.author}</p>
                              <p className="text-xs text-gray-400">{feedSelectedPost.role} · {feedSelectedPost.time}</p>
                            </div>
                            <button
                              onClick={() => setFeedSelectedPost(null)}
                              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{feedSelectedPost.text}</p>
                          {feedSelectedPost.attachments?.map((att, i) =>
                            att.type === "image" ? (
                              <img key={i} src={att.src} alt={att.name || ""} loading="lazy" decoding="async" className="w-full max-h-44 object-cover rounded-xl" />
                            ) : null
                          )}
                          <div className="border-t border-gray-100 pt-3">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Reactions</p>
                            <div className="flex flex-wrap gap-1.5">
                              {FEED_EMOJIS.map((emoji) => {
                                const active = (feedReactions[feedSelectedPost.id] || []).includes(emoji);
                                return (
                                  <button
                                    key={emoji}
                                    onClick={() => toggleFeedReaction(feedSelectedPost.id, emoji)}
                                    className={`px-2.5 py-1 rounded-full text-sm cursor-pointer transition-colors border ${active ? "bg-[#eef4ef] border-[#b2d4bb]" : "border-gray-100 hover:bg-gray-50"}`}
                                  >
                                    {emoji}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div className="border-t border-gray-100 pt-3">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                              Comments · {(feedComments[feedSelectedPost.id] || []).length}
                            </p>
                            <div className="space-y-3">
                              {(feedComments[feedSelectedPost.id] || []).map((c, i) => (
                                <div key={i} className="flex gap-2">
                                  <Avatar initials="SM" color="#f29a8f" size="sm" />
                                  <div className="bg-[#eef4ef] rounded-2xl rounded-tl-sm px-3 py-2 flex-1">
                                    <p className="text-xs font-medium text-gray-700 mb-0.5">Sarah Mitchell</p>
                                    <p className="text-xs text-gray-600">{c}</p>
                                  </div>
                                </div>
                              ))}
                              {(feedComments[feedSelectedPost.id] || []).length === 0 && (
                                <p className="text-xs text-gray-400">No comments yet.</p>
                              )}
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Avatar initials="SM" color="#f29a8f" size="sm" />
                              <input
                                value={feedCommentInputs[feedSelectedPost.id] || ""}
                                onChange={(e) => setFeedCommentInputs({ ...feedCommentInputs, [feedSelectedPost.id]: e.target.value })}
                                onKeyDown={(e) => e.key === "Enter" && addFeedComment(feedSelectedPost.id)}
                                placeholder="Add a comment..."
                                className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[#4a7c59]"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
                          <MessageSquare className="w-8 h-8 text-gray-200" />
                          <p className="text-sm text-gray-400">Select a post to view details</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold font-heading text-gray-800">
                    {pageTitle[activeNavTab]}
                  </h1>
                </div>
                {activeNavTab !== "volunteer" &&
                  activeNavTab !== "billing" &&
                  activeNavTab !== "children" && (
                  <ChildTabStrip
                    activeChildId={activeChildId}
                    onSwitch={setActiveChildId}
                  />
                )}
              </div>
            </div>

            {/* Animated page content */}
            <div
              className={
                activeNavTab === "billing" || activeNavTab === "children"
                  ? "flex-1 min-h-0 overflow-hidden"
                  : "flex-1 overflow-y-auto"
              }
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeNavTab + activeChildId}
                  className={
                    activeNavTab === "billing" || activeNavTab === "children"
                      ? "flex flex-col flex-1 min-h-0 h-full"
                      : "px-6 py-5"
                  }
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                >
                  {activeNavTab === "children" && (
                    <ChildrenPage
                      activeChildId={activeChildId}
                      onSwitchChild={setActiveChildId}
                    />
                  )}

                  {activeNavTab === "billing" && (
                    <BillingPage
                      activeChildId={activeChildId}
                      paidInvoices={paidInvoices}
                      paymentPlan={paymentPlan}
                      onOpenCheckout={openCheckout}
                      onOpenInvoice={() => setBillingInvoiceSidebarOpen(true)}
                      homeschoolSelections={homeschoolSelections}
                      paidHomeschoolDetails={paidHomeschoolDetails}
                      onOpenHomeschoolPay={(childId) => openHomeschoolPay(childId)}
                    />
                  )}

                  {activeNavTab === "forms" && (
                    <FormsPage completions={completions} onOpen={setOpenModal} />
                  )}

                  {activeNavTab === "volunteer" && <VolunteerPage />}

                  {activeNavTab === "emergency-contacts" && (
                    <EmergencyContactsPage activeChildId={activeChildId} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {openModal === "contract-1" && (
          <ContractModal
            key="contract-1"
            contractId="1"
            sections={C1_SECTIONS}
            title="Program Description & Key Policies"
            sigs={activeSigs}
            onSign={handleSign}
            onClose={() => setOpenModal(null)}
          />
        )}
        {openModal === "contract-2" && (
          <ContractModal
            key="contract-2"
            contractId="2"
            sections={C2_SECTIONS}
            title="Community Agreement"
            sigs={activeSigs}
            onSign={handleSign}
            onClose={() => setOpenModal(null)}
          />
        )}
        {openModal === "health-form" && (
          <HealthFormModal
            key="health-form"
            sigs={activeSigs}
            onSign={handleSign}
            onClose={() => setOpenModal(null)}
            saved={healthFormSaved[activeChildId]}
            onSave={() =>
              setHealthFormSaved((p) => ({ ...p, [activeChildId]: true }))
            }
          />
        )}
        {openModal === "medication-plan" && (
          <MedicationPlanModal
            key="medication-plan"
            sigs={activeSigs}
            onSign={handleSign}
            onClose={() => setOpenModal(null)}
            meds={medications[activeChildId]}
            setMeds={(m) =>
              setMedications((p) => ({ ...p, [activeChildId]: m }))
            }
            saved={medicationSaved[activeChildId]}
            onSave={() =>
              setMedicationSaved((p) => ({ ...p, [activeChildId]: true }))
            }
          />
        )}
        {openModal === "immunization" && (
          <ImmunizationModal
            key="immunization"
            count={immunizationCount[activeChildId]}
            onUpload={() =>
              setImmunizationCount((p) => ({
                ...p,
                [activeChildId]: p[activeChildId] + 1,
              }))
            }
            onClose={() => setOpenModal(null)}
          />
        )}
        {openModal === "photo-release" && (
          <PhotoReleaseModal
            key="photo-release"
            sigs={activeSigs}
            onSign={handleSign}
            onClose={() => setOpenModal(null)}
            consent={photoConsent[activeChildId]}
            onConsentSave={(c) =>
              setPhotoConsent((p) => ({ ...p, [activeChildId]: c }))
            }
          />
        )}
        {openModal === "assumption-of-risk" && (
          <AssumptionOfRiskModal
            key="assumption-of-risk"
            sigs={activeSigs}
            onSign={handleSign}
            onClose={() => setOpenModal(null)}
          />
        )}
        {openModal === "authorized-pickup" && (
          <AuthorizedPickupModal
            key="authorized-pickup"
            sigs={activeSigs}
            onSign={handleSign}
            onClose={() => setOpenModal(null)}
            persons={pickupPersons[activeChildId]}
            setPersons={(p) =>
              setPickupPersons((prev) => ({ ...prev, [activeChildId]: p }))
            }
            saved={pickupSaved[activeChildId]}
            onSave={() =>
              setPickupSaved((p) => ({ ...p, [activeChildId]: true }))
            }
          />
        )}
        {openModal === "health-statement" && (
          <HealthStatementModal
            key="health-statement"
            sigs={activeSigs}
            onSign={handleSign}
            onClose={() => setOpenModal(null)}
            option={healthStatement[activeChildId]}
            onOptionSave={(o) =>
              setHealthStatement((p) => ({ ...p, [activeChildId]: o }))
            }
          />
        )}
        {openModal === "registration-fee" && (
          <RegistrationFeeModal
            key="registration-fee"
            onPay={() => {
              setFeePaid((p) => ({ ...p, [activeChildId]: true }));
              setOpenModal(null);
            }}
            onClose={() => setOpenModal(null)}
          />
        )}
        {billingInvoiceSidebarOpen && (
          <InvoiceSidebar
            key="invoice-sidebar"
            onClose={() => setBillingInvoiceSidebarOpen(false)}
          />
        )}
        {checkoutOpen && (
          <BillingCheckoutSidebar
            key="billing-checkout-sidebar"
            txIds={checkoutTxIds}
            initialPaymentPlan={paymentPlan}
            homeschoolSelections={homeschoolSelections}
            onClose={() => {
              setCheckoutOpen(false);
              setCheckoutTxIds([]);
            }}
            onConfirm={handleCheckoutConfirm}
            onOpenHomeschoolPay={() => openHomeschoolPay("jake", true)}
          />
        )}
        {homeschoolPayModal && (
          <HomeschoolDropInPaySidebar
            key="homeschool-pay-sidebar"
            childName={billingChildNames[homeschoolPayModal.childId]}
            weeks={homeschoolPayModal.weeks}
            selections={homeschoolSelections}
            onToggleDay={toggleHomeschoolDay}
            onClose={() => setHomeschoolPayModal(null)}
            onConfirm={handleHomeschoolPayConfirm}
            selectionOnly={homeschoolPayModal.fromCheckout}
          />
        )}
        {calendarSidebarEvent && (
          <EventSidebar
            key="event-sidebar"
            event={calendarSidebarEvent}
            onClose={() => setCalendarSidebarEvent(null)}
          />
        )}
      </AnimatePresence>

      {/* Autoplay tour cursor */}
      {cursorVisible && (
        <motion.div
          className="pointer-events-none absolute z-[100] rounded-full"
          style={{
            width: 18,
            height: 18,
            top: 0,
            left: 0,
            backgroundColor: "rgba(74,124,89,0.85)",
            boxShadow: "0 0 0 4px rgba(74,124,89,0.2)",
          }}
          animate={{
            x: cursorPos.x - 9,
            y: cursorPos.y - 9,
            scale: cursorClicking ? [1, 1.6, 1] : 1,
          }}
          transition={{
            x: { duration: TOUR_MOVE_MS / 1000, ease: [0.4, 0, 0.2, 1] },
            y: { duration: TOUR_MOVE_MS / 1000, ease: [0.4, 0, 0.2, 1] },
            scale: { duration: 0.35 },
          }}
          initial={false}
        />
      )}
    </div>
  );
}
