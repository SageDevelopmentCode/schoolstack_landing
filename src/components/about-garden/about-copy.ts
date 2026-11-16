export const FOUNDER_PORTRAITS = {
  julius: {
    src: "/images/Julius (1).webp",
    name: "Julius Cecilia",
    role: "Co-founder",
    focus: "Software & product",
  },
  sabrina: {
    src: "/images/sabrina (1).webp",
    name: "Sabrina Obnamia",
    role: "Co-founder",
    focus: "School & operations",
  },
} as const;

export const AUDIENCE_CARDS = [
  {
    title: "Parents",
    description:
      "One place for forms, billing, updates, and day-to-day clarity — so families always know what’s next.",
  },
  {
    title: "Teachers",
    description:
      "Classroom tools and school communication without juggling separate apps for every task.",
  },
  {
    title: "Admins & founders",
    description:
      "Enrollment, tuition, records, and operations in one system built for small teams launching and growing a school.",
  },
] as const;

export const SAGE_FIELD_URL = "https://sagefield.co/";

/** /about hero. Words unchanged from the previous About page. */
export const ABOUT_HERO_COPY = {
  eyebrow: "About MudKitchen",
  headlineLead: "We didn't start with a software company.",
  headlineAccent: "We started with a school.",
  body: "MudKitchen is built by Julius Cecilia and Sabrina Obnamia — microschool founders who needed one connected system to open and run Sage Field in Round Rock, Texas.",
} as const;

/** In-page anchors (replace the old sticky "On this page" nav). */
export const ABOUT_SECTION_LINKS = [
  { id: "our-story", label: "Our story" },
  { id: "platform", label: "The platform" },
] as const;

/** "Our story" (shared by /about and /get-started). */
export const OUR_STORY_COPY = {
  heading: "Our story",
  opening: {
    before: "In May 2026, we founded ",
    linkText: "Sage Field Private Microschool",
    after: ", an outdoor-focused private microschool for children ages 4–11 in Round Rock, Texas.",
  },
  beforeBuild: [
    "Getting the school off the ground meant building more than a learning environment. We needed a website, an application and enrollment process, a way to manage tuition, tools for communicating with families, and systems to keep the school running. We needed all of it to work together, without stretching our startup budget.",
    "As a software engineer, Julius began looking for tools that could meet those needs. But the options we found were often difficult to use or hard to adapt to the way we wanted to run our school. Managing tuition and application flows felt more complicated than it needed to be, and our specific needs didn't always fit the systems available.",
  ],
  turn: "So we built our own.",
  afterBuild: [
    "Julius developed our website, parent portal, and mobile app, along with tools for applications, enrollment, tuition, and family communication. We built systems for marketing, tours, and shadow days, plus teacher dashboards, school administration, finances, and automations.",
    "This wasn't software built around a hypothetical school. It was software we used to open and operate our own—supporting the same families, teachers, and daily responsibilities we were managing ourselves.",
  ],
  stat: {
    number: "0 → 40",
    label: "enrolled students in our first three months",
    body: "The software helped support that growth by bringing the work of running our school into one connected system.",
  },
  closing: [
    "From the beginning, though, we were building with other microschools in mind. We wanted a product that could grow beyond Sage Field and help founders facing the same challenges: keeping costs manageable, welcoming new families, collecting tuition, supporting teachers, and making their systems fit their school—not the other way around.",
    "That's why we're building this company. We know what it takes to start a microschool because we're doing it ourselves. And we believe the software behind a school should make that work easier, leaving founders more time for the children, families, and communities they set out to serve.",
  ],
  ctas: {
    bookDemo: "Book a demo",
    scheduleDemo: "Schedule your demo",
    story: "Read the Sage Field story",
    storyHref: "/customers/sagefield",
    site: "Visit sagefield.co",
  },
} as const;

/** /get-started "Our story" header. Words unchanged. */
export const GET_STARTED_STORY_HEADER = {
  kicker: "Our story",
  headlineLead: "We didn't start with a software company.",
  headlineAccent: "We started with a school.",
  body: "MudKitchen is built by Julius Cecilia and Sabrina Obnamia — microschool founders who needed one connected system to open and run Sage Field in Round Rock, Texas.",
} as const;

/** /about "The platform". Words unchanged. */
export const PLATFORM_COPY = {
  eyebrow: "The platform",
  headlineLead: "One system for the people who",
  headlineAccent: "run a microschool.",
  body: "MudKitchen brings enrollment, tuition and billing, parent communication, student records, and daily school operations into one platform — built inside a real microschool to replace the patchwork of spreadsheets, form builders, and disconnected tools founders typically stitch together.",
  audienceHeading: "Who it's for",
  audienceBody:
    "Microschool founders, school administrators, and private school operators who need parents, teachers, and admins aligned in one system — whether you are launching a new program or running an established school.",
  includedHeading: "What's included",
  productCta: "See the product on the homepage",
  productHref: "/#product",
  bookCta: "Book a demo",
} as const;
