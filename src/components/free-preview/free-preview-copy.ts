/**
 * Copy for /free-preview, the ad landing page for the custom preview offer. It describes a
 * real, hand-delivered service: keep it in step with CUSTOM_DEMO_COPY and with what we
 * actually build (website, parent app, teacher portal and admin portal in the school's branding, within
 * 2 business days).
 */

export const FREE_PREVIEW_PAGE_PATH = "/free-preview";
export const FREE_PREVIEW_FORM_ID = "free-preview-form";

export const FREE_PREVIEW_COPY = {
  meta: {
    title: "See MudKitchen Built for Your School — Free Preview",
    description:
      "Send us your school's website and we'll build a free, private preview of MudKitchen with your logo, colours and programs: your website, parent app, teacher portal and admin portal, within 2 business days.",
  },
  headerCta: "Get my free preview",
  headerCtaShort: "Free preview",
  hero: {
    pill: "🎨 Free custom preview",
    lead: "See MudKitchen",
    accent: "built for your school.",
    body: "Send us your school's website. We'll build you a private preview of MudKitchen with your logo, colours and programs, so you can see exactly how it would look for your families before you ever book a call.",
    ticks: ["Free, no strings attached", "Private link, just for you", "In your inbox within 2 business days"],
    note: "takes about a minute",
    formTitle: "Build my preview",
  },
  whatYouGet: {
    pill: "🧺 What's in your preview",
    lead: "Four things,",
    accent: "all with your name on them.",
    body: "Your preview is the real MudKitchen product, dressed in your school's branding. Click around it like you already run your school on it.",
    hint: "pick a card →",
    interactiveNote: "psst — it's interactive. click around!",
    cards: [
      {
        title: "Your school website",
        hint: "Programs, tuition, apply",
        emoji: "🌐",
        body: "Your programs, tuition and enrollment pages, redesigned in your colours, with an application families can actually finish.",
        demo: "website",
        tint: "bg-[var(--sf-sky)]",
      },
      {
        title: "Your parent app",
        hint: "What families see",
        emoji: "🏡",
        body: "What your families would see: tuition, messages, calendar, forms and photos, all under your school's name.",
        demo: "parent",
        tint: "bg-[var(--sf-mint)]",
      },
      {
        title: "Your teacher portal",
        hint: "What your staff use",
        emoji: "🍎",
        body: "What your teachers would use every day: roll call, their class, messages to families and their hours.",
        demo: "teacher",
        tint: "bg-[var(--sf-butter)]",
      },
      {
        title: "Your admin portal",
        hint: "Where you run it all",
        emoji: "🗂️",
        body: "Where you'd run the school from: enrollment, billing, attendance and staff, in one place instead of nine tabs.",
        demo: "admin",
        tint: "bg-[var(--sf-peach)]",
      },
    ],
  },
  steps: {
    pill: "🌱 How it works",
    lead: "Three steps.",
    accent: "We do the heavy lifting.",
    items: [
      { n: "01", title: "Send your website", body: "Fill in the form with your name, email and your school's website. That's it." },
      {
        n: "02",
        title: "We build your preview",
        body: "We pull in your logo, colours and programs and set up your website, parent app, teacher portal and admin portal. It takes us up to 2 business days.",
      },
      {
        n: "03",
        title: "Click around, no pressure",
        body: "We email you a private link. Explore it on your own time, and book a call only if you'd like to talk it through.",
      },
    ],
  },
  faq: {
    copy: {
      eyebrow: "Free preview FAQ",
      heading: "Questions before you send it",
      sub: "The short answers. Anything else, just reply to the email we send you.",
    },
    items: [
      {
        question: "Is the preview really free?",
        answer: "Yes. There's no cost and no credit card. We build it because seeing your own school in MudKitchen explains it better than any feature list.",
      },
      {
        question: "Do I have to book a call?",
        answer: "No. We'll send you a private link and you can explore it on your own. If you want to talk it through, you can book a time from the preview whenever you like.",
      },
      {
        question: "How long does it take?",
        answer: "Within 2 business days of your request. We build each one by hand, so we'll email you as soon as yours is ready.",
      },
      {
        question: "Who can see my preview?",
        answer: "Only people you share the link with. It isn't listed anywhere or shown in search results.",
      },
      {
        question: "What if my school doesn't have a website yet?",
        answer: "No problem. Book a demo instead and we'll walk you through MudKitchen live, including how we'd set up your website.",
      },
      {
        question: "What happens after I see it?",
        answer: "Nothing, unless you want it to. If you'd like to move forward, we'll help you set everything up with your real school information.",
      },
    ],
  },
  closing: {
    pill: "🎨 Ready when you are",
    lead: "Your school, your colours,",
    accent: "in 2 business days.",
    body: "Send us your website and we'll take it from there.",
    altLead: "No website yet, or want to talk now?",
    altCta: "Book a demo instead",
  },
  footer: {
    privacy: "Privacy",
    terms: "Terms",
    home: "trymudkitchen.com",
  },
} as const;
