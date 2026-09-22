import type { SchoolWebsiteDemoConfig } from "./types";
import { RIVER_OAK_ACADEMY_LOGO } from "./river-oak-academy-admin-demo";

export const riverOakAcademyConfig: SchoolWebsiteDemoConfig = {
  slug: "river-oak-academy",
  schoolName: "River Oak Academy",
  theme: {
    primary: "#496846",
    primaryHover: "#24372B",
    dark: "#24372B",
    darkHover: "#1B1D1B",
    lightBg: "#E8EDE1",
    lightBorder: "#D7E0D7",
    muted: "#505650",
    badgeBg: "rgba(73, 104, 70, 0.12)",
    accentText: "#B96545",
    pageBg: "#F5F0E5",
  },
  logo: RIVER_OAK_ACADEMY_LOGO,
  hero: {
    eyebrow: "LEARNER-DRIVEN PRIVATE SCHOOL · ST. JOHNS, FL",
    eyebrowPlacement: "announcementBar",
    headline: ["Where curious children become", "capable, confident people."],
    headlineAccentLine: 1,
    subheadline:
      "River Oak Academy is a mixed-age, learner-driven community where children build real skills, take meaningful responsibility, and discover a calling through hands-on work, big questions, and real-world adventures.",
    primaryCta: "Start Your Admissions Journey",
    secondaryCta: "Explore Our Studios",
    secondaryCtaTarget: "programs",
    navCta: "Start Your Admissions Journey",
    navLinks: [
      "Why River Oak",
      "Studios",
      "How Learning Works",
      "Admissions",
      "Tuition",
      "FAQ",
    ],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/ImageTwo.jpg"],
    imageAlt: "Learners collaborating outdoors in a nature-rich environment",
    trustBadges: [
      "Ages 4–14",
      "Mixed-age studios",
      "Real-world projects",
      "Nature-rich outdoor learning",
    ],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "learningModes",
    eyebrow: "A different kind of school day",
    heading: "Learning that feels like a journey, not a checklist.",
    subtitle:
      "We replace one-size-fits-all pacing with a thoughtful rhythm of focused Core Skills, collaborative projects, outdoor exploration, goal setting, and reflection. Learners have freedom within clear boundaries—and the opportunity to do difficult things with purpose.",
    modes: [
      {
        label: "Independence",
        title: "Independent learning",
        desc: "Learners set goals, build habits, and learn how to take ownership of their work.",
        icon: "compass",
      },
      {
        label: "Quests",
        title: "Real-world Quests",
        desc: "Multi-week challenges make science, writing, history, design, and problem-solving matter.",
        icon: "sparkles",
      },
      {
        label: "Community",
        title: "Mixed-age community",
        desc: "Younger and older learners work together, practice leadership, and learn from one another.",
        icon: "users",
      },
      {
        label: "Character",
        title: "Character in action",
        desc: "Kindness, resilience, responsibility, and reflection are part of every day—not an add-on.",
        icon: "heart",
      },
    ],
  },
  stats: [
    { value: "St. Johns, FL", label: "Campus location" },
    { value: "Ages 4–14", label: "Studios enrolling" },
    { value: "Acton", label: "Academy affiliate" },
    { value: "Outdoor", label: "Nature-rich learning" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Is River Oak right for your family?",
    heading: "A strong fit for families who believe growth takes courage.",
    cards: [
      {
        title: "Whole-child growth",
        desc: "Value a whole-child approach and long-term growth over arbitrary checkmarks.",
      },
      {
        title: "Love of learning",
        desc: "Want children to develop a genuine love of learning—not just compliance with assignments.",
      },
      {
        title: "Productive struggle",
        desc: "Believe children grow through responsibility, productive struggle, and reflection.",
      },
      {
        title: "Engaged community",
        desc: "Welcome an environment with clear expectations, independence, accountability, and dignity for every child.",
      },
    ],
    mainImage: "/images/stock/Homeschool3.jpg",
    secondaryImage: "/images/stock/ImageFour.jpg",
  },
  marquee: [
    "Learner-Driven",
    "Guides Not Teachers",
    "Mixed-Age Studios",
    "Hero's Journey",
    "Real-World Quests",
    "Outdoor Classroom",
    "Children's Business Fair",
    "St. Johns, Florida",
    "Spark Studio",
    "Elementary Studio",
    "Middle School Studio",
    "Start Your Admissions Journey",
  ],
  programs: {
    eyebrow: "Studios",
    heading: "A place to grow at every stage.",
    subtitle:
      "Every learner follows a unique path. River Oak studios meet children where they are while gradually increasing challenge, responsibility, and real-world application.",
    ctaLabel: "Start Your Admissions Journey",
    items: [
      {
        badge: "Ages 4–6",
        title: "Spark Studio",
        teaser: "Play, discovery, and purposeful choice",
        desc: "A safe, caring, and warm early-learning environment where children learn through play, hands-on discovery, indoor/outdoor exploration, and purposeful choice.",
        details: [
          "Ages 4–6",
          "Montessori-inspired",
          "Reggio Emilia inspiration",
          "Social-emotional development",
        ],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#496846]",
        accentBg: "bg-[#E8EDE1]",
      },
      {
        badge: "Ages 7–11",
        title: "Elementary Studio",
        teaser: "Core skills, collaboration, and maker projects",
        desc: "Bright, flexible spaces for core skills, collaboration, outdoor play, maker projects, and meaningful goal-setting in a tight-knit community.",
        details: [
          "Ages 7–11",
          "Hands-on materials",
          "Outdoor classroom",
          "Maker's space",
        ],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#496846]",
        accentBg: "bg-[#E8EDE1]",
      },
      {
        badge: "Ages 12–14",
        title: "Middle School Studio",
        teaser: "Real-world problems and apprenticeships",
        desc: "A studio for independent learners ready to solve difficult real-world problems, think and write deeply, collaborate, and begin exploring their gifts and calling through apprenticeships.",
        details: [
          "Ages 12–14",
          "Peer review",
          "Real-world problems",
          "Apprenticeships",
        ],
        image: "/images/stock/ImageFour.jpg",
        accent: "text-[#B96545]",
        accentBg: "bg-[#F5F0E5]",
      },
      {
        badge: "Ages 14–18",
        title: "Future Launch Pad",
        teaser: "Discover a calling and prepare for what's next",
        desc: "A high-school program where older learners explore apprenticeships, real-world work, and the path toward a calling that can change the world.",
        details: [
          "Ages 14–18",
          "Apprenticeships",
          "Real-world work",
          "$1,300/month published tuition",
        ],
        image: "/images/stock/Homeschool3.jpg",
        accent: "text-[#E1B654]",
        accentBg: "bg-[#F5F0E5]",
      },
    ],
  },
  mosaicImages: [
    "/images/stock/Homeschool.jpg",
    "/images/stock/Homeschool2.jpg",
    "/images/stock/ImageTwo.jpg",
  ],
  quote: {
    text: [
      "To inspire and empower children who enter our doors",
      "to find a calling that will change the world.",
    ],
    attribution: "— River Oak Academy",
    backgroundImage: "/images/stock/ImageNine.jpg",
  },
  stripImages: [
    "/images/stock/ImageEleven.jpg",
    "/images/stock/ImageTwelve.jpg",
    "/images/stock/ImageThirteen.jpg",
    "/images/stock/Homeschool.jpg",
    "/images/stock/Homeschool2.jpg",
    "/images/stock/ImageTwo.jpg",
  ],
  timeline: {
    eyebrow: "Begin your admissions journey",
    heading: "A transparent path",
    headingSub: "from first conversation to enrollment.",
    steps: [
      {
        time: "Step 1",
        activity: "Schedule an introductory call",
        desc: "Share your family's story and learn whether River Oak may be a fit.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "Step 2",
        activity: "Explore the school",
        desc: "Eligible families may arrange a tour after the initial conversation.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "Step 3",
        activity: "Submit an application",
        desc: "Request application materials from admissions and complete the process.",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        time: "Step 4",
        activity: "Experience a trial period",
        desc: "Children may be invited for a trial period, ranging from one to two weeks up to a full session.",
        image: "/images/stock/ImageFour.jpg",
      },
      {
        time: "Step 5",
        activity: "Meet for a decision",
        desc: "The family and school determine together whether River Oak is the right environment.",
        image: "/images/stock/Homeschool3.jpg",
      },
    ],
  },
  socialProof: {
    type: "testimonials",
    eyebrow: "What families value",
    heading: "A community built on trust and growth",
    subtitle:
      "River Oak is not trying to be the right school for every family. It is a place for children and parents ready to embrace a meaningful learning journey.",
    items: [
      {
        quote:
          "Our role is to embrace each child's unique qualities and empower them to find what they want to accomplish in the world.",
        name: "River Oak Guide",
        detail: "St. Johns, FL",
        stars: 5,
        avatar: "/images/stock/ImageTen.jpg",
      },
      {
        quote:
          "Learners are encouraged to take more control of their learning process—with Guides who create meaningful challenges and clear boundaries.",
        name: "River Oak Academy parent",
        detail: "St. Johns, FL",
        stars: 5,
        avatar: "/images/stock/ImageSeven.jpg",
      },
      {
        quote:
          "Teaching is not about answering questions but about raising questions—opening doors in places they could not imagine.",
        name: "Yawar Baig",
        detail: "Inspiration for River Oak Guides",
        stars: 5,
        avatar: "/images/stock/ImageEight.jpg",
      },
    ],
  },
  founder: {
    eyebrow: "Meet our Guides",
    heading: "Guides who create the",
    headingAccent: "conditions for discovery.",
    paragraphs: [
      "Our adults are Guides because their role is different from delivering every answer. Guides create meaningful challenges, establish clear boundaries, and help learners develop the habits, resources, and confidence to learn how to learn.",
      "At River Oak, we see children as capable people with unique gifts. Our role is not to hand them every answer, but to create an environment where they can ask better questions, take responsibility, work through challenges, and discover how they can contribute to the world.",
    ],
    credentials: [
      "Montessori-inspired methods",
      "Acton Academy affiliate",
      "Mixed-age studios",
      "St. Johns, Florida",
    ],
    quote:
      "Teaching is not about answering questions but about raising questions—opening doors for them in places that they could not imagine.",
    quoteAttribution: "— Yawar Baig",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Guides", value: "ROA" },
    name: "River Oak Academy Guides",
    title: "Facilitators, motivators, and guides",
  },
  parallax: {
    eyebrow: "Tuition snapshot",
    heading: ["Transparent tuition", "for every studio."],
    subtitle:
      "Published monthly tuition ranges from $700 (Spark half day) to $1,400/month for full-day studios, with Future Launch Pad at $1,300/month. Additional fees include a $200 application fee, $400 annual registration, and $400 trial week. Sibling discounts and Florida scholarship programs may apply—confirm all rates with admissions before enrolling.",
    primaryCta: "Schedule an Introductory Call",
    secondaryCta: "Explore Our Studios",
    backgroundImage: "/images/stock/Homeschool.jpg",
  },
  pillars: {
    eyebrow: "What makes River Oak different",
    heading: "Nature, projects, and purpose.",
    subtitle:
      "Beyond self-paced academics and real Quests, River Oak builds character, community, and the skills learners need for a meaningful life.",
    items: [
      {
        icon: "compass",
        title: "Outdoor classroom",
        desc: "Nature-rich spaces invite learners to explore, build, collaborate, move, and reconnect with the physical world.",
      },
      {
        icon: "sparkles",
        title: "Children's Business Fair",
        desc: "Young entrepreneurs plan a product, market it, understand costs and pricing, and present their ideas to the community.",
      },
      {
        icon: "graduationCap",
        title: "Hero's Journey",
        desc: "Every learner is on a personal journey toward independence, character, curiosity, mastery, and eventually a calling.",
      },
      {
        icon: "users",
        title: "Mixed-age community",
        desc: "Younger and older learners work together, practice leadership, and learn from one another every day.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Start with a conversation. Tell us about your learner, your hopes for their education, and what you are looking for in a school community.",
    sidebarImage: "/images/stock/Homeschool2.jpg",
    eyebrow: "Begin your admissions journey",
    heading: "Your child's journey can start with one conversation.",
    description:
      "Share your learner's age, studio interest, and any questions. Our admissions team will follow up to schedule an introductory call.",
    submitLabel: "Schedule an Introductory Call",
    disclaimer:
      "River Oak Academy · 3355 State Road 13, St. Johns, FL 32259 · (904) 770-5559 · Prefer email? admissions@riveroakacademy.org",
    trustNote:
      "This is a demo inquiry form. In production, responses would route to your admissions team.",
    successEmoji: "✓",
    successTitle: "Inquiry received!",
    successMessage:
      "Thank you for your interest in River Oak Academy. We'll be in touch soon to schedule an introductory call about studio fit and enrollment.",
    programOptions: [
      { value: "spark", label: "Spark Studio (ages 4–6)" },
      { value: "elementary", label: "Elementary Studio (ages 7–11)" },
      { value: "middle", label: "Middle School Studio (ages 12–14)" },
      { value: "launchpad", label: "Future Launch Pad (ages 14–18)" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Learner's Name",
      gradePlaceholder: "Select learner's age/stage...",
      gradeOptions: [
        { value: "4-6", label: "Ages 4–6 (Spark Studio)" },
        { value: "7-11", label: "Ages 7–11 (Elementary Studio)" },
        { value: "12-14", label: "Ages 12–14 (Middle School Studio)" },
        { value: "14-18", label: "Ages 14–18 (Future Launch Pad)" },
        { value: "unsure", label: "Not sure yet" },
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions families ask",
    subtitle:
      "New to River Oak Academy? Here are the most common things families want to know before scheduling an introductory call.",
    items: [
      {
        q: "Is River Oak Academy a Montessori school?",
        a: "River Oak incorporates Montessori-inspired methods—especially in Spark Studio—and draws from Reggio Emilia inspiration for early learners. It is also an Acton Academy affiliate with learner-driven studios, Quests, and Socratic discussion.",
      },
      {
        q: "How does a learner-driven environment work?",
        a: "Learners set goals, build habits, and take ownership of their work. Guides create meaningful challenges and clear boundaries while learners progress through Core Skills, projects, and real-world experiences at their own pace.",
      },
      {
        q: "Are children grouped by age or grade level?",
        a: "River Oak uses mixed-age studios rather than traditional grade-level classrooms. Spark, Elementary, and Middle School studios group learners by developmental stage while allowing younger and older learners to work together.",
      },
      {
        q: "How do you document learning without traditional grades?",
        a: "Progress is not reduced to a grade on a report card. Learners build skills through focused Core Skills work, earn badges for effort and mastery, create portfolios, and share their work in public exhibitions and real-world projects.",
      },
      {
        q: "What kind of learner and family thrive at ROA?",
        a: "Families who value whole-child growth, productive struggle, independence with accountability, and an engaged community often find River Oak is a strong fit. The school is designed for families ready to embrace a meaningful learning journey.",
      },
      {
        q: "What does the admissions process look like?",
        a: "The process begins with an introductory call, followed by a campus tour for eligible families, an application, a trial period (one to two weeks up to a full session), and a final decision meeting together with the school.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Ready for the next step?",
    heading: "Your child's journey can start",
    headingAccent: "with one conversation.",
    description:
      "Tell us about your learner, your hopes for their education, and what you are looking for in a school community.",
    primaryCta: "Start Your Admissions Journey",
    secondaryCta: "Explore Our Studios",
  },
  footer: {
    tagline:
      "Learner-driven education · St. Johns, Florida · Inspiring children to find a calling",
    links: [
      "Studios",
      "Admissions",
      "Tuition",
      "FAQ",
      "Blog",
      "Contact",
    ],
    copyright: "© 2026 River Oak Academy",
    poweredBy: "Website concept by MudKitchen",
  },
};
