import { MessagesSquare } from "lucide-react";
import type { Feature, Source } from "./types";

/** Research and sources: docs/features-research/messages.md */

const KRAFT_ROGERS: Source = {
  label: "Kraft & Rogers, The underutilized potential of teacher-to-parent communication (Economics of Education Review)",
  url: "https://www.hks.harvard.edu/publications/underutilized-potential-teacher-parent-communication-evidence-field-experiment",
  year: "2015",
};
const PARENTSQUARE: Source = {
  label: "ParentSquare & Hanover Research national parent study (press release)",
  url: "https://www.k12dive.com/press-release/20261020-new-parentsquare-and-hanover-research-study-school-communication-shapes-wh/",
  year: "2026",
};
const BW_MSG: Source = { label: "Brightwheel help: start messaging", url: "https://help.mybrightwheel.com/en/articles/2098452-start-messaging-in-brightwheel" };
const PG_CHAT: Source = { label: "Playground help: chat for administrators", url: "https://help.tryplayground.com/en/articles/7424291-chat-for-administrators" };
const PG_FEED: Source = { label: "Playground help: manage the feed", url: "https://help.tryplayground.com/en/articles/9467285-manage-the-feed-on-the-web" };
const PG_COMM: Source = { label: "Playground: communication", url: "https://tryplayground.com/solutions/communication" };
const TC_ANNOUNCE: Source = {
  label: "Transparent Classroom help: sending announcements",
  url: "https://transparent-classroom.helpscoutdocs.com/article/269-sending-announcements",
};
const TC_HOME: Source = { label: "Transparent Classroom home page", url: "https://www.transparentclassroom.com/" };

export const messages: Feature = {
  slug: "messages",
  name: "Messages",
  icon: MessagesSquare,
  tint: "sky",
  oneLiner: "Private family messaging that lives with your school, not your phone.",
  roles: ["admin", "family", "staff"],
  roleLines: {
    admin: "One shared office inbox, private group messages, and teacher threads to review.",
    family: "Message the school office and your child's teachers, on phone or web.",
    staff: "Talk with your students' families without sharing your personal number.",
  },
  platforms: { web: true, mobile: true },
  seo: {
    title: "Family messaging for microschools",
    description:
      "A shared school office inbox, group messages with private replies, and teacher threads you can review. Alerts by push and email, on the web and in the app.",
  },
  hero: {
    lead: "Family messages that stay",
    accent: "with your school, not your phone.",
    body: "Families message the school office and their child's teachers in one place. Group messages arrive as private threads, alerts go by push and email, and every conversation stays with the school.",
  },
  shots: [],
  heroShots: {},
  capabilities: {
    admin: [
      { title: "One shared office inbox", body: "Families write to the school office, not your cell, and your admin team answers from one inbox." },
      { title: "Message many, reply privately", body: "Pick a program, class, grade or parents. Each family gets its own thread, so replies never go to everyone." },
      { title: "See teacher conversations", body: "Family–teacher threads sit in their own section for your review, so nothing important happens out of sight." },
      { title: "Send files with it", body: "Attach up to five files, 10 MB each: a permission slip, a schedule, a photo." },
      { title: "Reply from anywhere", body: "The same inbox works on the web and in the MudKitchen app on iPhone and Android, with push alerts when families write." },
      { title: "Reach us there too", body: "Talk to MudKitchen support in the same inbox." },
    ],
    family: [
      { title: "Message the right person", body: "Write to the school office or your child's teachers. You only see people connected to your family." },
      { title: "Alerts that don't nag", body: "Push and email alerts for new messages, with emails skipped while you're already reading the thread." },
      { title: "One thread per conversation", body: "No hunting through texts and email. The whole conversation stays together on phone and web." },
      { title: "Choose where emails go", body: "Add another email address for alerts, or keep just your login email." },
    ],
    staff: [
      { title: "Families of your students", body: "Your contacts are the families of students assigned to you, plus your colleagues." },
      { title: "Know what needs a reply", body: "Unread threads stand out, and your dashboard shows how many are waiting." },
      { title: "Keep your number private", body: "Talk with families in MudKitchen instead of from your personal phone." },
      { title: "Fix a typo", body: "Edit or delete a message you sent, as long as it has no attachment." },
    ],
  },
  useCases: [
    {
      title: "Snow-day closure",
      scenario: "At 6:10 am the founder decides to close for the day.",
      outcome: "One message reaches every enrolled family as a private thread with a push alert, and questions come back one-to-one, not into a 40-person group chat.",
    },
    {
      title: "A new allergy",
      scenario: "A parent wants the lead teacher to know about a new allergy.",
      outcome: "They message the teacher directly, and the founder sees the thread under Parent & teacher conversations.",
    },
    {
      title: "Missing permission slips",
      scenario: "Three families in one class haven't returned a field-trip slip.",
      outcome: "The founder picks those families and sends the slip as an attachment, and each reply comes back privately.",
    },
    {
      title: "A teacher leaves mid-year",
      scenario: "A teacher moves away in March.",
      outcome: "Her conversations with families stay with the school instead of leaving on her phone.",
    },
  ],
  evidence: [
    { stat: "41%", claim: "fewer students failed to earn course credit when teachers sent parents one short message a week.", source: KRAFT_ROGERS },
    { stat: "63%", claim: "of parents say communication quality influenced their decision to stay at a school.", source: PARENTSQUARE },
    { stat: "86%", claim: "of parents weigh how accessible communication is when choosing a school, behind only safety, teachers and academics.", source: PARENTSQUARE },
  ],
  toolStack: {
    names: ["Group texts", "WhatsApp", "Gmail", "Remind"],
    logos: ["/images/competitors/Gmail.png"],
  },
  comparison: [
    {
      label: "Two-way family and school messaging",
      mudkitchen: { value: "Yes, on the web and in the app", mark: "yes" },
      toolStack: { value: "Yes, across several apps", mark: "partial" },
      rivals: {
        brightwheel: { value: "Yes", mark: "yes", source: BW_MSG },
        playground: { value: "Yes, chat", mark: "yes", source: PG_CHAT },
        "transparent-classroom": { value: "Email announcements; replies go to email", mark: "partial", source: TC_ANNOUNCE },
      },
    },
    {
      label: "Group message, private replies",
      mudkitchen: { value: "Yes, each family gets its own thread", mark: "yes" },
      toolStack: { value: "Group texts reply to everyone", mark: "no" },
      rivals: {
        brightwheel: { value: "Classroom announcements; reply behavior unconfirmed", mark: "unknown", source: BW_MSG },
        playground: { value: "One chat per classroom; reply visibility unconfirmed", mark: "unknown", source: PG_CHAT },
        "transparent-classroom": { value: "Replies go to the sender's email", mark: "partial", source: TC_ANNOUNCE },
      },
    },
    {
      label: "Shared office inbox",
      mudkitchen: { value: "Yes, a school office contact", mark: "yes" },
      toolStack: { value: "The founder's phone", mark: "no" },
      rivals: {
        brightwheel: { value: "Admin-only thread for each child", mark: "yes", source: BW_MSG },
        playground: { value: "No personal number needed; shared inbox unconfirmed", mark: "partial", source: PG_COMM },
        "transparent-classroom": { value: "Replies go to one staff member's email", mark: "no", source: TC_ANNOUNCE },
      },
    },
    {
      label: "Admins can review family–teacher threads",
      mudkitchen: { value: "Yes, in their own section", mark: "yes" },
      toolStack: { value: "No", mark: "no" },
      rivals: {
        brightwheel: { value: "Yes", mark: "yes", source: BW_MSG },
        playground: { value: "Chat moderation listed; details unconfirmed", mark: "partial", source: PG_COMM },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_HOME },
      },
    },
    {
      label: "Attachments",
      mudkitchen: { value: "Up to 5 files, 10 MB each", mark: "yes" },
      toolStack: { value: "Varies by app", mark: "partial" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_MSG },
        playground: { value: "Images, video, PDF and CSV", mark: "yes", source: PG_CHAT },
        "transparent-classroom": { value: "Up to 20 MB per announcement", mark: "yes", source: TC_ANNOUNCE },
      },
    },
    {
      label: "SMS text delivery",
      mudkitchen: { value: "No; push and email", mark: "no" },
      toolStack: { value: "Yes", mark: "yes" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_MSG },
        playground: { value: "Feed posts by SMS to primary guardians", mark: "yes", source: PG_FEED },
        "transparent-classroom": { value: "Not listed for messages", mark: "unknown", source: TC_ANNOUNCE },
      },
    },
    {
      label: "Translation",
      mudkitchen: { value: "No", mark: "no" },
      toolStack: { value: "No", mark: "no" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_MSG },
        playground: { value: "Spanish and English in chat", mark: "yes", source: PG_CHAT },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_HOME },
      },
    },
  ],
  faq: [
    {
      question: "Can parents reply to a message sent to the whole class?",
      answer:
        "Yes, and their reply is private. When you message a group, MudKitchen sends each family its own thread, so replies come back only to the school.",
    },
    {
      question: "How do families get notified?",
      answer:
        "By push in the MudKitchen app, browser notifications on the web, and email. Emails skip anyone who just read the thread and go out at most once every 30 minutes per thread. A daily digest covers anything still unread.",
    },
    {
      question: "Can I see what teachers and families are saying?",
      answer:
        "Yes. School admins see family–teacher conversations in a separate Parent & teacher conversations section, marked for review and kept apart from the school office inbox.",
    },
    {
      question: "Can families message each other?",
      answer:
        "Only in co-op program portals, where families in the same program can message one another one-to-one. In a regular school portal, families message the school office and their child's teachers.",
    },
    {
      question: "Can I send texts (SMS)?",
      answer:
        "Not today. Messages reach people by app push, browser notification and email. MudKitchen also has no read receipts or translation; you see unread counts on each thread instead.",
    },
  ],
  related: ["mobile-app", "newsletters", "bulletin"],
};
