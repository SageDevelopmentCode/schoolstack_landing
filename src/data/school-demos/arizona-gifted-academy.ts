import type { SchoolWebsiteDemoConfig } from "./types";
import { ARIZONA_GIFTED_ACADEMY_ADMIN_LOGO } from "./arizonagiftedacademy-admin-demo";

export const arizonaGiftedAcademyConfig: SchoolWebsiteDemoConfig = {
  slug: "arizona-gifted-academy",
  schoolName: "Arizona Gifted Academy",
  theme: {
    primary: "#E5A82E",
    primaryHover: "#C9921F",
    dark: "#1B3147",
    darkHover: "#008000",
    lightBg: "#F7EDD9",
    lightBorder: "#E8DFC8",
    muted: "#5A6570",
    badgeBg: "#F7EDD9",
    accentText: "#008000",
    pageBg: "#FEFAF5",
  },
  logo: ARIZONA_GIFTED_ACADEMY_ADMIN_LOGO,
  hero: {
    eyebrow: "Founding Families · PK–5 · Scottsdale, AZ · August 2026",
    eyebrowPlacement: "announcementBar",
    headline: ["Empower exceptional minds", "to thrive."],
    subheadline:
      "Arizona Gifted Academy is a boutique microschool in Scottsdale for gifted, curious, creative, and twice-exceptional PK–5 learners — with hybrid and full-time pathways designed for true intellectual peers.",
    primaryCta: "Inquire or Apply",
    secondaryCta: "Explore Pathways",
    secondaryCtaTarget: "signature",
    navCta: "Apply 2026–27",
    navLinks: ["Programs", "Our Story", "Admissions", "FAQ"],
    backgroundImage: "/images/stock/ImageTwo.jpg",
    floatingImages: ["/images/stock/ImageSeven.jpg", "/images/stock/ImageSix.jpg"],
    imageAlt: "Students learning in a small gifted education setting",
    trustBadges: ["ESA Eligible", "1:6 Ratio", "PK–5", "State-Registered Private School"],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "Beyond Core Academics",
    heading: "Depth, inquiry, and whole-child growth.",
    subtitle:
      "Strong foundations in mathematics, language arts, science, and history — plus distinctive courses that cultivate intellectual independence and executive functioning.",
    modes: [
      {
        label: "Thinking",
        title: "Logic & the Art of Thinking",
        desc: "Students develop reasoning, argumentation, and metacognitive skills through structured inquiry and discussion.",
        icon: "compass",
      },
      {
        label: "Executive Function",
        title: "Life Lab",
        desc: "Supporting executive functioning and self-directed learning — helping gifted learners manage intensity, focus, and growth.",
        icon: "graduationCap",
      },
      {
        label: "Exploration",
        title: "Advanced STEM & Mandarin",
        desc: "Deep intellectual exploration through advanced STEM work and Mandarin language study.",
        icon: "bookOpen",
      },
      {
        label: "Real World",
        title: "Entrepreneurship & Life Skills",
        desc: "Project-based inquiry, entrepreneurship, and life-skills development woven into the campus experience.",
        icon: "sparkles",
      },
    ],
    flexFriday: {
      title: "Extended Project Work",
      desc: "Students pursue personal interests in depth on campus — developing research, writing, and presentation skills with thoughtful academic oversight.",
    },
  },
  stats: [
    { value: "1:6", label: "Teacher-to-Student Ratio" },
    { value: "PK–5", label: "Primary Grades" },
    { value: "Scottsdale", label: "Heart of Scottsdale" },
    { value: "ESA", label: "Eligible" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Is AGA Right for Your Child?",
    heading: "For young scholars whose curiosity runs deep.",
    cards: [
      {
        title: "Gifted or twice-exceptional",
        desc: "Students who benefit from intellectual peers, depth, and educators who understand asynchronous development.",
      },
      {
        title: "Asks thoughtful questions",
        desc: "Children who seek challenge, make unexpected connections, and pursue interests with unusual intensity.",
      },
      {
        title: "Needs flexibility or full immersion",
        desc: "Two meaningful pathways — a university-style hybrid or a five-day private school experience.",
      },
      {
        title: "Ready for individualized plans",
        desc: "Learning by ability and readiness, with weekly mentorship check-ins and project-based inquiry.",
      },
    ],
    mainImage: "/images/stock/ImageSeven.jpg",
    secondaryImage: "/images/stock/ImageEight.jpg",
  },
  marquee: [
    "Gifted Education",
    "2E Learners",
    "Individualized Plans",
    "Project-Based Inquiry",
    "ESA Eligible",
    "Scottsdale",
    "Hybrid & Full-Time",
    "PK–5",
    "1:6 Ratio",
    "Mandarin",
    "Advanced STEM",
    "Founding Families",
  ],
  programs: {
    eyebrow: "Program Options",
    heading: "Two pathways. One intimate community.",
    subtitle: "Click each option to explore what enrollment looks like for your family.",
    ctaLabel: "Learn More",
    items: [
      {
        badge: "Hybrid",
        title: "University-Style Hybrid",
        teaser: "Twice weekly on campus — Mon & Wed",
        desc: "Students attend campus twice each week for collaborative learning, project work, discussion, and academic mentorship. On alternate days, families guide learning at home with teacher support — ideal for deep interests, athletics, or artistic training.",
        details: ["PK–5", "Mon & Wed", "9 AM – 2 PM", "$780/mo · $7,800/yr"],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#1B3147]",
        accentBg: "bg-[#F7EDD9]",
      },
      {
        badge: "Full-Time",
        title: "Five-Day Private School",
        teaser: "Complete campus experience — Mon through Fri",
        desc: "A fully immersive academic experience where students engage daily in individualized learning, collaborative projects, and rich intellectual exploration among true peers.",
        details: ["PK–5", "Mon–Fri", "9 AM – 2 PM", "$1,725/mo · $17,250/yr"],
        image: "/images/stock/ImageSix.jpg",
        accent: "text-[#008000]",
        accentBg: "bg-[#F7EDD9]",
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
      "We exist for young scholars who ask thoughtful questions,",
      "seek intellectual challenge, and thrive among true peers.",
    ],
    attribution: "Empower exceptional minds to thrive.",
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
    heading: "Warm, calm, and intellectually",
    headingSub: "engaging from morning to afternoon.",
    steps: [
      {
        time: "Morning",
        activity: "Mentorship Check-In",
        desc: "Weekly mentorship check-ins and reflections — teachers support progress, interests, and challenges as students grow.",
        image: "/images/stock/ImageEleven.jpg",
      },
      {
        time: "Core Block",
        activity: "Ability-Grouped Academics",
        desc: "Core studies in mathematics, language arts, science, and history — grouped by readiness rather than age alone.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "Midday",
        activity: "Project-Based Inquiry",
        desc: "Extended project work and thematic units that connect ideas across disciplines with thoughtful academic oversight.",
        image: "/images/stock/ImageSeven.jpg",
      },
      {
        time: "Afternoon",
        activity: "Distinctive Courses",
        desc: "Logic & the Art of Thinking, Life Lab, advanced STEM, Mandarin, and entrepreneurship — depth beyond the core.",
        image: "/images/stock/ImageSix.jpg",
      },
      {
        time: "Outdoor",
        activity: "Courtyard & Lawn Learning",
        desc: "Natural movement between focused work, collaborative learning, and outdoor exploration on a warm Scottsdale campus.",
        image: "/images/stock/ImageFour.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Trust & Credibility",
    heading: "Built for gifted learners. Designed with care.",
    subtitle:
      "Arizona Gifted Academy brings together gifted education expertise, intentionally small cohorts, and a community-oriented admissions process.",
    items: [
      {
        title: "ESA Eligible",
        desc: "A state-registered private school that accepts Arizona Empowerment Scholarship Account funds toward tuition.",
        icon: "shield",
      },
      {
        title: "1:6 Teacher-to-Student Ratio",
        desc: "An extraordinarily personal level of attention, mentorship, and academic guidance rarely possible in traditional settings.",
        icon: "award",
      },
      {
        title: "Founding Families",
        desc: "Limited founding cohort tuition for families joining AGA's inaugural PK–5 community in 2026–27.",
        icon: "graduationCap",
      },
    ],
  },
  founder: {
    eyebrow: "Our Founders",
    heading: "Built by parents who searched",
    headingAccent: "for something better.",
    paragraphs: [
      "Arizona Gifted Academy began as a conversation among Phoenix-area families — physicians, attorneys, engineers, entrepreneurs, and a former classroom teacher turned gifted education consultant — who kept finding one another through a shared experience: their children were naturally curious and intellectually advanced, yet local schools could not meet their needs.",
      "After years of searching, studying gifted education research, and visiting schools designed for exceptional learners across the country, these families set out to build the kind of school they wished had existed for their own children.",
    ],
    credentials: [
      "Gifted Education Expertise",
      "Parent-Founded Community",
      "Research-Informed Practices",
      "Scottsdale, Arizona",
    ],
    quote:
      "Our goal is to cultivate thoughtful, self-directed learners who develop strong executive functioning skills, intellectual independence, and a lasting love of ideas.",
    quoteAttribution: "— Arizona Gifted Academy",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Founding", value: "2026–27 Cohort" },
    name: "Founding Families",
    title: "Parents & Gifted Education Leaders",
  },
  parallax: {
    eyebrow: "Why AGA",
    heading: ["Intimate. Rigorous.", "Known."],
    subtitle:
      "Small by design. Selective by intention. An environment where gifted and twice-exceptional learners feel challenged, understood, and deeply engaged.",
    primaryCta: "Inquire or Apply",
    secondaryCta: "Submit an Inquiry",
    backgroundImage: "/images/stock/ImageNine.jpg",
  },
  pillars: {
    eyebrow: "What Makes AGA Different",
    heading: "Four pillars. One exceptional learner.",
    subtitle:
      "Individualized plans, intellectual peers, project-based inquiry, and flexible pathways — woven into every day on campus.",
    items: [
      {
        icon: "bookOpen",
        title: "Individualized Learning Plans",
        desc: "Each student receives a plan tailored to their strengths, pace, and passions — grouped by readiness, not age alone.",
      },
      {
        icon: "users",
        title: "True Intellectual Peers",
        desc: "An intentionally selective community where curious, creative, and gifted learners learn alongside one another.",
      },
      {
        icon: "compass",
        title: "Project-Based Inquiry",
        desc: "Deep thematic units and extended projects that connect ideas across disciplines with academic oversight.",
      },
      {
        icon: "sparkles",
        title: "Flexible Pathways",
        desc: "University-style hybrid or five-day private school — two meaningful options for different family seasons.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Ready to find out if Arizona Gifted Academy is the right fit for your child?",
    sidebarImage: "/images/stock/ImageSeven.jpg",
    eyebrow: "Enrollment Open · 2026–27",
    heading: "Inquire or apply.",
    description:
      "Share a brief message about why your child may benefit from our learning community. If you have psychological evaluations indicating giftedness, if your child is a Davidson Young Scholar, or if there are other reasons you believe your child would thrive here, we encourage you to include that information.",
    submitLabel: "Submit Inquiry",
    disclaimer:
      "We'll respond promptly. If you don't hear from us quickly, please reach out at Hello@ArizonaGiftedAcademy.org.",
    successEmoji: "✓",
    successTitle: "Inquiry received!",
    successMessage:
      "Thank you for reaching out. We'll be in touch soon to discuss next steps for the 2026–27 academic year.",
    programOptions: [
      { value: "university-hybrid", label: "University-Style Hybrid" },
      { value: "five-day", label: "Five-Day Private School" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Student's Name",
      gradePlaceholder: "Select grade level...",
      gradeOptions: [
        { value: "pk", label: "Pre-Kindergarten" },
        { value: "k", label: "Kindergarten" },
        { value: "1", label: "1st Grade" },
        { value: "2", label: "2nd Grade" },
        { value: "3", label: "3rd Grade" },
        { value: "4", label: "4th Grade" },
        { value: "5", label: "5th Grade" },
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions families ask",
    subtitle:
      "New to gifted microschools? Here are the most common things parents want to know before applying.",
    items: [
      {
        q: "Is Arizona Gifted Academy a good fit for my child?",
        a: "AGA is designed for gifted, highly gifted, profoundly gifted, and twice-exceptional PK–5 learners who ask big questions, seek depth and acceleration, and thrive among intellectual peers. We thoughtfully consider each applicant to ensure strong alignment with our program.",
      },
      {
        q: "What is the difference between the hybrid and five-day programs?",
        a: "The University-Style Hybrid Program meets on campus Mondays and Wednesdays (9 AM – 2 PM), with guided learning at home on alternate days. The Five-Day Private School Program provides a full-time campus experience Monday through Friday. Both offer the same intimate community and individualized learning plans.",
      },
      {
        q: "Does AGA accept ESA funds?",
        a: "Yes. Arizona Gifted Academy is a state-registered private school and accepts Arizona Empowerment Scholarship Account (ESA) funds, allowing families to apply ESA support toward tuition.",
      },
      {
        q: "What is founding cohort tuition?",
        a: "Founding families joining AGA's initial cohorts receive preferred tuition: $6,900 annually for the University Model Program and $15,500 annually for the Full-Time Program. Founding tuition is available to a limited number of students.",
      },
      {
        q: "What grades does AGA serve?",
        a: "Arizona Gifted Academy serves PK–5 learners. The inaugural 2026–27 community begins August 2026 in Scottsdale, Arizona.",
      },
      {
        q: "What is the teacher-to-student ratio?",
        a: "AGA maintains cohorts with ratios no greater than 1:9, with a target teacher-to-student ratio of 1:6 — allowing extraordinary personal attention and mentorship.",
      },
      {
        q: "Where is the campus located?",
        a: "AGA's founding campus is located within the private grounds of a beautiful church property in Scottsdale. To preserve privacy and safety, the exact address is shared with prospective families during the admissions process.",
      },
      {
        q: "What is the admissions process?",
        a: "Submit an inquiry through our website or contact Hello@ArizonaGiftedAcademy.org directly. We invite families to share why their child may benefit from our community, including any gifted evaluations or relevant background.",
      },
    ],
  },
  closingCta: {
    eyebrow: "2026–27 Founding Families",
    heading: "Ready to find out if AGA",
    headingAccent: "is the right fit?",
    description:
      "Enrollment for the 2026–2027 academic year is now open. Space is intentionally limited to preserve the quality, care, and integrity of the learning experience.",
    primaryCta: "Inquire or Apply",
    secondaryCta: "Submit an Inquiry",
  },
  footer: {
    tagline: "A boutique microschool for gifted, curious, and twice-exceptional PK–5 learners.",
    links: ["Programs", "Our Story", "Admissions", "FAQ", "Contact"],
    copyright: "© 2026 Arizona Gifted Academy",
    poweredBy: "Website concept by MudKitchen",
  },
};
