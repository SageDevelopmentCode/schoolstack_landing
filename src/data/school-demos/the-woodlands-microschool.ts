import type { SchoolWebsiteDemoConfig } from "./types";
import { THE_WOODLANDS_LOGO } from "./the-woodlands-admin-demo";

export const theWoodlandsMicroschoolConfig: SchoolWebsiteDemoConfig = {
  slug: "the-woodlands-microschool",
  schoolName: "The Woodlands Microschool",
  theme: {
    primary: "#C6A55B",
    primaryHover: "#B08F4A",
    dark: "#335A39",
    darkHover: "#213B27",
    lightBg: "#F7F3E8",
    lightBorder: "#E9DFC8",
    muted: "#6A6F73",
    badgeBg: "rgba(51, 90, 57, 0.12)",
    accentText: "#335A39",
    pageBg: "#F7F3E8",
  },
  logo: THE_WOODLANDS_LOGO,
  hero: {
    eyebrow: "Conroe, TX · Grades 3–12 · Enrolling 2026–27",
    eyebrowPlacement: "announcementBar",
    headline: ["Empowering Young Minds", "for a Brighter Future"],
    subheadline:
      "Discover a personalized learning experience at The Woodlands Microschool. We focus on nurturing each child's potential in a supportive environment — with flexible scheduling, a distinctive four-hour day, and pathways from elementary through high school.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Explore Programs",
    secondaryCtaTarget: "programs",
    navCta: "Schedule a Tour",
    navLinks: ["Programs", "Four-Hour Day", "About", "Admissions", "FAQ"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/Homeschool3.jpg"],
    imageAlt: "Students learning in a supportive microschool environment",
    trustBadges: ["WASC Accredited", "TEFA Accepted", "4-Hour School Day"],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "Our Four-Hour Day",
    heading: "Focused instruction. Flexible afternoons.",
    subtitle:
      "The Woodlands Microschool offers a distinctive four-hour instructional day — giving students rigorous academics without burnout, and families room for sports, enrichment, and life.",
    modes: [
      {
        label: "Morning",
        title: "Core Instruction",
        desc: "Focused academic blocks with personalized teaching methods tailored to each student's learning style and pace.",
        icon: "bookOpen",
      },
      {
        label: "Afternoon",
        title: "Flex & Enrichment",
        desc: "Optional afternoon time for tutoring, credit recovery, athletics training schedules, or independent study.",
        icon: "compass",
      },
      {
        label: "Hybrid",
        title: "Hybrid Options",
        desc: "Our hybrid private school model blends campus learning with at-home flexibility for families who need it.",
        icon: "sparkles",
      },
      {
        label: "Support",
        title: "Credit Recovery",
        desc: "Dedicated tutoring and credit recovery pathways help students catch up, stay on track, or accelerate toward graduation.",
        icon: "graduationCap",
      },
    ],
    flexFriday: {
      title: "Benefits of a 4-Hour Day",
      desc: "Convenient, flexible schedules that respect family time — with Mon–Thu campus hours and Friday available by appointment.",
    },
  },
  stats: [
    { value: "Conroe, TX", label: "North Houston Area" },
    { value: "4-Hour Day", label: "Focused Instruction" },
    { value: "WASC", label: "Fully Accredited" },
    { value: "TEFA", label: "Accounts Accepted" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Is The Woodlands Microschool Right for Your Family?",
    heading: "Personalized education in a supportive, accredited environment.",
    cards: [
      {
        title: "Need a smaller, more personal school",
        desc: "Close-knit classrooms where passionate educators know each student and adapt to individual learning styles.",
      },
      {
        title: "Want flexible scheduling",
        desc: "Our four-hour day and hybrid options accommodate athletes, homeschool families, and busy schedules.",
      },
      {
        title: "Seeking accreditation and TEFA support",
        desc: "Fully accredited by WASC with Texas Education Freedom Accounts accepted — trust and affordability together.",
      },
      {
        title: "Need credit recovery or tutoring",
        desc: "Dedicated pathways to help students catch up, stay on track, or accelerate toward graduation.",
      },
    ],
    mainImage: "/images/stock/ImageTwo.jpg",
    secondaryImage: "/images/stock/ImageSeven.jpg",
  },
  marquee: [
    "WASC Accredited",
    "TEFA Accepted",
    "4-Hour School Day",
    "Conroe, Texas",
    "Grades 3–12",
    "Hybrid Private School",
    "Credit Recovery",
    "Personalized Learning",
    "Schedule a Tour",
    "Enrolling 2026–27",
    "Student-Centered",
    "Flexible Scheduling",
  ],
  programs: {
    eyebrow: "Programs",
    heading: "Pathways for every stage",
    subtitle:
      "From elementary through high school — plus hybrid, tutoring, and credit recovery support.",
    ctaLabel: "Schedule a Tour",
    items: [
      {
        badge: "Grades 9–12",
        title: "High School Program",
        teaser: "Accredited pathway to graduation",
        desc: "The team at The Woodlands Microschool consists of passionate and skilled educators dedicated to student success. Our teachers utilize diverse teaching methods to cater to individual learning styles — with fast-track and flexible options for motivated learners.",
        details: [
          "Accredited high school diploma",
          "4-hour instructional day",
          "Credit recovery support",
          "Athlete-friendly scheduling",
        ],
        image: "/images/stock/ImageFive.jpg",
        accent: "text-[#335A39]",
        accentBg: "bg-[#F7F3E8]",
      },
      {
        badge: "Grades 3–8",
        title: "3rd–6th Grade & Jr High",
        teaser: "Student-centered elementary and middle school",
        desc: "At The Woodlands Microschool, we prioritize student-centered learning that encourages exploration and inquiry. We aim to cultivate a love for learning that lasts a lifetime — in small, supportive classroom settings.",
        details: [
          "Grades 3 through 6th & Jr High",
          "Personalized instruction",
          "Exploration and inquiry-based",
          "Mon–Thu 8:30 AM – 3:00 PM",
        ],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#C6A55B]",
        accentBg: "bg-[#E9DFC8]",
      },
      {
        badge: "Hybrid",
        title: "Hybrid Private School",
        teaser: "Campus + at-home flexibility",
        desc: "Our hybrid private school model blends in-person instruction with at-home learning days — ideal for families who want accredited structure with scheduling flexibility.",
        details: [
          "Blended campus & home days",
          "Accredited private school",
          "4-day week option",
          "$13,500/year including enrollment fee",
        ],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#335A39]",
        accentBg: "rgba(51, 90, 57, 0.12)",
      },
      {
        badge: "Support",
        title: "Credit Recovery & Tutoring",
        teaser: "Catch up, stay on track, or accelerate",
        desc: "At The Woodlands Microschool, our mission is to transform education through innovative teaching methods. We strive to inspire students to reach their full potential academically and socially — with dedicated tutoring and credit recovery support.",
        details: [
          "One-on-one tutoring",
          "Credit recovery pathways",
          "Flexible scheduling",
          "All grade levels welcome",
        ],
        image: "/images/stock/Homeschool3.jpg",
        accent: "text-[#213B27]",
        accentBg: "bg-[#E9DFC8]",
      },
    ],
  },
  mosaicImages: [
    "/images/stock/Homeschool.jpg",
    "/images/stock/Homeschool2.jpg",
    "/images/stock/ImageSeven.jpg",
  ],
  quote: {
    text: [
      "We focus on nurturing each child's potential",
      "in a supportive environment.",
    ],
    attribution: "The Woodlands Microschool",
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
    eyebrow: "Campus Schedule",
    heading: "A focused rhythm",
    headingSub: "Mon–Thu 8:30 AM – 3:00 PM · Friday by appointment · Conroe, TX",
    steps: [
      {
        time: "8:30 AM",
        activity: "Doors Open",
        desc: "Students arrive at our Conroe campus — a warm, supportive start to a focused school day.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "9:00 AM",
        activity: "Core Instruction",
        desc: "Personalized academic blocks with educators who adapt teaching methods to individual learning styles.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "12:00 PM",
        activity: "Midday Break",
        desc: "Students recharge with lunch and peer connection in our close-knit community.",
        image: "/images/stock/ImageFive.jpg",
      },
      {
        time: "1:00 PM",
        activity: "Afternoon Learning",
        desc: "Continued instruction, tutoring, credit recovery, or enrichment based on each student's pathway.",
        image: "/images/stock/ImageSix.jpg",
      },
      {
        time: "3:00 PM",
        activity: "Dismissal",
        desc: "Families pick up with afternoons free for sports, enrichment, or family time — the benefit of a four-hour focused day.",
        image: "/images/stock/Homeschool3.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Trust & Credibility",
    heading: "Accredited. Affordable. Personal.",
    subtitle:
      "The Woodlands Microschool combines WASC accreditation, TEFA acceptance, and a model designed for real Texas families.",
    items: [
      {
        title: "WASC Accredited",
        desc: "Fully accredited by the Accrediting Commission for Schools, Western Association of Schools and Colleges.",
        icon: "shield",
      },
      {
        title: "TEFA Accepted",
        desc: "We accept Texas Education Freedom Accounts — making quality private education more accessible for families.",
        icon: "award",
      },
      {
        title: "Personalized Instruction",
        desc: "Small classroom settings where passionate educators know each student and adapt to their learning style.",
        icon: "users",
      },
      {
        title: "Flexible Scheduling",
        desc: "Four-hour day, hybrid options, and athlete-friendly schedules that work with your family's life.",
        icon: "compass",
      },
    ],
  },
  founder: {
    eyebrow: "Our Mission",
    heading: "Transforming education through",
    headingAccent: "innovative teaching.",
    paragraphs: [
      "At The Woodlands Microschool, our mission is to transform education through innovative teaching methods. We strive to inspire students to reach their full potential academically and socially.",
      "We prioritize student-centered learning that encourages exploration and inquiry — cultivating a love for learning that lasts a lifetime in a supportive, accredited environment.",
    ],
    credentials: [
      "WASC fully accredited private school",
      "TEFA accounts accepted",
      "Grades 3–12 + credit recovery",
      "Conroe, Texas · 4-hour school day",
    ],
    quote:
      "Every student deserves personalized attention in an environment where they can thrive.",
    quoteAttribution: "— Our Vision",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "Conroe, TX" },
    name: "The Woodlands Microschool",
    title: "Accredited Private Microschool",
  },
  parallax: {
    eyebrow: "Enrolling Now",
    heading: ["Focused.", "Flexible.", "Known."],
    subtitle:
      "We are enrolling students for the 2026–2027 school year. Prospective families can begin the process by scheduling a tour.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Learn About TEFA",
    backgroundImage: "/images/stock/Homeschool2.jpg",
  },
  pillars: {
    eyebrow: "What We Offer",
    heading: "Programs built around your student.",
    subtitle:
      "Multiple pathways — from elementary through high school — with the support families need.",
    items: [
      {
        icon: "graduationCap",
        title: "High School Program",
        desc: "Accredited pathway with fast-track options, credit recovery, and flexible scheduling for motivated learners.",
      },
      {
        icon: "bookOpen",
        title: "Elementary & Jr High",
        desc: "Student-centered learning for grades 3–6 and junior high — exploration, inquiry, and personalized instruction.",
      },
      {
        icon: "compass",
        title: "Hybrid Private School",
        desc: "Blend campus instruction with at-home days for families who want structure and flexibility.",
      },
      {
        icon: "sparkles",
        title: "Credit Recovery & Tutoring",
        desc: "Dedicated support to help students catch up, stay on track, or accelerate toward their goals.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Prospective students who wish to apply can begin by scheduling a tour.",
    sidebarImage: "/images/stock/Homeschool3.jpg",
    eyebrow: "Schedule a Tour",
    heading: "Tell us about your student — we'll follow up to schedule your visit.",
    description:
      "Fill out the form below and our team will reach out to schedule a campus tour, answer your questions, and guide you through the admissions process.",
    submitLabel: "Request a Tour",
    disclaimer:
      "We accept Texas Education Freedom Accounts (TEFA). Tuition starts at $13,500/year including enrollment fee for our 4-day, 4-hour program.",
    successEmoji: "✓",
    successTitle: "Tour request received!",
    successMessage:
      "Thank you for your interest in The Woodlands Microschool. We'll be in touch soon to schedule your campus tour.",
    programOptions: [
      { value: "high-school", label: "High School Program" },
      { value: "elementary-jr-high", label: "3rd–6th Grade & Jr High" },
      { value: "hybrid", label: "Hybrid Private School" },
      { value: "credit-recovery", label: "Credit Recovery & Tutoring" },
      { value: "unsure", label: "Not sure yet — help me decide" },
    ],
    studentFields: {
      namePlaceholder: "Student's First & Last Name",
      gradePlaceholder: "Select grade level...",
      gradeOptions: [
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
      "Everything you need to know before scheduling a tour at The Woodlands Microschool.",
    items: [
      {
        q: "What programs does The Woodlands Microschool offer?",
        a: "We offer High School, 3rd–6th Grade & Jr High, Hybrid Private School, and Credit Recovery & Tutoring. Each pathway is designed for personalized instruction in small classroom settings.",
      },
      {
        q: "What is the four-hour school day?",
        a: "Our distinctive four-hour instructional day provides focused academics without burnout. Campus hours are Mon–Thu 8:30 AM – 3:00 PM, with Friday available by appointment. Afternoons are free for sports, enrichment, or family time.",
      },
      {
        q: "Do you accept TEFA (Texas Education Freedom Accounts)?",
        a: "Yes! We accept Texas Education Freedom Accounts at The Woodlands Microschool, making quality accredited private education more accessible for Texas families.",
      },
      {
        q: "Is the school accredited?",
        a: "Yes. The Woodlands Microschool is a fully accredited private school accredited by the Accrediting Commission for Schools, Western Association of Schools and Colleges (WASC).",
      },
      {
        q: "What are tuition and fees?",
        a: "Tuition is $13,500/year including enrollment fee for our 4-day, 4-hour program. Contact us for details on specific program pathways and hybrid options.",
      },
      {
        q: "How do I apply?",
        a: "Prospective students begin by scheduling a tour. After your visit, our team will guide you through the application and enrollment process for the 2026–2027 school year.",
      },
      {
        q: "Where are you located?",
        a: "We are located at 15479 Pin Oak Dr., Conroe, Texas 77384. Call us at 817-301-4179 or schedule a tour through this page.",
      },
    ],
  },
  closingCta: {
    eyebrow: "2026–2027 Enrollment",
    heading: "Ready to discover a personalized",
    headingAccent: "learning experience?",
    description:
      "We are enrolling students for the 2026–2027 school year. Schedule a tour to see if The Woodlands Microschool is the right fit for your family.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Explore Programs",
  },
  footer: {
    tagline: "Empowering Young Minds for a Brighter Future · Conroe, TX",
    links: ["Programs", "Four-Hour Day", "About", "Admissions", "FAQ", "Contact"],
    copyright: "© 2026 The Woodlands Microschool",
    poweredBy: "Website concept by SchoolStack",
  },
};
