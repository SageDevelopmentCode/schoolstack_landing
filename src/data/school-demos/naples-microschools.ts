import type { SchoolWebsiteDemoConfig } from "./types";
import { NAPLES_MICROSCHOOLS_LOGO } from "./naples-microschools-admin-demo";

export const naplesMicroschoolsConfig: SchoolWebsiteDemoConfig = {
  slug: "naples-microschools",
  schoolName: "Naples MicroSchools",
  theme: {
    primary: "#4F7B50",
    primaryHover: "#244D3D",
    dark: "#244D3D",
    darkHover: "#1F2B25",
    lightBg: "#F8F4E9",
    lightBorder: "#E9DFC9",
    muted: "#5C6B62",
    badgeBg: "rgba(79, 123, 80, 0.12)",
    accentText: "#B96846",
    pageBg: "#F8F4E9",
  },
  logo: NAPLES_MICROSCHOOLS_LOGO,
  hero: {
    eyebrow: "Now enrolling for 2026–27 · Golden Gate Estates, FL",
    eyebrowPlacement: "announcementBar",
    headline: ["A more joyful way to grow,", "learn, and belong."],
    subheadline:
      "Naples MicroSchools brings homeschool families together for personalized learning, meaningful outdoor experiences, and a supportive community on a working farm in Golden Gate Estates.",
    primaryCta: "Schedule a Discovery Call",
    secondaryCta: "Explore Programs",
    secondaryCtaTarget: "programs",
    navCta: "Tour the Farm",
    navLinks: ["Programs", "Why NMS", "Campus", "FAQ"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/Homeschool3.jpg"],
    imageAlt: "Children learning outdoors on a working farm",
    trustBadges: [
      "Grades K–8",
      "2.5-acre working farm",
      "Flexible programs",
      "Scholarships accepted",
    ],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "farmExperience",
    eyebrow: "Find a learning path that fits your family",
    heading: "Four pathways on one farm campus",
    subtitle:
      "From full-time nature-immersive learning to hybrid support and school-break enrichment — each program is designed for homeschool families who want structure without losing agency.",
    paths: [
      {
        title: "NatureQuest",
        desc: "4-day microschool · Grades K–8. Core academics meet inquiry, nature study, movement, and place-based projects for adventurous learners in a small, supportive setting.",
        icon: "treePine",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        title: "CoreQuest",
        desc: "2-day hybrid · Grades K–5. Your curriculum, our support — structured study time, learning-guide support, enrichment, and an in-person community.",
        icon: "bookOpen",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        title: "SkillsQuest",
        desc: "Personalized support · Unique abilities. Strengths-led learning that fosters independence and skill development in collaboration with families and providers.",
        icon: "heart",
        image: "/images/stock/ImageFour.jpg",
      },
      {
        title: "Day Camps",
        desc: "School-break enrichment · Rising K–8. STEAM, farm education, gardening, sports, animals, and outdoor adventure on no-school days and summer.",
        icon: "sparkles",
        image: "/images/stock/Homeschool3.jpg",
      },
    ],
  },
  stats: [
    { value: "K–8", label: "Grades served" },
    { value: "2.5 acres", label: "Working farm campus" },
    { value: "4 programs", label: "Flexible pathways" },
    { value: "Step Up", label: "Scholarships accepted" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "We put the home in homeschool partner",
    heading: "Built for engaged, motivated, hopeful kids.",
    cards: [
      {
        title: "Safety with structure",
        desc: "Selah's Farmhouse is designed around safety, security, structure, and supervision — a gated working farm where children are known and supported.",
      },
      {
        title: "Academically meaningful",
        desc: "Core academics alongside inquiry-based projects, accelerated opportunities, tutoring, and parent-selected curriculum support in CoreQuest.",
      },
      {
        title: "Community & connection",
        desc: "Recess, outdoor play, animals, field trips, camps, and enrichment — room for friendship and activity beyond the home classroom.",
      },
      {
        title: "Flexible for your family",
        desc: "4-day, 2-day hybrid, tutoring, and camp options so homeschool families can choose the schedule and support level that fits.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/ImageFour.jpg",
  },
  marquee: [
    "NatureQuest",
    "CoreQuest",
    "SkillsQuest",
    "Day Camps",
    "Golden Gate Estates",
    "Working Farm",
    "Homeschool Partner",
    "Nature Study",
    "Field Trips",
    "Step Up Scholarships",
    "Discovery Call",
    "Tour the Farm",
  ],
  programs: {
    eyebrow: "Our Programs",
    heading: "Find a learning path that fits your family",
    subtitle: "Click each program to explore schedules, grades, and what enrollment looks like.",
    ctaLabel: "Schedule a Discovery Call",
    items: [
      {
        badge: "4-day",
        title: "NatureQuest",
        teaser: "Grades K–8 · Full-time nature-immersive microschool",
        desc: "Core academics meet inquiry, nature study, movement, and place-based projects. NatureQuest gives adventurous learners a small, supportive setting to explore, question, and grow.",
        details: ["Grades K–8", "4 days/week", "Nature study", "Max 20 students"],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#4F7B50]",
        accentBg: "bg-[#F8F4E9]",
      },
      {
        badge: "2-day",
        title: "CoreQuest",
        teaser: "Grades K–5 · Hybrid with parent-selected curriculum",
        desc: "Families choose the curriculum and schedule that works best; students gain structured study time, learning-guide support, enrichment, and an in-person community.",
        details: ["Grades K–5", "2 days/week", "BYOC support", "Community"],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#D99A3D]",
        accentBg: "bg-[#F8F4E9]",
      },
      {
        badge: "Personalized",
        title: "SkillsQuest",
        teaser: "Unique abilities · Strengths-led support",
        desc: "A personalized program that fosters independence and skill development while supporting individual learner needs in collaboration with families and relevant providers.",
        details: ["Unique abilities", "Full or part-time", "Personalized", "Collaborative"],
        image: "/images/stock/ImageFour.jpg",
        accent: "text-[#B96846]",
        accentBg: "bg-[#F8F4E9]",
      },
      {
        badge: "Camps",
        title: "Day Camps",
        teaser: "Rising K–8 · School-break enrichment",
        desc: "STEAM, arts and crafts, farm education, gardening, sports, animals, and outdoor adventure create active, memorable days of learning.",
        details: ["Rising K–8", "School breaks", "Summer", "Farm activities"],
        image: "/images/stock/Homeschool3.jpg",
        accent: "text-[#8FBCC5]",
        accentBg: "bg-[#F8F4E9]",
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
      "We put the home, in homeschool partner.",
      "Our classrooms actually feel like home.",
    ],
    attribution: "— Naples MicroSchools",
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
    eyebrow: "The living classroom",
    heading: "Learning does not stop",
    headingSub: "at the classroom door.",
    steps: [
      {
        time: "Morning",
        activity: "Outdoor Inquiry",
        desc: "Students begin with nature study, farm routines, and inquiry-based exploration — connecting academic concepts to the living world.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "Midday",
        activity: "Core Academics",
        desc: "Structured time for language arts, math, and science — with flexibility for students to work at their own pace within clear expectations.",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        time: "Afternoon",
        activity: "Movement & Recess",
        desc: "Planned recess, outdoor play, and movement woven through the day — optimizing learning and intrinsic motivation.",
        image: "/images/stock/Homeschool3.jpg",
      },
      {
        time: "Weekly",
        activity: "Field Study",
        desc: "Place-based learning across Southwest Florida — from farm animals and gardening to field trips and shared adventures.",
        image: "/images/stock/ImageFour.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Why families choose NMS",
    heading: "A homeschool partner built on trust and purpose",
    subtitle:
      "Personalized paths, farm-based exploration, and a community where parents stay in the driver's seat.",
    items: [
      {
        title: "Scholarships accepted",
        desc: "NMS accepts Step Up for Students PEP and Unique Abilities scholarships, plus direct payment — with transparent tuition guidance.",
        icon: "shield",
      },
      {
        title: "The 4 S's",
        desc: "Safety, security, structure, and supervision guide every decision on our gated working-farm campus.",
        icon: "heart",
      },
      {
        title: "Small-community attention",
        desc: "Limited enrollment keeps learning personal — NatureQuest caps at 20 students for meaningful guide relationships.",
        icon: "users",
      },
      {
        title: "Parent agency",
        desc: "Flexible 2-day and 4-day options with parent-selected curriculum support — you stay in the driver's seat.",
        icon: "sprout",
      },
    ],
  },
  founder: {
    eyebrow: "Meet the people behind the learning",
    heading: "Dr. Dayana Philippi",
    headingAccent: "Known to students as Dr. Dee.",
    paragraphs: [
      "Dr. Dayana Philippi is an educator, former professional track-and-field athlete, mother of six, and lifelong Naples resident. Her approach combines academic rigor with movement, field experience, hands-on inquiry, and care for the whole child.",
      "Naples MicroSchools began with a family question: What if children could learn rigorously without giving up movement, time outdoors, and the freedom to be curious? Today, NMS partners with homeschool families through small-group learning on a working farm.",
    ],
    credentials: [
      "20+ years in education",
      "Florida-certified educator",
      "Doctorate in education",
      "Trilingual · English, Creole, Spanish",
    ],
    quote:
      "Children deserve more than a one-size-fits-all school day — structure without losing agency, academic support without losing wonder.",
    quoteAttribution: "— Dr. Dee",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Campus", value: "Selah's Farmhouse" },
    name: "Dr. Dee",
    title: "Head of Schools, Naples MicroSchools",
  },
  parallax: {
    eyebrow: "The living classroom",
    heading: ["Explore.", "Learn.", "Shine."],
    subtitle:
      "A nature-immersive homeschool community on a 2.5-acre working farm — where children connect academic concepts to the living world.",
    primaryCta: "Schedule a Discovery Call",
    secondaryCta: "Tour the Farm",
    backgroundImage: "/images/stock/Homeschool.jpg",
  },
  pillars: {
    eyebrow: "Built for engaged learners",
    heading: "Positive influence, meaningful choice, optimized rhythm.",
    subtitle:
      "Learning Guides help students stay encouraged, learners set personal goals, and movement creates a sustainable learning day.",
    items: [
      {
        icon: "heart",
        title: "Positive influence",
        desc: "Learning Guides help students stay encouraged, motivated, and ready to persevere through challenges.",
      },
      {
        icon: "compass",
        title: "Optimized learning rhythm",
        desc: "Movement, outdoor time, and planned recess create a more sustainable and engaging learning day.",
      },
      {
        icon: "sparkles",
        title: "Meaningful choice",
        desc: "Learners have agency to set goals, investigate interests, and move at an appropriate pace.",
      },
      {
        icon: "shield",
        title: "Safety with structure",
        desc: "The campus is designed around safety, security, structure, and supervision — the 4 S's.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Ready to explore what learning could feel like? Start with a discovery call, then plan a family tour of the farm.",
    sidebarImage: "/images/stock/Homeschool2.jpg",
    eyebrow: "Schedule a Discovery Call",
    heading: "Tell us about your learner.",
    description:
      "Share your child's grade, program interest, and questions. We'll reach out to schedule a discovery call and explain the next steps — including the required in-person farm tour.",
    submitLabel: "Request a Discovery Call",
    disclaimer:
      "Call or text (239) 610-9737 · Text JOINNMS to +1 (888) 658-4763 for updates.",
    successEmoji: "✓",
    successTitle: "Request received!",
    successMessage:
      "Thank you for your interest in Naples MicroSchools. We'll be in touch to schedule your discovery call and answer any questions.",
    programOptions: [
      { value: "naturequest", label: "NatureQuest (4-day microschool)" },
      { value: "corequest", label: "CoreQuest (2-day hybrid)" },
      { value: "skillsquest", label: "SkillsQuest (unique abilities)" },
      { value: "day-camps", label: "Day Camps" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Student's Name",
      gradePlaceholder: "Select grade for 2026–27...",
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
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions families ask",
    subtitle:
      "New to Naples MicroSchools? Here are the most common things homeschool families want to know before scheduling a discovery call.",
    items: [
      {
        q: "What is the admissions process?",
        a: "Start with a discovery call, then schedule a required in-person family tour of Selah's Farmhouse. After the tour, families can join the wait list and complete registration when a spot opens.",
      },
      {
        q: "What programs do you offer?",
        a: "NatureQuest is our 4-day nature-immersive microschool (K–8). CoreQuest is a 2-day hybrid (K–5) with parent-selected curriculum. SkillsQuest supports learners with unique abilities. Day Camps serve rising K–8 during school breaks and summer.",
      },
      {
        q: "Do you accept scholarships?",
        a: "Yes. Naples MicroSchools accepts Step Up for Students Personalized Education Program (PEP) and Unique Abilities scholarships, as well as direct payment. Our team can help your family understand current options.",
      },
      {
        q: "Where is the campus?",
        a: "NMS is based at Selah's Farmhouse — a gated, 2.5-acre working farm education center in Golden Gate Estates / Naples, Florida.",
      },
      {
        q: "What makes NMS different from traditional school?",
        a: "We're a homeschool partner, not a replacement for parent-directed learning. Children learn in cozy indoor spaces and expansive outdoor environments — with structure, supervision, and a community of like-minded families.",
      },
      {
        q: "How do I get started?",
        a: "Schedule a discovery call through our form, call or text (239) 610-9737, or text JOINNMS to +1 (888) 658-4763. We'd love to help you find the right program.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Ready to explore?",
    heading: "Ready to explore what learning",
    headingAccent: "could feel like?",
    description:
      "Start with a discovery call, then plan a required in-person family tour of the farm. Limited enrollment helps us keep learning personal.",
    primaryCta: "Schedule a Discovery Call",
    secondaryCta: "Tour the Farm",
  },
  footer: {
    tagline: "Explore. Learn. Shine. · A Grindstone Learning Company",
    links: ["Programs", "Why NMS", "Campus", "FAQ", "Contact"],
    copyright: "© 2026 Naples MicroSchools",
    poweredBy: "Website concept by MudKitchen",
  },
};
