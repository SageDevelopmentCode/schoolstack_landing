import type { SchoolWebsiteDemoConfig } from "./types";
import { ROOTS_AND_WINGS_LOGO } from "./roots-and-wings-microschool-admin-demo";

export const rootsAndWingsMicroschoolConfig: SchoolWebsiteDemoConfig = {
  slug: "roots-and-wings-microschool",
  schoolName: "Roots and Wings Microschool",
  theme: {
    primary: "#2E6B63",
    primaryHover: "#1F514A",
    dark: "#1E2A33",
    darkHover: "#141C22",
    lightBg: "#F7F2E8",
    lightBorder: "#D7E0D7",
    muted: "#3D4950",
    badgeBg: "rgba(185, 95, 69, 0.12)",
    accentText: "#D9A441",
    pageBg: "#FFFDF9",
  },
  logo: ROOTS_AND_WINGS_LOGO,
  hero: {
    eyebrow: "K–2 slots currently available",
    eyebrowPlacement: "announcementBar",
    headline: ["A smaller school experience,", "built around your child."],
    subheadline:
      "Roots and Wings Microschool pairs the guidance of a state-certified teacher with a small, caring learning community—so children can build skills, confidence, and a brighter path forward.",
    primaryCta: "Start a Conversation",
    secondaryCta: "See How Learning Works",
    secondaryCtaTarget: "signature",
    navCta: "Schedule a Conversation",
    navLinks: ["Why RAWM", "How Learning Works", "Programs", "FAQ"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/ImageTwo.jpg"],
    imageAlt: "A teacher working one-on-one with a student in a small classroom",
    trustBadges: ["Private school", "Individual-focused", "North Mesa"],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "How learning works",
    heading: "Meet your child where they are. Learn together. Stay connected.",
    subtitle:
      "Individual goals, small-group instruction, and ongoing family feedback—so every learner can experience success.",
    modes: [
      {
        label: "Step 1",
        title: "Meet your child where they are",
        desc: "Individual goals and customized support help each student work toward meaningful progress in reading, writing, math, and more.",
        icon: "compass",
      },
      {
        label: "Step 2",
        title: "Learn together in a small community",
        desc: "Group discussion, reading, writing, history, and hands-on science build academic skills and social connection.",
        icon: "users",
      },
      {
        label: "Step 3",
        title: "Stay connected with families",
        desc: "Parents receive ongoing feedback about how their child is progressing and where support is needed.",
        icon: "heart",
      },
    ],
    flexFriday: {
      title: "Balanced use of technology",
      desc: "Computers support assessment, customized learning, and reporting—while teacher-led instruction and meaningful interaction remain central.",
    },
  },
  stats: [
    { value: "Certified", label: "State-certified teacher" },
    { value: "Small", label: "Class sizes" },
    { value: "Individual", label: "Learning goals" },
    { value: "Ongoing", label: "Parent feedback" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Why families choose RAWM",
    heading: "More attention. More confidence. More room to grow.",
    cards: [
      {
        title: "A teacher who knows your child",
        desc: "Small class sizes make room for individualized support, so each student can work toward meaningful goals.",
      },
      {
        title: "Academics with real connection",
        desc: "Students learn through reading, writing, history, discussion, and hands-on science projects—not a day spent passively on screens.",
      },
      {
        title: "Progress you can see",
        desc: "Parents receive consistent feedback about how their child is progressing and where support is needed.",
      },
      {
        title: "A balanced use of technology",
        desc: "Computers support assessment, customized learning, and reporting. The teacher remains at the center of the experience.",
      },
    ],
    mainImage: "/images/stock/ImageTwo.jpg",
    secondaryImage: "/images/stock/Homeschool3.jpg",
  },
  marquee: [
    "North Mesa",
    "K–2 Availability",
    "Certified Teacher",
    "Small Class Sizes",
    "Individual Goals",
    "Parent Feedback",
    "Hands-on Learning",
    "ESA Accepted",
    "Schedule a Conversation",
    "Private School",
    "Individual-focused",
    "K–8 Learning",
  ],
  programs: {
    eyebrow: "Programs & practical details",
    heading: "Learning paths for K–8 learners",
    subtitle:
      "Two grade-band schedules, transparent tuition, and everything families need to know before starting a conversation.",
    ctaLabel: "Schedule a Conversation",
    items: [
      {
        badge: "K–2",
        title: "K–2 Program",
        teaser: "Monday–Thursday · 11:45 AM–3:45 PM",
        desc: "Young learners receive individualized support in a small, caring community. RAWM provides educational software, high-speed internet, school supplies, and field-trip entry costs.",
        details: [
          "Grades K–2",
          "Mon–Thu 11:45 AM–3:45 PM",
          "K–2 slots currently available",
          "Supplies & software included",
        ],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#2E6B63]",
        accentBg: "bg-[#F7F2E8]",
      },
      {
        badge: "3–8",
        title: "Grades 3–8 Program",
        teaser: "Monday–Thursday · 7:45 AM–11:45 AM",
        desc: "Older students benefit from personalized tutoring alongside group instruction, hands-on science, and consistent parent feedback on progress.",
        details: [
          "Grades 3–8",
          "Mon–Thu 7:45 AM–11:45 AM",
          "Friday field trips (family transport)",
          "PC/Mac/Chromebook with keyboard",
        ],
        image: "/images/stock/ImageFour.jpg",
        accent: "text-[#B95F45]",
        accentBg: "bg-[#F7F2E8]",
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
      "There are two things you can give your child:",
      "one is roots and the other is wings.",
    ],
    attribution: "— Julie's mother-in-law",
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
    eyebrow: "A day at RAWM",
    heading: "Teacher-led learning",
    headingSub: "with room to grow.",
    steps: [
      {
        time: "Morning",
        activity: "Reading & Writing",
        desc: "Students build literacy skills through guided reading, writing practice, and discussion—not passive screen time.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "Midday",
        activity: "Math & Science",
        desc: "Hands-on science projects and differentiated math support help each child work at their own pace.",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        time: "Afternoon",
        activity: "Group Learning",
        desc: "Small-group instruction, history discussion, and social development in a caring community.",
        image: "/images/stock/Homeschool3.jpg",
      },
      {
        time: "Weekly",
        activity: "Purposeful Technology",
        desc: "Educational software supports assessment and customized learning—about 25% of the school day, with the teacher at the center.",
        image: "/images/stock/ImageFour.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Why families trust RAWM",
    heading: "Led by a certified teacher who believes children deserve to be known",
    subtitle:
      "Small classes, individualized support, and a warm community where every learner can experience success.",
    items: [
      {
        title: "State-certified teacher",
        desc: "Led by a Highly Qualified Teacher who understands state standards and intentionally small class sizes.",
        icon: "award",
      },
      {
        title: "Individual learning goals",
        desc: "Personalized tutoring when a child needs it, plus group instruction that builds social skills and confidence.",
        icon: "compass",
      },
      {
        title: "Hands-on academics",
        desc: "Reading, writing, history, discussion, and hands-on science—not a day dominated by screens.",
        icon: "bookOpen",
      },
      {
        title: "ESA funding accepted",
        desc: "Tuition is described as covered by the Arizona Empowerment Scholarship Account (ESA). Details subject to eligibility and availability.",
        icon: "shield",
      },
    ],
  },
  founder: {
    eyebrow: "Who runs this place, anyway?",
    heading: "Hi! My name is Julie.",
    headingAccent: "A teacher—and a parent—who believes children deserve to be known.",
    paragraphs: [
      "As a parent and a state-certified teacher, I have seen how differently children respond to school when they receive the attention they need. Some thrive in large classrooms; others begin to believe they simply cannot succeed.",
      "Roots and Wings Microschool was created to offer another path: personalized tutoring when a child needs it, group instruction and conversation that build social skills, and a caring culture where every learner can experience success.",
      "While raising my six children, I taught vocal and piano lessons to neighborhood kids. Once my youngest flew the coop, I completed my degree, graduating Summa Cum Laude. If teaching hundreds of kids over the years qualifies, then I am a veteran teacher.",
    ],
    credentials: [
      "State-certified Highly Qualified Teacher",
      "Summa Cum Laude graduate",
      "Parent of six",
      "Veteran educator",
    ],
    quote:
      "The micro school was a success. Through hard work and differentiated learning, every child experienced success and gained belief.",
    quoteAttribution: "— Julie",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "North Mesa, AZ" },
    name: "Julie",
    title: "Founder & Lead Teacher, Roots and Wings Microschool",
  },
  parallax: {
    eyebrow: "Personalized learning",
    heading: ["Small classes.", "Thoughtful teaching.", "Meaningful progress."],
    subtitle:
      "When children feel capable, they can see a brighter future. RAWM pairs certified-teacher leadership with individualized support.",
    primaryCta: "Schedule a Conversation",
    secondaryCta: "See How Learning Works",
    backgroundImage: "/images/stock/Homeschool.jpg",
  },
  pillars: {
    eyebrow: "What RAWM provides",
    heading: "Tuition, supplies, and support—clearly explained.",
    subtitle:
      "Details are subject to eligibility, availability, and school policies. Contact RAWM for current enrollment and payment information.",
    items: [
      {
        icon: "shield",
        title: "ESA funding",
        desc: "Tuition is described as covered by the Arizona State Empowerment Scholarship Account (ESA), making the program accessible for eligible families.",
      },
      {
        icon: "bookOpen",
        title: "All supplies included",
        desc: "RAWM provides educational software, high-speed internet, school supplies, and field-trip entry costs.",
      },
      {
        icon: "graduationCap",
        title: "$1,375 per quarter",
        desc: "Tuition is paid quarterly in advance; partial quarters are prorated. Contact RAWM for current enrollment information.",
      },
      {
        icon: "compass",
        title: "Device requirements",
        desc: "Students need a PC, Mac, or Chromebook with an attached keyboard and browser access—not a tablet or iPad.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Share a little about your child and what you hope to see in their learning experience. Julie will be in touch to start the conversation.",
    sidebarImage: "/images/stock/Homeschool2.jpg",
    eyebrow: "Let's talk about your child's education",
    heading: "Request a conversation.",
    description:
      "Tell us about your child and what you would most like to see improve in their school experience. We'll follow up to schedule a conversation.",
    submitLabel: "Request a Conversation",
    disclaimer:
      "By submitting, you agree to be contacted by Roots and Wings Microschool about enrollment.",
    successEmoji: "✓",
    successTitle: "Request received!",
    successMessage:
      "Thank you for your interest in Roots and Wings Microschool. Julie will be in touch to start the conversation.",
    programOptions: [
      { value: "k2", label: "K–2 Program" },
      { value: "grades-38", label: "Grades 3–8 Program" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Child's name",
      gradePlaceholder: "Select current grade...",
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
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions families ask",
    subtitle:
      "The most common things prospective families want to know before scheduling a conversation with Julie.",
    items: [
      {
        q: "What is Roots and Wings Microschool?",
        a: "RAWM is a private, individual-focused microschool in North Mesa led by a state-certified teacher. With intentionally small class sizes, each child receives focused support, personalized tutoring, group learning, and consistent parent feedback.",
      },
      {
        q: "Is learning primarily computer-based?",
        a: "No. Students learn through talking together, reading, writing, exploring history, practicing spelling, and doing hands-on science. Quality learning programs add another layer—about 25% of the school day—while the teacher remains at the center.",
      },
      {
        q: "What does tuition include?",
        a: "Tuition is $1,375 per quarter, paid in advance. RAWM provides educational software, high-speed internet, all school supplies, and field-trip entry costs. Tuition is described as covered by the Arizona ESA for eligible families.",
      },
      {
        q: "What is the schedule?",
        a: "Grades 3–8 meet Monday–Thursday, 7:45 AM–11:45 AM. Grades K–2 meet Monday–Thursday, 11:45 AM–3:45 PM. Several Friday field trips are planned throughout the year.",
      },
      {
        q: "What kind of device does my child need?",
        a: "Students need a PC, Mac, or Chromebook with an attached keyboard and browser access—not a tablet or iPad. RAWM provides software licenses and internet access during the school day.",
      },
      {
        q: "How do field trips work?",
        a: "Field trips are planned several times throughout the year. RAWM covers all entry fees. Families are responsible for transportation, and carpooling is encouraged.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Ready to explore?",
    heading: "Let's talk about what you want",
    headingAccent: "from your child's education.",
    description:
      "Share a little about your child and what you hope to see in their learning experience. Julie will be in touch to start the conversation.",
    primaryCta: "Schedule a Conversation",
    secondaryCta: "See How Learning Works",
  },
  footer: {
    tagline: "Private school · Individual-focused · North Mesa, Arizona",
    links: ["Why RAWM", "How Learning Works", "Programs", "FAQ", "Contact"],
    copyright: "© 2026 Roots and Wings Microschool",
    poweredBy: "Website concept by MudKitchen",
  },
};
