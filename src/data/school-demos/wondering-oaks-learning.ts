import type { SchoolWebsiteDemoConfig } from "./types";
import { WONDERING_OAKS_LOGO } from "./wondering-oaks-admin-demo";

export const wonderingOaksLearningConfig: SchoolWebsiteDemoConfig = {
  slug: "wondering-oaks-learning",
  schoolName: "Wondering Oaks Learning",
  theme: {
    primary: "#F5A68D",
    primaryHover: "#E8927A",
    dark: "#15843C",
    darkHover: "#0E5828",
    lightBg: "#F2EBE2",
    lightBorder: "#E8DDD2",
    muted: "#5F6360",
    badgeBg: "#EDF4EA",
    accentText: "#8B6B4A",
    pageBg: "#FBF8F3",
  },
  logo: WONDERING_OAKS_LOGO,
  hero: {
    eyebrow: "Conroe, TX · Secular Microschool · Ages 5–8",
    eyebrowPlacement: "announcementBar",
    headline: ["Homeschool Away", "From Home"],
    subheadline:
      "At Wondering Oaks Learning, students are given the freedom to learn in ways that make the most sense to them — with small class sizes, one-on-one teacher support, and a warm multi-age community that blends homeschool flexibility with private-school structure.",
    primaryCta: "Schedule a Visit",
    secondaryCta: "Explore Programs",
    secondaryCtaTarget: "signature",
    navCta: "Schedule a Visit",
    navLinks: ["Approach", "Programs", "Schedule", "Tuition", "FAQ"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/Homeschool3.jpg"],
    imageAlt: "Children learning in a warm, nature-inspired classroom",
    tagline: "Growing and Exploring Together",
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "How the Day Flows",
    heading: "Structure, autonomy, and room to discover.",
    subtitle:
      "Monday through Thursday on campus — with Fridays reserved for Free Forest School, field trips, and family projects.",
    modes: [
      {
        label: "Morning",
        title: "Warm Arrival",
        desc: "Students arrive between 8:45–9:00 AM, greeted with a smile, easy morning work, and time to connect with teachers and friends.",
        icon: "compass",
      },
      {
        label: "Core Hours",
        title: "Work Block",
        desc: "Long Montessori-inspired work periods with literacy, math, and science — students choose how and where they learn best.",
        icon: "bookOpen",
      },
      {
        label: "Midday",
        title: "Lunch & Recess",
        desc: "Friends finish lunch at their own pace, then head outside to burn energy and refresh before afternoon learning.",
        icon: "heart",
      },
      {
        label: "Afternoon",
        title: "Projects & Play",
        desc: "Practical math, gardening, gameschooling, child-led passion projects, and calm meditation or yoga before pickup.",
        icon: "sparkles",
      },
    ],
    flexFriday: {
      title: "Flex Friday",
      desc: "Free Forest School, field trips, or special family projects — a rhythm that keeps learning connected to the real world.",
    },
  },
  stats: [
    { value: "~10 Students", label: "Average Class Size" },
    { value: "Mon–Thu", label: "On-Campus Days" },
    { value: "TK–3rd", label: "Multi-Age Classroom" },
    { value: "Secular", label: "Inclusive Environment" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Is Wondering Oaks Right for Your Family?",
    heading: "A secular, family-centered fit for early elementary learners.",
    cards: [
      {
        title: "Want homeschool flexibility with teacher support",
        desc: "Students work at their own pace with one-on-one guidance in a small, nurturing environment.",
      },
      {
        title: "Value play, inquiry, and outdoor learning",
        desc: "Children learn outside, standing up, through games, or on balance boards — however they learn best.",
      },
      {
        title: "Seeking a secular, multi-age community",
        desc: "Strong friendships, field trips, and a close-knit family feel without religious affiliation.",
      },
      {
        title: "Need a guardian available for field trips",
        desc: "Ideal students are potty trained, play-loving, and ready for foundational literacy and math.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/ImageFour.jpg",
  },
  marquee: [
    "Homeschool Away From Home",
    "Secular Microschool",
    "Multi-Age Classroom",
    "Logic of English",
    "Math With Confidence",
    "Gameschooling",
    "Inquiry-Led Science",
    "Free Forest School",
    "Reggio & Montessori",
    "Whole Child Education",
    "Conroe, Texas",
    "Schedule a Visit",
  ],
  programs: {
    eyebrow: "Programs",
    heading: "Discovery and learning for every schedule",
    subtitle: "Full-time, part-time, and subject-focused days — designed around how your child learns best.",
    ctaLabel: "Learn More",
    items: [
      {
        badge: "Full-Time",
        title: "Full-Time Enrollment",
        teaser: "3–4 days per week — most economical option",
        desc: "Full-time students attend 3–4 days weekly for literacy, math, science, and community. Recommended for families who need support teaching reading and core topics, plus social interaction and elective-style learning.",
        details: [
          "3 days: $4,500/yr ($375/mo)",
          "4 days: $5,500/yr ($500/mo)",
          "No registration fee",
          "Sibling discount available",
        ],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#15843C]",
        accentBg: "bg-[#F2EBE2]",
      },
      {
        badge: "Part-Time",
        title: "Part-Time Enrollment",
        teaser: "1–2 days per week at $40/day",
        desc: "Part-time students choose which days they attend based on specific needs — literacy and math on Mon/Wed, science and projects on Tue/Thu, or a custom combination.",
        details: [
          "$40 per day",
          "Flexible scheduling",
          "Choose your days",
          "Supply fee: $100/day of attendance",
        ],
        image: "/images/stock/Homeschool3.jpg",
        accent: "text-[#8B6B4A]",
        accentBg: "bg-[#F2EBE2]",
      },
      {
        badge: "Mon/Wed",
        title: "Foundational Core",
        teaser: "Literacy and math with Logic of English",
        desc: "Foundational Core days focus on reading, spelling, writing, and math. Students learn to read using Logic of English — a systematic, phonics-based curriculum designed for dyslexia, ADHD, and dysgraphia.",
        details: [
          "Logic of English",
          "Math With Confidence",
          "Handwriting Without Tears",
          "One-on-one teacher lessons",
        ],
        image: "/images/stock/ImageFive.jpg",
        accent: "text-[#15843C]",
        accentBg: "bg-[#EDF4EA]",
      },
      {
        badge: "Tue/Thu",
        title: "Science & Special Projects",
        teaser: "Inquiry-led science and child-led passion projects",
        desc: "Students study native plants, electricity, force, motion, anatomy, and more — using microscopes, magnifying glasses, and real tools. Many pursue self-chosen research and creative projects.",
        details: [
          "Hands-on experiments",
          "Child-led projects",
          "Extensive nonfiction library",
          "Circuit boards & creative builds",
        ],
        image: "/images/stock/ImageSix.jpg",
        accent: "text-[#F5A68D]",
        accentBg: "bg-[#F2EBE2]",
      },
    ],
  },
  mosaicImages: [
    "/images/stock/Homeschool.jpg",
    "/images/stock/Homeschool2.jpg",
    "/images/stock/ImageSeven.jpg",
  ],
  quote: {
    text: ["The art of teaching is the art of assisting discovery."],
    attribution: "Mark Van Doren",
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
    eyebrow: "A Typical Day",
    heading: "Monday through Thursday",
    headingSub: "8:45 AM – 3:00 PM in Conroe, Texas.",
    steps: [
      {
        time: "8:45 AM",
        activity: "School Opens",
        desc: "Warm greetings, unpacking, easy morning work, and gentle social time to start the day.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "9:20 AM",
        activity: "Morning Recess",
        desc: "A quick morning meeting, then outside to burn energy before the work block begins.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "9:45 AM",
        activity: "Morning Work Block",
        desc: "Reading, writing, math, and science — students roam the classroom, work one-on-one with teachers, and pursue student-led projects.",
        image: "/images/stock/ImageFive.jpg",
      },
      {
        time: "12:30 PM",
        activity: "Lunch & Recess",
        desc: "Friends eat at their own pace, then head outside — their time, their rhythm.",
        image: "/images/stock/ImageSix.jpg",
      },
      {
        time: "1:30 PM",
        activity: "Reflection & Afternoon",
        desc: "Meditation, yoga, or quiet time — then practical math, gardening, gameschooling, and passion projects until 3:00 PM.",
        image: "/images/stock/Homeschool3.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Why Families Choose Wondering Oaks",
    heading: "Safe, loved, and encouraged to be capable learners.",
    subtitle:
      "We combine the best aspects of traditional homeschooling and a small private school.",
    items: [
      {
        title: "Secular & Inclusive",
        desc: "Wondering Oaks does not affiliate with any religious or political view — all families are welcome.",
        icon: "shield",
      },
      {
        title: "Whole Child Education",
        desc: "Academics plus emotional regulation, communication, problem solving, and internal motivation.",
        icon: "heart",
      },
      {
        title: "Neurodiversity-Friendly",
        desc: "Ample movement, flexible seating, outdoor time, and positive relationship-based support — never punitive discipline.",
        icon: "sprout",
      },
      {
        title: "Close-Knit Community",
        desc: "Field trips, garden days, play dates, and a family feel where parents, students, and siblings thrive together.",
        icon: "users",
      },
    ],
  },
  founder: {
    eyebrow: "Our Story",
    heading: "Growing and exploring",
    headingAccent: "together.",
    paragraphs: [
      "Wondering Oaks Learning is a secular learning program in Conroe, Texas — designed to bridge the gap between homeschool and private school for early elementary students.",
      "Founded by Ms. Christian Rust, the school grew from a passion for giving children autonomy and trust to explore their world. Today, Ms. Lisa and Ms. Laura carry forward a community where students feel safe, loved, and encouraged to be capable, independent learners.",
    ],
    credentials: [
      "Secular Microschool",
      "Multi-Age TK–3rd",
      "Logic of English & Math With Confidence",
      "Free Forest School Fridays",
    ],
    quote: "I have always felt strongly that children should be free to interact with their world with autonomy and trust.",
    quoteAttribution: "— Ms. Christian Rust, Founder",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "Conroe, TX" },
    name: "Wondering Oaks Learning",
    title: "Ms. Lisa & Ms. Laura, Lead Educators",
  },
  parallax: {
    eyebrow: "Growing and Exploring Together",
    heading: ["Autonomy.", "Inquiry.", "Community.", "Discovery."],
    subtitle:
      "Students learn outside, standing up, upside down, on balance boards, with music, while eating a snack, or through games — however they learn best.",
    primaryCta: "Schedule a Visit",
    secondaryCta: "Ask About Fit",
    backgroundImage: "/images/stock/Homeschool2.jpg",
  },
  pillars: {
    eyebrow: "The Whole Child",
    heading: "Educating minds, hearts, and growing bodies.",
    subtitle:
      "Social-emotional learning woven through every part of the day — not an add-on, but how we teach.",
    items: [
      {
        icon: "heart",
        title: "Emotional Awareness",
        desc: "Students learn the science behind emotions and record their feelings daily with teacher support.",
      },
      {
        icon: "leaf",
        title: "Self-Regulation Tools",
        desc: "Deep breathing, stretching, meditation, and yoga — tools students use independently and confidently.",
      },
      {
        icon: "users",
        title: "Positive Communication",
        desc: "Natural consequences and relationship building — never punitive discipline strategies.",
      },
      {
        icon: "sprout",
        title: "Student Autonomy",
        desc: "Students regulate their own needs during work blocks, learning time management through real experience.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Ready to see if Wondering Oaks is the right fit for your family?",
    sidebarImage: "/images/stock/Homeschool3.jpg",
    eyebrow: "Get in Touch",
    heading: "Schedule a visit — by appointment only.",
    description:
      "School visits are by appointment only. Tell us about your child and we'll reach out to schedule a time to visit our Conroe campus.",
    submitLabel: "Submit Inquiry",
    disclaimer:
      "Wondering Oaks shares property space with a family photographer. Visits are by appointment only.",
    successEmoji: "✓",
    successTitle: "Inquiry received!",
    successMessage:
      "We'll be in touch soon to schedule your visit and answer any questions.",
    programOptions: [
      { value: "full-time", label: "Full-Time (3–4 Days)" },
      { value: "part-time", label: "Part-Time (1–2 Days)" },
      { value: "foundational", label: "Foundational Core (Mon/Wed)" },
      { value: "science", label: "Science & Projects (Tue/Thu)" },
      { value: "unsure", label: "Not sure yet — help me decide" },
    ],
    studentFields: {
      namePlaceholder: "Child's Name",
      gradePlaceholder: "Select age/grade...",
      gradeOptions: [
        { value: "tk", label: "Transitional Kindergarten" },
        { value: "k", label: "Kindergarten" },
        { value: "1st", label: "1st Grade" },
        { value: "2nd", label: "2nd Grade" },
        { value: "3rd", label: "3rd Grade" },
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Common questions from Conroe families",
    subtitle:
      "Everything you need to know before scheduling a visit.",
    items: [
      {
        q: "What ages does Wondering Oaks serve?",
        a: "Wondering Oaks serves early elementary students, typically ages 5–8 (TK through 3rd grade). Developmental needs matter more than age — students may stay 3–5 years depending on fit. Contact us if you have a 9–10 year old who might benefit from the current program.",
      },
      {
        q: "Is Wondering Oaks a religious school?",
        a: "No. Wondering Oaks is a secular learning program and does not affiliate with any religious or political view. Any religious or political items on the shared property belong to the property owners and do not reflect the views of Wondering Oaks.",
      },
      {
        q: "What does tuition include?",
        a: "Annual tuition covers August through June. Supply fees are $100 per day of attendance and include workbooks, daily supplies, reading materials, science equipment, and games. There is no registration or paperwork fee. Sibling discount is 30%; pay annually within one month of enrollment for 5% off.",
      },
      {
        q: "Can Wondering Oaks support neurodiverse learners?",
        a: "Yes. Wondering Oaks lovingly supports students on the Autism Spectrum, with ADHD, anxiety, and other neurodevelopmental differences. Students move freely, work in varied positions, release energy outdoors, and practice emotional regulation explicitly throughout the day.",
      },
      {
        q: "How do I schedule a visit?",
        a: "Visits are by appointment only. Fill out the inquiry form or email wonderingoakslearning@gmail.com. We'd love to show you our classroom and discuss whether Wondering Oaks is the best fit for your child.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Ready to Come Visit?",
    heading: "Discover a classroom where students feel",
    headingAccent: "safe, loved, and capable.",
    description:
      "We strive to combine the best aspects of traditional homeschooling and a small private school — with class sizes averaging about 10, one-on-one teacher support, and a multi-age community in Conroe, Texas.",
    primaryCta: "Schedule a Visit",
    secondaryCta: "Explore Programs",
  },
  footer: {
    tagline: "Homeschool Away From Home · Conroe, Texas",
    links: ["Approach", "Programs", "Schedule", "Tuition", "FAQ", "Contact"],
    copyright: "© 2026 Wondering Oaks Learning",
    poweredBy: "Website concept by MudKitchen",
  },
};
