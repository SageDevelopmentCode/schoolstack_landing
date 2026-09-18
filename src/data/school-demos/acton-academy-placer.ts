import type { SchoolWebsiteDemoConfig } from "./types";
import { ACTON_ACADEMY_PLACER_LOGO } from "./acton-academy-placer-admin-demo";

export const actonAcademyPlacerConfig: SchoolWebsiteDemoConfig = {
  slug: "acton-academy-placer",
  schoolName: "Acton Academy Placer",
  theme: {
    primary: "#183E35",
    primaryHover: "#102820",
    dark: "#183E35",
    darkHover: "#102820",
    lightBg: "#F6F0E4",
    lightBorder: "#E4EAE2",
    muted: "#7A9676",
    badgeBg: "rgba(24, 62, 53, 0.12)",
    accentText: "#B8623E",
    pageBg: "#F6F0E4",
  },
  logo: ACTON_ACADEMY_PLACER_LOGO,
  hero: {
    eyebrow: "A LEARNER-DRIVEN EDUCATION IN THE SACRAMENTO–PLACER REGION",
    eyebrowPlacement: "announcementBar",
    headline: ["What if school helped", "your child come alive?"],
    headlineAccentLine: 1,
    subheadline:
      "At Acton Academy Placer, young people take ownership of meaningful work, discover what they are capable of, and begin a Hero's Journey toward a calling that can change the world.",
    primaryCta: "Attend a Parent Info Session",
    secondaryCta: "Get the Free Parent Guide",
    secondaryCtaTarget: "form",
    navCta: "Attend an Info Session",
    navLinks: [
      "Why Acton",
      "Studios",
      "Campuses",
      "Learning Design",
      "FAQ",
    ],
    backgroundImage: "/images/stock/ImageTwo.jpg",
    floatingImages: ["/images/stock/ImageSeven.jpg", "/images/stock/ImageSix.jpg"],
    imageAlt: "Young learners collaborating on a hands-on project outdoors",
    trustBadges: [
      "Roseville",
      "Sacramento",
      "Rocklin",
      "Ages 4–18",
    ],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "What makes Acton different",
    heading: "A learner-driven community built for real growth.",
    subtitle:
      "Young people do challenging work at their own pace, collaborate on real projects, and grow in a tightly bound community — on a Hero's Journey with challenges, mentors, and reflection.",
    modes: [
      {
        label: "Pace",
        title: "Self-paced challenge",
        desc: "Learners pursue ambitious goals at a pace that fits their growth — building real understanding before moving forward.",
        icon: "compass",
      },
      {
        label: "Projects",
        title: "Real-world projects",
        desc: "Learning comes alive through hands-on quests, creating, building, and solving problems that matter.",
        icon: "sparkles",
      },
      {
        label: "Mastery",
        title: "Mastery that is visible",
        desc: "Effort, progress, and mastery are recognized — not hidden behind a single grade.",
        icon: "award",
      },
      {
        label: "Community",
        title: "A true community",
        desc: "Learners practice accountability, collaboration, and encouragement together every day.",
        icon: "users",
      },
      {
        label: "Technology",
        title: "Technology with purpose",
        desc: "Adaptive tools support focused mastery in reading, writing, and math.",
        icon: "bookOpen",
      },
      {
        label: "Journey",
        title: "A Hero's Journey",
        desc: "Every learner faces challenges, grows in courage, and discovers gifts worth sharing.",
        icon: "graduationCap",
      },
    ],
  },
  stats: [
    { value: "Roseville", label: "Downtown Roseville campus" },
    { value: "Sacramento", label: "Near Arden Arcade / Carmichael" },
    { value: "Rocklin", label: "Old Town Rocklin District" },
    { value: "Ages 4–18", label: "Four studio pathways" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Is this the right kind of school?",
    heading: "You are not looking for more worksheets. You are looking for a place where your child is known.",
    cards: [
      {
        title: "Learn at the right pace",
        desc: "My child deserves to learn at a pace that challenges them — not hold them back or rush them ahead.",
      },
      {
        title: "Build confidence, not compliance",
        desc: "I want learning to build confidence, not compliance — with real ownership over their work.",
      },
      {
        title: "Prepare for a meaningful life",
        desc: "I want school to prepare my child for a meaningful life, not just the next test.",
      },
    ],
    mainImage: "/images/stock/ImageSeven.jpg",
    secondaryImage: "/images/stock/ImageSix.jpg",
  },
  marquee: [
    "Learner-Driven",
    "Ordinary World",
    "Cross the Threshold",
    "Meet the Mentor",
    "Approach",
    "Challenge / Ordeal",
    "Reward",
    "Return",
    "Self-Paced",
    "Real Projects",
    "Socratic Discussion",
    "Roseville",
    "Sacramento",
    "Rocklin",
    "Spark Studio",
    "Threshold Studio",
    "Discovery Studio",
    "Launchpad Studio",
    "Attend an Info Session",
    "Get the Parent Guide",
  ],
  programs: {
    eyebrow: "One journey. Four studios.",
    heading: "A place to grow at every stage.",
    subtitle:
      "Every young person follows a unique path. Acton studios meet learners where they are while gradually increasing challenge, responsibility, and real-world application.",
    ctaLabel: "Explore Your Child's Studio",
    items: [
      {
        badge: "Ages 4–8",
        title: "Spark Studio",
        teaser: "Curiosity takes root",
        desc: "Play, foundational skills, independence, and nature-rich exploration through Montessori-inspired workstations, outdoor discovery, and hands-on learning.",
        details: [
          "Ages 4–8",
          "TK entry required",
          "Nature-rich exploration",
          "Independence and curiosity",
        ],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#183E35]",
        accentBg: "bg-[#F6F0E4]",
      },
      {
        badge: "Ages 7–11",
        title: "Threshold Studio",
        teaser: "The adventure begins",
        desc: "Goal-setting, hands-on learning, belonging, and brave questions — building the foundations for a learner-driven journey.",
        details: [
          "Ages 7–11",
          "Goal-setting and core foundations",
          "Project-based learning",
          "Brave questions welcome",
        ],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#7A9676]",
        accentBg: "bg-[#F6F0E4]",
      },
      {
        badge: "Ages 11–14",
        title: "Discovery Studio",
        teaser: "Skills meet purpose",
        desc: "Core mastery, Socratic discussion, immersive quests, exhibitions, and apprenticeships — where skills meet real purpose.",
        details: [
          "Ages 11–14",
          "Socratic discussion",
          "Immersive quests and exhibitions",
          "Apprenticeships begin",
        ],
        image: "/images/stock/ImageFour.jpg",
        accent: "text-[#B8623E]",
        accentBg: "bg-[#F6F0E4]",
      },
      {
        badge: "Ages 14–18",
        title: "Launchpad Studio",
        teaser: "Find the work only you can do",
        desc: "Apprenticeships, leadership, deep thinking, real-world challenges, and calling — preparing for a life of purpose and responsibility.",
        details: [
          "Ages 14–18",
          "Apprenticeships and leadership",
          "Deep thinking and real-world challenges",
          "Discover your calling",
        ],
        image: "/images/stock/Homeschool3.jpg",
        accent: "text-[#E3B655]",
        accentBg: "bg-[#F6F0E4]",
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
      "A meaningful education does not remove every hard thing.",
      "It gives young people the tools, community, and courage to meet hard things well.",
    ],
    attribution: "— The Hero's Journey at Acton Academy Placer",
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
    heading: "Learning that looks",
    headingSub: "like real life.",
    steps: [
      {
        time: "Step 1",
        activity: "Set a goal",
        desc: "Learners arrive, set daily goals, and choose their work — guided by guides who support without directing every step.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "Step 2",
        activity: "Do focused work",
        desc: "Reading, writing, and math through adaptive programs and hands-on materials — mastery before moving on.",
        image: "/images/stock/ImageSeven.jpg",
      },
      {
        time: "Step 3",
        activity: "Ask better questions",
        desc: "Socratic discussions strengthen critical thinking, communication, and the ability to articulate ideas clearly.",
        image: "/images/stock/ImageSix.jpg",
      },
      {
        time: "Step 4",
        activity: "Build something real",
        desc: "Hands-on quests bring learners into the role of designers, builders, researchers, and entrepreneurs.",
        image: "/images/stock/ImageFour.jpg",
      },
      {
        time: "Step 5",
        activity: "Share it with others",
        desc: "Exhibitions and presentations give learners a real audience — building confidence and communication skills.",
        image: "/images/stock/ImageEleven.jpg",
      },
      {
        time: "Step 6",
        activity: "Reflect, improve, and go again",
        desc: "Studio meetings and peer accountability strengthen reflection, growth mindset, and community responsibility.",
        image: "/images/stock/ImageTwelve.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Our mission and beliefs",
    heading: "Inspiring each person to find a calling that will change the world.",
    subtitle:
      "Acton Academy Placer is built on beliefs that honor each learner's gifts, freedom, and capacity for growth.",
    items: [
      {
        title: "Every person has a gift",
        desc: "We believe each person has a gift that can change the world in a profound way.",
        icon: "sparkles",
      },
      {
        title: "Learn to learn, do, and be",
        desc: "We believe in learning to learn, learning to do, and learning to be — not just memorizing facts.",
        icon: "bookOpen",
      },
      {
        title: "A family of lifelong learners",
        desc: "We believe in a closely connected family of lifelong learners who support one another.",
        icon: "users",
      },
      {
        title: "Freedom with responsibility",
        desc: "We believe in economic, political, and religious freedom — and the responsibility that comes with it.",
        icon: "shield",
      },
    ],
  },
  founder: {
    eyebrow: "Our mission",
    heading: "We believe every young person",
    headingAccent: "has a gift that can change the world.",
    paragraphs: [
      "Our work is to create the freedom, challenge, and community young people need to find it.",
      "Through Socratic guiding and experiential learning, we encourage each learner to begin a Hero's Journey — to become a curious, independent, lifelong learner who discovers their most precious gifts and learns to use them to serve others.",
    ],
    credentials: [
      "Learner-driven education",
      "Hero's Journey philosophy",
      "Three Placer region campuses",
      "Ages 4–18 across four studios",
    ],
    quote:
      "We believe clear thinking leads to good decisions, good decisions lead to the right habits, the right habits forge character, and character determines destiny.",
    quoteAttribution: "— Acton Academy Placer",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Mission", value: "Acton" },
    name: "Acton Academy Placer",
    title: "Learner-driven education in the Sacramento–Placer region",
  },
  parallax: {
    eyebrow: "Still exploring?",
    heading: ["Start with", "clarity."],
    subtitle:
      "Get the free Parent Guide: A Framework for Rethinking Education. See why one-size-fits-all education can disconnect children from learning — and explore how purpose, independence, and real-world readiness work together.",
    primaryCta: "Send Me the Parent Guide",
    secondaryCta: "Attend a Parent Info Session",
    backgroundImage: "/images/stock/ImageTwo.jpg",
  },
  pillars: {
    eyebrow: "Our promises",
    heading: "What we commit to every family.",
    subtitle:
      "Through Socratic guiding and experiential learning, we encourage your child to grow in courage, curiosity, and purpose.",
    items: [
      {
        icon: "compass",
        title: "Begin a Hero's Journey",
        desc: "Every learner faces challenges, grows in courage, and discovers gifts worth sharing with the world.",
      },
      {
        icon: "bookOpen",
        title: "Become a lifelong learner",
        desc: "Curious, independent, and capable of learning anything they set their mind to.",
      },
      {
        icon: "shield",
        title: "Cherish freedom and responsibility",
        desc: "A deep respect for economic, political, and religious freedoms — and the habits that sustain them.",
      },
      {
        icon: "heart",
        title: "Discover gifts to serve others",
        desc: "Find the work only they can do — and learn to use their gifts in service of others.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Start with clarity. The Parent Guide helps you compare educational models and identify the environment where your child could thrive.",
    sidebarImage: "/images/stock/ImageSeven.jpg",
    eyebrow: "Free Parent Guide",
    heading: "Still exploring? Start with clarity.",
    description:
      "Share your name, email, child's age range, and preferred campus. We'll send the free Parent Guide and follow up with info session details — no pressure.",
    submitLabel: "Send Me the Parent Guide",
    disclaimer:
      "Acton Academy Placer · Roseville, Sacramento & Rocklin campuses · Ages 4–18 · Confirm tuition and campus details directly with the school.",
    trustNote:
      "This is a demo inquiry form. In production, responses would route to your admissions team.",
    successEmoji: "✓",
    successTitle: "Guide on the way!",
    successMessage:
      "Thank you for your interest in Acton Academy Placer. We'll send the Parent Guide and follow up with info session details for your preferred campus.",
    programOptions: [
      { value: "spark", label: "Spark Studio (ages 4–8)" },
      { value: "threshold", label: "Threshold Studio (ages 7–11)" },
      { value: "discovery", label: "Discovery Studio (ages 11–14)" },
      { value: "launchpad", label: "Launchpad Studio (ages 14–18)" },
      { value: "unsure", label: "Not sure yet — help me find the right studio" },
    ],
    studentFields: {
      namePlaceholder: "Learner's Name",
      gradePlaceholder: "Select learner's age/grade...",
      gradeOptions: [
        { value: "tk", label: "TK (transitional kindergarten)" },
        { value: "k-2", label: "Kindergarten – 2nd grade" },
        { value: "3-5", label: "Grades 3–5" },
        { value: "6-8", label: "Grades 6–8" },
        { value: "9-12", label: "Grades 9–12" },
        { value: "roseville", label: "Preferred campus: Roseville" },
        { value: "sacramento", label: "Preferred campus: Sacramento" },
        { value: "rocklin", label: "Preferred campus: Rocklin" },
        { value: "campus-unsure", label: "Preferred campus: Not sure yet" },
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions families ask",
    subtitle:
      "New to Acton Academy Placer? Here are the most common things families want to know before attending an info session.",
    items: [
      {
        q: "What ages do you serve?",
        a: "Acton Academy Placer serves young people ages 4–18 across four studios: Spark (ages 4–8), Threshold (ages 7–11), Discovery (ages 11–14), and Launchpad (ages 14–18). TK entry is required for Spark Studio.",
      },
      {
        q: "What does learner-driven mean?",
        a: "Learners take ownership of their education — setting goals, managing their time, and pursuing meaningful work. Guides support each learner's journey through Socratic discussion and experiential learning, rather than lecturing or directing every step.",
      },
      {
        q: "Are there teachers, grades, or homework?",
        a: "Acton uses guides, not traditional teachers. Mastery and meaningful progress matter more than letter grades. Learning happens through purposeful work during the school day — not through nightly homework or busywork.",
      },
      {
        q: "Is this a Montessori school?",
        a: "Acton respects and incorporates Montessori-inspired elements — especially in Spark Studio — but is not a Montessori school. It is a learner-driven model with self-paced academics, real-world projects, and Socratic discussion.",
      },
      {
        q: "How do visits and auditions work?",
        a: "Prospective families typically begin with a parent info session, followed by a family meetup and learner audition day. These are part of the enrollment process rather than ordinary school-day tours. Contact the school to schedule.",
      },
      {
        q: "What is tuition?",
        a: "Publicly listed tuition is $11,500 per year for TK–8 and $13,500 per year for grades 9–12. Confirm current rates and any available support directly with the school before enrolling.",
      },
      {
        q: "Where are campuses located?",
        a: "Acton Academy Placer has three campuses in the Placer/Sacramento region: Roseville (Downtown Roseville), Sacramento (near Arden Arcade/Carmichael), and Rocklin (Old Town Rocklin District). Contact the school for exact campus locations.",
      },
      {
        q: "How long is the school year?",
        a: "Acton Academy Placer operates on an eleven-month calendar. Contact the school for the current academic calendar and studio schedules.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Ready for the next step?",
    heading: "Your child's next chapter can begin",
    headingAccent: "with one good question.",
    description:
      "See whether Acton Academy Placer is the place where your child can build confidence, take ownership, and discover a path that is truly their own. No pressure — start with a conversation.",
    primaryCta: "Attend a Parent Info Session",
    secondaryCta: "Get the Parent Guide",
  },
  footer: {
    tagline:
      "Learner-driven education · Roseville, Sacramento & Rocklin · Preparing young people for a life of purpose",
    links: [
      "Why Acton",
      "Studios",
      "Campuses",
      "Learning Design",
      "FAQ",
      "Contact",
    ],
    copyright: "© 2026 Acton Academy Placer",
    poweredBy: "Website concept by MudKitchen",
  },
};
