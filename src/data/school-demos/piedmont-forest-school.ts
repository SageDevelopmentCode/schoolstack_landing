import type { SchoolWebsiteDemoConfig } from "./types";
import { PIEDMONT_FOREST_SCHOOL_LOGO } from "./piedmont-forest-school-admin-demo";

export const piedmontForestSchoolConfig: SchoolWebsiteDemoConfig = {
  slug: "piedmont-forest-school",
  schoolName: "Piedmont Forest School",
  theme: {
    primary: "#355B3A",
    primaryHover: "#1F3D2A",
    dark: "#1F3D2A",
    darkHover: "#152A1E",
    lightBg: "#F7F3E8",
    lightBorder: "#E9DFC9",
    muted: "#607064",
    badgeBg: "rgba(53, 91, 58, 0.12)",
    accentText: "#B55D3B",
    pageBg: "#F7F3E8",
  },
  logo: PIEDMONT_FOREST_SCHOOL_LOGO,
  hero: {
    eyebrow:
      "Now enrolling for 2026–2027 • New home at Little Creek Park • Explore our programs",
    eyebrowPlacement: "announcementBar",
    headline: ["Where childhood", "grows wild."],
    subheadline:
      "Piedmont Forest School is an inclusive, year-round learning community where children learn through creative play, meaningful relationships, and long days outside.",
    primaryCta: "Start Your Enrollment Inquiry",
    secondaryCta: "Explore Programs",
    secondaryCtaTarget: "programs",
    navCta: "Start an Inquiry",
    navLinks: [
      "Programs",
      "Our Approach",
      "The Learning Center",
      "About PFS",
      "FAQ",
    ],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/Homeschool3.jpg"],
    imageAlt: "Children exploring and learning outdoors in nature",
    trustBadges: [
      "Ages 9 months–14 years",
      "Small groups",
      "Rain or shine",
      "Winston-Salem, NC",
    ],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "farmExperience",
    eyebrow: "Find your child's place outdoors",
    heading: "Four pathways into forest school",
    subtitle:
      "From first nature walks with a caregiver to big-kid projects and seasonal skills — each program meets children where they are.",
    paths: [
      {
        title: "Little Ones",
        desc: "9 months–3 years · Nature Playgroup. A gentle weekly introduction to outdoor learning with caregiver nearby — Fridays, 9:30–11:30 am.",
        icon: "sprout",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        title: "Early Learners",
        desc: "3–6 years · Forest Kindergarten / Nature Preschool. Child-led, four-hour outdoor learning supported by Learning Partners — Monday through Friday.",
        icon: "treePine",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        title: "School-Age Explorers",
        desc: "6–12 years · Nature Explorers and the Agile Learning Center. Self-directed nature study, projects, stewardship, and peer collaboration.",
        icon: "compass",
        image: "/images/stock/ImageFour.jpg",
      },
      {
        title: "Skills & Seasons",
        desc: "7–14 years · Bushcraft, Nature Journaling, Forest Friends, and Summer Camps. Seasonal courses that build confidence and connection outdoors.",
        icon: "sparkles",
        image: "/images/stock/Homeschool3.jpg",
      },
    ],
  },
  stats: [
    { value: "9 mo–14 yr", label: "Ages served" },
    { value: "5:1", label: "Student-to-teacher ratio" },
    { value: "Year-round", label: "Rain or shine" },
    { value: "Winston-Salem", label: "North Carolina" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Why PFS",
    heading: "The forest is not recess. It's the classroom.",
    cards: [
      {
        title: "Child-led by design",
        desc: "Interests and questions lead; Learning Partners extend thinking through relationships, observation, and meaningful conversation.",
      },
      {
        title: "Inclusive community",
        desc: "Children of all abilities and backgrounds learn together — with support for sensory and developmental needs.",
      },
      {
        title: "Small groups, deep relationships",
        desc: "PFS reports a 5:1 student-to-teacher ratio, keeping class sizes small and connections strong.",
      },
      {
        title: "Learning that lives in the body",
        desc: "Movement, risk assessment, imagination, cooperation, and real-world problem solving happen naturally outside.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/ImageFour.jpg",
  },
  marquee: [
    "Child-Led Play",
    "Learning Partners",
    "Rain or Shine",
    "Little Creek Park",
    "Forest Kindergarten",
    "Nature Explorers",
    "Agile Learning Center",
    "Year-Round",
    "Winston-Salem",
    "Inclusive Community",
    "Nature-Based",
    "Start an Inquiry",
  ],
  programs: {
    eyebrow: "Programs for every stage",
    heading: "Programs for every stage of growing up",
    subtitle:
      "Click each program to explore ages, schedules, and what enrollment looks like. Current program details subject to confirmation.",
    ctaLabel: "Start Your Enrollment Inquiry",
    items: [
      {
        badge: "3–6 years",
        title: "Forest Kindergarten",
        teaser: "Nature Preschool · Child-led outdoor learning",
        desc: "Child-led, four-hour outdoor learning supported by Learning Partners. Children follow their questions through play, exploration, and stewardship.",
        details: [
          "Ages 3–6",
          "Mon–Fri, 9:30 am–1:30 pm",
          "Drop-off program",
          "Pricing varies by days",
        ],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#355B3A]",
        accentBg: "bg-[#F7F3E8]",
      },
      {
        badge: "6–12 years",
        title: "Nature Explorers",
        teaser: "Self-directed nature study & projects",
        desc: "Self-directed nature study, projects, stewardship, and peer collaboration for school-age learners who thrive with autonomy and time outside.",
        details: [
          "Ages 6–12",
          "Mon–Thu, 9:30 am–1:30 pm",
          "Drop-off program",
          "Pricing varies by days",
        ],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#6F8B58]",
        accentBg: "bg-[#F7F3E8]",
      },
      {
        badge: "5–12 years",
        title: "Agile Learning Center",
        teaser: "New full-day program · Fall 2026",
        desc: "Beginning in the 2026–2027 school year, a full-day private-school program at Little Creek Park — 9:30 am to 3:30 pm for ages 5–12.",
        details: [
          "Ages 5–12",
          "Full day 9:30 am–3:30 pm",
          "Little Creek Park",
          "Enrollment details TBD",
        ],
        image: "/images/stock/ImageFour.jpg",
        accent: "text-[#B55D3B]",
        accentBg: "bg-[#F7F3E8]",
      },
      {
        badge: "Seasonal",
        title: "Summer Camps",
        teaser: "Playful outdoor weeks · Ages 3–13",
        desc: "Playful, outdoor summer weeks at Little Creek Park and Salem Lake Park — dates, locations, and rates vary by age group and week.",
        details: [
          "Ages 3–6 and 5–13",
          "Summer weeks",
          "Outdoor play",
          "Details vary by week",
        ],
        image: "/images/stock/Homeschool3.jpg",
        accent: "text-[#6F8B58]",
        accentBg: "bg-[#F7F3E8]",
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
      "Children of all abilities and backgrounds learn together",
      "through creative, child-led play in nature.",
    ],
    attribution: "— Piedmont Forest School",
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
    eyebrow: "A day in the woods",
    heading: "A day that begins",
    headingSub: "with wonder.",
    steps: [
      {
        time: "Morning",
        activity: "Arrive and settle into basecamp",
        desc: "Children arrive at the outdoor basecamp, settle in, and connect with Learning Partners and peers — rain or shine.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "Midday",
        activity: "Follow questions into play",
        desc: "Interests lead the way — creek exploration, loose-parts play, nature finds, and imaginative adventures unfold naturally.",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        time: "Afternoon",
        activity: "Build, create, observe, imagine",
        desc: "Nature journaling, tool use under supervision, shelter building, storytelling, and peer collaboration fill the day.",
        image: "/images/stock/Homeschool3.jpg",
      },
      {
        time: "Closing",
        activity: "Gather, reflect, and care for the place",
        desc: "The community gathers to reflect, share discoveries, and practice environmental stewardship together.",
        image: "/images/stock/ImageFour.jpg",
      },
    ],
  },
  socialProof: {
    type: "testimonials",
    eyebrow: "Families see the difference",
    heading: "What parents are experiencing",
    subtitle:
      "Placeholder quotes for demo layout — replace with approved testimonials before launch.",
    items: [
      {
        quote:
          "Our child comes home confident, muddy, and full of stories. PFS has given them a place to belong outdoors.",
        name: "Parent testimonial placeholder",
        detail: "Winston-Salem · Forest Kindergarten",
        stars: 5,
        avatar: "/images/stock/ImageTen.jpg",
      },
      {
        quote:
          "The Learning Partners truly know our child. The child-led approach has helped them build confidence and curiosity we hadn't seen before.",
        name: "Parent testimonial placeholder",
        detail: "Forsyth County · Nature Explorers",
        stars: 5,
        avatar: "/images/stock/ImageSeven.jpg",
      },
      {
        quote:
          "Rain or shine, our kids are outside learning with their whole selves. The inclusive community has been exactly what our family needed.",
        name: "Parent testimonial placeholder",
        detail: "Winston-Salem · Year-round programs",
        stars: 5,
        avatar: "/images/stock/ImageEight.jpg",
      },
    ],
  },
  founder: {
    eyebrow: "Meet the people",
    heading: "Guided by people who",
    headingAccent: "know children.",
    paragraphs: [
      "Piedmont Forest School was founded in 2020 by Sheri Grace, PhD — bringing more than 30 years of experience in early-childhood special education to an inclusive forest school community.",
      "Experienced Learning Partners mentor, model, and coach through relationships and communication — with collaborative support from speech-language, occupational therapy, and childhood-education expertise.",
    ],
    credentials: [
      "PhD in early childhood education",
      "30+ years in early-childhood special education",
      "Founded PFS in 2020",
      "Research: literacy, movement, self-directed play",
    ],
    quote:
      "Children of all abilities and backgrounds deserve authentic forest school education — where they develop a love of and commitment to caring for the natural world.",
    quoteAttribution: "— Sheri Grace, PhD",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Founded", value: "2020" },
    name: "Sheri Grace, PhD",
    title: "Founder & Director, Piedmont Forest School",
  },
  parallax: {
    eyebrow: "A new chapter",
    heading: ["Returning to", "Little Creek Park."],
    subtitle:
      "Beginning in the 2026–2027 school year, PFS is returning to Little Creek Park and expanding with a full-day Agile Learning Center for children ages 5–12.",
    primaryCta: "Discover the Learning Center",
    secondaryCta: "Start an Inquiry",
    backgroundImage: "/images/stock/Homeschool.jpg",
  },
  pillars: {
    eyebrow: "Our mission",
    heading: "Whole-child learning in nature.",
    subtitle:
      "Authentic forest school and nature-based education that fosters development of the whole child while engendering a love of the natural world.",
    items: [
      {
        icon: "leaf",
        title: "Creative, child-led play",
        desc: "Learning unfolds through play, curiosity, and the questions children bring to the woods.",
      },
      {
        icon: "heart",
        title: "Inclusive by design",
        desc: "Children of all abilities and backgrounds learn together in a warm, therapeutic community.",
      },
      {
        icon: "users",
        title: "Learning Partners",
        desc: "Guides who mentor, model, and coach through relationships — not lectures.",
      },
      {
        icon: "treePine",
        title: "Stewardship & connection",
        desc: "Nature play, informal study, and environmental care woven into every day outside.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Getting started is simple. Share your child's age and program interest — we'll follow up within 72 business hours.",
    sidebarImage: "/images/stock/Homeschool2.jpg",
    eyebrow: "Start Your Enrollment Inquiry",
    heading: "Tell us about your child.",
    description:
      "Share your child's age, program interest, and preferred tour timing. The PFS enrollment and billing coordinator aims to follow up within 72 business hours.",
    submitLabel: "Start Your Enrollment Inquiry",
    disclaimer:
      "Piedmont Forest School · Winston-Salem, North Carolina · ESA+ vendor.",
    trustNote:
      "Please do not include medical records or highly sensitive personal information in this form.",
    successEmoji: "✓",
    successTitle: "Inquiry received!",
    successMessage:
      "Thank you for your interest in Piedmont Forest School. We'll be in touch within 72 business hours to discuss next steps and schedule a site visit.",
    programOptions: [
      { value: "playgroup", label: "Nature Playgroup (9 mo–3 yr)" },
      { value: "forest-kindergarten", label: "Forest Kindergarten / Nature Preschool" },
      { value: "nature-explorers", label: "Nature Explorers (6–12 yr)" },
      { value: "alc", label: "Agile Learning Center (5–12 yr)" },
      { value: "summer-camp", label: "Summer Camps" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Child's Name",
      gradePlaceholder: "Select child's age...",
      gradeOptions: [
        { value: "infant", label: "Infant (9–18 months)" },
        { value: "toddler", label: "Toddler (18 mo–3 yr)" },
        { value: "preschool", label: "Preschool (3–5 yr)" },
        { value: "k", label: "Kindergarten" },
        { value: "1-3", label: "Grades 1–3" },
        { value: "4-6", label: "Grades 4–6" },
        { value: "7-8", label: "Grades 7–8" },
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions families ask",
    subtitle:
      "New to Piedmont Forest School? Here are the most common things families want to know before starting an enrollment inquiry.",
    items: [
      {
        q: "Is PFS outside in all weather?",
        a: "Yes. Programs operate year-round, rain or shine. Children should come prepared with appropriate all-weather clothing and gear for outdoor learning.",
      },
      {
        q: "What ages do you serve?",
        a: "PFS serves children from 9 months through 14 years across playgroup, preschool/kindergarten, homeschool, after-school, specialty, and summer programming.",
      },
      {
        q: "How does child-led learning work?",
        a: "Learning Partners follow children's interests and questions, extending thinking through relationships, observation, and meaningful conversation — rather than a fixed daily schedule.",
      },
      {
        q: "What should my child wear and bring?",
        a: "Dress for the weather — rain gear, layers, sturdy boots, and clothes that can get muddy. Specific packing lists vary by program and season.",
      },
      {
        q: "How do tours and enrollment work?",
        a: "Start with an enrollment inquiry, hear from the PFS team within 72 business hours, visit a site or basecamp, then confirm your child's program and complete enrollment paperwork.",
      },
      {
        q: "Are scholarships, payment plans, or ESA+ options available?",
        a: "PFS is an ESA+ vendor. Families with eligible children may apply for the NC Education Student Accounts scholarship. Contact us for current payment plan and scholarship details.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Come see what learning looks like outside",
    heading: "Come see what learning",
    headingAccent: "looks like outside.",
    description:
      "Start an inquiry and plan a visit to Piedmont Forest School. Now enrolling for the 2026–2027 school year at Little Creek Park.",
    primaryCta: "Start Your Enrollment Inquiry",
    secondaryCta: "Explore Programs",
  },
  footer: {
    tagline:
      "Child-led learning, rooted in nature · Winston-Salem, North Carolina",
    links: [
      "Programs",
      "Our Approach",
      "The Learning Center",
      "About PFS",
      "FAQ",
      "Contact",
    ],
    copyright: "© 2026 Piedmont Forest School",
    poweredBy: "Website concept by MudKitchen",
  },
};
