/**
 * Copy for the /home-N redesign options. Strings must stay identical to the
 * live home page sections so the options differ only in design.
 */

export const HERO_COPY = {
  badge: "Built for Microschools",
  headlineLead: "Everything your microschool needs,",
  headlineAccent: "all in one place.",
  body: "MudKitchen keeps parents, teachers, and administrators aligned with enrollment, communication, billing, and more\u2014so you can focus on what matters most: your students.",
  primaryCta: "Book a Demo",
  secondaryCta: "Try the product",
} as const;

export const PRODUCT_INTRO_COPY = {
  badge: "What is Mud Kitchen?",
  heading: "One system for the work of running a microschool.",
  bullets: [
    { title: "One place", body: "for the work your team touches every day." },
    { title: "Clearer experience", body: "for families from day one." },
    { title: "Less friction", body: "as your school grows." },
  ],
} as const;

export const PAIN_COPY = {
  eyebrow: "Too many tools",
  headlineLead: "When your school runs in five different places,",
  headlineAccent: "everything feels harder.",
  body: "Enrollment lives in a form builder. Parent updates happen in texts and email. Student details sit in spreadsheets. Important tasks depend on memory. Mud Kitchen pulls those moving pieces into one shared system, so your team always knows where things live and what needs attention next.",
  scatteredLabel: "Scattered today",
  unifiedLabel: "All in one shared system",
  cta: "Book a Demo",
} as const;

export const FAMILY_COPY = {
  eyebrow: "Family clarity",
  headlineLead: "Give families one clear place",
  headlineAccent: "to stay in the loop.",
  body: "Parents should not have to search through old emails, group chats, and scattered links just to understand what is happening this week. Mud Kitchen gives families a simpler experience for updates, forms, schedules, and the information they actually need \u2014 without adding more noise.",
  cta: "Book a Demo",
} as const;

export const ADMIN_COPY = {
  eyebrow: "Growing operations",
  headlineLead: "As enrollment grows, the",
  headlineAccent: "admin grows faster.",
  body: "The real challenge is not just adding students. It is keeping track of forms, reminders, onboarding, records, follow-ups, and the daily details that multiply as your school grows. Mud Kitchen helps small teams turn that repeating work into clearer workflows, so growth feels manageable instead of messy.",
  cta: "Book a Demo",
} as const;

export const TEACHER_COPY = {
  eyebrow: "For teachers",
  headlineLead: "Support teachers with a calmer,",
  headlineAccent: "more connected school day.",
  body: "When teachers can easily see what is happening, what has changed, and what students or families need, the whole day runs more smoothly. Mud Kitchen gives them a simple place to stay organized, communicate clearly, and spend more energy on teaching instead of tracking down details.",
  bullets: [
    "Keep schedules, notes, and student details in one place.",
    "Reduce back-and-forth with clearer team communication.",
    "Help teachers stay focused on students, not scattered admin.",
  ],
  cta: "Book a Demo",
} as const;

export const WORKFLOW_COPY = {
  badge: "Guided setup",
  headlineLead: "Get MudKitchen running",
  headlineAccent: "without starting over.",
  body: "New software usually creates more work before it saves any. We help move the important pieces over, set things up with you, and make the switch feel simple.",
  steps: [
    {
      number: "01",
      title: "Show us how your school runs now.",
      body: "We review your forms, spreadsheets, payments, and workflows so we can map the cleanest transition.",
    },
    {
      number: "02",
      title: "We build your setup inside MudKitchen.",
      body: "We organize the essentials, help migrate what matters, and get your school configured without making you start from zero.",
    },
    {
      number: "03",
      title: "Go live with support.",
      body: "We walk you through the system, answer questions, and help your team make the move with confidence.",
    },
  ],
  reassurance:
    "Designed for founder-led schools that want a better system, not a complicated implementation.",
  primaryCta: "Book a Demo",
  secondaryCta: "See how setup works",
  secondaryHref: "/get-started",
} as const;

export const PRICING_COPY = {
  eyebrow: "Built for growing microschools",
  headlineLead: "Start with what you need.",
  headlineAccent: "Grow when you\u2019re ready.",
  body: "Everything you need to launch and run your microschool in one calm, connected system \u2014 from enrollment and billing to parent communication and daily operations.",
  planLabel: "Core plan",
  planBody: "For microschools that want a simpler way to run school.",
  features: [
    "Branded school website",
    "Enrollment and registration workflows",
    "Parent portal, forms, and billing",
    "Student records and family information",
    "Tuition, fees, and Stripe payments",
    "Admin tools for daily operations",
    "Guided setup and support",
  ],
  cta: "Book a Demo",
  ctaNote: "See if it\u2019s the right fit for your school.",
  customQuestion: "Need advanced workflows or a larger-school setup?",
  customBody: "We also offer tailored configurations for growing teams.",
  customCta: "Talk About Your School",
} as const;

export const STORY_COPY = {
  badge: "Customer story",
  location: "Sage Field \u00b7 Round Rock, TX",
  headlineLead: "From 0 to 35 students",
  headlineAccent: "in under 3 months.",
  body: "Sage Field is an outdoor-focused private microschool in Round Rock, Texas. MudKitchen powered their entire launch \u2014 website, enrollment, tuition, staff workflows, family communication, and back-office operations \u2014 all from one platform, from day one.",
  quote:
    "MudKitchen handled everything from enrollment to tuition so we could focus on the kids. I don\u2019t know how we would have launched without it.",
  author: {
    name: "Sabrina Obnamia",
    title: "Co-Founder, Sage Field",
    image: "/images/sabrina-obnamia.png",
  },
  school: {
    name: "Sage Field",
    location: "Round Rock, TX",
    logo: "/images/SageFieldLogo.png",
    url: "mudkitchen.com/customers/sagefield",
  },
  cta: "Read the case study",
  href: "/customers/sagefield",
  stats: [
    { number: "35", label: "Students enrolled" },
    { number: "< 3 mo", label: "To launch" },
    { number: "1", label: "Unified platform" },
  ],
  insideLabel: "Inside the case study",
  sections: [
    "The challenge",
    "Timeline",
    "Outcomes \u2014 Parent / Teacher / Admin",
    "Before & After",
    "Why it worked",
  ],
} as const;

export const CUSTOM_COPY = {
  headlineLead: "Need something specific?",
  headlineAccent: "We build custom, too.",
  body: "Microschools don\u2019t all run the same way. Some need a simple launch setup. Others need tour booking, custom tuition logic, complex forms, parent workflows, or internal operations tailored to their model. Start with a proven stack, then extend from there.",
  tags: [
    "Custom enrollment flows",
    "Multi-location support",
    "SMS integrations",
    "Attendance tracking",
    "Custom reporting",
    "Google Calendar sync",
    "Custom tuition structures",
    "White-label branding",
    "CRM integrations",
    "Volunteer management",
    "Learning plan tools",
    "Any workflow you need",
  ],
  cta: "Tell us what you need",
} as const;
