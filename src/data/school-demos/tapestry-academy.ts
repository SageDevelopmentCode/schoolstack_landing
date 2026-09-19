import type { SchoolWebsiteDemoConfig } from "./types";
import { TAPESTRY_ACADEMY_LOGO } from "./tapestry-academy-admin-demo";

export const tapestryAcademyConfig: SchoolWebsiteDemoConfig = {
  slug: "tapestry-academy",
  schoolName: "Tapestry Academy",
  theme: {
    primary: "#173B52",
    primaryHover: "#0F2A3C",
    dark: "#173B52",
    darkHover: "#0F2A3C",
    lightBg: "#F3E7CE",
    lightBorder: "#E9DFC9",
    muted: "#66737A",
    badgeBg: "rgba(46, 125, 123, 0.12)",
    accentText: "#2E7D7B",
    pageBg: "#FCFBF7",
  },
  logo: TAPESTRY_ACADEMY_LOGO,
  hero: {
    eyebrow: "Now enrolling for 2026–27 · East Boca Raton, FL",
    eyebrowPlacement: "announcementBar",
    headline: [
      "A learning community where",
      "your child can grow with confidence.",
    ],
    subheadline:
      "Tapestry Academy offers flexible, personalized learning for students in Grades K–12—combining focused academics, hands-on projects, mentorship, and meaningful friendships.",
    primaryCta: "Schedule a Virtual Call",
    secondaryCta: "Explore Programs",
    secondaryCtaTarget: "programs",
    navCta: "Schedule a Virtual Call",
    navLinks: ["Programs", "About", "Enrollment", "Events", "FAQ", "Contact"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/Homeschool3.jpg"],
    imageAlt: "Students collaborating on a hands-on project at Tapestry Academy",
    trustBadges: [
      "Grades K–12",
      "Step Up Scholarships",
      "Flexible Scheduling",
      "East Boca Raton",
    ],
    tagline: "Flexible microschool and homeschool programs in South Florida.",
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "How learning works",
    heading: "Built around the whole learner.",
    subtitle:
      "Personalized goals, blended learning, and project-based experiences help students grow with purpose—not just pass tests.",
    modes: [
      {
        label: "Personalization",
        title: "Personalized learning",
        desc: "Students help shape learning goals with support from online tools and mentors who know their strengths, interests, and pace.",
        icon: "compass",
      },
      {
        label: "Blended",
        title: "Blended learning",
        desc: "Technology works alongside peer interaction and meaningful guidance—focused academics balanced with collaboration and creative exploration.",
        icon: "bookOpen",
      },
      {
        label: "Projects",
        title: "Project-based learning",
        desc: "Individual and group work connects learning to real life—building communication, creativity, ingenuity, and confidence through authentic experiences.",
        icon: "sparkles",
      },
      {
        label: "Community",
        title: "Room to move and create",
        desc: "Outdoor time, movement, and small-group community give learners space to build friendships and contribute beyond the classroom.",
        icon: "users",
      },
    ],
    flexFriday: {
      title: "Friday Enrichment Day",
      desc: "A full day of hands-on learning, creative projects, and friendships for homeschool families—ideal for ages 5–8 and 7–14 seeking community and support.",
    },
  },
  stats: [
    { value: "K–12", label: "Grades served" },
    { value: "2–4 days", label: "Flexible microschool" },
    { value: "Est. 2018", label: "Serving families" },
    { value: "Step Up", label: "Scholarships accepted" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Designed for families looking for",
    heading: "More curiosity. Less stress. Real learning.",
    cards: [
      {
        title: "Known and supported",
        desc: "Every learner is valued for their strengths, interests, and goals—in a small, supportive community where children feel seen.",
      },
      {
        title: "Learning with purpose",
        desc: "Projects, portfolios, diagnostics, and authentic experiences show real growth—not just worksheets and test scores.",
      },
      {
        title: "Confidence through independence",
        desc: "Students set goals, take ownership, and build responsibility in a student-centered environment.",
      },
      {
        title: "Community that matters",
        desc: "Learners build friendships and families find a supportive local network in East Boca Raton and nearby South Florida communities.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/Homeschool3.jpg",
  },
  marquee: [
    "Microschool",
    "Friday Enrichment",
    "Homeschool Commons",
    "Boca Raton",
    "Project-Based Learning",
    "Step Up Scholarships",
    "Personalized Learning",
    "Grades K–12",
    "Flexible Scheduling",
    "Schedule a Virtual Call",
    "Valiant Hearts and Minds",
    "Learn Create Connect",
  ],
  programs: {
    eyebrow: "Programs",
    heading: "Find the right rhythm for your family.",
    subtitle:
      "From a few meaningful days each week to a full homeschool community, Tapestry gives families flexible ways to learn, create, and connect.",
    ctaLabel: "Schedule a Virtual Call",
    items: [
      {
        badge: "Microschool",
        title: "Tapestry Academy Microschool",
        teaser: "Grades K–12 · 2- to 4-day personalized learning",
        desc: "A personalized microschool experience focused on academics, projects, mentorship, and community—with flexible scheduling that fits real family life.",
        details: [
          "Grades K–12",
          "2–4 days/week",
          "Personalized plans",
          "Small cohorts",
        ],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#173B52]",
        accentBg: "bg-[#F3E7CE]",
      },
      {
        badge: "Friday",
        title: "Friday Enrichment Day",
        teaser: "Ages 5–8 & 7–14 · Full day of hands-on learning",
        desc: "A full day of hands-on learning, creative projects, and friendships—ideal for homeschool families seeking community, support, and meaningful connection.",
        details: [
          "Ages 5–8 & 7–14",
          "Fridays",
          "Hands-on projects",
          "Homeschool families",
        ],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#2E7D7B]",
        accentBg: "bg-[#F3E7CE]",
      },
      {
        badge: "Commons",
        title: "Tapestry Homeschool Commons",
        teaser: "Ages 5–18 · Weekly homeschool community",
        desc: "A weekly community of enrichment, life skills, STEM, creative arts, and hands-on learning—bringing together enrichment providers, activities, and flexible participation.",
        details: [
          "Ages 5–18",
          "Weekly community",
          "STEM & creative arts",
          "Flexible participation",
        ],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#D46E52]",
        accentBg: "bg-[#F3E7CE]",
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
      "Learn, create, and build",
      "meaningful friendships.",
    ],
    attribution: "— Tapestry Academy",
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
    eyebrow: "Getting started",
    heading: "Getting started is personal",
    headingSub: "and simple.",
    steps: [
      {
        time: "Step 1",
        activity: "Share your interest",
        desc: "Tell us about your child, your family's goals, and which program might be the best fit.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "Step 2",
        activity: "Schedule a tour",
        desc: "Visit the learning environment and see how Tapestry's community comes together.",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        time: "Step 3",
        activity: "Meet the family and learner",
        desc: "A conversation with our team to understand your child's strengths, interests, and learning style.",
        image: "/images/stock/Homeschool3.jpg",
      },
      {
        time: "Step 4",
        activity: "Experience a shadow day",
        desc: "Your child spends time in the community to see if Tapestry feels like the right fit.",
        image: "/images/stock/ImageFour.jpg",
      },
      {
        time: "Step 5",
        activity: "Complete enrollment",
        desc: "If it's the right fit, complete enrollment and join the Tapestry learning community.",
        image: "/images/stock/ImageTwo.jpg",
      },
    ],
  },
  socialProof: {
    type: "testimonials",
    eyebrow: "What families are saying",
    heading: "Voices from our community",
    subtitle:
      "Families who have found belonging, confidence, and a better way to learn.",
    items: [
      {
        quote:
          "Every member of the staff is caring, attentive, and genuinely invested in each child.",
        name: "Stella",
        detail: "Grandmother",
        stars: 5,
        avatar: "/images/stock/ImageTen.jpg",
      },
      {
        quote:
          "We realized there is a fun way to learn—without writing tests every other day and doing homework after being in school for 7 hours.",
        name: "Alina",
        detail: "Parent",
        stars: 5,
        avatar: "/images/stock/ImageSeven.jpg",
      },
      {
        quote:
          "No stress. Just learning, fun, community and guidance. 5 star recommend checking out Tapestry Academy.",
        name: "Nataly",
        detail: "Parent",
        stars: 5,
        avatar: "/images/stock/ImageEight.jpg",
      },
    ],
  },
  founder: {
    eyebrow: "A place to belong at every stage",
    heading: "Valiant hearts and minds.",
    headingAccent: "Character and community.",
    paragraphs: [
      "At Tapestry, education includes strong academics and strong character. We cultivate curiosity, courage, integrity, compassion, stewardship, and respect as students learn to contribute to their communities.",
      "Tapestry Academy is a learning community where homeschooling families come together to learn, create, and build meaningful friendships—whether through our microschool, Friday enrichment, or homeschool commons.",
    ],
    credentials: [
      "Serving families since 2018",
      "Foundations · Middle · High School cohorts",
      "East Boca Raton, Florida",
      "Grades K–12",
    ],
    quote:
      "More curiosity. Less stress. Real learning.",
    quoteAttribution: "— Tapestry Academy",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "Boca Raton, FL" },
    name: "Tapestry Academy",
    title: "Microschool & Homeschool Programs",
  },
  parallax: {
    eyebrow: "A place to belong",
    heading: ["Foundations.", "Middle.", "High School."],
    subtitle:
      "Foundations Cohort (Ages 7–11), Middle Cohort (Ages 10–14), and High School Cohort (Ages 14–18)—each with a supportive community built for curiosity, confidence, and real-world growth.",
    primaryCta: "Find Your Child's Best Fit",
    secondaryCta: "Schedule a Virtual Call",
    backgroundImage: "/images/stock/ImageNine.jpg",
  },
  pillars: {
    eyebrow: "What makes Tapestry different",
    heading: "Personalized. Project-based. Community-led.",
    subtitle:
      "Small learning communities where students build independence, take ownership, and grow with purpose.",
    items: [
      {
        icon: "compass",
        title: "Personalized learning plans",
        desc: "Every student has a pathway shaped around their strengths, interests, and goals—not a one-size-fits-all curriculum.",
      },
      {
        icon: "users",
        title: "Small, multi-age communities",
        desc: "Student-centered environments where learners are known, supported, and encouraged to collaborate.",
      },
      {
        icon: "sparkles",
        title: "Project-based experiences",
        desc: "Real-world projects connect academics to creativity, communication, and authentic growth.",
      },
      {
        icon: "heart",
        title: "Flexible for your family",
        desc: "2- to 4-day microschool, Friday enrichment, and homeschool commons—options that fit real life.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "A brief conversation—no obligation. Schedule a virtual call and see if Tapestry feels like the right fit for your family.",
    sidebarImage: "/images/stock/Homeschool2.jpg",
    eyebrow: "Schedule a Virtual Call",
    heading: "Tell us about your family.",
    description:
      "Share your name, contact information, your child's age or grade, program interest, and what you're hoping will be different about your child's learning experience. We'll reach out to schedule a conversation.",
    submitLabel: "Begin with a Conversation",
    disclaimer:
      "1699 S. Federal Hwy, Suite 100, Boca Raton, FL 33432 · inspire@tapestryacademy.com · 561-287-6201",
    trustNote:
      "A brief conversation—no obligation. We'll help you explore whether Tapestry is the right next step.",
    successEmoji: "✓",
    successTitle: "Thank you — we'll be in touch soon.",
    successMessage:
      "Thank you for reaching out to Tapestry Academy. Our team will follow up to schedule a virtual call and answer your questions.",
    programOptions: [
      { value: "microschool", label: "Tapestry Academy Microschool" },
      { value: "friday-enrichment", label: "Friday Enrichment Day" },
      { value: "homeschool-commons", label: "Tapestry Homeschool Commons" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Student's Name",
      gradePlaceholder: "Student age or grade...",
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
      "New to Tapestry Academy? Here are the most common things families want to know before scheduling a virtual call.",
    items: [
      {
        q: "What programs does Tapestry offer?",
        a: "Tapestry Academy Microschool serves Grades K–12 with flexible 2- to 4-day schedules. Friday Enrichment Day is a full day of hands-on learning for ages 5–8 and 7–14. Tapestry Homeschool Commons is a weekly community for ages 5–18 with enrichment, STEM, and creative arts.",
      },
      {
        q: "How flexible is scheduling?",
        a: "Tapestry offers flexible 2- or 4-day microschool options, Friday enrichment for homeschool families, and weekly Homeschool Commons participation—designed to fit different ages, interests, and family rhythms.",
      },
      {
        q: "Do you accept scholarships?",
        a: "Tapestry Academy accepts Step Up Scholarships PEP and FES-UA. Contact Tapestry for current eligibility and program details.",
      },
      {
        q: "What is the enrollment process?",
        a: "Getting started is personal and simple: share your interest, schedule a tour, meet with our team, experience a shadow day, and complete enrollment if it's the right fit.",
      },
      {
        q: "Where do you serve families?",
        a: "Tapestry is based in East Boca Raton and serves families in Boca Raton, Delray Beach, Pompano Beach, Lighthouse Point, Boynton Beach, Lake Worth, West Palm Beach, and the greater Fort Lauderdale area.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Ready to explore?",
    heading: "Let's explore whether Tapestry",
    headingAccent: "is the right next step.",
    description:
      "Schedule a brief conversation with our team, ask questions, and learn how Tapestry can support your child's unique learning journey. Limited cohorts help keep the experience personal.",
    primaryCta: "Schedule a Virtual Call",
    secondaryCta: "Explore Programs",
  },
  footer: {
    tagline:
      "Tapestry Academy · 1699 S. Federal Hwy, Suite 100, Boca Raton, FL 33432 · inspire@tapestryacademy.com · 561-287-6201",
    links: ["Programs", "Enrollment", "Events", "FAQ", "Contact"],
    copyright: "© 2026 Tapestry Academy",
    poweredBy: "Website concept by MudKitchen",
  },
};
