export type PostSubmitActionType =
  | 'schedule_campus_tour'
  | 'schedule_family_interview'
  | 'schedule_observation_day';

export const POST_SUBMIT_ACTION_TEMPLATES: Record<
  PostSubmitActionType,
  { label: string; description: string }
> = {
  schedule_campus_tour: {
    label: 'Schedule campus tour',
    description: 'Families book a tour of your campus before admissions decides.',
  },
  schedule_family_interview: {
    label: 'Parent / family interview',
    description: 'Families schedule a meeting with your admissions team.',
  },
  schedule_observation_day: {
    label: 'Schedule shadow / observation days',
    description: 'Families select open school days for shadow visits.',
  },
};

type PostSubmitActionLike = {
  type: string;
  label?: string;
  title?: string;
};

export function postSubmitActionLabel(action: PostSubmitActionLike): string {
  const override = action.title?.trim() || action.label?.trim();
  if (override) return override;
  const template = POST_SUBMIT_ACTION_TEMPLATES[action.type as PostSubmitActionType];
  return template?.label ?? 'Post-submit step';
}

export function isPostSubmitActionType(value: string): value is PostSubmitActionType {
  return value in POST_SUBMIT_ACTION_TEMPLATES;
}
