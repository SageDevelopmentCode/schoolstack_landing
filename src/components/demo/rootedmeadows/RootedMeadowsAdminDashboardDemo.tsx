"use client";

import { useState, useRef, useEffect, useCallback, useMemo, createContext, useContext } from "react";
import Image from "next/image";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import ParentDashboardDemo from "@/components/sections/ParentDashboardDemo";
import {
  ROOTED_MEADOWS_ADMIN_COLORS,
  ROOTED_MEADOWS_ADMIN_COMPACT_ROWS,
  ROOTED_MEADOWS_ADMIN_LOGO,
} from "@/data/school-demos/rootedmeadows-admin-demo";
import {
  ROOTED_MEADOWS_APPLICATION_COPY,
  ROOTED_MEADOWS_DEMO_BOOKING_RESPONSES,
  ROOTED_MEADOWS_DEMO_APPLYING_RESPONSES,
} from "@/data/school-demos/rooted-meadows-application";
import ApplicationProgressView from "@/components/demo/rootedmeadows/ApplicationProgressView";
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
  ChevronDown,
  BarChart2,
  PanelLeftOpen,
  PanelLeftClose,
  Search,
  Send,
  X,
  GitBranch,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  HelpCircle,
  Zap,
  UserCheck,
  Plus,
  Layers,
  Loader2,
  ArrowRight,
  PhoneCall,
  Star,
  Timer,
  Download,
  ChevronLeft,
  Shield,
  Home,
  Pencil,
  GripVertical,
  Tag,
  Bell,
  ListFilter,
  Lightbulb,
  Sparkles,
  Wallet,
  UserCircle,
  HeartPulse,
  Car,
  Syringe,
  FileText,
  Heart,
  Pill,
  ShieldCheck,
  Camera,
  AlertTriangle,
  UserPlus,
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
  input: "#2A3038",
  inputBorder: "#3D4554",
  border: "#2D3748",
  borderStrong: "#4B5563",
  accent: "#5E7C68",
  accentBright: "#6E9478",
  accentLight: "rgba(94, 124, 104, 0.15)",
  secondaryBtnBorder: "rgba(94, 124, 104, 0.35)",
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
  clay: "#C4896E",
  clayBg: "rgba(196, 137, 110, 0.12)",
  clayBorder: "rgba(196, 137, 110, 0.30)",
  shadowCard: "0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.4)",
  shadowMedium: "0 4px 16px rgba(0,0,0,0.5)",
  r: { sm: "3px", md: "5px", lg: "6px", xl: "8px", full: "9999px" },
};

const C_LIGHT = {
  bg: ROOTED_MEADOWS_ADMIN_COLORS.bg,
  surface: "#FFFFFF",
  elevated: "#FDFCFB",
  input: "#FAFAFA",
  inputBorder: "#E4E4E7",
  border: ROOTED_MEADOWS_ADMIN_COLORS.border,
  borderStrong: ROOTED_MEADOWS_ADMIN_COLORS.borderStrong,
  accent: ROOTED_MEADOWS_ADMIN_COLORS.accent,
  accentBright: ROOTED_MEADOWS_ADMIN_COLORS.accentBright,
  accentLight: ROOTED_MEADOWS_ADMIN_COLORS.accentLight,
  secondaryBtnBorder: ROOTED_MEADOWS_ADMIN_COLORS.secondaryBtnBorder,
  accentGlow: ROOTED_MEADOWS_ADMIN_COLORS.accentGlow,
  accentMid: ROOTED_MEADOWS_ADMIN_COLORS.accentMid,
  accentDark: ROOTED_MEADOWS_ADMIN_COLORS.accentDark,
  clay: ROOTED_MEADOWS_ADMIN_COLORS.clay,
  clayBg: ROOTED_MEADOWS_ADMIN_COLORS.clayBg,
  clayBorder: ROOTED_MEADOWS_ADMIN_COLORS.clayBorder,
  textPrimary: ROOTED_MEADOWS_ADMIN_COLORS.textPrimary,
  textSecondary: ROOTED_MEADOWS_ADMIN_COLORS.textSecondary,
  textTertiary: "#8A7B6E",
  textQuaternary: "#B8A898",
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
  shadowCard: "0 1px 3px rgba(43,36,29,0.06), 0 1px 2px rgba(43,36,29,0.04)",
  shadowMedium: "0 4px 16px rgba(43,36,29,0.08)",
  r: { sm: "3px", md: "5px", lg: "6px", xl: "8px", full: "9999px" },
};

// mutable — set before each render so all sub-components pick it up
let C = C_DARK;

function demoInputStyle(
  extra?: React.CSSProperties,
): React.CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    outline: "none",
    ...extra,
  };
}

function demoSecondaryButtonStyle(
  extra?: React.CSSProperties,
): React.CSSProperties {
  return {
    backgroundColor: C.accentLight,
    border: `1px solid ${C.secondaryBtnBorder}`,
    color: C.accent,
    ...extra,
  };
}

function demoInactivePillStyle(
  extra?: React.CSSProperties,
): React.CSSProperties {
  return demoSecondaryButtonStyle(extra);
}

function demoSolidPillStyle(
  isActive: boolean,
  extra?: React.CSSProperties,
): React.CSSProperties {
  return isActive
    ? {
        backgroundColor: C.accent,
        color: "#fff",
        border: `1px solid ${C.accent}`,
        ...extra,
      }
    : demoInactivePillStyle(extra);
}

function demoLightPillStyle(
  isActive: boolean,
  extra?: React.CSSProperties,
): React.CSSProperties {
  return {
    ...demoInactivePillStyle(),
    border: `1px solid ${isActive ? C.accent : C.secondaryBtnBorder}`,
    ...extra,
  };
}

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
    id: "l0",
    type: "contact",
    name: "Sarah Whitmore",
    email: "jwalsh@email.com",
    phone: "(512) 555-0198",
    childName: "Ella Whitmore",
    childAge: 8,
    status: "applying",
    tags: ["Fall 2026", "Application"],
    date: "12 minutes ago",
    message:
      "Waldorf Core K–8 — looking for a smaller school environment.",
    flowId: "flow-1",
    applicationSectionIndex: 1,
    responses: ROOTED_MEADOWS_DEMO_APPLYING_RESPONSES,
  },
  {
    id: "l1",
    type: "waitlist",
    name: "Diana Foster",
    email: "diana@email.com",
    phone: "(512) 555-0142",
    childName: "Noah Foster",
    childAge: 5,
    status: "booking",
    tags: ["School Year 2026–27", "Needs observation booking"],
    date: "Yesterday",
    message: "Application complete — observation visit not yet scheduled.",
    flowId: "flow-1",
    applicationSectionIndex: 3,
    responses: ROOTED_MEADOWS_DEMO_BOOKING_RESPONSES,
  },
  {
    id: "l2",
    type: "contact",
    name: "Robert Kim",
    email: "rkim@gmail.com",
    phone: "(737) 555-0218",
    childName: "Hannah Kim",
    childAge: 9,
    status: "booked",
    tags: ["School Year", "Financial Aid", "Observation"],
    date: "Apr 16",
    message: "Observation visit scheduled for Apr 18 at 10:00 AM.",
    flowId: "flow-1",
    responses: {
      f1: "Robert",
      f2: "Kim",
      f3: "rkim@gmail.com",
      f4: "(737) 555-0218",
      f5: "Hannah Kim",
      f6: "2017-01-22",
      f7: "3rd",
      f8: "Full Day",
      f9: "2026-08-18",
      f10: true,
    },
  },
  {
    id: "l3",
    type: "waitlist",
    name: "Priya Patel",
    email: "ppatel@email.com",
    phone: "(512) 555-0391",
    childName: "Raj Patel",
    childAge: 7,
    status: "enrolling",
    tags: ["School Year"],
    date: "Mar 20",
    message: "Completing enrollment checklist in parent portal.",
    flowId: "flow-1",
    responses: {
      f1: "Priya",
      f2: "Patel",
      f3: "ppatel@email.com",
      f4: "(512) 555-0391",
      f5: "Raj Patel",
      f6: "2018-06-04",
      f7: "2nd",
      f8: "Half Day",
      f9: "2026-08-24",
      f10: false,
    },
  },
  {
    id: "l4",
    type: "contact",
    name: "Mark Sullivan",
    email: "msullivan@email.com",
    phone: "(737) 555-0477",
    childName: "Alex & Ben Sullivan",
    childAge: 7,
    status: "needs_contract",
    tags: ["School Year 2026–27"],
    date: "Mar 12",
    message: "Enrollment paperwork complete — contract pending signature.",
    flowId: "flow-1",
    responses: {
      f1: "Mark",
      f2: "Sullivan",
      f3: "msullivan@email.com",
      f4: "(737) 555-0477",
      f5: "Alex & Ben Sullivan",
      f6: "2018-05-10",
      f7: "2nd",
      f8: "Full Day",
      f9: "2026-08-17",
      f10: false,
    },
  },
  {
    id: "l5",
    type: "waitlist",
    name: "Claire Beaumont",
    email: "claire.b@email.com",
    phone: "(512) 555-0563",
    childName: "Lily Beaumont",
    childAge: 6,
    status: "enrolled",
    tags: ["School Year"],
    date: "Mar 15",
    message: null,
    flowId: "flow-1",
    responses: {
      f1: "Claire",
      f2: "Beaumont",
      f3: "claire.b@email.com",
      f4: "(512) 555-0563",
      f5: "Lily Beaumont",
      f6: "2019-11-30",
      f7: "1st",
      f8: "Full Day",
      f9: "2026-08-10",
      f10: false,
    },
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
    responses: {
      f1: "Jerome",
      f2: "Watkins",
      f3: "jwatkins@email.com",
      f4: "(737) 555-0649",
      f5: "Tyler Watkins",
      f6: "2016-04-18",
      f7: "4th",
      f8: "After Care",
      f9: "2026-05-26",
      f10: false,
    },
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
    date: "2 hours ago",
    message: "Heard about your school from a friend. What are your rates?",
    flowId: "flow-3",
    responses: {
      f16: "Sandra Cho",
      f17: "sandcho@email.com",
      f18: "Jordan Cho",
      f19: false,
    },
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
    date: "4 days ago",
    message: null,
    flowId: "flow-1",
    responses: {
      f1: "Luis",
      f2: "Mendez",
      f3: "lmendez@email.com",
      f4: "(737) 555-0821",
      f5: "Sofia Mendez",
      f6: "2017-09-02",
      f7: "3rd",
      f8: "Full Day",
      f9: "2026-08-17",
      f10: true,
    },
  },
  {
    id: "l9",
    type: "contact",
    name: "Jason Park",
    email: "jpark@email.com",
    phone: "(512) 555-0291",
    childName: "Marcus Park",
    childAge: 8,
    status: "scheduled",
    tags: ["Both", "Tour"],
    date: "Yesterday",
    message: "Interested in school year and summer; twin sibling may apply next year.",
    flowId: "flow-4",
    responses: {
      f20: "Jason Park",
      f21: "jpark@email.com",
      f22: "(512) 555-0291",
      f23: "Marcus Park",
      f24: "8",
      f25: "2026-04-14",
      f26: "10:00 AM",
      f27: "School Year & Summer",
      f28: "Interested in school year and summer; twin sibling may apply next year.",
    },
  },
  {
    id: "l10",
    type: "contact",
    name: "Robert Kim",
    email: "rkim@gmail.com",
    phone: "(737) 555-0218",
    childName: "Hannah Kim",
    childAge: 9,
    status: "scheduled",
    tags: ["School Year", "Financial Aid", "Tour"],
    date: "Apr 16",
    message: "Daughter entering 3rd grade; asked about financial aid.",
    flowId: "flow-4",
    responses: {
      f20: "Robert Kim",
      f21: "rkim@gmail.com",
      f22: "(737) 555-0218",
      f23: "Hannah Kim",
      f24: "9",
      f25: "2026-04-16",
      f26: "2:30 PM",
      f27: "School Year 2026–27",
      f28: "Daughter entering 3rd grade; asked about financial aid.",
    },
  },
  {
    id: "l11",
    type: "contact",
    name: "Claire Beaumont",
    email: "claire.b@email.com",
    phone: "(512) 555-0563",
    childName: "Lily Beaumont",
    childAge: 6,
    status: "completed",
    tags: ["School Year", "Tour"],
    date: "Mar 28",
    message: "Great fit; application link sent same day.",
    flowId: "flow-4",
    responses: {
      f20: "Claire Beaumont",
      f21: "claire.b@email.com",
      f22: "(512) 555-0563",
      f23: "Lily Beaumont",
      f24: "6",
      f25: "2026-03-28",
      f26: "10:00 AM",
      f27: "School Year 2026–27",
      f28: "Great fit; application link sent same day.",
    },
  },
  {
    id: "l12",
    type: "contact",
    name: "Sandra Cho",
    email: "sandcho@email.com",
    phone: "(512) 555-0735",
    childName: "Jordan Cho",
    childAge: 7,
    status: "requested",
    tags: ["Tour"],
    date: "52 minutes ago",
    message: "Requested a tour for next week — awaiting confirmation.",
    flowId: "flow-4",
    responses: {
      f20: "Sandra Cho",
      f21: "sandcho@email.com",
      f22: "(512) 555-0735",
      f23: "Jordan Cho",
      f24: "7",
      f25: "",
      f26: "",
      f27: "School Year 2026–27",
      f28: "Requested a tour for next week — awaiting confirmation.",
    },
  },
  {
    id: "l13",
    type: "contact",
    name: "Brian Thornton",
    email: "bthornton@email.com",
    phone: "(737) 555-0312",
    childName: "Ella Thornton",
    childAge: 6,
    status: "scheduled",
    tags: ["Summer 2026", "Tour"],
    date: "Apr 11",
    message: "Referred by current family; summer program focus.",
    flowId: "flow-4",
    responses: {
      f20: "Brian Thornton",
      f21: "bthornton@email.com",
      f22: "(737) 555-0312",
      f23: "Ella Thornton",
      f24: "6",
      f25: "2026-04-11",
      f26: "11:00 AM",
      f27: "Summer 2026",
      f28: "Referred by current family; summer program focus.",
    },
  },
  {
    id: "l14",
    type: "contact",
    name: "Kevin Okonkwo",
    email: "kokonkwo@email.com",
    phone: "(512) 555-0884",
    childName: "Chidera Okonkwo",
    childAge: 8,
    status: "completed",
    tags: ["Both", "Tour"],
    date: "Mar 22",
    message: "Strong interest; application submitted after tour.",
    flowId: "flow-4",
    responses: {
      f20: "Kevin Okonkwo",
      f21: "kokonkwo@email.com",
      f22: "(512) 555-0884",
      f23: "Chidera Okonkwo",
      f24: "8",
      f25: "2026-03-22",
      f26: "10:00 AM",
      f27: "School Year & Summer",
      f28: "Strong interest; application submitted after tour.",
    },
  },
  {
    id: "l15",
    type: "contact",
    name: "Mark Sullivan",
    email: "msullivan@email.com",
    phone: "(737) 555-0477",
    childName: "Alex & Ben Sullivan",
    childAge: 7,
    status: "no_show",
    tags: ["Summer 2026", "Tour"],
    date: "Apr 2",
    message: "Did not attend; follow-up email sent.",
    flowId: "flow-4",
    responses: {
      f20: "Mark Sullivan",
      f21: "msullivan@email.com",
      f22: "(737) 555-0477",
      f23: "Alex & Ben Sullivan",
      f24: "7",
      f25: "2026-04-02",
      f26: "3:00 PM",
      f27: "Summer 2026",
      f28: "Did not attend; follow-up email sent.",
    },
  },
  {
    id: "l16",
    type: "contact",
    name: "Priya Patel",
    email: "ppatel@email.com",
    phone: "(512) 555-0391",
    childName: "Raj Patel",
    childAge: 7,
    status: "cancelled",
    tags: ["School Year", "Tour"],
    date: "Mar 18",
    message: "Family rescheduled out of area move.",
    flowId: "flow-4",
    responses: {
      f20: "Priya Patel",
      f21: "ppatel@email.com",
      f22: "(512) 555-0391",
      f23: "Raj Patel",
      f24: "7",
      f25: "2026-03-18",
      f26: "1:00 PM",
      f27: "School Year 2026–27",
      f28: "Family rescheduled out of area move.",
    },
  },
];

type DemoLead = (typeof DEMO_LEADS)[number];

const STATUS_COLORS: Record<
  string,
  { bg: string; border: string; text: string; label: string }
> = {
  applying: {
    bg: C.infoBg,
    border: C.infoBorder,
    text: C.info,
    label: "Applying",
  },
  booking: {
    bg: C.errorBg,
    border: C.errorBorder,
    text: C.error,
    label: "Booking",
  },
  booked: {
    bg: C.infoBg,
    border: C.infoBorder,
    text: C.info,
    label: "Booked",
  },
  needs_contract: {
    bg: C.warningBg,
    border: C.warningBorder,
    text: C.warning,
    label: "Needs Contract",
  },
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
  lost: {
    bg: C.errorBg,
    border: C.errorBorder,
    text: C.error,
    label: "Lost",
  },
  scheduled: {
    bg: C.infoBg,
    border: C.infoBorder,
    text: C.info,
    label: "Scheduled",
  },
  completed: {
    bg: C.successBg,
    border: C.successBorder,
    text: C.success,
    label: "Completed",
  },
  no_show: {
    bg: C.errorBg,
    border: C.errorBorder,
    text: C.error,
    label: "No Show",
  },
  cancelled: {
    bg: C.elevated,
    border: C.border,
    text: C.textTertiary,
    label: "Cancelled",
  },
  requested: {
    bg: C.warningBg,
    border: C.warningBorder,
    text: C.warning,
    label: "Requested",
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

/** Align admin program IDs with parent/transaction demo IDs. */
const PROGRAM_ID_MAP: Record<string, string> = {
  summer_26: "summer",
  school_year_26_27: "school_year",
  homeschool_drop_in: "homeschool_drop_in",
};


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
  children: { name: string; dob: string; photo?: string }[];
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
    children: [{ name: "Emma Richardson", dob: "Mar 12, 2017", photo: "/images/people/students/patrick-hauth-K6p0llhyvP8-unsplash.jpg" }],
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
    children: [{ name: "Liam Torres", dob: "Jun 5, 2015", photo: "/images/people/students/ibrahim-guetar-NUkjka_RqUE-unsplash.jpg" }],
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
    children: [{ name: "Noah Foster", dob: "Sep 22, 2019", photo: "/images/people/students/izzy-park-8hBY-30cEqI-unsplash.jpg" }],
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
    children: [{ name: "Isabelle Clarke", dob: "Jan 30, 2013", photo: "/images/people/students/cristina-anne-costello-i8n-TbgzSUE-unsplash.jpg" }],
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
    children: [{ name: "Chidera Okonkwo", dob: "Nov 8, 2016", photo: "/images/people/students/ben-mullins-je240KkJIuA-unsplash.jpg" }],
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
      { name: "Kai Simmons", dob: "Feb 14, 2013", photo: "/images/people/students/vitaly-gariev-_z2Ii760I38-unsplash.jpg" },
      { name: "Jade Simmons", dob: "Aug 3, 2016", photo: "/images/people/students/aditya-sethia-y9se00qtzd4-unsplash.jpg" },
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
    children: [{ name: "Marcus Webb", dob: "Jul 18, 2014", photo: "/images/people/students/thomas-park-qnFFfsrxzIk-unsplash.jpg" }],
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
    children: [{ name: "Lily Nakamura", dob: "Oct 3, 2017", photo: "/images/people/students/patrick-hauth-K6p0llhyvP8-unsplash.jpg" }],
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
    children: [{ name: "Jordan Rivera", dob: "Mar 5, 2020", photo: "/images/people/students/ibrahim-guetar-NUkjka_RqUE-unsplash.jpg" }],
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

type DropInDay = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";

type StudentBillingFullTime = {
  kind: "full_time";
  monthlyTuition: number;
  autopayOn: boolean;
  paymentMethods: { label: string; last4: string; brand: string; default: boolean }[];
  lineItems: { id: string; date: string; description: string; amount: number; status: "paid" | "pending" }[];
};

type StudentBillingHomeschool = {
  kind: "homeschool_dropin";
  ratePerDay: number;
  weeks: { weekOf: string; days: DropInDay[] }[];
  lineItems: { id: string; date: string; description: string; amount: number; status: "paid" | "pending" }[];
};

type StudentBilling = StudentBillingFullTime | StudentBillingHomeschool;

type DemoStudent = {
  id: string;
  name: string;
  initials: string;
  color: string;
  grade: string;
  dob: string;
  parent: string;
  program: string;
  classroom: string;
  teacher: string;
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
  immunizations: { name: string; date: string; status: "complete" | "due" | "exempt" }[];
  emergencyContacts: { name: string; relationship: string; phone: string; priority: number }[];
  activityLog: { date: string; type: "attendance" | "note" | "event"; title: string; detail: string; author?: string }[];
  billing: StudentBilling;
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
    classroom: "Room 2 – Meadow Class",
    teacher: "Ms. Taylor Reyes",
    immunizations: [
      { name: "MMR (Measles, Mumps, Rubella)", date: "Sep 2019", status: "complete" },
      { name: "DTaP (Diphtheria, Tetanus, Pertussis)", date: "Sep 2019", status: "complete" },
      { name: "Varicella (Chickenpox)", date: "Sep 2019", status: "complete" },
      { name: "Hepatitis B", date: "Mar 2018", status: "complete" },
      { name: "Polio (IPV)", date: "Sep 2019", status: "complete" },
      { name: "Flu (Annual)", date: "—", status: "due" },
    ],
    emergencyContacts: [
      { name: "Sarah Richardson", relationship: "Mother", phone: "(512) 555-0101", priority: 1 },
      { name: "Tom Richardson", relationship: "Father", phone: "(512) 555-0103", priority: 2 },
      { name: "Aunt Patricia", relationship: "Aunt", phone: "(512) 555-0199", priority: 3 },
    ],
    activityLog: [
      { date: "May 14, 2026", type: "attendance", title: "Present", detail: "On time. Participated in art project and shared her dinosaur drawing.", author: "Ms. Reyes" },
      { date: "May 7, 2026", type: "note", title: "Teacher Note", detail: "Emma excelled in today's creative writing exercise. Work shared with the class.", author: "Ms. Reyes" },
      { date: "Apr 28, 2026", type: "attendance", title: "Absent – Sick", detail: "Parent called in. Fever. Returned May 1.", author: "Office" },
      { date: "Mar 15, 2026", type: "event", title: "Field Trip Permission Signed", detail: "Spring Nature Walk form signed and submitted by Sarah Richardson.", author: "Admin" },
      { date: "Feb 12, 2026", type: "note", title: "Admin Note", detail: "Re-enrollment confirmation received for 2026–27 school year.", author: "Admin" },
      { date: "Nov 14, 2025", type: "event", title: "Enrolled – School Year 2026–27", detail: "Application approved and enrollment agreement signed.", author: "Admin" },
    ],
    billing: {
      kind: "full_time",
      monthlyTuition: 1450,
      autopayOn: true,
      paymentMethods: [
        { label: "Visa", last4: "4242", brand: "card", default: true },
        { label: "Checking · Chase", last4: "4412", brand: "bank", default: false },
      ],
      lineItems: [
        { id: "ft-st1-1", date: "May 1, 2026", description: "May 2026 tuition (School Year)", amount: 1450, status: "paid" },
        { id: "ft-st1-2", date: "Jun 1, 2026", description: "Jun 2026 tuition (School Year)", amount: 1450, status: "pending" },
        { id: "ft-st1-3", date: "Apr 1, 2026", description: "Apr 2026 tuition (School Year)", amount: 1450, status: "paid" },
      ],
    },
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
    classroom: "Room 4 – Oak Class",
    teacher: "Mr. Davis",
    immunizations: [
      { name: "MMR (Measles, Mumps, Rubella)", date: "Jul 2017", status: "complete" },
      { name: "DTaP (Diphtheria, Tetanus, Pertussis)", date: "Jul 2017", status: "complete" },
      { name: "Varicella (Chickenpox)", date: "Jul 2017", status: "complete" },
      { name: "Hepatitis B", date: "Jun 2016", status: "complete" },
      { name: "Polio (IPV)", date: "Jul 2017", status: "complete" },
      { name: "Flu (Annual)", date: "—", status: "due" },
    ],
    emergencyContacts: [
      { name: "Miguel Torres", relationship: "Father", phone: "(737) 555-0204", priority: 1 },
      { name: "Ana Torres", relationship: "Mother", phone: "(737) 555-0206", priority: 2 },
      { name: "Grandma Rosa", relationship: "Grandmother", phone: "(737) 555-0299", priority: 3 },
    ],
    activityLog: [
      { date: "May 15, 2026", type: "attendance", title: "Present", detail: "On time. Led group robotics activity.", author: "Mr. Davis" },
      { date: "May 9, 2026", type: "note", title: "Allergy Alert Reminder", detail: "EpiPen kit inspected and in-date. Parents notified of annual review.", author: "Nurse" },
      { date: "Apr 22, 2026", type: "attendance", title: "Tardy (10 min)", detail: "Traffic delay. Note from parent on file.", author: "Office" },
      { date: "Mar 20, 2026", type: "event", title: "Parent Conference", detail: "Spring conference with Miguel & Ana Torres. Positive progress noted in math.", author: "Mr. Davis" },
      { date: "Feb 3, 2026", type: "note", title: "Movement Break Protocol Updated", detail: "Adjusted to 40-min intervals per occupational therapist recommendation.", author: "Admin" },
      { date: "Dec 3, 2025", type: "event", title: "Enrolled – Both Programs", detail: "Application approved for School Year 2026–27 and Summer 2026.", author: "Admin" },
    ],
    billing: {
      kind: "full_time",
      monthlyTuition: 1480,
      autopayOn: true,
      paymentMethods: [{ label: "Mastercard", last4: "8910", brand: "card", default: true }],
      lineItems: [
        { id: "ft-st2-1", date: "May 1, 2026", description: "May 2026 tuition (combined programs)", amount: 1480, status: "paid" },
        { id: "ft-st2-2", date: "Jun 1, 2026", description: "Jun 2026 tuition (combined programs)", amount: 1480, status: "pending" },
      ],
    },
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
    classroom: "Room 1 – Sunflower Class",
    teacher: "Ms. Kim",
    immunizations: [
      { name: "MMR (Measles, Mumps, Rubella)", date: "May 2020", status: "complete" },
      { name: "DTaP (Diphtheria, Tetanus, Pertussis)", date: "May 2020", status: "complete" },
      { name: "Varicella (Chickenpox)", date: "May 2020", status: "complete" },
      { name: "Hepatitis B", date: "May 2019", status: "complete" },
      { name: "Polio (IPV)", date: "May 2020", status: "complete" },
      { name: "Hib (Haemophilus influenzae)", date: "May 2020", status: "complete" },
      { name: "Flu (Annual)", date: "Nov 2025", status: "complete" },
    ],
    emergencyContacts: [
      { name: "Jennifer Chen", relationship: "Mother", phone: "(512) 555-0220", priority: 1 },
      { name: "David Chen", relationship: "Father", phone: "(512) 555-0221", priority: 2 },
    ],
    activityLog: [
      { date: "May 14, 2026", type: "attendance", title: "Early Dismissal – 1:30 PM", detail: "Doctor appointment. Parent pickup confirmed.", author: "Office" },
      { date: "May 6, 2026", type: "note", title: "Nurse Check-In", detail: "Ava used Albuterol inhaler during outdoor play. Parents notified. Recovered fully within 20 min.", author: "Nurse" },
      { date: "Apr 18, 2026", type: "attendance", title: "Present", detail: "Great participation in music circle.", author: "Ms. Kim" },
      { date: "Mar 30, 2026", type: "event", title: "Sensory Plan Reviewed", detail: "Sensory accommodation plan updated. Noise-canceling headphones added to classroom kit.", author: "Admin" },
      { date: "Mar 5, 2026", type: "note", title: "Teacher Note", detail: "Ava finished her first independent reading chapter book. Celebrated with the class.", author: "Ms. Kim" },
      { date: "Jan 15, 2026", type: "event", title: "Enrolled – Summer 2026", detail: "Application approved and enrollment agreement signed.", author: "Admin" },
    ],
    billing: {
      kind: "homeschool_dropin",
      ratePerDay: 95,
      weeks: [
        { weekOf: "May 12–16, 2026", days: ["Mon", "Wed", "Fri"] },
        { weekOf: "May 5–9, 2026", days: ["Tue", "Thu"] },
        { weekOf: "Apr 28 – May 2, 2026", days: ["Mon", "Tue", "Wed", "Thu"] },
        { weekOf: "Apr 21–25, 2026", days: ["Mon", "Fri"] },
      ],
      lineItems: [
        { id: "hs-st3-1", date: "May 12, 2026", description: "Drop-in: May 12–16 week (3 days × $95)", amount: 285, status: "paid" },
        { id: "hs-st3-2", date: "May 19, 2026", description: "Scheduled: May 19–23 week (parent-selected days)", amount: 380, status: "pending" },
        { id: "hs-st3-3", date: "Apr 28, 2026", description: "Drop-in: Apr 28 – May 2 week (4 days × $95)", amount: 380, status: "paid" },
      ],
    },
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
    classroom: "Room K – Seedling Class",
    teacher: "Ms. Johnson",
    immunizations: [
      { name: "MMR (Measles, Mumps, Rubella)", date: "Sep 2021", status: "complete" },
      { name: "DTaP (Diphtheria, Tetanus, Pertussis)", date: "Sep 2021", status: "complete" },
      { name: "Varicella (Chickenpox)", date: "Sep 2021", status: "complete" },
      { name: "Hepatitis B", date: "Sep 2020", status: "complete" },
      { name: "Polio (IPV)", date: "Sep 2021", status: "complete" },
      { name: "Hib (Haemophilus influenzae)", date: "Sep 2021", status: "complete" },
      { name: "Flu (Annual)", date: "—", status: "due" },
    ],
    emergencyContacts: [
      { name: "Diana Foster", relationship: "Mother", phone: "(512) 555-0142", priority: 1 },
      { name: "Grandpa Joe", relationship: "Grandfather", phone: "(512) 555-0155", priority: 2 },
      { name: "Aunt Linda", relationship: "Aunt", phone: "(512) 555-0156", priority: 3 },
    ],
    activityLog: [
      { date: "May 13, 2026", type: "attendance", title: "Present", detail: "Positive day. Used emotion chart successfully during peer conflict.", author: "Ms. Johnson" },
      { date: "May 5, 2026", type: "note", title: "Aide Session Note", detail: "30-min 1:1 session with Ms. Kim. Worked on turn-taking with blocks. Good progress.", author: "Ms. Kim" },
      { date: "Apr 25, 2026", type: "attendance", title: "Absent – Sick", detail: "Parent called in. Stomach bug. Returned Apr 28.", author: "Office" },
      { date: "Apr 10, 2026", type: "event", title: "Parent Meeting – Social Development Plan", detail: "Diana Foster met with teacher and aide to review Noah's social-emotional goals.", author: "Admin" },
      { date: "Mar 1, 2026", type: "note", title: "Milestone Note", detail: "Noah successfully led show-and-tell for the first time. Huge confidence boost.", author: "Ms. Johnson" },
      { date: "Jan 15, 2026", type: "event", title: "Enrolled – Summer 2026", detail: "Application approved and enrollment agreement signed.", author: "Admin" },
    ],
    billing: {
      kind: "full_time",
      monthlyTuition: 1280,
      autopayOn: true,
      paymentMethods: [{ label: "Visa", last4: "1155", brand: "card", default: true }],
      lineItems: [
        { id: "ft-st4-1", date: "May 1, 2026", description: "May 2026 tuition (Summer program)", amount: 1280, status: "paid" },
        { id: "ft-st4-2", date: "Jun 1, 2026", description: "Jun 2026 tuition (Summer program)", amount: 1280, status: "pending" },
      ],
    },
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
    classroom: "Room 3 – Willow Class",
    teacher: "Ms. Hughes",
    immunizations: [
      { name: "MMR (Measles, Mumps, Rubella)", date: "Jan 2019", status: "complete" },
      { name: "DTaP (Diphtheria, Tetanus, Pertussis)", date: "Jan 2019", status: "complete" },
      { name: "Varicella (Chickenpox)", date: "Jan 2019", status: "complete" },
      { name: "Hepatitis B", date: "Dec 2017", status: "complete" },
      { name: "Polio (IPV)", date: "Jan 2019", status: "complete" },
      { name: "Flu (Annual)", date: "Oct 2025", status: "complete" },
    ],
    emergencyContacts: [
      { name: "Priya Patel", relationship: "Mother", phone: "(512) 555-0391", priority: 1 },
      { name: "Raj Patel", relationship: "Father", phone: "(512) 555-0392", priority: 2 },
    ],
    activityLog: [
      { date: "May 15, 2026", type: "attendance", title: "Present", detail: "Completed independent astronomy research project.", author: "Ms. Hughes" },
      { date: "May 2, 2026", type: "note", title: "Teacher Note", detail: "Sophia volunteered to present her research to the class today — excellent growth in public speaking confidence.", author: "Ms. Hughes" },
      { date: "Apr 20, 2026", type: "attendance", title: "Tardy (5 min)", detail: "Minor delay. Settled in quickly.", author: "Office" },
      { date: "Mar 25, 2026", type: "event", title: "Academic Achievement", detail: "Sophia scored in the 98th percentile on the statewide math assessment.", author: "Admin" },
      { date: "Feb 18, 2026", type: "note", title: "Admin Note", detail: "Recommended for gifted enrichment program. Parent notification sent.", author: "Admin" },
      { date: "Nov 14, 2025", type: "event", title: "Enrolled – School Year 2026–27", detail: "Application approved and enrollment agreement signed.", author: "Admin" },
    ],
    billing: {
      kind: "full_time",
      monthlyTuition: 1425,
      autopayOn: false,
      paymentMethods: [{ label: "Amex", last4: "3001", brand: "card", default: true }],
      lineItems: [
        { id: "ft-st5-1", date: "May 1, 2026", description: "May 2026 tuition (School Year)", amount: 1425, status: "paid" },
        { id: "ft-st5-2", date: "Jun 1, 2026", description: "Jun 2026 tuition (School Year)", amount: 1425, status: "pending" },
        { id: "ft-st5-3", date: "Apr 15, 2026", description: "Materials & lab fee", amount: 75, status: "paid" },
      ],
    },
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
    classroom: "Room 6 – Summit Class",
    teacher: "Mr. Reynolds",
    immunizations: [
      { name: "MMR (Measles, Mumps, Rubella)", date: "Feb 2015", status: "complete" },
      { name: "DTaP (Diphtheria, Tetanus, Pertussis)", date: "Feb 2015", status: "complete" },
      { name: "Varicella (Chickenpox)", date: "Feb 2015", status: "complete" },
      { name: "Hepatitis B", date: "Jan 2014", status: "complete" },
      { name: "Polio (IPV)", date: "Feb 2015", status: "complete" },
      { name: "Tdap (Booster)", date: "Feb 2024", status: "complete" },
      { name: "HPV (Series)", date: "Feb 2025", status: "complete" },
      { name: "Flu (Annual)", date: "Oct 2025", status: "complete" },
    ],
    emergencyContacts: [
      { name: "Stephanie Clarke", relationship: "Mother", phone: "(512) 555-0317", priority: 1 },
      { name: "Derek Clarke", relationship: "Father", phone: "(512) 555-0319", priority: 2 },
      { name: "Aunt Bev", relationship: "Aunt", phone: "(512) 555-0320", priority: 3 },
    ],
    activityLog: [
      { date: "May 14, 2026", type: "attendance", title: "Present", detail: "Facilitated debate club. Blood glucose stable all day.", author: "Mr. Reynolds" },
      { date: "May 8, 2026", type: "note", title: "Nurse Note", detail: "Blood glucose reading of 68 at 11:00 AM. Juice administered per protocol. Parents notified. Fully recovered.", author: "Nurse" },
      { date: "Apr 29, 2026", type: "attendance", title: "Present", detail: "Won 2nd place in school chess tournament.", author: "Mr. Reynolds" },
      { date: "Apr 15, 2026", type: "event", title: "Glucagon Kit Renewal", detail: "Emergency glucagon kit replaced. Expiry: Dec 2026. Parents provided updated kit.", author: "Nurse" },
      { date: "Mar 18, 2026", type: "event", title: "Enrolled – School Year 2026–27", detail: "Enrollment agreement signed by Stephanie Clarke.", author: "Admin" },
      { date: "Feb 20, 2026", type: "note", title: "Teacher Note", detail: "Isabelle is demonstrating strong leadership in group projects. Recommended for student council.", author: "Mr. Reynolds" },
    ],
    billing: {
      kind: "full_time",
      monthlyTuition: 1500,
      autopayOn: true,
      paymentMethods: [
        { label: "Visa", last4: "7721", brand: "card", default: true },
        { label: "Health savings · FSA", last4: "6600", brand: "fsa", default: false },
      ],
      lineItems: [
        { id: "ft-st6-1", date: "May 1, 2026", description: "May 2026 tuition (School Year)", amount: 1500, status: "paid" },
        { id: "ft-st6-2", date: "Jun 1, 2026", description: "Jun 2026 tuition (School Year) — autopay scheduled", amount: 1500, status: "pending" },
      ],
    },
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
    classroom: "Room 4 – Oak Class",
    teacher: "Mr. Davis",
    immunizations: [
      { name: "MMR (Measles, Mumps, Rubella)", date: "May 2017", status: "complete" },
      { name: "DTaP (Diphtheria, Tetanus, Pertussis)", date: "May 2017", status: "complete" },
      { name: "Varicella (Chickenpox)", date: "May 2017", status: "complete" },
      { name: "Hepatitis B", date: "Apr 2016", status: "complete" },
      { name: "Polio (IPV)", date: "May 2017", status: "complete" },
      { name: "Flu (Annual)", date: "Nov 2025", status: "complete" },
    ],
    emergencyContacts: [
      { name: "Jerome Watkins", relationship: "Father", phone: "(737) 555-0648", priority: 1 },
      { name: "Keisha Watkins", relationship: "Mother", phone: "(737) 555-0650", priority: 2 },
      { name: "Coach Miles", relationship: "Family Friend", phone: "(737) 555-0699", priority: 3 },
    ],
    activityLog: [
      { date: "May 15, 2026", type: "attendance", title: "Present", detail: "Led science experiment on plant growth. Helped two classmates troubleshoot.", author: "Mr. Davis" },
      { date: "May 1, 2026", type: "note", title: "Reading Specialist Note", detail: "Tyler completed Level 4 reading fluency milestone. Progressing well with bi-weekly sessions.", author: "Ms. Morgan" },
      { date: "Apr 23, 2026", type: "attendance", title: "Absent – Family Event", detail: "Pre-approved absence. Work packets completed.", author: "Office" },
      { date: "Apr 8, 2026", type: "event", title: "Parent Conference – Spring", detail: "Jerome & Keisha Watkins met with Mr. Davis. Focus on reading support plan.", author: "Mr. Davis" },
      { date: "Mar 10, 2026", type: "note", title: "Accommodation Update", detail: "Standing desk added to classroom. Tyler reports significantly better focus.", author: "Admin" },
      { date: "Dec 3, 2025", type: "event", title: "Enrolled – Both Programs", detail: "Application approved for School Year 2026–27 and Summer 2026.", author: "Admin" },
    ],
    billing: {
      kind: "homeschool_dropin",
      ratePerDay: 72,
      weeks: [
        { weekOf: "May 12–16, 2026", days: ["Mon", "Tue", "Wed"] },
        { weekOf: "May 5–9, 2026", days: ["Thu", "Fri"] },
        { weekOf: "Apr 28 – May 2, 2026", days: ["Mon", "Wed", "Thu", "Fri"] },
      ],
      lineItems: [
        { id: "hs-st7-1", date: "May 12, 2026", description: "Drop-in: May 12–16 (3 days × $72)", amount: 216, status: "paid" },
        { id: "hs-st7-2", date: "May 19, 2026", description: "Pending: May 19–23 (parent picks days Mon–Fri)", amount: 288, status: "pending" },
      ],
    },
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
    classroom: "Room 3 – Willow Class",
    teacher: "Ms. Hughes",
    immunizations: [
      { name: "MMR (Measles, Mumps, Rubella)", date: "Dec 2018", status: "complete" },
      { name: "DTaP (Diphtheria, Tetanus, Pertussis)", date: "Dec 2018", status: "complete" },
      { name: "Varicella (Chickenpox)", date: "Dec 2018", status: "complete" },
      { name: "Hepatitis B", date: "Nov 2017", status: "complete" },
      { name: "Polio (IPV)", date: "Dec 2018", status: "complete" },
      { name: "Flu (Annual)", date: "—", status: "due" },
    ],
    emergencyContacts: [
      { name: "Kevin Okonkwo", relationship: "Father", phone: "(737) 555-0609", priority: 1 },
      { name: "Adaeze Okonkwo", relationship: "Mother", phone: "(737) 555-0611", priority: 2 },
      { name: "Uncle Emeka", relationship: "Uncle", phone: "(737) 555-0612", priority: 3 },
    ],
    activityLog: [
      { date: "May 14, 2026", type: "attendance", title: "Present", detail: "Led peer math tutoring session. High engagement.", author: "Ms. Hughes" },
      { date: "May 6, 2026", type: "note", title: "Seating Update", detail: "Moved to front-left desk nearest teacher. Focus improvement noted same day.", author: "Ms. Hughes" },
      { date: "Apr 30, 2026", type: "attendance", title: "Tardy (20 min)", detail: "Traffic. Parent note submitted.", author: "Office" },
      { date: "Apr 12, 2026", type: "event", title: "Cultural Sharing Presentation", detail: "Chidera presented on Nigerian history to the class. Standing ovation from peers.", author: "Ms. Hughes" },
      { date: "Apr 4, 2026", type: "event", title: "Application Submitted – Both Programs", detail: "Application submitted by Kevin Okonkwo. Currently in review.", author: "Admin" },
      { date: "Mar 5, 2026", type: "note", title: "Parent Note", detail: "Kevin Okonkwo requested application status update. Admin followed up same day.", author: "Admin" },
    ],
    billing: {
      kind: "full_time",
      monthlyTuition: 1460,
      autopayOn: true,
      paymentMethods: [{ label: "Visa", last4: "4411", brand: "card", default: true }],
      lineItems: [
        { id: "ft-st8-1", date: "May 1, 2026", description: "May 2026 tuition (combined programs)", amount: 1460, status: "paid" },
        { id: "ft-st8-2", date: "Jun 1, 2026", description: "Jun 2026 tuition (combined programs)", amount: 1460, status: "pending" },
      ],
    },
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
    classroom: "Room 5 – Horizon Class",
    teacher: "Ms. Carter",
    immunizations: [
      { name: "MMR (Measles, Mumps, Rubella)", date: "Aug 2016", status: "complete" },
      { name: "DTaP (Diphtheria, Tetanus, Pertussis)", date: "Aug 2016", status: "complete" },
      { name: "Varicella (Chickenpox)", date: "Aug 2016", status: "complete" },
      { name: "Hepatitis B", date: "Jul 2015", status: "complete" },
      { name: "Polio (IPV)", date: "Aug 2016", status: "complete" },
      { name: "Flu (Annual)", date: "Oct 2025", status: "complete" },
    ],
    emergencyContacts: [
      { name: "David Webb", relationship: "Father", phone: "(512) 555-0721", priority: 1 },
      { name: "Monica Webb", relationship: "Mother", phone: "(512) 555-0723", priority: 2 },
      { name: "Grandma Ruth", relationship: "Grandmother", phone: "(512) 555-0799", priority: 3 },
    ],
    activityLog: [
      { date: "May 15, 2026", type: "attendance", title: "Present", detail: "Medication administered at 8 AM. Focused session. Completed robotics challenge.", author: "Ms. Carter" },
      { date: "May 8, 2026", type: "note", title: "OT Session Note", detail: "Occupational therapy session completed. Working on fine motor and sustained focus. Positive progress.", author: "Ms. Thompson (OT)" },
      { date: "Apr 24, 2026", type: "attendance", title: "Absent – Doctor Appointment", detail: "ADHD medication check-in with Dr. Green. Pre-approved absence.", author: "Office" },
      { date: "Apr 10, 2026", type: "event", title: "Medication Authorization Updated", detail: "Methylphenidate dosage updated from 5mg to 10mg per Dr. Green's direction.", author: "Nurse" },
      { date: "Mar 2, 2026", type: "note", title: "Teacher Note", detail: "Marcus completed a 45-min independent coding project without breaks — a personal best.", author: "Ms. Carter" },
      { date: "Feb 8, 2026", type: "event", title: "Enrolled – School Year 2026–27", detail: "Application approved and enrollment agreement signed.", author: "Admin" },
    ],
    billing: {
      kind: "full_time",
      monthlyTuition: 1450,
      autopayOn: true,
      paymentMethods: [{ label: "Mastercard", last4: "9922", brand: "card", default: true }],
      lineItems: [
        { id: "ft-st9-1", date: "May 1, 2026", description: "May 2026 tuition (School Year)", amount: 1450, status: "paid" },
        { id: "ft-st9-2", date: "May 20, 2026", description: "OT co-pay pass-through (quarterly)", amount: 120, status: "pending" },
      ],
    },
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
    classroom: "Room 2 – Meadow Class",
    teacher: "Ms. Taylor Reyes",
    immunizations: [
      { name: "MMR (Measles, Mumps, Rubella)", date: "Oct 2019", status: "complete" },
      { name: "DTaP (Diphtheria, Tetanus, Pertussis)", date: "Oct 2019", status: "complete" },
      { name: "Varicella (Chickenpox)", date: "Oct 2019", status: "complete" },
      { name: "Hepatitis B", date: "Oct 2018", status: "complete" },
      { name: "Polio (IPV)", date: "Oct 2019", status: "complete" },
      { name: "Flu (Annual)", date: "Nov 2025", status: "complete" },
    ],
    emergencyContacts: [
      { name: "Yuki Nakamura", relationship: "Mother", phone: "(737) 555-0831", priority: 1 },
      { name: "Kenji Nakamura", relationship: "Father", phone: "(737) 555-0833", priority: 2 },
      { name: "Aunt Hana", relationship: "Aunt", phone: "(737) 555-0899", priority: 3 },
    ],
    activityLog: [
      { date: "May 14, 2026", type: "attendance", title: "Present", detail: "EpiPen kit check complete. Participated in outdoor art project.", author: "Ms. Reyes" },
      { date: "May 9, 2026", type: "note", title: "Annual Allergy Review", detail: "Allergy action plan reviewed with Yuki Nakamura. EpiPen Jr. in-date. No changes required.", author: "Nurse" },
      { date: "Apr 28, 2026", type: "attendance", title: "Present", detail: "Led class origami lesson. Bilingual narration in English and Japanese.", author: "Ms. Reyes" },
      { date: "Mar 20, 2026", type: "event", title: "Language Achievement Award", detail: "Lily recognized at spring assembly for bilingual excellence.", author: "Admin" },
      { date: "Feb 25, 2026", type: "note", title: "Parent Communication", detail: "Yuki Nakamura requested update on social integration. Positive report shared.", author: "Ms. Reyes" },
      { date: "Jan 27, 2026", type: "event", title: "Enrolled – Both Programs", detail: "Application approved for School Year 2026–27 and Summer 2026.", author: "Admin" },
    ],
    billing: {
      kind: "full_time",
      monthlyTuition: 1475,
      autopayOn: true,
      paymentMethods: [
        { label: "Visa", last4: "2100", brand: "card", default: true },
        { label: "Apple Pay", last4: "—", brand: "wallet", default: false },
      ],
      lineItems: [
        { id: "ft-st10-1", date: "May 1, 2026", description: "May 2026 tuition (combined programs)", amount: 1475, status: "paid" },
        { id: "ft-st10-2", date: "Jun 1, 2026", description: "Jun 2026 tuition (combined programs)", amount: 1475, status: "pending" },
      ],
    },
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
    classroom: "Room K – Seedling Class",
    teacher: "Ms. Johnson",
    immunizations: [
      { name: "MMR (Measles, Mumps, Rubella)", date: "Mar 2022", status: "complete" },
      { name: "DTaP (Diphtheria, Tetanus, Pertussis)", date: "Mar 2022", status: "complete" },
      { name: "Varicella (Chickenpox)", date: "Mar 2022", status: "complete" },
      { name: "Hepatitis B", date: "Mar 2021", status: "complete" },
      { name: "Polio (IPV)", date: "Mar 2022", status: "complete" },
      { name: "Hib (Haemophilus influenzae)", date: "Mar 2022", status: "complete" },
      { name: "Flu (Annual)", date: "—", status: "due" },
    ],
    emergencyContacts: [
      { name: "Carmen Rivera", relationship: "Mother", phone: "(512) 555-0914", priority: 1 },
      { name: "Grandpa Luis", relationship: "Grandfather", phone: "(512) 555-0944", priority: 2 },
      { name: "Neighbor Maria", relationship: "Family Friend", phone: "(512) 555-0945", priority: 3 },
    ],
    activityLog: [
      { date: "May 13, 2026", type: "attendance", title: "Present", detail: "Speech therapist visit. Good session. Jordan used 3 new words independently.", author: "Ms. Johnson" },
      { date: "May 5, 2026", type: "note", title: "Speech Therapy Note", detail: "Weekly session completed. Jordan's expressive vocabulary expanding. Now at 45-word functional vocabulary.", author: "Ms. Stacy (SLP)" },
      { date: "Apr 29, 2026", type: "attendance", title: "Absent – Sick", detail: "Parent called in. Cold. Returned May 1.", author: "Office" },
      { date: "Apr 15, 2026", type: "event", title: "Communication Plan Updated", detail: "Visual schedule cards updated with 6 new routine symbols. Parent trained on use at home.", author: "Ms. Johnson" },
      { date: "Mar 22, 2026", type: "note", title: "Milestone Note", detail: "Jordan sang the entire welcome song independently today — a first! Class celebrated.", author: "Ms. Johnson" },
      { date: "Apr 10, 2026", type: "event", title: "Application Submitted – Summer 2026", detail: "Application submitted by Carmen Rivera. Currently in review.", author: "Admin" },
    ],
    billing: {
      kind: "homeschool_dropin",
      ratePerDay: 88,
      weeks: [
        { weekOf: "May 12–16, 2026", days: ["Tue", "Thu"] },
        { weekOf: "May 5–9, 2026", days: ["Mon", "Wed", "Fri"] },
        { weekOf: "Apr 28 – May 2, 2026", days: ["Mon", "Tue"] },
      ],
      lineItems: [
        { id: "hs-st11-1", date: "May 5, 2026", description: "Drop-in: May 5–9 week (3 days × $88)", amount: 264, status: "paid" },
        { id: "hs-st11-2", date: "May 19, 2026", description: "Scheduled: May 19–23 (2 days selected so far)", amount: 176, status: "pending" },
      ],
    },
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
    classroom: "Room 3 – Willow Class",
    teacher: "Ms. Hughes",
    immunizations: [
      { name: "MMR (Measles, Mumps, Rubella)", date: "Jul 2018", status: "complete" },
      { name: "DTaP (Diphtheria, Tetanus, Pertussis)", date: "Jul 2018", status: "complete" },
      { name: "Varicella (Chickenpox)", date: "Jul 2018", status: "complete" },
      { name: "Hepatitis B", date: "Jun 2017", status: "complete" },
      { name: "Polio (IPV)", date: "Jul 2018", status: "complete" },
      { name: "Flu (Annual)", date: "Oct 2025", status: "complete" },
    ],
    emergencyContacts: [
      { name: "Anita Mehta", relationship: "Mother", phone: "(737) 555-1201", priority: 1 },
      { name: "Ravi Mehta", relationship: "Father", phone: "(737) 555-1202", priority: 2 },
      { name: "Grandma Kavya", relationship: "Grandmother", phone: "(737) 555-1299", priority: 3 },
    ],
    activityLog: [
      { date: "May 15, 2026", type: "attendance", title: "Present", detail: "Audiobook morning session. High comprehension scores.", author: "Ms. Hughes" },
      { date: "May 7, 2026", type: "note", title: "Aide Session Note", detail: "Reading aide present for math assessment. Large-print materials used. Priya completed ahead of time.", author: "Ms. Reyes (Aide)" },
      { date: "Apr 25, 2026", type: "attendance", title: "Early Dismissal – 2:00 PM", detail: "Eye doctor appointment. Pre-approved.", author: "Office" },
      { date: "Apr 12, 2026", type: "event", title: "Low Vision Accommodation Review", detail: "Annual review with Anita Mehta and vision specialist. Display settings and lighting updated.", author: "Admin" },
      { date: "Mar 18, 2026", type: "note", title: "Teacher Note", detail: "Priya recited an original spoken word poem for the class. Exceptional memory and delivery.", author: "Ms. Hughes" },
      { date: "Nov 14, 2025", type: "event", title: "Enrolled – School Year 2026–27", detail: "Application approved and enrollment agreement signed.", author: "Admin" },
    ],
    billing: {
      kind: "full_time",
      monthlyTuition: 1535,
      autopayOn: false,
      paymentMethods: [{ label: "ACH · Wells Fargo", last4: "7722", brand: "bank", default: true }],
      lineItems: [
        { id: "ft-st12-1", date: "May 1, 2026", description: "May 2026 tuition + reading aide stipend", amount: 1535, status: "paid" },
        { id: "ft-st12-2", date: "Jun 1, 2026", description: "Jun 2026 tuition + reading aide stipend", amount: 1535, status: "pending" },
        { id: "ft-st12-3", date: "Apr 20, 2026", description: "Assistive tech software (quarterly)", amount: 45, status: "paid" },
      ],
    },
  },
];

type ProgramTeacher = {
  id: string;
  name: string;
  initials: string;
  classroom: string;
  studentIds: string[];
  capacity?: number;
};

type ProgramType = "summer" | "school_year" | "homeschool_drop_in";
type ProgramStatus = "draft" | "open" | "waitlist" | "full" | "closed";

type DemoProgram = {
  id: string;
  name: string;
  type: ProgramType;
  status: ProgramStatus;
  publicVisible: boolean;
  description: { short: string; long: string };
  marketing: { badge: string; details: string[] };
  eligibility: {
    ageRange: string;
    gradeRange?: string;
    capacity: number;
    waitlistEnabled: boolean;
    waitlistCount: number;
    tracks?: string[];
  };
  enrollment: {
    applyFlowId: string;
    enrollFlowId?: string;
    registrationFee: number;
    checklistItems: string[];
    autoTag: string;
    websiteCta: string;
  };
  pricing: {
    billingModel: "monthly" | "weekly" | "per_day";
    baseAmount: number;
    fees: { label: string; amount: number; refundable?: boolean }[];
    paymentSchedule: string[];
    acceptsFinancialAid: boolean;
    includes: string[];
  };
  schedule: {
    startDate: string;
    endDate: string;
    registrationOpen: string;
    registrationClose: string;
    daysOfWeek: string;
    dailyHours: { dropOff: string; core: string; pickUp: string; afterCare?: string };
    sessionNotes?: string;
    breaks?: string[];
    minDaysPerWeek?: number;
    maxDaysPerWeek?: number;
    bookingCutoff?: string;
  };
  stats: { leads: number; revenue: number };
  teachers: ProgramTeacher[];
};

const PROGRAM_TYPE_LABELS: Record<ProgramType, string> = {
  summer: "Summer",
  school_year: "School Year",
  homeschool_drop_in: "Homeschool",
};

const PROGRAM_STATUS_STYLES: Record<
  ProgramStatus,
  { label: string; bg: string; text: string }
> = {
  draft: { label: "Draft", bg: C.elevated, text: C.textTertiary },
  open: { label: "Open", bg: C.successBg, text: C.success },
  waitlist: { label: "Waitlist", bg: C.warningBg, text: C.warning },
  full: { label: "Full", bg: C.errorBg, text: C.error },
  closed: { label: "Closed", bg: C.border, text: C.textSecondary },
};

const SUMMER_WEEK_SCHEDULE = [
  "Registration Fee",
  ...Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`),
];

const SCHOOL_YEAR_MONTH_SCHEDULE = [
  "Registration Fee",
  "Supply Fee",
  ...["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"].map(
    (m) => `${m} Tuition`,
  ),
];

const DEMO_PROGRAMS_P2: DemoProgram[] = [
  {
    id: "summer_26",
    name: "Summer 2026",
    type: "summer",
    status: "open",
    publicVisible: true,
    description: {
      short: "12 weeks of outdoor projects & enrichment",
      long: "Twelve weeks of themed adventures, hands-on projects, nature play, art, and academic enrichment in a small, nurturing group. Every day feels like a discovery.",
    },
    marketing: {
      badge: "Summer Program",
      details: ["Ages 4–11", "Mon–Thu", "12 Weeks", "Max 24 Kids"],
    },
    eligibility: {
      ageRange: "Ages 4–11",
      gradeRange: "Pre-K – 6th",
      capacity: 24,
      waitlistEnabled: true,
      waitlistCount: 3,
    },
    enrollment: {
      applyFlowId: "flow-1",
      enrollFlowId: "flow-2",
      registrationFee: 75,
      checklistItems: [
        "Enrollment contract",
        "Health & emergency form",
        "Immunization records",
        "Photo release",
        "Registration fee ($75)",
      ],
      autoTag: "Summer 2026",
      websiteCta: "Enroll Now",
    },
    pricing: {
      billingModel: "weekly",
      baseAmount: 225,
      fees: [{ label: "Registration fee", amount: 75 }],
      paymentSchedule: SUMMER_WEEK_SCHEDULE,
      acceptsFinancialAid: true,
      includes: ["All materials", "Field trips", "Daily snack"],
    },
    schedule: {
      startDate: "Jun 2, 2026",
      endDate: "Aug 21, 2026",
      registrationOpen: "Jan 15, 2026",
      registrationClose: "May 30, 2026",
      daysOfWeek: "Mon – Thu",
      dailyHours: {
        dropOff: "8:00 – 8:30 AM",
        core: "8:30 AM – 3:00 PM",
        pickUp: "3:00 – 3:30 PM",
        afterCare: "3:30 – 5:30 PM (+$15/day)",
      },
      sessionNotes: "12 themed weeks — nature, art, STEM, and community projects",
      breaks: ["Jul 4 – Jul 7 (Independence Day week)"],
    },
    stats: { leads: 14, revenue: 18450 },
    teachers: [
      {
        id: "t1",
        name: "Ms. Taylor Reyes",
        initials: "TR",
        classroom: "Room A (Pre-K – 2nd)",
        studentIds: ["st1", "st3", "st4", "st5"],
        capacity: 12,
      },
      {
        id: "t2",
        name: "Mr. James Kim",
        initials: "JK",
        classroom: "Room B (3rd – 6th)",
        studentIds: ["st2", "st7", "st8"],
        capacity: 12,
      },
    ],
  },
  {
    id: "school_year_26_27",
    name: "School Year 26–27",
    type: "school_year",
    status: "open",
    publicVisible: true,
    description: {
      short: "A complete microschool year, ability-paced",
      long: "A full microschool year blending Montessori, Waldorf, and Reggio-inspired methods with TEKS-aligned academics. Individualized pacing. Genuine community.",
    },
    marketing: {
      badge: "School Year",
      details: ["Ages 4–11", "Mon–Fri", "10-Month Term", "Max 36 Kids"],
    },
    eligibility: {
      ageRange: "Ages 4–11",
      gradeRange: "K – 6th",
      capacity: 36,
      waitlistEnabled: true,
      waitlistCount: 8,
      tracks: ["Full Day", "Half Day", "After Care"],
    },
    enrollment: {
      applyFlowId: "flow-1",
      enrollFlowId: "flow-2",
      registrationFee: 150,
      checklistItems: [
        "Enrollment contract",
        "Health & emergency form",
        "Immunization records",
        "Photo release",
        "Registration fee ($150)",
        "Supply fee ($150)",
      ],
      autoTag: "School Year",
      websiteCta: "Apply Now",
    },
    pricing: {
      billingModel: "monthly",
      baseAmount: 1280,
      fees: [
        { label: "Registration fee", amount: 150 },
        { label: "Supply fee", amount: 150 },
        { label: "Deposit", amount: 500, refundable: true },
      ],
      paymentSchedule: SCHOOL_YEAR_MONTH_SCHEDULE,
      acceptsFinancialAid: true,
      includes: ["Curriculum materials", "Portfolio assessments", "Parent conferences"],
    },
    schedule: {
      startDate: "Aug 18, 2026",
      endDate: "May 29, 2027",
      registrationOpen: "Nov 1, 2025",
      registrationClose: "Aug 1, 2026",
      daysOfWeek: "Mon – Fri",
      dailyHours: {
        dropOff: "7:45 – 8:15 AM",
        core: "8:15 AM – 3:15 PM",
        pickUp: "3:15 – 3:45 PM",
        afterCare: "3:45 – 5:30 PM (+$200/mo)",
      },
      sessionNotes: "10-month academic term with ability-paced groupings",
      breaks: [
        "Nov 24 – 28 (Thanksgiving)",
        "Dec 22 – Jan 2 (Winter break)",
        "Mar 9 – 13 (Spring break)",
      ],
    },
    stats: { leads: 22, revenue: 42800 },
    teachers: [
      {
        id: "t3",
        name: "Ms. Taylor Reyes",
        initials: "TR",
        classroom: "Primary (K – 2nd)",
        studentIds: ["st1", "st4"],
        capacity: 12,
      },
      {
        id: "t4",
        name: "Ms. Nicole Park",
        initials: "NP",
        classroom: "Elementary (3rd – 4th)",
        studentIds: ["st2", "st5", "st7"],
        capacity: 14,
      },
      {
        id: "t5",
        name: "Mr. David Osei",
        initials: "DO",
        classroom: "Middle (5th – 6th)",
        studentIds: ["st6", "st8"],
        capacity: 12,
      },
    ],
  },
  {
    id: "homeschool_drop_in",
    name: "Homeschool Drop-In",
    type: "homeschool_drop_in",
    status: "open",
    publicVisible: true,
    description: {
      short: "1–5 flexible days for homeschool families",
      long: "Flexible enrichment for families who want structure without losing autonomy. Choose 1 to 5 days — adjust as your family's rhythm evolves. All enrichments included.",
    },
    marketing: {
      badge: "Homeschool",
      details: ["Ages 4–11", "1–5 Days/Wk", "Flexible", "Max 16 Kids"],
    },
    eligibility: {
      ageRange: "Ages 4–11",
      capacity: 16,
      waitlistEnabled: false,
      waitlistCount: 0,
    },
    enrollment: {
      applyFlowId: "flow-3",
      registrationFee: 50,
      checklistItems: [
        "Drop-in agreement",
        "Health & emergency form",
        "Photo release",
      ],
      autoTag: "Homeschool",
      websiteCta: "Apply Now",
    },
    pricing: {
      billingModel: "per_day",
      baseAmount: 85,
      fees: [{ label: "Registration fee", amount: 50 }],
      paymentSchedule: ["Billed per booked day"],
      acceptsFinancialAid: false,
      includes: ["Art studio", "Nature lab", "Group projects"],
    },
    schedule: {
      startDate: "Rolling enrollment",
      endDate: "No fixed end date",
      registrationOpen: "Open year-round",
      registrationClose: "—",
      daysOfWeek: "1 – 5 days / week (family choice)",
      dailyHours: {
        dropOff: "8:30 – 9:00 AM",
        core: "9:00 AM – 2:00 PM",
        pickUp: "2:00 – 2:30 PM",
      },
      sessionNotes: "Book days at least 24 hours ahead",
      minDaysPerWeek: 1,
      maxDaysPerWeek: 5,
      bookingCutoff: "24 hours before session",
    },
    stats: { leads: 6, revenue: 6120 },
    teachers: [
      {
        id: "t6",
        name: "Ms. Carla Nguyen",
        initials: "CN",
        classroom: "Mixed Ages",
        studentIds: ["st3", "st5", "st7", "st8"],
        capacity: 16,
      },
    ],
  },
];

// ─── Staff (My School → Staff tab) ─────────────────────────────────────────────

type StaffPaperworkStatus = "signed" | "pending" | "overdue";
type StaffCredentialStatus = "valid" | "expiring" | "expired" | "missing";
type StaffProfileTab =
  | "profile"
  | "paperwork"
  | "credentials"
  | "payroll"
  | "compensation"
  | "schedule"
  | "classes"
  | "access"
  | "activity";

type DemoStaff = {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
  status: "active" | "on_leave" | "inactive";
  room: string;
  email: string;
  phone: string;
  hireDate: string;
  employmentType: "full_time" | "part_time" | "substitute";
  emergencyContact: { name: string; relationship: string; phone: string };
  programTeacherIds?: string[];
  paperwork: { id: string; title: string; status: StaffPaperworkStatus; signedDate?: string }[];
  credentials: {
    id: string;
    name: string;
    status: StaffCredentialStatus;
    expiryDate?: string;
    issuedDate?: string;
  }[];
  payroll: {
    payType: "hourly" | "salary";
    rate: number;
    schedule: string;
    lastPayDate: string;
    lastNet: number;
    ytdGross: number;
    recentPeriods: { period: string; net: number }[];
  };
  compensationHistory: {
    date: string;
    label: string;
    previousRate?: number;
    newRate: number;
    payType: "hourly" | "salary";
    reason: string;
    author?: string;
  }[];
  schedule: {
    weeklyHours: { day: string; start: string; end: string }[];
    pto: { used: number; total: number };
    recentTimeEntries: { date: string; in: string; out: string; hours: number }[];
  };
  access: {
    portalRole: string;
    permissions: { key: string; label: string; enabled: boolean }[];
  };
  activityLog: {
    date: string;
    type: "event" | "note" | "action";
    title: string;
    detail: string;
    author?: string;
  }[];
};

const STAFF_STATUS_STYLES: Record<
  DemoStaff["status"],
  { label: string; bg: string; text: string }
> = {
  active: { label: "Active", bg: C.successBg, text: C.success },
  on_leave: { label: "On Leave", bg: C.warningBg, text: C.warning },
  inactive: { label: "Inactive", bg: C.elevated, text: C.textTertiary },
};

const CREDENTIAL_STATUS_STYLES: Record<
  StaffCredentialStatus,
  { label: string; bg: string; text: string }
> = {
  valid: { label: "Valid", bg: C.successBg, text: C.success },
  expiring: { label: "Expiring", bg: C.warningBg, text: C.warning },
  expired: { label: "Expired", bg: C.errorBg, text: C.error },
  missing: { label: "Missing", bg: C.elevated, text: C.textTertiary },
};

const TEACHER_ACCESS_PERMISSIONS: DemoStaff["access"]["permissions"] = [
  { key: "students", label: "View & edit student profiles", enabled: true },
  { key: "attendance", label: "Record attendance", enabled: true },
  { key: "messaging", label: "Message families", enabled: true },
  { key: "billing", label: "View billing & invoices", enabled: false },
  { key: "enrollment", label: "Manage enrollment flows", enabled: false },
  { key: "staff", label: "Manage staff records", enabled: false },
  { key: "budget", label: "View school finances", enabled: false },
  { key: "impersonate", label: "Impersonate users", enabled: false },
];

const ADMIN_ACCESS_PERMISSIONS: DemoStaff["access"]["permissions"] = [
  { key: "students", label: "View & edit student profiles", enabled: true },
  { key: "attendance", label: "Record attendance", enabled: true },
  { key: "messaging", label: "Message families", enabled: true },
  { key: "billing", label: "View billing & invoices", enabled: true },
  { key: "enrollment", label: "Manage enrollment flows", enabled: true },
  { key: "staff", label: "Manage staff records", enabled: true },
  { key: "budget", label: "View school finances", enabled: true },
  { key: "impersonate", label: "Impersonate users", enabled: false },
];

const SUB_ACCESS_PERMISSIONS: DemoStaff["access"]["permissions"] = [
  { key: "students", label: "View & edit student profiles", enabled: true },
  { key: "attendance", label: "Record attendance", enabled: true },
  { key: "messaging", label: "Message families", enabled: false },
  { key: "billing", label: "View billing & invoices", enabled: false },
  { key: "enrollment", label: "Manage enrollment flows", enabled: false },
  { key: "staff", label: "Manage staff records", enabled: false },
  { key: "budget", label: "View school finances", enabled: false },
  { key: "impersonate", label: "Impersonate users", enabled: false },
];

const DEMO_STAFF: DemoStaff[] = [
  {
    id: "staff-reyes",
    name: "Ms. Taylor Reyes",
    initials: "TR",
    color: "#5E7C68",
    role: "Lead Teacher",
    status: "active",
    room: "Room 2 – Meadow Class",
    email: "t.reyes@mudkitchen.edu",
    phone: "(512) 555-0201",
    hireDate: "Aug 12, 2021",
    employmentType: "full_time",
    emergencyContact: { name: "Marco Reyes", relationship: "Spouse", phone: "(512) 555-0202" },
    programTeacherIds: ["t1", "t3"],
    paperwork: [
      { id: "sp1", title: "W-4 Tax Withholding", status: "signed", signedDate: "Jan 10, 2026" },
      { id: "sp2", title: "Employee Handbook Acknowledgement", status: "signed", signedDate: "Jan 10, 2026" },
      { id: "sp3", title: "Direct Deposit Authorization", status: "signed", signedDate: "Jan 11, 2026" },
      { id: "sp4", title: "Emergency Contact Update", status: "pending" },
    ],
    credentials: [
      { id: "sc1", name: "Texas Teaching Certificate", status: "valid", expiryDate: "Aug 2028", issuedDate: "Aug 2019" },
      { id: "sc2", name: "CPR / First Aid", status: "expiring", expiryDate: "Jun 15, 2026", issuedDate: "Jun 2024" },
      { id: "sc3", name: "Background Check", status: "valid", expiryDate: "Jan 2027", issuedDate: "Jan 2025" },
      { id: "sc4", name: "Mandated Reporter Training", status: "valid", expiryDate: "Dec 2026", issuedDate: "Dec 2025" },
    ],
    payroll: {
      payType: "salary",
      rate: 52000,
      schedule: "Biweekly (24 pay periods)",
      lastPayDate: "Apr 25, 2026",
      lastNet: 1842.5,
      ytdGross: 17333.33,
      recentPeriods: [
        { period: "Apr 6 – Apr 19, 2026", net: 1842.5 },
        { period: "Mar 23 – Apr 5, 2026", net: 1842.5 },
        { period: "Mar 9 – Mar 22, 2026", net: 1842.5 },
      ],
    },
    compensationHistory: [
      { date: "Aug 1, 2025", label: "Annual raise", previousRate: 48000, newRate: 52000, payType: "salary", reason: "3-year review — performance exceeds expectations", author: "Priya Singh" },
      { date: "Aug 1, 2023", label: "Promotion", previousRate: 42000, newRate: 48000, payType: "salary", reason: "Promoted to Lead Teacher", author: "Priya Singh" },
      { date: "Aug 12, 2021", label: "Start date", newRate: 42000, payType: "salary", reason: "Initial hire — Lead Teacher", author: "Priya Singh" },
    ],
    schedule: {
      weeklyHours: [
        { day: "Mon", start: "7:45 AM", end: "3:45 PM" },
        { day: "Tue", start: "7:45 AM", end: "3:45 PM" },
        { day: "Wed", start: "7:45 AM", end: "3:45 PM" },
        { day: "Thu", start: "7:45 AM", end: "3:45 PM" },
        { day: "Fri", start: "7:45 AM", end: "3:45 PM" },
      ],
      pto: { used: 3, total: 12 },
      recentTimeEntries: [
        { date: "May 19, 2026", in: "7:42 AM", out: "3:48 PM", hours: 8.1 },
        { date: "May 16, 2026", in: "7:50 AM", out: "3:40 PM", hours: 7.8 },
        { date: "May 15, 2026", in: "7:44 AM", out: "3:52 PM", hours: 8.1 },
      ],
    },
    access: { portalRole: "Lead Teacher", permissions: TEACHER_ACCESS_PERMISSIONS },
    activityLog: [
      { date: "May 14, 2026", type: "note", title: "Teacher observation", detail: "Strong classroom management during nature unit. Parent conference notes filed.", author: "Priya Singh" },
      { date: "May 1, 2026", type: "event", title: "Assigned — School Year 26–27", detail: "Primary (K – 2nd) lead for School Year 26–27 program.", author: "Admin" },
      { date: "Apr 20, 2026", type: "action", title: "Payroll processed", detail: "Biweekly pay of $1,842.50 deposited.", author: "System" },
      { date: "Jan 10, 2026", type: "event", title: "Onboarding complete", detail: "All required HR paperwork signed for 2026.", author: "Priya Singh" },
    ],
  },
  {
    id: "staff-park",
    name: "Mr. David Park",
    initials: "DP",
    color: "#6B8CAE",
    role: "Teaching Assistant",
    status: "active",
    room: "Room 1 – Sunflower Class",
    email: "d.park@mudkitchen.edu",
    phone: "(512) 555-0210",
    hireDate: "Jan 8, 2024",
    employmentType: "part_time",
    emergencyContact: { name: "Linda Park", relationship: "Mother", phone: "(512) 555-0211" },
    paperwork: [
      { id: "sp5", title: "W-4 Tax Withholding", status: "signed", signedDate: "Jan 8, 2024" },
      { id: "sp6", title: "Employee Handbook Acknowledgement", status: "signed", signedDate: "Jan 8, 2024" },
      { id: "sp7", title: "Direct Deposit Authorization", status: "signed", signedDate: "Jan 9, 2024" },
      { id: "sp8", title: "Technology Use Policy", status: "overdue" },
    ],
    credentials: [
      { id: "sc5", name: "CPR / First Aid", status: "valid", expiryDate: "Mar 2027", issuedDate: "Mar 2025" },
      { id: "sc6", name: "Background Check", status: "valid", expiryDate: "Jan 2027", issuedDate: "Jan 2025" },
      { id: "sc7", name: "Mandated Reporter Training", status: "valid", expiryDate: "Nov 2026", issuedDate: "Nov 2025" },
      { id: "sc8", name: "Texas Teaching Certificate", status: "missing" },
    ],
    payroll: {
      payType: "hourly",
      rate: 18.5,
      schedule: "Biweekly",
      lastPayDate: "Apr 25, 2026",
      lastNet: 1247.2,
      ytdGross: 11240,
      recentPeriods: [
        { period: "Apr 6 – Apr 19, 2026", net: 1247.2 },
        { period: "Mar 23 – Apr 5, 2026", net: 1186.0 },
        { period: "Mar 9 – Mar 22, 2026", net: 1298.5 },
      ],
    },
    compensationHistory: [
      { date: "Jan 1, 2026", label: "Hourly increase", previousRate: 17.5, newRate: 18.5, payType: "hourly", reason: "Annual cost-of-living adjustment", author: "Priya Singh" },
      { date: "Jan 8, 2024", label: "Start date", newRate: 17.5, payType: "hourly", reason: "Initial hire — Teaching Assistant", author: "Priya Singh" },
    ],
    schedule: {
      weeklyHours: [
        { day: "Mon", start: "8:30 AM", end: "2:30 PM" },
        { day: "Tue", start: "8:30 AM", end: "2:30 PM" },
        { day: "Wed", start: "8:30 AM", end: "2:30 PM" },
        { day: "Thu", start: "8:30 AM", end: "2:30 PM" },
        { day: "Fri", start: "—", end: "—" },
      ],
      pto: { used: 1, total: 6 },
      recentTimeEntries: [
        { date: "May 19, 2026", in: "8:28 AM", out: "2:35 PM", hours: 6.1 },
        { date: "May 15, 2026", in: "8:31 AM", out: "2:28 PM", hours: 5.9 },
      ],
    },
    access: { portalRole: "Teacher", permissions: TEACHER_ACCESS_PERMISSIONS },
    activityLog: [
      { date: "May 10, 2026", type: "event", title: "Supports Sunflower Room", detail: "Assigned as TA under Ms. Taylor Reyes for School Year 26–27.", author: "Admin" },
      { date: "Apr 1, 2026", type: "action", title: "Form reminder sent", detail: "Technology Use Policy — overdue reminder emailed.", author: "Priya Singh" },
    ],
  },
  {
    id: "staff-npark",
    name: "Ms. Nicole Park",
    initials: "NP",
    color: "#8B6BAE",
    role: "Lead Teacher",
    status: "active",
    room: "Room 4 – Oak Class",
    email: "n.park@mudkitchen.edu",
    phone: "(512) 555-0220",
    hireDate: "Jun 1, 2022",
    employmentType: "full_time",
    emergencyContact: { name: "James Park", relationship: "Spouse", phone: "(512) 555-0221" },
    programTeacherIds: ["t4"],
    paperwork: [
      { id: "sp9", title: "W-4 Tax Withholding", status: "signed", signedDate: "Jan 10, 2026" },
      { id: "sp10", title: "Employee Handbook Acknowledgement", status: "signed", signedDate: "Jan 10, 2026" },
      { id: "sp11", title: "Direct Deposit Authorization", status: "signed", signedDate: "Jan 11, 2026" },
    ],
    credentials: [
      { id: "sc9", name: "Texas Teaching Certificate", status: "valid", expiryDate: "Jun 2029", issuedDate: "Jun 2020" },
      { id: "sc10", name: "CPR / First Aid", status: "valid", expiryDate: "Sep 2027", issuedDate: "Sep 2025" },
      { id: "sc11", name: "Background Check", status: "valid", expiryDate: "Jun 2027", issuedDate: "Jun 2025" },
      { id: "sc12", name: "Fingerprint Clearance", status: "valid", expiryDate: "Jun 2027", issuedDate: "Jun 2025" },
    ],
    payroll: {
      payType: "salary",
      rate: 50000,
      schedule: "Biweekly (24 pay periods)",
      lastPayDate: "Apr 25, 2026",
      lastNet: 1771.15,
      ytdGross: 16666.67,
      recentPeriods: [
        { period: "Apr 6 – Apr 19, 2026", net: 1771.15 },
        { period: "Mar 23 – Apr 5, 2026", net: 1771.15 },
      ],
    },
    compensationHistory: [
      { date: "Aug 1, 2025", label: "Annual raise", previousRate: 47000, newRate: 50000, payType: "salary", reason: "Annual review", author: "Priya Singh" },
      { date: "Jun 1, 2022", label: "Start date", newRate: 47000, payType: "salary", reason: "Initial hire — Lead Teacher", author: "Priya Singh" },
    ],
    schedule: {
      weeklyHours: [
        { day: "Mon", start: "7:45 AM", end: "3:45 PM" },
        { day: "Tue", start: "7:45 AM", end: "3:45 PM" },
        { day: "Wed", start: "7:45 AM", end: "3:45 PM" },
        { day: "Thu", start: "7:45 AM", end: "3:45 PM" },
        { day: "Fri", start: "7:45 AM", end: "3:45 PM" },
      ],
      pto: { used: 2, total: 12 },
      recentTimeEntries: [
        { date: "May 19, 2026", in: "7:48 AM", out: "3:44 PM", hours: 7.9 },
        { date: "May 16, 2026", in: "7:46 AM", out: "3:50 PM", hours: 8.1 },
      ],
    },
    access: { portalRole: "Lead Teacher", permissions: TEACHER_ACCESS_PERMISSIONS },
    activityLog: [
      { date: "May 1, 2026", type: "event", title: "Assigned — Elementary (3rd – 4th)", detail: "Lead teacher for School Year 26–27.", author: "Admin" },
      { date: "Mar 12, 2026", type: "note", title: "PD completed", detail: "Differentiated instruction workshop — 6 hours.", author: "Priya Singh" },
    ],
  },
  {
    id: "staff-carla",
    name: "Ms. Carla Nguyen",
    initials: "CN",
    color: "#C4896E",
    role: "Lead Teacher",
    status: "active",
    room: "Homeschool Studio",
    email: "c.nguyen@mudkitchen.edu",
    phone: "(512) 555-0230",
    hireDate: "Sep 3, 2023",
    employmentType: "part_time",
    emergencyContact: { name: "Anh Nguyen", relationship: "Sibling", phone: "(512) 555-0231" },
    programTeacherIds: ["t6"],
    paperwork: [
      { id: "sp12", title: "W-4 Tax Withholding", status: "signed", signedDate: "Sep 3, 2023" },
      { id: "sp13", title: "Drop-In Program Agreement", status: "signed", signedDate: "Sep 5, 2023" },
      { id: "sp14", title: "Direct Deposit Authorization", status: "signed", signedDate: "Sep 4, 2023" },
    ],
    credentials: [
      { id: "sc13", name: "CPR / First Aid", status: "valid", expiryDate: "Oct 2027", issuedDate: "Oct 2025" },
      { id: "sc14", name: "Background Check", status: "valid", expiryDate: "Sep 2026", issuedDate: "Sep 2024" },
      { id: "sc15", name: "Mandated Reporter Training", status: "expiring", expiryDate: "Jun 1, 2026", issuedDate: "Jun 2024" },
    ],
    payroll: {
      payType: "hourly",
      rate: 24,
      schedule: "Biweekly",
      lastPayDate: "Apr 25, 2026",
      lastNet: 892.8,
      ytdGross: 8040,
      recentPeriods: [
        { period: "Apr 6 – Apr 19, 2026", net: 892.8 },
        { period: "Mar 23 – Apr 5, 2026", net: 768.0 },
      ],
    },
    compensationHistory: [
      { date: "Jan 1, 2026", label: "Hourly increase", previousRate: 22, newRate: 24, payType: "hourly", reason: "Homeschool program expansion", author: "Priya Singh" },
      { date: "Sep 3, 2023", label: "Start date", newRate: 22, payType: "hourly", reason: "Initial hire — Homeschool Drop-In lead", author: "Priya Singh" },
    ],
    schedule: {
      weeklyHours: [
        { day: "Mon", start: "8:30 AM", end: "2:30 PM" },
        { day: "Wed", start: "8:30 AM", end: "2:30 PM" },
        { day: "Fri", start: "8:30 AM", end: "2:30 PM" },
      ],
      pto: { used: 0, total: 8 },
      recentTimeEntries: [
        { date: "May 19, 2026", in: "8:32 AM", out: "2:28 PM", hours: 5.9 },
        { date: "May 16, 2026", in: "8:30 AM", out: "2:35 PM", hours: 6.1 },
      ],
    },
    access: { portalRole: "Teacher", permissions: TEACHER_ACCESS_PERMISSIONS },
    activityLog: [
      { date: "Apr 15, 2026", type: "event", title: "Homeschool Drop-In lead", detail: "Primary instructor for mixed-ages drop-in program.", author: "Admin" },
      { date: "Jun 1, 2026", type: "action", title: "Credential renewal due", detail: "Mandated Reporter Training expires Jun 1, 2026 — reminder scheduled.", author: "System" },
    ],
  },
  {
    id: "staff-singh",
    name: "Ms. Priya Singh",
    initials: "PS",
    color: "#7C3AED",
    role: "Administrator",
    status: "active",
    room: "Front Office",
    email: "priya@mudkitchen.edu",
    phone: "(512) 555-0100",
    hireDate: "Jul 1, 2020",
    employmentType: "full_time",
    emergencyContact: { name: "Raj Singh", relationship: "Spouse", phone: "(512) 555-0101" },
    paperwork: [
      { id: "sp15", title: "W-4 Tax Withholding", status: "signed", signedDate: "Jan 8, 2026" },
      { id: "sp16", title: "Employee Handbook Acknowledgement", status: "signed", signedDate: "Jan 8, 2026" },
      { id: "sp17", title: "Administrator Agreement", status: "signed", signedDate: "Jul 1, 2020" },
    ],
    credentials: [
      { id: "sc16", name: "Background Check", status: "valid", expiryDate: "Jul 2027", issuedDate: "Jul 2025" },
      { id: "sc17", name: "CPR / First Aid", status: "valid", expiryDate: "Feb 2028", issuedDate: "Feb 2026" },
    ],
    payroll: {
      payType: "salary",
      rate: 68000,
      schedule: "Biweekly (24 pay periods)",
      lastPayDate: "Apr 25, 2026",
      lastNet: 2410.5,
      ytdGross: 22666.67,
      recentPeriods: [{ period: "Apr 6 – Apr 19, 2026", net: 2410.5 }],
    },
    compensationHistory: [
      { date: "Aug 1, 2025", label: "Annual raise", previousRate: 64000, newRate: 68000, payType: "salary", reason: "Director compensation review", author: "Board" },
      { date: "Jul 1, 2020", label: "Start date", newRate: 55000, payType: "salary", reason: "Founding administrator", author: "Board" },
    ],
    schedule: {
      weeklyHours: [
        { day: "Mon", start: "7:30 AM", end: "4:30 PM" },
        { day: "Tue", start: "7:30 AM", end: "4:30 PM" },
        { day: "Wed", start: "7:30 AM", end: "4:30 PM" },
        { day: "Thu", start: "7:30 AM", end: "4:30 PM" },
        { day: "Fri", start: "7:30 AM", end: "3:00 PM" },
      ],
      pto: { used: 4, total: 15 },
      recentTimeEntries: [
        { date: "May 19, 2026", in: "7:28 AM", out: "4:35 PM", hours: 9.1 },
      ],
    },
    access: { portalRole: "Administrator", permissions: ADMIN_ACCESS_PERMISSIONS },
    activityLog: [
      { date: "May 18, 2026", type: "action", title: "Staff rate change approved", detail: "Approved hourly increase for Ms. Carla Nguyen.", author: "Priya Singh" },
      { date: "Apr 7, 2026", type: "event", title: "Staff planning meeting", detail: "Led all-staff check-in for spring term.", author: "Priya Singh" },
    ],
  },
  {
    id: "staff-ellison",
    name: "Mr. James Ellison",
    initials: "JE",
    color: "#8A7B6E",
    role: "Substitute",
    status: "on_leave",
    room: "—",
    email: "j.ellison@mudkitchen.edu",
    phone: "(512) 555-0240",
    hireDate: "Aug 20, 2025",
    employmentType: "substitute",
    emergencyContact: { name: "Kate Ellison", relationship: "Spouse", phone: "(512) 555-0241" },
    paperwork: [
      { id: "sp18", title: "Substitute Teacher Agreement", status: "signed", signedDate: "Aug 20, 2025" },
      { id: "sp19", title: "W-4 Tax Withholding", status: "signed", signedDate: "Aug 20, 2025" },
      { id: "sp20", title: "Emergency Contact Update", status: "pending" },
    ],
    credentials: [
      { id: "sc18", name: "Substitute Teaching Permit", status: "valid", expiryDate: "Aug 2027", issuedDate: "Aug 2025" },
      { id: "sc19", name: "Background Check", status: "valid", expiryDate: "Aug 2027", issuedDate: "Aug 2025" },
      { id: "sc20", name: "CPR / First Aid", status: "expired", expiryDate: "Apr 1, 2026", issuedDate: "Apr 2024" },
    ],
    payroll: {
      payType: "hourly",
      rate: 22,
      schedule: "Per diem (as worked)",
      lastPayDate: "Mar 14, 2026",
      lastNet: 176,
      ytdGross: 2640,
      recentPeriods: [{ period: "Mar 10 – Mar 14, 2026", net: 176 }],
    },
    compensationHistory: [
      { date: "Aug 20, 2025", label: "Start date", newRate: 22, payType: "hourly", reason: "Added to substitute pool", author: "Priya Singh" },
    ],
    schedule: {
      weeklyHours: [],
      pto: { used: 0, total: 0 },
      recentTimeEntries: [],
    },
    access: { portalRole: "Substitute", permissions: SUB_ACCESS_PERMISSIONS },
    activityLog: [
      { date: "Apr 22, 2026", type: "event", title: "Leave of absence", detail: "On leave through Jun 1, 2026 — family medical leave.", author: "Priya Singh" },
      { date: "Mar 14, 2026", type: "event", title: "Last assignment", detail: "Covered Oak Room for Ms. Nicole Park — 1 day.", author: "Admin" },
    ],
  },
];

// ─── Payroll hub demo data ─────────────────────────────────────────────────────

type PayrollReadinessStatus = "ready" | "paperwork" | "missing_rate";

const PAYROLL_REQUIRED_FORMS = ["W-4 Tax Withholding", "Direct Deposit Authorization"];

const DEMO_PAY_SCHEDULES = [
  {
    id: "ps-biweekly",
    name: "Biweekly — All staff",
    frequency: "Biweekly (every other week)",
    nextPayDate: "May 23, 2026",
  },
  {
    id: "ps-perdiem",
    name: "Per diem — Substitutes",
    frequency: "As worked",
    nextPayDate: "—",
  },
];

const DEMO_PAYROLL_RUNS = {
  upcoming: {
    id: "run-may-23",
    payday: "May 23",
    approvalDeadline: "May 20, 2026 · 3:00 PM CDT",
    type: "Regular",
    status: "not_started" as const,
  },
  recent: [] as { id: string; payday: string; type: string; total: string; status: string }[],
};

function isPayrollFormComplete(staff: DemoStaff, title: string): boolean {
  const form = staff.paperwork.find((p) => p.title === title);
  return form?.status === "signed";
}

function getStaffPayrollReadiness(staff: DemoStaff): PayrollReadinessStatus {
  if (!staff.payroll.rate || staff.payroll.rate <= 0) return "missing_rate";
  const missingPayrollForms = PAYROLL_REQUIRED_FORMS.filter(
    (title) => !isPayrollFormComplete(staff, title),
  );
  if (missingPayrollForms.length > 0) return "paperwork";
  return "ready";
}

function getPayrollReadinessLabel(status: PayrollReadinessStatus): string {
  if (status === "ready") return "Ready";
  if (status === "paperwork") return "Setup needed";
  return "Missing rate";
}

function getPayrollHubSummary() {
  const rows = DEMO_STAFF.map((staff) => ({
    staff,
    status: getStaffPayrollReadiness(staff),
  }));
  const needsSetup = rows.filter((r) => r.status !== "ready");
  const missingRates = rows.filter((r) => r.status === "missing_rate");
  const pendingForms = rows.filter((r) => r.status === "paperwork");
  const ytdPayroll = DEMO_STAFF.reduce((sum, s) => sum + s.payroll.ytdGross, 0);
  const personnelActual =
    BUDGET_CATS.find((c) => c.name === "Personnel")?.actual ?? ytdPayroll;
  return {
    rows,
    needsSetupCount: needsSetup.length,
    missingRatesCount: missingRates.length,
    pendingFormsCount: pendingForms.length,
    ytdPayroll,
    personnelActual,
  };
}

const DEMO_PAY_PERIOD = {
  label: "Apr 6 – Apr 19, 2026",
  payday: "May 23, 2026",
  paydayShort: "May 23",
  approvalDeadline: "May 20, 2026 · 3:00 PM CDT",
  scheduleName: "Biweekly — All staff",
};

type PayrollRunStatus = "not_started" | "in_review" | "approved";

type PayrollRunWizardStep = 1 | 2 | 3 | 4;

const PAYROLL_RUN_STEP_LABELS = ["Pay period", "Staff", "Amounts", "Confirm"] as const;

function isStaffIncludedInPayrollRun(staff: DemoStaff): boolean {
  return staff.status === "active";
}

function getDemoPeriodHours(staff: DemoStaff): number | null {
  if (staff.payroll.payType === "salary") return null;
  const hours = staff.schedule.recentTimeEntries.reduce((sum, e) => sum + e.hours, 0);
  return hours > 0 ? Math.round(hours * 10) / 10 : 80;
}

function getDemoPeriodNet(staff: DemoStaff): number {
  return staff.payroll.lastNet;
}

function getPayrollRunLineItems() {
  return DEMO_STAFF.filter(isStaffIncludedInPayrollRun).map((staff) => ({
    staff,
    readiness: getStaffPayrollReadiness(staff),
    hours: getDemoPeriodHours(staff),
    net: getDemoPeriodNet(staff),
  }));
}

function getStaffProgramAssignments(
  staff: DemoStaff,
): { program: DemoProgram; teacher: ProgramTeacher }[] {
  if (!staff.programTeacherIds?.length) return [];
  return DEMO_PROGRAMS_P2.flatMap((program) =>
    program.teachers
      .filter((t) => staff.programTeacherIds!.includes(t.id))
      .map((teacher) => ({ program, teacher })),
  );
}

function getStaffComplianceSummary(staff: DemoStaff): {
  expiringCredentials: number;
  overduePaperwork: number;
} {
  const expiringCredentials = staff.credentials.filter(
    (c) => c.status === "expiring" || c.status === "expired",
  ).length;
  const overduePaperwork = staff.paperwork.filter((p) => p.status === "overdue").length;
  return { expiringCredentials, overduePaperwork };
}

function formatStaffPayRate(staff: DemoStaff): string {
  if (staff.payroll.payType === "salary") {
    return `${formatUsd(staff.payroll.rate)} / yr`;
  }
  return `${formatUsd(staff.payroll.rate)} / hr`;
}

function getProgramEnrolledCount(prog: DemoProgram): number {
  return prog.teachers.reduce((sum, t) => sum + t.studentIds.length, 0);
}

function formatBillingModel(model: DemoProgram["pricing"]["billingModel"]): string {
  if (model === "monthly") return "Monthly";
  if (model === "weekly") return "Weekly";
  return "Per day";
}

function formatProgramPrice(prog: DemoProgram): string {
  const { billingModel, baseAmount } = prog.pricing;
  if (billingModel === "monthly") return `$${baseAmount.toLocaleString()}/mo`;
  if (billingModel === "weekly") return `$${baseAmount}/wk`;
  return `$${baseAmount}/day`;
}

// ─── Classrooms (My School → Classrooms tab) ───────────────────────────────────

type ClassroomStatus = "open" | "full" | "inactive";
type ClassroomTabId = "overview" | "health_safety" | "staff" | "schedule" | "roster";
type ClassroomStaffRole = "Lead Teacher" | "Teaching Assistant" | "Aide" | "Substitute";
type ClassroomSupplyStatus = "in_date" | "expiring" | "missing";

type DemoClassroom = {
  id: string;
  name: string;
  shortName: string;
  ageRange: string;
  gradeRange: string;
  location: { building: string; roomNumber: string };
  roomType: "homeroom" | "studio" | "shared";
  status: ClassroomStatus;
  capacity: number;
  waitlistCount: number;
  licensingMaxRatio: number;
  programIds: string[];
  staffAssignments: {
    staffId?: string;
    name: string;
    role: ClassroomStaffRole;
    initials: string;
    color: string;
  }[];
  schedule: {
    daysOfWeek: string;
    dailyHours: { dropOff: string; core: string; pickUp: string; afterCare?: string };
    sessionNotes?: string;
  };
  amenities: string[];
  description: string;
  attendanceToday: { present: number; absent: number };
  emergencySupplies: {
    id: string;
    item: string;
    location: string;
    status: ClassroomSupplyStatus;
    lastChecked: string;
    notes?: string;
  }[];
  nurseContact?: string;
};

const CLASSROOM_STATUS_STYLES: Record<
  ClassroomStatus,
  { label: string; bg: string; text: string }
> = {
  open: { label: "Available", bg: C.successBg, text: C.success },
  full: { label: "Full", bg: C.warningBg, text: C.warning },
  inactive: { label: "Inactive", bg: C.elevated, text: C.textTertiary },
};

const ROOM_TYPE_LABELS: Record<DemoClassroom["roomType"], string> = {
  homeroom: "Homeroom",
  studio: "Studio",
  shared: "Shared space",
};

const CLASSROOM_TABS: {
  id: ClassroomTabId;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-3 h-3" />, color: "#5E7C68" },
  { id: "health_safety", label: "Health & Safety", icon: <Shield className="w-3 h-3" />, color: "#EF4444" },
  { id: "staff", label: "Staff", icon: <UserCheck className="w-3 h-3" />, color: "#F97316" },
  { id: "schedule", label: "Schedule", icon: <CalendarDays className="w-3 h-3" />, color: "#8B5CF6" },
  { id: "roster", label: "Roster", icon: <Users className="w-3 h-3" />, color: "#38BDF8" },
];

const SUPPLY_STATUS_STYLES: Record<
  ClassroomSupplyStatus,
  { label: string; bg: string; text: string }
> = {
  in_date: { label: "In date", bg: C.successBg, text: C.success },
  expiring: { label: "Expiring", bg: C.warningBg, text: C.warning },
  missing: { label: "Missing", bg: C.errorBg, text: C.error },
};

const DEMO_CLASSROOMS: DemoClassroom[] = [
  {
    id: "room-sunflower",
    name: "Room 1 – Sunflower Class",
    shortName: "Sunflower",
    ageRange: "Ages 6–7",
    gradeRange: "1st",
    location: { building: "Main Campus", roomNumber: "Room 1" },
    roomType: "homeroom",
    status: "open",
    capacity: 12,
    waitlistCount: 1,
    licensingMaxRatio: 12,
    programIds: ["summer_26", "school_year_26_27"],
    staffAssignments: [
      { name: "Ms. Kim", role: "Lead Teacher", initials: "MK", color: "#5E7C68" },
      { staffId: "staff-park", name: "Mr. David Park", role: "Teaching Assistant", initials: "DP", color: "#6B8CAE" },
    ],
    schedule: {
      daysOfWeek: "Mon – Fri",
      dailyHours: {
        dropOff: "8:00 – 8:30 AM",
        core: "8:30 AM – 3:00 PM",
        pickUp: "3:00 – 3:30 PM",
        afterCare: "3:30 – 5:30 PM",
      },
      sessionNotes: "Primary homeroom for early elementary — natural light, reading nook, and garden window.",
    },
    amenities: ["Garden window", "Reading nook", "Sensory kit", "Outdoor deck access"],
    description: "Bright first-grade homeroom with direct access to the garden deck. Used for Summer and School Year programs.",
    attendanceToday: { present: 1, absent: 0 },
    nurseContact: "Nurse office — Room 101",
    emergencySupplies: [
      { id: "es-sf-1", item: "Sensory kit", location: "Quiet corner shelf", status: "in_date", lastChecked: "May 10, 2026", notes: "Noise-canceling headphones, fidget tools" },
      { id: "es-sf-2", item: "First aid kit", location: "Cabinet above sink", status: "in_date", lastChecked: "May 10, 2026" },
      { id: "es-sf-3", item: "Albuterol inhaler", location: "Emergency med bin", status: "in_date", lastChecked: "May 6, 2026", notes: "Ava Chen — rescue inhaler" },
    ],
  },
  {
    id: "room-meadow",
    name: "Room 2 – Meadow Class",
    shortName: "Meadow",
    ageRange: "Ages 7–8",
    gradeRange: "2nd",
    location: { building: "Main Campus", roomNumber: "Room 2" },
    roomType: "homeroom",
    status: "open",
    capacity: 12,
    waitlistCount: 2,
    licensingMaxRatio: 12,
    programIds: ["summer_26", "school_year_26_27"],
    staffAssignments: [
      { staffId: "staff-reyes", name: "Ms. Taylor Reyes", role: "Lead Teacher", initials: "TR", color: "#5E7C68" },
    ],
    schedule: {
      daysOfWeek: "Mon – Fri",
      dailyHours: {
        dropOff: "8:00 – 8:30 AM",
        core: "8:30 AM – 3:00 PM",
        pickUp: "3:00 – 3:30 PM",
        afterCare: "3:30 – 5:30 PM",
      },
      sessionNotes: "Nature-themed classroom with meadow mural and project tables for hands-on science.",
    },
    amenities: ["Project tables", "Classroom emergency kit", "Nature mural", "Quiet corner"],
    description: "Second-grade homeroom led by Ms. Taylor Reyes. Strong focus on outdoor learning and collaborative projects.",
    attendanceToday: { present: 2, absent: 0 },
    nurseContact: "Nurse office — Room 101",
    emergencySupplies: [
      { id: "es-md-1", item: "Classroom emergency kit", location: "Wall hook by door", status: "in_date", lastChecked: "May 12, 2026" },
      { id: "es-md-2", item: "EpiPen Jr.", location: "Emergency kit — front pocket", status: "expiring", lastChecked: "May 9, 2026", notes: "Lily Nakamura — expires Nov 2026" },
      { id: "es-md-3", item: "First aid kit", location: "Teacher desk drawer", status: "in_date", lastChecked: "May 12, 2026" },
    ],
  },
  {
    id: "room-seedling",
    name: "Room K – Seedling Class",
    shortName: "Seedling",
    ageRange: "Ages 4–6",
    gradeRange: "K",
    location: { building: "Main Campus", roomNumber: "Room K" },
    roomType: "homeroom",
    status: "open",
    capacity: 10,
    waitlistCount: 3,
    licensingMaxRatio: 10,
    programIds: ["summer_26"],
    staffAssignments: [
      { name: "Ms. Johnson", role: "Lead Teacher", initials: "MJ", color: "#C4896E" },
    ],
    schedule: {
      daysOfWeek: "Mon – Thu",
      dailyHours: {
        dropOff: "8:15 – 8:45 AM",
        core: "8:45 AM – 2:45 PM",
        pickUp: "2:45 – 3:15 PM",
      },
      sessionNotes: "Kindergarten space with play-based centers, visual schedules, and calm-down corner.",
    },
    amenities: ["Play centers", "Visual schedule wall", "Calm-down corner", "Low sinks"],
    description: "Kindergarten homeroom designed for social-emotional development and play-based learning.",
    attendanceToday: { present: 1, absent: 1 },
    nurseContact: "Nurse office — Room 101",
    emergencySupplies: [
      { id: "es-se-1", item: "First aid kit", location: "Entry cubby station", status: "in_date", lastChecked: "May 8, 2026" },
      { id: "es-se-2", item: "Calm-down kit", location: "Calm-down corner", status: "in_date", lastChecked: "May 8, 2026", notes: "Emotion chart, visual schedule cards" },
    ],
  },
  {
    id: "room-willow",
    name: "Room 3 – Willow Class",
    shortName: "Willow",
    ageRange: "Ages 8–9",
    gradeRange: "3rd",
    location: { building: "Main Campus", roomNumber: "Room 3" },
    roomType: "homeroom",
    status: "open",
    capacity: 14,
    waitlistCount: 1,
    licensingMaxRatio: 12,
    programIds: ["school_year_26_27", "summer_26"],
    staffAssignments: [
      { name: "Ms. Hughes", role: "Lead Teacher", initials: "MH", color: "#8B6BAE" },
      { name: "Ms. Reyes (Aide)", role: "Aide", initials: "TR", color: "#5E7C68" },
    ],
    schedule: {
      daysOfWeek: "Mon – Fri",
      dailyHours: {
        dropOff: "8:00 – 8:30 AM",
        core: "8:30 AM – 3:00 PM",
        pickUp: "3:00 – 3:30 PM",
        afterCare: "3:30 – 5:30 PM",
      },
      sessionNotes: "Third-grade homeroom with front-row low-distraction seating and large-print station.",
    },
    amenities: ["Large-print station", "Front-row seating", "Library corner", "STEM shelf"],
    description: "Third-grade homeroom with differentiated seating and enrichment resources for mixed-ability learners.",
    attendanceToday: { present: 3, absent: 0 },
    nurseContact: "Nurse office — Room 101",
    emergencySupplies: [
      { id: "es-wi-1", item: "Large-print materials station", location: "Front row — window side", status: "in_date", lastChecked: "May 14, 2026", notes: "Priya Mehta — preferred seating area" },
      { id: "es-wi-2", item: "Aide support binder", location: "Teacher podium", status: "in_date", lastChecked: "May 7, 2026", notes: "Reading aide protocols & assistive tech log" },
      { id: "es-wi-3", item: "First aid kit", location: "Supply closet", status: "in_date", lastChecked: "May 14, 2026" },
    ],
  },
  {
    id: "room-oak",
    name: "Room 4 – Oak Class",
    shortName: "Oak",
    ageRange: "Ages 9–10",
    gradeRange: "4th",
    location: { building: "Main Campus", roomNumber: "Room 4" },
    roomType: "homeroom",
    status: "open",
    capacity: 14,
    waitlistCount: 0,
    licensingMaxRatio: 12,
    programIds: ["school_year_26_27", "summer_26"],
    staffAssignments: [
      { name: "Mr. Davis", role: "Lead Teacher", initials: "MD", color: "#6B8CAE" },
      { staffId: "staff-npark", name: "Ms. Nicole Park", role: "Teaching Assistant", initials: "NP", color: "#8B6BAE" },
    ],
    schedule: {
      daysOfWeek: "Mon – Fri",
      dailyHours: {
        dropOff: "8:00 – 8:30 AM",
        core: "8:30 AM – 3:00 PM",
        pickUp: "3:00 – 3:30 PM",
        afterCare: "3:30 – 5:30 PM",
      },
      sessionNotes: "Upper-elementary room with standing desks and science lab corner.",
    },
    amenities: ["Standing desks", "Science lab corner", "Whiteboard wall", "Outdoor access"],
    description: "Fourth-grade homeroom emphasizing project-based science and flexible seating options.",
    attendanceToday: { present: 2, absent: 0 },
    nurseContact: "Nurse office — Room 101",
    emergencySupplies: [
      { id: "es-ok-1", item: "First aid kit", location: "Science lab corner", status: "in_date", lastChecked: "May 11, 2026" },
      { id: "es-ok-2", item: "Allergy action plan binder", location: "Teacher desk", status: "in_date", lastChecked: "May 9, 2026", notes: "Liam Torres — tree nut allergy" },
    ],
  },
  {
    id: "room-horizon",
    name: "Room 5 – Horizon Class",
    shortName: "Horizon",
    ageRange: "Ages 10–11",
    gradeRange: "5th",
    location: { building: "Main Campus", roomNumber: "Room 5" },
    roomType: "homeroom",
    status: "open",
    capacity: 12,
    waitlistCount: 2,
    licensingMaxRatio: 12,
    programIds: ["school_year_26_27"],
    staffAssignments: [
      { name: "Ms. Carter", role: "Lead Teacher", initials: "MC", color: "#7C3AED" },
    ],
    schedule: {
      daysOfWeek: "Mon – Fri",
      dailyHours: {
        dropOff: "8:00 – 8:30 AM",
        core: "8:30 AM – 3:00 PM",
        pickUp: "3:00 – 3:30 PM",
        afterCare: "3:30 – 5:30 PM",
      },
      sessionNotes: "Fifth-grade homeroom with robotics station and movement break zone.",
    },
    amenities: ["Robotics station", "Movement break zone", "Task checklists", "Fidget tools"],
    description: "Fifth-grade homeroom built for hands-on STEM and ADHD-friendly routines.",
    attendanceToday: { present: 1, absent: 0 },
    nurseContact: "Nurse office — Room 101",
    emergencySupplies: [
      { id: "es-hz-1", item: "Fidget tools bin", location: "Movement break zone", status: "in_date", lastChecked: "May 13, 2026" },
      { id: "es-hz-2", item: "Medication log clipboard", location: "Teacher desk", status: "in_date", lastChecked: "May 15, 2026", notes: "Marcus Webb — daily medication at 8 AM" },
      { id: "es-hz-3", item: "First aid kit", location: "Robotics station cabinet", status: "in_date", lastChecked: "May 13, 2026" },
    ],
  },
  {
    id: "room-summit",
    name: "Room 6 – Summit Class",
    shortName: "Summit",
    ageRange: "Ages 11–12",
    gradeRange: "6th",
    location: { building: "Main Campus", roomNumber: "Room 6" },
    roomType: "homeroom",
    status: "open",
    capacity: 10,
    waitlistCount: 0,
    licensingMaxRatio: 12,
    programIds: ["school_year_26_27"],
    staffAssignments: [
      { name: "Mr. Reynolds", role: "Lead Teacher", initials: "MR", color: "#8A7B6E" },
    ],
    schedule: {
      daysOfWeek: "Mon – Fri",
      dailyHours: {
        dropOff: "8:00 – 8:30 AM",
        core: "8:30 AM – 3:00 PM",
        pickUp: "3:00 – 3:30 PM",
      },
      sessionNotes: "Middle-elementary capstone room — debate corner and independent study desks.",
    },
    amenities: ["Debate corner", "Independent study desks", "Glucagon kit storage", "Chess set"],
    description: "Sixth-grade homeroom for leadership development, debate, and advanced independent work.",
    attendanceToday: { present: 1, absent: 0 },
    nurseContact: "Nurse office — Room 101 · glucagon backup on file",
    emergencySupplies: [
      { id: "es-sm-1", item: "Glucagon emergency kit", location: "Locked cabinet — north wall", status: "in_date", lastChecked: "Apr 15, 2026", notes: "Isabelle Clarke — expires Dec 2026" },
      { id: "es-sm-2", item: "Glucagon backup kit", location: "Nurse office — Room 101", status: "in_date", lastChecked: "Apr 15, 2026", notes: "Duplicate kit per diabetes action plan" },
      { id: "es-sm-3", item: "First aid kit", location: "Debate corner shelf", status: "in_date", lastChecked: "May 10, 2026" },
    ],
  },
];

function getClassroomStudents(classroom: DemoClassroom): DemoStudent[] {
  return ACTIVE_DEMO_STUDENTS.filter((s) => s.classroom === classroom.name);
}

function getClassroomEnrolledCount(classroom: DemoClassroom): number {
  return getClassroomStudents(classroom).length;
}

function getClassroomStaffCount(classroom: DemoClassroom): number {
  return classroom.staffAssignments.length;
}

function getClassroomRatio(classroom: DemoClassroom): string {
  const staff = getClassroomStaffCount(classroom);
  if (staff === 0) return "—";
  const enrolled = getClassroomEnrolledCount(classroom);
  return `${(enrolled / staff).toFixed(1)}:1`;
}

function getClassroomHealthAlertCount(classroom: DemoClassroom): number {
  return getClassroomStudents(classroom).filter(
    (s) => s.hasAllergies || s.hasMedical || s.hasEmergencyMeds || s.needsAide,
  ).length;
}

function getClassroomStudentsWithHealthFlags(classroom: DemoClassroom): DemoStudent[] {
  return getClassroomStudents(classroom).filter(
    (s) => s.hasAllergies || s.hasMedical || s.hasEmergencyMeds || s.needsAide,
  );
}

function getClassroomHealthStats(classroom: DemoClassroom) {
  const students = getClassroomStudents(classroom);
  return {
    flagged: getClassroomHealthAlertCount(classroom),
    enrolled: students.length,
    allergies: students.filter((s) => s.hasAllergies).length,
    medical: students.filter((s) => s.hasMedical).length,
    emergencyMeds: students.filter((s) => s.hasEmergencyMeds).length,
    aides: students.filter((s) => s.needsAide).length,
  };
}

function getSupplyStatusStyle(status: ClassroomSupplyStatus) {
  return SUPPLY_STATUS_STYLES[status];
}

function getStudentHealthSnippet(student: DemoStudent): string {
  if (student.hasAllergies && student.allergies) return student.allergies;
  if (student.hasEmergencyMeds && student.emergencyMeds) return student.emergencyMeds;
  if (student.hasMedical && student.medicalConditions) return student.medicalConditions;
  if (student.needsAide && student.aideDetails) return student.aideDetails;
  return "";
}

function getClassroomSidebarMeta(classroom: DemoClassroom) {
  return {
    badge: { bg: C.accentLight, text: C.accent },
    initials: classroom.shortName.slice(0, 2).toUpperCase(),
  };
}

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

function SectionLabel({
  children,
  hint,
  icon,
  iconColor,
  className,
}: {
  children: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  className?: string;
}) {
  return (
    <div className={className ?? "mb-4"}>
      <div className="flex items-center gap-2">
        {icon != null && (
          <span className="flex-shrink-0" style={{ color: iconColor }} aria-hidden>
            {icon}
          </span>
        )}
        <p className="text-sm font-medium" style={{ color: C.textSecondary }}>
          {children}
        </p>
      </div>
      {hint && (
        <p className="text-xs mt-1 leading-relaxed" style={{ color: C.textTertiary }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function FeatureTip({ text }: { text: string }) {
  return (
    <div
      className="flex items-start gap-2.5 px-3.5 py-2.5"
      style={{
        backgroundColor: C.clayBg,
        border: `1px solid ${C.clayBorder}`,
        borderLeft: `3px solid ${C.clay}`,
        borderRadius: C.r.md,
      }}
    >
      <HelpCircle
        className="w-4 h-4 flex-shrink-0 mt-0.5"
        style={{ color: C.clay }}
      />
      <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
        {text}
      </p>
    </div>
  );
}

function PageHeader({
  icon,
  title,
  subtitle,
  tip,
  action,
  className,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
  tip?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-3 mb-5 ${className ?? ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-xl font-semibold tracking-tight flex items-center gap-2"
            style={{ color: C.textPrimary }}
          >
            {icon && <span className="text-lg leading-none">{icon}</span>}
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm mt-1" style={{ color: C.textTertiary }}>
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      {tip && <FeatureTip text={tip} />}
    </div>
  );
}

function DemoButton({
  children,
  onClick,
  variant = "primary",
  className,
  style,
  ...rest
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  style?: React.CSSProperties;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary: {
      backgroundColor: C.accent,
      color: "#fff",
      border: `1px solid ${C.accentDark}`,
    },
    secondary: {
      backgroundColor: C.accentLight,
      color: C.accent,
      border: `1px solid ${C.secondaryBtnBorder}`,
    },
    ghost: {
      backgroundColor: C.surface,
      color: C.textSecondary,
      border: `1px solid ${C.inputBorder}`,
    },
  };
  const v = variants[variant];
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors ${className ?? ""}`}
      style={{
        borderRadius: C.r.sm,
        ...v,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
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
        padding: "18px",
        boxShadow: C.shadowCard,
      }}
    >
      {icon && (
        <div
          className="absolute top-3 right-3 w-7 h-7 rounded-sm flex items-center justify-center"
          style={{ backgroundColor: C.accentGlow }}
        >
          <span style={{ color: C.accent }}>{icon}</span>
        </div>
      )}
      <p
        className="text-xs font-medium mb-2"
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
      <SectionLabel hint="Latest family activity — applications, payments, and tours appear here automatically.">
        Recent Activity
      </SectionLabel>
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
      <SectionLabel hint="Track families from first inquiry to enrolled — spot bottlenecks at a glance.">
        Enrollment Pipeline
      </SectionLabel>
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
      <SectionLabel hint="Deadlines and events coming up — never miss orientation or enrollment close dates.">
        Upcoming
      </SectionLabel>
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
                className="flex-shrink-0 w-10 h-10 rounded-sm flex flex-col items-center justify-center"
                style={{
                  backgroundColor: C.surface,
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
      <PageHeader
        icon="📊"
        title="Dashboard"
        subtitle="Mud Kitchen School — Spring / Summer 2026"
        tip="Your morning snapshot — see revenue, enrollment, leads, and upcoming dates all in one place. Numbers update as families apply and pay."
      />
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
              <SectionLabel hint="Green line is tuition coming in; dashed line is what you're spending.">
                Revenue vs Expenses
              </SectionLabel>
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
            <SectionLabel hint="See how full each program is — and how many families are waiting for a spot.">
              Enrollment Capacity
            </SectionLabel>
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

const LEAD_STATUS_PIPELINE = [
  "applying",
  "booking",
  "booked",
  "enrolling",
  "needs_contract",
  "enrolled",
] as const;

function buildLeadFilters(leads: DemoLead[]) {
  return [
    { key: "all", label: "All", count: leads.length },
    ...LEAD_STATUS_PIPELINE.map((key) => ({
      key,
      label: STATUS_COLORS[key]?.label ?? key,
      count: leads.filter((l) => l.status === key).length,
    })),
  ];
}

const LEAD_TAGS = [
  "Summer 2026",
  "School Year",
  "Both",
  "Financial Aid",
  "Homeschool",
  "Tour",
];

const FLOW_FILTER_OPTIONS = [
  { id: "all", label: "All Forms" },
  { id: "flow-5", label: "Visit Visit Discovery Call Observation Observation" },
  { id: "flow-1", label: "Apply Now Form" },
  { id: "flow-2", label: "Enrollment Checklist" },
  { id: "flow-3", label: "Waitlist Signup" },
  { id: "flow-4", label: "Book a Campus Tour" },
];

const LEAD_CHILD_PHOTOS: Record<string, string> = {
  "Noah Foster": "/images/people/students/izzy-park-8hBY-30cEqI-unsplash.jpg",
  "Raj Patel": "/images/people/students/aditya-sethia-y9se00qtzd4-unsplash.jpg",
  "Lily Beaumont": "/images/people/students/patrick-hauth-K6p0llhyvP8-unsplash.jpg",
  "Tyler Watkins": "/images/people/students/vitaly-gariev-_z2Ii760I38-unsplash.jpg",
  "Sofia Mendez": "/images/people/students/cristina-anne-costello-i8n-TbgzSUE-unsplash.jpg",
  "Marcus Park": "/images/people/students/thomas-park-qnFFfsrxzIk-unsplash.jpg",
  "Hannah Kim": "/images/people/students/ben-mullins-je240KkJIuA-unsplash.jpg",
  "Ella Whitmore": "/images/people/students/patrick-hauth-K6p0llhyvP8-unsplash.jpg",
  "Jordan Cho": "/images/people/students/ibrahim-guetar-NUkjka_RqUE-unsplash.jpg",
  "Ella Thornton": "/images/people/students/aditya-sethia-y9se00qtzd4-unsplash.jpg",
  "Chidera Okonkwo": "/images/people/students/ben-mullins-je240KkJIuA-unsplash.jpg",
  "Alex & Ben Sullivan": "/images/people/students/vitaly-gariev-_z2Ii760I38-unsplash.jpg",
};

function LeadsFiltersPanel({
  activeFilter,
  filters,
  onChange,
  onClose,
}: {
  activeFilter: string;
  filters: ReturnType<typeof buildLeadFilters>;
  onChange: (key: string) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="absolute inset-y-0 right-0 flex w-72 max-w-full flex-col overflow-hidden"
      style={{
        backgroundColor: C.surface,
        borderLeft: `1px solid ${C.border}`,
        boxShadow: C.shadowMedium,
        zIndex: 12,
      }}
    >
      <div
        className="flex flex-shrink-0 items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
          Filters
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 rounded p-1"
          style={{ color: C.textTertiary }}
          aria-label="Close filters"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p
          className="mb-2 text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: C.textTertiary }}
        >
          Status
        </p>
        <div className="flex flex-col gap-1.5">
          {filters.map((f) => {
            const isActive = activeFilter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => onChange(f.key)}
                className="flex w-full items-center justify-between gap-2 rounded-sm px-3 py-2 text-left text-xs font-medium transition-all"
                style={demoLightPillStyle(isActive)}
              >
                <span>{f.label}</span>
                <span className="text-[10px] font-bold opacity-70">{f.count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

const NEW_SUBMISSION_LEAD_ID = "l0";

function LeadTableRow({
  lead,
  onSelectLead,
  initial,
  animate,
  transition,
}: {
  lead: DemoLead;
  onSelectLead: (lead: DemoLead) => void;
  initial?: { opacity: number; x?: number; y?: number };
  animate?: { opacity: number; x?: number; y?: number; backgroundColor?: string | string[] };
  transition?: {
    delay?: number;
    duration?: number;
    ease?: [number, number, number, number];
    backgroundColor?: { duration?: number; ease?: string };
  };
}) {
  const rowProps = {
    onClick: () => onSelectLead(lead),
    className: "cursor-pointer transition-colors",
    style: { borderBottom: `1px solid ${C.border}` },
    onMouseEnter: (e: { currentTarget: HTMLTableRowElement }) => {
      e.currentTarget.style.backgroundColor = C.elevated;
    },
    onMouseLeave: (e: { currentTarget: HTMLTableRowElement }) => {
      e.currentTarget.style.backgroundColor = "transparent";
    },
  };

  const cells = (
    <>
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
          <div className="flex min-w-0 items-center gap-2.5">
            {LEAD_CHILD_PHOTOS[lead.childName] ? (
              <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                <Image
                  src={LEAD_CHILD_PHOTOS[lead.childName]}
                  alt={lead.childName}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                  backgroundColor: C.accentLight,
                  color: C.accent,
                }}
              >
                {lead.childName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
            )}
            <div className="min-w-0">
              <p
                className="truncate text-sm"
                style={{ color: C.textSecondary }}
              >
                {lead.childName}
              </p>
              {lead.childAge != null ? (
                <p
                  className="text-xs"
                  style={{ color: C.textTertiary }}
                >
                  Age {lead.childAge}
                </p>
              ) : null}
            </div>
          </div>
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
    </>
  );

  if (initial != null || animate != null || transition != null) {
    return (
      <motion.tr
        key={lead.id}
        initial={initial}
        animate={animate}
        transition={transition}
        {...rowProps}
      >
        {cells}
      </motion.tr>
    );
  }

  return (
    <tr key={lead.id} {...rowProps}>
      {cells}
    </tr>
  );
}

function LeadsListTab({
  onSelectLead,
  animateNewSubmission = false,
}: {
  onSelectLead: (lead: DemoLead) => void;
  animateNewSubmission?: boolean;
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [newSubmissionRevealed, setNewSubmissionRevealed] = useState(
    !animateNewSubmission,
  );

  useEffect(() => {
    if (!animateNewSubmission) {
      setNewSubmissionRevealed(true);
      return;
    }
    setNewSubmissionRevealed(false);
    const timer = setTimeout(() => setNewSubmissionRevealed(true), 700);
    return () => clearTimeout(timer);
  }, [animateNewSubmission]);

  const leadFilters = buildLeadFilters(ACTIVE_DEMO_LEADS);

  const filtered = ACTIVE_DEMO_LEADS.filter((l) => {
    return activeFilter === "all" || l.status === activeFilter;
  });

  const newLead = animateNewSubmission
    ? filtered.find((l) => l.id === NEW_SUBMISSION_LEAD_ID)
    : undefined;
  const existingLeads = animateNewSubmission && newLead
    ? filtered.filter((l) => l.id !== NEW_SUBMISSION_LEAD_ID)
    : filtered;
  const useNewSubmissionAnimation = animateNewSubmission && !!newLead;

  const activeStatusLabel =
    leadFilters.find((f) => f.key === activeFilter)?.label ?? "All";
  const hasActiveStatusFilter = activeFilter !== "all";

  return (
    <div
      className="relative flex h-full flex-col"
      style={{ backgroundColor: C.surface }}
    >
      <div
        className="flex flex-shrink-0 items-center justify-end px-6 py-3"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <button
          type="button"
          onClick={() => setFilterPanelOpen(true)}
          className="relative flex flex-shrink-0 items-center justify-center rounded-sm p-2 transition-all"
          style={{
            backgroundColor: hasActiveStatusFilter ? C.accentLight : C.input,
            color: hasActiveStatusFilter ? C.accent : C.textSecondary,
            border: `1px solid ${hasActiveStatusFilter ? C.accent : C.border}`,
          }}
          aria-label={
            hasActiveStatusFilter
              ? `Filter submissions (${activeStatusLabel})`
              : "Filter submissions"
          }
        >
          <ListFilter className="h-4 w-4" />
          {hasActiveStatusFilter && (
            <span
              className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: C.accent }}
            />
          )}
        </button>
      </div>

      <AnimatePresence>
        {filterPanelOpen && (
          <>
            <motion.div
              key="leads-filter-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
              style={{ backgroundColor: "rgba(0,0,0,0.12)", zIndex: 11 }}
              onClick={() => setFilterPanelOpen(false)}
            />
            <LeadsFiltersPanel
              key="leads-filters-panel"
              activeFilter={activeFilter}
              filters={leadFilters}
              onChange={(key) => {
                setActiveFilter(key);
                setFilterPanelOpen(false);
              }}
              onClose={() => setFilterPanelOpen(false)}
            />
          </>
        )}
      </AnimatePresence>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto overflow-x-hidden">
          <table className="w-full text-sm">
            <thead
              className="sticky top-0 z-[1]"
              style={{ backgroundColor: C.surface }}
            >
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {[
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
                    className="text-left px-4 py-3 text-xs font-medium"
                    style={{ color: C.textTertiary }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {useNewSubmissionAnimation ? (
                <>
                  <AnimatePresence>
                    {newSubmissionRevealed && newLead && (
                      <LeadTableRow
                        key={newLead.id}
                        lead={newLead}
                        onSelectLead={onSelectLead}
                        initial={{ opacity: 0, x: 56 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          backgroundColor: [C.accentLight, "transparent"],
                        }}
                        transition={{
                          duration: 0.65,
                          ease: [0.22, 1, 0.36, 1],
                          backgroundColor: { duration: 1.2, ease: "easeOut" },
                        }}
                      />
                    )}
                  </AnimatePresence>
                  {existingLeads.map((lead) => (
                    <LeadTableRow
                      key={lead.id}
                      lead={lead}
                      onSelectLead={onSelectLead}
                    />
                  ))}
                </>
              ) : (
                filtered.map((lead, i) => (
                  <LeadTableRow
                    key={lead.id}
                    lead={lead}
                    onSelectLead={onSelectLead}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
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

type ChecklistStepIconKey =
  | "fileText"
  | "users"
  | "heart"
  | "pill"
  | "shieldCheck"
  | "clipboardList"
  | "camera"
  | "alertTriangle"
  | "userPlus"
  | "creditCard";

const CHECKLIST_STEP_ICON_MAP: Record<
  ChecklistStepIconKey,
  React.ComponentType<{ className?: string }>
> = {
  fileText: FileText,
  users: Users,
  heart: Heart,
  pill: Pill,
  shieldCheck: ShieldCheck,
  clipboardList: ClipboardList,
  camera: Camera,
  alertTriangle: AlertTriangle,
  userPlus: UserPlus,
  creditCard: CreditCard,
};

interface FlowStep {
  id: string;
  title: string;
  fields: FlowField[];
  optional?: boolean;
  icon?: ChecklistStepIconKey;
  iconBg?: string;
  iconColor?: string;
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
  kind?: "form" | "checklist";
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
    name: "Enrollment Checklist",
    kind: "checklist",
    updatedAt: "May 20, 2026",
    steps: [
      {
        id: "s-cl-1",
        title: "Program Description & Key Policies",
        fields: [],
        icon: "fileText",
        iconBg: "#EEF4F8",
        iconColor: "#827096",
      },
      {
        id: "s-cl-2",
        title: "Community Agreement",
        fields: [],
        icon: "users",
        iconBg: "#F5F0E8",
        iconColor: "#5C4A2A",
      },
      {
        id: "s-cl-3",
        title: "Emergency Contact, Health & Immunization Form",
        fields: [],
        icon: "heart",
        iconBg: "#FEE2E2",
        iconColor: "#B91C1C",
      },
      {
        id: "s-cl-4",
        title: "Emergency Medication Plan",
        fields: [],
        optional: true,
        icon: "pill",
        iconBg: "#EDE9FE",
        iconColor: "#6D28D9",
      },
      {
        id: "s-cl-5",
        title: "Proof of Immunizations",
        fields: [],
        icon: "shieldCheck",
        iconBg: "#D1FAE5",
        iconColor: "#047857",
      },
      {
        id: "s-cl-6",
        title: "Health Information Form",
        fields: [],
        icon: "clipboardList",
        iconBg: "#CFFAFE",
        iconColor: "#0E7490",
      },
      {
        id: "s-cl-7",
        title: "Photo Release Form",
        fields: [],
        icon: "camera",
        iconBg: "#E0E7FF",
        iconColor: "#4338CA",
      },
      {
        id: "s-cl-8",
        title: "Assumption of Risk",
        fields: [],
        icon: "alertTriangle",
        iconBg: "#FFEDD5",
        iconColor: "#C2410C",
      },
      {
        id: "s-cl-9",
        title: "Additional Authorized Pickup",
        fields: [],
        optional: true,
        icon: "userPlus",
        iconBg: "#F3E8FF",
        iconColor: "#7C3AED",
      },
      {
        id: "s-cl-10",
        title: "Pay Registration Fee",
        fields: [],
        icon: "creditCard",
        iconBg: "#DCFCE7",
        iconColor: "#15803D",
      },
    ],
    actions: [
      { id: "a3", type: "email", config: { to: "{{parent_email}}", subject: "Summer Program — You're on the list!", body: "" } },
      { id: "a4", type: "sms", config: { message: "Hi! You've successfully signed up for our summer program." } },
      { id: "a5", type: "redirect", config: { url: "https://www.trymudkitchen.com/thank-you" } },
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
  {
    id: "flow-4",
    name: "Book a Campus Tour",
    updatedAt: "May 15, 2026",
    steps: [
      {
        id: "s7",
        title: "Family & Child",
        fields: [
          { id: "f20", label: "Parent Name", type: "text", required: true },
          { id: "f21", label: "Email", type: "email", required: true },
          { id: "f22", label: "Phone", type: "phone", required: true },
          { id: "f23", label: "Child's Name", type: "text", required: true },
          { id: "f24", label: "Child's Age", type: "text", required: true },
        ],
      },
      {
        id: "s8",
        title: "Tour Preferences",
        fields: [
          {
            id: "f25",
            label: "Preferred Tour Date",
            type: "date",
            required: true,
          },
          {
            id: "f26",
            label: "Preferred Time",
            type: "select",
            required: true,
            options: ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:30 PM", "3:00 PM"],
          },
          {
            id: "f27",
            label: "Program Interest",
            type: "select",
            required: true,
            options: [
              "School Year 2026–27",
              "Summer 2026",
              "School Year & Summer",
            ],
          },
          { id: "f28", label: "Additional Notes", type: "text", required: false },
        ],
      },
    ],
    actions: [
      {
        id: "a8",
        type: "email",
        config: {
          to: "{{parent_email}}",
          subject: "Your campus tour request — Mud Kitchen",
          body: "We've received your tour request and will confirm your visit shortly.",
        },
      },
      { id: "a9", type: "notify_admin", config: {} },
      { id: "a10", type: "tag", config: { tag: "Tour Request" } },
    ],
  },
  {
    id: "flow-5",
    name: "Visit Visit Discovery Call Observation Observation",
    updatedAt: "May 20, 2026",
    steps: [
      {
        id: "s9",
        title: "Inquiry",
        fields: [
          { id: "f29", label: "Parent / Guardian Name", type: "text", required: true },
          { id: "f30", label: "Email", type: "email", required: true },
          { id: "f32", label: "Student's Name", type: "text", required: true },
          {
            id: "f33",
            label: "Grade Level",
            type: "select",
            required: true,
            options: [
              "6th Grade",
              "7th Grade",
              "3rd Grade",
              "9th Grade",
              "10th Grade",
              "11th Grade",
              "12th Grade",
            ],
          },
          {
            id: "f31",
            label: "Program Interest",
            type: "select",
            required: true,
            options: [
              "Waldorf Core K–8",
              "Friday BRANCH Program",
              "Kindergarten",
              "Not sure yet — let's talk",
            ],
          },
        ],
      },
    ],
    actions: [
      {
        id: "a11",
        type: "email",
        config: {
          to: "{{parent_email}}",
          subject: "We received your inquiry — Rooted Meadows",
          body: "Thank you for reaching out. We'll be in touch within 48 hours to schedule your visit and observation.",
        },
      },
      { id: "a12", type: "notify_admin", config: {} },
      { id: "a13", type: "tag", config: { tag: "Visit Visit Discovery Call Observation Observation" } },
    ],
  },
];

/** Demo: submissions use the seed flow schema; a real app would load the form definition tied to each submission. */
function getFlowForLead(flowId: string): EnrollmentFlow | undefined {
  return INITIAL_DEMO_FLOWS.find((f) => f.id === flowId);
}

function formatSubmissionFieldAnswer(
  field: FlowField,
  raw: string | boolean | undefined,
): string {
  if (raw === undefined || raw === null) return "—";
  if (typeof raw === "string" && raw.trim() === "") return "—";
  if (field.type === "checkbox") {
    if (typeof raw === "boolean") return raw ? "Yes" : "No";
    const s = String(raw).toLowerCase();
    if (s === "true" || s === "yes" || s === "on" || s === "1") return "Yes";
    return "No";
  }
  return String(raw);
}

const PIPELINE_STATUS_OPTIONS = [
  "applying",
  "booking",
  "booked",
  "enrolling",
  "needs_contract",
  "enrolled",
] as const;

function getStatusOptionsForLead(_flowId: string): readonly string[] {
  return PIPELINE_STATUS_OPTIONS;
}

type LeadActivityEntry = {
  id: string;
  at: string;
  actor: string;
  title: string;
  summary: string;
  variant: "mail" | "note" | "action";
};

type LeadDetailTabId =
  | `step:${string}`
  | "application"
  | "status"
  | "notes"
  | "activity";

type LeadDetailTab = {
  id: LeadDetailTabId;
  label: string;
  kind: "step" | "application" | "status" | "notes" | "activity";
};

function isApplicationLead(
  lead: DemoLead,
): lead is DemoLead & { applicationSectionIndex: number } {
  return (
    (lead.status === "applying" || lead.status === "booking") &&
    "applicationSectionIndex" in lead &&
    typeof lead.applicationSectionIndex === "number"
  );
}

function getApplicationResponses(lead: DemoLead): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [key, value] of Object.entries(lead.responses)) {
    if (typeof value === "string") map[key] = value;
    else if (typeof value === "boolean") map[key] = value ? "true" : "false";
  }
  return map;
}

type DemoActivityTimelineVariant =
  | "attendance"
  | "note"
  | "event"
  | "mail"
  | "action";

const DEMO_ACTIVITY_TIMELINE_ICONS: Record<
  DemoActivityTimelineVariant,
  { Icon: typeof Mail; color: string }
> = {
  attendance: { Icon: CalendarDays, color: "#38BDF8" },
  note: { Icon: MessageSquare, color: "#A78BFA" },
  event: { Icon: Zap, color: "#22C55E" },
  mail: { Icon: Mail, color: "#0284C7" },
  action: { Icon: Zap, color: "#16A34A" },
};

function demoActivityAuthorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function demoActivityAuthorAvatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = (h + name.charCodeAt(i) * (i + 1)) % 360;
  return `hsl(${h} 38% 42%)`;
}

function DemoActivityAuthorLine({ author }: { author: string }) {
  if (!author) return null;
  const initials = demoActivityAuthorInitials(author);
  const color = demoActivityAuthorAvatarColor(author);
  return (
    <div className="mt-1 flex items-center gap-1.5">
      <div
        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[8px] font-bold leading-none"
        style={{ backgroundColor: `${color}22`, color }}
        aria-hidden
      >
        {initials}
      </div>
      <p className="text-[9px]" style={{ color: C.textTertiary }}>
        — {author}
      </p>
    </div>
  );
}

function DemoActivityTimelineRow({
  variant,
  title,
  date,
  detail,
  author,
  showConnectorBelow,
}: {
  variant: DemoActivityTimelineVariant;
  title: string;
  date: string;
  detail: string;
  author?: string;
  showConnectorBelow: boolean;
}) {
  const { Icon, color } = DEMO_ACTIVITY_TIMELINE_ICONS[variant];
  return (
    <div className="flex gap-2.5">
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: color + "20" }}
        >
          <Icon className="h-3 w-3" style={{ color }} />
        </div>
        {showConnectorBelow && (
          <div
            className="my-0.5 min-h-[16px] w-px flex-1"
            style={{ backgroundColor: C.border }}
          />
        )}
      </div>
      <div className="min-w-0 flex-1 pb-4">
        <div className="mb-0.5 flex items-baseline gap-2">
          <p
            className="text-[11px] font-semibold"
            style={{ color: C.textPrimary }}
          >
            {title}
          </p>
          <span
            className="flex-shrink-0 text-[9px]"
            style={{ color: C.textTertiary }}
          >
            {date}
          </span>
        </div>
        <p
          className="text-[10px] leading-relaxed"
          style={{ color: C.textSecondary }}
        >
          {detail}
        </p>
        {author ? <DemoActivityAuthorLine author={author} /> : null}
      </div>
    </div>
  );
}

function LeadDetailPanel({
  lead,
  onClose,
  autoSendEnrollmentLink = false,
}: {
  lead: DemoLead;
  onClose: () => void;
  autoSendEnrollmentLink?: boolean;
}) {
  const flow = getFlowForLead(lead.flowId);
  const responseMap = lead.responses as unknown as Record<string, string | boolean>;
  const usesApplicationView = isApplicationLead(lead);

  const tabs = useMemo<LeadDetailTab[]>(() => {
    if (usesApplicationView) {
      return [
        { id: "application", label: "Application", kind: "application" },
        { id: "status", label: "Status & Tags", kind: "status" },
        { id: "notes", label: "Notes", kind: "notes" },
        { id: "activity", label: "Activity Log", kind: "activity" },
      ];
    }
    return [
      ...(flow?.steps.map((s) => ({
        id: `step:${s.id}` as LeadDetailTabId,
        label: s.title,
        kind: "step" as const,
      })) ?? []),
      { id: "status", label: "Status & Tags", kind: "status" },
      { id: "notes", label: "Notes", kind: "notes" },
      { id: "activity", label: "Activity Log", kind: "activity" },
    ];
  }, [flow, usesApplicationView]);

  const defaultTab = useMemo<LeadDetailTabId>(
    () =>
      usesApplicationView
        ? "application"
        : flow?.steps[0]?.id
          ? `step:${flow.steps[0].id}`
          : "status",
    [flow, usesApplicationView],
  );

  const [activeTab, setActiveTab] = useState<LeadDetailTabId>(defaultTab);
  const [leadStatus, setLeadStatus] = useState(lead.status);
  const [leadTags, setLeadTags] = useState<string[]>(() => [...lead.tags]);
  const [tagDraft, setTagDraft] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [activity, setActivity] = useState<LeadActivityEntry[]>([]);
  const [enrollmentLinkSent, setEnrollmentLinkSent] = useState(
    !autoSendEnrollmentLink,
  );

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, lead.id]);

  useEffect(() => {
    if (!autoSendEnrollmentLink) {
      setEnrollmentLinkSent(false);
      return;
    }
    setEnrollmentLinkSent(false);
    const timer = setTimeout(() => setEnrollmentLinkSent(true), 1000);
    return () => clearTimeout(timer);
  }, [autoSendEnrollmentLink, lead.id]);

  useEffect(() => {
    setLeadStatus(lead.status);
    setLeadTags([...lead.tags]);
    setTagDraft("");
    const statusLabel = STATUS_COLORS[lead.status]?.label ?? lead.status;
    const initial: LeadActivityEntry[] = [
      {
        id: `${lead.id}-a0`,
        at: `${lead.date} · 9:02 AM`,
        actor: "System",
        title: usesApplicationView
          ? lead.status === "booking"
            ? "Application submitted — book observation"
            : "Application started"
          : "Submission received",
        summary: usesApplicationView
          ? lead.status === "booking"
            ? "Full application received. Family still needs to schedule their observation visit."
            : "Family began the Apply Now application on your website."
          : "Form submission received and queued for review.",
        variant: "mail",
      },
      {
        id: `${lead.id}-a1`,
        at: `${lead.date} · 9:03 AM`,
        actor: "Automation",
        title: "Confirmation sent",
        summary: `Confirmation email sent to ${lead.email}.`,
        variant: "mail",
      },
    ];
    if (lead.tags.length > 0) {
      initial.push({
        id: `${lead.id}-a2`,
        at: `${lead.date} · 10:15 AM`,
        actor: "Jordan M.",
        title: "Tags updated",
        summary: `Added tags: ${lead.tags.join(", ")}.`,
        variant: "note",
      });
    }
    if (lead.status !== "applying") {
      initial.push({
        id: `${lead.id}-a3`,
        at: `${lead.date} · 2:40 PM`,
        actor: "Jordan M.",
        title: "Status updated",
        summary: `Status set to ${statusLabel}.`,
        variant: "action",
      });
    }
    setActivity(initial);
    setAdminNotes("");
  }, [lead.id, lead.date, lead.email, lead.status, lead.tags, usesApplicationView]);

  const activeStep =
    activeTab.startsWith("step:") && flow
      ? flow.steps.find((s) => `step:${s.id}` === activeTab)
      : undefined;

  const showInquiryOnActiveTab =
    Boolean(lead.message) &&
    flow &&
    flow.steps[0] &&
    activeTab === (`step:${flow.steps[0].id}` as LeadDetailTabId);

  const activityNow = () =>
    new Date().toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const onStatusChange = (next: string) => {
    if (next === leadStatus) return;
    const prevLabel = STATUS_COLORS[leadStatus]?.label ?? leadStatus;
    const nextLabel = STATUS_COLORS[next]?.label ?? next;
    setLeadStatus(next);
    setActivity((prev) => [
      ...prev,
      {
        id: `${lead.id}-st-${Date.now()}`,
        at: activityNow(),
        actor: "You",
        title: "Status updated",
        summary: `Changed status from ${prevLabel} to ${nextLabel}.`,
        variant: "action",
      },
    ]);
  };

  const addTagValue = (t: string) => {
    const trimmed = t.trim();
    if (!trimmed || leadTags.includes(trimmed)) return;
    setLeadTags((prev) => [...prev, trimmed]);
    setActivity((prev) => [
      ...prev,
      {
        id: `${lead.id}-tg-${Date.now()}`,
        at: activityNow(),
        actor: "You",
        title: "Tag added",
        summary: `Added tag “${trimmed}”.`,
        variant: "note",
      },
    ]);
  };

  const addTag = () => {
    const t = tagDraft.trim();
    if (!t || leadTags.includes(t)) return;
    addTagValue(t);
    setTagDraft("");
  };

  const suggestedTags = LEAD_TAGS.filter((t) => !leadTags.includes(t));

  const removeTag = (t: string) => {
    setLeadTags((prev) => prev.filter((x) => x !== t));
    setActivity((prev) => [
      ...prev,
      {
        id: `${lead.id}-tr-${Date.now()}`,
        at: activityNow(),
        actor: "You",
        title: "Tag removed",
        summary: `Removed tag “${t}”.`,
        variant: "note",
      },
    ]);
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="absolute inset-y-0 right-0 flex w-[min(100%,44rem)] max-w-full flex-col overflow-hidden rounded-none"
      style={{
        backgroundColor: C.surface,
        borderLeft: `1px solid ${C.border}`,
        boxShadow: C.shadowMedium,
        zIndex: 15,
      }}
    >
      <div
        className="flex flex-shrink-0 items-center justify-between px-4 py-3 sm:px-5"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div className="min-w-0 pr-3">
          <h3
            className="truncate text-sm font-semibold"
            style={{ color: C.textPrimary }}
          >
            {lead.name}
          </h3>
          <p className="mt-0.5 truncate text-xs" style={{ color: C.textTertiary }}>
            {usesApplicationView
              ? ROOTED_MEADOWS_APPLICATION_COPY.applicationFor
              : flow?.name ?? "Form submission"}
            <span className="mx-1.5 opacity-50">·</span>
            Submitted {lead.date}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 rounded p-1"
          style={{ color: C.textTertiary }}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-row overflow-hidden">
        {tabs.length > 0 && (
          <nav
            className="flex w-28 flex-shrink-0 flex-col overflow-y-auto border-r py-2 sm:w-36"
            style={{
              borderColor: C.border,
              backgroundColor: C.bg,
            }}
            aria-label="Submission views"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="w-full py-2 pl-2 pr-1.5 text-left text-[11px] font-medium leading-snug transition-colors sm:pl-3 sm:pr-2 sm:text-xs"
                  style={{
                    color: isActive ? C.accent : C.textSecondary,
                    backgroundColor: isActive ? C.accentLight : "transparent",
                    borderLeft: isActive ? `3px solid ${C.accent}` : "3px solid transparent",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        )}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3 pt-3 sm:px-5">
            {activeTab === "application" && usesApplicationView && (
              <ApplicationProgressView
                responses={getApplicationResponses(lead)}
                applicationSectionIndex={lead.applicationSectionIndex}
                status={lead.status === "booking" ? "booking" : "applying"}
              />
            )}
            {activeTab === "status" && (
              <div className="flex flex-col gap-5 pb-3">
                <div>
                  <p
                    className="mb-2 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: C.textTertiary }}
                  >
                    Status
                  </p>
                  <div className="flex flex-col gap-1.5" role="listbox" aria-label="Lead status">
                    {getStatusOptionsForLead(lead.flowId).map((key) => {
                      const isActive = leadStatus === key;
                      const statusStyle = STATUS_COLORS[key] ?? {
                        bg: C.elevated,
                        border: C.border,
                        text: C.textTertiary,
                        label: key,
                      };
                      return (
                        <button
                          key={key}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onClick={() => onStatusChange(key)}
                          className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-xs font-medium transition-all"
                          style={
                            isActive
                              ? {
                                  backgroundColor: statusStyle.bg,
                                  color: statusStyle.text,
                                  border: `1px solid ${statusStyle.border}`,
                                }
                              : demoInactivePillStyle()
                          }
                        >
                          <span
                            className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                            style={{ backgroundColor: statusStyle.text }}
                            aria-hidden
                          />
                          <span>{statusStyle.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p
                    className="mb-2 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: C.textTertiary }}
                  >
                    Tags
                  </p>
                  <div
                    className="flex min-h-[36px] flex-wrap items-center gap-1.5 rounded-sm border px-2 py-1.5"
                    style={{
                      backgroundColor: C.input,
                      borderColor: C.inputBorder,
                    }}
                  >
                    {leadTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-0.5 rounded-sm py-0.5 pl-1.5 pr-0.5 text-[11px] font-medium"
                        style={{
                          backgroundColor: C.accentLight,
                          color: C.accent,
                        }}
                      >
                        {tag}
                        <button
                          type="button"
                          className="rounded-sm p-0.5 opacity-60 transition-opacity hover:opacity-100"
                          style={{ color: C.accent }}
                          title={`Remove ${tag}`}
                          aria-label={`Remove tag ${tag}`}
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagDraft}
                      onChange={(e) => setTagDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder={leadTags.length === 0 ? "Type a tag, press Enter" : "Add another…"}
                      className="min-w-[7rem] flex-1 border-0 bg-transparent py-0.5 text-xs outline-none"
                      style={{ color: C.textPrimary }}
                    />
                  </div>
                  {suggestedTags.length > 0 && (
                    <p className="mt-2 text-[11px] leading-relaxed" style={{ color: C.textTertiary }}>
                      <span style={{ color: C.textQuaternary }}>Suggested </span>
                      {suggestedTags.map((tag, i) => (
                        <span key={tag}>
                          {i > 0 && (
                            <span className="mx-1" style={{ color: C.textQuaternary }}>
                              ·
                            </span>
                          )}
                          <button
                            type="button"
                            className="font-medium transition-opacity hover:opacity-70"
                            style={{ color: C.accent }}
                            onClick={() => addTagValue(tag)}
                          >
                            {tag}
                          </button>
                        </span>
                      ))}
                    </p>
                  )}

                </div>
              </div>
            )}
            {activeTab.startsWith("step:") && !flow && (
              <p className="text-sm" style={{ color: C.textTertiary }}>
                Form definition not found for this submission.
              </p>
            )}

            {activeTab.startsWith("step:") && activeStep && (
              <section className="pb-3">
                <div className="mb-3">
                  <p
                    className="text-xs font-semibold"
                    style={{ color: C.textPrimary }}
                  >
                    {activeStep.title}
                  </p>
                  <div
                    className="mt-1 h-px w-8 rounded-full"
                    style={{ backgroundColor: C.accent }}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  {activeStep.fields.map((field) => {
                    const raw = responseMap[field.id];
                    const answer = formatSubmissionFieldAnswer(field, raw);
                    const multiline =
                      field.type === "text" && answer.length > 80;
                    return (
                      <div
                        key={field.id}
                        className="rounded-sm px-3 py-2.5 sm:px-4 sm:py-3"
                        style={{
                          backgroundColor: C.surface,
                          border: `1px solid ${C.border}`,
                          boxShadow: "0 1px 2px rgba(17,28,22,0.04)",
                        }}
                      >
                        <p
                          className="mb-1 text-[10px] font-semibold uppercase tracking-widest"
                          style={{ color: C.textTertiary }}
                        >
                          {field.label}
                          {field.required ? (
                            <span style={{ color: C.textQuaternary }}> *</span>
                          ) : null}
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            multiline ? "whitespace-pre-wrap leading-relaxed" : ""
                          }`}
                          style={{ color: C.textPrimary }}
                        >
                          {answer}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {showInquiryOnActiveTab && (
                  <div className="mt-4">
                    <p
                      className="mb-2 text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: C.textTertiary }}
                    >
                      Message (inquiry)
                    </p>
                    <div
                      className="rounded-sm border px-3 py-2.5 text-sm leading-relaxed sm:px-4 sm:py-3"
                      style={{
                        backgroundColor: C.surface,
                        borderColor: C.border,
                        color: C.textSecondary,
                        whiteSpace: "pre-wrap",
                        boxShadow: "0 1px 2px rgba(17,28,22,0.04)",
                      }}
                    >
                      {lead.message}
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeTab === "notes" && (
              <div className="pb-3 pt-1">
                <p
                  className="mb-2 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: C.textTertiary }}
                >
                  Admin Notes
                </p>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={6}
                  placeholder="Add a note…"
                  className="w-full resize-y rounded-sm px-3 py-2.5 text-sm outline-none"
                  style={demoInputStyle({
                    borderRadius: C.r.sm,
                    boxShadow: "0 1px 2px rgba(17,28,22,0.04)",
                  })}
                />
              </div>
            )}

            {activeTab === "activity" && (
              <div className="pb-6 pt-1">
                <p
                  className="mb-3 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: C.textTertiary }}
                >
                  Activity log
                </p>
                <div className="space-y-0">
                  {activity.map((row, i) => (
                    <DemoActivityTimelineRow
                      key={row.id}
                      variant={row.variant}
                      title={row.title}
                      date={row.at}
                      detail={row.summary}
                      author={row.actor}
                      showConnectorBelow={i < activity.length - 1}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="flex-shrink-0 px-4 py-3 sm:px-5"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        <motion.button
          type="button"
          disabled={enrollmentLinkSent}
          className="w-full rounded-sm py-2 text-sm font-semibold"
          animate={{
            backgroundColor: enrollmentLinkSent ? C.successBg : C.accentLight,
            color: enrollmentLinkSent ? C.success : C.accent,
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            cursor: enrollmentLinkSent ? "default" : "pointer",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {enrollmentLinkSent ? (
              <motion.span
                key="sent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-4 w-4" aria-hidden />
                Sent
              </motion.span>
            ) : (
              <motion.span
                key="send"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                Send Enrollment Link
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}

type PostSubmitActionMeta = {
  label: string;
  color: string;
  bgColor: string;
  description: string;
  Icon: typeof Mail;
};

const FLOW_ACTION_TYPES: FlowActionType[] = [
  "email",
  "sms",
  "redirect",
  "tag",
  "notify_admin",
];

function getActionMeta(): Record<FlowActionType, PostSubmitActionMeta> {
  return {
    email: {
      label: "Send Email",
      color: C.info,
      bgColor: C.infoBg,
      description: "Email a confirmation to the family",
      Icon: Mail,
    },
    sms: {
      label: "Send SMS",
      color: C.success,
      bgColor: C.successBg,
      description: "Text message to the parent",
      Icon: MessageSquare,
    },
    redirect: {
      label: "Redirect",
      color: C.warning,
      bgColor: C.warningBg,
      description: "Send families to a thank-you page",
      Icon: ArrowRight,
    },
    tag: {
      label: "Add Tag",
      color: C.purple,
      bgColor: C.purpleBg,
      description: "Tag the lead for follow-up",
      Icon: Tag,
    },
    notify_admin: {
      label: "Notify Admin",
      color: C.accent,
      bgColor: C.accentLight,
      description: "Alert your team in the dashboard",
      Icon: Bell,
    },
  };
}

function truncateSummary(text: string, max: number) {
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

const FIELD_TYPE_OWNER_LABELS: Record<FlowFieldType, string> = {
  text: "Short answer",
  email: "Email address",
  phone: "Phone number",
  select: "Dropdown choices",
  checkbox: "Yes/No checkbox",
  date: "Date",
};

function getFieldTypeOwnerLabel(type: FlowFieldType): string {
  return FIELD_TYPE_OWNER_LABELS[type] ?? type;
}

function getStepSummary(step: FlowStep, isChecklistFlow?: boolean): string {
  const count = step.fields.length;
  if (count === 0) {
    if (isChecklistFlow) return step.optional ? "Optional item" : "Required item";
    return "No questions yet";
  }
  const noun = count === 1 ? "question" : "questions";
  const labels = step.fields.slice(0, 3).map((f) => f.label);
  const preview = labels.join(", ");
  const more = count > 3 ? ` +${count - 3} more` : "";
  return `${count} ${noun}${preview ? ` · ${preview}${more}` : ""}`;
}

function getPostSubmitActionSummary(action: FlowAction): string {
  switch (action.type) {
    case "email":
      return action.config.subject?.trim() || "No subject";
    case "sms":
      return action.config.message?.trim()
        ? truncateSummary(action.config.message.trim(), 48)
        : "No message";
    case "redirect": {
      const url = action.config.url?.trim();
      if (!url) return "No URL set";
      try {
        return new URL(url).hostname || url;
      } catch {
        return truncateSummary(url, 40);
      }
    }
    case "tag":
      return action.config.tag?.trim()
        ? `Tag: ${action.config.tag.trim()}`
        : "No tag set";
    case "notify_admin":
      return "Notifies all admins";
  }
}

function PostSubmitLabeledField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="mb-1 block text-[10px] font-medium"
        style={{ color: C.textTertiary }}
      >
        {label}
      </label>
      {children}
    </div>
  );
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

/** Templates for suggested fields — a fresh id is assigned when added to a step */
type FlowFieldTemplate = Omit<FlowField, "id">;

const FLOW_FIELD_LIBRARY: FlowFieldTemplate[] = [
  { label: "First Name", type: "text", required: true },
  { label: "Last Name", type: "text", required: true },
  { label: "Email", type: "email", required: true },
  { label: "Phone", type: "phone", required: false },
  { label: "Child's Name", type: "text", required: true },
  { label: "Date of Birth", type: "date", required: true },
  { label: "Age", type: "text", required: false },
  {
    label: "Grade Level",
    type: "select",
    required: true,
    options: ["Pre-K", "K", "1st", "2nd", "3rd"],
  },
  {
    label: "Preferred Program",
    type: "select",
    required: true,
    options: ["Full Day", "Half Day", "After Care"],
  },
  { label: "Preferred Start Date", type: "date", required: false },
  { label: "Interested in Financial Aid", type: "checkbox", required: false },
  { label: "How did you hear about us?", type: "text", required: false },
  { label: "Allergies or dietary notes", type: "text", required: false },
  { label: "Emergency contact name", type: "text", required: false },
  { label: "Emergency contact phone", type: "phone", required: false },
];

function EnrollmentFlowEditReorderField({
  stepId,
  field,
  updateField,
  deleteField,
}: {
  stepId: string;
  field: FlowField;
  updateField: (sid: string, fid: string, patch: Partial<FlowField>) => void;
  deleteField: (sid: string, fid: string) => void;
}) {
  const dragControls = useDragControls();

  const controlStyle: React.CSSProperties = {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: "5px",
    fontSize: "13px",
    padding: "10px 12px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const selectStyle: React.CSSProperties = {
    ...controlStyle,
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    paddingRight: "36px",
    minHeight: "42px",
  };

  return (
    <Reorder.Item
      as="div"
      value={field}
      dragListener={false}
      dragControls={dragControls}
      className="flex gap-2.5 rounded-md border p-3.5"
      style={{
        borderColor: C.borderStrong,
        backgroundColor: C.surface,
        listStyle: "none",
        cursor: "default",
        boxShadow: "0 1px 2px rgba(17,28,22,0.04)",
      }}
      layout="position"
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        title="Drag to reorder"
        className="touch-none shrink-0 mt-1 self-start cursor-grab rounded p-1 outline-none active:cursor-grabbing"
        style={{
          color: C.textQuaternary,
          backgroundColor: "transparent",
        }}
        onPointerDown={(e) => dragControls.start(e)}
      >
        <GripVertical className="h-4 w-4" strokeWidth={2} />
      </button>
      <div className="min-w-0 flex flex-1 flex-col gap-3">
        <div>
          <label
            className="mb-1 block text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: C.textTertiary }}
          >
            Question / label
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) =>
              updateField(stepId, field.id, { label: e.target.value })
            }
            placeholder="What families see on the form"
            autoComplete="off"
            style={controlStyle}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="min-w-[140px] flex-1">
            <label
              className="mb-1 block text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: C.textTertiary }}
            >
              Answer type
            </label>
            <div className="relative w-full">
              <select
                value={field.type}
                onChange={(e) =>
                  updateField(stepId, field.id, {
                    type: e.target.value as FlowFieldType,
                  })
                }
                style={selectStyle}
                aria-label="Answer type"
              >
                {FIELD_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {getFieldTypeOwnerLabel(opt.value)}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 shrink-0"
                style={{ color: C.textQuaternary }}
                strokeWidth={2.25}
              />
            </div>
          </div>

          <div className="min-w-[180px] flex-1">
            <span
              className="mb-1 block text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: C.textTertiary }}
            >
              Require an answer?
            </span>
            <div
              className="flex gap-0.5 rounded-md border p-0.5"
              role="group"
              aria-label="Whether this field is required"
              style={{
                borderColor: C.borderStrong,
                backgroundColor: C.surface,
              }}
            >
              <button
                type="button"
                className="flex-1 rounded px-2 py-2 text-[11px] font-semibold transition-all"
                style={{
                  backgroundColor: !field.required ? C.accentLight : "transparent",
                  color: !field.required ? C.accent : C.textTertiary,
                  border: !field.required ? `1px solid ${C.accent}` : "1px solid transparent",
                }}
                onClick={() =>
                  field.required && updateField(stepId, field.id, { required: false })
                }
              >
                Optional
              </button>
              <button
                type="button"
                className="flex-1 rounded px-2 py-2 text-[11px] font-semibold transition-all"
                style={{
                  backgroundColor: field.required ? C.errorBg : "transparent",
                  color: field.required ? C.error : C.textTertiary,
                  border: field.required ? `1px solid ${C.errorBorder}` : "1px solid transparent",
                }}
                onClick={() =>
                  !field.required && updateField(stepId, field.id, { required: true })
                }
              >
                Required
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold transition-colors"
            style={{ color: C.error }}
            onClick={() => deleteField(stepId, field.id)}
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
            Remove field
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
}

function EnrollmentFlowStepReorderItem({
  step,
  stepIdx,
  totalSteps,
  isExpanded,
  isChecklistFlow,
  onToggleExpand,
  setPreviewStep,
  updateStepTitle,
  deleteStep,
  addField,
  addPresetField,
  updateField,
  deleteField,
  setStepFieldsOrder,
  fieldInputStyle,
}: {
  step: FlowStep;
  stepIdx: number;
  totalSteps: number;
  isExpanded: boolean;
  isChecklistFlow?: boolean;
  onToggleExpand: () => void;
  setPreviewStep: (s: FlowStep | null) => void;
  updateStepTitle: (stepId: string, title: string) => void;
  deleteStep: (stepId: string) => void;
  addField: (stepId: string) => void;
  addPresetField: (stepId: string, template: FlowFieldTemplate) => void;
  updateField: (stepId: string, fieldId: string, patch: Partial<FlowField>) => void;
  deleteField: (stepId: string, fieldId: string) => void;
  setStepFieldsOrder: (stepId: string, fields: FlowField[]) => void;
  fieldInputStyle: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  const dragControls = useDragControls();
  const summary = getStepSummary(step, isChecklistFlow);
  const isLast = stepIdx === totalSteps - 1;
  const stepIconBg =
    isChecklistFlow && step.iconBg ? step.iconBg : C.accentLight;
  const stepIconColor =
    isChecklistFlow && step.iconColor ? step.iconColor : C.accent;
  const StepIcon =
    isChecklistFlow && step.icon
      ? CHECKLIST_STEP_ICON_MAP[step.icon]
      : Layers;

  return (
    <Reorder.Item
      as="div"
      value={step}
      dragListener={false}
      dragControls={dragControls}
      className="relative flex gap-3"
      style={{ listStyle: "none" }}
      layout="position"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex w-6 flex-shrink-0 flex-col items-center">
        <div
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold leading-none"
          style={{
            backgroundColor: C.accentLight,
            color: C.accent,
            border: `2px solid ${C.accent}`,
          }}
        >
          {stepIdx + 1}
        </div>
        {!isLast && (
          <div
            className="mt-1 w-px flex-1 min-h-[12px]"
            style={{ backgroundColor: C.border }}
          />
        )}
      </div>
      <div className="mb-3 min-w-0 flex-1">
        <div
          className="overflow-hidden rounded-sm"
          style={{
            backgroundColor: C.surface,
            border: `1px solid ${isExpanded ? C.accent : C.border}`,
            boxShadow: isExpanded ? `0 0 0 2px ${C.accentLight}` : C.shadowCard,
          }}
        >
          <div className="flex w-full items-center gap-2 px-3 py-2.5">
            <button
              type="button"
              onClick={onToggleExpand}
              className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none"
            >
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm"
                style={{ backgroundColor: stepIconBg, color: stepIconColor }}
              >
                <StepIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <div
                    className="text-[11px] font-semibold"
                    style={{ color: C.textPrimary }}
                  >
                    {step.title}
                  </div>
                  {step.optional && (
                    <span
                      className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                      style={{
                        backgroundColor: C.surface,
                        color: C.textTertiary,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      Optional
                    </span>
                  )}
                </div>
                {!isExpanded && (
                  <div
                    className="mt-0.5 truncate text-[10px]"
                    style={{ color: C.textTertiary }}
                  >
                    {summary}
                  </div>
                )}
              </div>
            </button>
            <div className="flex flex-shrink-0 items-center gap-0.5">
              <button
                type="button"
                aria-label="Drag to reorder step"
                title="Drag to reorder"
                className="touch-none cursor-grab rounded p-1 outline-none active:cursor-grabbing"
                style={{ color: C.textQuaternary }}
                onPointerDown={(e) => dragControls.start(e)}
              >
                <GripVertical className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
              {hovered && (
                <button
                  type="button"
                  aria-label="Remove step"
                  title="Remove step"
                  onClick={() => deleteStep(step.id)}
                  className="flex h-5 w-5 items-center justify-center rounded-full"
                  style={{ backgroundColor: C.errorBg, color: C.error }}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              <button
                type="button"
                aria-label={isExpanded ? "Collapse step" : "Expand step"}
                onClick={onToggleExpand}
                className="rounded p-1 outline-none"
                style={{ color: C.textTertiary }}
              >
                <ChevronDown
                  className="h-4 w-4 transition-transform duration-150"
                  style={{
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
            </div>
          </div>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div
                  className="space-y-4 px-3 pb-3 pt-2"
                  style={{
                    borderTop: `1px solid ${C.border}`,
                    backgroundColor: C.surface,
                  }}
                >
                  <PostSubmitLabeledField
                    label={isChecklistFlow ? "Checklist item title" : "Page title families see"}
                  >
                    <input
                      value={step.title}
                      onChange={(e) => updateStepTitle(step.id, e.target.value)}
                      placeholder={isChecklistFlow ? "e.g. Photo Release Form" : "e.g. Parent Info"}
                      style={fieldInputStyle}
                    />
                  </PostSubmitLabeledField>

                  <div>
                    {isChecklistFlow ? (
                      <p
                        className="mb-2 text-[11px] leading-relaxed"
                        style={{ color: C.textTertiary }}
                      >
                        Families complete this item inline on the enrollment page.
                      </p>
                    ) : (
                      <p
                        className="mb-2 text-[11px] font-semibold"
                        style={{ color: C.textSecondary }}
                      >
                        Questions on this page
                      </p>
                    )}
                    {!isChecklistFlow && step.fields.length === 0 ? (
                      <div
                        className="rounded-md px-3 py-4 text-center text-[11px] leading-relaxed"
                        style={{
                          border: `1px dashed ${C.borderStrong}`,
                          color: C.textTertiary,
                          backgroundColor: C.surface,
                        }}
                      >
                        Add questions below or pick from suggestions.
                      </div>
                    ) : step.fields.length > 0 ? (
                      <Reorder.Group
                        axis="y"
                        values={step.fields}
                        onReorder={(next) => setStepFieldsOrder(step.id, next)}
                        as="div"
                        className="flex flex-col gap-2"
                      >
                        {step.fields.map((field) => (
                          <EnrollmentFlowEditReorderField
                            key={field.id}
                            stepId={step.id}
                            field={field}
                            updateField={updateField}
                            deleteField={deleteField}
                          />
                        ))}
                      </Reorder.Group>
                    ) : null}
                    {!isChecklistFlow && (
                    <button
                      type="button"
                      onClick={() => addField(step.id)}
                      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-all"
                      style={{
                        border: `1px dashed ${C.borderStrong}`,
                        color: C.accent,
                        backgroundColor: C.surface,
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add custom question
                    </button>
                    )}
                  </div>

                  {!isChecklistFlow && (
                  <div>
                    <p
                      className="mb-1 text-[11px] font-semibold"
                      style={{ color: C.textSecondary }}
                    >
                      Suggested questions
                    </p>
                    <p
                      className="mb-2 text-[10px] leading-snug"
                      style={{ color: C.textTertiary }}
                    >
                      Tap to add common enrollment questions — you can edit wording after adding.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {FLOW_FIELD_LIBRARY.map((tpl, tplIdx) => (
                        <button
                          key={`${tpl.label}-${tplIdx}`}
                          type="button"
                          title={tpl.label}
                          className="max-w-full rounded px-2.5 py-1.5 text-left text-[10px] font-medium leading-tight transition-colors"
                          style={{
                            backgroundColor: C.surface,
                            color: C.textSecondary,
                            border: `1px solid ${C.border}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = C.accent;
                            e.currentTarget.style.color = C.accent;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = C.border;
                            e.currentTarget.style.color = C.textSecondary;
                          }}
                          onClick={() => addPresetField(step.id, tpl)}
                        >
                          + {tpl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  )}

                  {!isChecklistFlow && (
                  <button
                    type="button"
                    onClick={() => setPreviewStep(step)}
                    className="flex items-center gap-1.5 text-[11px] font-medium transition-colors"
                    style={{ color: C.info }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview this page
                  </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Reorder.Item>
  );
}

function EnrollmentPostSubmitReorderItem({
  action,
  actionIdx,
  totalActions,
  meta,
  isExpanded,
  onToggleExpand,
  updateAction,
  deleteAction,
  postSubmitInputStyle,
}: {
  action: FlowAction;
  actionIdx: number;
  totalActions: number;
  meta: PostSubmitActionMeta;
  isExpanded: boolean;
  onToggleExpand: () => void;
  updateAction: (actionId: string, patch: Partial<FlowAction>) => void;
  deleteAction: (actionId: string) => void;
  postSubmitInputStyle: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  const dragControls = useDragControls();
  const summary = getPostSubmitActionSummary(action);
  const Icon = meta.Icon;
  const isLast = actionIdx === totalActions - 1;

  return (
    <Reorder.Item
      as="div"
      value={action}
      dragListener={false}
      dragControls={dragControls}
      className="relative flex gap-3"
      style={{ listStyle: "none" }}
      layout="position"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex w-6 flex-shrink-0 flex-col items-center">
        <div
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold leading-none"
          style={{
            backgroundColor: C.accentLight,
            color: C.accent,
            border: `2px solid ${C.accent}`,
          }}
        >
          {actionIdx + 1}
        </div>
        {!isLast && (
          <div
            className="mt-1 w-px flex-1 min-h-[12px]"
            style={{ backgroundColor: C.border }}
          />
        )}
      </div>

      <div className="mb-3 min-w-0 flex-1">
        <div
          className="overflow-hidden rounded-sm"
          style={{
            backgroundColor: C.surface,
            border: `1px solid ${isExpanded ? C.accent : C.border}`,
            boxShadow: isExpanded ? `0 0 0 2px ${C.accentLight}` : C.shadowCard,
          }}
        >
          <div className="flex w-full items-center gap-2 px-3 py-2.5">
            <button
              type="button"
              onClick={onToggleExpand}
              className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none"
            >
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm"
                style={{ backgroundColor: meta.bgColor, color: meta.color }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className="text-[11px] font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  {meta.label}
                </div>
                {!isExpanded && (
                  <div
                    className="mt-0.5 truncate text-[10px]"
                    style={{ color: C.textTertiary }}
                  >
                    {summary}
                  </div>
                )}
              </div>
            </button>
            <div className="flex flex-shrink-0 items-center gap-0.5">
              <button
                type="button"
                aria-label="Drag to reorder action"
                title="Drag to reorder"
                className="touch-none cursor-grab rounded p-1 outline-none active:cursor-grabbing"
                style={{ color: C.textQuaternary }}
                onPointerDown={(e) => dragControls.start(e)}
              >
                <GripVertical className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
              {hovered && (
                <button
                  type="button"
                  aria-label="Remove action"
                  title="Remove action"
                  onClick={() => deleteAction(action.id)}
                  className="flex h-5 w-5 items-center justify-center rounded-full"
                  style={{ backgroundColor: C.errorBg, color: C.error }}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              <button
                type="button"
                aria-label={isExpanded ? "Collapse action" : "Expand action"}
                onClick={onToggleExpand}
                className="rounded p-1 outline-none"
                style={{ color: C.textTertiary }}
              >
                <ChevronDown
                  className="h-4 w-4 transition-transform duration-150"
                  style={{
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div
                  className="space-y-3 px-3 pb-3 pt-2"
                  style={{
                    borderTop: `1px solid ${C.border}`,
                    backgroundColor: C.surface,
                  }}
                >
                  {action.type === "email" && (
                    <>
                      <PostSubmitLabeledField label="To">
                        <input
                          value={action.config.to ?? ""}
                          onChange={(e) =>
                            updateAction(action.id, {
                              config: { ...action.config, to: e.target.value },
                            })
                          }
                          placeholder="e.g. {{parent_email}}"
                          style={postSubmitInputStyle}
                        />
                      </PostSubmitLabeledField>
                      <PostSubmitLabeledField label="Subject">
                        <input
                          value={action.config.subject ?? ""}
                          onChange={(e) =>
                            updateAction(action.id, {
                              config: { ...action.config, subject: e.target.value },
                            })
                          }
                          placeholder="Application received"
                          style={postSubmitInputStyle}
                        />
                      </PostSubmitLabeledField>
                      <PostSubmitLabeledField label="Message">
                        <textarea
                          value={action.config.body ?? ""}
                          onChange={(e) =>
                            updateAction(action.id, {
                              config: { ...action.config, body: e.target.value },
                            })
                          }
                          placeholder="Thank you for applying…"
                          rows={3}
                          style={{ ...postSubmitInputStyle, resize: "vertical" }}
                        />
                      </PostSubmitLabeledField>
                    </>
                  )}
                  {action.type === "sms" && (
                    <PostSubmitLabeledField label="Message">
                      <textarea
                        value={action.config.message ?? ""}
                        onChange={(e) =>
                          updateAction(action.id, {
                            config: { ...action.config, message: e.target.value },
                          })
                        }
                        placeholder="Hi! Thanks for your application…"
                        rows={3}
                        style={{ ...postSubmitInputStyle, resize: "vertical" }}
                      />
                    </PostSubmitLabeledField>
                  )}
                  {action.type === "redirect" && (
                    <PostSubmitLabeledField label="Redirect URL">
                      <input
                        value={action.config.url ?? ""}
                        onChange={(e) =>
                          updateAction(action.id, {
                            config: { ...action.config, url: e.target.value },
                          })
                        }
                        placeholder="https://yourschool.com/thank-you"
                        style={postSubmitInputStyle}
                      />
                      <p
                        className="mt-1 text-[10px] leading-snug"
                        style={{ color: C.textTertiary }}
                      >
                        Families will be sent to this page after submitting the form.
                      </p>
                    </PostSubmitLabeledField>
                  )}
                  {action.type === "tag" && (
                    <PostSubmitLabeledField label="Tag name">
                      <input
                        value={action.config.tag ?? ""}
                        onChange={(e) =>
                          updateAction(action.id, {
                            config: { ...action.config, tag: e.target.value },
                          })
                        }
                        placeholder="e.g. Waitlist 2026"
                        style={postSubmitInputStyle}
                      />
                    </PostSubmitLabeledField>
                  )}
                  {action.type === "notify_admin" && (
                    <div
                      className="flex items-start gap-2.5 rounded-sm px-3 py-2.5"
                      style={{
                        backgroundColor: C.surface,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <Bell
                        className="mt-0.5 h-4 w-4 flex-shrink-0"
                        style={{ color: C.accent }}
                      />
                      <div>
                        <p
                          className="text-[11px] font-medium"
                          style={{ color: C.textPrimary }}
                        >
                          Admin notification
                        </p>
                        <p
                          className="mt-0.5 text-[10px] leading-snug"
                          style={{ color: C.textTertiary }}
                        >
                          {meta.description}. No extra configuration needed.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Reorder.Item>
  );
}

function EnrollmentFlowsTab({
  initialSelectedFlowId,
}: {
  initialSelectedFlowId?: string;
}) {
  const [flows, setFlows] = useState<EnrollmentFlow[]>(INITIAL_DEMO_FLOWS);
  const [selectedFlowId, setSelectedFlowId] = useState<string>(
    initialSelectedFlowId ?? "flow-1",
  );
  const [expandedStepId, setExpandedStepId] = useState<string | null>("s1");
  const [savedPulse, setSavedPulse] = useState(false);
  const [previewStep, setPreviewStep] = useState<FlowStep | null>(null);
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null);
  const [showAddActionPicker, setShowAddActionPicker] = useState(false);

  useEffect(() => {
    setExpandedStepId(null);
    setExpandedActionId(null);
    setShowAddActionPicker(false);
  }, [selectedFlowId]);

  const ACTION_META = getActionMeta();

  const selectedFlow = flows.find((f) => f.id === selectedFlowId) ?? null;
  const isChecklistFlow = selectedFlow?.kind === "checklist";

  useEffect(() => {
    if (
      expandedStepId &&
      selectedFlow &&
      !selectedFlow.steps.some((s) => s.id === expandedStepId)
    ) {
      setExpandedStepId(null);
    }
  }, [selectedFlow, expandedStepId]);

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
    setExpandedStepId(null);
  };

  const addStep = () => {
    const id = newId();
    updateFlow((f) => ({
      ...f,
      steps: [...f.steps, { id, title: `Step ${f.steps.length + 1}`, fields: [] }],
    }));
    setExpandedStepId(id);
  };

  const deleteStep = (stepId: string) => {
    updateFlow((f) => ({ ...f, steps: f.steps.filter((s) => s.id !== stepId) }));
    setExpandedStepId((prev) => (prev === stepId ? null : prev));
  };

  const setStepsOrder = (steps: FlowStep[]) => {
    updateFlow((f) => ({ ...f, steps }));
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
          ? { ...s, fields: [...s.fields, { id, label: "New question", type: "text", required: false }] }
          : s
      ),
    }));
  };

  const addPresetField = (stepId: string, template: FlowFieldTemplate) => {
    const field: FlowField = {
      id: newId(),
      label: template.label,
      type: template.type,
      required: template.required,
      options: template.options ? [...template.options] : undefined,
    };
    updateFlow((f) => ({
      ...f,
      steps: f.steps.map((s) =>
        s.id === stepId ? { ...s, fields: [...s.fields, field] } : s
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

  const setStepFieldsOrder = (stepId: string, fields: FlowField[]) => {
    updateFlow((f) => ({
      ...f,
      steps: f.steps.map((s) => (s.id === stepId ? { ...s, fields } : s)),
    }));
  };

  const addAction = (type: FlowActionType) => {
    const id = newId();
    updateFlow((f) => ({
      ...f,
      actions: [...f.actions, { id, type, config: {} }],
    }));
    setExpandedActionId(id);
    setShowAddActionPicker(false);
  };

  const updateAction = (actionId: string, patch: Partial<FlowAction>) => {
    updateFlow((f) => ({
      ...f,
      actions: f.actions.map((a) => (a.id === actionId ? { ...a, ...patch } : a)),
    }));
  };

  const deleteAction = (actionId: string) => {
    updateFlow((f) => ({ ...f, actions: f.actions.filter((a) => a.id !== actionId) }));
    setExpandedActionId((prev) => (prev === actionId ? null : prev));
  };

  const setActionsOrder = (actions: FlowAction[]) => {
    updateFlow((f) => ({ ...f, actions }));
  };

  const saveFlow = () => {
    updateFlow((f) => ({ ...f, updatedAt: "Just now" }));
    setSavedPulse(true);
    setTimeout(() => setSavedPulse(false), 1500);
  };

  const inputStyle = demoInputStyle({
    borderRadius: C.r.md,
    fontSize: "12px",
    padding: "4px 8px",
    width: "100%",
  });

  const fieldInputStyle = demoInputStyle({
    borderRadius: "5px",
    fontSize: "12px",
    padding: "6px 10px",
    width: "100%",
    boxSizing: "border-box",
  });

  const postSubmitInputStyle = demoInputStyle({
    borderRadius: "5px",
    fontSize: "12px",
    padding: "6px 10px",
    width: "100%",
    boxSizing: "border-box",
  });

  return (
    <div className="flex h-full" style={{ overflow: "hidden", backgroundColor: C.bg }}>
      {/* Left panel — flow list */}
      <div
        className="flex flex-col flex-shrink-0 overflow-hidden"
        style={{
          width: 220,
          borderRight: `1px solid ${C.border}`,
          backgroundColor: C.bg,
        }}
      >
        <div
          className="flex h-14 flex-shrink-0 items-center justify-between px-3"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            Flow templates
          </span>
          <button
            onClick={addFlow}
            className="flex items-center gap-1 rounded-sm px-3 py-1.5 text-xs font-semibold transition-all"
            style={{ backgroundColor: C.accentLight, color: C.accent }}
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {flows.map((flow) => {
            const isActive = flow.id === selectedFlowId;
            return (
              <button
                key={flow.id}
                onClick={() => { setSelectedFlowId(flow.id); setExpandedStepId(null); }}
                className="w-full text-left px-3 py-3 transition-all"
                style={{
                  backgroundColor: isActive ? C.accentLight : "transparent",
                  borderBottom: `1px solid ${C.border}`,
                  borderLeft: isActive ? `2px solid ${C.accent}` : "2px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = C.elevated;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isActive ? C.accentLight : "transparent";
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
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{ backgroundColor: C.surface }}
        >
          {/* Scrollable editor body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

            {/* Form Steps / Checklist Items — vertical timeline */}
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Layers className="h-4 w-4" style={{ color: C.accent }} />
                <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  {isChecklistFlow ? "Checklist Items" : "Form Steps"}
                </span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                  style={{ backgroundColor: C.accentLight, color: C.accent }}
                >
                  {selectedFlow.steps.length}
                </span>
              </div>
              <p className="mb-4 text-[11px] leading-snug" style={{ color: C.textTertiary }}>
                {isChecklistFlow
                  ? "Families complete this checklist on a single enrollment page. Each step is an item they open and finish from the list."
                  : "Families complete these pages in order. Each step is one screen of questions."}
              </p>

              {selectedFlow.steps.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center rounded-sm py-10"
                  style={{ border: `2px dashed ${C.border}`, color: C.textTertiary }}
                >
                  <Layers className="mb-2 h-6 w-6 opacity-40" />
                  <p className="mb-3 text-[11px]">
                    {isChecklistFlow ? "No checklist items yet." : "No form pages yet."}
                  </p>
                  <button
                    type="button"
                    onClick={addStep}
                    className="flex items-center gap-1 rounded-sm px-3 py-1.5 text-[11px] font-medium"
                    style={{
                      backgroundColor: C.accentLight,
                      color: C.accent,
                      border: `1px solid ${C.accent}`,
                    }}
                  >
                    <Plus className="h-3 w-3" />
                    {isChecklistFlow ? "Add your first item" : "Add your first page"}
                  </button>
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={selectedFlow.steps}
                  onReorder={setStepsOrder}
                  className="flex flex-col"
                  as="div"
                >
                  {selectedFlow.steps.map((step, stepIdx) => (
                    <EnrollmentFlowStepReorderItem
                      key={step.id}
                      step={step}
                      stepIdx={stepIdx}
                      totalSteps={selectedFlow.steps.length}
                      isExpanded={expandedStepId === step.id}
                      isChecklistFlow={isChecklistFlow}
                      onToggleExpand={() =>
                        setExpandedStepId((prev) =>
                          prev === step.id ? null : step.id
                        )
                      }
                      setPreviewStep={setPreviewStep}
                      updateStepTitle={updateStepTitle}
                      deleteStep={deleteStep}
                      addField={addField}
                      addPresetField={addPresetField}
                      updateField={updateField}
                      deleteField={deleteField}
                      setStepFieldsOrder={setStepFieldsOrder}
                      fieldInputStyle={fieldInputStyle}
                    />
                  ))}
                </Reorder.Group>
              )}

              {selectedFlow.steps.length > 0 && (
                <button
                  type="button"
                  onClick={addStep}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-sm px-3 py-2.5 text-[11px] font-medium transition-all"
                  style={{
                    border: `2px dashed ${C.borderStrong}`,
                    color: C.textTertiary,
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = C.surface;
                    e.currentTarget.style.borderColor = C.accent;
                    e.currentTarget.style.color = C.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = C.borderStrong;
                    e.currentTarget.style.color = C.textTertiary;
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add step
                </button>
              )}
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
                    className="rounded-md overflow-hidden flex flex-col"
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
                          className="w-8 h-8 rounded-sm flex items-center justify-center text-white text-xs font-bold"
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
                                className="w-full px-3 py-2.5 rounded-sm text-sm"
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
                                className="w-full px-3 py-2.5 rounded-sm text-sm"
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
                        className="mt-8 w-full py-3 rounded-sm text-sm font-semibold text-white transition-all"
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
              <div className="mb-1 flex items-center gap-2">
                <Zap className="h-4 w-4" style={{ color: C.warning }} />
                <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  Post-Submit Actions
                </span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                  style={{ backgroundColor: C.warningBg, color: C.warning }}
                >
                  {selectedFlow.actions.length}
                </span>
              </div>
              <p className="mb-4 text-[11px] leading-snug" style={{ color: C.textTertiary }}>
                These run automatically in order when a family submits the form.
              </p>

              {selectedFlow.actions.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center rounded-sm py-10"
                  style={{ border: `2px dashed ${C.border}`, color: C.textTertiary }}
                >
                  <Zap className="mb-2 h-6 w-6 opacity-40" />
                  <p className="mb-3 text-[11px]">No post-submit actions yet.</p>
                  <button
                    type="button"
                    onClick={() => setShowAddActionPicker(true)}
                    className="flex items-center gap-1 rounded-sm px-3 py-1.5 text-[11px] font-medium"
                    style={{
                      backgroundColor: C.accentLight,
                      color: C.accent,
                      border: `1px solid ${C.accent}`,
                    }}
                  >
                    <Plus className="h-3 w-3" />
                    Add first action
                  </button>
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={selectedFlow.actions}
                  onReorder={setActionsOrder}
                  className="flex flex-col"
                  as="div"
                >
                  {selectedFlow.actions.map((action, actionIdx) => {
                    const meta = ACTION_META[action.type];
                    return (
                      <EnrollmentPostSubmitReorderItem
                        key={action.id}
                        action={action}
                        actionIdx={actionIdx}
                        totalActions={selectedFlow.actions.length}
                        meta={meta}
                        isExpanded={expandedActionId === action.id}
                        onToggleExpand={() =>
                          setExpandedActionId((prev) =>
                            prev === action.id ? null : action.id
                          )
                        }
                        updateAction={updateAction}
                        deleteAction={deleteAction}
                        postSubmitInputStyle={postSubmitInputStyle}
                      />
                    );
                  })}
                </Reorder.Group>
              )}

              <AnimatePresence initial={false}>
                {showAddActionPicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`overflow-hidden ${selectedFlow.actions.length > 0 ? "mt-2" : "mt-0"}`}
                  >
                    <div
                      className="grid grid-cols-2 gap-1.5 rounded-sm p-2 sm:grid-cols-3"
                      style={{
                        backgroundColor: C.surface,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      {FLOW_ACTION_TYPES.map((type) => {
                        const meta = ACTION_META[type];
                        const TypeIcon = meta.Icon;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => addAction(type)}
                            className="flex flex-col items-center gap-1.5 rounded-sm px-2 py-2.5 text-center transition-all"
                            style={{
                              backgroundColor: C.surface,
                              border: `1px solid ${C.border}`,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = meta.color;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = C.border;
                            }}
                          >
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-sm"
                              style={{ backgroundColor: meta.bgColor, color: meta.color }}
                            >
                              <TypeIcon className="h-4 w-4" />
                            </div>
                            <span
                              className="text-[10px] font-semibold leading-tight"
                              style={{ color: C.textPrimary }}
                            >
                              {meta.label}
                            </span>
                            <span
                              className="text-[9px] leading-snug"
                              style={{ color: C.textTertiary }}
                            >
                              {meta.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {selectedFlow.actions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddActionPicker((v) => !v)}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold transition-all"
                  style={{
                    border: `1px dashed ${showAddActionPicker ? C.accent : C.borderStrong}`,
                    color: showAddActionPicker ? C.accent : C.textSecondary,
                    backgroundColor: showAddActionPicker ? C.accentLight : "transparent",
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {showAddActionPicker ? "Cancel" : "Add action"}
                </button>
              )}
            </div>
          </div>

          {/* Editor footer */}
          <div
            className="flex h-14 flex-shrink-0 items-center justify-between px-5"
            style={{
              borderTop: `1px solid ${C.border}`,
              backgroundColor: C.surface,
            }}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <input
                value={selectedFlow.name}
                onChange={(e) => updateFlow((f) => ({ ...f, name: e.target.value }))}
                className="min-w-0 flex-1 border-none bg-transparent text-sm font-semibold outline-none"
                style={{ color: C.textPrimary }}
              />
            </div>
            <button
              onClick={saveFlow}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold transition-all"
              style={{
                backgroundColor: savedPulse ? C.success : C.accent,
                color: "#fff",
              }}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {savedPulse ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      ) : (
        <div
          className="flex-1 flex items-center justify-center"
          style={{ backgroundColor: C.surface, color: C.textTertiary }}
        >
          <p className="text-sm">Select a flow to edit</p>
        </div>
      )}
    </div>
  );
}

type AdmissionsTab = "flows" | "submissions";

function AdmissionsPage({
  activeTab,
  initialLeadId,
  initialSelectedFlowId,
  animateNewSubmission,
  autoSendEnrollmentLink,
}: {
  activeTab: AdmissionsTab;
  initialLeadId?: string;
  initialSelectedFlowId?: string;
  animateNewSubmission?: boolean;
  autoSendEnrollmentLink?: boolean;
}) {
  const [selectedLead, setSelectedLead] = useState<DemoLead | null>(() =>
    initialLeadId ? DEMO_LEADS.find((l) => l.id === initialLeadId) ?? null : null,
  );
  const { openBackdrop, closeBackdrop } = useContext(BackdropContext);

  useEffect(() => {
    if (activeTab !== "submissions") {
      setSelectedLead(null);
      closeBackdrop();
      return;
    }
    if (selectedLead) openBackdrop(() => setSelectedLead(null));
    else closeBackdrop();
  }, [activeTab, selectedLead, openBackdrop, closeBackdrop]);

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {activeTab === "flows" && (
          <motion.div key="flows" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="h-full">
            <EnrollmentFlowsTab initialSelectedFlowId={initialSelectedFlowId} />
          </motion.div>
        )}
        {activeTab === "submissions" && (
          <motion.div key="submissions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="h-full">
            <LeadsListTab
              onSelectLead={setSelectedLead}
              animateNewSubmission={animateNewSubmission}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeTab === "submissions" && selectedLead && (
          <LeadDetailPanel
            key={selectedLead.id}
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            autoSendEnrollmentLink={autoSendEnrollmentLink}
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

type FormType = "enrollment" | "health" | "media" | "financial" | "permission";

type PaperworkForm = {
  id: string;
  title: string;
  child: string;
  status: "signed" | "awaiting" | "pending";
  date: string | null;
  formType: FormType;
};

const FORM_TYPE_COLORS: Record<FormType, string> = {
  enrollment: "#5E7C68",
  health:     "#EF4444",
  media:      "#8B5CF6",
  financial:  "#F59E0B",
  permission: "#38BDF8",
};

const FORM_TYPE_LABELS: Record<FormType, string> = {
  enrollment: "Enrollment",
  health: "Health",
  media: "Media",
  financial: "Financial",
  permission: "Permission",
};

function PaperworkFormCard({ form }: { form: PaperworkForm }) {
  const color = FORM_TYPE_COLORS[form.formType];
  const statusColor =
    form.status === "signed" ? C.success : form.status === "awaiting" ? C.warning : C.textTertiary;
  const statusLabel =
    form.status === "signed"
      ? form.date
        ? `Signed ${form.date}`
        : "Signed"
      : form.status === "awaiting"
        ? "Awaiting signature"
        : "Not yet sent";

  return (
    <div
      className="flex flex-col rounded-sm p-3 min-h-[148px]"
      style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color }}>
          {FORM_TYPE_LABELS[form.formType]}
        </span>
        {form.status === "signed" ? (
          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.success }} />
        ) : form.status === "awaiting" ? (
          <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.warning }} />
        ) : (
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.textTertiary }} />
        )}
      </div>
      <p className="text-[11px] font-semibold leading-snug mb-2" style={{ color: C.textPrimary }}>
        {form.title}
      </p>
      <div
        className="flex-1 rounded-sm p-2 mb-2 space-y-1.5"
        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
      >
        <div className="h-1 rounded-full" style={{ width: "88%", backgroundColor: C.border }} />
        <div className="h-1 rounded-full" style={{ width: "72%", backgroundColor: C.border }} />
        <div className="h-1 rounded-full" style={{ width: "58%", backgroundColor: C.border }} />
        <div className="pt-1 flex items-end justify-between gap-2">
          <div className="h-px flex-1 border-b border-dashed" style={{ borderColor: color + "99" }} />
          <span className="text-[8px] font-medium flex-shrink-0" style={{ color: C.textTertiary }}>
            Signature
          </span>
        </div>
      </div>
      <p className="text-[9px] font-medium mb-2" style={{ color: statusColor }}>
        {statusLabel}
      </p>
      <div className="flex items-center gap-1.5 mt-auto flex-wrap">
        {form.status === "signed" ? (
          <>
            <button
              type="button"
              className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-medium"
              style={{ color: C.textSecondary, border: `1px solid ${C.border}` }}
            >
              <Eye className="w-2.5 h-2.5" /> View
            </button>
            <button
              type="button"
              className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-medium"
              style={{ color: C.textSecondary, border: `1px solid ${C.border}` }}
            >
              <Download className="w-2.5 h-2.5" /> Save
            </button>
          </>
        ) : (
          <button
            type="button"
            className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-semibold"
            style={{ color, border: `1px solid ${color}44` }}
          >
            <Send className="w-2.5 h-2.5" />
            {form.status === "awaiting" ? "Resend" : "Send"}
          </button>
        )}
      </div>
    </div>
  );
}

function getFamilyPaperwork(parent: DemoParent): PaperworkForm[] {
  const results: PaperworkForm[] = [];
  for (const child of parent.children) {
    const app = parent.applications.find((a) => a.childName === child.name);
    const done = app?.status === "enrolled" || app?.status === "enrolling";
    const partial = app?.status === "in_review";
    const submitted = app?.submitted ?? null;
    results.push(
      { id: `${child.name}-enr`, title: "Enrollment Agreement",         child: child.name, formType: "enrollment",  status: done ? "signed" : partial ? "awaiting" : "pending", date: done ? submitted : null },
      { id: `${child.name}-hei`, title: "Health & Emergency Info",       child: child.name, formType: "health",      status: done || partial ? "signed" : "pending",            date: done ? submitted : null },
      { id: `${child.name}-med`, title: "Media Release & Photo Consent", child: child.name, formType: "media",       status: done ? "signed" : "pending",                       date: done ? submitted : null },
      { id: `${child.name}-tur`, title: "Tuition Authorization",         child: child.name, formType: "financial",   status: done ? "signed" : partial ? "awaiting" : "pending", date: done ? submitted : null },
      { id: `${child.name}-ftp`, title: "Field Trip Permission",         child: child.name, formType: "permission",  status: done ? "signed" : "pending",                       date: done ? "Jan 8, 2026" : null },
    );
  }
  return results;
}

type TemplateEntry = {
  id: string;
  title: string;
  school: string;
  category: FormType;
  rating: number;
  uses: number;
};

const TEMPLATE_STORE: TemplateEntry[] = [
  { id: "t1",  title: "Enrollment Agreement 2025–26",          school: "Acorn Microschool",       category: "enrollment",  rating: 4.9, uses: 87 },
  { id: "t2",  title: "Re-Enrollment Intent Form",             school: "Cedar Path School",        category: "enrollment",  rating: 4.7, uses: 62 },
  { id: "t3",  title: "Waitlist Application",                  school: "Wildwood Learning Co.",    category: "enrollment",  rating: 4.6, uses: 41 },
  { id: "t4",  title: "Health & Wellness Intake Form",         school: "Little Sprouts Academy",   category: "health",      rating: 4.8, uses: 73 },
  { id: "t5",  title: "Allergy & Dietary Needs Form",          school: "Meadow Path School",       category: "health",      rating: 4.9, uses: 55 },
  { id: "t6",  title: "Medication Authorization Form",         school: "Fern Valley Micro",        category: "health",      rating: 4.5, uses: 38 },
  { id: "t7",  title: "Field Trip Blanket Permission",         school: "Little Sprouts Academy",   category: "permission",  rating: 4.8, uses: 94 },
  { id: "t8",  title: "Photo & Media Release Consent",         school: "Stonegate Learning",       category: "media",       rating: 4.7, uses: 68 },
  { id: "t9",  title: "Annual Transportation Consent",         school: "Acorn Microschool",        category: "permission",  rating: 4.6, uses: 29 },
  { id: "t10", title: "Tuition Payment Plan Agreement",        school: "Cedar Path School",        category: "financial",   rating: 4.8, uses: 51 },
  { id: "t11", title: "Enrollment Deposit Authorization",      school: "Wildwood Learning Co.",    category: "financial",   rating: 4.7, uses: 44 },
  { id: "t12", title: "Parent Handbook Acknowledgment",        school: "Fern Valley Micro",        category: "enrollment",  rating: 4.9, uses: 112 },
];

function FormDocPreview({ formType, size = "md" }: { formType: FormType; size?: "sm" | "md" }) {
  const color = FORM_TYPE_COLORS[formType];
  const h = size === "sm" ? 64 : 88;
  const w = size === "sm" ? 52 : 72;
  const lineY = size === "sm" ? [22, 30, 38, 46, 53] : [30, 40, 50, 60, 70];
  const lineWidths = [
    [0.75, 0.55, 0.85, 0.45, 0.65],
    [0.8,  0.6,  0.7,  0.5,  0.75],
    [0.6,  0.85, 0.5,  0.7,  0.55],
    [0.7,  0.5,  0.8,  0.6,  0.45],
    [0.85, 0.65, 0.55, 0.75, 0.6 ],
  ];
  const typeIdx = ["enrollment","health","media","financial","permission"].indexOf(formType);
  const widths = lineWidths[typeIdx] ?? lineWidths[0];
  const headerH = size === "sm" ? 14 : 18;
  const cx = C;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* paper background */}
      <rect width={w} height={h} rx="3" fill={cx.elevated} />
      {/* colored header band */}
      <rect width={w} height={headerH} rx="3" fill={color + "CC"} />
      <rect y={headerH - 3} width={w} height={3} fill={color + "CC"} />
      {/* small logo dot in header */}
      <circle cx={size === "sm" ? 8 : 10} cy={headerH / 2} r={size === "sm" ? 3 : 4} fill="white" fillOpacity="0.7" />
      {/* text lines */}
      {lineY.map((y, i) => (
        <rect
          key={i}
          x={size === "sm" ? 5 : 7}
          y={y}
          width={(w - (size === "sm" ? 10 : 14)) * widths[i]}
          height={size === "sm" ? 2.5 : 3}
          rx="1"
          fill={cx.border}
        />
      ))}
      {/* signature line */}
      <line
        x1={size === "sm" ? 5 : 7}
        y1={h - (size === "sm" ? 7 : 9)}
        x2={w * 0.55}
        y2={h - (size === "sm" ? 7 : 9)}
        stroke={color}
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <line
        x1={w * 0.65}
        y1={h - (size === "sm" ? 7 : 9)}
        x2={w - (size === "sm" ? 5 : 7)}
        y2={h - (size === "sm" ? 7 : 9)}
        stroke={cx.border}
        strokeWidth="1"
        strokeDasharray="2 2"
      />
    </svg>
  );
}

function ParentDetailPanel({ parent }: { parent: DemoParent }) {
  const [tab, setTab] = useState<"info" | "paperwork">("info");
  const [showStore, setShowStore] = useState(false);
  const [storeCategory, setStoreCategory] = useState<FormType | "all">("all");
  const paperwork = getFamilyPaperwork(parent);
  const signedCount = paperwork.filter((f) => f.status === "signed").length;
  const pendingForms = paperwork.filter((f) => f.status !== "signed");

  const storeFiltered = storeCategory === "all"
    ? TEMPLATE_STORE
    : TEMPLATE_STORE.filter((t) => t.category === storeCategory);

  const communityPreview = TEMPLATE_STORE.slice(0, 3);

  return (
    <motion.div
      key={parent.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col h-full overflow-hidden relative"
      style={{ backgroundColor: C.surface }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: parent.color + "22", color: parent.color }}
        >
          {parent.initials}
        </div>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            {parent.name}
          </h3>
          {parent.g2Name && (
            <p className="text-[11px]" style={{ color: C.textTertiary }}>
              + {parent.g2Name}
            </p>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex items-center gap-1 px-5 pt-3 pb-0 flex-shrink-0"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        {(["info", "paperwork"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-3 pb-2.5 text-xs font-medium relative"
            style={{ color: tab === t ? C.accent : C.textTertiary }}
          >
            {t === "info" ? "Info" : "Paperwork"}
            {tab === t && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ backgroundColor: C.accent }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Info tab ── */}
        {tab === "info" && (
          <div className="p-5 space-y-5">
            {/* Guardian 1 */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.textTertiary }}>
                Guardian 1
              </p>
              <div>
                <DetailField label="Name" value={parent.name} />
                <DetailField label="Cell Phone" value={parent.g1Phone} />
                {parent.g1WorkPhone && <DetailField label="Work Phone" value={parent.g1WorkPhone} />}
                <DetailField label="Preferred Contact" value={parent.g1Preferred} />
                <DetailField label="Lives with Child" value={<YesNoChip value={parent.g1LivesWith} />} />
                <DetailField label="Has Custody" value={<YesNoChip value={parent.g1Custody} />} />
              </div>
            </div>

            {/* Guardian 2 */}
            {parent.g2Name && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.textTertiary }}>
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
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.textTertiary }}>
                Children ({parent.children.length})
              </p>
              <div className="space-y-2">
                {parent.children.map((child) => (
                  <div
                    key={child.name}
                    className="flex items-center gap-3 p-3 rounded-sm"
                    style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}` }}
                  >
                    {child.photo ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <Image src={child.photo} alt={child.name} width={32} height={32} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: parent.color + "22", color: parent.color }}
                      >
                        {child.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium" style={{ color: C.textPrimary }}>{child.name}</p>
                      <p className="text-xs" style={{ color: C.textTertiary }}>DOB: {child.dob}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Applications */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.textTertiary }}>
                Applications
              </p>
              <div className="space-y-2">
                {parent.applications.map((app, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-sm"
                    style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}` }}
                  >
                    <p className="text-xs font-semibold mb-2" style={{ color: C.textPrimary }}>{app.childName}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <ProgramBadge program={app.program} />
                      <StatusBadge status={app.status} />
                      {app.approved && (
                        <span className="text-[10px] font-semibold" style={{ color: C.success }}>✓ Approved</span>
                      )}
                    </div>
                    <p className="text-[10px] mt-2" style={{ color: C.textTertiary }}>Submitted {app.submitted}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Paperwork tab ── */}
        {tab === "paperwork" && (
          <div className="p-4 space-y-4">

            {/* Action row */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textTertiary }}>
                {signedCount} / {paperwork.length} complete
              </p>
              <div className="flex items-center gap-2">
                {pendingForms.length > 0 && (
                  <button
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-[10px] font-semibold"
                    style={{ backgroundColor: C.accentLight, color: C.accent, border: `1px solid ${C.accentDark + "44"}` }}
                  >
                    <Send className="w-3 h-3" />
                    Send Pending
                  </button>
                )}
                <button
                  onClick={() => setShowStore(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-[10px] font-semibold"
                  style={demoSecondaryButtonStyle()}
                >
                  <Plus className="w-3 h-3" />
                  New Form
                </button>
              </div>
            </div>

            {/* Form cards grid */}
            <div className="grid grid-cols-2 gap-3">
              {paperwork.map((form) => {
                const color = FORM_TYPE_COLORS[form.formType];
                return (
                  <div
                    key={form.id}
                    className="rounded-sm overflow-hidden flex flex-col"
                    style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}` }}
                  >
                    {/* Doc preview */}
                    <div
                      className="flex items-center justify-center py-3"
                      style={{ backgroundColor: C.bg }}
                    >
                      <FormDocPreview formType={form.formType} size="md" />
                    </div>

                    {/* Card body */}
                    <div className="px-2.5 pt-2 pb-2.5 flex flex-col gap-1.5 flex-1">
                      <p className="text-[10px] font-semibold leading-tight" style={{ color: C.textPrimary }}>
                        {form.title}
                      </p>
                      {parent.children.length > 1 && (
                        <p className="text-[9px]" style={{ color: C.textTertiary }}>{form.child}</p>
                      )}

                      {/* Status badge */}
                      <div className="flex items-center gap-1">
                        {form.status === "signed" ? (
                          <CheckCircle className="w-3 h-3 flex-shrink-0" style={{ color: C.success }} />
                        ) : form.status === "awaiting" ? (
                          <Clock className="w-3 h-3 flex-shrink-0" style={{ color: C.warning }} />
                        ) : (
                          <AlertCircle className="w-3 h-3 flex-shrink-0" style={{ color: C.textTertiary }} />
                        )}
                        <span
                          className="text-[9px] font-semibold"
                          style={{
                            color: form.status === "signed" ? C.success : form.status === "awaiting" ? C.warning : C.textTertiary,
                          }}
                        >
                          {form.status === "signed" ? (form.date ? `Signed ${form.date}` : "Signed") : form.status === "awaiting" ? "Awaiting signature" : "Not yet sent"}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {form.status === "signed" ? (
                          <>
                            <button
                              className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-medium"
                              style={{ backgroundColor: C.surface, color: C.textSecondary, border: `1px solid ${C.border}` }}
                            >
                              <Eye className="w-2.5 h-2.5" /> View
                            </button>
                            <button
                              className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-medium"
                              style={{ backgroundColor: C.surface, color: C.textSecondary, border: `1px solid ${C.border}` }}
                            >
                              <Download className="w-2.5 h-2.5" /> Save
                            </button>
                          </>
                        ) : form.status === "awaiting" ? (
                          <button
                            className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-semibold"
                            style={{ backgroundColor: C.warningBg, color: C.warning, border: `1px solid ${C.warningBorder}` }}
                          >
                            <Send className="w-2.5 h-2.5" /> Resend
                          </button>
                        ) : (
                          <button
                            className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-semibold"
                            style={{ backgroundColor: color + "18", color: color, border: `1px solid ${color}44` }}
                          >
                            <Send className="w-2.5 h-2.5" /> Send
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Community templates preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textTertiary }}>
                  From the Community
                </p>
                <button
                  onClick={() => setShowStore(true)}
                  className="text-[10px] font-medium flex items-center gap-0.5"
                  style={{ color: C.accent }}
                >
                  Browse all <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {communityPreview.map((tmpl) => {
                  const color = FORM_TYPE_COLORS[tmpl.category];
                  return (
                    <div
                      key={tmpl.id}
                      className="flex items-center gap-3 p-2.5 rounded-sm"
                      style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}` }}
                    >
                      <div className="flex-shrink-0">
                        <FormDocPreview formType={tmpl.category} size="sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold truncate" style={{ color: C.textPrimary }}>{tmpl.title}</p>
                        <p className="text-[9px] truncate" style={{ color: C.textTertiary }}>by {tmpl.school}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-2.5 h-2.5" style={{ color: C.warning }} />
                          <span className="text-[9px]" style={{ color: C.textTertiary }}>{tmpl.rating} · {tmpl.uses} uses</span>
                        </div>
                      </div>
                      <button
                        className="flex-shrink-0 px-2 py-1 rounded text-[9px] font-semibold"
                        style={{ backgroundColor: color + "18", color: color, border: `1px solid ${color}44` }}
                      >
                        Use
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Template store overlay ── */}
      <AnimatePresence>
        {showStore && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="absolute inset-0 flex flex-col overflow-hidden"
            style={{ backgroundColor: C.surface, zIndex: 20 }}
          >
            {/* Store header */}
            <div
              className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <button
                onClick={() => setShowStore(false)}
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: C.textSecondary }}
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>Community Templates</p>
                <p className="text-[10px]" style={{ color: C.textTertiary }}>Forms shared by other microschools</p>
              </div>
            </div>

            {/* Category filter pills */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 flex-shrink-0 overflow-x-auto" style={{ borderBottom: `1px solid ${C.border}` }}>
              {(["all", "enrollment", "health", "permission", "media", "financial"] as const).map((cat) => {
                const isActive = storeCategory === cat;
                const color = cat === "all" ? C.accent : FORM_TYPE_COLORS[cat as FormType];
                return (
                  <button
                    key={cat}
                    onClick={() => setStoreCategory(cat)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 capitalize"
                    style={{
                      ...(isActive
                        ? {
                            backgroundColor: color + "20",
                            color,
                            border: `1px solid ${color}60`,
                          }
                        : demoInactivePillStyle()),
                    }}
                  >
                    {cat === "all" ? "All" : cat === "media" ? "Media" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                );
              })}
            </div>

            {/* Template grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                {storeFiltered.map((tmpl) => {
                  const color = FORM_TYPE_COLORS[tmpl.category];
                  return (
                    <motion.div
                      key={tmpl.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-sm overflow-hidden flex flex-col"
                      style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}` }}
                    >
                      {/* Doc preview */}
                      <div
                        className="flex items-center justify-center py-3"
                        style={{ backgroundColor: C.bg }}
                      >
                        <FormDocPreview formType={tmpl.category} size="md" />
                      </div>

                      {/* Card body */}
                      <div className="px-2.5 pt-2 pb-2.5 flex flex-col gap-1 flex-1">
                        <p className="text-[10px] font-semibold leading-tight" style={{ color: C.textPrimary }}>
                          {tmpl.title}
                        </p>
                        <p className="text-[9px]" style={{ color: C.textTertiary }}>by {tmpl.school}</p>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-2.5 h-2.5" style={{ color: C.warning }} />
                          <span className="text-[9px]" style={{ color: C.textTertiary }}>
                            {tmpl.rating} · {tmpl.uses} uses
                          </span>
                        </div>

                        {/* Category badge */}
                        <span
                          className="self-start px-1.5 py-0.5 rounded-full text-[8px] font-semibold capitalize mt-0.5"
                          style={{ backgroundColor: color + "18", color: color, border: `1px solid ${color}44` }}
                        >
                          {tmpl.category}
                        </span>

                        {/* Use button */}
                        <button
                          className="mt-1.5 w-full py-1.5 rounded-sm text-[10px] font-semibold"
                          style={{ backgroundColor: color + "20", color: color, border: `1px solid ${color}50` }}
                        >
                          Use Template
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
                    className="text-left px-4 py-3 text-xs font-medium"
                    style={{ color: C.textTertiary }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ACTIVE_DEMO_PARENTS.map((p, i) => (
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
                      style={demoSecondaryButtonStyle()}
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
          <ParentDetailPanel key={selected.id} parent={selected} />
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
                      className="flex items-center justify-between px-3 py-2 rounded-sm text-xs"
                      style={{
                        backgroundColor: C.surface,
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
                        className="p-3 rounded-sm"
                        style={{
                          backgroundColor: C.surface,
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
                      className="p-3 rounded-sm"
                      style={{
                        backgroundColor: C.surface,
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
              className="rounded-sm p-4"
              style={{
                backgroundColor: C.surface,
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
                      className="text-left px-4 py-3 text-xs font-medium"
                      style={{ color: C.textTertiary }}
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {ACTIVE_DEMO_STUDENTS.map((s, i) => {
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
                        style={demoSecondaryButtonStyle()}
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
  const [selectedParent, setSelectedParent] = useState<DemoParent>(ACTIVE_DEMO_PARENTS[0]);
  const [search, setSearch] = useState("");

  const filtered = ACTIVE_DEMO_PARENTS.filter((p) =>
    search === "" ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.children.some((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-row overflow-hidden">
      {/* ── Left panel: family list ── */}
      <div
        className="w-64 flex-shrink-0 flex flex-col overflow-hidden"
        style={{ borderRight: `1px solid ${C.border}` }}
      >
        {/* List header + search */}
        <div
          className="px-4 py-3 flex-shrink-0 space-y-2"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: C.textPrimary }}>
              Families
            </span>
            <span
              className="px-1.5 py-0.5 text-[10px] font-bold rounded-full"
              style={{ backgroundColor: C.accentLight, color: C.accent }}
            >
              {ACTIVE_DEMO_PARENTS.length}
            </span>
          </div>
          <div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm"
            style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}` }}
          >
            <Search className="w-3 h-3 flex-shrink-0" style={{ color: C.textTertiary }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-xs w-full"
              style={{ color: C.textPrimary }}
            />
          </div>
        </div>

        {/* Family list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((parent, i) => {
            const isActive = selectedParent.id === parent.id;
            return (
              <motion.div
                key={parent.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="cursor-pointer px-3 py-2.5"
                style={{
                  borderBottom: `1px solid ${C.border}`,
                  borderLeft: `2px solid ${isActive ? C.accent : "transparent"}`,
                  backgroundColor: isActive ? C.accentLight : "transparent",
                }}
                onClick={() => setSelectedParent(parent)}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = C.elevated;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isActive ? C.accentLight : "transparent";
                }}
              >
                {/* Parent row */}
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ backgroundColor: parent.color + "22", color: parent.color }}
                  >
                    {parent.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: C.textPrimary }}>
                      {parent.name}
                    </p>
                    {parent.g2Name && (
                      <p className="text-[10px] truncate" style={{ color: C.textTertiary }}>
                        + {parent.g2Name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Children rows (indented) */}
                <div className="mt-1.5 space-y-1 pl-2">
                  {parent.children.map((child) => (
                    <div key={child.name} className="flex items-center gap-2 pl-3" style={{ borderLeft: `1px solid ${C.border}` }}>
                      {child.photo ? (
                        <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                          <Image src={child.photo} alt={child.name} width={20} height={20} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                          style={{ backgroundColor: parent.color + "18", color: parent.color }}
                        >
                          {child.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                      )}
                      <p className="text-[10px] truncate" style={{ color: C.textSecondary }}>
                        {child.name}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Right panel: family detail ── */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <ParentDetailPanel key={selectedParent.id} parent={selectedParent} />
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Students page (My Students tab) ──────────────────────────────────────────

type StudentProfileTab = "profile" | "health" | "pickup" | "immunizations" | "emergency" | "paperwork" | "billing" | "family";

const STUDENT_PROFILE_TABS: {
  key: StudentProfileTab;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  { key: "profile", label: "Profile", icon: <UserCircle className="w-3 h-3" />, color: "#5E7C68" },
  { key: "health", label: "Health", icon: <HeartPulse className="w-3 h-3" />, color: "#EF4444" },
  { key: "pickup", label: "Pickup", icon: <Car className="w-3 h-3" />, color: "#F59E0B" },
  { key: "immunizations", label: "Immunizations", icon: <Syringe className="w-3 h-3" />, color: "#8B5CF6" },
  { key: "emergency", label: "Emergency", icon: <PhoneCall className="w-3 h-3" />, color: "#F97316" },
  { key: "paperwork", label: "Paperwork", icon: <ClipboardList className="w-3 h-3" />, color: "#38BDF8" },
  { key: "billing", label: "Billing", icon: <CreditCard className="w-3 h-3" />, color: "#22C55E" },
  { key: "family", label: "Family", icon: <Users className="w-3 h-3" />, color: "#EC4899" },
];

function formatUsd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function StudentProfilePanel({
  student,
  onNavigateToTuition,
}: {
  student: DemoStudent;
  onNavigateToTuition?: (familyId: string) => void;
}) {
  const [tab, setTab] = useState<StudentProfileTab>("profile");
  const flags = HEALTH_FLAGS.filter((f) => student[f.key]);
  const matchedParent = ACTIVE_DEMO_PARENTS.find((p) => p.name === student.parent) ?? null;
  const studentPaperwork = matchedParent
    ? getFamilyPaperwork(matchedParent).filter((f) => f.child === student.name)
    : [];
  const paperworkSigned = studentPaperwork.filter((f) => f.status === "signed").length;
  const paperworkPending = studentPaperwork.filter((f) => f.status !== "signed");

  return (
    <motion.div
      key={student.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: C.surface }}
    >
      {/* Header */}
      <div
        className="flex items-start gap-3 px-5 py-4 flex-shrink-0"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: student.color + "22", color: student.color }}
        >
          {student.initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            {student.name}
          </h3>
          <p className="text-[11px]" style={{ color: C.textTertiary }}>
            {student.grade} · {student.classroom} · {student.teacher}
            {student.billing.kind === "homeschool_dropin" && (
              <span className="inline-flex items-center gap-0.5 ml-1.5" title="Homeschool drop-in">
                <Home className="w-3 h-3" style={{ color: C.accent }} aria-hidden />
                <span className="sr-only">Homeschool drop-in</span>
              </span>
            )}
          </p>
          {flags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap mt-1.5">
              {flags.map((f) => (
                <span
                  key={f.key}
                  className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                  style={{ backgroundColor: f.bg, color: f.color }}
                >
                  {f.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex items-center px-4 pt-2.5 pb-0 flex-shrink-0 overflow-x-auto"
        style={{ borderBottom: `1px solid ${C.border}`, gap: 0 }}
      >
        {STUDENT_PROFILE_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-shrink-0 flex items-center gap-1.5 px-2.5 pb-2.5 text-[11px] font-medium relative whitespace-nowrap"
            style={{ color: tab === t.key ? C.accent : C.textTertiary }}
          >
            <span className="flex-shrink-0" style={{ color: t.color }} aria-hidden>
              {t.icon}
            </span>
            {t.label}
            {tab === t.key && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ backgroundColor: C.accent }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Profile tab ── */}
        {tab === "profile" && (
          <div className="p-5 space-y-5">

            {/* Student Info */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.textTertiary }}>
                Student Info
              </p>
              <DetailField label="Full Name" value={student.name} />
              <DetailField label="Date of Birth" value={student.dob} />
              <DetailField label="Grade" value={student.grade} />
              <DetailField label="Classroom" value={student.classroom} />
              <DetailField label="Teacher" value={student.teacher} />
              <DetailField label="Program" value={<ProgramBadge program={student.program} />} />
              <DetailField label="Parent / Guardian" value={student.parent} />
            </div>

            {/* Learning Profile */}
            {(student.learningStyle || student.strengths || student.challenges) && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.textTertiary }}>
                  Learning Profile
                </p>
                {student.learningStyle && <DetailField label="Learning Style" value={student.learningStyle} />}
                {student.strengths && <DetailField label="Strengths" value={student.strengths} />}
                {student.challenges && <DetailField label="Challenges" value={student.challenges} />}
                {student.regulationStrategies && <DetailField label="Regulation" value={student.regulationStrategies} />}
                {student.specialInterests && <DetailField label="Interests" value={student.specialInterests} />}
              </div>
            )}

            {/* Support Aide */}
            {student.needsAide && student.aideDetails && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.textTertiary }}>
                  Support Aide
                </p>
                <p className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>
                  {student.aideDetails}
                </p>
              </div>
            )}

            {/* Activity / History Log */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.textTertiary }}>
                Activity Log
              </p>
              <div className="space-y-0">
                {student.activityLog.map((entry, i) => {
                  const variant: DemoActivityTimelineVariant =
                    entry.type === "attendance"
                      ? "attendance"
                      : entry.type === "note"
                        ? "note"
                        : "event";
                  return (
                    <DemoActivityTimelineRow
                      key={i}
                      variant={variant}
                      title={entry.title}
                      date={entry.date}
                      detail={entry.detail}
                      author={entry.author}
                      showConnectorBelow={i < student.activityLog.length - 1}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Health tab ── */}
        {tab === "health" && (
          <div className="p-5 space-y-5">
            {flags.length === 0 && student.medications.length === 0 && (
              <div className="text-center py-8">
                <Shield className="w-8 h-8 mx-auto mb-2" style={{ color: C.textTertiary }} />
                <p className="text-xs" style={{ color: C.textTertiary }}>No active health flags on file.</p>
              </div>
            )}

            {student.hasAllergies && (
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "#F59E0B" }}
                >
                  ⚠ Allergies
                </p>
                <p
                  className="text-xs leading-relaxed p-3 rounded-sm"
                  style={{
                    color: C.textSecondary,
                    backgroundColor: "rgba(245,158,11,0.08)",
                    border: "1px solid rgba(245,158,11,0.2)",
                  }}
                >
                  {student.allergies}
                </p>
              </div>
            )}

            {student.hasMedical && (
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "#EF4444" }}
                >
                  Medical Conditions
                </p>
                <p
                  className="text-xs leading-relaxed p-3 rounded-sm"
                  style={{
                    color: C.textSecondary,
                    backgroundColor: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  {student.medicalConditions}
                </p>
              </div>
            )}

            {student.hasEmergencyMeds && (
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "#F97316" }}
                >
                  Emergency Meds Protocol
                </p>
                <p
                  className="text-xs leading-relaxed p-3 rounded-sm"
                  style={{
                    color: C.textSecondary,
                    backgroundColor: "rgba(249,115,22,0.08)",
                    border: "1px solid rgba(249,115,22,0.2)",
                  }}
                >
                  {student.emergencyMeds}
                </p>
              </div>
            )}

            {student.medications.length > 0 && (
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest mb-3"
                  style={{ color: C.textTertiary }}
                >
                  Medications ({student.medications.length})
                </p>
                <div className="space-y-2">
                  {student.medications.map((med, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-sm"
                      style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}` }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>
                          {med.name}
                        </p>
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                          style={{
                            backgroundColor: med.type === "daily" ? "#38BDF820" : "#F9731620",
                            color: med.type === "daily" ? "#38BDF8" : "#F97316",
                          }}
                        >
                          {med.type === "daily" ? "Daily" : "Emergency"}
                        </span>
                      </div>
                      <p className="text-[10px]" style={{ color: C.textSecondary }}>{med.dosage}</p>
                      <p className="text-[10px]" style={{ color: C.textTertiary }}>{med.physician}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Authorized Pickup tab ── */}
        {tab === "pickup" && (
          <div className="p-5">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-3"
              style={{ color: C.textTertiary }}
            >
              Authorized Pickup ({student.authorizedPickup.length})
            </p>
            <div>
              {student.authorizedPickup.map((person, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2.5"
                  style={{
                    borderBottom:
                      i < student.authorizedPickup.length - 1 ? `1px solid ${C.border}` : "none",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: student.color + "18", color: student.color }}
                  >
                    {person.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>{person.name}</p>
                    <p className="text-[10px]" style={{ color: C.textTertiary }}>{person.relationship}</p>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] flex-shrink-0" style={{ color: C.textSecondary }}>
                    <PhoneCall className="w-3 h-3 flex-shrink-0" style={{ color: C.textTertiary }} />
                    {person.phone}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* ── Immunizations tab ── */}
        {tab === "immunizations" && (
          <div className="p-5">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-3"
              style={{ color: C.textTertiary }}
            >
              Immunization Records
            </p>
            
            <div>
              {student.immunizations.map((imm, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5"
                  style={{
                    borderBottom: i < student.immunizations.length - 1 ? `1px solid ${C.border}` : "none",
                  }}
                >
                  <p className="text-xs font-medium" style={{ color: C.textPrimary }}>{imm.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px]" style={{ color: C.textTertiary }}>{imm.date || "—"}</p>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                      style={{
                        backgroundColor:
                          imm.status === "complete" ? "#22C55E20"
                          : imm.status === "due" ? "#F59E0B20"
                          : "#94A3B820",
                        color:
                          imm.status === "complete" ? "#22C55E"
                          : imm.status === "due" ? "#F59E0B"
                          : "#94A3B8",
                      }}
                    >
                      {imm.status === "complete" ? "Complete" : imm.status === "due" ? "Due" : "Exempt"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* ── Emergency Contacts tab ── */}
        {tab === "emergency" && (
          <div className="p-5">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-3"
              style={{ color: C.textTertiary }}
            >
              Emergency Contacts
            </p>
            
            <div>
              {(() => {
                const contacts = [...student.emergencyContacts].sort((a, b) => a.priority - b.priority);
                return contacts.map((contact, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2.5"
                    style={{
                      borderBottom: i < contacts.length - 1 ? `1px solid ${C.border}` : "none",
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{ backgroundColor: C.bg, color: C.textTertiary, border: `1px solid ${C.border}` }}
                    >
                      {contact.priority}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>{contact.name}</p>
                      <p className="text-[10px]" style={{ color: C.textTertiary }}>{contact.relationship}</p>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] flex-shrink-0" style={{ color: C.textSecondary }}>
                      <PhoneCall className="w-3 h-3 flex-shrink-0" style={{ color: C.textTertiary }} />
                      {contact.phone}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}


        {/* ── Paperwork tab ── */}
        {tab === "paperwork" && (
          <div className="p-4 space-y-4">
            {studentPaperwork.length === 0 ? (
              <p className="text-xs text-center py-8" style={{ color: C.textTertiary }}>
                No paperwork on file.
              </p>
            ) : (
              <>
                {/* Action row */}
                <div className="flex items-center justify-between">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: C.textTertiary }}
                  >
                    {paperworkSigned} / {studentPaperwork.length} complete
                  </p>
                  <div className="flex items-center gap-2">
                    {paperworkPending.length > 0 && (
                      <button
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-[10px] font-semibold"
                        style={{
                          backgroundColor: C.accentLight,
                          color: C.accent,
                          border: `1px solid ${C.accentDark + "44"}`,
                        }}
                      >
                        <Send className="w-3 h-3" /> Send Pending
                      </button>
                    )}
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-[10px] font-semibold"
                      style={{
                        color: C.textSecondary,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <Plus className="w-3 h-3" /> New Form
                    </button>
                  </div>
                </div>

                {/* Form cards */}
                <div className="grid grid-cols-3 gap-3">
                  {studentPaperwork.map((form) => (
                    <PaperworkFormCard key={form.id} form={form} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}


        {/* ── Billing tab ── */}
        {tab === "billing" && (
          <div className="p-5 space-y-5">
            {(() => {
              const family = findFamilyByPayerName(student.parent);
              return family && onNavigateToTuition ? (
                <button
                  type="button"
                  onClick={() => onNavigateToTuition(family.id)}
                  className="flex items-center gap-1 text-[11px] font-semibold"
                  style={{ color: C.accent }}
                >
                  View family tuition
                  <ArrowRight className="w-3 h-3" />
                </button>
              ) : null;
            })()}
            {student.billing.kind === "full_time" ? (
              <>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.textTertiary }}>
                    Enrollment
                  </p>
                  <DetailField
                    label="Plan"
                    value={
                      <span className="flex items-center gap-1.5 justify-end">
                        <School className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.accent }} />
                        Full-time enrollment
                      </span>
                    }
                  />
                  <DetailField label="Tuition" value={`${formatUsd(student.billing.monthlyTuition)} / mo`} />
                  <DetailField label="Autopay" value={student.billing.autopayOn ? "On" : "Off"} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.textTertiary }}>
                    Saved payment methods
                  </p>
                  {student.billing.paymentMethods.map((pm, i, paymentMethods) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2.5"
                      style={{
                        borderBottom:
                          i < paymentMethods.length - 1 ? `1px solid ${C.border}` : "none",
                      }}
                    >
                      <span className="flex items-center gap-2 text-xs" style={{ color: C.textPrimary }}>
                        <CreditCard className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.textTertiary }} />
                        {pm.label} ·••• {pm.last4}
                      </span>
                      {pm.default && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                          style={{ backgroundColor: C.accentLight, color: C.accent }}
                        >
                          Default
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-sm text-[11px] font-semibold"
                    style={{ backgroundColor: C.accent, color: "#fff" }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send invoice
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-sm text-[11px] font-semibold"
                    style={{
                      color: C.textSecondary,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Record payment
                  </button>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: C.textTertiary }}>
                    Invoices & payments
                  </p>
                  <div>
                    {student.billing.lineItems.map((row, i) => (
                      <div
                        key={row.id}
                        className="flex items-center justify-between gap-2 py-2.5"
                        style={{
                          borderBottom:
                            i < student.billing.lineItems.length - 1 ? `1px solid ${C.border}` : "none",
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium truncate" style={{ color: C.textPrimary }}>
                            {row.description}
                          </p>
                          <p className="text-[9px]" style={{ color: C.textTertiary }}>
                            {row.date}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-semibold tabular-nums" style={{ color: C.textPrimary }}>
                            {formatUsd(row.amount)}
                          </p>
                          <span
                            className="text-[9px] font-semibold"
                            style={{
                              color: row.status === "paid" ? C.success : C.warning,
                            }}
                          >
                            {row.status === "paid" ? "Paid" : "Pending"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.textTertiary }}>
                    Enrollment
                  </p>
                  <DetailField
                    label="Plan"
                    value={
                      <span className="flex items-center gap-1.5 justify-end">
                        <Home className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.accent }} />
                        Homeschool drop-in
                      </span>
                    }
                  />
                  <DetailField label="Rate" value={`${formatUsd(student.billing.ratePerDay)} / day`} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: C.textTertiary }}>
                    Weekly schedule (school year)
                  </p>
                  <p className="text-[10px] mb-3" style={{ color: C.textSecondary }}>
                    Each row is one calendar week. Selected days drive the invoice for that week.
                  </p>
                  <div className="space-y-2">
                    {student.billing.weeks.map((w, wi, weeks) => {
                      const billing = student.billing;
                      if (billing.kind !== "homeschool_dropin") return null;
                      const n = w.days.length;
                      const subtotal = n * billing.ratePerDay;
                      return (
                        <div
                          key={wi}
                          className="py-3"
                          style={{ borderBottom: wi < weeks.length - 1 ? `1px solid ${C.border}` : "none" }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[11px] font-semibold" style={{ color: C.textPrimary }}>
                              {w.weekOf}
                            </p>
                            <p className="text-[10px] tabular-nums" style={{ color: C.textSecondary }}>
                              {n} day{n !== 1 ? "s" : ""} × {formatUsd(billing.ratePerDay)} ={" "}
                              <span className="font-semibold" style={{ color: C.textPrimary }}>
                                {formatUsd(subtotal)}
                              </span>
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(["Mon", "Tue", "Wed", "Thu", "Fri"] as const).map((d) => {
                              const on = w.days.includes(d);
                              return (
                                <span
                                  key={d}
                                  className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                                  style={{
                                    backgroundColor: on ? C.accentLight : C.bg,
                                    color: on ? C.accent : C.textTertiary,
                                    border: `1px solid ${on ? C.accent + "55" : C.border}`,
                                  }}
                                >
                                  {d}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-sm text-[11px] font-semibold"
                    style={{ backgroundColor: C.accent, color: "#fff" }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Invoice this week
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-sm text-[11px] font-semibold"
                    style={{
                      color: C.textSecondary,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    Edit days
                  </button>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: C.textTertiary }}>
                    Charges & payments
                  </p>
                  <div>
                    {student.billing.lineItems.map((row, i) => (
                      <div
                        key={row.id}
                        className="flex items-center justify-between gap-2 py-2.5"
                        style={{
                          borderBottom:
                            i < student.billing.lineItems.length - 1 ? `1px solid ${C.border}` : "none",
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium truncate" style={{ color: C.textPrimary }}>
                            {row.description}
                          </p>
                          <p className="text-[9px]" style={{ color: C.textTertiary }}>
                            {row.date}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-semibold tabular-nums" style={{ color: C.textPrimary }}>
                            {formatUsd(row.amount)}
                          </p>
                          <span
                            className="text-[9px] font-semibold"
                            style={{
                              color: row.status === "paid" ? C.success : C.warning,
                            }}
                          >
                            {row.status === "paid" ? "Paid" : "Pending"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Family tab ── */}
        {tab === "family" && (
          <div className="p-5 space-y-5">
            {!matchedParent ? (
              <p className="text-xs text-center py-8" style={{ color: C.textTertiary }}>
                Family information not found.
              </p>
            ) : (
              <>
                {/* Guardian 1 */}
                <div>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-widest mb-3"
                    style={{ color: C.textTertiary }}
                  >
                    Guardian 1
                  </p>
                  <DetailField label="Name" value={matchedParent.name} />
                  <DetailField label="Cell Phone" value={matchedParent.g1Phone} />
                  {matchedParent.g1WorkPhone && (
                    <DetailField label="Work Phone" value={matchedParent.g1WorkPhone} />
                  )}
                  <DetailField label="Preferred Contact" value={matchedParent.g1Preferred} />
                  <DetailField label="Lives with Child" value={<YesNoChip value={matchedParent.g1LivesWith} />} />
                  <DetailField label="Has Custody" value={<YesNoChip value={matchedParent.g1Custody} />} />
                </div>

                {/* Guardian 2 */}
                {matchedParent.g2Name && (
                  <div>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-widest mb-3"
                      style={{ color: C.textTertiary }}
                    >
                      Guardian 2
                    </p>
                    <DetailField label="Name" value={matchedParent.g2Name} />
                    <DetailField label="Relationship" value={matchedParent.g2Relationship} />
                    <DetailField label="Email" value={matchedParent.g2Email} />
                    <DetailField label="Cell Phone" value={matchedParent.g2Phone} />
                  </div>
                )}

                {/* Siblings */}
                {matchedParent.children.filter((c) => c.name !== student.name).length > 0 && (
                  <div>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-widest mb-3"
                      style={{ color: C.textTertiary }}
                    >
                      Siblings
                    </p>
                    <div className="space-y-2">
                      {matchedParent.children
                        .filter((c) => c.name !== student.name)
                        .map((sibling) => (
                          <div
                            key={sibling.name}
                            className="flex items-center gap-3 p-3 rounded-sm"
                            style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}` }}
                          >
                            {sibling.photo ? (
                              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                <Image
                                  src={sibling.photo}
                                  alt={sibling.name}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{
                                  backgroundColor: matchedParent.color + "22",
                                  color: matchedParent.color,
                                }}
                              >
                                {sibling.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-medium" style={{ color: C.textPrimary }}>
                                {sibling.name}
                              </p>
                              <p className="text-[10px]" style={{ color: C.textTertiary }}>
                                DOB: {sibling.dob}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Applications */}
                <div>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-widest mb-3"
                    style={{ color: C.textTertiary }}
                  >
                    Applications
                  </p>
                  <div className="space-y-2">
                    {matchedParent.applications
                      .filter((a) => a.childName === student.name)
                      .map((app, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-sm"
                          style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}` }}
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
                          <p className="text-[10px] mt-2" style={{ color: C.textTertiary }}>
                            Submitted {app.submitted}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </motion.div>
  );
}

function StudentsPage({
  onNavigateToTuition,
}: {
  onNavigateToTuition?: (familyId: string) => void;
}) {
  const [selectedStudent, setSelectedStudent] = useState<DemoStudent>(ACTIVE_DEMO_STUDENTS[0]);
  const [search, setSearch] = useState("");

  const filtered = ACTIVE_DEMO_STUDENTS.filter(
    (s) =>
      search === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.grade.toLowerCase().includes(search.toLowerCase()) ||
      s.classroom.toLowerCase().includes(search.toLowerCase()) ||
      s.teacher.toLowerCase().includes(search.toLowerCase()) ||
      (search.toLowerCase().includes("home") && s.billing.kind === "homeschool_dropin"),
  );

  return (
    <div className="h-full flex flex-row overflow-hidden">
      {/* ── Left panel: student list ── */}
      <div
        className="w-64 flex-shrink-0 flex flex-col overflow-hidden"
        style={{ borderRight: `1px solid ${C.border}` }}
      >
        {/* Search */}
        <div
          className="px-3 py-2 flex-shrink-0"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm"
            style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}` }}
          >
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.textTertiary }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="bg-transparent border-none outline-none text-sm w-full"
              style={{ color: C.textPrimary }}
            />
          </div>
        </div>

        {/* Student list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((student, i) => {
            const isActive = selectedStudent.id === student.id;
            const flags = HEALTH_FLAGS.filter((f) => student[f.key]);
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="cursor-pointer px-3 py-2.5"
                style={{
                  borderBottom: `1px solid ${C.border}`,
                  borderLeft: `2px solid ${isActive ? C.accent : "transparent"}`,
                  backgroundColor: isActive ? C.accentLight : "transparent",
                }}
                onClick={() => setSelectedStudent(student)}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = C.elevated;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isActive ? C.accentLight : "transparent";
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ backgroundColor: student.color + "22", color: student.color }}
                  >
                    {student.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: C.textPrimary }}>
                        {student.name}
                      </p>
                      {student.billing.kind === "homeschool_dropin" && (
                        <span title="Homeschool drop-in" className="flex-shrink-0 inline-flex">
                          <Home className="w-3.5 h-3.5" style={{ color: C.accent }} aria-hidden />
                          <span className="sr-only">Homeschool drop-in</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] truncate" style={{ color: C.textTertiary }}>
                      {student.grade} · {student.teacher}
                    </p>
                  </div>
                </div>
                {flags.length > 0 && (
                  <div className="flex items-center gap-1 mt-1.5 pl-9 flex-wrap">
                    {flags.map((f) => (
                      <span
                        key={f.key}
                        className="text-[8px] px-1 py-0.5 rounded font-semibold"
                        style={{ backgroundColor: f.bg, color: f.color }}
                      >
                        {f.label.split(" ")[0]}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Right panel: student profile ── */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <StudentProfilePanel
            key={selectedStudent.id}
            student={selectedStudent}
            onNavigateToTuition={onNavigateToTuition}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Programs page ─────────────────────────────────────────────────────────────

type ProgramTabId =
  | "overview"
  | "enrollment"
  | "pricing"
  | "schedule"
  | "staff"
  | "roster";

const PROGRAM_TABS: {
  id: ProgramTabId;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-3 h-3" />, color: "#5E7C68" },
  { id: "enrollment", label: "Enrollment", icon: <GitBranch className="w-3 h-3" />, color: "#22C55E" },
  { id: "pricing", label: "Pricing", icon: <Tag className="w-3 h-3" />, color: "#F59E0B" },
  { id: "schedule", label: "Schedule", icon: <CalendarDays className="w-3 h-3" />, color: "#8B5CF6" },
  { id: "staff", label: "Staff", icon: <UserCheck className="w-3 h-3" />, color: "#EF4444" },
  { id: "roster", label: "Roster", icon: <Users className="w-3 h-3" />, color: "#38BDF8" },
];

function ProgramSection({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: C.textTertiary }}
        >
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function ProgramDivider() {
  return (
    <hr
      className="my-6 border-0"
      style={{ borderTop: `1px solid ${C.border}` }}
    />
  );
}

function ProgramStatStrip({
  stats,
}: {
  stats: { label: string; value: string | number; sub?: string }[];
}) {
  return (
    <div className="flex flex-wrap">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="flex-1 min-w-[6.5rem] py-1 pr-6"
          style={{
            borderLeft: i > 0 ? `1px solid ${C.border}` : undefined,
            paddingLeft: i > 0 ? "1.25rem" : undefined,
          }}
        >
          <p
            className="text-[10px] font-medium uppercase tracking-wide"
            style={{ color: C.textTertiary }}
          >
            {stat.label}
          </p>
          <p
            className="text-xl font-semibold mt-0.5 tabular-nums leading-none"
            style={{ color: C.textPrimary }}
          >
            {stat.value}
          </p>
          {stat.sub && (
            <p className="text-[10px] mt-1" style={{ color: C.textTertiary }}>
              {stat.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function ProgramDetailRows({
  rows,
}: {
  rows: [string, React.ReactNode][];
}) {
  return (
    <dl>
      {rows.map(([k, v], i) => (
        <div
          key={k}
          className="flex justify-between gap-6 py-2.5 text-xs"
          style={{
            borderTop: i > 0 ? `1px solid ${C.border}` : undefined,
          }}
        >
          <dt style={{ color: C.textTertiary }}>{k}</dt>
          <dd className="font-medium text-right" style={{ color: C.textPrimary }}>
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ProgramFlowSection({
  title,
  flow,
  role,
}: {
  title: string;
  flow?: EnrollmentFlow;
  role: string;
}) {
  return (
    <ProgramSection
      title={role}
      action={
        <button
          type="button"
          className="text-[10px] font-medium flex items-center gap-1"
          style={{ color: C.accent }}
        >
          Edit in Enrollment Flows
          <ArrowRight className="w-3 h-3" />
        </button>
      }
    >
      <div className="flex items-start gap-3">
        <GitBranch className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: C.accent }} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            {flow?.name ?? title}
          </p>
          {flow ? (
            <>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px]" style={{ color: C.textTertiary }}>
                <span>{flow.steps.length} step{flow.steps.length !== 1 ? "s" : ""}</span>
                <span>·</span>
                <span>{flow.actions.length} action{flow.actions.length !== 1 ? "s" : ""}</span>
                <span>·</span>
                <span>Updated {flow.updatedAt}</span>
              </div>
              <div className="mt-3 space-y-0">
                {flow.steps.map((step, i) => (
                  <div
                    key={step.id}
                    className="flex items-center gap-3 py-2 text-xs"
                    style={{
                      color: C.textSecondary,
                      borderTop: i > 0 ? `1px solid ${C.border}` : undefined,
                    }}
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 tabular-nums"
                      style={{ color: C.textTertiary }}
                    >
                      {i + 1}
                    </span>
                    <span className="font-medium" style={{ color: C.textPrimary }}>
                      {step.title}
                    </span>
                    <span style={{ color: C.textTertiary }}>
                      {step.fields.length} field{step.fields.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs mt-2" style={{ color: C.textTertiary }}>
              No flow linked
            </p>
          )}
        </div>
      </div>
    </ProgramSection>
  );
}

function ProgramOverviewTab({ program }: { program: DemoProgram }) {
  const enrolled = getProgramEnrolledCount(program);
  const statusStyle = PROGRAM_STATUS_STYLES[program.status];

  return (
    <div className="overflow-y-auto pb-6">
      <ProgramStatStrip
        stats={[
          { label: "Enrolled", value: enrolled, sub: `of ${program.eligibility.capacity}` },
          {
            label: "Waitlist",
            value: program.eligibility.waitlistCount,
            sub: program.eligibility.waitlistEnabled ? "active" : "off",
          },
          { label: "Leads", value: program.stats.leads, sub: "this season" },
          { label: "Revenue", value: `$${program.stats.revenue.toLocaleString()}`, sub: "YTD" },
        ]}
      />

      <ProgramDivider />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
        <ProgramSection title="About">
          <p className="text-sm font-medium mb-2" style={{ color: C.textPrimary }}>
            {program.description.short}
          </p>
          <p className="text-sm leading-relaxed max-w-prose" style={{ color: C.textSecondary }}>
            {program.description.long}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-xs" style={{ color: C.textTertiary }}>
            {program.marketing.details.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </ProgramSection>

        <ProgramSection title="Eligibility & visibility">
          <ProgramDetailRows
            rows={[
              ["Type", PROGRAM_TYPE_LABELS[program.type]],
              ["Status", statusStyle.label],
              ["Age range", program.eligibility.ageRange],
              ...(program.eligibility.gradeRange
                ? [["Grades", program.eligibility.gradeRange] as [string, React.ReactNode]]
                : []),
              ["Capacity", `${program.eligibility.capacity} students`],
              ["Website", program.publicVisible ? "Public" : "Admin only"],
              ["Badge", program.marketing.badge],
              ["Billing ID", PROGRAM_ID_MAP[program.id] ?? program.id],
            ]}
          />
          {program.eligibility.tracks && (
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: C.textTertiary }}>
                Enrollment tracks
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: C.textSecondary }}>
                {program.eligibility.tracks.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </ProgramSection>
      </div>
    </div>
  );
}

function ProgramEnrollmentTab({ program }: { program: DemoProgram }) {
  const applyFlow = getFlowForLead(program.enrollment.applyFlowId);
  const enrollFlow = program.enrollment.enrollFlowId
    ? getFlowForLead(program.enrollment.enrollFlowId)
    : undefined;

  const funnelStages = [
    { label: "Leads", count: program.stats.leads },
    { label: "Applied", count: Math.max(1, Math.round(program.stats.leads * 0.7)) },
    { label: "In review", count: Math.max(1, Math.round(program.stats.leads * 0.4)) },
    { label: "Enrolling", count: Math.max(1, Math.round(program.stats.leads * 0.2)) },
    { label: "Enrolled", count: getProgramEnrolledCount(program) },
  ];

  return (
    <div className="overflow-y-auto pb-6">
      <ProgramFlowSection title="Application" flow={applyFlow} role="Application flow" />

      {enrollFlow && enrollFlow.id !== applyFlow?.id ? (
        <>
          <ProgramDivider />
          <ProgramFlowSection title="Enrollment" flow={enrollFlow} role="Enrollment flow" />
        </>
      ) : (
        <>
          <ProgramDivider />
          <ProgramSection title="Enrollment flow">
            <p className="text-sm" style={{ color: C.textSecondary }}>
              Same as application flow — families complete one form to apply and enroll.
            </p>
          </ProgramSection>
        </>
      )}

      <ProgramDivider />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
        <ProgramSection title="Onboarding checklist">
          <ul>
            {program.enrollment.checklistItems.map((item, i) => (
              <li
                key={item}
                className="flex items-center gap-2.5 py-2.5 text-sm"
                style={{
                  color: C.textSecondary,
                  borderTop: i > 0 ? `1px solid ${C.border}` : undefined,
                }}
              >
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.accent }} />
                {item}
              </li>
            ))}
          </ul>
        </ProgramSection>

        <div>
          <ProgramSection title="Fees & automation">
            <ProgramDetailRows
              rows={[
                ["Registration fee", `$${program.enrollment.registrationFee}`],
                ["Auto-tag on submit", program.enrollment.autoTag],
                ["Website CTA", program.enrollment.websiteCta],
                ["Financial aid", program.pricing.acceptsFinancialAid ? "Accepted" : "Not offered"],
              ]}
            />
          </ProgramSection>

          <ProgramSection title="Pipeline">
            <div className="flex items-end gap-2 h-20 mt-1">
              {funnelStages.map((stage, i) => {
                const max = funnelStages[0].count;
                const h = max > 0 ? Math.max(16, (stage.count / max) * 100) : 16;
                return (
                  <div key={stage.label} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                    <span className="text-[10px] font-semibold tabular-nums" style={{ color: C.textPrimary }}>
                      {stage.count}
                    </span>
                    <div
                      className="w-full rounded-t-sm"
                      style={{
                        height: `${h}%`,
                        backgroundColor: i === funnelStages.length - 1 ? C.accent : C.accentLight,
                        minHeight: 12,
                      }}
                    />
                    <span className="text-[9px] text-center leading-tight truncate w-full" style={{ color: C.textTertiary }}>
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </ProgramSection>
        </div>
      </div>
    </div>
  );
}

function ProgramPricingTab({ program }: { program: DemoProgram }) {
  return (
    <div className="overflow-y-auto pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-10 gap-y-8">
        <ProgramSection title="Billing">
          <p className="text-3xl font-semibold tabular-nums leading-none" style={{ color: C.textPrimary }}>
            {formatProgramPrice(program)}
          </p>
          <p className="text-sm mt-2" style={{ color: C.textTertiary }}>
            {formatBillingModel(program.pricing.billingModel)} billing
          </p>
        </ProgramSection>

        <ProgramSection title="Fees">
          <ProgramDetailRows
            rows={program.pricing.fees.map((fee) => [
              fee.label + (fee.refundable ? " (refundable)" : ""),
              `$${fee.amount}`,
            ])}
          />
        </ProgramSection>

        <ProgramSection title="Included">
          <ul>
            {program.pricing.includes.map((item, i) => (
              <li
                key={item}
                className="flex items-center gap-2.5 py-2 text-sm"
                style={{
                  color: C.textSecondary,
                  borderTop: i > 0 ? `1px solid ${C.border}` : undefined,
                }}
              >
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.success }} />
                {item}
              </li>
            ))}
          </ul>
        </ProgramSection>
      </div>

      <ProgramDivider />

      <ProgramSection title="Payment schedule">
        <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
          {program.pricing.paymentSchedule.map((item, i) => (
            <span key={item}>
              {i > 0 && <span style={{ color: C.textTertiary }}> · </span>}
              <span style={{ color: i === 0 ? C.accent : undefined, fontWeight: i === 0 ? 500 : undefined }}>
                {item}
              </span>
            </span>
          ))}
        </p>
        <p className="text-xs mt-4" style={{ color: C.textTertiary }}>
          Families see this schedule in My School → Tuition after enrollment.
        </p>
      </ProgramSection>
    </div>
  );
}

function ProgramScheduleTab({ program }: { program: DemoProgram }) {
  return (
    <div className="overflow-y-auto pb-6">
      <ProgramStatStrip
        stats={[
          { label: "Starts", value: program.schedule.startDate },
          { label: "Ends", value: program.schedule.endDate },
          { label: "Registration opens", value: program.schedule.registrationOpen },
          { label: "Registration closes", value: program.schedule.registrationClose },
        ]}
      />

      <ProgramDivider />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
        <ProgramSection title="Weekly rhythm">
          <p className="text-base font-medium mb-1" style={{ color: C.textPrimary }}>
            {program.schedule.daysOfWeek}
          </p>
          {program.schedule.sessionNotes && (
            <p className="text-sm mb-4 max-w-prose" style={{ color: C.textSecondary }}>
              {program.schedule.sessionNotes}
            </p>
          )}
          <div>
            {[
              ["Drop-off", program.schedule.dailyHours.dropOff],
              ["Core hours", program.schedule.dailyHours.core],
              ["Pick-up", program.schedule.dailyHours.pickUp],
              ...(program.schedule.dailyHours.afterCare
                ? [["After care", program.schedule.dailyHours.afterCare] as const]
                : []),
            ].map(([label, time], i) => (
              <div
                key={label}
                className="flex items-center gap-3 py-2.5 text-sm"
                style={{
                  borderTop: i > 0 ? `1px solid ${C.border}` : undefined,
                }}
              >
                <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.accent }} />
                <span className="font-medium w-24 flex-shrink-0" style={{ color: C.textSecondary }}>
                  {label}
                </span>
                <span style={{ color: C.textPrimary }}>{time}</span>
              </div>
            ))}
          </div>
        </ProgramSection>

        <div className="space-y-8">
          {(program.schedule.minDaysPerWeek !== undefined ||
            program.schedule.bookingCutoff) && (
            <ProgramSection title="Drop-in rules">
              <ProgramDetailRows
                rows={[
                  ...(program.schedule.minDaysPerWeek !== undefined
                    ? [[
                        "Days per week",
                        `${program.schedule.minDaysPerWeek} – ${program.schedule.maxDaysPerWeek}`,
                      ] as [string, React.ReactNode]]
                    : []),
                  ...(program.schedule.bookingCutoff
                    ? [["Booking cutoff", program.schedule.bookingCutoff] as [string, React.ReactNode]]
                    : []),
                ]}
              />
            </ProgramSection>
          )}

          {program.schedule.breaks && program.schedule.breaks.length > 0 && (
            <ProgramSection title="Breaks & no-school days">
              <ul>
                {program.schedule.breaks.map((b, i) => (
                  <li
                    key={b}
                    className="flex items-center gap-2.5 py-2.5 text-sm"
                    style={{
                      color: C.textSecondary,
                      borderTop: i > 0 ? `1px solid ${C.border}` : undefined,
                    }}
                  >
                    <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.warning }} />
                    {b}
                  </li>
                ))}
              </ul>
            </ProgramSection>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgramStaffTab({ program }: { program: DemoProgram }) {
  return (
    <div className="overflow-y-auto pb-6">
      <div
        className="hidden sm:grid grid-cols-[auto_1fr_auto_auto] gap-x-4 gap-y-0 text-[10px] font-semibold uppercase tracking-widest pb-2"
        style={{ color: C.textTertiary, borderBottom: `1px solid ${C.border}` }}
      >
        <span className="w-10" />
        <span>Teacher</span>
        <span>Students</span>
        <span className="w-24 text-right">Capacity</span>
      </div>
      {program.teachers.map((teacher, i) => {
        const pct = teacher.capacity
          ? Math.round((teacher.studentIds.length / teacher.capacity) * 100)
          : 0;
        const isFull = teacher.capacity ? teacher.studentIds.length >= teacher.capacity : false;
        return (
          <div
            key={teacher.id}
            className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto_auto] gap-x-4 gap-y-2 items-center py-4"
            style={{
              borderBottom: `1px solid ${C.border}`,
              borderTop: i === 0 ? undefined : undefined,
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: C.accentLight, color: C.accent }}
            >
              {teacher.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                {teacher.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
                {teacher.classroom}
              </p>
            </div>
            <span className="text-sm tabular-nums font-medium" style={{ color: C.textPrimary }}>
              {teacher.studentIds.length}
              {teacher.capacity ? ` / ${teacher.capacity}` : ""}
            </span>
            {teacher.capacity ? (
              <div className="w-full sm:w-24">
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ backgroundColor: C.input }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      backgroundColor: isFull ? C.warning : C.accent,
                    }}
                  />
                </div>
                <p className="text-[10px] mt-1 text-right sm:text-right" style={{ color: C.textTertiary }}>
                  {pct}%
                </p>
              </div>
            ) : (
              <span />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProgramRosterTab({
  program,
  activeTeacherId,
  onTeacherChange,
  onSelectStudent,
}: {
  program: DemoProgram;
  activeTeacherId: string;
  onTeacherChange: (id: string) => void;
  onSelectStudent: (student: DemoStudent) => void;
}) {
  const activeTeacher =
    program.teachers.find((t) => t.id === activeTeacherId) ?? program.teachers[0];
  const teacherStudents = activeTeacher.studentIds
    .map((id) => ACTIVE_DEMO_STUDENTS.find((s) => s.id === id))
    .filter(Boolean) as DemoStudent[];
  const enrolled = getProgramEnrolledCount(program);

  return (
    <div className="flex flex-col min-h-0 flex-1 overflow-y-auto pb-6">
      <p className="text-sm mb-4 flex-shrink-0" style={{ color: C.textTertiary }}>
        <span className="font-medium" style={{ color: C.textPrimary }}>
          {enrolled}
        </span>{" "}
        enrolled ·{" "}
        <span className="font-medium" style={{ color: C.textPrimary }}>
          {program.eligibility.waitlistCount}
        </span>{" "}
        waitlisted ·{" "}
        <span className="font-medium" style={{ color: C.textPrimary }}>
          {program.eligibility.capacity}
        </span>{" "}
        capacity
      </p>

      <div
        className="flex items-center gap-1 mb-5 flex-wrap flex-shrink-0"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        {program.teachers.map((teacher) => {
          const active = activeTeacherId === teacher.id;
          return (
            <button
              key={teacher.id}
              type="button"
              onClick={() => onTeacherChange(teacher.id)}
              className="flex items-center gap-2 px-2 py-2.5 -mb-px text-xs font-medium transition-colors"
              style={{
                color: active ? C.accent : C.textSecondary,
                borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent",
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                style={{
                  backgroundColor: active ? C.accent : "transparent",
                  color: active ? "#fff" : C.textTertiary,
                  border: active ? "none" : `1px solid ${C.border}`,
                }}
              >
                {teacher.initials}
              </div>
              <span>{teacher.name}</span>
              <span className="tabular-nums" style={{ color: C.textTertiary }}>
                {teacher.studentIds.length}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTeacherId}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="grid gap-2"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          }}
        >
          {teacherStudents.map((student, i) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelectStudent(student)}
              className="cursor-pointer rounded-sm p-3 flex flex-col items-center text-center transition-colors"
              style={{ backgroundColor: C.surface }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = C.accentLight;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = C.surface;
              }}
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
  );
}

function getProgramSidebarMeta(prog: DemoProgram) {
  const badge = PROGRAM_LABELS[prog.id] ?? {
    label: prog.name,
    bg: C.accentLight,
    text: C.accent,
  };
  const initials =
    prog.type === "summer"
      ? "SU"
      : prog.type === "school_year"
        ? "SY"
        : "HI";
  return { badge, initials };
}

function ProgramListRail({
  activeProgramId,
  onSelect,
}: {
  activeProgramId: string;
  onSelect: (prog: DemoProgram) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = DEMO_PROGRAMS_P2.filter((prog) => {
    if (search === "") return true;
    const q = search.toLowerCase();
    return (
      prog.name.toLowerCase().includes(q) ||
      PROGRAM_TYPE_LABELS[prog.type].toLowerCase().includes(q) ||
      prog.marketing.badge.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="w-64 flex-shrink-0 flex flex-col overflow-hidden"
      style={{ borderRight: `1px solid ${C.border}`, backgroundColor: C.bg }}
    >
      <div
        className="px-3 py-2 flex-shrink-0"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm"
          style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}` }}
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.textTertiary }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search programs..."
            className="bg-transparent border-none outline-none text-sm w-full"
            style={{ color: C.textPrimary }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((prog, i) => {
          const isActive = activeProgramId === prog.id;
          const enrolled = getProgramEnrolledCount(prog);
          const statusStyle = PROGRAM_STATUS_STYLES[prog.status];
          const typeLabel = PROGRAM_TYPE_LABELS[prog.type];
          const { badge, initials } = getProgramSidebarMeta(prog);

          return (
            <motion.button
              key={prog.id}
              type="button"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => onSelect(prog)}
              className="w-full text-left px-3 py-2.5"
              style={{
                borderBottom: `1px solid ${C.border}`,
                borderLeft: `2px solid ${isActive ? C.accent : "transparent"}`,
                backgroundColor: isActive ? C.accentLight : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = C.elevated;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isActive ? C.accentLight : "transparent";
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: badge.bg, color: badge.text }}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-semibold truncate"
                    style={{ color: C.textPrimary }}
                  >
                    {prog.name}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: C.textTertiary }}>
                    {typeLabel} · {enrolled}/{prog.eligibility.capacity} enrolled
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-1.5 pl-9 flex-wrap">
                <span
                  className="text-[8px] px-1 py-0.5 rounded font-semibold"
                  style={{
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.text,
                  }}
                >
                  {statusStyle.label}
                </span>
                {prog.eligibility.waitlistCount > 0 && (
                  <span
                    className="text-[8px] px-1 py-0.5 rounded font-semibold"
                    style={{ backgroundColor: C.warningBg, color: C.warning }}
                  >
                    {prog.eligibility.waitlistCount} waitlist
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-xs text-center" style={{ color: C.textTertiary }}>
            No programs match your search
          </p>
        )}
      </div>

      <div
        className="px-3 py-2 flex-shrink-0"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        <DemoButton variant="ghost" className="w-full justify-center text-xs">
          <Plus className="w-3.5 h-3.5" />
          Add Program
        </DemoButton>
      </div>
    </div>
  );
}

function ProgramsPage() {
  const [activeProgram, setActiveProgram] = useState<DemoProgram>(
    DEMO_PROGRAMS_P2[0],
  );
  const [activeTab, setActiveTab] = useState<ProgramTabId>("overview");
  const [activeTeacherId, setActiveTeacherId] = useState(
    DEMO_PROGRAMS_P2[0].teachers[0].id,
  );
  const [selectedStudent, setSelectedStudent] = useState<DemoStudent | null>(
    null,
  );

  const enrolled = getProgramEnrolledCount(activeProgram);
  const statusStyle = PROGRAM_STATUS_STYLES[activeProgram.status];

  const switchProgram = (prog: DemoProgram) => {
    setActiveProgram(prog);
    setActiveTeacherId(prog.teachers[0].id);
    setSelectedStudent(null);
    setActiveTab("overview");
  };

  return (
    <div className="h-full flex relative overflow-hidden" style={{ backgroundColor: C.bg }}>
      <ProgramListRail
        activeProgramId={activeProgram.id}
        onSelect={switchProgram}
      />

      <div
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
        style={{ backgroundColor: C.surface }}
      >
        <div className="flex-shrink-0 px-6 pt-4 pb-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1
                  className="text-xl font-semibold tracking-tight"
                  style={{ color: C.textPrimary }}
                >
                  {activeProgram.name}
                </h1>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
                  style={{
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.text,
                  }}
                >
                  {statusStyle.label}
                </span>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: C.accentLight, color: C.accent }}
                >
                  {PROGRAM_TYPE_LABELS[activeProgram.type]}
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: C.textTertiary }}>
                {enrolled} enrolled · {formatProgramPrice(activeProgram)} ·{" "}
                {activeProgram.schedule.daysOfWeek}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <DemoButton variant="secondary" className="text-xs">
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </DemoButton>
            </div>
          </div>

          <div
            className="flex items-center gap-1 overflow-x-auto pb-0 -mb-px"
            style={{ borderBottom: `1px solid ${C.border}` }}
          >
            {PROGRAM_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors"
                  style={{
                    color: isActive ? C.accent : C.textSecondary,
                    borderBottom: isActive
                      ? `2px solid ${C.accent}`
                      : "2px solid transparent",
                    marginBottom: -1,
                  }}
                >
                  <span className="flex-shrink-0" style={{ color: tab.color }} aria-hidden>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-5 pb-2">
          {activeTab === "overview" && (
            <ProgramOverviewTab program={activeProgram} />
          )}
          {activeTab === "enrollment" && (
            <ProgramEnrollmentTab program={activeProgram} />
          )}
          {activeTab === "pricing" && (
            <ProgramPricingTab program={activeProgram} />
          )}
          {activeTab === "schedule" && (
            <ProgramScheduleTab program={activeProgram} />
          )}
          {activeTab === "staff" && <ProgramStaffTab program={activeProgram} />}
          {activeTab === "roster" && (
            <ProgramRosterTab
              program={activeProgram}
              activeTeacherId={activeTeacherId}
              onTeacherChange={setActiveTeacherId}
              onSelectStudent={setSelectedStudent}
            />
          )}
        </div>
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

type TuitionScheduleItem = {
  label: string;
  amount: number;
  state: "paid" | "sent" | "unpaid" | "overdue";
  date?: string;
  dueDate?: string;
};

type UpcomingCharge = {
  id: string;
  label: string;
  amount: number;
  dueDate: string;
  program: string;
  status: "scheduled" | "sent" | "overdue";
};

type FamilyBillingStatus =
  | "current"
  | "invoice_sent"
  | "overdue"
  | "failed_payment";

type DemoFamilyBilling = {
  id: string;
  parentId?: string;
  name: string;
  email: string;
  initials: string;
  color: string;
  children: string[];
  programs: string[];
  balanceDue: number;
  paidYtd: number;
  nextDue?: { date: string; amount: number; label: string };
  autopayOn: boolean;
  paymentMethod?: string;
  status: FamilyBillingStatus;
  hasFailedPayment?: boolean;
  summer: TuitionScheduleItem[];
  schoolYear: TuitionScheduleItem[];
  upcoming: UpcomingCharge[];
};

const SUMMER_WEEK_AMOUNT = 900;
const SCHOOL_YEAR_MONTHLY = 1800;
const REG_FEE = 500;
const SUPPLY_FEE = 250;

function buildSummerWeeks(
  paidCount: number,
  sentIndex?: number,
): TuitionScheduleItem[] {
  return [
    { label: "Registration Fee", amount: REG_FEE, state: "paid", date: "Jan 15" },
    ...Array.from({ length: 12 }, (_, i) => ({
      label: `Week ${i + 1}`,
      amount: SUMMER_WEEK_AMOUNT,
      state:
        i < paidCount
          ? ("paid" as const)
          : i === sentIndex
            ? ("sent" as const)
            : i < paidCount + 2 && sentIndex === undefined
              ? ("unpaid" as const)
              : ("unpaid" as const),
      date: i < paidCount ? `May ${10 + i * 7}` : undefined,
      dueDate: i >= paidCount ? `May ${10 + i * 7}` : undefined,
    })),
  ];
}

function buildSchoolYearMonths(
  paidCount: number,
  sentIndex?: number,
  overdueIndex?: number,
): TuitionScheduleItem[] {
  const months = [
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
  ];
  return [
    { label: "Registration Fee", amount: REG_FEE, state: "paid", date: "Nov 1" },
    { label: "Supply Fee", amount: SUPPLY_FEE, state: "paid", date: "Nov 1" },
    ...months.map((m, i) => ({
      label: `${m} Tuition`,
      amount: SCHOOL_YEAR_MONTHLY,
      state:
        i < paidCount
          ? ("paid" as const)
          : i === overdueIndex
            ? ("overdue" as const)
            : i === sentIndex
              ? ("sent" as const)
              : ("unpaid" as const),
      date: i < paidCount ? `${m} 1` : undefined,
      dueDate: i >= paidCount ? `${m} 1, 2026` : undefined,
    })),
  ];
}

const DEMO_FAMILY_BILLING: DemoFamilyBilling[] = [
  {
    id: "fb1",
    parentId: "p1",
    name: "Sarah Richardson",
    email: "sarah.r@email.com",
    initials: "SR",
    color: "#5E7C68",
    children: ["Emma Richardson"],
    programs: ["Summer 2026", "School Year 26–27"],
    balanceDue: 1800,
    paidYtd: 16250,
    nextDue: { date: "Apr 1, 2026", amount: 1800, label: "Feb Tuition" },
    autopayOn: true,
    paymentMethod: "Visa ·••• 4242",
    status: "current",
    summer: buildSummerWeeks(8),
    schoolYear: buildSchoolYearMonths(6, 6),
    upcoming: [
      {
        id: "u1",
        label: "Feb Tuition",
        amount: 1800,
        dueDate: "Apr 1, 2026",
        program: "School Year 26–27",
        status: "sent",
      },
      {
        id: "u2",
        label: "Week 9",
        amount: 900,
        dueDate: "May 24, 2026",
        program: "Summer 2026",
        status: "scheduled",
      },
    ],
  },
  {
    id: "fb2",
    parentId: "p2",
    name: "Miguel Torres",
    email: "mig.t@email.com",
    initials: "MT",
    color: "#38BDF8",
    children: ["Liam Torres"],
    programs: ["Summer 2026", "School Year 26–27"],
    balanceDue: 4500,
    paidYtd: 11700,
    nextDue: { date: "May 17, 2026", amount: 900, label: "Week 6" },
    autopayOn: true,
    paymentMethod: "Visa ·••• 8812",
    status: "overdue",
    summer: buildSummerWeeks(5, 5),
    schoolYear: buildSchoolYearMonths(5),
    upcoming: [
      {
        id: "u3",
        label: "Week 6",
        amount: 900,
        dueDate: "May 17, 2026",
        program: "Summer 2026",
        status: "overdue",
      },
      {
        id: "u4",
        label: "Feb Tuition",
        amount: 1800,
        dueDate: "Apr 1, 2026",
        program: "School Year 26–27",
        status: "sent",
      },
    ],
  },
  {
    id: "fb3",
    parentId: "p3",
    name: "Diana Foster",
    email: "diana@email.com",
    initials: "DF",
    color: "#F59E0B",
    children: ["Noah Foster"],
    programs: ["Summer 2026"],
    balanceDue: 1800,
    paidYtd: 9950,
    nextDue: { date: "Jun 7, 2026", amount: 900, label: "Week 11" },
    autopayOn: true,
    paymentMethod: "Mastercard ·••• 3341",
    status: "current",
    summer: buildSummerWeeks(10),
    schoolYear: [],
    upcoming: [
      {
        id: "u5",
        label: "Week 11",
        amount: 900,
        dueDate: "Jun 7, 2026",
        program: "Summer 2026",
        status: "scheduled",
      },
    ],
  },
  {
    id: "fb4",
    name: "Jerome Watkins",
    email: "jwatkins@email.com",
    initials: "JW",
    color: "#22C55E",
    children: ["Tyler Watkins"],
    programs: ["Summer 2026", "School Year 26–27"],
    balanceDue: 0,
    paidYtd: 24100,
    autopayOn: true,
    paymentMethod: "Visa ·••• 9921",
    status: "current",
    summer: buildSummerWeeks(12).map((w) => ({ ...w, state: "paid" as const })),
    schoolYear: buildSchoolYearMonths(10).map((m) => ({
      ...m,
      state: "paid" as const,
    })),
    upcoming: [],
  },
  {
    id: "fb5",
    parentId: "p7",
    name: "David Webb",
    email: "monica.w@email.com",
    initials: "DW",
    color: "#F97316",
    children: ["Marcus Webb"],
    programs: ["School Year 26–27"],
    balanceDue: 0,
    paidYtd: 12850,
    nextDue: { date: "May 1, 2026", amount: 1800, label: "Apr Tuition" },
    autopayOn: true,
    paymentMethod: "ACH ·••• 7721",
    status: "current",
    summer: [],
    schoolYear: buildSchoolYearMonths(8),
    upcoming: [
      {
        id: "u6",
        label: "Apr Tuition",
        amount: 1800,
        dueDate: "May 1, 2026",
        program: "School Year 26–27",
        status: "scheduled",
      },
    ],
  },
  {
    id: "fb6",
    parentId: "p8",
    name: "Yuki Nakamura",
    email: "kenji.n@email.com",
    initials: "YN",
    color: "#06B6D4",
    children: ["Lily Nakamura"],
    programs: ["Summer 2026", "School Year 26–27"],
    balanceDue: 900,
    paidYtd: 15400,
    nextDue: { date: "Apr 15, 2026", amount: 900, label: "Week 4" },
    autopayOn: false,
    paymentMethod: "Visa ·••• 5510",
    status: "invoice_sent",
    summer: buildSummerWeeks(3, 3),
    schoolYear: buildSchoolYearMonths(7),
    upcoming: [
      {
        id: "u7",
        label: "Week 4",
        amount: 900,
        dueDate: "Apr 15, 2026",
        program: "Summer 2026",
        status: "sent",
      },
    ],
  },
  {
    id: "fb7",
    name: "Angela Lee",
    email: "alee@email.com",
    initials: "AL",
    color: "#EF4444",
    children: ["Sebastian Lee"],
    programs: ["Summer 2026", "School Year 26–27"],
    balanceDue: 3600,
    paidYtd: 8900,
    nextDue: { date: "Apr 2, 2026", amount: 1800, label: "Feb Tuition (failed)" },
    autopayOn: true,
    paymentMethod: "Visa ·••• 1102",
    status: "failed_payment",
    hasFailedPayment: true,
    summer: buildSummerWeeks(4),
    schoolYear: buildSchoolYearMonths(4, undefined, 5),
    upcoming: [
      {
        id: "u8",
        label: "Feb Tuition (retry)",
        amount: 1800,
        dueDate: "Apr 8, 2026",
        program: "School Year 26–27",
        status: "overdue",
      },
    ],
  },
  {
    id: "fb8",
    name: "David Wright",
    email: "dwright@email.com",
    initials: "DW",
    color: "#8B5CF6",
    children: ["Mason Wright"],
    programs: ["Summer 2026", "School Year 26–27"],
    balanceDue: 900,
    paidYtd: 7200,
    nextDue: { date: "Apr 5, 2026", amount: 900, label: "Week 3 (processing)" },
    autopayOn: false,
    paymentMethod: "ACH ·••• 3390",
    status: "invoice_sent",
    summer: buildSummerWeeks(2),
    schoolYear: buildSchoolYearMonths(3),
    upcoming: [
      {
        id: "u9",
        label: "Week 3",
        amount: 900,
        dueDate: "Apr 5, 2026",
        program: "Summer 2026",
        status: "sent",
      },
    ],
  },
  {
    id: "fb9",
    name: "Jennifer Chen",
    email: "jchen@email.com",
    initials: "JC",
    color: "#A855F7",
    children: ["Ava Chen"],
    programs: ["Summer 2026"],
    balanceDue: 0,
    paidYtd: 5900,
    nextDue: { date: "May 3, 2026", amount: 900, label: "Week 5" },
    autopayOn: true,
    paymentMethod: "Visa ·••• 6677",
    status: "current",
    summer: buildSummerWeeks(4),
    schoolYear: [],
    upcoming: [
      {
        id: "u10",
        label: "Week 5",
        amount: 900,
        dueDate: "May 3, 2026",
        program: "Summer 2026",
        status: "scheduled",
      },
    ],
  },
  {
    id: "fb10",
    name: "Priya Patel",
    email: "ppatel@email.com",
    initials: "PP",
    color: "#14B8A6",
    children: ["Raj Patel"],
    programs: ["School Year 26–27"],
    balanceDue: 1800,
    paidYtd: 11100,
    nextDue: { date: "Apr 1, 2026", amount: 1800, label: "Feb Tuition" },
    autopayOn: true,
    paymentMethod: "ACH ·••• 4488",
    status: "invoice_sent",
    summer: [],
    schoolYear: buildSchoolYearMonths(5, 5),
    upcoming: [
      {
        id: "u11",
        label: "Feb Tuition",
        amount: 1800,
        dueDate: "Apr 1, 2026",
        program: "School Year 26–27",
        status: "sent",
      },
    ],
  },
];

let ACTIVE_DEMO_STUDENTS: DemoStudent[] = DEMO_STUDENTS_P2.slice(0, ROOTED_MEADOWS_ADMIN_COMPACT_ROWS);
let ACTIVE_DEMO_PARENTS: DemoParent[] = DEMO_PARENTS.slice(0, ROOTED_MEADOWS_ADMIN_COMPACT_ROWS);
let ACTIVE_DEMO_FAMILIES: DemoFamilyBilling[] = DEMO_FAMILY_BILLING.slice(0, ROOTED_MEADOWS_ADMIN_COMPACT_ROWS);
let ACTIVE_DEMO_LEADS: DemoLead[] = DEMO_LEADS.slice(0, ROOTED_MEADOWS_ADMIN_COMPACT_ROWS);

type TuitionFilter = "all" | "overdue" | "upcoming" | "autopay_off" | "at_risk";

function getFamilyTransactions(payerName: string) {
  return DEMO_TRANSACTIONS.filter((tx) => tx.payerName === payerName);
}

function countOutstandingTuition(): number {
  let count = 0;
  for (const family of ACTIVE_DEMO_FAMILIES) {
    for (const item of [...family.summer, ...family.schoolYear]) {
      if (
        item.state === "unpaid" ||
        item.state === "sent" ||
        item.state === "overdue"
      ) {
        count++;
      }
    }
  }
  return count;
}

function computeTuitionKPIs() {
  const outstandingBalance = ACTIVE_DEMO_FAMILIES.reduce(
    (s, f) => s + f.balanceDue,
    0,
  );
  const dueThisWeek = ACTIVE_DEMO_FAMILIES.flatMap((f) => f.upcoming).filter(
    (u) => u.status === "sent" || u.status === "overdue",
  );
  const dueThisWeekAmount = dueThisWeek.reduce((s, u) => s + u.amount, 0);
  const collectedThisMonth = DEMO_TRANSACTIONS.filter(
    (tx) => tx.status === "succeeded" && tx.date.includes("Apr"),
  ).reduce((s, tx) => s + tx.amount, 0);
  const atRiskFamilies = ACTIVE_DEMO_FAMILIES.filter(
    (f) =>
      f.hasFailedPayment ||
      f.status === "overdue" ||
      f.status === "failed_payment" ||
      (!f.autopayOn && f.balanceDue > 0),
  ).length;
  return {
    outstandingBalance,
    dueThisWeekCount: dueThisWeek.length,
    dueThisWeekAmount,
    collectedThisMonth,
    atRiskFamilies,
  };
}

function familyBillingStatusLabel(status: FamilyBillingStatus): string {
  if (status === "current") return "Current";
  if (status === "invoice_sent") return "Invoice sent";
  if (status === "overdue") return "Overdue";
  if (status === "failed_payment") return "Failed payment";
  return status;
}

function familyBillingStatusColors(status: FamilyBillingStatus) {
  if (status === "current")
    return { bg: C.successBg, border: C.successBorder, text: C.success };
  if (status === "invoice_sent")
    return { bg: C.warningBg, border: C.warningBorder, text: C.warning };
  if (status === "overdue")
    return { bg: C.errorBg, border: C.errorBorder, text: C.error };
  return { bg: C.errorBg, border: C.errorBorder, text: C.error };
}

function findFamilyByPayerName(name: string): DemoFamilyBilling | undefined {
  return ACTIVE_DEMO_FAMILIES.find((f) => f.name === name);
}

type ReminderChannel = "email" | "sms";
type ReminderTemplateId = "friendly" | "overdue" | "custom";

function getReminderEligibleFamilies() {
  return ACTIVE_DEMO_FAMILIES.filter((f) => f.balanceDue > 0);
}

function getFamilyPhone(family: DemoFamilyBilling): string | null {
  if (!family.parentId) return null;
  const parent = ACTIVE_DEMO_PARENTS.find((p) => p.id === family.parentId);
  return parent?.g1Phone ?? null;
}

function familyFirstName(family: DemoFamilyBilling): string {
  return family.name.split(" ")[0] ?? family.name;
}

function renderReminderPreview(text: string, family: DemoFamilyBilling): string {
  const balance = `$${family.balanceDue.toLocaleString()}`;
  const child = family.children[0]?.split(" ")[0] ?? "your child";
  return text
    .replace(/\[First Name\]/g, familyFirstName(family))
    .replace(/\[Balance Due\]/g, balance)
    .replace(/\[Next Due Date\]/g, family.nextDue?.date ?? "—")
    .replace(/\[Child Name\]/g, child);
}

function applyReminderTemplate(
  templateId: ReminderTemplateId,
  family?: DemoFamilyBilling,
): { emailSubject: string; emailBody: string; smsBody: string } {
  if (templateId === "overdue") {
    return {
      emailSubject: "Action needed — overdue tuition balance",
      emailBody:
        "Hi [First Name],\n\nOur records show an outstanding balance of [Balance Due] on your account. The payment for [Next Due Date] was due and has not yet been received.\n\nPlease log in to your parent portal to pay now, or reply to this email if you need assistance.\n\nThank you,\nMud Kitchen",
      smsBody:
        "Hi [First Name], your Mud Kitchen tuition balance of [Balance Due] is overdue. Pay at your parent portal. Reply STOP to opt out.",
    };
  }
  if (templateId === "custom") {
    return { emailSubject: "", emailBody: "", smsBody: "" };
  }
  const dueHint = family?.nextDue ? ` on ${family.nextDue.date}` : "";
  return {
    emailSubject: "Friendly reminder — tuition payment due",
    emailBody: `Hi [First Name],\n\nThis is a friendly reminder that your tuition payment of [Balance Due] for [Child Name] is coming up${dueHint}.\n\nYou can pay online in your parent portal at any time.\n\nThank you,\nMud Kitchen`,
    smsBody:
      "Hi [First Name], friendly reminder: tuition of [Balance Due] is due soon. Pay in your parent portal. Reply STOP to opt out.",
  };
}

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
    planned: 2600,
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

type BudgetPeriod = "mtd" | "qtd" | "ytd" | "year";

const PERIOD_MULTIPLIERS: Record<BudgetPeriod, number> = {
  mtd: 0.12,
  qtd: 0.32,
  ytd: 0.72,
  year: 1,
};

const PERIOD_LABELS: Record<BudgetPeriod, string> = {
  mtd: "MTD",
  qtd: "QTD",
  ytd: "YTD",
  year: "School Year",
};

function sumByCategory(
  expenses: DemoExpenseItem[],
): Record<string, number> {
  return expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});
}

function revenueMixFromIncome(income: DemoIncomeItem[]) {
  const bySource = income.reduce<Record<string, number>>((acc, item) => {
    acc[item.source] = (acc[item.source] ?? 0) + item.amount;
    return acc;
  }, {});
  const total = Object.values(bySource).reduce((s, v) => s + v, 0);
  const colors: Record<string, string> = {
    Tuition: C.accent,
    Deposit: C.info,
    Donation: C.warning,
  };
  return REVENUE_SOURCES.map((label) => ({
    label,
    amount: bySource[label] ?? 0,
    pct: total > 0 ? Math.round(((bySource[label] ?? 0) / total) * 100) : 0,
    color: colors[label] ?? C.textTertiary,
  })).filter((s) => s.amount > 0);
}

function budgetHealth(cats: typeof BUDGET_CATS) {
  const totalPlanned = cats.reduce((s, c) => s + c.planned, 0);
  const totalActual = cats.reduce((s, c) => s + c.actual, 0);
  const totalVariance = totalPlanned - totalActual;
  const overCount = cats.filter((c) => c.actual > c.planned).length;
  const pctUsed = Math.round((totalActual / totalPlanned) * 100);
  let score = 100;
  score -= overCount * 8;
  score -= Math.max(0, pctUsed - 85) * 0.5;
  score = Math.min(100, Math.max(40, Math.round(score)));
  const under = totalVariance >= 0;
  const summary = under
    ? `You're $${Math.abs(totalVariance).toLocaleString()} under annual plan${overCount > 0 ? ` — ${overCount} categor${overCount === 1 ? "y needs" : "ies need"} attention` : ""}.`
    : `You're $${Math.abs(totalVariance).toLocaleString()} over annual plan across ${overCount} categor${overCount === 1 ? "y" : "ies"}.`;
  return {
    score,
    summary,
    totalVariance,
    totalPlanned,
    totalActual,
    overCount,
    pctUsed,
    under,
  };
}

const DEMO_NET_PROFIT = 15480;
const DEMO_BURN_RATE = 2653;

type DemoExpenseItem = {
  id: string;
  category: (typeof BUDGET_CATS)[number]["name"];
  description: string;
  amount: number;
  date: string;
  receipt: string | null;
  vendor: string;
  paymentMethod: (typeof REVENUE_PAYMENT_METHODS)[number];
  status: "paid" | "pending";
  reference?: string | null;
  notes?: string;
};

const INITIAL_DEMO_EXPENSES: DemoExpenseItem[] = [
  {
    id: "ex1",
    category: "Personnel",
    description: "Teacher salaries — March",
    amount: 5800,
    date: "Mar 31, 2026",
    receipt: "payroll_mar.pdf",
    vendor: "Sunshine Montessori LLC",
    paymentMethod: "ACH",
    status: "paid" as const,
    reference: "ACH-PAYROLL-MAR",
  },
  {
    id: "ex2",
    category: "Facilities",
    description: "Monthly rent",
    amount: 1400,
    date: "Apr 1, 2026",
    receipt: "rent_apr.pdf",
    vendor: "Oak Street Properties",
    paymentMethod: "Check",
    status: "paid" as const,
  },
  {
    id: "ex3",
    category: "Program Supplies",
    description: "Art & craft materials Q2",
    amount: 487,
    date: "Mar 28, 2026",
    receipt: "michaels_receipt.pdf",
    vendor: "Michaels",
    paymentMethod: "Card",
    status: "paid" as const,
  },
  {
    id: "ex4",
    category: "Operations",
    description: "Liability insurance — Q2",
    amount: 620,
    date: "Apr 1, 2026",
    receipt: "insurance_q2.pdf",
    vendor: "State Farm",
    paymentMethod: "ACH",
    status: "paid" as const,
  },
  {
    id: "ex5",
    category: "Personnel",
    description: "Aide support hours — March",
    amount: 1280,
    date: "Mar 31, 2026",
    receipt: "aide_mar.pdf",
    vendor: "Sunshine Montessori LLC",
    paymentMethod: "ACH",
    status: "paid" as const,
  },
  {
    id: "ex6",
    category: "Marketing",
    description: "Spring flyer printing",
    amount: 180,
    date: "Mar 22, 2026",
    receipt: "print_shop.pdf",
    vendor: "Local Print Co.",
    paymentMethod: "Card",
    status: "paid" as const,
  },
  {
    id: "ex7",
    category: "Facilities",
    description: "Utilities — March",
    amount: 312,
    date: "Mar 31, 2026",
    receipt: null,
    vendor: "City Power & Gas",
    paymentMethod: "ACH",
    status: "paid" as const,
  },
  {
    id: "ex8",
    category: "Program Supplies",
    description: "Curriculum workbooks",
    amount: 224,
    date: "Mar 15, 2026",
    receipt: "curriculum.pdf",
    vendor: "Handwriting Without Tears",
    paymentMethod: "Card",
    status: "paid" as const,
  },
  {
    id: "ex9",
    category: "Operations",
    description: "Software subscriptions (Zoom, G Suite)",
    amount: 89,
    date: "Apr 1, 2026",
    receipt: null,
    vendor: "Google / Zoom",
    paymentMethod: "Card",
    status: "pending" as const,
  },
  {
    id: "ex10",
    category: "Personnel",
    description: "Staff professional development",
    amount: 400,
    date: "Mar 20, 2026",
    receipt: "pd_workshop.pdf",
    vendor: "Montessori Institute",
    paymentMethod: "Check",
    status: "paid" as const,
  },
];

const EXP_STATUS_COLORS: Record<
  DemoExpenseItem["status"],
  { bg: string; border: string; text: string }
> = {
  paid: { bg: C.successBg, border: C.successBorder, text: C.success },
  pending: { bg: C.warningBg, border: C.warningBorder, text: C.warning },
};

const REVENUE_SOURCES = ["Tuition", "Deposit", "Donation"] as const;
const REVENUE_PAYMENT_METHODS = ["ACH", "Check", "Card"] as const;

type DemoIncomeItem = {
  id: string;
  source: (typeof REVENUE_SOURCES)[number];
  description: string;
  amount: number;
  date: string;
  program: string;
  payer: string;
  paymentMethod: "ACH" | "Check" | "Card";
  status: "received" | "pending";
  reference?: string | null;
  notes?: string;
  receipt?: string | null;
  familyId?: string;
};

const INITIAL_DEMO_INCOME: DemoIncomeItem[] = [
  {
    id: "in1",
    source: "Tuition",
    description: "April tuition — school year families",
    amount: 21600,
    date: "Apr 1, 2026",
    program: "school_year_26_27",
    payer: "School year families (batch)",
    paymentMethod: "ACH",
    status: "pending",
    reference: "ACH-BATCH-APR-SY",
  },
  {
    id: "in2",
    source: "Tuition",
    description: "April tuition — summer families",
    amount: 8100,
    date: "Apr 1, 2026",
    program: "summer_26",
    payer: "Summer families (batch)",
    paymentMethod: "ACH",
    status: "received",
  },
  {
    id: "in3",
    source: "Tuition",
    description: "March tuition — school year families",
    amount: 21600,
    date: "Mar 1, 2026",
    program: "school_year_26_27",
    payer: "School year families (batch)",
    paymentMethod: "ACH",
    status: "received",
  },
  {
    id: "in4",
    source: "Deposit",
    description: "Enrollment deposits — spring cycle",
    amount: 3500,
    date: "Mar 18, 2026",
    program: "both",
    payer: "Multi-family (deposits)",
    paymentMethod: "Card",
    status: "received",
    reference: "DEP-SPRING-2026",
    notes: "Held until enrollment start dates.",
  },
  {
    id: "in5",
    source: "Tuition",
    description: "Feb tuition — school year families",
    amount: 19800,
    date: "Feb 1, 2026",
    program: "school_year_26_27",
    payer: "School year families (batch)",
    paymentMethod: "ACH",
    status: "received",
  },
  {
    id: "in6",
    source: "Donation",
    description: "Annual fund contribution — Anonymous",
    amount: 2500,
    date: "Mar 10, 2026",
    program: "",
    payer: "Anonymous donor",
    paymentMethod: "Check",
    status: "received",
    receipt: "donation_mar10.pdf",
  },
  {
    id: "in7",
    source: "Tuition",
    description: "Jan tuition — school year families",
    amount: 19800,
    date: "Jan 1, 2026",
    program: "school_year_26_27",
    payer: "School year families (batch)",
    paymentMethod: "ACH",
    status: "received",
  },
  {
    id: "in8",
    source: "Donation",
    description: "Spring gala proceeds",
    amount: 4200,
    date: "Feb 22, 2026",
    program: "",
    payer: "PTA / Gala committee",
    paymentMethod: "Card",
    status: "received",
    receipt: "gala_proceeds.pdf",
  },
];

const REV_STATUS_COLORS: Record<
  DemoIncomeItem["status"],
  { bg: string; border: string; text: string }
> = {
  received: { bg: C.successBg, border: C.successBorder, text: C.success },
  pending: { bg: C.warningBg, border: C.warningBorder, text: C.warning },
};

const REVENUE_PROGRAM_FILTERS = [
  { key: "all", label: "All programs" },
  { key: "summer_26", label: "Summer 2026" },
  { key: "school_year_26_27", label: "School Year" },
  { key: "both", label: "Both Programs" },
] as const;

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

type AutomationFilter = "all" | AutomationPipeline["status"];

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

// ─── Tuition page ──────────────────────────────────────────────────────────────

function scheduleItemStateLabel(state: TuitionScheduleItem["state"]) {
  if (state === "paid") return "Paid";
  if (state === "sent") return "Invoice sent";
  if (state === "overdue") return "Overdue";
  return "Due";
}

function TransactionDetailPanel({
  tx,
  onClose,
}: {
  tx: (typeof DEMO_TRANSACTIONS)[0];
  onClose: () => void;
}) {
  return (
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
        <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
          Transaction Detail
        </h3>
        <button onClick={onClose} style={{ color: C.textTertiary }}>
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div
          className="rounded-sm p-4"
          style={{
            backgroundColor: C.surface,
            border: `1px solid ${C.border}`,
          }}
        >
          <p
            className="text-2xl font-bold tabular-nums mb-1"
            style={{ color: C.textPrimary }}
          >
            ${tx.amount.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize"
              style={{
                backgroundColor: TX_TYPE_COLORS[tx.type]?.bg,
                color: TX_TYPE_COLORS[tx.type]?.text,
              }}
            >
              {tx.type}
            </span>
            <span
              className="px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize"
              style={{
                backgroundColor: TX_STATUS_COLORS[tx.status]?.bg,
                border: `1px solid ${TX_STATUS_COLORS[tx.status]?.border}`,
                color: TX_STATUS_COLORS[tx.status]?.text,
              }}
            >
              {tx.status}
            </span>
          </div>
        </div>
        <div>
          <DetailField label="Payer" value={tx.payerName} />
          <DetailField label="Email" value={tx.payerEmail} />
          <DetailField label="Child" value={tx.childName} />
          <DetailField label="Program" value={tx.program} />
          <DetailField
            label="Method"
            value={<span className="uppercase">{tx.method}</span>}
          />
          <DetailField label="Date" value={tx.date} />
        </div>
        <div
          className="rounded-sm p-3"
          style={{
            backgroundColor: C.surface,
            border: `1px solid ${C.border}`,
          }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: C.textTertiary }}
          >
            Stripe ID
          </p>
          <p className="text-xs font-mono" style={{ color: C.textSecondary }}>
            {tx.stripeId}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

type ScheduleProgramKey = "summer" | "schoolYear";

function PaymentScheduleSheet({
  family,
  programLabel,
  items,
  onClose,
}: {
  family: DemoFamilyBilling;
  programLabel: string;
  items: TuitionScheduleItem[];
  onClose: () => void;
}) {
  const fmt = (n: number) => `$${n.toLocaleString()}`;
  const paid = items.filter((i) => i.state === "paid").length;

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="absolute inset-y-0 right-0 flex flex-col overflow-hidden shadow-lg"
      style={{
        width: 380,
        backgroundColor: C.surface,
        borderLeft: `1px solid ${C.border}`,
        zIndex: 20,
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div className="min-w-0">
          <h3 className="text-sm font-semibold truncate" style={{ color: C.textPrimary }}>
            {programLabel}
          </h3>
          <p className="text-xs mt-0.5 truncate" style={{ color: C.textTertiary }}>
            {family.name} · {paid}/{items.length} paid
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-sm"
          style={{ color: C.textTertiary }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.map((item, i) => (
          <div
            key={i}
            className="px-5 py-3"
            style={{
              borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  backgroundColor:
                    item.state === "paid"
                      ? C.successBg
                      : item.state === "sent" || item.state === "overdue"
                        ? C.warningBg
                        : "transparent",
                  border: `2px solid ${
                    item.state === "paid"
                      ? C.success
                      : item.state === "overdue"
                        ? C.error
                        : item.state === "sent"
                          ? C.warning
                          : C.border
                  }`,
                }}
              >
                {item.state === "paid" && (
                  <CheckCircle className="w-3 h-3" style={{ color: C.success }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                    {item.label}
                  </p>
                  <p
                    className="text-sm font-bold tabular-nums flex-shrink-0"
                    style={{ color: C.textPrimary }}
                  >
                    {fmt(item.amount)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span
                    className="text-[10px] font-semibold"
                    style={{
                      color:
                        item.state === "paid"
                          ? C.success
                          : item.state === "overdue"
                            ? C.error
                            : item.state === "sent"
                              ? C.warning
                              : C.textTertiary,
                    }}
                  >
                    {scheduleItemStateLabel(item.state)}
                    {item.date ? ` · ${item.date}` : ""}
                  </span>
                  {(item.state === "unpaid" || item.state === "overdue") && (
                    <button
                      type="button"
                      className="text-[10px] font-semibold px-2 py-1 rounded-sm flex-shrink-0"
                      style={demoSecondaryButtonStyle()}
                    >
                      Send invoice
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function TuitionReminderModal({
  initialFamilyIds,
  onClose,
}: {
  initialFamilyIds?: string[];
  onClose: () => void;
}) {
  const defaultSelected =
    initialFamilyIds !== undefined
      ? initialFamilyIds
      : getReminderEligibleFamilies().map((f) => f.id);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedFamilyIds, setSelectedFamilyIds] =
    useState<string[]>(defaultSelected);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [channels, setChannels] = useState<ReminderChannel[]>(["email"]);
  const [templateId, setTemplateId] = useState<ReminderTemplateId>("friendly");
  const [emailSubject, setEmailSubject] = useState(
    () => applyReminderTemplate("friendly").emailSubject,
  );
  const [emailBody, setEmailBody] = useState(
    () => applyReminderTemplate("friendly").emailBody,
  );
  const [smsBody, setSmsBody] = useState(
    () => applyReminderTemplate("friendly").smsBody,
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const selectedFamilies = ACTIVE_DEMO_FAMILIES.filter((f) =>
    selectedFamilyIds.includes(f.id),
  );
  const previewFamily = selectedFamilies[0] ?? ACTIVE_DEMO_FAMILIES[0];

  const filteredRecipients = ACTIVE_DEMO_FAMILIES.filter((f) => {
    const q = recipientSearch.toLowerCase();
    if (q === "") return true;
    return (
      f.name.toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q) ||
      f.children.some((c) => c.toLowerCase().includes(q))
    );
  });

  const smsReachCount = selectedFamilies.filter((f) => getFamilyPhone(f)).length;

  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(onClose, 1500);
    return () => clearTimeout(t);
  }, [sent, onClose]);

  function toggleFamily(id: string) {
    setSelectedFamilyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function selectAllWithBalance() {
    setSelectedFamilyIds(getReminderEligibleFamilies().map((f) => f.id));
  }

  function toggleChannel(ch: ReminderChannel) {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch],
    );
  }

  function applyTemplate(id: ReminderTemplateId) {
    setTemplateId(id);
    const t = applyReminderTemplate(id, previewFamily);
    setEmailSubject(t.emailSubject);
    setEmailBody(t.emailBody);
    setSmsBody(t.smsBody);
  }

  function handleSend() {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 800);
  }

  const stepLabels = ["Recipients", "Channels", "Message"] as const;
  const channelSummary =
    channels.length === 2
      ? "email and SMS"
      : channels[0] === "sms"
        ? "SMS"
        : "email";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.35)", zIndex: 50 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col overflow-hidden w-full"
        style={{
          maxWidth: 520,
          maxHeight: "min(90vh, 640px)",
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: C.r.xl,
          boxShadow: C.shadowMedium,
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div>
            <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
              Send tuition reminders
            </h3>
            <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
              {sent
                ? "Done"
                : `Step ${step} of 3 · ${stepLabels[step - 1]}`}
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ color: C.textTertiary }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {!sent && (
          <div
            className="flex items-center gap-1 px-5 py-3 flex-shrink-0"
            style={{ borderBottom: `1px solid ${C.border}` }}
          >
            {stepLabels.map((label, i) => {
              const n = (i + 1) as 1 | 2 | 3;
              const active = step === n;
              const done = step > n;
              return (
                <div key={label} className="flex items-center gap-1 flex-1">
                  <div
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold w-full justify-center"
                    style={{
                      backgroundColor: active
                        ? C.accentLight
                        : done
                          ? C.successBg
                          : C.elevated,
                      color: active ? C.accent : done ? C.success : C.textTertiary,
                      border: `1px solid ${active ? C.accent + "44" : C.border}`,
                    }}
                  >
                    {done ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <span>{n}</span>
                    )}
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-0">
          {sent ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <CheckCircle className="w-12 h-12 mb-4" style={{ color: C.success }} />
              <p className="text-base font-semibold mb-1" style={{ color: C.textPrimary }}>
                Reminders sent
              </p>
              <p className="text-sm" style={{ color: C.textSecondary }}>
                Sent to {selectedFamilies.length}{" "}
                {selectedFamilies.length === 1 ? "family" : "families"} via{" "}
                {channelSummary}
              </p>
            </div>
          ) : step === 1 ? (
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-sm"
                  style={{
                    backgroundColor: C.input,
                    border: `1px solid ${C.inputBorder}`,
                  }}
                >
                  <Search className="w-3 h-3 flex-shrink-0" style={{ color: C.textTertiary }} />
                  <input
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    placeholder="Search families..."
                    className="bg-transparent border-none outline-none text-xs w-full"
                    style={{ color: C.textPrimary }}
                  />
                </div>
                <button
                  type="button"
                  onClick={selectAllWithBalance}
                  className="text-[10px] font-semibold px-2 py-1.5 rounded-sm whitespace-nowrap"
                  style={demoSecondaryButtonStyle()}
                >
                  Select with balance
                </button>
              </div>
              <p className="text-xs" style={{ color: C.textTertiary }}>
                {selectedFamilyIds.length}{" "}
                {selectedFamilyIds.length === 1 ? "family" : "families"} selected
              </p>
              <div
                className="rounded-sm overflow-hidden"
                style={{ border: `1px solid ${C.border}` }}
              >
                {filteredRecipients.map((family, i) => {
                  const checked = selectedFamilyIds.includes(family.id);
                  const sc = familyBillingStatusColors(family.status);
                  return (
                    <button
                      key={family.id}
                      type="button"
                      onClick={() => toggleFamily(family.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                      style={{
                        borderBottom:
                          i < filteredRecipients.length - 1
                            ? `1px solid ${C.border}`
                            : "none",
                        backgroundColor: checked ? C.accentLight : C.surface,
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: checked ? C.accent : "transparent",
                          border: `2px solid ${checked ? C.accent : C.border}`,
                        }}
                      >
                        {checked && (
                          <span className="text-white text-[10px] font-bold">✓</span>
                        )}
                      </div>
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                        style={{
                          backgroundColor: family.color + "22",
                          color: family.color,
                        }}
                      >
                        {family.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: C.textPrimary }}
                        >
                          {family.name}
                        </p>
                        <p className="text-[10px] truncate" style={{ color: C.textTertiary }}>
                          {family.email}
                        </p>
                      </div>
                      <span
                        className="text-xs font-bold tabular-nums flex-shrink-0"
                        style={{
                          color: family.balanceDue > 0 ? C.error : C.textSecondary,
                        }}
                      >
                        {family.balanceDue > 0
                          ? `$${family.balanceDue.toLocaleString()}`
                          : "Paid up"}
                      </span>
                      <span
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: sc.bg,
                          border: `1px solid ${sc.border}`,
                          color: sc.text,
                        }}
                      >
                        {familyBillingStatusLabel(family.status)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : step === 2 ? (
            <div className="p-5 space-y-3">
              <p className="text-xs" style={{ color: C.textSecondary }}>
                Choose how to reach {selectedFamilies.length}{" "}
                {selectedFamilies.length === 1 ? "family" : "families"}. At least
                one channel is required.
              </p>
              {(
                [
                  {
                    id: "email" as const,
                    icon: <Mail className="w-4 h-4" />,
                    label: "Email",
                    detail: `${selectedFamilies.length} with email on file`,
                  },
                  {
                    id: "sms" as const,
                    icon: <MessageSquare className="w-4 h-4" />,
                    label: "SMS",
                    detail:
                      smsReachCount > 0
                        ? `${smsReachCount} with mobile on file`
                        : "No mobile numbers on file for selected families",
                  },
                ] as const
              ).map((ch) => {
                const on = channels.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => toggleChannel(ch.id)}
                    className="w-full flex items-center gap-3 p-4 rounded-sm text-left transition-colors"
                    style={{
                      backgroundColor: on ? C.accentLight : C.surface,
                      border: `1px solid ${on ? C.accent + "55" : C.border}`,
                      boxShadow: on ? C.shadowCard : "none",
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: on ? C.accent : "transparent",
                        border: `2px solid ${on ? C.accent : C.border}`,
                      }}
                    >
                      {on && (
                        <span className="text-white text-[10px] font-bold">✓</span>
                      )}
                    </div>
                    <span style={{ color: on ? C.accent : C.textTertiary }}>
                      {ch.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                        {ch.label}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: C.textTertiary }}>
                        {ch.detail}
                      </p>
                    </div>
                  </button>
                );
              })}
              {channels.includes("sms") && (
                <p className="text-[10px]" style={{ color: C.textTertiary }}>
                  SMS includes opt-out language. Families without a mobile number
                  will receive email only.
                </p>
              )}
            </div>
          ) : (
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["friendly", "Friendly reminder"],
                    ["overdue", "Overdue notice"],
                    ["custom", "Custom"],
                  ] as [ReminderTemplateId, string][]
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => applyTemplate(id)}
                    className="px-2.5 py-1 text-[10px] font-semibold rounded-full"
                    style={demoSolidPillStyle(templateId === id)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {channels.includes("email") && (
                <div className="space-y-2">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: C.textTertiary }}
                  >
                    Email
                  </p>
                  <input
                    value={emailSubject}
                    onChange={(e) => {
                      setTemplateId("custom");
                      setEmailSubject(e.target.value);
                    }}
                    placeholder="Subject"
                    className="w-full px-3 py-2 text-xs rounded-sm outline-none"
                    style={demoInputStyle()}
                  />
                  <textarea
                    value={emailBody}
                    onChange={(e) => {
                      setTemplateId("custom");
                      setEmailBody(e.target.value);
                    }}
                    rows={5}
                    placeholder="Email body..."
                    className="w-full px-3 py-2 text-xs rounded-sm outline-none resize-none"
                    style={demoInputStyle()}
                  />
                </div>
              )}

              {channels.includes("sms") && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p
                      className="text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: C.textTertiary }}
                    >
                      SMS
                    </p>
                    <span className="text-[10px]" style={{ color: C.textTertiary }}>
                      {smsBody.length}/160
                    </span>
                  </div>
                  <textarea
                    value={smsBody}
                    onChange={(e) => {
                      setTemplateId("custom");
                      setSmsBody(e.target.value);
                    }}
                    rows={3}
                    placeholder="SMS message..."
                    className="w-full px-3 py-2 text-xs rounded-sm outline-none resize-none"
                    style={demoInputStyle()}
                  />
                </div>
              )}

              <div
                className="rounded-sm p-3 space-y-1"
                style={{
                  backgroundColor: C.bg,
                  border: `1px solid ${C.border}`,
                }}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: C.textTertiary }}
                >
                  Preview · {previewFamily.name}
                </p>
                {channels.includes("email") && emailSubject && (
                  <p className="text-xs font-medium" style={{ color: C.textPrimary }}>
                    {renderReminderPreview(emailSubject, previewFamily)}
                  </p>
                )}
                <p
                  className="text-xs whitespace-pre-wrap"
                  style={{ color: C.textSecondary }}
                >
                  {renderReminderPreview(
                    channels.includes("email") ? emailBody : smsBody,
                    previewFamily,
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {!sent && (
          <div
            className="flex items-center justify-between gap-2 px-5 py-4 flex-shrink-0"
            style={{ borderTop: `1px solid ${C.border}` }}
          >
            <button
              type="button"
              onClick={() => (step === 1 ? onClose() : setStep((step - 1) as 1 | 2 | 3))}
              className="px-3 py-2 text-xs font-semibold rounded-sm"
              style={demoSecondaryButtonStyle()}
            >
              {step === 1 ? "Cancel" : "Back"}
            </button>
            {step < 3 ? (
              <button
                type="button"
                disabled={
                  (step === 1 && selectedFamilyIds.length === 0) ||
                  (step === 2 && channels.length === 0)
                }
                onClick={() => setStep((step + 1) as 1 | 2 | 3)}
                className="px-4 py-2 text-xs font-semibold rounded-sm disabled:opacity-40"
                style={{
                  backgroundColor: C.accent,
                  color: "#fff",
                  border: `1px solid ${C.accent}`,
                }}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                disabled={
                  sending ||
                  selectedFamilyIds.length === 0 ||
                  channels.length === 0 ||
                  (channels.includes("email") &&
                    (!emailSubject.trim() || !emailBody.trim())) ||
                  (channels.includes("sms") && !smsBody.trim())
                }
                onClick={handleSend}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-sm disabled:opacity-40"
                style={{
                  backgroundColor: C.accent,
                  color: "#fff",
                  border: `1px solid ${C.accent}`,
                }}
              >
                {sending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send to {selectedFamilyIds.length}{" "}
                    {selectedFamilyIds.length === 1 ? "family" : "families"}
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {step === 2 && channels.length === 0 && (
          <p
            className="text-[10px] text-center pb-3 px-5"
            style={{ color: C.warning }}
          >
            Select at least one delivery channel to continue.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

function TuitionPage({
  selectedFamilyId,
  initialFilter = "all",
  onSelectFamily,
}: {
  selectedFamilyId?: string;
  initialFilter?: TuitionFilter;
  onSelectFamily?: (id: string) => void;
}) {
  const kpis = computeTuitionKPIs();
  const [filter, setFilter] = useState<TuitionFilter>(initialFilter);
  const [search, setSearch] = useState("");
  const [selectedFamily, setSelectedFamily] = useState<DemoFamilyBilling>(
    () =>
      ACTIVE_DEMO_FAMILIES.find((f) => f.id === selectedFamilyId) ??
      ACTIVE_DEMO_FAMILIES[0],
  );
  const [selectedTx, setSelectedTx] = useState<
    (typeof DEMO_TRANSACTIONS)[0] | null
  >(null);
  const [openScheduleKey, setOpenScheduleKey] =
    useState<ScheduleProgramKey | null>(null);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderInitialIds, setReminderInitialIds] = useState<
    string[] | undefined
  >(undefined);
  const { openBackdrop, closeBackdrop } = useContext(BackdropContext);

  const openReminderModal = useCallback((familyIds?: string[]) => {
    setSelectedTx(null);
    setOpenScheduleKey(null);
    setReminderInitialIds(familyIds);
    setReminderModalOpen(true);
  }, []);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    if (selectedFamilyId) {
      const match = ACTIVE_DEMO_FAMILIES.find((f) => f.id === selectedFamilyId);
      if (match) {
        setSelectedFamily(match);
        setOpenScheduleKey(null);
      }
    }
  }, [selectedFamilyId]);

  useEffect(() => {
    if (selectedTx || openScheduleKey) {
      openBackdrop(() => {
        setSelectedTx(null);
        setOpenScheduleKey(null);
      });
    } else {
      closeBackdrop();
    }
  }, [selectedTx, openScheduleKey, openBackdrop, closeBackdrop]);

  useEffect(() => {
    if (reminderModalOpen) {
      setSelectedTx(null);
      setOpenScheduleKey(null);
      closeBackdrop();
    }
  }, [reminderModalOpen, closeBackdrop]);

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  const filteredFamilies = ACTIVE_DEMO_FAMILIES.filter((f) => {
    const q = search.toLowerCase();
    const matchesSearch =
      q === "" ||
      f.name.toLowerCase().includes(q) ||
      f.children.some((c) => c.toLowerCase().includes(q));
    if (!matchesSearch) return false;
    if (filter === "all") return true;
    if (filter === "overdue")
      return f.status === "overdue" || f.status === "failed_payment";
    if (filter === "upcoming") return f.upcoming.length > 0;
    if (filter === "autopay_off") return !f.autopayOn;
    if (filter === "at_risk")
      return (
        f.hasFailedPayment ||
        f.status === "overdue" ||
        f.status === "failed_payment" ||
        (!f.autopayOn && f.balanceDue > 0)
      );
    return true;
  });

  const selectFamily = (family: DemoFamilyBilling) => {
    setSelectedFamily(family);
    setOpenScheduleKey(null);
    onSelectFamily?.(family.id);
  };

  const familyTx = getFamilyTransactions(selectedFamily.name);
  const statusColors = familyBillingStatusColors(selectedFamily.status);
  const remindersCount = ACTIVE_DEMO_FAMILIES.filter(
    (f) => f.balanceDue > 0,
  ).length;

  const schedulePrograms = [
    { key: "summer", label: "Summer 2026", items: selectedFamily.summer },
    {
      key: "schoolYear",
      label: "School Year 26–27",
      items: selectedFamily.schoolYear,
    },
  ].filter(
    (p): p is { key: ScheduleProgramKey; label: string; items: TuitionScheduleItem[] } =>
      p.items.length > 0,
  );

  const openScheduleProgram = schedulePrograms.find(
    (p) => p.key === openScheduleKey,
  );

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      <div
        className="flex-shrink-0 px-6 pt-6 pb-4 space-y-4"
        style={{
          borderBottom: `1px solid ${C.border}`,
          backgroundColor: C.surface,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-xl font-semibold tracking-tight"
              style={{ color: C.textPrimary }}
            >
              Tuition
            </h1>
            <p className="text-sm mt-0.5" style={{ color: C.textTertiary }}>
              {ACTIVE_DEMO_FAMILIES.length} enrolled families · payment status &
              history
            </p>
          </div>
          <button
            type="button"
            data-tour-id="tuition-bulk-remind"
            onClick={() => openReminderModal()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-[11px] font-semibold"
            style={{ backgroundColor: C.accent, color: "#fff" }}
          >
            <Send className="w-3.5 h-3.5" />
            {remindersCount > 0
              ? `Send reminders to ${remindersCount} families`
              : "Send reminders"}
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Outstanding balance",
              value: fmt(kpis.outstandingBalance),
              color: kpis.outstandingBalance > 0 ? C.error : C.success,
              icon: <DollarSign className="w-3.5 h-3.5" />,
            },
            {
              label: "Due this week",
              value: `${kpis.dueThisWeekCount} · ${fmt(kpis.dueThisWeekAmount)}`,
              color: C.warning,
              icon: <CalendarDays className="w-3.5 h-3.5" />,
            },
            {
              label: "Collected this month",
              value: fmt(kpis.collectedThisMonth),
              color: C.success,
              icon: <CheckCircle className="w-3.5 h-3.5" />,
            },
            {
              label: "At-risk families",
              value: String(kpis.atRiskFamilies),
              color: kpis.atRiskFamilies > 0 ? C.error : C.success,
              icon: <AlertCircle className="w-3.5 h-3.5" />,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-sm p-3"
              style={{
                backgroundColor: C.surface,
                border: `1px solid ${C.border}`,
                boxShadow: C.shadowCard,
              }}
            >
              <div
                className="flex items-center gap-1.5 mb-1"
                style={{ color: s.color }}
              >
                {s.icon}
                <p
                  className="text-[10px] font-medium"
                  style={{ color: C.textTertiary }}
                >
                  {s.label}
                </p>
              </div>
              <p
                className="text-lg font-bold tabular-nums"
                style={{ color: s.color }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div
          className="w-72 flex-shrink-0 flex flex-col overflow-hidden"
          style={{ borderRight: `1px solid ${C.border}` }}
        >
          <div
            className="px-4 py-3 space-y-2 flex-shrink-0"
            style={{ borderBottom: `1px solid ${C.border}` }}
          >
            <div className="flex flex-wrap gap-1">
              {(
                [
                  ["all", "All"],
                  ["overdue", "Overdue"],
                  ["upcoming", "Upcoming"],
                  ["autopay_off", "Autopay off"],
                  ["at_risk", "At risk"],
                ] as [TuitionFilter, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className="px-2 py-1 text-[10px] font-semibold rounded-full transition-colors"
                  style={{
                    backgroundColor: filter === key ? C.accentLight : C.elevated,
                    color: filter === key ? C.accent : C.textTertiary,
                    border: `1px solid ${filter === key ? C.accent + "44" : C.border}`,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm"
              style={{
                backgroundColor: C.input,
                border: `1px solid ${C.inputBorder}`,
              }}
            >
              <Search
                className="w-3 h-3 flex-shrink-0"
                style={{ color: C.textTertiary }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search families..."
                className="bg-transparent border-none outline-none text-xs w-full"
                style={{ color: C.textPrimary }}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto" data-tour-id="tuition-family-list">
            {filteredFamilies.map((family) => {
              const isActive = selectedFamily.id === family.id;
              const sc = familyBillingStatusColors(family.status);
              return (
                <button
                  key={family.id}
                  type="button"
                  onClick={() => selectFamily(family)}
                  className="w-full text-left px-3 py-3 transition-colors"
                  style={{
                    borderBottom: `1px solid ${C.border}`,
                    borderLeft: `2px solid ${isActive ? C.accent : "transparent"}`,
                    backgroundColor: isActive ? C.accentLight : "transparent",
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{
                        backgroundColor: family.color + "22",
                        color: family.color,
                      }}
                    >
                      {family.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: C.textPrimary }}
                      >
                        {family.name}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {family.children.map((child) => (
                          <span
                            key={child}
                            className="text-[9px] px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: C.surface,
                              color: C.textSecondary,
                            }}
                          >
                            {child.split(" ")[0]}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-1.5 gap-2">
                        <span
                          className="text-xs font-bold tabular-nums"
                          style={{
                            color:
                              family.balanceDue > 0 ? C.error : C.textSecondary,
                          }}
                        >
                          {family.balanceDue > 0
                            ? fmt(family.balanceDue)
                            : "Paid up"}
                        </span>
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: sc.bg,
                            border: `1px solid ${sc.border}`,
                            color: sc.text,
                          }}
                        >
                          {familyBillingStatusLabel(family.status)}
                        </span>
                      </div>
                      <p
                        className="text-[9px] mt-1"
                        style={{
                          color: family.autopayOn ? C.success : C.warning,
                        }}
                      >
                        Autopay {family.autopayOn ? "on" : "off"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
          style={{ backgroundColor: C.surface }}
        >
          <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">
            <div
              className="rounded-sm p-5"
              style={{
                backgroundColor: C.surface,
                border: `1px solid ${C.border}`,
                boxShadow: C.shadowCard,
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                    style={{ color: C.textTertiary }}
                  >
                    Account summary
                  </p>
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: C.textPrimary }}
                  >
                    {selectedFamily.name}
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
                    {selectedFamily.email} · {selectedFamily.programs.join(" · ")}
                  </p>
                </div>
                <span
                  className="text-[10px] font-semibold px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: statusColors.bg,
                    border: `1px solid ${statusColors.border}`,
                    color: statusColors.text,
                  }}
                >
                  {familyBillingStatusLabel(selectedFamily.status)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p
                    className="text-[10px] uppercase tracking-wide mb-1"
                    style={{ color: C.textTertiary }}
                  >
                    Balance due
                  </p>
                  <p
                    className="text-2xl font-bold tabular-nums"
                    style={{
                      color:
                        selectedFamily.balanceDue > 0 ? C.error : C.success,
                    }}
                  >
                    {fmt(selectedFamily.balanceDue)}
                  </p>
                </div>
                <div>
                  <p
                    className="text-[10px] uppercase tracking-wide mb-1"
                    style={{ color: C.textTertiary }}
                  >
                    Paid YTD
                  </p>
                  <p
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: C.textPrimary }}
                  >
                    {fmt(selectedFamily.paidYtd)}
                  </p>
                </div>
                <div>
                  <p
                    className="text-[10px] uppercase tracking-wide mb-1"
                    style={{ color: C.textTertiary }}
                  >
                    Next due
                  </p>
                  {selectedFamily.nextDue ? (
                    <>
                      <p
                        className="text-sm font-semibold tabular-nums"
                        style={{ color: C.textPrimary }}
                      >
                        {fmt(selectedFamily.nextDue.amount)}
                      </p>
                      <p className="text-xs" style={{ color: C.textTertiary }}>
                        {selectedFamily.nextDue.label} ·{" "}
                        {selectedFamily.nextDue.date}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm" style={{ color: C.success }}>
                      All clear
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs mb-4">
                <span style={{ color: C.textSecondary }}>
                  Autopay:{" "}
                  <strong style={{ color: C.textPrimary }}>
                    {selectedFamily.autopayOn ? "On" : "Off"}
                  </strong>
                </span>
                {selectedFamily.paymentMethod && (
                  <span style={{ color: C.textTertiary }}>
                    · {selectedFamily.paymentMethod}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openReminderModal([selectedFamily.id])}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-[11px] font-semibold"
                  style={{ backgroundColor: C.accent, color: "#fff" }}
                >
                  <Send className="w-3.5 h-3.5" />
                  Send reminder
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-[11px] font-semibold"
                  style={demoSecondaryButtonStyle()}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Record payment
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-[11px] font-semibold"
                  style={demoSecondaryButtonStyle()}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Send invoice
                </button>
              </div>
            </div>

            <div>
              <SectionLabel>Upcoming</SectionLabel>
              {selectedFamily.upcoming.length === 0 ? (
                <p className="text-sm py-2" style={{ color: C.textTertiary }}>
                  No upcoming charges in the next 60 days.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedFamily.upcoming.map((item) => {
                    const paidSummer = selectedFamily.summer.filter(
                      (s) => s.state === "paid",
                    ).length;
                    const totalSummer = selectedFamily.summer.length;
                    const paidSchool = selectedFamily.schoolYear.filter(
                      (s) => s.state === "paid",
                    ).length;
                    const totalSchool = selectedFamily.schoolYear.length;
                    const isSummer = item.program.includes("Summer");
                    const paid = isSummer ? paidSummer : paidSchool;
                    const total = isSummer ? totalSummer : totalSchool;
                    const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
                    return (
                      <div
                        key={item.id}
                        className="rounded-sm p-3"
                        style={{
                          backgroundColor: C.surface,
                          border: `1px solid ${C.border}`,
                          boxShadow: C.shadowCard,
                        }}
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div>
                            <p
                              className="text-sm font-medium"
                              style={{ color: C.textPrimary }}
                            >
                              {item.label}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: C.textTertiary }}
                            >
                              {item.program} · Due {item.dueDate}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className="text-sm font-bold tabular-nums"
                              style={{ color: C.textPrimary }}
                            >
                              {fmt(item.amount)}
                            </p>
                            <span
                              className="text-[9px] font-semibold capitalize"
                              style={{
                                color:
                                  item.status === "overdue"
                                    ? C.error
                                    : item.status === "sent"
                                      ? C.warning
                                      : C.textTertiary,
                              }}
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>
                        {total > 0 && (
                          <div>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span style={{ color: C.textTertiary }}>
                                {item.program} progress
                              </span>
                              <span style={{ color: C.textSecondary }}>
                                {paid}/{total} paid
                              </span>
                            </div>
                            <div
                              className="h-1.5 rounded-full overflow-hidden"
                              style={{ backgroundColor: C.input }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: C.accent,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <SectionLabel>Payment history</SectionLabel>
              {familyTx.length === 0 ? (
                <p className="text-sm py-2" style={{ color: C.textTertiary }}>
                  No payments recorded yet.
                </p>
              ) : (
                <div
                  className="rounded-sm overflow-hidden"
                  style={{
                    border: `1px solid ${C.border}`,
                    backgroundColor: C.surface,
                    boxShadow: C.shadowCard,
                  }}
                >
                  {familyTx.map((tx, i) => {
                    const sc = TX_STATUS_COLORS[tx.status] ?? {
                      bg: C.input,
                      border: C.border,
                      text: C.textTertiary,
                    };
                    return (
                      <button
                        key={tx.id}
                        type="button"
                        onClick={() => {
                          setOpenScheduleKey(null);
                          setSelectedTx(tx);
                        }}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors"
                        style={{
                          borderBottom:
                            i < familyTx.length - 1
                              ? `1px solid ${C.border}`
                              : "none",
                          backgroundColor: C.surface,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = C.accentLight)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = C.surface)
                        }
                      >
                        <div className="min-w-0">
                          <p
                            className="text-sm font-medium capitalize truncate"
                            style={{ color: C.textPrimary }}
                          >
                            {tx.type} · {tx.childName}
                          </p>
                          <p className="text-xs" style={{ color: C.textTertiary }}>
                            {tx.date}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className="text-sm font-bold tabular-nums"
                            style={{ color: C.textPrimary }}
                          >
                            {fmt(tx.amount)}
                          </span>
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full capitalize"
                            style={{
                              backgroundColor: sc.bg,
                              border: `1px solid ${sc.border}`,
                              color: sc.text,
                            }}
                          >
                            {tx.status}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <SectionLabel>Payment schedule</SectionLabel>
              {schedulePrograms.length === 0 ? (
                <p className="text-sm py-2" style={{ color: C.textTertiary }}>
                  No payment schedule on file.
                </p>
              ) : (
                <div className="space-y-2">
                  {schedulePrograms.map((program) => {
                    const paid = program.items.filter(
                      (i) => i.state === "paid",
                    ).length;
                    const pct =
                      program.items.length > 0
                        ? Math.round((paid / program.items.length) * 100)
                        : 0;
                    const isOpen = openScheduleKey === program.key;
                    return (
                      <button
                        key={program.key}
                        type="button"
                        onClick={() => {
                          setSelectedTx(null);
                          setOpenScheduleKey(program.key);
                        }}
                        className="w-full rounded-sm p-4 text-left transition-colors"
                        style={{
                          backgroundColor: isOpen ? C.accentLight : C.surface,
                          border: `1px solid ${isOpen ? C.accent + "44" : C.border}`,
                          boxShadow: C.shadowCard,
                        }}
                        onMouseEnter={(e) => {
                          if (!isOpen)
                            e.currentTarget.style.backgroundColor = C.accentLight;
                        }}
                        onMouseLeave={(e) => {
                          if (!isOpen)
                            e.currentTarget.style.backgroundColor = C.surface;
                        }}
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <p
                            className="text-sm font-medium"
                            style={{ color: C.textPrimary }}
                          >
                            {program.label}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className="text-xs tabular-nums"
                              style={{ color: C.textTertiary }}
                            >
                              {paid}/{program.items.length} paid
                            </span>
                            <ChevronRight
                              className="w-4 h-4"
                              style={{ color: C.textTertiary }}
                            />
                          </div>
                        </div>
                        <div
                          className="h-1.5 rounded-full overflow-hidden"
                          style={{ backgroundColor: C.input }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: C.accent,
                            }}
                          />
                        </div>
                        <p
                          className="text-[11px] font-medium mt-2"
                          style={{ color: C.accent }}
                        >
                          View schedule
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedTx && (
          <TransactionDetailPanel
            tx={selectedTx}
            onClose={() => setSelectedTx(null)}
          />
        )}
        {openScheduleProgram && (
          <PaymentScheduleSheet
            family={selectedFamily}
            programLabel={openScheduleProgram.label}
            items={openScheduleProgram.items}
            onClose={() => setOpenScheduleKey(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reminderModalOpen && (
          <TuitionReminderModal
            key={reminderInitialIds?.join(",") ?? "bulk"}
            initialFamilyIds={reminderInitialIds}
            onClose={() => setReminderModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Transactions page ─────────────────────────────────────────────────────────

function formatTxProgram(program: string) {
  if (program === "school_year") return "School Year";
  if (program === "summer") return "Summer";
  if (program === "both") return "Both";
  return program;
}

function TransactionsPage({
  onNavigateToTuition,
}: {
  onNavigateToTuition?: (familyId: string) => void;
}) {
  const [selectedTx, setSelectedTx] = useState<
    (typeof DEMO_TRANSACTIONS)[0] | null
  >(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const { openBackdrop, closeBackdrop } = useContext(BackdropContext);

  useEffect(() => {
    if (selectedTx) openBackdrop(() => setSelectedTx(null));
    else closeBackdrop();
  }, [selectedTx, openBackdrop, closeBackdrop]);

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  const collectedThisMonth = DEMO_TRANSACTIONS.filter(
    (tx) => tx.status === "succeeded" && tx.date.includes("Apr"),
  ).reduce((s, tx) => s + tx.amount, 0);
  const processingTx = DEMO_TRANSACTIONS.filter(
    (tx) => tx.status === "processing",
  );
  const failedTx = DEMO_TRANSACTIONS.filter((tx) => tx.status === "failed");
  const processingAmount = processingTx.reduce((s, tx) => s + tx.amount, 0);
  const attentionCount = processingTx.length + failedTx.length;

  const filteredTx = DEMO_TRANSACTIONS.filter((tx) => {
    const q = search.toLowerCase();
    if (
      q &&
      !tx.payerName.toLowerCase().includes(q) &&
      !tx.payerEmail.toLowerCase().includes(q) &&
      !tx.childName.toLowerCase().includes(q)
    ) {
      return false;
    }
    if (typeFilter !== "all" && tx.type !== typeFilter) return false;
    if (statusFilter !== "all" && tx.status !== statusFilter) return false;
    if (programFilter !== "all" && tx.program !== programFilter) return false;
    if (
      attentionOnly &&
      tx.status !== "processing" &&
      tx.status !== "failed"
    ) {
      return false;
    }
    return true;
  });

  return (
    <div
      className="relative flex h-full flex-col"
      style={{ backgroundColor: C.surface }}
    >
      <div className="flex-shrink-0 px-6 pt-6 pb-4 space-y-4">
        <div>
          <h1
            className="text-xl font-semibold tracking-tight"
            style={{ color: C.textPrimary }}
          >
            Transactions
          </h1>
          <p className="text-sm mt-0.5" style={{ color: C.textTertiary }}>
            School-wide payment ledger · {DEMO_TRANSACTIONS.length} records
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Collected this month",
              value: fmt(collectedThisMonth),
              color: C.success,
            },
            {
              label: "Processing",
              value: `${processingTx.length} · ${fmt(processingAmount)}`,
              color: C.warning,
            },
            {
              label: "Failed",
              value: String(failedTx.length),
              color: failedTx.length > 0 ? C.error : C.textSecondary,
            },
            {
              label: "Refunds",
              value: "0",
              color: C.textSecondary,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-sm p-3"
              style={{
                backgroundColor: C.elevated,
                border: `1px solid ${C.border}`,
              }}
            >
              <p
                className="text-[10px] font-medium mb-1"
                style={{ color: C.textTertiary }}
              >
                {s.label}
              </p>
              <p
                className="text-lg font-bold tabular-nums"
                style={{ color: s.color }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {attentionCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setAttentionOnly(true);
              setStatusFilter("all");
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-sm text-xs font-medium text-left"
            style={{
              backgroundColor: C.warningBg,
              border: `1px solid ${C.warningBorder}`,
              color: C.warning,
            }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {attentionCount} payment{attentionCount > 1 ? "s" : ""} need
            attention — tap to filter
          </button>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm min-w-[180px]"
            style={{
              backgroundColor: C.input,
              border: `1px solid ${C.inputBorder}`,
            }}
          >
            <Search
              className="w-3 h-3 flex-shrink-0"
              style={{ color: C.textTertiary }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search payer, child..."
              className="bg-transparent border-none outline-none text-xs w-full"
              style={{ color: C.textPrimary }}
            />
          </div>
          {[
            {
              id: "type",
              value: typeFilter,
              set: setTypeFilter,
              options: [
                ["all", "All types"],
                ["tuition", "Tuition"],
                ["deposit", "Deposit"],
                ["registration", "Registration"],
              ],
            },
            {
              id: "status",
              value: statusFilter,
              set: setStatusFilter,
              options: [
                ["all", "All status"],
                ["succeeded", "Succeeded"],
                ["processing", "Processing"],
                ["failed", "Failed"],
              ],
            },
            {
              id: "program",
              value: programFilter,
              set: setProgramFilter,
              options: [
                ["all", "All programs"],
                ["summer", "Summer"],
                ["school_year", "School Year"],
                ["both", "Both"],
              ],
            },
          ].map((f) => (
            <select
              key={f.id}
              value={f.value}
              onChange={(e) => {
                f.set(e.target.value);
                setAttentionOnly(false);
              }}
              className="text-xs px-2 py-1.5 rounded-sm outline-none"
              style={{
                backgroundColor: C.input,
                border: `1px solid ${C.inputBorder}`,
                color: C.textPrimary,
              }}
            >
              {f.options.map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          ))}
          {attentionOnly && (
            <button
              type="button"
              onClick={() => setAttentionOnly(false)}
              className="text-[10px] font-semibold px-2 py-1 rounded"
              style={demoSecondaryButtonStyle()}
            >
              Clear attention filter
            </button>
          )}
        </div>
      </div>

      <div
        className="relative min-h-0 flex-1 overflow-hidden"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        <div className="h-full overflow-y-auto overflow-x-auto">
          <table className="w-full text-sm">
            <thead
              className="sticky top-0 z-[1]"
              style={{ backgroundColor: C.surface }}
            >
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {[
                  "Type",
                  "Status",
                  "Payer",
                  "Child",
                  "Program",
                  "Amount",
                  "Method",
                  "Date",
                ].map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 text-xs font-medium"
                    style={{ color: C.textTertiary }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTx.map((tx, i) => {
                const tc = TX_TYPE_COLORS[tx.type] ?? {
                  bg: C.elevated,
                  text: C.textTertiary,
                };
                const sc = TX_STATUS_COLORS[tx.status] ?? {
                  bg: C.elevated,
                  border: C.border,
                  text: C.textTertiary,
                };
                const family = findFamilyByPayerName(tx.payerName);
                const needsAttention =
                  tx.status === "processing" || tx.status === "failed";
                return (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedTx(tx)}
                    className="cursor-pointer"
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                      backgroundColor: needsAttention
                        ? tx.status === "failed"
                          ? C.errorBg
                          : C.warningBg
                        : "transparent",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = needsAttention
                        ? tx.status === "failed"
                          ? C.errorBg
                          : C.warningBg
                        : C.elevated)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = needsAttention
                        ? tx.status === "failed"
                          ? C.errorBg
                          : C.warningBg
                        : "transparent")
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
                      {family && onNavigateToTuition ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToTuition(family.id);
                          }}
                          className="text-left"
                        >
                          <p
                            className="font-medium text-sm underline-offset-2 hover:underline"
                            style={{ color: C.accent }}
                          >
                            {tx.payerName}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: C.textTertiary }}
                          >
                            {tx.payerEmail}
                          </p>
                        </button>
                      ) : (
                        <>
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
                        </>
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{ color: C.textSecondary }}
                    >
                      {tx.childName}
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{ color: C.textSecondary }}
                    >
                      {formatTxProgram(tx.program)}
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

      <AnimatePresence>
        {selectedTx && (
          <TransactionDetailPanel
            tx={selectedTx}
            onClose={() => setSelectedTx(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Budget page ───────────────────────────────────────────────────────────────

type BudgetTab =
  | "overview"
  | "expenses"
  | "revenue"
  | "insights"
  | "transactions"
  | "payroll";

type BudgetNavigateOptions = {
  expenseCategory?: string;
  revenuePendingOnly?: boolean;
};

type TuitionNavigateOptions = {
  familyId?: string;
  filter?: TuitionFilter;
};

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
      className="rounded-sm p-4 flex flex-col items-center text-center"
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

const DEMO_CURRENT_MONTH = "Apr";

function BudgetExpensesTab({
  categoryFilter,
  onCategoryFilterChange,
}: {
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
}) {
  const [expenses, setExpenses] =
    useState<DemoExpenseItem[]>(INITIAL_DEMO_EXPENSES);
  const [selectedExp, setSelectedExp] = useState<DemoExpenseItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [missingReceiptOnly, setMissingReceiptOnly] = useState(false);
  const [dateFilter, setDateFilter] = useState<"all" | "mar" | "apr">("all");
  const { openBackdrop, closeBackdrop } = useContext(BackdropContext);

  useEffect(() => {
    if (isAdding) {
      openBackdrop(() => setIsAdding(false));
    } else if (selectedExp) {
      openBackdrop(() => setSelectedExp(null));
    } else {
      closeBackdrop();
    }
  }, [isAdding, selectedExp, openBackdrop, closeBackdrop]);

  const handleAddSave = (item: DemoExpenseItem) => {
    setExpenses((prev) => [item, ...prev]);
    setIsAdding(false);
    setSelectedExp(item);
  };

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return expenses.filter((exp) => {
      const catMatch =
        categoryFilter === "all" || exp.category === categoryFilter;
      const searchMatch =
        !q ||
        exp.description.toLowerCase().includes(q) ||
        exp.vendor.toLowerCase().includes(q) ||
        (exp.reference?.toLowerCase().includes(q) ?? false);
      const receiptMatch = !missingReceiptOnly || exp.receipt === null;
      const dateMatch =
        dateFilter === "all" ||
        (dateFilter === "mar" && exp.date.startsWith("Mar")) ||
        (dateFilter === "apr" && exp.date.startsWith("Apr"));
      return catMatch && searchMatch && receiptMatch && dateMatch;
    });
  }, [expenses, categoryFilter, search, missingReceiptOnly, dateFilter]);

  const kpis = useMemo(() => {
    const ytd = filtered.reduce((s, e) => s + e.amount, 0);
    const monthTotal = filtered
      .filter((e) => e.date.startsWith(DEMO_CURRENT_MONTH))
      .reduce((s, e) => s + e.amount, 0);
    const missingReceipts = filtered.filter((e) => e.receipt === null).length;
    const byCat = filtered.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {});
    const topEntry = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
    return {
      ytd,
      monthTotal,
      missingReceipts,
      topCategory: topEntry?.[0] ?? "—",
      topAmount: topEntry?.[1] ?? 0,
    };
  }, [filtered]);

  const hasActiveFilters = missingReceiptOnly || dateFilter !== "all";

  const categoryOptions = [
    { key: "all", label: "All" },
    ...BUDGET_CATS.map((c) => ({ key: c.name, label: c.name })),
  ];

  return (
    <div
      className="relative flex h-full flex-col"
      style={{ backgroundColor: C.surface }}
    >
      <div
        className="flex flex-shrink-0 flex-wrap items-center gap-2 px-6 py-3"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {categoryOptions.map((opt) => {
            const isActive = categoryFilter === opt.key;
            const count =
              opt.key === "all"
                ? expenses.length
                : expenses.filter((e) => e.category === opt.key).length;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onCategoryFilterChange(opt.key)}
                className="rounded-sm px-2.5 py-1 text-xs font-medium transition-all"
                style={demoSolidPillStyle(isActive)}
              >
                {opt.label}
                <span className="ml-1 text-[10px] font-bold opacity-70">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div
          className="flex flex-shrink-0 items-center gap-2"
          style={{ minWidth: 200 }}
        >
          <div
            className="relative flex items-center"
            style={{ minWidth: 160 }}
          >
            <Search
              className="absolute left-2.5 h-3.5 w-3.5"
              style={{ color: C.textTertiary }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses…"
              className="w-full rounded-sm py-1.5 pl-8 pr-3 text-xs outline-none"
              style={{
                backgroundColor: C.input,
                border: `1px solid ${C.inputBorder}`,
                color: C.textPrimary,
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => setFilterPanelOpen(true)}
            className="relative flex flex-shrink-0 items-center justify-center rounded-sm p-2 transition-all"
            style={{
              backgroundColor: hasActiveFilters ? C.accentLight : C.input,
              color: hasActiveFilters ? C.accent : C.textSecondary,
              border: `1px solid ${hasActiveFilters ? C.accent : C.border}`,
            }}
            aria-label="Filter expenses"
          >
            <ListFilter className="h-4 w-4" />
            {hasActiveFilters && (
              <span
                className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: C.accent }}
              />
            )}
          </button>
          <DemoButton variant="secondary">
            <Download className="h-3.5 w-3.5" />
            Export
          </DemoButton>
          <DemoButton
            onClick={() => {
              setSelectedExp(null);
              setIsAdding(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add expense
          </DemoButton>
        </div>
      </div>

      <div
        className="flex flex-shrink-0 flex-wrap items-center gap-x-6 gap-y-2 px-6 py-2.5 text-xs"
        style={{
          borderBottom: `1px solid ${C.border}`,
          backgroundColor: C.surface,
        }}
      >
        {[
          { label: "YTD spend", value: fmt(kpis.ytd) },
          {
            label: `${DEMO_CURRENT_MONTH} spend`,
            value: fmt(kpis.monthTotal),
          },
          {
            label: "Missing receipts",
            value: String(kpis.missingReceipts),
            warn: kpis.missingReceipts > 0,
          },
          {
            label: "Top category",
            value:
              kpis.topAmount > 0
                ? `${kpis.topCategory} · ${fmt(kpis.topAmount)}`
                : "—",
          },
        ].map((k) => (
          <div key={k.label} className="flex items-center gap-2">
            <span style={{ color: C.textTertiary }}>{k.label}</span>
            <span
              className="font-semibold tabular-nums"
              style={{
                color: k.warn ? C.warning : C.textPrimary,
              }}
            >
              {k.value}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {filterPanelOpen && (
          <>
            <motion.div
              key="expenses-filter-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              style={{ backgroundColor: "rgba(0,0,0,0.12)", zIndex: 11 }}
              onClick={() => setFilterPanelOpen(false)}
            />
            <motion.div
              key="expenses-filters-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute top-0 right-0 bottom-0 flex flex-col"
              style={{
                width: 280,
                backgroundColor: C.surface,
                borderLeft: `1px solid ${C.border}`,
                zIndex: 12,
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
                  Filters
                </h3>
                <button
                  type="button"
                  onClick={() => setFilterPanelOpen(false)}
                  style={{ color: C.textTertiary }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 space-y-5 overflow-y-auto p-5">
                <div>
                  <p
                    className="mb-2 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: C.textTertiary }}
                  >
                    Date
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        { key: "all", label: "All time" },
                        { key: "mar", label: "March 2026" },
                        { key: "apr", label: "April 2026" },
                      ] as const
                    ).map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setDateFilter(d.key)}
                        className="rounded-sm px-2.5 py-1 text-xs font-medium"
                        style={demoSolidPillStyle(dateFilter === d.key)}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={missingReceiptOnly}
                    onChange={(e) => setMissingReceiptOnly(e.target.checked)}
                    className="rounded-sm"
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: C.textSecondary }}
                  >
                    Missing receipt only
                  </span>
                </label>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto overflow-x-auto">
          <table className="w-full text-sm">
            <thead
              className="sticky top-0 z-[1]"
              style={{ backgroundColor: C.surface }}
            >
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {[
                  "Date",
                  "Category",
                  "Description",
                  "Vendor",
                  "Amount",
                  "Payment",
                  "Reference",
                  "Status",
                  "Receipt",
                ].map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 text-xs font-medium"
                    style={{ color: C.textTertiary }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((exp, i) => {
                const sc = EXP_STATUS_COLORS[exp.status];
                return (
                  <motion.tr
                    key={exp.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => setSelectedExp(exp)}
                    className="cursor-pointer"
                    style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = C.elevated)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td
                      className="px-4 py-3 text-xs whitespace-nowrap"
                      style={{ color: C.textTertiary }}
                    >
                      {exp.date}
                    </td>
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
                      className="px-4 py-3 text-xs max-w-[200px] truncate"
                      style={{ color: C.textSecondary }}
                    >
                      {exp.description}
                    </td>
                    <td
                      className="px-4 py-3 text-xs whitespace-nowrap"
                      style={{ color: C.textPrimary }}
                    >
                      {exp.vendor}
                    </td>
                    <td
                      className="px-4 py-3 text-sm font-bold tabular-nums whitespace-nowrap"
                      style={{ color: C.error }}
                    >
                      {fmt(exp.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 text-[10px] font-semibold rounded-full"
                        style={{
                          backgroundColor: C.surface,
                          color: C.textSecondary,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        {exp.paymentMethod}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-xs max-w-[120px] truncate"
                      style={{
                        color: exp.reference ? C.textSecondary : C.textTertiary,
                      }}
                    >
                      {exp.reference ?? "—"}
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
                        {exp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {exp.receipt ? (
                        <span
                          className="px-2 py-0.5 text-[10px] font-semibold rounded-full"
                          style={{
                            backgroundColor: C.infoBg,
                            color: C.info,
                          }}
                        >
                          Attached
                        </span>
                      ) : (
                        <span
                          className="px-2 py-0.5 text-[10px] font-semibold rounded-full"
                          style={{
                            backgroundColor: C.warningBg,
                            color: C.warning,
                          }}
                        >
                          Missing
                        </span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p
              className="py-12 text-center text-sm"
              style={{ color: C.textTertiary }}
            >
              No expenses match your filters.
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <RecordExpensePanel
            key="add-expense"
            onClose={() => setIsAdding(false)}
            onSave={handleAddSave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedExp && !isAdding && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 flex flex-col shadow-lg"
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
                Expense Detail
              </h3>
              <button
                type="button"
                onClick={() => setSelectedExp(null)}
                style={{ color: C.textTertiary }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div
                className="rounded-sm p-4"
                style={{
                  backgroundColor: C.surface,
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
                <span
                  className="mt-2 inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize"
                  style={{
                    backgroundColor: EXP_STATUS_COLORS[selectedExp.status].bg,
                    border: `1px solid ${EXP_STATUS_COLORS[selectedExp.status].border}`,
                    color: EXP_STATUS_COLORS[selectedExp.status].text,
                  }}
                >
                  {selectedExp.status}
                </span>
              </div>
              <DetailField
                label="Description"
                value={selectedExp.description}
              />
              <DetailField label="Vendor" value={selectedExp.vendor} />
              <DetailField label="Date" value={selectedExp.date} />
              <DetailField
                label="Payment"
                value={selectedExp.paymentMethod}
              />
              <DetailField
                label="Reference"
                value={selectedExp.reference ?? "—"}
              />
              {selectedExp.notes ? (
                <DetailField label="Notes" value={selectedExp.notes} />
              ) : null}
              <DetailField
                label="Receipt"
                value={
                  selectedExp.receipt ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-medium underline-offset-2 hover:underline"
                      style={{ color: C.info }}
                    >
                      <Download className="h-3 w-3" />
                      {selectedExp.receipt}
                    </button>
                  ) : (
                    <span style={{ color: C.warning }}>Missing</span>
                  )
                }
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const DEMO_REVENUE_TODAY_ISO = "2026-04-22";

function formatIncomeDateFromIso(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isoToDate(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

function dateToIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function RevenueDatePicker({
  value,
  onChange,
  inputStyle,
}: {
  value: string;
  onChange: (iso: string) => void;
  inputStyle: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = isoToDate(value);
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  useEffect(() => {
    if (!open) return;
    const sel = isoToDate(value);
    setViewYear(sel.getFullYear());
    setViewMonth(sel.getMonth());
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" },
  );

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const pickDay = (day: number) => {
    onChange(dateToIso(new Date(viewYear, viewMonth, day)));
    setOpen(false);
  };

  const isSelected = (day: number) =>
    selected.getFullYear() === viewYear &&
    selected.getMonth() === viewMonth &&
    selected.getDate() === day;

  const isToday = (day: number) => {
    const t = isoToDate(DEMO_REVENUE_TODAY_ISO);
    return (
      t.getFullYear() === viewYear &&
      t.getMonth() === viewMonth &&
      t.getDate() === day
    );
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm outline-none transition-colors"
        style={{
          ...inputStyle,
          color: C.textPrimary,
        }}
      >
        <span>{formatIncomeDateFromIso(value)}</span>
        <CalendarDays
          className="h-4 w-4 flex-shrink-0"
          style={{ color: open ? C.accent : C.textTertiary }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-30 mt-1 w-[300px] max-w-[calc(100vw-2rem)] rounded-sm p-4 shadow-lg"
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
              boxShadow: C.shadowMedium,
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={prevMonth}
                className="flex h-7 w-7 items-center justify-center rounded-sm transition-colors"
                style={{ color: C.textSecondary }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = C.elevated)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span
                className="text-xs font-semibold"
                style={{ color: C.textPrimary }}
              >
                {monthLabel}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="flex h-7 w-7 items-center justify-center rounded-sm transition-colors"
                style={{ color: C.textSecondary }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = C.elevated)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1">
              {WEEKDAY_LABELS.map((wd) => (
                <div
                  key={wd}
                  className="py-1 text-center text-[11px] font-medium"
                  style={{ color: C.textTertiary }}
                >
                  {wd}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) =>
                day === null ? (
                  <div key={`empty-${i}`} className="h-9" />
                ) : (
                  <button
                    key={day}
                    type="button"
                    onClick={() => pickDay(day)}
                    className="flex h-9 w-full items-center justify-center rounded-sm text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: isSelected(day)
                        ? C.accent
                        : isToday(day)
                          ? C.accentLight
                          : "transparent",
                      color: isSelected(day)
                        ? "#fff"
                        : isToday(day)
                          ? C.accent
                          : C.textSecondary,
                      border: isToday(day) && !isSelected(day)
                        ? `1px solid ${C.accent}`
                        : "1px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected(day))
                        e.currentTarget.style.backgroundColor = C.elevated;
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected(day))
                        e.currentTarget.style.backgroundColor = isToday(day)
                          ? C.accentLight
                          : "transparent";
                    }}
                  >
                    {day}
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                onChange(DEMO_REVENUE_TODAY_ISO);
                setOpen(false);
              }}
              className="mt-2 w-full rounded-sm py-1.5 text-[11px] font-medium transition-colors"
              style={{
                color: C.accent,
                backgroundColor: C.accentLight,
                border: `1px solid ${C.border}`,
              }}
            >
              Today
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function descriptionPlaceholderForSource(
  source: (typeof REVENUE_SOURCES)[number],
): string {
  if (source === "Tuition") return "e.g. April tuition payment";
  if (source === "Deposit") return "e.g. Enrollment deposit — spring cycle";
  return "e.g. Annual fund gift";
}

type RecordRevenueForm = {
  source: (typeof REVENUE_SOURCES)[number];
  amount: string;
  dateIso: string;
  status: DemoIncomeItem["status"];
  familyId: string;
  payer: string;
  program: string;
  paymentMethod: (typeof REVENUE_PAYMENT_METHODS)[number];
  description: string;
  reference: string;
  notes: string;
  receipt: string | null;
};

const RECORD_REVENUE_INITIAL: RecordRevenueForm = {
  source: "Tuition",
  amount: "",
  dateIso: DEMO_REVENUE_TODAY_ISO,
  status: "received",
  familyId: "",
  payer: "",
  program: "school_year_26_27",
  paymentMethod: "ACH",
  description: "",
  reference: "",
  notes: "",
  receipt: null,
};

function RevenueFormLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <p
      className="mb-1.5 text-xs font-semibold"
      style={{ color: C.textSecondary }}
    >
      {children}
      {required && (
        <span style={{ color: C.error }} className="ml-0.5">
          *
        </span>
      )}
    </p>
  );
}

const RECORD_REVENUE_STEPS = ["Payment", "Who paid", "Details"] as const;

function RecordRevenuePanel({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (item: DemoIncomeItem) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<RecordRevenueForm>(RECORD_REVENUE_INITIAL);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const patch = (p: Partial<RecordRevenueForm>) =>
    setForm((prev) => ({ ...prev, ...p }));

  const programRequired =
    form.source === "Tuition" || form.source === "Deposit";

  const amountNum = parseFloat(form.amount) || 0;
  const canContinueStep1 = amountNum > 0;
  const canContinueStep2 =
    form.payer.trim().length > 0 &&
    (!programRequired || form.program.length > 0);
  const canSave = canContinueStep1 && canContinueStep2;

  useEffect(() => {
    if (step === 1) {
      const t = setTimeout(() => amountInputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [step]);

  const handleFamilyChange = (familyId: string) => {
    if (!familyId) {
      patch({ familyId: "", payer: "" });
      return;
    }
    const parent = ACTIVE_DEMO_PARENTS.find((p) => p.id === familyId);
    if (!parent) return;
    const enrolled = parent.applications.find((a) => a.status === "enrolled");
    patch({
      familyId,
      payer: parent.name,
      program:
        form.source !== "Donation" && enrolled
          ? enrolled.program
          : form.program,
    });
  };

  const handleSourceChange = (source: (typeof REVENUE_SOURCES)[number]) => {
    patch({
      source,
      program:
        source === "Donation"
          ? ""
          : form.program || "school_year_26_27",
    });
  };

  const handleNext = () => {
    if (step === 1 && canContinueStep1) setStep(2);
    else if (step === 2 && canContinueStep2) setStep(3);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const handleSave = () => {
    if (!canSave) return;
    const item: DemoIncomeItem = {
      id: `in-${Date.now()}`,
      source: form.source,
      amount: amountNum,
      date: formatIncomeDateFromIso(form.dateIso),
      status: form.status,
      payer: form.payer.trim(),
      paymentMethod: form.paymentMethod,
      description:
        form.description.trim() ||
        descriptionPlaceholderForSource(form.source).replace(/^e\.g\. /, ""),
      program: form.source === "Donation" ? "" : form.program,
      reference: form.reference.trim() || null,
      notes: form.notes.trim() || undefined,
      receipt: form.receipt,
      familyId: form.familyId || undefined,
    };
    onSave(item);
  };

  const inputStyle: React.CSSProperties = demoInputStyle({
    borderRadius: C.r.sm,
  });

  const fmtAmount = (n: number) => `$${n.toLocaleString()}`;

  const disabledStyle = {
    opacity: 0.45,
    pointerEvents: "none" as const,
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="absolute inset-y-0 right-0 flex flex-col overflow-hidden"
      style={{
        width: 420,
        backgroundColor: C.surface,
        borderLeft: `1px solid ${C.border}`,
        zIndex: 20,
        boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
      }}
    >
      <div
        className="flex-shrink-0 px-5 pt-4 pb-3"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3
              className="text-sm font-semibold"
              style={{ color: C.textPrimary }}
            >
              Record revenue
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: C.textTertiary }}>
              Step {step} of 3 — {RECORD_REVENUE_STEPS[step - 1]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center rounded-md w-7 h-7"
            style={demoSecondaryButtonStyle({ color: C.textTertiary })}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-0">
          {([1, 2, 3] as const).map((n, i) => {
            const isDone = step > n;
            const isActive = step === n;
            return (
              <div
                key={n}
                className="flex items-center"
                style={{ flex: i < 2 ? 1 : "none" }}
              >
                <motion.div
                  animate={{ scale: isActive ? 1.12 : 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    width: 26,
                    height: 26,
                    backgroundColor: isDone
                      ? C.accentLight
                      : isActive
                        ? C.accent
                        : C.input,
                    border: `2px solid ${isDone || isActive ? C.accent : C.inputBorder}`,
                    color: isDone ? C.accent : isActive ? "#fff" : C.textTertiary,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {isDone ? <CheckCircle className="w-3 h-3" /> : n}
                </motion.div>
                {i < 2 && (
                  <div
                    className="flex-1 h-0.5 mx-1"
                    style={{
                      backgroundColor: step > n ? C.accent : C.border,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="rev-step-1"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-5"
            >
              <div>
                <RevenueFormLabel required>Source</RevenueFormLabel>
                <div className="flex flex-wrap gap-1.5">
                  {REVENUE_SOURCES.map((s) => {
                    const active = form.source === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSourceChange(s)}
                        className="rounded-sm px-2.5 py-1 text-xs font-medium"
                        style={demoSolidPillStyle(active)}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <RevenueFormLabel required>Amount</RevenueFormLabel>
                  <input
                    ref={amountInputRef}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => patch({ amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm outline-none [appearance:textfield] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <RevenueFormLabel required>Date received</RevenueFormLabel>
                  <RevenueDatePicker
                    value={form.dateIso}
                    onChange={(iso) => patch({ dateIso: iso })}
                    inputStyle={inputStyle}
                  />
                </div>
              </div>

              <div>
                <RevenueFormLabel required>Status</RevenueFormLabel>
                <div className="flex gap-1.5">
                  {(
                    [
                      { key: "received", label: "Received" },
                      { key: "pending", label: "Pending" },
                    ] as const
                  ).map((s) => {
                    const active = form.status === s.key;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => patch({ status: s.key })}
                        className="flex-1 rounded-sm py-1.5 text-xs font-medium"
                        style={demoLightPillStyle(active)}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="rev-step-2"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-5"
            >
              <div>
                <RevenueFormLabel>Family</RevenueFormLabel>
                <select
                  value={form.familyId}
                  onChange={(e) => handleFamilyChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                >
                  <option value="">Custom / other</option>
                  {ACTIVE_DEMO_PARENTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <RevenueFormLabel required>Payer name</RevenueFormLabel>
                <input
                  type="text"
                  value={form.payer}
                  onChange={(e) =>
                    patch({ payer: e.target.value, familyId: "" })
                  }
                  placeholder="Family or payer name"
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                />
              </div>

              {programRequired && (
                <div>
                  <RevenueFormLabel required>Program</RevenueFormLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {REVENUE_PROGRAM_FILTERS.filter((p) => p.key !== "all").map(
                      (p) => {
                        const active = form.program === p.key;
                        return (
                          <button
                            key={p.key}
                            type="button"
                            onClick={() => patch({ program: p.key })}
                            className="rounded-sm px-2.5 py-1 text-xs font-medium"
                            style={demoLightPillStyle(active)}
                          >
                            {p.label}
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

              <div>
                <RevenueFormLabel>Description</RevenueFormLabel>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => patch({ description: e.target.value })}
                  placeholder={descriptionPlaceholderForSource(form.source)}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="rev-step-3"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-5"
            >
              <motion.div
                initial={{ scale: 0.98, opacity: 0.85 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="rounded-sm p-4"
                style={{
                  backgroundColor: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                  style={{ color: C.textTertiary }}
                >
                  Summary
                </p>
                <p
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: C.success }}
                >
                  {fmtAmount(amountNum)}
                </p>
                <div className="mt-2 space-y-1 text-xs">
                  <p style={{ color: C.textSecondary }}>
                    <span style={{ color: C.textTertiary }}>Source: </span>
                    {form.source}
                  </p>
                  <p style={{ color: C.textSecondary }}>
                    <span style={{ color: C.textTertiary }}>Payer: </span>
                    {form.payer.trim() || "—"}
                  </p>
                  <p style={{ color: C.textSecondary }}>
                    <span style={{ color: C.textTertiary }}>Date: </span>
                    {formatIncomeDateFromIso(form.dateIso)}
                  </p>
                  <p style={{ color: C.textSecondary }}>
                    <span style={{ color: C.textTertiary }}>Status: </span>
                    <span className="capitalize">{form.status}</span>
                  </p>
                </div>
              </motion.div>

              <div>
                <RevenueFormLabel required>Payment method</RevenueFormLabel>
                <div className="flex flex-wrap gap-1.5">
                  {REVENUE_PAYMENT_METHODS.map((m) => {
                    const active = form.paymentMethod === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => patch({ paymentMethod: m })}
                        className="rounded-sm px-2.5 py-1 text-xs font-medium"
                        style={demoSolidPillStyle(active)}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <RevenueFormLabel>Reference #</RevenueFormLabel>
                <input
                  type="text"
                  value={form.reference}
                  onChange={(e) => patch({ reference: e.target.value })}
                  placeholder="Check no., transaction ID"
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <RevenueFormLabel>Internal notes</RevenueFormLabel>
                <textarea
                  value={form.notes}
                  onChange={(e) => patch({ notes: e.target.value })}
                  rows={2}
                  placeholder="Optional note for your team"
                  className="w-full resize-none px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <RevenueFormLabel>Receipt</RevenueFormLabel>
                {form.receipt ? (
                  <div
                    className="flex items-center justify-between rounded-sm px-3 py-2 text-xs"
                    style={{
                      backgroundColor: C.infoBg,
                      border: `1px solid ${C.infoBorder}`,
                      color: C.info,
                    }}
                  >
                    <span className="truncate">{form.receipt}</span>
                    <button
                      type="button"
                      onClick={() => patch({ receipt: null })}
                      className="ml-2 flex-shrink-0"
                      style={{ color: C.textTertiary }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <DemoButton
                    variant="ghost"
                    className="w-full justify-center"
                    onClick={() => patch({ receipt: "receipt_upload.pdf" })}
                  >
                    Attach receipt
                  </DemoButton>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className="flex flex-shrink-0 gap-2 px-5 py-4"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        {step === 1 ? (
          <>
            <DemoButton variant="ghost" className="flex-1" onClick={onClose}>
              Cancel
            </DemoButton>
            <DemoButton
              className="flex-1"
              onClick={handleNext}
              style={!canContinueStep1 ? disabledStyle : undefined}
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </DemoButton>
          </>
        ) : step === 2 ? (
          <>
            <DemoButton variant="ghost" className="flex-1" onClick={handleBack}>
              Back
            </DemoButton>
            <DemoButton
              className="flex-1"
              onClick={handleNext}
              style={!canContinueStep2 ? disabledStyle : undefined}
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </DemoButton>
          </>
        ) : (
          <>
            <DemoButton variant="ghost" className="flex-1" onClick={handleBack}>
              Back
            </DemoButton>
            <DemoButton
              className="flex-1"
              onClick={handleSave}
              style={!canSave ? disabledStyle : undefined}
            >
              Save revenue
            </DemoButton>
          </>
        )}
      </div>
    </motion.div>
  );
}

function descriptionPlaceholderForCategory(
  category: DemoExpenseItem["category"],
): string {
  if (category === "Personnel") return "e.g. Teacher salaries — April";
  if (category === "Facilities") return "e.g. Monthly rent";
  if (category === "Program Supplies") return "e.g. Art & craft materials Q2";
  if (category === "Operations") return "e.g. Liability insurance — Q2";
  if (category === "Marketing") return "e.g. Spring flyer printing";
  return "e.g. Miscellaneous supply purchase";
}

type RecordExpenseForm = {
  category: DemoExpenseItem["category"];
  amount: string;
  dateIso: string;
  status: DemoExpenseItem["status"];
  vendor: string;
  description: string;
  paymentMethod: (typeof REVENUE_PAYMENT_METHODS)[number];
  reference: string;
  notes: string;
  receipt: string | null;
};

const RECORD_EXPENSE_INITIAL: RecordExpenseForm = {
  category: "Operations",
  amount: "",
  dateIso: DEMO_REVENUE_TODAY_ISO,
  status: "paid",
  vendor: "",
  description: "",
  paymentMethod: "Card",
  reference: "",
  notes: "",
  receipt: null,
};

const RECORD_EXPENSE_STEPS = [
  "Expense",
  "Vendor & details",
  "Payment & docs",
] as const;

function RecordExpensePanel({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (item: DemoExpenseItem) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<RecordExpenseForm>(RECORD_EXPENSE_INITIAL);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const patch = (p: Partial<RecordExpenseForm>) =>
    setForm((prev) => ({ ...prev, ...p }));

  const amountNum = parseFloat(form.amount) || 0;
  const canContinueStep1 = amountNum > 0;
  const canContinueStep2 = form.vendor.trim().length > 0;
  const canSave = canContinueStep1 && canContinueStep2;

  useEffect(() => {
    if (step === 1) {
      const t = setTimeout(() => amountInputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [step]);

  const handleNext = () => {
    if (step === 1 && canContinueStep1) setStep(2);
    else if (step === 2 && canContinueStep2) setStep(3);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const handleSave = () => {
    if (!canSave) return;
    const item: DemoExpenseItem = {
      id: `ex-${Date.now()}`,
      category: form.category,
      amount: amountNum,
      date: formatIncomeDateFromIso(form.dateIso),
      status: form.status,
      vendor: form.vendor.trim(),
      paymentMethod: form.paymentMethod,
      description:
        form.description.trim() ||
        descriptionPlaceholderForCategory(form.category).replace(/^e\.g\. /, ""),
      reference: form.reference.trim() || null,
      notes: form.notes.trim() || undefined,
      receipt: form.receipt,
    };
    onSave(item);
  };

  const inputStyle: React.CSSProperties = demoInputStyle({
    borderRadius: C.r.sm,
  });

  const fmtAmount = (n: number) => `$${n.toLocaleString()}`;

  const disabledStyle = {
    opacity: 0.45,
    pointerEvents: "none" as const,
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="absolute inset-y-0 right-0 flex flex-col overflow-hidden"
      style={{
        width: 420,
        backgroundColor: C.surface,
        borderLeft: `1px solid ${C.border}`,
        zIndex: 20,
        boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
      }}
    >
      <div
        className="flex-shrink-0 px-5 pt-4 pb-3"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3
              className="text-sm font-semibold"
              style={{ color: C.textPrimary }}
            >
              Add expense
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: C.textTertiary }}>
              Step {step} of 3 — {RECORD_EXPENSE_STEPS[step - 1]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center rounded-md w-7 h-7"
            style={demoSecondaryButtonStyle({ color: C.textTertiary })}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-0">
          {([1, 2, 3] as const).map((n, i) => {
            const isDone = step > n;
            const isActive = step === n;
            return (
              <div
                key={n}
                className="flex items-center"
                style={{ flex: i < 2 ? 1 : "none" }}
              >
                <motion.div
                  animate={{ scale: isActive ? 1.12 : 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    width: 26,
                    height: 26,
                    backgroundColor: isDone
                      ? C.accentLight
                      : isActive
                        ? C.accent
                        : C.input,
                    border: `2px solid ${isDone || isActive ? C.accent : C.inputBorder}`,
                    color: isDone ? C.accent : isActive ? "#fff" : C.textTertiary,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {isDone ? <CheckCircle className="w-3 h-3" /> : n}
                </motion.div>
                {i < 2 && (
                  <div
                    className="flex-1 h-0.5 mx-1"
                    style={{
                      backgroundColor: step > n ? C.accent : C.border,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="exp-step-1"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-5"
            >
              <div>
                <RevenueFormLabel required>Category</RevenueFormLabel>
                <div className="flex flex-wrap gap-1.5">
                  {BUDGET_CATS.map((c) => {
                    const active = form.category === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => patch({ category: c.name })}
                        className="rounded-sm px-2.5 py-1 text-xs font-medium"
                        style={demoSolidPillStyle(active)}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <RevenueFormLabel required>Amount</RevenueFormLabel>
                  <input
                    ref={amountInputRef}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => patch({ amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm outline-none [appearance:textfield] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <RevenueFormLabel required>Date</RevenueFormLabel>
                  <RevenueDatePicker
                    value={form.dateIso}
                    onChange={(iso) => patch({ dateIso: iso })}
                    inputStyle={inputStyle}
                  />
                </div>
              </div>

              <div>
                <RevenueFormLabel required>Status</RevenueFormLabel>
                <div className="flex gap-1.5">
                  {(
                    [
                      { key: "paid", label: "Paid" },
                      { key: "pending", label: "Pending" },
                    ] as const
                  ).map((s) => {
                    const active = form.status === s.key;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => patch({ status: s.key })}
                        className="flex-1 rounded-sm py-1.5 text-xs font-medium"
                        style={demoLightPillStyle(active)}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="exp-step-2"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-5"
            >
              <div>
                <RevenueFormLabel required>Vendor</RevenueFormLabel>
                <input
                  type="text"
                  value={form.vendor}
                  onChange={(e) => patch({ vendor: e.target.value })}
                  placeholder="Company or payee name"
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <RevenueFormLabel>Description</RevenueFormLabel>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => patch({ description: e.target.value })}
                  placeholder={descriptionPlaceholderForCategory(form.category)}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="exp-step-3"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-5"
            >
              <motion.div
                initial={{ scale: 0.98, opacity: 0.85 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="rounded-sm p-4"
                style={{
                  backgroundColor: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                  style={{ color: C.textTertiary }}
                >
                  Summary
                </p>
                <p
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: C.error }}
                >
                  {fmtAmount(amountNum)}
                </p>
                <div className="mt-2 space-y-1 text-xs">
                  <p style={{ color: C.textSecondary }}>
                    <span style={{ color: C.textTertiary }}>Category: </span>
                    {form.category}
                  </p>
                  <p style={{ color: C.textSecondary }}>
                    <span style={{ color: C.textTertiary }}>Vendor: </span>
                    {form.vendor.trim() || "—"}
                  </p>
                  <p style={{ color: C.textSecondary }}>
                    <span style={{ color: C.textTertiary }}>Date: </span>
                    {formatIncomeDateFromIso(form.dateIso)}
                  </p>
                  <p style={{ color: C.textSecondary }}>
                    <span style={{ color: C.textTertiary }}>Status: </span>
                    <span className="capitalize">{form.status}</span>
                  </p>
                </div>
              </motion.div>

              <div>
                <RevenueFormLabel required>Payment method</RevenueFormLabel>
                <div className="flex flex-wrap gap-1.5">
                  {REVENUE_PAYMENT_METHODS.map((m) => {
                    const active = form.paymentMethod === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => patch({ paymentMethod: m })}
                        className="rounded-sm px-2.5 py-1 text-xs font-medium"
                        style={demoSolidPillStyle(active)}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <RevenueFormLabel>Reference #</RevenueFormLabel>
                <input
                  type="text"
                  value={form.reference}
                  onChange={(e) => patch({ reference: e.target.value })}
                  placeholder="Invoice no., check no., transaction ID"
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <RevenueFormLabel>Internal notes</RevenueFormLabel>
                <textarea
                  value={form.notes}
                  onChange={(e) => patch({ notes: e.target.value })}
                  rows={2}
                  placeholder="Optional note for your team"
                  className="w-full resize-none px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <RevenueFormLabel>Receipt</RevenueFormLabel>
                {form.receipt ? (
                  <div
                    className="flex items-center justify-between rounded-sm px-3 py-2 text-xs"
                    style={{
                      backgroundColor: C.infoBg,
                      border: `1px solid ${C.infoBorder}`,
                      color: C.info,
                    }}
                  >
                    <span className="truncate">{form.receipt}</span>
                    <button
                      type="button"
                      onClick={() => patch({ receipt: null })}
                      className="ml-2 flex-shrink-0"
                      style={{ color: C.textTertiary }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <DemoButton
                    variant="ghost"
                    className="w-full justify-center"
                    onClick={() => patch({ receipt: "receipt_upload.pdf" })}
                  >
                    Attach receipt
                  </DemoButton>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className="flex flex-shrink-0 gap-2 px-5 py-4"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        {step === 1 ? (
          <>
            <DemoButton variant="ghost" className="flex-1" onClick={onClose}>
              Cancel
            </DemoButton>
            <DemoButton
              className="flex-1"
              onClick={handleNext}
              style={!canContinueStep1 ? disabledStyle : undefined}
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </DemoButton>
          </>
        ) : step === 2 ? (
          <>
            <DemoButton variant="ghost" className="flex-1" onClick={handleBack}>
              Back
            </DemoButton>
            <DemoButton
              className="flex-1"
              onClick={handleNext}
              style={!canContinueStep2 ? disabledStyle : undefined}
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </DemoButton>
          </>
        ) : (
          <>
            <DemoButton variant="ghost" className="flex-1" onClick={handleBack}>
              Back
            </DemoButton>
            <DemoButton
              className="flex-1"
              onClick={handleSave}
              style={!canSave ? disabledStyle : undefined}
            >
              Save expense
            </DemoButton>
          </>
        )}
      </div>
    </motion.div>
  );
}

function BudgetRevenueTab({
  pendingOnly,
  onPendingOnlyChange,
}: {
  pendingOnly: boolean;
  onPendingOnlyChange: (v: boolean) => void;
}) {
  const [income, setIncome] = useState<DemoIncomeItem[]>(INITIAL_DEMO_INCOME);
  const [selectedInc, setSelectedInc] = useState<DemoIncomeItem | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<"all" | "mar" | "apr">("all");
  const { openBackdrop, closeBackdrop } = useContext(BackdropContext);

  useEffect(() => {
    if (isRecording) {
      openBackdrop(() => setIsRecording(false));
    } else if (selectedInc) {
      openBackdrop(() => setSelectedInc(null));
    } else {
      closeBackdrop();
    }
  }, [isRecording, selectedInc, openBackdrop, closeBackdrop]);

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  const handleRecordSave = (item: DemoIncomeItem) => {
    setIncome((prev) => [item, ...prev]);
    setIsRecording(false);
    setSelectedInc(item);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return income.filter((inc) => {
      const sourceMatch =
        sourceFilter === "all" || inc.source === sourceFilter;
      const programMatch =
        programFilter === "all" || inc.program === programFilter;
      const searchMatch =
        !q ||
        inc.description.toLowerCase().includes(q) ||
        inc.payer.toLowerCase().includes(q);
      const pendingMatch = !pendingOnly || inc.status === "pending";
      const dateMatch =
        dateFilter === "all" ||
        (dateFilter === "mar" && inc.date.startsWith("Mar")) ||
        (dateFilter === "apr" && inc.date.startsWith("Apr"));
      return (
        sourceMatch && programMatch && searchMatch && pendingMatch && dateMatch
      );
    });
  }, [income, sourceFilter, programFilter, search, pendingOnly, dateFilter]);

  const kpis = useMemo(() => {
    const ytd = filtered.reduce((s, i) => s + i.amount, 0);
    const monthTotal = filtered
      .filter((i) => i.date.startsWith(DEMO_CURRENT_MONTH))
      .reduce((s, i) => s + i.amount, 0);
    const tuitionTotal = filtered
      .filter((i) => i.source === "Tuition")
      .reduce((s, i) => s + i.amount, 0);
    const donationsTotal = filtered
      .filter((i) => i.source === "Donation")
      .reduce((s, i) => s + i.amount, 0);
    const pendingCount = filtered.filter((i) => i.status === "pending").length;
    return { ytd, monthTotal, tuitionTotal, donationsTotal, pendingCount };
  }, [filtered]);

  const hasActiveFilters = pendingOnly || dateFilter !== "all";

  const sourceOptions = [
    { key: "all", label: "All" },
    ...REVENUE_SOURCES.map((s) => ({ key: s, label: s })),
  ];

  const detailNote =
    selectedInc?.source === "Deposit"
      ? "Applied toward enrollment when families start."
      : selectedInc?.source === "Donation"
        ? "Thank-you letter sent automatically."
        : null;

  return (
    <div
      className="relative flex h-full flex-col"
      style={{ backgroundColor: C.surface }}
    >
      <div
        className="flex flex-shrink-0 flex-col gap-2 px-6 py-3"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {sourceOptions.map((opt) => {
              const isActive = sourceFilter === opt.key;
              const count =
                opt.key === "all"
                  ? income.length
                  : income.filter((i) => i.source === opt.key).length;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSourceFilter(opt.key)}
                  className="rounded-sm px-2.5 py-1 text-xs font-medium transition-all"
                  style={demoSolidPillStyle(isActive)}
                >
                  {opt.label}
                  <span className="ml-1 text-[10px] font-bold opacity-70">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <div className="relative flex items-center" style={{ minWidth: 160 }}>
              <Search
                className="absolute left-2.5 h-3.5 w-3.5"
                style={{ color: C.textTertiary }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search revenue…"
                className="w-full rounded-sm py-1.5 pl-8 pr-3 text-xs outline-none"
                style={{
                  backgroundColor: C.input,
                  border: `1px solid ${C.inputBorder}`,
                  color: C.textPrimary,
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setFilterPanelOpen(true)}
              className="relative flex flex-shrink-0 items-center justify-center rounded-sm p-2 transition-all"
              style={{
                backgroundColor: hasActiveFilters ? C.accentLight : C.input,
                color: hasActiveFilters ? C.accent : C.textSecondary,
                border: `1px solid ${hasActiveFilters ? C.accent : C.border}`,
              }}
              aria-label="Filter revenue"
            >
              <ListFilter className="h-4 w-4" />
              {hasActiveFilters && (
                <span
                  className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: C.accent }}
                />
              )}
            </button>
            <DemoButton variant="secondary">
              <Download className="h-3.5 w-3.5" />
              Export
            </DemoButton>
            <DemoButton
              onClick={() => {
                setSelectedInc(null);
                setIsRecording(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Record revenue
            </DemoButton>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {REVENUE_PROGRAM_FILTERS.map((opt) => {
            const isActive = programFilter === opt.key;
            const count =
              opt.key === "all"
                ? income.length
                : income.filter((i) => i.program === opt.key).length;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setProgramFilter(opt.key)}
                className="rounded-sm px-2.5 py-1 text-xs font-medium transition-all"
                style={demoLightPillStyle(isActive)}
              >
                {opt.label}
                {opt.key !== "all" && (
                  <span className="ml-1 text-[10px] font-bold opacity-70">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="flex flex-shrink-0 flex-wrap items-center gap-x-6 gap-y-2 px-6 py-2.5 text-xs"
        style={{
          borderBottom: `1px solid ${C.border}`,
          backgroundColor: C.surface,
        }}
      >
        {[
          { label: "YTD revenue", value: fmt(kpis.ytd) },
          {
            label: `${DEMO_CURRENT_MONTH} revenue`,
            value: fmt(kpis.monthTotal),
          },
          {
            label: "Tuition",
            value: fmt(kpis.tuitionTotal),
          },
          {
            label: "Donations",
            value: fmt(kpis.donationsTotal),
          },
          {
            label: "Pending",
            value: String(kpis.pendingCount),
            warn: kpis.pendingCount > 0,
          },
        ].map((k) => (
          <div key={k.label} className="flex items-center gap-2">
            <span style={{ color: C.textTertiary }}>{k.label}</span>
            <span
              className="font-semibold tabular-nums"
              style={{ color: k.warn ? C.warning : C.textPrimary }}
            >
              {k.value}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {filterPanelOpen && (
          <>
            <motion.div
              key="revenue-filter-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              style={{ backgroundColor: "rgba(0,0,0,0.12)", zIndex: 11 }}
              onClick={() => setFilterPanelOpen(false)}
            />
            <motion.div
              key="revenue-filters-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute top-0 right-0 bottom-0 flex flex-col"
              style={{
                width: 280,
                backgroundColor: C.surface,
                borderLeft: `1px solid ${C.border}`,
                zIndex: 12,
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
                  Filters
                </h3>
                <button
                  type="button"
                  onClick={() => setFilterPanelOpen(false)}
                  style={{ color: C.textTertiary }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 space-y-5 overflow-y-auto p-5">
                <div>
                  <p
                    className="mb-2 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: C.textTertiary }}
                  >
                    Date
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        { key: "all", label: "All time" },
                        { key: "mar", label: "March 2026" },
                        { key: "apr", label: "April 2026" },
                      ] as const
                    ).map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setDateFilter(d.key)}
                        className="rounded-sm px-2.5 py-1 text-xs font-medium"
                        style={demoSolidPillStyle(dateFilter === d.key)}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pendingOnly}
                    onChange={(e) => onPendingOnlyChange(e.target.checked)}
                    className="rounded-sm"
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: C.textSecondary }}
                  >
                    Pending only
                  </span>
                </label>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto overflow-x-auto">
          <table className="w-full text-sm">
            <thead
              className="sticky top-0 z-[1]"
              style={{ backgroundColor: C.surface }}
            >
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {[
                  "Date",
                  "Source",
                  "Description",
                  "Payer",
                  "Amount",
                  "Program",
                  "Payment",
                  "Status",
                ].map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 text-xs font-medium"
                    style={{ color: C.textTertiary }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc, i) => {
                const sc = REV_STATUS_COLORS[inc.status];
                return (
                  <motion.tr
                    key={inc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => setSelectedInc(inc)}
                    className="cursor-pointer"
                    style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = C.elevated)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td
                      className="px-4 py-3 text-xs whitespace-nowrap"
                      style={{ color: C.textTertiary }}
                    >
                      {inc.date}
                    </td>
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
                      className="px-4 py-3 text-xs max-w-[200px] truncate"
                      style={{ color: C.textSecondary }}
                    >
                      {inc.description}
                    </td>
                    <td
                      className="px-4 py-3 text-xs whitespace-nowrap"
                      style={{ color: C.textPrimary }}
                    >
                      {inc.payer}
                    </td>
                    <td
                      className="px-4 py-3 text-sm font-bold tabular-nums whitespace-nowrap"
                      style={{ color: C.success }}
                    >
                      {fmt(inc.amount)}
                    </td>
                    <td className="px-4 py-3">
                      {inc.program ? (
                        <ProgramBadge program={inc.program} />
                      ) : (
                        <span style={{ color: C.textTertiary }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 text-[10px] font-semibold rounded-full"
                        style={{
                          backgroundColor: C.surface,
                          color: C.textSecondary,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        {inc.paymentMethod}
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
                        {inc.status}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p
              className="py-12 text-center text-sm"
              style={{ color: C.textTertiary }}
            >
              No revenue matches your filters.
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isRecording && (
          <RecordRevenuePanel
            key="record-revenue"
            onClose={() => setIsRecording(false)}
            onSave={handleRecordSave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedInc && !isRecording && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 flex flex-col shadow-lg"
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
                Revenue Detail
              </h3>
              <button
                type="button"
                onClick={() => setSelectedInc(null)}
                style={{ color: C.textTertiary }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div
                className="rounded-sm p-4"
                style={{
                  backgroundColor: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <p
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: C.success }}
                >
                  {fmt(selectedInc.amount)}
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: C.textTertiary }}
                >
                  {selectedInc.source}
                </p>
                <span
                  className="mt-2 inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize"
                  style={{
                    backgroundColor: REV_STATUS_COLORS[selectedInc.status].bg,
                    border: `1px solid ${REV_STATUS_COLORS[selectedInc.status].border}`,
                    color: REV_STATUS_COLORS[selectedInc.status].text,
                  }}
                >
                  {selectedInc.status}
                </span>
              </div>
              <DetailField
                label="Description"
                value={selectedInc.description}
              />
              <DetailField label="Payer" value={selectedInc.payer} />
              <DetailField label="Date" value={selectedInc.date} />
              <DetailField
                label="Payment"
                value={selectedInc.paymentMethod}
              />
              <DetailField
                label="Program"
                value={
                  selectedInc.program ? (
                    <ProgramBadge program={selectedInc.program} />
                  ) : (
                    "—"
                  )
                }
              />
              {selectedInc.familyId && (
                <DetailField
                  label="Family"
                  value={
                    <span style={{ color: C.accent }}>
                      {ACTIVE_DEMO_PARENTS.find((p) => p.id === selectedInc.familyId)
                        ?.name ?? "—"}
                    </span>
                  }
                />
              )}
              {selectedInc.reference && (
                <DetailField
                  label="Reference"
                  value={selectedInc.reference}
                />
              )}
              {selectedInc.notes && (
                <DetailField label="Notes" value={selectedInc.notes} />
              )}
              <DetailField
                label="Receipt"
                value={
                  selectedInc.receipt ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-medium underline-offset-2 hover:underline"
                      style={{ color: C.info }}
                    >
                      <Download className="h-3 w-3" />
                      {selectedInc.receipt}
                    </button>
                  ) : (
                    <span style={{ color: C.warning }}>Missing</span>
                  )
                }
              />
              {detailNote && (
                <p
                  className="text-xs leading-relaxed rounded-sm px-3 py-2"
                  style={{
                    backgroundColor: C.accentLight,
                    color: C.textSecondary,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  {detailNote}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RevenueMixChart({
  segments,
}: {
  segments: { label: string; amount: number; pct: number; color: string }[];
}) {
  return (
    <div className="space-y-4">
      <div
        className="flex h-3 rounded-full overflow-hidden"
        style={{ backgroundColor: C.border }}
      >
        {segments.map((seg, i) => (
          <motion.div
            key={seg.label}
            className="h-full"
            initial={{ width: 0 }}
            animate={{ width: `${seg.pct}%` }}
            transition={{ duration: 0.7, delay: i * 0.08 }}
            style={{ backgroundColor: seg.color }}
            title={`${seg.label}: ${seg.pct}%`}
          />
        ))}
      </div>
      <div className="space-y-2">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className="flex items-center justify-between gap-2"
          >
            <span className="flex items-center gap-2 text-xs font-medium min-w-0">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span style={{ color: C.textSecondary }}>{seg.label}</span>
            </span>
            <span
              className="text-xs tabular-nums font-semibold flex-shrink-0"
              style={{ color: C.textPrimary }}
            >
              {seg.pct}% · ${seg.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

type InsightsSubTab = "summary" | "actions" | "breakdown";

const INSIGHTS_SUBTABS: {
  key: InsightsSubTab;
  label: string;
  description: string;
}[] = [
  {
    key: "summary",
    label: "Summary",
    description:
      "Start here — your health score and cash runway tell you if the school is on track.",
  },
  {
    key: "actions",
    label: "Action items",
    description:
      "Items flagged from expenses, revenue, and tuition — tap any row to fix it in the right tab.",
  },
  {
    key: "breakdown",
    label: "Breakdown",
    description:
      "See where money comes from, how each budget category compares to plan, and monthly net trend.",
  },
];

function insightsCardStyle(): React.CSSProperties {
  return {
    backgroundColor: "#FFFFFF",
    border: `1px solid ${C.border}`,
    boxShadow: C.shadowCard,
    borderRadius: C.r.lg,
  };
}

function InsightsCard({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={className} style={{ ...insightsCardStyle(), ...style }}>
      {children}
    </div>
  );
}

function InsightsIntro({ text }: { text: string }) {
  return (
    <p
      className="text-sm leading-relaxed rounded-sm px-3.5 py-2.5"
      style={{
        backgroundColor: C.accentLight,
        border: `1px solid ${C.secondaryBtnBorder}`,
        color: C.textSecondary,
      }}
    >
      {text}
    </p>
  );
}

function BudgetInsightsTab({
  onNavigateTab,
  onNavigateTuition,
}: {
  onNavigateTab: (tab: BudgetTab, opts?: BudgetNavigateOptions) => void;
  onNavigateTuition?: (opts?: TuitionNavigateOptions) => void;
}) {
  const [insightsTab, setInsightsTab] = useState<InsightsSubTab>("summary");
  const [period, setPeriod] = useState<BudgetPeriod>("ytd");
  const periodMultiplier = PERIOD_MULTIPLIERS[period];
  const fmt = (n: number) =>
    `$${Math.round(n * periodMultiplier).toLocaleString()}`;
  const health = budgetHealth(BUDGET_CATS);
  const mix = revenueMixFromIncome(INITIAL_DEMO_INCOME);
  const pendingIncome = INITIAL_DEMO_INCOME.filter((i) => i.status === "pending");
  const pendingAmount = pendingIncome.reduce((s, i) => s + i.amount, 0);
  const missingReceipts = INITIAL_DEMO_EXPENSES.filter(
    (e) => e.receipt === null,
  ).length;
  const outstandingTuition = countOutstandingTuition();
  const overCats = BUDGET_CATS.filter((c) => c.actual > c.planned);
  const runwayMonths = (DEMO_NET_PROFIT / DEMO_BURN_RATE).toFixed(1);
  const monthlyNet = DEMO_MONTHLY_REVENUE.map(
    (m) => m.revenue - m.expenses,
  );
  const maxNet = Math.max(...monthlyNet, 1);

  const sortedCats = [...BUDGET_CATS].sort(
    (a, b) => b.actual / b.planned - a.actual / a.planned,
  );

  const alerts: {
    id: string;
    title: string;
    detail: string;
    tone: "error" | "warning" | "success" | "info";
    tab: BudgetTab;
    opts?: BudgetNavigateOptions;
    tuitionNav?: TuitionNavigateOptions;
  }[] = [];

  if (overCats.length > 0) {
    alerts.push({
      id: "over-budget",
      title: `${overCats.length} over budget`,
      detail: `${overCats.map((c) => c.name).join(", ")} — tap to review`,
      tone: "error",
      tab: "expenses",
      opts: { expenseCategory: overCats[0].name },
    });
  }
  if (pendingIncome.length > 0) {
    alerts.push({
      id: "pending-revenue",
      title: `${pendingIncome.length} pending payment${pendingIncome.length > 1 ? "s" : ""}`,
      detail: `${fmt(pendingAmount)} awaiting collection`,
      tone: "warning",
      tab: "revenue",
      opts: { revenuePendingOnly: true },
    });
  }
  if (missingReceipts > 0) {
    alerts.push({
      id: "receipts",
      title: `${missingReceipts} missing receipts`,
      detail: "Expenses need documentation",
      tone: "warning",
      tab: "expenses",
    });
  }
  if (outstandingTuition > 0) {
    alerts.push({
      id: "tuition",
      title: `${outstandingTuition} tuition items outstanding`,
      detail: "Families with unpaid or sent invoices",
      tone: "warning",
      tab: "overview",
      tuitionNav: { filter: "overdue" },
    });
  }
  if (alerts.length === 0) {
    alerts.push({
      id: "all-clear",
      title: "All clear",
      detail: "No urgent financial actions",
      tone: "success",
      tab: "overview",
    });
  }

  const scoreColor =
    health.score >= 80 ? C.success : health.score >= 60 ? C.warning : C.error;
  const scoreSize = 88;
  const scoreR = (scoreSize - 8) / 2;
  const scoreCirc = 2 * Math.PI * scoreR;
  const scoreOffset = scoreCirc * (1 - health.score / 100);

  const actionableCount = alerts.filter((a) => a.id !== "all-clear").length;
  const activeSubtab = INSIGHTS_SUBTABS.find((t) => t.key === insightsTab)!;

  return (
    <div
      className="flex-1 flex flex-col min-h-0"
      style={{ backgroundColor: C.surface }}
    >
      <div
        className="flex-shrink-0 px-6 pt-5 pb-4 space-y-4"
        style={{
          backgroundColor: C.surface,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              className="text-lg font-semibold tracking-tight flex items-center gap-2"
              style={{ color: C.textPrimary }}
            >
              <Sparkles className="w-4 h-4" style={{ color: C.accent }} />
              Financial Insights
            </h2>
            <p className="text-xs mt-0.5 max-w-md" style={{ color: C.textTertiary }}>
              Use the tabs below — Summary for the big picture, Action items for
              fixes, Breakdown for where money flows.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span
              className="text-[10px] font-medium uppercase tracking-wide"
              style={{ color: C.textTertiary }}
            >
              Time period
            </span>
            <div className="flex flex-wrap gap-1 justify-end">
              {(Object.keys(PERIOD_LABELS) as BudgetPeriod[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className="rounded-sm px-2.5 py-1 text-xs font-medium transition-all"
                  style={demoSolidPillStyle(period === p)}
                  title={`Show amounts for ${PERIOD_LABELS[p]}`}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className="flex items-center gap-1 p-1 rounded-sm w-fit max-w-full overflow-x-auto"
          style={{
            backgroundColor: C.input,
            border: `1px solid ${C.inputBorder}`,
          }}
        >
          {INSIGHTS_SUBTABS.map((t) => {
            const isActive = insightsTab === t.key;
            const badge =
              t.key === "actions" && actionableCount > 0
                ? actionableCount
                : null;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setInsightsTab(t.key)}
                className="px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1.5"
                style={{
                  backgroundColor: isActive ? C.surface : "transparent",
                  color: isActive ? C.textPrimary : C.textTertiary,
                  boxShadow: isActive ? C.shadowCard : "none",
                }}
              >
                {t.label}
                {badge != null && (
                  <span
                    className="min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[9px] font-bold"
                    style={{
                      backgroundColor: isActive ? C.warning : C.warningBg,
                      color: isActive ? "#fff" : C.warning,
                    }}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto p-6 space-y-4"
        style={{ backgroundColor: C.surface }}
      >
        <InsightsIntro text={activeSubtab.description} />

        <AnimatePresence mode="wait">
          {insightsTab === "summary" && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {actionableCount > 0 && (
                <button
                  type="button"
                  onClick={() => setInsightsTab("actions")}
                  className="w-full flex items-center justify-between gap-3 rounded-sm px-4 py-3 text-left transition-colors"
                  style={{
                    backgroundColor: C.warningBg,
                    border: `1px solid ${C.warningBorder}`,
                  }}
                >
                  <div>
                    <p
                      className="text-xs font-bold"
                      style={{ color: C.warning }}
                    >
                      {actionableCount} item{actionableCount !== 1 ? "s" : ""}{" "}
                      need attention
                    </p>
                    <p
                      className="text-[11px] mt-0.5"
                      style={{ color: C.textSecondary }}
                    >
                      Review budgets, pending payments, receipts, or tuition —
                      open Action items to see the list.
                    </p>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: C.warning }}
                  />
                </button>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5"
          style={insightsCardStyle()}
        >
          <SectionLabel
            hint="Higher is healthier — based on budget adherence and overspend risk."
            icon={<HeartPulse className="w-3.5 h-3.5" />}
            iconColor="#22C55E"
          >
            Financial Health
          </SectionLabel>
          <div className="flex items-center gap-5 mt-4">
            <div
              className="relative flex-shrink-0"
              style={{ width: scoreSize, height: scoreSize }}
            >
              <svg width={scoreSize} height={scoreSize}>
                <circle
                  cx={scoreSize / 2}
                  cy={scoreSize / 2}
                  r={scoreR}
                  fill="none"
                  stroke={C.border}
                  strokeWidth={8}
                />
                <motion.circle
                  cx={scoreSize / 2}
                  cy={scoreSize / 2}
                  r={scoreR}
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeDasharray={scoreCirc}
                  initial={{ strokeDashoffset: scoreCirc }}
                  animate={{ strokeDashoffset: scoreOffset }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  transform={`rotate(-90 ${scoreSize / 2} ${scoreSize / 2})`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: scoreColor }}
                >
                  {health.score}
                </span>
                <span className="text-[9px]" style={{ color: C.textTertiary }}>
                  / 100
                </span>
              </div>
            </div>
            <div className="min-w-0">
              <p
                className="text-sm font-medium leading-relaxed"
                style={{ color: C.textPrimary }}
              >
                {health.summary}
              </p>
              <p className="text-xs mt-2" style={{ color: C.textTertiary }}>
                {PERIOD_LABELS[period]} · {health.pctUsed}% of annual plan used
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-5"
          style={insightsCardStyle()}
        >
          <SectionLabel
            hint="Months of runway at current net burn if revenue holds steady."
            icon={<Wallet className="w-3.5 h-3.5" />}
            iconColor="#5E7C68"
          >
            Cash Runway
          </SectionLabel>
          <div className="mt-4 space-y-4">
            <div>
              <p
                className="text-3xl font-bold tabular-nums"
                style={{ color: C.accent }}
              >
                {runwayMonths}
                <span
                  className="text-base font-medium ml-1"
                  style={{ color: C.textTertiary }}
                >
                  months
                </span>
              </p>
              <p className="text-xs mt-1" style={{ color: C.textTertiary }}>
                At ${DEMO_BURN_RATE.toLocaleString()}/mo burn ·{" "}
                {fmt(DEMO_NET_PROFIT)} net profit ({PERIOD_LABELS[period]})
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Monthly burn",
                  value: `$${DEMO_BURN_RATE.toLocaleString()}`,
                  color: C.warning,
                },
                {
                  label: "Net profit",
                  value: fmt(DEMO_NET_PROFIT),
                  color: C.success,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="px-3 py-2 rounded-sm"
                  style={{
                    backgroundColor: C.accentLight,
                    border: `1px solid ${C.secondaryBtnBorder}`,
                  }}
                >
                  <p className="text-[10px]" style={{ color: C.textTertiary }}>
                    {item.label}
                  </p>
                  <p
                    className="text-sm font-bold tabular-nums mt-0.5"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
              </div>
            </motion.div>
          )}

          {insightsTab === "actions" && (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <FeatureTip text="Each row opens the right place to fix it — Expenses for spend and receipts, Revenue for pending payments, My School → Tuition for family billing." />
              <div className="space-y-2">
                {alerts.map((alert, i) => {
                  const tones = {
                    error: {
                      bg: C.errorBg,
                      border: C.errorBorder,
                      text: C.error,
                    },
                    warning: {
                      bg: C.warningBg,
                      border: C.warningBorder,
                      text: C.warning,
                    },
                    success: {
                      bg: C.successBg,
                      border: C.successBorder,
                      text: C.success,
                    },
                    info: { bg: C.infoBg, border: C.infoBorder, text: C.info },
                  };
                  const helpers: Record<string, string> = {
                    "over-budget":
                      "Spending in this category exceeded what you planned — review line items before the gap grows.",
                    "pending-revenue":
                      "Money marked received in your books but not collected yet — follow up with families or banks.",
                    receipts:
                      "Paid expenses without a receipt can cause audit issues — upload or attach documentation.",
                    tuition:
                      "Unpaid or invoice-sent tuition — open My School → Tuition to review balances and send reminders.",
                    "all-clear":
                      "Nothing urgent right now. Check Breakdown if you want a deeper look at trends.",
                  };
                  const t = tones[alert.tone];
                  return (
                    <motion.button
                      key={alert.id}
                      type="button"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => {
                        if (alert.tuitionNav) {
                          onNavigateTuition?.(alert.tuitionNav);
                        } else {
                          onNavigateTab(alert.tab, alert.opts);
                        }
                      }}
                      className="w-full text-left rounded-sm p-4 transition-all group flex items-start gap-3"
                      style={{
                        backgroundColor: t.bg,
                        border: `1px solid ${t.border}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = t.text;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = t.border;
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold"
                          style={{ color: t.text }}
                        >
                          {alert.title}
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{ color: C.textPrimary }}
                        >
                          {alert.detail}
                        </p>
                        <p
                          className="text-[11px] mt-2 leading-relaxed"
                          style={{ color: C.textTertiary }}
                        >
                          {helpers[alert.id]}
                        </p>
                      </div>
                      <ChevronRight
                        className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity"
                        style={{ color: t.text }}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {insightsTab === "breakdown" && (
            <motion.div
              key="breakdown"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InsightsCard style={{ padding: "20px" }}>
          <SectionLabel
            hint="Where your income comes from — tuition vs deposits vs donations."
            icon={<DollarSign className="w-3.5 h-3.5" />}
            iconColor="#F59E0B"
          >
            Revenue Mix
          </SectionLabel>
          <div className="mt-4">
            <RevenueMixChart segments={mix} />
          </div>
        </InsightsCard>

        <InsightsCard style={{ padding: "20px" }}>
          <SectionLabel
            hint="Ranked by % of plan used — click a row to see expenses."
            icon={<BarChart2 className="w-3.5 h-3.5" />}
            iconColor="#8B5CF6"
          >
            Budget Variance
          </SectionLabel>
          <div className="mt-3 space-y-2">
            {sortedCats.map((cat, i) => {
              const pct = Math.round((cat.actual / cat.planned) * 100);
              const over = cat.actual > cat.planned;
              const diff = cat.actual - cat.planned;
              return (
                <motion.button
                  key={cat.name}
                  type="button"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() =>
                    onNavigateTab("expenses", {
                      expenseCategory: cat.name,
                    })
                  }
                  className="w-full flex items-center gap-3 px-1 py-2.5 text-left transition-colors group"
                  style={{
                    backgroundColor: "transparent",
                    borderBottom:
                      i < sortedCats.length - 1
                        ? `1px solid ${C.border}`
                        : "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = C.accentLight;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span className="text-base flex-shrink-0">{cat.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className="text-xs font-semibold truncate"
                        style={{ color: C.textPrimary }}
                      >
                        {cat.name}
                      </span>
                      <span
                        className="text-[10px] font-bold tabular-nums flex-shrink-0"
                        style={{ color: over ? C.error : C.success }}
                      >
                        {over ? "+" : "-"}$
                        {Math.abs(diff).toLocaleString()}
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: C.border }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        style={{
                          backgroundColor: over ? C.error : cat.color,
                        }}
                      />
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: C.textTertiary }}>
                      {pct}% of plan · ${cat.actual.toLocaleString()} / $
                      {cat.planned.toLocaleString()}
                    </p>
                  </div>
                  <ChevronRight
                    className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-60"
                    style={{ color: C.textTertiary }}
                  />
                </motion.button>
              );
            })}
          </div>
        </InsightsCard>
      </div>

      <InsightsCard style={{ padding: "20px" }}>
        <div className="flex items-center justify-between mb-4">
          <SectionLabel
            hint="Monthly net (revenue minus expenses) — green bars mean you kept more."
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            iconColor="#38BDF8"
            className="mb-0"
          >
            Net Trend
          </SectionLabel>
          <span className="text-[10px]" style={{ color: C.textTertiary }}>
            Last 12 months
          </span>
        </div>
        <div className="flex items-end gap-1" style={{ height: 64 }}>
          {DEMO_MONTHLY_REVENUE.map((m, i) => {
            const net = m.revenue - m.expenses;
            const barPx = Math.max(
              4,
              Math.round((Math.abs(net) / maxNet) * 56),
            );
            const positive = net >= 0;
            return (
              <div
                key={m.month}
                className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0 h-full"
              >
                <motion.div
                  className="w-full rounded-t-sm"
                  initial={{ height: 0 }}
                  animate={{ height: barPx }}
                  transition={{ duration: 0.5, delay: i * 0.03 }}
                  style={{
                    backgroundColor: positive ? C.success : C.error,
                    opacity: 0.85,
                  }}
                  title={`${m.month}: ${positive ? "+" : "-"}$${Math.abs(net).toLocaleString()}`}
                />
                <span
                  className="text-[9px] truncate w-full text-center"
                  style={{ color: C.textTertiary }}
                >
                  {m.month}
                </span>
              </div>
            );
          })}
        </div>
        <p
          className="text-[11px] mt-3 leading-relaxed"
          style={{ color: C.textTertiary }}
        >
          Hover a bar for that month&apos;s net. Green means revenue beat expenses;
          red means you spent more than you brought in.
        </p>
      </InsightsCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const PAYROLL_READINESS_STYLES: Record<
  PayrollReadinessStatus,
  { bg: string; text: string }
> = {
  ready: { bg: C.successBg, text: C.success },
  paperwork: { bg: C.warningBg, text: C.warning },
  missing_rate: { bg: C.errorBg, text: C.error },
};

function RunPayrollWizard({
  step,
  onStepChange,
  onClose,
  onComplete,
  onNavigateToStaff,
}: {
  step: PayrollRunWizardStep;
  onStepChange: (step: PayrollRunWizardStep) => void;
  onClose: () => void;
  onComplete: () => void;
  onNavigateToStaff?: (staffId: string) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const lineItems = getPayrollRunLineItems();
  const excluded = DEMO_STAFF.filter((s) => !isStaffIncludedInPayrollRun(s));
  const totalNet = lineItems.reduce((sum, row) => sum + row.net, 0);
  const needsAttention = lineItems.filter((r) => r.readiness !== "ready");

  const handleNext = () => {
    if (step < 4) onStepChange((step + 1) as PayrollRunWizardStep);
  };
  const handleBack = () => {
    if (step > 1) onStepChange((step - 1) as PayrollRunWizardStep);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setComplete(true);
      setTimeout(() => {
        onComplete();
        onClose();
      }, 2200);
    }, 1400);
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="absolute top-0 right-0 bottom-0 flex flex-col overflow-hidden"
      style={{
        width: 440,
        maxWidth: "100%",
        backgroundColor: C.surface,
        borderLeft: `1px solid ${C.border}`,
        zIndex: 20,
        boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
      }}
    >
      <div
        className="flex-shrink-0 px-5 pt-4 pb-3"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
              Run payroll
            </p>
            <p className="text-[11px]" style={{ color: C.textTertiary }}>
              {complete
                ? "Payroll submitted!"
                : `Step ${step} of 4 — ${PAYROLL_RUN_STEP_LABELS[step - 1]}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center rounded-md w-7 h-7"
            style={demoSecondaryButtonStyle({ color: C.textTertiary })}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        {!complete && (
          <div className="flex items-center gap-0">
            {([1, 2, 3, 4] as const).map((n, i) => {
              const isDone = step > n;
              const isActive = step === n;
              return (
                <div key={n} className="flex items-center" style={{ flex: i < 3 ? 1 : "none" }}>
                  <div
                    className="flex items-center justify-center rounded-full flex-shrink-0 text-[10px] font-semibold"
                    style={{
                      width: 24,
                      height: 24,
                      backgroundColor: isDone ? C.accentLight : isActive ? C.accent : C.elevated,
                      border: `2px solid ${isDone || isActive ? C.accent : C.border}`,
                      color: isDone ? C.accent : isActive ? "#fff" : C.textTertiary,
                    }}
                  >
                    {isDone ? <CheckCircle className="w-3 h-3" /> : n}
                  </div>
                  {i < 3 && (
                    <div
                      className="flex-1 h-px mx-1"
                      style={{ backgroundColor: step > n + 1 ? C.accent : C.border }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={complete ? "done" : step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            {complete ? (
              <div className="text-center py-10 px-4">
                <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: C.success }} />
                <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  Payroll approved
                </p>
                <p className="text-[11px] mt-2 leading-relaxed" style={{ color: C.textSecondary }}>
                  {formatUsd(totalNet)} will be deposited on {DEMO_PAY_PERIOD.payday}. Staff receive
                  pay stubs by email.
                </p>
              </div>
            ) : step === 1 ? (
              <>
                <p className="text-xs font-semibold" style={{ color: C.textSecondary }}>
                  What you&apos;re paying for
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: C.textTertiary }}>
                  Review the pay period and schedule before including staff.
                </p>
                <div
                  className="rounded-sm p-4 space-y-3"
                  style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                >
                  <DetailField label="Pay period" value={DEMO_PAY_PERIOD.label} />
                  <DetailField label="Payday" value={DEMO_PAY_PERIOD.payday} />
                  <DetailField label="Approve by" value={DEMO_PAY_PERIOD.approvalDeadline} />
                  <DetailField label="Schedule" value={DEMO_PAY_PERIOD.scheduleName} />
                  <DetailField label="Run type" value="Regular" />
                </div>
              </>
            ) : step === 2 ? (
              <>
                <p className="text-xs font-semibold" style={{ color: C.textSecondary }}>
                  Who gets paid
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: C.textTertiary }}>
                  {lineItems.length} active staff on this run
                  {needsAttention.length > 0
                    ? ` · ${needsAttention.length} need setup before deposit`
                    : ""}
                  .
                </p>
                {needsAttention.length > 0 && (
                  <div
                    className="rounded-sm px-3 py-2.5 text-[11px]"
                    style={{
                      backgroundColor: C.warningBg,
                      border: `1px solid ${C.warningBorder}`,
                      color: C.textSecondary,
                    }}
                  >
                    Staff with missing forms can still be included, but deposits may fail until
                    setup is complete.
                  </div>
                )}
                <ul className="space-y-2">
                  {lineItems.map(({ staff, readiness }) => {
                    const style = PAYROLL_READINESS_STYLES[readiness];
                    return (
                      <li
                        key={staff.id}
                        className="flex items-center justify-between gap-2 rounded-sm px-3 py-2.5"
                        style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: C.textPrimary }}>
                            {staff.name}
                          </p>
                          <p className="text-[10px] truncate" style={{ color: C.textTertiary }}>
                            {staff.role}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
                            style={{ backgroundColor: style.bg, color: style.text }}
                          >
                            {getPayrollReadinessLabel(readiness)}
                          </span>
                          {readiness !== "ready" && (
                            <button
                              type="button"
                              onClick={() => onNavigateToStaff?.(staff.id)}
                              className="text-[10px] font-semibold"
                              style={{ color: C.accent }}
                            >
                              Fix
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {excluded.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: C.textTertiary }}>
                      Not included
                    </p>
                    {excluded.map((staff) => (
                      <p key={staff.id} className="text-[11px] py-1" style={{ color: C.textTertiary }}>
                        {staff.name} — {staff.status === "on_leave" ? "On leave" : "Inactive"}
                      </p>
                    ))}
                  </div>
                )}
              </>
            ) : step === 3 ? (
              <>
                <p className="text-xs font-semibold" style={{ color: C.textSecondary }}>
                  Review amounts
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: C.textTertiary }}>
                  Estimated net pay per person for this period (taxes and deductions included).
                </p>
                <div className="overflow-x-auto rounded-sm" style={{ border: `1px solid ${C.border}` }}>
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr style={{ backgroundColor: C.elevated, borderBottom: `1px solid ${C.border}` }}>
                        {["Staff", "Hours", "Est. net"].map((h) => (
                          <th key={h} className="px-3 py-2 font-semibold uppercase tracking-wide" style={{ color: C.textTertiary }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map(({ staff, hours, net }, i) => (
                        <tr
                          key={staff.id}
                          style={{
                            borderBottom: i < lineItems.length - 1 ? `1px solid ${C.border}` : "none",
                            backgroundColor: C.surface,
                          }}
                        >
                          <td className="px-3 py-2 font-medium" style={{ color: C.textPrimary }}>
                            {staff.name.split(" ").slice(-1)[0]}
                          </td>
                          <td className="px-3 py-2 tabular-nums" style={{ color: C.textSecondary }}>
                            {hours != null ? `${hours} hrs` : "Salary"}
                          </td>
                          <td className="px-3 py-2 tabular-nums font-semibold" style={{ color: C.textPrimary }}>
                            {formatUsd(net)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ backgroundColor: C.accentLight, borderTop: `1px solid ${C.border}` }}>
                        <td colSpan={2} className="px-3 py-2.5 font-semibold" style={{ color: C.textPrimary }}>
                          Total net pay
                        </td>
                        <td className="px-3 py-2.5 font-bold tabular-nums" style={{ color: C.accent }}>
                          {formatUsd(totalNet)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold" style={{ color: C.textSecondary }}>
                  Confirm and submit
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: C.textTertiary }}>
                  Once approved, payroll is queued for deposit on payday.
                </p>
                <div
                  className="rounded-sm p-4 space-y-2"
                  style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                >
                  <div className="flex justify-between text-xs">
                    <span style={{ color: C.textTertiary }}>Staff paid</span>
                    <span className="font-semibold" style={{ color: C.textPrimary }}>
                      {lineItems.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: C.textTertiary }}>Pay period</span>
                    <span className="font-medium" style={{ color: C.textPrimary }}>
                      {DEMO_PAY_PERIOD.label}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: C.textTertiary }}>Deposit date</span>
                    <span className="font-medium" style={{ color: C.textPrimary }}>
                      {DEMO_PAY_PERIOD.payday}
                    </span>
                  </div>
                  <div
                    className="flex justify-between pt-2 mt-2 text-sm"
                    style={{ borderTop: `1px solid ${C.border}` }}
                  >
                    <span className="font-semibold" style={{ color: C.textPrimary }}>
                      Total net pay
                    </span>
                    <span className="font-bold tabular-nums" style={{ color: C.accent }}>
                      {formatUsd(totalNet)}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: C.textTertiary }}>
                  By approving, you authorize SchoolStack to process ACH deposits to staff on file.
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {!complete && (
        <div
          className="flex-shrink-0 flex items-center gap-2 px-5 py-4"
          style={{ borderTop: `1px solid ${C.border}` }}
        >
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="text-xs font-medium rounded-sm px-4 py-2"
              style={demoSecondaryButtonStyle()}
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto flex items-center gap-1.5 text-xs font-semibold rounded-sm px-4 py-2"
              style={{ backgroundColor: C.accent, color: "#fff" }}
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold rounded-sm py-2.5"
              style={{
                backgroundColor: C.accent,
                color: "#fff",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  Approve & run payroll <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

function FinancesPayrollTab({
  onNavigateExpenses,
  onNavigateToStaff,
}: {
  onNavigateExpenses: () => void;
  onNavigateToStaff?: (staffId: string) => void;
}) {
  const { openBackdrop, closeBackdrop } = useContext(BackdropContext);
  const summary = getPayrollHubSummary();
  const [highlightStaffId, setHighlightStaffId] = useState<string | null>(null);
  const [runWizardOpen, setRunWizardOpen] = useState(false);
  const [runWizardStep, setRunWizardStep] = useState<PayrollRunWizardStep>(1);
  const [runStatus, setRunStatus] = useState<PayrollRunStatus>("not_started");
  const [recentRuns, setRecentRuns] = useState(DEMO_PAYROLL_RUNS.recent);
  const [successBanner, setSuccessBanner] = useState(false);
  const staffTableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (runWizardOpen) openBackdrop(() => setRunWizardOpen(false));
    else closeBackdrop();
  }, [runWizardOpen, openBackdrop, closeBackdrop]);

  const openRunWizard = () => {
    setRunWizardStep(1);
    setRunWizardOpen(true);
  };

  const handlePayrollComplete = () => {
    const totalNet = getPayrollRunLineItems().reduce((sum, row) => sum + row.net, 0);
    setRunStatus("in_review");
    setRecentRuns([
      {
        id: "run-may-23-done",
        payday: DEMO_PAY_PERIOD.paydayShort,
        type: "Regular",
        total: formatUsd(totalNet),
        status: "In review",
      },
    ]);
    setSuccessBanner(true);
    setTimeout(() => setSuccessBanner(false), 5000);
  };

  const runStatusLabel =
    runStatus === "not_started"
      ? "Not started"
      : runStatus === "in_review"
        ? "In review"
        : "Approved";
  const runStatusStyle =
    runStatus === "not_started"
      ? { bg: C.errorBg, text: C.error }
      : runStatus === "in_review"
        ? { bg: C.warningBg, text: C.warning }
        : { bg: C.successBg, text: C.success };

  const actionItems = [
    summary.needsSetupCount > 0 && {
      id: "setup",
      label: `Complete payroll setup for ${summary.needsSetupCount} staff member${summary.needsSetupCount !== 1 ? "s" : ""}`,
      done: false,
    },
    summary.missingRatesCount > 0 && {
      id: "rates",
      label: `Missing pay rates (${summary.missingRatesCount})`,
      done: false,
    },
    summary.pendingFormsCount > 0 && {
      id: "forms",
      label: `Pending tax or direct deposit forms (${summary.pendingFormsCount})`,
      done: false,
    },
    {
      id: "hours",
      label: "Review time clock hours before next run",
      done: false,
    },
  ].filter(Boolean) as { id: string; label: string; done: boolean }[];

  const scrollToStaffTable = () => {
    staffTableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.div
      key="payroll"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="relative flex-1 overflow-y-auto min-h-full p-6"
      style={{ backgroundColor: C.surface }}
    >
      <AnimatePresence>
        {runWizardOpen && (
          <RunPayrollWizard
            step={runWizardStep}
            onStepChange={setRunWizardStep}
            onClose={() => setRunWizardOpen(false)}
            onComplete={handlePayrollComplete}
            onNavigateToStaff={(id) => {
              setRunWizardOpen(false);
              onNavigateToStaff?.(id);
            }}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 min-w-0 space-y-5">
          {successBanner && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-sm px-4 py-3 flex items-center gap-2"
              style={{
                backgroundColor: C.successBg,
                border: `1px solid ${C.successBorder}`,
              }}
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: C.success }} />
              <p className="text-xs font-medium" style={{ color: C.textPrimary }}>
                Payroll submitted for review — deposits scheduled for {DEMO_PAY_PERIOD.payday}.
              </p>
            </motion.div>
          )}

          {summary.needsSetupCount > 0 && (
            <div
              className="rounded-sm px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              style={{
                backgroundColor: C.warningBg,
                border: `1px solid ${C.warningBorder}`,
              }}
            >
              <div>
                <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>
                  {summary.needsSetupCount} staff member
                  {summary.needsSetupCount !== 1 ? "s need" : " needs"} payroll setup
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: C.textSecondary }}>
                  Complete pay rates and required forms before your next payroll run.
                </p>
              </div>
              <DemoButton variant="primary" className="text-xs flex-shrink-0" onClick={scrollToStaffTable}>
                Review
              </DemoButton>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-sm p-4"
              style={{ backgroundColor: C.elevated, border: `1px solid ${C.border}` }}
            >
              <p className="text-[10px] font-medium uppercase tracking-wide mb-1" style={{ color: C.textTertiary }}>
                YTD Payroll Spend
              </p>
              <p className="text-xl font-bold tabular-nums" style={{ color: C.textPrimary }}>
                {formatUsd(summary.ytdPayroll)}
              </p>
              <p className="text-[10px] mt-1" style={{ color: C.textTertiary }}>
                {formatUsd(summary.personnelActual)} in Personnel budget
              </p>
            </div>
            <div
              className="rounded-sm p-4 flex flex-col justify-between"
              style={{ backgroundColor: C.elevated, border: `1px solid ${C.border}` }}
            >
              <p className="text-[10px] font-medium uppercase tracking-wide mb-1" style={{ color: C.textTertiary }}>
                Next Payday
              </p>
              <p className="text-xl font-bold" style={{ color: C.accent }}>
                {DEMO_PAY_PERIOD.paydayShort}
              </p>
              <button
                type="button"
                onClick={onNavigateExpenses}
                className="text-[10px] font-medium mt-2 flex items-center gap-1 text-left"
                style={{ color: C.accent }}
              >
                View in Expenses
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <Card style={{ padding: "16px 18px" }}>
            <div className="flex items-center justify-between mb-3">
              <SectionLabel>Upcoming payroll</SectionLabel>
              <DemoButton
                variant="primary"
                className="text-[10px] px-2.5 py-1"
                onClick={openRunWizard}
                disabled={runWizardOpen}
              >
                Run payroll
              </DemoButton>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Payday", "Approval deadline", "Type", "Status"].map((h) => (
                      <th
                        key={h}
                        className="pb-2 pr-4 font-semibold text-[10px] uppercase tracking-wide"
                        style={{ color: C.textTertiary }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium" style={{ color: C.textPrimary }}>
                      {DEMO_PAY_PERIOD.paydayShort}
                    </td>
                    <td className="py-2.5 pr-4" style={{ color: C.textSecondary }}>
                      {DEMO_PAY_PERIOD.approvalDeadline}
                    </td>
                    <td className="py-2.5 pr-4" style={{ color: C.textSecondary }}>
                      Regular
                    </td>
                    <td className="py-2.5">
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
                        style={{ backgroundColor: runStatusStyle.bg, color: runStatusStyle.text }}
                      >
                        {runStatusLabel}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <Card style={{ padding: "16px 18px" }}>
            <SectionLabel>Recent payroll</SectionLabel>
            {recentRuns.length === 0 ? (
              <p className="text-xs py-6 text-center" style={{ color: C.textTertiary }}>
                No payroll history yet
              </p>
            ) : (
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {["Payday", "Type", "Total", "Status"].map((h) => (
                        <th
                          key={h}
                          className="pb-2 pr-4 font-semibold text-[10px] uppercase tracking-wide"
                          style={{ color: C.textTertiary }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentRuns.map((run) => (
                      <tr key={run.id}>
                        <td className="py-2.5 pr-4 font-medium" style={{ color: C.textPrimary }}>
                          {run.payday}
                        </td>
                        <td className="py-2.5 pr-4" style={{ color: C.textSecondary }}>
                          {run.type}
                        </td>
                        <td className="py-2.5 pr-4 tabular-nums font-medium" style={{ color: C.textPrimary }}>
                          {run.total}
                        </td>
                        <td className="py-2.5">
                          <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
                            style={{ backgroundColor: C.warningBg, color: C.warning }}
                          >
                            {run.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card style={{ padding: "16px 18px" }}>
            <div className="flex items-center justify-between mb-3">
              <SectionLabel>Pay schedules</SectionLabel>
              <button
                type="button"
                className="text-[10px] font-semibold flex items-center gap-1"
                style={{ color: C.accent }}
              >
                <Plus className="w-3 h-3" />
                Add pay schedule
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Name", "Pay frequency", "Next pay date"].map((h) => (
                      <th
                        key={h}
                        className="pb-2 pr-4 font-semibold text-[10px] uppercase tracking-wide"
                        style={{ color: C.textTertiary }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEMO_PAY_SCHEDULES.map((sched, i) => (
                    <tr
                      key={sched.id}
                      style={{
                        borderBottom:
                          i < DEMO_PAY_SCHEDULES.length - 1 ? `1px solid ${C.border}` : "none",
                      }}
                    >
                      <td className="py-2.5 pr-4 font-medium" style={{ color: C.textPrimary }}>
                        {sched.name}
                      </td>
                      <td className="py-2.5 pr-4" style={{ color: C.textSecondary }}>
                        {sched.frequency}
                      </td>
                      <td className="py-2.5 tabular-nums" style={{ color: C.textSecondary }}>
                        {sched.nextPayDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div ref={staffTableRef}>
            <Card style={{ padding: "16px 18px" }}>
              <SectionLabel hint="Click a row to open that staff member's payroll profile.">
                Staff payroll readiness
              </SectionLabel>
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {["Staff", "Rate", "Schedule", "Last pay", "Status"].map((h) => (
                        <th
                          key={h}
                          className="pb-2 pr-3 font-semibold text-[10px] uppercase tracking-wide"
                          style={{ color: C.textTertiary }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {summary.rows.map(({ staff, status }, i) => {
                      const style = PAYROLL_READINESS_STYLES[status];
                      const isHighlight = highlightStaffId === staff.id;
                      return (
                        <tr
                          key={staff.id}
                          className="cursor-pointer transition-colors"
                          style={{
                            borderBottom:
                              i < summary.rows.length - 1 ? `1px solid ${C.border}` : "none",
                            backgroundColor: isHighlight ? C.accentLight : "transparent",
                          }}
                          onClick={() => {
                            setHighlightStaffId(staff.id);
                            onNavigateToStaff?.(staff.id);
                            setTimeout(() => setHighlightStaffId(null), 1200);
                          }}
                          onMouseEnter={(e) => {
                            if (!isHighlight) e.currentTarget.style.backgroundColor = C.elevated;
                          }}
                          onMouseLeave={(e) => {
                            if (!isHighlight) e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <td className="py-2.5 pr-3">
                            <p className="font-medium" style={{ color: C.textPrimary }}>
                              {staff.name}
                            </p>
                            <p className="text-[10px]" style={{ color: C.textTertiary }}>
                              {staff.role}
                            </p>
                          </td>
                          <td className="py-2.5 pr-3 tabular-nums" style={{ color: C.textSecondary }}>
                            {formatStaffPayRate(staff)}
                          </td>
                          <td className="py-2.5 pr-3" style={{ color: C.textSecondary }}>
                            {staff.payroll.schedule}
                          </td>
                          <td className="py-2.5 pr-3 tabular-nums" style={{ color: C.textSecondary }}>
                            {formatUsd(staff.payroll.lastNet)}
                          </td>
                          <td className="py-2.5">
                            <span
                              className="px-2 py-0.5 rounded-full text-[9px] font-semibold whitespace-nowrap"
                              style={{ backgroundColor: style.bg, color: style.text }}
                            >
                              {getPayrollReadinessLabel(status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>

        <div className="w-full lg:w-56 flex-shrink-0">
          <Card style={{ padding: "14px 16px" }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.textTertiary }}>
              Actions needed
            </p>
            <ul className="space-y-2.5">
              {actionItems.map((item) => (
                <li key={item.id} className="flex items-start gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0 mt-0.5 border"
                    style={{ borderColor: C.border }}
                  />
                  <span className="text-[11px] leading-snug" style={{ color: C.textSecondary }}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function BudgetPage({
  activeTab: tab,
  onTabChange,
  onNavigateToTuition,
  onNavigateToStaff,
}: {
  activeTab: BudgetTab;
  onTabChange: (tab: BudgetTab) => void;
  onNavigateToTuition?: (opts?: TuitionNavigateOptions) => void;
  onNavigateToStaff?: (staffId: string) => void;
}) {
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState("all");
  const [revenuePendingOnly, setRevenuePendingOnly] = useState(false);

  const handleNavigate = useCallback(
    (target: BudgetTab, opts?: BudgetNavigateOptions) => {
      if (opts?.expenseCategory) {
        setExpenseCategoryFilter(opts.expenseCategory);
      }
      if (opts?.revenuePendingOnly !== undefined) {
        setRevenuePendingOnly(opts.revenuePendingOnly);
      }
      onTabChange(target);
    },
    [onTabChange],
  );

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        {tab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto space-y-5 p-6"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  label: "Total Revenue",
                  value: "$47,320",
                  color: C.success,
                  icon: <DollarSign className="w-3.5 h-3.5" />,
                },
                {
                  label: "Total Expenses",
                  value: "$31,840",
                  color: C.error,
                  icon: <Wallet className="w-3.5 h-3.5" />,
                },
                {
                  label: "Net Profit",
                  value: "$15,480",
                  color: C.accent,
                  icon: <TrendingUp className="w-3.5 h-3.5" />,
                },
                {
                  label: "Burn Rate",
                  value: "$2,653/mo",
                  color: C.warning,
                  icon: <Timer className="w-3.5 h-3.5" />,
                },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-sm p-4"
                  style={{
                    backgroundColor: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div
                    className="flex items-center gap-1.5 mb-2"
                    style={{ color: s.color }}
                  >
                    {s.icon}
                    <p
                      className="text-xs font-medium"
                      style={{ color: C.textTertiary }}
                    >
                      {s.label}
                    </p>
                  </div>
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
            className="flex-1 overflow-hidden"
          >
            <BudgetExpensesTab
              categoryFilter={expenseCategoryFilter}
              onCategoryFilterChange={setExpenseCategoryFilter}
            />
          </motion.div>
        )}

        {tab === "revenue" && (
          <motion.div
            key="revenue"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-hidden"
          >
            <BudgetRevenueTab
              pendingOnly={revenuePendingOnly}
              onPendingOnlyChange={setRevenuePendingOnly}
            />
          </motion.div>
        )}

        {tab === "insights" && (
          <motion.div
            key="insights"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-hidden flex flex-col"
          >
            <BudgetInsightsTab
              onNavigateTab={handleNavigate}
              onNavigateTuition={onNavigateToTuition}
            />
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
            <TransactionsPage
              onNavigateToTuition={(familyId) =>
                onNavigateToTuition?.({ familyId })
              }
            />
          </motion.div>
        )}

        {tab === "payroll" && (
          <FinancesPayrollTab
            onNavigateExpenses={() =>
              handleNavigate("expenses", { expenseCategory: "Personnel" })
            }
            onNavigateToStaff={onNavigateToStaff}
          />
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
            style={demoSecondaryButtonStyle({ color: C.textTertiary })}
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
                        className="text-left rounded-sm p-3 transition-all duration-150"
                        style={{
                          border: `2px solid ${sel ? C.accent : C.border}`,
                          backgroundColor: sel ? C.accentLight : C.surface,
                          boxShadow: sel ? `0 0 0 2px ${C.accentGlow ?? C.accentLight}` : "none",
                        }}
                      >
                        <div className="flex items-start gap-2 mb-1.5">
                          <div
                            className="flex items-center justify-center rounded-sm flex-shrink-0"
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
                          <span className="text-[9px] rounded-full px-1.5 py-0.5" style={{ backgroundColor: C.surface, color: C.textSecondary }}>
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
                  className="mt-2.5 w-full rounded-sm py-3 text-[11px] font-medium transition-all duration-150"
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
                        className="w-full text-left flex items-center gap-3 rounded-sm p-3 transition-all duration-150"
                        style={{
                          border: `2px solid ${sel ? C.accent : C.border}`,
                          backgroundColor: sel ? C.accentLight : C.surface,
                        }}
                      >
                        <div
                          className="flex items-center justify-center rounded-sm flex-shrink-0"
                          style={{ width: 36, height: 36, backgroundColor: C.surface, color: sel ? C.accent : C.textSecondary }}
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
                        className="w-full text-left flex items-center gap-3 rounded-sm px-3 py-2.5 transition-all duration-150"
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
                          style={{ backgroundColor: C.surface, color: C.textSecondary }}
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
                        style={demoLightPillStyle(sel, {
                          border: `1.5px solid ${sel ? C.accent : C.secondaryBtnBorder}`,
                        })}
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
                        style={demoLightPillStyle(sel, {
                          border: `1.5px solid ${sel ? C.accent : C.secondaryBtnBorder}`,
                        })}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>

                <div
                  className="rounded-sm p-3"
                  style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}` }}
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
                    className="flex flex-col items-center justify-center rounded-sm py-10"
                    style={{ border: `2px dashed ${C.border}`, color: C.textTertiary }}
                  >
                    <Layers className="w-6 h-6 mb-2 opacity-40" />
                    <div className="text-[11px] mb-3">Your flow is empty.</div>
                    <button
                      onClick={() => setAddPickerIndex(0)}
                      className="flex items-center gap-1 text-[11px] font-medium rounded-sm px-3 py-1.5"
                      style={demoSecondaryButtonStyle()}
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
                            className="flex gap-1.5 p-2 rounded-sm"
                            style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}` }}
                          >
                            {WIZARD_STEP_TYPES.map((st) => (
                              <button
                                key={st.type}
                                onClick={() => addStep(st.type, 0)}
                                className="flex-1 flex flex-col items-center gap-1 rounded-sm py-2 text-[10px] font-medium transition-all"
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
                            className="flex items-center gap-3 rounded-sm px-3 py-2.5 relative"
                            style={{
                              backgroundColor: C.surface,
                              border: `1px solid ${C.border}`,
                              boxShadow: C.shadowCard,
                              marginBottom: 2,
                            }}
                          >
                            <div
                              className="flex items-center justify-center rounded-sm flex-shrink-0"
                              style={{ width: 32, height: 32, backgroundColor: sc.bg, color: sc.fg }}
                            >
                              <StepTypeIcon type={step.type} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-semibold" style={{ color: C.textPrimary }}>{step.label}</div>
                              {step.delay && (
                                <span
                                  className="text-[9px] rounded-full px-1.5 py-0.5"
                                  style={demoSecondaryButtonStyle({ color: C.textTertiary })}
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
                                width: 22,
                                height: 22,
                                ...demoSecondaryButtonStyle({ color: C.textTertiary }),
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
                                  className="flex gap-1.5 p-2 rounded-sm"
                                  style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}` }}
                                >
                                  {WIZARD_STEP_TYPES.map((st) => (
                                    <button
                                      key={st.type}
                                      onClick={() => addStep(st.type, i + 1)}
                                      className="flex-1 flex flex-col items-center gap-1 rounded-sm py-2 text-[10px] font-medium transition-all"
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
                      className="w-full text-sm font-semibold rounded-sm px-3.5 py-2.5 mb-4 outline-none"
                      style={{
                        ...demoInputStyle(),
                        borderLeft: `3px solid ${C.accent}`,
                        fontSize: 15,
                      }}
                      placeholder="Automation name…"
                    />

                    {/* Launch mode toggle */}
                    <div
                      className="flex p-1 rounded-sm mb-4"
                      style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}` }}
                    >
                      {(["live", "draft"] as const).map((mode) => {
                        const active = state.launchMode === mode;
                        return (
                          <button
                            key={mode}
                            onClick={() => onChange({ launchMode: mode })}
                            className="flex-1 text-xs font-medium rounded-sm py-2 transition-all duration-150"
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
                      className="rounded-sm p-4"
                      style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}` }}
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
              className="text-xs font-medium rounded-sm px-4 py-2"
              style={demoSecondaryButtonStyle()}
            >
              Back
            </button>
          )}
          {state.step < 5 ? (
            <button
              onClick={handleNext}
              disabled={!canContinue}
              className="ml-auto flex items-center gap-1.5 text-xs font-semibold rounded-sm px-4 py-2 transition-opacity"
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
              className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold rounded-sm py-2.5"
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
    {
      label: "Active Pipelines",
      value: totalActive,
      color: C.success,
      icon: <Zap className="w-3.5 h-3.5" />,
    },
    {
      label: "Total Sent",
      value: totalSent.toLocaleString(),
      color: C.info,
      icon: <Send className="w-3.5 h-3.5" />,
    },
    {
      label: "Avg Open Rate",
      value: `${avgOpenRate}%`,
      color: C.accent,
      icon: <Eye className="w-3.5 h-3.5" />,
    },
    {
      label: "Conversions",
      value: totalConversions,
      color: C.purple,
      icon: <TrendingUp className="w-3.5 h-3.5" />,
    },
  ];

  const openWizard = () => {
    setWizardState(WIZARD_INITIAL_STATE);
    setIsCreating(true);
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: C.bg }}
    >
      <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
        {/* KPI row — grid view only */}
        {!selected && (
          <>
            <div className="px-6 pt-5 pb-4 flex-shrink-0">
              <FeatureTip text="These numbers show how your automations are performing — open rates and conversions tell you what's working." />
            </div>
            <div
              className="flex flex-shrink-0"
              style={{
                borderTop: `1px solid ${C.border}`,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              {KPI_STATS.map((s, i) => (
                <div
                  key={s.label}
                  className="flex-1 px-6 py-3"
                  style={{
                    borderRight:
                      i < KPI_STATS.length - 1
                        ? `1px solid ${C.border}`
                        : undefined,
                  }}
                >
                  <div
                    className="flex items-center gap-1.5 mb-1"
                    style={{ color: s.color }}
                  >
                    {s.icon}
                    <p
                      className="text-xs font-medium"
                      style={{ color: C.textTertiary }}
                    >
                      {s.label}
                    </p>
                  </div>
                  <p
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: s.color }}
                  >
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Filter toolbar — grid view only */}
        {!selected && (
          <div
            className="sticky top-0 z-10 flex items-center gap-2 px-6 py-3 flex-shrink-0"
            style={{
              borderBottom: `1px solid ${C.border}`,
              backgroundColor: C.bg,
            }}
          >
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setFilter(f.key);
                  setSelectedId(null);
                }}
                className="px-3 py-1 text-xs font-medium rounded-full transition-all"
                style={demoSolidPillStyle(filter === f.key)}
              >
                {f.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs" style={{ color: C.textTertiary }}>
                {filtered.length} pipeline{filtered.length !== 1 ? "s" : ""}
              </span>
              <DemoButton onClick={openWizard}>
                <span className="text-base leading-none">+</span> New Automation
              </DemoButton>
            </div>
          </div>
        )}

        {/* List / Detail */}
        <AnimatePresence mode="wait">
          {selected ? (
            /* ── Detail view ───────────────────────────────── */
            <motion.div
              key={`detail-${selected.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="px-6 py-4 space-y-4"
            >
              {/* Back + title bar */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedId(null)}
                  className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-sm"
                  style={demoSecondaryButtonStyle()}
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
              <div
                className="flex"
                style={{
                  borderTop: `1px solid ${C.border}`,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                {[
                  {
                    label: "Enrolled",
                    value: selected.stats.enrolled,
                    color: C.accent,
                    icon: <Users className="w-3.5 h-3.5" />,
                  },
                  {
                    label: "Emails Sent",
                    value: selected.stats.sent.toLocaleString(),
                    color: C.info,
                    icon: <Send className="w-3.5 h-3.5" />,
                  },
                  {
                    label: "Open Rate",
                    value:
                      selected.stats.openRate > 0
                        ? `${selected.stats.openRate}%`
                        : "—",
                    color: C.warning,
                    icon: <Eye className="w-3.5 h-3.5" />,
                  },
                  {
                    label: "Conversions",
                    value:
                      selected.stats.conversions > 0
                        ? selected.stats.conversions
                        : "—",
                    color: C.purple,
                    icon: <TrendingUp className="w-3.5 h-3.5" />,
                  },
                ].map((s, i, arr) => (
                  <div
                    key={s.label}
                    className="flex-1 px-4 py-3"
                    style={{
                      borderRight:
                        i < arr.length - 1
                          ? `1px solid ${C.border}`
                          : undefined,
                    }}
                  >
                    <div
                      className="flex items-center gap-1.5 mb-1.5"
                      style={{ color: s.color }}
                    >
                      {s.icon}
                      <p
                        className="text-[10px] uppercase tracking-widest font-semibold"
                        style={{ color: C.textTertiary }}
                      >
                        {s.label}
                      </p>
                    </div>
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
                className="rounded-sm p-4"
                style={{
                  backgroundImage: `radial-gradient(circle, ${C.border} 1px, transparent 1px)`,
                  backgroundSize: "20px 20px",
                  backgroundColor: C.surface,
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
                                backgroundColor: C.surface,
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
                                        backgroundColor: C.surface,
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
            /* ── List view ─────────────────────────────────── */
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col flex-1"
            >
              {filtered.map((pipeline, idx) => {
                const sb = statusBadge(pipeline.status);
                const actionSteps = pipeline.steps.filter(
                  (s) => s.type !== "wait",
                );
                return (
                  <motion.button
                    key={pipeline.id}
                    type="button"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => setSelectedId(pipeline.id)}
                    className="w-full text-left px-6 py-4 flex items-center gap-6 transition-colors duration-150"
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        C.elevated;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "transparent";
                    }}
                  >
                    {/* Left: name, description, badges */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p
                          className="text-sm font-semibold leading-tight truncate"
                          style={{ color: C.textPrimary }}
                        >
                          {pipeline.name}
                        </p>
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
                      <p
                        className="text-[11px] line-clamp-1 leading-relaxed mb-1.5"
                        style={{ color: C.textTertiary }}
                      >
                        {pipeline.description}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap">
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
                    </div>

                    {/* Middle: step flow pills */}
                    <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
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
                        className="ml-1 text-[10px] whitespace-nowrap"
                        style={{ color: C.textTertiary }}
                      >
                        {actionSteps.length} action
                        {actionSteps.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Right: metrics */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {pipeline.stats.sent > 0 ? (
                        <>
                          <div className="text-right hidden sm:block">
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
                          <div className="text-right hidden sm:block">
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
                          <div className="text-right hidden md:block">
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
                          className="text-[10px] italic whitespace-nowrap"
                          style={{ color: C.textQuaternary }}
                        >
                          Draft — not yet sent
                        </span>
                      )}
                      <ChevronRight
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: C.textTertiary }}
                      />
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
      className="flex h-full flex-col gap-0 overflow-hidden"
      style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.surface }}
    >
      <div className="flex-shrink-0 px-4 pt-4 pb-2">
        <PageHeader
          icon="👀"
          title="Parent View"
          subtitle="See exactly what families see"
          tip="Pick a family on the left to preview their parent portal — payments, messages, and student info exactly as they see it."
          className="mb-0"
        />
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Left panel — parent list */}
      <div
        className="flex-shrink-0 overflow-y-auto"
        style={{ width: 170, borderRight: `1px solid ${C.border}` }}
      >
        <div className="px-3 py-3 border-b" style={{ borderColor: C.border }}>
          <p
            className="text-xs font-medium"
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
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-sm transition-colors"
                style={demoSecondaryButtonStyle()}
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
    </div>
  );
}

// ─── Coming soon stub ─────────────────────────────────────────────────────────

function ComingSoonPage({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center gap-4">
      <div
        className="w-16 h-16 rounded-md flex items-center justify-center mb-2"
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

// ─── My School sub-pages ──────────────────────────────────────────────────────

const STAFF_PROFILE_TABS: {
  key: StaffProfileTab;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  { key: "profile", label: "Profile", icon: <UserCircle className="w-3 h-3" />, color: "#5E7C68" },
  { key: "paperwork", label: "Paperwork", icon: <ClipboardList className="w-3 h-3" />, color: "#38BDF8" },
  { key: "credentials", label: "Credentials", icon: <GraduationCap className="w-3 h-3" />, color: "#8B5CF6" },
  { key: "payroll", label: "Payroll", icon: <Wallet className="w-3 h-3" />, color: "#22C55E" },
  { key: "compensation", label: "Compensation", icon: <DollarSign className="w-3 h-3" />, color: "#F59E0B" },
  { key: "schedule", label: "Schedule", icon: <CalendarDays className="w-3 h-3" />, color: "#F97316" },
  { key: "classes", label: "Classes", icon: <BookOpen className="w-3 h-3" />, color: "#EC4899" },
  { key: "access", label: "Access", icon: <Eye className="w-3 h-3" />, color: "#6366F1" },
  { key: "activity", label: "Activity", icon: <Clock className="w-3 h-3" />, color: "#64748B" },
];

function StaffPaperworkCard({
  form,
}: {
  form: DemoStaff["paperwork"][number];
}) {
  const statusColor =
    form.status === "signed" ? C.success : form.status === "overdue" ? C.error : C.warning;
  const statusLabel =
    form.status === "signed"
      ? form.signedDate
        ? `Signed ${form.signedDate}`
        : "Signed"
      : form.status === "overdue"
        ? "Overdue"
        : "Pending";

  return (
    <div
      className="flex flex-col rounded-sm p-3 min-h-[120px]"
      style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-xs font-semibold leading-snug" style={{ color: C.textPrimary }}>
          {form.title}
        </p>
        {form.status === "signed" ? (
          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.success }} />
        ) : (
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: statusColor }} />
        )}
      </div>
      <p className="text-[10px] mt-auto font-medium" style={{ color: statusColor }}>
        {statusLabel}
      </p>
    </div>
  );
}

function StaffProfilePanel({
  staff,
  profileTab,
  onProfileTabChange,
  onNavigateToFinancesPayroll,
}: {
  staff: DemoStaff;
  profileTab: StaffProfileTab;
  onProfileTabChange: (tab: StaffProfileTab) => void;
  onNavigateToFinancesPayroll?: () => void;
}) {
  const tab = profileTab;
  const setTab = onProfileTabChange;
  const statusStyle = STAFF_STATUS_STYLES[staff.status];
  const compliance = getStaffComplianceSummary(staff);
  const assignments = getStaffProgramAssignments(staff);
  const paperworkSigned = staff.paperwork.filter((p) => p.status === "signed").length;
  const paperworkPending = staff.paperwork.filter((p) => p.status !== "signed");

  const employmentLabel =
    staff.employmentType === "full_time"
      ? "Full-time"
      : staff.employmentType === "part_time"
        ? "Part-time"
        : "Substitute";

  return (
    <motion.div
      key={staff.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: C.surface }}
    >
      <div
        className="flex items-start gap-3 px-5 py-4 flex-shrink-0"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: staff.color + "22", color: staff.color }}
        >
          {staff.initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            {staff.name}
          </h3>
          <p className="text-[11px]" style={{ color: C.textTertiary }}>
            {staff.role} · {staff.room} ·{" "}
            <span style={{ color: statusStyle.text }}>{statusStyle.label}</span>
          </p>
          {(compliance.expiringCredentials > 0 || compliance.overduePaperwork > 0) && (
            <div className="flex items-center gap-1 flex-wrap mt-1.5">
              {compliance.expiringCredentials > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                  style={{ backgroundColor: C.warningBg, color: C.warning }}
                >
                  {compliance.expiringCredentials} credential
                  {compliance.expiringCredentials !== 1 ? "s" : ""} need attention
                </span>
              )}
              {compliance.overduePaperwork > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                  style={{ backgroundColor: C.errorBg, color: C.error }}
                >
                  {compliance.overduePaperwork} overdue form
                  {compliance.overduePaperwork !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className="flex items-center px-4 pt-2.5 pb-0 flex-shrink-0 overflow-x-auto"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        {STAFF_PROFILE_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className="flex-shrink-0 flex items-center gap-1.5 px-2.5 pb-2.5 text-[11px] font-medium relative whitespace-nowrap"
            style={{ color: tab === t.key ? C.accent : C.textTertiary }}
          >
            <span className="flex-shrink-0" style={{ color: t.color }} aria-hidden>
              {t.icon}
            </span>
            {t.label}
            {tab === t.key && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ backgroundColor: C.accent }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "profile" && (
          <div className="p-5 space-y-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.textTertiary }}>
                Contact
              </p>
              <DetailField label="Email" value={staff.email} />
              <DetailField label="Phone" value={staff.phone} />
              <DetailField
                label="Emergency Contact"
                value={`${staff.emergencyContact.name} (${staff.emergencyContact.relationship}) · ${staff.emergencyContact.phone}`}
              />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.textTertiary }}>
                Employment
              </p>
              <DetailField label="Role" value={staff.role} />
              <DetailField label="Primary Room" value={staff.room} />
              <DetailField label="Employment Type" value={employmentLabel} />
              <DetailField label="Hire Date" value={staff.hireDate} />
              <DetailField label="Pay Rate" value={formatStaffPayRate(staff)} />
            </div>
          </div>
        )}

        {tab === "paperwork" && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textTertiary }}>
                {paperworkSigned} / {staff.paperwork.length} complete
              </p>
              <div className="flex items-center gap-2">
                {paperworkPending.length > 0 && (
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-[10px] font-semibold"
                    style={{
                      backgroundColor: C.accentLight,
                      color: C.accent,
                      border: `1px solid ${C.accentDark + "44"}`,
                    }}
                  >
                    <Send className="w-3 h-3" />
                    Send Pending
                  </button>
                )}
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-[10px] font-semibold"
                  style={{ color: C.textSecondary, border: `1px solid ${C.border}` }}
                >
                  <Plus className="w-3 h-3" />
                  New Form
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {staff.paperwork.map((form) => (
                <StaffPaperworkCard key={form.id} form={form} />
              ))}
            </div>
          </div>
        )}

        {tab === "credentials" && (
          <div className="p-5 space-y-3">
            {[...staff.credentials]
              .sort((a, b) => {
                const order: Record<StaffCredentialStatus, number> = {
                  expired: 0,
                  expiring: 1,
                  missing: 2,
                  valid: 3,
                };
                return order[a.status] - order[b.status];
              })
              .map((cred, i) => {
                const style = CREDENTIAL_STATUS_STYLES[cred.status];
                return (
                  <div
                    key={cred.id}
                    className="flex items-start justify-between gap-4 py-3"
                    style={{
                      borderBottom:
                        i < staff.credentials.length - 1 ? `1px solid ${C.border}` : "none",
                    }}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>
                        {cred.name}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: C.textTertiary }}>
                        {cred.issuedDate ? `Issued ${cred.issuedDate}` : "Not on file"}
                        {cred.expiryDate ? ` · Expires ${cred.expiryDate}` : ""}
                      </p>
                    </div>
                    <span
                      className="px-2 py-0.5 text-[10px] font-semibold rounded-full flex-shrink-0"
                      style={{ backgroundColor: style.bg, color: style.text }}
                    >
                      {style.label}
                    </span>
                  </div>
                );
              })}
          </div>
        )}

        {tab === "payroll" && (
          <div className="p-5 space-y-5">
            <div className="flex flex-wrap gap-4">
              {[
                { label: "Pay Rate", value: formatStaffPayRate(staff) },
                { label: "Last Pay", value: formatUsd(staff.payroll.lastNet) },
                { label: "YTD Gross", value: formatUsd(staff.payroll.ytdGross) },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="flex-1 min-w-[5.5rem]"
                  style={{
                    borderLeft: i > 0 ? `1px solid ${C.border}` : undefined,
                    paddingLeft: i > 0 ? "1rem" : undefined,
                  }}
                >
                  <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: C.textTertiary }}>
                    {stat.label}
                  </p>
                  <p className="text-lg font-semibold mt-0.5 tabular-nums" style={{ color: C.textPrimary }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
            <div>
              <DetailField label="Pay Type" value={staff.payroll.payType === "salary" ? "Salary" : "Hourly"} />
              <DetailField label="Schedule" value={staff.payroll.schedule} />
              <DetailField label="Last Pay Date" value={staff.payroll.lastPayDate} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.textTertiary }}>
                Recent Pay Periods
              </p>
              {staff.payroll.recentPeriods.map((period, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 text-xs"
                  style={{
                    borderBottom:
                      i < staff.payroll.recentPeriods.length - 1 ? `1px solid ${C.border}` : "none",
                  }}
                >
                  <span style={{ color: C.textSecondary }}>{period.period}</span>
                  <span className="font-semibold tabular-nums" style={{ color: C.textPrimary }}>
                    {formatUsd(period.net)}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={onNavigateToFinancesPayroll}
              className="text-[11px] font-medium flex items-center gap-1"
              style={{ color: C.accent }}
            >
              View in Finances
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {tab === "compensation" && (
          <div className="p-5">
            <div className="space-y-0">
              {staff.compensationHistory.map((entry, i) => (
                <div
                  key={i}
                  className="py-3"
                  style={{
                    borderBottom:
                      i < staff.compensationHistory.length - 1 ? `1px solid ${C.border}` : "none",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>
                        {entry.label}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: C.textTertiary }}>
                        {entry.date}
                        {entry.author ? ` · ${entry.author}` : ""}
                      </p>
                    </div>
                    <p className="text-xs font-semibold tabular-nums flex-shrink-0" style={{ color: C.accent }}>
                      {entry.previousRate != null
                        ? `${entry.payType === "salary" ? formatUsd(entry.previousRate) + "/yr" : formatUsd(entry.previousRate) + "/hr"} → `
                        : ""}
                      {entry.payType === "salary"
                        ? `${formatUsd(entry.newRate)}/yr`
                        : `${formatUsd(entry.newRate)}/hr`}
                    </p>
                  </div>
                  <p className="text-[11px] mt-2 leading-relaxed" style={{ color: C.textSecondary }}>
                    {entry.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "schedule" && (
          <div className="p-5 space-y-5">
            {staff.status === "on_leave" ? (
              <div
                className="text-center py-8 px-4 rounded-sm"
                style={{ backgroundColor: C.warningBg, border: `1px solid ${C.warningBorder}` }}
              >
                <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: C.warning }} />
                <p className="text-xs font-medium" style={{ color: C.textPrimary }}>
                  On leave
                </p>
                <p className="text-[11px] mt-1" style={{ color: C.textSecondary }}>
                  Schedule and time entries paused until return date.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.textTertiary }}>
                    Typical Week
                  </p>
                  {staff.schedule.weeklyHours.length === 0 ? (
                    <p className="text-xs" style={{ color: C.textTertiary }}>
                      No fixed weekly schedule on file.
                    </p>
                  ) : (
                    staff.schedule.weeklyHours.map((row, i) => (
                      <div
                        key={row.day}
                        className="flex items-center justify-between py-2 text-xs"
                        style={{
                          borderBottom:
                            i < staff.schedule.weeklyHours.length - 1 ? `1px solid ${C.border}` : "none",
                        }}
                      >
                        <span className="font-medium w-8" style={{ color: C.textPrimary }}>
                          {row.day}
                        </span>
                        <span style={{ color: C.textSecondary }}>
                          {row.start} – {row.end}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: C.textTertiary }}>
                    PTO Balance
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${staff.schedule.pto.total ? (staff.schedule.pto.used / staff.schedule.pto.total) * 100 : 0}%`,
                          backgroundColor: C.accent,
                        }}
                      />
                    </div>
                    <span className="text-xs tabular-nums font-medium" style={{ color: C.textPrimary }}>
                      {staff.schedule.pto.used} / {staff.schedule.pto.total} days used
                    </span>
                  </div>
                </div>
                {staff.schedule.recentTimeEntries.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.textTertiary }}>
                      Recent Time Entries
                    </p>
                    {staff.schedule.recentTimeEntries.map((entry, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2.5 text-xs"
                        style={{
                          borderBottom:
                            i < staff.schedule.recentTimeEntries.length - 1
                              ? `1px solid ${C.border}`
                              : "none",
                        }}
                      >
                        <div>
                          <p className="font-medium" style={{ color: C.textPrimary }}>
                            {entry.date}
                          </p>
                          <p className="text-[10px]" style={{ color: C.textTertiary }}>
                            {entry.in} – {entry.out}
                          </p>
                        </div>
                        <span className="font-semibold tabular-nums" style={{ color: C.textSecondary }}>
                          {entry.hours}h
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === "classes" && (
          <div className="p-5">
            {assignments.length === 0 ? (
              <div className="text-center py-10">
                <GraduationCap className="w-8 h-8 mx-auto mb-2" style={{ color: C.textTertiary }} />
                <p className="text-xs font-medium" style={{ color: C.textPrimary }}>
                  No program assignments
                </p>
                <p className="text-[11px] mt-1 max-w-[220px] mx-auto" style={{ color: C.textTertiary }}>
                  {staff.role === "Administrator"
                    ? "Administrators are not assigned to classroom rosters."
                    : "Assign this staff member to a program from the Programs tab."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map(({ program, teacher }) => {
                  const pct = teacher.capacity
                    ? Math.round((teacher.studentIds.length / teacher.capacity) * 100)
                    : 0;
                  const isFull = teacher.capacity
                    ? teacher.studentIds.length >= teacher.capacity
                    : false;
                  return (
                    <div
                      key={`${program.id}-${teacher.id}`}
                      className="py-3"
                      style={{ borderBottom: `1px solid ${C.border}` }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                            {program.name}
                          </p>
                          <p className="text-[11px] mt-0.5" style={{ color: C.textTertiary }}>
                            {teacher.classroom}
                          </p>
                        </div>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: C.accentLight, color: C.accent }}
                        >
                          {PROGRAM_TYPE_LABELS[program.type]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs tabular-nums font-medium" style={{ color: C.textPrimary }}>
                          {teacher.studentIds.length}
                          {teacher.capacity ? ` / ${teacher.capacity}` : ""} students
                        </span>
                        {teacher.capacity ? (
                          <div className="w-24 flex-shrink-0">
                            <div
                              className="h-1 rounded-full overflow-hidden"
                              style={{ backgroundColor: C.input }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min(pct, 100)}%`,
                                  backgroundColor: isFull ? C.warning : C.accent,
                                }}
                              />
                            </div>
                            <p className="text-[10px] mt-1 text-right" style={{ color: C.textTertiary }}>
                              {pct}% capacity
                            </p>
                          </div>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="mt-2 text-[10px] font-medium flex items-center gap-1"
                        style={{ color: C.accent }}
                      >
                        View program
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "access" && (
          <div className="p-5 space-y-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.textTertiary }}>
                Portal Role
              </p>
              <span
                className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full"
                style={{ backgroundColor: C.purpleBg, color: C.purple }}
              >
                {staff.access.portalRole}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.textTertiary }}>
                Permissions
              </p>
              {staff.access.permissions.map((perm, i) => (
                <div
                  key={perm.key}
                  className="flex items-center justify-between py-2.5 text-xs"
                  style={{
                    borderBottom:
                      i < staff.access.permissions.length - 1 ? `1px solid ${C.border}` : "none",
                  }}
                >
                  <span style={{ color: C.textSecondary }}>{perm.label}</span>
                  {perm.enabled ? (
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: C.success }} />
                  ) : (
                    <X className="w-4 h-4 flex-shrink-0" style={{ color: C.textTertiary }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "activity" && (
          <div className="p-5">
            <div className="space-y-0">
              {staff.activityLog.map((entry, i) => (
                <DemoActivityTimelineRow
                  key={i}
                  variant={entry.type === "note" ? "note" : entry.type === "action" ? "action" : "event"}
                  title={entry.title}
                  date={entry.date}
                  detail={entry.detail}
                  author={entry.author}
                  showConnectorBelow={i < staff.activityLog.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StaffPage({
  focusStaffId,
  focusStaffTab,
  onFocusConsumed,
  onNavigateToFinancesPayroll,
}: {
  focusStaffId?: string | null;
  focusStaffTab?: StaffProfileTab;
  onFocusConsumed?: () => void;
  onNavigateToFinancesPayroll?: () => void;
}) {
  const [selectedStaff, setSelectedStaff] = useState<DemoStaff>(DEMO_STAFF[0]);
  const [profileTab, setProfileTab] = useState<StaffProfileTab>("profile");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!focusStaffId) return;
    const member = DEMO_STAFF.find((s) => s.id === focusStaffId);
    if (member) {
      setSelectedStaff(member);
      setProfileTab(focusStaffTab ?? "payroll");
    }
    onFocusConsumed?.();
  }, [focusStaffId, focusStaffTab, onFocusConsumed]);

  const filtered = DEMO_STAFF.filter(
    (s) =>
      search === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.room.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="h-full flex flex-row overflow-hidden">
      <div
        className="w-64 flex-shrink-0 flex flex-col overflow-hidden"
        style={{ borderRight: `1px solid ${C.border}` }}
      >
        <div
          className="px-3 py-2 flex-shrink-0 space-y-2"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm"
            style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}` }}
          >
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.textTertiary }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff..."
              className="bg-transparent border-none outline-none text-sm w-full"
              style={{ color: C.textPrimary }}
            />
          </div>
          <DemoButton variant="ghost" className="w-full justify-center text-xs">
            <Plus className="w-3.5 h-3.5" />
            Add Staff
          </DemoButton>
        </div>
        <div className="flex-1 overflow-y-auto">
            {filtered.map((member, i) => {
              const isActive = selectedStaff.id === member.id;
              const statusStyle = STAFF_STATUS_STYLES[member.status];
              const compliance = getStaffComplianceSummary(member);
              const alertCount = compliance.expiringCredentials + compliance.overduePaperwork;
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="cursor-pointer px-3 py-2.5"
                  style={{
                    borderBottom: `1px solid ${C.border}`,
                    borderLeft: `2px solid ${isActive ? C.accent : "transparent"}`,
                    backgroundColor: isActive ? C.accentLight : "transparent",
                  }}
                  onClick={() => setSelectedStaff(member)}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = C.elevated;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isActive ? C.accentLight : "transparent";
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{ backgroundColor: member.color + "22", color: member.color }}
                    >
                      {member.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: C.textPrimary }}>
                        {member.name}
                      </p>
                      <p className="text-[10px] truncate" style={{ color: C.textTertiary }}>
                        {member.role} · {member.room}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5 pl-9 flex-wrap">
                    <span
                      className="text-[8px] px-1 py-0.5 rounded font-semibold"
                      style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                    >
                      {statusStyle.label}
                    </span>
                    {alertCount > 0 && (
                      <span
                        className="text-[8px] px-1 py-0.5 rounded font-semibold"
                        style={{ backgroundColor: C.warningBg, color: C.warning }}
                      >
                        {alertCount} alert{alertCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <StaffProfilePanel
            key={selectedStaff.id}
            staff={selectedStaff}
            profileTab={profileTab}
            onProfileTabChange={setProfileTab}
            onNavigateToFinancesPayroll={onNavigateToFinancesPayroll}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}

function ClassroomHealthSafetyTab({
  classroom,
  onSelectStudent,
}: {
  classroom: DemoClassroom;
  onSelectStudent: (student: DemoStudent) => void;
}) {
  const stats = getClassroomHealthStats(classroom);
  const flaggedStudents = getClassroomStudentsWithHealthFlags(classroom);
  const accommodationStudents = getClassroomStudents(classroom).filter(
    (s) => s.needsAide || s.regulationStrategies,
  );

  return (
    <div className="overflow-y-auto pb-6">
      <ProgramStatStrip
        stats={[
          {
            label: "Flagged students",
            value: stats.flagged,
            sub: `of ${stats.enrolled} enrolled`,
          },
          { label: "Allergies", value: stats.allergies, sub: "in roster" },
          { label: "Emergency meds", value: stats.emergencyMeds, sub: "in roster" },
          { label: "Support aides", value: stats.aides, sub: "assigned" },
        ]}
      />

      <ProgramDivider />

      <ProgramSection title="Emergency supplies">
        <div
          className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-x-4 text-[10px] font-semibold uppercase tracking-widest pb-2"
          style={{ color: C.textTertiary, borderBottom: `1px solid ${C.border}` }}
        >
          <span>Item</span>
          <span>Status</span>
          <span className="text-right">Last checked</span>
        </div>
        {classroom.emergencySupplies.map((supply, i) => {
          const statusStyle = getSupplyStatusStyle(supply.status);
          return (
            <div
              key={supply.id}
              className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-x-4 gap-y-1 py-3.5"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  {supply.item}
                </p>
                <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
                  {supply.location}
                </p>
                {supply.notes && (
                  <p className="text-[10px] mt-1" style={{ color: C.textSecondary }}>
                    {supply.notes}
                  </p>
                )}
              </div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full self-start sm:self-center h-fit"
                style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
              >
                {statusStyle.label}
              </span>
              <span
                className="text-xs self-start sm:self-center sm:text-right tabular-nums"
                style={{ color: C.textTertiary }}
              >
                {supply.lastChecked}
              </span>
            </div>
          );
        })}
        <p className="text-xs mt-4 flex items-center gap-2" style={{ color: C.textSecondary }}>
          <Shield className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.accent }} />
          {classroom.nurseContact ?? "Nurse office — main building"}
        </p>
      </ProgramSection>

      <ProgramDivider />

      <ProgramSection title="Student health summary">
        {flaggedStudents.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-8 h-8 mx-auto mb-2" style={{ color: C.textTertiary }} />
            <p className="text-xs" style={{ color: C.textTertiary }}>
              No active health flags in this room.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {flaggedStudents.map((student) => {
              const flags = HEALTH_FLAGS.filter((f) => student[f.key]);
              const snippet = getStudentHealthSnippet(student);
              return (
                <div
                  key={student.id}
                  onClick={() => onSelectStudent(student)}
                  className="cursor-pointer rounded-sm p-3 transition-colors"
                  style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = C.accentLight;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = C.elevated;
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: student.color + "22", color: student.color }}
                    >
                      {student.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                          {student.name}
                        </p>
                        <span className="text-[10px]" style={{ color: C.textTertiary }}>
                          {student.grade}
                        </span>
                      </div>
                      {flags.length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          {flags.map((f) => (
                            <span
                              key={f.key}
                              className="text-[8px] px-1 py-0.5 rounded font-semibold"
                              style={{ backgroundColor: f.bg, color: f.color }}
                            >
                              {f.label}
                            </span>
                          ))}
                        </div>
                      )}
                      {snippet && (
                        <p
                          className="text-xs mt-2 leading-relaxed line-clamp-2"
                          style={{ color: C.textSecondary }}
                        >
                          {snippet}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ProgramSection>

      {accommodationStudents.length > 0 && (
        <>
          <ProgramDivider />
          <ProgramSection title="Accommodations">
            <div className="space-y-0">
              {accommodationStudents.map((student, i) => (
                <div
                  key={student.id}
                  className="py-2.5"
                  style={{ borderTop: i > 0 ? `1px solid ${C.border}` : undefined }}
                >
                  <p className="text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>
                    {student.name}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>
                    {student.needsAide && student.aideDetails
                      ? student.aideDetails
                      : student.regulationStrategies}
                  </p>
                </div>
              ))}
            </div>
          </ProgramSection>
        </>
      )}
    </div>
  );
}

function ClassroomOverviewTab({ classroom }: { classroom: DemoClassroom }) {
  const enrolled = getClassroomEnrolledCount(classroom);
  const openSpots = Math.max(classroom.capacity - enrolled, 0);
  const statusStyle = CLASSROOM_STATUS_STYLES[classroom.status];
  const healthAlerts = getClassroomHealthAlertCount(classroom);
  const pct = Math.round((enrolled / classroom.capacity) * 100);
  const isFull = enrolled >= classroom.capacity;
  const linkedPrograms = classroom.programIds
    .map((id) => DEMO_PROGRAMS_P2.find((p) => p.id === id))
    .filter(Boolean) as DemoProgram[];

  return (
    <div className="overflow-y-auto pb-6">
      <ProgramStatStrip
        stats={[
          { label: "Enrolled", value: enrolled, sub: `of ${classroom.capacity}` },
          { label: "Open spots", value: openSpots, sub: openSpots === 0 ? "at capacity" : "available" },
          { label: "Waitlist", value: classroom.waitlistCount, sub: classroom.waitlistCount > 0 ? "active" : "none" },
          { label: "Ratio", value: getClassroomRatio(classroom), sub: `max ${classroom.licensingMaxRatio}:1` },
        ]}
      />

      <ProgramDivider />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
        <ProgramSection title="About">
          <p className="text-sm leading-relaxed max-w-prose" style={{ color: C.textSecondary }}>
            {classroom.description}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-xs" style={{ color: C.textTertiary }}>
            {classroom.amenities.map((a) => (
              <span key={a}>{a}</span>
            ))}
          </div>
          <div className="mt-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: C.textTertiary }}>
              Capacity
            </p>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(pct, 100)}%`,
                  backgroundColor: isFull ? C.warning : C.accent,
                }}
              />
            </div>
            <p className="text-[10px] mt-1" style={{ color: C.textTertiary }}>
              {pct}% filled · {enrolled} of {classroom.capacity} seats
            </p>
          </div>
        </ProgramSection>

        <ProgramSection title="Details">
          <ProgramDetailRows
            rows={[
              ["Display name", classroom.name],
              ["Short name", classroom.shortName],
              ["Age range", classroom.ageRange],
              ["Grades", classroom.gradeRange],
              ["Building", classroom.location.building],
              ["Room", classroom.location.roomNumber],
              ["Type", ROOM_TYPE_LABELS[classroom.roomType]],
              ["Status", statusStyle.label],
              [
                "Today's attendance",
                `${classroom.attendanceToday.present} present · ${classroom.attendanceToday.absent} absent`,
              ],
              ["Health alerts", healthAlerts > 0 ? `${healthAlerts} in roster` : "None"],
            ]}
          />
          {linkedPrograms.length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: C.textTertiary }}>
                Programs using this room
              </p>
              <div className="flex flex-wrap gap-2">
                {linkedPrograms.map((prog) => (
                  <span
                    key={prog.id}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: C.accentLight, color: C.accent }}
                  >
                    {prog.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </ProgramSection>
      </div>
    </div>
  );
}

function ClassroomStaffTab({ classroom }: { classroom: DemoClassroom }) {
  const students = getClassroomStudents(classroom);

  return (
    <div className="overflow-y-auto pb-6">
      <p className="text-sm mb-4" style={{ color: C.textTertiary }}>
        <span className="font-medium" style={{ color: C.textPrimary }}>
          {classroom.staffAssignments.length}
        </span>{" "}
        staff assigned ·{" "}
        <span className="font-medium" style={{ color: C.textPrimary }}>
          {students.length}
        </span>{" "}
        students · ratio{" "}
        <span className="font-medium" style={{ color: C.textPrimary }}>
          {getClassroomRatio(classroom)}
        </span>
      </p>
      <div
        className="hidden sm:grid grid-cols-[auto_1fr_auto] gap-x-4 text-[10px] font-semibold uppercase tracking-widest pb-2"
        style={{ color: C.textTertiary, borderBottom: `1px solid ${C.border}` }}
      >
        <span className="w-10" />
        <span>Name</span>
        <span>Role</span>
      </div>
      {classroom.staffAssignments.map((member, i) => {
        const staffRecord = member.staffId
          ? DEMO_STAFF.find((s) => s.id === member.staffId)
          : undefined;
        return (
          <div
            key={`${member.name}-${i}`}
            className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-x-4 gap-y-2 items-center py-4"
            style={{ borderBottom: `1px solid ${C.border}` }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: member.color + "22", color: member.color }}
            >
              {member.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                {member.name}
              </p>
              {staffRecord && (
                <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
                  {staffRecord.email} · {staffRecord.employmentType.replace("_", " ")}
                </p>
              )}
            </div>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full self-start sm:self-center"
              style={{ backgroundColor: C.accentLight, color: C.accent }}
            >
              {member.role}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ClassroomScheduleTab({ classroom }: { classroom: DemoClassroom }) {
  const linkedPrograms = classroom.programIds
    .map((id) => DEMO_PROGRAMS_P2.find((p) => p.id === id))
    .filter(Boolean) as DemoProgram[];

  return (
    <div className="overflow-y-auto pb-6">
      <ProgramStatStrip
        stats={[
          { label: "Days", value: classroom.schedule.daysOfWeek },
          { label: "Drop-off", value: classroom.schedule.dailyHours.dropOff.split(" – ")[0] ?? classroom.schedule.dailyHours.dropOff },
          { label: "Pick-up", value: classroom.schedule.dailyHours.pickUp.split(" – ").pop() ?? classroom.schedule.dailyHours.pickUp },
          { label: "Staff", value: getClassroomStaffCount(classroom), sub: "assigned" },
        ]}
      />

      <ProgramDivider />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
        <ProgramSection title="Daily rhythm">
          <p className="text-base font-medium mb-1" style={{ color: C.textPrimary }}>
            {classroom.schedule.daysOfWeek}
          </p>
          {classroom.schedule.sessionNotes && (
            <p className="text-sm mb-4 max-w-prose" style={{ color: C.textSecondary }}>
              {classroom.schedule.sessionNotes}
            </p>
          )}
          <div>
            {[
              ["Drop-off", classroom.schedule.dailyHours.dropOff],
              ["Core hours", classroom.schedule.dailyHours.core],
              ["Pick-up", classroom.schedule.dailyHours.pickUp],
              ...(classroom.schedule.dailyHours.afterCare
                ? [["After care", classroom.schedule.dailyHours.afterCare] as const]
                : []),
            ].map(([label, time], i) => (
              <div
                key={label}
                className="flex items-center gap-3 py-2.5 text-sm"
                style={{ borderTop: i > 0 ? `1px solid ${C.border}` : undefined }}
              >
                <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.accent }} />
                <span className="font-medium w-24 flex-shrink-0" style={{ color: C.textSecondary }}>
                  {label}
                </span>
                <span style={{ color: C.textPrimary }}>{time}</span>
              </div>
            ))}
          </div>
        </ProgramSection>

        {linkedPrograms.length > 0 && (
          <ProgramSection title="Program schedules">
            <div className="space-y-3">
              {linkedPrograms.map((prog) => (
                <div
                  key={prog.id}
                  className="p-3 rounded-sm"
                  style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}` }}
                >
                  <p className="text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>
                    {prog.name}
                  </p>
                  <p className="text-[10px]" style={{ color: C.textTertiary }}>
                    {prog.schedule.daysOfWeek} · {prog.schedule.dailyHours.core}
                  </p>
                </div>
              ))}
            </div>
          </ProgramSection>
        )}
      </div>
    </div>
  );
}

function ClassroomRosterTab({
  classroom,
  onSelectStudent,
}: {
  classroom: DemoClassroom;
  onSelectStudent: (student: DemoStudent) => void;
}) {
  const students = getClassroomStudents(classroom);
  const enrolled = students.length;

  return (
    <div className="flex flex-col min-h-0 flex-1 overflow-y-auto pb-6">
      <p className="text-sm mb-4 flex-shrink-0" style={{ color: C.textTertiary }}>
        <span className="font-medium" style={{ color: C.textPrimary }}>
          {enrolled}
        </span>{" "}
        enrolled ·{" "}
        <span className="font-medium" style={{ color: C.textPrimary }}>
          {classroom.waitlistCount}
        </span>{" "}
        waitlisted ·{" "}
        <span className="font-medium" style={{ color: C.textPrimary }}>
          {classroom.capacity}
        </span>{" "}
        capacity
      </p>

      {students.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: C.textTertiary }}>
          No students assigned to this room yet.
        </p>
      ) : (
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
        >
          {students.map((student, i) => {
            const flags = HEALTH_FLAGS.filter((f) => student[f.key]);
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelectStudent(student)}
                className="cursor-pointer rounded-sm p-3 flex flex-col items-center text-center transition-colors"
                style={{ backgroundColor: C.surface }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = C.accentLight;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = C.surface;
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2"
                  style={{ backgroundColor: student.color + "22", color: student.color }}
                >
                  {student.initials}
                </div>
                <p className="text-xs font-semibold leading-tight" style={{ color: C.textPrimary }}>
                  {student.name}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: C.textTertiary }}>
                  {student.grade}
                </p>
                {flags.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 flex-wrap justify-center">
                    {flags.map((f) => (
                      <span
                        key={f.key}
                        className="text-[8px] px-1 py-0.5 rounded font-semibold"
                        style={{ backgroundColor: f.bg, color: f.color }}
                      >
                        {f.label.split(" ")[0]}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ClassroomListRail({
  activeClassroomId,
  onSelect,
}: {
  activeClassroomId: string;
  onSelect: (room: DemoClassroom) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = DEMO_CLASSROOMS.filter((room) => {
    if (search === "") return true;
    const q = search.toLowerCase();
    return (
      room.name.toLowerCase().includes(q) ||
      room.shortName.toLowerCase().includes(q) ||
      room.gradeRange.toLowerCase().includes(q) ||
      room.location.roomNumber.toLowerCase().includes(q) ||
      room.location.building.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="w-64 flex-shrink-0 flex flex-col overflow-hidden"
      style={{ borderRight: `1px solid ${C.border}`, backgroundColor: C.bg }}
    >
      <div
        className="px-3 py-2 flex-shrink-0"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm"
          style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}` }}
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.textTertiary }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rooms..."
            className="bg-transparent border-none outline-none text-sm w-full"
            style={{ color: C.textPrimary }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((room, i) => {
          const isActive = activeClassroomId === room.id;
          const enrolled = getClassroomEnrolledCount(room);
          const statusStyle = CLASSROOM_STATUS_STYLES[room.status];
          const { badge, initials } = getClassroomSidebarMeta(room);

          return (
            <motion.button
              key={room.id}
              type="button"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => onSelect(room)}
              className="w-full text-left px-3 py-2.5"
              style={{
                borderBottom: `1px solid ${C.border}`,
                borderLeft: `2px solid ${isActive ? C.accent : "transparent"}`,
                backgroundColor: isActive ? C.accentLight : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = C.elevated;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isActive ? C.accentLight : "transparent";
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: badge.bg, color: badge.text }}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: C.textPrimary }}>
                    {room.shortName}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: C.textTertiary }}>
                    {room.gradeRange} · {enrolled}/{room.capacity} enrolled
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-1.5 pl-9 flex-wrap">
                <span
                  className="text-[8px] px-1 py-0.5 rounded font-semibold"
                  style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                >
                  {statusStyle.label}
                </span>
                {room.waitlistCount > 0 && (
                  <span
                    className="text-[8px] px-1 py-0.5 rounded font-semibold"
                    style={{ backgroundColor: C.warningBg, color: C.warning }}
                  >
                    {room.waitlistCount} waitlist
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-xs text-center" style={{ color: C.textTertiary }}>
            No rooms match your search
          </p>
        )}
      </div>

      <div
        className="px-3 py-2 flex-shrink-0"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        <DemoButton variant="ghost" className="w-full justify-center text-xs">
          <Plus className="w-3.5 h-3.5" />
          Add Room
        </DemoButton>
      </div>
    </div>
  );
}

function ClassroomsPage() {
  const [activeClassroom, setActiveClassroom] = useState<DemoClassroom>(DEMO_CLASSROOMS[0]);
  const [activeTab, setActiveTab] = useState<ClassroomTabId>("overview");
  const [selectedStudent, setSelectedStudent] = useState<DemoStudent | null>(null);

  const enrolled = getClassroomEnrolledCount(activeClassroom);
  const statusStyle = CLASSROOM_STATUS_STYLES[activeClassroom.status];
  const healthAlertCount = getClassroomHealthAlertCount(activeClassroom);
  const leadTeacher =
    activeClassroom.staffAssignments.find((s) => s.role === "Lead Teacher")?.name ?? "TBD";

  const switchClassroom = (room: DemoClassroom) => {
    setActiveClassroom(room);
    setActiveTab("overview");
    setSelectedStudent(null);
  };

  return (
    <div className="h-full flex relative overflow-hidden" style={{ backgroundColor: C.bg }}>
      <ClassroomListRail
        activeClassroomId={activeClassroom.id}
        onSelect={switchClassroom}
      />

      <div
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
        style={{ backgroundColor: C.surface }}
      >
        <div className="flex-shrink-0 px-6 pt-4 pb-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1
                  className="text-xl font-semibold tracking-tight"
                  style={{ color: C.textPrimary }}
                >
                  {activeClassroom.name}
                </h1>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
                  style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                >
                  {statusStyle.label}
                </span>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: C.accentLight, color: C.accent }}
                >
                  {ROOM_TYPE_LABELS[activeClassroom.roomType]}
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: C.textTertiary }}>
                {activeClassroom.gradeRange} · {activeClassroom.location.roomNumber} ·{" "}
                {enrolled}/{activeClassroom.capacity} enrolled · {leadTeacher}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <DemoButton variant="secondary" className="text-xs">
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </DemoButton>
            </div>
          </div>

          <div
            className="flex items-center gap-1 overflow-x-auto pb-0 -mb-px"
            style={{ borderBottom: `1px solid ${C.border}` }}
          >
            {CLASSROOM_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const tabLabel =
                tab.id === "health_safety" && healthAlertCount > 0
                  ? `${tab.label} (${healthAlertCount})`
                  : tab.label;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors"
                  style={{
                    color: isActive ? C.accent : C.textSecondary,
                    borderBottom: isActive
                      ? `2px solid ${C.accent}`
                      : "2px solid transparent",
                    marginBottom: -1,
                  }}
                >
                  <span className="flex-shrink-0" style={{ color: tab.color }} aria-hidden>
                    {tab.icon}
                  </span>
                  {tabLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-5 pb-2">
          {activeTab === "overview" && (
            <ClassroomOverviewTab classroom={activeClassroom} />
          )}
          {activeTab === "health_safety" && (
            <ClassroomHealthSafetyTab
              classroom={activeClassroom}
              onSelectStudent={setSelectedStudent}
            />
          )}
          {activeTab === "staff" && <ClassroomStaffTab classroom={activeClassroom} />}
          {activeTab === "schedule" && (
            <ClassroomScheduleTab classroom={activeClassroom} />
          )}
          {activeTab === "roster" && (
            <ClassroomRosterTab
              classroom={activeClassroom}
              onSelectStudent={setSelectedStudent}
            />
          )}
        </div>
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

function MySchoolPage({
  activeTab,
  onTabChange,
  selectedTuitionFamilyId,
  tuitionFilter,
  onSelectTuitionFamily,
  focusStaffId,
  focusStaffTab,
  onStaffFocusConsumed,
  onNavigateToFinancesPayroll,
}: {
  activeTab: MySchoolTab;
  onTabChange: (tab: MySchoolTab) => void;
  selectedTuitionFamilyId?: string;
  tuitionFilter?: TuitionFilter;
  onSelectTuitionFamily?: (id: string) => void;
  focusStaffId?: string | null;
  focusStaffTab?: StaffProfileTab;
  onStaffFocusConsumed?: () => void;
  onNavigateToFinancesPayroll?: () => void;
}) {
  return (
    <div className="h-full overflow-hidden">
      {activeTab === "students" && (
        <StudentsPage
          onNavigateToTuition={(familyId) => {
            onSelectTuitionFamily?.(familyId);
            onTabChange("tuition");
          }}
        />
      )}
      {activeTab === "programs" && <ProgramsPage />}
      {activeTab === "staff" && (
        <StaffPage
          focusStaffId={focusStaffId}
          focusStaffTab={focusStaffTab}
          onFocusConsumed={onStaffFocusConsumed}
          onNavigateToFinancesPayroll={onNavigateToFinancesPayroll}
        />
      )}
      {activeTab === "classrooms" && <ClassroomsPage />}
      {activeTab === "tuition" && (
        <TuitionPage
          selectedFamilyId={selectedTuitionFamilyId}
          initialFilter={tuitionFilter}
          onSelectFamily={onSelectTuitionFamily}
        />
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

type ActivePage =
  | "dashboard"
  | "leads"
  | "people"
  | "programs"
  | "myschool"
  | "messages"
  | "calendar"
  | "transactions"
  | "emails"
  | "budget"
  | "marketing"
  | "impersonate";

type MySchoolTab = "students" | "programs" | "staff" | "classrooms" | "tuition";

type SubtabItem<T extends string> = {
  key: T;
  label: string;
  icon: React.ReactNode;
};

const ADMISSIONS_SUBTABS: SubtabItem<AdmissionsTab>[] = [
  { key: "flows", label: "Enrollment Flows", icon: <GitBranch className="w-3.5 h-3.5" /> },
  { key: "submissions", label: "Submissions", icon: <ClipboardList className="w-3.5 h-3.5" /> },
];

const BUDGET_SUBTABS: SubtabItem<BudgetTab>[] = [
  { key: "overview", label: "Overview", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
  { key: "expenses", label: "Expenses", icon: <CreditCard className="w-3.5 h-3.5" /> },
  { key: "revenue", label: "Revenue", icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { key: "insights", label: "Insights", icon: <Lightbulb className="w-3.5 h-3.5" /> },
  { key: "transactions", label: "Transactions", icon: <ListFilter className="w-3.5 h-3.5" /> },
  { key: "payroll", label: "Payroll", icon: <Wallet className="w-3.5 h-3.5" /> },
];

const MYSCHOOL_SUBTABS: SubtabItem<MySchoolTab>[] = [
  { key: "students", label: "My Students", icon: <Users className="w-3.5 h-3.5" /> },
  { key: "programs", label: "Programs", icon: <BookOpen className="w-3.5 h-3.5" /> },
  { key: "staff", label: "Staff", icon: <UserCheck className="w-3.5 h-3.5" /> },
  { key: "classrooms", label: "Classrooms", icon: <Home className="w-3.5 h-3.5" /> },
  { key: "tuition", label: "Tuition", icon: <DollarSign className="w-3.5 h-3.5" /> },
];

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
        key: "myschool",
        name: "My School",
        icon: <School className="w-4 h-4" />,
        phase1: true,
      },
    ],
  },
  {
    label: "Tools",
    items: [
      {
        key: "budget",
        name: "Finances",
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

// ─── Support Modal ─────────────────────────────────────────────────────────────
function SupportModal({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState("");

  const quickLinks = [
    { icon: <BookOpen className="w-4 h-4" />, label: "Documentation", sub: "Guides, references & API docs" },
    { icon: <BarChart2 className="w-4 h-4" />, label: "Video Tutorials", sub: "Step-by-step walkthroughs" },
    { icon: <Zap className="w-4 h-4" />, label: "Release Notes", sub: "What's new in SchoolStack" },
  ];

  return (
    <motion.div
      key="support-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.35)", zIndex: 50 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 400,
          maxWidth: "calc(100% - 32px)",
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: C.r.xl,
          boxShadow: C.shadowMedium,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px 16px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: C.r.md,
                backgroundColor: C.accentLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              🍵
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, lineHeight: 1.3 }}>
                Mud Kitchen Development
              </div>
              <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 1 }}>
                Support Team — typically replies in minutes
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 4,
              borderRadius: C.r.sm,
              color: C.textTertiary,
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Quick links */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, marginBottom: 8 }}>
              Quick Links
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {quickLinks.map((link) => (
                <div
                  key={link.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: C.r.md,
                    backgroundColor: C.surface,
                    border: `1px solid ${C.border}`,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ color: C.accent, flexShrink: 0 }}>{link.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.textPrimary }}>{link.label}</div>
                    <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 1 }}>{link.sub}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.textQuaternary }} />
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, marginBottom: 8 }}>
              Contact Us
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: C.r.sm,
                  backgroundColor: C.accent,
                  border: "none",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat with support
              </button>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  borderRadius: C.r.md,
                  border: `1px solid ${C.border}`,
                  backgroundColor: C.surface,
                }}
              >
                <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.textTertiary }} />
                <span style={{ fontSize: 12, color: C.textSecondary }}>support@trymudkitchen.com</span>
              </div>
            </div>
          </div>

          {/* Message box */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, marginBottom: 8 }}>
              Send a Message
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue or question…"
              rows={3}
              style={{
                ...demoInputStyle(),
                width: "100%",
                resize: "none",
                padding: "8px 10px",
                borderRadius: C.r.md,
                fontSize: 12,
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
            <button
              disabled={!message.trim()}
              style={{
                marginTop: 6,
                width: "100%",
                padding: "7px 12px",
                borderRadius: C.r.sm,
                backgroundColor: message.trim() ? C.accent : C.input,
                border: `1px solid ${message.trim() ? C.accent : C.inputBorder}`,
                color: message.trim() ? "#fff" : C.textQuaternary,
                fontSize: 12,
                fontWeight: 600,
                cursor: message.trim() ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "all 0.15s",
              }}
            >
              <Send className="w-3.5 h-3.5" />
              Send message
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Sidebar({
  activePage,
  onNavigate,
  isExpanded,
  onToggleExpand,
  onOpenSupport,
  admissionsTab,
  onAdmissionsSubtab,
  budgetTab,
  onBudgetSubtab,
  mySchoolTab,
  onMySchoolSubtab,
}: {
  activePage: string;
  onNavigate: (page: ActivePage) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenSupport: () => void;
  admissionsTab: AdmissionsTab;
  onAdmissionsSubtab: (tab: AdmissionsTab) => void;
  budgetTab: BudgetTab;
  onBudgetSubtab: (tab: BudgetTab) => void;
  mySchoolTab: MySchoolTab;
  onMySchoolSubtab: (tab: MySchoolTab) => void;
}) {
  const [admissionsOpen, setAdmissionsOpen] = useState(activePage === "leads");
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [mySchoolOpen, setMySchoolOpen] = useState(false);
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
          src={ROOTED_MEADOWS_ADMIN_LOGO.src}
          alt={ROOTED_MEADOWS_ADMIN_LOGO.alt}
          width={isExpanded ? (ROOTED_MEADOWS_ADMIN_LOGO.width ?? 160) : 36}
          height={ROOTED_MEADOWS_ADMIN_LOGO.height ?? 40}
          className="flex-shrink-0 object-contain"
          style={{ maxHeight: 40 }}
        />
      </div>

      {/* Need help? */}
      <div
        style={{
          borderBottom: `1px solid ${C.border}`,
          padding: isExpanded ? "0 10px 10px" : "0 6px 10px",
        }}
      >
        <button
          onClick={onOpenSupport}
          title="Need help?"
          className="w-full flex items-center transition-colors duration-150"
          style={{
            justifyContent: isExpanded ? "flex-start" : "center",
            gap: isExpanded ? "8px" : 0,
            padding: "6px 8px",
            borderRadius: C.r.sm,
            border: `1px solid ${C.clayBorder}`,
            backgroundColor: C.clayBg,
            color: C.textSecondary,
            cursor: "pointer",
          }}
        >
          <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {isExpanded && (
            <span className="text-sm font-medium">Need help?</span>
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
                className="text-xs font-medium px-3 mb-1.5"
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
                return (
                  <div key={item.key}>
                    <button
                      data-tour-id={`nav-${item.key}`}
                      onClick={() => {
                        onNavigate(item.key as ActivePage);
                        if (item.key === "leads") setAdmissionsOpen(true);
                        if (item.key === "budget") setBudgetOpen(true);
                        if (item.key === "myschool") setMySchoolOpen(true);
                      }}
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
                          {!item.phase1 && item.key !== "teacher" && item.key !== "leads" && item.key !== "budget" && (
                            <span
                              className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: C.surface,
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
                                transform: admissionsOpen ? "rotate(180deg)" : "rotate(0deg)",
                              }}
                            >
                              <ChevronDown className="w-3 h-3" />
                            </div>
                          )}
                          {item.key === "budget" && (
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={(e) => { e.stopPropagation(); setBudgetOpen((v) => !v); }}
                              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); setBudgetOpen((v) => !v); } }}
                              className="flex-shrink-0 flex items-center justify-center transition-transform duration-200"
                              style={{
                                color: active ? C.accent : C.textTertiary,
                                padding: "2px",
                                cursor: "pointer",
                                transform: budgetOpen ? "rotate(180deg)" : "rotate(0deg)",
                              }}
                            >
                              <ChevronDown className="w-3 h-3" />
                            </div>
                          )}
                          {item.key === "myschool" && (
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={(e) => { e.stopPropagation(); setMySchoolOpen((v) => !v); }}
                              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); setMySchoolOpen((v) => !v); } }}
                              className="flex-shrink-0 flex items-center justify-center transition-transform duration-200"
                              style={{
                                color: active ? C.accent : C.textTertiary,
                                padding: "2px",
                                cursor: "pointer",
                                transform: mySchoolOpen ? "rotate(180deg)" : "rotate(0deg)",
                              }}
                            >
                              <ChevronDown className="w-3 h-3" />
                            </div>
                          )}
                        </>
                      )}
                    </button>
                    {/* Admissions subtabs */}
                    {item.key === "leads" && isExpanded && (
                      <AnimatePresence initial={false}>
                        {admissionsOpen && (
                        <motion.div
                          key="admissions-subtabs"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <div
                            className="flex mt-1 mb-0.5"
                            style={{ paddingLeft: "12px" }}
                          >
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
                              {ADMISSIONS_SUBTABS.map((sub) => {
                                const subActive = active && admissionsTab === sub.key;
                                return (
                                  <button
                                    key={sub.key}
                                    onClick={() => {
                                      onNavigate("leads");
                                      onAdmissionsSubtab(sub.key);
                                    }}
                                    className="w-full flex items-center gap-2 text-left text-xs font-medium transition-all duration-150"
                                    style={{
                                      padding: "5px 8px",
                                      borderRadius: C.r.sm,
                                      backgroundColor: subActive ? C.accentLight : "transparent",
                                      color: subActive ? C.accent : C.textTertiary,
                                    }}
                                  >
                                    <span
                                      className="flex-shrink-0 flex items-center"
                                      style={{ color: subActive ? C.accent : C.textTertiary }}
                                    >
                                      {sub.icon}
                                    </span>
                                    <span className="truncate">{sub.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                    {/* Budget subtabs */}
                    {item.key === "budget" && isExpanded && (
                      <AnimatePresence initial={false}>
                        {budgetOpen && (
                        <motion.div
                          key="budget-subtabs"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <div
                            className="flex mt-1 mb-0.5"
                            style={{ paddingLeft: "12px" }}
                          >
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
                              {BUDGET_SUBTABS.map((sub) => {
                                const subActive = active && budgetTab === sub.key;
                                return (
                                  <button
                                    key={sub.key}
                                    data-tour-id={`budget-tab-${sub.key}`}
                                    onClick={() => {
                                      onNavigate("budget");
                                      onBudgetSubtab(sub.key);
                                    }}
                                    className="w-full flex items-center gap-2 text-left text-xs font-medium transition-all duration-150"
                                    style={{
                                      padding: "5px 8px",
                                      borderRadius: C.r.sm,
                                      backgroundColor: subActive ? C.accentLight : "transparent",
                                      color: subActive ? C.accent : C.textTertiary,
                                    }}
                                  >
                                    <span
                                      className="flex-shrink-0 flex items-center"
                                      style={{ color: subActive ? C.accent : C.textTertiary }}
                                    >
                                      {sub.icon}
                                    </span>
                                    <span className="truncate">{sub.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                    {/* My School subtabs */}
                    {item.key === "myschool" && isExpanded && (
                      <AnimatePresence initial={false}>
                        {mySchoolOpen && (
                        <motion.div
                          key="myschool-subtabs"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <div
                            className="flex mt-1 mb-0.5"
                            style={{ paddingLeft: "12px" }}
                          >
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
                              {MYSCHOOL_SUBTABS.map((sub) => {
                                const subActive = active && mySchoolTab === sub.key;
                                return (
                                  <button
                                    key={sub.key}
                                    data-tour-id={`myschool-tab-${sub.key}`}
                                    onClick={() => {
                                      onNavigate("myschool");
                                      onMySchoolSubtab(sub.key);
                                    }}
                                    className="w-full flex items-center gap-2 text-left text-xs font-medium transition-all duration-150"
                                    style={{
                                      padding: "5px 8px",
                                      borderRadius: C.r.sm,
                                      backgroundColor: subActive ? C.accentLight : "transparent",
                                      color: subActive ? C.accent : C.textTertiary,
                                    }}
                                  >
                                    <span
                                      className="flex-shrink-0 flex items-center"
                                      style={{ color: subActive ? C.accent : C.textTertiary }}
                                    >
                                      {sub.icon}
                                    </span>
                                    <span className="truncate">{sub.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                        )}
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
            className="w-full text-left px-3 py-2 text-xs font-medium rounded-sm mt-3 transition-colors"
            style={demoSecondaryButtonStyle()}
          >
            Sign out
          </button>
        )}
      </div>
    </motion.aside>
  );
}

// ─── Root component ────────────────────────────────────────────────────────────

export default function RootedMeadowsAdminDashboardDemo({
  disableTour = true,
  initialPage = "dashboard",
  initialAdmissionsTab = "flows",
  initialSelectedLeadId,
  initialSelectedFlowId,
  animateNewSubmission,
  autoSendEnrollmentLink,
  hideNav = false,
  defaultSidebarExpanded = true,
}: {
  disableTour?: boolean
  initialPage?: ActivePage
  initialAdmissionsTab?: AdmissionsTab
  initialSelectedLeadId?: string
  initialSelectedFlowId?: string
  animateNewSubmission?: boolean
  autoSendEnrollmentLink?: boolean
  hideNav?: boolean
  defaultSidebarExpanded?: boolean
}) {
  const [activePage, setActivePage] = useState<ActivePage>(initialPage);
  const [admissionsTab, setAdmissionsTab] = useState<AdmissionsTab>(initialAdmissionsTab);
  const [budgetTab, setBudgetTab] = useState<BudgetTab>("overview");
  const [mySchoolTab, setMySchoolTab] = useState<MySchoolTab>("students");
  const [focusStaffId, setFocusStaffId] = useState<string | null>(null);
  const [focusStaffTab, setFocusStaffTab] = useState<StaffProfileTab>("payroll");
  const [selectedTuitionFamilyId, setSelectedTuitionFamilyId] = useState<
    string | undefined
  >(undefined);
  const [tuitionFilter, setTuitionFilter] = useState<TuitionFilter>("all");
  const [isExpanded, setIsExpanded] = useState(
    defaultSidebarExpanded !== undefined ? defaultSidebarExpanded : !disableTour
  );
  const [isDark] = useState(false);
  C = isDark ? C_DARK : C_LIGHT;

  const [showSupport, setShowSupport] = useState(false);
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

  const navigateToTuition = useCallback((opts?: TuitionNavigateOptions) => {
    setActivePage("myschool");
    setMySchoolTab("tuition");
    if (opts?.familyId) setSelectedTuitionFamilyId(opts.familyId);
    if (opts?.filter) setTuitionFilter(opts.filter);
  }, []);

  const navigateToFinancesPayroll = useCallback(() => {
    setActivePage("budget");
    setBudgetTab("payroll");
  }, []);

  const navigateToStaffPayroll = useCallback((staffId: string) => {
    setFocusStaffTab("payroll");
    setFocusStaffId(staffId);
    setActivePage("myschool");
    setMySchoolTab("staff");
  }, []);

  const clearStaffFocus = useCallback(() => {
    setFocusStaffId(null);
  }, []);

  const PAGE_NAMES: Record<string, string> = {
    budget: "Finances",
    marketing: "Marketing",
    teacher: "Teacher View",
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage />;
      case "leads":
        return (
          <AdmissionsPage
            activeTab={admissionsTab}
            initialLeadId={initialSelectedLeadId}
            initialSelectedFlowId={initialSelectedFlowId}
            animateNewSubmission={animateNewSubmission}
            autoSendEnrollmentLink={autoSendEnrollmentLink}
          />
        );
      case "people":
        return <PeoplePage />;
      case "programs":
        return <ProgramsPage />;
      case "myschool":
        return (
          <MySchoolPage
            activeTab={mySchoolTab}
            onTabChange={setMySchoolTab}
            selectedTuitionFamilyId={selectedTuitionFamilyId}
            tuitionFilter={tuitionFilter}
            onSelectTuitionFamily={setSelectedTuitionFamilyId}
            focusStaffId={focusStaffId}
            focusStaffTab={focusStaffTab}
            onStaffFocusConsumed={clearStaffFocus}
            onNavigateToFinancesPayroll={navigateToFinancesPayroll}
          />
        );
      case "budget":
        return (
          <BudgetPage
            activeTab={budgetTab}
            onTabChange={setBudgetTab}
            onNavigateToTuition={navigateToTuition}
            onNavigateToStaff={navigateToStaffPayroll}
          />
        );
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
        action: () => setActivePage("myschool"),
        targetId: "nav-myschool",
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
            '[data-tour-id="budget-tab-insights"]',
          );
          (el as HTMLElement)?.click();
        },
        targetId: "budget-tab-insights",
        holdMs: 1800,
        clickAnimation: true,
      },

      {
        action: () => {
          const el = containerRef.current?.querySelector(
            '[data-tour-id="budget-tab-transactions"]',
          );
          (el as HTMLElement)?.click();
        },
        targetId: "budget-tab-transactions",
        holdMs: 1600,
        clickAnimation: true,
      },
      {
        action: () => {
          setActivePage("myschool");
          setMySchoolTab("tuition");
        },
        targetId: "nav-myschool",
        holdMs: 1800,
        clickAnimation: true,
      },
      {
        action: () => {
          const el = containerRef.current?.querySelector(
            '[data-tour-id="myschool-tab-tuition"]',
          );
          (el as HTMLElement)?.click();
        },
        targetId: "myschool-tab-tuition",
        holdMs: 2000,
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
      <AnimatePresence>
        {showSupport && (
          <SupportModal key="support-modal" onClose={() => setShowSupport(false)} />
        )}
      </AnimatePresence>
      {!hideNav && (
        <Sidebar
          activePage={activePage}
          onNavigate={(page) => setActivePage(page)}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded((v) => !v)}
          onOpenSupport={() => setShowSupport(true)}
          admissionsTab={admissionsTab}
          onAdmissionsSubtab={(tab) => {
            setActivePage("leads");
            setAdmissionsTab(tab);
          }}
          budgetTab={budgetTab}
          onBudgetSubtab={(tab) => {
            setActivePage("budget");
            setBudgetTab(tab);
          }}
          mySchoolTab={mySchoolTab}
          onMySchoolSubtab={(tab) => {
            setActivePage("myschool");
            setMySchoolTab(tab);
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
                activePage === "marketing" || activePage === "myschool" ||
                activePage === "budget"
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
