import type { SchoolWebsiteDemoConfig } from "./types";
import { PARADISE_EARTH_ACADEMY_LOGO } from "./paradise-earth-academy-admin-demo";

export const paradiseEarthAcademyConfig: SchoolWebsiteDemoConfig = {
  slug: "paradise-earth-academy",
  schoolName: "Paradise Earth Academy",
  theme: {
    primary: "#EB8444",
    primaryHover: "#D9732F",
    dark: "#333333",
    darkHover: "#1a1a1a",
    lightBg: "#FCF6F0",
    lightBorder: "rgba(51, 51, 51, 0.10)",
    muted: "#666666",
    badgeBg: "rgba(235, 132, 68, 0.12)",
    accentText: "#BE4B8E",
    pageBg: "#F9F7F2",
  },
  logo: PARADISE_EARTH_ACADEMY_LOGO,
  hero: {
    eyebrow: "Private K-8 · Gilbert, Arizona · Enrolling Now",
    eyebrowPlacement: "announcementBar",
    headline: ["Freedom to", "Flourish."],
    subheadline:
      "Paradise Earth Academy is a private K-8 school in Gilbert, Arizona — offering joyful, holistic academics with small classes, hands-on electives, and daily connection to the natural world. Full- or part-time options to fit your family.",
    primaryCta: "Join the Waitlist",
    secondaryCta: "Explore Programs",
    secondaryCtaTarget: "signature",
    navCta: "Contact Us",
    navLinks: ["Programs", "Who We Are", "Garden", "FAQ"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/ImageFour.jpg"],
    imageAlt: "Students learning outdoors in a garden and nature-rich environment",
    trustBadges: ["K-8", "10:1 Ratio", "Memoria Press", "ESA / Class Wallet"],
    tagline: "Freedom to Flourish!",
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "hybridRhythm",
    eyebrow: "How the Week Works",
    heading: "Academic days on campus. Nature woven into every week.",
    subtitle:
      "Paradise Earth Academy blends small-group academics with flexible family support, outdoor exploration, and a dedicated Nature Day — so children build strong foundations while staying connected to the world around them.",
    tagline: "Freedom to Flourish!",
    campusDays: [
      {
        label: "Mon · Tue · Thu · Fri",
        title: "Academic Program Days",
        desc: "Core subjects daily — English, math, history, geography, science, and literature — in small classes of up to 10 students, 9:00 AM to 2:30 PM, with electives in the final hour.",
      },
      {
        label: "9:00 AM – 2:30 PM",
        title: "Small Classes & Electives",
        desc: "Dedicated teachers work closely with each student. The day ends with a chosen elective — gardening, arts & crafts, musical theater, baking, board games, and more.",
      },
    ],
    homeDays: [
      {
        label: "Flexible 1–4 Days/Week",
        title: "Part-Time & Home Support",
        desc: "Parents receive weekly lesson emails for all four academic days. Students take books home on off-days and families follow along from home with teacher-guided support.",
      },
      {
        label: "Wednesdays",
        title: "Nature Day Program",
        desc: "Optional horsemanship in Queen Creek, then families meet at nature parks to play, picnic, hike, and explore. Nature brings balance and healing to body, mind, and soul.",
      },
    ],
    serviceNote:
      "Students have built a 1,500 sq. ft. outdoor learning garden — constructing boxes, trellises, planting, painting, and irrigation. A true source of pride and inspiration.",
  },
  stats: [
    { value: "~65 Students", label: "K-8 Community" },
    { value: "10:1 Ratio", label: "Small Class Sizes" },
    { value: "Grades K–8", label: "Private School" },
    { value: "Gilbert, AZ", label: "East Valley" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Why Families Choose P.E.A.",
    heading: "Joyful academics, nature-rich learning, and a community that feels like family.",
    cards: [
      {
        title: "Holistic, joyful learning",
        desc: "Students study academics while discovering personal creativity, talents, and gifts in a balanced, supportive environment.",
      },
      {
        title: "Nature every day",
        desc: "Gardening, outdoor activities, earth sciences, play, and a dedicated Wednesday Nature Day program woven into the rhythm of the week.",
      },
      {
        title: "Flexible for families",
        desc: "Enroll 1–4 academic days per week with home support. Teachers keep part-time families informed with weekly lesson plans.",
      },
      {
        title: "Small classes, close support",
        desc: "Class sizes around 10:1 so every child receives 1-on-1 attention, mastery-based instruction, and room to grow at their own pace.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/ImageFour.jpg",
  },
  marquee: [
    "Freedom to Flourish",
    "Gilbert, Arizona",
    "Private K-8",
    "Nature Days",
    "Memoria Press",
    "Small Classes",
    "School Garden",
    "Holistic Learning",
    "ESA Approved",
    "Class Wallet",
    "Join the Waitlist",
    "Schedule a Tour",
  ],
  programs: {
    eyebrow: "Our Programs",
    heading: "Pathways for every family",
    subtitle: "Flexible academic days, nature-rich Wednesdays, and hands-on electives — click each program to learn more.",
    ctaLabel: "Join the Waitlist",
    items: [
      {
        badge: "Flexible",
        title: "Academic Program",
        teaser: "1–4 days/week · $625–$2,250 per quarter",
        desc: "Each academic day students work on core subjects with breaks between classes, lunch and recess, and a chosen elective to finish the day. Part-time families receive weekly lesson emails to follow along at home.",
        details: ["1–4 Days/Week", "Core Subjects", "Small Classes", "Memoria Press"],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#EB8444]",
        accentBg: "bg-[#FCF6F0]",
      },
      {
        badge: "Nature",
        title: "Nature Days",
        teaser: "Wednesdays · parks, play, and outdoor exploration",
        desc: "Wednesday Nature Day begins second quarter. Families meet at nature parks to play, picnic, hike, observe wildlife, and enjoy the health benefits of time outdoors. A vital part of our educational philosophy.",
        details: ["Wednesdays", "Nature Parks", "Family Outings", "Outdoor Learning"],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#9BB08E]",
        accentBg: "bg-[#F3F1E8]",
      },
      {
        badge: "Optional",
        title: "Horsemanship Program",
        teaser: "$250/quarter · Queen Creek ranch",
        desc: "Students enrolled in Horsemanship begin their Wednesday at our partnered ranch in Queen Creek from 9–10 AM, then join families at the scheduled nature park locations.",
        details: ["Wednesdays", "Queen Creek", "$250/Quarter", "Optional Add-On"],
        image: "/images/stock/ImageFive.jpg",
        accent: "text-[#4CB1BA]",
        accentBg: "rgba(76, 177, 186, 0.12)",
      },
      {
        badge: "K-8",
        title: "Grade-Level Classrooms",
        teaser: "K through 8th grade · phonics to algebra",
        desc: "From kindergarten phonics and play-based learning to middle school algebra, composition, and classical literature — students build strong foundations through hands-on learning and classic books.",
        details: ["Kindergarten", "Lower Elementary", "Upper Elementary", "Middle School"],
        image: "/images/stock/ImageSeven.jpg",
        accent: "text-[#BE4B8E]",
        accentBg: "bg-[#FCF6F0]",
      },
    ],
  },
  mosaicImages: [
    "/images/stock/Homeschool.jpg",
    "/images/stock/Homeschool2.jpg",
    "/images/stock/ImageFour.jpg",
  ],
  quote: {
    text: [
      "Education begins the moment we see children",
      "as innately wise and capable beings.",
    ],
    attribution: "— Vince Gowmon",
    backgroundImage: "/images/stock/ImageNine.jpg",
  },
  stripImages: [
    "/images/stock/ImageEleven.jpg",
    "/images/stock/ImageTwelve.jpg",
    "/images/stock/ImageThirteen.jpg",
    "/images/stock/Homeschool.jpg",
    "/images/stock/Homeschool2.jpg",
    "/images/stock/ImageFour.jpg",
  ],
  timeline: {
    eyebrow: "A Day at P.E.A.",
    heading: "Core subjects, outdoor breaks, and electives",
    headingSub: "Gilbert, AZ · Mon, Tue, Thu, Fri academic days",
    steps: [
      {
        time: "9:00 AM",
        activity: "Arrival & Set-Up",
        desc: "Students arrive, settle in, and prepare for the day in a calm, welcoming classroom environment.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "9:15–10:00",
        activity: "English",
        desc: "Language arts, cursive, spelling, and grammar — with outdoor breaks between each lesson.",
        image: "/images/stock/ImageFive.jpg",
      },
      {
        time: "10:15–11:00",
        activity: "Mathematics",
        desc: "Mastery-based math with Memoria Press workbooks and manipulatives at each student's level.",
        image: "/images/stock/ImageSeven.jpg",
      },
      {
        time: "11:15–12:00",
        activity: "History & Science",
        desc: "Alternating weeks of history/geography and science — with time in the garden between classes.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "1:30–2:15",
        activity: "Electives",
        desc: "Gardening, arts & crafts, musical theater, Spanish, baking, board games, and student-led clubs.",
        image: "/images/stock/ImageSix.jpg",
      },
    ],
  },
  socialProof: {
    type: "testimonials",
    eyebrow: "What Families Say",
    heading: "A community that feels like family.",
    subtitle:
      "Paradise Earth Academy families value academic achievement in a natural, loving learning environment — with teachers who prioritize each child's well-being.",
    items: [
      {
        quote:
          "Our family has been with PEA since day one. The community feels like family, and I love that my children get to be right near me while I work at the school. The holistic approach and time in nature have been the biggest blessing for all of us.",
        name: "Ashley Ryves",
        detail: "Office Administrator & PEA Parent",
        stars: 5,
        avatar: "/images/stock/ImageTen.jpg",
      },
      {
        quote:
          "I was drawn to PEA because of its joyful, holistic philosophy — a place where learning happens through curiosity, creativity, and connection with the natural world. Every child learns best when they feel safe, seen, and supported.",
        name: "Mrs. Antonia Ramos",
        detail: "3rd Grade Teacher, Paradise Earth Academy",
        stars: 5,
        avatar: "/images/stock/ImageSeven.jpg",
      },
    ],
  },
  founder: {
    eyebrow: "Who We Are",
    heading: "Founded on balance,",
    headingAccent: "creativity, and nature.",
    paragraphs: [
      "Melissa Alexander left the public school system in 2020 to support homeschooling families — which led to the founding of Paradise Earth Academy. Her mission was to create a more balanced learning environment where students experience academic structure with plenty of time for creativity and outdoor time in nature.",
      "At Paradise Earth Academy, we have created a joyful and holistic learning environment where students study academics while being supported in discovering their personal creativity, talents, and gifts.",
    ],
    credentials: [
      "B.S. Education, Illinois State University",
      "Founded 2020",
      "Gilbert, Arizona",
      "Freedom to Flourish",
    ],
    quote:
      "I work to assist students in their overall well-being — giving them the tools they need to lead healthy and happy lives.",
    quoteAttribution: "— Melissa Alexander, Founder & Director",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "Gilbert, AZ" },
    name: "Melissa Alexander",
    title: "Founder & Director",
  },
  parallax: {
    eyebrow: "School Garden",
    heading: ["Growing.", "Learning.", "Flourishing."],
    subtitle:
      "Students have built our 1,500 sq. ft. garden — constructing boxes, trellises, planting, painting, and irrigation. It's an ongoing project and a true source of pride.",
    primaryCta: "Join the Waitlist",
    secondaryCta: "Schedule a Tour",
    backgroundImage: "/images/stock/Homeschool2.jpg",
  },
  pillars: {
    eyebrow: "Why You'll Love P.E.A.",
    heading: "Holistic education rooted in nature and community.",
    subtitle:
      "Small classes, joyful academics, hands-on electives, and a school garden that gives children a direct relationship with the world around them.",
    items: [
      {
        icon: "sprout",
        title: "Holistic Education",
        desc: "Joyful learning where students discover creativity, talents, and gifts alongside strong academic foundations.",
      },
      {
        icon: "treePine",
        title: "Nature Connection",
        desc: "Gardening, outdoor activities, earth sciences, play, and weekly Nature Days woven into daily learning.",
      },
      {
        icon: "bookOpen",
        title: "Academic Support",
        desc: "Memoria Press classical curriculum, mastery-based math, and small classes with close teacher support.",
      },
      {
        icon: "users",
        title: "Community Spirit",
        desc: "Family partnership, local donor support, school pride, and a community that feels like family.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Ready to see if Paradise Earth Academy is the right fit for your family?",
    sidebarImage: "/images/stock/Homeschool.jpg",
    eyebrow: "Join the Waitlist",
    heading: "Schedule a tour or reserve your spot.",
    description:
      "Tell us about your child and we'll reach out to schedule a tour or answer questions about enrollment. No commitment required.",
    submitLabel: "Submit Inquiry",
    disclaimer:
      "We'll respond within 48 hours. Call (480) 376-2258 or email admin@paradiseearthacademy.com.",
    successEmoji: "✓",
    successTitle: "Inquiry received!",
    successMessage:
      "We'll be in touch within 48 hours about scheduling a tour or next steps for enrollment.",
    programOptions: [
      { value: "1-day", label: "Academic Program — 1 day/week" },
      { value: "2-day", label: "Academic Program — 2 days/week" },
      { value: "3-day", label: "Academic Program — 3 days/week" },
      { value: "4-day", label: "Academic Program — 4 days/week" },
      { value: "horsemanship", label: "Horsemanship Program" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Student's Name",
      gradePlaceholder: "Select grade level...",
      gradeOptions: [
        { value: "K", label: "Kindergarten" },
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
      "New to Paradise Earth Academy? Here are the most common things families want to know before joining the waitlist.",
    items: [
      {
        q: "What curriculum do you use?",
        a: "We use Memoria Press curriculum — a highly acclaimed classical program with literature sets and mastery-based mathematics. Students receive books at whichever level they are at, and our annual curriculum fee is $300.",
      },
      {
        q: "What if my child attends less than 4 days per week?",
        a: "Every week, parents receive an email from teachers detailing lessons for all 4 days. Students take books home on off-days and families follow along from home. As a homeschool support program, teachers don't facilitate home work but keep families informed.",
      },
      {
        q: "Do you assign homework?",
        a: "No, teachers do not assign homework. All lessons are expected to be completed during class. Parents may choose to review or extend work at home as they see fit.",
      },
      {
        q: "How does the Nature Day program work?",
        a: "Wednesday Nature Day begins second quarter after fall break. Families meet at nature parks each week. Optional horsemanship at our partnered Queen Creek ranch runs 9–10 AM for $250 per quarter.",
      },
      {
        q: "How is tuition paid?",
        a: "Tuition is paid each quarter through Class Wallet, credit card, or check — aligned with the ESA funding schedule. Due dates are July 15, October 15, January 15, and April 15.",
      },
      {
        q: "What is the size of the school?",
        a: "We currently have about 65 students across Kindergarten through 8th grade. Class sizes are kept small around a 10:1 student-to-teacher ratio.",
      },
      {
        q: "What electives can my child take?",
        a: "Spanish, theater, outdoor sports, arts & crafts, Pokémon trading club, scrapbooking, creative engineering, board games, Legos, student council, and business club — changing each semester based on student interest.",
      },
      {
        q: "What are the school rules?",
        a: "Two simple rules: respect and kindness at all times, and maintain a peaceful environment. Students do remarkably well behaviorally, and staff follow a clear behavior protocol when needed.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Take the Next Step",
    heading: "Join our waitlist or",
    headingAccent: "schedule a tour.",
    description:
      "Begin your child's journey at Paradise Earth Academy. Email admin@paradiseearthacademy.com or call (480) 376-2258 to get started.",
    primaryCta: "Join the Waitlist",
    secondaryCta: "Schedule a Tour",
  },
  footer: {
    tagline: "A private K-8 school in Gilbert, Arizona — Freedom to Flourish!",
    links: ["Programs", "Who We Are", "Garden", "FAQ", "Contact"],
    copyright: "© 2026 Paradise Earth Academy",
    poweredBy: "Website concept by SchoolStack",
  },
};
