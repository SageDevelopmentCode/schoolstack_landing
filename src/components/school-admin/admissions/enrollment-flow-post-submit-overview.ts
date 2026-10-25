import type {
  ApplicationFormVersion,
  PostSubmitAction,
} from "@/lib/admissions/application-form-schema";
import { postSubmitActionLabel } from "@/lib/admissions/post-submit-templates";

export function getEnabledPostSubmitActions(
  form: ApplicationFormVersion,
): PostSubmitAction[] {
  return form.post_submit_config.actions.filter((action) => action.enabled);
}

export function getPostSubmitActionLabels(form: ApplicationFormVersion): string[] {
  return getEnabledPostSubmitActions(form).map((action) => postSubmitActionLabel(action));
}

export function formatPostSubmitOverviewSubtitle(labels: string[]): string | null {
  if (labels.length === 0) return null;
  if (labels.length === 1) return labels[0];
  return `${labels[0]} + ${labels.length - 1} more`;
}
