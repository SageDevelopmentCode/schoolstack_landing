import type { SchoolWebsiteDemoConfig } from "./types";
import { KINDER_ACADEMY_PREP_SCHOOL_LOGO } from "./kinder-academy-prep-school-admin-demo";

export const kinderAcademyPrepSchoolConfig: SchoolWebsiteDemoConfig = {
  slug: "kinder-academy-prep-school",
  schoolName: "Kinder Academy Prep School",
  theme: {
    primary: "#2B6CB0",
    primaryHover: "#225A94",
    dark: "#173B63",
    darkHover: "#122F4F",
    lightBg: "#EAF5FF",
    lightBorder: "#D4E8F7",
    muted: "#475467",
    badgeBg: "rgba(43, 108, 176, 0.12)",
    accentText: "#4F8A5B",
    pageBg: "#FFF9EF",
  },
  logo: KINDER_ACADEMY_PREP_SCHOOL_LOGO,
  hero: {
    eyebrow: "Georgetown, Texas · Ages 4–8 / K–3",
    eyebrowPlacement: "announcementBar",
    headline: ["Known by name.", "Supported to learn."],
    headlineClassName:
      "text-3xl md:text-[2.75rem] font-bold text-white font-heading leading-[1.1] mb-3",
    subheadline:
      "A private Prenda microschool in Georgetown for ages 4–8 and K–3 — personalized, play-based, and faith-forward.",
    primaryCta: "Explore Enrollment",
    secondaryCta: "Call 737-775-8833",
    secondaryCtaTarget: "form",
    navCta: "Schedule a Conversation",
    navLinks: ["Why KAPS", "Programs", "About Kimberly", "FAQ"],
    backgroundImage: "/images/stock/ImageTwo.jpg",
    floatingImages: ["/images/stock/ImageSeven.jpg", "/images/stock/ImageSix.jpg"],
    imageAlt: "Young learners engaged in hands-on classroom activities",
    trustBadges: [
      "Prenda-Powered",
      "Max 10 Students",
      "Play-Based & Faith-Forward",
    ],
  },
  sections: {
    showMosaic: true,
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "Why KAPS",
    heading: "Where learning is an adventure—and every child has room to grow.",
    subtitle:
      "Three pillars that make Kinder Academy Prep School a different kind of school experience for Georgetown families.",
    modes: [
      {
        label: "Personalized",
        title: "Learning Tailored to Each Child",
        desc: "Instruction is tailored to each child's learning experience — moving at their own pace with meaningful support every step of the way.",
        icon: "compass",
      },
      {
        label: "10:1 Ratio",
        title: "A 10:1 Maximum Ratio",
        desc: "Enrollment is intentionally limited to 10 students per teacher, so children receive the attention and guidance they deserve.",
        icon: "users",
      },
      {
        label: "Whole Child",
        title: "Whole-Child Foundations",
        desc: "Montessori-inspired, play-based, and faith-based learning supports academic, social-emotional, and personal growth.",
        icon: "heart",
      },
    ],
    flexFriday: {
      title: "Looks like school. Feels like home.",
      desc: "A warm, small-group microschool where curiosity is nurtured, progress is celebrated, and every step of a child's journey truly matters.",
    },
  },
  stats: [
    { value: "10", label: "Max Students" },
    { value: "K–3", label: "Grade Levels" },
    { value: "33", label: "Years Experience" },
    { value: "TEFA", label: "Enrollment Support" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "About KAPS",
    heading: "A warm, small-group microschool for curious young learners.",
    cards: [
      {
        title: "Personalized pacing",
        desc: "Multi-age, small-group learning designed around the individual child — powered by Prenda's proven microschool model.",
      },
      {
        title: "Tiny by design",
        desc: "No more than 10 students per teacher, so every child is truly seen, known, and supported.",
      },
      {
        title: "Play-based learning",
        desc: "Hands-on, developmentally appropriate instruction that emphasizes early literacy, foundational math, and critical thinking.",
      },
      {
        title: "TEFA support",
        desc: "Set up for the Texas Education Freedom Act (TEFA) — we help families navigate enrollment options.",
      },
    ],
    mainImage: "/images/stock/ImageSeven.jpg",
    secondaryImage: "/images/stock/ImageSix.jpg",
  },
  marquee: [
    "Personalized Learning",
    "Meaningful Play",
    "Small Classes",
    "Georgetown, Texas",
    "Ages 4–8",
    "K–3",
    "Prenda-Powered",
    "TEFA Support",
    "Explore Enrollment",
  ],
  programs: {
    eyebrow: "Programs",
    heading: "Programs built for your family's needs",
    subtitle:
      "From the 2026–27 microschool to summer camps, tutoring, and extended day — KAPS offers flexible options for young learners.",
    ctaLabel: "Request Program Information",
    items: [
      {
        badge: "01",
        title: "2026–27 Microschool",
        teaser: "Ages 4–8 · K–3 · Mon–Thu 8 AM–1 PM",
        desc: "A small, multi-age Prenda microschool with a maximum of 10 students — personalized learning in a warm, faith-forward community.",
        details: ["Ages 4–8", "K–3", "Mon–Thu", "8 AM–1 PM"],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#2B6CB0]",
        accentBg: "bg-[#EAF5FF]",
      },
      {
        badge: "02",
        title: "Summer Learning Camps",
        teaser: "Ages 4–9 · Mon–Thu 8 AM–1 PM",
        desc: "Four days of themed, hands-on summer learning and fun — from Super Science to Creative Art Studio.",
        details: ["Ages 4–9", "Themed Weeks", "$245/week", "8 AM–1 PM"],
        image: "/images/stock/ImageFive.jpg",
        accent: "text-[#4F8A5B]",
        accentBg: "bg-[#EAF3EA]",
      },
      {
        badge: "03",
        title: "KAPS Tutoring",
        teaser: "K–3rd · Mon & Tue 3:30–5:30 PM",
        desc: "Targeted reading and math support, typically 1:1 — skills, phonics, and reading comprehension for young learners.",
        details: ["K–3rd", "Reading & Math", "1:1 Instruction", "Mon & Tue"],
        image: "/images/stock/ImageSeven.jpg",
        accent: "text-[#2B6CB0]",
        accentBg: "bg-[#EAF5FF]",
      },
      {
        badge: "04",
        title: "Extended Day",
        teaser: "1:00–4:00 PM · Project-based",
        desc: "Time to collaborate, create, apply learning, and explore projects together in a small-group setting.",
        details: ["1–4 PM", "Project-Based", "Collaborative", "Small Group"],
        image: "/images/stock/ImageSix.jpg",
        accent: "text-[#E5A93D]",
        accentBg: "bg-[#FFF9EF]",
      },
    ],
  },
  mosaicImages: [
    "/images/stock/ImageTwo.jpg",
    "/images/stock/ImageSeven.jpg",
    "/images/stock/ImageSix.jpg",
    "/images/stock/ImageEleven.jpg",
  ],
  quote: {
    text: [
      "Let the little children come to me and do not hinder them,",
      "for to such belongs the kingdom of heaven.",
    ],
    attribution: "— Matthew 19:14 (ESV)",
    backgroundImage: "/images/stock/ImageNine.jpg",
  },
  stripImages: [
    "/images/stock/ImageEleven.jpg",
    "/images/stock/ImageTwelve.jpg",
    "/images/stock/ImageThirteen.jpg",
    "/images/stock/ImageTwo.jpg",
    "/images/stock/ImageSeven.jpg",
    "/images/stock/ImageSix.jpg",
  ],
  timeline: {
    eyebrow: "Summer 2026 Camps",
    heading: "Summer learning that feels like summer",
    headingSub: "Georgetown, TX · Mon–Thu · $245/week · $50 registration fee",
    steps: [
      {
        time: "Jun 1–4",
        activity: "Learn To Sew",
        desc: "Hands-on sewing projects that build fine motor skills and creative confidence.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "Jun 8–11",
        activity: "Super Science",
        desc: "Experiments, discovery, and wonder — science that feels like play.",
        image: "/images/stock/ImageFive.jpg",
      },
      {
        time: "Jun 15–18",
        activity: "Royal Kingdom Adventure",
        desc: "Stories, crafts, and imaginative play in a royal-themed week.",
        image: "/images/stock/ImageSeven.jpg",
      },
      {
        time: "Jun 22–25",
        activity: "Down on the Farm",
        desc: "Explore nature, animals, and the rhythms of farm life.",
        image: "/images/stock/ImageSix.jpg",
      },
      {
        time: "Jun 29–Jul 2",
        activity: "Creative Art Studio",
        desc: "Painting, sculpting, and creating — a week dedicated to artistic expression.",
        image: "/images/stock/ImageNine.jpg",
      },
      {
        time: "Jul 6–9",
        activity: "Bugs Explorers",
        desc: "Discover the fascinating world of insects and outdoor exploration.",
        image: "/images/stock/ImageEleven.jpg",
      },
      {
        time: "Jul 13–16",
        activity: "Amazing Human Body",
        desc: "Learn how our bodies work through hands-on activities and discovery.",
        image: "/images/stock/ImageTwelve.jpg",
      },
      {
        time: "Jul 20–23",
        activity: "Zoom! Things That Go",
        desc: "Vehicles, movement, and engineering — a week of things that go!",
        image: "/images/stock/ImageThirteen.jpg",
      },
    ],
  },
  socialProof: {
    type: "testimonials",
    eyebrow: "Testimonials",
    heading: "What families are saying",
    subtitle:
      "Families who found a smaller school where their child is truly known.",
    items: [
      {
        quote:
          "We were looking for something different — a place where our son wouldn't get lost in the crowd. KAPS has been exactly that. Kimberly knows each child by name and tailors learning to where they are.",
        name: "Sarah M.",
        detail: "Parent of 1st grader",
        stars: 5,
        avatar: "/images/stock/ImageTen.jpg",
      },
      {
        quote:
          "The small class size made all the difference for our daughter. She went from dreading school to asking every morning if it's a KAPS day. The play-based approach really works.",
        name: "David & Maria R.",
        detail: "Parents of Kindergartener",
        stars: 5,
        avatar: "/images/stock/ImageTen.jpg",
      },
    ],
  },
  founder: {
    eyebrow: "Meet the Founder",
    heading: "Led by experience.",
    headingAccent: "Built with heart.",
    paragraphs: [
      "Kimberly Lind is the Owner, Operator, and Principal of Kinder Academy Prep School. After 33 years serving children and families in private and public education, she founded KAPS to create the small, caring learning environment she had long envisioned.",
      "After retirement, while enjoying the grandparent lifestyle, she felt a growing conviction that children deserve more than what traditional models of education often provide. They deserve to be seen, to move at their own pace, to experience learning as something meaningful and joyful.",
      "This microschool was born out of that belief — a place where curiosity is nurtured, progress is celebrated, and every step of a child's journey truly matters. It looks like a school, but feels like home.",
    ],
    credentials: [
      "Texas Educator Certificate, Grades 1–8",
      "Early Childhood Certificate, Pre-K–K",
      "Principal Certificate",
      "33 Years in Education",
      "Prenda-Powered Microschool",
      "Faith-Based Learning",
    ],
    quote:
      "My prayer is that your family joins this new adventure — where kids can be kids and learning is fun.",
    quoteAttribution: "— Kimberly Lind, Founder & Principal",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Experience", value: "33 Years" },
    name: "Kimberly Lind",
    title: "Founder & Principal",
  },
  parallax: {
    eyebrow: "Inside the Classroom",
    heading: ["Real moments.", "Real learning."],
    subtitle:
      "A school day built around curiosity, connection, and doing — in a warm, nurturing learning space in Georgetown.",
    primaryCta: "Explore Enrollment",
    secondaryCta: "View Programs",
    backgroundImage: "/images/stock/ImageSeven.jpg",
  },
  pillars: {
    eyebrow: "Why Families Choose KAPS",
    heading: "Small by design. Known by name.",
    subtitle:
      "Personalized learning, meaningful play, and a real community of families — with TEFA enrollment support.",
    items: [
      {
        icon: "compass",
        title: "Personalized Learning",
        desc: "Instruction tailored to each child's pace — powered by Prenda and built around the individual learner.",
      },
      {
        icon: "users",
        title: "Tiny Cohort",
        desc: "Maximum 10 students per teacher means every child is truly seen, known, and supported.",
      },
      {
        icon: "heart",
        title: "Faith-Forward",
        desc: "Christian-based principles woven respectfully into a warm, welcoming learning environment.",
      },
      {
        icon: "sparkles",
        title: "Play-Based Learning",
        desc: "Hands-on, developmentally appropriate instruction that builds confidence and a love of learning.",
      },
    ],
  },
  form: {
    sidebarQuote: "Let's talk about your child's best next step.",
    sidebarImage: "/images/stock/ImageSix.jpg",
    eyebrow: "Get in Touch",
    heading: "Looking for a different kind of school experience?",
    description:
      "Connect with Kinder Academy Prep School to ask questions, learn about program availability, and begin the enrollment conversation. Kimberly will personally follow up.",
    submitLabel: "Get Enrollment Information",
    disclaimer:
      "Kimberly will personally follow up. Email contact@kinderacademyprepschool.com or call 737-775-8833.",
    successEmoji: "✓",
    successTitle: "Message received!",
    successMessage:
      "Kimberly will be in touch soon about enrollment, programs, or answering your questions.",
    programOptions: [
      { value: "microschool", label: "2026–27 Microschool enrollment" },
      { value: "summer-camp", label: "Summer Learning Camps" },
      { value: "tutoring", label: "KAPS Tutoring" },
      { value: "extended-day", label: "Extended Day" },
      { value: "general", label: "General questions" },
    ],
    studentFields: {
      namePlaceholder: "Child's Name",
      gradePlaceholder: "Select grade level...",
      gradeOptions: [
        { value: "prek", label: "Pre-K" },
        { value: "k", label: "Kindergarten" },
        { value: "1", label: "1st Grade" },
        { value: "2", label: "2nd Grade" },
        { value: "3", label: "3rd Grade" },
      ],
    },
  },
  faq: {
    eyebrow: "Questions, Answered",
    heading: "Things families ask first",
    subtitle:
      "Still have questions? Reach out anytime — Kimberly will personally walk you through anything, including TEFA enrollment.",
    items: [
      {
        q: "Who does KAPS serve?",
        a: "KAPS serves families with children ages 4–8 and Kindergarten through 3rd grade. Exact program availability can be confirmed directly with the school.",
      },
      {
        q: "What is the student-to-teacher ratio?",
        a: "KAPS limits enrollment to a maximum of 10 students per teacher.",
      },
      {
        q: "What are the microschool hours?",
        a: "For the 2026–27 school year, the microschool schedule is Monday through Thursday, 8:00 AM to 1:00 PM.",
      },
      {
        q: "Does KAPS offer tutoring?",
        a: "Yes. KAPS offers reading and math tutoring for Kindergarten through 3rd grade. Sessions are available Monday and Tuesday between 3:30 PM and 5:30 PM.",
      },
      {
        q: "Is extended day available?",
        a: "Extended-day learning runs from 1:00 PM to 4:00 PM, featuring collaborative and project-based learning opportunities. Confirm capacity and current pricing directly with KAPS.",
      },
      {
        q: "Is KAPS set up for TEFA?",
        a: "Yes. Kinder Academy Prep School is set up for the Texas Education Freedom Act (TEFA). Contact Kimberly for current enrollment details.",
      },
      {
        q: "What teaching approach does KAPS use?",
        a: "KAPS combines Montessori-inspired, play-based, and faith-based learning to support academic, social-emotional, and personal growth.",
      },
      {
        q: "How do families inquire or enroll?",
        a: "Families can call 737-775-8833, email contact@kinderacademyprepschool.com, or use the contact form on this page.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Get in Touch",
    heading: "Looking for a different kind of",
    headingAccent: "school experience?",
    description:
      "Seats are limited to 10 students. Reach out today and let's chat about your child, TEFA enrollment, and how KAPS can support your family's goals.",
    primaryCta: "Get Enrollment Information",
    secondaryCta: "Call 737-775-8833",
  },
  footer: {
    tagline: "A private early-childhood microschool in Georgetown, Texas.",
    links: ["Why KAPS", "Programs", "About Kimberly", "FAQ", "Contact"],
    copyright: "© 2026 Kinder Academy Prep School",
    poweredBy: "Powered by Prenda · Website concept by MudKitchen",
  },
};
