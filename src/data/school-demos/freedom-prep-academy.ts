import type { SchoolWebsiteDemoConfig } from "./types";
import { FREEDOM_PREP_ACADEMY_LOGO } from "./freedom-prep-academy-admin-demo";

export const freedomPrepAcademyConfig: SchoolWebsiteDemoConfig = {
  slug: "freedom-prep-academy",
  schoolName: "Freedom Prep Academy",
  theme: {
    primary: "#1467B9",
    primaryHover: "#0D2F5D",
    dark: "#0D2F5D",
    darkHover: "#0A2447",
    lightBg: "#DCEEFF",
    lightBorder: "#B8D4F0",
    muted: "#536274",
    badgeBg: "rgba(244, 185, 66, 0.15)",
    accentText: "#F4B942",
    pageBg: "#F5F8FC",
  },
  logo: FREEDOM_PREP_ACADEMY_LOGO,
  hero: {
    eyebrow: "Now enrolling grades K–12 · Serving Arizona families statewide",
    eyebrowPlacement: "announcementBar",
    headline: ["School that fits", "real life."],
    subheadline:
      "A flexible Arizona K–12 charter-school experience with personalized learning, caring educators, and options to learn online, in a learning center, or in a microschool.",
    primaryCta: "Enroll now",
    secondaryCta: "Explore your options",
    secondaryCtaTarget: "signature",
    navCta: "Enroll now",
    navLinks: ["How it works", "Learning options", "Academics", "FAQ"],
    backgroundImage: "/images/stock/ImageTwo.jpg",
    floatingImages: ["/images/stock/ImageSeven.jpg", "/images/stock/ImageSix.jpg"],
    imageAlt: "Students collaborating with an educator in a bright learning setting",
    trustBadges: [
      "Grades K–12",
      "Online + in-person options",
      "200+ interactive classes",
      "Arizona families statewide",
    ],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "farmExperience",
    eyebrow: "Choose a learning experience",
    heading: "One school. More ways to thrive.",
    subtitle:
      "Freedom Prep gives Arizona families meaningful choices—online, in-person, or a blend—while keeping students connected to educators, goals, and a supportive learning community.",
    paths: [
      {
        title: "Online guided",
        desc: "Four days each week of guided instruction with advisors and mentors—an intentional mix of flexibility, routine, and live support.",
        icon: "compass",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        title: "Online independent",
        desc: "A flexible option for focused, self-directed students with parent support at home—ideal for families who want maximum schedule freedom.",
        icon: "bookOpen",
        image: "/images/stock/ImageFive.jpg",
      },
      {
        title: "Learning centers",
        desc: "In-person connection, support, activities, and collaboration for online students who want a place to learn alongside peers and caring guides.",
        icon: "users",
        image: "/images/stock/ImageSix.jpg",
      },
      {
        title: "Microschools",
        desc: "Small groups led by knowledgeable guides, combining self-paced technology with hands-on projects and social connection throughout Arizona.",
        icon: "graduationCap",
        image: "/images/stock/Homeschool.jpg",
      },
    ],
  },
  stats: [
    { value: "K–12", label: "Grades served" },
    { value: "Arizona", label: "Statewide charter" },
    { value: "200+", label: "Interactive classes" },
    { value: "4", label: "Learning formats" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "How support works",
    heading: "Independent learning does not mean learning alone.",
    cards: [
      {
        title: "Personalized learning paths",
        desc: "Every student benefits from a plan built around their goals, pace, and needs—with clearer roles and more targeted help along the way.",
      },
      {
        title: "Small-group and in-person connection",
        desc: "Learning centers and microschools bring students together for collaboration, projects, and the social connection that online learning alone cannot provide.",
      },
      {
        title: "College, career, and life readiness",
        desc: "From foundational skills to AP, honors, technology, arts, and career-connected courses—students build practical momentum for what comes next.",
      },
      {
        title: "Flexible participation from home or on the go",
        desc: "A flexible model designed to work with family life, travel, and changing needs—structure when it helps, freedom where it matters.",
      },
    ],
    mainImage: "/images/stock/ImageSeven.jpg",
    secondaryImage: "/images/stock/ImageEight.jpg",
  },
  marquee: [
    "Arizona K–12 Charter",
    "Online Guided",
    "Learning Centers",
    "Microschools",
    "Personalized Learning",
    "Caring Guides",
    "200+ Classes",
    "College & Career Ready",
    "Serving Arizona Families",
    "Enroll Now",
    "Flexible Schedules",
    "Technology-Rich Curriculum",
  ],
  programs: {
    eyebrow: "Learning in action",
    heading: "More ways to discover what students can do.",
    subtitle:
      "Click each area to explore how Freedom Prep helps students build skills, confidence, and connection.",
    ctaLabel: "Explore your options",
    items: [
      {
        badge: "Academics",
        title: "Deep academics",
        teaser: "200+ interactive classes across every subject",
        desc: "Students explore arts, languages, science, technology, honors, college prep, and AP options—supported by a technology-rich curriculum and caring educators.",
        details: ["200+ Classes", "AP & Honors", "College Prep", "Interactive Curriculum"],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#1467B9]",
        accentBg: "bg-[#DCEEFF]",
      },
      {
        badge: "Career",
        title: "Career-connected learning",
        teaser: "Practical tracks that connect interests to future opportunities",
        desc: "Learning tracks and practical courses help students connect their interests to real-world skills—building confidence and momentum for college, career, and life.",
        details: ["Career Tracks", "Practical Courses", "Life Readiness", "Future Planning"],
        image: "/images/stock/ImageFour.jpg",
        accent: "text-[#0D2F5D]",
        accentBg: "bg-[#DCEEFF]",
      },
      {
        badge: "Community",
        title: "Hands-on community",
        teaser: "Field trips, service, arts, sports, and creative projects",
        desc: "Through learning centers and microschools, students connect through field trips, service projects, experiments, arts, music, sports, and creative projects.",
        details: ["Field Trips", "Service Projects", "Arts & Music", "Small Groups"],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#F4B942]",
        accentBg: "bg-[#DCEEFF]",
      },
    ],
  },
  mosaicImages: [
    "/images/stock/ImageSix.jpg",
    "/images/stock/ImageSeven.jpg",
    "/images/stock/ImageEight.jpg",
  ],
  quote: {
    text: [
      "Greater freedom and flexibility",
      "for Arizona families.",
    ],
    attribution: "— Freedom Prep Academy",
    backgroundImage: "/images/stock/ImageNine.jpg",
  },
  stripImages: [
    "/images/stock/ImageEleven.jpg",
    "/images/stock/ImageTwelve.jpg",
    "/images/stock/ImageTwo.jpg",
    "/images/stock/ImageSix.jpg",
    "/images/stock/Homeschool.jpg",
    "/images/stock/Homeschool2.jpg",
  ],
  timeline: {
    eyebrow: "A team built around your student",
    heading: "Teachers, instructors, and guides",
    headingSub: "working together for your child.",
    steps: [
      {
        time: "Teachers",
        activity: "Subject instruction",
        desc: "Deliver core academic instruction across subjects—helping students build foundational skills and master grade-level content.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "Instructors",
        activity: "Personalized support",
        desc: "Personalize intervention, feedback, and mastery support—so students get targeted help when they need it most.",
        image: "/images/stock/ImageFive.jpg",
      },
      {
        time: "Guides",
        activity: "Goal setting & motivation",
        desc: "Help students set goals, stay motivated, and access support—a caring adult who knows how your student is doing.",
        image: "/images/stock/ImageSix.jpg",
      },
      {
        time: "Together",
        activity: "A connected team",
        desc: "Clearer roles, more targeted help, and consistent encouragement—so independent learning never means learning alone.",
        image: "/images/stock/Homeschool.jpg",
      },
    ],
  },
  socialProof: {
    type: "testimonials",
    eyebrow: "What families are saying",
    heading: "Parents who found the right fit.",
    subtitle:
      "Freedom Prep helps Arizona families choose a learning path that works—with support that stays personal.",
    items: [
      {
        quote:
          "As a parent, I appreciate that Freedom Prep has outlined a program designed to maximize learning time in ways that appeal to my kids' different learning styles.",
        name: "Miriam H.",
        detail: "Mesa parent",
        stars: 5,
        avatar: "/images/stock/ImageTen.jpg",
      },
      {
        quote:
          "We needed more flexibility than a traditional school could offer, but still wanted real educator support. Freedom Prep gave us both—the online guided option with regular check-ins has been a great fit.",
        name: "David R.",
        detail: "Chandler parent",
        stars: 5,
        avatar: "/images/stock/ImageEleven.jpg",
      },
      {
        quote:
          "The microschool option brought our daughter together with a small group and a caring guide. She gets the social connection she was missing while still learning at her own pace.",
        name: "Jennifer L.",
        detail: "Gilbert parent",
        stars: 5,
        avatar: "/images/stock/ImageTwelve.jpg",
      },
    ],
  },
  founder: {
    eyebrow: "Enrollment & family support",
    heading: "We're here to help you",
    headingAccent: "find the right learning path.",
    paragraphs: [
      "Freedom Prep Academy serves Arizona families statewide with multiple ways to learn—online, in learning centers, and in microschools throughout the state.",
      "Our enrollment specialists and family support team help you explore which pathway fits your student's goals, grade level, and family schedule. Whether you're considering online guided instruction, independent learning, a learning center, or a microschool, we'll walk you through the options.",
      "Every student benefits from a team of teachers, instructors, and guides—so support stays clear, consistent, and personal from enrollment through graduation.",
    ],
    credentials: [
      "Arizona K–12 charter school",
      "Serving families statewide",
      "Multiple learning pathways",
      "Enrollment specialist support",
    ],
    quote:
      "There is no single right way to learn. We'll help you explore the option that fits your family.",
    quoteAttribution: "— Freedom Prep Enrollment Team",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Serving", value: "All of Arizona" },
    name: "Enrollment & Family Support",
    title: "Freedom Prep Academy",
  },
  parallax: {
    eyebrow: "Structure when it helps",
    heading: ["Flexibility where", "it matters."],
    subtitle:
      "A flexible Arizona K–12 education with personalized learning, real support, and options for where and how students learn.",
    primaryCta: "Explore your options",
    secondaryCta: "Enroll now",
    backgroundImage: "/images/stock/ImageTwo.jpg",
  },
  pillars: {
    eyebrow: "Our culture",
    heading: "A culture of focus and courage.",
    subtitle:
      "Freedom Prep's values guide how students learn, grow, and support one another every day.",
    items: [
      {
        icon: "compass",
        title: "I Can FOCUS",
        desc: "Find Success, Own Responsibility, Control My Emotions, Unleash Potential, Simplify.",
      },
      {
        icon: "shield",
        title: "WE Are Brave",
        desc: "Bold, Respectful, Agile, Valid, Exceptional—building character alongside academics.",
      },
      {
        icon: "users",
        title: "Caring guides",
        desc: "Knowledgeable guides who help students set goals, stay motivated, and access support when it matters.",
      },
      {
        icon: "graduationCap",
        title: "Future-ready",
        desc: "Preparation for college, career, and life-readiness through personalized learning paths.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Whether your student thrives online, wants in-person connection, or needs a more flexible routine, we'll help you explore the right next step.",
    sidebarImage: "/images/stock/ImageSeven.jpg",
    eyebrow: "Find your best fit",
    heading: "Find the Freedom Prep path that fits your family.",
    description:
      "Tell us about your student and preferred learning option. An enrollment specialist will follow up to help you take the next step.",
    submitLabel: "Begin enrollment",
    disclaimer:
      "By submitting, you agree to be contacted by Freedom Prep Academy about enrollment. This is an independent redesign concept.",
    successEmoji: "✓",
    successTitle: "Inquiry received!",
    successMessage:
      "Thank you for your interest in Freedom Prep Academy. An enrollment specialist will be in touch to help you explore the right learning path.",
    programOptions: [
      { value: "online-guided", label: "Online guided" },
      { value: "online-independent", label: "Online independent" },
      { value: "learning-centers", label: "Learning centers" },
      { value: "microschools", label: "Microschools" },
      { value: "unsure", label: "Not sure yet — help me decide" },
    ],
    studentFields: {
      namePlaceholder: "Student's name",
      gradePlaceholder: "Select grade band...",
      gradeOptions: [
        { value: "k-5", label: "K–5" },
        { value: "6-8", label: "6–8" },
        { value: "9-12", label: "9–12" },
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions families ask",
    subtitle:
      "The most common things prospective families want to know before starting enrollment at Freedom Prep Academy.",
    items: [
      {
        q: "What is Freedom Prep Academy?",
        a: "Freedom Prep Academy is an Arizona K–12 public charter school serving families statewide. Students can learn online, in learning centers, or in microschools—with personalized learning plans and support from teachers, instructors, and guides.",
      },
      {
        q: "What learning formats are available?",
        a: "Freedom Prep offers four pathways: online guided (four days of guided instruction with advisors), online independent (self-directed with parent support), learning centers (in-person connection and activities), and microschools (small groups led by caring guides throughout Arizona).",
      },
      {
        q: "How does the support team work?",
        a: "Every student benefits from a team: teachers deliver subject instruction, instructors personalize intervention and mastery support, and guides help students set goals, stay motivated, and access help when they need it.",
      },
      {
        q: "Is Freedom Prep only online?",
        a: "No. While online learning is a core option, Freedom Prep also offers learning centers for in-person connection and microschools for small-group experiences throughout Arizona. Families choose the format that fits.",
      },
      {
        q: "Who can enroll?",
        a: "Freedom Prep serves Arizona families with students in grades K–12. Enrollment is open to families statewide. Contact an enrollment specialist to learn about current availability and requirements.",
      },
      {
        q: "How do I start enrollment?",
        a: "Submit the inquiry form above or call (480) 256-2642. An enrollment specialist will help you explore learning pathways and guide you through the official enrollment process.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Ready to explore?",
    heading: "Find the Freedom Prep path",
    headingAccent: "that fits your family.",
    description:
      "Whether your student thrives online, wants in-person connection, or needs a more flexible routine, we'll help you explore the right next step.",
    primaryCta: "Begin enrollment",
    secondaryCta: "Explore your options",
  },
  footer: {
    tagline: "Arizona K–12 charter school · Serving families statewide",
    links: [
      "How it works",
      "Learning options",
      "Academics",
      "FAQ",
      "Enroll",
      "(480) 256-2642",
    ],
    copyright: "© 2026 Freedom Prep Academy",
    poweredBy: "Website concept by MudKitchen",
  },
};
