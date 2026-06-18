import type { SchoolWebsiteDemoConfig } from "./types";

export const athenaMicroacademyConfig: SchoolWebsiteDemoConfig = {
  slug: "athena-microacademy",
  schoolName: "Athena Micro-academy of Austin",
  theme: {
    primary: "#C1A367",
    primaryHover: "#A88B4F",
    dark: "#173B5C",
    darkHover: "#24678D",
    lightBg: "#F2E7D1",
    lightBorder: "#E8D9BC",
    muted: "#6A6F73",
    badgeBg: "#F2E7D1",
    accentText: "#24678D",
    pageBg: "#FBFAF6",
  },
  logo: {
    src: "/images/demo/athena/Logo.png",
    alt: "Athena Micro-academy of Austin",
    width: 180,
    height: 52,
  },
  hero: {
    eyebrow: "Launching Fall 2026 · South Austin · Grades 6–12",
    eyebrowPlacement: "announcementBar",
    headline: ["A smaller, wiser way to do", "middle and high school."],
    subheadline:
      "Athena Micro-academy of Austin is a relationship-centered microschool for grades 6–12, designed for students who thrive with personalized learning, close community, and room to grow.",
    primaryCta: "Schedule a Discovery Call",
    secondaryCta: "Explore the Program",
    secondaryCtaTarget: "signature",
    navCta: "Schedule a Call",
    navLinks: ["Program", "Our Story", "Admissions", "FAQ"],
    backgroundImage: "/images/stock/ImageTwo.jpg",
    floatingImages: ["/images/stock/ImageSeven.jpg", "/images/stock/ImageSix.jpg"],
    imageAlt: "Students learning in a small group setting",
    trustBadges: ["Accredited", "TEFA Approved", "KaiPod Catalyst"],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "How the Day Works",
    heading: "Four modes. One intentional rhythm.",
    subtitle: "Every day is designed for focus, growth, and belonging — not one-size-fits-all scheduling.",
    modes: [
      {
        label: "Morning",
        title: "Activation Mode",
        desc: "Students organize, set goals, and build community — starting each day with intention.",
        icon: "compass",
      },
      {
        label: "Core Hours",
        title: "Learning Mode",
        desc: "Core academics at each student's pace with daily coaching and guidance.",
        icon: "bookOpen",
      },
      {
        label: "Afternoon",
        title: "Skill Building Mode",
        desc: "Voces Spanish and Athena's Council for life and leadership skills.",
        icon: "graduationCap",
      },
      {
        label: "Flex Time",
        title: "Flex Mode",
        desc: "Passion projects, independent study, reading, and personal initiatives.",
        icon: "sparkles",
      },
    ],
    flexFriday: {
      title: "Flex Friday",
      desc: "Austin-area experiences, community service, excursions, and deeper academic progress — every Friday.",
    },
  },
  stats: [
    { value: "Grades 6–12", label: "Middle & High School" },
    { value: "Fall 2026", label: "Launching Soon" },
    { value: "South Austin", label: "Southeast Austin" },
    { value: "4 Modes", label: "Daily Learning Modes" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Is Athena Right for You?",
    heading: "For students who are capable, curious, and ready for something smaller.",
    cards: [
      {
        title: "Overwhelmed by large schools",
        desc: "A closer community with more room to be known.",
      },
      {
        title: "Independent but still needs support",
        desc: "Self-paced learning with daily coaching.",
      },
      {
        title: "Socially thoughtful or sensitive",
        desc: "A safer space to build confidence and belonging.",
      },
      {
        title: "Ready for more ownership",
        desc: "Goal setting, projects, leadership, and reflection built into the day.",
      },
    ],
    mainImage: "/images/stock/ImageSeven.jpg",
    secondaryImage: "/images/stock/ImageEight.jpg",
  },
  marquee: [
    "Accredited",
    "TEFA Approved",
    "KaiPod Catalyst",
    "Microschool",
    "Self-Paced Learning",
    "Grades 6–12",
    "South Austin",
    "Flex Fridays",
    "Year-Round Model",
    "Personalized Curriculum",
    "Leadership Skills",
    "Close Community",
  ],
  programs: {
    eyebrow: "Program Options",
    heading: "A pathway that fits your family",
    subtitle: "Click each option to explore what enrollment looks like.",
    ctaLabel: "Learn More",
    items: [
      {
        badge: "Full-Time",
        title: "Full-Time Program",
        teaser: "5 days a week, complete student experience",
        desc: "The complete Athena experience — activation, core academics, skill building, and flex time across five days. Students build community, independence, and academic momentum in a close-knit environment.",
        details: ["Grades 6–12", "Mon–Fri", "5 Days/Week", "$17,000/yr"],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#173B5C]",
        accentBg: "bg-[#F2E7D1]",
      },
      {
        badge: "Part-Time",
        title: "Part-Time · 5 Days",
        teaser: "Morning core academics",
        desc: "Morning core academics at each student's pace with daily guidance and coaching. Ideal for families seeking rigorous academics in a smaller, more personalized setting.",
        details: ["Grades 6–12", "Mornings", "5 Days/Week", "$10,200/yr"],
        image: "/images/stock/ImageSix.jpg",
        accent: "text-[#24678D]",
        accentBg: "bg-[#F2E7D1]",
      },
      {
        badge: "Part-Time",
        title: "Part-Time · 4 Days",
        teaser: "Afternoon enrichment and socialization",
        desc: "Afternoon enrichment, socialization, and skill building — including Voces and Athena's Council. A flexible option for families building a hybrid schedule.",
        details: ["Grades 6–12", "Afternoons", "4 Days/Week", "$8,426/yr"],
        image: "/images/stock/ImageFive.jpg",
        accent: "text-[#C1A367]",
        accentBg: "bg-[#F2E7D1]",
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
      "For students who are bright, creative, and capable,",
      "but need a smaller place to belong.",
    ],
    attribution: "Our students deserve better.",
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
    eyebrow: "Daily Rhythm",
    heading: "A day designed for focus,",
    headingSub: "growth, and belonging.",
    steps: [
      {
        time: "Morning",
        activity: "Activation Mode",
        desc: "Students organize, set goals, and build community — starting each day with intention and connection.",
        image: "/images/stock/ImageEleven.jpg",
      },
      {
        time: "Core Hours",
        activity: "Learning Mode",
        desc: "Core academics at each student's pace with guidance — rigorous challenge without getting lost in the crowd.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "Afternoon",
        activity: "Skill Building Mode",
        desc: "Spanish language and culture through Voces, plus life and leadership skills through Athena's Council.",
        image: "/images/stock/ImageSeven.jpg",
      },
      {
        time: "Flex Time",
        activity: "Flex Mode",
        desc: "Passion projects, independent study, reading, and personal initiatives — room to grow at the right pace.",
        image: "/images/stock/ImageSix.jpg",
      },
      {
        time: "Fridays",
        activity: "Flex Friday",
        desc: "Austin-area experiences, community service, excursions, and deeper academic progress.",
        image: "/images/stock/ImageFour.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Trust & Credibility",
    heading: "Built on experience and affiliation",
    subtitle:
      "Athena brings together accredited credentials, proven leadership, and a model designed for real families.",
    items: [
      {
        title: "Accredited & TEFA Approved",
        desc: "Recognized pathways that give families confidence in Athena's academic rigor and standing.",
        icon: "shield",
      },
      {
        title: "KaiPod Catalyst Program",
        desc: "Part of a national network of innovative microschools with proven launch support.",
        icon: "award",
      },
      {
        title: "22 Years in Education",
        desc: "Founder Mily Pérez has served K–12 students across premier private schools in Austin and Houston.",
        icon: "graduationCap",
      },
    ],
  },
  founder: {
    eyebrow: "Meet the Founder",
    heading: "Built by an educator.",
    headingAccent: "Inspired by a parent's love.",
    paragraphs: [
      "Mily Pérez has served K–12 students for 22 years. She holds an M.Ed. in Educational Leadership and is a certified teacher and principal in Texas.",
      "She has taught and led in premier private schools in Austin and Houston, including St. Andrew's Episcopal School and The Kinkaid School — and founded Athena after watching her own son thrive in a smaller environment.",
    ],
    credentials: [
      "M.Ed. Educational Leadership",
      "Texas Certified Teacher & Principal",
      "22 Years K–12 Experience",
      "St. Andrew's · The Kinkaid School",
    ],
    quote:
      "Every student deserves a place where they are known — not just enrolled.",
    quoteAttribution: "— Mily Pérez, Founder",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Certified", value: "Texas Principal" },
    name: "Mily Pérez",
    title: "Founder & Lead Educator",
  },
  parallax: {
    eyebrow: "Why Microschool",
    heading: ["Focused. Flexible.", "Known."],
    subtitle:
      "Small by design. Personal by practice. More visibility, more flexibility, and more meaningful relationships — without losing the support students need.",
    primaryCta: "Schedule a Discovery Call",
    secondaryCta: "Submit an Inquiry",
    backgroundImage: "/images/stock/ImageNine.jpg",
  },
  pillars: {
    eyebrow: "What Makes Athena Different",
    heading: "Four pillars. One whole student.",
    subtitle:
      "Personalized learning, close community, leadership skills, and a flexible pathway — woven into every day.",
    items: [
      {
        icon: "bookOpen",
        title: "Personalized Learning",
        desc: "Self-paced academics with daily guidance — rigorous challenge without getting lost in the crowd.",
      },
      {
        icon: "users",
        title: "Close Community",
        desc: "A relationship-centered environment where every student is seen, known, and supported.",
      },
      {
        icon: "compass",
        title: "Leadership Skills",
        desc: "Athena's Council builds communication, listening, and life skills alongside academics.",
      },
      {
        icon: "sparkles",
        title: "Flexible Pathway",
        desc: "Full-time and part-time options, Flex Fridays, and a year-round model with intercessions.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Ready to find out if Athena is the right fit for your student?",
    sidebarImage: "/images/stock/ImageSeven.jpg",
    eyebrow: "Admissions Open",
    heading: "Schedule a discovery call.",
    description:
      "Tell us about your student and we'll reach out to schedule a discovery call or campus visit. No commitment required.",
    submitLabel: "Submit Inquiry",
    disclaimer: "We'll respond within 48 hours to schedule your discovery call.",
    successEmoji: "✓",
    successTitle: "Inquiry received!",
    successMessage:
      "We'll be in touch within 48 hours to schedule your discovery call.",
    programOptions: [
      { value: "full-time", label: "Full-Time Program" },
      { value: "part-time-5", label: "Part-Time · 5 Days" },
      { value: "part-time-4", label: "Part-Time · 4 Days" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Student's Name",
      gradePlaceholder: "Select grade level...",
      gradeOptions: [
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
    heading: "Questions parents ask",
    subtitle:
      "New to microschools? Here are the most common things families want to know before scheduling a discovery call.",
    items: [
      {
        q: "Is Athena a good fit for my child?",
        a: "Athena is designed for students in grades 6–12 who are capable and curious but thrive in smaller, close-knit environments. If your child needs more visibility, personalized pacing, or a safer social space, Athena may be a strong fit.",
      },
      {
        q: "How is a microschool different from homeschool?",
        a: "Athena is a fully enrolled private school — not homeschool. Students attend in person, follow a structured daily rhythm, and receive daily coaching and community. Families get the personalization of homeschool with the structure and social connection of a school.",
      },
      {
        q: "What grades does Athena serve?",
        a: "Athena serves students in grades 6–12, launching Fall 2026 in South Austin.",
      },
      {
        q: "What does self-paced learning look like?",
        a: "Students progress through core academics at their own pace with daily guidance from learning coaches. The day includes goal setting, focused work time, and regular check-ins — not independent isolation.",
      },
      {
        q: "How does Athena support social connection?",
        a: "Small cohorts, daily community building, student-led clubs, leadership roles, and Flex Fridays create meaningful peer relationships. Social connection is built into the model, not left to chance.",
      },
      {
        q: "What is Flex Friday?",
        a: "Flex Fridays combine academics, community service, Austin-area excursions, and deeper project work — giving students real-world experiences alongside their core learning.",
      },
      {
        q: "Is Athena accredited or TEFA approved?",
        a: "Athena is accredited and TEFA approved, giving families confidence in the school's academic standing and eligibility for applicable programs.",
      },
      {
        q: "What is the admissions process?",
        a: "Submit an inquiry, schedule a discovery call or visit, submit an application with fee, then make a deposit to secure your spot and set up a payment schedule.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Fall 2026 Launch",
    heading: "Ready to find out if Athena",
    headingAccent: "is the right fit?",
    description:
      "Schedule a discovery call to learn more about Athena's program, daily rhythm, and whether it's the right environment for your student.",
    primaryCta: "Schedule a Discovery Call",
    secondaryCta: "Submit an Inquiry",
  },
  footer: {
    tagline: "A relationship-centered microschool for grades 6–12.",
    links: ["Program", "Our Story", "Admissions", "FAQ", "Contact"],
    copyright: "© 2026 Athena Micro-academy of Austin",
    poweredBy: "Website concept by MudKitchen",
  },
};
