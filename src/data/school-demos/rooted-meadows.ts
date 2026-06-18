import type { SchoolWebsiteDemoConfig } from "./types";
import { ROOTED_MEADOWS_ADMIN_LOGO } from "./rootedmeadows-admin-demo";

export const rootedMeadowsConfig: SchoolWebsiteDemoConfig = {
  slug: "rooted-meadows",
  schoolName: "Rooted Meadows Waldorf School",
  theme: {
    primary: "#827096",
    primaryHover: "#6E5D7F",
    dark: "#2b2a26",
    darkHover: "#827096",
    lightBg: "#F5F0E8",
    lightBorder: "#E8E0D4",
    muted: "#6B6560",
    badgeBg: "#F5F0E8",
    accentText: "#b3b462",
    pageBg: "#FAF8F4",
  },
  logo: ROOTED_MEADOWS_ADMIN_LOGO,
  hero: {
    eyebrow: "Opening August 2026 · Rigby, Idaho · Grades K–8",
    eyebrowPlacement: "announcementBar",
    headline: ["Honoring the Seasons", "of Childhood."],
    subheadline:
      "Rooted Meadows is a Waldorf-guided micro-school in the Greater Idaho Falls area — a hybrid private school and homeschool co-op where childhood is sacred, learning unfolds with meaning, and families find rhythm without performance pressure.",
    primaryCta: "Come Connect With Us",
    secondaryCta: "Explore The Meadow",
    navCta: "Apply Today",
    navLinks: ["The Meadow", "Our Approach", "Admissions", "FAQ"],
    backgroundImage: "/images/stock/ImageTwo.jpg",
    floatingImages: ["/images/stock/ImageSeven.jpg", "/images/stock/ImageSix.jpg"],
    imageAlt: "Children learning outdoors in a nature-based Waldorf setting",
  },
  stats: [
    { value: "4 Days/Week", label: "Mon–Thu Schedule" },
    { value: "5 Hours/Day", label: "9am – 2pm" },
    { value: "16:1 Ratio", label: "Student to Teacher" },
    { value: "$7,200/yr", label: "Grades 1–8 Tuition" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Is Rooted Meadows Right for Your Family?",
    heading: "For thoughtful, family-centered parents seeking wellness and academic excellence.",
    cards: [
      {
        title: "Seeking slower childhood rhythms",
        desc: "A shortened school week and day that restores time for family, play, and wonder.",
      },
      {
        title: "Wellness without performance pressure",
        desc: "Academic mastery through meaningful learning — free from prestige culture.",
      },
      {
        title: "Hybrid co-op flexibility",
        desc: "Private school structure with homeschool partnership — accessible and affordable.",
      },
      {
        title: "Nature, handwork, and farm-to-table",
        desc: "Regenerative farming, communal meals, wool and wood handwork woven into each week.",
      },
    ],
    mainImage: "/images/stock/ImageSeven.jpg",
    secondaryImage: "/images/stock/ImageEight.jpg",
  },
  marquee: [
    "Waldorf-Guided",
    "Grades K–8",
    "Mon–Thu 9–2",
    "Farm-to-Table",
    "Friday BRANCH",
    "Handwork",
    "Eurythmy",
    "Hybrid Co-op",
    "501(c)(3)",
    "Idaho Falls Area",
    "No Screens",
    "Main Lesson",
  ],
  programs: {
    eyebrow: "Program Options",
    heading: "The Meadow — where your child grows",
    subtitle: "Click each option to explore what enrollment looks like at Rooted Meadows.",
    ctaLabel: "Learn More",
    items: [
      {
        badge: "Core Program",
        title: "Waldorf Core Program",
        teaser: "Grades K–8, Mon–Thu 9am–2pm",
        desc: "The complete Rooted Meadows experience — main lesson, handwork, eurythmy, and movement across four intentional days. Waldorf-trained faculty guide developmentally appropriate learning in mixed-age classrooms.",
        details: ["Grades K–8", "Mon–Thu", "9am – 2pm", "$7,200/yr"],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#827096]",
        accentBg: "bg-[#F5F0E8]",
      },
      {
        badge: "Fridays",
        title: "Friday BRANCH Program",
        teaser: "Volunteer-led clubs and extracurriculars",
        desc: "Personalized enrichment opened to homeschool families too — volunteer-led clubs and classes that follow each student's unique sparks. Fee varies by activity.",
        details: ["All Grades", "Fridays", "Homeschool Welcome", "Fee Varies"],
        image: "/images/stock/ImageSix.jpg",
        accent: "text-[#b3b462]",
        accentBg: "bg-[#F5F0E8]",
      },
      {
        badge: "Integrated",
        title: "Farm-to-Table & Handwork",
        teaser: "Learning from the land and our own hands",
        desc: "Two days a week in regenerative farming — planting, building, animal care — and two days in the kitchen preparing communal meals. Wool, wood, and plants from our land in woodworking, knitting, and embroidery.",
        details: ["2 Days Farming", "2 Days Kitchen", "Handwork", "Included in Core"],
        image: "/images/stock/ImageFive.jpg",
        accent: "text-[#2b2a26]",
        accentBg: "bg-[#F5F0E8]",
      },
    ],
  },
  mosaicImages: [
    "/images/stock/ImageSix.jpg",
    "/images/stock/ImageSeven.jpg",
    "/images/stock/ImageTen.jpg",
  ],
  quote: {
    text: [
      "Childhood is sacred.",
      "It isn't a race to be won — it's the foundation.",
    ],
    attribution: "Rooted in what matters most.",
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
    eyebrow: "Weekly Rhythm",
    heading: "A serene schedule designed for",
    headingSub: "childhood, family, and learning.",
    steps: [
      {
        time: "Mon–Thu",
        activity: "Main Lesson",
        desc: "Story-based, developmentally appropriate academics — main lesson books, hands-on projects, and metacognitive reflection woven into each block.",
        image: "/images/stock/ImageEleven.jpg",
      },
      {
        time: "Tue & Wed",
        activity: "Farm-to-Table",
        desc: "Regenerative farming — planting, building, animal care — and communal meal preparation with produce from gardens and local farms.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "Weekly",
        activity: "Handwork & Eurythmy",
        desc: "Wool, wood, and plants from our land in woodworking, knitting, and embroidery. Eurythmy, movement, yoga, and meditation for whole-body wellness.",
        image: "/images/stock/ImageSeven.jpg",
      },
      {
        time: "Seasonally",
        activity: "Festivals & Community",
        desc: "Seasonal festivals, parent volunteer hours, and classroom service projects that cultivate stewardship and a force of goodness.",
        image: "/images/stock/ImageSix.jpg",
      },
      {
        time: "Fridays",
        activity: "BRANCH Program",
        desc: "Volunteer-led clubs and extracurriculars — personalized enrichment open to enrolled families and homeschool co-enrollment.",
        image: "/images/stock/ImageFour.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Trust & Community",
    heading: "A stabilizing force of goodness and wellness",
    subtitle:
      "Rooted Meadows brings together Waldorf pedagogy, community partnership, and accessible tuition for families in Eastern Idaho.",
    items: [
      {
        title: "Registered 501(c)(3) Nonprofit",
        desc: "A mission-driven school community supported by families, donors, and local partners who believe in honoring childhood.",
        icon: "shield",
      },
      {
        title: "Idaho Parent Choice Tax Credit",
        desc: "Families may receive up to $5,000 per child through Idaho's Parent Choice Tax Refund — making tuition even more accessible.",
        icon: "award",
      },
      {
        title: "Waldorf-Trained Faculty",
        desc: "Expert teachers trained at certified Waldorf institutes guide learning with careful observation, thoughtful planning, and deep respect for how children grow.",
        icon: "graduationCap",
      },
    ],
  },
  founder: {
    eyebrow: "Our Vision",
    heading: "A force of goodness",
    headingAccent: "and wellness.",
    paragraphs: [
      "At Rooted Meadows, we envision our community as a stabilizing force of goodness and wellness — as they love life and learning, feel compassionately, and act purposefully in their stewardship for their families and the world.",
      "By embracing the body, mind, and soul of each human, grounding in core virtues of character, and guided by Rudolf Steiner's principles, we provide a rich environment where children and community become courageous, creative, and caring.",
    ],
    credentials: [
      "Integrity",
      "Empathy",
      "Gratitude",
      "Courage",
      "Stewardship",
      "Resilience",
      "Creativity",
    ],
    quote:
      "When we honor the roots of the child, our students grow into stable, purposeful forces of goodness in the world.",
    quoteAttribution: "— Rooted Meadows Mission",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Opening", value: "August 2026" },
    name: "Rooted Meadows",
    title: "Waldorf-Guided Micro-School",
  },
  parallax: {
    eyebrow: "Rooted in What Matters Most",
    heading: ["Slow rhythms.", "Deep learning.", "Whole children."],
    subtitle:
      "In a world moving at a neck-breaking pace, we've chosen a different path. Childhood is sacred — a period of unfolding that deserves to be slow, meaningful, and deeply human.",
    primaryCta: "Come Connect With Us",
    secondaryCta: "Begin the Conversation",
    backgroundImage: "/images/stock/ImageNine.jpg",
  },
  pillars: {
    eyebrow: "The Meadow",
    heading: "Six pillars. One fertile soil.",
    subtitle:
      "Here is the essence of our concept — the fertile soil in which our students grow.",
    items: [
      {
        icon: "sprout",
        title: "Serene Rhythm",
        desc: "A shortened school week and day — Mon–Thu 9am–2pm — restoring the gift of time to childhood and family life.",
      },
      {
        icon: "users",
        title: "Hybrid Advantage",
        desc: "Private school and homeschool co-op hybrid — high-quality Waldorf education accessible and affordable.",
      },
      {
        icon: "leaf",
        title: "Farm-to-Table",
        desc: "Two days farming, two days in the kitchen — regenerative agriculture and communal meals from our gardens.",
      },
      {
        icon: "sparkles",
        title: "Friday BRANCH Program",
        desc: "Volunteer-led clubs open to homeschool families — personalized extracurriculars following each child's sparks.",
      },
      {
        icon: "bookOpen",
        title: "Integrated Handwork",
        desc: "Wool, wood, and plants from our land — woodworking, knitting, embroidery, and sewing building patience and resilience.",
      },
      {
        icon: "heart",
        title: "Whole Body Wellness",
        desc: "Eurythmy, movement, yoga, and meditation supporting nervous system regulation and psychological fitness.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Ready to see if Rooted Meadows is the right home for your child's seasons of childhood?",
    sidebarImage: "/images/stock/ImageSeven.jpg",
    eyebrow: "Admissions Open",
    heading: "Begin the conversation.",
    description:
      "Tell us about your child and we'll reach out to schedule a visit or observation. No commitment required — just a chance to connect.",
    submitLabel: "Submit Inquiry",
    disclaimer: "We'll respond within a few days to schedule your visit or observation.",
    successEmoji: "✓",
    successTitle: "Inquiry received!",
    successMessage:
      "We'll be in touch soon to schedule a visit and begin the conversation about your child's journey.",
    programOptions: [
      { value: "core-k8", label: "Waldorf Core K–8" },
      { value: "branch-friday", label: "Friday BRANCH Program" },
      { value: "kindergarten", label: "Kindergarten" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Child's Name",
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
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions curious parents ask",
    subtitle:
      "New to Waldorf education? Here are the most common things families want to know before applying.",
    items: [
      {
        q: "Is a shortened school day enough time for real learning?",
        a: "Yes. We've designed our school to cover all necessary academic material within 5 hours, Monday through Thursday. Quality time with family matters — and our Waldorf-trained faculty make every hour intentional through main lesson, handwork, and experiential learning.",
      },
      {
        q: "How do you measure academic progress without traditional testing?",
        a: "Progress is demonstrated through main lesson books, semester reports, hands-on projects, and teacher observation. Children create, understand, and remember — metacognitive awareness and higher-order thinking are cultivated as daily practice.",
      },
      {
        q: "Why do students spend so much time outdoors and playing?",
        a: "Movement, nature, and play are essential to Waldorf pedagogy and nervous system regulation. Outdoor and farm-to-table experiences aren't breaks from learning — they are learning, building resilience, stewardship, and whole-body wellness.",
      },
      {
        q: "Will my child be academically prepared for later grades?",
        a: "Waldorf education equips children with the capacities, confidence, and character to succeed wherever they go. Our middle school prepares students for any academic path through metacognitive skills, durable understanding, and the ability to question, reason, and reflect.",
      },
      {
        q: "What is the Idaho Parent Choice Tax Credit?",
        a: "Idaho families may apply for up to $5,000 per child through the Parent Choice Tax Refund program. With tuition at $7,200/year, this can make Rooted Meadows significantly more accessible. We recommend applying as soon as applications open each January.",
      },
      {
        q: "What is the admissions process?",
        a: "Submit an application with supporting documents, schedule an observation visit within two weeks, receive an admissions decision, then complete enrollment through Clarity within two weeks of acceptance.",
      },
      {
        q: "What volunteer expectations do families have?",
        a: "Each parent is required to volunteer time helping in classrooms, field trips, fundraisers, and school festivals. This partnership is the heartbeat of our community — parents become active co-creators of the school's mission.",
      },
      {
        q: "What grades does Rooted Meadows serve?",
        a: "Rooted Meadows serves grades K–8 in the Greater Idaho Falls area, opening on a small scale in August 2026 in Rigby, Idaho.",
      },
    ],
  },
  closingCta: {
    eyebrow: "August 2026 Opening",
    heading: "Open the door to",
    headingAccent: "something magical.",
    description:
      "At Rooted Meadows, education is not rushed — it is cultivated. Apply today and begin your child's thoughtful journey toward mastery, joy, and lasting learning.",
    primaryCta: "Apply Today",
    secondaryCta: "Come Connect With Us",
  },
  footer: {
    tagline: "A Waldorf-guided micro-school honoring the seasons of childhood.",
    links: ["The Meadow", "Our Approach", "Admissions", "FAQ", "Contact"],
    copyright: "© 2026 Rooted Meadows Waldorf School · 501(c)(3) Nonprofit",
    poweredBy: "3833 N 200 E, Rigby, Idaho 83442 · (208) 557-1316",
  },
};
