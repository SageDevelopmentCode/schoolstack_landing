export const FOUNDER_PORTRAITS = {
  julius: {
    src: "/images/Julius (1).webp",
    name: "Julius Cecilia",
    role: "Co-founder",
    focus: "Software & product",
  },
  sabrina: {
    src: "/images/sabrina (1).webp",
    name: "Sabrina Obnamia",
    role: "Co-founder",
    focus: "School & operations",
  },
} as const;

export const BUILT_CAPABILITIES = [
  "Branded school website",
  "Parent portal & mobile app",
  "Applications & enrollment",
  "Tuition & family billing",
  "Family communication",
  "Marketing, tours & shadow days",
  "Teacher dashboards",
  "School administration & finances",
  "Automations",
] as const;

export const CORE_FEATURES = [
  "Branded school website",
  "Enrollment and registration workflows",
  "Parent portal, forms, and billing",
  "Student records and family information",
  "Tuition, fees, and Stripe payments",
  "Admin tools for daily operations",
  "Teacher workflows and classroom tools",
  "Mobile app for families and staff",
  "Guided setup and support",
] as const;

export const AUDIENCE_CARDS = [
  {
    title: "Parents",
    description:
      "One place for forms, billing, updates, and day-to-day clarity — so families always know what’s next.",
  },
  {
    title: "Teachers",
    description:
      "Classroom tools and school communication without juggling separate apps for every task.",
  },
  {
    title: "Admins & founders",
    description:
      "Enrollment, tuition, records, and operations in one system built for small teams launching and growing a school.",
  },
] as const;
