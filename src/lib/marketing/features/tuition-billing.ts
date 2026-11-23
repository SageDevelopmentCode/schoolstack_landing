import { CreditCard } from "lucide-react";
import type { Feature, Source } from "./types";

/** Research and sources: docs/features-research/tuition-billing.md */

const QUICKBOOKS: Source = {
  label: "Intuit QuickBooks, 2025 US Small Business Late Payments Report",
  url: "https://quickbooks.intuit.com/r/small-business-data/small-business-late-payments-report-2025/",
  year: "2025",
};
const NMC: Source = {
  label: "National Microschooling Center, American Microschools: A Sector Analysis",
  url: "https://microschoolingcenter.org/news-blog/2025-american-microschools-sector-analysis",
  year: "2025",
};
const EDCHOICE: Source = { label: "EdChoice, The State of Microschooling", url: "https://www.edchoice.org/the-state-of-microschooling/", year: "2025" };
const BW_BILLING: Source = { label: "Brightwheel: billing", url: "https://mybrightwheel.com/features/billing" };
const BW_SETTINGS: Source = {
  label: "Brightwheel help: customize your billing settings",
  url: "https://help.mybrightwheel.com/en/articles/5599596-customize-your-billing-experience-in-settings",
};
const BW_FEES: Source = {
  label: "Brightwheel help: service fees for payers",
  url: "https://help.mybrightwheel.com/en/articles/12805195-why-am-i-being-charged-service-fees-for-payers",
};
const PG_BILLING: Source = { label: "Playground: billing", url: "https://www.tryplayground.com/solutions/billing" };
const PG_SETTINGS: Source = { label: "Playground help: configure billing settings", url: "https://help.tryplayground.com/en/articles/6267221-configure-billing-settings" };
const TC_ONESPOT: Source = {
  label: "Transparent Classroom help: Onespot partnership",
  url: "https://transparent-classroom.helpscoutdocs.com/article/452-onespot-transparent-classroom-partnership",
};
const ONESPOT_FEES: Source = { label: "Onespot help: payments fee structure", url: "https://onespot.helpscoutdocs.com/article/69-stripe-onespot-payments-fee-structure" };

export const tuitionBilling: Feature = {
  slug: "tuition-billing",
  name: "Tuition & billing",
  icon: CreditCard,
  tint: "butter",
  oneLiner: "Tuition plans, autopay and reminders, connected to enrollment.",
  roles: ["admin", "family"],
  roleLines: {
    admin: "Set tuition once, add discounts, and see who's paid in one ledger.",
    family: "See your balance, pay by card or bank, and turn on autopay.",
  },
  platforms: { web: true, mobile: true },
  seo: {
    title: "Tuition billing & autopay for microschools",
    description:
      "Set tuition plans, discounts and late fees once. Families pay by card or bank, use autopay and get email reminders, through your own Stripe account.",
  },
  hero: {
    lead: "Stop chasing tuition",
    accent: "through Venmo and Zelle.",
    body: "Set rates, discounts and schedules once. Families pay by card or bank, turn on autopay, and get email reminders before each due date. You see who's paid in one ledger.",
  },
  shots: [],
  heroShots: {},
  capabilities: {
    admin: [
      { title: "Set up tuition once", body: "Program tiers, rates, payment options and fees in one guided setup. Newly enrolled students sync in from admissions." },
      { title: "Discounts with a reason", body: "Give a % or $ discount for a scholarship or staff family, each with a reason. Sibling rules apply automatically." },
      { title: "Split between guardians", body: "Each guardian gets separate charges for their share, so two households each pay their own part." },
      { title: "Late fees, if you want", body: "Off by default. Charge a late fee automatically after grace days, once or each month until paid." },
      { title: "Every payment, one ledger", body: "Online, autopay and recorded cash or check payments together, with revenue this month, this year and by source." },
      { title: "Refunds and waivers", body: "Refund a tuition payment or waive a charge without leaving MudKitchen." },
    ],
    family: [
      { title: "Pay from your phone", body: "See your balance and pay by card or bank in the MudKitchen app on iPhone and Android, or any browser." },
      { title: "Turn on autopay", body: "Save a card or bank account, and each scheduled tuition payment runs on its due date." },
      { title: "Know what's coming", body: "Upcoming charges, payment history and receipts in one place, plus email reminders before each due date." },
      { title: "Pay ahead", body: "Pay a different amount or a lump sum, and your remaining installments recalculate automatically." },
      { title: "Fees shown first", body: "Any processing fee is shown before you pay." },
      { title: "Sign your agreement", body: "Read and sign your tuition agreement from the billing tab." },
    ],
  },
  useCases: [
    {
      title: "The first of the month",
      scenario: "Tuition is due for every family on the same day.",
      outcome: "Autopay families pay on the due date, the rest got an email reminder days before, and the founder checks Transactions to see who still needs a nudge.",
    },
    {
      title: "A scholarship mid-year",
      scenario: "In January a family qualifies for a 25% scholarship.",
      outcome: "The founder adds a % discount with the reason Scholarship, and the family's billing tab shows the new amounts.",
    },
    {
      title: "Two households, one student",
      scenario: "Separated parents share tuition for their son.",
      outcome: "The founder splits billing between guardians, and each parent gets their own charges and pays from their own login.",
    },
    {
      title: "A check in the mail",
      scenario: "A grandparent mails a check for spring tuition.",
      outcome: "The founder records it as a manual payment, so the family's balance and the school's revenue stay right.",
    },
  ],
  evidence: [
    { stat: "56%", claim: "of small businesses are owed money from unpaid invoices, averaging $17.5K each.", source: QUICKBOOKS },
    { stat: "65%", claim: "of microschools offer sliding-scale tuition or discounts, so every family's bill can be different.", source: NMC },
    { stat: "75%", claim: "of microschool leaders named funding sources as their top need.", source: EDCHOICE },
  ],
  toolStack: {
    names: ["Venmo", "Zelle", "Google Sheets", "QuickBooks"],
    logos: ["/images/competitors/Venmo.png", "/images/competitors/GoogleSheets.png"],
  },
  comparison: [
    {
      label: "Autopay on card or bank",
      mudkitchen: { value: "Yes", mark: "yes" },
      toolStack: { value: "Families send it by hand", mark: "no" },
      rivals: {
        brightwheel: { value: "Yes, can be required", mark: "yes", source: BW_SETTINGS },
        playground: { value: "Yes, can be required", mark: "yes", source: PG_SETTINGS },
        "transparent-classroom": { value: "Through Onespot, a separate vendor", mark: "partial", source: TC_ONESPOT },
      },
    },
    {
      label: "Reminders before the due date",
      mudkitchen: { value: "Email, 3 days before by default", mark: "yes" },
      toolStack: { value: "Texts you send yourself", mark: "no" },
      rivals: {
        brightwheel: { value: "Automated payment reminders", mark: "yes", source: BW_BILLING },
        playground: { value: "Statement email before the due date", mark: "yes", source: PG_SETTINGS },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_ONESPOT },
      },
    },
    {
      label: "Processing fees",
      mudkitchen: { value: "Shown before the family pays", mark: "yes" },
      toolStack: { value: "Venmo business fees; Zelle has no buyer protection", mark: "partial" },
      rivals: {
        brightwheel: { value: "Can be passed to payers; card rate not published", mark: "partial", source: BW_FEES },
        playground: { value: "School picks who pays; rates not published", mark: "partial", source: PG_SETTINGS },
        "transparent-classroom": { value: "Stripe fees plus Onespot's 0.3%", mark: "partial", source: ONESPOT_FEES },
      },
    },
    {
      label: "Automatic late tuition fees",
      mudkitchen: { value: "Optional, after grace days", mark: "yes" },
      toolStack: { value: "Worked out by hand", mark: "no" },
      rivals: {
        brightwheel: { value: "Optional late fee policy", mark: "yes", source: BW_SETTINGS },
        playground: { value: "Late pickup fees; late tuition fees unconfirmed", mark: "unknown", source: PG_BILLING },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_ONESPOT },
      },
    },
    {
      label: "Discounts and sibling rules",
      mudkitchen: { value: "% or $ with a reason; automatic sibling rules", mark: "yes" },
      toolStack: { value: "Spreadsheet math", mark: "partial" },
      rivals: {
        brightwheel: { value: "Discounts on billing plans", mark: "yes", source: BW_BILLING },
        playground: { value: "Discounts included", mark: "yes", source: PG_BILLING },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_ONESPOT },
      },
    },
    {
      label: "Split billing between guardians",
      mudkitchen: { value: "Yes", mark: "yes" },
      toolStack: { value: "Worked out by hand", mark: "no" },
      rivals: {
        brightwheel: { value: "Yes, split between payers", mark: "yes", source: BW_BILLING },
        playground: { value: "Unconfirmed for families", mark: "unknown", source: PG_BILLING },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_ONESPOT },
      },
    },
    {
      label: "Connected to enrollment",
      mudkitchen: { value: "Yes, enrolled students sync in", mark: "yes" },
      toolStack: { value: "Re-keyed by hand", mark: "no" },
      rivals: {
        brightwheel: { value: "Yes, same platform", mark: "yes", source: BW_BILLING },
        playground: { value: "Yes, same platform", mark: "yes", source: PG_BILLING },
        "transparent-classroom": { value: "Records in TC, billing in Onespot", mark: "partial", source: TC_ONESPOT },
      },
    },
  ],
  faq: [
    {
      question: "Who pays the card or bank processing fee?",
      answer:
        "Any processing fee is shown to the family before they pay, and it's added to their payment, so your school receives the full tuition amount. Bank payments carry a lower fee than card payments.",
    },
    {
      question: "Do I need a Stripe account?",
      answer:
        "Yes. You connect your school's own Stripe account once under Payments, and payouts go to your bank through Stripe.",
    },
    {
      question: "How can families pay?",
      answer:
        "By card or US bank account, one time or on autopay, in the MudKitchen app or any browser. If a family pays by cash or check, record it as a manual payment and their balance updates.",
    },
    {
      question: "Does it handle sibling and scholarship discounts?",
      answer:
        "Yes. Sibling discount rules apply automatically, and you can add a % or $ discount to any family with a reason, like Scholarship or Staff discount. Discounts stack.",
    },
    {
      question: "Do families get payment reminders on their phone?",
      answer:
        "Reminders go by email, 3 days before each due date by default, along with autopay and receipt emails. Billing doesn't send push notifications today. Late fees and failed autopay also show in the family's billing tab.",
    },
  ],
  related: ["admissions", "forms-documents", "mobile-app"],
};
