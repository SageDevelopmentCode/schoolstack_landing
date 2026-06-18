import type { SchoolWebsiteDemoConfig } from "./types";
import { SPRING_RIVER_SCHOOL_ADMIN_LOGO } from "./springriverschool-admin-demo";

export const springRiverSchoolConfig: SchoolWebsiteDemoConfig = {
  slug: "spring-river-school",
  schoolName: "Spring River School",
  theme: {
    primary: "#5F7360",
    primaryHover: "#4A5C4D",
    dark: "#2F3D34",
    darkHover: "#4A7C6F",
    lightBg: "#F4F0E8",
    lightBorder: "#E5DFD3",
    muted: "#6B6560",
    badgeBg: "#F4F0E8",
    accentText: "#EA492E",
    pageBg: "#FAF8F4",
  },
  logo: SPRING_RIVER_SCHOOL_ADMIN_LOGO,
  hero: {
    eyebrow: "2026–27 Enrollment · Atlantic Beach, FL · K–12",
    eyebrowPlacement: "announcementBar",
    headline: ["A Waldorf-inspired", "homeschool community."],
    subheadline:
      "Spring River offers flexible, Waldorf-inspired homeschool enrichment programs serving families from parent–child through Grade 12 — partnering with you to support the intellectual, emotional, and practical development of your children through nature-based learning and strong community life.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Explore Programs",
    secondaryCtaTarget: "signature",
    navCta: "Apply 2026–27",
    navLinks: ["Programs", "Our Approach", "Admissions", "FAQ"],
    backgroundImage: "/images/stock/ImageTwo.jpg",
    floatingImages: ["/images/stock/ImageSeven.jpg", "/images/stock/ImageSix.jpg"],
    imageAlt: "Children learning outdoors in a nature-based Waldorf setting",
    trustBadges: ["Step Up Partner", "Nonprofit", "K–12", "Screen-Free K–8"],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "Philosophy of Learning",
    heading: "Head, heart, and hands.",
    subtitle:
      "At the heart of Spring River's work is a living understanding of child and adolescent development — strengthening thinking, feeling, and willing through developmentally grounded, screen-free learning.",
    modes: [
      {
        label: "Head",
        title: "Thinking",
        desc: "Story-rich main lessons, artistic integration of literacy and math, and age-appropriate academic progression that fosters curiosity and independence.",
        icon: "bookOpen",
      },
      {
        label: "Heart",
        title: "Feeling",
        desc: "Movement, music, rhythm, and social connection woven into daily life — nurturing empathy, reverence, and a living relationship with community.",
        icon: "heart",
      },
      {
        label: "Hands",
        title: "Willing",
        desc: "Meaningful work outdoors — practical arts, bushcraft, land stewardship, and hands-on exploration that build confidence and purpose.",
        icon: "treePine",
      },
      {
        label: "Nature",
        title: "Wonder & Belonging",
        desc: "Time outdoors restores balance, strengthens the senses, and awakens each child's natural capacity for wonder in the living landscape.",
        icon: "leaf",
      },
    ],
    flexFriday: {
      title: "Forest School Rhythm",
      desc: "Morning circle, nature hikes, journaling, artistic outdoor activities, and nature-infused storytime — immersive place-based learning in Jacksonville's parks and preserves.",
    },
  },
  stats: [
    { value: "K–12", label: "Program Pathways" },
    { value: "Since 2014", label: "Nonprofit Community" },
    { value: "180+", label: "Students Served" },
    { value: "Step Up", label: "Scholarship Partner" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Is Spring River Right for Your Family?",
    heading: "For homeschooling families seeking rhythm, nature, and community.",
    cards: [
      {
        title: "Parents as primary educators",
        desc: "Draw inspiration, structure, and community from Spring River while remaining at the center of your child's education.",
      },
      {
        title: "Screen-free childhood",
        desc: "K–8 programs protect imagination, attention, and real-world learning — prioritizing connection over devices.",
      },
      {
        title: "Outdoor & experiential learning",
        desc: "Daily field experiences at parks and nature preserves — the only all-outdoor K–8 program in Northeast Florida.",
      },
      {
        title: "Flexible full- and part-time options",
        desc: "Enter at many points along the journey with clearly defined pathways from parent–child through high school.",
      },
    ],
    mainImage: "/images/stock/ImageSeven.jpg",
    secondaryImage: "/images/stock/ImageEight.jpg",
  },
  marquee: [
    "Waldorf-Inspired",
    "Homeschool Community",
    "Nature-Based",
    "Screen-Free K–8",
    "Forest School",
    "Atlantic Beach",
    "Step Up Partner",
    "Outdoor Learning",
    "Whole Child",
    "Mixed-Age Classes",
    "Nonprofit",
    "Head Heart Hands",
  ],
  programs: {
    eyebrow: "Programs at a Glance",
    heading: "Pathways that fit your homeschool journey",
    subtitle: "Click each option to explore what enrollment looks like for your family.",
    ctaLabel: "Learn More",
    items: [
      {
        badge: "K–8",
        title: "4-Day All-Outdoor Academic Program",
        teaser: "Mon–Thu · Waldorf-trained teachers · Max 18 students",
        desc: "The all-outdoor K–8 grades program engages students in daily field experiences at nearby parks and nature preserves. Led by Waldorf-trained teachers with a supporting assistant — cultivating a strong relationship with nature, self, and community.",
        details: ["Grades K–8", "Mon–Thu", "All-Outdoor", "Max 18/class"],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#2F3D34]",
        accentBg: "bg-[#F4F0E8]",
      },
      {
        badge: "Grades 1–5",
        title: "2-Day Homeschool Enrichment",
        teaser: "Mon & Tue · 9am–2pm · Outdoor classrooms",
        desc: "Mixed-age classes with a developmentally appropriate main lesson in the morning and enrichment offerings in the afternoons. Classes meet in outdoor classrooms in West Atlantic Beach, with inclement weather space nearby.",
        details: ["Grades 1–5", "Mon & Tue", "9am – 2pm", "Outdoor Classrooms"],
        image: "/images/stock/ImageSix.jpg",
        accent: "text-[#5F7360]",
        accentBg: "bg-[#F4F0E8]",
      },
      {
        badge: "K–8",
        title: "Forest School Nature Immersion",
        teaser: "Wed · Thu · Fri · Bushcraft for middle school",
        desc: "Nature immersion classes split by age group — K–2, 3–5, and middle school with bushcraft and primitive skills. Students build lasting relationships with the land through hands-on exploration in Timucuan Preserve, Dutton Island, and Hanna Park.",
        details: ["Grades K–8", "Wed–Fri", "9am – 2pm", "From $2,200/yr"],
        image: "/images/stock/ImageFive.jpg",
        accent: "text-[#EA492E]",
        accentBg: "bg-[#F4F0E8]",
      },
      {
        badge: "Grades 9–12",
        title: "High School Program",
        teaser: "51 Pine Street · Atlantic Beach · 5 blocks from the ocean",
        desc: "A rich outdoor ecological and land stewardship component with full- and part-time offerings. Families curate their high school experience with morning academic tracks or afternoon electives that complement other homeschooling approaches.",
        details: ["Grades 9–12", "Atlantic Beach", "Full & Part-Time", "Ecological Focus"],
        image: "/images/stock/ImageTen.jpg",
        accent: "text-[#4A7C6F]",
        accentBg: "bg-[#F4F0E8]",
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
      "A healthy social life is found only when, in the mirror of each soul,",
      "the whole community finds its reflection.",
    ],
    attribution: "— Rudolf Steiner",
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
    eyebrow: "Forest School Rhythm",
    heading: "A day shaped by nature,",
    headingSub: "rhythm, and reverence.",
    steps: [
      {
        time: "Morning",
        activity: "Morning Circle",
        desc: "Students gather to begin the day with song, movement, and intention — building community before heading into the forest.",
        image: "/images/stock/ImageEleven.jpg",
      },
      {
        time: "Exploration",
        activity: "Nature Hike & Discovery",
        desc: "Hands-on exploration engaging all five senses — observing, collecting, and categorizing natural objects in local landscapes.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "Midday",
        activity: "Nature Journaling",
        desc: "Quiet observation and study-based reflections — fostering focus, creativity, and a deeper relationship with the natural world.",
        image: "/images/stock/ImageSeven.jpg",
      },
      {
        time: "Afternoon",
        activity: "Artistic Outdoor Activity",
        desc: "Skill-based outdoor work, bushcraft for middle schoolers, and artistic expression rooted in place-based learning.",
        image: "/images/stock/ImageSix.jpg",
      },
      {
        time: "Closing",
        activity: "Nature-Infused Storytime",
        desc: "Stories that weave the day's discoveries together — ending with reverence for the land and one another.",
        image: "/images/stock/ImageFour.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Trust & Community",
    heading: "A partner in your homeschool journey.",
    subtitle:
      "Spring River is a thriving nonprofit homeschool community — offering structure without limitation and community without constraint since 2014.",
    items: [
      {
        title: "Step Up for Students Partner",
        desc: "Participates in state-supported scholarship programs with Direct Pay options across all programs for accessibility and flexibility.",
        icon: "shield",
      },
      {
        title: "Only All-Outdoor K–8 in NE Florida",
        desc: "A pioneering nature-based academic program with Waldorf-trained teachers and class sizes of no more than 18 students.",
        icon: "treePine",
      },
      {
        title: "Nonprofit Since 2014",
        desc: "Serving over 180 students across Northeast Florida with programs grounded in whole-child development and community life.",
        icon: "award",
      },
    ],
  },
  founder: {
    eyebrow: "Our Community",
    heading: "More than a school —",
    headingAccent: "a gathering place.",
    paragraphs: [
      "Spring River serves the growing homeschool community of Northeast Florida with programs grounded in a whole-child understanding of human development. Inspired by Waldorf education, our approach integrates thoughtful learning with artistic expression, movement, nature connection, and meaningful work.",
      "Families participate in seasonal festivals, camps, field trips, parent education workshops, and community dinners — cultivating connection, reverence for the developing human being, and meaningful participation in community life.",
    ],
    credentials: [
      "Nonprofit Since 2014",
      "Atlantic Beach, Florida",
      "Waldorf-Inspired Pedagogy",
      "180+ Students Served",
    ],
    quote:
      "We are a partner in your homeschool journey — offering structure without limitation and community without constraint.",
    quoteAttribution: "— Spring River School",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Founded", value: "2014" },
    name: "Spring River Community",
    title: "Homeschool Enrichment & Outdoor Learning",
  },
  parallax: {
    eyebrow: "Why Spring River",
    heading: ["Nature-forward.", "Rhythm-driven.", "Known."],
    subtitle:
      "Outdoor classrooms, forest immersion, and Waldorf-inspired pedagogy — meeting students where they are developmentally and supporting who they are becoming.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Submit an Inquiry",
    backgroundImage: "/images/stock/ImageNine.jpg",
  },
  pillars: {
    eyebrow: "What Makes Spring River Different",
    heading: "Four pillars. One whole child.",
    subtitle:
      "Nature immersion, developmentally appropriate learning, screen-free childhood, and a living community — woven into every program.",
    items: [
      {
        icon: "treePine",
        title: "Nature Immersion",
        desc: "Daily outdoor learning at parks, preserves, and beaches — restoring balance and awakening wonder in the living landscape.",
      },
      {
        icon: "bookOpen",
        title: "Developmentally Appropriate",
        desc: "Curriculum designed to strengthen thinking, feeling, and willing at each stage — from early childhood through high school.",
      },
      {
        icon: "leaf",
        title: "Screen-Free Childhood",
        desc: "K–8 programs protect imagination, attention, and social connection by prioritizing real-world, hands-on learning.",
      },
      {
        icon: "users",
        title: "Living Community",
        desc: "Festivals, field trips, parent education, and volunteer opportunities — a gathering place for learning across the lifespan.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Ready to find out if Spring River is the right fit for your family?",
    sidebarImage: "/images/stock/ImageSeven.jpg",
    eyebrow: "Enrollment Open · 2026–27",
    heading: "Schedule a tour or inquire.",
    description:
      "Tell us about your family and which programs interest you. We'll reach out to schedule a tour of our classrooms and help you experience our unique educational community. Email enrollment@springriverschool.org or call (904) 866-1222.",
    submitLabel: "Submit Inquiry",
    disclaimer:
      "We'll respond promptly. For immediate questions, contact enrollment@springriverschool.org.",
    successEmoji: "✓",
    successTitle: "Inquiry received!",
    successMessage:
      "Thank you for reaching out. We'll be in touch soon to schedule a tour and discuss next steps for the 2026–27 school year.",
    programOptions: [
      { value: "four-day-outdoor", label: "4-Day All-Outdoor Program (K-8)" },
      { value: "two-day-enrichment", label: "2-Day Homeschool Enrichment (1-5)" },
      { value: "forest-school", label: "Forest School Nature Immersion (K-8)" },
      { value: "high-school", label: "High School Program (9-12)" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Student's Name",
      gradePlaceholder: "Select grade level...",
      gradeOptions: [
        { value: "pk", label: "Parent & Child / Early Childhood" },
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
    heading: "Questions families ask",
    subtitle:
      "New to Waldorf-inspired homeschool enrichment? Here are the most common things parents want to know before scheduling a tour.",
    items: [
      {
        q: "Is Spring River a homeschool or a school?",
        a: "Spring River is a homeschool enrichment program — parents remain the primary educators while drawing inspiration, structure, and community from our programs. We offer full-time and part-time options across K–12.",
      },
      {
        q: "What programs does Spring River offer?",
        a: "We offer a 4-Day All-Outdoor Academic Program (K–8), 2-Day Homeschool Enrichment (Grades 1–5), Forest School Nature Immersion (K–8), and a High School Program (9–12) — plus parent–child classes and early childhood offerings.",
      },
      {
        q: "Are K–8 programs really screen-free?",
        a: "Yes. All Spring River programs serving Kindergarten through Grade 8 are intentionally screen-free — protecting childhood development by prioritizing imagination, attention, social connection, and real-world, hands-on learning.",
      },
      {
        q: "What happens on inclement weather days?",
        a: "Students in the 4-Day program transition to a prepared indoor learning space at a partner church in Jacksonville Beach. The 2-Day program has nearby indoor space available as needed.",
      },
      {
        q: "Does Spring River accept Step Up for Students scholarships?",
        a: "Yes. Spring River participates in state-supported programs including the Step Up for Students Scholarship and offers Direct Pay options across all programs to support accessibility and flexibility for families.",
      },
      {
        q: "Where are classes held?",
        a: "Programs meet across Atlantic Beach and Jacksonville — outdoor classrooms in West Atlantic Beach, parks and preserves for Forest School, and our high school and administrative home at 51 Pine Street in Atlantic Beach.",
      },
      {
        q: "What is Forest School readiness?",
        a: "Forest School students must be mature enough to carry their own belongings and able to stay with the group and follow teacher instructions. Classes run 9am–2pm with a 1:7 teacher-to-student ratio.",
      },
      {
        q: "What is the admissions process?",
        a: "Contact our Admissions team at enrollment@springriverschool.org, schedule a tour of our classrooms, complete an application, and attend an open house or trial visit before enrollment.",
      },
    ],
  },
  closingCta: {
    eyebrow: "2026–27 Enrollment Underway",
    heading: "Ready to find out if Spring River",
    headingAccent: "is the right fit?",
    description:
      "Schedule a tour to experience our unique educational community — from outdoor classrooms and forest immersion to our Waldorf-inspired approach to whole-child development.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Submit an Inquiry",
  },
  footer: {
    tagline: "A Waldorf-inspired homeschool community in Atlantic Beach, Florida.",
    links: ["Programs", "Our Approach", "Admissions", "FAQ", "Contact"],
    copyright: "© 2026 Spring River School",
    poweredBy: "Website concept by MudKitchen",
  },
};
