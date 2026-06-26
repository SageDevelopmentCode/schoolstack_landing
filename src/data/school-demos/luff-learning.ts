import type { SchoolWebsiteDemoConfig } from "./types";
import { LUFF_LEARNING_LOGO } from "./luff-learning-admin-demo";

export const luffLearningConfig: SchoolWebsiteDemoConfig = {
  slug: "luff-learning",
  schoolName: "Luff Learning Fine Arts Academy",
  theme: {
    primary: "#769a61",
    primaryHover: "#5f824f",
    dark: "#644268",
    darkHover: "#1e141f",
    lightBg: "#f8f3e8",
    lightBorder: "#eeeeee",
    muted: "#718096",
    badgeBg: "rgba(118, 154, 97, 0.12)",
    accentText: "#644268",
    pageBg: "#ffffff",
  },
  logo: LUFF_LEARNING_LOGO,
  hero: {
    eyebrow: "Spring, TX · Fine Arts Academy · Enrolling Now",
    eyebrowPlacement: "announcementBar",
    headline: ["Discover the magic of learning", "through play(s)."],
    subheadline:
      "Luff Learning is a secular, inclusive fine arts academy and virtual microschool in Spring, Texas — designed for bright, creative students who thrive with ADHD-friendly structure, rigorous academics, and a place to truly belong.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Our Programs",
    secondaryCtaTarget: "programs",
    navCta: "Contact Us",
    navLinks: ["Programs", "Philosophy", "Testimonials", "FAQ"],
    backgroundImage: "/images/stock/ImageTwo.jpg",
    floatingImages: ["/images/stock/ImageSeven.jpg", "/images/stock/ImageSix.jpg"],
    imageAlt: "Students exploring theatre and creative learning",
    trustBadges: ["Secular", "Fine Arts", "ADHD-Friendly", "Spring, TX"],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "How Learning Works at Luff",
    heading: "Empathy, expression, structure, and belonging.",
    subtitle:
      "We weave fine arts into daily learning — theatre, music, and art — while prioritizing social-emotional growth and academically grounded, science-based instruction.",
    modes: [
      {
        label: "Empathy",
        title: "Social-Emotional Learning",
        desc: "We seek to understand in every interaction — building empathy, confidence, and authentic self-expression in a safe, supportive environment.",
        icon: "heart",
      },
      {
        label: "Expression",
        title: "Fine Arts Integration",
        desc: "Theatre, music, and art are woven into learning — not extras — so students discover, explore, and express themselves creatively.",
        icon: "sparkles",
      },
      {
        label: "Structure",
        title: "ADHD-Friendly Rhythm",
        desc: "Bright learners need structure that works with their minds — clear routines, individual attention, and process valued as much as progress.",
        icon: "compass",
      },
      {
        label: "Belonging",
        title: "A Place to Belong",
        desc: "Students are loved and valued no matter their level — a community center where families feel safe to be their most authentic selves.",
        icon: "users",
      },
    ],
    flexFriday: {
      title: "Fine Arts Friday",
      desc: "Explore theatre, music, and art every week — all ages welcome. Performers under 10 audition; everyone else jumps in and creates.",
    },
  },
  stats: [
    { value: "Spring, TX", label: "Community Center" },
    { value: "Virtual", label: "Academy Option" },
    { value: "Fine Arts", label: "Daily Integration" },
    { value: "SEL", label: "Core Priority" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Is Luff Learning Right for Your Family?",
    heading: "For bright, creative learners who need more than traditional school allows.",
    cards: [
      {
        title: "Bright ADHD learners",
        desc: "Designed for students who are capable of more — with ADHD-friendly structure, individual attention, and a place to truly belong.",
      },
      {
        title: "Creativity-first families",
        desc: "Want theatre, music, and art woven into learning — not treated as extras? Fine arts are the vehicle for academic and emotional growth.",
      },
      {
        title: "Seeking belonging",
        desc: "Looking for a secular, inclusive community where your child feels comfortable, supported, and excited to learn again?",
      },
      {
        title: "Hybrid & virtual options",
        desc: "From our Virtual Academy to in-person programs like AEP and Creative Dramatics — pathways for middle and high school learners.",
      },
    ],
    mainImage: "/images/stock/ImageSeven.jpg",
    secondaryImage: "/images/stock/ImageSix.jpg",
  },
  marquee: [
    "Seek to Understand",
    "Fine Arts Academy",
    "Spring, Texas",
    "Virtual Academy",
    "Creative Dramatics",
    "Fine Arts Friday",
    "Artistic Evolution",
    "Social-Emotional Learning",
    "Secular & Inclusive",
    "ADHD-Friendly",
    "Schedule a Tour",
    "Contact Us",
  ],
  programs: {
    eyebrow: "Our Programs",
    heading: "Pathways for every creative learner",
    subtitle: "Click each program to explore what enrollment at Luff Learning looks like.",
    ctaLabel: "Schedule a Tour",
    items: [
      {
        badge: "Virtual",
        title: "Virtual Academy",
        teaser: "Middle school · ADHD-friendly · rigorous academics",
        desc: "Luff Learning Virtual Academy is a secular, inclusive virtual microschool where middle school students receive rigorous academics, ADHD-friendly structure, and a place to truly belong.",
        details: ["Middle School", "Virtual", "ADHD-Friendly", "Rigorous Academics"],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#769a61]",
        accentBg: "bg-[#f8f3e8]",
      },
      {
        badge: "Hybrid",
        title: "Artistic Evolution Program (AEP)",
        teaser: "Private hybrid for middle & high school",
        desc: "A private hybrid program for middle and high schoolers — blending academically grounded instruction with fine arts integration and individual attention.",
        details: ["Middle & High School", "Hybrid", "Private Program", "Fine Arts"],
        image: "/images/stock/ImageFive.jpg",
        accent: "text-[#644268]",
        accentBg: "bg-[#f8f3e8]",
      },
      {
        badge: "Theatre",
        title: "Creative Dramatics",
        teaser: "Theatre performance class · ages 10+",
        desc: "Theatre Performance Class for ages 10 and up — where students build confidence, expression, and collaboration through performance and play.",
        details: ["Ages 10+", "Theatre", "Performance", "Weekly Classes"],
        image: "/images/stock/ImageSeven.jpg",
        accent: "text-[#769a61]",
        accentBg: "rgba(118, 154, 97, 0.12)",
      },
      {
        badge: "Friday",
        title: "Fine Arts Friday",
        teaser: "Theatre, music, and art for all ages",
        desc: "Explore the wonders of Theatre, Music, and Art every Friday. All ages welcome — performers under 10 years old must audition.",
        details: ["All Ages", "Theatre", "Music", "Art"],
        image: "/images/stock/ImageSix.jpg",
        accent: "text-[#644268]",
        accentBg: "bg-[#f8f3e8]",
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
      "It's like love, but… fluffier.",
      "Fuzzier. Warmer.",
    ],
    attribution: "Luff Learning — Seek to Understand",
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
    eyebrow: "A Week at Luff",
    heading: "Learning through theatre, art, and connection",
    headingSub: "Spring, TX · Virtual & in-person programs",
    steps: [
      {
        time: "Morning",
        activity: "Academic Focus",
        desc: "Rigorous, science-based academics with ADHD-friendly structure and individual attention for every learner.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "Midday",
        activity: "Social-Emotional Learning",
        desc: "We seek to understand — building empathy, confidence, and authentic self-expression in every interaction.",
        image: "/images/stock/ImageFive.jpg",
      },
      {
        time: "Afternoon",
        activity: "Fine Arts Integration",
        desc: "Theatre, music, and art woven into the day — process valued as much as progress.",
        image: "/images/stock/ImageSeven.jpg",
      },
      {
        time: "Friday",
        activity: "Fine Arts Friday",
        desc: "Explore theatre, music, and art together — a community celebration of creativity and belonging.",
        image: "/images/stock/ImageSix.jpg",
      },
      {
        time: "Events",
        activity: "Community Gatherings",
        desc: "Open houses, student performances like They Eat Sunshine, Not Zebras, and the Festival of Dionysus.",
        image: "/images/stock/ImageNine.jpg",
      },
    ],
  },
  socialProof: {
    type: "testimonials",
    eyebrow: "What Parents Are Saying",
    heading: "Families who found belonging at Luff.",
    subtitle:
      "Luff Learning is the first place many students have truly felt comfortable, at home, and excited to learn again.",
    items: [
      {
        quote:
          "I can't say enough about how amazing Luff has been for my family. It is the first place my kiddo has truly felt comfortable and at home and made truly great friends. Ms. Sarah has been awesome at rekindling an interest in learning after years of bad experiences in public school.",
        name: "Kim Spangler",
        detail: "Luff Learning Parent",
        stars: 5,
        avatar: "/images/stock/ImageTen.jpg",
      },
      {
        quote:
          "My three children look forward to their Luff class every week. I'm glad to have found such a positive environment for my kids to experience new methods of learning and outlets to explore their natural creativity. Miss Sarah is a wonderful teacher and seems to always keep the kids engaged and learning.",
        name: "Jamie Pfent",
        detail: "Luff Learning Parent · 3 Children",
        stars: 5,
        avatar: "/images/stock/ImageSeven.jpg",
      },
    ],
  },
  founder: {
    eyebrow: "Our Philosophy",
    heading: "Seek to understand in",
    headingAccent: "every interaction.",
    paragraphs: [
      "Luff Learning, LLC is a community center serving Spring, TX and surrounding communities. We are dedicated to offering a space where people of all ages can learn through the fine arts, and where they feel safe and supported to be their most authentic selves.",
      "We prioritize social-emotional learning, value process as much as progress, and give individual attention to every learner. Here, students are loved and valued no matter their level — with teachers who truly care.",
    ],
    credentials: [
      "Secular & science-based",
      "Fine arts integration",
      "Spring, Texas",
      "Seek to Understand",
    ],
    quote:
      "Discover the magic of learning through play(s) — where empathy, creativity, and academic growth go hand in hand.",
    quoteAttribution: "— Luff Learning",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "Spring, TX" },
    name: "Luff Learning",
    title: "Fine Arts Academy",
  },
  parallax: {
    eyebrow: "Fine Arts Academy",
    heading: ["Creative.", "Supported.", "Known."],
    subtitle:
      "A secular, inclusive community in Spring, Texas — where bright learners thrive through theatre arts, ADHD-friendly structure, and a place to belong.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Contact Us",
    backgroundImage: "/images/stock/ImageSeven.jpg",
  },
  pillars: {
    eyebrow: "Why You'll Love Luff",
    heading: "Built for creative, capable learners.",
    subtitle:
      "Social-emotional learning, fine arts integration, and individual attention — with teachers who care.",
    items: [
      {
        icon: "heart",
        title: "Social-Emotional Learning",
        desc: "We seek to understand in every interaction — empathy, confidence, and authentic self-expression are core to how we teach.",
      },
      {
        icon: "sparkles",
        title: "Fine Arts Integration",
        desc: "Theatre, music, and art woven into daily learning — not treated as extras, but as the vehicle for growth.",
      },
      {
        icon: "users",
        title: "Individual Attention",
        desc: "Students are loved and valued no matter their level — with process valued as much as progress.",
      },
      {
        icon: "bookOpen",
        title: "Academically Grounded",
        desc: "Secular, science-based instruction with rigorous academics and ADHD-friendly structure for bright learners.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Ready to see if Luff Learning is the right fit for your family?",
    sidebarImage: "/images/stock/ImageSix.jpg",
    eyebrow: "Contact Us",
    heading: "Schedule a tour or ask a question.",
    description:
      "Tell us about your child and we'll reach out about our programs, open house events, or next steps. No commitment required.",
    submitLabel: "Send Message",
    disclaimer: "We'll respond within 48 hours. Call (832) 890-4600 or email lufflearning@gmail.com.",
    successEmoji: "✓",
    successTitle: "Message received!",
    successMessage:
      "We'll be in touch within 48 hours about scheduling a tour or answering your questions.",
    programOptions: [
      { value: "virtual-academy", label: "Virtual Academy" },
      { value: "aep", label: "Artistic Evolution Program (AEP)" },
      { value: "creative-dramatics", label: "Creative Dramatics" },
      { value: "fine-arts-friday", label: "Fine Arts Friday" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Student's Name",
      gradePlaceholder: "Select grade level...",
      gradeOptions: [
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
      "New to Luff Learning? Here are the most common things families want to know before scheduling a tour.",
    items: [
      {
        q: "What makes Luff Learning different from traditional school?",
        a: "We're a fine arts academy and virtual microschool designed for bright, creative students — especially ADHD learners — who need ADHD-friendly structure, individual attention, and a place to belong. Fine arts aren't extras; they're how we teach.",
      },
      {
        q: "Is Luff Learning religious?",
        a: "No. Luff Learning is a secular, inclusive community center. We are science-based and welcome families from all backgrounds.",
      },
      {
        q: "What programs do you offer?",
        a: "We offer a Virtual Academy for middle schoolers, the Artistic Evolution Program (AEP) for middle and high school hybrid learners, Creative Dramatics theatre classes for ages 10+, and Fine Arts Friday for all ages.",
      },
      {
        q: "Where are you located?",
        a: "Our community center is at 5927 Louetta Rd, Spring, Texas 77379 — serving Spring, Tomball, The Woodlands, and surrounding communities.",
      },
      {
        q: "How do I get started?",
        a: "Contact us at lufflearning@gmail.com or (832) 890-4600 to schedule a tour, attend an open house, or learn more about enrollment.",
      },
      {
        q: "What is your motto?",
        a: "Seek to Understand — in every interaction, lesson, and reflection. We believe so many conflicts stem from a lack of communication, and we model empathy in everything we do.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Join Our Community",
    heading: "Ready to discover the magic",
    headingAccent: "of learning through play(s)?",
    description:
      "Email lufflearning@gmail.com or call (832) 890-4600 to schedule a tour, attend an open house, or learn about our programs.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Contact Us",
  },
  footer: {
    tagline: "A fine arts academy and community center in Spring, Texas.",
    links: ["Programs", "Philosophy", "Testimonials", "FAQ", "Contact"],
    copyright: "© 2026 Luff Learning, LLC",
    poweredBy: "Website concept by MudKitchen",
  },
};
