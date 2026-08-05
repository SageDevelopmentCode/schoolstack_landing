import type { SchoolWebsiteDemoConfig } from "./types";
import { AUSTIN_MICRO_SCHOOL_LOGO } from "./austin-micro-school-admin-demo";

export const austinMicroSchoolConfig: SchoolWebsiteDemoConfig = {
  slug: "austin-micro-school",
  schoolName: "Austin Micro School",
  theme: {
    primary: "#0C8A3A",
    primaryHover: "#0A7532",
    dark: "#143664",
    darkHover: "#0f2a50",
    lightBg: "#F5F7FA",
    lightBorder: "#E2E8F0",
    muted: "#5a6478",
    badgeBg: "rgba(207, 162, 76, 0.12)",
    accentText: "#CFA24C",
    pageBg: "#FFFFFF",
  },
  logo: AUSTIN_MICRO_SCHOOL_LOGO,
  hero: {
    eyebrow: "K-12 MICROSCHOOL · SOUTH AUSTIN",
    eyebrowPlacement: "hero",
    headline: [
      "Building Young Leaders through",
      "Strong Academics and Hands-on Learning",
    ],
    subheadline:
      "Claim a free Young Leaders Day Pass + personalized Learning Profile. Book your family tour to activate. Limited weekly spots available.",
    primaryCta: "Book a Tour to Activate Your Day Pass",
    secondaryCta: "Explore Programs",
    secondaryCtaTarget: "programs",
    navCta: "Book a Tour",
    navLinks: ["Programs", "How It Works", "Testimonials", "FAQ"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/Homeschool3.jpg"],
    imageAlt: "Students learning together at Austin Micro School",
    trustBadges: ["K-12", "South Austin", "Accredited", "30-Day Fit Guarantee"],
    tagline: "Limited weekly spots available.",
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "How it works",
    heading: "Three Simple Steps to Find Out if We're the Right Fit",
    subtitle:
      "A simple onboarding path — from a short family tour to a real school-day experience and a personalized Learning Profile.",
    modes: [
      {
        label: "Step 1",
        title: "Family Tour (20 minutes)",
        desc: "See our campus, meet our mentor team members, and align on your child's goals. Before you leave, we'll schedule your child's Day Pass.",
        icon: "compass",
      },
      {
        label: "Step 2",
        title: "Young Leader Day Pass (1 school day)",
        desc: "Your child joins a real day with a mentor teacher and peer buddy — a hands-on project, team challenge, and a mini leadership milestone.",
        icon: "users",
      },
      {
        label: "Step 3",
        title: "Next-Day Learning Profile + Plan",
        desc: "Within 24 hours, you receive your child's Learning Profile: strengths, growth areas, and a 30-day plan. If it's a fit, pick a start date.",
        icon: "graduationCap",
      },
    ],
    flexFriday: {
      title: "30-Day Fit Guarantee",
      desc: "You're covered by our 30-Day Fit Guarantee — we shoulder the risk so you don't have to.",
    },
  },
  stats: [
    { value: "South Austin", label: "K-12 Microschool" },
    { value: "Full-Time", label: "& Hybrid Options" },
    { value: "Accredited", label: "Middle States" },
    { value: "Day Pass", label: "Try Before You Enroll" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Is this you?",
    heading: "Designed for Curious Minds & Families Seeking a Partnership in Education",
    cards: [
      {
        title: "Love learning by doing",
        desc: "Students who explore, ask \"why?\", and thrive with hands-on projects, real-world challenges, and a smaller, personalized environment.",
      },
      {
        title: "Curious and creative",
        desc: "Learners who are eager to tackle real-world projects and benefit from a flexible approach that nurtures their individual pace and style.",
      },
      {
        title: "Partnership-minded families",
        desc: "Families who believe in balancing robust academics with critical life skills, character development, and a human-centered approach.",
      },
      {
        title: "Flexible enrollment seekers",
        desc: "Families excited about full-time, hybrid, or remote options — and a collaborative community where education is a true partnership.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/ImageSeven.jpg",
  },
  marquee: [
    "Young Leaders",
    "South Austin",
    "K-12 Microschool",
    "Hands-on Learning",
    "Family Tour",
    "Day Pass",
    "Learning Profile",
    "30-Day Fit Guarantee",
    "Full-Time Program",
    "Hybrid Program",
    "Book a Tour",
    "Education That Fits",
  ],
  programs: {
    eyebrow: "Choose your journey",
    heading: "Education That Fits Your Family's Life",
    subtitle:
      "Every family's needs are unique. Full-time, hybrid, adolescent, and remote pathways — all built on academic excellence and leadership development.",
    ctaLabel: "Learn More",
    items: [
      {
        badge: "Flagship",
        title: "Full-Time Program",
        teaser: "Five days per week · $500/week",
        desc: "A rich, five-day-a-week experience: core academics, hands-on projects, our Young Leaders curriculum, and enriching specials in a supportive, close-knit community.",
        details: [
          "5 Days/Week",
          "$18,000/year",
          "Young Leaders Curriculum",
          "10 Payments Aug–May",
        ],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#143664]",
        accentBg: "bg-[#F5F7FA]",
      },
      {
        badge: "Flexible",
        title: "Hybrid Program",
        teaser: "1–3 days per week · as low as $139/week",
        desc: "The best of on-campus collaboration and guided at-home learning. Attend one, two, or three days a week, supported by structured learning plans for off-campus days.",
        details: [
          "1–3 Days/Week",
          "$5,000/year",
          "Guided At-Home Learning",
          "Homeschool Families",
        ],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#0C8A3A]",
        accentBg: "rgba(12, 138, 58, 0.08)",
      },
      {
        badge: "Older Students",
        title: "Adolescent Program",
        teaser: "Purpose-driven learning for older students",
        desc: "Older students join through our Adolescent Program — with mentor relationships, real-world projects, and leadership development tailored to their stage.",
        details: [
          "Adolescent Learners",
          "Mentor Teachers",
          "Leadership Milestones",
          "Real-World Projects",
        ],
        image: "/images/stock/Homeschool3.jpg",
        accent: "text-[#22518C]",
        accentBg: "bg-[#F5F7FA]",
      },
      {
        badge: "Remote",
        title: "Remote Program",
        teaser: "Flexible learning from anywhere",
        desc: "A remote pathway for families who need location flexibility — with structured support, mentor check-ins, and the same Young Leaders foundation.",
        details: [
          "Remote Learning",
          "Mentor Check-Ins",
          "Structured Plans",
          "Flexible Schedule",
        ],
        image: "/images/stock/ImageFour.jpg",
        accent: "text-[#143664]",
        accentBg: "rgba(20, 54, 100, 0.08)",
      },
    ],
  },
  mosaicImages: [
    "/images/stock/Homeschool.jpg",
    "/images/stock/Homeschool2.jpg",
    "/images/stock/Homeschool3.jpg",
  ],
  quote: {
    text: [
      "Try Austin Micro for 30 days.",
      "Make sure it's a good fit for your family.",
      "Or cancel — no hard feelings.",
    ],
    attribution: "We shoulder the risk so you don't have to.",
    backgroundImage: "/images/stock/ImageNine.jpg",
  },
  stripImages: [
    "/images/stock/ImageEleven.jpg",
    "/images/stock/ImageTwelve.jpg",
    "/images/stock/ImageThirteen.jpg",
    "/images/stock/Homeschool.jpg",
    "/images/stock/Homeschool2.jpg",
    "/images/stock/Homeschool3.jpg",
  ],
  timeline: {
    eyebrow: "A Day at Austin Micro",
    heading: "Hands-on learning in a close-knit community",
    headingSub: "South Austin · Garden, maker spaces, and mentor teachers",
    steps: [
      {
        time: "Morning",
        activity: "Core Academics",
        desc: "Strong academics with personalized instruction — literacy, math, science, and social studies through engaging, hands-on lessons.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "Midday",
        activity: "Young Leaders",
        desc: "Leadership development woven into daily learning — team challenges, projects, and milestones that build confident, capable learners.",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        time: "Afternoon",
        activity: "Maker & Garden",
        desc: "Real-world learning in garden and maker spaces — where curiosity meets creation and students learn by doing.",
        image: "/images/stock/Homeschool3.jpg",
      },
      {
        time: "Specials",
        activity: "Enriching Specials",
        desc: "Arts, movement, and enrichment woven into the week — not extras, but part of a well-rounded microschool experience.",
        image: "/images/stock/ImageSeven.jpg",
      },
      {
        time: "Events",
        activity: "Community & Tours",
        desc: "Family tours, Day Pass experiences, and community events that welcome prospective families into the Austin Micro community.",
        image: "/images/stock/ImageNine.jpg",
      },
    ],
  },
  socialProof: {
    type: "testimonials",
    eyebrow: "What Families Are Saying",
    heading: "A community reimagining education.",
    subtitle:
      "Families who found a partnership in learning — where their child is known, nurtured, and empowered to lead.",
    items: [
      {
        quote:
          "The Day Pass was the best decision we made. Our daughter came home excited about school for the first time in years. The Learning Profile gave us clarity we'd never had before — and the 30-day guarantee made it easy to say yes.",
        name: "Sarah M.",
        detail: "Austin Micro School Parent",
        stars: 5,
        avatar: "/images/stock/ImageTen.jpg",
      },
      {
        quote:
          "We were looking for something between homeschool and a big school. Austin Micro's hybrid program gave us the flexibility we needed with real mentor relationships and hands-on learning our kids love.",
        name: "David & Priya K.",
        detail: "Hybrid Program Parents",
        stars: 5,
        avatar: "/images/stock/ImageSeven.jpg",
      },
      {
        quote:
          "The tour took twenty minutes and we left with a Day Pass scheduled. Within a day we had a thoughtful Learning Profile and a plan. It felt human-centered from the very first conversation.",
        name: "Jennifer L.",
        detail: "Full-Time Program Parent",
        stars: 5,
        avatar: "/images/stock/ImageSix.jpg",
      },
    ],
  },
  founder: {
    eyebrow: "Our Mission",
    heading: "More Than a School:",
    headingAccent: "We're a Community Reimagining Education",
    paragraphs: [
      "Austin Micro School is an accredited K-12 microschool in South Austin building young leaders through strong academics and hands-on learning. We are human-centered, purposeful, and committed to real-world learning.",
      "From garden and maker spaces to our Young Leaders program, we nurture adaptive, compassionate, and purposeful leaders — students who thrive in a smaller, more personalized environment with strong mentor relationships.",
    ],
    credentials: [
      "K-12 Microschool",
      "South Austin, TX",
      "Middle States Accredited",
      "National Microschooling Center",
    ],
    quote:
      "We are a community reimagining education — where curiosity, partnership, and hands-on learning come together.",
    quoteAttribution: "— Austin Micro School",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "South Austin" },
    name: "Austin Micro School",
    title: "K-12 Microschool",
  },
  parallax: {
    eyebrow: "Young Leaders",
    heading: ["Academic.", "Hands-on.", "Known."],
    subtitle:
      "An accredited K-12 microschool in South Austin — building confident, capable young leaders through strong academics and real-world learning.",
    primaryCta: "Book a Tour",
    secondaryCta: "Explore Programs",
    backgroundImage: "/images/stock/Homeschool2.jpg",
  },
  pillars: {
    eyebrow: "Why Families Choose Austin Micro",
    heading: "Partnership, curiosity, and personalized learning.",
    subtitle:
      "A human-centered approach where every child is known — with flexible enrollment and a path to try before you commit.",
    items: [
      {
        icon: "compass",
        title: "Hands-on Learning",
        desc: "Students learn by doing — exploring, asking why, and tackling real-world projects in garden and maker spaces.",
      },
      {
        icon: "users",
        title: "Small & Personalized",
        desc: "A close-knit community with mentor teachers who know each child — nurturing individual pace and learning style.",
      },
      {
        icon: "graduationCap",
        title: "Young Leaders",
        desc: "Leadership development woven into academics — building adaptive, compassionate, and purposeful leaders.",
      },
      {
        icon: "shield",
        title: "30-Day Fit Guarantee",
        desc: "Try Austin Micro for 30 days. If it's not the right fit, cancel — no hard feelings. We shoulder the risk.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Ready to learn more about Austin Micro? Book a tour and activate your free Day Pass.",
    sidebarImage: "/images/stock/Homeschool3.jpg",
    eyebrow: "Book a Tour",
    heading: "Schedule your family tour.",
    description:
      "Tell us about your child and we'll reach out to schedule a 20-minute tour — and your Young Leader Day Pass before you leave. Limited weekly spots available.",
    submitLabel: "Book a Tour",
    disclaimer:
      "We'll respond within 48 hours. Visit us at 13203 Gunsmith Drive, Manchaca, TX 78652.",
    successEmoji: "✓",
    successTitle: "Tour request received!",
    successMessage:
      "We'll be in touch within 48 hours to schedule your family tour and Day Pass.",
    programOptions: [
      { value: "full-time", label: "Full-Time Program" },
      { value: "hybrid", label: "Hybrid Program" },
      { value: "adolescent", label: "Adolescent Program" },
      { value: "remote", label: "Remote Program" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Student's Name",
      gradePlaceholder: "Select grade level...",
      gradeOptions: [
        { value: "k", label: "Kindergarten" },
        { value: "1", label: "1st Grade" },
        { value: "2", label: "2nd Grade" },
        { value: "3", label: "3rd Grade" },
        { value: "4", label: "4th Grade" },
        { value: "5", label: "5th Grade" },
        { value: "6", label: "6th Grade" },
        { value: "7", label: "7th Grade" },
        { value: "8", label: "8th Grade" },
        { value: "9", label: "9th Grade" },
        { value: "10", label: "10th Grade" },
        { value: "11", label: "11th Grade" },
        { value: "12", label: "12th Grade" },
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions families ask",
    subtitle:
      "New to Austin Micro? Here are the most common things families want to know before booking a tour.",
    items: [
      {
        q: "How does the tour and Day Pass work?",
        a: "Start with a 20-minute family tour to see campus and meet our mentor team. Before you leave, we'll schedule your child's Young Leader Day Pass — a full school day with a mentor teacher and peer buddy. Within 24 hours, you'll receive a personalized Learning Profile and 30-day plan.",
      },
      {
        q: "What is the 30-Day Fit Guarantee?",
        a: "Try Austin Micro for 30 days after enrollment. If it's not the right fit for your family, you can cancel — no hard feelings. We shoulder the risk so you don't have to.",
      },
      {
        q: "What programs do you offer?",
        a: "We offer a Full-Time Program (five days per week), a Hybrid Program (one to three days per week with guided at-home learning), an Adolescent Program for older students, and a Remote Program for families who need location flexibility.",
      },
      {
        q: "Where are you located?",
        a: "Austin Micro School is at 13203 Gunsmith Drive, Manchaca, TX 78652 — serving families in South Austin and the greater Austin area.",
      },
      {
        q: "What makes Austin Micro different?",
        a: "We're a K-12 microschool focused on strong academics, hands-on learning, and leadership development — with a human-centered approach, mentor relationships, and flexible enrollment options that fit your family's life.",
      },
      {
        q: "How do I get started?",
        a: "Book a family tour to activate your free Young Leader Day Pass. Limited weekly spots are available — we'd love to show you how Austin Micro could work for your family.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Ready to learn more?",
    heading: "Book a 20-minute tour",
    headingAccent: "with our admissions team.",
    description:
      "We'll schedule your child's Day Pass before you leave — and you'll receive a personalized Learning Profile within 24 hours.",
    primaryCta: "Book a Tour",
    secondaryCta: "Schedule a Call",
  },
  footer: {
    tagline:
      "An accredited K-12 microschool building young leaders through strong academics and hands-on learning.",
    links: ["Programs", "How It Works", "Testimonials", "FAQ", "Contact"],
    copyright: "© 2026 Austin Micro School",
    poweredBy: "Website concept by MudKitchen",
  },
};
