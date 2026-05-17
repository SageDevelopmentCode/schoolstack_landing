"use client";

import { useState, useRef, useEffect, useCallback, useMemo, createContext, useContext } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ParentDashboardDemo from "./ParentDashboardDemo";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  ClipboardList,
  DollarSign,
  GraduationCap,
  CreditCard,
  Mail,
  BookOpen,
  Megaphone,
  MessageSquare,
  CalendarDays,
  School,
  ChevronRight,
  BarChart2,
  PanelLeftOpen,
  PanelLeftClose,
  Search,
  Send,
  X,
  LayoutGrid,
  Table,
  GitBranch,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Sun,
  Moon,
  Zap,
  UserCheck,
  Plus,
  Layers,
  Loader2,
  ArrowRight,
  PhoneCall,
  Star,
  Timer,
} from "lucide-react";

// ─── Backdrop context — lets page sub-components show a full-demo backdrop ────
const BackdropContext = createContext<{
  openBackdrop: (onClose: () => void) => void;
  closeBackdrop: () => void;
}>({ openBackdrop: () => {}, closeBackdrop: () => {} });

// ─── Design tokens (hardcoded — no CSS vars, works outside ThemeProvider) ─────
const C_DARK = {
  bg: "#0A0E1A",
  surface: "#111827",
  elevated: "#1F2937",
  border: "#2D3748",
  borderStrong: "#4B5563",
  accent: "#5E7C68",
  accentBright: "#6E9478",
  accentLight: "rgba(94, 124, 104, 0.15)",
  accentGlow: "rgba(94, 124, 104, 0.15)",
  accentMid: "#BFD8C0",
  accentDark: "#4A6354",
  textPrimary: "#F5F5F5",
  textSecondary: "#A3A3A3",
  textTertiary: "#525252",
  textQuaternary: "#404040",
  success: "#22C55E",
  successBg: "rgba(34, 197, 94, 0.08)",
  successBorder: "rgba(34, 197, 94, 0.25)",
  warning: "#F59E0B",
  warningBg: "rgba(245, 158, 11, 0.08)",
  warningBorder: "rgba(245, 158, 11, 0.25)",
  error: "#EF4444",
  errorBg: "rgba(239, 68, 68, 0.08)",
  errorBorder: "rgba(239, 68, 68, 0.25)",
  info: "#38BDF8",
  infoBg: "rgba(56, 189, 248, 0.08)",
  infoBorder: "rgba(56, 189, 248, 0.25)",
  purple: "#8B5CF6",
  purpleBg: "rgba(139, 92, 246, 0.08)",
  purpleBorder: "rgba(139, 92, 246, 0.25)",
  shadowCard: "0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.4)",
  shadowMedium: "0 4px 16px rgba(0,0,0,0.5)",
  r: { sm: "6px", md: "8px", lg: "12px", xl: "16px", full: "9999px" },
};

const C_LIGHT = {
  bg: "#FFFFFF",
  surface: "#FFFFFF",
  elevated: "#F4F6F9",
  border: "#EEF2F6",
  borderStrong: "#D4DBE8",
  accent: "#5E7C68",
  accentBright: "#4A6354",
  accentLight: "rgba(94, 124, 104, 0.10)",
  accentGlow: "rgba(94, 124, 104, 0.10)",
  accentMid: "#4A6354",
  accentDark: "#3A5244",
  textPrimary: "#111C16",
  textSecondary: "#3D5448",
  textTertiary: "#6B8478",
  textQuaternary: "#94ADA4",
  success: "#16A34A",
  successBg: "rgba(22, 163, 74, 0.08)",
  successBorder: "rgba(22, 163, 74, 0.25)",
  warning: "#D97706",
  warningBg: "rgba(217, 119, 6, 0.08)",
  warningBorder: "rgba(217, 119, 6, 0.25)",
  error: "#DC2626",
  errorBg: "rgba(220, 38, 38, 0.08)",
  errorBorder: "rgba(220, 38, 38, 0.25)",
  info: "#0284C7",
  infoBg: "rgba(2, 132, 199, 0.08)",
  infoBorder: "rgba(2, 132, 199, 0.25)",
  purple: "#7C3AED",
  purpleBg: "rgba(124, 58, 237, 0.08)",
  purpleBorder: "rgba(124, 58, 237, 0.25)",
  shadowCard: "0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMedium: "0 4px 16px rgba(0,0,0,0.08)",
  r: { sm: "6px", md: "8px", lg: "12px", xl: "16px", full: "9999px" },
};

// mutable — set by AdminDashboardDemo before each render so all sub-components pick it up
let C = C_DARK;

const TOUR_MOVE_MS = 950;
const TOUR_RESUME_MS = 1500;

// ─── Demo data ─────────────────────────────────────────────────────────────────

const DEMO_MONTHLY_REVENUE = [
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

const DEMO_ACTIVITY = [
  {
    id: "ev1",
    type: "application",
    text: "New application from Emma R.",
    time: "2m ago",
    color: "purple",
  },
  {
    id: "ev2",
    type: "payment",
    text: "Payment received — $1,800 tuition",
    time: "15m ago",
    color: "success",
  },
  {
    id: "ev3",
    type: "lead",
    text: "New waitlist signup — Noah Foster",
    time: "1h ago",
    color: "info",
  },
  {
    id: "ev4",
    type: "approved",
    text: "Application approved — Isabelle C.",
    time: "3h ago",
    color: "success",
  },
  {
    id: "ev5",
    type: "payment",
    text: "Payment received — $900 summer",
    time: "4h ago",
    color: "success",
  },
  {
    id: "ev6",
    type: "lead",
    text: "Contact form — Brian Thornton",
    time: "6h ago",
    color: "info",
  },
  {
    id: "ev7",
    type: "tour",
    text: "Tour scheduled — Park family",
    time: "1d ago",
    color: "warning",
  },
  {
    id: "ev8",
    type: "enrolled",
    text: "Enrolled — Tyler W. (both programs)",
    time: "2d ago",
    color: "success",
  },
];

const DEMO_EVENTS = [
  {
    id: "c1",
    title: "Summer Program Orientation",
    date: "2026-05-20",
    type: "event",
  },
  {
    id: "c2",
    title: "Q2 Parent Newsletter Deadline",
    date: "2026-04-15",
    type: "deadline",
  },
  {
    id: "c3",
    title: "Staff Planning Meeting",
    date: "2026-04-11",
    type: "internal",
  },
  {
    id: "c4",
    title: "School Year Enrollment Closes",
    date: "2026-04-30",
    type: "deadline",
  },
  {
    id: "c5",
    title: "Campus Family Open Day",
    date: "2026-04-18",
    type: "event",
  },
];

const FUNNEL_STAGES = [
  { label: "Leads", count: 37, color: C.accent },
  { label: "Applied", count: 22, color: C.accentBright },
  { label: "In Review", count: 8, color: C.info },
  { label: "Enrolling", count: 5, color: C.warning },
  { label: "Enrolled", count: 24, color: C.success },
];

const DEMO_LEADS = [
  {
    id: "l1",
    type: "waitlist",
    name: "Diana Foster",
    email: "diana@email.com",
    phone: "(512) 555-0142",
    childName: "Noah Foster",
    childAge: 5,
    status: "new",
    tags: ["Summer 2026"],
    date: "Apr 7",
    message: null,
    flowId: "flow-2",
  },
  {
    id: "l2",
    type: "contact",
    name: "Robert Kim",
    email: "rkim@gmail.com",
    phone: "(737) 555-0218",
    childName: null,
    childAge: null,
    status: "contacted",
    tags: ["School Year", "Financial Aid"],
    date: "Apr 1",
    message: "Interested in fall enrollment for my daughter in 3rd grade.",
    flowId: "flow-1",
  },
  {
    id: "l3",
    type: "waitlist",
    name: "Priya Patel",
    email: "ppatel@email.com",
    phone: "(512) 555-0391",
    childName: "Raj Patel",
    childAge: 7,
    status: "emailed",
    tags: ["School Year"],
    date: "Mar 20",
    message: null,
    flowId: "flow-1",
  },
  {
    id: "l4",
    type: "contact",
    name: "Mark Sullivan",
    email: "msullivan@email.com",
    phone: "(737) 555-0477",
    childName: null,
    childAge: null,
    status: "new",
    tags: ["Summer 2026"],
    date: "Apr 3",
    message: "Looking for summer options for twin boys, ages 7.",
    flowId: "flow-2",
  },
  {
    id: "l5",
    type: "waitlist",
    name: "Claire Beaumont",
    email: "claire.b@email.com",
    phone: "(512) 555-0563",
    childName: "Lily Beaumont",
    childAge: 6,
    status: "application_sent",
    tags: ["School Year"],
    date: "Mar 15",
    message: null,
    flowId: "flow-1",
  },
  {
    id: "l6",
    type: "waitlist",
    name: "Jerome Watkins",
    email: "jwatkins@email.com",
    phone: "(737) 555-0649",
    childName: "Tyler Watkins",
    childAge: 9,
    status: "enrolled",
    tags: ["Both"],
    date: "Feb 10",
    message: null,
    flowId: "flow-1",
  },
  {
    id: "l7",
    type: "contact",
    name: "Sandra Cho",
    email: "sandcho@email.com",
    phone: "(512) 555-0735",
    childName: null,
    childAge: null,
    status: "new",
    tags: [],
    date: "Apr 5",
    message: "Heard about your school from a friend. What are your rates?",
    flowId: "flow-3",
  },
  {
    id: "l8",
    type: "waitlist",
    name: "Luis Mendez",
    email: "lmendez@email.com",
    phone: "(737) 555-0821",
    childName: "Sofia Mendez",
    childAge: 8,
    status: "contacted",
    tags: ["School Year"],
    date: "Mar 25",
    message: null,
    flowId: "flow-1",
  },
];

const STATUS_COLORS: Record<
  string,
  { bg: string; border: string; text: string; label: string }
> = {
  new: { bg: C.infoBg, border: C.infoBorder, text: C.info, label: "New" },
  contacted: {
    bg: C.accentLight,
    border: "rgba(94,124,104,0.3)",
    text: C.accent,
    label: "Contacted",
  },
  emailed: {
    bg: C.accentLight,
    border: "rgba(94,124,104,0.3)",
    text: C.accent,
    label: "Emailed",
  },
  application_sent: {
    bg: C.purpleBg,
    border: C.purpleBorder,
    text: C.purple,
    label: "App Sent",
  },
  enrolled: {
    bg: C.successBg,
    border: C.successBorder,
    text: C.success,
    label: "Enrolled",
  },
  in_progress: {
    bg: C.warningBg,
    border: C.warningBorder,
    text: C.warning,
    label: "In Progress",
  },
  in_review: {
    bg: C.infoBg,
    border: C.infoBorder,
    text: C.info,
    label: "In Review",
  },
  enrolling: {
    bg: C.purpleBg,
    border: C.purpleBorder,
    text: C.purple,
    label: "Enrolling",
  },
};

const PROGRAM_LABELS: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  summer_26: { label: "Summer 2026", bg: C.warningBg, text: C.warning },
  school_year_26_27: { label: "School Year", bg: C.infoBg, text: C.info },
  both: { label: "Both Programs", bg: C.purpleBg, text: C.purple },
  homeschool_drop_in: {
    label: "Homeschool",
    bg: C.accentLight,
    text: C.accent,
  },
};

const DEMO_APPLICATIONS = [
  {
    id: "a1",
    childName: "Emma Richardson",
    preferredName: null,
    age: 7,
    grade: "2nd",
    program: "school_year_26_27",
    parent: "Sarah Richardson",
    email: "sarah.r@email.com",
    status: "enrolled",
    approved: true,
    submitted: "Nov 14, 2025",
  },
  {
    id: "a2",
    childName: "Marcus Park",
    preferredName: "Marc",
    age: 8,
    grade: "3rd",
    program: "both",
    parent: "Jason Park",
    email: "jpark@email.com",
    status: "in_review",
    approved: false,
    submitted: "Mar 30, 2026",
  },
  {
    id: "a3",
    childName: "Sofia Mendez",
    preferredName: null,
    age: 8,
    grade: "3rd",
    program: "school_year_26_27",
    parent: "Luis Mendez",
    email: "lmendez@email.com",
    status: "in_review",
    approved: false,
    submitted: "Apr 1, 2026",
  },
  {
    id: "a4",
    childName: "Liam Torres",
    preferredName: null,
    age: 9,
    grade: "4th",
    program: "both",
    parent: "Miguel Torres",
    email: "mig.t@email.com",
    status: "enrolled",
    approved: true,
    submitted: "Dec 3, 2025",
  },
  {
    id: "a5",
    childName: "Isabelle Clarke",
    preferredName: "Izzy",
    age: 11,
    grade: "6th",
    program: "school_year_26_27",
    parent: "Stephanie Clarke",
    email: "sclarke@email.com",
    status: "enrolling",
    approved: true,
    submitted: "Mar 18, 2026",
  },
  {
    id: "a6",
    childName: "Tyler Watkins",
    preferredName: null,
    age: 9,
    grade: "4th",
    program: "both",
    parent: "Jerome Watkins",
    email: "jwatkins@email.com",
    status: "enrolled",
    approved: true,
    submitted: "Dec 20, 2025",
  },
  {
    id: "a7",
    childName: "Grace Hammond",
    preferredName: null,
    age: 7,
    grade: "2nd",
    program: "school_year_26_27",
    parent: "Alicia Hammond",
    email: "ahammond@email.com",
    status: "in_review",
    approved: false,
    submitted: "Apr 2, 2026",
  },
  {
    id: "a8",
    childName: "Chidera Okonkwo",
    preferredName: "Chi",
    age: 8,
    grade: "3rd",
    program: "both",
    parent: "Kevin Okonkwo",
    email: "kokonkwo@email.com",
    status: "in_progress",
    approved: false,
    submitted: "Apr 4, 2026",
  },
  {
    id: "a9",
    childName: "Kai Simmons",
    preferredName: null,
    age: 11,
    grade: "6th",
    program: "school_year_26_27",
    parent: "Rachel Simmons",
    email: "rsimmons@email.com",
    status: "enrolling",
    approved: true,
    submitted: "Mar 22, 2026",
  },
  {
    id: "a10",
    childName: "Noah Foster",
    preferredName: null,
    age: 5,
    grade: "K",
    program: "summer_26",
    parent: "Diana Foster",
    email: "diana@email.com",
    status: "enrolled",
    approved: true,
    submitted: "Jan 15, 2026",
  },
];

// ─── Phase 2 demo data ────────────────────────────────────────────────────────

type DemoParent = {
  id: string;
  name: string;
  initials: string;
  color: string;
  g1Phone: string;
  g1WorkPhone: string;
  g1Preferred: string;
  g1LivesWith: boolean;
  g1Custody: boolean;
  g2Name: string | null;
  g2Relationship: string | null;
  g2Email: string | null;
  g2Phone: string | null;
  children: { name: string; dob: string }[];
  applications: {
    childName: string;
    program: string;
    status: string;
    approved: boolean;
    submitted: string;
  }[];
};

const DEMO_PARENTS: DemoParent[] = [
  {
    id: "p1",
    name: "Sarah Richardson",
    initials: "SR",
    color: "#5E7C68",
    g1Phone: "(512) 555-0101",
    g1WorkPhone: "(512) 555-0102",
    g1Preferred: "Cell",
    g1LivesWith: true,
    g1Custody: true,
    g2Name: "Tom Richardson",
    g2Relationship: "Father",
    g2Email: "tom.r@email.com",
    g2Phone: "(512) 555-0103",
    children: [{ name: "Emma Richardson", dob: "Mar 12, 2017" }],
    applications: [
      {
        childName: "Emma Richardson",
        program: "school_year_26_27",
        status: "enrolled",
        approved: true,
        submitted: "Nov 14, 2025",
      },
    ],
  },
  {
    id: "p2",
    name: "Miguel Torres",
    initials: "MT",
    color: "#38BDF8",
    g1Phone: "(737) 555-0204",
    g1WorkPhone: "(737) 555-0205",
    g1Preferred: "Cell",
    g1LivesWith: true,
    g1Custody: true,
    g2Name: "Ana Torres",
    g2Relationship: "Mother",
    g2Email: "ana.t@email.com",
    g2Phone: "(737) 555-0206",
    children: [{ name: "Liam Torres", dob: "Jun 5, 2015" }],
    applications: [
      {
        childName: "Liam Torres",
        program: "both",
        status: "enrolled",
        approved: true,
        submitted: "Dec 3, 2025",
      },
    ],
  },
  {
    id: "p3",
    name: "Diana Foster",
    initials: "DF",
    color: "#F59E0B",
    g1Phone: "(512) 555-0142",
    g1WorkPhone: "",
    g1Preferred: "Cell",
    g1LivesWith: true,
    g1Custody: true,
    g2Name: null,
    g2Relationship: null,
    g2Email: null,
    g2Phone: null,
    children: [{ name: "Noah Foster", dob: "Sep 22, 2019" }],
    applications: [
      {
        childName: "Noah Foster",
        program: "summer_26",
        status: "enrolled",
        approved: true,
        submitted: "Jan 15, 2026",
      },
    ],
  },
  {
    id: "p4",
    name: "Stephanie Clarke",
    initials: "SC",
    color: "#8B5CF6",
    g1Phone: "(512) 555-0317",
    g1WorkPhone: "(512) 555-0318",
    g1Preferred: "Email",
    g1LivesWith: false,
    g1Custody: true,
    g2Name: "Derek Clarke",
    g2Relationship: "Father",
    g2Email: "derek.c@email.com",
    g2Phone: "(512) 555-0319",
    children: [{ name: "Isabelle Clarke", dob: "Jan 30, 2013" }],
    applications: [
      {
        childName: "Isabelle Clarke",
        program: "school_year_26_27",
        status: "enrolling",
        approved: true,
        submitted: "Mar 18, 2026",
      },
    ],
  },
  {
    id: "p5",
    name: "Kevin Okonkwo",
    initials: "KO",
    color: "#22C55E",
    g1Phone: "(737) 555-0609",
    g1WorkPhone: "(737) 555-0610",
    g1Preferred: "Work",
    g1LivesWith: true,
    g1Custody: true,
    g2Name: "Adaeze Okonkwo",
    g2Relationship: "Mother",
    g2Email: "adaeze.o@email.com",
    g2Phone: "(737) 555-0611",
    children: [{ name: "Chidera Okonkwo", dob: "Nov 8, 2016" }],
    applications: [
      {
        childName: "Chidera Okonkwo",
        program: "both",
        status: "in_progress",
        approved: false,
        submitted: "Apr 4, 2026",
      },
    ],
  },
  {
    id: "p6",
    name: "Rachel Simmons",
    initials: "RS",
    color: "#EF4444",
    g1Phone: "(512) 555-0483",
    g1WorkPhone: "",
    g1Preferred: "Cell",
    g1LivesWith: true,
    g1Custody: true,
    g2Name: null,
    g2Relationship: null,
    g2Email: null,
    g2Phone: null,
    children: [
      { name: "Kai Simmons", dob: "Feb 14, 2013" },
      { name: "Jade Simmons", dob: "Aug 3, 2016" },
    ],
    applications: [
      {
        childName: "Kai Simmons",
        program: "school_year_26_27",
        status: "enrolling",
        approved: true,
        submitted: "Mar 22, 2026",
      },
      {
        childName: "Jade Simmons",
        program: "summer_26",
        status: "in_review",
        approved: false,
        submitted: "Apr 1, 2026",
      },
    ],
  },
  {
    id: "p7",
    name: "David Webb",
    initials: "DW",
    color: "#F97316",
    g1Phone: "(512) 555-0721",
    g1WorkPhone: "(512) 555-0722",
    g1Preferred: "Cell",
    g1LivesWith: true,
    g1Custody: true,
    g2Name: "Monica Webb",
    g2Relationship: "Mother",
    g2Email: "monica.w@email.com",
    g2Phone: "(512) 555-0723",
    children: [{ name: "Marcus Webb", dob: "Jul 18, 2014" }],
    applications: [
      {
        childName: "Marcus Webb",
        program: "school_year_26_27",
        status: "enrolled",
        approved: true,
        submitted: "Feb 8, 2026",
      },
    ],
  },
  {
    id: "p8",
    name: "Yuki Nakamura",
    initials: "YN",
    color: "#06B6D4",
    g1Phone: "(737) 555-0831",
    g1WorkPhone: "(737) 555-0832",
    g1Preferred: "Email",
    g1LivesWith: true,
    g1Custody: true,
    g2Name: "Kenji Nakamura",
    g2Relationship: "Father",
    g2Email: "kenji.n@email.com",
    g2Phone: "(737) 555-0833",
    children: [{ name: "Lily Nakamura", dob: "Oct 3, 2017" }],
    applications: [
      {
        childName: "Lily Nakamura",
        program: "both",
        status: "enrolled",
        approved: true,
        submitted: "Jan 27, 2026",
      },
    ],
  },
  {
    id: "p9",
    name: "Carmen Rivera",
    initials: "CR",
    color: "#D946EF",
    g1Phone: "(512) 555-0914",
    g1WorkPhone: "",
    g1Preferred: "Cell",
    g1LivesWith: true,
    g1Custody: true,
    g2Name: null,
    g2Relationship: null,
    g2Email: null,
    g2Phone: null,
    children: [{ name: "Jordan Rivera", dob: "Mar 5, 2020" }],
    applications: [
      {
        childName: "Jordan Rivera",
        program: "summer_26",
        status: "in_progress",
        approved: false,
        submitted: "Apr 10, 2026",
      },
    ],
  },
];

type DemoStudent = {
  id: string;
  name: string;
  initials: string;
  color: string;
  grade: string;
  dob: string;
  parent: string;
  program: string;
  hasAllergies: boolean;
  hasMedical: boolean;
  hasEmergencyMeds: boolean;
  needsAide: boolean;
  allergies: string;
  medicalConditions: string;
  emergencyMeds: string;
  aideDetails: string;
  learningStyle: string;
  strengths: string;
  challenges: string;
  regulationStrategies: string;
  specialInterests: string;
  medications: {
    name: string;
    type: "daily" | "emergency";
    dosage: string;
    physician: string;
  }[];
  authorizedPickup: { name: string; relationship: string; phone: string }[];
};

const DEMO_STUDENTS_P2: DemoStudent[] = [
  {
    id: "st1",
    name: "Emma Richardson",
    initials: "ER",
    color: "#5E7C68",
    grade: "2nd",
    dob: "Mar 12, 2017",
    parent: "Sarah Richardson",
    program: "school_year_26_27",
    hasAllergies: false,
    hasMedical: false,
    hasEmergencyMeds: false,
    needsAide: false,
    allergies: "",
    medicalConditions: "",
    emergencyMeds: "",
    aideDetails: "",
    learningStyle:
      "Visual and kinesthetic — learns best through hands-on projects and diagrams.",
    strengths: "Creative writing, art, collaborative group work.",
    challenges:
      "Transitions between activities; benefits from 5-minute warnings.",
    regulationStrategies:
      "Deep breathing exercises, quiet corner with fidget tools.",
    specialInterests: "Dinosaurs, painting, building with blocks.",
    medications: [],
    authorizedPickup: [
      {
        name: "Tom Richardson",
        relationship: "Father",
        phone: "(512) 555-0103",
      },
    ],
  },
  {
    id: "st2",
    name: "Liam Torres",
    initials: "LT",
    color: "#38BDF8",
    grade: "4th",
    dob: "Jun 5, 2015",
    parent: "Miguel Torres",
    program: "both",
    hasAllergies: true,
    hasMedical: false,
    hasEmergencyMeds: false,
    needsAide: false,
    allergies:
      "Tree nuts (peanuts OK). Carries EpiPen, kept in classroom emergency kit.",
    medicalConditions: "",
    emergencyMeds: "",
    aideDetails: "",
    learningStyle:
      "Auditory learner — benefits from verbal instructions and read-alouds.",
    strengths: "Math, debate, leadership in group settings.",
    challenges:
      "Sitting still for extended periods; movement breaks help significantly.",
    regulationStrategies:
      "Scheduled movement breaks every 45 minutes, fidget band on chair.",
    specialInterests: "Soccer, robotics, cooking.",
    medications: [],
    authorizedPickup: [
      { name: "Ana Torres", relationship: "Mother", phone: "(737) 555-0206" },
      {
        name: "Grandma Rosa",
        relationship: "Grandmother",
        phone: "(737) 555-0299",
      },
    ],
  },
  {
    id: "st3",
    name: "Ava Chen",
    initials: "AC",
    color: "#EC4899",
    grade: "1st",
    dob: "May 20, 2018",
    parent: "Jennifer Chen",
    program: "summer_26",
    hasAllergies: true,
    hasMedical: true,
    hasEmergencyMeds: true,
    needsAide: false,
    allergies: "Dairy and eggs. Must avoid all products containing these.",
    medicalConditions:
      "Mild asthma — managed with daily inhaler. No restrictions on outdoor activities.",
    emergencyMeds:
      "Albuterol inhaler. Administer if wheezing or difficulty breathing. Call parent immediately.",
    aideDetails: "",
    learningStyle:
      "Visual learner — loves charts, color-coding, and illustrated books.",
    strengths: "Reading comprehension, music, empathy toward peers.",
    challenges:
      "Anxiety in loud/crowded environments; quiet space available as needed.",
    regulationStrategies:
      "Noise-canceling headphones available, sensory corner access.",
    specialInterests: "Piano, butterflies, gardening.",
    medications: [
      {
        name: "Albuterol (Rescue Inhaler)",
        type: "emergency",
        dosage: "2 puffs as needed",
        physician: "Dr. Lisa Park",
      },
      {
        name: "Flovent (Daily Controller)",
        type: "daily",
        dosage: "1 puff morning & evening",
        physician: "Dr. Lisa Park",
      },
    ],
    authorizedPickup: [
      { name: "David Chen", relationship: "Father", phone: "(512) 555-0221" },
    ],
  },
  {
    id: "st4",
    name: "Noah Foster",
    initials: "NF",
    color: "#F59E0B",
    grade: "K",
    dob: "Sep 22, 2019",
    parent: "Diana Foster",
    program: "summer_26",
    hasAllergies: false,
    hasMedical: false,
    hasEmergencyMeds: false,
    needsAide: true,
    allergies: "",
    medicalConditions: "",
    emergencyMeds: "",
    aideDetails:
      "Receiving support for social-emotional development and self-regulation. Works with Ms. Kim 1:1 for 30 min/day.",
    learningStyle:
      "Kinesthetic — learns through play-based and tactile activities.",
    strengths: "Imaginative play, spatial reasoning, kind toward animals.",
    challenges: "Peer conflict resolution; working on turn-taking and sharing.",
    regulationStrategies: "Emotion chart, calm-down corner, visual schedule.",
    specialInterests: "Trucks, dinosaurs, water play.",
    medications: [],
    authorizedPickup: [
      {
        name: "Grandpa Joe",
        relationship: "Grandfather",
        phone: "(512) 555-0155",
      },
    ],
  },
  {
    id: "st5",
    name: "Sophia Patel",
    initials: "SP",
    color: "#A78BFA",
    grade: "3rd",
    dob: "Dec 7, 2016",
    parent: "Priya Patel",
    program: "school_year_26_27",
    hasAllergies: false,
    hasMedical: false,
    hasEmergencyMeds: false,
    needsAide: false,
    allergies: "",
    medicalConditions: "",
    emergencyMeds: "",
    aideDetails: "",
    learningStyle:
      "Reading/writing learner — thrives with written instructions and journaling.",
    strengths: "Math, storytelling, independent research projects.",
    challenges:
      "Public speaking; building confidence in verbal sharing with group.",
    regulationStrategies: "Journaling, peer partner for group sharing.",
    specialInterests: "Astronomy, Indian classical dance, mystery novels.",
    medications: [],
    authorizedPickup: [
      { name: "Raj Patel", relationship: "Father", phone: "(512) 555-0392" },
    ],
  },
  {
    id: "st6",
    name: "Isabelle Clarke",
    initials: "IC",
    color: "#8B5CF6",
    grade: "6th",
    dob: "Jan 30, 2013",
    parent: "Stephanie Clarke",
    program: "school_year_26_27",
    hasAllergies: false,
    hasMedical: true,
    hasEmergencyMeds: false,
    needsAide: false,
    allergies: "",
    medicalConditions:
      "Type 1 Diabetes — self-monitors blood glucose. Has glucagon kit in office. Parents notified for readings below 70.",
    emergencyMeds: "",
    aideDetails: "",
    learningStyle: "Mixed — auditory for concepts, writing for processing.",
    strengths: "Leadership, debate, advanced math, organizing group projects.",
    challenges:
      'Perfectionism; can become frustrated when work isn\'t "perfect".',
    regulationStrategies: "Growth mindset check-ins, incremental goal setting.",
    specialInterests: "Law, debate club, competitive chess, baking.",
    medications: [
      {
        name: "Glucagon Emergency Kit",
        type: "emergency",
        dosage: "Per protocol",
        physician: "Dr. Maria Santos",
      },
    ],
    authorizedPickup: [
      { name: "Derek Clarke", relationship: "Father", phone: "(512) 555-0319" },
      { name: "Aunt Bev", relationship: "Aunt", phone: "(512) 555-0320" },
    ],
  },
  {
    id: "st7",
    name: "Tyler Watkins",
    initials: "TW",
    color: "#22C55E",
    grade: "4th",
    dob: "Apr 11, 2015",
    parent: "Jerome Watkins",
    program: "both",
    hasAllergies: false,
    hasMedical: false,
    hasEmergencyMeds: false,
    needsAide: false,
    allergies: "",
    medicalConditions: "",
    emergencyMeds: "",
    aideDetails: "",
    learningStyle:
      "Visual-spatial — thrives with maps, diagrams, and project-based learning.",
    strengths: "Science, hands-on experiments, helping younger students.",
    challenges:
      "Reading fluency; currently working with reading specialist twice a week.",
    regulationStrategies:
      "Movement breaks, choice in seating (standing desk available).",
    specialInterests: "Minecraft, basketball, cooking shows.",
    medications: [],
    authorizedPickup: [
      {
        name: "Keisha Watkins",
        relationship: "Mother",
        phone: "(737) 555-0650",
      },
    ],
  },
  {
    id: "st8",
    name: "Chidera Okonkwo",
    initials: "CO",
    color: "#F97316",
    grade: "3rd",
    dob: "Nov 8, 2016",
    parent: "Kevin Okonkwo",
    program: "both",
    hasAllergies: false,
    hasMedical: false,
    hasEmergencyMeds: false,
    needsAide: false,
    allergies: "",
    medicalConditions: "",
    emergencyMeds: "",
    aideDetails: "",
    learningStyle:
      "Social learner — learns best through discussion, peer collaboration, and teaching others.",
    strengths: "Verbal communication, storytelling, mathematics.",
    challenges:
      "Focus during independent quiet work; benefits from low-distraction seating.",
    regulationStrategies:
      "Preferential seating near teacher, short task chunking.",
    specialInterests: "African history, soccer, card games.",
    medications: [],
    authorizedPickup: [
      {
        name: "Adaeze Okonkwo",
        relationship: "Mother",
        phone: "(737) 555-0611",
      },
      { name: "Uncle Emeka", relationship: "Uncle", phone: "(737) 555-0612" },
    ],
  },
  {
    id: "st9",
    name: "Marcus Webb",
    initials: "MW",
    color: "#F97316",
    grade: "5th",
    dob: "Jul 18, 2014",
    parent: "David Webb",
    program: "school_year_26_27",
    hasAllergies: false,
    hasMedical: true,
    hasEmergencyMeds: false,
    needsAide: false,
    allergies: "",
    medicalConditions:
      "ADHD (combined type) — managed with daily medication and OT support. Participates in occupational therapy twice weekly.",
    emergencyMeds: "",
    aideDetails: "",
    learningStyle:
      "Kinesthetic and project-based — thrives with hands-on tasks, movement, and clear deadlines.",
    strengths: "Engineering challenges, logical problem-solving, robotics.",
    challenges:
      "Sustained attention on writing tasks; benefits from chunked assignments and frequent check-ins.",
    regulationStrategies:
      "Movement breaks every 30 minutes, fidget tools available, task checklist on desk.",
    specialInterests: "Lego Technic, coding, video game design.",
    medications: [
      {
        name: "Methylphenidate (Ritalin)",
        type: "daily",
        dosage: "10mg at 8 AM",
        physician: "Dr. Samuel Green",
      },
    ],
    authorizedPickup: [
      { name: "Monica Webb", relationship: "Mother", phone: "(512) 555-0723" },
      {
        name: "Grandma Ruth",
        relationship: "Grandmother",
        phone: "(512) 555-0799",
      },
    ],
  },
  {
    id: "st10",
    name: "Lily Nakamura",
    initials: "LN",
    color: "#06B6D4",
    grade: "2nd",
    dob: "Oct 3, 2017",
    parent: "Yuki Nakamura",
    program: "both",
    hasAllergies: true,
    hasMedical: false,
    hasEmergencyMeds: true,
    needsAide: false,
    allergies:
      "Severe bee/wasp sting allergy (anaphylaxis risk). EpiPen stored in the nurse's office and classroom emergency kit. Wear medical alert bracelet.",
    medicalConditions: "",
    emergencyMeds:
      "EpiPen Jr. — administer immediately if stung and showing systemic symptoms. Call 911, then parents.",
    aideDetails: "",
    learningStyle:
      "Visual and auditory — responds well to illustrated instructions and group discussion.",
    strengths:
      "Languages (fluent Japanese/English), creative writing, peer mediation.",
    challenges:
      "Occasional social anxiety in large groups; prefers structured group roles.",
    regulationStrategies: "Defined roles in group work, quiet break corner.",
    specialInterests: "Origami, marine biology, drawing manga.",
    medications: [
      {
        name: "EpiPen Jr.",
        type: "emergency",
        dosage: "0.15mg IM auto-injector",
        physician: "Dr. Ami Tanaka",
      },
    ],
    authorizedPickup: [
      {
        name: "Kenji Nakamura",
        relationship: "Father",
        phone: "(737) 555-0833",
      },
      { name: "Aunt Hana", relationship: "Aunt", phone: "(737) 555-0899" },
    ],
  },
  {
    id: "st11",
    name: "Jordan Rivera",
    initials: "JR",
    color: "#D946EF",
    grade: "K",
    dob: "Mar 5, 2020",
    parent: "Carmen Rivera",
    program: "summer_26",
    hasAllergies: false,
    hasMedical: false,
    hasEmergencyMeds: false,
    needsAide: false,
    allergies: "",
    medicalConditions: "",
    emergencyMeds: "",
    aideDetails: "",
    learningStyle:
      "Play-based and social — learns through structured imaginative play and peer interaction.",
    strengths: "Empathy, music, following classroom routines.",
    challenges:
      "Expressive language delays; currently enrolled in weekly speech therapy sessions.",
    regulationStrategies:
      "Visual schedule cards, picture-based communication supports.",
    specialInterests: "Trains, animals, singing.",
    medications: [],
    authorizedPickup: [
      {
        name: "Grandpa Luis",
        relationship: "Grandfather",
        phone: "(512) 555-0944",
      },
    ],
  },
  {
    id: "st12",
    name: "Priya Mehta",
    initials: "PM",
    color: "#84CC16",
    grade: "3rd",
    dob: "Jun 22, 2016",
    parent: "Anita Mehta",
    program: "school_year_26_27",
    hasAllergies: false,
    hasMedical: true,
    hasEmergencyMeds: false,
    needsAide: true,
    allergies: "",
    medicalConditions:
      "Low vision (visual acuity 20/200 in both eyes). Uses large-print materials, high-contrast displays, and magnification tools.",
    emergencyMeds: "",
    aideDetails:
      "Reading aide provides support during independent reading and standardized assessments. Seats at front of classroom, preferably nearest natural light.",
    learningStyle:
      "Auditory and tactile — benefits from verbal explanations, audiobooks, and hands-on manipulatives.",
    strengths: "Exceptional listening comprehension, mathematics, memory.",
    challenges:
      "Visual fatigue after extended screen time; scheduled screen breaks every 20 minutes.",
    regulationStrategies:
      "20-minute screen break rule, audiobook alternatives, tactile manipulatives.",
    specialInterests: "Podcasts, chess, spoken word poetry.",
    medications: [],
    authorizedPickup: [
      { name: "Anita Mehta", relationship: "Mother", phone: "(737) 555-1201" },
      { name: "Ravi Mehta", relationship: "Father", phone: "(737) 555-1202" },
    ],
  },
];

type ProgramTeacher = {
  id: string;
  name: string;
  initials: string;
  classroom: string;
  studentIds: string[];
};
type DemoProgram = { id: string; name: string; teachers: ProgramTeacher[] };

const DEMO_PROGRAMS_P2: DemoProgram[] = [
  {
    id: "summer_26",
    name: "Summer 2026",
    teachers: [
      {
        id: "t1",
        name: "Ms. Taylor Reyes",
        initials: "TR",
        classroom: "Room A (Pre-K – 2nd)",
        studentIds: ["st1", "st3", "st4", "st5"],
      },
      {
        id: "t2",
        name: "Mr. James Kim",
        initials: "JK",
        classroom: "Room B (3rd – 6th)",
        studentIds: ["st2", "st7", "st8"],
      },
    ],
  },
  {
    id: "school_year_26_27",
    name: "School Year 26–27",
    teachers: [
      {
        id: "t3",
        name: "Ms. Taylor Reyes",
        initials: "TR",
        classroom: "Primary (K – 2nd)",
        studentIds: ["st1", "st4"],
      },
      {
        id: "t4",
        name: "Ms. Nicole Park",
        initials: "NP",
        classroom: "Elementary (3rd – 4th)",
        studentIds: ["st2", "st5", "st7"],
      },
      {
        id: "t5",
        name: "Mr. David Osei",
        initials: "DO",
        classroom: "Middle (5th – 6th)",
        studentIds: ["st6", "st8"],
      },
    ],
  },
  {
    id: "homeschool_drop_in",
    name: "Homeschool Drop-In",
    teachers: [
      {
        id: "t6",
        name: "Ms. Carla Nguyen",
        initials: "CN",
        classroom: "Mixed Ages",
        studentIds: ["st3", "st5", "st7", "st8"],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────

type Message = {
  id: string;
  senderId: "admin" | "parent";
  text: string;
  time: string;
};
type Conversation = {
  id: string;
  name: string;
  initials: string;
  color: string;
  lastMsg: string;
  time: string;
  unread: number;
  messages: Message[];
};

const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    name: "Sarah Richardson",
    initials: "SR",
    color: "#5E7C68",
    lastMsg: "Emma did so well today!",
    time: "2m ago",
    unread: 2,
    messages: [
      {
        id: "m1",
        senderId: "parent",
        text: "Hi! Just wanted to check in on Emma's progress this week.",
        time: "9:02 AM",
      },
      {
        id: "m2",
        senderId: "admin",
        text: "Emma has been doing wonderfully! She's really engaged during reading time.",
        time: "9:15 AM",
      },
      {
        id: "m3",
        senderId: "parent",
        text: "That's so great to hear. She talks about school every evening.",
        time: "9:18 AM",
      },
      {
        id: "m4",
        senderId: "admin",
        text: "She's a joy to have. We'll send a full update in the newsletter Friday.",
        time: "9:22 AM",
      },
      {
        id: "m5",
        senderId: "parent",
        text: "Emma did so well today!",
        time: "10:45 AM",
      },
    ],
  },
  {
    id: "c2",
    name: "Miguel Torres",
    initials: "MT",
    color: "#38BDF8",
    lastMsg: "Question about the field trip form",
    time: "1h ago",
    unread: 1,
    messages: [
      {
        id: "m1",
        senderId: "parent",
        text: "Hello, I had a question about the upcoming field trip permission form.",
        time: "8:30 AM",
      },
      {
        id: "m2",
        senderId: "admin",
        text: "Hi Miguel! The form was emailed last Thursday. Let me resend it now.",
        time: "8:45 AM",
      },
      {
        id: "m3",
        senderId: "parent",
        text: "Question about the field trip form",
        time: "9:05 AM",
      },
    ],
  },
  {
    id: "c3",
    name: "Diana Foster",
    initials: "DF",
    color: "#F59E0B",
    lastMsg: "Thanks for the quick reply!",
    time: "3h ago",
    unread: 0,
    messages: [
      {
        id: "m1",
        senderId: "parent",
        text: "Is Noah's summer program orientation confirmed for May 20th?",
        time: "Yesterday",
      },
      {
        id: "m2",
        senderId: "admin",
        text: "Yes! Orientation is confirmed — May 20th at 9 AM in the main hall.",
        time: "Yesterday",
      },
      {
        id: "m3",
        senderId: "parent",
        text: "Thanks for the quick reply!",
        time: "Yesterday",
      },
    ],
  },
  {
    id: "c4",
    name: "Stephanie Clarke",
    initials: "SC",
    color: "#8B5CF6",
    lastMsg: "When does enrollment close?",
    time: "1d ago",
    unread: 0,
    messages: [
      {
        id: "m1",
        senderId: "parent",
        text: "Hi — when does enrollment close for school year 26–27?",
        time: "Apr 5",
      },
      {
        id: "m2",
        senderId: "admin",
        text: "Enrollment closes April 30th. Izzy's spot is already secured!",
        time: "Apr 5",
      },
      {
        id: "m3",
        senderId: "parent",
        text: "When does enrollment close?",
        time: "Apr 6",
      },
    ],
  },
  {
    id: "c5",
    name: "Jason Park",
    initials: "JP",
    color: "#22C55E",
    lastMsg: "Sounds good, see you then.",
    time: "2d ago",
    unread: 0,
    messages: [
      {
        id: "m1",
        senderId: "parent",
        text: "Can we schedule a tour for next week?",
        time: "Apr 3",
      },
      {
        id: "m2",
        senderId: "admin",
        text: "Absolutely! How does Tuesday at 10 AM work?",
        time: "Apr 3",
      },
      {
        id: "m3",
        senderId: "parent",
        text: "Sounds good, see you then.",
        time: "Apr 3",
      },
    ],
  },
];

// ─── Shared primitives ─────────────────────────────────────────────────────────

function Card({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: C.r.lg,
        boxShadow: C.shadowCard,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-widest mb-4"
      style={{ color: C.textTertiary }}
    >
      {children}
    </p>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? {
    bg: C.elevated,
    border: C.border,
    text: C.textTertiary,
    label: status,
  };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full"
      style={{
        backgroundColor: s.bg,
        border: `1px solid ${s.border}`,
        color: s.text,
      }}
    >
      {s.label}
    </span>
  );
}

function ProgramBadge({ program }: { program: string }) {
  const p = PROGRAM_LABELS[program] ?? {
    label: program,
    bg: C.elevated,
    text: C.textTertiary,
  };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full"
      style={{ backgroundColor: p.bg, color: p.text }}
    >
      {p.label}
    </span>
  );
}

// ─── Dashboard components ─────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  delta,
  deltaPositive,
  icon,
  delay = 0,
}: {
  title: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  icon?: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className="relative overflow-hidden"
      style={{
        backgroundColor: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: C.r.lg,
        padding: "14px",
        boxShadow: C.shadowCard,
      }}
    >
      {icon && (
        <div
          className="absolute top-3 right-3 w-6 h-6 rounded-md flex items-center justify-center"
          style={{ backgroundColor: C.accentGlow }}
        >
          <span style={{ color: C.accent }}>{icon}</span>
        </div>
      )}
      <p
        className="text-[10px] font-semibold uppercase tracking-wider mb-2"
        style={{ color: C.textTertiary }}
      >
        {title}
      </p>
      <p
        className="text-2xl font-bold tabular-nums tracking-tight"
        style={{ color: C.textPrimary }}
      >
        {value}
      </p>
      {delta && (
        <div className="flex items-center gap-1 mt-1.5">
          <span
            className="text-[11px] font-semibold"
            style={{ color: deltaPositive ? C.success : C.error }}
          >
            {deltaPositive ? "▲" : "▼"} {delta}
          </span>
        </div>
      )}
    </motion.div>
  );
}

function RevenueAreaChart() {
  const W = 480,
    H = 160;
  const PAD = { top: 12, right: 16, bottom: 28, left: 48 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const revData = DEMO_MONTHLY_REVENUE.map((m) => m.revenue);
  const expData = DEMO_MONTHLY_REVENUE.map((m) => m.expenses);
  const maxVal = Math.max(...revData, ...expData);
  const xStep = innerW / (DEMO_MONTHLY_REVENUE.length - 1);
  const toY = (v: number) => PAD.top + innerH - (v / maxVal) * innerH;
  const toX = (i: number) => PAD.left + i * xStep;
  const revPoints = revData.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const expPoints = expData.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const revPath = revData
    .map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`)
    .join(" ");
  const revArea = `${revPath} L${toX(revData.length - 1)},${PAD.top + innerH} L${PAD.left},${PAD.top + innerH} Z`;
  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      <defs>
        <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.accent} stopOpacity="0.3" />
          <stop offset="100%" stopColor={C.accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      {yTicks.map((tick, i) => (
        <g key={i}>
          <line
            x1={PAD.left}
            y1={toY(tick)}
            x2={PAD.left + innerW}
            y2={toY(tick)}
            stroke={C.border}
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <text
            x={PAD.left - 6}
            y={toY(tick) + 4}
            textAnchor="end"
            fontSize="9"
            fill={C.textTertiary}
          >
            {tick > 0 ? `$${Math.round(tick / 1000)}k` : ""}
          </text>
        </g>
      ))}
      <path d={revArea} fill="url(#adminRevGrad)" />
      <polyline
        points={expPoints}
        fill="none"
        stroke={C.border}
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <polyline
        points={revPoints}
        fill="none"
        stroke={C.accent}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {DEMO_MONTHLY_REVENUE.map((m, i) => (
        <text
          key={m.month}
          x={toX(i)}
          y={H - 6}
          textAnchor="middle"
          fontSize="9"
          fill={C.textTertiary}
        >
          {m.month}
        </text>
      ))}
    </svg>
  );
}

function ProgressRing({
  value,
  label,
  sublabel,
  color,
  delay = 0,
}: {
  value: number;
  label: string;
  sublabel?: string;
  color: string;
  delay?: number;
}) {
  const size = 56,
    strokeWidth = 5;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(value, 100) / 100);
  return (
    <div className="flex items-center gap-4">
      <div
        className="relative flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={C.border}
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, delay, ease: "easeOut" }}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-bold tabular-nums"
            style={{ fontSize: "11px", color: C.textPrimary }}
          >
            {value}%
          </span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
          {label}
        </p>
        {sublabel && (
          <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}

const DOT_COLORS: Record<string, string> = {
  purple: "#8B5CF6",
  success: "#22C55E",
  info: "#38BDF8",
  warning: "#F59E0B",
  danger: "#EF4444",
};

function ActivityFeed() {
  return (
    <Card style={{ padding: "20px" }}>
      <SectionLabel>Recent Activity</SectionLabel>
      <div
        className="relative pl-4"
        style={{ borderLeft: `2px solid ${C.border}` }}
      >
        {DEMO_ACTIVITY.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            className="relative flex items-start gap-3 mb-4 last:mb-0"
          >
            <span
              className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full flex-shrink-0"
              style={{
                backgroundColor: DOT_COLORS[event.color] ?? C.textTertiary,
              }}
            />
            <div className="flex-1 min-w-0">
              <p
                className="text-sm leading-snug"
                style={{ color: C.textSecondary }}
              >
                {event.text}
              </p>
            </div>
            <span
              className="text-[11px] flex-shrink-0"
              style={{ color: C.textTertiary }}
            >
              {event.time}
            </span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

function FunnelWidget() {
  const max = FUNNEL_STAGES[0].count;
  return (
    <Card style={{ padding: "20px" }}>
      <SectionLabel>Enrollment Pipeline</SectionLabel>
      <div className="space-y-3">
        {FUNNEL_STAGES.map((stage, i) => {
          const pct = Math.round((stage.count / max) * 100);
          return (
            <div key={stage.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: C.textTertiary }}>
                  {stage.label}
                </span>
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: C.textPrimary }}
                >
                  {stage.count}
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: C.border }}
              >
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.1,
                    ease: "easeOut",
                  }}
                  style={{ backgroundColor: stage.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function UpcomingEventsWidget() {
  const TYPE_COLORS: Record<string, string> = {
    event: C.accent,
    deadline: C.error,
    internal: C.textTertiary,
  };
  return (
    <Card style={{ padding: "20px" }}>
      <SectionLabel>Upcoming</SectionLabel>
      <div className="space-y-3">
        {DEMO_EVENTS.map((ev) => {
          const d = new Date(ev.date);
          const month = d
            .toLocaleString("default", { month: "short" })
            .toUpperCase();
          const day = d.getDate();
          return (
            <div key={ev.id} className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center"
                style={{
                  backgroundColor: C.elevated,
                  border: `1px solid ${C.border}`,
                }}
              >
                <span
                  style={{
                    fontSize: "8px",
                    color: C.textTertiary,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {month}
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    color: C.textPrimary,
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  {day}
                </span>
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p
                  className="text-sm font-medium leading-snug truncate"
                  style={{ color: C.textPrimary }}
                >
                  {ev.title}
                </p>
                <span
                  className="text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: TYPE_COLORS[ev.type] ?? C.textTertiary }}
                >
                  {ev.type}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Dashboard page ────────────────────────────────────────────────────────────

function DashboardPage() {
  const KPIS = [
    {
      title: "Revenue YTD",
      value: "$47,320",
      delta: "18% vs last year",
      pos: true,
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      title: "Enrolled",
      value: "24",
      delta: "+4 this cycle",
      pos: true,
      icon: <Users className="w-4 h-4" />,
    },
    {
      title: "Active Leads",
      value: "37",
      delta: "+12 this month",
      pos: true,
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      title: "In Review",
      value: "8",
      delta: "Applications",
      pos: false,
      icon: <ClipboardList className="w-4 h-4" />,
    },
    {
      title: "Avg Tuition",
      value: "$1,972/mo",
      delta: "+$140 vs Q3",
      pos: true,
      icon: <BarChart2 className="w-4 h-4" />,
    },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-xl font-semibold tracking-tight"
          style={{ color: C.textPrimary }}
        >
          Dashboard
        </h1>
        <p className="text-sm mt-0.5" style={{ color: C.textTertiary }}>
          Mud Kitchen School — Spring / Summer 2026
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {KPIS.map((kpi, i) => (
          <StatCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            delta={kpi.delta}
            deltaPositive={kpi.pos}
            icon={kpi.icon}
            delay={i * 0.05}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card style={{ padding: "20px" }}>
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>Revenue vs Expenses</SectionLabel>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-0.5 inline-block rounded"
                    style={{ backgroundColor: C.accent }}
                  />
                  <span style={{ color: C.textTertiary }}>Revenue</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-0.5 inline-block border-t border-dashed"
                    style={{ borderColor: C.border }}
                  />
                  <span style={{ color: C.textTertiary }}>Expenses</span>
                </span>
              </div>
            </div>
            <RevenueAreaChart />
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card style={{ padding: "20px" }}>
            <SectionLabel>Enrollment Capacity</SectionLabel>
            <div className="space-y-5">
              <ProgressRing
                value={90}
                label="Summer 2026"
                sublabel="18 / 20 enrolled"
                color={C.accent}
                delay={0.3}
              />
              <ProgressRing
                value={64}
                label="School Year 26–27"
                sublabel="14 / 22 enrolled"
                color={C.info}
                delay={0.4}
              />
              <div className="flex items-center gap-4 pt-1">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold tabular-nums"
                  style={{
                    border: `5px solid ${C.warning}`,
                    backgroundColor: C.warningBg,
                    color: C.warning,
                  }}
                >
                  31
                </div>
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: C.textPrimary }}
                  >
                    Waitlist
                  </p>
                  <p className="text-xs" style={{ color: C.textTertiary }}>
                    Families waiting
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ActivityFeed />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
        >
          <FunnelWidget />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <UpcomingEventsWidget />
        </motion.div>
      </div>
    </div>
  );
}

// ─── Admissions page ──────────────────────────────────────────────────────────

const LEAD_FILTERS = [
  { key: "all", label: "All", count: 37 },
  { key: "new", label: "New", count: 14 },
  { key: "contacted", label: "Contacted", count: 9 },
  { key: "application_sent", label: "App Sent", count: 6 },
  { key: "enrolled", label: "Enrolled", count: 6 },
  { key: "lost", label: "Lost", count: 2 },
];

const LEAD_TAGS = [
  "Summer 2026",
  "School Year",
  "Both",
  "Financial Aid",
  "Homeschool",
];

function LeadDetailPanel({
  lead,
  onClose,
}: {
  lead: (typeof DEMO_LEADS)[0];
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="absolute top-0 right-0 bottom-0 w-80 flex flex-col overflow-hidden"
      style={{
        backgroundColor: C.surface,
        borderLeft: `1px solid ${C.border}`,
        zIndex: 10,
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
          {lead.name}
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded"
          style={{ color: C.textTertiary }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: C.textTertiary }}
          >
            Contact
          </p>
          <p className="text-sm" style={{ color: C.textSecondary }}>
            {lead.email}
          </p>
          <p className="text-sm" style={{ color: C.textSecondary }}>
            {lead.phone}
          </p>
        </div>
        {lead.childName && (
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-2"
              style={{ color: C.textTertiary }}
            >
              Child
            </p>
            <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
              {lead.childName}
            </p>
            <p className="text-xs" style={{ color: C.textTertiary }}>
              Age {lead.childAge}
            </p>
          </div>
        )}
        {lead.message && (
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-2"
              style={{ color: C.textTertiary }}
            >
              Message
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: C.textSecondary }}
            >
              {lead.message}
            </p>
          </div>
        )}
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: C.textTertiary }}
          >
            Status
          </p>
          <StatusBadge status={lead.status} />
        </div>
        {lead.tags.length > 0 && (
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-2"
              style={{ color: C.textTertiary }}
            >
              Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {lead.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded-full"
                  style={{ backgroundColor: C.accentLight, color: C.accent }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: C.textTertiary }}
          >
            Admin Notes
          </p>
          <div
            className="rounded-lg p-3 text-sm"
            style={{
              backgroundColor: C.elevated,
              border: `1px solid ${C.border}`,
              color: C.textTertiary,
              fontStyle: "italic",
            }}
          >
            Add a note...
          </div>
        </div>
      </div>
      <div className="px-5 py-4" style={{ borderTop: `1px solid ${C.border}` }}>
        <button
          className="w-full py-2 text-sm font-semibold rounded-lg transition-colors"
          style={{ backgroundColor: C.accentLight, color: C.accent }}
        >
          Send Application Link
        </button>
      </div>
    </motion.div>
  );
}

const FLOW_FILTER_OPTIONS = [
  { id: "all", label: "All Forms" },
  { id: "flow-1", label: "Apply Now Form" },
  { id: "flow-2", label: "Summer Program Enrollment" },
  { id: "flow-3", label: "Waitlist Signup" },
];

function LeadsListTab() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeFlowFilter, setActiveFlowFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<
    (typeof DEMO_LEADS)[0] | null
  >(null);
  const { openBackdrop, closeBackdrop } = useContext(BackdropContext);
  useEffect(() => {
    if (selectedLead) openBackdrop(() => setSelectedLead(null));
    else closeBackdrop();
  }, [selectedLead]);

  const filtered = DEMO_LEADS.filter((l) => {
    const statusMatch = activeFilter === "all" || l.status === activeFilter;
    const flowMatch = activeFlowFilter === "all" || l.flowId === activeFlowFilter;
    return statusMatch && flowMatch;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Flow filter row */}
      <div
        className="flex items-center gap-2 px-6 py-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest flex-shrink-0" style={{ color: C.textTertiary }}>
          Form
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {FLOW_FILTER_OPTIONS.map((f) => {
            const isActive = activeFlowFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFlowFilter(f.id)}
                className="px-2.5 py-1 text-xs font-medium rounded-full transition-all"
                style={{
                  backgroundColor: isActive ? C.accent : C.elevated,
                  color: isActive ? "#fff" : C.textSecondary,
                  border: `1px solid ${isActive ? C.accent : C.border}`,
                }}
              >
                {f.label}
                {f.id !== "all" && (
                  <span className="ml-1 text-[10px] font-bold opacity-70">
                    {DEMO_LEADS.filter((l) => l.flowId === f.id).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status filters */}
      <div className="flex items-center gap-2 px-6 py-2.5 flex-wrap flex-shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
        {LEAD_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all"
            style={{
              backgroundColor: activeFilter === f.key ? C.accentLight : "transparent",
              color: activeFilter === f.key ? C.accent : C.textTertiary,
              border: `1px solid ${activeFilter === f.key ? C.accent : C.border}`,
            }}
          >
            {f.label}
            <span className="text-[10px] font-bold opacity-70">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {[
                  "Form",
                  "Name",
                  "Contact",
                  "Child",
                  "Message",
                  "Status",
                  "Tags",
                  "Date",
                ].map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: C.textTertiary }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedLead(lead)}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = C.elevated)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <td className="px-4 py-3 max-w-[140px]">
                    <p className="text-xs font-medium truncate" style={{ color: C.textPrimary }}>
                      {FLOW_FILTER_OPTIONS.find((f) => f.id === lead.flowId)?.label ?? "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: C.textPrimary }}>
                      {lead.name}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ color: C.textSecondary }}>{lead.email}</p>
                    <p className="text-xs" style={{ color: C.textTertiary }}>
                      {lead.phone}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {lead.childName ? (
                      <>
                        <p style={{ color: C.textSecondary }}>
                          {lead.childName}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: C.textTertiary }}
                        >
                          Age {lead.childAge}
                        </p>
                      </>
                    ) : (
                      <span style={{ color: C.textTertiary }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-[180px]">
                    <p
                      className="truncate text-xs"
                      style={{ color: C.textTertiary }}
                    >
                      {lead.message ?? "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {lead.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 text-[9px] font-medium rounded-full"
                          style={{
                            backgroundColor: C.accentLight,
                            color: C.accent,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: C.textTertiary }}
                  >
                    {lead.date}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <AnimatePresence>
          {selectedLead && (
            <LeadDetailPanel
              lead={selectedLead}
              onClose={() => setSelectedLead(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Enrollment Flow types & demo data ────────────────────────────────────────

type FlowFieldType = "text" | "email" | "phone" | "select" | "checkbox" | "date";

interface FlowField {
  id: string;
  label: string;
  type: FlowFieldType;
  required: boolean;
  options?: string[];
}

interface FlowStep {
  id: string;
  title: string;
  fields: FlowField[];
}

type FlowActionType = "email" | "sms" | "redirect" | "tag" | "notify_admin";

interface FlowAction {
  id: string;
  type: FlowActionType;
  config: Record<string, string>;
}

interface EnrollmentFlow {
  id: string;
  name: string;
  steps: FlowStep[];
  actions: FlowAction[];
  updatedAt: string;
}

const INITIAL_DEMO_FLOWS: EnrollmentFlow[] = [
  {
    id: "flow-1",
    name: "Apply Now Form",
    updatedAt: "May 12, 2026",
    steps: [
      {
        id: "s1",
        title: "Parent Info",
        fields: [
          { id: "f1", label: "First Name", type: "text", required: true },
          { id: "f2", label: "Last Name", type: "text", required: true },
          { id: "f3", label: "Email", type: "email", required: true },
          { id: "f4", label: "Phone", type: "phone", required: false },
        ],
      },
      {
        id: "s2",
        title: "Child Details",
        fields: [
          { id: "f5", label: "Child's Name", type: "text", required: true },
          { id: "f6", label: "Date of Birth", type: "date", required: true },
          { id: "f7", label: "Grade Level", type: "select", required: true, options: ["Pre-K", "K", "1st", "2nd", "3rd"] },
        ],
      },
      {
        id: "s3",
        title: "Program Selection",
        fields: [
          { id: "f8", label: "Preferred Program", type: "select", required: true, options: ["Full Day", "Half Day", "After Care"] },
          { id: "f9", label: "Preferred Start Date", type: "date", required: false },
          { id: "f10", label: "Financial Aid Needed", type: "checkbox", required: false },
        ],
      },
    ],
    actions: [
      { id: "a1", type: "email", config: { to: "{{parent_email}}", subject: "Application Received!", body: "Thank you for applying. We'll be in touch shortly." } },
      { id: "a2", type: "notify_admin", config: {} },
    ],
  },
  {
    id: "flow-2",
    name: "Summer Program Enrollment",
    updatedAt: "May 8, 2026",
    steps: [
      {
        id: "s4",
        title: "Contact Info",
        fields: [
          { id: "f11", label: "Parent Name", type: "text", required: true },
          { id: "f12", label: "Email", type: "email", required: true },
          { id: "f13", label: "Phone", type: "phone", required: true },
        ],
      },
      {
        id: "s5",
        title: "Child Info",
        fields: [
          { id: "f14", label: "Child's Name", type: "text", required: true },
          { id: "f15", label: "Age", type: "text", required: true },
        ],
      },
    ],
    actions: [
      { id: "a3", type: "email", config: { to: "{{parent_email}}", subject: "Summer Program — You're on the list!", body: "" } },
      { id: "a4", type: "sms", config: { message: "Hi! You've successfully signed up for our summer program." } },
      { id: "a5", type: "redirect", config: { url: "https://schoolstack.io/thank-you" } },
    ],
  },
  {
    id: "flow-3",
    name: "Waitlist Signup",
    updatedAt: "Apr 29, 2026",
    steps: [
      {
        id: "s6",
        title: "Family Info",
        fields: [
          { id: "f16", label: "Parent Name", type: "text", required: true },
          { id: "f17", label: "Email", type: "email", required: true },
          { id: "f18", label: "Child's Name", type: "text", required: true },
          { id: "f19", label: "Interested in Financial Aid", type: "checkbox", required: false },
        ],
      },
    ],
    actions: [
      { id: "a6", type: "email", config: { to: "{{parent_email}}", subject: "You're on the waitlist!", body: "" } },
      { id: "a7", type: "tag", config: { tag: "Waitlist 2026" } },
    ],
  },
];

function getActionMeta(): Record<FlowActionType, { label: string; color: string; bgColor: string }> {
  return {
    email: { label: "Send Email", color: C.info, bgColor: C.infoBg },
    sms: { label: "Send SMS", color: C.success, bgColor: C.successBg },
    redirect: { label: "Redirect", color: C.warning, bgColor: C.warningBg },
    tag: { label: "Add Tag", color: C.purple, bgColor: C.purpleBg },
    notify_admin: { label: "Notify Admin", color: C.accent, bgColor: C.accentLight },
  };
}

const FIELD_TYPE_OPTIONS: { value: FlowFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "select", label: "Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
];

let _flowIdCounter = 100;
const newId = () => `gen-${++_flowIdCounter}`;

function EnrollmentFlowsTab() {
  const [flows, setFlows] = useState<EnrollmentFlow[]>(INITIAL_DEMO_FLOWS);
  const [selectedFlowId, setSelectedFlowId] = useState<string>("flow-1");
  const [selectedStepId, setSelectedStepId] = useState<string | null>("s1");
  const [savedPulse, setSavedPulse] = useState(false);
  const [previewStep, setPreviewStep] = useState<FlowStep | null>(null);
  const ACTION_META = getActionMeta();

  const selectedFlow = flows.find((f) => f.id === selectedFlowId) ?? null;

  const updateFlow = (updater: (f: EnrollmentFlow) => EnrollmentFlow) => {
    setFlows((prev) =>
      prev.map((f) => (f.id === selectedFlowId ? updater(f) : f))
    );
  };

  const addFlow = () => {
    const id = newId();
    const newFlow: EnrollmentFlow = {
      id,
      name: "New Enrollment Flow",
      updatedAt: "Just now",
      steps: [
        {
          id: newId(),
          title: "Step 1",
          fields: [
            { id: newId(), label: "First Name", type: "text", required: true },
            { id: newId(), label: "Email", type: "email", required: true },
          ],
        },
      ],
      actions: [],
    };
    setFlows((prev) => [newFlow, ...prev]);
    setSelectedFlowId(id);
    setSelectedStepId(null);
  };

  const addStep = () => {
    const id = newId();
    updateFlow((f) => ({
      ...f,
      steps: [...f.steps, { id, title: `Step ${f.steps.length + 1}`, fields: [] }],
    }));
    setSelectedStepId(id);
  };

  const deleteStep = (stepId: string) => {
    updateFlow((f) => ({ ...f, steps: f.steps.filter((s) => s.id !== stepId) }));
  };

  const moveStep = (stepId: string, dir: -1 | 1) => {
    updateFlow((f) => {
      const idx = f.steps.findIndex((s) => s.id === stepId);
      if (idx + dir < 0 || idx + dir >= f.steps.length) return f;
      const steps = [...f.steps];
      [steps[idx], steps[idx + dir]] = [steps[idx + dir], steps[idx]];
      return { ...f, steps };
    });
  };

  const updateStepTitle = (stepId: string, title: string) => {
    updateFlow((f) => ({
      ...f,
      steps: f.steps.map((s) => (s.id === stepId ? { ...s, title } : s)),
    }));
  };

  const addField = (stepId: string) => {
    const id = newId();
    updateFlow((f) => ({
      ...f,
      steps: f.steps.map((s) =>
        s.id === stepId
          ? { ...s, fields: [...s.fields, { id, label: "New Field", type: "text", required: false }] }
          : s
      ),
    }));
  };

  const updateField = (stepId: string, fieldId: string, patch: Partial<FlowField>) => {
    updateFlow((f) => ({
      ...f,
      steps: f.steps.map((s) =>
        s.id === stepId
          ? { ...s, fields: s.fields.map((field) => (field.id === fieldId ? { ...field, ...patch } : field)) }
          : s
      ),
    }));
  };

  const deleteField = (stepId: string, fieldId: string) => {
    updateFlow((f) => ({
      ...f,
      steps: f.steps.map((s) =>
        s.id === stepId ? { ...s, fields: s.fields.filter((field) => field.id !== fieldId) } : s
      ),
    }));
  };

  const moveField = (stepId: string, fieldId: string, dir: -1 | 1) => {
    updateFlow((f) => ({
      ...f,
      steps: f.steps.map((s) => {
        if (s.id !== stepId) return s;
        const idx = s.fields.findIndex((field) => field.id === fieldId);
        if (idx + dir < 0 || idx + dir >= s.fields.length) return s;
        const fields = [...s.fields];
        [fields[idx], fields[idx + dir]] = [fields[idx + dir], fields[idx]];
        return { ...s, fields };
      }),
    }));
  };

  const addAction = (type: FlowActionType) => {
    const id = newId();
    updateFlow((f) => ({
      ...f,
      actions: [...f.actions, { id, type, config: {} }],
    }));
  };

  const updateAction = (actionId: string, patch: Partial<FlowAction>) => {
    updateFlow((f) => ({
      ...f,
      actions: f.actions.map((a) => (a.id === actionId ? { ...a, ...patch } : a)),
    }));
  };

  const deleteAction = (actionId: string) => {
    updateFlow((f) => ({ ...f, actions: f.actions.filter((a) => a.id !== actionId) }));
  };

  const moveAction = (actionId: string, dir: -1 | 1) => {
    updateFlow((f) => {
      const idx = f.actions.findIndex((a) => a.id === actionId);
      if (idx + dir < 0 || idx + dir >= f.actions.length) return f;
      const actions = [...f.actions];
      [actions[idx], actions[idx + dir]] = [actions[idx + dir], actions[idx]];
      return { ...f, actions };
    });
  };

  const saveFlow = () => {
    updateFlow((f) => ({ ...f, updatedAt: "Just now" }));
    setSavedPulse(true);
    setTimeout(() => setSavedPulse(false), 1500);
  };

  const inputStyle = {
    backgroundColor: C.elevated,
    border: `1px solid ${C.border}`,
    color: C.textPrimary,
    borderRadius: C.r.md,
    fontSize: "12px",
    padding: "4px 8px",
    outline: "none",
    width: "100%",
  } as React.CSSProperties;

  const smallBtnStyle = (active?: boolean) => ({
    padding: "2px 6px",
    borderRadius: C.r.sm,
    fontSize: "11px",
    cursor: "pointer",
    backgroundColor: active ? C.accentLight : C.elevated,
    color: active ? C.accent : C.textTertiary,
    border: `1px solid ${active ? C.accent : C.border}`,
    transition: "all 0.15s",
  } as React.CSSProperties);

  return (
    <div className="flex h-full" style={{ overflow: "hidden" }}>
      {/* Left panel — flow list */}
      <div
        className="flex flex-col flex-shrink-0 overflow-hidden"
        style={{
          width: 220,
          borderRight: `1px solid ${C.border}`,
          backgroundColor: C.surface,
        }}
      >
        <div
          className="flex items-center justify-between px-3 py-3"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textTertiary }}>
            Flow Templates
          </span>
          <button
            onClick={addFlow}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all"
            style={{ backgroundColor: C.accentLight, color: C.accent }}
          >
            <Plus className="w-3 h-3" />
            New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {flows.map((flow) => {
            const isActive = flow.id === selectedFlowId;
            return (
              <button
                key={flow.id}
                onClick={() => { setSelectedFlowId(flow.id); setSelectedStepId(null); }}
                className="w-full text-left px-3 py-3 transition-all"
                style={{
                  backgroundColor: isActive ? C.accentLight : "transparent",
                  borderBottom: `1px solid ${C.border}`,
                  borderLeft: isActive ? `2px solid ${C.accent}` : "2px solid transparent",
                }}
              >
                <p className="text-xs font-medium truncate" style={{ color: isActive ? C.accent : C.textPrimary }}>
                  {flow.name}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: C.textTertiary }}>
                  {flow.steps.length} step{flow.steps.length !== 1 ? "s" : ""} · {flow.updatedAt}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel — flow editor */}
      {selectedFlow ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor header */}
          <div
            className="flex items-center justify-between px-5 py-3 flex-shrink-0"
            style={{ borderBottom: `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                value={selectedFlow.name}
                onChange={(e) => updateFlow((f) => ({ ...f, name: e.target.value }))}
                className="text-sm font-semibold bg-transparent border-none outline-none flex-1 min-w-0"
                style={{ color: C.textPrimary }}
              />
            </div>
            <button
              onClick={saveFlow}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex-shrink-0"
              style={{
                backgroundColor: savedPulse ? C.success : C.accent,
                color: "#fff",
              }}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {savedPulse ? "Saved!" : "Save Template"}
            </button>
          </div>

          {/* Scrollable editor body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

            {/* Steps section — horizontal card rail */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4" style={{ color: C.accent }} />
                <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  Form Steps
                </span>
                <span
                  className="px-1.5 py-0.5 text-[10px] font-bold rounded-full"
                  style={{ backgroundColor: C.accentLight, color: C.accent }}
                >
                  {selectedFlow.steps.length}
                </span>
              </div>

              {/* Scrollable horizontal rail */}
              <div
                className="rounded-lg overflow-x-auto"
                style={{
                  backgroundImage: `radial-gradient(circle, ${C.border} 1px, transparent 1px)`,
                  backgroundSize: "20px 20px",
                  backgroundColor: C.elevated,
                  border: `1px solid ${C.border}`,
                  minHeight: 340,
                  padding: "48px 40px",
                }}
              >
                <div className="flex items-start gap-0" style={{ width: "max-content" }}>
                  {selectedFlow.steps.map((step, stepIdx) => {
                    const isSelected = selectedStepId === step.id;
                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: stepIdx * 0.05, duration: 0.2 }}
                        className="flex items-start"
                      >
                        {/* Step card */}
                        <div
                          className="flex flex-col rounded-lg overflow-hidden flex-shrink-0 transition-all"
                          style={{
                            width: 300,
                            backgroundColor: C.surface,
                            border: isSelected ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
                            boxShadow: isSelected ? `0 0 0 3px ${C.accentLight}` : C.shadowCard,
                          }}
                          onClick={() => setSelectedStepId(isSelected ? null : step.id)}
                        >
                          {/* Accent top strip */}
                          <div className="h-1.5 w-full flex-shrink-0" style={{ backgroundColor: C.accent }} />

                          {/* Card header */}
                          <div
                            className="flex items-center gap-2 px-4 pt-3.5 pb-3"
                            style={{ borderBottom: `1px solid ${C.border}` }}
                          >
                            <span
                              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                              style={{ backgroundColor: C.accentLight, color: C.accent }}
                            >
                              {stepIdx + 1}
                            </span>
                            <input
                              value={step.title}
                              onChange={(e) => { e.stopPropagation(); updateStepTitle(step.id, e.target.value); }}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 min-w-0 text-sm font-semibold bg-transparent border-none outline-none"
                              style={{ color: C.textPrimary }}
                            />
                            <div
                              className="flex items-center gap-1 flex-shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                style={smallBtnStyle()}
                                onClick={() => moveStep(step.id, -1)}
                                disabled={stepIdx === 0}
                                title="Move left"
                              >
                                ←
                              </button>
                              <button
                                style={smallBtnStyle()}
                                onClick={() => moveStep(step.id, 1)}
                                disabled={stepIdx === selectedFlow.steps.length - 1}
                                title="Move right"
                              >
                                →
                              </button>
                              <button
                                style={{ ...smallBtnStyle(), color: C.error, borderColor: C.errorBorder }}
                                onClick={() => deleteStep(step.id)}
                                title="Delete step"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>

                          {/* Fields list — always visible */}
                          <div className="flex flex-col flex-1">
                            {step.fields.map((field) => (
                              <div
                                key={field.id}
                                className="flex items-center gap-2.5 px-4 py-3"
                                style={{ borderBottom: `1px solid ${C.border}` }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  value={field.label}
                                  onChange={(e) => updateField(step.id, field.id, { label: e.target.value })}
                                  placeholder="Field label"
                                  className="flex-1 min-w-0 bg-transparent border-none outline-none font-medium"
                                  style={{ color: C.textPrimary, fontSize: 13 }}
                                />
                                <select
                                  value={field.type}
                                  onChange={(e) => updateField(step.id, field.id, { type: e.target.value as FlowFieldType })}
                                  style={{
                                    backgroundColor: C.infoBg,
                                    color: C.info,
                                    border: "none",
                                    borderRadius: C.r.sm,
                                    fontSize: "10px",
                                    fontWeight: 600,
                                    padding: "3px 5px",
                                    flexShrink: 0,
                                    cursor: "pointer",
                                    outline: "none",
                                  }}
                                >
                                  {FIELD_TYPE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                                {/* Required/Optional badge toggle */}
                                <button
                                  onClick={() => updateField(step.id, field.id, { required: !field.required })}
                                  title={field.required ? "Click to make optional" : "Click to make required"}
                                  className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all"
                                  style={{
                                    backgroundColor: field.required ? C.errorBg : C.elevated,
                                    color: field.required ? C.error : C.textTertiary,
                                    border: `1px solid ${field.required ? C.errorBorder : C.border}`,
                                  }}
                                >
                                  {field.required ? "Req*" : "Opt"}
                                </button>
                                <button
                                  onClick={() => deleteField(step.id, field.id)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: C.textTertiary,
                                    padding: "0 1px",
                                    flexShrink: 0,
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}

                            {/* Add field + Preview row */}
                            <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={(e) => { e.stopPropagation(); addField(step.id); }}
                                className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-all flex-1"
                                style={{ color: C.accent }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.accentLight)}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Add Field
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setPreviewStep(step); }}
                                title="Preview step"
                                className="flex items-center gap-1 px-3 py-3 text-[11px] font-medium transition-all flex-shrink-0"
                                style={{ color: C.info, borderLeft: `1px solid ${C.border}` }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.infoBg)}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Preview
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Arrow connector */}
                        {stepIdx < selectedFlow.steps.length - 1 && (
                          <div className="flex items-center self-center" style={{ paddingLeft: 20, paddingRight: 20 }}>
                            <ArrowRight className="w-5 h-5 flex-shrink-0" style={{ color: C.textTertiary }} />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}

                  {/* Arrow before Add Step card */}
                  {selectedFlow.steps.length > 0 && (
                    <div className="flex items-center self-center" style={{ paddingLeft: 20, paddingRight: 20 }}>
                      <ArrowRight className="w-5 h-5 flex-shrink-0" style={{ color: C.textTertiary }} />
                    </div>
                  )}

                  {/* Add Step card */}
                  <div
                    className="flex flex-col items-center justify-center rounded-lg cursor-pointer flex-shrink-0 transition-all gap-2"
                    style={{
                      width: 160,
                      minHeight: 140,
                      border: `2px dashed ${C.borderStrong}`,
                      color: C.textTertiary,
                      backgroundColor: "transparent",
                    }}
                    onClick={addStep}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = C.surface;
                      (e.currentTarget as HTMLElement).style.borderColor = C.accent;
                      (e.currentTarget as HTMLElement).style.color = C.accent;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                      (e.currentTarget as HTMLElement).style.borderColor = C.borderStrong;
                      (e.currentTarget as HTMLElement).style.color = C.textTertiary;
                    }}
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-xs font-medium">Add Step</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step preview modal */}
            <AnimatePresence>
              {previewStep && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 flex items-center justify-center"
                  style={{ backgroundColor: "rgba(0,0,0,0.45)", zIndex: 9999 }}
                  onClick={() => setPreviewStep(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.97 }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                    className="rounded-2xl overflow-hidden flex flex-col"
                    style={{
                      width: "min(860px, 90vw)",
                      maxHeight: "85vh",
                      backgroundColor: "#FFFFFF",
                      boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Browser chrome bar */}
                    <div
                      className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
                      style={{ backgroundColor: "#F3F4F6", borderBottom: "1px solid #E5E7EB" }}
                    >
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FC605B" }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FDBC40" }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#34C749" }} />
                      </div>
                      <div
                        className="flex-1 mx-3 px-3 py-1 rounded text-xs text-center"
                        style={{ backgroundColor: "#E5E7EB", color: "#6B7280" }}
                      >
                        yourschool.schoolstack.io/apply
                      </div>
                      <button
                        onClick={() => setPreviewStep(null)}
                        className="rounded p-0.5 transition-colors"
                        style={{ color: "#9CA3AF" }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Form content */}
                    <div className="flex-1 overflow-y-auto px-10 py-8 flex flex-col items-center">
                    <div className="w-full" style={{ maxWidth: 520 }}>
                      {/* School branding mock */}
                      <div className="flex items-center gap-2.5 mb-6">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: C.accent }}
                        >
                          S
                        </div>
                        <span className="text-sm font-semibold" style={{ color: "#111827" }}>
                          {selectedFlow?.name ?? "Enrollment Form"}
                        </span>
                      </div>

                      {/* Step progress indicator */}
                      <div className="flex items-center gap-2 mb-6">
                        {selectedFlow?.steps.map((s, i) => {
                          const isCurrent = s.id === previewStep.id;
                          const isPast = (selectedFlow?.steps.findIndex((x) => x.id === previewStep.id) ?? 0) > i;
                          return (
                            <div key={s.id} className="flex items-center gap-2">
                              <div
                                className="flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold"
                                style={{
                                  backgroundColor: isCurrent ? C.accent : isPast ? C.accentLight : "#F3F4F6",
                                  color: isCurrent ? "#fff" : isPast ? C.accent : "#9CA3AF",
                                }}
                              >
                                {i + 1}
                              </div>
                              {i < (selectedFlow?.steps.length ?? 1) - 1 && (
                                <div className="w-6 h-0.5 rounded" style={{ backgroundColor: isPast ? C.accent : "#E5E7EB" }} />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <h2 className="text-lg font-bold mb-1" style={{ color: "#111827" }}>
                        {previewStep.title}
                      </h2>
                      <p className="text-sm mb-6" style={{ color: "#6B7280" }}>
                        Please fill out the fields below to continue.
                      </p>

                      {/* Rendered fields */}
                      <div className="space-y-4">
                        {previewStep.fields.map((field) => (
                          <div key={field.id} className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium flex items-center gap-1" style={{ color: "#374151" }}>
                              {field.label}
                              {field.required && (
                                <span style={{ color: "#EF4444", fontSize: 14, lineHeight: 1 }}>*</span>
                              )}
                            </label>
                            {field.type === "checkbox" ? (
                              <label className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded"
                                  style={{ accentColor: C.accent }}
                                  readOnly
                                />
                                <span className="text-sm" style={{ color: "#6B7280" }}>
                                  {field.label}
                                </span>
                              </label>
                            ) : field.type === "select" ? (
                              <select
                                disabled
                                className="w-full px-3 py-2.5 rounded-lg text-sm"
                                style={{
                                  border: "1.5px solid #E5E7EB",
                                  color: "#9CA3AF",
                                  backgroundColor: "#FAFAFA",
                                  outline: "none",
                                }}
                              >
                                <option>Select an option…</option>
                                {field.options?.map((opt) => (
                                  <option key={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={field.type === "date" ? "date" : field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                                placeholder={
                                  field.type === "email" ? "you@example.com"
                                  : field.type === "phone" ? "(555) 000-0000"
                                  : field.type === "date" ? ""
                                  : `Enter ${field.label.toLowerCase()}…`
                                }
                                disabled
                                className="w-full px-3 py-2.5 rounded-lg text-sm"
                                style={{
                                  border: "1.5px solid #E5E7EB",
                                  color: "#9CA3AF",
                                  backgroundColor: "#FAFAFA",
                                  outline: "none",
                                }}
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Next / Submit button */}
                      <button
                        className="mt-8 w-full py-3 rounded-lg text-sm font-semibold text-white transition-all"
                        style={{ backgroundColor: C.accent }}
                        disabled
                      >
                        {(selectedFlow?.steps.findIndex((s) => s.id === previewStep.id) ?? 0) === (selectedFlow?.steps.length ?? 1) - 1
                          ? "Submit Application"
                          : "Next Step →"}
                      </button>

                      <p className="text-center text-xs mt-3" style={{ color: "#9CA3AF" }}>
                        Powered by SchoolStack
                      </p>
                    </div>{/* inner max-width wrapper */}
                    </div>{/* form content scroll */}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Post-Submit Actions section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4" style={{ color: C.warning }} />
                <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  Post-Submit Actions
                </span>
                <span
                  className="px-1.5 py-0.5 text-[10px] font-bold rounded-full"
                  style={{ backgroundColor: C.warningBg, color: C.warning }}
                >
                  {selectedFlow.actions.length}
                </span>
              </div>

              <div className="space-y-2 mb-2">
                {selectedFlow.actions.map((action, actionIdx) => {
                  const meta = ACTION_META[action.type];
                  return (
                    <div
                      key={action.id}
                      className="rounded-lg p-3"
                      style={{ border: `1px solid ${C.border}`, backgroundColor: C.elevated }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-0.5 text-[10px] font-semibold rounded-full flex-shrink-0"
                            style={{ backgroundColor: meta.bgColor, color: meta.color }}
                          >
                            {meta.label}
                          </span>
                          <span className="text-[10px]" style={{ color: C.textTertiary }}>
                            #{actionIdx + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <button style={smallBtnStyle()} onClick={() => moveAction(action.id, -1)} disabled={actionIdx === 0}>↑</button>
                          <button style={smallBtnStyle()} onClick={() => moveAction(action.id, 1)} disabled={actionIdx === selectedFlow.actions.length - 1}>↓</button>
                          <button
                            style={{ ...smallBtnStyle(), color: C.error, borderColor: C.errorBorder }}
                            onClick={() => deleteAction(action.id)}
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>

                      {action.type === "email" && (
                        <div className="space-y-1.5">
                          <input
                            value={action.config.to ?? ""}
                            onChange={(e) => updateAction(action.id, { config: { ...action.config, to: e.target.value } })}
                            placeholder="To: e.g. {{parent_email}}"
                            style={inputStyle}
                          />
                          <input
                            value={action.config.subject ?? ""}
                            onChange={(e) => updateAction(action.id, { config: { ...action.config, subject: e.target.value } })}
                            placeholder="Subject"
                            style={inputStyle}
                          />
                          <textarea
                            value={action.config.body ?? ""}
                            onChange={(e) => updateAction(action.id, { config: { ...action.config, body: e.target.value } })}
                            placeholder="Email body..."
                            rows={2}
                            style={{ ...inputStyle, resize: "none" }}
                          />
                        </div>
                      )}
                      {action.type === "sms" && (
                        <input
                          value={action.config.message ?? ""}
                          onChange={(e) => updateAction(action.id, { config: { ...action.config, message: e.target.value } })}
                          placeholder="SMS message..."
                          style={inputStyle}
                        />
                      )}
                      {action.type === "redirect" && (
                        <input
                          value={action.config.url ?? ""}
                          onChange={(e) => updateAction(action.id, { config: { ...action.config, url: e.target.value } })}
                          placeholder="Redirect URL (e.g. https://...)"
                          style={inputStyle}
                        />
                      )}
                      {action.type === "tag" && (
                        <input
                          value={action.config.tag ?? ""}
                          onChange={(e) => updateAction(action.id, { config: { ...action.config, tag: e.target.value } })}
                          placeholder="Tag name"
                          style={inputStyle}
                        />
                      )}
                      {action.type === "notify_admin" && (
                        <p className="text-[11px]" style={{ color: C.textTertiary }}>
                          An in-app notification will be sent to all admin users.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add action pills */}
              <div className="flex flex-wrap gap-1.5">
                {(["email", "sms", "redirect", "tag", "notify_admin"] as FlowActionType[]).map((type) => {
                  const meta = ACTION_META[type];
                  return (
                    <button
                      key={type}
                      onClick={() => addAction(type)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all"
                      style={{ backgroundColor: meta.bgColor, color: meta.color, border: `1px solid transparent` }}
                      onMouseEnter={(e) => (e.currentTarget.style.border = `1px solid ${meta.color}`)}
                      onMouseLeave={(e) => (e.currentTarget.style.border = `1px solid transparent`)}
                    >
                      <Plus className="w-3 h-3" />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center" style={{ color: C.textTertiary }}>
          <p className="text-sm">Select a flow to edit</p>
        </div>
      )}
    </div>
  );
}

type AdmissionsTab = "flows" | "submissions" | "applications";

function AdmissionsPage({ activeTab, onTabChange }: { activeTab: AdmissionsTab; onTabChange: (tab: AdmissionsTab) => void }) {
  const tabs: { key: AdmissionsTab; label: string }[] = [
    { key: "flows", label: "Enrollment Flows" },
    { key: "submissions", label: "Submissions" },
    { key: "applications", label: "Applications" },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Tab bar flush at top */}
      <div
        className="flex gap-0 px-6 flex-shrink-0"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className="px-4 py-3 text-sm font-medium transition-colors"
            style={{
              color: activeTab === tab.key ? C.accent : C.textTertiary,
              borderBottom: activeTab === tab.key ? `2px solid ${C.accent}` : "2px solid transparent",
              marginBottom: "-1px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "flows" && (
            <motion.div key="flows" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="h-full">
              <EnrollmentFlowsTab />
            </motion.div>
          )}
          {activeTab === "submissions" && (
            <motion.div key="submissions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="h-full">
              <LeadsListTab />
            </motion.div>
          )}
          {activeTab === "applications" && (
            <motion.div key="applications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="h-full">
              <ApplicationsTabInner />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Applications page ─────────────────────────────────────────────────────────

type AppView = "table" | "kanban" | "pipeline";

function AppDetailPanel({
  app,
  onClose,
}: {
  app: (typeof DEMO_APPLICATIONS)[0];
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="absolute top-0 right-0 bottom-0 w-80 flex flex-col overflow-hidden"
      style={{
        backgroundColor: C.surface,
        borderLeft: `1px solid ${C.border}`,
        zIndex: 10,
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div>
          <h3
            className="text-sm font-semibold"
            style={{ color: C.textPrimary }}
          >
            {app.childName}
          </h3>
          {app.preferredName && (
            <p className="text-xs" style={{ color: C.textTertiary }}>
              Goes by "{app.preferredName}"
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded"
          style={{ color: C.textTertiary }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Grade", value: app.grade },
            { label: "Age", value: `${app.age} yrs` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg p-3"
              style={{
                backgroundColor: C.elevated,
                border: `1px solid ${C.border}`,
              }}
            >
              <p
                className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                style={{ color: C.textTertiary }}
              >
                {label}
              </p>
              <p
                className="text-sm font-medium"
                style={{ color: C.textPrimary }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: C.textTertiary }}
          >
            Program
          </p>
          <ProgramBadge program={app.program} />
        </div>
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: C.textTertiary }}
          >
            Status
          </p>
          <StatusBadge status={app.status} />
        </div>
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: C.textTertiary }}
          >
            Guardian
          </p>
          <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
            {app.parent}
          </p>
          <p className="text-xs" style={{ color: C.textTertiary }}>
            {app.email}
          </p>
        </div>
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: C.textTertiary }}
          >
            Submitted
          </p>
          <p className="text-sm" style={{ color: C.textSecondary }}>
            {app.submitted}
          </p>
        </div>
        {app.approved && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg"
            style={{
              backgroundColor: C.successBg,
              border: `1px solid ${C.successBorder}`,
            }}
          >
            <CheckCircle className="w-4 h-4" style={{ color: C.success }} />
            <span
              className="text-xs font-semibold"
              style={{ color: C.success }}
            >
              Approved
            </span>
          </div>
        )}
      </div>
      <div
        className="px-5 py-4 flex gap-2"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        <button
          className="flex-1 py-2 text-xs font-semibold rounded-lg"
          style={{
            backgroundColor: C.successBg,
            color: C.success,
            border: `1px solid ${C.successBorder}`,
          }}
        >
          Approve
        </button>
        <button
          className="flex-1 py-2 text-xs font-semibold rounded-lg"
          style={{
            backgroundColor: C.errorBg,
            color: C.error,
            border: `1px solid ${C.errorBorder}`,
          }}
        >
          Deny
        </button>
      </div>
    </motion.div>
  );
}

const KANBAN_COLS = [
  {
    key: "in_progress",
    label: "In Progress",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  {
    key: "in_review",
    label: "In Review",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  {
    key: "enrolling",
    label: "Enrolling",
    icon: <TrendingUp className="w-3.5 h-3.5" />,
  },
  {
    key: "enrolled",
    label: "Enrolled",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
];

function ApplicationsTabInner() {
  const [view, setView] = useState<AppView>("table");
  const [selectedApp, setSelectedApp] = useState<
    (typeof DEMO_APPLICATIONS)[0] | null
  >(null);
  const { openBackdrop, closeBackdrop } = useContext(BackdropContext);
  useEffect(() => {
    if (selectedApp) openBackdrop(() => setSelectedApp(null));
    else closeBackdrop();
  }, [selectedApp]);

  const viewButtons: { key: AppView; icon: React.ReactNode; label: string }[] =
    [
      { key: "table", icon: <Table className="w-3.5 h-3.5" />, label: "Table" },
      { key: "kanban", icon: <LayoutGrid className="w-3.5 h-3.5" />, label: "Kanban" },
      { key: "pipeline", icon: <GitBranch className="w-3.5 h-3.5" />, label: "Pipeline" },
    ];

  return (
    <div className="h-full flex flex-col">
      {/* Compact toolbar */}
      <div
        className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <span className="text-xs" style={{ color: C.textTertiary }}>
          {DEMO_APPLICATIONS.length} applications total
        </span>
        <div
          className="flex items-center gap-1 p-1 rounded-lg"
          style={{ backgroundColor: C.elevated, border: `1px solid ${C.border}` }}
        >
          {viewButtons.map((b) => (
            <button
              key={b.key}
              data-tour-id={`app-view-${b.key}`}
              onClick={() => setView(b.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all"
              style={{
                backgroundColor: view === b.key ? C.surface : "transparent",
                color: view === b.key ? C.textPrimary : C.textTertiary,
                boxShadow: view === b.key ? C.shadowCard : "none",
              }}
            >
              {b.icon}
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "table" && (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-hidden"
            style={{ borderTop: `1px solid ${C.border}` }}
          >
            <div className="h-full overflow-hidden">
              <div className="overflow-x-auto h-full">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {[
                        "Child",
                        "Parent",
                        "Age / Grade",
                        "Program",
                        "Status",
                        "Approved",
                        "Submitted",
                        "",
                      ].map((col) => (
                        <th
                          key={col}
                          className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest"
                          style={{ color: C.textTertiary }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_APPLICATIONS.map((app, i) => (
                      <motion.tr
                        key={app.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        style={{ borderBottom: `1px solid ${C.border}` }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = C.elevated)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <td className="px-4 py-3">
                          <p
                            className="font-medium"
                            style={{ color: C.textPrimary }}
                          >
                            {app.childName}
                          </p>
                          {app.preferredName && (
                            <p
                              className="text-xs"
                              style={{ color: C.textTertiary }}
                            >
                              "{app.preferredName}"
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p style={{ color: C.textSecondary }}>{app.parent}</p>
                          <p
                            className="text-xs"
                            style={{ color: C.textTertiary }}
                          >
                            {app.email}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p style={{ color: C.textSecondary }}>
                            {app.age} yrs
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: C.textTertiary }}
                          >
                            {app.grade}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <ProgramBadge program={app.program} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="px-4 py-3">
                          {app.approved ? (
                            <span
                              className="text-xs font-semibold"
                              style={{ color: C.success }}
                            >
                              ✓ Approved
                            </span>
                          ) : (
                            <span style={{ color: C.textTertiary }}>—</span>
                          )}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: C.textTertiary }}
                        >
                          {app.submitted}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors"
                            style={{
                              backgroundColor: C.elevated,
                              color: C.textSecondary,
                              border: `1px solid ${C.border}`,
                            }}
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {view === "kanban" && (
          <motion.div
            key="kanban"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-4 flex-1 overflow-x-auto pb-2"
          >
            {KANBAN_COLS.map((col) => {
              const apps = DEMO_APPLICATIONS.filter(
                (a) => a.status === col.key,
              );
              const s = STATUS_COLORS[col.key];
              return (
                <div key={col.key} className="flex-shrink-0 w-64 flex flex-col">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span style={{ color: s?.text ?? C.textTertiary }}>
                      {col.icon}
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: C.textSecondary }}
                    >
                      {col.label}
                    </span>
                    <span
                      className="ml-auto text-xs font-bold tabular-nums"
                      style={{ color: C.textTertiary }}
                    >
                      {apps.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {apps.map((app, i) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        onClick={() => setSelectedApp(app)}
                        className="cursor-pointer rounded-xl p-3 transition-colors"
                        style={{
                          backgroundColor: C.surface,
                          border: `1px solid ${C.border}`,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor = C.borderStrong)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor = C.border)
                        }
                      >
                        <p
                          className="text-sm font-semibold mb-1"
                          style={{ color: C.textPrimary }}
                        >
                          {app.childName}
                        </p>
                        <p
                          className="text-xs mb-2"
                          style={{ color: C.textTertiary }}
                        >
                          {app.parent}
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <ProgramBadge program={app.program} />
                          <span
                            className="text-[10px]"
                            style={{ color: C.textTertiary }}
                          >
                            {app.grade}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    {apps.length === 0 && (
                      <div
                        className="rounded-xl p-4 text-center"
                        style={{ border: `1px dashed ${C.border}` }}
                      >
                        <p
                          className="text-xs"
                          style={{ color: C.textTertiary }}
                        >
                          No applications
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {view === "pipeline" && (
          <motion.div
            key="pipeline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            <Card style={{ padding: "32px" }}>
              <SectionLabel>Enrollment Pipeline</SectionLabel>
              <div className="space-y-5 mt-4">
                {FUNNEL_STAGES.map((stage, i) => {
                  const max = FUNNEL_STAGES[0].count;
                  const pct = Math.round((stage.count / max) * 100);
                  const convPct =
                    i > 0
                      ? Math.round(
                          (stage.count / FUNNEL_STAGES[i - 1].count) * 100,
                        )
                      : 100;
                  return (
                    <div key={stage.label}>
                      <div className="flex items-center gap-4 mb-2">
                        <span
                          className="w-24 text-xs font-semibold"
                          style={{ color: C.textSecondary }}
                        >
                          {stage.label}
                        </span>
                        <div
                          className="flex-1 h-3 rounded-full overflow-hidden"
                          style={{ backgroundColor: C.border }}
                        >
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{
                              duration: 0.9,
                              delay: i * 0.12,
                              ease: "easeOut",
                            }}
                            style={{ backgroundColor: stage.color }}
                          />
                        </div>
                        <span
                          className="w-8 text-sm font-bold tabular-nums text-right"
                          style={{ color: C.textPrimary }}
                        >
                          {stage.count}
                        </span>
                        {i > 0 && (
                          <span
                            className="w-16 text-xs text-right"
                            style={{ color: C.textTertiary }}
                          >
                            {convPct}% conv.
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Leads", value: "37", color: C.accent },
                  { label: "Conversion Rate", value: "65%", color: C.success },
                  {
                    label: "Avg. Time to Enroll",
                    value: "18 days",
                    color: C.info,
                  },
                  {
                    label: "Revenue Pipeline",
                    value: "$86k",
                    color: C.warning,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl p-4 text-center"
                    style={{
                      backgroundColor: C.elevated,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <p
                      className="text-2xl font-bold tabular-nums"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: C.textTertiary }}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedApp && (
          <AppDetailPanel
            app={selectedApp}
            onClose={() => setSelectedApp(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Parents page ─────────────────────────────────────────────────────────────

function YesNoChip({
  value,
  trueLabel = "Yes",
  falseLabel = "No",
}: {
  value: boolean;
  trueLabel?: string;
  falseLabel?: string;
}) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full"
      style={{
        backgroundColor: value ? C.successBg : C.errorBg,
        border: `1px solid ${value ? C.successBorder : C.errorBorder}`,
        color: value ? C.success : C.error,
      }}
    >
      {value ? trueLabel : falseLabel}
    </span>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      className="flex items-start justify-between gap-4 py-2"
      style={{ borderBottom: `1px solid ${C.border}` }}
    >
      <span className="text-xs flex-shrink-0" style={{ color: C.textTertiary }}>
        {label}
      </span>
      <span
        className="text-xs font-medium text-right"
        style={{ color: C.textPrimary }}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

function ParentDetailPanel({
  parent,
  onClose,
}: {
  parent: DemoParent;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="absolute top-0 right-0 bottom-0 w-84 flex flex-col overflow-hidden"
      style={{
        width: 340,
        backgroundColor: C.surface,
        borderLeft: `1px solid ${C.border}`,
        zIndex: 10,
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{
              backgroundColor: parent.color + "22",
              color: parent.color,
            }}
          >
            {parent.initials}
          </div>
          <h3
            className="text-sm font-semibold"
            style={{ color: C.textPrimary }}
          >
            {parent.name}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded"
          style={{ color: C.textTertiary }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Guardian 1 */}
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: C.textTertiary }}
          >
            Guardian 1
          </p>
          <div>
            <DetailField label="Cell Phone" value={parent.g1Phone} />
            {parent.g1WorkPhone && (
              <DetailField label="Work Phone" value={parent.g1WorkPhone} />
            )}
            <DetailField label="Preferred Contact" value={parent.g1Preferred} />
            <DetailField
              label="Lives with Child"
              value={<YesNoChip value={parent.g1LivesWith} />}
            />
            <DetailField
              label="Has Custody"
              value={<YesNoChip value={parent.g1Custody} />}
            />
          </div>
        </div>
        {/* Guardian 2 */}
        {parent.g2Name && (
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-3"
              style={{ color: C.textTertiary }}
            >
              Guardian 2
            </p>
            <DetailField label="Name" value={parent.g2Name} />
            <DetailField label="Relationship" value={parent.g2Relationship} />
            <DetailField label="Email" value={parent.g2Email} />
            <DetailField label="Cell Phone" value={parent.g2Phone} />
          </div>
        )}
        {/* Children */}
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: C.textTertiary }}
          >
            Children ({parent.children.length})
          </p>
          <div className="space-y-2">
            {parent.children.map((child) => (
              <div
                key={child.name}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{
                  backgroundColor: C.elevated,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    backgroundColor: parent.color + "22",
                    color: parent.color,
                  }}
                >
                  {child.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: C.textPrimary }}
                  >
                    {child.name}
                  </p>
                  <p className="text-xs" style={{ color: C.textTertiary }}>
                    DOB: {child.dob}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Applications */}
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: C.textTertiary }}
          >
            Applications
          </p>
          <div className="space-y-2">
            {parent.applications.map((app, i) => (
              <div
                key={i}
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: C.elevated,
                  border: `1px solid ${C.border}`,
                }}
              >
                <p
                  className="text-xs font-semibold mb-2"
                  style={{ color: C.textPrimary }}
                >
                  {app.childName}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <ProgramBadge program={app.program} />
                  <StatusBadge status={app.status} />
                  {app.approved && (
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: C.success }}
                    >
                      ✓ Approved
                    </span>
                  )}
                </div>
                <p
                  className="text-[10px] mt-2"
                  style={{ color: C.textTertiary }}
                >
                  Submitted {app.submitted}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ParentsPageInner() {
  const [selected, setSelected] = useState<DemoParent | null>(null);
  const { openBackdrop, closeBackdrop } = useContext(BackdropContext);
  useEffect(() => {
    if (selected) openBackdrop(() => setSelected(null));
    else closeBackdrop();
  }, [selected]);
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {[
                  "Name",
                  "G1 Phone",
                  "G2 Name",
                  "Relationship",
                  "G2 Email",
                  "G2 Phone",
                  "Children",
                  "",
                ].map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: C.textTertiary }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEMO_PARENTS.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = C.elevated)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{
                          backgroundColor: p.color + "22",
                          color: p.color,
                        }}
                      >
                        {p.initials}
                      </div>
                      <span
                        className="font-medium"
                        style={{ color: C.textPrimary }}
                      >
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: C.textSecondary }}
                  >
                    {p.g1Phone}
                  </td>
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: C.textSecondary }}
                  >
                    {p.g2Name ?? "—"}
                  </td>
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: C.textTertiary }}
                  >
                    {p.g2Relationship ?? "—"}
                  </td>
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: C.textSecondary }}
                  >
                    {p.g2Email ?? "—"}
                  </td>
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: C.textSecondary }}
                  >
                    {p.g2Phone ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-bold tabular-nums"
                      style={{ color: C.textPrimary }}
                    >
                      {p.children.length}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(p)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md"
                      style={{
                        backgroundColor: C.elevated,
                        color: C.textSecondary,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AnimatePresence>
        {selected && (
          <ParentDetailPanel
            parent={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Students page ─────────────────────────────────────────────────────────────

const HEALTH_FLAGS = [
  {
    key: "hasAllergies",
    label: "Allergies",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
  },
  {
    key: "hasMedical",
    label: "Medical Conditions",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.1)",
  },
  {
    key: "hasEmergencyMeds",
    label: "Emergency Meds",
    color: "#F97316",
    bg: "rgba(249,115,22,0.1)",
  },
  {
    key: "needsAide",
    label: "Needs Aide",
    color: "#38BDF8",
    bg: "rgba(56,189,248,0.1)",
  },
] as const;

function StudentDetailPanel({
  student,
  onClose,
}: {
  student: DemoStudent;
  onClose: () => void;
}) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const flags = HEALTH_FLAGS.filter((f) => student[f.key]);

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="absolute top-0 right-0 bottom-0 flex flex-col overflow-hidden"
      style={{
        width: 360,
        backgroundColor: C.surface,
        borderLeft: `1px solid ${C.border}`,
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{
              backgroundColor: student.color + "22",
              color: student.color,
            }}
          >
            {student.initials}
          </div>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: C.textPrimary }}
            >
              {student.name}
            </p>
            <p className="text-xs" style={{ color: C.textTertiary }}>
              {student.grade} · {student.parent}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded"
          style={{ color: C.textTertiary }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* Health flags */}
        {flags.length > 0 && (
          <div
            className="px-5 py-3 flex flex-wrap gap-2"
            style={{ borderBottom: `1px solid ${C.border}` }}
          >
            {flags.map((f) => (
              <span
                key={f.key}
                className="px-2 py-1 text-[10px] font-semibold rounded-full"
                style={{ backgroundColor: f.bg, color: f.color }}
              >
                ⚠ {f.label}
              </span>
            ))}
          </div>
        )}
        {/* Quick-access collapsible sections */}
        <div style={{ borderBottom: `1px solid ${C.border}` }}>
          {[
            {
              key: "immunizations",
              label: "Immunizations",
              content: (
                <div className="space-y-1.5">
                  {[
                    "MMR_2024.pdf",
                    "Varicella_2023.pdf",
                    "Flu_Shot_2025.pdf",
                  ].map((f) => (
                    <div
                      key={f}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-xs"
                      style={{
                        backgroundColor: C.elevated,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <span style={{ color: C.textSecondary }}>{f}</span>
                      <span style={{ color: C.textTertiary }}>View</span>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              key: "medications",
              label: "Medications",
              content:
                student.medications.length > 0 ? (
                  <div className="space-y-2">
                    {student.medications.map((m) => (
                      <div
                        key={m.name}
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: C.elevated,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className="text-xs font-semibold"
                            style={{ color: C.textPrimary }}
                          >
                            {m.name}
                          </p>
                          <span
                            className="px-1.5 py-0.5 text-[9px] font-bold rounded-full"
                            style={{
                              backgroundColor:
                                m.type === "emergency"
                                  ? C.errorBg
                                  : C.successBg,
                              color:
                                m.type === "emergency" ? C.error : C.success,
                            }}
                          >
                            {m.type}
                          </span>
                        </div>
                        <p
                          className="text-[11px]"
                          style={{ color: C.textTertiary }}
                        >
                          {m.dosage} · {m.physician}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: C.textTertiary }}>
                    No medications on file
                  </p>
                ),
            },
            {
              key: "pickup",
              label: "Authorized Pickup",
              content: (
                <div className="space-y-2">
                  {student.authorizedPickup.map((p) => (
                    <div
                      key={p.name}
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: C.elevated,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <p
                        className="text-xs font-semibold"
                        style={{ color: C.textPrimary }}
                      >
                        {p.name}
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: C.textTertiary }}
                      >
                        {p.relationship} · {p.phone}
                      </p>
                    </div>
                  ))}
                </div>
              ),
            },
          ].map((section) => (
            <div key={section.key}>
              <button
                onClick={() =>
                  setOpenSection(
                    openSection === section.key ? null : section.key,
                  )
                }
                className="w-full flex items-center justify-between px-5 py-3 text-xs font-semibold transition-colors"
                style={{ color: C.textSecondary }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = C.elevated)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {section.label}
                <ChevronRight
                  className="w-3.5 h-3.5 transition-transform"
                  style={{
                    transform:
                      openSection === section.key ? "rotate(90deg)" : "none",
                    color: C.textTertiary,
                  }}
                />
              </button>
              <AnimatePresence>
                {openSection === section.key && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="px-5 pb-4">{section.content}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        {/* Info cards */}
        <div className="p-5 space-y-4">
          {[
            {
              title: "Student Info",
              fields: [
                { label: "Full Name", value: student.name },
                { label: "Grade", value: student.grade },
                { label: "Date of Birth", value: student.dob },
                { label: "Parent", value: student.parent },
                { label: "Special Interests", value: student.specialInterests },
              ],
            },
            {
              title: "Medical",
              fields: [
                {
                  label: "Allergies",
                  value: student.hasAllergies ? student.allergies : "None",
                },
                {
                  label: "Medical Conditions",
                  value: student.hasMedical
                    ? student.medicalConditions
                    : "None",
                },
                {
                  label: "Emergency Meds",
                  value: student.hasEmergencyMeds
                    ? student.emergencyMeds
                    : "None",
                },
              ],
            },
            {
              title: "Support Needs",
              fields: [
                {
                  label: "Needs Aide",
                  value: <YesNoChip value={student.needsAide} />,
                },
                {
                  label: "Aide Details",
                  value: student.needsAide ? student.aideDetails : "—",
                },
              ],
            },
            {
              title: "Learning Profile",
              fields: [
                { label: "Learning Style", value: student.learningStyle },
                { label: "Strengths", value: student.strengths },
                { label: "Challenges", value: student.challenges },
                {
                  label: "Regulation Strategies",
                  value: student.regulationStrategies,
                },
              ],
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-xl p-4"
              style={{
                backgroundColor: C.elevated,
                border: `1px solid ${C.border}`,
              }}
            >
              <p
                className="text-[10px] font-semibold uppercase tracking-widest mb-3"
                style={{ color: C.textTertiary }}
              >
                {card.title}
              </p>
              {card.fields.map((f) => (
                <DetailField key={f.label} label={f.label} value={f.value} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function StudentsPageInner() {
  const [selected, setSelected] = useState<DemoStudent | null>(null);
  const { openBackdrop, closeBackdrop } = useContext(BackdropContext);
  useEffect(() => {
    if (selected) openBackdrop(() => setSelected(null));
    else closeBackdrop();
  }, [selected]);
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Name", "Grade", "DOB", "Parent", "Program", "Flags", ""].map(
                  (col) => (
                    <th
                      key={col}
                      className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: C.textTertiary }}
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {DEMO_STUDENTS_P2.map((s, i) => {
                const flags = HEALTH_FLAGS.filter((f) => s[f.key]);
                return (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = C.elevated)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                          style={{
                            backgroundColor: s.color + "22",
                            color: s.color,
                          }}
                        >
                          {s.initials}
                        </div>
                        <span
                          className="font-medium"
                          style={{ color: C.textPrimary }}
                        >
                          {s.name}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{ color: C.textSecondary }}
                    >
                      {s.grade}
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{ color: C.textSecondary }}
                    >
                      {s.dob}
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{ color: C.textSecondary }}
                    >
                      {s.parent}
                    </td>
                    <td className="px-4 py-3">
                      <ProgramBadge program={s.program} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {flags.map((f) => (
                          <span
                            key={f.key}
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            title={f.label}
                            style={{ backgroundColor: f.color }}
                          />
                        ))}
                        {flags.length === 0 && (
                          <span style={{ color: C.textTertiary }}>—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(s)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md"
                        style={{
                          backgroundColor: C.elevated,
                          color: C.textSecondary,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <AnimatePresence>
        {selected && (
          <StudentDetailPanel
            student={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Families page ─────────────────────────────────────────────────────────────

function PeoplePage() {
  const [selectedParent, setSelectedParent] = useState<DemoParent | null>(null);
  const [search, setSearch] = useState("");
  const { openBackdrop, closeBackdrop } = useContext(BackdropContext);
  useEffect(() => {
    if (selectedParent) openBackdrop(() => setSelectedParent(null));
    else closeBackdrop();
  }, [selectedParent]);

  const filtered = DEMO_PARENTS.filter((p) =>
    search === "" ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.children.some((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            Families
          </span>
          <span
            className="px-1.5 py-0.5 text-[10px] font-bold rounded-full"
            style={{ backgroundColor: C.accentLight, color: C.accent }}
          >
            {DEMO_PARENTS.length}
          </span>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: C.elevated, border: `1px solid ${C.border}` }}
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.textTertiary }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search families..."
            className="bg-transparent border-none outline-none text-xs"
            style={{ color: C.textPrimary, width: 160 }}
          />
        </div>
      </div>

      {/* Column headers */}
      <div
        className="flex items-center px-6 py-2 flex-shrink-0"
        style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.elevated }}
      >
        <div className="w-8 flex-shrink-0" />
        <div className="w-48 flex-shrink-0 pl-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textTertiary }}>Family</div>
        <div className="flex-1 min-w-0 text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textTertiary }}>Children</div>
        <div className="w-36 flex-shrink-0 text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textTertiary }}>Phone</div>
        <div className="w-24 flex-shrink-0 text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textTertiary }}>Status</div>
        <div className="w-4 flex-shrink-0" />
      </div>

      {/* Family rows */}
      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: C.surface }}>
        {filtered.map((parent, i) => {
          const enrolledCount = parent.applications.filter((a) => a.status === "enrolled").length;
          const childSummary = parent.children.map((child) => {
            const app = parent.applications.find((a) => a.childName === child.name);
            const programLabel = app ? (PROGRAM_LABELS[app.program]?.label ?? app.program) : null;
            return programLabel ? `${child.name} (${programLabel})` : child.name;
          }).join(", ");

          return (
            <motion.div
              key={parent.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center px-6 py-3 cursor-pointer"
              style={{ borderBottom: `1px solid ${C.border}` }}
              onClick={() => setSelectedParent(parent)}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.elevated)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: parent.color + "22", color: parent.color }}
              >
                {parent.initials}
              </div>

              {/* Name */}
              <div className="w-48 flex-shrink-0 pl-3 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: C.textPrimary }}>
                  {parent.name}
                </p>
                {parent.g2Name && (
                  <p className="text-[11px] truncate" style={{ color: C.textTertiary }}>
                    + {parent.g2Name}
                  </p>
                )}
              </div>

              {/* Children */}
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-xs truncate" style={{ color: C.textSecondary }}>
                  {childSummary}
                </p>
              </div>

              {/* Phone */}
              <div className="w-36 flex-shrink-0">
                <p className="text-xs" style={{ color: C.textTertiary }}>
                  {parent.g1Phone}
                </p>
              </div>

              {/* Status */}
              <div className="w-24 flex-shrink-0">
                {enrolledCount > 0 ? (
                  <span
                    className="px-2 py-0.5 text-[10px] font-semibold rounded-full"
                    style={{ backgroundColor: C.successBg, color: C.success, border: `1px solid ${C.successBorder}` }}
                  >
                    Enrolled
                  </span>
                ) : (
                  <span
                    className="px-2 py-0.5 text-[10px] font-semibold rounded-full"
                    style={{ backgroundColor: C.elevated, color: C.textTertiary, border: `1px solid ${C.border}` }}
                  >
                    Pending
                  </span>
                )}
              </div>

              {/* Chevron */}
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: C.textTertiary }} />
            </motion.div>
          );
        })}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedParent && (
          <ParentDetailPanel
            parent={selectedParent}
            onClose={() => setSelectedParent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Programs page ─────────────────────────────────────────────────────────────

function ProgramsPage() {
  const [activeProgram, setActiveProgram] = useState<DemoProgram>(
    DEMO_PROGRAMS_P2[0],
  );
  const [activeTeacherId, setActiveTeacherId] = useState(
    DEMO_PROGRAMS_P2[0].teachers[0].id,
  );
  const [selectedStudent, setSelectedStudent] = useState<DemoStudent | null>(
    null,
  );

  const activeTeacher =
    activeProgram.teachers.find((t) => t.id === activeTeacherId) ??
    activeProgram.teachers[0];
  const teacherStudents = activeTeacher.studentIds
    .map((id) => DEMO_STUDENTS_P2.find((s) => s.id === id))
    .filter(Boolean) as DemoStudent[];
  const totalStudents = activeProgram.teachers.reduce(
    (sum, t) => sum + t.studentIds.length,
    0,
  );

  const switchProgram = (prog: DemoProgram) => {
    setActiveProgram(prog);
    setActiveTeacherId(prog.teachers[0].id);
    setSelectedStudent(null);
  };

  return (
    <div className="h-full flex gap-4 relative">
      {/* Left sub-nav */}
      <div className="w-44 flex-shrink-0 flex flex-col gap-1 pt-1">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2"
          style={{ color: C.textTertiary }}
        >
          Programs
        </p>
        {DEMO_PROGRAMS_P2.map((prog) => {
          const active = activeProgram.id === prog.id;
          const count = prog.teachers.reduce(
            (s, t) => s + t.studentIds.length,
            0,
          );
          return (
            <button
              key={prog.id}
              onClick={() => switchProgram(prog)}
              className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: active ? C.accentLight : "transparent",
                color: active ? C.accent : C.textSecondary,
                borderLeft: `2px solid ${active ? C.accent : "transparent"}`,
              }}
            >
              <span className="block truncate">{prog.name}</span>
              <span
                className="text-[10px]"
                style={{ color: active ? C.accentDark : C.textTertiary }}
              >
                {count} students
              </span>
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-4">
          <h1
            className="text-xl font-semibold tracking-tight"
            style={{ color: C.textPrimary }}
          >
            {activeProgram.name}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: C.textTertiary }}>
            {totalStudents} students enrolled
          </p>
        </div>

        {/* Teacher tabs */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {activeProgram.teachers.map((teacher) => {
            const active = activeTeacherId === teacher.id;
            return (
              <button
                key={teacher.id}
                onClick={() => setActiveTeacherId(teacher.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  backgroundColor: active ? C.accentLight : C.elevated,
                  border: `1px solid ${active ? C.accent : C.border}`,
                  color: active ? C.accent : C.textSecondary,
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{
                    backgroundColor: active ? C.accent : C.border,
                    color: active ? "#fff" : C.textTertiary,
                  }}
                >
                  {teacher.initials}
                </div>
                <div className="text-left">
                  <p>{teacher.name}</p>
                  <p className="text-[10px] opacity-70">{teacher.classroom}</p>
                </div>
                <span
                  className="ml-1 tabular-nums"
                  style={{ color: active ? C.accentDark : C.textTertiary }}
                >
                  {teacher.studentIds.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Student grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTeacherId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid gap-3"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            }}
          >
            {teacherStudents.map((student, i) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedStudent(student)}
                className="cursor-pointer rounded-xl p-4 flex flex-col items-center text-center transition-colors"
                style={{
                  backgroundColor: C.surface,
                  border: `1px solid ${C.border}`,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = C.borderStrong)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = C.border)
                }
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold mb-3"
                  style={{
                    backgroundColor: student.color + "22",
                    color: student.color,
                  }}
                >
                  {student.initials}
                </div>
                <p
                  className="text-sm font-semibold leading-tight mb-1"
                  style={{ color: C.textPrimary }}
                >
                  {student.name}
                </p>
                <p className="text-xs" style={{ color: C.textTertiary }}>
                  {student.grade}
                </p>
                <p
                  className="text-[10px] mt-0.5"
                  style={{ color: C.textTertiary }}
                >
                  {student.dob}
                </p>
                {HEALTH_FLAGS.some((f) => student[f.key]) && (
                  <div className="flex items-center gap-1 mt-2">
                    {HEALTH_FLAGS.filter((f) => student[f.key]).map((f) => (
                      <span
                        key={f.key}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: f.color }}
                        title={f.label}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
            {teacherStudents.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-sm" style={{ color: C.textTertiary }}>
                  No students assigned
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedStudent && (
          <StudentDetailPanel
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Phase 3 demo data ────────────────────────────────────────────────────────

const DEMO_TRANSACTIONS = [
  {
    id: "t1",
    payerName: "Sarah Richardson",
    payerEmail: "sarah.r@email.com",
    childName: "Emma Richardson",
    amount: 1800,
    type: "tuition",
    status: "succeeded",
    date: "Apr 1, 2026",
    program: "school_year",
    method: "card",
    stripeId: "pi_3OxK...aA1b",
  },
  {
    id: "t2",
    payerName: "Miguel Torres",
    payerEmail: "mig.t@email.com",
    childName: "Liam Torres",
    amount: 900,
    type: "deposit",
    status: "succeeded",
    date: "Mar 29, 2026",
    program: "both",
    method: "card",
    stripeId: "pi_3OxJ...bB2c",
  },
  {
    id: "t3",
    payerName: "Jennifer Chen",
    payerEmail: "jchen@email.com",
    childName: "Ava Chen",
    amount: 900,
    type: "tuition",
    status: "succeeded",
    date: "Apr 1, 2026",
    program: "summer",
    method: "card",
    stripeId: "pi_3OxI...cC3d",
  },
  {
    id: "t4",
    payerName: "Priya Patel",
    payerEmail: "ppatel@email.com",
    childName: "Raj Patel",
    amount: 1800,
    type: "tuition",
    status: "succeeded",
    date: "Apr 1, 2026",
    program: "school_year",
    method: "ach",
    stripeId: "pi_3OxH...dD4e",
  },
  {
    id: "t5",
    payerName: "Jerome Watkins",
    payerEmail: "jwatkins@email.com",
    childName: "Tyler Watkins",
    amount: 500,
    type: "registration",
    status: "succeeded",
    date: "Mar 25, 2026",
    program: "both",
    method: "card",
    stripeId: "pi_3OxG...eE5f",
  },
  {
    id: "t6",
    payerName: "Diana Foster",
    payerEmail: "diana@email.com",
    childName: "Noah Foster",
    amount: 900,
    type: "tuition",
    status: "succeeded",
    date: "Apr 1, 2026",
    program: "summer",
    method: "card",
    stripeId: "pi_3OxF...fF6g",
  },
  {
    id: "t7",
    payerName: "Kevin Johnson",
    payerEmail: "kjohnson@email.com",
    childName: "Mia Johnson",
    amount: 1800,
    type: "tuition",
    status: "succeeded",
    date: "Apr 1, 2026",
    program: "school_year",
    method: "card",
    stripeId: "pi_3OxE...gG7h",
  },
  {
    id: "t8",
    payerName: "Tara Williams",
    payerEmail: "twilliams@email.com",
    childName: "Lucas Williams",
    amount: 900,
    type: "deposit",
    status: "succeeded",
    date: "Mar 28, 2026",
    program: "both",
    method: "card",
    stripeId: "pi_3OxD...hH8i",
  },
  {
    id: "t9",
    payerName: "Mark Davis",
    payerEmail: "mdavis@email.com",
    childName: "Harper Davis",
    amount: 1800,
    type: "tuition",
    status: "succeeded",
    date: "Apr 1, 2026",
    program: "school_year",
    method: "card",
    stripeId: "pi_3OxC...iI9j",
  },
  {
    id: "t10",
    payerName: "Grace Thompson",
    payerEmail: "gthompson@email.com",
    childName: "Aiden Thompson",
    amount: 900,
    type: "tuition",
    status: "succeeded",
    date: "Apr 1, 2026",
    program: "summer",
    method: "ach",
    stripeId: "pi_3OxB...jJ0k",
  },
  {
    id: "t11",
    payerName: "David Wright",
    payerEmail: "dwright@email.com",
    childName: "Mason Wright",
    amount: 900,
    type: "tuition",
    status: "processing",
    date: "Apr 5, 2026",
    program: "both",
    method: "ach",
    stripeId: "pi_3OxA...kK1l",
  },
  {
    id: "t12",
    payerName: "Angela Lee",
    payerEmail: "alee@email.com",
    childName: "Sebastian Lee",
    amount: 1800,
    type: "tuition",
    status: "failed",
    date: "Apr 2, 2026",
    program: "both",
    method: "card",
    stripeId: "pi_3Ox9...lL2m",
  },
];

const TX_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  tuition: { bg: C.accentLight, text: C.accent },
  deposit: { bg: C.infoBg, text: C.info },
  registration: { bg: C.purpleBg, text: C.purple },
};
const TX_STATUS_COLORS: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  succeeded: { bg: C.successBg, border: C.successBorder, text: C.success },
  processing: { bg: C.warningBg, border: C.warningBorder, text: C.warning },
  failed: { bg: C.errorBg, border: C.errorBorder, text: C.error },
};

type TuitionItem = {
  label: string;
  state: "paid" | "sent" | "unpaid";
  date?: string;
};
type ChecklistParent = {
  id: string;
  name: string;
  initials: string;
  color: string;
  upToDate: boolean;
  summer: TuitionItem[];
  schoolYear: TuitionItem[];
};

const DEMO_CHECKLIST: ChecklistParent[] = [
  {
    id: "cp1",
    name: "Sarah Richardson",
    initials: "SR",
    color: "#5E7C68",
    upToDate: true,
    summer: [
      { label: "Registration Fee", state: "paid", date: "Jan 15" },
      ...Array.from({ length: 12 }, (_, i) => ({
        label: `Week ${i + 1}`,
        state: i < 8 ? ("paid" as const) : ("unpaid" as const),
        date:
          i < 8
            ? `May ${10 + i * 7 > 31 ? 10 + i * 7 - 31 : 10 + i * 7}`
            : undefined,
      })),
    ],
    schoolYear: [
      { label: "Registration Fee", state: "paid", date: "Nov 1" },
      { label: "Supply Fee", state: "paid", date: "Nov 1" },
      ...[
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
      ].map((m, i) => ({
        label: `${m} Tuition`,
        state:
          i < 6
            ? ("paid" as const)
            : i === 6
              ? ("sent" as const)
              : ("unpaid" as const),
        date: i < 6 ? `${m} 1` : undefined,
      })),
    ],
  },
  {
    id: "cp2",
    name: "Miguel Torres",
    initials: "MT",
    color: "#38BDF8",
    upToDate: false,
    summer: [
      { label: "Registration Fee", state: "paid", date: "Dec 20" },
      ...Array.from({ length: 12 }, (_, i) => ({
        label: `Week ${i + 1}`,
        state:
          i < 5
            ? ("paid" as const)
            : i === 5
              ? ("sent" as const)
              : ("unpaid" as const),
        date: i < 5 ? `May ${10 + i * 7}` : undefined,
      })),
    ],
    schoolYear: [
      { label: "Registration Fee", state: "paid", date: "Dec 1" },
      { label: "Supply Fee", state: "paid", date: "Dec 1" },
      ...[
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
      ].map((m, i) => ({
        label: `${m} Tuition`,
        state: i < 5 ? ("paid" as const) : ("unpaid" as const),
        date: i < 5 ? `${m} 1` : undefined,
      })),
    ],
  },
  {
    id: "cp3",
    name: "Diana Foster",
    initials: "DF",
    color: "#F59E0B",
    upToDate: true,
    summer: [
      { label: "Registration Fee", state: "paid", date: "Jan 15" },
      ...Array.from({ length: 12 }, (_, i) => ({
        label: `Week ${i + 1}`,
        state: i < 10 ? ("paid" as const) : ("unpaid" as const),
        date:
          i < 10
            ? `May ${10 + i * 7 > 62 ? 10 + i * 7 - 62 : 10 + i * 7}`
            : undefined,
      })),
    ],
    schoolYear: [],
  },
  {
    id: "cp4",
    name: "Jerome Watkins",
    initials: "JW",
    color: "#22C55E",
    upToDate: true,
    summer: [
      { label: "Registration Fee", state: "paid", date: "Feb 10" },
      ...Array.from({ length: 12 }, (_, i) => ({
        label: `Week ${i + 1}`,
        state: "paid" as const,
        date: `May ${10 + i * 7 > 62 ? "Jun" : "May"} ${(10 + i * 7) % 31 || 31}`,
      })),
    ],
    schoolYear: [
      { label: "Registration Fee", state: "paid", date: "Feb 10" },
      { label: "Supply Fee", state: "paid", date: "Feb 10" },
      ...[
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
      ].map((m, i) => ({
        label: `${m} Tuition`,
        state: "paid" as const,
        date: `${m} 1`,
      })),
    ],
  },
];

const BUDGET_CATS = [
  {
    name: "Personnel",
    emoji: "👥",
    planned: 24000,
    actual: 17280,
    color: C.accent,
  },
  {
    name: "Facilities",
    emoji: "🏫",
    planned: 8400,
    actual: 4872,
    color: C.info,
  },
  {
    name: "Program Supplies",
    emoji: "📚",
    planned: 3200,
    actual: 2912,
    color: C.warning,
  },
  {
    name: "Operations",
    emoji: "⚙️",
    planned: 4800,
    actual: 2112,
    color: C.purple,
  },
  {
    name: "Marketing",
    emoji: "📣",
    planned: 2000,
    actual: 600,
    color: C.accentBright,
  },
  {
    name: "Other",
    emoji: "📦",
    planned: 1600,
    actual: 240,
    color: C.textTertiary,
  },
];

const DEMO_EXPENSES = [
  {
    id: "ex1",
    category: "Personnel",
    description: "Teacher salaries — March",
    amount: 5800,
    date: "Mar 31, 2026",
    receipt: "payroll_mar.pdf",
  },
  {
    id: "ex2",
    category: "Facilities",
    description: "Monthly rent",
    amount: 1400,
    date: "Apr 1, 2026",
    receipt: "rent_apr.pdf",
  },
  {
    id: "ex3",
    category: "Program Supplies",
    description: "Art & craft materials Q2",
    amount: 487,
    date: "Mar 28, 2026",
    receipt: "michaels_receipt.pdf",
  },
  {
    id: "ex4",
    category: "Operations",
    description: "Liability insurance — Q2",
    amount: 620,
    date: "Apr 1, 2026",
    receipt: "insurance_q2.pdf",
  },
  {
    id: "ex5",
    category: "Personnel",
    description: "Aide support hours — March",
    amount: 1280,
    date: "Mar 31, 2026",
    receipt: "aide_mar.pdf",
  },
  {
    id: "ex6",
    category: "Marketing",
    description: "Spring flyer printing",
    amount: 180,
    date: "Mar 22, 2026",
    receipt: "print_shop.pdf",
  },
  {
    id: "ex7",
    category: "Facilities",
    description: "Utilities — March",
    amount: 312,
    date: "Mar 31, 2026",
    receipt: null,
  },
  {
    id: "ex8",
    category: "Program Supplies",
    description: "Curriculum workbooks",
    amount: 224,
    date: "Mar 15, 2026",
    receipt: "curriculum.pdf",
  },
  {
    id: "ex9",
    category: "Operations",
    description: "Software subscriptions (Zoom, G Suite)",
    amount: 89,
    date: "Apr 1, 2026",
    receipt: null,
  },
  {
    id: "ex10",
    category: "Personnel",
    description: "Staff professional development",
    amount: 400,
    date: "Mar 20, 2026",
    receipt: "pd_workshop.pdf",
  },
];

const DEMO_INCOME = [
  {
    id: "in1",
    source: "Tuition",
    description: "April tuition — school year families",
    amount: 21600,
    date: "Apr 1, 2026",
    program: "school_year_26_27",
  },
  {
    id: "in2",
    source: "Tuition",
    description: "April tuition — summer families",
    amount: 8100,
    date: "Apr 1, 2026",
    program: "summer_26",
  },
  {
    id: "in3",
    source: "Tuition",
    description: "March tuition — school year families",
    amount: 21600,
    date: "Mar 1, 2026",
    program: "school_year_26_27",
  },
  {
    id: "in4",
    source: "Deposit",
    description: "Enrollment deposits — spring cycle",
    amount: 3500,
    date: "Mar 18, 2026",
    program: "both",
  },
  {
    id: "in5",
    source: "Tuition",
    description: "Feb tuition — school year families",
    amount: 19800,
    date: "Feb 1, 2026",
    program: "school_year_26_27",
  },
  {
    id: "in6",
    source: "Donation",
    description: "Annual fund contribution — Anonymous",
    amount: 2500,
    date: "Mar 10, 2026",
    program: "",
  },
  {
    id: "in7",
    source: "Tuition",
    description: "Jan tuition — school year families",
    amount: 19800,
    date: "Jan 1, 2026",
    program: "school_year_26_27",
  },
  {
    id: "in8",
    source: "Donation",
    description: "Spring gala proceeds",
    amount: 4200,
    date: "Feb 22, 2026",
    program: "",
  },
];

type CalEvent = {
  id: string;
  title: string;
  date: string;
  color: string;
  category: string;
  isAllDay: boolean;
  startTime?: string;
  endTime?: string;
  program: string;
};

const DEMO_CAL_EVENTS: CalEvent[] = [
  {
    id: "ce1",
    title: "Staff Planning Meeting",
    date: "2026-04-07",
    color: "#5E7C68",
    category: "Staff Meeting",
    isAllDay: false,
    startTime: "08:30",
    endTime: "10:00",
    program: "both",
  },
  {
    id: "ce2",
    title: "Q2 Newsletter Deadline",
    date: "2026-04-09",
    color: "#EF4444",
    category: "Deadline",
    isAllDay: true,
    program: "both",
  },
  {
    id: "ce3",
    title: "Campus Family Open Day",
    date: "2026-04-12",
    color: "#F59E0B",
    category: "Parent Event",
    isAllDay: false,
    startTime: "10:00",
    endTime: "13:00",
    program: "both",
  },
  {
    id: "ce4",
    title: "Info Session",
    date: "2026-04-18",
    color: "#38BDF8",
    category: "Parent Event",
    isAllDay: false,
    startTime: "18:00",
    endTime: "19:30",
    program: "both",
  },
  {
    id: "ce5",
    title: "School Year Enrollment Closes",
    date: "2026-04-30",
    color: "#EF4444",
    category: "Deadline",
    isAllDay: true,
    program: "school_year_26_27",
  },
  {
    id: "ce6",
    title: "Teacher Training Day",
    date: "2026-04-14",
    color: "#8B5CF6",
    category: "Staff Meeting",
    isAllDay: true,
    program: "both",
  },
  {
    id: "ce7",
    title: "Spring Field Trip",
    date: "2026-04-22",
    color: "#22C55E",
    category: "Field Trip",
    isAllDay: false,
    startTime: "09:00",
    endTime: "14:00",
    program: "school_year_26_27",
  },
  {
    id: "ce8",
    title: "Summer Program Orientation",
    date: "2026-05-20",
    color: "#5E7C68",
    category: "Parent Event",
    isAllDay: false,
    startTime: "09:00",
    endTime: "11:00",
    program: "summer_26",
  },
  {
    id: "ce9",
    title: "Summer Program Begins",
    date: "2026-05-26",
    color: "#22C55E",
    category: "Academic",
    isAllDay: true,
    program: "summer_26",
  },
  {
    id: "ce10",
    title: "End-of-Year Showcase",
    date: "2026-05-08",
    color: "#F59E0B",
    category: "Parent Event",
    isAllDay: false,
    startTime: "14:00",
    endTime: "17:00",
    program: "school_year_26_27",
  },
  {
    id: "ce11",
    title: "Parent-Teacher Conferences",
    date: "2026-04-16",
    color: "#38BDF8",
    category: "Academic",
    isAllDay: false,
    startTime: "13:00",
    endTime: "18:00",
    program: "both",
  },
  {
    id: "ce12",
    title: "Board Meeting",
    date: "2026-04-21",
    color: "#525252",
    category: "Internal",
    isAllDay: false,
    startTime: "17:00",
    endTime: "19:00",
    program: "both",
  },
  {
    id: "ce13",
    title: "Spring Break Begins",
    date: "2026-04-10",
    color: "#8B5CF6",
    category: "Holiday",
    isAllDay: true,
    program: "school_year_26_27",
  },
  {
    id: "ce14",
    title: "Spring Break Ends",
    date: "2026-04-17",
    color: "#8B5CF6",
    category: "Holiday",
    isAllDay: true,
    program: "school_year_26_27",
  },
  {
    id: "ce15",
    title: "Supply Order Deadline",
    date: "2026-04-25",
    color: "#EF4444",
    category: "Deadline",
    isAllDay: true,
    program: "both",
  },
  {
    id: "ce16",
    title: "Open House",
    date: "2026-04-25",
    color: "#F59E0B",
    category: "Parent Event",
    isAllDay: false,
    startTime: "11:00",
    endTime: "14:00",
    program: "both",
  },
  {
    id: "ce17",
    title: "Staff Appreciation Day",
    date: "2026-05-01",
    color: "#22C55E",
    category: "Internal",
    isAllDay: true,
    program: "both",
  },
  {
    id: "ce18",
    title: "Graduation Ceremony",
    date: "2026-05-15",
    color: "#5E7C68",
    category: "Academic",
    isAllDay: false,
    startTime: "10:00",
    endTime: "12:00",
    program: "school_year_26_27",
  },
  {
    id: "ce19",
    title: "Spring Semester Review",
    date: "2026-04-01",
    color: "#5E7C68",
    category: "Staff Meeting",
    isAllDay: false,
    startTime: "09:00",
    endTime: "10:30",
    program: "both",
  },
  {
    id: "ce20",
    title: "Enrollment Webinar",
    date: "2026-04-03",
    color: "#38BDF8",
    category: "Parent Event",
    isAllDay: false,
    startTime: "18:30",
    endTime: "19:30",
    program: "both",
  },
  {
    id: "ce21",
    title: "Emergency Drill",
    date: "2026-04-23",
    color: "#525252",
    category: "Internal",
    isAllDay: false,
    startTime: "10:00",
    endTime: "10:30",
    program: "both",
  },
  {
    id: "ce22",
    title: "Curriculum Night",
    date: "2026-04-24",
    color: "#F59E0B",
    category: "Parent Event",
    isAllDay: false,
    startTime: "18:00",
    endTime: "20:00",
    program: "school_year_26_27",
  },
  {
    id: "ce23",
    title: "Budget Review",
    date: "2026-04-28",
    color: "#525252",
    category: "Internal",
    isAllDay: false,
    startTime: "14:00",
    endTime: "15:30",
    program: "both",
  },
  {
    id: "ce24",
    title: "Student Art Show",
    date: "2026-04-29",
    color: "#EC4899",
    category: "Academic",
    isAllDay: false,
    startTime: "16:00",
    endTime: "18:00",
    program: "school_year_26_27",
  },
  {
    id: "ce25",
    title: "Teacher Planning Day",
    date: "2026-05-05",
    color: "#8B5CF6",
    category: "Staff Meeting",
    isAllDay: true,
    program: "both",
  },
  {
    id: "ce26",
    title: "Spring Concert",
    date: "2026-05-12",
    color: "#F97316",
    category: "Academic",
    isAllDay: false,
    startTime: "18:00",
    endTime: "20:00",
    program: "school_year_26_27",
  },
  {
    id: "ce27",
    title: "Parent Q&A Lunch",
    date: "2026-05-19",
    color: "#38BDF8",
    category: "Parent Event",
    isAllDay: false,
    startTime: "12:00",
    endTime: "13:30",
    program: "both",
  },
  {
    id: "ce28",
    title: "Field Day",
    date: "2026-05-22",
    color: "#22C55E",
    category: "Field Trip",
    isAllDay: false,
    startTime: "09:00",
    endTime: "15:00",
    program: "school_year_26_27",
  },
  {
    id: "ce29",
    title: "Staff End-of-Year Breakfast",
    date: "2026-05-27",
    color: "#5E7C68",
    category: "Staff Meeting",
    isAllDay: false,
    startTime: "08:00",
    endTime: "09:30",
    program: "both",
  },
  {
    id: "ce30",
    title: "Report Cards Sent",
    date: "2026-05-29",
    color: "#EF4444",
    category: "Deadline",
    isAllDay: true,
    program: "school_year_26_27",
  },
  {
    id: "ce31",
    title: "Summer Kickoff Party",
    date: "2026-06-03",
    color: "#F59E0B",
    category: "Parent Event",
    isAllDay: false,
    startTime: "10:00",
    endTime: "13:00",
    program: "summer_26",
  },
  {
    id: "ce32",
    title: "Summer Staff Training",
    date: "2026-06-10",
    color: "#8B5CF6",
    category: "Staff Meeting",
    isAllDay: false,
    startTime: "09:00",
    endTime: "12:00",
    program: "both",
  },
  // ── Dense events for Apr 20–26 week (default week view) ──
  {
    id: "ce33",
    title: "Morning Circle",
    date: "2026-04-20",
    color: "#5E7C68",
    category: "Academic",
    isAllDay: false,
    startTime: "08:00",
    endTime: "08:45",
    program: "school_year_26_27",
  },
  {
    id: "ce34",
    title: "Parent Orientation Call",
    date: "2026-04-20",
    color: "#38BDF8",
    category: "Parent Event",
    isAllDay: false,
    startTime: "10:00",
    endTime: "11:00",
    program: "both",
  },
  {
    id: "ce35",
    title: "Curriculum Planning",
    date: "2026-04-20",
    color: "#8B5CF6",
    category: "Staff Meeting",
    isAllDay: false,
    startTime: "13:30",
    endTime: "15:00",
    program: "both",
  },
  {
    id: "ce36",
    title: "Reading Groups",
    date: "2026-04-21",
    color: "#22C55E",
    category: "Academic",
    isAllDay: false,
    startTime: "09:00",
    endTime: "10:30",
    program: "school_year_26_27",
  },
  {
    id: "ce37",
    title: "Summer Intake Review",
    date: "2026-04-21",
    color: "#F59E0B",
    category: "Internal",
    isAllDay: false,
    startTime: "11:00",
    endTime: "12:00",
    program: "summer_26",
  },
  {
    id: "ce38",
    title: "1:1 Family Check-In — Rivera",
    date: "2026-04-21",
    color: "#EC4899",
    category: "Parent Event",
    isAllDay: false,
    startTime: "14:00",
    endTime: "14:30",
    program: "summer_26",
  },
  {
    id: "ce39",
    title: "Math Workshop",
    date: "2026-04-22",
    color: "#5E7C68",
    category: "Academic",
    isAllDay: false,
    startTime: "08:30",
    endTime: "09:30",
    program: "school_year_26_27",
  },
  {
    id: "ce40",
    title: "Staff Check-In",
    date: "2026-04-22",
    color: "#525252",
    category: "Staff Meeting",
    isAllDay: false,
    startTime: "11:30",
    endTime: "12:00",
    program: "both",
  },
  {
    id: "ce41",
    title: "After-School Enrichment",
    date: "2026-04-22",
    color: "#F97316",
    category: "Academic",
    isAllDay: false,
    startTime: "15:00",
    endTime: "17:00",
    program: "both",
  },
  {
    id: "ce42",
    title: "OT Session — Marcus",
    date: "2026-04-23",
    color: "#8B5CF6",
    category: "Academic",
    isAllDay: false,
    startTime: "09:00",
    endTime: "09:30",
    program: "school_year_26_27",
  },
  {
    id: "ce43",
    title: "Science Lab",
    date: "2026-04-23",
    color: "#22C55E",
    category: "Academic",
    isAllDay: false,
    startTime: "10:00",
    endTime: "11:30",
    program: "school_year_26_27",
  },
  {
    id: "ce44",
    title: "Finance Call",
    date: "2026-04-23",
    color: "#525252",
    category: "Internal",
    isAllDay: false,
    startTime: "14:30",
    endTime: "15:30",
    program: "both",
  },
  {
    id: "ce45",
    title: "Art & Music Block",
    date: "2026-04-24",
    color: "#EC4899",
    category: "Academic",
    isAllDay: false,
    startTime: "08:30",
    endTime: "10:00",
    program: "school_year_26_27",
  },
  {
    id: "ce46",
    title: "Enrollment Q&A",
    date: "2026-04-24",
    color: "#38BDF8",
    category: "Parent Event",
    isAllDay: false,
    startTime: "12:00",
    endTime: "13:00",
    program: "both",
  },
  {
    id: "ce47",
    title: "Speech Therapy — Jordan",
    date: "2026-04-24",
    color: "#F59E0B",
    category: "Academic",
    isAllDay: false,
    startTime: "15:00",
    endTime: "15:45",
    program: "summer_26",
  },
  {
    id: "ce48",
    title: "Community Garden Day",
    date: "2026-04-25",
    color: "#22C55E",
    category: "Field Trip",
    isAllDay: false,
    startTime: "09:00",
    endTime: "12:00",
    program: "school_year_26_27",
  },
  {
    id: "ce49",
    title: "Staff Development",
    date: "2026-04-25",
    color: "#8B5CF6",
    category: "Staff Meeting",
    isAllDay: false,
    startTime: "13:00",
    endTime: "15:00",
    program: "both",
  },
  {
    id: "ce50",
    title: "Parent-Teacher Prep",
    date: "2026-04-26",
    color: "#5E7C68",
    category: "Internal",
    isAllDay: false,
    startTime: "10:00",
    endTime: "11:30",
    program: "school_year_26_27",
  },
];

const DEMO_EMAILS = [
  {
    id: "em1",
    to: "All Summer 2026 Families",
    from: "admin@mudkitchen.co",
    subject: "Summer 2026 Orientation — May 20th Details",
    preview:
      "We are excited to welcome your family to our Summer 2026 orientation on May 20th at 9 AM...",
    date: "2 days ago",
    body: `<p>Dear Summer 2026 Families,</p><p>We are thrilled to welcome you to our Summer 2026 Orientation on <strong>May 20th at 9:00 AM</strong> in the Main Hall.</p><p>Please bring a valid photo ID and your signed enrollment forms. Light refreshments will be provided.</p><p>If you have any questions, please do not hesitate to reach out.</p><p>Warm regards,<br/>Mud Kitchen Admin Team</p>`,
    attachments: ["orientation_agenda.pdf"],
  },
  {
    id: "em2",
    to: "sarah.r@email.com",
    from: "admin@mudkitchen.co",
    subject: "Emma Richardson — April Progress Update",
    preview:
      "We wanted to share a quick update on Emma's wonderful progress this month...",
    date: "4 days ago",
    body: `<p>Dear Sarah,</p><p>We wanted to share a quick update on Emma's wonderful progress this month. She has been an absolute joy in the classroom — her reading fluency has improved significantly, and she's been a kind leader during group activities.</p><p>We look forward to celebrating her growth at our end-of-year showcase!</p><p>Best,<br/>Ms. Taylor Reyes</p>`,
    attachments: [],
  },
  {
    id: "em3",
    to: "All Enrolled Families",
    from: "admin@mudkitchen.co",
    subject: "April Newsletter — Spring Events & Updates",
    preview:
      "Spring is here! Check out our upcoming events, curriculum highlights, and important dates...",
    date: "1 week ago",
    body: `<p>Dear Mud Kitchen Families,</p><h3>🌸 Spring Events</h3><ul><li>April 22 — Spring Field Trip</li><li>April 25 — Open House (11 AM – 2 PM)</li><li>May 8 — End-of-Year Showcase</li></ul><h3>📚 Curriculum Spotlight</h3><p>This month we're exploring nature journaling and community helpers. Students have been amazing!</p><p>Thank you for your continued support.</p><p>The Mud Kitchen Team</p>`,
    attachments: ["april_newsletter.pdf", "spring_calendar.pdf"],
  },
  {
    id: "em4",
    to: "diana@email.com",
    from: "admin@mudkitchen.co",
    subject: "Re: Noah Foster — Summer Enrollment Confirmation",
    preview:
      "Hi Diana, confirming that Noah's enrollment for Summer 2026 is complete...",
    date: "1 week ago",
    body: `<p>Hi Diana,</p><p>Great news — Noah's Summer 2026 enrollment is officially confirmed! Here's a summary:</p><ul><li><strong>Program:</strong> Summer 2026</li><li><strong>Start Date:</strong> May 26, 2026</li><li><strong>Classroom:</strong> Room A (Pre-K – 2nd)</li><li><strong>Teacher:</strong> Ms. Taylor Reyes</li></ul><p>We can't wait to see Noah flourish this summer!</p><p>Warm regards,<br/>Mud Kitchen Admin</p>`,
    attachments: [],
  },
  {
    id: "em5",
    to: "All School Year Families",
    from: "admin@mudkitchen.co",
    subject: "Important: Enrollment Closing April 30th",
    preview:
      "A reminder that open enrollment for School Year 2026–27 closes on April 30th...",
    date: "2 weeks ago",
    body: `<p>Dear School Year Families,</p><p>This is a friendly reminder that <strong>open enrollment for School Year 2026–27 closes on April 30th</strong>.</p><p>If you have friends or family interested in Mud Kitchen, please share our enrollment link before the deadline.</p><p>Current families: your spots are secured — no action needed.</p><p>Thank you!</p>`,
    attachments: [],
  },
  {
    id: "em6",
    to: "kokonkwo@email.com",
    from: "admin@mudkitchen.co",
    subject: "Chidera Okonkwo — Application Status Update",
    preview:
      "We've received Chidera's application and our team is currently reviewing it...",
    date: "2 weeks ago",
    body: `<p>Dear Kevin,</p><p>Thank you for submitting Chidera's application for the School Year 2026–27 program.</p><p>Our admissions team is currently reviewing the application. We aim to follow up within 5–7 business days.</p><p>In the meantime, feel free to reach out with any questions.</p><p>Best,<br/>Mud Kitchen Admissions</p>`,
    attachments: [],
  },
  {
    id: "em7",
    to: "All Families",
    from: "admin@mudkitchen.co",
    subject: "Open House Reminder — April 25th",
    preview:
      "Just a reminder about our Open House this Saturday from 11 AM to 2 PM...",
    date: "3 weeks ago",
    body: `<p>Dear Mud Kitchen Community,</p><p>Don't forget — our <strong>Spring Open House is this Saturday, April 25th from 11 AM to 2 PM</strong>!</p><p>Tours, Q&A with teachers, student art displays, and light refreshments.</p><p>Bring a friend who's curious about Mud Kitchen — we'd love to meet them.</p><p>See you there!</p>`,
    attachments: [],
  },
  {
    id: "em8",
    to: "All Staff",
    from: "admin@mudkitchen.co",
    subject: "Staff Meeting Recap — April 7th",
    preview:
      "Thanks everyone for a productive planning session. Here are the key takeaways...",
    date: "1 month ago",
    body: `<p>Team,</p><p>Thank you for a great planning session! Key decisions from today:</p><ul><li>Summer curriculum finalized — workbooks ordered</li><li>Field trip date confirmed: April 22nd</li><li>Teacher appreciation week: May 4–8</li><li>End-of-year showcase: May 8th at 2 PM</li></ul><p>Action items sent individually. See you next week!</p>`,
    attachments: ["meeting_notes.pdf"],
  },
];

// ─── Marketing automation pipeline data ──────────────────────────────────────────────

type AutomationStep = {
  type: "email" | "sms" | "wait" | "condition";
  label: string;
  delay?: string;
  subject?: string;
  body?: string;
  sent?: number;
  opened?: number;
  clicked?: number;
};

type AutomationPipeline = {
  id: string;
  name: string;
  description: string;
  audience: string;
  trigger: string;
  status: "active" | "paused" | "draft";
  steps: AutomationStep[];
  stats: {
    enrolled: number;
    sent: number;
    openRate: number;
    clickRate: number;
    conversions: number;
  };
  audienceColor: string;
};

type WizardState = {
  step: 1 | 2 | 3 | 4 | 5;
  templateId: string | null;
  triggerKey: string | null;
  audienceKey: string | null;
  programFilters: string[];
  ageFilters: string[];
  flowSteps: AutomationStep[];
  automationName: string;
  launchMode: "live" | "draft";
  launching: boolean;
  launched: boolean;
};

const WIZARD_TEMPLATES = [
  {
    id: "enroll-drip",
    name: "Fall Enrollment Drip",
    description: "Warm leads who haven't converted yet. A 6-touch sequence to drive enrollment.",
    color: "#F59E0B",
    steps: 6,
    openRate: 38,
    resultLabel: "34% conversion",
    recommended: false,
    defaultTriggerKey: "inquiry",
    defaultAudienceKey: "warm_leads",
    defaultAutomationName: "Fall Enrollment Drip – 2026",
    defaultSteps: [
      { type: "email" as const, label: "Welcome Email", delay: "Immediately", subject: "You're one step closer to Mud Kitchen", body: "Hi [First Name], thanks for reaching out! Here's everything you need to know about our programs." },
      { type: "wait" as const, label: "Wait 2 days", delay: "Day 2" },
      { type: "email" as const, label: "Program Guide", delay: "Day 2", subject: "Our programs, explained — which fits your child?", body: "We offer three learning tracks depending on age and learning style. Let's find the right fit." },
      { type: "wait" as const, label: "Wait 3 days", delay: "Day 5" },
      { type: "email" as const, label: "Tour Invite", delay: "Day 5", subject: "Come see Mud Kitchen in person", body: "Nothing beats seeing it for yourself. Book a campus tour at your convenience." },
      { type: "sms" as const, label: "SMS Nudge", delay: "Day 8", subject: "SMS: Final reminder", body: "Hi [First Name]! Just a quick note — enrollment spots are filling up. Reply to this message or book your tour online." },
    ],
  },
  {
    id: "tour-followup",
    name: "Tour Follow-Up",
    description: "Families who visited but haven't enrolled. A 3-touch sequence to close.",
    color: "#38BDF8",
    steps: 3,
    openRate: 52,
    resultLabel: "41% response",
    recommended: true,
    defaultTriggerKey: "tour_booked",
    defaultAudienceKey: "tour_visitors",
    defaultAutomationName: "Post-Tour Follow-Up",
    defaultSteps: [
      { type: "email" as const, label: "Thank You Email", delay: "Immediately", subject: "It was great meeting you!", body: "Hi [First Name], thank you for visiting our campus today! We hope you loved what you saw." },
      { type: "wait" as const, label: "Wait 3 days", delay: "Day 3" },
      { type: "email" as const, label: "Enrollment Nudge", delay: "Day 3", subject: "Ready to secure your spot?", body: "Enrollment for Fall 2026 is now open. Spots are limited — let us know if you have any questions!" },
    ],
  },
  {
    id: "welcome-series",
    name: "Welcome Series",
    description: "Onboard newly enrolled families with everything they need before day one.",
    color: "#22C55E",
    steps: 4,
    openRate: 89,
    resultLabel: "97% satisfaction",
    recommended: false,
    defaultTriggerKey: "enrolled",
    defaultAudienceKey: "enrolled",
    defaultAutomationName: "New Family Welcome Series",
    defaultSteps: [
      { type: "email" as const, label: "Welcome to the Family", delay: "Immediately", subject: "Welcome to Mud Kitchen! 🎉", body: "We're so excited to have you with us. Here's everything you need to know before your first day." },
      { type: "wait" as const, label: "Wait 3 days", delay: "Day 3" },
      { type: "email" as const, label: "Supply List & Schedule", delay: "Day 3", subject: "Your first-week checklist", body: "Here's what to bring, where to go, and who to contact. We want day one to be seamless." },
      { type: "email" as const, label: "Meet the Team", delay: "Day 7", subject: "Meet your teachers and staff", body: "Get to know the people who will be shaping your child's experience this year." },
    ],
  },
  {
    id: "re-engagement",
    name: "Re-engagement",
    description: "Cold leads who haven't interacted in 7+ days. A gentle reactivation sequence.",
    color: "#EF4444",
    steps: 3,
    openRate: 22,
    resultLabel: "18% reactivation",
    recommended: false,
    defaultTriggerKey: "cold_lead",
    defaultAudienceKey: "all_leads",
    defaultAutomationName: "Lead Re-engagement",
    defaultSteps: [
      { type: "email" as const, label: "Check-In Email", delay: "Immediately", subject: "Still thinking about Mud Kitchen?", body: "Hi [First Name], we noticed it's been a while. We'd love to answer any questions you might have." },
      { type: "wait" as const, label: "Wait 5 days", delay: "Day 5" },
      { type: "sms" as const, label: "SMS Reactivation", delay: "Day 5", subject: "SMS: Last chance to connect", body: "Hi [First Name], enrollment for Fall 2026 closes soon. If you're still interested, we'd love to chat!" },
    ],
  },
  {
    id: "waitlist-nurture",
    name: "Waitlist Nurture",
    description: "Keep waitlisted families warm and engaged until a spot opens.",
    color: "#8B5CF6",
    steps: 5,
    openRate: 61,
    resultLabel: "28% conversion",
    recommended: false,
    defaultTriggerKey: "manual",
    defaultAudienceKey: "waitlisted",
    defaultAutomationName: "Waitlist Stay-Warm Campaign",
    defaultSteps: [
      { type: "email" as const, label: "Waitlist Confirmation", delay: "Immediately", subject: "You're on the waitlist — here's what's next", body: "We've added you to our waitlist. As soon as a spot opens, you'll be the first to know." },
      { type: "wait" as const, label: "Wait 2 weeks", delay: "Week 2" },
      { type: "email" as const, label: "Community Update", delay: "Week 2", subject: "What's happening at Mud Kitchen this month", body: "Even while you wait, we want to keep you connected. Here's a peek at life inside our school." },
      { type: "wait" as const, label: "Wait 2 weeks", delay: "Week 4" },
      { type: "email" as const, label: "Spot Opening Alert", delay: "Week 4", subject: "A spot may be opening soon — are you still interested?", body: "We're expecting a spot to become available shortly. Can you confirm you're still interested in enrolling?" },
    ],
  },
  {
    id: "payment-reminder",
    name: "Payment Reminder",
    description: "Automated tuition reminders that reduce overdue balances and late collections.",
    color: "#F97316",
    steps: 2,
    openRate: 78,
    resultLabel: "94% collection",
    recommended: false,
    defaultTriggerKey: "payment_overdue",
    defaultAudienceKey: "enrolled",
    defaultAutomationName: "Tuition Payment Reminder",
    defaultSteps: [
      { type: "email" as const, label: "Payment Due Reminder", delay: "Immediately", subject: "Friendly reminder — tuition payment due", body: "Hi [First Name], just a quick reminder that your tuition payment is due. You can pay online in your parent portal." },
      { type: "sms" as const, label: "SMS Reminder", delay: "Day 3", subject: "SMS: Payment still outstanding", body: "Hi [First Name], your tuition payment is still outstanding. Please log in to your parent portal to pay now. Reply STOP to opt out." },
    ],
  },
];

const WIZARD_TRIGGERS = [
  { id: "inquiry", icon: "mail", title: "Family submits inquiry form", subtitle: "Triggers when a new lead fills out your inquiry or interest form." },
  { id: "tour_booked", icon: "phone", title: "Family books a tour", subtitle: "Triggers when a family schedules a campus visit." },
  { id: "enrolled", icon: "check", title: "Student is enrolled", subtitle: "Triggers the moment a student's enrollment is confirmed." },
  { id: "payment_overdue", icon: "credit", title: "Payment becomes overdue", subtitle: "Triggers when a tuition payment passes its due date." },
  { id: "cold_lead", icon: "clock", title: "Lead goes cold (7+ days no activity)", subtitle: "Triggers when a lead has not opened any emails or visited in 7+ days." },
  { id: "manual", icon: "zap", title: "Manually — I'll trigger it myself", subtitle: "You control when this sequence starts. Great for campaigns and events." },
];

const WIZARD_SEGMENTS = [
  { id: "all_leads", label: "All Leads", count: 47, description: "Every lead currently in your CRM" },
  { id: "warm_leads", label: "Warm Leads", count: 23, description: "Inquired within the last 30 days" },
  { id: "tour_visitors", label: "Tour Visitors", count: 12, description: "Visited campus but not yet enrolled" },
  { id: "waitlisted", label: "Waitlisted Families", count: 8, description: "On the waitlist pending availability" },
  { id: "enrolled", label: "Enrolled Families", count: 31, description: "Currently enrolled students & guardians" },
];

const WIZARD_PROGRAMS = ["Explorers", "Builders", "Pioneers"];
const WIZARD_AGE_GROUPS = ["Pre-K", "Elementary", "Middle"];

const WIZARD_STEP_TYPES: { type: AutomationStep["type"]; label: string; color: string }[] = [
  { type: "email", label: "Email", color: "#5E7C68" },
  { type: "sms", label: "SMS", color: "#38BDF8" },
  { type: "wait", label: "Wait", color: "#94a3b8" },
  { type: "condition", label: "Branch", color: "#8B5CF6" },
];

const CONFETTI_DOTS: { x: number; y: number; color: string }[] = [
  { x: -60, y: -55, color: "#5E7C68" },
  { x: 45, y: -70, color: "#38BDF8" },
  { x: 80, y: -40, color: "#F59E0B" },
  { x: -40, y: -80, color: "#8B5CF6" },
  { x: 20, y: -90, color: "#22C55E" },
  { x: -80, y: -30, color: "#F97316" },
  { x: 60, y: -65, color: "#EF4444" },
  { x: -20, y: -60, color: "#5E7C68" },
  { x: 100, y: -20, color: "#38BDF8" },
  { x: -100, y: -45, color: "#F59E0B" },
  { x: 30, y: -85, color: "#8B5CF6" },
  { x: -55, y: -75, color: "#22C55E" },
];

const DEMO_AUTOMATION_PIPELINES: AutomationPipeline[] = [
  {
    id: "ap1",
    name: "New Lead Welcome Sequence",
    description: "Automatically nurtures families from first inquiry to booking a tour.",
    audience: "New Leads",
    trigger: "Inquiry form submitted",
    status: "active",
    audienceColor: "#5E7C68",
    stats: { enrolled: 234, sent: 234, openRate: 42, clickRate: 18, conversions: 31 },
    steps: [
      {
        type: "email",
        label: "Welcome Email",
        delay: "Day 0",
        subject: "Welcome to Mud Kitchen — we’re so glad you reached out!",
        body: "Thanks for your interest in Mud Kitchen Academy. Here’s everything you need to know about our programs and next steps.",
        sent: 234,
        opened: 98,
        clicked: 42,
      },
      { type: "wait", label: "Wait 2 days", delay: "Day 0" },
      {
        type: "email",
        label: "Campus Tour Invite",
        delay: "Day 2",
        subject: "Come see Mud Kitchen in person — book your tour today",
        body: "We’d love to show you around. Campus tours are available weekday mornings and Saturday afternoons.",
        sent: 234,
        opened: 112,
        clicked: 67,
      },
      { type: "wait", label: "Wait 3 days", delay: "Day 2" },
      {
        type: "sms",
        label: "SMS Follow-Up",
        delay: "Day 5",
        subject: "Text: Haven’t heard back?",
        body: "Hi [First Name]! Just checking in — have you had a chance to book your campus tour? Reply STOP to opt out.",
        sent: 187,
        opened: 161,
        clicked: 54,
      },
      { type: "wait", label: "Wait 4 days", delay: "Day 5" },
      {
        type: "email",
        label: "Program Overview",
        delay: "Day 9",
        subject: "A look inside Mud Kitchen’s curriculum & community",
        body: "From Montessori-inspired learning to after-school enrichment, here’s what makes our school different.",
        sent: 187,
        opened: 74,
        clicked: 29,
      },
    ],
  },
  {
    id: "ap2",
    name: "Tour Follow-Up",
    description: "Sent after a campus tour to keep the family warm and move them toward applying.",
    audience: "Tour Completed",
    trigger: "Campus tour marked complete",
    status: "active",
    audienceColor: "#38BDF8",
    stats: { enrolled: 89, sent: 89, openRate: 58, clickRate: 31, conversions: 24 },
    steps: [
      {
        type: "email",
        label: "Thank You Email",
        delay: "Day 0",
        subject: "Thanks for visiting Mud Kitchen!",
        body: "It was wonderful meeting your family. Here’s a recap of everything we covered and how to apply.",
        sent: 89,
        opened: 52,
        clicked: 28,
      },
      { type: "wait", label: "Wait 3 days", delay: "Day 0" },
      {
        type: "email",
        label: "Application Nudge",
        delay: "Day 3",
        subject: "Ready to take the next step? Your application is waiting.",
        body: "Spots for the upcoming school year are filling up. Submit your application today to reserve your child’s place.",
        sent: 89,
        opened: 44,
        clicked: 31,
      },
      { type: "wait", label: "Wait 5 days", delay: "Day 3" },
      {
        type: "sms",
        label: "SMS Reminder",
        delay: "Day 8",
        subject: "Text: Application reminder",
        body: "Hi [First Name], just a friendly reminder — your Mud Kitchen application is only a few minutes away. Need help? Reply here.",
        sent: 63,
        opened: 58,
        clicked: 19,
      },
    ],
  },
  {
    id: "ap3",
    name: "Open House Blast",
    description: "One-time campaign sent to all prospective families to drive Open House attendance.",
    audience: "All Prospects",
    trigger: "Manual — sent to prospect list",
    status: "active",
    audienceColor: "#F59E0B",
    stats: { enrolled: 312, sent: 312, openRate: 51, clickRate: 22, conversions: 18 },
    steps: [
      {
        type: "email",
        label: "Save the Date",
        delay: "Day 0",
        subject: "You’re invited: Mud Kitchen Open House — April 25th",
        body: "Join us for a morning of campus tours, program demos, and Q&A with our teachers. Light refreshments provided.",
        sent: 312,
        opened: 159,
        clicked: 68,
      },
      { type: "wait", label: "Wait 5 days", delay: "Day 0" },
      {
        type: "email",
        label: "RSVP Reminder",
        delay: "Day 5",
        subject: "Don’t forget — RSVP for Open House closes soon",
        body: "We have limited spots available. RSVP by April 22nd to guarantee your family’s place.",
        sent: 312,
        opened: 141,
        clicked: 58,
      },
      { type: "wait", label: "Wait 4 days", delay: "Day 5" },
      {
        type: "sms",
        label: "Day-Before Reminder",
        delay: "Day 9",
        subject: "Text: Tomorrow — Open House at Mud Kitchen!",
        body: "Hi [First Name]! Excited to see you tomorrow at our Open House. Doors open at 11 AM. Questions? Reply here.",
        sent: 87,
        opened: 82,
        clicked: 14,
      },
    ],
  },
  {
    id: "ap4",
    name: "Enrollment Nudge",
    description: "Follows up with accepted families who haven’t yet paid their enrollment deposit.",
    audience: "Accepted — No Deposit",
    trigger: "Application accepted, deposit unpaid after 5 days",
    status: "active",
    audienceColor: "#8B5CF6",
    stats: { enrolled: 47, sent: 47, openRate: 66, clickRate: 44, conversions: 38 },
    steps: [
      {
        type: "email",
        label: "Deposit Reminder",
        delay: "Day 0",
        subject: "Your child’s spot is reserved — complete enrollment today",
        body: "Congratulations again on your acceptance to Mud Kitchen! To secure your child’s place, please submit the enrollment deposit.",
        sent: 47,
        opened: 31,
        clicked: 21,
      },
      { type: "wait", label: "Wait 3 days", delay: "Day 0" },
      {
        type: "sms",
        label: "Urgent SMS",
        delay: "Day 3",
        subject: "Text: Spot may be released soon",
        body: "Hi [First Name] — your Mud Kitchen enrollment spot expires in 48 hours. Submit your deposit to hold it. Need help? Reply here.",
        sent: 32,
        opened: 30,
        clicked: 18,
      },
      { type: "wait", label: "Wait 2 days", delay: "Day 3" },
      {
        type: "email",
        label: "Final Notice",
        delay: "Day 5",
        subject: "Last chance — your enrollment expires tomorrow",
        body: "We’d hate to lose you. If you need help with the deposit or have questions, please reach out to our admissions team directly.",
        sent: 19,
        opened: 13,
        clicked: 9,
      },
    ],
  },
  {
    id: "ap5",
    name: "Re-Engagement Campaign",
    description: "Attempts to re-engage cold leads who haven’t opened an email in 30+ days.",
    audience: "Cold Leads",
    trigger: "No email open in 30 days",
    status: "paused",
    audienceColor: "#EF4444",
    stats: { enrolled: 156, sent: 156, openRate: 19, clickRate: 7, conversions: 6 },
    steps: [
      {
        type: "email",
        label: "We Miss You",
        delay: "Day 0",
        subject: "Still interested in Mud Kitchen? We saved your spot.",
        body: "We noticed you haven’t been active in a while. We’d love to reconnect — here’s what’s new at Mud Kitchen this year.",
        sent: 156,
        opened: 30,
        clicked: 11,
      },
      { type: "wait", label: "Wait 5 days", delay: "Day 0" },
      {
        type: "email",
        label: "Last Chance",
        delay: "Day 5",
        subject: "One last thing before we stop reaching out...",
        body: "We don’t want to fill your inbox if this isn’t the right time. Let us know if you’d like to stay connected — or we’ll pause for now.",
        sent: 156,
        opened: 19,
        clicked: 8,
      },
      {
        type: "condition",
        label: "If no open → unsubscribe from sequence",
        delay: "Day 5",
      },
    ],
  },
  {
    id: "ap6",
    name: "Summer Program Promo",
    description: "Promotional campaign to drive summer program registrations from current and prospective families.",
    audience: "All Contacts",
    trigger: "Manual — scheduled for May 1",
    status: "draft",
    audienceColor: "#F59E0B",
    stats: { enrolled: 0, sent: 0, openRate: 0, clickRate: 0, conversions: 0 },
    steps: [
      {
        type: "email",
        label: "Summer Announcement",
        delay: "Day 0",
        subject: "Summer 2026 at Mud Kitchen — Registration is now open!",
        body: "Our summer program is back with new themes, field trips, and enrichment activities for ages 4–12.",
        sent: 0,
        opened: 0,
        clicked: 0,
      },
      { type: "wait", label: "Wait 7 days", delay: "Day 0" },
      {
        type: "email",
        label: "Early Bird Reminder",
        delay: "Day 7",
        subject: "Early bird pricing ends soon — register your child today",
        body: "Save $100 per child when you register before May 15th. Spots are limited — don’t miss out.",
        sent: 0,
        opened: 0,
        clicked: 0,
      },
      { type: "wait", label: "Wait 7 days", delay: "Day 7" },
      {
        type: "sms",
        label: "Last Chance SMS",
        delay: "Day 14",
        subject: "Text: Summer registration closing soon",
        body: "Hi [First Name]! Summer 2026 spots at Mud Kitchen are almost gone. Register before May 22nd to secure your spot.",
        sent: 0,
        opened: 0,
        clicked: 0,
      },
    ],
  },
];

// ─── Transactions page ─────────────────────────────────────────────────────────

function TransactionsPage() {
  const [tab, setTab] = useState<"all" | "checklist">("all");
  const [selectedTx, setSelectedTx] = useState<
    (typeof DEMO_TRANSACTIONS)[0] | null
  >(null);
  const { openBackdrop, closeBackdrop } = useContext(BackdropContext);
  useEffect(() => {
    if (selectedTx) openBackdrop(() => setSelectedTx(null));
    else closeBackdrop();
  }, [selectedTx]);
  const [selectedParent, setSelectedParent] = useState<ChecklistParent>(
    DEMO_CHECKLIST[0],
  );
  const [openSection, setOpenSection] = useState<"summer" | "schoolYear">(
    "summer",
  );

  const fmt = (cents: number) => `$${cents.toLocaleString()}`;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-start justify-between px-6 pt-6 mb-5">
        <div>
          <h1
            className="text-xl font-semibold tracking-tight"
            style={{ color: C.textPrimary }}
          >
            Transactions
          </h1>
          <p className="text-sm mt-0.5" style={{ color: C.textTertiary }}>
            {DEMO_TRANSACTIONS.length} total payments
          </p>
        </div>
        <div
          className="flex items-center gap-1 p-1 rounded-lg"
          style={{
            backgroundColor: C.elevated,
            border: `1px solid ${C.border}`,
          }}
        >
          {[
            { key: "all", label: "All Transactions" },
            { key: "checklist", label: "Tuition Checklist" },
          ].map((t) => (
            <button
              key={t.key}
              data-tour-id={`tx-tab-${t.key}`}
              onClick={() => setTab(t.key as "all" | "checklist")}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
              style={{
                backgroundColor: tab === t.key ? C.surface : "transparent",
                color: tab === t.key ? C.textPrimary : C.textTertiary,
                boxShadow: tab === t.key ? C.shadowCard : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === "all" && (
          <motion.div
            key="all"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-hidden"
            style={{ borderTop: `1px solid ${C.border}` }}
          >
            <div className="h-full overflow-hidden">
              <div className="overflow-x-auto h-full">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {[
                        "Type",
                        "Status",
                        "Payer",
                        "Child",
                        "Amount",
                        "Method",
                        "Date",
                      ].map((col) => (
                        <th
                          key={col}
                          className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest"
                          style={{ color: C.textTertiary }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_TRANSACTIONS.map((tx, i) => {
                      const tc = TX_TYPE_COLORS[tx.type] ?? {
                        bg: C.elevated,
                        text: C.textTertiary,
                      };
                      const sc = TX_STATUS_COLORS[tx.status] ?? {
                        bg: C.elevated,
                        border: C.border,
                        text: C.textTertiary,
                      };
                      return (
                        <motion.tr
                          key={tx.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => setSelectedTx(tx)}
                          className="cursor-pointer"
                          style={{ borderBottom: `1px solid ${C.border}` }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = C.elevated)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <td className="px-4 py-3">
                            <span
                              className="px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize"
                              style={{ backgroundColor: tc.bg, color: tc.text }}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize"
                              style={{
                                backgroundColor: sc.bg,
                                border: `1px solid ${sc.border}`,
                                color: sc.text,
                              }}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p
                              className="font-medium text-sm"
                              style={{ color: C.textPrimary }}
                            >
                              {tx.payerName}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: C.textTertiary }}
                            >
                              {tx.payerEmail}
                            </p>
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{ color: C.textSecondary }}
                          >
                            {tx.childName}
                          </td>
                          <td
                            className="px-4 py-3 text-sm font-bold tabular-nums"
                            style={{ color: C.textPrimary }}
                          >
                            {fmt(tx.amount)}
                          </td>
                          <td
                            className="px-4 py-3 text-xs uppercase"
                            style={{ color: C.textTertiary }}
                          >
                            {tx.method}
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{ color: C.textTertiary }}
                          >
                            {tx.date}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Transaction detail panel */}
            <AnimatePresence>
              {selectedTx && (
                <>
                  <motion.div
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                    className="absolute top-0 right-0 bottom-0 flex flex-col overflow-hidden"
                    style={{
                      width: 320,
                      backgroundColor: C.surface,
                      borderLeft: `1px solid ${C.border}`,
                      zIndex: 10,
                    }}
                  >
                  <div
                    className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: `1px solid ${C.border}` }}
                  >
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: C.textPrimary }}
                    >
                      Transaction Detail
                    </h3>
                    <button
                      onClick={() => setSelectedTx(null)}
                      style={{ color: C.textTertiary }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    <div
                      className="rounded-xl p-4"
                      style={{
                        backgroundColor: C.elevated,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <p
                        className="text-2xl font-bold tabular-nums mb-1"
                        style={{ color: C.textPrimary }}
                      >
                        ${selectedTx.amount.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize"
                          style={{
                            backgroundColor:
                              TX_TYPE_COLORS[selectedTx.type]?.bg,
                            color: TX_TYPE_COLORS[selectedTx.type]?.text,
                          }}
                        >
                          {selectedTx.type}
                        </span>
                        <span
                          className="px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize"
                          style={{
                            backgroundColor:
                              TX_STATUS_COLORS[selectedTx.status]?.bg,
                            border: `1px solid ${TX_STATUS_COLORS[selectedTx.status]?.border}`,
                            color: TX_STATUS_COLORS[selectedTx.status]?.text,
                          }}
                        >
                          {selectedTx.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <DetailField label="Payer" value={selectedTx.payerName} />
                      <DetailField
                        label="Email"
                        value={selectedTx.payerEmail}
                      />
                      <DetailField label="Child" value={selectedTx.childName} />
                      <DetailField label="Program" value={selectedTx.program} />
                      <DetailField
                        label="Method"
                        value={
                          <span className="uppercase">{selectedTx.method}</span>
                        }
                      />
                      <DetailField label="Date" value={selectedTx.date} />
                    </div>
                    <div
                      className="rounded-lg p-3"
                      style={{
                        backgroundColor: C.elevated,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <p
                        className="text-[10px] font-semibold uppercase tracking-widest mb-2"
                        style={{ color: C.textTertiary }}
                      >
                        Stripe ID
                      </p>
                      <p
                        className="text-xs font-mono"
                        style={{ color: C.textSecondary }}
                      >
                        {selectedTx.stripeId}
                      </p>
                    </div>
                  </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {tab === "checklist" && (
          <motion.div
            key="checklist"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex gap-4 overflow-hidden"
          >
            {/* Parent list */}
            <Card className="w-64 flex-shrink-0 overflow-y-auto">
              {DEMO_CHECKLIST.map((parent) => (
                <button
                  key={parent.id}
                  onClick={() => setSelectedParent(parent)}
                  className="w-full flex items-center gap-3 p-4 text-left transition-colors"
                  style={{
                    borderBottom: `1px solid ${C.border}`,
                    backgroundColor:
                      selectedParent.id === parent.id
                        ? C.elevated
                        : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedParent.id !== parent.id)
                      e.currentTarget.style.backgroundColor = C.elevated;
                  }}
                  onMouseLeave={(e) => {
                    if (selectedParent.id !== parent.id)
                      e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      backgroundColor: parent.color + "22",
                      color: parent.color,
                    }}
                  >
                    {parent.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: C.textPrimary }}
                    >
                      {parent.name}
                    </p>
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: parent.upToDate ? C.success : C.warning }}
                    >
                      {parent.upToDate ? "✓ Up to date" : "⚠ Awaiting"}
                    </span>
                  </div>
                </button>
              ))}
            </Card>

            {/* Checklist */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {(
                [
                  ["summer", "Summer 2026", selectedParent.summer],
                  [
                    "schoolYear",
                    "School Year 26–27",
                    selectedParent.schoolYear,
                  ],
                ] as [string, string, TuitionItem[]][]
              )
                .filter(([, , items]) => items.length > 0)
                .map(([key, label, items]) => {
                  const paid = items.filter((i) => i.state === "paid").length;
                  const isOpen = openSection === key;
                  return (
                    <Card key={key} style={{ overflow: "hidden" }}>
                      <button
                        className="w-full flex items-center justify-between px-5 py-4 transition-colors"
                        onClick={() =>
                          setOpenSection(
                            isOpen
                              ? ("schoolYear" as "summer" | "schoolYear")
                              : (key as "summer" | "schoolYear"),
                          )
                        }
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = C.elevated)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: C.textPrimary }}
                          >
                            {label}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: C.textTertiary }}
                          >
                            {paid} / {items.length} paid
                          </span>
                        </div>
                        <ChevronRight
                          className="w-4 h-4 transition-transform"
                          style={{
                            color: C.textTertiary,
                            transform: isOpen ? "rotate(90deg)" : "none",
                          }}
                        />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            style={{ overflow: "hidden" }}
                          >
                            <div className="px-5 pb-4 space-y-2">
                              {items.map((item, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-3 py-2"
                                  style={{
                                    borderBottom:
                                      i < items.length - 1
                                        ? `1px solid ${C.border}`
                                        : "none",
                                  }}
                                >
                                  <div
                                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{
                                      backgroundColor:
                                        item.state === "paid"
                                          ? C.successBg
                                          : item.state === "sent"
                                            ? C.warningBg
                                            : "transparent",
                                      border: `2px solid ${item.state === "paid" ? C.success : item.state === "sent" ? C.warning : C.border}`,
                                    }}
                                  >
                                    {item.state === "paid" && (
                                      <span
                                        style={{
                                          color: C.success,
                                          fontSize: 10,
                                          fontWeight: 700,
                                        }}
                                      >
                                        ✓
                                      </span>
                                    )}
                                    {item.state === "sent" && (
                                      <span
                                        style={{
                                          color: C.warning,
                                          fontSize: 8,
                                        }}
                                      >
                                        ●
                                      </span>
                                    )}
                                  </div>
                                  <span
                                    className="flex-1 text-sm"
                                    style={{
                                      color:
                                        item.state === "paid"
                                          ? C.textSecondary
                                          : C.textPrimary,
                                    }}
                                  >
                                    {item.label}
                                  </span>
                                  {item.date && (
                                    <span
                                      className="text-xs"
                                      style={{ color: C.textTertiary }}
                                    >
                                      {item.date}
                                    </span>
                                  )}
                                  {item.state === "unpaid" && (
                                    <span
                                      className="text-[10px] font-semibold px-2 py-0.5 rounded"
                                      style={{
                                        backgroundColor: C.elevated,
                                        color: C.textTertiary,
                                        border: `1px solid ${C.border}`,
                                      }}
                                    >
                                      Send
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Budget page ───────────────────────────────────────────────────────────────

type BudgetTab = "overview" | "expenses" | "revenue" | "analysis" | "transactions";

function BudgetRing({
  cat,
  delay,
}: {
  cat: (typeof BUDGET_CATS)[0];
  delay: number;
}) {
  const pct = Math.round((cat.actual / cat.planned) * 100);
  const size = 64,
    sw = 6;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(pct, 100) / 100);
  const over = cat.actual > cat.planned;
  const diff = Math.abs(cat.planned - cat.actual);
  return (
    <div
      className="rounded-xl p-4 flex flex-col items-center text-center"
      style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
    >
      <div className="relative mb-3" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={C.border}
            strokeWidth={sw}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={over ? C.error : cat.color}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, delay, ease: "easeOut" }}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ fontSize: 18 }}>{cat.emoji}</span>
        </div>
      </div>
      <p
        className="text-xs font-semibold mb-1 leading-tight"
        style={{ color: C.textSecondary }}
      >
        {cat.name}
      </p>
      <p
        className="text-xl font-bold tabular-nums"
        style={{ color: over ? C.error : cat.color }}
      >
        {pct}%
      </p>
      <p className="text-[10px] mt-1" style={{ color: C.textTertiary }}>
        ${cat.actual.toLocaleString()} / ${cat.planned.toLocaleString()}
      </p>
      <span
        className="mt-2 px-2 py-0.5 text-[9px] font-bold rounded-full"
        style={{
          backgroundColor: over ? C.errorBg : C.successBg,
          color: over ? C.error : C.success,
        }}
      >
        {over
          ? `▲ $${diff.toLocaleString()} over`
          : `▼ $${diff.toLocaleString()} left`}
      </span>
    </div>
  );
}

function BudgetPage() {
  const [tab, setTab] = useState<BudgetTab>("overview");
  const [selectedExp, setSelectedExp] = useState<
    (typeof DEMO_EXPENSES)[0] | null
  >(null);

  const tabs: { key: BudgetTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "expenses", label: "Expenses" },
    { key: "revenue", label: "Revenue" },
    { key: "analysis", label: "Analysis" },
    { key: "transactions", label: "Transactions" },
  ];

  const totalRevenue = DEMO_INCOME.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = DEMO_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const fmt = (n: number) => `$${n.toLocaleString()}`;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1
            className="text-xl font-semibold tracking-tight"
            style={{ color: C.textPrimary }}
          >
            Budget
          </h1>
          <p className="text-sm mt-0.5" style={{ color: C.textTertiary }}>
            Fiscal Year 2025–2026
          </p>
        </div>
        <div
          className="flex items-center gap-1 p-1 rounded-lg"
          style={{
            backgroundColor: C.elevated,
            border: `1px solid ${C.border}`,
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              data-tour-id={`budget-tab-${t.key}`}
              onClick={() => setTab(t.key)}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
              style={{
                backgroundColor: tab === t.key ? C.surface : "transparent",
                color: tab === t.key ? C.textPrimary : C.textTertiary,
                boxShadow: tab === t.key ? C.shadowCard : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto space-y-5"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Total Revenue", value: "$47,320", color: C.success },
                { label: "Total Expenses", value: "$31,840", color: C.error },
                { label: "Net Profit", value: "$15,480", color: C.accent },
                { label: "Burn Rate", value: "$2,653/mo", color: C.warning },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <p
                    className="text-xs uppercase tracking-widest font-semibold mb-2"
                    style={{ color: C.textTertiary }}
                  >
                    {s.label}
                  </p>
                  <p
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: s.color }}
                  >
                    {s.value}
                  </p>
                </motion.div>
              ))}
            </div>
            <Card style={{ padding: "20px" }}>
              <div className="flex items-center justify-between mb-4">
                <SectionLabel>Revenue vs Expenses</SectionLabel>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-0.5 inline-block rounded"
                      style={{ backgroundColor: C.accent }}
                    />
                    <span style={{ color: C.textTertiary }}>Revenue</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-0.5 inline-block border-t border-dashed"
                      style={{ borderColor: C.border }}
                    />
                    <span style={{ color: C.textTertiary }}>Expenses</span>
                  </span>
                </div>
              </div>
              <RevenueAreaChart />
            </Card>
            <div>
              <SectionLabel>Category Spending</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {BUDGET_CATS.map((cat, i) => (
                  <BudgetRing key={cat.name} cat={cat} delay={i * 0.08} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {tab === "expenses" && (
          <motion.div
            key="expenses"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-hidden relative"
          >
            <Card className="h-full overflow-hidden">
              <div className="overflow-x-auto h-full">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {[
                        "Category",
                        "Description",
                        "Amount",
                        "Date",
                        "Receipt",
                      ].map((col) => (
                        <th
                          key={col}
                          className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest"
                          style={{ color: C.textTertiary }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_EXPENSES.map((exp, i) => (
                      <motion.tr
                        key={exp.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => setSelectedExp(exp)}
                        className="cursor-pointer"
                        style={{ borderBottom: `1px solid ${C.border}` }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = C.elevated)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <td className="px-4 py-3">
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: C.accentLight,
                              color: C.accent,
                            }}
                          >
                            {exp.category}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: C.textSecondary }}
                        >
                          {exp.description}
                        </td>
                        <td
                          className="px-4 py-3 text-sm font-bold tabular-nums"
                          style={{ color: C.error }}
                        >
                          {fmt(exp.amount)}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: C.textTertiary }}
                        >
                          {exp.date}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{
                            color: exp.receipt ? C.info : C.textTertiary,
                          }}
                        >
                          {exp.receipt ?? "—"}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <AnimatePresence>
              {selectedExp && (
                <motion.div
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  className="absolute top-0 right-0 bottom-0 flex flex-col"
                  style={{
                    width: 300,
                    backgroundColor: C.surface,
                    borderLeft: `1px solid ${C.border}`,
                    zIndex: 10,
                  }}
                >
                  <div
                    className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: `1px solid ${C.border}` }}
                  >
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: C.textPrimary }}
                    >
                      Expense Detail
                    </h3>
                    <button
                      onClick={() => setSelectedExp(null)}
                      style={{ color: C.textTertiary }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 p-5 space-y-4">
                    <div
                      className="rounded-xl p-4"
                      style={{
                        backgroundColor: C.elevated,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <p
                        className="text-2xl font-bold tabular-nums"
                        style={{ color: C.error }}
                      >
                        {fmt(selectedExp.amount)}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: C.textTertiary }}
                      >
                        {selectedExp.category}
                      </p>
                    </div>
                    <DetailField
                      label="Description"
                      value={selectedExp.description}
                    />
                    <DetailField label="Date" value={selectedExp.date} />
                    <DetailField
                      label="Receipt"
                      value={selectedExp.receipt ?? "—"}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {tab === "revenue" && (
          <motion.div
            key="revenue"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto space-y-4"
          >
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Summer Revenue",
                  value:
                    "$" +
                    DEMO_INCOME.filter((i) => i.program === "summer_26")
                      .reduce((s, i) => s + i.amount, 0)
                      .toLocaleString(),
                  color: C.warning,
                },
                {
                  label: "School Year Revenue",
                  value:
                    "$" +
                    DEMO_INCOME.filter((i) => i.program === "school_year_26_27")
                      .reduce((s, i) => s + i.amount, 0)
                      .toLocaleString(),
                  color: C.info,
                },
                {
                  label: "Donations",
                  value:
                    "$" +
                    DEMO_INCOME.filter((i) => i.source === "Donation")
                      .reduce((s, i) => s + i.amount, 0)
                      .toLocaleString(),
                  color: C.success,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <p
                    className="text-xs uppercase tracking-widest font-semibold mb-2"
                    style={{ color: C.textTertiary }}
                  >
                    {s.label}
                  </p>
                  <p
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: s.color }}
                  >
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
            <Card>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Source", "Description", "Amount", "Date", "Program"].map(
                      (col) => (
                        <th
                          key={col}
                          className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest"
                          style={{ color: C.textTertiary }}
                        >
                          {col}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {DEMO_INCOME.map((inc, i) => (
                    <motion.tr
                      key={inc.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      style={{ borderBottom: `1px solid ${C.border}` }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = C.elevated)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: C.successBg,
                            color: C.success,
                          }}
                        >
                          {inc.source}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: C.textSecondary }}
                      >
                        {inc.description}
                      </td>
                      <td
                        className="px-4 py-3 text-sm font-bold tabular-nums"
                        style={{ color: C.success }}
                      >
                        {fmt(inc.amount)}
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: C.textTertiary }}
                      >
                        {inc.date}
                      </td>
                      <td className="px-4 py-3">
                        {inc.program ? (
                          <ProgramBadge program={inc.program} />
                        ) : (
                          <span style={{ color: C.textTertiary }}>—</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </motion.div>
        )}

        {tab === "analysis" && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto space-y-5"
          >
            <Card style={{ padding: "24px" }}>
              <SectionLabel>Planned vs Actual by Category</SectionLabel>
              <div className="space-y-4 mt-2">
                {BUDGET_CATS.map((cat, i) => {
                  const maxVal = Math.max(...BUDGET_CATS.map((c) => c.planned));
                  const pPct = (cat.planned / maxVal) * 100;
                  const aPct = (cat.actual / maxVal) * 100;
                  const over = cat.actual > cat.planned;
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-xs font-semibold"
                          style={{ color: C.textSecondary }}
                        >
                          {cat.emoji} {cat.name}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: over ? C.error : C.success }}
                        >
                          {over ? "▲" : "▼"} $
                          {Math.abs(cat.planned - cat.actual).toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] w-14 text-right"
                            style={{ color: C.textTertiary }}
                          >
                            Planned
                          </span>
                          <div
                            className="flex-1 h-2 rounded-full overflow-hidden"
                            style={{ backgroundColor: C.border }}
                          >
                            <motion.div
                              className="h-full rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${pPct}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 }}
                              style={{
                                backgroundColor: C.border,
                                opacity: 0.6,
                                border: `1px solid ${cat.color}`,
                              }}
                            />
                          </div>
                          <span
                            className="text-[10px] w-16 tabular-nums"
                            style={{ color: C.textTertiary }}
                          >
                            {fmt(cat.planned)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] w-14 text-right"
                            style={{ color: C.textTertiary }}
                          >
                            Actual
                          </span>
                          <div
                            className="flex-1 h-2 rounded-full overflow-hidden"
                            style={{ backgroundColor: C.border }}
                          >
                            <motion.div
                              className="h-full rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${aPct}%` }}
                              transition={{
                                duration: 0.8,
                                delay: i * 0.1 + 0.1,
                              }}
                              style={{
                                backgroundColor: over ? C.error : cat.color,
                              }}
                            />
                          </div>
                          <span
                            className="text-[10px] w-16 tabular-nums"
                            style={{ color: over ? C.error : C.textPrimary }}
                          >
                            {fmt(cat.actual)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {[
                      "Category",
                      "Planned",
                      "Actual",
                      "Variance",
                      "Status",
                    ].map((col) => (
                      <th
                        key={col}
                        className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest"
                        style={{ color: C.textTertiary }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BUDGET_CATS.map((cat) => {
                    const over = cat.actual > cat.planned;
                    const diff = cat.actual - cat.planned;
                    return (
                      <tr
                        key={cat.name}
                        style={{ borderBottom: `1px solid ${C.border}` }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = C.elevated)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <td
                          className="px-4 py-3 text-sm font-medium"
                          style={{ color: C.textPrimary }}
                        >
                          {cat.emoji} {cat.name}
                        </td>
                        <td
                          className="px-4 py-3 text-sm tabular-nums"
                          style={{ color: C.textSecondary }}
                        >
                          {fmt(cat.planned)}
                        </td>
                        <td
                          className="px-4 py-3 text-sm tabular-nums"
                          style={{ color: C.textPrimary }}
                        >
                          {fmt(cat.actual)}
                        </td>
                        <td
                          className="px-4 py-3 text-sm tabular-nums font-semibold"
                          style={{ color: over ? C.error : C.success }}
                        >
                          {over ? "+" : "-"}
                          {fmt(Math.abs(diff))}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 text-[10px] font-semibold rounded-full"
                            style={{
                              backgroundColor: over ? C.errorBg : C.successBg,
                              color: over ? C.error : C.success,
                            }}
                          >
                            {over ? "Over budget" : "Under budget"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </motion.div>
        )}

        {tab === "transactions" && (
          <motion.div
            key="transactions"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-hidden"
          >
            <TransactionsPage />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


function AutomationStepIcon({ type }: { type: AutomationStep["type"] }) {
  if (type === "email") return <Mail className="w-3.5 h-3.5" />;
  if (type === "sms") return <MessageSquare className="w-3.5 h-3.5" />;
  if (type === "wait") return <Clock className="w-3.5 h-3.5" />;
  return <GitBranch className="w-3.5 h-3.5" />;
}

function stepColor(type: AutomationStep["type"]) {
  if (type === "email") return { bg: C.accentLight, fg: C.accent };
  if (type === "sms") return { bg: C.infoBg, fg: C.info };
  if (type === "wait") return { bg: C.elevated, fg: C.textTertiary };
  return { bg: C.purpleBg, fg: C.purple };
}

function statusBadge(status: AutomationPipeline["status"]) {
  if (status === "active")
    return { bg: C.successBg, fg: C.success, label: "Active" };
  if (status === "paused")
    return { bg: C.warningBg, fg: C.warning, label: "Paused" };
  return { bg: C.elevated, fg: C.textTertiary, label: "Draft" };
}

function buildNewPipeline(state: WizardState): AutomationPipeline {
  const seg = WIZARD_SEGMENTS.find((s) => s.id === state.audienceKey);
  const trig = WIZARD_TRIGGERS.find((t) => t.id === state.triggerKey);
  const audienceColors: Record<string, string> = {
    all_leads: "#5E7C68",
    warm_leads: "#38BDF8",
    tour_visitors: "#F59E0B",
    waitlisted: "#8B5CF6",
    enrolled: "#22C55E",
  };
  return {
    id: "wizard-" + Date.now(),
    name: state.automationName || "New Automation",
    description: "",
    audience: seg?.label ?? "All Leads",
    trigger: trig?.title ?? "Manual",
    status: state.launchMode === "live" ? "active" : "draft",
    steps: state.flowSteps,
    stats: { enrolled: 0, sent: 0, openRate: 0, clickRate: 0, conversions: 0 },
    audienceColor: audienceColors[state.audienceKey ?? "all_leads"] ?? "#5E7C68",
  };
}

function computeAudienceCount(
  audienceKey: string | null,
  programFilters: string[],
  ageFilters: string[],
): number {
  const seg = WIZARD_SEGMENTS.find((s) => s.id === audienceKey);
  let count = seg?.count ?? 0;
  programFilters.forEach(() => { count = Math.max(1, Math.round(count * 0.8)); });
  ageFilters.forEach(() => { count = Math.max(1, Math.round(count * 0.85)); });
  return count;
}

function TriggerIcon({ id }: { id: string }) {
  const s = "w-4 h-4";
  if (id === "inquiry") return <Mail className={s} />;
  if (id === "tour_booked") return <PhoneCall className={s} />;
  if (id === "enrolled") return <CheckCircle className={s} />;
  if (id === "payment_overdue") return <CreditCard className={s} />;
  if (id === "cold_lead") return <Clock className={s} />;
  return <Zap className={s} />;
}

function StepTypeIcon({ type }: { type: AutomationStep["type"] }) {
  const s = "w-4 h-4";
  if (type === "email") return <Mail className={s} />;
  if (type === "sms") return <MessageSquare className={s} />;
  if (type === "wait") return <Timer className={s} />;
  return <GitBranch className={s} />;
}

function NewAutomationWizard({
  state,
  onChange,
  onClose,
  onCreatePipeline,
}: {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  onClose: () => void;
  onCreatePipeline: (p: AutomationPipeline) => void;
}) {
  const [addPickerIndex, setAddPickerIndex] = useState<number | null>(null);
  const [hoveredStepIndex, setHoveredStepIndex] = useState<number | null>(null);

  const STEP_LABELS = ["Template", "Trigger", "Audience", "Build Flow", "Launch"];

  const audienceCount = computeAudienceCount(
    state.audienceKey,
    state.programFilters,
    state.ageFilters,
  );
  const audiencePct = Math.min(100, Math.round((audienceCount / 47) * 100));

  function handleNext() {
    if (state.step >= 5) return;
    const next = (state.step + 1) as WizardState["step"];
    if (state.step === 1 && state.templateId && state.templateId !== "scratch") {
      const tmpl = WIZARD_TEMPLATES.find((t) => t.id === state.templateId);
      if (tmpl) {
        onChange({
          step: next,
          triggerKey: state.triggerKey ?? tmpl.defaultTriggerKey,
          audienceKey: state.audienceKey ?? tmpl.defaultAudienceKey,
          flowSteps: state.flowSteps.length > 0 ? state.flowSteps : tmpl.defaultSteps,
          automationName: state.automationName || tmpl.defaultAutomationName,
        });
        return;
      }
    }
    onChange({ step: next });
  }

  function handleBack() {
    if (state.step <= 1) return;
    onChange({ step: (state.step - 1) as WizardState["step"] });
  }

  function handleLaunch() {
    onChange({ launching: true });
    setTimeout(() => {
      onChange({ launching: false, launched: true });
    }, 1200);
    setTimeout(() => {
      onCreatePipeline(buildNewPipeline(state));
      onClose();
    }, 3000);
  }

  function addStep(type: AutomationStep["type"], atIndex: number) {
    const newStep: AutomationStep = {
      type,
      label: type === "email" ? "New Email" : type === "sms" ? "New SMS" : type === "wait" ? "Wait 2 days" : "If/Then Branch",
      delay: "Next",
    };
    const steps = [...state.flowSteps];
    steps.splice(atIndex, 0, newStep);
    onChange({ flowSteps: steps });
    setAddPickerIndex(null);
  }

  function removeStep(i: number) {
    const steps = [...state.flowSteps];
    steps.splice(i, 1);
    onChange({ flowSteps: steps });
  }

  const canContinue =
    state.step === 1 ? state.templateId !== null :
    state.step === 2 ? state.triggerKey !== null :
    state.step === 3 ? state.audienceKey !== null :
    true;

  // Estimate duration from flow steps
  const estDays = state.flowSteps.reduce((acc, s) => {
    if (s.type === "wait" && s.delay) {
      const m = s.delay.match(/\d+/);
      if (m) return acc + parseInt(m[0]);
    }
    return acc;
  }, 0);

  const templateColors: Record<string, string> = {
    "enroll-drip": "#F59E0B",
    "tour-followup": "#38BDF8",
    "welcome-series": "#22C55E",
    "re-engagement": "#EF4444",
    "waitlist-nurture": "#8B5CF6",
    "payment-reminder": "#F97316",
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="absolute top-0 right-0 bottom-0 flex flex-col overflow-hidden"
      style={{
        width: 480,
        backgroundColor: C.surface,
        borderLeft: `1px solid ${C.border}`,
        zIndex: 20,
        boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex-shrink-0 px-5 pt-4 pb-3"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold" style={{ color: C.textPrimary }}>
              New Automation
            </div>
            <div className="text-[11px]" style={{ color: C.textTertiary }}>
              {state.launched ? "Done!" : `Step ${Math.min(state.step, 4)} of 4 — ${STEP_LABELS[state.step - 1]}`}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-md w-7 h-7"
            style={{ backgroundColor: C.elevated, color: C.textTertiary }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress strip — only show steps 1-4 */}
        {!state.launched && (
          <div className="flex items-center gap-0">
            {[1, 2, 3, 4].map((n, i) => {
              const isDone = state.step > n;
              const isActive = state.step === n;
              return (
                <div key={n} className="flex items-center" style={{ flex: i < 3 ? 1 : "none" }}>
                  <motion.div
                    animate={{ scale: isActive ? 1.12 : 1 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{
                      width: 26,
                      height: 26,
                      backgroundColor: isDone ? C.accentLight : isActive ? C.accent : C.elevated,
                      border: `2px solid ${isDone ? C.accent : isActive ? C.accent : C.border}`,
                      color: isDone ? C.accent : isActive ? "#fff" : C.textTertiary,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {isDone ? <CheckCircle className="w-3 h-3" /> : n}
                  </motion.div>
                  {i < 3 && (
                    <div
                      className="flex-1 h-px mx-1"
                      style={{ backgroundColor: state.step > n + 1 ? C.accent : C.border }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={state.step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.18 }}
            className="p-5 space-y-4"
          >

            {/* ── Step 1: Template ── */}
            {state.step === 1 && (
              <div>
                <div className="text-xs font-semibold mb-1" style={{ color: C.textSecondary }}>
                  Choose a starting point
                </div>
                <div className="text-[11px] mb-4" style={{ color: C.textTertiary }}>
                  Pick a pre-built template or start from scratch.
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {WIZARD_TEMPLATES.map((tmpl) => {
                    const sel = state.templateId === tmpl.id;
                    const color = templateColors[tmpl.id] ?? C.accent;
                    return (
                      <button
                        key={tmpl.id}
                        onClick={() => onChange({ templateId: tmpl.id })}
                        className="text-left rounded-xl p-3 transition-all duration-150"
                        style={{
                          border: `2px solid ${sel ? C.accent : C.border}`,
                          backgroundColor: sel ? C.accentLight : C.surface,
                          boxShadow: sel ? `0 0 0 2px ${C.accentGlow ?? C.accentLight}` : "none",
                        }}
                      >
                        <div className="flex items-start gap-2 mb-1.5">
                          <div
                            className="flex items-center justify-center rounded-lg flex-shrink-0"
                            style={{ width: 30, height: 30, backgroundColor: color + "22", color }}
                          >
                            <Megaphone className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-[11px] font-semibold leading-tight" style={{ color: C.textPrimary }}>
                                {tmpl.name}
                              </span>
                              {tmpl.recommended && (
                                <span
                                  className="inline-flex items-center gap-0.5 text-[9px] font-medium rounded-full px-1.5 py-0.5 flex-shrink-0"
                                  style={{ backgroundColor: C.warningBg, color: C.warning }}
                                >
                                  <Star className="w-2 h-2" /> Recommended
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] leading-relaxed mb-2" style={{ color: C.textTertiary }}>
                          {tmpl.description}
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          <span className="text-[9px] rounded-full px-1.5 py-0.5" style={{ backgroundColor: C.elevated, color: C.textSecondary }}>
                            {tmpl.steps} steps
                          </span>
                          <span className="text-[9px] rounded-full px-1.5 py-0.5" style={{ backgroundColor: C.successBg, color: C.success }}>
                            {tmpl.openRate}% open
                          </span>
                          <span className="text-[9px] rounded-full px-1.5 py-0.5" style={{ backgroundColor: C.accentLight, color: C.accent }}>
                            {tmpl.resultLabel}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => onChange({ templateId: "scratch", flowSteps: [], automationName: "" })}
                  className="mt-2.5 w-full rounded-xl py-3 text-[11px] font-medium transition-all duration-150"
                  style={{
                    border: `1.5px dashed ${state.templateId === "scratch" ? C.accent : C.border}`,
                    color: state.templateId === "scratch" ? C.accent : C.textTertiary,
                    backgroundColor: state.templateId === "scratch" ? C.accentLight : "transparent",
                  }}
                >
                  <Layers className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                  Start from scratch
                </button>
              </div>
            )}

            {/* ── Step 2: Trigger ── */}
            {state.step === 2 && (
              <div>
                <div className="text-xs font-semibold mb-1" style={{ color: C.textSecondary }}>
                  What kicks off this automation?
                </div>
                <div className="text-[11px] mb-4" style={{ color: C.textTertiary }}>
                  Choose the event that starts this sequence.
                </div>
                <div className="space-y-2">
                  {WIZARD_TRIGGERS.map((trig) => {
                    const sel = state.triggerKey === trig.id;
                    return (
                      <button
                        key={trig.id}
                        onClick={() => onChange({ triggerKey: trig.id })}
                        className="w-full text-left flex items-center gap-3 rounded-xl p-3 transition-all duration-150"
                        style={{
                          border: `2px solid ${sel ? C.accent : C.border}`,
                          backgroundColor: sel ? C.accentLight : C.surface,
                        }}
                      >
                        <div
                          className="flex items-center justify-center rounded-lg flex-shrink-0"
                          style={{ width: 36, height: 36, backgroundColor: C.elevated, color: sel ? C.accent : C.textSecondary }}
                        >
                          <TriggerIcon id={trig.id} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-semibold" style={{ color: C.textPrimary }}>{trig.title}</div>
                          <div className="text-[10px] mt-0.5" style={{ color: C.textTertiary }}>{trig.subtitle}</div>
                        </div>
                        <div
                          className="rounded-full flex-shrink-0"
                          style={{
                            width: 16, height: 16,
                            border: `2px solid ${sel ? C.accent : C.border}`,
                            backgroundColor: sel ? C.accent : "transparent",
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Step 3: Audience ── */}
            {state.step === 3 && (
              <div>
                <div className="text-xs font-semibold mb-1" style={{ color: C.textSecondary }}>
                  Who receives this?
                </div>
                <div className="text-[11px] mb-4" style={{ color: C.textTertiary }}>
                  Select the segment, then refine with optional filters.
                </div>
                <div className="space-y-2 mb-4">
                  {WIZARD_SEGMENTS.map((seg) => {
                    const sel = state.audienceKey === seg.id;
                    return (
                      <button
                        key={seg.id}
                        onClick={() => onChange({ audienceKey: seg.id })}
                        className="w-full text-left flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150"
                        style={{
                          border: `2px solid ${sel ? C.accent : C.border}`,
                          backgroundColor: sel ? C.accentLight : C.surface,
                        }}
                      >
                        <div
                          className="rounded-full flex-shrink-0"
                          style={{
                            width: 16, height: 16,
                            border: `2px solid ${sel ? C.accent : C.border}`,
                            backgroundColor: sel ? C.accent : "transparent",
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-semibold" style={{ color: C.textPrimary }}>{seg.label}</div>
                          <div className="text-[10px]" style={{ color: C.textTertiary }}>{seg.description}</div>
                        </div>
                        <div
                          className="text-[11px] font-bold rounded-full px-2 py-0.5"
                          style={{ backgroundColor: C.elevated, color: C.textSecondary }}
                        >
                          {seg.count}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: C.textTertiary }}>
                  Refine by program
                </div>
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {WIZARD_PROGRAMS.map((p) => {
                    const sel = state.programFilters.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          const next = sel
                            ? state.programFilters.filter((x) => x !== p)
                            : [...state.programFilters, p];
                          onChange({ programFilters: next });
                        }}
                        className="text-[11px] rounded-full px-3 py-1 transition-all duration-150"
                        style={{
                          border: `1.5px solid ${sel ? C.accent : C.border}`,
                          backgroundColor: sel ? C.accentLight : "transparent",
                          color: sel ? C.accent : C.textTertiary,
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <div className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: C.textTertiary }}>
                  Refine by age group
                </div>
                <div className="flex gap-1.5 flex-wrap mb-4">
                  {WIZARD_AGE_GROUPS.map((a) => {
                    const sel = state.ageFilters.includes(a);
                    return (
                      <button
                        key={a}
                        onClick={() => {
                          const next = sel
                            ? state.ageFilters.filter((x) => x !== a)
                            : [...state.ageFilters, a];
                          onChange({ ageFilters: next });
                        }}
                        className="text-[11px] rounded-full px-3 py-1 transition-all duration-150"
                        style={{
                          border: `1.5px solid ${sel ? C.accent : C.border}`,
                          backgroundColor: sel ? C.accentLight : "transparent",
                          color: sel ? C.accent : C.textTertiary,
                        }}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>

                <div
                  className="rounded-xl p-3"
                  style={{ backgroundColor: C.elevated, border: `1px solid ${C.border}` }}
                >
                  <div className="text-[11px] mb-1.5" style={{ color: C.textSecondary }}>
                    <span className="font-bold" style={{ color: C.accent }}>{audienceCount}</span>{" "}
                    families will receive this automation
                  </div>
                  <div
                    className="rounded-full overflow-hidden"
                    style={{ height: 5, backgroundColor: C.border }}
                  >
                    <motion.div
                      animate={{ width: `${audiencePct}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: C.accent }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Flow Builder ── */}
            {state.step === 4 && (
              <div>
                <div className="text-xs font-semibold mb-1" style={{ color: C.textSecondary }}>
                  Build your automation flow
                </div>
                <div className="text-[11px] mb-4" style={{ color: C.textTertiary }}>
                  Click + to add steps. Hover a step to remove it.
                </div>

                {state.flowSteps.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center rounded-xl py-10"
                    style={{ border: `2px dashed ${C.border}`, color: C.textTertiary }}
                  >
                    <Layers className="w-6 h-6 mb-2 opacity-40" />
                    <div className="text-[11px] mb-3">Your flow is empty.</div>
                    <button
                      onClick={() => setAddPickerIndex(0)}
                      className="flex items-center gap-1 text-[11px] font-medium rounded-lg px-3 py-1.5"
                      style={{ backgroundColor: C.elevated, color: C.textSecondary, border: `1px solid ${C.border}` }}
                    >
                      <Plus className="w-3 h-3" /> Add first step
                    </button>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {/* Add picker at index 0 */}
                    <AnimatePresence>
                      {addPickerIndex === 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mb-2"
                        >
                          <div
                            className="flex gap-1.5 p-2 rounded-xl"
                            style={{ backgroundColor: C.elevated, border: `1px solid ${C.border}` }}
                          >
                            {WIZARD_STEP_TYPES.map((st) => (
                              <button
                                key={st.type}
                                onClick={() => addStep(st.type, 0)}
                                className="flex-1 flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium transition-all"
                                style={{ backgroundColor: st.color + "22", color: st.color }}
                              >
                                <StepTypeIcon type={st.type} />
                                {st.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {state.flowSteps.map((step, i) => {
                      const sc = stepColor(step.type);
                      const hovered = hoveredStepIndex === i;
                      return (
                        <div key={i}>
                          <motion.div
                            layout
                            onMouseEnter={() => setHoveredStepIndex(i)}
                            onMouseLeave={() => setHoveredStepIndex(null)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 relative"
                            style={{
                              backgroundColor: C.surface,
                              border: `1px solid ${C.border}`,
                              boxShadow: C.shadowCard,
                              marginBottom: 2,
                            }}
                          >
                            <div
                              className="flex items-center justify-center rounded-lg flex-shrink-0"
                              style={{ width: 32, height: 32, backgroundColor: sc.bg, color: sc.fg }}
                            >
                              <StepTypeIcon type={step.type} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-semibold" style={{ color: C.textPrimary }}>{step.label}</div>
                              {step.delay && (
                                <span
                                  className="text-[9px] rounded-full px-1.5 py-0.5"
                                  style={{ backgroundColor: C.elevated, color: C.textTertiary }}
                                >
                                  {step.delay}
                                </span>
                              )}
                            </div>
                            {hovered && (
                              <button
                                onClick={() => removeStep(i)}
                                className="flex items-center justify-center rounded-full"
                                style={{ width: 20, height: 20, backgroundColor: C.errorBg, color: C.error }}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </motion.div>

                          {/* Add button after each step */}
                          <div className="flex items-center justify-center py-1">
                            <button
                              onClick={() => setAddPickerIndex(addPickerIndex === i + 1 ? null : i + 1)}
                              className="flex items-center justify-center rounded-full transition-all"
                              style={{
                                width: 22, height: 22,
                                backgroundColor: C.elevated,
                                border: `1px solid ${C.border}`,
                                color: C.textTertiary,
                              }}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <AnimatePresence>
                            {addPickerIndex === i + 1 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mb-2"
                              >
                                <div
                                  className="flex gap-1.5 p-2 rounded-xl"
                                  style={{ backgroundColor: C.elevated, border: `1px solid ${C.border}` }}
                                >
                                  {WIZARD_STEP_TYPES.map((st) => (
                                    <button
                                      key={st.type}
                                      onClick={() => addStep(st.type, i + 1)}
                                      className="flex-1 flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium transition-all"
                                      style={{ backgroundColor: st.color + "22", color: st.color }}
                                    >
                                      <StepTypeIcon type={st.type} />
                                      {st.label}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 5: Launch ── */}
            {state.step === 5 && (
              <div>
                {state.launching && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={{ color: C.accent }}
                    >
                      <Loader2 className="w-8 h-8" />
                    </motion.div>
                    <div className="text-sm mt-3" style={{ color: C.textTertiary }}>
                      Setting up your automation…
                    </div>
                  </div>
                )}

                {state.launched && (
                  <div className="flex flex-col items-center justify-center py-12 relative">
                    <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
                      {CONFETTI_DOTS.map((dot, i) => (
                        <motion.div
                          key={i}
                          className="absolute rounded-full"
                          style={{ width: 7, height: 7, backgroundColor: dot.color, top: 36, left: 36 }}
                          initial={{ x: 0, y: 0, opacity: 1 }}
                          animate={{ x: dot.x, y: dot.y, opacity: 0 }}
                          transition={{ duration: 1.5, delay: i * 0.07, ease: "easeOut" }}
                        />
                      ))}
                      <div
                        className="flex items-center justify-center rounded-full"
                        style={{ width: 72, height: 72, backgroundColor: C.successBg, border: `2px solid ${C.successBorder}` }}
                      >
                        <CheckCircle className="w-8 h-8" style={{ color: C.success }} />
                      </div>
                    </div>
                    <div className="text-base font-bold mt-4" style={{ color: C.success }}>
                      Automation is live!
                    </div>
                    <div className="text-[11px] mt-1 text-center" style={{ color: C.textTertiary }}>
                      <span className="font-medium" style={{ color: C.textSecondary }}>
                        {state.automationName || "Your automation"}
                      </span>{" "}
                      has been activated.
                    </div>
                  </div>
                )}

                {!state.launching && !state.launched && (
                  <>
                    <div className="text-xs font-semibold mb-1" style={{ color: C.textSecondary }}>
                      Almost there — name your automation
                    </div>
                    <div className="text-[11px] mb-4" style={{ color: C.textTertiary }}>
                      Review the summary, then launch when ready.
                    </div>

                    <input
                      type="text"
                      value={state.automationName}
                      onChange={(e) => onChange({ automationName: e.target.value })}
                      className="w-full text-sm font-semibold rounded-xl px-3.5 py-2.5 mb-4 outline-none"
                      style={{
                        backgroundColor: C.elevated,
                        border: `1px solid ${C.border}`,
                        borderLeft: `3px solid ${C.accent}`,
                        color: C.textPrimary,
                        fontSize: 15,
                      }}
                      placeholder="Automation name…"
                    />

                    {/* Launch mode toggle */}
                    <div
                      className="flex p-1 rounded-xl mb-4"
                      style={{ backgroundColor: C.elevated, border: `1px solid ${C.border}` }}
                    >
                      {(["live", "draft"] as const).map((mode) => {
                        const active = state.launchMode === mode;
                        return (
                          <button
                            key={mode}
                            onClick={() => onChange({ launchMode: mode })}
                            className="flex-1 text-xs font-medium rounded-lg py-2 transition-all duration-150"
                            style={{
                              backgroundColor: active ? C.surface : "transparent",
                              color: active ? C.textPrimary : C.textTertiary,
                              boxShadow: active ? C.shadowCard : "none",
                            }}
                          >
                            {mode === "live" ? "Go Live Now" : "Save as Draft"}
                          </button>
                        );
                      })}
                    </div>

                    {/* Summary card */}
                    <div
                      className="rounded-xl p-4"
                      style={{ backgroundColor: C.elevated, border: `1px solid ${C.border}` }}
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-wide mb-3" style={{ color: C.textTertiary }}>
                        Summary
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-[10px]" style={{ color: C.textTertiary }}>Audience</div>
                          <div className="text-sm font-bold" style={{ color: C.accent }}>{audienceCount} families</div>
                        </div>
                        <div>
                          <div className="text-[10px]" style={{ color: C.textTertiary }}>Steps</div>
                          <div className="text-sm font-bold" style={{ color: C.info }}>{state.flowSteps.length} steps</div>
                        </div>
                        <div>
                          <div className="text-[10px]" style={{ color: C.textTertiary }}>First send</div>
                          <div className="text-sm font-bold" style={{ color: C.textPrimary }}>On trigger</div>
                        </div>
                        <div>
                          <div className="text-[10px]" style={{ color: C.textTertiary }}>Est. duration</div>
                          <div className="text-sm font-bold" style={{ color: C.textSecondary }}>
                            {estDays > 0 ? `~${estDays} days` : "Immediate"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Footer ── */}
      {!state.launching && !state.launched && (
        <div
          className="flex-shrink-0 flex items-center px-5 py-3.5"
          style={{ borderTop: `1px solid ${C.border}`, gap: 10 }}
        >
          {state.step > 1 && (
            <button
              onClick={handleBack}
              className="text-xs font-medium rounded-lg px-4 py-2"
              style={{ backgroundColor: C.elevated, border: `1px solid ${C.border}`, color: C.textSecondary }}
            >
              Back
            </button>
          )}
          {state.step < 5 ? (
            <button
              onClick={handleNext}
              disabled={!canContinue}
              className="ml-auto flex items-center gap-1.5 text-xs font-semibold rounded-lg px-4 py-2 transition-opacity"
              style={{
                backgroundColor: C.accent,
                color: "#fff",
                opacity: canContinue ? 1 : 0.45,
                pointerEvents: canContinue ? "auto" : "none",
              }}
            >
              {state.step === 3 ? "Build Flow" : "Continue"} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleLaunch}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl py-2.5"
              style={{ backgroundColor: C.accent, color: "#fff" }}
            >
              Launch Automation <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

const WIZARD_INITIAL_STATE: WizardState = {
  step: 1,
  templateId: null,
  triggerKey: null,
  audienceKey: null,
  programFilters: [],
  ageFilters: [],
  flowSteps: [],
  automationName: "",
  launchMode: "live",
  launching: false,
  launched: false,
};

function MarketingPage() {
  const [filter, setFilter] = useState<AutomationFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pipelines, setPipelines] = useState<AutomationPipeline[]>(DEMO_AUTOMATION_PIPELINES);
  const [isCreating, setIsCreating] = useState(false);
  const [wizardState, setWizardState] = useState<WizardState>(WIZARD_INITIAL_STATE);
  const { openBackdrop, closeBackdrop } = useContext(BackdropContext);

  useEffect(() => {
    if (isCreating) openBackdrop(() => setIsCreating(false));
    else closeBackdrop();
  }, [isCreating, openBackdrop, closeBackdrop]);

  const handleCreatePipeline = (p: AutomationPipeline) => {
    setPipelines((prev) => [p, ...prev]);
  };

  const filtered =
    filter === "all"
      ? pipelines
      : pipelines.filter((p) => p.status === filter);

  const selected = selectedId
    ? pipelines.find((p) => p.id === selectedId) ?? null
    : null;

  const totalActive = pipelines.filter(
    (p) => p.status === "active",
  ).length;
  const totalSent = pipelines.reduce(
    (s, p) => s + p.stats.sent,
    0,
  );
  const activePipelinesWithSent = pipelines.filter((p) => p.stats.sent > 0);
  const avgOpenRate = activePipelinesWithSent.length > 0
    ? Math.round(activePipelinesWithSent.reduce((s, p) => s + p.stats.openRate, 0) / activePipelinesWithSent.length)
    : 0;
  const totalConversions = pipelines.reduce(
    (s, p) => s + p.stats.conversions,
    0,
  );

  const FILTER_OPTIONS: { key: AutomationFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "paused", label: "Paused" },
    { key: "draft", label: "Draft" },
  ];

  const KPI_STATS = [
    { label: "Active Pipelines", value: totalActive, color: C.success },
    { label: "Total Sent", value: totalSent.toLocaleString(), color: C.info },
    { label: "Avg Open Rate", value: `${avgOpenRate}%`, color: C.accent },
    {
      label: "Conversions",
      value: totalConversions,
      color: C.purple,
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="flex items-start justify-between px-6 pt-5 pb-4 flex-shrink-0"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div>
          <h1
            className="text-lg font-semibold tracking-tight"
            style={{ color: C.textPrimary }}
          >
            Automation Pipelines
          </h1>
          <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
            Automated email & SMS sequences for leads and families
          </p>
        </div>
        <button
          onClick={() => { setWizardState(WIZARD_INITIAL_STATE); setIsCreating(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg flex-shrink-0"
          style={{ backgroundColor: C.accent, color: "#fff" }}
        >
          <span className="text-sm leading-none">+</span> New Automation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* KPI row — grid view only */}
        {!selected && (
          <div className="grid grid-cols-4 gap-3">
            {KPI_STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-md p-3"
                style={{
                  backgroundColor: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <p
                  className="text-[10px] uppercase tracking-widest font-semibold mb-1.5"
                  style={{ color: C.textTertiary }}
                >
                  {s.label}
                </p>
                <p
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: s.color }}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Filter chips — grid view only */}
        {!selected && (
          <div className="flex items-center gap-2">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.key}
                onClick={() => { setFilter(f.key); setSelectedId(null); }}
                className="px-3 py-1 text-xs font-medium rounded-full transition-all"
                style={{
                  backgroundColor:
                    filter === f.key ? C.accent : C.elevated,
                  color: filter === f.key ? "#fff" : C.textSecondary,
                  border: `1px solid ${filter === f.key ? C.accent : C.border}`,
                }}
              >
                {f.label}
              </button>
            ))}
            <span
              className="ml-auto text-xs"
              style={{ color: C.textTertiary }}
            >
              {filtered.length} pipeline{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Grid / Detail */}
        <AnimatePresence mode="wait">
          {selected ? (
            /* ── Detail view ───────────────────────────────── */
            <motion.div
              key={`detail-${selected.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {/* Back + title bar */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedId(null)}
                  className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg"
                  style={{
                    color: C.textSecondary,
                    backgroundColor: C.elevated,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <ChevronRight
                    className="w-3 h-3"
                    style={{ transform: "rotate(180deg)" }}
                  />
                  Back
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-semibold truncate"
                      style={{ color: C.textPrimary }}
                    >
                      {selected.name}
                    </span>
                    <span
                      className="px-2 py-0.5 text-[10px] font-semibold rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: statusBadge(selected.status).bg,
                        color: statusBadge(selected.status).fg,
                      }}
                    >
                      {statusBadge(selected.status).label}
                    </span>
                    <span
                      className="px-2 py-0.5 text-[10px] font-semibold rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: selected.audienceColor + "18",
                        color: selected.audienceColor,
                      }}
                    >
                      {selected.audience}
                    </span>
                  </div>
                  <p
                    className="text-xs mt-0.5 truncate"
                    style={{ color: C.textTertiary }}
                  >
                    Trigger: {selected.trigger}
                  </p>
                </div>
              </div>

              {/* Detail KPIs */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  {
                    label: "Enrolled",
                    value: selected.stats.enrolled,
                    color: C.accent,
                  },
                  {
                    label: "Emails Sent",
                    value: selected.stats.sent.toLocaleString(),
                    color: C.info,
                  },
                  {
                    label: "Open Rate",
                    value:
                      selected.stats.openRate > 0
                        ? `${selected.stats.openRate}%`
                        : "—",
                    color: C.warning,
                  },
                  {
                    label: "Conversions",
                    value:
                      selected.stats.conversions > 0
                        ? selected.stats.conversions
                        : "—",
                    color: C.purple,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-md p-3"
                    style={{
                      backgroundColor: C.surface,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <p
                      className="text-[10px] uppercase tracking-widest font-semibold mb-1.5"
                      style={{ color: C.textTertiary }}
                    >
                      {s.label}
                    </p>
                    <p
                      className="text-2xl font-bold tabular-nums"
                      style={{ color: s.color }}
                    >
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Step sequence — node flow */}
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundImage: `radial-gradient(circle, ${C.border} 1px, transparent 1px)`,
                  backgroundSize: "20px 20px",
                  backgroundColor: C.elevated,
                  border: `1px solid ${C.border}`,
                }}
              >
                {/* Section label */}
                <div className="flex items-center justify-between mb-3">
                  <p
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: C.textTertiary }}
                  >
                    Automation Flow
                  </p>
                  <span className="text-xs" style={{ color: C.textTertiary }}>
                    {selected.steps.length} steps
                  </span>
                </div>

                {/* Wrapping node row */}
                <div
                  className="flex flex-wrap items-center"
                  style={{ gap: "12px 0" }}
                >
                    {selected.steps.map((step, i) => {
                      const sc = stepColor(step.type);
                      const isWait = step.type === "wait";
                      const isAction = !isWait;
                      const hasSentData =
                        isAction &&
                        step.sent !== undefined &&
                        step.sent > 0;
                      const isDraft =
                        isAction &&
                        step.sent !== undefined &&
                        step.sent === 0;

                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05, duration: 0.2 }}
                          className="flex items-center"
                          style={{ gap: 0 }}
                        >
                          {/* ── Wait node ── */}
                          {isWait && (
                            <div
                              className="flex flex-col items-center gap-1.5 px-3 py-2 rounded mx-1"
                              style={{
                                backgroundColor: C.elevated,
                                border: `1px dashed ${C.border}`,
                                minWidth: 72,
                              }}
                            >
                              <Clock
                                className="w-3.5 h-3.5"
                                style={{ color: C.textTertiary }}
                              />
                              <span
                                className="text-[10px] font-semibold text-center leading-tight"
                                style={{ color: C.textSecondary }}
                              >
                                {step.label}
                              </span>
                              {step.delay && (
                                <span
                                  className="text-[9px]"
                                  style={{ color: C.textTertiary }}
                                >
                                  {step.delay}
                                </span>
                              )}
                            </div>
                          )}

                          {/* ── Action node ── */}
                          {isAction && (
                            <div
                              className="flex flex-col rounded-md overflow-hidden flex-shrink-0"
                              style={{
                                width: 148,
                                backgroundColor: C.surface,
                                border: `1px solid ${C.border}`,
                                boxShadow: C.shadowCard,
                              }}
                            >
                              {/* Colored top strip */}
                              <div
                                className="h-1 w-full flex-shrink-0"
                                style={{ backgroundColor: sc.fg }}
                              />
                              <div className="p-3 flex flex-col gap-1.5">
                                {/* Type badge + icon */}
                                <div className="flex items-center gap-1.5">
                                  <div
                                    className="w-5 h-5 rounded-sm flex items-center justify-center flex-shrink-0"
                                    style={{
                                      backgroundColor: sc.bg,
                                      color: sc.fg,
                                    }}
                                  >
                                    <AutomationStepIcon type={step.type} />
                                  </div>
                                  <span
                                    className="text-[10px] font-semibold uppercase tracking-wide"
                                    style={{ color: sc.fg }}
                                  >
                                    {step.type === "condition"
                                      ? "Branch"
                                      : step.type.toUpperCase()}
                                  </span>
                                  {step.delay && (
                                    <span
                                      className="ml-auto text-[9px] px-1 py-0.5 rounded"
                                      style={{
                                        backgroundColor: C.elevated,
                                        color: C.textTertiary,
                                      }}
                                    >
                                      {step.delay}
                                    </span>
                                  )}
                                </div>

                                {/* Step name */}
                                <p
                                  className="text-[11px] font-semibold leading-tight"
                                  style={{ color: C.textPrimary }}
                                >
                                  {step.label}
                                </p>

                                {/* Subject line */}
                                {step.subject && (
                                  <p
                                    className="text-[10px] italic leading-tight line-clamp-2"
                                    style={{ color: C.textSecondary }}
                                  >
                                    &ldquo;{step.subject}&rdquo;
                                  </p>
                                )}

                                {/* Branch label */}
                                {step.type === "condition" && step.body && (
                                  <p
                                    className="text-[10px] leading-tight"
                                    style={{ color: C.textTertiary }}
                                  >
                                    {step.body}
                                  </p>
                                )}

                                {/* Metrics */}
                                {hasSentData && (
                                  <div
                                    className="mt-1 pt-2 flex flex-col gap-1"
                                    style={{
                                      borderTop: `1px solid ${C.border}`,
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span
                                        className="text-[9px]"
                                        style={{ color: C.textTertiary }}
                                      >
                                        Sent
                                      </span>
                                      <span
                                        className="text-[10px] font-semibold tabular-nums"
                                        style={{ color: C.textPrimary }}
                                      >
                                        {step.sent!.toLocaleString()}
                                      </span>
                                    </div>
                                    {step.opened !== undefined &&
                                      step.sent! > 0 && (
                                        <div className="flex items-center justify-between">
                                          <span
                                            className="text-[9px]"
                                            style={{ color: C.textTertiary }}
                                          >
                                            Opened
                                          </span>
                                          <span
                                            className="text-[10px] font-semibold tabular-nums"
                                            style={{ color: C.success }}
                                          >
                                            {Math.round(
                                              (step.opened / step.sent!) * 100,
                                            )}
                                            %
                                          </span>
                                        </div>
                                      )}
                                    {step.clicked !== undefined &&
                                      step.sent! > 0 && (
                                        <div className="flex items-center justify-between">
                                          <span
                                            className="text-[9px]"
                                            style={{ color: C.textTertiary }}
                                          >
                                            Clicked
                                          </span>
                                          <span
                                            className="text-[10px] font-semibold tabular-nums"
                                            style={{ color: C.accent }}
                                          >
                                            {Math.round(
                                              (step.clicked / step.sent!) * 100,
                                            )}
                                            %
                                          </span>
                                        </div>
                                      )}
                                  </div>
                                )}
                                {isDraft && (
                                  <p
                                    className="text-[9px] italic mt-1 pt-1"
                                    style={{
                                      color: C.textQuaternary,
                                      borderTop: `1px solid ${C.border}`,
                                    }}
                                  >
                                    Not yet sent
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* ── Arrow connector ── */}
                          {i < selected.steps.length - 1 && (
                            <div
                              className="flex items-center flex-shrink-0"
                              style={{ width: 28 }}
                            >
                              <div
                                className="flex-1 h-px"
                                style={{ backgroundColor: C.border }}
                              />
                              <svg
                                width="6"
                                height="8"
                                viewBox="0 0 6 8"
                                fill="none"
                                style={{ flexShrink: 0 }}
                              >
                                <path
                                  d="M0 0L6 4L0 8"
                                  fill={C.border}
                                />
                              </svg>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          ) : (
            /* ── Grid view ─────────────────────────────────── */
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="grid grid-cols-2 gap-3"
            >
              {filtered.map((pipeline, idx) => {
                const sb = statusBadge(pipeline.status);
                const actionSteps = pipeline.steps.filter(
                  (s) => s.type !== "wait",
                );
                return (
                  <motion.button
                    key={pipeline.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => setSelectedId(pipeline.id)}
                    className="text-left rounded-xl p-4 transition-all duration-150"
                    style={{
                      backgroundColor: C.surface,
                      border: `1px solid ${C.border}`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        C.borderStrong;
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        C.elevated;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        C.border;
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        C.surface;
                    }}
                  >
                    {/* Card header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold leading-tight"
                          style={{ color: C.textPrimary }}
                        >
                          {pipeline.name}
                        </p>
                        <p
                          className="text-[11px] mt-0.5 line-clamp-2 leading-relaxed"
                          style={{ color: C.textTertiary }}
                        >
                          {pipeline.description}
                        </p>
                      </div>
                      <span
                        className="px-2 py-0.5 text-[10px] font-semibold rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: sb.bg,
                          color: sb.fg,
                        }}
                      >
                        {sb.label}
                      </span>
                    </div>

                    {/* Audience + trigger */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <span
                        className="px-1.5 py-0.5 text-[10px] font-semibold rounded"
                        style={{
                          backgroundColor: pipeline.audienceColor + "18",
                          color: pipeline.audienceColor,
                        }}
                      >
                        {pipeline.audience}
                      </span>
                      <span
                        className="text-[10px] truncate"
                        style={{ color: C.textQuaternary }}
                      >
                        {pipeline.trigger}
                      </span>
                    </div>

                    {/* Step flow pills */}
                    <div className="flex items-center gap-1 mb-3 flex-wrap">
                      {pipeline.steps.map((step, si) => {
                        const sc = stepColor(step.type);
                        return (
                          <div key={si} className="flex items-center gap-1">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                backgroundColor: sc.bg,
                                color: sc.fg,
                              }}
                            >
                              <AutomationStepIcon type={step.type} />
                            </div>
                            {si < pipeline.steps.length - 1 && (
                              <div
                                className="w-3 h-px"
                                style={{ backgroundColor: C.border }}
                              />
                            )}
                          </div>
                        );
                      })}
                      <span
                        className="ml-1 text-[10px]"
                        style={{ color: C.textTertiary }}
                      >
                        {actionSteps.length} action
                        {actionSteps.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Metrics row */}
                    <div
                      className="flex items-center gap-4 pt-2.5"
                      style={{ borderTop: `1px solid ${C.border}` }}
                    >
                      {pipeline.stats.sent > 0 ? (
                        <>
                          <div>
                            <p
                              className="text-[10px]"
                              style={{ color: C.textTertiary }}
                            >
                              Sent
                            </p>
                            <p
                              className="text-xs font-semibold tabular-nums"
                              style={{ color: C.textPrimary }}
                            >
                              {pipeline.stats.sent.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p
                              className="text-[10px]"
                              style={{ color: C.textTertiary }}
                            >
                              Open rate
                            </p>
                            <p
                              className="text-xs font-semibold tabular-nums"
                              style={{ color: C.success }}
                            >
                              {pipeline.stats.openRate}%
                            </p>
                          </div>
                          <div>
                            <p
                              className="text-[10px]"
                              style={{ color: C.textTertiary }}
                            >
                              Conversions
                            </p>
                            <p
                              className="text-xs font-semibold tabular-nums"
                              style={{ color: C.accent }}
                            >
                              {pipeline.stats.conversions}
                            </p>
                          </div>
                        </>
                      ) : (
                        <span
                          className="text-[10px] italic"
                          style={{ color: C.textQuaternary }}
                        >
                          Draft — not yet sent
                        </span>
                      )}
                      <div className="ml-auto">
                        <ChevronRight
                          className="w-3.5 h-3.5"
                          style={{ color: C.textTertiary }}
                        />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isCreating && (
          <NewAutomationWizard
            state={wizardState}
            onChange={(patch) => setWizardState((prev) => ({ ...prev, ...patch }))}
            onClose={() => setIsCreating(false)}
            onCreatePipeline={handleCreatePipeline}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Impersonate ──────────────────────────────────────────────────────────────

const DEMO_IMPERSONATE_PARENTS = [
  {
    id: "ip1",
    name: "Sarah Richardson",
    email: "sarah.r@email.com",
    initials: "SR",
    color: "#5E7C68",
    children: [
      {
        name: "Emma Richardson",
        grade: "Elementary (K–5)",
        initials: "ER",
        color: "#7FA888",
      },
    ],
    program: "summer_26",
    programLabel: "Summer 2026",
    status: "Enrolled",
    startDate: "May 26, 2026",
    teacher: "Ms. Taylor Reyes",
    nextPayment: { amount: "$420", dueDate: "May 1, 2026" },
    lastPayment: { amount: "$420", date: "Apr 1, 2026" },
  },
  {
    id: "ip2",
    name: "Michael & Diana Foster",
    email: "diana@email.com",
    initials: "DF",
    color: "#38BDF8",
    children: [
      { name: "Noah Foster", grade: "Pre-K", initials: "NF", color: "#60B4E0" },
    ],
    program: "summer_26",
    programLabel: "Summer 2026",
    status: "Enrolled",
    startDate: "May 26, 2026",
    teacher: "Ms. Paige Sun",
    nextPayment: { amount: "$380", dueDate: "May 1, 2026" },
    lastPayment: { amount: "$380", date: "Apr 1, 2026" },
  },
  {
    id: "ip3",
    name: "James & Priya Patel",
    email: "priya.p@email.com",
    initials: "PP",
    color: "#F59E0B",
    children: [
      {
        name: "Aiden Patel",
        grade: "Elementary (K–5)",
        initials: "AP",
        color: "#F5A623",
      },
      { name: "Leah Patel", grade: "Pre-K", initials: "LP", color: "#F5C66A" },
    ],
    program: "school_year_26_27",
    programLabel: "School Year 26–27",
    status: "Enrolled",
    startDate: "Sep 8, 2026",
    teacher: "Ms. Nicole Park",
    nextPayment: { amount: "$760", dueDate: "May 1, 2026" },
    lastPayment: { amount: "$760", date: "Apr 1, 2026" },
  },
  {
    id: "ip4",
    name: "Kevin Okonkwo",
    email: "kokonkwo@email.com",
    initials: "KO",
    color: "#8B5CF6",
    children: [
      {
        name: "Chidera Okonkwo",
        grade: "Pre-K",
        initials: "CO",
        color: "#A78BFA",
      },
    ],
    program: "school_year_26_27",
    programLabel: "School Year 26–27",
    status: "Active",
    startDate: "Sep 8, 2026",
    teacher: "Ms. Taylor Reyes",
    nextPayment: { amount: "$420", dueDate: "May 1, 2026" },
    lastPayment: { amount: "$420", date: "Apr 1, 2026" },
  },
];

type ImpersonateParent = (typeof DEMO_IMPERSONATE_PARENTS)[number];

function ImpersonatePage() {
  const [selected, setSelected] = useState<ImpersonateParent | null>(null);

  return (
    <div
      className="flex h-full gap-0 overflow-hidden"
      style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.surface }}
    >
      {/* Left panel — parent list */}
      <div
        className="flex-shrink-0 overflow-y-auto"
        style={{ width: 170, borderRight: `1px solid ${C.border}` }}
      >
        <div className="px-3 py-3 border-b" style={{ borderColor: C.border }}>
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: C.textQuaternary }}
          >
            Families
          </p>
        </div>
        {DEMO_IMPERSONATE_PARENTS.map((parent) => {
          const isActive = selected?.id === parent.id;
          const words = parent.name.split(" ");
          const lastInitial = words[words.length - 1][0] + ".";
          const shortName = words.slice(0, -1).join(" ") + " " + lastInitial;
          return (
            <button
              key={parent.id}
              onClick={() => setSelected(isActive ? null : parent)}
              className="w-full text-left transition-colors duration-150"
              style={{
                padding: "10px 12px",
                backgroundColor: isActive ? C.accentLight : "transparent",
                borderLeft: `2px solid ${isActive ? C.accent : "transparent"}`,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    backgroundColor: parent.color + "22",
                    color: parent.color,
                  }}
                >
                  {parent.initials}
                </div>
                <div className="min-w-0">
                  <p
                    className="text-xs font-medium truncate"
                    style={{ color: isActive ? C.accent : C.textPrimary }}
                  >
                    {shortName}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parent.children.map((c) => (
                      <span
                        key={c.name}
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: C.accentLight,
                          color: C.accent,
                        }}
                      >
                        {c.name.split(" ")[0]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selected ? (
          <div
            className="flex-1 flex flex-col items-center justify-center gap-3"
            style={{ color: C.textTertiary }}
          >
            <Eye className="w-10 h-10" style={{ opacity: 0.3 }} />
            <p className="text-sm" style={{ color: C.textTertiary }}>
              Select a parent to preview their dashboard
            </p>
          </div>
        ) : (
          <>
            {/* "Viewing as" bar */}
            <div
              className="flex items-center justify-between px-5 py-3 flex-shrink-0"
              style={{
                backgroundColor: C.accentLight,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" style={{ color: C.accent }} />
                <span
                  className="text-sm font-semibold"
                  style={{ color: C.accent }}
                >
                  Viewing as {selected.name}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: C.accent + "22", color: C.accent }}
                >
                  {selected.programLabel}
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  color: C.textSecondary,
                  backgroundColor: C.elevated,
                  border: `1px solid ${C.border}`,
                }}
              >
                <X className="w-3 h-3" /> Exit
              </button>
            </div>

            {/* Full parent portal */}
            <div className="flex-1 overflow-hidden">
              <ParentDashboardDemo />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Coming soon stub ─────────────────────────────────────────────────────────

function ComingSoonPage({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center gap-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
        style={{ backgroundColor: C.accentLight }}
      >
        <span style={{ color: C.accent, fontSize: 28 }}>✦</span>
      </div>
      <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
        {name}
      </h2>
      <p className="text-sm max-w-xs" style={{ color: C.textTertiary }}>
        This page is part of Phase 3. Full admin functionality coming soon.
      </p>
      <span
        className="px-3 py-1.5 text-xs font-semibold rounded-full"
        style={{ backgroundColor: C.accentLight, color: C.accent }}
      >
        Phase 3
      </span>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

type ActivePage =
  | "dashboard"
  | "leads"
  | "people"
  | "programs"
  | "budget"
  | "marketing"
  | "impersonate";

interface NavItem {
  key: ActivePage | string;
  name: string;
  icon: React.ReactNode;
  phase1?: boolean;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Main",
    items: [
      {
        key: "dashboard",
        name: "Dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
        phase1: true,
      },
      {
        key: "leads",
        name: "Admissions",
        icon: <GraduationCap className="w-4 h-4" />,
        phase1: true,
      },
      {
        key: "people",
        name: "Families",
        icon: <Users className="w-4 h-4" />,
        phase1: true,
      },
      {
        key: "programs",
        name: "Programs",
        icon: <BookOpen className="w-4 h-4" />,
        phase1: true,
      },
    ],
  },
  {
    label: "Tools",
    items: [
      {
        key: "budget",
        name: "Budget",
        icon: <DollarSign className="w-4 h-4" />,
        phase1: true,
      },
      {
        key: "marketing",
        name: "Marketing",
        icon: <Megaphone className="w-4 h-4" />,
        phase1: true,
      },
      {
        key: "impersonate",
        name: "Impersonate",
        icon: <Eye className="w-4 h-4" />,
        phase1: true,
      },
    ],
  },
];

function Sidebar({
  activePage,
  onNavigate,
  isExpanded,
  onToggleExpand,
  onToggleTheme,
  isDark,
  admissionsTab,
  onAdmissionsSubtab,
}: {
  activePage: string;
  onNavigate: (page: ActivePage) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
  admissionsTab: AdmissionsTab;
  onAdmissionsSubtab: (tab: AdmissionsTab) => void;
}) {
  const [admissionsOpen, setAdmissionsOpen] = useState(true);
  return (
    <motion.aside
      animate={{ width: isExpanded ? 185 : 52 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col h-full flex-shrink-0 overflow-hidden"
      style={{ backgroundColor: C.surface, borderRight: `1px solid ${C.border}`, zIndex: 1, position: "relative" }}
    >
      {/* Logo */}
      <div
        className="flex items-center overflow-hidden"
        style={{
          padding: isExpanded ? "14px 16px" : "14px 0",
          justifyContent: isExpanded ? "flex-start" : "center",
        }}
      >
        <Image
          src="/images/Logo.png"
          alt="SchoolLayer"
          width={isExpanded ? 120 : 28}
          height={28}
          className="flex-shrink-0 object-contain"
          style={{ maxHeight: 28 }}
        />
      </div>

      {/* Theme toggle */}
      <div
        style={{
          borderBottom: `1px solid ${C.border}`,
          padding: isExpanded ? "0 10px 10px" : "0 6px 10px",
        }}
      >
        <button
          data-tour-id="theme-toggle"
          onClick={onToggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="w-full flex items-center transition-colors duration-150"
          style={{
            justifyContent: isExpanded ? "flex-start" : "center",
            gap: isExpanded ? "8px" : 0,
            padding: "6px 8px",
            borderRadius: C.r.md,
            border: `1px solid ${C.border}`,
            backgroundColor: C.elevated,
            color: C.textSecondary,
            cursor: "pointer",
          }}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 flex-shrink-0" /> : <Moon className="w-3.5 h-3.5 flex-shrink-0" />}
          {isExpanded && (
            <span className="text-xs font-medium">{isDark ? "Light mode" : "Dark mode"}</span>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav
        className="flex-1 overflow-y-auto space-y-5"
        style={{ padding: isExpanded ? "16px 12px" : "16px 6px" }}
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {isExpanded && (
              <div
                className="text-xs font-semibold uppercase tracking-wider px-3 mb-1.5"
                style={{ color: C.textQuaternary }}
              >
                {group.label}
              </div>
            )}
            {!isExpanded && group.label !== "Main" && (
              <div
                style={{
                  height: "1px",
                  backgroundColor: C.border,
                  margin: "0 6px 8px",
                }}
              />
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = activePage === item.key;
                const admissionsSubtabs: { key: AdmissionsTab; label: string }[] = [
                  { key: "flows", label: "Enrollment Flows" },
                  { key: "submissions", label: "Submissions" },
                  { key: "applications", label: "Applications" },
                ];
                return (
                  <div key={item.key}>
                    <button
                      data-tour-id={`nav-${item.key}`}
                      onClick={() => onNavigate(item.key as ActivePage)}
                      title={!isExpanded ? item.name : undefined}
                      className="w-full flex items-center gap-2.5 rounded-sm text-sm font-medium transition-all duration-150 relative"
                      style={{
                        padding: isExpanded ? "8px 12px" : "8px",
                        justifyContent: isExpanded ? "flex-start" : "center",
                        backgroundColor: active ? C.accentLight : "transparent",
                        color: active
                          ? C.accent
                          : item.phase1
                            ? C.textTertiary
                            : C.textQuaternary,
                        borderLeft: isExpanded
                          ? active
                            ? `2px solid ${C.accent}`
                            : "2px solid transparent"
                          : "none",
                        opacity: item.phase1 || active ? 1 : 0.5,
                      }}
                    >
                      <span
                        style={{
                          color: active
                            ? C.accent
                            : item.phase1
                              ? C.textTertiary
                              : C.textQuaternary,
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </span>
                      {isExpanded && (
                        <>
                          <span className="flex-1 truncate text-left">{item.name}</span>
                          {!item.phase1 && item.key !== "teacher" && item.key !== "leads" && (
                            <span
                              className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: C.elevated,
                                color: C.textQuaternary,
                              }}
                            >
                              P2
                            </span>
                          )}
                          {item.key === "teacher" && (
                            <ChevronRight className="w-3 h-3 opacity-40 flex-shrink-0" />
                          )}
                          {item.key === "leads" && (
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={(e) => { e.stopPropagation(); setAdmissionsOpen((v) => !v); }}
                              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); setAdmissionsOpen((v) => !v); } }}
                              className="flex-shrink-0 flex items-center justify-center transition-transform duration-200"
                              style={{
                                color: active ? C.accent : C.textTertiary,
                                padding: "2px",
                                cursor: "pointer",
                                transform: admissionsOpen ? "rotate(90deg)" : "rotate(0deg)",
                              }}
                            >
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          )}
                        </>
                      )}
                    </button>
                    {/* Admissions subtabs */}
                    {item.key === "leads" && isExpanded && admissionsOpen && (
                      <AnimatePresence initial={false}>
                        <motion.div
                          key="admissions-subtabs"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <div
                            className="flex mt-1 mb-0.5"
                            style={{ paddingLeft: "12px" }}
                          >
                            {/* Single vertical connector line */}
                            <div
                              className="flex-shrink-0"
                              style={{
                                width: "1px",
                                backgroundColor: C.border,
                                marginRight: "10px",
                                borderRadius: "1px",
                              }}
                            />
                            <div className="flex-1 space-y-0.5">
                              {admissionsSubtabs.map((sub) => {
                                const subActive = active && admissionsTab === sub.key;
                                return (
                                  <button
                                    key={sub.key}
                                    onClick={() => {
                                      onNavigate("leads");
                                      onAdmissionsSubtab(sub.key);
                                    }}
                                    className="w-full text-left text-xs font-medium transition-all duration-150"
                                    style={{
                                      padding: "5px 8px",
                                      borderRadius: C.r.sm,
                                      backgroundColor: subActive ? C.accentLight : "transparent",
                                      color: subActive ? C.accent : C.textTertiary,
                                    }}
                                  >
                                    {sub.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: isExpanded ? "16px" : "12px 6px",
        }}
      >
        <button
          onClick={onToggleExpand}
          className="w-full flex items-center transition-colors duration-150 mb-3"
          style={{
            justifyContent: isExpanded ? "flex-start" : "center",
            gap: isExpanded ? "10px" : 0,
            padding: isExpanded ? "6px 8px" : "6px",
            borderRadius: C.r.md,
            border: "none",
            backgroundColor: "transparent",
            color: C.textTertiary,
            cursor: "pointer",
          }}
        >
          {isExpanded ? (
            <PanelLeftClose className="w-4 h-4 flex-shrink-0" />
          ) : (
            <PanelLeftOpen className="w-4 h-4 flex-shrink-0" />
          )}
          {isExpanded && <span className="text-xs font-medium">Collapse</span>}
        </button>
        <div
          className="flex items-center"
          style={{
            justifyContent: isExpanded ? "flex-start" : "center",
            gap: isExpanded ? "12px" : 0,
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
            style={{ backgroundColor: C.accentLight, color: C.accent }}
          >
            A
          </div>
          {isExpanded && (
            <span
              className="text-xs truncate flex-1"
              style={{ color: C.textTertiary }}
            >
              admin@mudkitchen.co
            </span>
          )}
        </div>
        {isExpanded && (
          <button
            className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg mt-3 transition-colors"
            style={{
              color: C.textSecondary,
              backgroundColor: C.elevated,
              border: `1px solid ${C.border}`,
            }}
          >
            Sign out
          </button>
        )}
      </div>
    </motion.aside>
  );
}

// ─── Root component ────────────────────────────────────────────────────────────

export default function AdminDashboardDemo({
  disableTour = false,
  initialPage = "dashboard",
  hideNav = false,
  defaultSidebarExpanded,
}: {
  disableTour?: boolean
  initialPage?: ActivePage
  hideNav?: boolean
  defaultSidebarExpanded?: boolean
}) {
  const [activePage, setActivePage] = useState<ActivePage>(initialPage);
  const [admissionsTab, setAdmissionsTab] = useState<AdmissionsTab>("flows");
  const [isExpanded, setIsExpanded] = useState(
    defaultSidebarExpanded !== undefined ? defaultSidebarExpanded : !disableTour
  );
  const [isDark, setIsDark] = useState(false);
  C = isDark ? C_DARK : C_LIGHT;

  const [backdropClose, setBackdropClose] = useState<(() => void) | null>(null);
  const backdropCtx = useMemo(() => ({
    openBackdrop: (onClose: () => void) => setBackdropClose(() => onClose),
    closeBackdrop: () => setBackdropClose(null),
  }), []);

  // ── Tour state ──────────────────────────────────────────────────────────────
  const [isTouring, setIsTouring] = useState(!disableTour);
  const [tourStep, setTourStep] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorClicking, setCursorClicking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tourTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const PAGE_NAMES: Record<string, string> = {
    budget: "Budget",
    marketing: "Marketing",
    teacher: "Teacher View",
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage />;
      case "leads":
        return <AdmissionsPage activeTab={admissionsTab} onTabChange={setAdmissionsTab} />;
      case "people":
        return <PeoplePage />;
      case "programs":
        return <ProgramsPage />;
      case "budget":
        return <BudgetPage />;
      case "marketing":
        return <MarketingPage />;
      case "impersonate":
        return <ImpersonatePage />;
      default:
        return <ComingSoonPage name={PAGE_NAMES[activePage] ?? activePage} />;
    }
  };

  const getTargetCenter = useCallback(
    (targetId: string): { x: number; y: number } | null => {
      if (!containerRef.current) return null;
      const el = containerRef.current.querySelector(
        `[data-tour-id="${targetId}"]`,
      );
      if (!el) return null;
      const cr = containerRef.current.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      return {
        x: er.left - cr.left + er.width / 2,
        y: er.top - cr.top + er.height / 2,
      };
    },
    [],
  );

  const tourSteps = useMemo(
    () => [
      {
        action: () => setActivePage("dashboard"),
        targetId: "nav-dashboard",
        holdMs: 2000,
        clickAnimation: true,
      },
      {
        action: () => setActivePage("leads"),
        targetId: "nav-leads",
        holdMs: 1800,
        clickAnimation: true,
      },
      {
        action: () => {
          const el = containerRef.current?.querySelector(
            '[data-tour-id="app-view-kanban"]',
          );
          (el as HTMLElement)?.click();
        },
        targetId: "app-view-kanban",
        holdMs: 1800,
        clickAnimation: true,
      },
      {
        action: () => {
          const el = containerRef.current?.querySelector(
            '[data-tour-id="app-view-pipeline"]',
          );
          (el as HTMLElement)?.click();
        },
        targetId: "app-view-pipeline",
        holdMs: 1800,
        clickAnimation: true,
      },
      {
        action: () => setActivePage("people"),
        targetId: "nav-people",
        holdMs: 1800,
        clickAnimation: true,
      },
      {
        action: () => setActivePage("messages"),
        targetId: "nav-messages",
        holdMs: 1800,
        clickAnimation: true,
      },
      {
        action: () => setActivePage("budget"),
        targetId: "nav-budget",
        holdMs: 1600,
        clickAnimation: true,
      },
      {
        action: () => {
          const el = containerRef.current?.querySelector(
            '[data-tour-id="budget-tab-expenses"]',
          );
          (el as HTMLElement)?.click();
        },
        targetId: "budget-tab-expenses",
        holdMs: 1600,
        clickAnimation: true,
      },
      {
        action: () => {
          const el = containerRef.current?.querySelector(
            '[data-tour-id="budget-tab-revenue"]',
          );
          (el as HTMLElement)?.click();
        },
        targetId: "budget-tab-revenue",
        holdMs: 1600,
        clickAnimation: true,
      },
      {
        action: () => {
          const el = containerRef.current?.querySelector(
            '[data-tour-id="budget-tab-analysis"]',
          );
          (el as HTMLElement)?.click();
        },
        targetId: "budget-tab-analysis",
        holdMs: 1800,
        clickAnimation: true,
      },

      {
        action: () => setActivePage("transactions"),
        targetId: "nav-transactions",
        holdMs: 1600,
        clickAnimation: true,
      },
      {
        action: () => {
          const el = containerRef.current?.querySelector(
            '[data-tour-id="tx-tab-checklist"]',
          );
          (el as HTMLElement)?.click();
        },
        targetId: "tx-tab-checklist",
        holdMs: 2000,
        clickAnimation: true,
      },
      {
        action: () => setActivePage("programs"),
        targetId: "nav-programs",
        holdMs: 1800,
        clickAnimation: true,
      },
      {
        action: () => setActivePage("calendar"),
        targetId: "nav-calendar",
        holdMs: 1800,
        clickAnimation: true,
      },
      {
        action: () => setActivePage("dashboard"),
        targetId: "nav-dashboard",
        holdMs: 2000,
        clickAnimation: true,
      },
    ],
    [],
  );

  useEffect(() => {
    if (!isTouring) return;
    const step = tourSteps[tourStep];
    let cancelled = false;

    const t1 = setTimeout(() => {
      if (cancelled) return;
      const pos = getTargetCenter(step.targetId);
      if (pos) {
        setCursorPos(pos);
        setCursorVisible(true);
      }

      const t2 = setTimeout(() => {
        if (cancelled) return;
        step.action();

        if (step.clickAnimation) {
          setCursorClicking(true);
          setTimeout(() => {
            if (!cancelled) setCursorClicking(false);
          }, 350);
        }

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

  const cursorColor = isDark ? "rgba(110,148,120,0.9)" : "rgba(74,124,89,0.85)";
  const cursorGlow = isDark
    ? "0 0 0 4px rgba(110,148,120,0.2)"
    : "0 0 0 4px rgba(74,124,89,0.2)";

  return (
    <BackdropContext.Provider value={backdropCtx}>
    <div
      ref={containerRef}
      onMouseEnter={handleTourMouseEnter}
      onMouseLeave={handleTourMouseLeave}
      className="flex h-full overflow-hidden relative"
      style={{
        backgroundColor: C.bg,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <AnimatePresence>
        {backdropClose && (
          <motion.div
            key="root-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.15)", zIndex: 2 }}
            onClick={() => { backdropClose(); setBackdropClose(null); }}
          />
        )}
      </AnimatePresence>
      {!hideNav && (
        <Sidebar
          activePage={activePage}
          onNavigate={(page) => setActivePage(page)}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded((v) => !v)}
          onToggleTheme={() => setIsDark((v) => !v)}
          isDark={isDark}
          admissionsTab={admissionsTab}
          onAdmissionsSubtab={(tab) => {
            setActivePage("leads");
            setAdmissionsTab(tab);
          }}
        />
      )}
      <main className="flex-1 overflow-hidden">
        {/* This wrapper is the containing block for all page overlays and panels.
            It is inside <main> (right of sidebar), so absolute children cannot
            extend over the sidebar regardless of z-index. */}
        <div className="relative h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`h-full ${
                activePage === "messages" || activePage === "calendar" || activePage === "impersonate" ||
                activePage === "leads" || activePage === "people" ||
                activePage === "transactions" || activePage === "emails" ||
                activePage === "marketing"
                  ? ""
                  : "max-w-screen-xl mx-auto p-6"
              }`}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Autoplay tour cursor */}
      {cursorVisible && (
        <motion.div
          className="pointer-events-none absolute z-[100] rounded-full"
          style={{
            width: 18,
            height: 18,
            top: 0,
            left: 0,
            backgroundColor: cursorColor,
            boxShadow: cursorGlow,
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
    </BackdropContext.Provider>
  );
}
