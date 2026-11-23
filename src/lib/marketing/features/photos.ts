import { Images } from "lucide-react";
import type { Feature, Source } from "./types";

/** Research and sources: docs/features-research/photos.md */

const MOTT: Source = {
  label: "C.S. Mott Children's Hospital National Poll on Children's Health, Parents on social media",
  url: "https://www.mottpoll.org/sites/default/files/documents/031615_sharenting_0.pdf",
  year: "2015",
};
const GOOGLE_PHOTOS: Source = { label: "Google Photos Help: share albums", url: "https://support.google.com/photos/answer/6131416?hl=en" };
const BW_PHOTOS: Source = {
  label: "Brightwheel help: view, download and share photos and videos",
  url: "https://help.mybrightwheel.com/en/articles/942382-view-download-and-share-your-child-s-photos-videos",
};
const BW_NEWSLETTERS: Source = { label: "Brightwheel help: send newsletters", url: "https://help.mybrightwheel.com/en/articles/3400687-send-newsletters" };
const PG_COMMS: Source = { label: "Playground: communication", url: "https://tryplayground.com/solutions/communication" };
const PG_FEED: Source = {
  label: "Playground help: manage the Feed on the web",
  url: "https://help.tryplayground.com/en/articles/9467285-manage-the-feed-on-the-web",
};
const PG_MEDIA: Source = {
  label: "Playground help: download items from the Media Gallery",
  url: "https://help.tryplayground.com/en/articles/12835741-how-to-download-items-from-the-media-gallery",
};
const TC_PHOTOS: Source = {
  label: "Transparent Classroom help: share photos with parents",
  url: "https://transparent-classroom.helpscoutdocs.com/article/70-use-photos-to-share-with-parents-and-record-progress",
};
const TC_HOME: Source = { label: "Transparent Classroom feature list", url: "https://www.transparentclassroom.com/" };

export const photos: Feature = {
  slug: "photos",
  name: "Photos",
  icon: Images,
  tint: "mint",
  oneLiner: "A private school photo gallery, with each child's photo permission alongside.",
  roles: ["admin", "family", "staff"],
  roleLines: {
    admin: "Share school photos privately and check each child's photo permission first.",
    family: "Browse the school's photos behind your login, and set your child's permission.",
    staff: "Upload the day's photos from your phone into the school gallery.",
  },
  platforms: { web: true, mobile: true },
  afterBell: true,
  seo: {
    title: "School photo gallery & photo permissions for microschools",
    description:
      "Teachers upload photos to a login-only school gallery. Families get an email and app alert, and you see every child's photo permission before you share.",
  },
  hero: {
    lead: "School photos, shared privately,",
    accent: "with permissions in view.",
    body: "Teachers upload the day's photos from their phones. Families see them in a private gallery and get an alert. Every child's photo permission sits in one list, so you can check first.",
  },
  shots: [],
  heroShots: {},
  capabilities: {
    admin: [
      {
        title: "Know before you share",
        body: "See every enrolled child's photo permission in one list: OK to share, limited, no photos or not answered.",
      },
      { title: "Consent from enrollment", body: "The photo consent families give at enrollment carries over, and families can update it anytime." },
      { title: "Upload a whole day", body: "Add up to 25 photos at once from your phone or computer, filed under the day." },
      { title: "Families hear about it", body: "Families get an email and an app notification for each upload, not for every photo." },
      { title: "Reuse in the newsletter", body: "Pick gallery photos for your weekly newsletter without downloading anything." },
      { title: "Remove any photo", body: "Delete any photo from the gallery, whoever uploaded it." },
    ],
    family: [
      { title: "Your school's gallery", body: "Browse the school's photos by day on your phone or computer, behind your login." },
      { title: "Set your child's permission", body: "Choose full, limited or no photo consent for each child, and change it whenever you like." },
      { title: "Never miss new photos", body: "Get an email and an app notification when the school posts new photos." },
    ],
    staff: [
      { title: "Upload from the classroom", body: "Add photos from the MudKitchen app on iPhone and Android, or the web, right after the activity." },
      { title: "No more group texts", body: "Share photos through the school gallery instead of texting them to parents from your own number." },
      { title: "Fix your own uploads", body: "Delete a photo you uploaded if you picked the wrong one." },
    ],
  },
  useCases: [
    {
      title: "Field-trip photos",
      scenario: "The class spends the morning at a farm.",
      outcome: "The teacher uploads 20 photos from the bus. Every family gets a New photos email and app alert, and the photos are filed under that day.",
    },
    {
      title: "A family chooses limited consent",
      scenario: "A new family picks Limited consent during enrollment.",
      outcome: "The founder sees it in Photo permissions and keeps that child out of website and social posts. The private gallery stays open to enrolled families.",
    },
    {
      title: "Friday's newsletter",
      scenario: "The weekly newsletter needs pictures.",
      outcome: "The founder picks this week's best shots straight from the gallery, with nothing to download.",
    },
    {
      title: "Before an Instagram post",
      scenario: "The founder wants to post an end-of-year group photo.",
      outcome: "She filters Photo permissions to OK to share and checks every child in the shot before posting.",
    },
  ],
  evidence: [
    { stat: "67%", claim: "of parents of young children worry about someone sharing photos of their child.", source: MOTT },
    { stat: "74%", claim: "of parents on social media know another parent who shared too much about a child online.", source: MOTT },
    { stat: "Anyone", claim: "with a Google Photos shared-album link can view the photos and add to the album.", source: GOOGLE_PHOTOS },
  ],
  toolStack: {
    names: ["Google Photos", "Google Drive", "Group texts"],
    logos: ["/images/competitors/GoogleDrive.png"],
  },
  comparison: [
    {
      label: "Login-only gallery",
      mudkitchen: { value: "Yes", mark: "yes" },
      toolStack: { value: "Link-based; anyone with the link can view", mark: "no" },
      rivals: {
        brightwheel: { value: "Yes, the program controls access", mark: "yes", source: BW_PHOTOS },
        playground: { value: "Yes, Media Gallery in the app", mark: "yes", source: PG_MEDIA },
        "transparent-classroom": { value: "Yes, tagged photos go to parents", mark: "yes", source: TC_PHOTOS },
      },
    },
    {
      label: "Each child's photo permission on record",
      mudkitchen: { value: "Full, limited or none, from enrollment", mark: "yes" },
      toolStack: { value: "A spreadsheet or paper form", mark: "partial" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_PHOTOS },
        playground: { value: "Not listed", mark: "unknown", source: PG_MEDIA },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_PHOTOS },
      },
    },
    {
      label: "Photos tied to each child",
      mudkitchen: { value: "No; one school gallery by day", mark: "no" },
      toolStack: { value: "No", mark: "no" },
      rivals: {
        brightwheel: { value: "Yes, logged to the child", mark: "yes", source: BW_NEWSLETTERS },
        playground: { value: "Unconfirmed", mark: "unknown", source: PG_MEDIA },
        "transparent-classroom": { value: "Yes, linked to child progress", mark: "yes", source: TC_HOME },
      },
    },
    {
      label: "Families alerted to new photos",
      mudkitchen: { value: "Email and app push", mark: "yes" },
      toolStack: { value: "Only if someone says so", mark: "no" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_PHOTOS },
        playground: { value: "Yes, real-time notifications", mark: "yes", source: PG_COMMS },
        "transparent-classroom": { value: "Text or email, immediately, daily or weekly", mark: "yes", source: TC_PHOTOS },
      },
    },
    {
      label: "Video",
      mudkitchen: { value: "No; photos only", mark: "no" },
      toolStack: { value: "Yes", mark: "yes" },
      rivals: {
        brightwheel: { value: "Yes", mark: "yes", source: BW_PHOTOS },
        playground: { value: "Yes, up to 90 seconds", mark: "yes", source: PG_FEED },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_PHOTOS },
      },
    },
    {
      label: "Families download photos",
      mudkitchen: { value: "No download button yet", mark: "no" },
      toolStack: { value: "Yes", mark: "yes" },
      rivals: {
        brightwheel: { value: "Yes; bulk download on mobile only", mark: "yes", source: BW_PHOTOS },
        playground: { value: "Yes; bulk download on the web only", mark: "yes", source: PG_MEDIA },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_PHOTOS },
      },
    },
  ],
  faq: [
    {
      question: "Who can see school photos?",
      answer:
        "Families signed in to your school's portal or the MudKitchen app, plus your staff. Photos aren't on a public link. Signed-in families see the whole school gallery; there are no per-class or per-child albums yet.",
    },
    {
      question: "How do photo permissions work?",
      answer:
        "Each family chooses, per child, full consent, limited consent (enrolled families only, no public marketing) or no consent. It starts from their enrollment answer, and they can change it anytime. Admins see every child's choice in one list.",
    },
    {
      question: "Does MudKitchen hide photos of children without consent?",
      answer:
        "No. The permission list tells you who can be photographed and where photos may be shared, so you can decide before uploading or posting. It doesn't detect faces or block uploads.",
    },
    {
      question: "Can I share videos, and can families download photos?",
      answer:
        "Not today. The gallery takes JPEG, PNG and WebP photos, up to 25 per upload and 10 MB each, and there's no download button for families yet.",
    },
    {
      question: "Does FERPA cover our school photos?",
      answer:
        "Private K–12 schools generally don't receive the federal funding that brings FERPA into play, according to the U.S. Department of Education. So photo consent is usually your school's own policy, and MudKitchen keeps each family's choice on record. This isn't legal advice; check your state's rules.",
    },
  ],
  related: ["newsletters", "admissions", "mobile-app"],
};
