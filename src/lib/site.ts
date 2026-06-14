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
