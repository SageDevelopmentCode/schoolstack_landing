import type { SchoolWebsiteDemoConfig } from "./types";
import { WILD_HEARTS_ADVENTURE_LOGO } from "./wild-hearts-admin-demo";

export const wildHeartsAdventureConfig: SchoolWebsiteDemoConfig = {
  slug: "wild-hearts-adventure",
  schoolName: "Wild Hearts Adventure Co.",
  theme: {
    primary: "#FFD994",
    primaryHover: "#F5C875",
    dark: "#1A2E4C",
    darkHover: "#121D33",
    lightBg: "#E8EDF2",
    lightBorder: "#D4DCE4",
    muted: "#5A6B7D",
    badgeBg: "rgba(140, 164, 184, 0.18)",
    accentText: "#1A2E4C",
    pageBg: "#F0F3F6",
  },
  logo: WILD_HEARTS_ADVENTURE_LOGO,
  hero: {
    eyebrow: "Visalia, CA · Building Wonder · Enrollment Open 2026/27",
    eyebrowPlacement: "announcementBar",
    headline: ["Building", "Wonder"],
    subheadline:
      "Wild Hearts believes in empowering learners, encouraging curiosity, personalizing education, and developing character. Creativity, individual passions, autonomy, and intrinsic motivation are core values of our community culture.",
    primaryCta: "Apply Now",
    secondaryCta: "Explore Programs",
    secondaryCtaTarget: "programs",
    navCta: "Apply Now",
    navLinks: ["About", "Programs", "Schedule", "True North", "FAQ"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/Homeschool3.jpg"],
    imageAlt: "Children exploring and learning in a nature-inspired community",
    tagline: "Wonder is the beginning of wisdom.",
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "Our Values",
    heading: "Empowering learners to dream big and work hard.",
    subtitle:
      "A small group of learners gathering twice weekly for core skills, project-based learning, and hands-on exploration.",
    modes: [
      {
        label: "Empower",
        title: "Empowering Learners",
        desc: "Students pursue their passions — entrepreneurial endeavors, art, creative writing, and topics of personal interest.",
        icon: "sparkles",
      },
      {
        label: "Curiosity",
        title: "Encouraging Curiosity",
        desc: "Project-based learning inspires critical thinking, personal growth, and the freedom to explore what matters to each child.",
        icon: "compass",
      },
      {
        label: "Personalize",
        title: "Personalizing Education",
        desc: "We accommodate any interest we can — woodworking, research, hand sewing, cooking, mechanics, and homesteading.",
        icon: "bookOpen",
      },
      {
        label: "Character",
        title: "Developing Character",
        desc: "Autonomy, intrinsic motivation, and community culture help kids thrive individually and collaboratively.",
        icon: "heart",
      },
    ],
    flexFriday: {
      title: "Specialty Programs",
      desc: "Optional specialty programs in December and June — plus Summer Adventures and afternoon classes for deeper exploration.",
    },
  },
  stats: [
    { value: "Twice Weekly", label: "Wild Hearts Schedule" },
    { value: "TK–12", label: "Programs Available" },
    { value: "$350/mo", label: "Wild Hearts Tuition" },
    { value: "Charter Funds", label: "Accepted for Tuition" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Is Wild Hearts Right for Your Family?",
    heading: "A child-centered community for curious, self-directed learners.",
    cards: [
      {
        title: "Want project-based, hands-on learning",
        desc: "Students work on self-directed and group projects — woodworking, art, research, cooking, mechanics, and more.",
      },
      {
        title: "Value autonomy and intrinsic motivation",
        desc: "Learners choose their path with guide support — no pressure, no comparison, just discovery.",
      },
      {
        title: "Need flexible homeschool enrichment",
        desc: "Twice-weekly programming from late August through May, with optional specialty sessions in December and June.",
      },
      {
        title: "Use charter school enrichment funds",
        desc: "We proudly accept charter school enrichment funds for tuition across all our programs.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/ImageFour.jpg",
  },
  marquee: [
    "Building Wonder",
    "Project-Based Learning",
    "Charter Funds Accepted",
    "Visalia, California",
    "True North",
    "Self-Directed Learning",
    "Outdoor Learning",
    "Woodworking & Art",
    "Homesteading Skills",
    "Small Group Community",
    "Apply Now",
    "Enrollment Open 2026/27",
  ],
  programs: {
    eyebrow: "Programs",
    heading: "Learning adventures for every age and stage",
    subtitle:
      "From early learners to self-directed teens — flexible programs designed around curiosity, creativity, and community.",
    ctaLabel: "Apply Now",
    items: [
      {
        badge: "TK–2nd",
        title: "Wild Hearts",
        teaser: "Twice weekly · $350/month",
        desc: "Our core Wild Hearts program runs twice weekly from late August through May (excluding December), 9:30 AM–2:30 PM. A small group of learners working together on core skills and project-based learning.",
        details: [
          "$350/month tuition",
          "Twice weekly (Aug–May, excl. Dec)",
          "9:30 AM – 2:30 PM",
          "Optional specialty program in Dec & June",
        ],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#1A2E4C]",
        accentBg: "bg-[#E8EDF2]",
      },
      {
        badge: "Grades 6–12",
        title: "True North",
        teaser: "Self-directed pod · $300/month",
        desc: "True North is a unique program for grades 6–12 designed for students who thrive in a small, supportive environment while taking ownership of their learning. Meeting your choice of two days a week.",
        details: [
          "$300/month tuition",
          "Two days per week (your choice)",
          "Self-directed & career-focused",
          "Grades 6–12",
        ],
        image: "/images/stock/Homeschool3.jpg",
        accent: "text-[#8CA4B8]",
        accentBg: "bg-[#E8EDF2]",
      },
      {
        badge: "Seasonal",
        title: "Summer Adventures & Specialty",
        teaser: "December, June, and summer sessions",
        desc: "Optional specialty programs in December and June, plus our Summer Adventures program. Afternoon classes include woodworking, science, outdoor education, art quests, and more.",
        details: [
          "Summer Adventures: 6/9–6/25",
          "Afternoon specialty classes",
          "Woodworking, Science, Outdoor Ed",
          "Application fee: $40/student or $75/family",
        ],
        image: "/images/stock/ImageFive.jpg",
        accent: "text-[#1A2E4C]",
        accentBg: "rgba(140, 164, 184, 0.18)",
      },
    ],
  },
  mosaicImages: [
    "/images/stock/Homeschool.jpg",
    "/images/stock/Homeschool2.jpg",
    "/images/stock/ImageSeven.jpg",
  ],
  quote: {
    text: ["Wonder is the beginning of wisdom."],
    attribution: "Socrates",
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
    eyebrow: "Program Schedule",
    heading: "Twice weekly through the school year",
    headingSub: "Late August through May · 9:30 AM – 2:30 PM · Visalia, CA",
    steps: [
      {
        time: "9:30 AM",
        activity: "Arrival & Connection",
        desc: "Learners arrive and connect with guides and friends — a warm start to a day of discovery.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "10:00 AM",
        activity: "Core Skills",
        desc: "Independent work on math and language arts curriculum, or dedicated computer lab time with personal devices.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "11:30 AM",
        activity: "Project Block",
        desc: "Self-directed and group projects — woodworking, research, art, cooking, mechanics, and homesteading.",
        image: "/images/stock/ImageFive.jpg",
      },
      {
        time: "12:30 PM",
        activity: "Lunch & Outdoor Time",
        desc: "Learners eat together, then explore nature and engage in outdoor play and learner-led education.",
        image: "/images/stock/ImageSix.jpg",
      },
      {
        time: "1:30 PM",
        activity: "Afternoon Exploration",
        desc: "Specialty classes, independent projects, science, PE, hiking, history, and creative expression until 2:30 PM.",
        image: "/images/stock/Homeschool3.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Why Families Choose Wild Hearts",
    heading: "A community where curiosity, connection, and confidence thrive.",
    subtitle:
      "We create an environment where kids discover and develop their unique talents while building skills for future success.",
    items: [
      {
        title: "Charter Funds Accepted",
        desc: "We proudly accept charter school enrichment funds for tuition across Wild Hearts, True North, and specialty programs.",
        icon: "shield",
      },
      {
        title: "Project-Based Learning",
        desc: "Hands-on projects from woodworking and art to research, cooking, mechanics, and homesteading.",
        icon: "palette",
      },
      {
        title: "Small-Group Community",
        desc: "A close-knit learning community where every learner is seen, supported, and encouraged to grow.",
        icon: "users",
      },
      {
        title: "Self-Directed Exploration",
        desc: "Students take ownership of their learning with guide support — fostering intrinsic motivation and autonomy.",
        icon: "sprout",
      },
    ],
  },
  founder: {
    eyebrow: "Who We Are",
    heading: "Guided by passion for education,",
    headingAccent: "nature, and community.",
    paragraphs: [
      "Wild Hearts Adventure Co. is a program born from a passion for education, nature, and wholehearted community — a small group of learners gathering twice weekly in Visalia, California.",
      "Founded by Roekmini Pullom, M.Ed., Wild Hearts is guided by a team dedicated to helping children and parents feel seen, empowered, and inspired to grow. Cara Weeks keeps operations running smoothly, and Callie Ramirez brings heart and insight especially for our littlest learners.",
    ],
    credentials: [
      "Founder: Roekmini Pullom, M.Ed.",
      "Director of Operations: Cara Weeks",
      "Program Manager: Callie Ramirez",
      "Visalia, California",
    ],
    quote: "She shines brightest when helping people feel seen, empowered, and inspired to grow.",
    quoteAttribution: "— About Roekmini Pullom, Founder",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "Visalia, CA" },
    name: "Roekmini Pullom",
    title: "Founder & Executive Director, M.Ed.",
  },
  parallax: {
    eyebrow: "Building Wonder",
    heading: ["Curiosity.", "Creativity.", "Autonomy.", "Community."],
    subtitle:
      "We believe in empowering learners to pursue their passions — whether through entrepreneurial endeavors, art, creative writing, or exploring topics of personal interest.",
    primaryCta: "Apply Now",
    secondaryCta: "Explore Programs",
    backgroundImage: "/images/stock/Homeschool2.jpg",
  },
  pillars: {
    eyebrow: "What We Believe",
    heading: "Core values that shape our community culture.",
    subtitle:
      "Creativity, the freedom to explore individual passions, autonomy, and intrinsic motivation — woven into every day.",
    items: [
      {
        icon: "sparkles",
        title: "Creative Expression",
        desc: "Art, writing, woodworking, and maker projects give learners space to create and express themselves.",
      },
      {
        icon: "leaf",
        title: "Nature & Outdoor Learning",
        desc: "Learner-led outdoor education, hiking, gardening, and nature exploration are part of every week.",
      },
      {
        icon: "compass",
        title: "Self-Directed Learning",
        desc: "Students choose their path with guide approval — research, entrepreneurship, and passion projects welcome.",
      },
      {
        icon: "heart",
        title: "Wholehearted Community",
        desc: "A warm, authentic environment where kids thrive individually and collaboratively.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Ready to join our community of curious, creative learners?",
    sidebarImage: "/images/stock/Homeschool3.jpg",
    eyebrow: "Get in Touch",
    heading: "Apply now — enrollment open for 2026/27.",
    description:
      "Tell us about your family and which program interests you. We'll reach out to answer questions and guide you through the application process.",
    submitLabel: "Submit Application Inquiry",
    disclaimer:
      "Application fee for all programs is $40 per individual student, or $75 per family. We accept charter school enrichment funds.",
    successEmoji: "✓",
    successTitle: "Inquiry received!",
    successMessage:
      "We'll be in touch soon about your application and next steps for enrollment.",
    programOptions: [
      { value: "wild-hearts", label: "Wild Hearts (TK–2nd)" },
      { value: "true-north", label: "True North (Grades 6–12)" },
      { value: "summer", label: "Summer Adventures" },
      { value: "specialty", label: "Specialty Classes (Dec/June)" },
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
        { value: "6th", label: "6th Grade" },
        { value: "7th", label: "7th Grade" },
        { value: "8th", label: "8th Grade" },
        { value: "9th", label: "9th Grade" },
        { value: "10th", label: "10th Grade" },
        { value: "11th", label: "11th Grade" },
        { value: "12th", label: "12th Grade" },
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Common questions from Visalia families",
    subtitle:
      "Everything you need to know before applying.",
    items: [
      {
        q: "What programs does Wild Hearts offer?",
        a: "Wild Hearts serves TK–2nd with twice-weekly programming. True North is our self-directed program for grades 6–12, meeting two days per week. We also offer Summer Adventures and optional specialty programs in December and June.",
      },
      {
        q: "Do you accept charter school enrichment funds?",
        a: "Yes! We are proud to accept charter school enrichment funds for tuition for all our programs. Contact us to learn how to apply your funds toward Wild Hearts or True North.",
      },
      {
        q: "What is the tuition and application fee?",
        a: "Wild Hearts is $350/month. True North is $300/month. The application fee for all programs is $40 per individual student, or $75 per family.",
      },
      {
        q: "What is the schedule?",
        a: "Wild Hearts runs twice weekly from late August through May (excluding December), 9:30 AM–2:30 PM. True North meets your choice of two days per week. Optional specialty programs are offered in December and June.",
      },
      {
        q: "Where are you located?",
        a: "We are located at 17208 Avenue 296, Visalia, CA 93292. Fill out the inquiry form and we'll guide you through the application process.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Enrollment Open Now",
    heading: "Join a community where learners",
    headingAccent: "dream big and work hard.",
    description:
      "Wild Hearts Adventure Co. empowers learners to pursue their passions in a small, supportive community. Apply now for the 2026/27 school year.",
    primaryCta: "Apply Now",
    secondaryCta: "Explore Programs",
  },
  footer: {
    tagline: "Building Wonder · Visalia, California",
    links: ["About", "Programs", "Schedule", "True North", "FAQ", "Contact"],
    copyright: "© 2026 Wild Hearts Adventure Co.",
    poweredBy: "Website concept by SchoolStack",
  },
};
