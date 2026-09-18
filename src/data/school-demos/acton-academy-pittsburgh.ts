import type { SchoolWebsiteDemoConfig } from "./types";
import { ACTON_ACADEMY_PITTSBURGH_LOGO } from "./acton-academy-pittsburgh-admin-demo";

export const actonAcademyPittsburghConfig: SchoolWebsiteDemoConfig = {
  slug: "acton-academy-pittsburgh",
  schoolName: "Acton Academy Pittsburgh",
  theme: {
    primary: "#2F5A47",
    primaryHover: "#163C31",
    dark: "#18352D",
    darkHover: "#102820",
    lightBg: "#F7F2E8",
    lightBorder: "#E9DFC9",
    muted: "#607064",
    badgeBg: "rgba(47, 90, 71, 0.12)",
    accentText: "#C96F4A",
    pageBg: "#F7F2E8",
  },
  logo: ACTON_ACADEMY_PITTSBURGH_LOGO,
  hero: {
    eyebrow: "LEARNER-DRIVEN PRIVATE SCHOOL · WEXFORD, PA",
    eyebrowPlacement: "announcementBar",
    headline: ["For families who know", "their child is capable of more."],
    headlineAccentLine: 1,
    subheadline:
      "A learner-driven school where young people take ownership, tackle meaningful challenges, and prepare for a life of purpose.",
    primaryCta: "Book a Call",
    secondaryCta: "Explore the Acton Experience",
    secondaryCtaTarget: "programs",
    navCta: "Book a Call",
    navLinks: [
      "How It Works",
      "Studios",
      "Tuition & Scholarships",
      "Meet the Founders",
      "FAQ",
    ],
    backgroundImage: "/images/stock/ImageTwo.jpg",
    floatingImages: ["/images/stock/ImageSeven.jpg", "/images/stock/ImageSix.jpg"],
    imageAlt: "Young learners collaborating on a hands-on project",
    trustBadges: [
      "Wexford, PA",
      "Pre-K–8 applications",
      "Scholarships available",
      "K–12 pathway",
    ],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "How it works",
    heading: "A school experience built for the real world.",
    subtitle:
      "At Acton, learners do more than complete assignments. They set goals, build habits, participate in discussions, and take on projects that connect learning to life.",
    modes: [
      {
        label: "Pace",
        title: "Learn at the right pace",
        desc: "Young people work at their own pace and are challenged at the level they need — building real understanding before moving forward.",
        icon: "compass",
      },
      {
        label: "Ownership",
        title: "Own the journey",
        desc: "Learners build confidence by taking ownership of their goals, managing their time, and following through on commitments.",
        icon: "graduationCap",
      },
      {
        label: "Projects",
        title: "Make learning real",
        desc: "Five-week, hands-on projects connect ideas to meaningful challenges — design, build, research, and create for a real audience.",
        icon: "sparkles",
      },
      {
        label: "Discussion",
        title: "Think and communicate",
        desc: "Daily Socratic discussions strengthen critical thinking, communication, and the ability to articulate ideas clearly.",
        icon: "users",
      },
    ],
  },
  stats: [
    { value: "Wexford, PA", label: "Campus location" },
    { value: "Pre-K–8", label: "Now enrolling" },
    { value: "$11,500", label: "Annual tuition" },
    { value: "Accredited", label: "IALDS + PA licensed" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "You are not imagining it",
    heading: "If school does not feel right for your child, you are not alone.",
    cards: [
      {
        title: "Bored or not challenged",
        desc: "Capable children who finish work quickly and crave deeper, more meaningful challenges.",
      },
      {
        title: "Stressed about grades",
        desc: "Young people who measure their worth by test scores instead of real growth and curiosity.",
      },
      {
        title: "Going through the motions",
        desc: "Learners who show up each day without engagement, ownership, or a sense of purpose.",
      },
      {
        title: "Capable of more, but not showing it",
        desc: "Children with untapped potential who need an environment that trusts them with real responsibility.",
      },
    ],
    mainImage: "/images/stock/ImageSeven.jpg",
    secondaryImage: "/images/stock/ImageSix.jpg",
  },
  marquee: [
    "Learner-Driven",
    "Self-Paced",
    "Real Projects",
    "Socratic Discussion",
    "Wexford, PA",
    "Spark Studio",
    "Elementary Studio",
    "Middle School Studio",
    "Book a Call",
    "Scholarships Available",
    "Character & Integrity",
    "Pre-K–8 Enrolling",
  ],
  programs: {
    eyebrow: "One journey. Different stages.",
    heading: "A different experience at every stage of the journey.",
    subtitle:
      "Every young person follows a unique path. Acton studios meet learners where they are while gradually increasing challenge, responsibility, and real-world application.",
    ctaLabel: "Book a Call",
    items: [
      {
        badge: "Ages 4–7",
        title: "Spark Studio",
        teaser: "Foundational skills, curiosity, and hands-on exploration",
        desc: "Build confidence, independence, curiosity, and a love of learning through hands-on Montessori materials, purposeful play, and real responsibility.",
        details: [
          "Ages 4–7",
          "I love learning · I belong · I am capable",
          "Hands-on Montessori foundations",
          "Currently enrolling",
        ],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#2F5A47]",
        accentBg: "bg-[#F7F2E8]",
      },
      {
        badge: "Ages 8–11",
        title: "Elementary Studio",
        teaser: "Self-paced academics, projects, and collaboration",
        desc: "Build strong academic skills while learning to manage yourself, work with others, and contribute to a close-knit community.",
        details: [
          "Ages 8–11",
          "I can manage myself · I can contribute",
          "Self-paced academics + projects",
          "Currently enrolling",
        ],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#71825E]",
        accentBg: "bg-[#F7F2E8]",
      },
      {
        badge: "Ages 12–15",
        title: "Middle School Studio",
        teaser: "Bigger challenges and real-world experience",
        desc: "Take on bigger challenges, strengthen communication, build independence, and begin testing yourself in the real world.",
        details: [
          "Ages 12–15",
          "I can take on difficult challenges",
          "Collaborative projects + apprenticeships",
          "Currently enrolling",
        ],
        image: "/images/stock/ImageFour.jpg",
        accent: "text-[#C96F4A]",
        accentBg: "bg-[#F7F2E8]",
      },
      {
        badge: "Coming Soon",
        title: "Launchpad Studio",
        teaser: "Ages 16–18 · Next great adventure",
        desc: "Discover and prepare for your next great adventure through academics, apprenticeships, real-world exploration, and meaningful work.",
        details: [
          "Ages 16–18",
          "I know myself · I can lead myself",
          "Apprenticeships + certifications",
          "Coming soon — ask about timeline",
        ],
        image: "/images/stock/Homeschool3.jpg",
        accent: "text-[#D5A63B]",
        accentBg: "bg-[#F7F2E8]",
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
      "Traditional schools prepare children for tests.",
      "Acton prepares them for life.",
    ],
    attribution: "— Acton Academy Pittsburgh",
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
    eyebrow: "A day at Acton",
    heading: "Learning that begins",
    headingSub: "with purpose.",
    steps: [
      {
        time: "Morning",
        activity: "Set goals and launch the day",
        desc: "Learners arrive, set daily goals, and choose their work — guided by coaches who support without directing every step.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "Core skills",
        activity: "Build foundations at your pace",
        desc: "Reading, writing, and math through Montessori materials and adaptive programs — mastery before moving on.",
        image: "/images/stock/ImageSeven.jpg",
      },
      {
        time: "Afternoon",
        activity: "Tackle real-world projects",
        desc: "Five-week projects bring learners into the role of designers, builders, researchers, and entrepreneurs.",
        image: "/images/stock/ImageSix.jpg",
      },
      {
        time: "Closing",
        activity: "Discuss, reflect, and grow",
        desc: "Socratic discussions and studio meetings strengthen communication, critical thinking, and community responsibility.",
        image: "/images/stock/ImageFour.jpg",
      },
    ],
  },
  socialProof: {
    type: "testimonials",
    eyebrow: "Hear from families",
    heading: "What parents are saying",
    subtitle:
      "Short excerpts from publicly shared family feedback — full testimonials available on request.",
    items: [
      {
        quote: "The first place my daughter has ever truly flourished.",
        name: "Acton Academy Pittsburgh parent",
        detail: "Wexford, PA",
        stars: 5,
        avatar: "/images/stock/ImageTen.jpg",
      },
      {
        quote: "The best part? He looked forward to school every day.",
        name: "Acton Academy Pittsburgh parent",
        detail: "Wexford, PA",
        stars: 5,
        avatar: "/images/stock/ImageSeven.jpg",
      },
      {
        quote: "This school is teaching character and integrity.",
        name: "Acton Academy Pittsburgh parent",
        detail: "Wexford, PA",
        stars: 5,
        avatar: "/images/stock/ImageEight.jpg",
      },
    ],
  },
  founder: {
    eyebrow: "Meet the founders",
    heading: "Built by parents who",
    headingAccent: "wanted more for their own children.",
    paragraphs: [
      "Ronnie and Meghan Esposito created Acton Academy Pittsburgh after searching for an education that could honor the different strengths, interests, and passions of each of their three children.",
      "They wanted a place where curiosity was protected, character mattered, and young people could be trusted with real responsibility. Today, they serve families who believe children are capable of far more than most adults imagine.",
    ],
    credentials: [
      "Parents of three children",
      "Founded Acton Academy Pittsburgh",
      "Learner-driven education advocates",
      "Wexford, Pennsylvania",
    ],
    quote:
      "We believe young people are capable of far more than most adults imagine — and we built Acton to prove it.",
    quoteAttribution: "— Ronnie & Meghan Esposito",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Founded", value: "Acton" },
    name: "Ronnie & Meghan Esposito",
    title: "Co-Founders, Acton Academy Pittsburgh",
  },
  parallax: {
    eyebrow: "Tuition & scholarships",
    heading: ["An investment in your", "child's future."],
    subtitle:
      "Annual tuition of $11,500 per child, with scholarships up to $6,000 and a 10% sibling discount for two or more enrolled children. Tuition and eligibility should be confirmed directly with the school.",
    primaryCta: "Estimate Your Tuition",
    secondaryCta: "Book a Call",
    backgroundImage: "/images/stock/ImageTwo.jpg",
  },
  pillars: {
    eyebrow: "What makes Acton different",
    heading: "Foundations for a life of purpose.",
    subtitle:
      "Beyond self-paced academics and real projects, Acton builds character, community, and the skills young people need beyond the classroom.",
    items: [
      {
        icon: "bookOpen",
        title: "Strong academic foundations",
        desc: "Reading, writing, and math supported through Montessori materials and adaptive learning programs.",
      },
      {
        icon: "users",
        title: "Belong to a community",
        desc: "Learners grow alongside peers, guides, and families who support their journey.",
      },
      {
        icon: "award",
        title: "Practice real leadership",
        desc: "Studio roles, community problem-solving, and apprenticeships build leadership in action.",
      },
      {
        icon: "heart",
        title: "Families stay connected",
        desc: "Regular updates on progress and growth — without traditional nightly homework filling evenings.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Start with a conversation. Ask questions, learn how the studios work, and decide together whether the learner-driven model is the right fit.",
    sidebarImage: "/images/stock/ImageSeven.jpg",
    eyebrow: "Book a call",
    heading: "See whether Acton could be the right fit.",
    description:
      "Share your learner's age, studio interest, and any questions. Our team will follow up to schedule a low-pressure conversation about enrollment and next steps.",
    submitLabel: "Book a Call",
    disclaimer:
      "Acton Academy Pittsburgh · 3500 Brooktree Road, Wexford, PA 15090 · Currently accepting applications for Pre-K–8th.",
    trustNote:
      "This is a demo inquiry form. In production, responses would route to your admissions team.",
    successEmoji: "✓",
    successTitle: "Inquiry received!",
    successMessage:
      "Thank you for your interest in Acton Academy Pittsburgh. We'll be in touch soon to schedule a conversation about studio fit and enrollment.",
    programOptions: [
      { value: "spark", label: "Spark Studio (ages 4–7)" },
      { value: "elementary", label: "Elementary Studio (ages 8–11)" },
      { value: "middle", label: "Middle School Studio (ages 12–15)" },
      { value: "launchpad", label: "Launchpad Studio (coming soon)" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Learner's Name",
      gradePlaceholder: "Select learner's age/grade...",
      gradeOptions: [
        { value: "prek", label: "Pre-K (age 4–5)" },
        { value: "k", label: "Kindergarten" },
        { value: "1-3", label: "Grades 1–3" },
        { value: "4-5", label: "Grades 4–5" },
        { value: "6-8", label: "Grades 6–8" },
        { value: "9-12", label: "Grades 9–12 (Launchpad — coming soon)" },
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions families ask",
    subtitle:
      "New to Acton Academy Pittsburgh? Here are the most common things families want to know before booking a call.",
    items: [
      {
        q: "Is Acton a Montessori school?",
        a: "Acton respects and incorporates Maria Montessori's philosophy — especially in Spark Studio — but is not a Montessori school. It is a learner-driven model with self-paced academics, projects, and Socratic discussion.",
      },
      {
        q: "What grades are you currently enrolling?",
        a: "Acton Academy Pittsburgh is currently accepting applications for Pre-K through 8th grade. Launchpad Studio for ages 16–18 is coming soon. Ask about current openings for your learner's age.",
      },
      {
        q: "What is the school schedule?",
        a: "The school year typically starts in late August and closes in early June. Contact the school for current studio schedules and calendar details.",
      },
      {
        q: "What does tuition cost?",
        a: "Annual tuition is $11,500 per child. Eligible families may receive up to $6,000 in scholarship support, and a 10% sibling discount applies for two or more enrolled children. Confirm current rates and eligibility with the school.",
      },
      {
        q: "Is Acton accredited?",
        a: "Acton Academy Pittsburgh is accredited through the International Association of Learner Driven Schools and is a Pennsylvania Licensed Private Academic School.",
      },
      {
        q: "What kind of learner thrives at Acton?",
        a: "Families often find Acton is a good fit for capable children who are bored, stressed, disengaged, or ready for more ownership and challenge than a traditional classroom provides.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Ready for the next step?",
    heading: "See whether Acton could be",
    headingAccent: "the right next step for your family.",
    description:
      "Start with a conversation. Ask questions, tour the campus, and decide together whether the learner-driven model is the right fit for your child.",
    primaryCta: "Book a 1:1 Call",
    secondaryCta: "Explore the Studios",
  },
  footer: {
    tagline:
      "Learner-driven education · Wexford, Pennsylvania · Preparing young people for life",
    links: [
      "How It Works",
      "Studios",
      "Tuition & Scholarships",
      "Meet the Founders",
      "FAQ",
      "Contact",
    ],
    copyright: "© 2026 Acton Academy Pittsburgh",
    poweredBy: "Website concept by MudKitchen",
  },
};
