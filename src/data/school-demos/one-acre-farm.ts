import type { SchoolWebsiteDemoConfig } from "./types";
import { ONE_ACRE_FARM_ADMIN_LOGO } from "./oneacrefarm-admin-demo";

export const oneAcreFarmConfig: SchoolWebsiteDemoConfig = {
  slug: "one-acre-farm",
  schoolName: "One Acre Farm Educational Foundation",
  theme: {
    primary: "#5B7A4A",
    primaryHover: "#4A6340",
    dark: "#4A3F35",
    darkHover: "#3D3329",
    lightBg: "#F5F0E6",
    lightBorder: "#E8DFD0",
    muted: "#6B6560",
    badgeBg: "rgba(91, 122, 74, 0.12)",
    accentText: "#7A5C3E",
    pageBg: "#FBF9F4",
  },
  logo: ONE_ACRE_FARM_ADMIN_LOGO,
  hero: {
    eyebrow: "Porter, TX · Ages 4–10 · Farm School Learning Pods",
    eyebrowPlacement: "announcementBar",
    headline: ["Encouraging potential", "through horses and farming."],
    subheadline:
      "One Acre Farm is a small nonprofit educational farm providing outdoor activities, classes, and workshops for children, youth, scouts, and homeschoolers — inclusive of neurotypical children and children with autism or other special needs.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Explore Programs",
    secondaryCtaTarget: "signature",
    navCta: "Schedule a Tour",
    navLinks: ["Programs", "Our Story", "Activities", "FAQ"],
    backgroundImage: "/images/demo/one-acre-farm/curious-turkey.jpg",
    floatingImages: ["/images/stock/Homeschool2.jpg", "/images/stock/Homeschool3.jpg"],
    imageAlt: "Children learning and exploring on a small educational farm",
    trustBadges: [
      "501(c)(3) Nonprofit",
      "Inclusive Programming",
      "Horse Boy Certified",
      "Est. 1998",
    ],
  },
  sections: {
    showMosaic: false,
  },
  signatureSection: {
    type: "farmExperience",
    eyebrow: "Programs at the Farm",
    heading: "Outdoor learning for every child",
    subtitle:
      "From Farm School learning pods to monthly activities and specialized autism support — every program is rooted in hands-on farm experiences and inclusive community.",
    paths: [
      {
        title: "Early Childhood Farm School",
        desc: "Ages 4–7 · Mon–Thu 8am–1pm. Half-day learning pod blending Montessori curriculum indoors with outdoor farm work — collecting eggs, watering gardens, and feeding goats.",
        icon: "bookOpen",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        title: "Elementary Farm School",
        desc: "Ages 7–10 · Wed–Thu 8am–1pm. Outdoor community building, interactive lessons in animal husbandry and gardening, farm chores, and nature journaling.",
        icon: "treePine",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        title: "Monthly Activities",
        desc: "Kids Art & Play, Storytime at the Farm, and Sensory Saturday — monthly outdoor play and animal interactions for families to explore together.",
        icon: "sparkles",
        image: "/images/stock/Homeschool3.jpg",
      },
      {
        title: "Strides Autism Program",
        desc: "Horse Boy Method and Movement Method sessions for children with autism — donation-funded therapeutic and recreational activities in an outdoor 'yes' environment.",
        icon: "heart",
        image: "/images/stock/ImageFour.jpg",
      },
    ],
  },
  stats: [
    { value: "Ages 4–10", label: "Farm School Learning Pods" },
    { value: "Porter, TX", label: "~35 mi North of Houston" },
    { value: "Est. 1998", label: "Family Homestead" },
    { value: "501(c)(3)", label: "Educational Foundation" },
  ],
  welcome: {
    type: "parentFit",
    eyebrow: "A Farm Where Every Child Belongs",
    heading: "Outdoor learning, real farm work, and room to get dirty.",
    cards: [
      {
        title: "Inclusive for all children",
        desc: "Programs welcome neurotypical children and children with autism or other special needs — everyone belongs here.",
      },
      {
        title: "Montessori early childhood",
        desc: "Indoor schoolhouse with uninterrupted work cycles, plus outdoor learning that bridges academics to the farm.",
      },
      {
        title: "Real farm experiences",
        desc: "Children rotate through farm roles — collecting eggs, caring for animals, gardening, and building outdoor skills.",
      },
      {
        title: "Small nonprofit homestead",
        desc: "A family-run educational farm established in 1998, serving Porter and the greater Houston area.",
      },
    ],
    mainImage: "/images/stock/Homeschool2.jpg",
    secondaryImage: "/images/stock/ImageFour.jpg",
  },
  marquee: [
    "Farm School",
    "Outdoor Learning",
    "Horse Boy Method",
    "Movement Method",
    "Porter TX",
    "Inclusive",
    "Montessori",
    "Nonprofit",
    "Kids Art & Play",
    "Storytime",
    "Sensory Saturday",
    "Strides Autism",
  ],
  programs: {
    eyebrow: "Farm School Programs",
    heading: "Learning pods and activities",
    subtitle: "Click each option to explore schedules, tuition, and enrollment details.",
    ctaLabel: "Learn More",
    items: [
      {
        badge: "Ages 4–7",
        title: "Early Childhood Farm School",
        teaser: "Mon–Thu 8am–1pm · Montessori + outdoor farm work",
        desc: "A half-day learning pod blending Montessori curriculum in the indoor schoolhouse with outdoor farm work. Children rotate through roles like collecting eggs, watering gardens, and feeding goats while bridging academics to real farm experiences.",
        details: ["Ages 4–7", "Mon–Thu", "4 days: $625/mo", "2 days: $325/mo"],
        image: "/images/stock/Homeschool2.jpg",
        accent: "text-[#5B7A4A]",
        accentBg: "bg-[#F5F0E6]",
      },
      {
        badge: "Ages 7–10",
        title: "Elementary Farm School",
        teaser: "Wed–Thu 8am–1pm · Outdoor lessons & farm chores",
        desc: "Outdoor community building, interactive lessons in animal husbandry, beekeeping, and gardening, plus farm chores and nature journaling. Children apply new skills hands-on and grow toward independent execution.",
        details: ["Ages 7–10", "Wed–Thu", "2 days: $325/mo", "1 day: $180/mo"],
        image: "/images/stock/Homeschool.jpg",
        accent: "text-[#7A5C3E]",
        accentBg: "bg-[#F5F0E6]",
      },
      {
        badge: "Monthly",
        title: "Kids Art & Play · Storytime · Sensory Saturday",
        teaser: "Outdoor play and animal interactions for families",
        desc: "Monthly activities with mud kitchen, dig garden, balance trails, and animal pens. Kids Art & Play ($10) and Storytime ($5) are inclusive; Sensory Saturday ($10) is exclusive to families of children with autism.",
        details: ["Ages 1–6", "Monthly Events", "$5–$10/child", "Parents Free"],
        image: "/images/stock/Homeschool3.jpg",
        accent: "text-[#5B7A4A]",
        accentBg: "bg-[#F5F0E6]",
      },
      {
        badge: "Nonprofit",
        title: "Strides Autism Program",
        teaser: "Horse Boy & Movement Method sessions",
        desc: "Specialized outdoor programs for families of children with autism — equine therapy, movement-based learning, and individualized sessions. Scholarships and donations help keep services accessible.",
        details: ["Ages Vary", "By Application", "Scholarships Available", "Donation-Funded"],
        image: "/images/stock/ImageFour.jpg",
        accent: "text-[#7A5C3E]",
        accentBg: "bg-[#F5F0E6]",
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
      "At One Acre Farm, we believe children need to be outside",
      "and moving around — getting dirty is part of learning.",
    ],
    attribution: "— One Acre Farm Educational Foundation",
    backgroundImage: "/images/stock/ImageNine.jpg",
  },
  stripImages: [
    "/images/stock/ImageEleven.jpg",
    "/images/stock/ImageTwelve.jpg",
    "/images/stock/ImageThirteen.jpg",
    "/images/stock/ImageFourteen.jpg",
    "/images/stock/Homeschool.jpg",
    "/images/stock/Homeschool2.jpg",
  ],
  timeline: {
    eyebrow: "A Day at Farm School",
    heading: "Outdoor learning,",
    headingSub: "farm chores, and Montessori work.",
    steps: [
      {
        time: "8:00–8:30",
        activity: "Arrive & Farm Greeting",
        desc: "Children arrive, settle in, and begin the day with outdoor exploration in the covered classroom.",
        image: "/images/stock/ImageEleven.jpg",
      },
      {
        time: "8:30–10:30",
        activity: "Outdoor Learning Time",
        desc: "Farm work rotations — collecting eggs, watering gardens, feeding goats — with individual activities bridging lessons to the farm.",
        image: "/images/stock/Homeschool2.jpg",
      },
      {
        time: "10:30–12:30",
        activity: "Montessori Work Cycle",
        desc: "Uninterrupted indoor work cycle in the schoolhouse — children choose work, receive lessons, and progress at their own pace.",
        image: "/images/stock/Homeschool.jpg",
      },
      {
        time: "12:30–1:00",
        activity: "Closing & Reflection",
        desc: "Wrap up the day with community care, outdoor tidy, and preparation to head home.",
        image: "/images/stock/Homeschool3.jpg",
      },
    ],
  },
  socialProof: {
    type: "trust",
    eyebrow: "Trust & Mission",
    heading: "A nonprofit farm built on inclusion and outdoor education",
    subtitle:
      "Certified in The Horse Boy Method and Movement Method, serving families in Porter and the greater Houston area since 1998.",
    items: [
      {
        title: "Horse Boy Certified",
        desc: "1 Star Apprentices and Mentors of The Horse Boy Method and Movement Method since 2016.",
        icon: "shield",
      },
      {
        title: "Inclusive Programming",
        desc: "All child and youth activities welcome neurotypical children and children with autism or special needs.",
        icon: "heart",
      },
      {
        title: "Donation-Funded Autism Support",
        desc: "Strides Autism Program strives to offer services free of charge through scholarships and community donations.",
        icon: "graduationCap",
      },
    ],
  },
  founder: {
    eyebrow: "The Dynamite Duo",
    heading: "Catherine Griffin & Nicole Jones",
    headingAccent: "Educators and farmgirls on a mission.",
    paragraphs: [
      "Catherine Griffin is the owner and founder of One Acre Farm and co-founder of the Strides Autism Therapy Program. A Texas-certified elementary teacher with 18 years of homeschool education experience, she is a certified trainer and provider of The Horse Boy Method and Movement Method.",
      "Nicole Jones is co-founder of Strides Autism Therapy Program, a certified Montessori teacher, and a 1 Star Apprentice in Horse Boy Method & Movement Method. Together, they encourage others' potential through horses and farming.",
    ],
    credentials: [
      "Texas Certified Elementary Teacher",
      "Certified Montessori Teacher",
      "Horse Boy & Movement Method Trainers",
      "Porter, TX · Est. 1998",
    ],
    quote:
      "We believe children need to be outside and moving around — experiencing farm routines, getting dirty, and learning through play.",
    quoteAttribution: "— Catherine & Nicole",
    image: "/images/stock/ImageTen.jpg",
    imageBadge: { label: "Location", value: "Porter, TX" },
    name: "Catherine & Nicole",
    title: "Founders, One Acre Farm Educational Foundation",
  },
  parallax: {
    eyebrow: "Why One Acre Farm?",
    heading: ["Outside.", "Moving.", "Learning."],
    subtitle:
      "A small nonprofit educational farm where childhood curiosity meets real farm work, Montessori learning, and inclusive support for every child.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Donate to Strides",
    backgroundImage: "/images/stock/Homeschool.jpg",
  },
  pillars: {
    eyebrow: "What Makes Us Different",
    heading: "Farm, Montessori, and inclusive support.",
    subtitle:
      "Three pillars woven into every program — outdoor farm education, child-centered Montessori learning, and specialized autism support.",
    items: [
      {
        icon: "treePine",
        title: "Outdoor Farm Learning",
        desc: "Real farm chores, animal care, and nature-based activities that build responsibility, empathy, and work ethic.",
      },
      {
        icon: "bookOpen",
        title: "Montessori Early Childhood",
        desc: "Individualized curriculum with uninterrupted work cycles — children master concepts before moving on.",
      },
      {
        icon: "heart",
        title: "Inclusive for All Children",
        desc: "Programs welcome neurotypical children and children with autism or other special needs.",
      },
      {
        icon: "users",
        title: "Small Nonprofit Community",
        desc: "A family homestead serving ~150 children a month through Farm School, activities, and autism therapy.",
      },
    ],
  },
  form: {
    sidebarQuote:
      "Interested in Farm School? Schedule a tour to see our classroom and meet our lead teachers.",
    sidebarImage: "/images/stock/Homeschool2.jpg",
    eyebrow: "Farm School Tour Application",
    heading: "Schedule a tour.",
    description:
      "Tours take place Mon–Thu between 1:00–2:30pm and typically last 30 minutes. Please bring your child if possible. We'll reach out after you submit to confirm a date.",
    submitLabel: "Submit Tour Application",
    disclaimer:
      "We'll respond after school hours. Nicole: 713-277-8860 · Catherine: 832-860-4756",
    trustNote: "No spam. Just a personal reply from our team.",
    successEmoji: "✓",
    successTitle: "Tour application received!",
    successMessage:
      "Thank you for your interest in One Acre Farm. We'll reach out to schedule your tour and answer any questions.",
    programOptions: [
      { value: "early-childhood", label: "Early Childhood Farm School (Ages 4–7)" },
      { value: "elementary", label: "Elementary Farm School (Ages 7–10)" },
      { value: "activities", label: "Kids Art & Play / Storytime / Sensory Saturday" },
      { value: "strides", label: "Strides Autism Program" },
      { value: "unsure", label: "Not sure yet — let's talk" },
    ],
    studentFields: {
      namePlaceholder: "Child's Name",
      gradePlaceholder: "Select program...",
      gradeOptions: [
        { value: "early-childhood", label: "Early Childhood (Ages 4–7)" },
        { value: "elementary", label: "Elementary (Ages 7–10)" },
        { value: "activities", label: "Monthly Activities" },
        { value: "strides", label: "Strides Autism Program" },
      ],
    },
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions families ask",
    subtitle:
      "Common questions about our farm programs, what to expect, and how to visit.",
    items: [
      {
        q: "Is One Acre Farm really one acre?",
        a: "Kinda! Our family purchased a home on one acre in 1998. We later added two adjoining acres. The garden, orchard, and farm animals are on the acre between the two homes — so yes, it kinda is on one acre.",
      },
      {
        q: "Is the farm open to the public?",
        a: "The farm is NOT open to the public. It is open only for Farm School, planned events, and registered activities.",
      },
      {
        q: "What should we wear for a tour or class?",
        a: "Definitely wear close-toed shoes — flip flops are not a good choice. Wear clothes that can get dirty. Consider sunscreen, bug spray, and bringing a water bottle.",
      },
      {
        q: "Are programs free for children with special needs?",
        a: "Only the Strides Autism Program and special-needs programs are offered free of charge when scholarships are available. Farm School and monthly activities have tuition or event fees.",
      },
      {
        q: "What is the enrollment process for Farm School?",
        a: "Step 1: Fill out a tour application. Step 2: Attend your tour with your child. Step 3: Submit enrollment application with fee. Step 4: Staff contacts you regarding acceptance. Step 5: Pay security deposit if accepted.",
      },
      {
        q: "What animals are on the farm?",
        a: "We keep chickens, turkeys, rabbits, goats, horses, ducks, cats, and dogs. Animal counts fluctuate with births, acquisitions, and sales throughout the year.",
      },
      {
        q: "What is the Strides Autism Program?",
        a: "Strides provides Horse Boy Method and Movement Method sessions for children with autism — individualized outdoor therapeutic activities utilizing horses and farm animals. Sessions are donation-funded when scholarships are available.",
      },
      {
        q: "How can I support the farm?",
        a: "Donations to One Acre Farm Educational Foundation help fund Strides Autism Program scholarships, animal care, equipment, and operating costs. Our goose does not lay golden eggs — we need your help!",
      },
    ],
  },
  closingCta: {
    eyebrow: "Farm School Enrollment",
    heading: "Ready to see if One Acre Farm",
    headingAccent: "is the right fit?",
    description:
      "Schedule a tour to visit our classroom, meet our lead teachers, and learn about Farm School learning pods and monthly activities.",
    primaryCta: "Schedule a Tour",
    secondaryCta: "Donate to Strides",
  },
  footer: {
    tagline: "Nonprofit educational farm · Porter, TX",
    links: ["Programs", "Our Story", "Activities", "FAQ", "Contact"],
    copyright: "© 2026 One Acre Farm Educational Foundation",
    poweredBy: "Website concept by MudKitchen",
  },
};
