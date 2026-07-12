import { Building2, Eye, Users, type LucideIcon } from "lucide-react";
import {
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

const POST_SUBMIT_DURATION_DEFAULTS: Record<PostSubmitActionType, number> = {
  schedule_campus_tour: 60,
  schedule_family_interview: 30,
  schedule_observation_day: 180,
};

const POST_SUBMIT_DURATION_MAX: Record<PostSubmitActionType, number> = {
  schedule_campus_tour: 120,
  schedule_family_interview: 120,
  schedule_observation_day: 480,
};

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
    label: "Schedule shadow / observation day",
    description: "Families book a student shadow or observation visit.",
    defaultInstructions:
      "Schedule a shadow or observation day for your child to experience a school day.",
    Icon: Eye,
  },
};

export function defaultPostSubmitDurationMinutes(type: PostSubmitActionType): number {
  return POST_SUBMIT_DURATION_DEFAULTS[type];
}

export function postSubmitDurationMaxMinutes(type: PostSubmitActionType): number {
  return POST_SUBMIT_DURATION_MAX[type];
}

export function postSubmitDurationOptions(type: PostSubmitActionType): number[] {
  const max = postSubmitDurationMaxMinutes(type);
  const options: number[] = [];
  for (let minutes = 30; minutes <= max; minutes += 30) {
    options.push(minutes);
  }
  return options;
}

export function postSubmitDurationOptionLabel(minutes: number): string {
  return formatDurationLabel(minutes);
}

export function createPostSubmitAction(type: PostSubmitActionType): PostSubmitAction {
  const template = POST_SUBMIT_ACTION_TEMPLATES[type];
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
  return action.durationMinutes ?? defaultPostSubmitDurationMinutes(action.type);
}
