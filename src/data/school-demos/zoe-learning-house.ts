import type { SchoolWebsiteDemoConfig } from "./types";
import { ZOE_LEARNING_HOUSE_LOGO } from "./zoelearninghouse-admin-demo";

export const zoeLearningHouseConfig: SchoolWebsiteDemoConfig = {
  slug: "zoe-learning-house",
  schoolName: "Zoe Learning House",
  theme: {
    primary: "#C9A84C",
    primaryHover: "#B0923F",
    dark: "#5F8A7A",
    darkHover: "#4A7568",
    lightBg: "#F0EBE3",
    lightBorder: "#E8E2D8",
    muted: "#6B6560",
    badgeBg: "#EEF4F1",
    accentText: "#5F8A7A",
    pageBg: "#FAF7F2",
  },
  logo: ZOE_LEARNING_HOUSE_LOGO,
  hero: {
    eyebrow: "Holistic Christian K–5 Microschool · New Orleans",
    eyebrowPlacement: "announcementBar",
    headline: ["A Christ-centered microschool where", "children love learning again."],
    subheadline:
      "Zoe Learning House is a holistic Christian K–5 academy in Greater New Orleans — where hands-on, creative, outdoor learning meets flexible 1–5 day options and a small community that partners with families.",
    primaryCta: "Submit Interest Form",
    secondaryCta: "Learn how Zoe works",
    secondaryCtaTarget: "signature",
    navCta: "Submit Interest Form",
    navLinks: ["About", "Programs", "Families Say", "Contact"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/ImageFour.jpg"],
    imageAlt: "Children learning outdoors in a warm, nature-rich environment",
    trustBadges: ["VELA Member", "National Microschooling Center"],
  },
  sections: {
    showStrip: false,
  },
  signatureSection: {
    type: "natureArtJoy",
    eyebrow: "Our Approach",
    heading: "Nature · Art · Joy",
    pillars: [
      {
        label: "Nature",
        title: "Outdoor Learning Every Day",
        desc: "Regular outdoor play, gardens, and field time woven into the rhythm of the day — not saved for recess.",
        icon: "treePine",
      },
      {
        label: "Art",
        title: "Creative, Hands-On Expression",
        desc: "Art-rich, project-based instruction that inspires curiosity and deep understanding through making and creating.",
        icon: "palette",
      },
      {
        label: "Joy",
        title: "A Love for Learning That Lasts",
        desc: "A child's love for learning shouldn't fade — at Zoe, joy and wonder are at the heart of every day.",
        icon: "heart",
      },
    ],
    trustLine: "Proud member of VELA & National Microschooling Center.",
  },
  stats: [
    { value: "Grades K–5", label: "Kindergarten through 5th" },
    { value: "Greater NOLA", label: "New Orleans Area Families" },
    { value: "Hybrid Model", label: "1–5 Day Options" },
    { value: "Microschool", label: "Small Class Sizes" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Why Zoe?",
    heading: "A child's love for learning shouldn't fade — and at Zoe, it won't.",
    cards: [
      {
        title: "Christ-Centered Community",
        desc: "Spiritual formation, prayerful environment, and a biblical worldview woven into every day.",
      },
      {
        title: "Hands-On, Creative Learning",
        desc: "Project-based, art-rich instruction that inspires curiosity and deep understanding.",
      },
      {
        title: "Nature & Outdoor Time",
        desc: "Regular outdoor learning and play integrated into the rhythm of the day — not saved for recess.",
      },
      {
        title: "Hybrid Flexibility for Families",
        desc: "Choose 1–5 days per week to complement homeschooling or provide a full-time microschool experience.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/ImageSeven.jpg",
  },
  marquee: [
    "Christian",
    "Holistic",
    "Microschool",
    "Nature",
    "Art",
    "Joy",
    "VELA",
    "New Orleans",
    "K–5",
    "Hybrid",
    "Hands-On Learning",
    "Small Community",
  ],
  programs: {
    eyebrow: "Program Options",
    heading: "Flexible days for Greater New Orleans families",
    subtitle:
      "Christian microschool + homeschool enrichment — choose the schedule that fits your family's rhythm.",
    ctaLabel: "Learn More",
    items: [
      {
        badge: "Full-Time",
        title: "5-Day Program",
        teaser: "Complete weekly microschool experience",
        desc: "The full Zoe experience — five days of Christ-centered academics, outdoor learning, art, and community. Ideal for families seeking a consistent, holistic microschool.",
        details: ["Grades K–5", "Mon–Fri", "5 Days/Week", "Contact for tuition"],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#5F8A7A]",
        accentBg: "bg-[#EEF4F1]",
      },
      {
        badge: "Part-Time",
        title: "4-Day Program",
        teaser: "Four days of enrichment each week",
        desc: "Four days of hands-on learning, nature time, and creative projects — a balanced option for families blending homeschool and microschool.",
        details: ["Grades K–5", "4 Days/Week", "Flexible schedule", "Contact for tuition"],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#4A7568]",
        accentBg: "bg-[#EEF4F1]",
      },
      {
        badge: "Part-Time",
        title: "3-Day Program",
        teaser: "Three days of nature-rich learning",
        desc: "Three days of creative, outdoor, Christ-centered learning — a thoughtful complement to learning at home.",
        details: ["Grades K–5", "3 Days/Week", "Flexible schedule", "Contact for tuition"],
        image: "/images/stock/ImageFive.jpg",
        accent: "text-[#C9A84C]",
        accentBg: "bg-[#FBF5E8]",
      },
      {
        badge: "Part-Time",
        title: "1–2 Day Enrichment",
        teaser: "Light-touch homeschool enrichment",
        desc: "One or two days of community, art, and outdoor learning for families who want Zoe alongside their homeschool rhythm.",
        details: ["Grades K–5", "1–2 Days/Week", "Flexible schedule", "Contact for tuition"],
        image: "/images/stock/ImageSix.jpg",
        accent: "text-[#D4847A]",
        accentBg: "bg-[#FBF0EE]",
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
      "Nature · Art · Joy —",
      "a place where children thrive and families find peace.",
    ],
    attribution: "Holistic Christian K–5 Academy",
    backgroundImage: "/images/stock/ImageNine.jpg",
  },
  stripImages: [
    "/images/stock/ImageEleven.jpg",
    "/images/stock/ImageTwelve.jpg",
    "/images/stock/ImageThirteen.jpg",
    "/images/stock/Homeschool.jpg",
    "/images/stock/Homeschool2.jpg",
    "/images/stock/ImageFour.jpg",
  ],
  timeline: {
    eyebrow: "A Day at Zoe",
    heading: "Morning prayer to outdoor play",
    headingSub: "and artful, hands-on learning in between.",
    steps: [
      {
        time: "Morning",
        activity: "Gathering & Prayer",
        desc: "Students begin with community, intention, and prayer — setting a Christ-centered tone for the day.",
        image: "/images/stock/ImageEleven.jpg",
      },
      {
        time: "Core Hours",
        activity: "Hands-On Academics",
        desc: "Creative, project-based core instruction with manipulatives and small-group support — learning that sticks.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "Midday",
        activity: "Outdoor Learning & Nature Play",
        desc: "Regular time outside — gardens, trees, and field exploration woven into the rhythm of learning.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "Afternoon",
        activity: "Art & Creative Projects",
        desc: "Painting, crafts, and creative work that nurtures joy and self-expression alongside academics.",
        image: "/images/stock/ImageSeven.jpg",
      },
      {
        time: "Closing",
        activity: "Reflection & Community",
        desc: "Closing community time to reflect, connect, and end the day with gratitude and belonging.",
        image: "/images/stock/ImageSix.jpg",
      },
    ],
  },
  socialProof: {
    type: "testimonials",
    eyebrow: "Families Say",
    heading: "What NOLA parents are experiencing",
    subtitle:
      "Placeholder quotes inspired by the community Zoe is building — easily editable by your team.",
    items: [
      {
        quote:
          "Zoe has been a breath of fresh air and peace for our family. Our child is excited about learning again — and we finally feel like we found the community we were praying for.",
        name: "Zoe Parent",
        detail: "Greater New Orleans · 3-Day Program",
        stars: 5,
        avatar: "/images/stock/ImageTen.jpg",
      },
      {
        quote:
          "The blend of nature, art, and Christ-centered teaching is exactly what we hoped for. Our kids come home joyful and curious — not drained.",
        name: "Zoe Parent",
        detail: "Greater New Orleans · Full-Time",
        stars: 5,
        avatar: "/images/stock/ImageSeven.jpg",
      },
      {
        quote:
          "As homeschoolers, the flexible day options let us keep what works at home while giving our children real community and outdoor learning.",
        name: "Zoe Parent",
        detail: "Greater New Orleans · 2-Day Enrichment",
        stars: 5,
        avatar: "/images/stock/ImageEight.jpg",
      },
    ],
  },
  founder: {
    eyebrow: "Meet the Founder",
    heading: "Built with heart for",
    headingAccent: "New Orleans families.",
    paragraphs: [
      "Emily founded Zoe Learning House with a deep love for Greater New Orleans families — and a conviction that a child's love for learning shouldn't fade.",
      "She created Zoe as a holistic, Christ-centered alternative to traditional school: a small community where hands-on, creative, outdoor learning partners with parents and offers peace of mind.",
    ],
    credentials: [
      "Holistic Christian K–5 Academy",
      "Hybrid 1–5 Day Options",
      "Greater New Orleans Area",
      "VELA & National Microschooling Center",
    ],
    quote:
      "Every child deserves a place where they are known, loved, and free to love learning again.",
    quoteAttribution: "— Emily, Founder & Director",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "Greater NOLA" },
    name: "Emily",
    title: "Founder & Director",
  },
  parallax: {
    eyebrow: "Nature · Art · Joy",
    heading: ["Christ-centered.", "Creative.", "Connected."],
    subtitle:
      "Whether you're exploring full-time enrollment or homeschool enrichment, we'd welcome the chance to connect with your family.",
    primaryCta: "Submit Interest Form",
    secondaryCta: "Schedule a Visit",
    backgroundImage: "/images/stock/Homeschool2.jpg",
  },
  pillars: {
    eyebrow: "What Makes Zoe Different",
    heading: "Four pillars. One whole child.",
    subtitle:
      "Christ-centered community, hands-on learning, daily nature, and flexible days — woven into every week.",
    items: [
      {
        icon: "heart",
        title: "Christ-Centered Community",
        desc: "Spiritual formation and biblical worldview in a prayerful, relational environment.",
      },
      {
        icon: "palette",
        title: "Hands-On, Creative Learning",
        desc: "Project-based, art-rich instruction that inspires curiosity and deep understanding.",
      },
      {
        icon: "treePine",
        title: "Nature & Outdoor Time",
        desc: "Outdoor learning and play integrated into the daily rhythm — gardens, trees, and field time.",
      },
      {
        icon: "users",
        title: "Hybrid Flexibility",
        desc: "1–5 day options to complement homeschooling or provide a full-time microschool experience.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Ready to explore Zoe for your family?",
    sidebarImage: "/images/stock/Homeschool3.jpg",
    eyebrow: "Get in Touch",
    heading: "Submit your interest form.",
    description:
      "Tell us about your family and preferred schedule — we'll follow up to start a conversation or schedule a visit. No commitment required.",
    submitLabel: "Submit Interest Form",
    disclaimer:
      "We review interest forms regularly and will follow up with more details about Zoe Learning House.",
    successEmoji: "✓",
    successTitle: "Thank you for your interest!",
    successMessage:
      "We'll be in touch soon to connect with your family about Zoe Learning House.",
    programOptions: [
      { value: "full-time-5", label: "5-Day Program" },
      { value: "part-time-4", label: "4-Day Program" },
      { value: "part-time-3", label: "3-Day Program" },
      { value: "part-time-2", label: "2-Day Enrichment" },
      { value: "part-time-1", label: "1-Day Enrichment" },
      { value: "unsure", label: "Not sure yet — I'd like to learn more" },
    ],
    studentFields: {
      namePlaceholder: "Child's Name",
      gradePlaceholder: "Select grade level...",
      gradeOptions: [
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
    heading: "Questions NOLA parents ask",
    subtitle:
      "A few things families often wonder about before submitting an interest form.",
    items: [
      {
        q: "Is Zoe a full school or an enrichment program?",
        a: "Zoe Learning House is a holistic Christian K–5 microschool that also supports homeschool families through flexible 1–5 day enrichment options. Families can choose full-time enrollment or part-time days that complement learning at home.",
      },
      {
        q: "Do you support homeschool families?",
        a: "Yes. Many Zoe families homeschool part of the week and attend 1–5 days for community, outdoor learning, art, and hands-on academics. We partner with parents rather than replace what you're already doing at home.",
      },
      {
        q: "What curriculum do you use?",
        a: "Zoe uses a hands-on, creative approach with project-based learning, art integration, and outdoor experiences — all within a Christ-centered, biblical framework. Instruction is tailored to small groups and mixed-age learning when appropriate.",
      },
      {
        q: "What grades does Zoe serve?",
        a: "Zoe Learning House serves children in kindergarten through 5th grade (K–5) in the Greater New Orleans area.",
      },
      {
        q: "What affiliations does Zoe have?",
        a: "Zoe Learning House is a proud member of VELA and the National Microschooling Center.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Ready to explore?",
    heading: "Ready to explore Zoe",
    headingAccent: "for your family?",
    description:
      "Submit an interest form, schedule a visit, and start a conversation — we'd love to hear about your child and how Zoe might fit.",
    primaryCta: "Submit Interest Form",
    secondaryCta: "Schedule a Visit",
  },
  footer: {
    tagline: "Holistic Christian K–5 microschool in Greater New Orleans.",
    links: ["About", "Programs", "Families Say", "Contact"],
    copyright: "© 2026 Zoe Learning House",
    poweredBy: "Website concept by MudKitchen",
  },
};
