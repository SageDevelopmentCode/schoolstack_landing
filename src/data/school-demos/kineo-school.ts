import type { SchoolWebsiteDemoConfig } from "./types";
import { KINEO_SCHOOL_LOGO } from "./kineo-school-admin-demo";

export const kineoSchoolConfig: SchoolWebsiteDemoConfig = {
  slug: "kineo-school",
  schoolName: "The Kineo School",
  theme: {
    primary: "#F7C713",
    primaryHover: "#E5B800",
    dark: "#0A0B7A",
    darkHover: "#080966",
    lightBg: "#CFE3DA",
    lightBorder: "#B8D4CC",
    muted: "#5A6B7D",
    badgeBg: "rgba(91, 183, 176, 0.12)",
    accentText: "#5BB7B0",
    pageBg: "#FFFFFF",
  },
  logo: KINEO_SCHOOL_LOGO,
  hero: {
    eyebrow: "Kirkland, WA · Accredited K-5 · Enrolling Now",
    eyebrowPlacement: "announcementBar",
    headline: ["Learning", "set in motion."],
    subheadline:
      "A small, personalized K-5 school where every child's strengths are seen, supported, and celebrated — including neurodivergent learners who thrive with individualized instruction and a warm, close-knit community.",
    primaryCta: "Schedule a Visit",
    secondaryCta: "Our Programs",
    secondaryCtaTarget: "programs",
    navCta: "Schedule a Visit",
    navLinks: ["Programs", "Philosophy", "Testimonials", "FAQ"],
    backgroundImage: "/images/stock/ImageTwo.jpg",
    floatingImages: ["/images/stock/ImageSeven.jpg", "/images/stock/ImageSix.jpg"],
    imageAlt: "Students engaged in hands-on learning at Kineo School",
    trustBadges: ["K-5 Independent", "Accredited", "Neurodivergent Support", "Kirkland, WA"],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "What Kineo Sets in Motion",
    heading: "Curiosity, connection, and confident self-advocacy.",
    subtitle:
      "We care about the whole child — not just as learners, but as unique individuals who grow through personalized instruction, social-emotional learning, and a community where every child is known.",
    modes: [
      {
        label: "Curious",
        title: "Curious, Critical Thinking",
        desc: "Students learn at their own pace in ability-based groups — picking up literacy, math, science, and social studies skills through engaging mini-lessons and hands-on exploration.",
        icon: "compass",
      },
      {
        label: "Connected",
        title: "Caring, Lasting Friendships",
        desc: "Our commitment to social-emotional learning helps students develop self-awareness and empathy, forming meaningful friendships in a small, multi-age community.",
        icon: "heart",
      },
      {
        label: "Confident",
        title: "Confident Self-Advocates",
        desc: "Kineo kids understand their strengths and challenges, recognize their inherent worth, and confidently show up as their full selves — ready for middle school and beyond.",
        icon: "sparkles",
      },
      {
        label: "Small",
        title: "Small by Design",
        desc: "Accredited K-5 independent school with individualized attention — where neurodivergent learners are celebrated and supported every step of the way.",
        icon: "users",
      },
    ],
    flexFriday: {
      title: "Choice Time",
      desc: "Student-led exploration and creative projects — a daily rhythm that honors curiosity, movement, and joyful engagement.",
    },
  },
  stats: [
    { value: "Kirkland, WA", label: "Independent School" },
    { value: "K-5", label: "Accredited Program" },
    { value: "Small", label: "By Design" },
    { value: "SEL", label: "Core Priority" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Is Kineo Right for Your Family?",
    heading: "For families who want a school where their child is truly known.",
    cards: [
      {
        title: "Neurodivergent learners",
        desc: "Including students shaped by ADHD or Autism — where unique learning styles are recognized, celebrated, and supported with tailored instruction.",
      },
      {
        title: "Small community seekers",
        desc: "Want a school small enough that every child is known by name — with relationships and belonging at the center of the experience?",
      },
      {
        title: "SEL-focused families",
        desc: "Looking for social-emotional growth alongside academics — where friendships, confidence, and self-advocacy develop together?",
      },
      {
        title: "Individualized pacing",
        desc: "Need ability-based groups and mini-lessons that meet students where they are — not a one-size-fits-all classroom?",
      },
    ],
    mainImage: "/images/stock/ImageSeven.jpg",
    secondaryImage: "/images/stock/ImageSix.jpg",
  },
  marquee: [
    "Learning Set in Motion",
    "Kirkland, Washington",
    "Accredited K-5",
    "Multi-Age Cohorts",
    "Social-Emotional Learning",
    "Choice Time",
    "Neurodivergent Support",
    "Schedule a Visit",
    "Small by Design",
    "Individualized Instruction",
    "Enrichment & Field Trips",
    "Meet the School",
  ],
  programs: {
    eyebrow: "Our Program",
    heading: "A tailored K-5 experience",
    subtitle: "Click each area to explore what learning at Kineo looks like.",
    ctaLabel: "Schedule a Visit",
    items: [
      {
        badge: "Core",
        title: "K-5 Academics",
        teaser: "Literacy, math, science, social studies",
        desc: "Ability-based groups and mini-lessons in literacy, math, reading, writing, science, and social studies — meeting each student where they are and building capable, engaged learners.",
        details: ["K-5", "Ability-Based Groups", "Mini-Lessons", "Core Subjects"],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#0A0B7A]",
        accentBg: "bg-[#CFE3DA]",
      },
      {
        badge: "Community",
        title: "Multi-Age Cohorts",
        teaser: "Small groups, individualized pacing",
        desc: "Multi-age classrooms where students learn alongside peers at different stages — fostering mentorship, collaboration, and a sense of belonging in a school small by design.",
        details: ["Multi-Age", "Small Groups", "Individualized", "Collaborative"],
        image: "/images/stock/ImageFive.jpg",
        accent: "text-[#5BB7B0]",
        accentBg: "bg-[#F6EBD1]",
      },
      {
        badge: "SEL",
        title: "SEL & Choice Time",
        teaser: "Relationships, self-awareness, exploration",
        desc: "Social-emotional learning woven through the day — plus Choice Time for student-led projects that build confidence, creativity, and joyful engagement.",
        details: ["Social-Emotional", "Choice Time", "Self-Awareness", "Student-Led"],
        image: "/images/stock/ImageSeven.jpg",
        accent: "text-[#0A0B7A]",
        accentBg: "rgba(91, 183, 176, 0.12)",
      },
      {
        badge: "Explore",
        title: "Enrichment & Field Trips",
        teaser: "Hands-on, outdoor, joyful learning",
        desc: "Enrichment activities and field trips that extend learning beyond the classroom — active, hands-on experiences that build curiosity and connection to the world.",
        details: ["Field Trips", "Hands-On", "Outdoor Learning", "Enrichment"],
        image: "/images/stock/ImageSix.jpg",
        accent: "text-[#C96E4C]",
        accentBg: "bg-[#F6EBD1]",
      },
    ],
  },
  mosaicImages: [
    "/images/stock/ImageTwo.jpg",
    "/images/stock/ImageSeven.jpg",
    "/images/stock/ImageSix.jpg",
  ],
  quote: {
    text: [
      "Picture a place where your child's unique learning style",
      "isn't just recognized — it's celebrated.",
    ],
    attribution: "The Kineo School — Learning Set in Motion",
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
    eyebrow: "A Day at Kineo",
    heading: "Learning in motion — academics, SEL, and exploration",
    headingSub: "Kirkland, WA · Accredited K-5 Independent School",
    steps: [
      {
        time: "Morning",
        activity: "Academic Focus",
        desc: "Ability-based mini-lessons in literacy, math, and core subjects — individualized pacing that meets each learner where they are.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "Midday",
        activity: "Social-Emotional Learning",
        desc: "SEL woven through the day — building self-awareness, empathy, and the skills for lasting friendships.",
        image: "/images/stock/ImageFive.jpg",
      },
      {
        time: "Afternoon",
        activity: "Choice Time",
        desc: "Student-led exploration and creative projects — honoring curiosity, movement, and joyful engagement.",
        image: "/images/stock/ImageSeven.jpg",
      },
      {
        time: "Weekly",
        activity: "Enrichment & Field Trips",
        desc: "Hands-on learning beyond the classroom — outdoor exploration, field trips, and enrichment that brings subjects to life.",
        image: "/images/stock/ImageSix.jpg",
      },
      {
        time: "Events",
        activity: "Community Gatherings",
        desc: "Campus tours, open houses, and family events that welcome prospective families into the Kineo community.",
        image: "/images/stock/ImageNine.jpg",
      },
    ],
  },
  socialProof: {
    type: "testimonials",
    eyebrow: "Voices from Our Community",
    heading: "Families who found a place to belong.",
    subtitle:
      "At Kineo, students become capable learners, caring friends, and confident self-advocates — in a school where every child is known.",
    items: [
      {
        quote:
          "Kineo has been transformative for our family. Our son finally feels seen and supported — not just tolerated. The individualized approach and small community mean he is known by every teacher, and he has blossomed both academically and socially.",
        name: "Sarah Mitchell",
        detail: "Kineo School Parent",
        stars: 5,
        avatar: "/images/stock/ImageTen.jpg",
      },
      {
        quote:
          "We were looking for a school that would celebrate our daughter's neurodivergent strengths rather than pathologize them. At Kineo, she has found genuine friendships and the confidence to advocate for what she needs. We couldn't be happier.",
        name: "David & Priya Chen",
        detail: "Kineo School Parents",
        stars: 5,
        avatar: "/images/stock/ImageSeven.jpg",
      },
    ],
  },
  founder: {
    eyebrow: "Our Approach",
    heading: "Where instruction, community, and",
    headingAccent: "confidence grow together.",
    paragraphs: [
      "The Kineo School is an accredited K-5 independent school in Kirkland, Washington — small by design, with a tailored, individualized approach that empowers every child to reach their full potential.",
      "We welcome a diverse mix of students, including neurodivergent learners. We make school a fun and engaging experience because we understand and adapt to each child's learning style — building curious thinkers, caring friends, and confident self-advocates.",
    ],
    credentials: [
      "Accredited K-5",
      "Individualized instruction",
      "Kirkland, Washington",
      "Neurodivergent support",
    ],
    quote:
      "Learning set in motion — where every child's potential is recognized and nurtured.",
    quoteAttribution: "— The Kineo School",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "Kirkland, WA" },
    name: "The Kineo School",
    title: "Accredited K-5 Independent School",
  },
  parallax: {
    eyebrow: "Accredited K-5",
    heading: ["Known.", "Supported.", "Celebrated."],
    subtitle:
      "A small, personalized school in Kirkland, Washington — where neurodivergent learners thrive and every child is seen, supported, and celebrated.",
    primaryCta: "Schedule a Visit",
    secondaryCta: "Contact Us",
    backgroundImage: "/images/stock/ImageSeven.jpg",
  },
  pillars: {
    eyebrow: "Why Families Choose Kineo",
    heading: "Built for learners who need more than one-size-fits-all.",
    subtitle:
      "Personalized instruction, social-emotional growth, and a warm community — with teachers who know every child by name.",
    items: [
      {
        icon: "bookOpen",
        title: "Individualized Instruction",
        desc: "Ability-based groups and mini-lessons that meet students where they are — literacy, math, science, and social studies at each child's pace.",
      },
      {
        icon: "heart",
        title: "Social-Emotional Learning",
        desc: "SEL woven through the day — building self-awareness, empathy, and the friendships that make school joyful.",
      },
      {
        icon: "users",
        title: "Small by Design",
        desc: "A close-knit K-5 community where every child is known — not lost in a crowd.",
      },
      {
        icon: "sparkles",
        title: "Neurodivergent Support",
        desc: "Including students with ADHD and Autism — where unique learning styles are celebrated and supported every step of the way.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Ready to see if Kineo is the right fit for your family?",
    sidebarImage: "/images/stock/ImageSix.jpg",
    eyebrow: "Schedule a Visit",
    heading: "Book a campus tour or ask a question.",
    description:
      "Tell us about your child and we'll reach out about scheduling a visit, our K-5 program, or next steps. No commitment required.",
    submitLabel: "Send Message",
    disclaimer: "We'll respond within 48 hours. Call (425) 394-9378 or visit us at 7525 132nd Ave NE, Kirkland, WA 98033.",
    successEmoji: "✓",
    successTitle: "Message received!",
    successMessage:
      "We'll be in touch within 48 hours about scheduling a visit or answering your questions.",
    programOptions: [
      { value: "k", label: "Kindergarten" },
      { value: "1", label: "1st Grade" },
      { value: "2", label: "2nd Grade" },
      { value: "3", label: "3rd Grade" },
      { value: "4", label: "4th Grade" },
      { value: "5", label: "5th Grade" },
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
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions families ask",
    subtitle:
      "New to Kineo? Here are the most common things families want to know before scheduling a visit.",
    items: [
      {
        q: "What makes Kineo different from traditional school?",
        a: "We're a small, accredited K-5 independent school designed for individualized learning — especially neurodivergent students who thrive with tailored instruction, SEL, and a community where every child is known by name.",
      },
      {
        q: "Do you support neurodivergent learners?",
        a: "Yes. We welcome a diverse mix of students, including those shaped by ADHD or Autism. Unique learning styles aren't just recognized — they're celebrated and supported with individualized instruction every step of the way.",
      },
      {
        q: "What grades do you serve?",
        a: "We are an accredited K-5 independent school in Kirkland, Washington — small by design with multi-age cohorts and ability-based groups.",
      },
      {
        q: "How do I schedule a visit?",
        a: "Use the contact form above, call us at (425) 394-9378, or email to book a campus tour. We'd love to show you learning in motion.",
      },
      {
        q: "Where are you located?",
        a: "The Kineo School is at 7525 132nd Ave NE, Kirkland, WA 98033 — serving families in Kirkland and the greater Seattle area.",
      },
      {
        q: "What is your educational philosophy?",
        a: "We believe in learning set in motion — personalized instruction, social-emotional growth, and confident self-advocacy. Students learn at their own pace and become capable, engaged learners ready for middle school and beyond.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Join Our Community",
    heading: "Ready to see learning",
    headingAccent: "set in motion?",
    description:
      "Call (425) 394-9378 or visit 7525 132nd Ave NE, Kirkland, WA 98033 to schedule a campus tour and meet our community.",
    primaryCta: "Schedule a Visit",
    secondaryCta: "Contact Us",
  },
  footer: {
    tagline: "An accredited K-5 independent school in Kirkland, Washington.",
    links: ["Programs", "Philosophy", "Testimonials", "FAQ", "Contact"],
    copyright: "© 2026 The Kineo School",
    poweredBy: "Website concept by MudKitchen",
  },
};
