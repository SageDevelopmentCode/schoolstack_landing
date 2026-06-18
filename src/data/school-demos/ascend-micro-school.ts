import type { SchoolWebsiteDemoConfig } from "./types";
import { ASCEND_MICROSCHOOL_ADMIN_LOGO } from "./ascendmicroschool-admin-demo";

export const ascendMicroSchoolConfig: SchoolWebsiteDemoConfig = {
  slug: "ascend-micro-school",
  schoolName: "Ascend Micro School",
  theme: {
    primary: "#165C9A",
    primaryHover: "#124A7C",
    dark: "#165C9A",
    darkHover: "#124A7C",
    lightBg: "#F7FAFC",
    lightBorder: "#E2E8F0",
    muted: "#4A5568",
    badgeBg: "#F4B53F1A",
    accentText: "#3E7C75",
    pageBg: "#FFFFFF",
  },
  logo: ASCEND_MICROSCHOOL_ADMIN_LOGO,
  hero: {
    eyebrow: "Growing Minds, Giving Hearts · Northern Colorado Springs · Grades K–8",
    eyebrowPlacement: "announcementBar",
    headline: ["Faith-based hybrid education", "rooted in community."],
    subheadline:
      "Ascend Micro School is a faith-based K–8 hybrid school in northern Colorado Springs that partners with families to provide engaging, learner-driven education rooted in compassion for our local community.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Learn About Our Mission",
    secondaryCtaTarget: "signature",
    navCta: "Contact Us",
    navLinks: ["Mission", "Why Hybrid", "Our Story", "FAQ"],
    backgroundImage: "/images/stock/ImageTwo.jpg",
    floatingImages: ["/images/stock/ImageSeven.jpg", "/images/stock/ImageSix.jpg"],
    imageAlt: "Students learning in a small mixed-age group",
    tagline: "Growing Minds, Giving Hearts.",
  },
  signatureSection: {
    type: "hybridRhythm",
    eyebrow: "The Hybrid Model",
    heading: "Two days on campus. Five days of learning.",
    subtitle:
      "Ascend partners with families to combine collaborative on-campus instruction with flexible homeschool days — highly individualized, deeply relational.",
    tagline: "Growing Minds, Giving Hearts.",
    campusDays: [
      {
        label: "Tuesdays & Thursdays",
        title: "Collaborative Campus Days",
        desc: "Writing, literature, science, social studies, art, music, and Explorations in small mixed-age cohorts with an 8:1 student-to-instructor ratio.",
      },
      {
        label: "8:45 AM – 3:00 PM",
        title: "Learner-Driven Instruction",
        desc: "Mastery-based learning with place-based projects, service opportunities, and learning guides who know each child well.",
      },
    ],
    homeDays: [
      {
        label: "Mon · Wed · Fri · Weekends",
        title: "Homeschool Days at Home",
        desc: "Families homeschool on off-days with curriculum consulting, MasteryTrack, Google Classroom, and optional Wednesday math tutoring.",
      },
      {
        label: "Year-Round Support",
        title: "Curriculum & Consulting",
        desc: "Personalized educational plans, curriculum selection, and independent instruction available beyond campus days.",
      },
    ],
    serviceNote:
      "Students use their skills to serve the Pikes Peak community — from local partnerships to meaningful service learning projects.",
  },
  stats: [
    { value: "Grades K–8", label: "Elementary & Middle" },
    { value: "2 Days/Week", label: "Tues & Thurs On Campus" },
    { value: "8:1 Ratio", label: "Student to Instructor" },
    { value: "Black Forest", label: "Colorado Springs, CO" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Why Families Choose Ascend",
    heading: "Learner-driven education with room to grow, serve, and belong.",
    cards: [
      {
        title: "Highly individualized instruction",
        desc: "Personalized learning plans and mixed-age cohorts with learning guides who know each child well.",
      },
      {
        title: "Place-based, hands-on learning",
        desc: "Real-world projects and community involvement as a catalyst for academic growth.",
      },
      {
        title: "Character development & service",
        desc: "Students learn to use their gifts to create positive change in the Pikes Peak community.",
      },
      {
        title: "Faith-rooted, community-centered",
        desc: "A warm culture that partners with families and honors each child's unique strengths.",
      },
    ],
    mainImage: "/images/stock/ImageSeven.jpg",
    secondaryImage: "/images/stock/ImageEight.jpg",
  },
  marquee: [
    "Growing Minds Giving Hearts",
    "Hybrid K–8",
    "8:1 Ratio",
    "Mastery-Based",
    "Place-Based",
    "Service Learning",
    "Scholé Communities",
    "Mixed-Age Cohorts",
    "Learner-Driven",
    "Colorado Springs",
    "501(c)(3)",
    "Faith-Based",
  ],
  programs: {
    eyebrow: "Program Options",
    heading: "Flexible pathways for your family",
    subtitle: "Click each option to explore what enrollment and support look like.",
    ctaLabel: "Learn More",
    items: [
      {
        badge: "Hybrid",
        title: "Hybrid 2-Day Program",
        teaser: "Tuesdays & Thursdays on campus",
        desc: "Students attend 2 days per week for collaborative, learner-driven instruction in writing, literature, science, social studies, art, music, and Explorations — with homeschool support on off days.",
        details: ["Grades K–8", "Tues & Thurs", "8:45 AM–3:00 PM", "$3,575/yr"],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#165C9A]",
        accentBg: "bg-[#F7FAFC]",
      },
      {
        badge: "Consulting",
        title: "Curriculum Consulting",
        teaser: "Year-round homeschool guidance",
        desc: "Work with our learning guides to develop personalized educational plans, select curriculum, and align your homeschool days with Colorado requirements.",
        details: ["All Grades", "Year-Round", "Flexible", "Contact for rates"],
        image: "/images/stock/ImageSix.jpg",
        accent: "text-[#3E7C75]",
        accentBg: "bg-[#F7FAFC]",
      },
      {
        badge: "Instruction",
        title: "Independent Instruction",
        teaser: "Targeted support beyond campus days",
        desc: "One-on-one or small-group instruction for students who need additional support in specific subjects — available year-round.",
        details: ["All Grades", "By Appointment", "Flexible", "Contact for rates"],
        image: "/images/stock/ImageFive.jpg",
        accent: "text-[#F4B53F]",
        accentBg: "bg-[#F7FAFC]",
      },
      {
        badge: "Add-On",
        title: "Wednesday Math Tutoring",
        teaser: "Optional mid-week math session",
        desc: "Add a dedicated math tutoring session each Wednesday for students who want extra support between campus days.",
        details: ["Grades K–8", "Wednesdays", "Optional", "Contact for rates"],
        image: "/images/stock/ImageSeven.jpg",
        accent: "text-[#165C9A]",
        accentBg: "bg-[#F7FAFC]",
      },
    ],
  },
  mosaicImages: [
    "/images/stock/ImageSix.jpg",
    "/images/stock/ImageSeven.jpg",
    "/images/stock/ImageTen.jpg",
  ],
  quote: {
    text: [
      "Our goal is to guide students toward expanding their minds",
      "and empowering their hearts.",
    ],
    attribution: "Growing Minds, Giving Hearts.",
    backgroundImage: "/images/stock/ImageNine.jpg",
  },
  stripImages: [
    "/images/stock/ImageEleven.jpg",
    "/images/stock/ImageTwelve.jpg",
    "/images/stock/ImageThirteen.jpg",
    "/images/stock/ImageFourteen.jpg",
    "/images/stock/ImageNine.jpg",
    "/images/stock/ImageTen.jpg",
  ],
  timeline: {
    eyebrow: "Admissions Process",
    heading: "From first conversation",
    headingSub: "to enrollment.",
    steps: [
      {
        time: "Step 1",
        activity: "Info Meeting",
        desc: "Schedule a phone call or attend an info meeting to learn about our hybrid model, faith-based approach, and community.",
        image: "/images/stock/ImageEleven.jpg",
      },
      {
        time: "Step 2",
        activity: "Application & Tour",
        desc: "Submit the full application with references, then visit our campus in southwest Black Forest.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "Step 3",
        activity: "Family Interview",
        desc: "Meet with our team for an informal conversation to ensure Ascend is the right fit for your child and family.",
        image: "/images/stock/ImageSeven.jpg",
      },
      {
        time: "Step 4",
        activity: "Enrollment",
        desc: "Upon acceptance, submit your deposit and enrollment paperwork within one week to secure your spot.",
        image: "/images/stock/ImageSix.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Trust & Community",
    heading: "Rooted in faith, service, and Scholé Communities",
    subtitle:
      "A 501(c)(3) homeschool hybrid serving Northern Colorado Springs families with learner-driven, mastery-based education.",
    items: [
      {
        title: "501(c)(3) Nonprofit",
        desc: "Ascend Micro School is a registered nonprofit, committed to accessible, specialized education for local families.",
        icon: "shield",
      },
      {
        title: "Scholé Communities Network",
        desc: "Part of a national network of restful, communal, and experiential learning communities.",
        icon: "award",
      },
      {
        title: "8:1 Student Ratio",
        desc: "Small mixed-age cohorts with learning guides who build lasting rapport with each student.",
        icon: "graduationCap",
      },
    ],
  },
  founder: {
    eyebrow: "Our Story",
    heading: "Built on student-centered education",
    headingAccent: "and community in Colorado Springs.",
    paragraphs: [
      "Ascend Micro School grew from a passion for learner-driven education and a desire to serve Northern Colorado Springs families with a smaller, more personalized school experience.",
      "Our founders combine experience in student-centered teaching, gifted intervention, and entrepreneurship — creating a microschool where students pursue their gifts while learning to serve their community.",
    ],
    credentials: [
      "Learner-Driven Education",
      "Gifted & 2e Experience",
      "Place-Based Learning",
      "Multi-Generational Community",
    ],
    quote:
      "We want our learners to be different — to cherish the uniqueness of every student and empower them to make a difference.",
    quoteAttribution: "— Ascend Micro School",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "Black Forest, CO" },
    name: "Ascend Micro School",
    title: "Faith-Based K–8 Hybrid",
  },
  parallax: {
    eyebrow: "Why a Hybrid Microschool?",
    heading: ["The best of both", "worlds."],
    subtitle:
      "Two days on campus for collaborative, guided learning — with the flexibility of homeschooling the rest of the week. Highly individualized instruction paired with a vibrant learning community.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Submit an Inquiry",
    backgroundImage: "/images/stock/ImageNine.jpg",
  },
  pillars: {
    eyebrow: "Our Mission",
    heading: "Learning with a purpose.",
    subtitle:
      "Highly individualized instruction, place-based education, hands-on learning, and character development — all rooted in compassion for our community.",
    items: [
      {
        icon: "bookOpen",
        title: "Mastery-Based Learning",
        desc: "Students work on concepts until they demonstrate proficiency — eliminating gaps and building true understanding.",
      },
      {
        icon: "users",
        title: "Mixed-Age Community",
        desc: "Students share strengths and collaborate across age levels in small cohorts with lasting learning guide relationships.",
      },
      {
        icon: "heart",
        title: "Service Learning",
        desc: "Students use their skills to serve the Pikes Peak community — from local partnerships to meaningful projects.",
      },
      {
        icon: "sparkles",
        title: "Learner-Driven Education",
        desc: "Students are co-architects of their learning — setting goals, pursuing passions, and building self-advocacy.",
      },
    ],
  },
  form: {
    sidebarQuote: "Ready to find out how we can help your child thrive?",
    sidebarImage: "/images/stock/ImageSeven.jpg",
    eyebrow: "Get in Touch",
    heading: "Contact us today.",
    description:
      "Tell us about your family and we'll be in touch soon to discuss whether Ascend is the right fit. No commitment required.",
    submitLabel: "Submit Inquiry",
    disclaimer: "We'll respond within a few business days. Email hello@ascendmicroschool.com with any questions.",
    trustNote: "No spam. Just a personal reply from our team within a few business days.",
    successEmoji: "✓",
    successTitle: "Inquiry received!",
    successMessage:
      "Thank you for reaching out to Ascend Micro School. We'll be in touch soon to discuss next steps.",
    programOptions: [
      { value: "hybrid-2day", label: "Hybrid 2-Day Program (Tues/Thurs)" },
      { value: "curriculum-consulting", label: "Curriculum Consulting" },
      { value: "independent-instruction", label: "Independent Instruction" },
      { value: "math-tutoring", label: "Wednesday Math Tutoring" },
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
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions parents ask",
    subtitle: "Common questions about our hybrid model, grades, and community.",
    items: [
      {
        q: "What is a homeschool hybrid?",
        a: "Ascend is a homeschool hybrid — also called an independent school — that falls under both private school and homeschool laws. Students attend 2 days per week on campus and homeschool the rest of the week under our umbrella school.",
      },
      {
        q: "What grades do you serve?",
        a: "We serve students in grades K–8 in mixed-age elementary and secondary cohorts, with about 16 elementary and 12 secondary students per day.",
      },
      {
        q: "How many days per week do students attend?",
        a: "Students attend 2 days per week on Tuesdays and Thursdays from 8:45 AM to 3:00 PM. We also schedule family field trips on off-days and weekends.",
      },
      {
        q: "What is your class size and student–teacher ratio?",
        a: "We maintain a student-to-instructor ratio of 8:1 or less in small, mixed-age classes with dedicated learning guides.",
      },
      {
        q: "Is Ascend a nonprofit?",
        a: "Yes — Ascend Micro School is a 501(c)(3) nonprofit and part of the Scholé Communities network.",
      },
      {
        q: "Are you a faith-based program?",
        a: "Yes. We use a Christian worldview and Heartwork curriculum to teach generosity, hospitality, and service — while partnering with families and churches as the primary spiritual influences.",
      },
      {
        q: "What support is provided for homeschool days?",
        a: "We use MasteryTrack, Google Classroom, take-home folders, and a parent Facebook group to share skills, ideas, and optional practice work for homeschool days.",
      },
      {
        q: "What is the admissions process?",
        a: "Attend an info meeting, submit an application, tour the campus, complete a family interview, then submit your deposit and enrollment paperwork within one week of acceptance.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Enrolling for 2025–26",
    heading: "Ready to find out how we can help",
    headingAccent: "your child thrive?",
    description:
      "Contact us today to schedule a tour, attend an info meeting, or learn more about our faith-based hybrid microschool in Northern Colorado Springs.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Submit an Inquiry",
  },
  footer: {
    tagline: "Faith-based K–8 hybrid microschool · Northern Colorado Springs, CO",
    links: ["Mission", "Why Hybrid", "Our Story", "FAQ", "Contact"],
    copyright: "© 2026 Ascend Micro School",
    poweredBy: "Website concept by MudKitchen",
  },
};
