import { Building2, Eye, Users, type LucideIcon } from "lucide-react";
import {
  isWholeDayPostSubmitAction,
  newAdmissionsId,
  type PostSubmitAction,
  type PostSubmitActionType,
} from "./application-form-schema";
import { formatDurationLabel } from "./admissions-availability";

export const POST_SUBMIT_ACTION_TYPES: PostSubmitActionType[] = [
  "schedule_campus_tour",
  "schedule_family_interview",
  "schedule_observation_day",
];

const POST_SUBMIT_DURATION_DEFAULTS: Record<
  Exclude<PostSubmitActionType, "schedule_observation_day">,
  number
> = {
  schedule_campus_tour: 60,
  schedule_family_interview: 30,
};

const POST_SUBMIT_DURATION_MAX: Record<
  Exclude<PostSubmitActionType, "schedule_observation_day">,
  number
> = {
  schedule_campus_tour: 120,
  schedule_family_interview: 120,
};

const POST_SUBMIT_VISIT_DAY_DEFAULT = 2;
const POST_SUBMIT_VISIT_DAY_OPTIONS = [2, 3] as const;

export const POST_SUBMIT_ACTION_TEMPLATES: Record<
  PostSubmitActionType,
  {
    label: string;
    description: string;
    defaultInstructions: string;
    Icon: LucideIcon;
  }
> = {
  schedule_campus_tour: {
    label: "Schedule campus tour",
    description: "Families book a tour of your campus before admissions decides.",
    defaultInstructions:
      "Schedule a campus tour so your family can see the school in person.",
    Icon: Building2,
  },
  schedule_family_interview: {
    label: "Parent / family interview",
    description: "Families schedule a meeting with your admissions team.",
    defaultInstructions:
      "Book a parent or family interview with our admissions team.",
    Icon: Users,
  },
  schedule_observation_day: {
    label: "Schedule shadow / observation days",
    description:
      "Families book consecutive school days for your child to shadow class while teachers observe.",
    defaultInstructions:
      "Schedule shadow days so your child can experience the classroom while our teachers observe the fit.",
    Icon: Eye,
  },
};

export function defaultPostSubmitDurationMinutes(type: PostSubmitActionType): number {
  if (isWholeDayPostSubmitAction(type)) {
    return POST_SUBMIT_VISIT_DAY_DEFAULT * 24 * 60;
  }
  return POST_SUBMIT_DURATION_DEFAULTS[
    type as Exclude<PostSubmitActionType, "schedule_observation_day">
  ];
}

export function postSubmitDurationMaxMinutes(type: PostSubmitActionType): number {
  if (isWholeDayPostSubmitAction(type)) {
    return Math.max(...POST_SUBMIT_VISIT_DAY_OPTIONS) * 24 * 60;
  }
  return POST_SUBMIT_DURATION_MAX[
    type as Exclude<PostSubmitActionType, "schedule_observation_day">
  ];
}

export function postSubmitDurationOptions(type: PostSubmitActionType): number[] {
  if (isWholeDayPostSubmitAction(type)) return [];
  const max = postSubmitDurationMaxMinutes(type);
  const options: number[] = [];
  for (let minutes = 30; minutes <= max; minutes += 30) {
    options.push(minutes);
  }
  return options;
}

export function postSubmitVisitDayOptions(): readonly number[] {
  return POST_SUBMIT_VISIT_DAY_OPTIONS;
}

export function defaultPostSubmitVisitDayCount(): number {
  return POST_SUBMIT_VISIT_DAY_DEFAULT;
}

export function resolvedPostSubmitVisitDayCount(action: PostSubmitAction): number {
  if (!isWholeDayPostSubmitAction(action.type)) {
    return defaultPostSubmitVisitDayCount();
  }

  const count = action.visitDayCount ?? defaultPostSubmitVisitDayCount();
  if (POST_SUBMIT_VISIT_DAY_OPTIONS.includes(count as 2 | 3)) {
    return count;
  }
  return defaultPostSubmitVisitDayCount();
}

export function postSubmitVisitDayOptionLabel(dayCount: number): string {
  return `${dayCount} school day${dayCount === 1 ? "" : "s"}`;
}

export function postSubmitDurationOptionLabel(minutes: number): string {
  return formatDurationLabel(minutes);
}

export function createPostSubmitAction(type: PostSubmitActionType): PostSubmitAction {
  const template = POST_SUBMIT_ACTION_TEMPLATES[type];
  if (isWholeDayPostSubmitAction(type)) {
    return {
      id: newAdmissionsId(),
      type,
      enabled: true,
      title: template.label,
      instructions: template.defaultInstructions,
      required: true,
      visitDayCount: defaultPostSubmitVisitDayCount(),
    };
  }

  return {
    id: newAdmissionsId(),
    type,
    enabled: true,
    title: template.label,
    instructions: template.defaultInstructions,
    required: true,
    durationMinutes: defaultPostSubmitDurationMinutes(type),
  };
}

export function postSubmitActionLabel(action: PostSubmitAction): string {
  const override = action.title?.trim();
  if (override) return override;
  return POST_SUBMIT_ACTION_TEMPLATES[action.type]?.label ?? "Post-submit step";
}

export function isPostSubmitActionType(value: string): value is PostSubmitActionType {
  return (POST_SUBMIT_ACTION_TYPES as readonly string[]).includes(value);
}

export function resolvedPostSubmitDurationMinutes(action: PostSubmitAction): number {
  if (isWholeDayPostSubmitAction(action.type)) {
    return resolvedPostSubmitVisitDayCount(action) * 24 * 60;
  }
  return action.durationMinutes ?? defaultPostSubmitDurationMinutes(action.type);
}

export function requiresTimeSlotAvailability(type: PostSubmitActionType): boolean {
  return !isWholeDayPostSubmitAction(type);
}

export function requiresObservationDayAvailability(type: PostSubmitActionType): boolean {
  return isWholeDayPostSubmitAction(type);
}
