import type { SchoolWebsiteDemoConfig } from "./types";
import { FAMILY_LYCEUM_LOGO } from "./family-lyceum-admin-demo";

export const familyLyceumConfig: SchoolWebsiteDemoConfig = {
  slug: "family-lyceum",
  schoolName: "Family Lyceum",
  theme: {
    primary: "#20364A",
    primaryHover: "#122534",
    dark: "#122534",
    darkHover: "#0F1E2A",
    lightBg: "#FBF7EF",
    lightBorder: "#D9D2C7",
    muted: "#72695F",
    badgeBg: "rgba(217, 155, 53, 0.12)",
    accentText: "#D99B35",
    pageBg: "#FBF7EF",
  },
  logo: FAMILY_LYCEUM_LOGO,
  hero: {
    eyebrow: "CLEARFIELD, UTAH · HYBRID PRIVATE SCHOOL",
    eyebrowPlacement: "announcementBar",
    headline: ["Small classes. Deep learning.", "A school rhythm that honors family life."],
    subheadline:
      "Family Lyceum brings together engaging in-person classes, guided at-home learning, mentors who know your child, and the time families need to pursue meaningful goals.",
    primaryCta: "Explore Our Programs",
    secondaryCta: "Talk With Our Team",
    secondaryCtaTarget: "form",
    navCta: "Schedule a Conversation",
    navLinks: ["How Hybrid Works", "Programs", "Learning Experience", "Tuition", "FAQ"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/ImageTwo.jpg"],
    imageAlt: "Students and a mentor engaged in discussion during a small-group class",
    trustBadges: [
      "In-person + home days",
      "15–18 students per class",
      "Ages 4 through junior high",
      "Clearfield, Utah",
    ],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "hybridRhythm",
    eyebrow: "How hybrid learning works",
    heading: "More than a schedule. A better rhythm for learning.",
    subtitle:
      "Family Lyceum uses a flipped classroom model: students encounter new material at home and use class time for active work, discussion, projects, and collaboration with mentors and peers.",
    tagline: "A hybrid private school built around family life.",
    campusDays: [
      {
        label: "Track A",
        title: "Monday / Wednesday / Friday",
        desc: "In-person core classes in math, language arts, history, and science — plus arts, science activities, PE, and peer connection.",
      },
      {
        label: "Track B",
        title: "Tuesday / Thursday / Friday",
        desc: "The same engaging in-person experience on an alternate schedule — choose the track that fits your family's rhythm.",
      },
    ],
    homeDays: [
      {
        label: "Alternate days",
        title: "Self-paced & live online learning",
        desc: "Guided at-home work and scheduled live online classes on days students are not on campus — with flexibility for individual goals.",
      },
      {
        label: "Flipped model",
        title: "Class time for active learning",
        desc: "Students access new information outside class, then use in-person days for discussion, problem-solving, projects, and meaningful work.",
      },
    ],
    serviceNote:
      "Friday is an additional in-person option depending on program and track. Schedules vary by program and school year — contact Family Lyceum for current options.",
  },
  stats: [
    { value: "15–18", label: "Students per class" },
    { value: "2 tracks", label: "In-person schedules" },
    { value: "Ages 4–15", label: "FIREFLY through TORCH" },
    { value: "Clearfield", label: "Utah campus" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Family-centered learning",
    heading: "Parents are not on the sidelines.",
    cards: [
      {
        title: "Parents as first mentors",
        desc: "Family Lyceum sees parents as their children's primary mentors — honored partners in learning, not spectators.",
      },
      {
        title: "Shared books and study",
        desc: "Families read a book of the month at home while students discuss, create, and write about it in class — learning that connects at school and home.",
      },
      {
        title: "Meaningful participation",
        desc: "Regular communication, projects, and opportunities to participate in school life keep families connected to what students are learning.",
      },
      {
        title: "Time for individual goals",
        desc: "The hybrid rhythm gives students structure and community while leaving room for family life and personal pursuits.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/Homeschool3.jpg",
  },
  marquee: [
    "Clearfield Utah",
    "Hybrid Private School",
    "FIREFLY to TORCH",
    "Small Classes",
    "Flipped Classroom",
    "Family-Centered",
    "Chronological History",
    "Deep Reading",
    "Schedule a Conversation",
    "Montessori Preschool",
    "Leadership Education",
    "Facility Rentals",
  ],
  programs: {
    eyebrow: "Programs",
    heading: "A bright beginning, a confident next step.",
    subtitle:
      "From FIREFLY preschool through TORCH junior high — each program meets children where they are with caring mentors and intentional learning.",
    ctaLabel: "Schedule a Conversation",
    items: [
      {
        badge: "Age 4",
        title: "FIREFLY",
        teaser: "Montessori preschool · Tue/Thu or Mon/Wed",
        desc: "A Montessori-inspired first school experience rooted in agency, curiosity, and a caring community — with tactile learning, independence, and routine.",
        details: [
          "Montessori preschool",
          "Ages 4",
          "Limited to 8 students",
          "9:00 AM–12:00 PM",
        ],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#E7BD56]",
        accentBg: "bg-[#FBF7EF]",
      },
      {
        badge: "Ages 5–11",
        title: "SPARK through EMBER",
        teaser: "Elementary · hands-on foundations",
        desc: "Movement, stories, projects, and growing skills — from curious young learners through students ready to engage actively and follow emerging interests.",
        details: [
          "Chronological history rotation",
          "Literature & writing",
          "Hands-on science & math",
          "Art, music & outdoor PE",
        ],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#CF7434]",
        accentBg: "bg-[#FBF7EF]",
      },
      {
        badge: "Ages 11–15",
        title: "FLARE & TORCH",
        teaser: "Junior high · greater responsibility",
        desc: "Advanced learning with higher mentor expectations — students attend in person Mon/Wed or Tue/Thu, 9:00 AM–2:30 PM, with Friday as an option.",
        details: [
          "Grades 6–9",
          "Separate junior-high building",
          "9:00 AM–2:30 PM",
          "Online classes on alternate days",
        ],
        image: "/images/stock/ImageFour.jpg",
        accent: "text-[#20364A]",
        accentBg: "bg-[#FBF7EF]",
      },
      {
        badge: "Enrollment",
        title: "Hybrid Tuition Options",
        teaser: "Part-time · $3,700/yr · Full-time · $5,200/yr",
        desc: "Two in-person days per week or three — designed for real family budgets. Registration, application, field trips, and payment plans available.",
        details: [
          "Part-time: $3,700/year",
          "Full-time: $5,200/year",
          "Scholarship vendors accepted",
          "Monthly/quarterly plans",
        ],
        image: "/images/stock/ImageSeven.jpg",
        accent: "text-[#D99B35]",
        accentBg: "bg-[#FBF7EF]",
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
      "Where students read deeply, write meaningfully,",
      "think logically, and grow with confidence.",
    ],
    attribution: "— Family Lyceum",
    backgroundImage: "/images/stock/ImageNine.jpg",
  },
  stripImages: [
    "/images/stock/ImageEleven.jpg",
    "/images/stock/ImageTwelve.jpg",
    "/images/stock/Homeschool.jpg",
    "/images/stock/Homeschool2.jpg",
    "/images/stock/ImageTwo.jpg",
    "/images/stock/Homeschool3.jpg",
  ],
  timeline: {
    eyebrow: "Weekly rhythm",
    heading: "What a Family Lyceum week",
    headingSub: "can look like.",
    steps: [
      {
        time: "In-person days",
        activity: "Core classes & collaboration",
        desc: "Math, language arts, history, and science come alive through discussion, projects, experiments, arts, PE, and peer connection.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "Alternate days",
        activity: "Guided home learning",
        desc: "Self-paced work and live online classes as scheduled — with flexibility for individual goals and family life.",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        time: "Friday option",
        activity: "Additional in-person learning",
        desc: "Depending on the selected track and program, Friday offers extra in-person time for enrichment and community.",
        image: "/images/stock/Homeschool3.jpg",
      },
      {
        time: "At home",
        activity: "Book of the month",
        desc: "Families read together while students discuss, create activities around, and write about the book in class.",
        image: "/images/stock/ImageFour.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Why families choose Family Lyceum",
    heading: "Kindness, depth, and a school that honors family life",
    subtitle:
      "A warm, classical, community-oriented approach — grounded in mentoring, meaningful work, and practical hybrid learning.",
    items: [
      {
        title: "Small classes, close mentoring",
        desc: "Average class sizes of 15–18 students give mentors room to know each child and guide meaningful growth.",
        icon: "users",
      },
      {
        title: "Chronological history",
        desc: "History taught as a connecting story on a five-year rotation — Ancients, Middle Ages, American Founding, Early Modern, and Modern.",
        icon: "bookOpen",
      },
      {
        title: "Literature-centered learning",
        desc: "Deep reading, meaningful writing, confident speaking, and hands-on science — not passive screen time.",
        icon: "graduationCap",
      },
      {
        title: "Scholarship support",
        desc: "Approved vendor for Children's First Education Fund and Utah Fits All Scholarship — contact the school to verify current eligibility.",
        icon: "shield",
      },
    ],
  },
  founder: {
    eyebrow: "Our story",
    heading: "Hi! I'm Renae Zentz.",
    headingAccent: "Founder and director who believes family is the center of education.",
    paragraphs: [
      "Family Lyceum was founded on the conviction that family is the central unit of society and parents are their children's first mentors. After homeschooling six children in Weber County, I created a school where classroom community and family life work together.",
      "The lyceum — a historical forum for education and enlightenment — reflects our vision: a place where youth and adults grow through deep study, meaningful conversation, and engaged learning.",
      "Our hybrid model is intentional, not convenient. Students encounter new information at home and use class time for the active work that makes learning come alive — discussion, projects, experiments, and relationships.",
    ],
    credentials: [
      "Homeschooled six children",
      "Weber County, Utah",
      "Leadership Education philosophy",
      "Founder & Director",
    ],
    quote:
      "We are a class that is kind — and we believe students grow best when mentors know them, families stay connected, and learning has room to breathe.",
    quoteAttribution: "— Renae Zentz",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "Clearfield, UT" },
    name: "Renae Zentz",
    title: "Founder & Director, Family Lyceum",
  },
  parallax: {
    eyebrow: "Learning experience",
    heading: ["The subjects matter.", "So does how students experience them."],
    subtitle:
      "Chronological history, literature, practical math, hands-on science, arts, music, and outdoor play — every day.",
    primaryCta: "Explore Our Programs",
    secondaryCta: "See How Hybrid Works",
    backgroundImage: "/images/stock/Homeschool.jpg",
  },
  pillars: {
    eyebrow: "Tuition & campus",
    heading: "A private-school experience designed for real family budgets.",
    subtitle:
      "Transparent tuition, a welcoming campus, and an additional path for community facility rentals. Details subject to change — contact Family Lyceum for current information.",
    items: [
      {
        icon: "graduationCap",
        title: "Part-time hybrid — $3,700/year",
        desc: "Two in-person class days per week — a thoughtful blend of classroom community and guided at-home learning.",
      },
      {
        icon: "bookOpen",
        title: "Full-time hybrid — $5,200/year",
        desc: "Three in-person class days per week — the majority of education through Family Lyceum's in-person, online, and home assignments.",
      },
      {
        icon: "compass",
        title: "A welcoming Clearfield campus",
        desc: "Elementary (K–5) and junior-high (6–9) buildings side by side — fenced play area, I-15 access, safe drop-off, and ample parking.",
      },
      {
        icon: "users",
        title: "Facility rentals available",
        desc: "Remodeled classrooms and gathering spaces for classes, events, and community use — an additional way Family Lyceum serves Clearfield.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Tell us about your child, your goals, and the kind of school experience you are looking for. We will help you explore the program that fits.",
    sidebarImage: "/images/stock/Homeschool2.jpg",
    eyebrow: "Start the conversation",
    heading: "Schedule a conversation.",
    description:
      "Share a little about your child and what you hope to see in their learning experience. We will follow up to explore whether Family Lyceum is the right next step.",
    submitLabel: "Schedule a Conversation",
    disclaimer:
      "By submitting, you agree to be contacted by Family Lyceum about enrollment and programs.",
    successEmoji: "✓",
    successTitle: "Request received!",
    successMessage:
      "Thank you for your interest in Family Lyceum. We will be in touch to start the conversation.",
    programOptions: [
      { value: "firefly", label: "FIREFLY Preschool (Age 4)" },
      { value: "elementary", label: "Elementary (SPARK–EMBER)" },
      { value: "junior-high", label: "Junior High (FLARE & TORCH)" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Child's name",
      gradePlaceholder: "Select age or grade...",
      gradeOptions: [
        { value: "age-4", label: "Age 4 (FIREFLY)" },
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
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions families ask",
    subtitle:
      "The most common things prospective families want to know before scheduling a conversation with Family Lyceum.",
    items: [
      {
        q: "What is Family Lyceum?",
        a: "Family Lyceum is a hybrid private school in Clearfield, Utah. Students attend engaging in-person classes on campus and complete guided at-home learning on alternate days — with optional live online instruction.",
      },
      {
        q: "How does the hybrid schedule work?",
        a: "Families choose a Mon/Wed/Fri or Tue/Thu/Fri in-person track. On alternate days, students complete self-paced work and live online classes as scheduled. Friday is an additional in-person option depending on program.",
      },
      {
        q: "Can we enroll in only the online portion?",
        a: "No. Enrolled students complete the majority of their education through Family Lyceum's in-person classes, online classes, and home assignments. The online portion is not offered as a stand-alone enrollment option.",
      },
      {
        q: "What are the FIREFLY through TORCH programs?",
        a: "FIREFLY is a Montessori preschool for age 4. SPARK through EMBER serve elementary learners (ages 5–11). FLARE and TORCH are advanced junior-high programs (ages 11–15) with higher mentor expectations.",
      },
      {
        q: "What does tuition include?",
        a: "Part-time hybrid is $3,700/year (2 in-person days) and full-time hybrid is $5,200/year (3 in-person days). Registration, application, field-trip, assessment, and payment-plan details vary — review current tuition information with the school.",
      },
      {
        q: "Where is the campus?",
        a: "Family Lyceum's campus in Clearfield includes an elementary building (K–5, eight classrooms, fenced play area) and an adjacent junior-high building (grades 6–9) with excellent I-15 access, safe drop-off, and ample parking.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Ready to explore?",
    heading: "Find out whether Family Lyceum",
    headingAccent: "is the right next step for your family.",
    description:
      "Tell us about your child, your goals, and the kind of school experience you are looking for. We will help you explore the program that fits.",
    primaryCta: "Schedule a Conversation",
    secondaryCta: "Explore Our Programs",
  },
  footer: {
    tagline: "Hybrid private school · Clearfield, Utah · Ages 4 through junior high",
    links: ["How Hybrid Works", "Programs", "Learning Experience", "Tuition", "FAQ", "Contact"],
    copyright: "© 2026 Family Lyceum, LLC",
    poweredBy: "Website concept by MudKitchen",
  },
};
