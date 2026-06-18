import type { SchoolWebsiteDemoConfig } from "./types";
import { MONARCH_HILLS_LOGO } from "./monarchhills-admin-demo";

export const monarchHillsEducationConfig: SchoolWebsiteDemoConfig = {
  slug: "monarch-hills-education",
  schoolName: "Monarch Hills Education",
  theme: {
    primary: "#F26522",
    primaryHover: "#D9571C",
    dark: "#233975",
    darkHover: "#1B2D5C",
    lightBg: "#FFFFFF",
    lightBorder: "#E2E6EE",
    muted: "#5A6478",
    badgeBg: "#EEF2F8",
    accentText: "#233975",
    pageBg: "#FFFFFF",
  },
  logo: MONARCH_HILLS_LOGO,
  hero: {
    eyebrow: "San Luis Obispo, California · Outdoor Enrichment · Grades TK–6",
    eyebrowPlacement: "announcementBar",
    headline: ["Outdoor enrichment for", "curious, growing learners."],
    subheadline:
      "Monarch Hills Education is a nature-based alternative program for grades TK–6 — where your child learns through hands-on exploration, time outdoors, and meaningful community with peers and caring adults.",
    primaryCta: "Learn About Our Program",
    secondaryCta: "Join Our Interest List",
    secondaryCtaTarget: "form",
    navCta: "Request Info",
    navLinks: ["Program", "Philosophy", "Enrollment", "FAQ"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/ImageFour.jpg"],
    imageAlt: "Children exploring and learning outdoors in nature",
  },
  sections: {
    showParallax: false,
    showClosingCta: false,
  },
  signatureSection: {
    type: "philosophyQuote",
    eyebrow: "Our Philosophy",
    heading: "Every child develops at their own pace.",
    quote:
      "A school needs to be a place for all children — not based on the idea that they are the same, but that they are all different.",
    attribution: "Inspired by the Reggio Emilia approach",
    body:
      "Monarch Hills honors each child's learning style, developmental timeline, and interests. Children learn through hands-on exploration in nature-rich environments — where adults act as skilled facilitators, not directors.",
    ctaLabel: "Join Our Interest List",
  },
  stats: [
    { value: "Grades TK–6", label: "Transitional Kinder through 6th" },
    { value: "San Luis Obispo", label: "Central Coast, California" },
    { value: "Nature-Based", label: "Outdoor Enrichment Program" },
    { value: "5 Options", label: "Flexible Attendance Plans" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "What is Monarch Hills?",
    heading: "An outdoor enrichment program where your child is seen, supported, and free to grow.",
    cards: [
      {
        title: "Hands-on, child-led learning",
        desc: "Academic concepts come alive through real-world exploration — not worksheets alone.",
      },
      {
        title: "Nature as a daily classroom",
        desc: "Fresh air, sunshine, and sensory experiences are woven into learning, not saved for recess.",
      },
      {
        title: "Community and collaboration",
        desc: "Children learn to listen, share feelings, and work together with skilled adult facilitation.",
      },
      {
        title: "Flexible attendance for homeschool families",
        desc: "Full-time and part-time options that complement your family's learning path.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/ImageSeven.jpg",
  },
  marquee: [
    "Outdoor Enrichment",
    "Reggio-Inspired",
    "Child-Led Learning",
    "Nature-Based",
    "San Luis Obispo",
    "Grades TK–6",
    "Adventure Fridays",
    "Community Learning",
    "Hands-On Exploration",
    "Flexible Attendance",
    "Interest List Open",
    "Alternative Education",
  ],
  programs: {
    eyebrow: "Program Options",
    heading: "Flexible attendance for your family's rhythm",
    subtitle: "Choose the schedule that fits your child and your homeschool journey.",
    ctaLabel: "Learn More",
    items: [
      {
        badge: "Full-Time",
        title: "5-Day Program",
        teaser: "Complete weekly enrichment experience",
        desc: "The full Monarch Hills experience — five days of outdoor enrichment, hands-on projects, community learning, and adventure Fridays. Ideal for families seeking a consistent, nature-rich program.",
        details: ["Grades TK–6", "Mon–Fri", "8:30 AM–2:30 PM", "$9,000/yr"],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#233975]",
        accentBg: "bg-[#EEF2F8]",
      },
      {
        badge: "Part-Time",
        title: "4-Day Program",
        teaser: "Four days of enrichment each week",
        desc: "Four days of guided outdoor learning and community — a balanced option for families blending homeschool and enrichment.",
        details: ["Grades TK–6", "4 Days/Week", "8:30 AM–2:30 PM", "$8,000/yr"],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#2F4A8A]",
        accentBg: "bg-[#EEF2F8]",
      },
      {
        badge: "Part-Time",
        title: "3-Day Program",
        teaser: "Three days of nature-rich learning",
        desc: "Three days of hands-on exploration and peer connection — a thoughtful complement to learning at home.",
        details: ["Grades TK–6", "3 Days/Week", "8:30 AM–2:30 PM", "$6,750/yr"],
        image: "/images/stock/ImageFive.jpg",
        accent: "text-[#F26522]",
        accentBg: "bg-[#FFF4ED]",
      },
      {
        badge: "Part-Time",
        title: "2-Day & 1-Day Programs",
        teaser: "Light-touch enrichment options",
        desc: "One or two days of outdoor enrichment for families who want community and nature experiences alongside their homeschool rhythm.",
        details: ["Grades TK–6", "1–2 Days/Week", "8:30 AM–2:30 PM", "From $2,300/yr"],
        image: "/images/stock/ImageSix.jpg",
        accent: "text-[#233975]",
        accentBg: "bg-[#EEF2F8]",
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
      "A place designed for every child —",
      "not because they are the same, but because each one is different.",
    ],
    attribution: "Inspired by Reggio philosophy",
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
    eyebrow: "A Typical Day",
    heading: "Learning with bare feet in the mud",
    headingSub: "and eyes on the horizon.",
    steps: [
      {
        time: "Morning",
        activity: "Outdoor Arrival & Community",
        desc: "Children gather outside, connect with teachers and friends, and settle into a calm, intentional start to the day.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "Exploration",
        activity: "Hands-On Discovery",
        desc: "Child-led projects, sensory play, and tactile learning — academic ideas reinforced through real-world experience.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "Midday",
        activity: "Nature & Movement",
        desc: "Time outside in fresh air and sunshine — observing, exploring, and engaging with the natural world as part of learning.",
        image: "/images/stock/ImageFive.jpg",
      },
      {
        time: "Afternoon",
        activity: "Community & Reflection",
        desc: "Collaborative work, social-emotional learning, and calm facilitation as children navigate challenges together.",
        image: "/images/stock/ImageSix.jpg",
      },
      {
        time: "Fridays",
        activity: "Adventure Day",
        desc: "Off-site adventures and experiential learning — exploring beyond the campus with peers and guides.",
        image: "/images/stock/ImageFour.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Our Approach",
    heading: "Built on respect for the whole child",
    subtitle:
      "Monarch Hills honors each child's pace, interests, and way of learning — in community with others.",
    items: [
      {
        title: "Reggio-Inspired Practice",
        desc: "Child-centered learning that treats every student as a capable, active participant in their education.",
        icon: "sprout",
      },
      {
        title: "Nature-Rich Environment",
        desc: "Indoor and outdoor spaces designed for exploration, deep thinking, and sensory engagement.",
        icon: "treePine",
      },
      {
        title: "Skilled Facilitation",
        desc: "Adults who calmly guide conflict, model listening, and support social-emotional growth.",
        icon: "heart",
      },
    ],
  },
  founder: {
    eyebrow: "Our Team",
    heading: "Educators who believe in",
    headingAccent: "every child's competence.",
    paragraphs: [
      "Monarch Hills Education is a small, community-rooted program in San Luis Obispo — built for families who want an alternative to traditional schooling without losing the warmth of real human connection.",
      "Our team acts as skilled facilitators, honoring each child's developmental timeline and creating space for hands-on exploration, nature immersion, and collaborative learning.",
    ],
    credentials: [
      "Grades TK–6",
      "Outdoor Enrichment Program",
      "Reggio-Inspired Approach",
      "San Luis Obispo, California",
    ],
    quote:
      "We believe every child deserves to feel competent and successful as a learner — at their own pace.",
    quoteAttribution: "— Monarch Hills Education Team",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "San Luis Obispo" },
    name: "Monarch Hills Education",
    title: "Lead Educators & Facilitators",
  },
  parallax: {
    eyebrow: "Interested in learning more?",
    heading: ["Calm.", "Curious.", "Connected."],
    subtitle:
      "Whether you're exploring future enrollment or simply want to understand our program, we'd welcome the chance to connect with your family.",
    primaryCta: "Join Our Interest List",
    secondaryCta: "Request More Information",
    backgroundImage: "/images/stock/Homeschool2.jpg",
  },
  pillars: {
    eyebrow: "What Makes Monarch Hills Different",
    heading: "Space to grow, explore, and belong.",
    subtitle:
      "Child-led learning, daily nature immersion, and a community where every child is honored.",
    items: [
      {
        icon: "leaf",
        title: "Grow at Your Own Pace",
        desc: "Each child's learning style, developmental timeline, and interests are respected — with academic concepts reinforced through meaningful, hands-on exploration.",
      },
      {
        icon: "treePine",
        title: "Explore Nature Daily",
        desc: "Fresh air, sunshine, mud, and sensory experiences are integral to learning — not just a break from it.",
      },
      {
        icon: "users",
        title: "Belong in Community",
        desc: "Children learn to collaborate, express feelings, and navigate challenges with patient, skilled adult facilitation.",
      },
      {
        icon: "heart",
        title: "Honor Every Child",
        desc: "A school designed for all children in their uniqueness — each one seen as a capable protagonist in their learning.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Interested in future enrollment or learning more about Monarch Hills?",
    sidebarImage: "/images/stock/Homeschool3.jpg",
    eyebrow: "Get in Touch",
    heading: "Join our interest list.",
    description:
      "Share a little about your family and we'll follow up with more information about upcoming sessions, gatherings, and openings. No commitment required.",
    submitLabel: "Submit Interest Form",
    disclaimer:
      "We review interest forms regularly and will follow up with more details about our program.",
    successEmoji: "✓",
    successTitle: "Thank you for your interest!",
    successMessage:
      "We'll be in touch soon with more information about Monarch Hills Education.",
    programOptions: [
      { value: "full-time-5", label: "5-Day Program" },
      { value: "part-time-4", label: "4-Day Program" },
      { value: "part-time-3", label: "3-Day Program" },
      { value: "part-time-2", label: "2-Day Program" },
      { value: "part-time-1", label: "1-Day Program" },
      { value: "unsure", label: "Not sure yet — I'd like to learn more" },
    ],
    studentFields: {
      namePlaceholder: "Child's Name",
      gradePlaceholder: "Select grade level...",
      gradeOptions: [
        { value: "tk", label: "Transitional Kindergarten" },
        { value: "k", label: "Kindergarten" },
        { value: "1", label: "1st Grade" },
        { value: "2", label: "2nd Grade" },
        { value: "3", label: "3rd Grade" },
        { value: "4", label: "4th Grade" },
        { value: "5", label: "5th Grade" },
        { value: "6", label: "6th Grade" },
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions thoughtful parents ask",
    subtitle:
      "A few things families often wonder about before joining our interest list.",
    items: [
      {
        q: "What ages and grades does Monarch Hills serve?",
        a: "Monarch Hills Education serves children in transitional kindergarten through 6th grade (TK–6) in San Luis Obispo, California.",
      },
      {
        q: "How much time do children spend outside?",
        a: "Nature is integral to our program — not just recess. Children spend significant time outdoors each day, engaging in sensory exploration, movement, and hands-on learning in fresh air and sunshine.",
      },
      {
        q: "How does this fit with traditional or homeschool schooling?",
        a: "Monarch Hills is an outdoor enrichment and alternative education program designed to complement homeschool families and those seeking a smaller, nature-rich learning environment. We offer flexible attendance from one to five days per week.",
      },
      {
        q: "What are Adventure Fridays?",
        a: "Fridays often include off-site adventures and experiential learning — giving children opportunities to explore beyond the campus with peers and skilled guides.",
      },
      {
        q: "How is safety handled in outdoor environments?",
        a: "Adults act as attentive facilitators during all outdoor activities. We maintain appropriate supervision ratios and thoughtfully plan experiences to balance exploration with safety.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Enrollment & Next Steps",
    heading: "We'd love to hear from you",
    headingAccent: "when the time feels right.",
    description:
      "Join our interest list or request more information — we'll follow up with details about upcoming sessions, gatherings, and openings at your pace.",
    primaryCta: "Join Our Interest List",
    secondaryCta: "Request More Information",
  },
  footer: {
    tagline: "Outdoor enrichment and alternative education for grades TK–6 in San Luis Obispo.",
    links: ["Program", "Philosophy", "Enrollment", "FAQ", "Contact"],
    copyright: "© 2026 Monarch Hills Education",
    poweredBy: "Website concept by MudKitchen",
  },
};
