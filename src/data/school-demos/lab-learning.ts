import type { SchoolWebsiteDemoConfig } from "./types";
import { LAB_LEARNING_ADMIN_LOGO } from "./lablearning-admin-demo";

export const labLearningConfig: SchoolWebsiteDemoConfig = {
  slug: "lab-learning",
  schoolName: "The Lab Learning Space",
  theme: {
    primary: "#6f8f3a",
    primaryHover: "#5a7530",
    dark: "#1f1f1f",
    darkHover: "#3d6b8d",
    lightBg: "#f7f4ef",
    lightBorder: "#ddd7cf",
    muted: "#6f6f6f",
    badgeBg: "rgba(111, 143, 58, 0.12)",
    accentText: "#3d6b8d",
    pageBg: "#ffffff",
  },
  logo: LAB_LEARNING_ADMIN_LOGO,
  hero: {
    eyebrow: "K–8 · Long Beach, CA · 501(c)(3) Nonprofit",
    eyebrowPlacement: "announcementBar",
    headline: ["Viva! Learning Space", "aka The Lab Learning Space"],
    subheadline:
      "Where everyone's a teacher and everyone's a student. The Lab Learning Space is a nonprofit learning community in Long Beach offering joyful, mastery-based enrichment and tutoring for kindergarten through 8th grade students.",
    tagline:
      "\"The ideal culture is one that makes a place for every human gift.\" — Margaret Mead",
    primaryCta: "Schedule a Tour",
    secondaryCta: "View Programs",
    secondaryCtaTarget: "programs",
    navCta: "Schedule a Tour",
    navLinks: ["Programs", "Our Approach", "Admissions", "FAQ"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/Homeschool3.jpg"],
    imageAlt: "Students learning collaboratively in a warm, multi-age classroom",
    trustBadges: ["Nonprofit", "K–8", "Mastery-Based", "Charter Vendor"],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "Our Approach",
    heading: "How learning works at The Lab",
    subtitle:
      "Inspired by the Khan Lab School's personalized, mastery-based approach — designed for student agency, multi-age community, and close family collaboration.",
    modes: [
      {
        label: "Core",
        title: "Student Agency",
        desc: "Children learn best when empowered as owners of their own learning — with advisors who provide the right level of structure for self-direction.",
        icon: "compass",
      },
      {
        label: "Pacing",
        title: "Mastery Over Timelines",
        desc: "Students are given the time they need to master a skill or concept, rather than being forced to adhere to external timelines.",
        icon: "bookOpen",
      },
      {
        label: "Community",
        title: "Multi-Age Advisories",
        desc: "Classes are grouped by independence level rather than restrictive grade categories — encouraging peer support and differentiation.",
        icon: "users",
      },
      {
        label: "Family",
        title: "Family Huddle",
        desc: "Every student begins with a collaborative planning session — child, parents, homeschool teacher, and Lab advisor design a personalized learning path together.",
        icon: "heart",
      },
    ],
    flexFriday: {
      title: "Psychosocial + Academic Growth",
      desc: "At The Lab, learning is not just about knowledge. We pay equal attention to psychosocial development, emotional well-being, and academic exploration.",
    },
  },
  stats: [
    { value: "K–8", label: "Enrichment & Tutoring" },
    { value: "Long Beach", label: "Belmont Heights" },
    { value: "501(c)(3)", label: "Nonprofit" },
    { value: "Mon–Thu", label: "9am–3pm" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Who We Are",
    heading: "Joyful, mastery-based learning in a close-knit community.",
    cards: [
      {
        title: "Belmont Heights home",
        desc: "A 501(c)(3) nonprofit that moved from downtown Long Beach to Belmont Heights in 2021 — a gathering place for joyful learning.",
      },
      {
        title: "Personalized enrichment",
        desc: "Students learn in collaborative advisories based on self-direction ability — building independence, confidence, and real ownership of learning.",
      },
      {
        title: "Charter vendor support",
        desc: "Approved vendor for Blue Ridge Academy, Epic, and Sky Mountain. PSA students are also welcomed.",
      },
      {
        title: "Financial aid available",
        desc: "A limited amount of need-based financial aid for qualifying families. All classes are non-sectarian.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/Homeschool3.jpg",
  },
  marquee: [
    "Mastery-Based",
    "Family Huddle",
    "WOW!",
    "Multi-Age",
    "Student Agency",
    "Long Beach",
    "Nonprofit",
    "K–8",
    "Charter Vendor",
    "A La Carte",
    "Global Literacy",
    "Joyful Learning",
  ],
  programs: {
    eyebrow: "Programs & Classes",
    heading: "Flexible enrichment for homeschool families",
    subtitle: "From WOW! 2-day enrichment to a la carte classes, tutoring, and literacy — supporting both flexibility and depth.",
    ctaLabel: "Learn More",
    items: [
      {
        badge: "2-Day Program",
        title: "WOW! 2-Day Homeschool Enrichment",
        teaser: "Windows to Our World! · Drop-off enrichment",
        desc: "Our signature 2-day homeschool enrichment program — collaborative, multi-age learning advisories with project-based studios, outdoor play, and mastery-paced academics.",
        details: ["K–8", "2 Days/Week", "$2,000/semester", "Family Huddle included"],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#6f8f3a]",
        accentBg: "bg-[#f7f4ef]",
      },
      {
        badge: "Flexible",
        title: "A La Carte Classes",
        teaser: "Drop-in enrichment on your schedule",
        desc: "Choose individual classes that fit your homeschool plan — enrichment, tutoring, and specialty studios without committing to a full program.",
        details: ["K–8", "Per Class", "Rolling Enrollment", "Charter PO accepted"],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#3d6b8d]",
        accentBg: "bg-[#f7f4ef]",
      },
      {
        badge: "Literacy",
        title: "Global Literacy Program",
        teaser: "Reading specialist support & literacy growth",
        desc: "Literacy-focused instruction with differentiated support — helping students unlock the power of reading at their own pace.",
        details: ["K–8", "Multi-Age", "Mastery Pacing", "Advisor-Led"],
        image: "/images/stock/Homeschool3.jpg",
        accent: "text-[#6f8f3a]",
        accentBg: "bg-[#f7f4ef]",
      },
      {
        badge: "Support",
        title: "Tutoring & Enrichment",
        teaser: "Personalized academic support",
        desc: "One-on-one and small-group tutoring sessions — math, literacy, and enrichment aligned with each student's personalized learning path.",
        details: ["K–8", "By Session", "Advisor-Matched", "Charter Funds OK"],
        image: "/images/stock/ImageFour.jpg",
        accent: "text-[#d7a64a]",
        accentBg: "bg-[#f7f4ef]",
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
      "Where everyone's a teacher",
      "and everyone's a student.",
    ],
    attribution: "— The Lab Learning Space",
    backgroundImage: "/images/stock/ImageNine.jpg",
  },
  stripImages: [
    "/images/stock/ImageEleven.jpg",
    "/images/stock/ImageTwelve.jpg",
    "/images/stock/ImageThirteen.jpg",
    "/images/stock/ImageFourteen.jpg",
    "/images/stock/Homeschool.jpg",
    "/images/stock/Homeschool2.jpg",
  ],
  timeline: {
    eyebrow: "How to Enroll",
    heading: "Three simple steps",
    headingSub: "to join The Lab community.",
    steps: [
      {
        time: "Step 1",
        activity: "Schedule a Tour",
        desc: "Book a virtual or in-person tour to see The Lab in action and meet our team.",
        image: "/images/stock/ImageEleven.jpg",
      },
      {
        time: "Step 2",
        activity: "Complete Application",
        desc: "Fill out the online application so we can learn about your child and family goals.",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        time: "Step 3",
        activity: "Confirmation & Family Huddle",
        desc: "You'll hear back within 48 hours. New students begin with a Family Huddle to design their personalized learning path.",
        image: "/images/stock/Homeschool3.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Why Families Choose The Lab",
    heading: "Personalized, joyful, and community-centered",
    subtitle:
      "A nonprofit enrichment center where students build academic confidence, independence, and real ownership of learning.",
    items: [
      {
        title: "Mastery-Based Learning",
        desc: "Inspired by the Khan Lab School — students progress when ready, not on fixed timelines.",
        icon: "graduationCap",
      },
      {
        title: "Family Huddle",
        desc: "Every student starts with a collaborative planning session with parents, advisors, and instructors.",
        icon: "heart",
      },
      {
        title: "Charter Vendor",
        desc: "Approved vendor for Blue Ridge Academy, Epic, and Sky Mountain — instructional funds accepted.",
        icon: "shield",
      },
    ],
  },
  founder: {
    eyebrow: "Our Team",
    heading: "Torry Thompson",
    headingAccent: "aka Mr. T — Executive Director.",
    paragraphs: [
      "Mr. T has been with The Lab since 2016 — first as instructor for 4th–8th grade classes, then Academic Director, and now Executive Director. A credentialed teacher and math expert, he was one of the first educators in LA County to introduce personalized, self-guided learning approaches into the classroom.",
      "Known for his ability to inspire and engage students, Mr. T continues to teach in the classroom alongside his leadership role. Parents describe him as \"the teacher you always wish your child could have.\"",
    ],
    credentials: [
      "Credentialed Teacher",
      "Math Specialist",
      "With The Lab Since 2016",
      "Khan Academy Pioneer",
    ],
    quote:
      "Children learn best when they are empowered to have personal agency as the owners of their own learning.",
    quoteAttribution: "— Torry Thompson, Mr. T",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "Long Beach, CA" },
    name: "Torry Thompson",
    title: "Executive Director & Teacher/Advisor, 5th–8th Grades",
  },
  parallax: {
    eyebrow: "Explore Our Approach",
    heading: ["Joyful.", "Personalized.", "Community."],
    subtitle:
      "A nonprofit learning space where multi-age advisories, mastery pacing, and Family Huddles create an experience that is both rigorous and joyful.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "View Classes & Pricing",
    backgroundImage: "/images/stock/Homeschool.jpg",
  },
  pillars: {
    eyebrow: "What Makes The Lab Different",
    heading: "Agency, mastery, and family partnership.",
    subtitle:
      "Four pillars woven into every program — student ownership, mastery pacing, multi-age community, and close family collaboration.",
    items: [
      {
        icon: "compass",
        title: "Student Agency",
        desc: "Advisors provide the right level of structure so each child develops personal agency and self-management skills.",
      },
      {
        icon: "bookOpen",
        title: "Mastery Pacing",
        desc: "Students master skills at their own pace — no forced timelines that don't fit their learning style.",
      },
      {
        icon: "users",
        title: "Multi-Age Advisories",
        desc: "Grouped by independence level, not grade — encouraging peer support and differentiated instruction.",
      },
      {
        icon: "heart",
        title: "Family Huddle",
        desc: "Collaborative planning with parents, homeschool teachers, and Lab advisors to design each child's path.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Interested in WOW! or a la carte classes? Schedule a tour to see our community in action.",
    sidebarImage: "/images/stock/Homeschool2.jpg",
    eyebrow: "Schedule a Tour",
    heading: "Visit The Lab.",
    description:
      "Book a virtual or in-person tour to explore our programs, meet our team, and learn how Family Huddles work. We'll respond within 48 hours.",
    submitLabel: "Schedule a Tour",
    disclaimer:
      "317 Termino Ave, Long Beach, CA 90814 · info@lablearning.org · (562) 435-7879",
    trustNote: "No spam. Just a personal reply from our team.",
    successEmoji: "✓",
    successTitle: "Tour request received!",
    successMessage:
      "Thank you for your interest in The Lab Learning Space. We'll reach out within 48 hours to confirm your tour.",
    programOptions: [
      { value: "wow", label: "WOW! 2-Day Homeschool Enrichment" },
      { value: "ala-carte", label: "A La Carte Classes" },
      { value: "literacy", label: "Global Literacy Program" },
      { value: "tutoring", label: "Tutoring & Enrichment" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Child's Name",
      gradePlaceholder: "Select grade...",
      gradeOptions: [
        { value: "tk-k", label: "TK–Kindergarten" },
        { value: "1-2", label: "Grades 1–2" },
        { value: "3-4", label: "Grades 3–4" },
        { value: "5-8", label: "Grades 5–8" },
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions families ask",
    subtitle:
      "Common questions about enrollment, charter funds, financial aid, and our programs.",
    items: [
      {
        q: "When do you accept applications?",
        a: "Students may enroll in Lab classes at any time of the year depending on space available. We recommend starting with a tour and application.",
      },
      {
        q: "Can I use charter instructional funds?",
        a: "Yes, if we are an approved vendor for your charter school (Blue Ridge Academy, Epic, Sky Mountain). Request that your EF or Supervising Teacher submit a PO before classes begin.",
      },
      {
        q: "Do you offer financial aid?",
        a: "We provide a limited amount of needs-based financial aid for qualifying families not enrolled in an NCB charter. Email info@lablearning.org for an application.",
      },
      {
        q: "What is a Family Huddle?",
        a: "When a student begins at The Lab, we start with a collaborative session — child, parents, homeschool teacher, and Lab advisor design a personalized learning path together.",
      },
      {
        q: "What are school hours?",
        a: "Classes run Monday through Thursday, 9am–3pm. Administrative hours are Friday, 10am–2pm.",
      },
      {
        q: "What if we leave before the semester ends?",
        a: "We require 30-days written notice to disenroll. Fees are prorated based on enrollment dates. Email info@lablearning.org to notify us.",
      },
      {
        q: "Are classes non-sectarian?",
        a: "Yes. All classes provided at The Lab are non-sectarian.",
      },
      {
        q: "I'm new to homeschooling — can you help?",
        a: "We'd be happy to connect you with other families in the homeschooling community. Email info@lablearning.org and we'll help you explore charter and PSA options.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Ready to Visit?",
    heading: "Schedule a tour and see",
    headingAccent: "The Lab in action.",
    description:
      "Explore WOW!, a la carte classes, and our mastery-based approach. We'll help you find the right fit for your child and family.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Apply Now",
  },
  footer: {
    tagline: "Nonprofit enrichment · Long Beach, CA",
    links: ["Programs", "Our Approach", "Admissions", "FAQ", "Contact"],
    copyright: "© 2026 The Lab Learning Space",
    poweredBy: "Website concept by MudKitchen",
  },
};
