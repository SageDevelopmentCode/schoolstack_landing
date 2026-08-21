import type { SupabaseClient } from '@supabase/supabase-js';

import type { ApplicationFormPostSubmitConfig } from '@/lib/admissions/application-form-schema';

export type AdminPostSubmitStep = {
  actionId: string;
  type: string;
  title: string;
  required: boolean;
  sortIndex: number;
  status: 'pending' | 'scheduled';
  booking?: {
    scheduledDate: string;
    startTimeSlot: string;
    durationMinutes: number;
    completedManuallyAt?: string;
  };
};

type ScheduledVisitRow = {
  post_submit_action_id: string;
  scheduled_date: string;
  start_time_slot: string;
  duration_minutes: number;
  completed_manually_at?: string | null;
};

async function listScheduledVisitsForApplications(
  supabase: SupabaseClient,
  applicationIds: string[],
): Promise<ScheduledVisitRow[]> {
  if (applicationIds.length === 0) return [];
  const { data, error } = await supabase
    .from('admissions_scheduled_visits')
    .select(
      'post_submit_action_id, scheduled_date, start_time_slot, duration_minutes, completed_manually_at',
    )
    .in('application_id', applicationIds)
    .eq('status', 'scheduled');
  if (error) throw error;
  return (data ?? []) as ScheduledVisitRow[];
}

export function buildAdminPostSubmitSteps(
  config: ApplicationFormPostSubmitConfig,
  visits: ScheduledVisitRow[],
  applicationStatus: string,
): AdminPostSubmitStep[] {
  if (applicationStatus === 'draft') return [];

  const visitsByActionId = new Map(visits.map((visit) => [visit.post_submit_action_id, visit]));

  return config.actions
    .filter((action) => action.enabled !== false)
    .map((action, sortIndex) => {
      const visit = visitsByActionId.get(action.id);
      return {
        actionId: action.id,
        type: action.type,
        title: action.label?.trim() || action.type.replace(/_/g, ' '),
        required: action.required !== false,
        sortIndex,
        status: visit ? 'scheduled' : 'pending',
        booking: visit
          ? {
              scheduledDate: String(visit.scheduled_date),
              startTimeSlot: String(visit.start_time_slot),
              durationMinutes: Number(visit.duration_minutes),
              completedManuallyAt: visit.completed_manually_at
                ? String(visit.completed_manually_at)
                : undefined,
            }
          : undefined,
      };
    });
}

export async function loadPostSubmitStepsForApplication(
  supabase: SupabaseClient,
  applicationId: string,
  config: ApplicationFormPostSubmitConfig,
  applicationStatus: string,
): Promise<AdminPostSubmitStep[]> {
  const visits = await listScheduledVisitsForApplications(supabase, [applicationId]);
  return buildAdminPostSubmitSteps(config, visits, applicationStatus);
}
