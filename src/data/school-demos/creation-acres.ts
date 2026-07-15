import type { SchoolWebsiteDemoConfig } from "./types";
import { CREATION_ACRES_ADMIN_LOGO } from "./creationacres-admin-demo";

export const creationAcresConfig: SchoolWebsiteDemoConfig = {
  slug: "creation-acres",
  schoolName: "Creation Acres Montessori",
  theme: {
    primary: "#396EB4",
    primaryHover: "#203F67",
    dark: "#203F67",
    darkHover: "#203F67",
    lightBg: "#EBF4FA",
    lightBorder: "#C2DFF0",
    muted: "#6F6558",
    badgeBg: "#E8F2FA",
    accentText: "#457B9D",
    pageBg: "#F8FBFE",
  },
  logo: CREATION_ACRES_ADMIN_LOGO,
  hero: {
    eyebrow: "2026–2027 Admissions Open · Mint Hill, NC · Ages 3–15",
    eyebrowPlacement: "announcementBar",
    headline: ["A Christ-Centered,", "Montessori Microschool"],
    subheadline:
      "Creation Acres is a Christ-centered Montessori microschool in Mint Hill serving the Charlotte area where children are known, encouraged, and challenged. Students learn at their own pace through hands-on work, meaningful projects, and a close-knit community that feels like family.",
    primaryCta: "Request Information",
    secondaryCta: "Explore Programs",
    secondaryCtaTarget: "signature",
    navCta: "Request Info",
    navLinks: ["Programs", "Daily Life", "Admissions", "FAQ"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/Homeschool3.jpg"],
    imageAlt: "Children learning outdoors in a close-knit Montessori community",
    trustBadges: [
      "Mixed-Age Classrooms",
      "NC Opportunity Scholarship",
      "Learner-Driven",
      "Small Classes",
    ],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "farmExperience",
    eyebrow: "Where Learning Meets Purpose",
    heading: "Montessori, faith, and the farm",
    subtitle:
      "A three-way blend of child-centered Montessori learning, Christ-centered formation, and outdoor experiences rooted in nature and community.",
    paths: [
      {
        title: "Christian Montessori Microschool",
        desc: "A 4- or 5-day full-time private school for ages 3–15 blending Montessori principles with Christian values across Primary, Elementary, and Adolescent programs.",
        icon: "bookOpen",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        title: "Outdoor Hybrid Program",
        desc: "Fall 2026 — two days per week of hands-on, farm and nature-based learning with applied academics adapted to each student's developmental level.",
        icon: "treePine",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        title: "Nanoschool & Friday Enrichment",
        desc: "A one-day Friday program for ages 5–14 with baking, homesteading, science exploration, maker space, storytelling, and book clubs.",
        icon: "sparkles",
        image: "/images/stock/Homeschool3.jpg",
      },
      {
        title: "Our Farm",
        desc: "A new farm on Allen Black Road, just minutes from our schoolhouse — expanding outdoor learning and real-life experiences for our community.",
        icon: "leaf",
        image: "/images/stock/ImageFour.jpg",
      },
    ],
  },
  stats: [
    { value: "Ages 3–15", label: "Primary, Elementary & Adolescent" },
    { value: "Mint Hill", label: "Serving Charlotte Area" },
    { value: "Mixed-Age", label: "Small Classrooms" },
    { value: "NC Scholarship", label: "Opportunity Scholarship Accepted" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "A Schoolhouse That Feels Like Home",
    heading: "Where friends become family and learning is hands-on.",
    cards: [
      {
        title: "More freedom, less pressure",
        desc: "A comfortable place where children have a voice and room to explore personal interests.",
      },
      {
        title: "Mixed-age Montessori classrooms",
        desc: "Learner-driven, project-based work that meets each child where they are academically.",
      },
      {
        title: "Christ-centered values",
        desc: "Nondenominational Christian beliefs woven into daily kindness, empathy, and faith.",
      },
      {
        title: "Outdoor and farm-based learning",
        desc: "Hands-on experiences rooted in nature, community, and God's creation.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/ImageFour.jpg",
  },
  marquee: [
    "Christ-Centered",
    "Montessori Microschool",
    "Mixed-Age Classrooms",
    "Learner-Driven",
    "Mint Hill NC",
    "Charlotte Area",
    "NC Opportunity Scholarship",
    "Hands-On Learning",
    "Farm & Nature",
    "Friday Enrichment",
    "Small Classes",
    "Close Community",
  ],
  programs: {
    eyebrow: "Our Programs",
    heading: "Pathways for every family",
    subtitle: "Click each option to explore what enrollment looks like for your child.",
    ctaLabel: "Learn More",
    items: [
      {
        badge: "Full-Time",
        title: "Christian Montessori Microschool",
        teaser: "4-day or 5-day full-time private school",
        desc: "Our Microschool offers a student-led, hands-on learning experience for children ages 3 to 15, blending Montessori principles with Christian values. Classrooms foster curiosity, independence, and academic excellence.",
        details: ["Ages 3–15", "4 or 5 Days/Week", "Primary · Elementary · Adolescent", "Request tuition details"],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#396EB4]",
        accentBg: "bg-[#EBF4FA]",
      },
      {
        badge: "Hybrid",
        title: "Outdoor Hybrid Program",
        teaser: "Fall 2026 · 2 days per week",
        desc: "Students engage in hands-on, outdoor learning rooted in real-life farm and nature-based experiences. Applied academics are integrated into each topic and adapted to students' developmental levels.",
        details: ["Ages 5–15", "2 Days/Week", "Farm & Nature-Based", "Fall 2026 Launch"],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#457B9D]",
        accentBg: "bg-[#EBF4FA]",
      },
      {
        badge: "Enrichment",
        title: "Nanoschool & Friday Enrichment",
        teaser: "One-day Friday program for ages 5–14",
        desc: "Open to both Microschool and homeschooled students. Each Friday, students participate in baking, homesteading, science exploration, storytelling, maker space, brick building, and book clubs.",
        details: ["Ages 5–14", "Fridays Only", "Microschool & Homeschool", "Spring 2026 Nanoschool"],
        image: "/images/stock/Homeschool3.jpg",
        accent: "text-[#82D1F7]",
        accentBg: "bg-[#EBF4FA]",
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
      "This school has been transformative for our family.",
      "My daughter feels truly loved and welcomed here.",
    ],
    attribution: "— Grateful Creation Acres Parent",
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
    eyebrow: "Daily Rhythm",
    heading: "A day designed for focus,",
    headingSub: "growth, and belonging.",
    steps: [
      {
        time: "8:10–8:30",
        activity: "Arrive & Settle",
        desc: "Warm welcome, greetings, and a calm start to the day — shoes come off and classmates become family.",
        image: "/images/stock/ImageEleven.jpg",
      },
      {
        time: "8:30–11:30",
        activity: "Morning Work",
        desc: "Deep, uninterrupted Montessori work — math, language, practical life, and more at each child's pace.",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        time: "11:30–12:30",
        activity: "Lunch & Recess",
        desc: "Community meals and outdoor play — a chance to connect, rest, and recharge together.",
        image: "/images/stock/ImageFour.jpg",
      },
      {
        time: "12:30–3:15",
        activity: "Afternoon Work",
        desc: "Follow-up work, creative pursuits, and secondary lessons that extend the morning's discoveries.",
        image: "/images/stock/Homeschool3.jpg",
      },
      {
        time: "3:15–3:30",
        activity: "Community Care",
        desc: "Tidy together, reflect on the day, and prepare to head home — caring for the space we share.",
        image: "/images/stock/ImageSeven.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Trust & Community",
    heading: "Rooted in faith, Montessori, and family warmth",
    subtitle:
      "A Christ-centered microschool where children are known, supported, and inspired to take ownership of their learning.",
    items: [
      {
        title: "NC Opportunity Scholarship",
        desc: "We proudly accept the NC Opportunity Scholarship for our Microschool and Nanoschool programs.",
        icon: "shield",
      },
      {
        title: "Mixed-Age Montessori",
        desc: "Small classrooms where students learn at their own pace through hands-on work and meaningful projects.",
        icon: "graduationCap",
      },
      {
        title: "Close-Knit Community",
        desc: "A schoolhouse that feels like home — where friends become family and learning is fun.",
        icon: "heart",
      },
    ],
  },
  founder: {
    eyebrow: "Meet the Founders",
    heading: "Built by a homeschooling family.",
    headingAccent: "Inspired by a love for community.",
    paragraphs: [
      "Jasmine and Akeem are a former homeschooling family with four children, each with wildly different personalities and learning types. In 2023, they took a leap of faith and purchased a house in downtown Mint Hill to convert into a school.",
      "Jasmine loves teaching and is pursuing AMI 12–18 Montessori teacher certification. Akeem is a coding expert and director of web development. Together, they've built Creation Acres into a place where children and adolescents find their voice.",
    ],
    credentials: [
      "AMI Montessori Certification (in progress)",
      "Former Homeschooling Family",
      "Mint Hill, NC Campus",
      "Ages 3–15 · Expanding to 12th Grade",
    ],
    quote:
      "We believe schools should offer more freedom, less pressure, and a lot of space to explore personal interests.",
    quoteAttribution: "— Jasmine & Akeem, Founders",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "Mint Hill, NC" },
    name: "Jasmine & Akeem",
    title: "Founders, Creation Acres Montessori",
  },
  parallax: {
    eyebrow: "Why Creation Acres?",
    heading: ["Known.", "Encouraged.", "Challenged."],
    subtitle:
      "A Christ-centered Montessori microschool where children learn at their own pace through hands-on work, meaningful projects, and a close-knit community that feels like family.",
    primaryCta: "Request Information",
    secondaryCta: "Schedule a Tour",
    backgroundImage: "/images/stock/Homeschool.jpg",
  },
  pillars: {
    eyebrow: "What Makes Us Different",
    heading: "Montessori, faith, and the outdoors.",
    subtitle:
      "Three pillars woven into every day — child-centered learning, Christ-centered formation, and farm-based experiences.",
    items: [
      {
        icon: "bookOpen",
        title: "Montessori Learning",
        desc: "Learner-driven, hands-on work in mixed-age classrooms where curiosity and independence flourish.",
      },
      {
        icon: "heart",
        title: "Christ-Centered Formation",
        desc: "Nondenominational Christian values integrated into daily kindness, empathy, and faith.",
      },
      {
        icon: "treePine",
        title: "Outdoor & Farm Experiences",
        desc: "Nature-based learning on our farm and in the community — rooted in real-life experiences.",
      },
      {
        icon: "users",
        title: "Close-Knit Community",
        desc: "A schoolhouse that feels like home, where every child is known, encouraged, and challenged.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Ready to find out if Creation Acres is the right fit for your family?",
    sidebarImage: "/images/stock/Homeschool2.jpg",
    eyebrow: "2026–2027 Admissions Open",
    heading: "Request information.",
    description:
      "Tell us about your child and we'll reach out to schedule a tour or answer your questions. No commitment required.",
    submitLabel: "Submit Inquiry",
    disclaimer: "We'll respond within a few business days. Call (704) 412-8911 with any questions.",
    trustNote: "No spam. Just a personal reply from our team.",
    successEmoji: "✓",
    successTitle: "Inquiry received!",
    successMessage:
      "Thank you for reaching out to Creation Acres Montessori. We'll be in touch soon to discuss next steps.",
    programOptions: [
      { value: "microschool", label: "Christian Montessori Microschool" },
      { value: "outdoor-hybrid", label: "Outdoor Hybrid Program (Fall 2026)" },
      { value: "nanoschool", label: "Nanoschool & Friday Enrichment" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Child's Name",
      gradePlaceholder: "Select program level...",
      gradeOptions: [
        { value: "primary", label: "Primary (Ages 3–6)" },
        { value: "elementary", label: "Elementary (Ages 6–12)" },
        { value: "adolescent", label: "Adolescent (Ages 12–15)" },
        { value: "multiple", label: "Multiple Children" },
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions parents ask",
    subtitle:
      "Common questions about our Montessori microschool, programs, and admissions process.",
    items: [
      {
        q: "What ages and programs do you serve?",
        a: "Creation Acres serves children ages 3–15 across Primary, Elementary, and Adolescent Montessori programs. We also offer an Outdoor Hybrid Program (Fall 2026) and Friday Nanoschool enrichment for ages 5–14.",
      },
      {
        q: "What is a Montessori microschool?",
        a: "A microschool is a small community of learners — 'micro' refers to the number of students, not the impact. Our PreK–9th microschool offers a full academic curriculum in an empowering, collaborative environment with mixed-age classrooms.",
      },
      {
        q: "Do you accept the NC Opportunity Scholarship?",
        a: "Yes — we proudly accept the NC Opportunity Scholarship for our Microschool and Nanoschool programs.",
      },
      {
        q: "What is the admissions process?",
        a: "Submit an application ($75 fee), schedule a parent interview, complete a trial day for your child, then receive an admissions decision. Accepted families submit an enrollment contract, $75 registration fee, and $750 tuition deposit within 10 days.",
      },
      {
        q: "What does a typical day look like?",
        a: "Students arrive and settle (8:10–8:30), engage in deep morning Montessori work (8:30–11:30), enjoy lunch and recess, continue with afternoon work and creative pursuits (12:30–3:15), then tidy and reflect together before heading home.",
      },
      {
        q: "Is Creation Acres a faith-based school?",
        a: "Yes — we are a Christ-centered, nondenominational Montessori microschool. Christian values are integrated into daily learning through kindness, empathy, and faith.",
      },
      {
        q: "Tell me about the farm.",
        a: "We now have a farm on Allen Black Road, just a few minutes from our current schoolhouse. It expands our outdoor learning with farming, animal care, and nature-based experiences.",
      },
      {
        q: "Can homeschooled students participate?",
        a: "Yes — homeschooled students can co-enroll in our Nanoschool Friday enrichment program and our Outdoor Hybrid Program. Our microschool also welcomes families transitioning from homeschool.",
      },
    ],
  },
  closingCta: {
    eyebrow: "2026–2027 Admissions",
    heading: "Ready to find out if Creation Acres",
    headingAccent: "is the right fit?",
    description:
      "Request information to learn more about our programs, schedule a tour, or start a conversation about whether Creation Acres is right for your family.",
    primaryCta: "Request Information",
    secondaryCta: "Schedule a Tour",
  },
  footer: {
    tagline: "Christ-centered Montessori microschool · Mint Hill, NC",
    links: ["Programs", "Daily Life", "Admissions", "FAQ", "Contact"],
    copyright: "© 2026 Creation Acres Montessori",
    poweredBy: "Website concept by MudKitchen",
  },
};
