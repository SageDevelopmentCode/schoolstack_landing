/**
 * Sample data and pure helpers for the marketing "Automations" demo.
 * Shared by the old hand-built admin demo (`sections/AdminDashboardDemo.tsx`)
 * and the Garden rebuild (`demo/shared/marketing-garden/*`). The real admin
 * Marketing feature is "coming soon"; nothing here talks to a server.
 */

export type AutomationStep = {
  type: "email" | "sms" | "wait" | "condition";
  label: string;
  delay?: string;
  subject?: string;
  body?: string;
  sent?: number;
  opened?: number;
  clicked?: number;
};

export type AutomationPipeline = {
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

export type AutomationFilter = "all" | AutomationPipeline["status"];

export type WizardState = {
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

export const WIZARD_TEMPLATES = [
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
      { type: "email" as const, label: "Meet the Team", delay: "Day 7", subject: "Meet your teachers and staff", body: "Get to know the people who will be shaping your child&apos;s experience this year." },
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
      { type: "sms" as const, label: "SMS Reactivation", delay: "Day 5", subject: "SMS: Last chance to connect", body: "Hi [First Name], enrollment for Fall 2026 closes soon. If you&apos;re still interested, we'd love to chat!" },
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
      { type: "email" as const, label: "Spot Opening Alert", delay: "Week 4", subject: "A spot may be opening soon — are you still interested?", body: "We're expecting a spot to become available shortly. Can you confirm you&apos;re still interested in enrolling?" },
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

export const WIZARD_TRIGGERS = [
  { id: "inquiry", icon: "mail", title: "Family submits inquiry form", subtitle: "Triggers when a new lead fills out your inquiry or interest form." },
  { id: "tour_booked", icon: "phone", title: "Family books a tour", subtitle: "Triggers when a family schedules a campus visit." },
  { id: "enrolled", icon: "check", title: "Student is enrolled", subtitle: "Triggers the moment a student's enrollment is confirmed." },
  { id: "payment_overdue", icon: "credit", title: "Payment becomes overdue", subtitle: "Triggers when a tuition payment passes its due date." },
  { id: "cold_lead", icon: "clock", title: "Lead goes cold (7+ days no activity)", subtitle: "Triggers when a lead has not opened any emails or visited in 7+ days." },
  { id: "manual", icon: "zap", title: "Manually — I'll trigger it myself", subtitle: "You control when this sequence starts. Great for campaigns and events." },
];

export const WIZARD_SEGMENTS = [
  { id: "all_leads", label: "All Leads", count: 47, description: "Every lead currently in your CRM" },
  { id: "warm_leads", label: "Warm Leads", count: 23, description: "Inquired within the last 30 days" },
  { id: "tour_visitors", label: "Tour Visitors", count: 12, description: "Visited campus but not yet enrolled" },
  { id: "waitlisted", label: "Waitlisted Families", count: 8, description: "On the waitlist pending availability" },
  { id: "enrolled", label: "Enrolled Families", count: 31, description: "Currently enrolled students & guardians" },
];

export const WIZARD_PROGRAMS = ["Explorers", "Builders", "Pioneers"];
export const WIZARD_AGE_GROUPS = ["Pre-K", "Elementary", "Middle"];

export const WIZARD_STEP_TYPES: { type: AutomationStep["type"]; label: string; color: string }[] = [
  { type: "email", label: "Email", color: "#5E7C68" },
  { type: "sms", label: "SMS", color: "#38BDF8" },
  { type: "wait", label: "Wait", color: "#94a3b8" },
  { type: "condition", label: "Branch", color: "#8B5CF6" },
];

export const WIZARD_INITIAL_STATE: WizardState = {
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

export const DEMO_AUTOMATION_PIPELINES: AutomationPipeline[] = [
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

export function buildNewPipeline(state: WizardState): AutomationPipeline {
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

export function computeAudienceCount(
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
