import type { SchoolWebsiteDemoConfig } from "./types";
import { HILTON_HORIZON_ADMIN_LOGO } from "./hiltonhorizon-admin-demo";

export const hiltonHorizonsAcademyConfig: SchoolWebsiteDemoConfig = {
  slug: "hilton-horizons-academy",
  schoolName: "Hilton Horizons Academy",
  theme: {
    primary: "#C9A84C",
    primaryHover: "#B0923F",
    dark: "#1B3664",
    darkHover: "#152A52",
    lightBg: "#F7F2E6",
    lightBorder: "#E8DFC4",
    muted: "#6B7280",
    badgeBg: "#F7F2E6",
    accentText: "#1B3664",
    pageBg: "#FFFFFF",
  },
  logo: HILTON_HORIZON_ADMIN_LOGO,
  hero: {
    eyebrow: "Rise With Us. · K–12 · Tri-Cities, Tennessee",
    eyebrowPlacement: "announcementBar",
    headline: ["A new standard for K–12 education", "in the Tri-Cities."],
    subheadline:
      "Hilton Horizons Academy offers project-based, holistic learning across an accredited Category III private school and flexible hybrid microschools — tailored to your child's unique journey.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Explore Programs",
    secondaryCtaTarget: "signature",
    navCta: "Schedule a Tour",
    navLinks: ["Programs", "About", "Contact", "Apply"],
    backgroundImage: "/images/stock/ImageTwo.jpg",
    floatingImages: ["/images/stock/ImageSeven.jpg", "/images/stock/ImageSix.jpg"],
    imageAlt: "Students engaged in hands-on outdoor learning",
    tagline: "Rise With Us.",
    trustBadges: ["Category III Accredited", "Hybrid Microschools", "K–12"],
  },
  signatureSection: {
    type: "valuePillars",
    eyebrow: "Why Hilton Horizons?",
    heading: "Why families choose Hilton Horizons Academy",
    tagline: "Rise With Us.",
    pillars: [
      {
        title: "Individualized Instruction",
        desc: "Small groups and 1:1 coaching let students progress at their own pace with targeted support and peer collaboration.",
        icon: "users",
      },
      {
        title: "Hands-On, Project-Based Learning",
        desc: "STEM, creative arts, gardening, and real-world problem solving in a supportive, experiential community.",
        icon: "sprout",
      },
      {
        title: "Whole-Child Development",
        desc: "Social-emotional skills, empathy, and resilience nurtured alongside academic learning for lasting success.",
        icon: "heart",
      },
    ],
  },
  stats: [
    { value: "Grades K–12", label: "Private School & Microschools" },
    { value: "Tri-Cities", label: "Kingsport · Johnson City · More" },
    { value: "Category III", label: "Accredited Private School" },
    { value: "Hybrid Options", label: "Flexible Pathways" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Why Hilton Horizons?",
    heading: "Why families choose Hilton Horizons Academy.",
    cards: [
      {
        title: "Individualized Instruction",
        desc: "Small groups and 1:1 coaching let students progress at their own pace with targeted support and peer collaboration.",
      },
      {
        title: "Hands-On, Project-Based Learning",
        desc: "STEM, creative arts, gardening, and real-world problem solving in a supportive, experiential community.",
      },
      {
        title: "Whole-Child Development",
        desc: "Social-emotional skills, empathy, and resilience nurtured alongside academic learning for lasting success.",
      },
    ],
    mainImage: "/images/stock/ImageSeven.jpg",
    secondaryImage: "/images/stock/ImageEight.jpg",
  },
  marquee: [
    "Project-Based",
    "Holistic",
    "K–12",
    "Tri-Cities",
    "Category III",
    "Hybrid Microschool",
    "Small Groups",
    "Hands-On Learning",
    "STEM",
    "Individualized",
    "Rise With Us",
    "Community",
  ],
  programs: {
    eyebrow: "Program Options",
    heading: "Multiple paths, one vision.",
    subtitle:
      "From a stable full-time private school to flexible hybrid microschools — find the pathway that fits your family.",
    ctaLabel: "Learn More",
    items: [
      {
        badge: "Full-Time",
        title: "Accredited Category III Private School",
        teaser: "Stable, full-time K–12 option",
        desc: "A rigorous, holistic private school with small classes, individualized instruction, and comprehensive support — designed for families seeking a consistent, full-time educational home.",
        details: ["Grades K–12", "Full-Time", "Small Classes", "Contact for tuition"],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#1B3664]",
        accentBg: "bg-[#F7F2E6]",
      },
      {
        badge: "Hybrid",
        title: "Hybrid Microschools",
        teaser: "Flexible scheduling across the Tri-Cities",
        desc: "Part-time hybrid microschool options with community-based sites in Kingsport, Johnson City, Elizabethton, and Hawkins County — customized learning journeys for families who need flexibility.",
        details: [
          "Grades K–12",
          "Part-Time Options",
          "Multi-Site",
          "Contact for tuition",
        ],
        image: "/images/stock/ImageSix.jpg",
        accent: "text-[#9A7B2E]",
        accentBg: "bg-[#F7F2E6]",
      },
    ],
  },
  mosaicImages: [
    "/images/stock/ImageSix.jpg",
    "/images/stock/ImageSeven.jpg",
    "/images/stock/ImageTen.jpg",
  ],
  quote: {
    text: ["Rise With Us.", "Where curiosity is encouraged and every child can grow."],
    attribution: "Hilton Horizons Academy",
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
    eyebrow: "Ready To Rise With Us?",
    heading: "Enrollment in three simple steps.",
    headingSub: "From first hello to a secured seat.",
    steps: [
      {
        time: "Step 1",
        activity: "Connect",
        desc: "Schedule a tour or call to learn about our programs and ask questions about the right fit for your child.",
        image: "/images/stock/ImageEleven.jpg",
      },
      {
        time: "Step 2",
        activity: "Explore Fit",
        desc: "Meet teachers, see learning in action, and discover how our private school or hybrid microschool pathways work.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "Step 3",
        activity: "Enroll",
        desc: "Secure your child's seat and join a warm, relational community built on project-based, holistic learning.",
        image: "/images/stock/ImageSeven.jpg",
      },
    ],
  },
  socialProof: {
    type: "testimonials",
    eyebrow: "What Our Families Are Saying",
    heading: "Families across the Tri-Cities are finding their place.",
    subtitle:
      "A warm, relational culture where passionate educators and supportive community make all the difference.",
    items: [
      {
        quote:
          "We made the switch to Hilton Horizons Academy, and it was the best decision we have made as parents. Our child is thriving with the small-group instruction and hands-on learning.",
        name: "Ashley",
        detail: "Tri-Cities · Academy Parent",
        stars: 5,
        avatar: "/images/stock/ImageTen.jpg",
      },
      {
        quote:
          "Candice is what makes this place so special. She's so passionate about teaching and the kids in our community. Everything about this place is a breath of fresh air — much needed in our area.",
        name: "Academy Parent",
        detail: "Tri-Cities · Hybrid Microschool",
        stars: 5,
        avatar: "/images/stock/ImageSeven.jpg",
      },
      {
        quote:
          "The project-based approach and individualized pacing have been exactly what our family needed. We finally found a school that sees the whole child.",
        name: "Tri-Cities Parent",
        detail: "Category III Private School",
        stars: 5,
        avatar: "/images/stock/ImageEight.jpg",
      },
    ],
  },
  founder: {
    eyebrow: "Meet The Heart Behind Hilton Horizons",
    heading: "Passionate about kids,",
    headingAccent: "rooted in community.",
    paragraphs: [
      "Candice founded Hilton Horizons Academy with a deep love for the Tri-Cities community and a conviction that every child deserves individualized, hands-on learning in a warm, relational environment.",
      "Her passion for teaching and commitment to innovative, project-based education is what families feel the moment they walk through the door — a breath of fresh air in K–12 education.",
    ],
    credentials: [
      "K–12 Project-Based Learning",
      "Category III Private School",
      "Hybrid Microschools",
      "Tri-Cities Community",
    ],
    quote: "Every child deserves a place where they can rise.",
    quoteAttribution: "— Candice, Founder & Lead Educator",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "Tri-Cities" },
    name: "Candice",
    title: "Founder & Lead Educator",
  },
  parallax: {
    eyebrow: "Rise With Us.",
    heading: ["Project-based.", "Holistic.", "Known."],
    subtitle:
      "Whether you're exploring our private school or a hybrid microschool pathway, we'd welcome the chance to connect with your family.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Explore Programs",
    backgroundImage: "/images/stock/ImageNine.jpg",
  },
  pillars: {
    eyebrow: "What Makes Hilton Horizons Different",
    heading: "Three pillars. One whole child.",
    subtitle:
      "Individualized instruction, hands-on learning, and holistic development — woven into every program.",
    items: [
      {
        icon: "bookOpen",
        title: "Project-Based Learning",
        desc: "STEM, art, gardening, and real-world problem solving that builds practical skills and curiosity.",
      },
      {
        icon: "users",
        title: "Small-Group Community",
        desc: "Close-knit classes where every student is seen, coached, and supported at their own pace.",
      },
      {
        icon: "heart",
        title: "Holistic Development",
        desc: "Social-emotional growth, empathy, and resilience nurtured alongside rigorous academics.",
      },
      {
        icon: "sprout",
        title: "Flexible Pathways",
        desc: "Category III private school and hybrid microschool options across the Tri-Cities.",
      },
    ],
  },
  form: {
    sidebarQuote: "Ready to rise with us?",
    sidebarImage: "/images/stock/ImageSeven.jpg",
    eyebrow: "Get in Touch",
    heading: "Schedule a tour.",
    description:
      "Tell us about your family and preferred program — we'll follow up to schedule a tour or call. No commitment required.",
    submitLabel: "Schedule a Tour",
    disclaimer: "Have questions? Let's talk — we'll respond within a few business days.",
    successEmoji: "✓",
    successTitle: "Thank you for reaching out!",
    successMessage:
      "We'll be in touch soon to schedule your tour and answer any questions about Hilton Horizons Academy.",
    programOptions: [
      { value: "private-school", label: "Category III Private School" },
      { value: "hybrid-microschool", label: "Hybrid Microschool" },
      { value: "unsure", label: "Not sure yet — I'd like to learn more" },
    ],
    studentFields: {
      namePlaceholder: "Student's Name",
      gradePlaceholder: "Select grade level...",
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
    heading: "Questions Tri-Cities parents ask",
    subtitle:
      "A few things families often wonder about before scheduling a tour.",
    items: [
      {
        q: "What programs does Hilton Horizons offer?",
        a: "Hilton Horizons Academy offers an accredited Category III private school for full-time enrollment and flexible hybrid microschool options across multiple Tri-Cities locations — including Kingsport, Johnson City, Elizabethton, and Hawkins County.",
      },
      {
        q: "What is project-based learning?",
        a: "Students learn through hands-on projects in STEM, creative arts, gardening, and real-world problem solving — building practical skills alongside academic content in small groups with individualized coaching.",
      },
      {
        q: "What grades do you serve?",
        a: "Hilton Horizons Academy serves students in grades K–12 across both our private school and hybrid microschool pathways.",
      },
      {
        q: "How is a hybrid microschool different from the private school?",
        a: "Our Category III private school is a full-time, stable option with small classes and holistic support. Hybrid microschools offer flexible, part-time scheduling at community-based sites — ideal for families who want customized learning journeys.",
      },
      {
        q: "What is the enrollment process?",
        a: "Connect with us to schedule a tour, explore fit with our team, and then enroll to secure your child's seat. We walk every family through the pathway that makes sense for them.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Rise With Us.",
    heading: "Ready to rise with us?",
    headingAccent: "Schedule a tour today.",
    description:
      "Discover how project-based, holistic learning can fit your family — from our private school to hybrid microschool options across the Tri-Cities.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Explore Programs",
  },
  footer: {
    tagline: "Project-based K–12 education across the Tri-Cities. Rise With Us.",
    links: ["Programs", "About", "Contact", "Apply"],
    copyright: "© 2026 Hilton Horizons Academy, LLC",
    poweredBy: "Website concept by MudKitchen",
  },
};
