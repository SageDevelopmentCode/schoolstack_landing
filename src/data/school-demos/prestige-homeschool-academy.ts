import type { SchoolWebsiteDemoConfig } from "./types";
import { PRESTIGE_HOMESCHOOL_ACADEMY_ADMIN_LOGO } from "./prestigehomeschoolacademy-admin-demo";

export const prestigeHomeschoolAcademyConfig: SchoolWebsiteDemoConfig = {
  slug: "prestige-homeschool-academy",
  schoolName: "Prestige Homeschool Academy",
  theme: {
    primary: "#D4AF37",
    primaryHover: "#B9901E",
    dark: "#1F1F1F",
    darkHover: "#1087E5",
    lightBg: "#F8F3E7",
    lightBorder: "#E8DFC8",
    muted: "#5C5C5C",
    badgeBg: "#F8F3E7",
    accentText: "#1087E5",
    pageBg: "#FFFFFF",
  },
  logo: PRESTIGE_HOMESCHOOL_ACADEMY_ADMIN_LOGO,
  hero: {
    eyebrow:
      "Step Up For Students Scholarships Accepted · Registration 2026–27 Open · Niceville, FL",
    eyebrowPlacement: "announcementBar",
    headline: [
      "Join a community of lifelong learners",
      "through project-based homeschool education.",
    ],
    subheadline:
      "Prestige Homeschool Academy is a warm, family-like drop-off program for homeschooling families — combining small-group academics, practical life skills, field trips, and community service in Niceville, Florida.",
    primaryCta: "Apply Now",
    secondaryCta: "Schedule a Tour",
    secondaryCtaTarget: "signature",
    navCta: "Apply Now",
    navLinks: ["Programs", "Our Approach", "Admissions", "FAQ"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: [
      "/images/stock/Homeschool2.jpg",
      "/images/stock/ImageSix.jpg",
    ],
    imageAlt: "Students learning together in a small homeschool group setting",
    trustBadges: ["501(c)(3)", "Step Up Accepted", "Women & Veteran Owned"],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "How Learning Works",
    heading: "Project-based. Small groups. Real-world impact.",
    subtitle:
      "Every week blends focused academics with meaningful projects, life skills, and community connection — designed for homeschooling families who want support without losing flexibility.",
    modes: [
      {
        label: "Core Academics",
        title: "Subject-Based Learning",
        desc: "Certified teachers guide writing, reading, English, science, social studies, and math in small groups tailored to each student's pace.",
        icon: "bookOpen",
      },
      {
        label: "Projects",
        title: "Project-Based Learning",
        desc: "Students learn by actively engaging in real-world, personally meaningful projects — with two community-focused service projects each school year.",
        icon: "compass",
      },
      {
        label: "Life Skills",
        title: "Practical Skills",
        desc: "Cooking, finances, and social etiquette woven into the program — preparing students for confident, capable adulthood.",
        icon: "graduationCap",
      },
      {
        label: "Enrichment",
        title: "Field Trips & Partnerships",
        desc: "Curriculum-aligned field trips plus partnerships with SixPointSurvival and Soundside for science, fitness, and hands-on activities.",
        icon: "sparkles",
      },
    ],
    flexFriday: {
      title: "Community Service Projects",
      desc: "All students participate in two community-focused service projects during the school year — building empathy, leadership, and local connection.",
    },
  },
  stats: [
    { value: "Niceville, FL", label: "Emerald Coast" },
    { value: "Mon & Wed", label: "Drop-Off Days" },
    { value: "501(c)(3)", label: "Nonprofit Mission" },
    { value: "Step Up", label: "Scholarships Accepted" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Is Prestige Right for Your Family?",
    heading:
      "For homeschooling families who want community, structure, and practical life skills.",
    cards: [
      {
        title: "Dedicated educators you can trust",
        desc: "Certified teachers committed to honesty, transparency, and helping every family thrive on their unique homeschooling journey.",
      },
      {
        title: "Small-group project-based learning",
        desc: "Project-based small groups where students engage in real-world, personally meaningful work — not one-size-fits-all worksheets.",
      },
      {
        title: "Academics plus life skills",
        desc: "Core subjects alongside cooking, finances, and social etiquette — a well-rounded education for confident, capable learners.",
      },
      {
        title: "Freedom with support",
        desc: "Stay in control of your homeschool path while gaining a nurturing drop-off community, field trips, and local partnerships.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/ImageSeven.jpg",
  },
  marquee: [
    "Project-Based Learning",
    "Small Groups",
    "Step Up Accepted",
    "501(c)(3)",
    "Niceville FL",
    "Life Skills",
    "Field Trips",
    "Community Service",
    "Homeschool Support",
    "Women Owned",
    "Veteran Owned",
    "Lifelong Learners",
  ],
  programs: {
    eyebrow: "Program Options",
    heading: "Choose the schedule that fits your family",
    subtitle:
      "Flexible drop-off options for homeschooling families — from focused academics to full program immersion.",
    ctaLabel: "Learn More",
    items: [
      {
        badge: "2-Day",
        title: "2-Day Subject-Based",
        teaser: "Mon & Wed · Core academics in small groups",
        desc: "Focused drop-off days covering writing, reading, English, science, social studies, and math — led by certified teachers in a nurturing small-group setting.",
        details: ["Mon & Wed", "9am – 2pm", "Core Academics", "Contact for rates"],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#1087E5]",
        accentBg: "bg-[#F8F3E7]",
      },
      {
        badge: "2-Day",
        title: "2-Day Life Skills / PBL",
        teaser: "Project-based learning and practical skills",
        desc: "Hands-on project-based learning with cooking, finances, social etiquette, and real-world projects — building confidence and capability beyond traditional academics.",
        details: ["2 Days/Week", "PBL Focus", "Life Skills", "Contact for rates"],
        image: "/images/stock/ImageSix.jpg",
        accent: "text-[#D4AF37]",
        accentBg: "bg-[#F8F3E7]",
      },
      {
        badge: "4-Day",
        title: "4-Day Combined Program",
        teaser: "Full academics plus life skills and enrichment",
        desc: "The complete Prestige experience — subject-based learning, project-based work, life skills, field trips, and community service projects across four days.",
        details: ["4 Days/Week", "Full Program", "Enrichment", "Contact for rates"],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#1F1F1F]",
        accentBg: "bg-[#F8F3E7]",
      },
    ],
  },
  mosaicImages: [
    "/images/stock/Homeschool2.jpg",
    "/images/stock/ImageSeven.jpg",
    "/images/stock/ImageTen.jpg",
  ],
  quote: {
    text: [
      "Every student and family deserves to thrive",
      "on their unique homeschooling journey.",
    ],
    attribution: "Honesty. Transparency. Community.",
    backgroundImage: "/images/stock/ImageNine.jpg",
  },
  stripImages: [
    "/images/stock/ImageEleven.jpg",
    "/images/stock/ImageTwelve.jpg",
    "/images/stock/ImageThirteen.jpg",
    "/images/stock/ImageFourteen.jpg",
    "/images/stock/Homeschool.jpg",
    "/images/stock/Homeschool2.jpg",
  ],
  timeline: {
    eyebrow: "Sample Drop-Off Day",
    heading: "A nurturing rhythm designed for",
    headingSub: "focus, growth, and belonging.",
    steps: [
      {
        time: "Morning",
        activity: "Welcome & Community",
        desc: "Students arrive to a warm, family-like atmosphere — settling in, connecting with peers, and setting intentions for the day.",
        image: "/images/stock/ImageEleven.jpg",
      },
      {
        time: "Core Block",
        activity: "Academic Learning",
        desc: "Small-group instruction in writing, reading, English, science, social studies, and math — at each student's pace with certified teacher support.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "Midday",
        activity: "Project-Based Work",
        desc: "Students engage in real-world, personally meaningful projects — building skills through hands-on learning and collaboration.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "Afternoon",
        activity: "Life Skills & Enrichment",
        desc: "Cooking, finances, etiquette, and partnership activities with SixPointSurvival and Soundside — science, fitness, and more.",
        image: "/images/stock/ImageSeven.jpg",
      },
      {
        time: "Seasonally",
        activity: "Field Trips & Service",
        desc: "Curriculum-aligned field trips and two community-focused service projects per year — connecting learning to the world beyond the classroom.",
        image: "/images/stock/ImageSix.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Trust & Community",
    heading: "A school families can believe in",
    subtitle:
      "Prestige Homeschool Academy brings together certified educators, nonprofit mission, and scholarship support for real homeschooling families.",
    items: [
      {
        title: "501(c)(3) Nonprofit",
        desc: "Women owned and operated, veteran owned — a mission-driven community invested in every student's growth.",
        icon: "shield",
      },
      {
        title: "Step Up For Students",
        desc: "Florida's Homeschool Step Up For Students scholarships accepted — making quality education more accessible for eligible families.",
        icon: "award",
      },
      {
        title: "Certified Educators",
        desc: "Curriculum developed and taught by certified teachers covering math, science, history, reading, writing, and English.",
        icon: "graduationCap",
      },
    ],
  },
  founder: {
    eyebrow: "Meet the Educators",
    heading: "Dedicated teachers.",
    headingAccent: "Nurturing every learner.",
    paragraphs: [
      "Prestige Homeschool Academy is led by certified educators committed to fostering lifelong learners — promoting freedom in educational choices while maintaining honesty and transparency in all endeavors.",
      "Our teachers create a family-like atmosphere where students feel known, supported, and empowered to grow at their own pace through project-based small-group learning.",
    ],
    credentials: [
      "Certified Teachers",
      "Project-Based Learning",
      "Small-Group Instruction",
      "Niceville, Florida",
    ],
    quote:
      "Our goal is to help every student and family thrive on their unique homeschooling journey.",
    quoteAttribution: "— Prestige Homeschool Academy",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Certified", value: "Educators" },
    name: "Prestige Educators",
    title: "Lead Teachers & Staff",
  },
  parallax: {
    eyebrow: "Why Prestige",
    heading: ["Warm. Supportive.", "Empowered."],
    subtitle:
      "A nurturing drop-off community for homeschooling families — project-based learning, practical life skills, and local partnerships without losing the freedom you value.",
    primaryCta: "Apply Now",
    secondaryCta: "Schedule a Tour",
    backgroundImage: "/images/stock/Homeschool2.jpg",
  },
  pillars: {
    eyebrow: "What Makes Prestige Different",
    heading: "Four pillars. One thriving learner.",
    subtitle:
      "Project-based learning, small groups, life skills, and community connection — woven into every week.",
    items: [
      {
        icon: "bookOpen",
        title: "Project-Based Learning",
        desc: "Students learn by actively engaging in real-world, personally meaningful projects — not passive seat time.",
      },
      {
        icon: "users",
        title: "Small-Group Community",
        desc: "A family-like atmosphere where every student is seen, known, and supported on their homeschooling journey.",
      },
      {
        icon: "compass",
        title: "Practical Life Skills",
        desc: "Cooking, finances, and social etiquette — preparing students for confident, capable adulthood.",
      },
      {
        icon: "sparkles",
        title: "Enrichment & Partnerships",
        desc: "Field trips, SixPointSurvival, Soundside, and two annual community service projects for a well-rounded experience.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Ready to start your homeschool adventure with Prestige?",
    sidebarImage: "/images/stock/Homeschool2.jpg",
    eyebrow: "Registration Open",
    heading: "Apply or schedule a tour.",
    description:
      "Tell us about your family and preferred program. We'll reach out to schedule a tour or walk you through the application process. No commitment required.",
    submitLabel: "Submit Application Inquiry",
    disclaimer:
      "We'll respond within 48 hours. Registration for the 2026–27 school year is now open for new students.",
    successEmoji: "✓",
    successTitle: "Inquiry received!",
    successMessage:
      "We'll be in touch within 48 hours to schedule your tour or next steps.",
    programOptions: [
      { value: "2-day-academics", label: "2-Day Subject-Based" },
      { value: "2-day-life-skills", label: "2-Day Life Skills / PBL" },
      { value: "4-day-combined", label: "4-Day Combined Program" },
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
      "New to Prestige? Here are the most common things homeschooling families want to know before applying or scheduling a tour.",
    items: [
      {
        q: "Is Prestige a homeschool or a private school?",
        a: "Prestige Homeschool Academy is a drop-off program designed to support homeschooling families — not replace your homeschool. You remain the homeschool parent while your student benefits from certified teachers, small groups, and enrichment on campus.",
      },
      {
        q: "Do you accept Step Up For Students scholarships?",
        a: "Yes — Florida's Homeschool Step Up For Students scholarships are accepted. Contact us to learn more about eligibility and enrollment with scholarship funding.",
      },
      {
        q: "What program options are available?",
        a: "Families can choose a 2-day subject-based program, a 2-day life skills and project-based program, or a 4-day combined option covering academics, PBL, life skills, and enrichment.",
      },
      {
        q: "What subjects and skills are covered?",
        a: "Core academics include writing, reading, English, science, social studies, and math. Life skills include cooking, finances, and social etiquette — plus two community service projects per year.",
      },
      {
        q: "What are the drop-off days and hours?",
        a: "Our primary drop-off program meets on Mondays and Wednesdays from 9am to 2pm. The 4-day combined program extends across four days — contact us for the full schedule.",
      },
      {
        q: "What enrichment and partnerships do you offer?",
        a: "Field trips align with current curriculum topics. We partner with SixPointSurvival for survival skills and science activities, and Soundside for fitness and other enrichment.",
      },
      {
        q: "How do I apply or schedule a tour?",
        a: "Submit an application inquiry through our form, call us at (850) 672-2010, or visit us at 203 John Sims Parkway West in Niceville. Registration for 2026–27 is now open for new students.",
      },
      {
        q: "Is Prestige a nonprofit?",
        a: "Yes — Prestige Homeschool Academy is a women owned and operated 501(c)(3) nonprofit, also veteran owned and operated.",
      },
    ],
  },
  closingCta: {
    eyebrow: "2026–27 Registration Open",
    heading: "Ready to start your",
    headingAccent: "homeschool adventure?",
    description:
      "Apply now or schedule a tour to see if Prestige Homeschool Academy is the right fit for your family.",
    primaryCta: "Apply Now",
    secondaryCta: "Schedule a Tour",
  },
  footer: {
    tagline:
      "Project-based homeschool education with small groups and practical life skills.",
    links: ["Programs", "Our Approach", "Admissions", "FAQ", "Contact"],
    copyright: "© 2026 Prestige Homeschool Academy",
    poweredBy: "Website concept by MudKitchen",
  },
};
