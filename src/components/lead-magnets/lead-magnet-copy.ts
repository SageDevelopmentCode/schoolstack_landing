/**
 * Copy for the marketing lead magnets: the custom preview offer, the lead popup and
 * "email me my plan". It describes a real service (we hand-build school previews with the
 * school-demo-builder workflow), so keep the promises in step with what we actually deliver.
 */

export const CUSTOM_DEMO_COPY = {
  pill: "🎨 Free custom preview",
  headlineLead: "See MudKitchen",
  headlineAccent: "built for your school.",
  note: "your logo, your colours",
  body: "Send us your school's website and we'll build you a private preview of MudKitchen with your logo, colours and programs, so you can picture it before you book a call.",
  includesTitle: "What's in your preview",
  includes: [
    "Your school website, redesigned with your branding",
    "The parent app your families would use",
    "The teacher portal your staff would use",
    "The admin portal you'd run your school from",
  ],
  promise: "Free, and in your inbox within 2 business days.",
  form: {
    title: "Build my preview",
    nameLabel: "First name",
    emailLabel: "Email",
    schoolLabel: "School name",
    websiteLabel: "School website",
    websitePlaceholder: "yourschool.com",
    websiteHelper: "We use it to pull in your logo, colours and programs.",
    noWebsiteHint: "No website yet? Book a demo instead and we'll show you around.",
    messageLabel: "What's the biggest headache right now?",
    messageOptional: "(optional)",
    messagePlaceholder: "Tuition reminders, enrollment forms, parent messages…",
    submit: "Build my preview",
    submitting: "Sending…",
    privacy: "We'll only use your email to send your preview and follow up about it.",
    errors: {
      name: "Please enter your first name.",
      email: "Please enter a valid email address.",
      school: "Please enter your school's name.",
      website: "Please enter your school's website, like yourschool.com.",
    },
  },
  success: {
    title: "You're on the list!",
    body: "We're building your preview now. Look for an email from us within 2 business days. A confirmation is on its way to your inbox.",
    bookLabel: "Or book a demo now",
  },
} as const;

export const GET_STARTED_CUSTOM_DEMO_COPY = {
  pill: "🎨 Not ready to book?",
  headlineLead: "Get a preview",
  headlineAccent: "of your school first.",
} as const;

export const LEAD_POPUP_COPY = {
  closeLabel: "Close",
  titleLead: "Want a free preview",
  titleAccent: "with your school's name on it?",
  body: "Send us your website and we'll build a private MudKitchen preview with your logo and colours. It's free, and it's in your inbox within 2 business days.",
  dismiss: "No thanks",
  /** Gift card variant: wording comes from GIFT_CARD_PAGE_COPY / GIFT_CARD_OFFER (the condition must stay in the main claim). */
  giftCard: {
    pill: "🎁 Before you go",
    cta: "Choose a time",
  },
} as const;

export const EMAIL_PLAN_COPY = {
  title: "Email me my results",
  body: "Get a copy in your inbox to come back to later. Your results stay right here either way.",
  nameLabel: "First name",
  nameOptional: "(optional)",
  emailLabel: "Email",
  submit: "Email my results",
  submitting: "Sending…",
  success: "Sent! Check your inbox.",
  privacy: "We'll send your results and may follow up once. No newsletter, no spam.",
  errors: {
    email: "Please enter a valid email address.",
  },
} as const;
