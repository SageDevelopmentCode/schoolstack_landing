import type { SchoolWebsiteDemoConfig } from "./types";
import { GATHERED_OAK_FARM_LOGO } from "./gathered-oak-farm-admin-demo";

export const gatheredOakFarmConfig: SchoolWebsiteDemoConfig = {
  slug: "gathered-oak-farm",
  schoolName: "Gathered Oak Farm",
  theme: {
    primary: "#29372B",
    primaryHover: "#4D6346",
    dark: "#29372B",
    darkHover: "#4D6346",
    lightBg: "#DCE5D4",
    lightBorder: "#CDD7C6",
    muted: "#5F665C",
    badgeBg: "rgba(77, 99, 70, 0.12)",
    accentText: "#A95136",
    pageBg: "#FCF9F2",
  },
  logo: GATHERED_OAK_FARM_LOGO,
  hero: {
    eyebrow: "Farm school in Fallbrook, California",
    eyebrowPlacement: "hero",
    headline: [
      "Learning rooted in wonder,",
      "nature, and community.",
    ],
    subheadline:
      "At Gathered Oak Farm, children learn through meaningful work, hands-on discovery, and real connection with the land, their peers, and the world around them.",
    primaryCta: "Plan a Visit",
    secondaryCta: "Explore Programs",
    secondaryCtaTarget: "programs",
    navCta: "Plan a Visit",
    navLinks: [
      "Our Approach",
      "Programs",
      "Farm Life",
      "Meet Gathered Oak",
      "Contact",
    ],
    backgroundImage: "/images/stock/Homeschool.jpg",
    floatingImages: [
      "/images/stock/Homeschool2.jpg",
      "/images/stock/Homeschool3.jpg",
    ],
    imageAlt: "Children exploring and learning on a farm with garden and animals",
    trustBadges: [
      "Kindergarten–8th Grade",
      "2.5-acre working farm",
      "Hands-on, mixed-age learning",
      "Fallbrook, CA",
    ],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "farmExperience",
    eyebrow: "The farm as classroom",
    heading: "The farm is not a backdrop. It is part of the curriculum.",
    subtitle:
      "Our 2,000-square-foot barn becomes an indoor classroom. Beyond it, children learn among the garden, oak grove, chickens, goats, pigs, and the changing seasons of the farm.",
    paths: [
      {
        title: "The barn classroom",
        desc: "A 2,000-square-foot barn for gathering, making, and small-group academics — a warm indoor space rooted in the rhythms of farm life.",
        icon: "bookOpen",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        title: "2.5 acres outdoors",
        desc: "The surrounding farm is the outdoor classroom — room to explore, discover, and connect with nature through every season.",
        icon: "treePine",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        title: "Animals & garden",
        desc: "Chickens, goats, pigs, and a working garden give children real, tactile contact with the living world around them.",
        icon: "sprout",
        image: "/images/stock/Homeschool3.jpg",
      },
      {
        title: "Mixed-age community",
        desc: "Self-directed, cooperative, and hands-on learning in a welcoming community of families who value meaningful childhood outdoors.",
        icon: "users",
        image: "/images/stock/ImageFour.jpg",
      },
    ],
  },
  stats: [
    { value: "K–8th", label: "Grade levels served" },
    { value: "2.5 acres", label: "Outdoor classroom" },
    { value: "2,000 sq ft", label: "Barn classroom" },
    { value: "Fallbrook", label: "California" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "A school with dirt under its fingernails",
    heading: "Where questions become projects and work becomes learning.",
    cards: [
      {
        title: "2.5 acres of outdoor classroom",
        desc: "Garden, oak grove, animals, and room to explore — the land is part of every child's learning experience.",
      },
      {
        title: "A barn for gathering and making",
        desc: "Indoor space for small-group academics, art, STEM, music, and the kinds of projects that grow from curiosity.",
      },
      {
        title: "Animals, garden, grove",
        desc: "Chickens, goats, pigs, and seasonal garden work — real contact with the living world, not a backdrop.",
      },
      {
        title: "Connection and belonging",
        desc: "Mixed-age, cooperative learning where children build relationships with one another, their teachers, and their place.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/ImageFour.jpg",
  },
  marquee: [
    "Farm School",
    "Hands-On Learning",
    "Mixed-Age",
    "Fallbrook",
    "Nature & Wonder",
    "Oak Grove",
    "Barn Classroom",
    "Community",
    "Plan a Visit",
    "K–8th Grade",
    "Garden & Animals",
    "Gathered Oak Farm",
  ],
  programs: {
    eyebrow: "Programs",
    heading: "Find a rhythm that fits your family.",
    subtitle:
      "Gathered Oak offers farm-school days, a multi-day academic and farm track, middle-school programming, and afternoon learning experiences. Program details shown from the current public site; confirm availability and current tuition with Gathered Oak.",
    ctaLabel: "Plan a Visit",
    items: [
      {
        badge: "K–5th grade",
        title: "Monday Farm School",
        teaser: "Mondays · 9:00 AM–1:00 PM",
        desc: "A full day of themed, hands-on learning on the farm — art, STEM, music, movement, and nature integrated through immersive farm experiences.",
        details: [
          "Kindergarten–5th grade",
          "Mondays, 9:00 AM–1:00 PM",
          "Optional afternoon electives",
          "Confirm current tuition",
        ],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#29372B]",
        accentBg: "bg-[#DCE5D4]",
      },
      {
        badge: "K–6th grade",
        title: "3-Day Academic + Farm Track",
        teaser: "Tuesday–Thursday",
        desc: "Small-group academics in the morning; farm learning in the afternoon. A rhythm that blends structured learning with hands-on outdoor exploration.",
        details: [
          "Kindergarten–6th grade",
          "Tue–Thu, academics 8:15–11:15 AM",
          "Farm school 11:15 AM–1:15 PM",
          "Confirm current tuition",
        ],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#4D6346]",
        accentBg: "bg-[#DCE5D4]",
      },
      {
        badge: "6th–8th grade",
        title: "Middle School",
        teaser: "Wednesdays · 9:00 AM–1:00 PM",
        desc: "Outdoor challenge, creative inquiry, collaboration, and community — resilience, problem-solving, science experiments, art projects, and team-building.",
        details: [
          "6th–8th grade",
          "Wednesdays, 9:00 AM–1:00 PM",
          "Meets in North Fallbrook",
          "Confirm current tuition",
        ],
        image: "/images/stock/ImageFour.jpg",
        accent: "text-[#A95136]",
        accentBg: "bg-[#DCE5D4]",
      },
      {
        badge: "TK–1st grade",
        title: "Junior Farm School",
        teaser: "Two afternoons each week",
        desc: "Early learning rooted in imagination, movement, and the natural world — a gentle introduction to farm-school rhythms for younger children.",
        details: [
          "TK–1st grade",
          "Mon/Wed or Tue/Thu, 1:30–3:00 PM",
          "Child must turn 4 by 9/1",
          "Confirm eligibility & tuition",
        ],
        image: "/images/stock/Homeschool3.jpg",
        accent: "text-[#4D6346]",
        accentBg: "bg-[#DCE5D4]",
      },
      {
        badge: "K–6th grade",
        title: "Afternoon Electives",
        teaser: "Monday–Thursday afternoons",
        desc: "A place to pursue new skills, interests, and creative work — discover art, STEM, music, movement, and nature through themed elective experiences.",
        details: [
          "Kindergarten–6th grade",
          "Mon 1:15–2:45 PM",
          "Tue–Thu 1:30–3:00 PM",
          "Programs from $490/semester",
        ],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#29372B]",
        accentBg: "bg-[#DCE5D4]",
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
      "We are deeply committed to building connection with each child",
      "and helping children form connection with one another.",
    ],
    attribution: "— Gathered Oak Farm",
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
    eyebrow: "A day at Gathered Oak",
    heading: "Rooted in a rhythm of",
    headingSub: "learning, work, play, and belonging.",
    steps: [
      {
        time: "Gather",
        activity: "Arrive and greet friends",
        desc: "Children arrive, greet friends, and start the day together — a gentle transition into the rhythms of farm school.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "Discover",
        activity: "Small-group learning and inquiry",
        desc: "Themed projects, inquiry, reading, making, and discussion — learning tailored to individual needs and interests.",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        time: "Step outside",
        activity: "Garden, animals, and nature",
        desc: "Garden work, animal care, nature observation, movement, and farm-based exploration — the outdoor classroom in action.",
        image: "/images/stock/Homeschool3.jpg",
      },
      {
        time: "Create & reflect",
        activity: "Art, STEM, and sharing",
        desc: "Art, STEM, music, collaboration, and time to share what was noticed or made — a glimpse of the kinds of experiences children may have.",
        image: "/images/stock/ImageFour.jpg",
      },
    ],
  },
  socialProof: {
    type: "testimonials",
    eyebrow: "A place to be known",
    heading: "What families experience here",
    subtitle:
      "Placeholder quotes for demo layout — replace with approved testimonials before launch.",
    items: [
      {
        quote:
          "Our children come home full of stories about the animals, the garden, and the friends they've made. Gathered Oak feels like a real community.",
        name: "Parent testimonial placeholder",
        detail: "Fallbrook · Monday Farm School",
        stars: 5,
        avatar: "/images/stock/ImageTen.jpg",
      },
      {
        quote:
          "The hands-on approach has helped our kids develop a genuine love for learning — not just facts, but connection with the world around them.",
        name: "Parent testimonial placeholder",
        detail: "Fallbrook · 3-Day Academic + Farm",
        stars: 5,
        avatar: "/images/stock/ImageSeven.jpg",
      },
      {
        quote:
          "We love that the farm isn't just a backdrop — it's part of how our children learn every single day.",
        name: "Parent testimonial placeholder",
        detail: "Fallbrook · Farm School Family",
        stars: 5,
        avatar: "/images/stock/ImageEight.jpg",
      },
    ],
  },
  founder: {
    eyebrow: "Meet Gathered Oak",
    heading: "Stewards of a gathering place",
    headingAccent: "for families.",
    paragraphs: [
      "Mindy and Nick Kinnier are the owners of Gathered Oak Farm. They are deeply committed to forging connection with each child who enters the program and helping children form connection with each other.",
      "Their 2.5-acre farm on Olive Hill Road in Fallbrook is a gathering place for a community of families who value meaningful childhood, shared learning, and time outdoors.",
    ],
    credentials: [
      "Farm school owners & educators",
      "2.5-acre working farm in Fallbrook",
      "Barn classroom & outdoor learning",
      "Mixed-age, hands-on community",
    ],
    quote:
      "Our farm is a gathering place for a community of families who value meaningful childhood, shared learning, and time outdoors.",
    quoteAttribution: "— Mindy and Nick Kinnier",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Owners", value: "GOF" },
    name: "Mindy and Nick Kinnier",
    title: "Owners, Gathered Oak Farm",
  },
  parallax: {
    eyebrow: "Farm life",
    heading: ["Wonder, connection,", "and hands-on learning."],
    subtitle:
      "Gathered Oak aims to cultivate a genuine love and affection for what is good, true, and beautiful — through immersive contact with the farm, teaching that inspires imagination, and a community where every child can belong.",
    primaryCta: "Plan a Visit",
    secondaryCta: "Explore Programs",
    backgroundImage: "/images/stock/Homeschool.jpg",
  },
  pillars: {
    eyebrow: "Our approach",
    heading: "Learning that lives in the body.",
    subtitle:
      "Three pillars that shape every program at Gathered Oak — tangible, grounded, and rooted in real experience.",
    items: [
      {
        icon: "leaf",
        title: "Wonder",
        desc: "We protect time for questions, imagination, beauty, and discovery — cultivating love for what is good, true, and beautiful.",
      },
      {
        icon: "users",
        title: "Connection",
        desc: "Children build relationships with one another, their teachers, their community, and their specific place in the world.",
      },
      {
        icon: "sprout",
        title: "Hands-on learning",
        desc: "Art, STEM, movement, music, farm work, and outdoor exploration turn learning into lived experience.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Come see what learning looks like on the farm. Share a little about your family and we'll follow up about programs and visit options.",
    sidebarImage: "/images/stock/Homeschool2.jpg",
    eyebrow: "Plan a Visit",
    heading: "Tell us about your family.",
    description:
      "Share your name, contact information, your child's grade or age, and which program interests you. We'll reach out to learn more about how Gathered Oak Farm might fit your family.",
    submitLabel: "Plan a Visit",
    disclaimer:
      "Gathered Oak Farm · Olive Hill Road, Fallbrook, CA 92028 · hello@gatheredoakfarm.com",
    trustNote:
      "Please do not include medical records or highly sensitive personal information in this form.",
    successEmoji: "✓",
    successTitle: "Message received!",
    successMessage:
      "Thank you for reaching out. We'll be in touch soon to discuss programs, schedules, and how to plan a visit to the farm.",
    programOptions: [
      { value: "monday-farm-school", label: "Monday Farm School (K–5)" },
      { value: "three-day-track", label: "3-Day Academic + Farm Track (K–6)" },
      { value: "middle-school", label: "Middle School (6th–8th)" },
      { value: "junior-farm-school", label: "Junior Farm School (TK–1)" },
      { value: "afternoon-electives", label: "Afternoon Electives (K–6)" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Child's Name",
      gradePlaceholder: "Select child's grade...",
      gradeOptions: [
        { value: "tk", label: "Transitional Kindergarten (TK)" },
        { value: "k", label: "Kindergarten" },
        { value: "1", label: "1st grade" },
        { value: "2-3", label: "Grades 2–3" },
        { value: "4-5", label: "Grades 4–5" },
        { value: "6-8", label: "Grades 6–8" },
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions families ask",
    subtitle:
      "New to Gathered Oak Farm? Here are the most common things families want to know before planning a visit.",
    items: [
      {
        q: "What programs does Gathered Oak offer?",
        a: "Gathered Oak offers Monday Farm School (K–5), a 3-day academic and farm track (K–6), middle school (6th–8th), Junior Farm School (TK–1), and afternoon electives (K–6). Program details and schedules are subject to change — confirm current offerings with Gathered Oak.",
      },
      {
        q: "What ages and grades do you serve?",
        a: "Programs span Kindergarten through 8th grade, with Junior Farm School for TK–1st grade. Middle school meets separately in North Fallbrook on Wednesdays.",
      },
      {
        q: "Where is Gathered Oak Farm located?",
        a: "The main farm is on Olive Hill Road in Fallbrook, CA 92028. The middle school program meets in North Fallbrook — confirm the current location when you inquire.",
      },
      {
        q: "What does a visit look like?",
        a: "Families are welcome to plan a visit to see the 2,000-square-foot barn classroom and 2.5-acre farm — including the garden, oak grove, and animals. Submit the form above and we'll coordinate a time.",
      },
      {
        q: "How do I confirm current tuition and availability?",
        a: "Program dates, availability, and tuition are subject to change. Reach out to hello@gatheredoakfarm.com or submit the inquiry form to confirm current offerings before enrolling.",
      },
      {
        q: "How can I reach Mindy and Nick?",
        a: "Email hello@gatheredoakfarm.com or use the inquiry form on this page. Follow @gatheredoakfarm on Instagram for community updates.",
      },
    ],
  },
  closingCta: {
    eyebrow: "Come see the farm",
    heading: "Come see what learning",
    headingAccent: "looks like on the farm.",
    description:
      "Reach out to learn more about current programs, schedules, and how Gathered Oak Farm might fit your family. Email hello@gatheredoakfarm.com.",
    primaryCta: "Plan a Visit",
    secondaryCta: "Explore Programs",
  },
  footer: {
    tagline:
      "Gathered Oak Farm · Olive Hill Road, Fallbrook, CA 92028 · hello@gatheredoakfarm.com",
    links: [
      "Our Approach",
      "Programs",
      "Farm Life",
      "Meet Gathered Oak",
      "Contact",
      "FAQ",
    ],
    copyright: "© 2026 Gathered Oak Farm",
    poweredBy: "Website concept by MudKitchen",
  },
};
