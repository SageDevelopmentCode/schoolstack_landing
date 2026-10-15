export type DemoNewsletterStatus = "draft" | "published";

export type DemoNewsletterListItem = {
  id: string;
  weekLabel: string;
  title: string;
  dateRange: string;
  status: DemoNewsletterStatus;
};

export type DemoNewsletterSection = {
  id: string;
  label: string;
  active?: boolean;
};

export type DemoTeacherNewsletterUpdate = {
  id: string;
  name: string;
  initials: string;
  photoUrl?: string;
  hasUpdate: boolean;
  preview?: string;
};

export type DemoNewsletterCollaborator = {
  id: string;
  name: string;
  initials: string;
  photoUrl?: string;
  isYou?: boolean;
  online?: boolean;
};

export const DEMO_NEWSLETTER_SECTIONS: DemoNewsletterSection[] = [
  { id: "welcome", label: "Welcome Message" },
  { id: "class-updates", label: "Class Updates", active: true },
  { id: "events", label: "Upcoming Events" },
  { id: "reminders", label: "Parent Reminders" },
  { id: "gallery", label: "Photo Gallery" },
];

export const DEMO_NEWSLETTER_LIST: DemoNewsletterListItem[] = [
  {
    id: "week-8",
    weekLabel: "W8",
    title: "Week 8 · Mud School School Year",
    dateRange: "Oct 6 – Oct 10",
    status: "published",
  },
  {
    id: "week-7",
    weekLabel: "W7",
    title: "Week 7 · Mud School School Year",
    dateRange: "Sep 29 – Oct 3",
    status: "published",
  },
  {
    id: "week-9-draft",
    weekLabel: "W9",
    title: "Week 9 · Mud School School Year",
    dateRange: "Oct 13 – Oct 17",
    status: "draft",
  },
];

const STAFF = "/images/people/staff";

export const DEMO_NEWSLETTER_TEACHER_UPDATES: DemoTeacherNewsletterUpdate[] = [
  {
    id: "sam",
    name: "Sam Okonkwo",
    initials: "SO",
    photoUrl: `${STAFF}/andre-styles-pq9npYMirk8-unsplash.jpg`,
    hasUpdate: true,
    preview:
      "We finished our leaf sorting project and started watercolor maps of the creek trail. Ask your child which colors they mixed for the water. On Thursday we hiked the north loop and sketched bark textures—several students added compass roses to their maps. Next week we will press leaves for a classroom collage.",
  },
  {
    id: "priya",
    name: "Priya Nair",
    initials: "PN",
    photoUrl: `${STAFF}/clay-elliot-mpDV4xaFP8c-unsplash.jpg`,
    hasUpdate: true,
    preview:
      "Readers practiced fluent phrases with partner plays. Several students volunteered to perform on Friday. We also introduced a new vocabulary journal; look for three highlighted words in the take-home folder. Please encourage a five-minute read-aloud at home if you can—many kids are proud of their expression this week.",
  },
  {
    id: "chris",
    name: "Chris Alvarez",
    initials: "CA",
    photoUrl: `${STAFF}/tony-luginsland-OswNOXPNU1k-unsplash.jpg`,
    hasUpdate: false,
  },
];

export const DEMO_NEWSLETTER_COLLABORATORS: DemoNewsletterCollaborator[] = [
  {
    id: "you",
    name: "Morgan Ellis",
    initials: "ME",
    photoUrl: `${STAFF}/linkedin-sales-solutions-pAtA8xe_iVM-unsplash.jpg`,
    isYou: true,
    online: true,
  },
  {
    id: "sam",
    name: "Sam Okonkwo",
    initials: "SO",
    photoUrl: `${STAFF}/andre-styles-pq9npYMirk8-unsplash.jpg`,
    online: true,
  },
  {
    id: "priya",
    name: "Priya Nair",
    initials: "PN",
    photoUrl: `${STAFF}/clay-elliot-mpDV4xaFP8c-unsplash.jpg`,
    online: false,
  },
];

export const DEMO_NEWSLETTER_ACTIVE =
  DEMO_NEWSLETTER_LIST.find((n) => n.id === "week-9-draft") ?? DEMO_NEWSLETTER_LIST[0];
