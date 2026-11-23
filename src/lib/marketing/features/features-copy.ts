/** Copy for /features, the feature pages' shared labels and the home page "after the bell" strip. */

export const FEATURES_INDEX_COPY = {
  seoTitle: "Features",
  seoDescription:
    "Every MudKitchen feature for microschools: admissions, tuition, attendance, messages, calendar, photos, newsletters, committees, forms and more, on the web and in the app.",
  eyebrow: "Features",
  headlineLead: "Everything your microschool runs on,",
  headlineAccent: "in one place.",
  body: "Admissions, tuition, attendance, messages, photos and paperwork share one system. Admins, families and staff each get the view they need, on the web and in the app.",
  filterLabel: "Show features for",
  filterAll: "Everyone",
  groups: {
    admin: {
      lead: "For school admins:",
      accent: "run the school.",
      body: "Enroll families, collect tuition, manage staff and keep every record in one workspace.",
    },
    family: {
      lead: "For families:",
      accent: "one place to look.",
      body: "Parents pay, sign, message and see the week from one app instead of five inboxes.",
    },
    staff: {
      lead: "For staff:",
      accent: "less admin, more teaching.",
      body: "Teachers take roll, clock in, message families and find student details in seconds.",
    },
  },
  appEyebrow: "The app",
  appLead: "Every feature,",
  appAccent: "in your pocket.",
  appBody: "Families, staff and admins get the same school in the app, on iPhone and Android.",
  faq: {
    eyebrow: "FAQ",
    heading: "Questions about features",
    sub: "What's included, who sees what, and how it works on phones.",
  },
} as const;

export const FEATURE_PAGE_LABELS = {
  allFeatures: "All features",
  bookDemo: "Book a Demo",
  capabilitiesEyebrow: "What you can do",
  capabilitiesLead: "Built for",
  capabilitiesAccent: "everyone at school.",
  roleTabsLabel: "Show capabilities for",
  webLabel: "Web",
  mobileLabel: "App",
  useCasesEyebrow: "Use cases",
  useCasesLead: "How it plays out",
  useCasesAccent: "at a real school.",
  evidenceEyebrow: "Why it matters",
  evidenceLead: "The numbers",
  evidenceAccent: "behind it.",
  sourceLabel: "Source",
  compareEyebrow: "How it compares",
  compareLead: "MudKitchen vs.",
  compareAccent: "the usual options.",
  compareToolStack: "Patched-together tools",
  compareChecked: "Other products checked {date} from their public websites. Details can change; follow the links to confirm.",
  compareSources: "Comparison sources",
  faqEyebrow: "FAQ",
  relatedEyebrow: "Works with",
  relatedLead: "Connected to",
  relatedAccent: "the rest of your school.",
} as const;

export const AFTER_BELL_COPY = {
  note: "after the bell ↓",
  heading: "And everything around the school day.",
  body: "The calendar, the updates, the photos and the paperwork live in the same place.",
  link: "See every feature",
} as const;
