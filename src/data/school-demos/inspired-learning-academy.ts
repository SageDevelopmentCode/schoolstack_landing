import type { SchoolWebsiteDemoConfig } from "./types";
import { INSPIRED_LEARNING_LOGO } from "./inspired-learning-academy-admin-demo";

const LOGO_SRC = INSPIRED_LEARNING_LOGO.src;

export const inspiredLearningConfig: SchoolWebsiteDemoConfig = {
  slug: "inspired-learning-academy",
  schoolName: "Inspired Learning Academy",
  theme: {
    primary: "#B84032",
    primaryHover: "#9A3529",
    dark: "#373737",
    darkHover: "#2A2A2A",
    lightBg: "#F7F7F5",
    lightBorder: "#E7E5E3",
    muted: "#686868",
    badgeBg: "#FFF2EF",
    accentText: "#FC6D5D",
    pageBg: "#FFFFFF",
  },
  logo: INSPIRED_LEARNING_LOGO,
  hero: {
    eyebrow: "2026–2027: Limited middle school spots. High school waiting list only.",
    eyebrowPlacement: "announcementBar",
    headline: ["More Ownership. More Growth.", "A Better Fit Than Traditional School"],
    headlineAccentLine: 0,
    headlineAccentClassName: "text-[#FC6D5D]",
    subheadline:
      "A smaller, mentor-supported school for capable middle and high school students who need more connection, meaningful work, and room to grow.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "See How It Works",
    secondaryCtaTarget: "signature",
    navCta: "Schedule a Tour",
    navLinks: ["How It Works", "Who It’s For", "Contact", "FAQ"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/ImageEleven.jpg", "/images/stock/Homeschool.jpg"],
    imageAlt: "Demo placeholder — student photography pending school approval",
    trustBadges: ["Grades 6–12", "Hybrid microschool", "Allen, TX", "Secular"],
    tagline: "Hybrid microschool for grades 6–12 in Allen, TX",
  },
  sections: {
    showMosaic: false,
    showStrip: false,
    showParallax: false,
  },
  signatureSection: {
    type: "hybridRhythm",
    eyebrow: "The hybrid week",
    heading: "A school week built for connection and independence.",
    subtitle:
      "This is a five-day program, not a three-day school. Students are on campus Tuesday through Thursday and learn remotely on Monday and Friday.",
    tagline: "Allen, Texas · Grades 6–12",
    campusDays: [
      {
        label: "On campus",
        title: "Tuesday–Thursday",
        desc: "9:00 am–3:45 pm. In-person classes, collaborative work, projects, and mentoring.",
      },
    ],
    homeDays: [
      {
        label: "Remote",
        title: "Monday & Friday",
        desc: "9:15 am–3:45 pm. Independent study with ongoing virtual check-ins.",
      },
    ],
    serviceNote:
      "One campus in Allen. Families also come from McKinney, Fairview, Plano, Lucas, Frisco, and Parker — those cities are not additional campuses.",
  },
  stats: [
    { value: "6–12", label: "Grades" },
    { value: "Tue–Thu", label: "On campus · Mon & Fri remote" },
    { value: "Allen, TX", label: "601 S Greenville Ave" },
    { value: "TEFA", label: "Funds accepted" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "There’s another way school can feel.",
    heading: "For capable teens who are not fully engaged.",
    cards: [
      {
        title: "Ownership and follow-through",
        desc: "Students take more ownership of their work and follow through with confidence.",
      },
      {
        title: "Known and connected",
        desc: "Students feel known, supported, and genuinely connected to peers and mentors.",
      },
      {
        title: "Meaningful work",
        desc: "Students engage in work that challenges them and helps them grow — beyond worksheets alone.",
      },
      {
        title: "A mutual fit",
        desc: "Inspired may not be the best fit for students who need frequent one-on-one academic intervention or a highly teacher-directed environment.",
      },
    ],
    mainImage: "/images/stock/ImageEleven.jpg",
    secondaryImage: "/images/stock/Homeschool.jpg",
  },
  marquee: [
    "Ownership",
    "Mentorship",
    "Grades 6–12",
    "Allen, Texas",
    "Tuesday–Thursday Campus",
    "Monday & Friday Remote",
    "Passion Projects",
    "Meaningful Work",
    "Secular & Independent",
    "Schedule a Tour",
  ],
  programs: {
    eyebrow: "Learning beyond assignments",
    heading: "Mentorship, projects, and proof of learning",
    subtitle:
      "Progress is documented through mentoring, Passion Projects, presentations, and digital badges. These are school-described practices, not extra guarantees.",
    ctaLabel: "Schedule a Tour",
    items: [
      {
        badge: "Mentoring",
        title: "Weekly one-on-one mentoring",
        teaser: "Goals, progress, and challenges",
        desc: "Each student meets with a mentor for regular check-ins focused on goals, progress, and challenges, and for help building a personalized learning plan.",
        details: ["Weekly check-ins", "Personalized plan", "Parent communication"],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#B84032]",
        accentBg: "bg-[#FFF2EF]",
      },
      {
        badge: "Projects",
        title: "Passion Projects",
        teaser: "End-of-semester Passion Project Nights",
        desc: "Students pursue work that matters to them and share it at Passion Project Nights. The school does not guarantee internships or specific project placements.",
        details: ["Student-chosen work", "Semester nights", "Real-world application"],
        image: "/images/stock/ImageEleven.jpg",
        accent: "text-[#B84032]",
        accentBg: "bg-[#FFF2EF]",
      },
      {
        badge: "Present",
        title: "Presentation of Learning",
        teaser: "A live audience",
        desc: "Students present their learning before a live audience — practice in communication, collaboration, and thoughtful engagement.",
        details: ["Live audience", "Communication", "Reflection"],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#B84032]",
        accentBg: "bg-[#FFF2EF]",
      },
      {
        badge: "Badges",
        title: "60+ digital badges",
        teaser: "Designed by students for students",
        desc: "The school describes 60+ digital badges, designed by students for students, as one way learning is documented alongside narrative feedback and portfolios.",
        details: ["60+ badges", "Student-designed", "Portfolio evidence"],
        image: "/images/stock/ImageEleven.jpg",
        accent: "text-[#B84032]",
        accentBg: "bg-[#FFF2EF]",
      },
    ],
  },
  mosaicImages: [
    "/images/stock/Homeschool.jpg",
    "/images/stock/ImageEleven.jpg",
    "/images/stock/Homeschool.jpg",
  ],
  quote: {
    text: [
      "For middle and high school students who are capable—but not fully engaged—",
      "Inspired offers a smaller, more intentional environment.",
    ],
    attribution: "Inspired Learning Academy",
    backgroundImage: "/images/stock/Homeschool.jpg",
  },
  stripImages: [
    "/images/stock/Homeschool.jpg",
    "/images/stock/ImageEleven.jpg",
    "/images/stock/ImageEleven.jpg",
    "/images/stock/Homeschool.jpg",
    "/images/stock/Homeschool.jpg",
    "/images/stock/ImageEleven.jpg",
  ],
  timeline: {
    eyebrow: "Admissions",
    heading: "Finding the right school is about fit.",
    headingSub: "2026–2027 · Allen, TX",
    steps: [
      {
        time: "Step 1",
        activity: "Schedule a tour",
        desc: "A relaxed, 30-minute visit to see Inspired in action and explore whether it is a strong fit. This preview does not open a live booking page.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "Step 2",
        activity: "Pre-tour application",
        desc: "Complete the pre-tour application so the school can learn about your student before the visit.",
        image: "/images/stock/ImageEleven.jpg",
      },
      {
        time: "Step 3",
        activity: "Interview, if it’s a fit",
        desc: "If there is a strong mutual fit, the student interviews and the family completes the application.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "Step 4",
        activity: "Enrollment paperwork",
        desc: "If offered admission, complete paperwork and pay the $350 annual registration fee. High school for 2026–2027 is waiting list only.",
        image: "/images/stock/ImageEleven.jpg",
      },
    ],
  },
  socialProof: {
    type: "testimonials",
    eyebrow: "From a family",
    heading: "One story the school has published.",
    subtitle:
      "This is the testimonial retrieved from the Inspired homepage. No additional reviews or star ratings were published with it.",
    items: [
      {
        quote:
          "Our son is growing into a man and feels more self-confident at ILA as he is able to make more decisions for himself... At his prior school, he saw college as a continuation of his pain and suffering and wanted nothing to do with it. At ILA, it is a means for fulfilling his ambitions and he is preparing himself for the task.",
        name: "Dianne M.",
        detail: "Inspired Learning Academy parent",
        stars: 0,
        avatar: LOGO_SRC,
      },
    ],
  },
  founder: {
    eyebrow: "Meet the people behind Inspired",
    heading: "A school where teens can",
    headingAccent: "belong and grow.",
    paragraphs: [
      "Inspired began with a search for something different: a school where teens could belong, build independence, and grow into themselves.",
      "Jill Baumann is Co-Founder and Head of School / Director of Operations. Finding the right educational path for her own two children led through years of homeschooling and teaching at Living Ethics School, and then to creating Inspired for adolescence. Aya Parry is Co-Founder and Director of Finance and Administration.",
    ],
    credentials: [
      "Jill Baumann · Head of School",
      "Aya Parry · Finance & Administration",
      "Allen, Texas",
      "Secular & independent",
    ],
    quote:
      "Finding the right educational path for my own 2 kids has been a quest for me since their preschool days...",
    quoteAttribution: "Jill Baumann · team page",
    image: LOGO_SRC,
    imageBadge: { label: "Campus", value: "Allen, TX" },
    name: "Jill Baumann",
    title: "Co-Founder & Head of School",
  },
  parallax: {
    eyebrow: "Fit-check tour",
    heading: ["See if Inspired is", "the right fit."],
    subtitle:
      "A relaxed 30-minute visit to see Inspired in action, ask questions, and explore whether it’s a strong fit for your family.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Book a 15-Minute Call",
    backgroundImage: "/images/stock/Homeschool.jpg",
  },
  pillars: {
    eyebrow: "How Inspired is different",
    heading: "Small, intentional, and built for the right fit.",
    subtitle:
      "A relationship-centered hybrid microschool for grades 6–12 — not an elementary, outdoor, tutoring, or fully remote program.",
    items: [
      {
        icon: "users",
        title: "Small, intentional environment",
        desc: "Students learn in small groups where they are known, supported, and challenged.",
      },
      {
        icon: "compass",
        title: "Ownership and growth",
        desc: "Students build independence, follow-through, and confidence through meaningful work and mentorship.",
      },
      {
        icon: "heart",
        title: "Designed for the right fit",
        desc: "Built for middle and high school students who want more than traditional school can offer.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "A relaxed, 30-minute visit to see Inspired in action and explore whether it’s a strong fit for your child.",
    sidebarImage: "/images/stock/ImageEleven.jpg",
    eyebrow: "Preview only",
    heading: "Schedule a tour or book a 15-minute call.",
    description:
      "2026–2027 tuition: $12,970 annually, or $1,297 per month across 10 months (August–May). Annual registration: $350. Ask about the 10% sibling discount and TEFA funding. This form does not submit to the school.",
    submitLabel: "Preview message",
    disclaimer:
      "Preview only — nothing is sent to Inspired Learning Academy. Call (214) 509-8449 or email office@inspiredlearningacademy.org.",
    successEmoji: "•",
    successTitle: "Preview only",
    successMessage:
      "This concept form is not connected. Nothing was sent to Inspired Learning Academy.",
    trustNote: "Unofficial concept preview. Confirm availability and tuition with the school.",
    programOptions: [
      { value: "tour", label: "Schedule a tour" },
      { value: "call", label: "Book a 15-minute call" },
      { value: "middle-school", label: "Middle school — limited spots" },
      { value: "high-school", label: "High school — waiting list only" },
      { value: "unsure", label: "Not sure yet" },
    ],
    studentFields: {
      namePlaceholder: "Student's name",
      gradePlaceholder: "Select grade...",
      gradeOptions: [
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
    subtitle: "Answers follow the school’s published pages. Confirm details with the office before you decide.",
    items: [
      {
        q: "What is a hybrid microschool?",
        a: "Inspired is a teen-focused hybrid microschool in Allen serving grades 6–12. It is a private program built around small learning environments, relationships, personalized pathways, and ownership rather than traditional lecture-based instruction.",
      },
      {
        q: "Who is Inspired a good fit for?",
        a: "Students in grades 6–12 who benefit from a smaller environment, value mentor and peer relationships, and are ready for increasing ownership. It may not suit students who need frequent one-on-one academic intervention or a highly teacher-directed structure.",
      },
      {
        q: "What days are on campus?",
        a: "Campus learning is Tuesday, Wednesday, and Thursday, 9:00 am–3:45 pm. Monday and Friday are remote days, 9:15 am–3:45 pm, with independent study and virtual check-ins. It is a five-day program.",
      },
      {
        q: "Do you accept TEFA funds?",
        a: "The school states that it is authorized to accept Texas Education Freedom Account funds. This preview does not state a funding amount or promise that a family is eligible.",
      },
      {
        q: "Is Inspired religious-based?",
        a: "No. Inspired is secular and independent. It rents classroom space from First United Methodist Church in Allen, but the program is not religious-based or affiliated with a church.",
      },
      {
        q: "How do grades, diplomas, and transcripts work?",
        a: "Middle school uses narrative feedback. High school uses narrative feedback plus evidence-based co-assessment, with final grade approval by facilitators or mentors. Graduates can receive an Inspired diploma, a traditional-GPA transcript, and a personalized ePortfolio. The school names Traditional University, Community College, and Flex pathways. It does not guarantee college admission. The school reports that graduates since 2022 have gone to the University of Arkansas, Texas A&M, the University of Texas at Dallas, Collin College, and Temple University – Japan.",
      },
      {
        q: "Are you accredited?",
        a: "The school states accreditation through the Texas Microschool Accreditation Service (TxMAS) and the Western Association of Schools and Colleges (WASC). This preview does not display accreditation seals.",
      },
    ],
  },
  closingCta: {
    eyebrow: "A fit-check tour",
    heading: "See if Inspired is the right fit",
    headingAccent: "for your child.",
    description:
      "A relaxed 30-minute visit to see Inspired in action, ask questions, and explore whether it’s a strong fit for your family. You can also book a 15-minute call. This preview scrolls to the form — booking links are not connected.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Book a 15-Minute Call",
  },
  footer: {
    tagline:
      "601 S Greenville Ave, Allen, TX 75002 · office@inspiredlearningacademy.org · (214) 509-8449. Campus Tuesday–Thursday, 9:00 am–3:45 pm. Remote Monday and Friday, 9:15 am–3:45 pm. Inspired Learning Academy admits students of any race, color, national and ethnic origin to all the rights, privileges, programs, and activities generally accorded or made available to students at the school. Inspired Learning Academy does not discriminate on the basis of race, color, national or ethnic origin in the administration of its educational policies, admissions policies, scholarship programs, or other school-administered programs.",
    links: ["How It Works", "Who It’s For", "Contact", "FAQ"],
    copyright: "©2026 by Inspired Learning Center DBA Inspired Learning Academy",
    poweredBy: "Website concept by MudKitchen",
  },
};
