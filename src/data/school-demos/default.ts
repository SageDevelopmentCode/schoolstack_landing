import type { SchoolWebsiteDemoConfig } from "./types";

export const defaultWebsiteDemoConfig: SchoolWebsiteDemoConfig = {
  slug: "default",
  schoolName: "MudKitchen Microschool",
  theme: {
    primary: "#4a7c59",
    primaryHover: "#3d6b4f",
    dark: "#1a3327",
    darkHover: "#2d4f3e",
    lightBg: "#F4F7F2",
    lightBorder: "#E2EDD9",
    muted: "#5E8F6E",
    badgeBg: "#EDF4EA",
    accentText: "#4a7c59",
    pageBg: "#ffffff",
  },
  logo: {
    src: "/images/Logo.webp",
    alt: "MudKitchen",
    width: 120,
    height: 32,
  },
  hero: {
    eyebrow: "Now Enrolling — Fall 2026",
    headline: ["Where Children", "Grow Wise."],
    headlineAccentLine: 1,
    subheadline:
      "A small, outdoor-focused private microschool for ages 4–11. Up to 12 students. Montessori, Waldorf, and Reggio Emilia — woven together.",
    primaryCta: "Apply for a Spot",
    secondaryCta: "See Our Programs",
    navCta: "Enroll Now",
    navLinks: ["Programs", "Philosophy", "Team", "FAQ"],
    backgroundImage: "/images/stock/ImageOne.webp",
    floatingImages: ["/images/stock/Homeschool2.webp", "/images/stock/ImageThree.webp"],
    imageAlt: "Children learning outdoors",
  },
  stats: [
    { value: "Ages 4–11", label: "All Elementary Ages" },
    { value: "12 Max", label: "Students Per Class" },
    { value: "3 Methods", label: "Montessori · Waldorf · Reggio" },
    { value: "5 Days", label: "Per Week Available" },
  ],
  welcome: {
    type: "mission",
    eyebrow: "Our Mission",
    heading: "Learning that",
    headingAccent: "feels like living.",
    paragraphs: [
      "We believe children thrive when they're trusted, known, and given room to wonder. MudKitchen Microschool is built on the idea that the best education doesn't separate curiosity from content — it weaves them together.",
      "Every child here is more than a grade level. They're a whole person with a unique rhythm — and our role is to meet them exactly where they are.",
    ],
    quote:
      "Wisdom is knowledge transformed by experience — and that transformation is what we're here to nurture.",
    quoteAttribution: "— School Founder",
    mainImage: "/images/stock/ImageThree.webp",
    secondaryImage: "/images/stock/ImageFour.webp",
    statBadge: { value: "98%", label: "Parent Satisfaction" },
    floatBadge: {
      title: "12 students max",
      subtitle: "Always. No exceptions.",
      icon: "leaf",
    },
  },
  marquee: [
    "Montessori",
    "Waldorf",
    "Reggio Emilia",
    "Outdoor Learning",
    "TEKS-Aligned",
    "Small Groups",
    "Nature Play",
    "Hands-On Art",
    "Emotional Regulation",
    "Mixed Ages",
    "Portfolio-Based",
    "Ability-Paced",
  ],
  programs: {
    eyebrow: "What We Offer",
    heading: "A program for every family",
    subtitle: "Click each program to explore what a semester looks like.",
    ctaLabel: "Learn More",
    items: [
      {
        badge: "Summer Program",
        title: "Summer Adventures",
        teaser: "12 weeks of outdoor projects & enrichment",
        desc: "Twelve weeks of themed adventures, hands-on projects, nature play, art, and academic enrichment in a small, nurturing group. Every day feels like a discovery.",
        details: ["Ages 4–11", "Mon–Thu", "12 Weeks", "Max 12 Kids"],
        image: "/images/stock/ImageFive.webp",
        accent: "text-amber-600",
        accentBg: "bg-amber-50",
      },
      {
        badge: "School Year",
        title: "Full School Year",
        teaser: "A complete microschool year, ability-paced",
        desc: "A full microschool year blending Montessori, Waldorf, and Reggio-inspired methods with TEKS-aligned academics. Individualized pacing. Genuine community.",
        details: ["Ages 4–11", "Mon–Fri", "6-Month Term", "Max 12 Kids"],
        image: "/images/stock/ImageTwo.webp",
        accent: "text-[var(--demo-accent-text)]",
        accentBg: "bg-[var(--demo-light-bg)]",
      },
      {
        badge: "Homeschool",
        title: "Homeschool Drop-In",
        teaser: "1–5 flexible days for homeschool families",
        desc: "Flexible enrichment for families who want structure without losing autonomy. Choose 1 to 5 days — adjust as your family's rhythm evolves. All enrichments included.",
        details: ["Ages 4–11", "1–5 Days/Wk", "Flexible", "Max 12 Kids"],
        image: "/images/stock/Homeschool3.webp",
        accent: "text-emerald-700",
        accentBg: "bg-emerald-50",
      },
    ],
  },
  mosaicImages: [
    "/images/stock/ImageSix.webp",
    "/images/stock/ImageSeven.webp",
    "/images/stock/ImageEight.webp",
  ],
  quote: {
    text: [
      "The child is not a vessel to be filled,",
      "but a fire to be kindled.",
    ],
    attribution: "François Rabelais · Our guiding belief",
    backgroundImage: "/images/stock/ImageNine.webp",
  },
  stripImages: [
    "/images/stock/ImageEleven.webp",
    "/images/stock/ImageTwelve.webp",
    "/images/stock/ImageThirteen.webp",
    "/images/stock/ImageFourteen.webp",
    "/images/stock/ImageNine.webp",
    "/images/stock/ImageTen.webp",
  ],
  timeline: {
    eyebrow: "A Day at MudKitchen",
    heading: "Calm. Structured.",
    headingSub: "Alive with curiosity.",
    steps: [
      {
        time: "8:30 AM",
        activity: "Morning Circle",
        desc: "Grounding songs, weather, setting intentions — the nervous system settles before learning begins.",
        image: "/images/stock/ImageEleven.webp",
      },
      {
        time: "9:00 AM",
        activity: "Core Academics",
        desc: "Reading, writing, and math — at each child's exact ability level, not where their birthday says they should be.",
        image: "/images/stock/ImageTwo.webp",
      },
      {
        time: "10:30 AM",
        activity: "Outdoor Exploration",
        desc: "Nature walks, gardening, science observation. The outdoors is a classroom, not a break from one.",
        image: "/images/stock/ImageFour.webp",
      },
      {
        time: "12:00 PM",
        activity: "Lunch & Rest",
        desc: "Family-style eating, quiet reading, restorative downtime. Rest is part of the curriculum.",
        image: "/images/stock/Homeschool3.webp",
      },
      {
        time: "1:00 PM",
        activity: "Creative Projects",
        desc: "Art, music, collaborative builds, maker-space. The afternoon belongs to curiosity and expression.",
        image: "/images/stock/ImageFive.webp",
      },
    ],
  },
  socialProof: {
    type: "testimonials",
    eyebrow: "Parent Stories",
    heading: "Families who found their fit",
    subtitle:
      "From anxious starters to thriving explorers — one semester changed everything.",
    items: [
      {
        quote:
          "My daughter was anxious about school until she found a place this small and warm. She asks to go on weekends now.",
        name: "Rachel M.",
        detail: "Parent of a 7-year-old",
        stars: 5,
        avatar: "/images/stock/ImageSix.webp",
      },
      {
        quote:
          "The teachers actually know my son — not just his name, but his learning style, what frustrates him, what sparks him.",
        name: "David K.",
        detail: "Parent of a 9-year-old",
        stars: 5,
        avatar: "/images/stock/ImageSeven.webp",
      },
      {
        quote:
          "We tried three schools before this one. Nothing compared to the calm, intentional pace of a true microschool.",
        name: "Priya S.",
        detail: "Parent of twin 6-year-olds",
        stars: 5,
        avatar: "/images/stock/ImageEight.webp",
      },
    ],
  },
  founder: {
    eyebrow: "Meet the Team",
    heading: "Teachers who actually",
    headingAccent: "know your child.",
    paragraphs: [
      "Sarah holds an AMI Montessori certification and has spent 11 years in mixed-age classrooms. She founded MudKitchen after watching bright children wilt under the pressure of traditional schooling.",
      "Our teacher-to-student ratio never exceeds 1:6. Every adult in the building knows every child — their interests, their frustrations, their spark.",
    ],
    credentials: [
      "AMI Montessori Certified",
      "Waldorf Foundation Training",
      "Trauma-Informed Care",
      "11 Years Experience",
    ],
    quote:
      "I don't teach subjects. I teach children. The subjects are just the vehicle.",
    quoteAttribution: "— Sarah Chen, Director",
    image: "/images/stock/ImageTen.webp",
    imageBadge: { label: "Certified", value: "Montessori AMI" },
    name: "Sarah Chen",
    title: "Lead Teacher & School Director",
  },
  parallax: {
    eyebrow: "Our Vision",
    heading: ["Where Children Grow", "Into Their Wisest Selves"],
    subtitle:
      "Every child arrives as a seed of endless possibility. We are the field — the safe, nourishing ground where they root, reach, and bloom.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Read Our Philosophy",
    backgroundImage: "/images/stock/ImageNine.webp",
  },
  pillars: {
    eyebrow: "Our Curriculum",
    heading: "Four pillars. One whole child.",
    subtitle:
      "We take what works best from each method — and weave it into a coherent, joyful day.",
    items: [
      {
        icon: "sprout",
        title: "Hands-On Learning",
        desc: "Experiential projects that connect academic skills to real-world discovery and wonder.",
      },
      {
        icon: "heart",
        title: "Emotional Safety",
        desc: "A regulated, relationship-first environment where every child feels seen and genuinely known.",
      },
      {
        icon: "palette",
        title: "Creative Expression",
        desc: "Daily art, music, and maker-space time that builds confidence and divergent thinking.",
      },
      {
        icon: "treePine",
        title: "Nature & Movement",
        desc: "Outdoor learning woven into every day — a core curriculum pillar, not a recess afterthought.",
      },
    ],
  },
  form: {
    sidebarQuote: "Every child deserves to be known — not just numbered.",
    sidebarImage: "/images/stock/ImageThree.webp",
    eyebrow: "Enrollment Open",
    heading: "Claim your child's spot.",
    description:
      "We keep classes at 12 students maximum. Fill out the form — we respond within 48 hours to schedule your private tour.",
    submitLabel: "Submit Interest Form",
    disclaimer: "No commitment. We'll reach out within 48 hours.",
    successEmoji: "🌱",
    successTitle: "We'll be in touch!",
    successMessage: "Expect a reply within 48 hours to schedule your tour.",
    programOptions: [
      { value: "summer", label: "Summer Program" },
      { value: "school-year", label: "School Year 2026–2027" },
      { value: "homeschool", label: "Homeschool Drop-In" },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions parents ask",
    subtitle:
      "Considering microschool for the first time? These are the most common things families want to know.",
    items: [
      {
        q: "What is a microschool?",
        a: "A microschool is a small, independent private school — typically under 15 students — that prioritizes personalized pacing, mixed-age groups, and innovative approaches to learning over traditional one-size-fits-all schooling.",
      },
      {
        q: "What ages and group sizes do you serve?",
        a: "We serve children ages 4–11. Classes are intentionally capped at 12 students so every child receives genuine attention, and educators can stay closely attuned to individual needs.",
      },
      {
        q: "What does a typical day look like?",
        a: "Mornings focus on individualized academics — reading, writing, and math at each child's ability level. Afternoons shift into nature exploration, art, music, movement, and social-emotional learning. The rhythm is calm, predictable, and alive with curiosity.",
      },
      {
        q: "Do you follow a standard curriculum?",
        a: "We draw from Montessori, Waldorf, and Reggio Emilia methods with broadly TEKS-aligned academics. Learning is comprehensive and structured — we are a school, not a childcare center.",
      },
      {
        q: "How do I get started?",
        a: "Fill out the interest form below. We'll reach out within 48 hours to schedule a private tour. Spots are limited each semester — early applications receive priority.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Limited Spots Available",
    heading: "Ready to find your",
    headingAccent: "family's fit?",
    description:
      "Classes fill quickly each semester. Submit your interest form and we'll respond within 48 hours to schedule a private tour — no commitment required.",
    primaryCta: "Apply for a Spot",
    secondaryCta: "Schedule a Tour",
  },
  footer: {
    tagline: "A microschool for curious, growing minds.",
    links: ["Programs", "Our Philosophy", "The Team", "FAQ", "Enroll"],
    copyright: "© 2026 MudKitchen Microschool Demo",
    poweredBy: "Powered by MudKitchen",
  },
};
