import type { SchoolWebsiteDemoConfig } from "./types";
import { ASHEBORO_HYBRID_ACADEMY_LOGO } from "./asheboro-hybrid-academy-admin-demo";

export const asheboroHybridAcademyConfig: SchoolWebsiteDemoConfig = {
  slug: "asheboro-hybrid-academy",
  schoolName: "Asheboro Hybrid Academy",
  theme: {
    primary: "#0B2545",
    primaryHover: "#07192F",
    dark: "#0B2545",
    darkHover: "#07192F",
    lightBg: "#F7F3E8",
    lightBorder: "#D8D4C7",
    muted: "#5C6875",
    badgeBg: "rgba(216, 166, 42, 0.12)",
    accentText: "#D8A62A",
    pageBg: "#F7F3E8",
  },
  logo: ASHEBORO_HYBRID_ACADEMY_LOGO,
  hero: {
    eyebrow:
      "Asheboro, North Carolina · Questions? 336-857-2108 · admissions@asheborohybridacademy.com",
    eyebrowPlacement: "announcementBar",
    headline: [
      "The joy of homeschool.",
      "The structure of traditional school.",
      "Together.",
    ],
    subheadline:
      "Asheboro Hybrid Academy brings families and experienced teachers together for a meaningful, well-supported education. Your child learns in a connected classroom community while you remain an important part of the learning journey at home.",
    primaryCta: "Ask About Enrollment",
    secondaryCta: "Explore the Hybrid Model",
    secondaryCtaTarget: "signature",
    navCta: "Ask About Enrollment",
    navLinks: ["Why AHA", "How It Works", "Programs", "Athletics", "FAQ", "Contact"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/Homeschool3.jpg"],
    imageAlt: "Students collaborating with a teacher during class at Asheboro Hybrid Academy",
    trustBadges: [
      "Christian Hybrid School",
      "Elementary · Middle · High School",
      "Parent Partnership",
      "Asheboro, NC",
    ],
    tagline: "Serving elementary, middle, and high school families.",
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "hybridRhythm",
    eyebrow: "How hybrid learning works at AHA",
    heading: "Connected on campus. Supported at home.",
    subtitle:
      "At Asheboro Hybrid Academy, we bring together the positive experiences of homeschooling with the community and organization of the traditional classroom. Students learn from passionate, experienced teachers on campus and complete guided work at home with a parent or guardian serving as a co-teacher.",
    tagline: "Randolph County's premiere hybrid school.",
    campusDays: [
      {
        label: "Elementary & Middle",
        title: "Mondays & Thursdays",
        desc: "8:30 AM–3:00 PM on campus with experienced teachers — a strong foundation with teacher guidance and growing academic independence.",
      },
      {
        label: "High School",
        title: "Mon, Tue & Thu",
        desc: "Three campus days with structure, community, and preparation for the next chapter — 8:30 AM–3:00 PM.",
      },
    ],
    homeDays: [
      {
        label: "At Home",
        title: "Guided learning with family",
        desc: "Teachers provide detailed assignments and plans so families know what to do between campus days.",
      },
      {
        label: "Parent partnership",
        title: "Co-teacher to guide",
        desc: "Parents begin as active personal tutors in the elementary years and gradually become more of a guide as students mature.",
      },
    ],
    serviceNote:
      "From classroom learning to AHA Warriors athletics — opportunities to build character, friendships, and school spirit beyond the academic day.",
  },
  stats: [
    { value: "Mon & Thu", label: "Elementary + Middle on campus" },
    { value: "Mon · Tue · Thu", label: "High school on campus" },
    { value: "Family Partnership", label: "Teacher-created plans" },
    { value: "8:30 AM–3:00 PM", label: "Asheboro, NC" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Built for parents, too",
    heading: "You do not have to be a teacher to be a great co-teacher.",
    cards: [
      {
        title: "Teacher-created plans and assignments",
        desc: "AHA's teachers handle lesson planning, preparation, and new curriculum instruction — you support work already explained and organized.",
      },
      {
        title: "Clear guidance for learning at home",
        desc: "Detailed assignments and plans between campus days so families know exactly what to do and when.",
      },
      {
        title: "A supportive classroom community",
        desc: "Meaningful time in class with professional teachers and peers — the organization of traditional school with room for family life.",
      },
      {
        title: "A path toward independence",
        desc: "More freedom for family life and a gradual shift from parent as tutor to parent as guide as students mature.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/Homeschool3.jpg",
  },
  marquee: [
    "Christian Hybrid School",
    "Asheboro NC",
    "AHA Warriors",
    "Parent Partnership",
    "Mon & Thu Campus",
    "Homeschool Joy",
    "Traditional Structure",
    "Elementary Middle High",
    "Ask About Enrollment",
    "Inter-Denominational",
    "Parent Governed",
    "Randolph County",
  ],
  programs: {
    eyebrow: "Programs",
    heading: "Find the right fit for your family.",
    subtitle:
      "Elementary, middle, and high school pathways with distinct on-campus rhythms. Confirm current availability and enrollment requirements with Asheboro Hybrid Academy.",
    ctaLabel: "Ask About Enrollment",
    items: [
      {
        badge: "Elementary",
        title: "Elementary School",
        teaser: "Mondays & Thursdays · 8:30 AM–3:00 PM",
        desc: "A strong foundation with teacher guidance and family partnership — students receive instruction on campus and continue guided learning at home.",
        details: [
          "Mondays & Thursdays",
          "8:30 AM–3:00 PM",
          "Teacher-led campus days",
          "Confirm availability",
        ],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#0B2545]",
        accentBg: "bg-[#F7F3E8]",
      },
      {
        badge: "Middle School",
        title: "Middle School",
        teaser: "Mondays & Thursdays · 8:30 AM–3:00 PM",
        desc: "Growing confidence, responsibility, and academic independence — the same Mon/Thu campus rhythm with increasing student ownership at home.",
        details: [
          "Mondays & Thursdays",
          "8:30 AM–3:00 PM",
          "Parent co-teacher model",
          "Confirm availability",
        ],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#07192F]",
        accentBg: "bg-[#F7F3E8]",
      },
      {
        badge: "High School",
        title: "High School",
        teaser: "Mon, Tue & Thu · 8:30 AM–3:00 PM",
        desc: "Structure, community, and preparation for the next chapter — three campus days with guided work at home between sessions.",
        details: [
          "Mon · Tue · Thu",
          "8:30 AM–3:00 PM",
          "Three campus days",
          "Confirm availability",
        ],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#D8A62A]",
        accentBg: "bg-[#F7F3E8]",
      },
      {
        badge: "Athletics",
        title: "AHA Warriors Athletics",
        teaser: "More ways to belong",
        desc: "From classroom learning to Warrior athletics — opportunities to build character, friendships, and school spirit beyond the academic day.",
        details: [
          "Volleyball · Soccer · Golf",
          "Character & community",
          "Contact athletics office",
          "Sports physical required",
        ],
        image: "/images/stock/ImageSeven.jpg",
        accent: "text-[#0B2545]",
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
      "A school experience built",
      "around family partnership.",
    ],
    attribution: "— Asheboro Hybrid Academy",
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
    eyebrow: "How AHA works",
    heading: "Three steps in the",
    headingSub: "hybrid learning rhythm.",
    steps: [
      {
        time: "Step 1",
        activity: "Learn with experienced teachers",
        desc: "Students receive instruction on campus from professional teachers, who introduce new concepts and guide learning.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "Step 2",
        activity: "Continue learning at home",
        desc: "Teachers provide detailed assignments and plans so families know what to do between campus days.",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        time: "Step 3",
        activity: "Grow in independence",
        desc: "Parents begin as active personal tutors in the elementary years and gradually become more of a guide as students mature.",
        image: "/images/stock/Homeschool3.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Community & faith",
    heading: "A community shaped by faith, family, and growth",
    subtitle:
      "AHA is an inter-denominational, parent-governed community of families seeking to raise and educate children with a Christian worldview.",
    items: [
      {
        title: "Christian worldview",
        desc: "An inter-denominational community united by a shared commitment to meaningful education — families from many churches are represented.",
        icon: "shield",
      },
      {
        title: "Parent-governed",
        desc: "Families partner together in raising and educating children — parent involvement is central to the hybrid model.",
        icon: "users",
      },
      {
        title: "Multi-student families",
        desc: "AHA states that the first student pays the annual tuition rate and subsequent students receive a tuition discount — contact the school for current details.",
        icon: "award",
      },
      {
        title: "Packed lunch policy",
        desc: "Students bring a packed lunch — a simple, practical rhythm that keeps campus days focused on learning and community.",
        icon: "bookOpen",
      },
    ],
  },
  founder: {
    eyebrow: "Community and faith",
    heading: "Raising and educating children",
    headingAccent: "with a Christian worldview.",
    paragraphs: [
      "Asheboro Hybrid Academy is an inter-denominational, parent-governed community of families seeking to raise and educate children with a Christian worldview. Families from many churches are represented, united by a shared commitment to meaningful education and strong relationships.",
      "The hybrid model preserves family involvement and flexibility while providing organized classroom instruction, professional teachers, and a clear academic structure.",
    ],
    credentials: [
      "Inter-denominational Christian community",
      "Parent-governed hybrid school",
      "Elementary · Middle · High School",
      "Asheboro, North Carolina",
    ],
    quote:
      "The joy of homeschool. The structure of traditional school. Together.",
    quoteAttribution: "— Asheboro Hybrid Academy",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "Asheboro, NC" },
    name: "Asheboro Hybrid Academy",
    title: "Christian Hybrid School",
  },
  parallax: {
    eyebrow: "More ways to belong",
    heading: ["Classroom learning.", "Warrior athletics.", "School spirit."],
    subtitle:
      "From classroom learning to AHA Warriors athletics, AHA gives students opportunities to build character, friendships, and school spirit beyond the academic day.",
    primaryCta: "Explore AHA Athletics",
    secondaryCta: "Ask About Enrollment",
    backgroundImage: "/images/stock/ImageNine.jpg",
  },
  pillars: {
    eyebrow: "Why families choose AHA",
    heading: "The best of both worlds.",
    subtitle:
      "A balanced rhythm: meaningful time in class, a clear plan for learning at home, and more room for family life.",
    items: [
      {
        icon: "bookOpen",
        title: "Experienced teachers on campus",
        desc: "Professional teachers introduce new concepts and guide learning during structured campus days.",
      },
      {
        icon: "users",
        title: "Parent partnership at home",
        desc: "Families support guided work between campus days — from co-teacher to guide as children grow.",
      },
      {
        icon: "compass",
        title: "Clear hybrid schedules",
        desc: "Elementary and middle meet Mon & Thu; high school meets Mon, Tue & Thu — 8:30 AM to 3:00 PM.",
      },
      {
        icon: "sparkles",
        title: "Faith & community",
        desc: "An inter-denominational Christian community where relationships and spiritual growth matter.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Start with a conversation so our team can help you understand the current enrollment process and available options for your family.",
    sidebarImage: "/images/stock/Homeschool2.jpg",
    eyebrow: "Start an Admissions Conversation",
    heading: "Tell us about your family.",
    description:
      "Share your name, contact information, your child's grade for 2026–27, and what you'd like to learn more about. AHA has indicated that space may be limited in many grades — we'll follow up to discuss next steps.",
    submitLabel: "Send My Inquiry",
    disclaimer:
      "4751 Dunbar Bridge Rd., Asheboro, NC 27205 · admissions@asheborohybridacademy.com · 336-857-2108 · Phone: Mon, Tue & Thu · 8:30 AM–3:00 PM",
    trustNote:
      "I agree that AHA may contact me about my inquiry. Please confirm current grade-level availability before making plans.",
    successEmoji: "✓",
    successTitle: "Thank you — the AHA team will be in touch.",
    successMessage:
      "Thank you for reaching out to Asheboro Hybrid Academy. Our admissions team will follow up soon about hybrid learning and enrollment options.",
    programOptions: [
      { value: "elementary", label: "Elementary school" },
      { value: "middle", label: "Middle school" },
      { value: "high", label: "High school" },
      { value: "hybrid-model", label: "Hybrid learning model" },
      { value: "athletics", label: "Athletics" },
      { value: "tuition", label: "Tuition / enrollment" },
      { value: "other", label: "Other" },
    ],
    studentFields: {
      namePlaceholder: "Student's Name",
      gradePlaceholder: "Student grade for 2026–27...",
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
    heading: "Questions families often ask",
    subtitle:
      "New to hybrid learning? Here are common questions about parent involvement, faith, and daily life at AHA.",
    items: [
      {
        q: "Do parents need teaching experience?",
        a: "No. AHA teachers introduce new concepts and provide detailed assignments and plans. Parents support learning at home as personal tutors, with the level of involvement evolving as children grow.",
      },
      {
        q: "Is AHA affiliated with a church denomination?",
        a: "No. AHA is an inter-denominational effort of families seeking to educate children with a Christian worldview.",
      },
      {
        q: "Is there a multi-student discount?",
        a: "Yes. AHA states that the first student pays the annual tuition rate and subsequent students receive a tuition discount. Contact the school for current tuition details.",
      },
      {
        q: "What do students do for lunch?",
        a: "Students bring a packed lunch.",
      },
    ],
  },
  closingCta: {
    eyebrow: "2026–27 Enrollment Information",
    heading: "Let's talk about your child's",
    headingAccent: "next school year.",
    description:
      "AHA has indicated that space may be limited in many grades. Start with a conversation so our team can help you understand the current enrollment process and available options for your family. Please confirm current grade-level availability and enrollment requirements with Asheboro Hybrid Academy before making plans. Asheboro Hybrid Academy is a religious institution which admits students of any race, color, national and ethnic origin to all the rights, privileges, programs, and activities generally accorded or made available to students at the school. Asheboro Hybrid Academy does not discriminate on the basis of race, color, national and ethnic origin in administration of its educational policies, admissions policies, financial aid programs, or athletic and other school-administered programs.",
    primaryCta: "Ask About Enrollment",
    secondaryCta: "Contact Admissions",
  },
  footer: {
    tagline:
      "Randolph County's Premiere Hybrid School · 4751 Dunbar Bridge Rd., Asheboro, NC 27205 · admissions@asheborohybridacademy.com · 336-857-2108",
    links: ["Why AHA", "How It Works", "Programs", "Athletics", "FAQ", "Contact"],
    copyright: "© 2026 Asheboro Hybrid Academy",
    poweredBy: "Website concept by MudKitchen",
  },
};
