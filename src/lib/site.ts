export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://trymudkitchen.com";

export const SITE_NAME = "MudKitchen";

export const DEFAULT_DESCRIPTION =
  "MudKitchen was built inside a real microschool to replace the 7 tools founders are stitching together. One system for enrollment, billing, parent communication, and daily operations.";

export const DEFAULT_KEYWORDS = [
  "microschool software",
  "school management system",
  "private school admin software",
  "enrollment software for schools",
  "tuition billing for microschools",
  "parent portal",
  "school operating system",
];

export const HOME_TITLE =
  "MudKitchen — Microschool Software for Enrollment, Billing & School Operations";

export const HOME_DESCRIPTION =
  "All-in-one software for microschool founders and school administrators. Replace spreadsheets and 7+ tools with one system for enrollment, tuition, parent communication, and daily operations.";

export const SOFTWARE_FEATURES = [
  "Branded school website",
  "Enrollment and registration workflows",
  "Parent portal, forms, and billing",
  "Student records and family information",
  "Tuition, fees, and Stripe payments",
  "Admin tools for daily operations",
  "Guided setup and support",
];

export const SAME_AS = [
  process.env.NEXT_PUBLIC_LINKEDIN_URL,
  process.env.NEXT_PUBLIC_TWITTER_URL,
].filter((url): url is string => Boolean(url));

export const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const AUTH_GATE_SLIDE_INTERVAL_MS = 6000;

export const AUTH_GATE_PROMO = {
  slideIntervalMs: AUTH_GATE_SLIDE_INTERVAL_MS,
  slides: [
    {
      image: "/images/stock/Homeschool2.jpg",
      badge: "Built for Microschools",
      headlineLead: "Everything your microschool",
      headlineAccent: "needs, all in one place.",
      subtext:
        "MudKitchen keeps parents, teachers, and administrators aligned with enrollment, communication, billing, and more—so you can focus on what matters most: your students.",
    },
    {
      image: "/images/stock/ImageOne.jpg",
      badge: "Family clarity",
      headlineLead: "Give families one place",
      headlineAccent: "to stay in the loop.",
      subtext:
        "Parents should not have to search through old emails, group chats, and scattered links. MudKitchen gives families a simpler experience for updates, forms, schedules, and the information they actually need.",
    },
    {
      image: "/images/stock/ImageFour.jpg",
      badge: "What is MudKitchen?",
      headlineLead: "One system for running",
      headlineAccent: "a microschool.",
      subtext:
        "MudKitchen brings enrollment, family communication, student information, schedules, and everyday operations into one place—so school teams stay organized without a patchwork of spreadsheets, forms, and apps.",
    },
    {
      image: "/images/stock/Homeschool.jpg",
      badge: "Enrollment",
      headlineLead: "Enrollment workflows",
      headlineAccent: "families can actually finish.",
      subtext:
        "Collect health info, emergency contacts, uploads, and signatures in one guided flow—so applications move forward without chasing families across email and PDFs.",
    },
    {
      image: "/images/stock/ImageFive.jpg",
      badge: "Tuition & billing",
      headlineLead: "Tuition and billing",
      headlineAccent: "where families already are.",
      subtext:
        "Families view invoices, make payments, and track tuition history without juggling separate portals, payment links, and manual reminders.",
    },
    {
      image: "/images/stock/ImageSix.jpg",
      badge: "For teachers",
      headlineLead: "Support teachers with",
      headlineAccent: "a calmer school day.",
      subtext:
        "When teachers can easily see what is happening and what families need, the whole day runs more smoothly—so they spend more energy teaching instead of tracking down details.",
    },
    {
      image: "/images/stock/ImageSeven.jpg",
      badge: "Growing operations",
      headlineLead: "As enrollment grows",
      headlineAccent: "admin grows faster.",
      subtext:
        "MudKitchen helps small teams turn repeating work—forms, reminders, onboarding, records, and follow-ups—into clearer workflows, so growth feels manageable instead of messy.",
    },
  ],
} as const;
