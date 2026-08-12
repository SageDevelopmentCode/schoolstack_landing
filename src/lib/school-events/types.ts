export type SchoolEventType =
  | "field_trip"
  | "no_school"
  | "community"
  | "academic"
  | "other";

export type OrganizationEvent = {
  id: string;
  organizationId: string;
  title: string;
  date: string;
  time?: string;
  isAllDay: boolean;
  type: SchoolEventType;
  location?: string;
  description?: string;
  sortOrder: number;
};

export type ParentCalendarInitialData = {
  events: OrganizationEvent[];
};
