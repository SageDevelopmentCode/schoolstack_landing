import type { SchoolWebsiteDemoConfig } from "./types";
import { BVHA_LOGO } from "./brazos-valley-honor-academy-admin-demo";

export const brazosValleyHonorAcademyConfig: SchoolWebsiteDemoConfig = {
  slug: "brazos-valley-honor-academy",
  schoolName: "Brazos Valley Honor Academy",
  theme: {
    primary: "#123B5D",
    primaryHover: "#0B2740",
    dark: "#0B2740",
    darkHover: "#081C2D",
    lightBg: "#F7F2E8",
    lightBorder: "#DDD3C2",
    muted: "#55616B",
    badgeBg: "rgba(123, 30, 43, 0.12)",
    accentText: "#C9A24A",
    pageBg: "#F7F2E8",
  },
  logo: BVHA_LOGO,
  hero: {
    eyebrow:
      "Christian homeschool hybrid education in Navasota, Texas · K–7 · Tuesday–Thursday",
    eyebrowPlacement: "announcementBar",
    headline: ["A place to learn,", "grow, and be known."],
    headlineAccentLine: 1,
    subheadline:
      "Brazos Valley Honor Academy partners with families to provide a high-quality Christian education where learning is guided by each child's abilities.",
    primaryCta: "Schedule a Visit",
    secondaryCta: "Explore Our Program",
    secondaryCtaTarget: "programs",
    navCta: "Schedule a Visit",
    navLinks: [
      "About BVHA",
      "Our Program",
      "Tuition",
      "Enrollment",
      "Events",
      "FAQ",
    ],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/Homeschool3.jpg"],
    imageAlt: "Students learning in a Christian homeschool community",
    trustBadges: [
      "K–7th Grade",
      "Three Days Each Week",
      "Christian-Based Curriculum",
    ],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "How the week works",
    heading: "Three days on campus. Partnership at home.",
    subtitle:
      "BVHA combines the connection of a school community with the partnership of home education. Students receive core instruction three days a week while families remain active participants in their child's learning.",
    modes: [
      {
        label: "Partnership",
        title: "A true family partnership",
        desc: "A homeschool/private-school hybrid that works alongside parents—not in place of them.",
        icon: "users",
      },
      {
        label: "Ability",
        title: "Ability-focused learning",
        desc: "Students are not restricted by age alone; learning is shaped around their abilities.",
        icon: "compass",
      },
      {
        label: "Faith",
        title: "Christian-centered education",
        desc: "Bible and Christian-based curricula are part of the school experience.",
        icon: "bookOpen",
      },
      {
        label: "Rhythm",
        title: "A consistent weekly rhythm",
        desc: "Core classes meet Tuesday through Thursday, 8:30 AM–3:30 PM.",
        icon: "graduationCap",
      },
    ],
    flexFriday: {
      title: "Friday by appointment",
      desc: "Core classes meet Tuesday–Thursday. Friday is available by appointment for families who need additional support or meetings.",
    },
  },
  stats: [
    { value: "Navasota, TX", label: "Campus location" },
    { value: "K–7", label: "Grades served" },
    { value: "Tue–Thu", label: "Core class days" },
    { value: "$475/mo", label: "Core tuition" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Is BVHA right for your family?",
    heading: "Education that respects each child's potential.",
    cards: [
      {
        title: "A true family partnership",
        desc: "A homeschool/private-school hybrid that works alongside parents in their child's education.",
      },
      {
        title: "Ability-focused learning",
        desc: "Students are not restricted by age alone; learning is shaped around their abilities.",
      },
      {
        title: "Christian-centered education",
        desc: "Bible and Christian-based curricula are part of the school experience.",
      },
      {
        title: "A consistent weekly rhythm",
        desc: "Core classes meet Tuesday through Thursday, 8:30 AM–3:30 PM.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/ImageTwo.jpg",
  },
  marquee: [
    "Navasota, Texas",
    "Christian Education",
    "K–7th Grade",
    "Three Days Each Week",
    "Ability-Focused Learning",
    "Family Partnership",
    "Bible & Core Subjects",
    "Schedule a Visit",
    "Homeschool Hybrid",
    "Experienced Christian Teachers",
    "Spring Rodeo",
    "Christmas in the Country",
  ],
  programs: {
    eyebrow: "Our Program",
    heading: "A flexible school model built around your child.",
    subtitle:
      "BVHA combines the connection of a school community with the partnership of home education.",
    ctaLabel: "Schedule a Visit",
    items: [
      {
        badge: "Hybrid",
        title: "Homeschool / Private-School Hybrid",
        teaser: "Three days on campus, partnership at home",
        desc: "BVHA is a homeschool/private-school hybrid environment. We partner with parents in their child's education and use a flexible curriculum that focuses on students' abilities—not just their age.",
        details: [
          "Tue–Thu 8:30 AM–3:30 PM",
          "K–7th Grade",
          "Parent partnership",
          "Ability-focused",
        ],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#123B5D]",
        accentBg: "bg-[#F7F2E8]",
      },
      {
        badge: "Core Subjects",
        title: "Reading, Writing, Math & More",
        teaser: "Six core subjects plus Bible",
        desc: "Core instruction for Kindergarten through 7th grade includes Reading, Writing, Mathematics, Science, Social Studies, and Bible—taught by experienced Christian teachers.",
        details: [
          "Reading & Writing",
          "Mathematics",
          "Science & Social Studies",
          "Bible",
        ],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#7B1E2B]",
        accentBg: "bg-[#F7F2E8]",
      },
      {
        badge: "Tuition",
        title: "Clear Tuition for Core Classes",
        teaser: "$475/month · September–May",
        desc: "Core classes for K–7th grade are $475/month, plus a one-time $100 enrollment and assessment fee and a $350 curriculum, technology, and campus supply fee per student.",
        details: [
          "$475/month (Sept–May)",
          "$100 enrollment fee",
          "$350 supply fee (new students)",
          "10% sibling discount",
        ],
        image: "/images/stock/ImageFour.jpg",
        accent: "text-[#123B5D]",
        accentBg: "rgba(18, 59, 93, 0.08)",
      },
      {
        badge: "Community",
        title: "A School Community with Room to Connect",
        teaser: "Events that bring families together",
        desc: "BVHA's community has come together through events including the Spring Rodeo and Christmas in the Country.",
        details: [
          "Spring Rodeo",
          "Christmas in the Country",
          "Family events",
          "Community connection",
        ],
        image: "/images/stock/Homeschool3.jpg",
        accent: "text-[#7B1E2B]",
        accentBg: "bg-[#F7F2E8]",
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
      "Our goal is to provide a Christian-based,",
      "high quality education that nurtures, educates, and inspires children.",
    ],
    attribution: "— Brazos Valley Honor Academy Mission",
    backgroundImage: "/images/stock/ImageNine.jpg",
  },
  stripImages: [
    "/images/stock/ImageEleven.jpg",
    "/images/stock/ImageTwelve.jpg",
    "/images/stock/Homeschool.jpg",
    "/images/stock/Homeschool2.jpg",
    "/images/stock/ImageTwo.jpg",
    "/images/stock/Homeschool3.jpg",
  ],
  timeline: {
    eyebrow: "Weekly schedule",
    heading: "Core classes meet",
    headingSub: "Tuesday–Thursday · 8:30 AM – 3:30 PM · Navasota, Texas",
    steps: [
      {
        time: "Tuesday",
        activity: "Core Classes",
        desc: "Students receive instruction in Reading, Writing, Mathematics, Science, Social Studies, and Bible.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "Wednesday",
        activity: "Core Classes",
        desc: "Continued core instruction with experienced Christian teachers in a safe, nurturing environment.",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        time: "Thursday",
        activity: "Core Classes",
        desc: "The week's final on-campus day—ability-focused learning that respects each child's potential.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "Friday",
        activity: "By Appointment",
        desc: "Friday is available by appointment for families who need additional support or meetings.",
        image: "/images/stock/Homeschool3.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Trust & Identity",
    heading: "Christian. Hybrid. Known.",
    subtitle:
      "Brazos Valley Honor Academy combines faith, family partnership, and ability-focused learning for K–7 students in Navasota, Texas.",
    items: [
      {
        title: "Christian-Centered",
        desc: "Our mission is to provide a Christian-based, high-quality education that nurtures, educates, and inspires children.",
        icon: "shield",
      },
      {
        title: "Three-Day Hybrid",
        desc: "Core classes meet Tuesday through Thursday, 8:30 AM–3:30 PM—a structured rhythm with room for family partnership.",
        icon: "compass",
      },
      {
        title: "Family Partnership",
        desc: "We partner with parents in their child's education—not in place of them.",
        icon: "users",
      },
      {
        title: "Ability-Focused",
        desc: "Learning is guided by each child's abilities, not restricted by age alone.",
        icon: "bookOpen",
      },
    ],
  },
  founder: {
    eyebrow: "Our Mission",
    heading: "Nurture, educate,",
    headingAccent: "and inspire.",
    paragraphs: [
      "Our goal is to provide a Christian-based, high-quality education that nurtures, educates, and inspires children in a safe and secure environment.",
      "BVHA's flexible curriculum is designed to focus on student ability rather than placing unnecessary limits on learning because of age alone. Experienced Christian teachers partner with families to support each child's growth.",
    ],
    credentials: [
      "Christian homeschool hybrid",
      "Navasota, Texas",
      "K–7th grade",
      "Tue–Thu core classes",
    ],
    quote:
      "A Christian homeschool hybrid in Navasota where students are known, challenged at their ability level, and supported by experienced teachers.",
    quoteAttribution: "— BVHA",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "Navasota, TX" },
    name: "Brazos Valley Honor Academy",
    title: "Christian K–7 Hybrid",
  },
  parallax: {
    eyebrow: "Christian Hybrid Education",
    heading: ["Known.", "Challenged.", "Supported."],
    subtitle:
      "A Christian homeschool hybrid in Navasota where students are known, challenged at their ability level, and supported by experienced teachers—three days each week.",
    primaryCta: "Schedule a Visit",
    secondaryCta: "View Tuition Details",
    backgroundImage: "/images/stock/Homeschool2.jpg",
  },
  pillars: {
    eyebrow: "What We Offer",
    heading: "Built for Christian hybrid families.",
    subtitle:
      "Structure on campus, partnership at home, and a community that supports your family's calling.",
    items: [
      {
        icon: "bookOpen",
        title: "Core Academics",
        desc: "Reading, Writing, Mathematics, Science, Social Studies, and Bible taught by experienced Christian teachers.",
      },
      {
        icon: "users",
        title: "Family Partnership",
        desc: "A homeschool/private-school hybrid that works alongside parents in their child's education.",
      },
      {
        icon: "compass",
        title: "Ability-Focused Learning",
        desc: "Students are not restricted by age alone; learning is shaped around their abilities.",
      },
      {
        icon: "sparkles",
        title: "Christian Community",
        desc: "A safe, nurturing environment where children are known and inspired to grow.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "The best way to learn whether BVHA is right for your family is to visit, ask questions, and get to know the school community.",
    sidebarImage: "/images/stock/Homeschool3.jpg",
    eyebrow: "Come see BVHA in person",
    heading: "Request a visit.",
    description:
      "A visit is the best way to learn whether our school community is the right fit for your family. Reach out to request an appointment.",
    submitLabel: "Request a Visit",
    disclaimer:
      "Prefer email? Contact info@mybvha.com or call 832-948-0808. We'll respond as soon as possible.",
    successEmoji: "✓",
    successTitle: "Visit request received!",
    successMessage:
      "We'll be in touch soon to schedule your visit to Brazos Valley Honor Academy.",
    programOptions: [
      { value: "grades-k2", label: "K–2" },
      { value: "grades-37", label: "Grades 3–7" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Child's Name",
      gradePlaceholder: "Select current grade...",
      gradeOptions: [
        { value: "k", label: "Kindergarten" },
        { value: "1", label: "1st Grade" },
        { value: "2", label: "2nd Grade" },
        { value: "3", label: "3rd Grade" },
        { value: "4", label: "4th Grade" },
        { value: "5", label: "5th Grade" },
        { value: "6", label: "6th Grade" },
        { value: "7", label: "7th Grade" },
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions parents ask",
    subtitle:
      "New to BVHA? Here are the most common things families want to know before scheduling a visit.",
    items: [
      {
        q: "How does the three-day hybrid model work?",
        a: "BVHA is a homeschool/private-school hybrid. Students receive core instruction on campus Tuesday through Thursday, 8:30 AM–3:30 PM, while families remain active participants in their child's learning at home.",
      },
      {
        q: "What grades does BVHA serve?",
        a: "Core classes are offered for Kindergarten through 7th grade, covering Reading, Writing, Mathematics, Science, Social Studies, and Bible.",
      },
      {
        q: "What is ability-focused learning?",
        a: "BVHA's flexible curriculum focuses on student ability rather than placing unnecessary limits on learning because of age alone. Experienced Christian teachers partner with families to nurture and challenge each child.",
      },
      {
        q: "How much does tuition cost?",
        a: "Core classes are $475/month from September through May. There is also a one-time $100 enrollment and assessment fee and a $350 curriculum, technology, and campus supply fee per student. A 10% sibling discount applies to monthly tuition for each additional sibling.",
      },
      {
        q: "How do I schedule a visit?",
        a: "The best way to learn whether BVHA is right for your family is to visit in person. Submit the visit request form, email info@mybvha.com, or call 832-948-0808.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Come see BVHA in person",
    heading: "Ready to learn whether BVHA",
    headingAccent: "is the right fit?",
    description:
      "Email info@mybvha.com or call 832-948-0808 to request a visit or ask questions about enrollment.",
    primaryCta: "Schedule a Visit",
    secondaryCta: "Request a Visit",
  },
  footer: {
    tagline:
      "A Christian homeschool hybrid in Navasota, Texas — K–7th grade, Tuesday through Thursday.",
    links: ["About", "Tuition", "Forms", "Events", "Contact", "Facebook"],
    copyright: "© 2026 Brazos Valley Honor Academy",
    poweredBy: "Website concept by MudKitchen",
  },
};
