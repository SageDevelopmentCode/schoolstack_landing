import type { SchoolWebsiteDemoConfig } from "./types";
import { KATS_COMMUNITY_MICROSCHOOL_LOGO } from "./kats-community-microschool-admin-demo";

export const katsCommunityMicroschoolConfig: SchoolWebsiteDemoConfig = {
  slug: "kats-community-microschool",
  schoolName: "Kat's Community Microschool",
  theme: {
    primary: "#285943",
    primaryHover: "#1f4535",
    dark: "#1F2A2E",
    darkHover: "#1a2326",
    lightBg: "#FBF5E9",
    lightBorder: "#DCD6C8",
    muted: "#647174",
    badgeBg: "rgba(40, 89, 67, 0.12)",
    accentText: "#7E9A63",
    pageBg: "#FFFDF8",
  },
  logo: KATS_COMMUNITY_MICROSCHOOL_LOGO,
  hero: {
    eyebrow: "Phoenix, AZ · Grades 3–6 · Maximum 10 students",
    eyebrowPlacement: "announcementBar",
    headline: ["Small classes.", "Big futures."],
    subheadline:
      "Tuition-free for most Arizona families through the AZ ESA program. We help you with every step of enrollment — and your child gets a learning experience built around them.",
    primaryCta: "Schedule a Visit",
    secondaryCta: "Explore Our Approach",
    secondaryCtaTarget: "programs",
    navCta: "Schedule a Visit",
    navLinks: ["About", "Approach", "Meet Kathleen", "FAQ"],
    backgroundImage: "/images/stock/ImageTwo.jpg",
    floatingImages: ["/images/stock/ImageSeven.jpg", "/images/stock/ImageSix.jpg"],
    imageAlt: "Students collaborating on a hands-on project",
    trustBadges: ["15+ Years Teaching", "Personalized Pacing", "AZ ESA Support", "Phoenix, AZ"],
  },
  sections: {
    showMosaic: true,
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "Our Approach",
    heading: "Conquer. Collaborate. Create. Connect.",
    subtitle:
      "The four pillars guiding every day at Kat's Community Microschool — built around what makes each student curious, capable, and confident.",
    modes: [
      {
        label: "Conquer",
        title: "Master Goals at Your Own Pace",
        desc: "Guided 3rd–6th grade education with math, reading, ELA, and writing goals — powered by Prenda and aligned to Arizona state standards.",
        icon: "compass",
      },
      {
        label: "Collaborate",
        title: "Learn Together in Small Groups",
        desc: "Team building every morning, goal-setting check-ins, and a mindful start to the day that builds strong community routines.",
        icon: "users",
      },
      {
        label: "Create",
        title: "Build, Make, Invent Every Day",
        desc: "Hands-on STEM activities, interdisciplinary projects, and collaboration over competition across science, art, history, and tech.",
        icon: "sparkles",
      },
      {
        label: "Connect",
        title: "A Real Community of Families",
        desc: "A warm, relationship-centered microschool where every child is truly seen — with family-first communication at the center.",
        icon: "heart",
      },
    ],
    flexFriday: {
      title: "Grow Every Day",
      desc: "Academically, socially, and personally — with room to pursue art, music, coding, gardening, baking, and whatever helps each child thrive.",
    },
  },
  stats: [
    { value: "10", label: "Max Students" },
    { value: "3–6", label: "Grade Levels" },
    { value: "15+", label: "Years Teaching" },
    { value: "AZ ESA", label: "Enrollment Support" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "About Us",
    heading: "Empower your learning journey everyday.",
    cards: [
      {
        title: "Personalized pacing",
        desc: "Fully student-driven and personalized — powered by Prenda's proven curriculum and aligned to Arizona state standards.",
      },
      {
        title: "Tiny by design",
        desc: "No more than 10 students at a time, so every child has room to build confidence and be supported as a whole person.",
      },
      {
        title: "Neurodivergent learners",
        desc: "Kathleen brings deep, lived experience meeting neurodivergent kids exactly where they are — with strengths-based support.",
      },
      {
        title: "AZ ESA support",
        desc: "Tuition-free for most Arizona families through the Empowerment Scholarship Account program — we help with every step.",
      },
    ],
    mainImage: "/images/stock/ImageSeven.jpg",
    secondaryImage: "/images/stock/ImageSix.jpg",
  },
  marquee: [
    "Small Classes",
    "Big Futures",
    "Conquer",
    "Collaborate",
    "Create",
    "Connect",
    "Grow",
    "Phoenix, Arizona",
    "Grades 3–6",
    "Prenda-Powered",
    "AZ ESA Support",
    "Schedule a Visit",
  ],
  programs: {
    eyebrow: "Our Approach",
    heading: "What every day includes",
    subtitle:
      "Six pillars of learning at Kat's Community Microschool — from personalized academics to real-world skills.",
    ctaLabel: "Schedule a Visit",
    items: [
      {
        badge: "01",
        title: "Personalized Learning",
        teaser: "Guided 3rd–6th grade · Prenda curriculum",
        desc: "Guided 3rd–6th grade education with math, reading, ELA, and writing goals — curriculum powered by Prenda and aligned to AZ state standards.",
        details: ["Grades 3–6", "Prenda Curriculum", "AZ Standards", "Individual Pacing"],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#285943]",
        accentBg: "bg-[#FBF5E9]",
      },
      {
        badge: "02",
        title: "Daily Warm-Ups",
        teaser: "Team building · Goal-setting · Mindful mornings",
        desc: "Team building every morning, goal-setting check-ins, and a mindful start to the day that builds strong community routines.",
        details: ["Morning Routines", "Goal Setting", "Community", "Mindful Start"],
        image: "/images/stock/ImageFive.jpg",
        accent: "text-[#7E9A63]",
        accentBg: "bg-[#FBF5E9]",
      },
      {
        badge: "03",
        title: "STEM & Projects",
        teaser: "Hands-on · Interdisciplinary · Collaborative",
        desc: "Hands-on STEM activities, interdisciplinary projects across science, art, history, and tech — with collaboration over competition.",
        details: ["STEM", "Projects", "Collaboration", "Interdisciplinary"],
        image: "/images/stock/ImageSeven.jpg",
        accent: "text-[#285943]",
        accentBg: "rgba(40, 89, 67, 0.12)",
      },
      {
        badge: "04",
        title: "Meals & Snacks",
        teaser: "Breakfast, lunch & snacks · Allergy-aware",
        desc: "Breakfast, lunch, and snacks provided as families request — with a monthly menu published and allergy-aware options available.",
        details: ["Breakfast", "Lunch", "Snacks", "Allergy-Aware"],
        image: "/images/stock/ImageSix.jpg",
        accent: "text-[#D96D5B]",
        accentBg: "bg-[#FBF5E9]",
      },
      {
        badge: "05",
        title: "Extracurriculars",
        teaser: "Powered by Outschool · Family-chosen",
        desc: "Art, music, coding, and dance through Outschool — chosen by families and kids so students pursue what they love.",
        details: ["Outschool", "Art & Music", "Coding", "Family Choice"],
        image: "/images/stock/ImageNine.jpg",
        accent: "text-[#285943]",
        accentBg: "bg-[#BBDDE5]",
      },
      {
        badge: "06",
        title: "Real-World Skills",
        teaser: "Gardening · Cooking · Practical life",
        desc: "Gardening and cooking, baking from scratch, and practical life learning with a connection to the environment.",
        details: ["Gardening", "Cooking", "Baking", "Practical Life"],
        image: "/images/stock/ImageEleven.jpg",
        accent: "text-[#7E9A63]",
        accentBg: "bg-[#FBF5E9]",
      },
    ],
  },
  mosaicImages: [
    "/images/stock/ImageTwo.jpg",
    "/images/stock/ImageSeven.jpg",
    "/images/stock/ImageSix.jpg",
    "/images/stock/ImageEleven.jpg",
  ],
  quote: {
    text: ["Children are not vessels to be filled,", "but lamps to be lit."],
    attribution: "— Inspiring our approach at Kat's Community Microschool",
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
    eyebrow: "School Calendar",
    heading: "Holidays, menus & moments",
    headingSub: "Phoenix, AZ · Meals, events & family gatherings",
    steps: [
      {
        time: "Morning",
        activity: "Daily Warm-Up",
        desc: "Team building, goal-setting check-ins, and a mindful start to the day with strong community routines.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "Mid-Morning",
        activity: "Personalized Learning",
        desc: "Math, reading, ELA, and writing goals at each student's pace — powered by Prenda and aligned to AZ standards.",
        image: "/images/stock/ImageFive.jpg",
      },
      {
        time: "Afternoon",
        activity: "STEM & Projects",
        desc: "Hands-on STEM activities and interdisciplinary projects — science, art, history, and tech working together.",
        image: "/images/stock/ImageSeven.jpg",
      },
      {
        time: "Meals",
        activity: "Breakfast & Lunch",
        desc: "Fresh, wholesome meals made with care. Menus updated monthly with allergy-aware swaps available.",
        image: "/images/stock/ImageSix.jpg",
      },
      {
        time: "Events",
        activity: "Family Community",
        desc: "Holidays, family events, and community gatherings — a school day built around curiosity, connection, and doing.",
        image: "/images/stock/ImageNine.jpg",
      },
    ],
  },
  socialProof: {
    type: "testimonials",
    eyebrow: "Testimonials",
    heading: "What our families say",
    subtitle:
      "Families who found a smaller school where their child is truly known.",
    items: [
      {
        quote:
          "Switching to Kat's Community Microschool was the best decision we made. My daughter actually asks to go to school now. The small class size means she's truly seen — her guide knows exactly where she shines and where she needs a push.",
        name: "Jessamine Mumtaz",
        detail: "Parent of 4th grader",
        stars: 5,
        avatar: "/images/stock/ImageTen.jpg",
      },
    ],
  },
  founder: {
    eyebrow: "Meet Your Guide",
    heading: "Hi, I'm Kathleen — and I built this school",
    headingAccent: "for kids like yours.",
    paragraphs: [
      "I've spent 15+ years improving how I teach — and learning how to make our children's futures better through positive educational experiences. I've taught everything from 3rd–5th grade reading and math to 10th grade world history.",
      "I homeschooled my own two children K–5 because I was unsatisfied with what was available in Phoenix. My son is autistic and both of my children have ADHD — so I have deep, lived experience meeting neurodivergent kids exactly where they are.",
      "Beyond academics, I believe extracurricular pursuits matter. Art, guitar, coding Roblox games, dance, gardening, baking — whatever helps a child grow into the strong, well-rounded adult they're meant to become.",
    ],
    credentials: [
      "M.Ed. Secondary Education",
      "B.A. History",
      "K–10 Teaching Experience",
      "Neurodivergent learners",
      "Personalized pacing",
      "Project-based learning",
    ],
    quote:
      "With no more than 10 students at a time, children have room to build confidence, work toward meaningful goals, and be supported as whole people.",
    quoteAttribution: "— Kathleen Graves, Founder & Lead Guide",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Experience", value: "15+ Years" },
    name: "Kathleen Graves",
    title: "Founder & Lead Guide",
  },
  parallax: {
    eyebrow: "Inside the Classroom",
    heading: ["Real moments.", "Real learning."],
    subtitle:
      "A school day built around curiosity, connection, and doing — in a warm, lived-in learning space in Phoenix.",
    primaryCta: "Schedule a Visit",
    secondaryCta: "Explore Our Approach",
    backgroundImage: "/images/stock/ImageSeven.jpg",
  },
  pillars: {
    eyebrow: "Why Families Choose Kat's",
    heading: "Small by design. Known by name.",
    subtitle:
      "Personalized learning, hands-on projects, and a real community of families — with AZ ESA enrollment support.",
    items: [
      {
        icon: "compass",
        title: "Personalized Learning",
        desc: "Student-driven education powered by Prenda — with math, reading, ELA, and writing goals at each child's pace.",
      },
      {
        icon: "users",
        title: "Tiny Cohort",
        desc: "Maximum 10 students means every child is truly seen, known, and supported as a whole person.",
      },
      {
        icon: "heart",
        title: "Neurodivergent Support",
        desc: "Strengths-based approach from a guide with deep lived experience supporting neurodivergent learners.",
      },
      {
        icon: "sparkles",
        title: "Hands-On Projects",
        desc: "STEM, gardening, cooking, baking, and real-world skills woven into every week.",
      },
    ],
  },
  form: {
    sidebarQuote: "Let's talk about your child's best next step.",
    sidebarImage: "/images/stock/ImageSix.jpg",
    eyebrow: "Let's Talk",
    heading: "Schedule a visit or ask a question.",
    description:
      "Tell us about your child and we'll reach out about tours, AZ ESA enrollment, or anything else. Kathleen will personally follow up.",
    submitLabel: "Send Message",
    disclaimer:
      "Kathleen will personally follow up. Email K.L.Graves1982@gmail.com or call (602) 946-2332.",
    successEmoji: "✓",
    successTitle: "Message received!",
    successMessage:
      "Kathleen will be in touch soon about scheduling a visit or answering your questions.",
    programOptions: [
      { value: "tour", label: "Schedule a visit / tour" },
      { value: "esa", label: "AZ ESA enrollment support" },
      { value: "general", label: "General questions" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Child's Name",
      gradePlaceholder: "Select grade level...",
      gradeOptions: [
        { value: "3", label: "3rd Grade" },
        { value: "4", label: "4th Grade" },
        { value: "5", label: "5th Grade" },
        { value: "6", label: "6th Grade" },
      ],
    },
  },
  faq: {
    eyebrow: "Questions, Answered",
    heading: "Things families ask first",
    subtitle:
      "Still have questions? Reach out anytime — Kathleen will personally walk you through anything, including AZ ESA enrollment.",
    items: [
      {
        q: "Who is Kat's Community Microschool for?",
        a: "Families in the Phoenix area seeking a personalized option for students in grades 3–6 who want a small, relationship-centered alternative to conventional school.",
      },
      {
        q: "What grades do you serve?",
        a: "We serve 3rd through 6th graders in a single microschool cohort with no more than 10 students at a time.",
      },
      {
        q: "How many students are in the program?",
        a: "Maximum 10 students — so every child is truly known, seen, and supported.",
      },
      {
        q: "Is tuition covered through Arizona ESA?",
        a: "Tuition is free for most Arizona families through the Arizona Empowerment Scholarship Account (AZ ESA) program. We help you with every step of enrollment.",
      },
      {
        q: "What does a typical day look like?",
        a: "Mornings start with team building and goal-setting, followed by personalized learning in math, reading, ELA, and writing. Afternoons include hands-on STEM projects, meals, and real-world skills like gardening and cooking.",
      },
      {
        q: "Do you support neurodivergent learners?",
        a: "Yes. Kathleen has deep, lived experience as both an educator and parent of neurodivergent children — meeting each student exactly where they are with a strengths-based approach.",
      },
      {
        q: "Are meals and snacks included?",
        a: "Breakfast, lunch, and snacks are provided as families request, with a monthly menu published and allergy-aware options available.",
      },
      {
        q: "How do families schedule a visit?",
        a: "Reach out via the contact form, email K.L.Graves1982@gmail.com, or call/text (602) 946-2332. Kathleen will personally arrange a visit.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Let's Talk",
    heading: "Ready to give your child",
    headingAccent: "something better?",
    description:
      "Seats are limited to 10 students. Reach out today and let's chat about your child, AZ ESA, and how we can build their best year yet.",
    primaryCta: "Schedule a Visit",
    secondaryCta: "Contact Us",
  },
  footer: {
    tagline: "A small, student-driven microschool in Phoenix, Arizona.",
    links: ["About", "Approach", "Meet Kathleen", "FAQ", "Contact"],
    copyright: "© 2026 Kat's Community Microschool",
    poweredBy: "Website concept by MudKitchen",
  },
};
