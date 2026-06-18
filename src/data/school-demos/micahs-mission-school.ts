import type { SchoolWebsiteDemoConfig } from "./types";
import { MICAH_MISSION_ADMIN_LOGO } from "./micahmission-admin-demo";

export const micahsMissionSchoolConfig: SchoolWebsiteDemoConfig = {
  slug: "micahs-mission-school",
  schoolName: "Micah's Mission School, Inc.",
  theme: {
    primary: "#2F5496",
    primaryHover: "#244273",
    dark: "#2F5496",
    darkHover: "#244273",
    lightBg: "#F8FAFD",
    lightBorder: "#F2F2F2",
    muted: "#333333",
    badgeBg: "#F8FAFD",
    accentText: "#C28A2E",
    pageBg: "#FFFFFF",
  },
  logo: MICAH_MISSION_ADMIN_LOGO,
  hero: {
    eyebrow: "Faith-Based · K–12 · Vicksburg, Mississippi",
    eyebrowPlacement: "announcementBar",
    headline: ["Act justly. Love mercy.", "Walk humbly with your God."],
    headlineAccentLine: 1,
    headlineClassName:
      "text-3xl md:text-[2.625rem] font-bold text-white font-heading leading-[1.12] mb-5",
    headlineAccentClassName: "text-[#B8D4F5]",
    subheadline:
      "Micah's Mission School, Inc. is a Hybrid Learning and Resource Center providing hope for the whole child — serving educationally at-risk K–12 students with and without disabilities through project-based learning, daily living skills, pre-work training, and character development.",
    primaryCta: "Request Information",
    secondaryCta: "Step Out of the Boat",
    secondaryCtaTarget: "signature",
    navCta: "Request Information",
    navLinks: ["About", "Programs", "Enrollment", "Contact"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/ImageSix.jpg"],
    imageAlt: "Students learning in a warm, supportive small-group setting",
  },
  signatureSection: {
    type: "fruitsOfSpirit",
    eyebrow: "Daily Foundation",
    heading: "To be better today than we were yesterday…",
    intro:
      "Each day begins with reflection — choosing a word for the day and a scripture or quote to build a foundation of faith. Students grow in character through the Fruits of the Spirit.",
    quote: "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control.",
    fruits: [
      { name: "Love", desc: "Caring for others as the hands and feet of Jesus." },
      { name: "Joy", desc: "Finding hope and celebration in daily learning." },
      { name: "Peace", desc: "A calm, judgment-free environment to heal and grow." },
      { name: "Patience", desc: "Learning at each student's individual pace." },
      { name: "Kindness", desc: "Compassionate support for every child." },
      { name: "Goodness", desc: "Character development woven into academics." },
      { name: "Faithfulness", desc: "Rooted in Micah 6:8 and daily devotion." },
      { name: "Gentleness", desc: "A safe haven for brokenhearted students." },
      { name: "Self-Control", desc: "Building integrity, motivation, and courage." },
    ],
  },
  stats: [
    { value: "Grades K–12", label: "Hybrid & Microschool" },
    { value: "$30/day", label: "Flexible Hybrid Tuition" },
    { value: "501(c)(3)", label: "Non-Profit Mission" },
    { value: "Vicksburg, MS", label: "Hybrid Learning Center" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Our Mission & Vision",
    heading: "Act justly, love mercy, and walk humbly with your God.",
    cards: [
      {
        title: "Faith-Based Mission",
        desc: "Students discover and deepen their relationship with God while learning to be the hands and feet of Jesus — rooted in Micah 6:8.",
      },
      {
        title: "Whole-Child Focus",
        desc: "Project-based learning, online independent study, daily living skills, pre-work training, character development, and leadership — all in one place.",
      },
      {
        title: "Individualized Pace",
        desc: "Every student learns kinesthetically, auditorily, and visually at the pace and level they individually need — without judgment.",
      },
      {
        title: "Compassionate Safe Haven",
        desc: "A judgment-free environment for children and youth who are broken and looking for a place to heal, grow, and belong.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/ImageSeven.jpg",
  },
  marquee: [
    "Faith-Based",
    "501(c)(3)",
    "Hybrid Learning",
    "K–12",
    "Project-Based",
    "Pre-Work Skills",
    "Daily Living",
    "Online Learning",
    "Whole Child",
    "$30/day",
    "Micah 6:8",
    "Vicksburg",
  ],
  programs: {
    eyebrow: "Program Options",
    heading: "Choose the path that fits your family.",
    subtitle:
      "Three enrollment pathways for educationally at-risk students — with and without disabilities.",
    ctaLabel: "Learn More",
    items: [
      {
        badge: "Private",
        title: "Private Microschool",
        teaser: "Project-based K–12 with high school diploma track",
        desc: "Small private microschool for grades K–12 with project-based learning across academic, social-emotional, physical, daily living, pre-work, and spiritual development. Students earn a high school diploma in a close, faith-centered community.",
        details: ["Grades K–12", "7 Seats", "$30/day", "Diploma Track"],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#2F5496]",
        accentBg: "bg-[#F8FAFD]",
      },
      {
        badge: "Hybrid",
        title: "Hybrid Homeschool",
        teaser: "Flexible days with MS homeschool portfolio support",
        desc: "Hybrid support through parent choice of subjects, activities, field trips, and community service. Academic portfolios align with Mississippi Department of Education homeschool standards. Parents register with the truancy officer as hybrid learners.",
        details: ["Grades K–12", "15 Seats", "$30/day", "$65/hr Tutorial"],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#244273]",
        accentBg: "bg-[#F8FAFD]",
      },
      {
        badge: "Online",
        title: "Online Learning",
        teaser: "Independent online academic pathway",
        desc: "Online independent learning for grades K–12 — a flexible academic pathway for families who need remote coursework alongside Micah's mission of individualized, whole-child support.",
        details: ["Grades K–12", "10 Seats", "$50/month", "Academic Focus"],
        image: "/images/stock/ImageSeven.jpg",
        accent: "text-[#C28A2E]",
        accentBg: "bg-[#FAFAFF]",
      },
    ],
  },
  mosaicImages: [
    "/images/stock/Homeschool2.jpg",
    "/images/stock/ImageSix.jpg",
    "/images/stock/ImageTen.jpg",
  ],
  quote: {
    text: [
      "Students learn the meaning of excellence",
      "and meet their level of excellence for their personal best…",
    ],
    attribution: "Not somebody else's best, but their own.",
    backgroundImage: "/images/stock/ImageNine.jpg",
  },
  stripImages: [
    "/images/stock/ImageEleven.jpg",
    "/images/stock/ImageTwelve.jpg",
    "/images/stock/ImageThirteen.jpg",
    "/images/stock/ImageFourteen.jpg",
    "/images/stock/Homeschool3.jpg",
    "/images/stock/ImageTen.jpg",
  ],
  timeline: {
    eyebrow: "Enrollment",
    heading: "Enroll today in three steps.",
    headingSub: "From first hello to a personalized education plan.",
    steps: [
      {
        time: "Step 1",
        activity: "Request Information",
        desc: "Contact info@micahsmissionschool.org or submit the inquiry form. We'll help you understand our programs and answer your questions.",
        image: "/images/stock/ImageEleven.jpg",
      },
      {
        time: "Step 2",
        activity: "Choose Your Path",
        desc: "Explore Private Microschool, Hybrid Homeschool, or Online Learning — and learn about tuition, registration, and hybrid learner requirements.",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        time: "Step 3",
        activity: "Build Your Plan",
        desc: "Work with our team to create a personalized education plan and complete your registration packet for the pathway that fits your child.",
        image: "/images/stock/ImageSeven.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Accreditation & Compliance",
    heading: "Built on standards and a mission to serve",
    subtitle:
      "Micah's Mission School is a 501(c)(3) non-profit committed to academic excellence, regulatory alignment, and making services accessible to every student who needs them.",
    items: [
      {
        title: "Middle States Candidate",
        desc: "Candidate with the Middle States Association Next Generation Accreditation — pursuing recognized pathways for academic quality.",
        icon: "shield",
      },
      {
        title: "Mississippi Homeschool Aligned",
        desc: "Academic portfolios aligned with Mississippi Department of Education homeschool standards for hybrid learners.",
        icon: "graduationCap",
      },
      {
        title: "Mission-Driven Access",
        desc: "Funded through tuition, grants, and donations — with a goal that every student who needs our services can attend fully funded.",
        icon: "heart",
      },
    ],
  },
  founder: {
    eyebrow: "Meet the Administrator",
    heading: "Called to step out of the boat.",
    headingAccent: "Building the boat together.",
    paragraphs: [
      "Dr. Emily Harber Williams founded Micah's Mission after years as a Lead Special Education Teacher in the Vicksburg-Warren School District. She clung to Psalm 34:17–20 through her Ph.D journey and heard God's calling to create a place where at-risk children and youth who are broken can heal and continue their education.",
      "When God said, \"You will be a Pastor. You will continue with Micah's. I got Micah's covered!\" — she stepped out of the boat again. Today she leads a 501(c)(3) mission school rooted in Micah 6:8.",
    ],
    credentials: [
      "Ph.D. Education · Policy & Leadership",
      "M.Ed. Special Education (EBD)",
      "M.Div. Perkins School of Theology",
      "Lead Special Education Teacher · Vicksburg-Warren",
    ],
    quote:
      "Students learn the meaning of excellence and are able to meet their level of excellence for their personal best… not somebody else's best, but their own.",
    quoteAttribution: "— Dr. Emily Harber Williams, Founder",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Founder", value: "Executive Director" },
    name: "Dr. Emily Harber Williams",
    title: "Founder, President & Executive Director",
  },
  parallax: {
    eyebrow: "Faith & Story",
    heading: ["Step out of the boat.", "Raise the sail."],
    subtitle:
      "Stepping out of the boat does not bring an end to one's journey. We continue to build the boat — then raise the sails so the Holy Spirit can guide us through the storms toward the rainbow.",
    primaryCta: "Request Information",
    secondaryCta: "Step Out of the Boat",
    backgroundImage: "/images/stock/Homeschool3.jpg",
  },
  pillars: {
    eyebrow: "What Makes Micah's Mission Different",
    heading: "Whole-child learning. Faith-filled community.",
    subtitle:
      "Project-based academics, daily living skills, and character development — woven into every day at Micah's Mission.",
    items: [
      {
        icon: "bookOpen",
        title: "Project-Based Learning",
        desc: "Real-world problems that enhance critical thinking and problem-solving — students demonstrate understanding in their preferred mode of learning.",
      },
      {
        icon: "compass",
        title: "Daily Living & Pre-Work Skills",
        desc: "Practical life skills, culinary classes, and pre-work training that prepare students for life after graduation.",
      },
      {
        icon: "users",
        title: "Character & Leadership",
        desc: "Character development and leadership woven into academics — building integrity, motivation, and courage.",
      },
      {
        icon: "heart",
        title: "Faith & Healing",
        desc: "Rooted in Micah 6:8 and Psalm 34:17–20 — a compassionate safe haven where brokenhearted students find hope.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Ready to start the enrollment conversation for your child?",
    sidebarImage: "/images/stock/Homeschool2.jpg",
    eyebrow: "Get in Touch",
    heading: "Request information.",
    description:
      "Tell us about your student and we'll reach out to discuss Private Microschool, Hybrid Homeschool, or Online Learning. No commitment required.",
    submitLabel: "Request Information",
    disclaimer:
      "We'll respond from info@micahsmissionschool.org within a few business days.",
    trustNote: "Every inquiry is handled with compassion and confidentiality — we'll help you find the right path for your child.",
    successEmoji: "✓",
    successTitle: "Request received!",
    successMessage:
      "Thank you for reaching out. We'll be in touch soon to help you choose the best program for your child.",
    programOptions: [
      { value: "private-microschool", label: "Private Microschool" },
      { value: "hybrid-homeschool", label: "Hybrid Homeschool" },
      { value: "online-learning", label: "Online Learning" },
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
      "Common questions about programs, tuition, and enrollment at Micah's Mission School.",
    items: [
      {
        q: "What programs does Micah's Mission offer?",
        a: "We offer three pathways: Private Microschool ($30/day, project-based K–12 with diploma track), Hybrid Homeschool ($30/day plus $65/hr tutorial options), and Online Learning ($50/month). Each serves educationally at-risk students with and without disabilities.",
      },
      {
        q: "What are the tuition rates?",
        a: "Private Microschool and Hybrid Homeschool are $30 per day, with hybrid tutorial support at $65 per hour. Online Learning is $50 per month. Weekly, monthly, and semester rates vary by days per week — contact us for a personalized quote.",
      },
      {
        q: "Who does Micah's Mission serve?",
        a: "We serve educationally at-risk K–12 students with and without disabilities — including students with Autism, Down Syndrome, learning disabilities, dyslexia, ADHD, and those who need small groups, individualized pacing, or a compassionate safe haven.",
      },
      {
        q: "How does hybrid homeschool enrollment work?",
        a: "Parents register their children with the truancy officer as homeschoolers and hybrid learners at Micah's Mission. We help build academic portfolios aligned with Mississippi Department of Education homeschool standards to meet graduation criteria.",
      },
      {
        q: "Is Micah's Mission a faith-based school?",
        a: "Yes. We are a 501(c)(3) faith-based mission rooted in Micah 6:8 and Psalm 34:17–20 — helping students discover their relationship with God while learning to be the hands and feet of Jesus.",
      },
      {
        q: "What is your accreditation status?",
        a: "Micah's Mission School is a candidate with the Middle States Association Next Generation Accreditation. Private microschool students earn a high school diploma; hybrid students work toward homeschool diploma/certificate pathways aligned with Mississippi standards.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Enrollment Open",
    heading: "Ready to start the conversation?",
    headingAccent: "We're here to help.",
    description:
      "Whether you're exploring Private Microschool, Hybrid Homeschool, or Online Learning — we'd welcome the chance to connect with your family.",
    primaryCta: "Request Information",
    secondaryCta: "Step Out of the Boat",
  },
  footer: {
    tagline:
      "Faith-based K–12 hybrid learning and resource center in Vicksburg, Mississippi.",
    links: ["About", "Programs", "Enrollment", "Contact"],
    copyright: "© 2026 Micah's Mission School, Inc.",
    poweredBy: "Website concept by MudKitchen",
  },
};
