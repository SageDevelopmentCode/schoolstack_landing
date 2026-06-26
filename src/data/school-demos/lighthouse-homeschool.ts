import type { SchoolWebsiteDemoConfig } from "./types";
import { LIGHTHOUSE_LOGO } from "./lighthouse-admin-demo";

export const lighthouseHomeschoolConfig: SchoolWebsiteDemoConfig = {
  slug: "lighthouse-homeschool",
  schoolName: "Lighthouse Homeschool Academy",
  theme: {
    primary: "#336699",
    primaryHover: "#1d519d",
    dark: "#1d519d",
    darkHover: "#2a5580",
    lightBg: "#eef4f8",
    lightBorder: "#d9e2ea",
    muted: "#5f6b76",
    badgeBg: "rgba(51, 102, 153, 0.12)",
    accentText: "#336699",
    pageBg: "#ffffff",
  },
  logo: LIGHTHOUSE_LOGO,
  hero: {
    eyebrow: "Fairview Park, Ohio · Christian Hybrid Program · Enrolling Now",
    eyebrowPlacement: "announcementBar",
    headline: ["A Christ-centered hybrid", "homeschool community."],
    subheadline:
      "Lighthouse Homeschool Academy offers the finest of both the homeschooling and traditional worlds — 2 days on campus for core academics and 3 days at home with teacher-crafted lesson plans and parent partnership.",
    primaryCta: "Apply Now",
    secondaryCta: "How It Works",
    secondaryCtaTarget: "signature",
    navCta: "Apply Now",
    navLinks: ["Program", "How It Works", "Admissions", "FAQ"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/Homeschool3.jpg"],
    imageAlt: "Students learning in a warm Christian homeschool community",
    trustBadges: ["Christ-Centered", "Hybrid Schedule", "Parent Partnership"],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "How the Week Works",
    heading: "Two days on campus. Three days at home.",
    subtitle:
      "Our hybrid model gives families structure, community, and flexibility — with teachers and parents partnering together in your child's education.",
    modes: [
      {
        label: "On Campus",
        title: "On-Campus Days",
        desc: "Drop-off days where students are taught core subjects — math, language arts, science, and history — in a Christ-centered classroom community.",
        icon: "bookOpen",
      },
      {
        label: "At Home",
        title: "At-Home Days",
        desc: "Three days at home with parent-led instruction using teacher-created lesson plans and handbooks — you are the primary educator, we come alongside.",
        icon: "compass",
      },
      {
        label: "Monthly",
        title: "Monthly Lesson Plans",
        desc: "Teachers create monthly lesson plans for both campus and home days — giving families direction and flexibility for their homeschooling style.",
        icon: "graduationCap",
      },
      {
        label: "Community",
        title: "Christian Community",
        desc: "On-campus days feel like a traditional private Christian school — with extra recess, smaller classes, and a strong emphasis on belonging together.",
        icon: "sparkles",
      },
    ],
    flexFriday: {
      title: "Drop-Off Convenience",
      desc: "On-campus days are drop-off only — parents don't stay on site. Drop-off at 8:20 AM, pickup at 2:20 PM in Fairview Park, Ohio.",
    },
  },
  stats: [
    { value: "Fairview Park", label: "Ohio Location" },
    { value: "2 Days", label: "On Campus" },
    { value: "3 Days", label: "At Home" },
    { value: "$235/mo", label: "Tuition" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Is Lighthouse Right for Your Family?",
    heading: "For families who want structure, community, and Christ-centered education.",
    cards: [
      {
        title: "Thinking about homeschooling",
        desc: "Want structure and community without giving up the homeschooling lifestyle? Our hybrid model bridges both worlds.",
      },
      {
        title: "Already homeschooling",
        desc: "Looking for a Christ-centered community, professional lesson plans, and on-campus core instruction? We come alongside your family.",
      },
      {
        title: "Parents as primary educators",
        desc: "You are chosen by God to lead your child's education — we provide the support, lesson plans, and campus days to make it work.",
      },
      {
        title: "Smaller class community",
        desc: "Teachers celebrate each child's God-given talents and help students find their unique place in school and community.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/Homeschool3.jpg",
  },
  marquee: [
    "Christ-Centered",
    "Hybrid Homeschool",
    "Fairview Park, Ohio",
    "2 Days On Campus",
    "3 Days at Home",
    "Parent Partnership",
    "Core Academics",
    "Christian Community",
    "Monthly Lesson Plans",
    "Drop-Off Model",
    "Information Meetings",
    "Apply Now",
  ],
  programs: {
    eyebrow: "Our Program",
    heading: "A hybrid model built for real families",
    subtitle: "Click each area to explore what enrollment at Lighthouse looks like.",
    ctaLabel: "Apply Now",
    items: [
      {
        badge: "On Campus",
        title: "On-Campus Core Academics",
        teaser: "Math, language arts, science, and history",
        desc: "On-site days are a drop-off model where students are taught the core subjects by experienced teachers in a traditional private Christian setting — with additional recess and community emphasis.",
        details: ["2 Days/Week", "6 Hours/Day", "Drop-Off Model", "Core Subjects"],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#336699]",
        accentBg: "bg-[#eef4f8]",
      },
      {
        badge: "At Home",
        title: "At-Home Parent Partnership",
        teaser: "Three days of guided home instruction",
        desc: "Parents are the main educator at home — not just monitoring homework, but teaching with teacher handbooks and monthly lesson plans designed for your child's grade level.",
        details: ["3 Days/Week", "Teacher Lesson Plans", "Parent-Led", "Flexible Style"],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#1d519d]",
        accentBg: "bg-[#eef4f8]",
      },
      {
        badge: "Faith",
        title: "Christ-Centered Community",
        teaser: "Raising disciples who shine their light",
        desc: "We are a Christ-centered program dedicated to raising disciples — teaching children to use their God-given talents to serve their community with grace, mercy, and love.",
        details: ["Statement of Faith", "Christian Community", "Smaller Classes", "Individual Gifts"],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#336699]",
        accentBg: "rgba(51, 102, 153, 0.12)",
      },
      {
        badge: "Hybrid",
        title: "Hybrid Enrollment",
        teaser: "The best of both worlds",
        desc: "Lighthouse offers the finest of both homeschooling and traditional worlds — structure and community on campus, flexibility and family time at home.",
        details: ["$40 App Fee", "$150 Enrollment Fee", "$235/mo Tuition", "Space Limited"],
        image: "/images/stock/Homeschool3.jpg",
        accent: "text-[#1d519d]",
        accentBg: "bg-[#eef4f8]",
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
      "Teachers and parents partner together",
      "in the education of their child.",
    ],
    attribution: "Lighthouse Homeschool Academy",
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
    eyebrow: "Campus Day Schedule",
    heading: "A focused on-campus rhythm",
    headingSub: "Twice weekly · 8:20 AM – 2:20 PM · Fairview Park, Ohio",
    steps: [
      {
        time: "8:20 AM",
        activity: "Drop-Off",
        desc: "Students arrive for a full day of on-campus learning — parents drop off and return at pickup.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "Morning",
        activity: "Core Academics",
        desc: "Teachers instruct math, language arts, science, and history in smaller class settings with individual attention.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "Midday",
        activity: "Recess & Community",
        desc: "Additional recess time and Christian community building — becoming a light together.",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        time: "Afternoon",
        activity: "Continued Instruction",
        desc: "Core subjects continue with teachers sensitive to each child's individual gifts and learning style.",
        image: "/images/stock/ImageFive.jpg",
      },
      {
        time: "2:20 PM",
        activity: "Pickup",
        desc: "Families pick up and continue the week's learning at home with teacher-provided lesson plans.",
        image: "/images/stock/Homeschool3.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Trust & Identity",
    heading: "Christ-centered. Hybrid. Partnered.",
    subtitle:
      "Lighthouse Homeschool Academy combines faith, flexibility, and a proven hybrid model for Ohio homeschooling families.",
    items: [
      {
        title: "Christ-Centered",
        desc: "Our mission is to help raise disciples — teaching children to use their God-given talents to serve their community.",
        icon: "shield",
      },
      {
        title: "Hybrid Schedule",
        desc: "Two days on campus for core academics, three days at home with parent-led instruction and teacher support.",
        icon: "compass",
      },
      {
        title: "Parent Partnership",
        desc: "Parents are the main educator — we come alongside your family with lesson plans, handbooks, and community.",
        icon: "users",
      },
      {
        title: "Core Academics",
        desc: "On-campus instruction in math, language arts, science, and history by experienced teachers in smaller classes.",
        icon: "bookOpen",
      },
    ],
  },
  founder: {
    eyebrow: "Our Mission",
    heading: "A bright light in",
    headingAccent: "our community.",
    paragraphs: [
      "We are a Christ-centered program and our mission is to help raise disciples. We believe in being a bright light in this world where we teach our children to use their God-given talents and skills to help those in our community.",
      "We also believe God's grace and mercy is a gift for all believers and loving other people is what we are called to do. At Lighthouse, parents are the main educator — but we come alongside your family as a support system.",
    ],
    credentials: [
      "Christ-centered hybrid program",
      "Fairview Park, Ohio",
      "2 days on campus / 3 at home",
      "Parent-teacher partnership",
    ],
    quote:
      "We believe in building a community and support for families to become the light of Christ to the world.",
    quoteAttribution: "— Our Mission",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "Fairview Park, OH" },
    name: "Lighthouse Homeschool Academy",
    title: "A Christian Hybrid Program",
  },
  parallax: {
    eyebrow: "Hybrid Homeschool",
    heading: ["Structured.", "Flexible.", "Known."],
    subtitle:
      "The finest of both the homeschooling and traditional worlds — with monthly lesson plans, drop-off campus days, and a Christ-centered community in Fairview Park.",
    primaryCta: "Apply Now",
    secondaryCta: "Request Information",
    backgroundImage: "/images/stock/Homeschool2.jpg",
  },
  pillars: {
    eyebrow: "What We Offer",
    heading: "Built for hybrid homeschool families.",
    subtitle:
      "Structure on campus, flexibility at home, and a community that supports your calling as a parent-educator.",
    items: [
      {
        icon: "bookOpen",
        title: "On-Campus Core Academics",
        desc: "Two days of drop-off instruction in math, language arts, science, and history with experienced teachers.",
      },
      {
        icon: "users",
        title: "Parent Partnership",
        desc: "Monthly lesson plans and teacher handbooks so you can confidently lead home instruction three days a week.",
      },
      {
        icon: "compass",
        title: "Hybrid Flexibility",
        desc: "Buy curriculum used, teach your way at home, and enjoy the community of on-campus days.",
      },
      {
        icon: "sparkles",
        title: "Christian Community",
        desc: "Smaller classes, extra recess, and a Christ-centered environment where every child's gifts are celebrated.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Ready to find out if Lighthouse is the right fit for your family?",
    sidebarImage: "/images/stock/Homeschool3.jpg",
    eyebrow: "Admissions Open",
    heading: "Inquire about an Information Meeting.",
    description:
      "Tell us about your family and we'll reach out about our next Information Meeting or help you begin the application process. No commitment required.",
    submitLabel: "Submit Inquiry",
    disclaimer: "We'll respond within 48 hours. Call (440) 409-7497 or email director.lighthousehomeschool@gmail.com.",
    successEmoji: "✓",
    successTitle: "Inquiry received!",
    successMessage:
      "We'll be in touch within 48 hours about our next Information Meeting.",
    programOptions: [
      { value: "hybrid-full", label: "Hybrid Full Program" },
      { value: "elementary", label: "Elementary Grades" },
      { value: "middle", label: "Middle School" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Student's Name",
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
        { value: "9", label: "9th Grade" },
        { value: "10", label: "10th Grade" },
        { value: "11", label: "11th Grade" },
        { value: "12", label: "12th Grade" },
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions parents ask",
    subtitle:
      "New to hybrid homeschooling? Here are the most common things families want to know before applying.",
    items: [
      {
        q: "What is the time commitment for the homeschool parent?",
        a: "During the three days off-campus, your role isn't simply to monitor your child while they do homework — but to be prepared by reviewing the day's lessons and utilizing the teacher handbooks. Generally, we tell people to consider this your part-time job.",
      },
      {
        q: "Do I have to stay during on-campus days?",
        a: "On-campus days are drop-off days — parents don't have to stay on site. Drop-off is at 8:20 AM and pickup is at 2:20 PM.",
      },
      {
        q: "Do I have to purchase my own curriculum?",
        a: "Yes, you will be responsible for purchasing the curriculum your student will use. The advantage is you can buy books used and sell them again at the end of the year. A curriculum list is provided once you register.",
      },
      {
        q: "How much does tuition cost?",
        a: "The annual tuition cost per student is $2,350 for the school year — broken into 10 monthly payments of $235 from August to May. There is also a $150 enrollment fee when your application is approved, plus a $40 application fee per family.",
      },
      {
        q: "Do you require credentialed classroom teachers?",
        a: "As an education services provider for homeschooling families, a credential is not a requirement. Our teaching staff has decades of combined experience — many were teachers at reputable schools in the area.",
      },
      {
        q: "Are students permitted if they do not meet vaccination requirements?",
        a: "Yes, your student may attend whether or not they are fully vaccinated and/or boosted.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Space Is Limited",
    heading: "Ready to find out if Lighthouse",
    headingAccent: "is the right fit?",
    description:
      "Email director.lighthousehomeschool@gmail.com or call (440) 409-7497 to inquire about our next Information Meeting or begin your application.",
    primaryCta: "Apply Now",
    secondaryCta: "Request Information",
  },
  footer: {
    tagline: "A Christ-centered hybrid homeschool program in Fairview Park, Ohio.",
    links: ["Program", "How It Works", "Admissions", "FAQ", "Contact"],
    copyright: "© 2026 Lighthouse Homeschool Academy",
    poweredBy: "Website concept by MudKitchen",
  },
};
