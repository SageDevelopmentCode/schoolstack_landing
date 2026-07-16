import type { SchoolWebsiteDemoConfig } from "./types";
import { TRUE_NORTH_ADMIN_LOGO } from "./truenorth-admin-demo";

export const trueNorthConfig: SchoolWebsiteDemoConfig = {
  slug: "true-north",
  schoolName: "True North",
  theme: {
    primary: "#254EDB",
    primaryHover: "#1D3FB0",
    dark: "#254EDB",
    darkHover: "#1D3FB0",
    lightBg: "#EEF2FF",
    lightBorder: "#E3E5E7",
    muted: "#6B7280",
    badgeBg: "#EEF2FF",
    accentText: "#3B6FE8",
    pageBg: "#F8F8F8",
  },
  logo: TRUE_NORTH_ADMIN_LOGO,
  hero: {
    eyebrow: "Grades 1–12 · The Woodlands, TX · Christian Education",
    eyebrowPlacement: "announcementBar",
    headline: ["Educating students while", "maintaining a True North."],
    headlineClassName:
      "text-3xl md:text-[2.75rem] font-bold text-white font-heading leading-[1.1] mb-3",
    subheadline:
      "A Christian, biblically based parent partnership for grades 1–12 in The Woodlands — academic challenge, spiritual encouragement, and family time at home.",
    primaryCta: "Request Information",
    secondaryCta: "Explore Programs",
    secondaryCtaTarget: "signature",
    navCta: "Request Info",
    navLinks: ["Programs", "Our Mission", "Admissions", "FAQ"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/Homeschool3.jpg"],
    imageAlt: "Students learning in a close-knit Christian school community",
    trustBadges: ["Christian & Biblically Based", "Grades 1–12", "Affordable"],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "hybridRhythm",
    eyebrow: "The Two-Day Model",
    heading: "Two days on campus. Five days of family life.",
    subtitle:
      "True North partners with families through a parent partnership model — rigorous on-campus instruction twice a week, with home days that preserve family time and biblical formation.",
    tagline: "Educating students while maintaining a True North.",
    campusDays: [
      {
        label: "Tuesdays",
        title: "Academic Day",
        desc: "Bible, History, Reading/Writing, Math, and Science — with differentiated instruction so advanced learners are challenged and struggling students receive support.",
      },
      {
        label: "Thursdays",
        title: "Core + Enrichment Day",
        desc: "Math and English meet again alongside enrichment classes — cheerleading, volleyball, debate, cooking, sign language, keyboarding, and self-defense.",
      },
    ],
    homeDays: [
      {
        label: "Mon · Wed · Fri",
        title: "Home & Family Days",
        desc: "Families continue learning at home on off-days — preserving family time while students build lasting friendships and participate in athletics and extracurriculars.",
      },
      {
        label: "Full Program Only",
        title: "Two-Day Partnership",
        desc: "Students register for the complete two-day program at $417/month (first student). Multi-student families receive a discounted rate of $367/month for additional children.",
      },
    ],
    serviceNote:
      "Books and uniforms are purchased separately. Athletics programs are available per season at an additional cost.",
  },
  stats: [
    { value: "Grades 1–12", label: "Lower, Middle & High School" },
    { value: "2 Days/Week", label: "Tues & Thurs On Campus" },
    { value: "$417/mo", label: "First Student Tuition" },
    { value: "The Woodlands", label: "Texas" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Why Families Choose True North",
    heading: "Strong academics, Christ-centered direction, and room for family life.",
    cards: [
      {
        title: "Differentiated academics",
        desc: "Core lessons taught to the student — advanced learners reach higher while work is simplified for those who need extra support.",
      },
      {
        title: "Christ-centered, biblically based",
        desc: "Bible is our most important class. We equip students to stand firm in a world moving away from biblically based truths.",
      },
      {
        title: "Affordable parent partnership",
        desc: "Filling the financial gap between public and private school — love Jesus, love children, teach excellence.",
      },
      {
        title: "Family-friendly hybrid schedule",
        desc: "Two on-campus days with home days that preserve family time, friendships, athletics, and extracurricular activities.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/Homeschool3.jpg",
  },
  marquee: [
    "Christian",
    "Biblically Based",
    "Grades 1–12",
    "Differentiated Instruction",
    "Affordable",
    "The Woodlands",
    "Parent Partnership",
    "Athletics",
    "Enrichment",
    "Bible First",
    "Tues & Thurs",
    "Family Balance",
  ],
  programs: {
    eyebrow: "Grade Levels",
    heading: "Programs for every stage",
    subtitle: "Click each grade band to explore classes, curriculum, and what enrollment looks like.",
    ctaLabel: "Learn More",
    items: [
      {
        badge: "Lower School",
        title: "Grades 1st–2nd",
        teaser: "Combined class with dedicated Bible teacher",
        desc: "First and second grade students learn together with the same teacher throughout each class, except Bible — which has a separate instructor to ensure it remains the focus for the entire allotted time.",
        details: ["Bible", "History", "Reading", "Writing", "Math", "Science"],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#254EDB]",
        accentBg: "bg-[#EEF2FF]",
      },
      {
        badge: "Lower School",
        title: "Grades 3rd–4th",
        teaser: "Differentiated lower school instruction",
        desc: "Third and fourth grade students share a classroom with differentiated instruction. Assignments and rubrics adapt to higher-level thinking or simplified support as needed.",
        details: ["Bible", "History", "Grammar", "Reading/Writing", "Math", "Science"],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#3B6FE8]",
        accentBg: "bg-[#EEF2FF]",
      },
      {
        badge: "Middle School",
        title: "Grades 5th–8th",
        teaser: "Subject teachers with differentiated rubrics",
        desc: "Fifth through eighth grade students meet with different teachers for different subjects. Both grade levels within each band share core lessons with instruction adapted to each student.",
        details: ["Bible", "History", "Grammar", "Reading/Writing", "Math", "Science"],
        image: "/images/stock/Homeschool3.jpg",
        accent: "text-[#333333]",
        accentBg: "bg-[#EEF2FF]",
      },
      {
        badge: "High School",
        title: "Grades 9th–12th",
        teaser: "College-preparatory core curriculum",
        desc: "High school students meet with subject teachers for Bible, History, English, Math, and Science — using IEW, Apologia, MathUSee, Bob Jones, and other proven curricula.",
        details: ["Bible", "History", "English", "Math", "Science", "IEW · Apologia · MathUSee"],
        image: "/images/stock/ImageFour.jpg",
        accent: "text-[#254EDB]",
        accentBg: "bg-[#EEF2FF]",
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
      "Our mission is to love Jesus, love children, teach excellence,",
      "and bring Godly direction back to the next generation.",
    ],
    attribution: "— True North Mission Statement",
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
    eyebrow: "Weekly Rhythm",
    heading: "A schedule designed for",
    headingSub: "learning and family life.",
    steps: [
      {
        time: "Monday",
        activity: "Monday at Home",
        desc: "Families continue coursework at home — preserving family time and reinforcing lessons from campus days.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "Tuesday",
        activity: "Academic Campus Day",
        desc: "Full academic classes: Bible, History, Reading/Writing, Math, and Science with differentiated instruction.",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        time: "Wednesday",
        activity: "Wednesday at Home",
        desc: "Another day at home for independent study, family activities, and spiritual formation.",
        image: "/images/stock/ImageFour.jpg",
      },
      {
        time: "Thursday",
        activity: "Core + Enrichment Day",
        desc: "Math and English return alongside enrichment — debate, cooking, sign language, athletics, and more.",
        image: "/images/stock/Homeschool3.jpg",
      },
      {
        time: "Friday",
        activity: "Home & Community Day",
        desc: "Family time, athletics, extracurriculars, and community — students build friendships beyond the classroom.",
        image: "/images/stock/ImageSeven.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Our Mission",
    heading: "Love Jesus. Love children. Teach excellence.",
    subtitle:
      "We bring Godly direction back to the next generation in an affordable way — filling the financial gap between public and private schools.",
    items: [
      {
        title: "Christian & Biblically Based",
        desc: "We are a Christian organization grounded in biblical truth, equipping students to stand firm with integrity.",
        icon: "shield",
      },
      {
        title: "Differentiated Instruction",
        desc: "Teachers instruct to the student — advanced learners are challenged while struggling students receive adapted support.",
        icon: "graduationCap",
      },
      {
        title: "Whole-Child Development",
        desc: "Academic challenge, spiritual encouragement, and social support — with lasting friendships and extracurriculars.",
        icon: "heart",
      },
    ],
  },
  founder: {
    eyebrow: "Our Story",
    heading: "Built on faith, service,",
    headingAccent: "and a heart for children.",
    paragraphs: [
      "True North was founded by a family with deep roots in Christian ministry — from a personal Christmas outreach that began in college to mission trips in Mexico, Costa Rica, and Haiti.",
      "With experience leading youth groups, Mom's Day Out programs, angel tree ministries, and school board service, our founding family brings decades of heart for children and community to every classroom.",
    ],
    credentials: [
      "Christian Parent Partnership",
      "The Woodlands, TX",
      "Grades 1–12",
      "Mission-Driven Leadership",
    ],
    quote:
      "We want every student to build lasting friendships, participate in athletics or extracurricular activities, while still maintaining family time outside of school.",
    quoteAttribution: "— True North Founding Family",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "The Woodlands, TX" },
    name: "Founding Family",
    title: "True North Education",
  },
  parallax: {
    eyebrow: "Why True North?",
    heading: ["Academic.", "Spiritual.", "Affordable."],
    subtitle:
      "A comprehensive educational program for students in first through twelfth grade — challenging academically, encouraging spiritually, and supporting socially.",
    primaryCta: "Request Information",
    secondaryCta: "Watch Info Videos",
    backgroundImage: "/images/stock/Homeschool.jpg",
  },
  pillars: {
    eyebrow: "What Makes Us Different",
    heading: "Faith, excellence, and family balance.",
    subtitle:
      "Three pillars woven into every day — biblical grounding, academic rigor, and a schedule that honors family life.",
    items: [
      {
        icon: "bookOpen",
        title: "Academic Excellence",
        desc: "Rigorous core curriculum with differentiated instruction across every grade band — from lower school through high school.",
      },
      {
        icon: "heart",
        title: "Biblical Formation",
        desc: "Bible is our most important class. Christ-centered direction woven into every subject and every relationship.",
      },
      {
        icon: "users",
        title: "Social Belonging",
        desc: "Lasting friendships, athletics, debate, cooking, and enrichment — a complete education with community.",
      },
      {
        icon: "compass",
        title: "Family Partnership",
        desc: "Two on-campus days with home days that preserve family time — an affordable bridge between public and private school.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Ready to find out if True North is the right fit for your family?",
    sidebarImage: "/images/stock/Homeschool2.jpg",
    eyebrow: "Admissions Open",
    heading: "Request information.",
    description:
      "Tell us about your child and we'll reach out to answer your questions or invite you to a virtual information meeting. No commitment required.",
    submitLabel: "Submit Inquiry",
    disclaimer:
      "We'll respond within a few business days. Email info@truenortheducation.weebly.com with any questions.",
    trustNote: "No spam. Just a personal reply from our team.",
    successEmoji: "✓",
    successTitle: "Inquiry received!",
    successMessage:
      "Thank you for reaching out to True North. We'll be in touch soon to discuss next steps.",
    programOptions: [
      { value: "lower-1-2", label: "Lower School · Grades 1st–2nd" },
      { value: "lower-3-4", label: "Lower School · Grades 3rd–4th" },
      { value: "middle-5-8", label: "Middle School · Grades 5th–8th" },
      { value: "high-9-12", label: "High School · Grades 9th–12th" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Child's Name",
      gradePlaceholder: "Select grade level...",
      gradeOptions: [
        { value: "1-2", label: "Grades 1st–2nd" },
        { value: "3-4", label: "Grades 3rd–4th" },
        { value: "5-6", label: "Grades 5th–6th" },
        { value: "7-8", label: "Grades 7th–8th" },
        { value: "9-12", label: "Grades 9th–12th" },
        { value: "multiple", label: "Multiple Children" },
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions parents ask",
    subtitle:
      "Common questions about our Christian parent partnership, programs, and admissions process.",
    items: [
      {
        q: "What grades does True North serve?",
        a: "True North offers a comprehensive educational program for students in first through twelfth grade, organized into Lower School (1st–4th), Middle School (5th–8th), and High School (9th–12th) grade bands.",
      },
      {
        q: "What is the tuition?",
        a: "Base tuition is $417 per month for the first student ($3,753 per year) for the full two-day program. Additional students in the same family receive a discounted rate of $367 per month ($3,303 per year). Books, uniforms, and athletics are separate costs.",
      },
      {
        q: "What days do students attend?",
        a: "Students attend on Tuesdays for academic classes and Thursdays for math, English, and enrichment. Monday, Wednesday, and Friday are home learning days as part of our parent partnership model.",
      },
      {
        q: "Can we enroll in enrichment only?",
        a: "No — students must register for the full two-day program. We do not offer enrichment-only days or à la carte classes in order to keep costs affordable for families.",
      },
      {
        q: "What curriculum do you use?",
        a: "High school uses Institute for Excellence in Writing, Lost Tools of Writing, Fix It Grammar, Apologia and Bob Jones Science, My Story and Bible LifePacs for History, MathUSee and McGraw Hill for Math, and the Bible for Bible class.",
      },
      {
        q: "What enrichment classes are offered?",
        a: "Thursday enrichment includes cheerleading, volleyball, debate, cooking, sign language, keyboarding, and self-defense — giving students social interaction and a complete education.",
      },
      {
        q: "Is True North a faith-based school?",
        a: "Yes — we are a Christian organization that is biblically based. Our mission is to love Jesus, love children, teach excellence, and bring Godly direction back to the next generation.",
      },
      {
        q: "How do I learn more before applying?",
        a: "We offer five virtual information meeting videos on our website. Watch all five to get a complete picture of True North, then reach out through our inquiry form or email info@truenortheducation.weebly.com.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Admissions",
    heading: "Ready to find out if True North",
    headingAccent: "is the right fit?",
    description:
      "Request information to learn more about our programs, watch our virtual info videos, or start a conversation about whether True North is right for your family.",
    primaryCta: "Request Information",
    secondaryCta: "Watch Info Videos",
  },
  footer: {
    tagline: "Christian parent partnership · The Woodlands, TX · Grades 1–12",
    links: ["Programs", "Our Mission", "Info Videos", "FAQ", "Contact", "Giving"],
    copyright: "© 2026 True North Education",
    poweredBy: "Website concept by MudKitchen",
  },
};
