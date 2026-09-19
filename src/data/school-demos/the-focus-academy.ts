import type { SchoolWebsiteDemoConfig } from "./types";
import { THE_FOCUS_ACADEMY_LOGO } from "./the-focus-academy-admin-demo";

export const theFocusAcademyConfig: SchoolWebsiteDemoConfig = {
  slug: "the-focus-academy",
  schoolName: "The FOCUS Academy",
  theme: {
    primary: "#2E6F9E",
    primaryHover: "#173B5B",
    dark: "#173B5B",
    darkHover: "#102B43",
    lightBg: "#F7F4ED",
    lightBorder: "#E9DFC9",
    muted: "#5B6974",
    badgeBg: "rgba(44, 140, 140, 0.12)",
    accentText: "#2C8C8C",
    pageBg: "#F7F4ED",
  },
  logo: THE_FOCUS_ACADEMY_LOGO,
  hero: {
    eyebrow:
      "Memphis-area microschool · Now accepting applications for 2026–27",
    eyebrowPlacement: "announcementBar",
    headline: ["Different", "By Design."],
    subheadline:
      "A smaller, more flexible learning community where gifted and neurodivergent middle-school boys are known, challenged, and supported as individual learners.",
    primaryCta: "Start a Conversation",
    secondaryCta: "Explore the Program",
    secondaryCtaTarget: "programs",
    navCta: "Start a Conversation",
    navLinks: [
      "Why FOCUS",
      "How Learning Works",
      "Program Options",
      "Meet the Founder",
      "FAQ",
    ],
    backgroundImage: "/images/stock/ImageTwo.jpg",
    floatingImages: ["/images/stock/ImageSeven.jpg", "/images/stock/ImageSix.jpg"],
    imageAlt: "Students engaged in collaborative, hands-on learning",
    trustBadges: [
      "Grades 6–8",
      "Twice-Exceptional",
      "Homeschool-Compatible",
      "Memphis Area",
    ],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "How learning works",
    heading: "Flexible by design. Meaningful by intention.",
    subtitle:
      "The program blends self-paced academics with student-driven mini-studies that include STEM, hands-on learning, and enriching activities.",
    modes: [
      {
        label: "Academics",
        title: "Self-paced academics",
        desc: "Differentiated, challenging content that responds to each student's strengths, interests, and learning profile.",
        icon: "bookOpen",
      },
      {
        label: "Mini-studies",
        title: "Student-driven mini-studies",
        desc: "Learners pursue topics they care about — building agency, curiosity, and depth beyond a fixed curriculum.",
        icon: "compass",
      },
      {
        label: "STEM",
        title: "STEM & hands-on learning",
        desc: "Experiments, building, and making bring concepts to life — especially for learners who thrive with active engagement.",
        icon: "sparkles",
      },
      {
        label: "Support",
        title: "Enriching activities & individualized supports",
        desc: "Creative problem solving and flexible opportunities help students build resilience, self-advocacy, and academic confidence.",
        icon: "heart",
      },
    ],
    flexFriday: {
      title: "Homeschool-compatible",
      desc: "Curriculum menus are available, or students may bring their own. The program supports independent homeschoolers and students enrolled under an umbrella school.",
    },
  },
  stats: [
    { value: "6–8", label: "Grades served" },
    { value: "2 options", label: "Program pathways" },
    { value: "8:30–2:30", label: "School day" },
    { value: "Memphis", label: "Area microschool" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Why FOCUS",
    heading: "When traditional school is not the whole answer.",
    cards: [
      {
        title: "Known as an individual",
        desc: "Learning plans respond to strengths, interests, and needs — not a one-size-fits-all classroom pace.",
      },
      {
        title: "Challenged with purpose",
        desc: "Differentiated learning makes room for meaningful academic growth without sacrificing the support twice-exceptional learners need.",
      },
      {
        title: "Supported in community",
        desc: "Small, collaborative groups build connection, resilience, and self-advocacy in a strengths-first environment.",
      },
    ],
    mainImage: "/images/stock/ImageSeven.jpg",
    secondaryImage: "/images/stock/ImageSix.jpg",
  },
  marquee: [
    "Different By Design",
    "Twice-Exceptional",
    "Gifted & Neurodivergent",
    "Memphis Area",
    "4-Day Program",
    "2-Day Program",
    "Learning Pods",
    "STEM & Hands-On",
    "Homeschool-Compatible",
    "Start a Conversation",
    "2026–27 Enrollment",
    "Strengths First",
  ],
  programs: {
    eyebrow: "Program Options",
    heading: "Choose the rhythm that works for your family.",
    subtitle:
      "Both programs run 8:30 a.m.–2:30 p.m. Tuition and availability subject to confirmation.",
    ctaLabel: "Start a Conversation",
    items: [
      {
        badge: "4-day",
        title: "4-Day Program",
        teaser: "Monday–Thursday · Asynchronous learning Friday",
        desc: "Students attend Monday through Thursday and opt for asynchronous learning on Fridays — a full-week rhythm with built-in flexibility for family-directed learning.",
        details: [
          "Mon–Thu on campus",
          "Async Friday",
          "8:30 a.m.–2:30 p.m.",
          "$15,728 tuition",
        ],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#2E6F9E]",
        accentBg: "bg-[#EAF3F7]",
      },
      {
        badge: "2-day",
        title: "2-Day Program",
        teaser: "Monday/Wednesday or Tuesday/Thursday",
        desc: "Families choose two days per week — either Monday/Wednesday or Tuesday/Thursday — blending on-campus collaboration with home-based academics.",
        details: [
          "2 days/week",
          "Mon/Wed or Tue/Thu",
          "8:30 a.m.–2:30 p.m.",
          "$9,909 tuition",
        ],
        image: "/images/stock/ImageSeven.jpg",
        accent: "text-[#2C8C8C]",
        accentBg: "bg-[#EAF3F7]",
      },
    ],
  },
  mosaicImages: [
    "/images/stock/ImageTwo.jpg",
    "/images/stock/ImageSeven.jpg",
    "/images/stock/ImageSix.jpg",
  ],
  quote: {
    text: [
      "Each child is wonderfully and fearfully made.",
      "We tailor our approach to support their individual needs.",
    ],
    attribution: "— The FOCUS Academy",
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
    eyebrow: "A typical day",
    heading: "Structure with flexibility",
    headingSub: "built in.",
    steps: [
      {
        time: "Morning",
        activity: "Self-paced academics",
        desc: "Students begin with differentiated academic work — progressing at their own pace within clear expectations and guide support.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "Midday",
        activity: "Mini-studies & collaboration",
        desc: "Student-driven mini-studies and small-group projects encourage curiosity, peer connection, and creative problem solving.",
        image: "/images/stock/ImageSeven.jpg",
      },
      {
        time: "Afternoon",
        activity: "STEM & hands-on learning",
        desc: "Experiments, building, and enriching activities bring learning off the page — especially for learners who thrive with active engagement.",
        image: "/images/stock/ImageSix.jpg",
      },
      {
        time: "Daily",
        activity: "Individualized supports",
        desc: "Guides who know each student's strengths and needs provide the scaffolding, encouragement, and self-advocacy practice that twice-exceptional learners deserve.",
        image: "/images/stock/ImageFour.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "The FOCUS approach",
    heading: "Strengths first. Support that fits.",
    subtitle:
      "A microschool model built around small learning groups, homeschool flexibility, and a belief that neurodivergence is part of how a child thinks — not something to fix.",
    items: [
      {
        title: "Small learning groups",
        desc: "Consistent groups led by educators who know students' strengths, needs, and learning styles — making room for genuine connection.",
        icon: "users",
      },
      {
        title: "Learning pods",
        desc: "Small, intentional learning communities where collaboration and connection redefine what meaningful education looks like.",
        icon: "heart",
      },
      {
        title: "Homeschool flexibility",
        desc: "Supports independent homeschoolers and umbrella-school families — with curriculum menus available or bring your own.",
        icon: "compass",
      },
      {
        title: "Whole-child focus",
        desc: "Learning designed for the whole child — beyond grades and test scores — honoring strengths, interests, and sensory needs.",
        icon: "shield",
      },
    ],
  },
  founder: {
    eyebrow: "Meet the Founder",
    heading: "Built for students who deserve",
    headingAccent: "to be understood.",
    paragraphs: [
      "The FOCUS Academy grew from a passion for supporting children and families through education and health — creating a place where gifted and neurodivergent middle-school boys can thrive.",
      "Our mission is to nurture the strengths of gifted and neurodivergent learners through flexible opportunities, individualized supports, and creative problem solving.",
    ],
    credentials: [],
    quote:
      "Neurodiversity displays itself in many ways — not every child exhibits every trait. We believe each child is wonderfully and fearfully made.",
    quoteAttribution: "— The FOCUS Academy",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Serving", value: "Memphis area" },
    name: "Karolyn Miller",
    title: "Founder, The FOCUS Academy",
  },
  parallax: {
    eyebrow: "Find your FOCUS",
    heading: ["Known.", "Challenged.", "Supported."],
    subtitle:
      "A Memphis-area microschool for twice-exceptional middle-school boys — designed for students who need differentiated, yet challenging, content in a collaborative environment.",
    primaryCta: "Start a Conversation",
    secondaryCta: "Explore the Program",
    backgroundImage: "/images/stock/ImageTwo.jpg",
  },
  pillars: {
    eyebrow: "Our mission",
    heading: "Nurture strengths. Build resilience.",
    subtitle:
      "We embrace each student's unique way of thinking, helping them build the skills needed to excel academically and personally.",
    items: [
      {
        icon: "compass",
        title: "Flexible opportunities",
        desc: "Learning that adapts to how each student thinks, moves, and grows — not the other way around.",
      },
      {
        icon: "heart",
        title: "Individualized supports",
        desc: "Guides who know each learner's profile provide the scaffolding and encouragement twice-exceptional students need.",
      },
      {
        icon: "sparkles",
        title: "Creative problem solving",
        desc: "Mini-studies, STEM, and hands-on projects build agency, curiosity, and real-world thinking skills.",
      },
      {
        icon: "users",
        title: "Self-advocacy & community",
        desc: "Small groups help students practice speaking up for their needs while building lasting peer connections.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "We would love to connect with interested families and learn more about your student.",
    sidebarImage: "/images/stock/ImageSeven.jpg",
    eyebrow: "Start a Conversation",
    heading: "Do you have a child who needs FOCUS?",
    description:
      "Share your student's grade, program interest, and what you'd like us to know. We'll reach out to begin a low-pressure conversation about fit and next steps.",
    submitLabel: "Start a Conversation",
    disclaimer:
      "Email info@thefocusacademy.org · Follow @thef0cusacademy on Instagram.",
    trustNote:
      "Please do not include medical records or highly sensitive personal information in this form.",
    successEmoji: "✓",
    successTitle: "Message received!",
    successMessage:
      "Thank you for your interest in The FOCUS Academy. We'll be in touch soon to start the conversation.",
    programOptions: [
      { value: "four-day", label: "4-Day Program" },
      { value: "two-day", label: "2-Day Program" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Student's Name",
      gradePlaceholder: "Select grade for 2026–27...",
      gradeOptions: [
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
      "New to The FOCUS Academy? Here are the most common things families want to know before starting a conversation.",
    items: [
      {
        q: "Who is The FOCUS Academy designed for?",
        a: "The FOCUS Academy is a Memphis-area microschool for twice-exceptional middle-school boys — gifted learners who are also neurodivergent and need differentiated, challenging content in a smaller, affirming setting.",
      },
      {
        q: "What does twice-exceptional mean in your setting?",
        a: "Twice-exceptional (2e) learners are gifted and also have learning differences or neurodivergent traits. At FOCUS, we design around their strengths while providing the supports their learning profile requires.",
      },
      {
        q: "How does homeschooling work with the program?",
        a: "FOCUS supports homeschooled students registered as independent homeschoolers or under an umbrella school. Curriculum menus are available, or students can provide their own — blending on-campus learning with family-directed academics.",
      },
      {
        q: "Can students use their own curriculum?",
        a: "Yes. Families may use FOCUS curriculum menus or bring their own materials. The 2-Day and 4-Day options are designed to complement — not replace — your family's homeschool approach.",
      },
      {
        q: "What do the 2-Day and 4-Day options include?",
        a: "Both programs run 8:30 a.m.–2:30 p.m. The 4-Day Program meets Monday–Thursday with asynchronous learning on Friday ($15,728). The 2-Day Program meets either Monday/Wednesday or Tuesday/Thursday ($9,909). Tuition subject to confirmation.",
      },
      {
        q: "What is a typical day like?",
        a: "A typical day blends self-paced academics, student-driven mini-studies, STEM and hands-on learning, and enriching activities — with individualized supports woven throughout.",
      },
      {
        q: "How do families begin the enrollment conversation?",
        a: "Start by submitting the inquiry form or emailing info@thefocusacademy.org. We'll connect to learn about your student and discuss program fit for the 2026–27 school year.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Ready to connect?",
    heading: "Do you have a child",
    headingAccent: "who needs FOCUS?",
    description:
      "We would love to connect with interested families and learn more about your student. Now accepting applications for the 2026–27 school year.",
    primaryCta: "Start a Conversation",
    secondaryCta: "Explore the Program",
  },
  footer: {
    tagline:
      "Different By Design · Memphis-area microschool for gifted & neurodivergent middle-school boys",
    links: [
      "Why FOCUS",
      "How Learning Works",
      "Program Options",
      "Meet the Founder",
      "FAQ",
      "Contact",
    ],
    copyright: "© 2026 The FOCUS Academy",
    poweredBy: "Website concept by MudKitchen",
  },
};
