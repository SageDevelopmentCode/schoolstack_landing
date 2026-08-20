import type { SupabaseClient } from '@supabase/supabase-js';

export type EnrollmentProgressSummaryTone = 'complete' | 'in_progress' | 'not_started';

export type EnrollmentProgressSummary = {
  label: string;
  tone: EnrollmentProgressSummaryTone;
  completed: number;
  total: number;
  checklistStatus: string;
};

function summarizeEnrollmentProgress(
  completed: number,
  total: number,
  checklistStatus: string,
): EnrollmentProgressSummary {
  const label = `${completed}/${total} complete`;

  let tone: EnrollmentProgressSummaryTone;
  if (total > 0 && completed === total) {
    tone = 'complete';
  } else if (completed > 0) {
    tone = 'in_progress';
  } else {
    tone = 'not_started';
  }

  return { label, tone, completed, total, checklistStatus };
}

export async function listEnrollmentProgressForApplications(
  supabase: SupabaseClient,
  organizationId: string,
  applicationIds: string[],
): Promise<Map<string, EnrollmentProgressSummary>> {
  const result = new Map<string, EnrollmentProgressSummary>();
  if (applicationIds.length === 0) return result;

  const { data: checklistRows, error: checklistError } = await supabase
    .from('enrollment_checklists')
    .select('id, application_id, template_id, status')
    .eq('organization_id', organizationId)
    .in('application_id', applicationIds);

  if (checklistError) throw checklistError;
  if (!checklistRows || checklistRows.length === 0) return result;

  const templateIds = [...new Set(checklistRows.map((row) => String(row.template_id)))];
  const checklistIds = checklistRows.map((row) => String(row.id));

  const [templateItemsResult, instanceRowsResult] = await Promise.all([
    supabase
      .from('enrollment_checklist_template_items')
      .select('id, template_id, required')
      .in('template_id', templateIds),
    supabase
      .from('enrollment_checklist_items')
      .select('checklist_id, template_item_id, status')
      .in('checklist_id', checklistIds)
      .neq('status', 'waived'),
  ]);

  if (templateItemsResult.error) throw templateItemsResult.error;
  if (instanceRowsResult.error) throw instanceRowsResult.error;

  const requiredItemsByTemplate = new Map<string, string[]>();
  for (const row of templateItemsResult.data ?? []) {
    if (!row.required) continue;
    const templateId = String(row.template_id);
    const existing = requiredItemsByTemplate.get(templateId) ?? [];
    existing.push(String(row.id));
    requiredItemsByTemplate.set(templateId, existing);
  }

  const completedByChecklist = new Map<string, Set<string>>();
  for (const row of instanceRowsResult.data ?? []) {
    if (row.status !== 'completed') continue;
    const checklistId = String(row.checklist_id);
    const existing = completedByChecklist.get(checklistId) ?? new Set<string>();
    existing.add(String(row.template_item_id));
    completedByChecklist.set(checklistId, existing);
  }

  for (const checklist of checklistRows) {
    const applicationId = String(checklist.application_id);
    const templateId = String(checklist.template_id);
    const checklistId = String(checklist.id);
    const requiredItems = requiredItemsByTemplate.get(templateId) ?? [];
    const completedItems = completedByChecklist.get(checklistId) ?? new Set<string>();

    let completed = 0;
    for (const itemId of requiredItems) {
      if (completedItems.has(itemId)) completed += 1;
    }

    result.set(
      applicationId,
      summarizeEnrollmentProgress(completed, requiredItems.length, String(checklist.status)),
    );
  }

  return result;
}
