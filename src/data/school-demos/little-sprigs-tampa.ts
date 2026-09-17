import type { SchoolWebsiteDemoConfig } from "./types";
import { LITTLE_SPRIGS_TAMPA_LOGO } from "./little-sprigs-tampa-admin-demo";

export const littleSprigsTampaConfig: SchoolWebsiteDemoConfig = {
  slug: "little-sprigs-tampa",
  schoolName: "Little Sprigs of Tampa",
  theme: {
    primary: "#254B3D",
    primaryHover: "#1A3A2F",
    dark: "#254B3D",
    darkHover: "#1A3A2F",
    lightBg: "#F7F1E5",
    lightBorder: "#E9DFCB",
    muted: "#6E7D44",
    badgeBg: "rgba(110, 125, 68, 0.12)",
    accentText: "#B96645",
    pageBg: "#F7F1E5",
  },
  logo: LITTLE_SPRIGS_TAMPA_LOGO,
  hero: {
    eyebrow: "Tampa Bay family community",
    eyebrowPlacement: "hero",
    headline: [
      "A place for childhood",
      "to grow wild, grounded, and connected.",
    ],
    subheadline:
      "Little Sprigs of Tampa is a play-based, child-led community where children and parents gather around mindfulness, healthy living, nature, and meaningful connection.",
    primaryCta: "Explore Meetups",
    secondaryCta: "Connect with Us",
    secondaryCtaTarget: "form",
    navCta: "Join the Community",
    navLinks: ["About", "Meetups", "Our Values", "Contact"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: [
      "/images/stock/Homeschool2.jpg",
      "/images/stock/Homeschool3.jpg",
    ],
    imageAlt: "Children exploring outdoors in a garden setting",
    trustBadges: [
      "Play-based",
      "Child-led",
      "Nature-connected",
      "Family-centered",
    ],
    tagline: "A community of The Homeschool Village",
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "How we gather",
    heading: "Play, presence, and practical life.",
    subtitle:
      "Our approach draws from child-led play, mindful moments, nature connection, and hands-on making — activities may vary at each meetup.",
    modes: [
      {
        label: "Play",
        title: "Child-led play",
        desc: "Time and materials for curiosity to lead — children explore, imagine, and discover at their own pace.",
        icon: "sprout",
      },
      {
        label: "Presence",
        title: "Mindful moments",
        desc: "Age-appropriate meditation, breathwork, yoga, and emotional awareness woven into our gatherings.",
        icon: "heart",
      },
      {
        label: "Nature",
        title: "Nature connection",
        desc: "Outdoor learning, park gatherings, gardens, and the rhythms of the seasons.",
        icon: "treePine",
      },
      {
        label: "Making",
        title: "Hands-on making",
        desc: "Baking, storytelling, art, music, dance, drumming, handcrafts, and garden-to-table exploration.",
        icon: "palette",
      },
    ],
  },
  stats: [
    { value: "Tampa Bay", label: "Family community" },
    { value: "Twice monthly", label: "Meetup gatherings" },
    { value: "Play-based", label: "Child-led approach" },
    { value: "Temple Terrace", label: "Service area" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "More than a meetup",
    heading: "A community where families can take root.",
    cards: [
      {
        title: "Love",
        desc: "A space where children and families are welcomed with care.",
      },
      {
        title: "Respect",
        desc: "Honoring each child, each family, and the natural world.",
      },
      {
        title: "Dignity",
        desc: "Protecting childhood and encouraging authentic self-expression.",
      },
      {
        title: "Growth",
        desc: "Making space for friendship, discovery, and lifelong learning.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/ImageFour.jpg",
  },
  marquee: [
    "Play-Based",
    "Child-Led",
    "Nature-Connected",
    "Family-Centered",
    "Mindfulness",
    "Healthy Living",
    "Tampa Bay",
    "Twice Monthly",
    "The Homeschool Village",
    "Community",
    "Garden-to-Table",
    "Connect with Us",
  ],
  programs: {
    eyebrow: "Programs & gatherings",
    heading: "Ways to grow with our village",
    subtitle:
      "Little Sprigs is a meetup community — The Homeschool Village offers additional programs for families seeking deeper engagement.",
    ctaLabel: "Connect with Little Sprigs",
    items: [
      {
        badge: "Meetup community",
        title: "Little Sprigs Meetups",
        teaser: "Twice-monthly family gatherings",
        desc: "A rich holistic program that is play-based, child-led and focuses on protecting childhood, mindfulness and healthy living. An active meetup group for children and their parents in the Tampa Bay area.",
        details: [
          "Twice monthly",
          "Parks & The Homeschool Village",
          "Children & parents welcome",
          "Check Facebook for details",
        ],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#254B3D]",
        accentBg: "bg-[#F7F1E5]",
      },
      {
        badge: "The Homeschool Village",
        title: "Nature-Based Microschool",
        teaser: "Culture, community, and rigorous academics",
        desc: "Florida's first African-centered microschool — combining culture, community, nature-based learning, academic rigor, and whole-child development in an urban homestead setting.",
        details: [
          "Ages 5–11 programs",
          "Scout Park, Temple Terrace",
          "4-day and 5-day options",
          "Contact for current availability",
        ],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#6E7D44]",
        accentBg: "bg-[#F7F1E5]",
      },
      {
        badge: "After school",
        title: "Private Tutoring",
        teaser: "One-on-one enrichment",
        desc: "Private tutoring can provide students with enriching experiences after the school day ends. Open to registered and non-registered students.",
        details: [
          "One-on-one support",
          "After school hours",
          "Registered & non-registered",
          "Contact for availability",
        ],
        image: "/images/stock/ImageFour.jpg",
        accent: "text-[#B96645]",
        accentBg: "bg-[#F7F1E5]",
      },
      {
        badge: "Open to all homeschoolers",
        title: "Kitchen & Garden Events",
        teaser: "Hands in the kitchen, knees in the garden",
        desc: "Bringing indigenous wisdom to the kitchen and to the soil through storytelling, meaningful work, handcrafts and songs. These events are open to all homeschoolers.",
        details: [
          "Garden-to-table exploration",
          "Storytelling & handcrafts",
          "Open to homeschoolers",
          "Seasonal gatherings",
        ],
        image: "/images/stock/Homeschool3.jpg",
        accent: "text-[#6E7D44]",
        accentBg: "bg-[#F7F1E5]",
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
      "From the outdoor setting to the care for children's emotions",
      "and the nourishing food, this community felt aligned with what our family was seeking.",
    ],
    attribution: "— Lauren Y., parent testimonial",
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
    eyebrow: "A typical gathering",
    heading: "A day that begins",
    headingSub: "with presence.",
    steps: [
      {
        time: "Arrival",
        activity: "Welcome and settle in",
        desc: "Families arrive at the meetup location — a park, garden, or The Homeschool Village — and children begin to explore and connect.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "Morning",
        activity: "Child-led play and exploration",
        desc: "Children follow their curiosity through play, nature exploration, and hands-on materials while parents connect with one another.",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        time: "Midday",
        activity: "Mindful moments and making",
        desc: "Age-appropriate mindfulness, storytelling, art, music, or garden-to-table activities may unfold naturally.",
        image: "/images/stock/Homeschool3.jpg",
      },
      {
        time: "Closing",
        activity: "Gather and reflect",
        desc: "The community gathers to share discoveries, practice gratitude, and care for the place we've been together.",
        image: "/images/stock/ImageFour.jpg",
      },
    ],
  },
  socialProof: {
    type: "testimonials",
    eyebrow: "What families feel here",
    heading: "Voices from our community",
    subtitle:
      "Families who have found belonging, connection, and values-aligned community.",
    items: [
      {
        quote:
          "From the outdoor setting to the care for children's emotions and the nourishing food, this community felt aligned with what our family was seeking.",
        name: "Lauren Y.",
        detail: "Tampa Bay · Parent testimonial",
        stars: 5,
        avatar: "/images/stock/ImageTen.jpg",
      },
    ],
  },
  founder: {
    eyebrow: "Meet the founder",
    heading: "Guided by someone who",
    headingAccent: "knows children.",
    paragraphs: [
      "Charlene Favorite, Iyawo Esu, is the founder and lead teacher of The Homeschool Village and Little Sprigs of Tampa. She describes herself as an environmental educator, certified family herbalist, homesteader, birth worker, indigenous postpartum worker, and activist.",
      "Her background includes K–12, Waldorf, early-childhood, and forest-school teaching credentials, as well as a master's degree in education.",
    ],
    credentials: [
      "Environmental educator",
      "Certified family herbalist",
      "K–12, Waldorf, early-childhood, forest-school credentials",
      "Master's degree in education",
    ],
    quote:
      "We educate the whole child, from the heart to intellect — fostering a community that honors and celebrates the spirit of childhood.",
    quoteAttribution: "— Charlene Favorite, Iyawo Esu",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Founder", value: "THV" },
    name: "Charlene Favorite, Iyawo Esu",
    title: "Founder & Lead Teacher, The Homeschool Village",
  },
  parallax: {
    eyebrow: "Rooted in The Homeschool Village",
    heading: ["Culture, connection,", "and whole-child learning."],
    subtitle:
      "Little Sprigs is part of a wider educational community devoted to culture, connection, nature, and whole-child learning. The Homeschool Village brings together hands-on experiences, family community, and rigorous learning in an African-centered microschool setting.",
    primaryCta: "Learn About The Homeschool Village",
    secondaryCta: "Connect with Us",
    backgroundImage: "/images/stock/Homeschool.jpg",
  },
  pillars: {
    eyebrow: "Our values",
    heading: "Mind, body, spirit, and community.",
    subtitle:
      "A sacred community built on love, respect, honor, dignity, friendship, and growth.",
    items: [
      {
        icon: "heart",
        title: "Whole-child focus",
        desc: "Protecting childhood while nurturing mind, body, spirit, and community connection.",
      },
      {
        icon: "leaf",
        title: "Nature-based learning",
        desc: "Hands-on, nature-based experiences in gardens, woods, and outdoor settings.",
      },
      {
        icon: "users",
        title: "Family community",
        desc: "An active meetup group where children and parents find belonging and support.",
      },
      {
        icon: "sprout",
        title: "Cultural grounding",
        desc: "Culture, community, and rigorous academics come together to cultivate confident, curious learners.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Looking for a values-aligned community? Share a little about your family and what you'd like to learn about.",
    sidebarImage: "/images/stock/Homeschool2.jpg",
    eyebrow: "Connect with Little Sprigs",
    heading: "Tell us about your family.",
    description:
      "Share your name, contact information, and what you'd like to learn about. We'll follow up to help you connect with our community.",
    submitLabel: "Connect with Little Sprigs",
    disclaimer:
      "Little Sprigs of Tampa · A community of The Homeschool Village · Tampa Bay area.",
    trustNote:
      "Please do not include medical records or highly sensitive personal information in this form.",
    successEmoji: "✓",
    successTitle: "Message received!",
    successMessage:
      "Thank you for reaching out. We'll be in touch soon to help you connect with Little Sprigs and our community.",
    programOptions: [
      { value: "little-sprigs", label: "Little Sprigs Meetups" },
      { value: "microschool", label: "Homeschool Village Microschool" },
      { value: "tutoring", label: "Private Tutoring" },
      { value: "kitchen-garden", label: "Kitchen & Garden Events" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Child's Name (optional)",
      gradePlaceholder: "Select child age range (optional)...",
      gradeOptions: [
        { value: "infant", label: "Infant (0–2 years)" },
        { value: "toddler", label: "Toddler (2–4 years)" },
        { value: "preschool", label: "Preschool (4–5 years)" },
        { value: "k-2", label: "Kindergarten – 2nd grade" },
        { value: "3-5", label: "Grades 3–5" },
        { value: "6+", label: "Grade 6 and up" },
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions families ask",
    subtitle:
      "New to Little Sprigs? Here are the most common things families want to know before connecting with our community.",
    items: [
      {
        q: "What is Little Sprigs vs The Homeschool Village?",
        a: "Little Sprigs of Tampa is a play-based, child-led meetup community for children and parents. The Homeschool Village is the broader organization — Florida's first African-centered microschool — offering additional programs including a nature-based microschool, private tutoring, and Kitchen & Garden events.",
      },
      {
        q: "How often do Little Sprigs meetups happen?",
        a: "Little Sprigs meets twice each month at The Homeschool Village and at various park locations around the Tampa Bay area. Visit the Little Sprigs of Tampa Facebook page for the latest meetup details.",
      },
      {
        q: "What ages is Little Sprigs for?",
        a: "Little Sprigs is a family meetup community — children of various ages and their parents are welcome. The Homeschool Village microschool programs serve ages 5–11.",
      },
      {
        q: "Where are meetups held?",
        a: "Meetups occur at The Homeschool Village and at various park locations in the Tampa Bay / Temple Terrace area. Check the Little Sprigs of Tampa Facebook page for current locations.",
      },
      {
        q: "How do I find out about upcoming meetups?",
        a: "Visit the Little Sprigs of Tampa Facebook page for the latest meetup details, or submit the contact form and we'll help you get connected.",
      },
      {
        q: "How can I reach you?",
        a: "Call 813-563-6098, email thehomeschoolvillageinc@gmail.com, or use the contact form on this page. Weekday hours are 8:45 AM–2:45 PM.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Come grow with us",
    heading: "Come grow",
    headingAccent: "with us.",
    description:
      "Looking for a values-aligned community for your child and your family? Connect with Little Sprigs of Tampa to learn about upcoming gatherings. Call 813-563-6098 or email thehomeschoolvillageinc@gmail.com.",
    primaryCta: "Connect with Little Sprigs",
    secondaryCta: "Explore Meetups",
  },
  footer: {
    tagline:
      "Little Sprigs of Tampa · A community of The Homeschool Village · Tampa Bay area",
    links: ["About", "Meetups", "Our Values", "Contact", "FAQ"],
    copyright: "© 2026 Little Sprigs of Tampa",
    poweredBy: "Website concept by MudKitchen",
  },
};
