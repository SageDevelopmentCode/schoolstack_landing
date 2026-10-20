import { SITE_NAME } from "@/lib/site";

export const DEMO_BOOKING_STORY_COPY = {
  contextKicker: SITE_NAME,
  contextTitle: "Your demo call",
  contextIntro:
    "Bring the parts of running school you'd like to make simpler. We'll start there.",
  meetingDuration: "20 minutes",
  meetingVideo: "Video call",
  meetingBuiltAround: "Built around your school",
  coverSectionLabel: "What we can cover",
  coverBullets: [
    "Inquiries, tours, and enrollment",
    "Tuition and family communication",
    "How it fits your school day",
  ],
  schedulerTitle: "Choose a date & time",
  schedulerSubtitle: "All times are shown in your selected timezone.",
  calendarHint:
    "Pick a date, then a time. You'll add your details on the next step.",
  legendAvailable: "Times available",
  footerEmpty: "Choose a date and time to continue.",
  footerSelectedLabel: "Selected appointment",
  footerConfirm: "Confirm",
  periodAll: "All",
  periodMorning: "Morning",
  periodAfternoon: "Afternoon",
  periodEvening: "Evening",
} as const;
