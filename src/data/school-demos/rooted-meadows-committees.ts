export type CommitteeType =
  | "long_term_role"
  | "annual_volunteer"
  | "event"
  | "hybrid";

export type CommitteeRole = "member" | "lead" | "faculty_liaison" | "admin";

export type CommitteeStatus = "active" | "archived" | "draft";

export type CommitteeWorkspaceSection =
  | "home"
  | "about"
  | "resources"
  | "calendar"
  | "tasks"
  | "messages"
  | "members"
  | "settings";

export type CommitteeTaskStatus = "open" | "claimed" | "in_progress" | "done";

export type CommitteeTaskGroup =
  | "annual_fall"
  | "annual_spring"
  | "class_projects"
  | "sunshine_support"
  | "booths"
  | "general";

export interface CommitteeTemplate {
  id: string;
  name: string;
  type: CommitteeType;
  description: string;
  defaultTermLabel: string;
  sections: CommitteeWorkspaceSection[];
  taskGroups?: { id: CommitteeTaskGroup; label: string }[];
  showGradeColumn?: boolean;
}

export interface CommitteeMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: CommitteeRole;
  grade?: string;
  bio?: string;
  termStart?: string;
  termEnd?: string;
  parentUserId?: string;
}

export interface CommitteeResource {
  id: string;
  title: string;
  type: "pdf" | "doc" | "link" | "checklist";
  url?: string;
  description?: string;
  addedBy?: string;
}

export interface CommitteeEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: "meeting" | "deadline" | "service" | "event";
  location?: string;
}

export interface CommitteeTask {
  id: string;
  title: string;
  description?: string;
  group: CommitteeTaskGroup;
  status: CommitteeTaskStatus;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  attachmentLabel?: string;
}

export interface CommitteeMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
}

export interface CommitteeDutyRole {
  id: string;
  title: string;
  description: string;
  assigneeId?: string;
}

export interface Committee {
  id: string;
  templateId: string;
  name: string;
  type: CommitteeType;
  description: string;
  status: CommitteeStatus;
  termLabel: string;
  termStart: string;
  termEnd: string;
  aboutHtml: string;
  dutyRoles: CommitteeDutyRole[];
  members: CommitteeMember[];
  resources: CommitteeResource[];
  events: CommitteeEvent[];
  tasks: CommitteeTask[];
  messages: CommitteeMessage[];
}

export interface AugustSignupResponse {
  id: string;
  familyName: string;
  parentName: string;
  email: string;
  preferences: string[];
  status: "pending" | "placed" | "invited";
  placedCommitteeId?: string;
  highlight?: boolean;
}

export const DEMO_PARENT_USER_ID = "sarah-m";

export const COMMITTEE_TEMPLATES: CommitteeTemplate[] = [
  {
    id: "template-fcc",
    name: "Family Communication Coordinators",
    type: "long_term_role",
    description:
      "One parent per grade who relays messages, coordinates classroom volunteering, and represents grade-level family concerns.",
    defaultTermLabel: "2024–2026",
    sections: ["home", "about", "resources", "calendar", "messages", "tasks", "members"],
    showGradeColumn: true,
  },
  {
    id: "template-service-sunshine",
    name: "Service & Sunshine",
    type: "annual_volunteer",
    description:
      "Annual service projects, class service activities, and family support coordination for meals, celebrations, and care needs.",
    defaultTermLabel: "2025–2026 School Year",
    sections: ["home", "about", "resources", "calendar", "tasks", "messages", "members"],
    taskGroups: [
      { id: "annual_fall", label: "Fall Service Project" },
      { id: "annual_spring", label: "Spring Service Project" },
      { id: "class_projects", label: "Class Projects" },
      { id: "sunshine_support", label: "Sunshine Support" },
    ],
  },
  {
    id: "template-fall-festival",
    name: "Fall Festival",
    type: "event",
    description:
      "Seasonal festival planning with booth assignments, setup guides, and event-day coordination.",
    defaultTermLabel: "Fall 2025",
    sections: ["home", "about", "resources", "calendar", "tasks", "messages", "members"],
    taskGroups: [
      { id: "booths", label: "Booths & Activities" },
      { id: "general", label: "Event Logistics" },
    ],
  },
];

const SERVICE_SUNSHINE_MEMBERS: CommitteeMember[] = [
  {
    id: "m-ss-lead",
    name: "Rebecca Hartwell",
    email: "rebecca.h@email.com",
    phone: "(503) 555-0142",
    role: "lead",
    bio: "Coordinates fall and spring service project planning and leads monthly committee meetings.",
  },
  {
    id: "m-ss-sarah",
    name: "Sarah Mitchell",
    email: "sarah.m@email.com",
    phone: "(503) 555-0198",
    role: "member",
    parentUserId: DEMO_PARENT_USER_ID,
    bio: "Parent volunteer focused on sunshine meal support and family celebration coordination.",
  },
  {
    id: "m-ss-james",
    name: "James Okonkwo",
    email: "james.o@email.com",
    role: "member",
    bio: "Helps organize class-level service activities and connects families to volunteer opportunities.",
  },
  {
    id: "m-ss-liaison",
    name: "Ms. Elena Vasquez",
    email: "e.vasquez@rootedmeadows.org",
    role: "faculty_liaison",
    bio: "School liaison for logistics, scheduling, and alignment with campus policies and facilities.",
  },
  {
    id: "m-ss-amy",
    name: "Amy Chen",
    email: "amy.c@email.com",
    role: "member",
    bio: "Leads community partner outreach and helps draft templates for local organization contacts.",
  },
];

const FCC_MEMBERS: CommitteeMember[] = [
  { id: "m-fcc-kg", name: "Laura Nguyen", email: "laura.n@email.com", role: "member", grade: "Kindergarten" },
  { id: "m-fcc-g1", name: "David Park", email: "david.p@email.com", role: "member", grade: "Grade 1" },
  { id: "m-fcc-g2", name: "Maria Santos", email: "maria.s@email.com", role: "lead", grade: "Grade 2" },
  { id: "m-fcc-g3", name: "Tom Bradley", email: "tom.b@email.com", role: "member", grade: "Grade 3" },
  { id: "m-fcc-g4", name: "Jen Walsh", email: "jen.w@email.com", role: "member", grade: "Grade 4" },
  { id: "m-fcc-g5", name: "Chris Lee", email: "chris.l@email.com", role: "member", grade: "Grade 5" },
  { id: "m-fcc-g6", name: "Nina Patel", email: "nina.p@email.com", role: "member", grade: "Grade 6" },
  { id: "m-fcc-g7", name: "Sam Rivera", email: "sam.r@email.com", role: "member", grade: "Grade 7" },
  { id: "m-fcc-g8", name: "Kate Morrison", email: "kate.m@email.com", role: "member", grade: "Grade 8" },
  { id: "m-fcc-liaison", name: "Ms. Helen Brooks", email: "h.brooks@rootedmeadows.org", role: "faculty_liaison" },
];

const SERVICE_SUNSHINE_DUTY_ROLES: CommitteeDutyRole[] = [
  {
    id: "dr-ss-lead",
    title: "Committee Lead",
    description: "Coordinates planning meetings and overall committee direction.",
    assigneeId: "m-ss-lead",
  },
  {
    id: "dr-ss-fall",
    title: "Fall Service Project Lead",
    description: "Partner outreach and fall donation drive.",
    assigneeId: "m-ss-lead",
  },
  {
    id: "dr-ss-spring",
    title: "Spring Service Project Lead",
    description: "April earth-focused service day logistics.",
    assigneeId: "m-ss-sarah",
  },
  {
    id: "dr-ss-class",
    title: "Class Projects Coordinator",
    description: "Tracks grade-level class service activities.",
    assigneeId: "m-ss-amy",
  },
  {
    id: "dr-ss-sunshine",
    title: "Sunshine Support Lead",
    description: "Meal trains, babysitting, and celebration coordination.",
    assigneeId: "m-ss-james",
  },
  {
    id: "dr-ss-outreach",
    title: "Community Partner Outreach",
    description: "Draft outreach templates and contact local organizations.",
  },
  {
    id: "dr-ss-liaison",
    title: "Faculty Liaison",
    description: "School staff coordination and scheduling.",
    assigneeId: "m-ss-liaison",
  },
];

const FCC_DUTY_ROLES: CommitteeDutyRole[] = [
  {
    id: "dr-fcc-lead",
    title: "Committee Lead",
    description: "Coordinates grade representatives and Pedagogy Committee communication.",
    assigneeId: "m-fcc-g2",
  },
  {
    id: "dr-fcc-kg",
    title: "Kindergarten Coordinator",
    description: "Relays messages and coordinates classroom volunteering for Kindergarten.",
    assigneeId: "m-fcc-kg",
  },
  {
    id: "dr-fcc-g1",
    title: "Grade 1 Coordinator",
    description: "Relays messages and coordinates classroom volunteering for Grade 1.",
    assigneeId: "m-fcc-g1",
  },
  {
    id: "dr-fcc-g2",
    title: "Grade 2 Coordinator",
    description: "Relays messages and coordinates classroom volunteering for Grade 2.",
    assigneeId: "m-fcc-g2",
  },
  {
    id: "dr-fcc-g3",
    title: "Grade 3 Coordinator",
    description: "Relays messages and coordinates classroom volunteering for Grade 3.",
    assigneeId: "m-fcc-g3",
  },
  {
    id: "dr-fcc-g4",
    title: "Grade 4 Coordinator",
    description: "Relays messages and coordinates classroom volunteering for Grade 4.",
    assigneeId: "m-fcc-g4",
  },
  {
    id: "dr-fcc-g5",
    title: "Grade 5 Coordinator",
    description: "Relays messages and coordinates classroom volunteering for Grade 5.",
    assigneeId: "m-fcc-g5",
  },
  {
    id: "dr-fcc-g6",
    title: "Grade 6 Coordinator",
    description: "Relays messages and coordinates classroom volunteering for Grade 6.",
    assigneeId: "m-fcc-g6",
  },
  {
    id: "dr-fcc-g7",
    title: "Grade 7 Coordinator",
    description: "Relays messages and coordinates classroom volunteering for Grade 7.",
    assigneeId: "m-fcc-g7",
  },
  {
    id: "dr-fcc-g8",
    title: "Grade 8 Coordinator",
    description: "Relays messages and coordinates classroom volunteering for Grade 8.",
    assigneeId: "m-fcc-g8",
  },
  {
    id: "dr-fcc-liaison",
    title: "Faculty Liaison",
    description: "School staff partner for faculty communication and meeting coordination.",
    assigneeId: "m-fcc-liaison",
  },
];

const FALL_FESTIVAL_DUTY_ROLES: CommitteeDutyRole[] = [
  {
    id: "dr-ff-lead",
    title: "Committee Lead",
    description: "Overall festival planning, meetings, and event-day coordination.",
    assigneeId: "m-ff-lead",
  },
  {
    id: "dr-ff-booths",
    title: "Booth Coordinator",
    description: "Assigns and supports booth leads for activities and games.",
    assigneeId: "m-ff-1",
  },
  {
    id: "dr-ff-logistics",
    title: "Event Logistics Lead",
    description: "Setup schedules, supply collection, and site map coordination.",
    assigneeId: "m-ff-2",
  },
  {
    id: "dr-ff-food",
    title: "Food Coordination",
    description: "Vendor outreach, menu planning, and food booth staffing.",
  },
];

export const DEMO_COMMITTEES: Committee[] = [
  {
    id: "service-sunshine-2025",
    templateId: "template-service-sunshine",
    name: "Service & Sunshine",
    type: "annual_volunteer",
    description:
      "Coordinate annual service projects, class activities, and family support for our community.",
    status: "active",
    termLabel: "2025–2026 School Year",
    termStart: "2025-08-15",
    termEnd: "2026-06-15",
    aboutHtml: `Service & Sunshine handles two annual school service projects, one smaller service project for each class, and family support needs such as meals, babysitting, and celebration coordination.`,
    dutyRoles: SERVICE_SUNSHINE_DUTY_ROLES,
    members: SERVICE_SUNSHINE_MEMBERS,
    resources: [
      { id: "r-ss-handbook", title: "Service & Sunshine Role Guide", type: "pdf", description: "Duties, norms, and expectations" },
      { id: "r-ss-fall-plan", title: "Fall Service Project Planning Doc", type: "doc", description: "Partner outreach and logistics" },
      { id: "r-ss-meal-train", title: "Meal Train Template", type: "checklist", description: "Steps for organizing family support" },
      { id: "r-ss-outreach", title: "Community Partner Outreach Templates", type: "link", url: "#", description: "Email templates for local organizations" },
    ],
    events: [
      { id: "e-ss-1", title: "Monthly Planning Meeting", date: "2026-04-07", time: "7:00 PM", type: "meeting", location: "Community Room" },
      { id: "e-ss-2", title: "Confirm fall service partner", date: "2026-04-15", type: "deadline" },
      { id: "e-ss-3", title: "Spring earth-focused service day", date: "2026-04-26", time: "9:00 AM", type: "service", location: "School grounds" },
      { id: "e-ss-4", title: "Class project check-in deadline", date: "2026-05-01", type: "deadline" },
    ],
    tasks: [
      { id: "t-ss-1", title: "Confirm November service project partner", group: "annual_fall", status: "in_progress", assigneeName: "Rebecca Hartwell", dueDate: "2026-04-15" },
      { id: "t-ss-2", title: "Assign donation collection lead", group: "annual_fall", status: "open", dueDate: "2026-04-20" },
      { id: "t-ss-3", title: "Coordinate April earth-focused project logistics", group: "annual_spring", status: "claimed", assigneeName: "Sarah Mitchell", assigneeId: "m-ss-sarah", dueDate: "2026-04-22", attachmentLabel: "Site map & supply list" },
      { id: "t-ss-4", title: "Track Grade 3 class service activity", group: "class_projects", status: "in_progress", assigneeName: "Amy Chen", dueDate: "2026-05-01" },
      { id: "t-ss-5", title: "Track Grade 5 class service activity", group: "class_projects", status: "open", dueDate: "2026-05-01" },
      { id: "t-ss-6", title: "Organize meal train for Rivera family", group: "sunshine_support", status: "in_progress", assigneeName: "James Okonkwo", dueDate: "2026-04-10" },
      { id: "t-ss-7", title: "Send celebration plan for Chen milestone", group: "sunshine_support", status: "open", dueDate: "2026-04-18" },
    ],
    messages: [
      { id: "msg-ss-1", senderId: "m-ss-lead", senderName: "Rebecca Hartwell", text: "Hi everyone — our April planning meeting is confirmed for Tuesday the 7th. I'll share the agenda by Friday.", time: "Mon 9:12 AM" },
      { id: "msg-ss-2", senderId: "m-ss-james", senderName: "James Okonkwo", text: "Meal train for the Rivera family is underway. We have slots for Wed–Fri this week — who can cover Thursday dinner?", time: "Mon 2:45 PM" },
      { id: "msg-ss-3", senderId: "m-ss-sarah", senderName: "Sarah Mitchell", text: "I can take Thursday. I'll also pull together the earth-day supply list this week.", time: "Mon 3:02 PM" },
      { id: "msg-ss-4", senderId: "m-ss-liaison", senderName: "Ms. Elena Vasquez", text: "Thank you all — Grade 3 teachers asked if we could coordinate their creek cleanup for the last week of April.", time: "Tue 10:30 AM" },
    ],
  },
  {
    id: "fcc-2024-2026",
    templateId: "template-fcc",
    name: "Family Communication Coordinators",
    type: "long_term_role",
    description: "Grade-level parent representatives for family communication and classroom volunteering.",
    status: "active",
    termLabel: "2024–2026",
    termStart: "2024-08-01",
    termEnd: "2026-06-30",
    aboutHtml: `Family Communication Coordinators are one parent from each grade who help answer parent questions, relay messages, coordinate classroom volunteering, and represent grade-level family concerns to faculty through the Pedagogy Committee.

Members serve for two years in a private working space with durable resources and ongoing communication tools.`,
    dutyRoles: FCC_DUTY_ROLES,
    members: FCC_MEMBERS,
    resources: [
      { id: "r-fcc-handbook", title: "FCC Handbook & Expectations", type: "pdf" },
      { id: "r-fcc-faq", title: "Parent FAQ Responses", type: "doc" },
      { id: "r-fcc-volunteer", title: "Classroom Volunteer Guidance", type: "link", url: "#" },
    ],
    events: [
      { id: "e-fcc-1", title: "Pedagogy Committee meeting", date: "2026-04-14", time: "6:30 PM", type: "meeting" },
      { id: "e-fcc-2", title: "Grade coordinator check-in", date: "2026-04-21", time: "7:00 PM", type: "meeting" },
    ],
    tasks: [
      { id: "t-fcc-1", title: "Monthly grade-level check-in", group: "general", status: "open", dueDate: "2026-04-30" },
      { id: "t-fcc-2", title: "Update classroom volunteer sign-up sheet", group: "general", status: "in_progress", assigneeName: "Maria Santos", dueDate: "2026-04-12" },
    ],
    messages: [
      { id: "msg-fcc-1", senderId: "m-fcc-g2", senderName: "Maria Santos", text: "Reminder: Pedagogy meeting next Tuesday. Please bring any grade-level concerns.", time: "Fri 11:00 AM" },
    ],
  },
  {
    id: "fall-festival-2025",
    templateId: "template-fall-festival",
    name: "Fall Festival 2025",
    type: "event",
    description: "Plan and execute the annual Fall Festival — booths, food, and event-day logistics.",
    status: "active",
    termLabel: "Fall 2025",
    termStart: "2025-09-01",
    termEnd: "2025-10-18",
    aboutHtml: `The Fall Festival committee plans our community celebration including booth activities, food coordination, and event-day setup.`,
    dutyRoles: FALL_FESTIVAL_DUTY_ROLES,
    members: [
      { id: "m-ff-lead", name: "Patricia Dunn", email: "patricia.d@email.com", role: "lead" },
      { id: "m-ff-1", name: "Michael Torres", email: "michael.t@email.com", role: "member" },
      { id: "m-ff-2", name: "Lisa Kim", email: "lisa.k@email.com", role: "member" },
    ],
    resources: [
      { id: "r-ff-guide", title: "Fall Festival Planning Guide", type: "pdf" },
      { id: "r-ff-booth", title: "Booth Setup Instructions", type: "doc" },
      { id: "r-ff-map", title: "Event Day Site Map", type: "link", url: "#" },
    ],
    events: [
      { id: "e-ff-1", title: "Planning meeting", date: "2025-09-15", time: "7:00 PM", type: "meeting" },
      { id: "e-ff-2", title: "Fall Festival event day", date: "2025-10-18", time: "10:00 AM", type: "event", location: "School meadow" },
    ],
    tasks: [
      { id: "t-ff-1", title: "Apple cider press booth lead", group: "booths", status: "done", assigneeName: "Michael Torres" },
      { id: "t-ff-2", title: "Dragon board setup", group: "booths", status: "in_progress", assigneeName: "Lisa Kim" },
      { id: "t-ff-3", title: "Food coordination", group: "general", status: "open", dueDate: "2025-10-01" },
      { id: "t-ff-4", title: "Supply collection and setup logistics", group: "general", status: "open", dueDate: "2025-10-10" },
    ],
    messages: [
      { id: "msg-ff-1", senderId: "m-ff-lead", senderName: "Patricia Dunn", text: "Booth leads — please review the setup instructions in Resources before our next meeting.", time: "Wed 4:15 PM" },
    ],
  },
];

export const AUGUST_SIGNUP_RESPONSES: AugustSignupResponse[] = [
  {
    id: "signup-1",
    familyName: "Nguyen Family",
    parentName: "Laura Nguyen",
    email: "laura.n@email.com",
    preferences: ["Service & Sunshine", "Farm & Wellness Outreach"],
    status: "placed",
    placedCommitteeId: "service-sunshine-2025",
  },
  {
    id: "signup-2",
    familyName: "Chen Family",
    parentName: "Amy Chen",
    email: "amy.c@email.com",
    preferences: ["Service & Sunshine"],
    status: "placed",
    placedCommitteeId: "service-sunshine-2025",
  },
  {
    id: "signup-3",
    familyName: "Walsh Family",
    parentName: "Jen Walsh",
    email: "jen.w@email.com",
    preferences: ["Fall Festival", "Service & Sunshine"],
    status: "pending",
    highlight: true,
  },
  {
    id: "signup-4",
    familyName: "Torres Family",
    parentName: "Michael Torres",
    email: "michael.t@email.com",
    preferences: ["Fall Festival"],
    status: "placed",
    placedCommitteeId: "fall-festival-2025",
  },
  {
    id: "signup-5",
    familyName: "Okonkwo Family",
    parentName: "James Okonkwo",
    email: "james.o@email.com",
    preferences: ["Service & Sunshine", "Farm & Wellness Outreach"],
    status: "invited",
    placedCommitteeId: "service-sunshine-2025",
  },
  {
    id: "signup-6",
    familyName: "Bradley Family",
    parentName: "Tom Bradley",
    email: "tom.b@email.com",
    preferences: ["Farm & Wellness Outreach"],
    status: "pending",
  },
];

export interface CommitteeInviteCandidate {
  id: string;
  name: string;
  email: string;
  familyName: string;
}

export const COMMITTEE_INVITE_CANDIDATES: CommitteeInviteCandidate[] = [
  { id: "invite-walsh", name: "Jen Walsh", email: "jen.w@email.com", familyName: "Walsh Family" },
  { id: "invite-bradley", name: "Tom Bradley", email: "tom.b@email.com", familyName: "Bradley Family" },
  { id: "invite-dunn", name: "Patricia Dunn", email: "patricia.d@email.com", familyName: "Dunn Family" },
  { id: "invite-kim", name: "Lisa Kim", email: "lisa.k@email.com", familyName: "Kim Family" },
];

export function createCommitteeEntityId(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

export function getInviteCandidatesForCommittee(committee: Committee): CommitteeInviteCandidate[] {
  const memberEmails = new Set(committee.members.map((m) => m.email.toLowerCase()));
  return COMMITTEE_INVITE_CANDIDATES.filter(
    (c) => !memberEmails.has(c.email.toLowerCase()),
  );
}

export function getCommitteeTemplate(templateId: string): CommitteeTemplate | undefined {
  return COMMITTEE_TEMPLATES.find((t) => t.id === templateId);
}

export function getCommitteeById(id: string): Committee | undefined {
  return DEMO_COMMITTEES.find((c) => c.id === id);
}

export function getDemoCommitteeIdForTemplate(templateId: string): string | undefined {
  return DEMO_COMMITTEES.find((c) => c.templateId === templateId)?.id;
}

export function getCommitteesForParent(parentUserId: string): Committee[] {
  return DEMO_COMMITTEES.filter(
    (c) =>
      c.status === "active" &&
      c.members.some((m) => m.parentUserId === parentUserId),
  );
}

export function getCommitteeLeaders(committee: Committee): CommitteeMember[] {
  return committee.members.filter((m) => m.role === "lead" || m.role === "faculty_liaison");
}

export const COMMITTEE_SECTION_LABELS: Record<CommitteeWorkspaceSection, string> = {
  home: "Home",
  about: "Role & Duties",
  resources: "Resources",
  calendar: "Calendar",
  tasks: "Tasks",
  messages: "Messages",
  members: "Members",
  settings: "Settings",
};
