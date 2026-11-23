import { Globe } from "lucide-react";
import type { Feature, Source } from "./types";

/** Research and sources: docs/features-research/school-website.md */

const GREATSCHOOLS: Source = {
  label: "GreatSchools national parent survey",
  url: "https://blog.greatschools.org/2025/12/09/new-national-survey-finds-parents-want-clearer-school-information-and-are-more-satisfied-when-they-can-find-it/",
  year: "2025",
};
const SCHOOLCEO: Source = { label: "SchoolCEO (Apptegy), What Parents Want", url: "https://www.apptegy.com/schoolceo/what-parents-want/", year: "2025" };
const BW_BLOG: Source = { label: "Brightwheel blog: childcare website must-haves", url: "https://mybrightwheel.com/blog/childcare-website-must-haves" };
const BW_CRM: Source = { label: "Brightwheel: CRM & enrollment", url: "https://mybrightwheel.com/crm-and-enrollment-forecasting/" };
const PG_WEB: Source = { label: "Playground: websites", url: "https://www.tryplayground.com/solutions/websites" };
const PG_HOME: Source = { label: "Playground home page", url: "https://www.tryplayground.com/" };
const TC_PRICING: Source = { label: "Transparent Classroom pricing", url: "https://www.transparentclassroom.com/pricing" };
const TC_APPS: Source = { label: "Transparent Classroom help: applications", url: "https://transparent-classroom.helpscoutdocs.com/article/52-applications-overview" };

export const schoolWebsite: Feature = {
  slug: "school-website",
  name: "School website",
  icon: Globe,
  tint: "sky",
  oneLiner: "Your school's website, built by us and linked to admissions.",
  roles: ["admin", "family"],
  roleLines: {
    admin: "We build your branded site and link it to applications and tours.",
    family: "Find programs, tuition and FAQs, then apply or book a tour.",
  },
  platforms: { web: true, mobile: false },
  seo: {
    title: "School websites for microschools, built for you",
    description:
      "We build your microschool's website with programs, tuition, team and FAQs, and link it to your MudKitchen application and tour booking.",
  },
  hero: {
    lead: "A school website we build,",
    accent: "connected to enrollment.",
    body: "We build your branded site with programs, tuition, team and FAQs, then link it to your MudKitchen apply form and tour booking. Families go from first visit to application without a separate form.",
  },
  shots: [],
  heroShots: {},
  capabilities: {
    admin: [
      { title: "We build it for you", body: "We design your site with your logo, colors, photos and story. You don't learn a site builder." },
      { title: "Programs and tuition, published", body: "Clear program pages and visible tuition, so families know if you're a fit before they call." },
      { title: "An Apply button that works", body: "Apply opens your MudKitchen application, so submissions land in your admissions list, not a spreadsheet." },
      { title: "Tours booked from your site", body: "A Book a tour button opens your tour page. Families pick a time, and visits show in your schedule." },
      { title: "Your story up front", body: "Founder, story and day-in-the-life sections show families who will teach their child and what a day looks like." },
    ],
    family: [
      { title: "Find answers fast", body: "Programs, tuition, team and FAQs in one place, before you call the school." },
      { title: "Apply in one flow", body: "Go from the website to the school's application, save a draft and finish later." },
      { title: "Book a visit", body: "Choose a tour time from the school's open slots and get a reminder the day before." },
    ],
  },
  useCases: [
    {
      title: "Launching from zero",
      scenario: "A founder plans to open in the fall and has no website yet.",
      outcome: "MudKitchen builds the site with programs and tuition and links it to the apply form, so the first families can apply before the doors open.",
    },
    {
      title: "Replacing a DIY site",
      scenario: "A school's Wix site links to a Google Form that nobody checks.",
      outcome: "On the new site, Apply and Book a tour go straight into MudKitchen, where the founder reviews them.",
    },
    {
      title: "Open-house season",
      scenario: "The founder posts about tours on Instagram.",
      outcome: "The post links to the website, families book a slot on the tour page, and they get a reminder the day before.",
    },
  ],
  evidence: [
    { stat: "74%", claim: "of parents who'd recommend their school say information is easy to find there, against 20% of those who wouldn't.", source: GREATSCHOOLS },
    { stat: "#1", claim: "Families prefer a school's website over any other school communication channel.", source: SCHOOLCEO },
    { stat: "2%", claim: "of parents chose social media as their preferred way to hear from school, so a Facebook page isn't enough.", source: SCHOOLCEO },
  ],
  toolStack: {
    names: ["Squarespace", "Wix", "Google Forms", "Calendly"],
    logos: ["/images/competitors/Wix.png", "/images/competitors/GoogleForms.png", "/images/competitors/Calendly.webp"],
  },
  comparison: [
    {
      label: "Website built for you",
      mudkitchen: { value: "Yes, we build it with you", mark: "yes" },
      toolStack: { value: "You build it yourself", mark: "no" },
      rivals: {
        brightwheel: { value: "Not listed", mark: "unknown", source: BW_BLOG },
        playground: { value: "Yes, fully managed", mark: "yes", source: PG_WEB },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_PRICING },
      },
    },
    {
      label: "Your logo and colors",
      mudkitchen: { value: "Yes", mark: "yes" },
      toolStack: { value: "If you design it", mark: "partial" },
      rivals: {
        brightwheel: { value: "Not listed", mark: "unknown", source: BW_BLOG },
        playground: { value: "Custom-branded design", mark: "yes", source: PG_WEB },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_PRICING },
      },
    },
    {
      label: "Apply button goes into admissions",
      mudkitchen: { value: "Yes, your MudKitchen application", mark: "yes" },
      toolStack: { value: "Links to a separate form", mark: "no" },
      rivals: {
        brightwheel: { value: "Interest form you embed on your own site", mark: "partial", source: BW_CRM },
        playground: { value: "Lead forms that sync", mark: "yes", source: PG_WEB },
        "transparent-classroom": { value: "Application form you embed on your own site", mark: "partial", source: TC_APPS },
      },
    },
    {
      label: "Tour booking from the site",
      mudkitchen: { value: "Yes, your tour page", mark: "yes" },
      toolStack: { value: "Add Calendly", mark: "partial" },
      rivals: {
        brightwheel: { value: "Self-serve tour booking in its CRM", mark: "yes", source: BW_CRM },
        playground: { value: "Tour scheduling on your site", mark: "yes", source: PG_WEB },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_APPS },
      },
    },
    {
      label: "Built for",
      mudkitchen: { value: "Microschools" },
      toolStack: { value: "Any business" },
      rivals: {
        brightwheel: { value: "Childcare", source: BW_BLOG },
        playground: { value: "Childcare", source: PG_HOME },
        "transparent-classroom": { value: "Montessori records", source: TC_PRICING },
      },
    },
  ],
  faq: [
    {
      question: "Do I build the website myself?",
      answer:
        "No. We build it for your school, using your logo, colors, photos and words. There's no site builder in your admin portal to learn.",
    },
    {
      question: "Is the website connected to enrollment?",
      answer:
        "Yes. Apply opens your MudKitchen application and Book a tour opens your tour page, which we turn on for your school. Applications and visits land in your admissions list and schedule.",
    },
    {
      question: "Can I see an example?",
      answer:
        "Yes. Sage Field's live site, sagefield.co, was built with MudKitchen and shows programs, tuition, team and enrollment. Our sample school website shows the full template.",
    },
    {
      question: "Can I change my application after the site is live?",
      answer:
        "Yes. Your apply form's steps, questions and fees are yours to edit in the admin portal anytime, and the website's Apply button keeps pointing to it.",
    },
  ],
  related: ["admissions", "tuition-billing", "mobile-app"],
};
