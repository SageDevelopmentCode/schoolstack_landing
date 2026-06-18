import type { SchoolWebsiteDemoConfig } from "./types";
import { WONDERHERE_LOGO } from "./wonderhere-admin-demo";

export const wonderhereLakelandConfig: SchoolWebsiteDemoConfig = {
  slug: "wonderhere-lakeland",
  schoolName: "WonderHere Lakeland",
  theme: {
    primary: "#6B9E78",
    primaryHover: "#5A8A68",
    dark: "#3D5A45",
    darkHover: "#2D4533",
    lightBg: "#F5F1E8",
    lightBorder: "#E8E0D0",
    muted: "#6B7B6E",
    badgeBg: "#EDF4EA",
    accentText: "#5C9FD4",
    pageBg: "#FBFAF6",
  },
  logo: WONDERHERE_LOGO,
  hero: {
    eyebrow: "Lakeland, Florida · Ten-Acre Farm · Wonder is for all",
    eyebrowPlacement: "announcementBar",
    headline: ["Fun, Meaningful Learning", "in Lakeland, Florida"],
    subheadline:
      "Experience play-based, project-driven learning at WonderHere Lakeland — your one-stop shop for meaningful education on our ten-acre farm. Schoolhouse, homeschool programs, farm experiences, and summer camps.",
    primaryCta: "Schedule a Visit",
    secondaryCta: "Explore Programs",
    secondaryCtaTarget: "signature",
    navCta: "Request Info",
    navLinks: ["Schoolhouse", "Homeschool", "Farm", "Summer Camps", "FAQ"],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/Homeschool3.jpg"],
    imageAlt: "Children learning outdoors on a farm",
    tagline: "Wonder is for all.",
  },
  signatureSection: {
    type: "farmExperience",
    eyebrow: "Ten-Acre Farm Campus",
    heading: "Your one-stop shop for meaningful learning",
    subtitle:
      "From drop-off schoolhouse to homeschool community to farm adventures and summer camps — all on our peaceful ten-acre property in Lakeland.",
    paths: [
      {
        title: "Lakeland Schoolhouse",
        desc: "Small private school with Family-Style™ multi-age classrooms and play-based, project-driven learning.",
        icon: "bookOpen",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        title: "Homeschool Programs",
        desc: "Friday School, Co-Op, and enrichment days for families who want community without full-time enrollment.",
        icon: "users",
        image: "/images/stock/Homeschool3.jpg",
      },
      {
        title: "Farm Programs",
        desc: "Animals, gardens, and open fields — nature-based learning on a safe, peaceful ten-acre farm.",
        icon: "treePine",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        title: "Summer Camps",
        desc: "Theme weeks, water days, and screen-light free play that spark curiosity all summer long.",
        icon: "sparkles",
        image: "/images/stock/ImageFour.jpg",
      },
    ],
  },
  stats: [
    { value: "10 Acres", label: "Farm Property" },
    { value: "Registered", label: "Private School" },
    { value: "Family-Style", label: "Multi-Age Classrooms" },
    { value: "4 Paths", label: "Programs for Every Family" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "Is WonderHere Lakeland Right for You?",
    heading: "A warm, wonder-filled place for families who want learning that feels alive.",
    cards: [
      {
        title: "Looking for a homeschool community",
        desc: "Find your people with Friday School, Co-Op, and enrichment days.",
      },
      {
        title: "Want drop-off or parent-participation options",
        desc: "Flexible programs tailored to different ages, interests, and schedules.",
      },
      {
        title: "Craving nature-based, hands-on learning",
        desc: "Animals, gardens, and open fields on a safe, peaceful ten-acre farm.",
      },
      {
        title: "Need a screen-light summer on the farm",
        desc: "Theme weeks, water days, and free play that spark curiosity.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/ImageFour.jpg",
  },
  marquee: [
    "Wonder is for all",
    "Lakeland Schoolhouse",
    "Friday School",
    "Homeschool Co-Op",
    "Farm Programs",
    "Summer Camps",
    "Family-Style",
    "Play-Based",
    "Project-Driven",
    "Ten-Acre Farm",
    "Nature Learning",
    "Registered Private School",
  ],
  programs: {
    eyebrow: "Lakeland Programs",
    heading: "Your one-stop shop for fun, meaningful learning",
    subtitle: "Click each program to explore what enrollment looks like for your family.",
    ctaLabel: "Learn More",
    items: [
      {
        badge: "Private School",
        title: "Lakeland Schoolhouse",
        teaser: "Small private school with family-style classrooms",
        desc: "A small private school offering play-based, project-driven, personalized education in a Family-Style™ model — multi-age classrooms where children build core skills and explore interests with teacher mentorship. Full-day and half-day options available.",
        details: [
          "Play-based & project-driven",
          "Full-day & half-day options",
          "Registered private school",
          "Ten-acre farm campus",
        ],
        image: "/images/stock/ImageTwo.jpg",
        accent: "text-[#3D5A45]",
        accentBg: "bg-[#F5F1E8]",
      },
      {
        badge: "Homeschool",
        title: "Homeschool Programs",
        teaser: "Community, enrichment, and flexible scheduling",
        desc: "Homeschooling done in community with others. Choose from Friday School, Co-Op, and Homeschool Collective enrichment days — with drop-off or parent-participation options that complement what you're already doing at home.",
        details: [
          "Friday School",
          "Co-Op & Collective",
          "Drop-off options",
          "All ages & interests",
        ],
        image: "/images/stock/Homeschool3.jpg",
        accent: "text-[#5C9FD4]",
        accentBg: "bg-[#F5F1E8]",
      },
      {
        badge: "Farm",
        title: "Farm Programs",
        teaser: "Hands-on learning with animals and gardens",
        desc: "Located on ten acres of lush farmland with animals, gardens, and room to run and play. The farm is a gathering place for learning in a safe, peaceful environment — from toddler farm days to family events.",
        details: [
          "Wilderness Workshop",
          "4-H Toddler Farm",
          "Family Farm Day",
          "Nature for all ages",
        ],
        image: "/images/stock/ImageFive.jpg",
        accent: "text-[#6B9E78]",
        accentBg: "bg-[#EDF4EA]",
      },
      {
        badge: "Summer",
        title: "Summer Camps",
        teaser: "The best summer of your kid's life",
        desc: "Thematic weeks with hands-on activities, new hobbies and skills, weekly movie day and water day, team competitions, farm animals, and daily free play — safe, screen-light days on the farm.",
        details: [
          "Theme weeks",
          "Water & movie days",
          "Farm animals",
          "All school types welcome",
        ],
        image: "/images/stock/ImageSix.jpg",
        accent: "text-[#C4A574]",
        accentBg: "bg-[#F5F1E8]",
      },
    ],
  },
  mosaicImages: [
    "/images/stock/Homeschool.jpg",
    "/images/stock/Homeschool2.jpg",
    "/images/stock/ImageSeven.jpg",
  ],
  quote: {
    text: ["Wonder is for all.", "Every family belongs here."],
    attribution: "WonderHere Lakeland",
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
    eyebrow: "A Day on the Farm",
    heading: "Learning that balances",
    headingSub: "structure, play, and wonder.",
    steps: [
      {
        time: "Morning",
        activity: "Farm Arrival & Community",
        desc: "Students gather outdoors, connect with teachers and friends, and set intentions for a wonder-filled day on the farm.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "Core Hours",
        activity: "Project & Skill Time",
        desc: "Play-based, project-driven learning in family-style classrooms — personalized mentorship and interest-led exploration.",
        image: "/images/stock/ImageTwo.jpg",
      },
      {
        time: "Midday",
        activity: "Farm & Garden Learning",
        desc: "Hands-on time with animals, gardens, and nature — building curiosity through real-world experiences outdoors.",
        image: "/images/stock/ImageFive.jpg",
      },
      {
        time: "Afternoon",
        activity: "Free Play & Enrichment",
        desc: "Room to run, create, and collaborate — balancing structure with the joy of unstructured exploration.",
        image: "/images/stock/ImageSix.jpg",
      },
      {
        time: "Special Days",
        activity: "Family Farm Events",
        desc: "Community gatherings, farm programs, and enrichment days that bring Lakeland families together.",
        image: "/images/stock/Homeschool3.jpg",
      },
    ],
  },
  socialProof: {
    type: "testimonials",
    eyebrow: "Lakeland Families",
    heading: "What Lakeland Families Are Saying",
    subtitle: "Placeholder quotes — easily editable by your team.",
    items: [
      {
        quote:
          "WonderHere Lakeland gave our family exactly what we were looking for — a warm community, meaningful learning, and a place where our kids can be outside every day.",
        name: "Sarah",
        detail: "Lakeland Parent · Schoolhouse",
        stars: 5,
        avatar: "/images/stock/ImageTen.jpg",
      },
      {
        quote:
          "The Friday School program has been a game-changer for our homeschool. Our kids love the farm, the projects, and the friends they've made.",
        name: "Michelle",
        detail: "Lakeland Parent · Homeschool Program",
        stars: 5,
        avatar: "/images/stock/ImageSeven.jpg",
      },
      {
        quote:
          "Summer camp was the highlight of our year. Screen-light days, water play, and farm animals — our kids didn't want it to end.",
        name: "Jennifer",
        detail: "Lakeland Parent · Summer Camps",
        stars: 5,
        avatar: "/images/stock/ImageEight.jpg",
      },
    ],
  },
  founder: {
    eyebrow: "Meet Our Lakeland Team",
    heading: "Built by educators.",
    headingAccent: "Inspired by wonder.",
    paragraphs: [
      "WonderHere Lakeland is a close-knit learning community on a ten-acre farm in Lakeland, Florida — where play-based, project-driven education meets the warmth of family-style classrooms.",
      "Our team is dedicated to helping every child discover the joy of learning through hands-on experiences, nature-based exploration, and meaningful relationships with teachers and peers.",
    ],
    credentials: [
      "Registered Private School",
      "Family-Style™ Classrooms",
      "Ten-Acre Farm Campus",
      "Homeschool & Schoolhouse Options",
    ],
    quote: "Wonder is for all — and there's a place for your family here.",
    quoteAttribution: "— WonderHere Lakeland Team",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Campus", value: "10-Acre Farm" },
    name: "WonderHere Lakeland",
    title: "Site Director & Lead Educators",
  },
  parallax: {
    eyebrow: "Wonder is for all",
    heading: ["Schoolhouse.", "Homeschool.", "Farm.", "Summer."],
    subtitle:
      "Whether you're looking for a small private school, homeschool community, farm experiences, or unforgettable summer camps — there's a place for your family at WonderHere Lakeland.",
    primaryCta: "Schedule a Visit",
    secondaryCta: "Request Lakeland Info",
    backgroundImage: "/images/stock/Homeschool2.jpg",
  },
  pillars: {
    eyebrow: "What Makes WonderHere Different",
    heading: "Nature, play, and community — woven into every day.",
    subtitle:
      "Hands-on farm learning, family-style classrooms, homeschool community, and screen-light summers.",
    items: [
      {
        icon: "treePine",
        title: "Hands-On Farm Learning",
        desc: "Animals, gardens, and open fields — learning that happens outdoors on a safe, peaceful ten-acre farm.",
      },
      {
        icon: "users",
        title: "Family-Style Classrooms",
        desc: "Multi-age, relationship-based learning with personalized mentorship and interest-led exploration.",
      },
      {
        icon: "heart",
        title: "Homeschool Community",
        desc: "Friday School, Co-Op, and enrichment days that complement what you're already doing at home.",
      },
      {
        icon: "sparkles",
        title: "Screen-Light Summers",
        desc: "Theme weeks, water days, and free play — camps that balance structure and wonder.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Ready to find the right program for your family at WonderHere Lakeland?",
    sidebarImage: "/images/stock/Homeschool3.jpg",
    eyebrow: "Get Started",
    heading: "Request Lakeland info & next steps.",
    description:
      "Tell us about your family and we'll reach out with program details and visit options. No commitment required.",
    submitLabel: "Submit Inquiry",
    disclaimer: "We'll respond within 48 hours with Lakeland program info and next steps.",
    successEmoji: "✓",
    successTitle: "Inquiry received!",
    successMessage:
      "We'll be in touch within 48 hours with program details and visit options.",
    programOptions: [
      { value: "schoolhouse", label: "Lakeland Schoolhouse" },
      { value: "friday-school", label: "Friday School" },
      { value: "co-op", label: "Homeschool Co-Op / Collective" },
      { value: "farm", label: "Farm Programs" },
      { value: "summer-camp", label: "Summer Camps" },
      { value: "unsure", label: "Not sure yet — help me decide" },
    ],
    studentFields: {
      namePlaceholder: "Child's Name",
      gradePlaceholder: "Select age/grade...",
      gradeOptions: [
        { value: "toddler", label: "Toddler (2–3)" },
        { value: "preschool", label: "Preschool (3–5)" },
        { value: "k-2", label: "K–2nd Grade" },
        { value: "3-5", label: "3rd–5th Grade" },
        { value: "6-8", label: "6th–8th Grade" },
        { value: "9-12", label: "9th–12th Grade" },
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Have questions about Lakeland programs?",
    subtitle:
      "Common questions families ask before scheduling a visit or requesting info.",
    items: [
      {
        q: "What ages do you serve at WonderHere Lakeland?",
        a: "WonderHere Lakeland serves a wide range of ages across our programs — from toddler farm experiences and preschool through elementary and homeschool enrichment. Contact us to find the best fit for your child's age and stage.",
      },
      {
        q: "How do I decide between the Schoolhouse and a Homeschool Program?",
        a: "The Schoolhouse is our small registered private school with full-day and half-day options. Homeschool programs like Friday School and Co-Op are designed for families who homeschool and want community, enrichment, and flexible scheduling. We're happy to help you explore both during a visit.",
      },
      {
        q: "What does a typical day on the farm look like?",
        a: "Days blend play-based learning, project time, farm and garden experiences, and free play outdoors. The rhythm balances structure with room for wonder — on our ten-acre farm with animals, gardens, and open fields.",
      },
      {
        q: "Is WonderHere Lakeland a registered private school?",
        a: "Yes — our Lakeland Schoolhouse operates as a registered private school offering full-day and half-day options in a family-style, play-based environment.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Wonder is for all",
    heading: "There's a place for your family",
    headingAccent: "at WonderHere Lakeland.",
    description:
      "Whether you're looking for a small private school, homeschool community, farm experiences, or unforgettable summer camps — we'd love to connect and help you find the right path.",
    primaryCta: "Get Lakeland Info & Next Steps",
    secondaryCta: "Schedule a Visit",
  },
  footer: {
    tagline: "Your one-stop shop for fun, meaningful learning in Lakeland, Florida.",
    links: ["Schoolhouse", "Homeschool", "Farm Programs", "Summer Camps", "FAQ", "Contact"],
    copyright: "© 2026 WonderHere Lakeland",
    poweredBy: "Website concept by MudKitchen",
  },
};
