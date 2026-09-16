export type SchoolEventType =
  | "field_trip"
  | "no_school"
  | "community"
  | "academic"
  | "other";

export type SchoolEventColorKey =
  | "emerald"
  | "red"
  | "olive"
  | "purple"
  | "slate"
  | "blue"
  | "amber"
  | "rose"
  | "teal"
  | "indigo";

export type OrganizationEvent = {
  id: string;
  organizationId: string;
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  isAllDay: boolean;
  type: SchoolEventType;
  colorKey?: SchoolEventColorKey;
  location?: string;
  description?: string;
  sortOrder: number;
};

export type ParentCalendarInitialData = {
  events: OrganizationEvent[];
};

export type TeacherCalendarInitialData = ParentCalendarInitialData & {
  canManageEvents: boolean;
};
