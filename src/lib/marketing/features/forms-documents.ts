import { FileSignature } from "lucide-react";
import type { Feature, Source } from "./types";

/** Research and sources: docs/features-research/forms-documents.md */

const DOCUSIGN: Source = { label: "Docusign (its own platform data)", url: "https://www.docusign.com/learn/free-electronic-signature" };
const PEW: Source = { label: "Pew Research Center, Mobile Fact Sheet", url: "https://www.pewresearch.org/internet/fact-sheet/mobile/", year: "2026" };
const THE74: Source = {
  label: "The 74 / National Microschooling Center",
  url: "https://www.the74million.org/article/exclusive-7-things-to-know-about-microschools-in-2026/",
  year: "2026",
};
const BW_FORMS: Source = { label: "Brightwheel: childcare forms", url: "https://mybrightwheel.com/childcare-forms/" };
const BW_HELP: Source = { label: "Brightwheel help: create digital forms", url: "https://help.mybrightwheel.com/en/articles/4404606-create-digital-forms" };
const PG_PAPERWORK: Source = { label: "Playground: paperwork", url: "https://www.tryplayground.com/paperwork" };
const TC_OVERVIEW: Source = { label: "Transparent Classroom help: using forms", url: "https://transparent-classroom.helpscoutdocs.com/article/51-using-forms-overview" };
const TC_SIGN: Source = {
  label: "Transparent Classroom help: application vs enrollment forms",
  url: "https://transparent-classroom.helpscoutdocs.com/article/54-application-verses-enrollment-forms",
};
const TC_ASSIGN: Source = {
  label: "Transparent Classroom help: assigning forms to families",
  url: "https://transparent-classroom.helpscoutdocs.com/article/264-assigning-forms-to-families",
};

export const formsDocuments: Feature = {
  slug: "forms-documents",
  name: "Forms & documents",
  icon: FileSignature,
  tint: "butter",
  oneLiner: "Send forms, collect signatures, and know who's still missing.",
  roles: ["admin", "staff", "family"],
  roleLines: {
    admin: "See every form your team sends, and which families haven't signed.",
    staff: "Send permission slips to your classroom without asking the office.",
    family: "Read, fill in and sign school forms from your phone.",
  },
  platforms: { web: true, mobile: true },
  afterBell: true,
  seo: {
    title: "Forms, permission slips & e-signatures for microschools",
    description:
      "Upload a PDF or build a form, send it to a classroom or a few families, and see who has signed. Families sign in the MudKitchen app or any browser.",
  },
  hero: {
    lead: "Permission slips signed",
    accent: "before the bus leaves.",
    body: "Upload a PDF or build a form, send it to a class or a few families, and watch signatures come in. Families sign on their phone. You see who's still missing.",
  },
  shots: [],
  heroShots: {},
  capabilities: {
    admin: [
      { title: "Every form, one view", body: "See forms from every teacher, filter by status or creator, and spot drafts that were never sent." },
      { title: "Know who's missing", body: "Each form shows how many families have signed, with Pending, Signed and Overdue for each family." },
      { title: "Upload or build", body: "Turn your existing PDF or Word waiver into a signable form, or build one with six field types." },
      { title: "Send to the right families", body: "Pick one or more classrooms or specific families, so nobody gets forms that aren't theirs." },
      { title: "Reuse next year", body: "Duplicate last year's field-trip form, archive old ones, and download the original file anytime." },
    ],
    staff: [
      { title: "Send your own slips", body: "Teachers create classroom forms from the staff portal without asking the office." },
      { title: "Set a due date", body: "Families who miss the date show as Overdue on your signature list." },
      { title: "Hear when it's signed", body: "Get an email each time a family signs." },
      { title: "Start from a copy", body: "Duplicate a form and change the date instead of rebuilding it." },
    ],
    family: [
      { title: "Get it by email", body: "A new form arrives in your inbox with a link to sign." },
      { title: "Read, then sign", body: "Preview the PDF, answer any questions, and type your name to sign." },
      { title: "Sign on your phone", body: "Use the MudKitchen app on iPhone and Android, or any browser." },
      { title: "Find it later", body: "Signed forms stay in Forms & documents, ready to reopen anytime." },
    ],
  },
  useCases: [
    {
      title: "Field trip Friday",
      scenario: "On Monday a teacher uploads the farm-visit permission slip, sends it to her two classrooms and sets Thursday as the due date.",
      outcome: "By Thursday she sees the three families still pending and messages them, so no one is left off the bus.",
    },
    {
      title: "The new-year photo release",
      scenario: "The founder duplicates last year's photo release and sends it to every classroom.",
      outcome: "One list shows signed and pending across the school, instead of a stack of paper to file.",
    },
    {
      title: "One family's medication form",
      scenario: "A child starts using an inhaler mid-year.",
      outcome: "The teacher builds a short form with a date, a checkbox and a signature, sends it to that one family, and gets an email when it's signed.",
    },
  ],
  evidence: [
    { stat: "76%", claim: "of completed Docusign e-signatures are finished in under 24 hours, and 41% within 15 minutes.", source: DOCUSIGN },
    { stat: "91%", claim: "of U.S. adults own a smartphone, and 97% of adults aged 30 to 49.", source: PEW },
    { stat: "93 hrs", claim: "a year: the average time microschool leaders spend on compliance.", source: THE74 },
  ],
  toolStack: {
    names: ["Paper slips", "Google Forms", "DocuSign"],
    logos: ["/images/competitors/GoogleForms.png", "/images/competitors/DocuSign.png"],
  },
  comparison: [
    {
      label: "Upload a PDF to sign",
      mudkitchen: { value: "Yes, PDF or Word", mark: "yes" },
      toolStack: { value: "DocuSign, per envelope", mark: "partial" },
      rivals: {
        brightwheel: { value: "Yes, fillable PDFs", mark: "yes", source: BW_FORMS },
        playground: { value: "Yes", mark: "yes", source: PG_PAPERWORK },
        "transparent-classroom": { value: "PDF attachments in forms", mark: "yes", source: TC_OVERVIEW },
      },
    },
    {
      label: "Build a custom form",
      mudkitchen: { value: "Yes, six field types", mark: "yes" },
      toolStack: { value: "Google Forms", mark: "yes" },
      rivals: {
        brightwheel: { value: "Yes", mark: "yes", source: BW_HELP },
        playground: { value: "Yes, drag-and-drop", mark: "yes", source: PG_PAPERWORK },
        "transparent-classroom": { value: "Yes", mark: "yes", source: TC_OVERVIEW },
      },
    },
    {
      label: "E-signature",
      mudkitchen: { value: "Typed signature", mark: "yes" },
      toolStack: { value: "Typed name, or a paid e-sign tool", mark: "partial" },
      rivals: {
        brightwheel: { value: "Yes", mark: "yes", source: BW_FORMS },
        playground: { value: "Yes, timestamped", mark: "yes", source: PG_PAPERWORK },
        "transparent-classroom": { value: "On standard forms, not applications", mark: "partial", source: TC_SIGN },
      },
    },
    {
      label: "Teachers send their own forms",
      mudkitchen: { value: "Yes, to their classrooms", mark: "yes" },
      toolStack: { value: "Each teacher in their own tool", mark: "partial" },
      rivals: {
        brightwheel: { value: "Admins and managers", mark: "partial", source: BW_HELP },
        playground: { value: "Unconfirmed", mark: "unknown", source: PG_PAPERWORK },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_ASSIGN },
      },
    },
    {
      label: "See who's missing",
      mudkitchen: { value: "Pending, Signed and Overdue per family", mark: "yes" },
      toolStack: { value: "Compare lists by hand", mark: "no" },
      rivals: {
        brightwheel: { value: "Yes, submissions list", mark: "yes", source: BW_HELP },
        playground: { value: "Yes", mark: "yes", source: PG_PAPERWORK },
        "transparent-classroom": { value: "Yes", mark: "yes", source: TC_ASSIGN },
      },
    },
    {
      label: "Automatic reminders",
      mudkitchen: { value: "Not yet; late forms show as Overdue", mark: "partial" },
      toolStack: { value: "Manual email", mark: "no" },
      rivals: {
        brightwheel: { value: "Not mentioned in help", mark: "unknown", source: BW_HELP },
        playground: { value: "Yes, bulk nudge", mark: "yes", source: PG_PAPERWORK },
        "transparent-classroom": { value: "Yes, before the due date", mark: "yes", source: TC_ASSIGN },
      },
    },
    {
      label: "Families sign on their phone",
      mudkitchen: { value: "Yes, the MudKitchen app or any browser", mark: "yes" },
      toolStack: { value: "Mobile browser", mark: "partial" },
      rivals: {
        brightwheel: { value: "Yes, in the app", mark: "yes", source: BW_FORMS },
        playground: { value: "Yes, any device", mark: "yes", source: PG_PAPERWORK },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_OVERVIEW },
      },
    },
  ],
  faq: [
    {
      question: "Are typed e-signatures legally valid?",
      answer:
        "U.S. federal law (the ESIGN Act) says a signature can't be denied legal effect just because it's electronic. MudKitchen records the typed name and when it was signed. Some documents have state-specific rules, so check with your licensing body or attorney if you're unsure.",
    },
    {
      question: "Can I use my existing PDF?",
      answer:
        "Yes. Upload a PDF or Word document and families review it in the portal before signing. Or build a new form with short text, long text, checkbox, multiple choice, date and signature fields.",
    },
    {
      question: "Can teachers send forms, or only the office?",
      answer: "Both. Teachers send forms to their own classrooms or chosen families from the staff portal. Admins see every form across the school.",
    },
    {
      question: "How do families know there's something to sign?",
      answer: "They get an email when a form is sent, and it appears in Forms & documents in their portal and the app.",
    },
    {
      question: "Do forms send reminders?",
      answer: "Not automatically yet. Forms past their due date show as Overdue, so you can see exactly who to follow up with.",
    },
  ],
  related: ["admissions", "classroom-signups", "messages"],
};
