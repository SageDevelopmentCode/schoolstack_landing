import type { SchoolWebsiteDemoConfig } from "./types";
import { WILDCAT_MICROSCHOOL_LOGO } from "./wildcat-microschool-admin-demo";

const CONTACT_URL = "https://wildcatmicroschool.weebly.com/contact.html";
const CALENDAR_URL = "https://wildcatmicroschool.weebly.com/2025-2026-calendar.html";
const BLOG_URL = "https://wildcatmicroschool.weebly.com/blog";

export const wildcatMicroschoolConfig: SchoolWebsiteDemoConfig = {
  slug: "wildcat-microschool",
  schoolName: "Wildcat Microschool",
  theme: {
    primary: "#071C37",
    primaryHover: "#123056",
    dark: "#071C37",
    darkHover: "#123056",
    lightBg: "#F7F8FA",
    lightBorder: "#E4E7EB",
    muted: "#536174",
    badgeBg: "rgba(7, 28, 55, 0.08)",
    accentText: "#071C37",
    pageBg: "#FFFFFF",
  },
  logo: WILDCAT_MICROSCHOOL_LOGO,
  hero: {
    eyebrow: "Wildcat Microschool · Haverhill, New Hampshire",
    headline: ["Learning at their own pace.", "Growing together."],
    subheadline:
      "Wildcat Microschool is a homeschool learning pod where children explore, collaborate, and learn through hands-on projects—with individualized support and opportunities to connect with nature.",
    primaryCta: "Contact us",
    secondaryCta: "Explore our approach",
    secondaryCtaTarget: "signature",
    navCta: "Ask about Wildcat",
    navLinks: ["Educators", "Approach", "Contact", "FAQ"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/Homeschool3.jpg"],
    imageAlt: "Concept forest imagery for this redesign. Not a photograph of Wildcat students.",
    trustBadges: ["Homeschool learning pod", "Haverhill, NH", "Student-driven", "Nature-based"],
    tagline: "Learning can happen anywhere!",
  },
  sections: {
    showMosaic: false,
    showStrip: false,
    showParallax: false,
    showFounder: false,
    showClosingCta: true,
  },
  stats: [
    { value: "Haverhill", label: "New Hampshire" },
    { value: "Homeschool", label: "Learning pod" },
    { value: "3", label: "Guides" },
    { value: "Forest", label: "Nature-based learning" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Our approach",
    heading: "Allowing children to thrive with innovative approaches to learning.",
    cards: [
      {
        title: "Student-driven learning",
        desc: "Children learn at their own pace, with support shaped around their individual needs.",
      },
      {
        title: "Hands-on exploration",
        desc: "Projects and collaborative activities invite students to learn by doing.",
      },
      {
        title: "Stronger connections",
        desc: "A smaller learning environment creates more opportunities for educator support and meaningful relationships.",
      },
      {
        title: "Room to play and explore",
        desc: "Social interaction, free play, and nature-based experiences extend learning beyond a typical classroom.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/Homeschool3.jpg",
  },
  signatureSection: {
    type: "valuePillars",
    eyebrow: "Where learning happens",
    heading: "A learning environment beyond the classroom.",
    tagline: "Learning can happen anywhere!",
    pillars: [
      {
        title: "Guides' homes",
        desc: "The microschool is located in the guides' homes, within a few miles of one another.",
        icon: "users",
      },
      {
        title: "Flexible seating",
        desc: "Students have flexible seating options shaped around how they learn.",
        icon: "compass",
      },
      {
        title: "Nearby forest",
        desc: "Forestland near the guides' homes creates room to explore and learn outdoors, along with other local resources.",
        icon: "treePine",
      },
    ],
  },
  marquee: [
    "Haverhill, New Hampshire",
    "Homeschool learning pod",
    "Student-driven learning",
    "Hands-on projects",
    "Nature-based learning",
    "Learning can happen anywhere",
    "Three guides",
    "Self-directed play",
  ],
  programs: {
    eyebrow: "Educators",
    heading: "Meet our educators.",
    subtitle: "Photos are concept imagery, not portraits of these guides.",
    ctaLabel: "Contact us",
    items: [
      {
        badge: "Guide",
        title: "Heather Long",
        teaser: "Whole-child, hands-on learning",
        desc: "Heather brings experience as a preschool teacher, behavior specialist, and school counselor. She advocates for environments where children can thrive and supports whole-child learning through hands-on and experiential experiences.",
        details: ["Preschool teaching", "Behavior specialist", "School counselor", "Experiential learning"],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#071C37]",
        accentBg: "bg-[#F7F8FA]",
      },
      {
        badge: "Guide",
        title: "Laura Sjolander",
        teaser: "Engaging students in the work",
        desc: "Laura has experience teaching students from Pre-K through eighth grade. She focuses on engaging students and making learning an experience they are excited to take part in. That range describes her experience, not a published Wildcat age band.",
        details: ["Pre-K through 8th experience", "Student engagement", "Learning that feels exciting"],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#071C37]",
        accentBg: "bg-[#F7F8FA]",
      },
      {
        badge: "Guide",
        title: "Ashley Amey",
        teaser: "A positive, encouraging atmosphere",
        desc: "Ashley's background includes serving as a Prenda guide and working as a lead preschool and toddler teacher. She believes children learn best in a positive, encouraging atmosphere and aims to make learning fun.",
        details: ["Prenda guide", "Preschool and toddler teaching", "Encouraging atmosphere"],
        image: "/images/stock/Homeschool3.jpg",
        accent: "text-[#071C37]",
        accentBg: "bg-[#F7F8FA]",
      },
    ],
  },
  mosaicImages: [
    "/images/stock/Homeschool.jpg",
    "/images/stock/Homeschool2.jpg",
    "/images/stock/Homeschool3.jpg",
  ],
  quote: {
    text: ["Learning can happen anywhere!"],
    attribution: "Wildcat Microschool",
    backgroundImage: "/images/stock/Homeschool.jpg",
  },
  stripImages: [
    "/images/stock/Homeschool.jpg",
    "/images/stock/Homeschool2.jpg",
    "/images/stock/Homeschool3.jpg",
    "/images/stock/ImageEleven.jpg",
    "/images/stock/ImageNine.jpg",
    "/images/stock/ImageTwelve.jpg",
  ],
  timeline: {
    eyebrow: "News",
    heading: "Projects, stories, and updates.",
    headingSub: "Dated posts from the school's blog",
    steps: [
      {
        time: "March 12, 2024",
        activity: "Student-built robots",
        desc: "In March 2024, Wildcat shared that its rookie robotics team won its first two fights at an NHRL competition in Norwalk, Connecticut, and finished tied for 17th out of 96 teams. This is a past project story, not a current program. Read it on the blog index: " +
          BLOG_URL,
        image: "/images/stock/ImageEleven.jpg",
      },
      {
        time: "April 18, 2025",
        activity: "Wildcat Times: Spring, 2025",
        desc: "The school published its Spring 2025 newsletter on April 18, 2025. The newsletter file is not reproduced in this concept. Find the post on the blog index: " +
          BLOG_URL,
        image: "/images/stock/ImageNine.jpg",
      },
      {
        time: "December 1, 2023",
        activity: "A conversation about microschooling",
        desc: "A December 1, 2023 post describes a Wildcat guide joining a Pioneer Institute webinar about microschooling. The post does not name the panelist. Read it on the blog index: " +
          BLOG_URL,
        image: "/images/stock/ImageTwelve.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "From the school's own site",
    heading: "Student-driven, hands-on, and close to nature.",
    subtitle:
      "These points restate Wildcat's homepage. This concept does not add parent quotes or star ratings.",
    items: [
      {
        title: "Learn at their own pace",
        desc: "Wildcat focuses on student-driven learning, with support shaped around each student.",
        icon: "compass",
      },
      {
        title: "Learn by doing",
        desc: "Hands-on projects and collaborative activities are part of how the pod describes its days.",
        icon: "sparkles",
      },
      {
        title: "More room for relationships",
        desc: "The school describes a smaller teacher-to-student setting, without publishing a numeric ratio.",
        icon: "users",
      },
      {
        title: "Room to be outside",
        desc: "Nearby forestland and local resources support nature-based learning beyond a typical classroom.",
        icon: "treePine",
      },
    ],
  },
  founder: {
    eyebrow: "Guides",
    heading: "Three educators,",
    headingAccent: "named on the homepage.",
    paragraphs: [
      "Heather Long, Laura Sjolander, and Ashley Amey are the educators named on Wildcat's homepage.",
      "This section stays out of the preview so the page does not single out one person as a founder.",
    ],
    credentials: ["Heather Long", "Laura Sjolander", "Ashley Amey"],
    quote: "Learning can happen anywhere!",
    quoteAttribution: "Wildcat Microschool",
    image: "/images/stock/Homeschool.jpg",
    imageBadge: { label: "Place", value: "Haverhill, NH" },
    name: "Wildcat guides",
    title: "Named on the homepage",
  },
  parallax: {
    eyebrow: "Haverhill, New Hampshire",
    heading: ["Learning at their own pace.", "Growing together."],
    subtitle:
      "A homeschool learning pod. This band is hidden so stock photography is not presented as the school.",
    primaryCta: "Contact us",
    secondaryCta: "Explore our approach",
    backgroundImage: "/images/stock/Homeschool2.jpg",
  },
  pillars: {
    eyebrow: "Next steps",
    heading: "Start a conversation with Wildcat.",
    subtitle:
      "Have a question about the learning pod? The school's current site keeps a general contact form and a separate waitlist form.",
    items: [
      {
        icon: "compass",
        title: "Contact us",
        desc: `Questions about the learning pod go to the school's current contact page: ${CONTACT_URL}`,
      },
      {
        icon: "users",
        title: "Ask about the waitlist",
        desc: "The contact page also invites families to a waitlist form. That invitation does not show whether spots are open.",
      },
      {
        icon: "bookOpen",
        title: "2025–2026 Calendar",
        desc: `The site labels a calendar 2025–2026. This concept does not rename it or treat it as a current-year calendar. ${CALENDAR_URL}`,
      },
    ],
  },
  form: {
    sidebarQuote: "Have a question about our learning pod?",
    sidebarImage: "/images/stock/Homeschool3.jpg",
    eyebrow: "Contact",
    heading: "Start a conversation with Wildcat.",
    description:
      "This preview form stays on the page so the walkthrough can show an inquiry. It does not send a message to the school.",
    submitLabel: "Preview message",
    disclaimer: `This concept does not submit to the school. For a real inquiry, use ${CONTACT_URL}`,
    successEmoji: "✓",
    successTitle: "Preview only",
    successMessage:
      "Nothing was sent to Wildcat Microschool. Use the school's contact page for a real message.",
    trustNote:
      "A waitlist question is separate from a general inquiry. This form does not confirm availability.",
    programOptions: [
      { value: "general", label: "General question" },
      { value: "waitlist", label: "Waitlist question" },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions this concept can answer",
    subtitle: "Answers stay inside what the school's public pages actually say.",
    items: [
      {
        q: "What kind of school is Wildcat?",
        a: "Wildcat describes itself as a homeschool learning pod in Haverhill, New Hampshire. This concept does not call it an accredited private school.",
      },
      {
        q: "Is there a waitlist?",
        a: `The contact page invites families to a waitlist form, separate from the general contact form. That invitation does not show current availability. ${CONTACT_URL}`,
      },
      {
        q: "Where is the calendar?",
        a: `The site still labels a calendar 2025–2026. This concept does not rename it. ${CALENDAR_URL}`,
      },
      {
        q: "Is robotics a current program?",
        a: `A March 12, 2024 blog post describes a rookie robotics team at an NHRL competition. It is a dated story, not proof of a current program. Posts live on ${BLOG_URL}`,
      },
      {
        q: "What ages or tuition does Wildcat publish?",
        a: "The retrieved homepage does not publish an age range, a class-size ratio, a weekly schedule, or tuition. This concept does not add those details.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Haverhill, New Hampshire",
    heading: "Start a conversation",
    headingAccent: "with Wildcat.",
    description:
      "Have a question about the learning pod? This preview does not collect family information for the school.",
    primaryCta: "Contact us",
    secondaryCta: "Explore our approach",
  },
  footer: {
    tagline: "Haverhill, New Hampshire. Website redesign concept.",
    links: ["Educators", "Approach", "Contact", "FAQ"],
    copyright: `Website redesign concept. Inquiry buttons stay in this demo. Contact: ${CONTACT_URL} · 2025–2026 Calendar: ${CALENDAR_URL}`,
    poweredBy: "Website concept by MudKitchen",
  },
};
