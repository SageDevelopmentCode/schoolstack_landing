import type { SchoolWebsiteDemoConfig } from "./types";
import { NATURES_SCHOOLHOUSE_LOGO } from "./natures-schoolhouse-admin-demo";

export const naturesSchoolhouseConfig: SchoolWebsiteDemoConfig = {
  slug: "natures-schoolhouse",
  schoolName: "Nature's Schoolhouse Microschool",
  theme: {
    primary: "#3F7652",
    primaryHover: "#2F5E40",
    dark: "#2F5E40",
    darkHover: "#1E1E1E",
    lightBg: "#F7F3EC",
    lightBorder: "#D9D4CC",
    muted: "#8F8F8F",
    badgeBg: "rgba(63, 118, 82, 0.12)",
    accentText: "#E84A43",
    pageBg: "#F7F3EC",
  },
  logo: NATURES_SCHOOLHOUSE_LOGO,
  hero: {
    eyebrow: "Cedar Park, TX · PK–6 + Teen Lounge · Enrollment Open 2026/27",
    eyebrowPlacement: "announcementBar",
    headline: ["A Place to Learn,", "A Place to Play,", "A Place to Grow."],
    subheadline:
      "At Nature's Schoolhouse, we believe kids deserve more than desks, deadlines, and test prep. They deserve room to grow in a setting that honors who they are and how they learn — a close-knit community on a 10+ acre campus in Cedar Park.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Explore Programs",
    secondaryCtaTarget: "programs",
    navCta: "Schedule a Tour",
    navLinks: ["About", "Programs", "Schedule", "Trail Notes", "FAQ"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/Homeschool3.jpg"],
    imageAlt: "Children learning and playing outdoors at Nature's Schoolhouse",
    tagline: "A Place to Learn, A Place to Play, A Place to Grow.",
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "How We Learn",
    heading: "Structured academics, outdoor exploration, and a close-knit community.",
    subtitle:
      "We blend high-quality academic guidance with meaningful outdoor experiences and the flexibility families need in a supportive, multi-age environment.",
    modes: [
      {
        label: "Academics",
        title: "Structured Academics",
        desc: "Core academics on Tue–Thu blend structured learning with outdoor time, peer connection, and a relaxed environment that honors each child's pace.",
        icon: "bookOpen",
      },
      {
        label: "Outdoors",
        title: "Outdoor Exploration",
        desc: "Learning takes place both indoors and out — connecting students to the natural world through hands-on discovery and campus exploration.",
        icon: "leaf",
      },
      {
        label: "Community",
        title: "Multi-Age Community",
        desc: "A close-knit educational community focused on nurturing each child's unique strengths, curiosity, confidence, and connection.",
        icon: "users",
      },
      {
        label: "Flexibility",
        title: "Flexible Homeschool Blend",
        desc: "Fridays are learning-from-home days, offering families the flexibility to customize their educational experience while staying connected.",
        icon: "compass",
      },
    ],
    flexFriday: {
      title: "Discovery Days",
      desc: "Monday outdoor enrichment sessions explore branches of science — climatology, geology, biology — through outdoor experiments and real-world discovery.",
    },
  },
  stats: [
    { value: "Cedar Park", label: "Texas Location" },
    { value: "PK–6 + Teen", label: "Programs Available" },
    { value: "10+ Acres", label: "Outdoor Campus" },
    { value: "Need-Based Aid", label: "Financial Support" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Is Nature's Schoolhouse Right for Your Family?",
    heading: "A nurturing, nature-forward community for curious learners.",
    cards: [
      {
        title: "Want more than desks and test prep",
        desc: "We create an environment where learners explore, build confidence, and develop a genuine love of learning.",
      },
      {
        title: "Value outdoor and hands-on learning",
        desc: "Campus time blends structured academics with outdoor free play, peer connection, and meaningful nature experiences.",
      },
      {
        title: "Need flexible homeschool support",
        desc: "Our hybrid schedule — Tue–Thu on campus, Friday at home — gives families structure with room to customize.",
      },
      {
        title: "Seek a close-knit microschool community",
        desc: "Small classes mean every child is seen, heard, and valued in a supportive multi-age environment.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/ImageFour.jpg",
  },
  marquee: [
    "A Place to Learn",
    "A Place to Play",
    "A Place to Grow",
    "Cedar Park, Texas",
    "Outdoor Learning",
    "Flexible Learning",
    "Discovery Days",
    "Full-Time Explorers",
    "Teen Learning Lounge",
    "Need-Based Financial Aid",
    "Small Class Sizes",
    "Schedule a Tour",
  ],
  programs: {
    eyebrow: "Programs",
    heading: "Flexible learning for every age and stage",
    subtitle:
      "From early explorers to homeschool teens — programs designed around nature, community, and personalized growth.",
    ctaLabel: "Schedule a Tour",
    items: [
      {
        badge: "K–6",
        title: "Full-Time Explorers",
        teaser: "Mon–Thu · $11,440/year",
        desc: "Our core academics program runs Tue–Thu with Monday Discovery Days included. Each day blends structured academics with outdoor time, peer connection, and a relaxed environment. Doors open at 9:00 a.m.; learning begins at 10:00 a.m. Fridays are learning-from-home days.",
        details: [
          "$11,440/year tuition",
          "Mon–Thu, 9:00 AM – 2:00 PM",
          "Extended Discovery Days until 3:30 PM",
          "Summer sessions included (June & August)",
        ],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#3F7652]",
        accentBg: "bg-[#F7F3EC]",
      },
      {
        badge: "Ages 4–12",
        title: "Discovery Days",
        teaser: "Mondays only · $2,325/year",
        desc: "Our Monday outdoor enrichment program is a full-day, drop-off option open to both current students and homeschool families. Each 4–5 week session focuses on a different branch of science through outdoor experiments and discovery.",
        details: [
          "$2,325/year tuition",
          "Mondays, 9:00 AM – 3:30 PM",
          "Open to NSH students & homeschool families",
          "Science themes rotate each session",
        ],
        image: "/images/stock/Homeschool3.jpg",
        accent: "text-[#E84A43]",
        accentBg: "bg-[#F7F3EC]",
      },
      {
        badge: "Grades 7–12",
        title: "Teen Learning Lounge",
        teaser: "T–Th · Session-based pricing",
        desc: "A flexible drop-off program for homeschool teens who want a dedicated place to study, connect, and stay on track. Learners bring their own curriculum while educators provide a calm environment with social time, gentle accountability, and on-demand academic support.",
        details: [
          "1–3 days/week options",
          "Five 6-week sessions per year",
          "1 Day/Wk: $150/session",
          "3 Days/Wk: $390/session",
        ],
        image: "/images/stock/ImageFive.jpg",
        accent: "text-[#3F7652]",
        accentBg: "rgba(63, 118, 82, 0.12)",
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
      "I wish everyone could experience a learning environment like the one at Nature's Schoolhouse. My child LOVES to go to school, and I love knowing that he is cared for, loved, and creating lifelong friendships.",
    ],
    attribution: "Nature's Schoolhouse Parent",
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
    eyebrow: "A Day at Nature's Schoolhouse",
    heading: "Structured rhythm with room to explore",
    headingSub: "Tue–Thu 9:00 AM – 2:00 PM · Cedar Park, TX · Fridays at home",
    steps: [
      {
        time: "9:00 AM",
        activity: "Outdoor Free Play",
        desc: "Doors open for outdoor free play — a warm, nature-forward start to the day before structured learning begins.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "10:00 AM",
        activity: "Core Academics",
        desc: "Structured academic guidance in a relaxed environment — honoring each child's pace and path.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "12:00 PM",
        activity: "Lunch & Connection",
        desc: "Learners eat together and connect with peers in a supportive, multi-age community.",
        image: "/images/stock/ImageFive.jpg",
      },
      {
        time: "1:00 PM",
        activity: "Outdoor & Enrichment",
        desc: "Outdoor time, hands-on exploration, and meaningful experiences that connect students to the natural world.",
        image: "/images/stock/ImageSix.jpg",
      },
      {
        time: "2:00 PM",
        activity: "Dismissal",
        desc: "Families pick up with Friday reserved for learning-from-home — flexibility built into every week.",
        image: "/images/stock/Homeschool3.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "What People Are Saying",
    heading: "See why parents and students love Nature's Schoolhouse.",
    subtitle:
      "Visit our Wonderschool page to read more reviews and testimonials from our community.",
    items: [
      {
        title: "Wonderschool Reviews",
        desc: "Multiple 5-star testimonials describe a caring community, strong academics, and children excited to attend.",
        icon: "shield",
      },
      {
        title: "Small Class Sizes",
        desc: "Every student receives personalized attention in a close-knit environment where each child is seen and valued.",
        icon: "users",
      },
      {
        title: "Financial Aid Available",
        desc: "Need-based financial aid through the Community Learning Foundation makes our program accessible to more families.",
        icon: "heart",
      },
      {
        title: "10+ Acre Campus",
        desc: "Our Cedar Park campus at Rockbridge Church offers expansive outdoor space for nature-forward learning.",
        icon: "leaf",
      },
    ],
  },
  founder: {
    eyebrow: "Our Mission",
    heading: "Empowering families through flexible,",
    headingAccent: "supportive learning.",
    paragraphs: [
      "At Nature's Schoolhouse, we empower families through a flexible, supportive learning environment that blends structured academics with the freedom of homeschooling.",
      "Our mission is to nurture each child's unique potential by combining high-quality academic guidance, meaningful outdoor experiences, and a close-knit community that fosters curiosity, confidence, and connection.",
    ],
    credentials: [
      "Secular microschool · PK–6 core program",
      "Cedar Park, Texas · 10+ acre campus",
      "Community Learning Foundation partner",
      "Need-based financial aid available",
    ],
    quote: "School feels like an extension of home — a place of belonging, discovery, and joy.",
    quoteAttribution: "— Our Vision",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "Cedar Park, TX" },
    name: "Nature's Schoolhouse",
    title: "Microschool · Cedar Park, Texas",
  },
  parallax: {
    eyebrow: "A Peek Inside",
    heading: ["Learn.", "Play.", "Grow.", "Belong."],
    subtitle:
      "We create an environment where learners can explore, build confidence, and develop a genuine love of learning — on a campus designed for nature-forward education.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Explore Programs",
    backgroundImage: "/images/stock/Homeschool2.jpg",
  },
  pillars: {
    eyebrow: "Trail Notes",
    heading: "Reflections on childhood and learning.",
    subtitle:
      "Recent posts from our blog — thoughtfulness, activity, and community from the Nature's Schoolhouse team.",
    items: [
      {
        icon: "sparkles",
        title: "The Real Magic Begins: Discovery Days Start Monday!!",
        desc: "Our academic pod launched and we've spent these first weeks building community — Discovery Days bring the outdoor science magic.",
      },
      {
        icon: "leaf",
        title: "The Best of Both Worlds",
        desc: "One of the things we've come to love about running a microschool is the freedom to try different things over the years.",
      },
      {
        icon: "heart",
        title: "Why Back-to-School Doesn't Have to Mean Back to Stress",
        desc: "Every August, parents tell us the first few weeks feel harder than they should. It doesn't have to be that way.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Ready to explore Nature's Schoolhouse for your family?",
    sidebarImage: "/images/stock/Homeschool3.jpg",
    eyebrow: "Interest Form",
    heading: "Tell us about your learner — we'll follow up with next steps.",
    description:
      "Fill out our interest form and we'll reach out to schedule a campus tour, answer your questions, and guide you through enrollment.",
    submitLabel: "Submit Interest Form",
    disclaimer:
      "Enrollment fee: $500 one-time. Curriculum fee: $700/year. Need-based financial aid available through the Community Learning Foundation.",
    successEmoji: "✓",
    successTitle: "Interest form received!",
    successMessage:
      "Thank you for your interest in Nature's Schoolhouse. We'll review your submission and follow up with next steps soon.",
    programOptions: [
      { value: "full-time", label: "Full-Time Explorers (M–Th)" },
      { value: "discovery-days", label: "Discovery Days (Mondays only)" },
      { value: "teen-lounge", label: "Teen Learning Lounge (7–12)" },
      { value: "unsure", label: "Not sure yet — help me decide" },
    ],
    studentFields: {
      namePlaceholder: "Learner's First & Last Name",
      gradePlaceholder: "Select grade entering...",
      gradeOptions: [
        { value: "pk", label: "Pre-K" },
        { value: "k", label: "Kindergarten" },
        { value: "1st", label: "1st Grade" },
        { value: "2nd", label: "2nd Grade" },
        { value: "3rd", label: "3rd Grade" },
        { value: "4th", label: "4th Grade" },
        { value: "5th", label: "5th Grade" },
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
    heading: "Common questions from Cedar Park families",
    subtitle:
      "Everything you need to know before scheduling a tour.",
    items: [
      {
        q: "What programs does Nature's Schoolhouse offer?",
        a: "We offer Full-Time Explorers (K–6, Mon–Thu), Discovery Days (Monday outdoor enrichment for ages 4–12), and Teen Learning Lounge (grades 7–12, Tue–Thu). Each program is designed for flexibility and nature-forward learning.",
      },
      {
        q: "What is the schedule?",
        a: "Core academics run Tue–Thu, 9:00 AM–2:00 PM with doors opening at 9:00 for outdoor free play. Mondays are Discovery Days (9:00 AM–3:30 PM). Fridays are learning-from-home days. The school year runs September through May.",
      },
      {
        q: "Do you offer financial aid?",
        a: "Yes! Thanks to the Community Learning Foundation, we offer need-based financial aid. We also provide a 5% discount for paid-in-full tuition and a 5% sibling discount for families enrolling more than one child.",
      },
      {
        q: "What are tuition and fees?",
        a: "Full-Time Explorers is $11,440/year plus a $700 curriculum fee and $500 enrollment fee. Discovery Days is $2,325/year. Teen Learning Lounge is session-based ($150–$390 per 6-week session depending on days/week).",
      },
      {
        q: "Where are you located?",
        a: "We are located at 2001 West New Hope Drive, Cedar Park, TX 78613 — on a 10+ acre campus at Rockbridge Church. Schedule a tour to see our outdoor learning spaces.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Enrollment Open",
    heading: "Give your child room to",
    headingAccent: "learn, play, and grow.",
    description:
      "Nature's Schoolhouse Microschool is a close-knit community in Cedar Park where every learner is nurtured, supported, and inspired. Schedule a tour today.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Explore Programs",
  },
  footer: {
    tagline: "A Place to Learn, A Place to Play, A Place to Grow · Cedar Park, TX",
    links: ["About", "Programs", "Schedule", "Trail Notes", "FAQ", "Contact"],
    copyright: "© 2026 Nature's Schoolhouse Microschool",
    poweredBy: "Website concept by SchoolStack",
  },
};
