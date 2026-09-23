import type { SupabaseClient } from '@supabase/supabase-js';

import { getCommittee } from '@/lib/school-admin/committees/queries';
import { mapTemplateRow, resolveTemplateConfig } from '@/lib/school-admin/committees/mappers';
import type {
  Committee,
  CommitteeStatus,
  CommitteeTemplate,
} from '@/lib/parent/parent-committees-types';

export type CreateCommitteeInput = {
  templateId?: string | null;
  name: string;
  description?: string;
  termLabel?: string;
  termStart?: string;
  termEnd?: string;
  aboutHtml?: string;
  status?: CommitteeStatus;
};

export async function createCommitteeFromTemplate(
  supabase: SupabaseClient,
  organizationId: string,
  input: CreateCommitteeInput,
): Promise<Committee> {
  let template: CommitteeTemplate | null = null;

  if (input.templateId) {
    const { data, error } = await supabase
      .from('committee_templates')
      .select('*')
      .eq('id', input.templateId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data) template = mapTemplateRow(data);
  }

  const config = resolveTemplateConfig(template?.config ?? null);
  const committeeType = template?.type ?? 'annual_volunteer';

  const { data: committee, error: insertError } = await supabase
    .from('committees')
    .insert({
      organization_id: organizationId,
      template_id: input.templateId ?? null,
      name: input.name,
      description: input.description ?? template?.description ?? '',
      status: input.status ?? 'active',
      term_label: input.termLabel ?? config.defaultTermLabel ?? '',
      term_start: input.termStart ?? null,
      term_end: input.termEnd ?? null,
      about_html: input.aboutHtml ?? '',
      config: { ...config, type: committeeType },
    })
    .select()
    .single();

  if (insertError) throw new Error(insertError.message);

  const defaultDutyRoles = config.defaultDutyRoles ?? [];
  if (defaultDutyRoles.length > 0) {
    const { error: rolesError } = await supabase.from('committee_duty_roles').insert(
      defaultDutyRoles.map((role, index) => ({
        committee_id: committee.id,
        title: role.title,
        description: role.description,
        sort_order: index,
      })),
    );
    if (rolesError) throw new Error(rolesError.message);
  }

  const defaultResources = config.defaultResources ?? [];
  if (defaultResources.length > 0) {
    const { error: resourcesError } = await supabase.from('committee_resources').insert(
      defaultResources.map((resource, index) => ({
        committee_id: committee.id,
        title: resource.title,
        resource_type: resource.type,
        url: resource.url ?? null,
        description: resource.description ?? null,
        sort_order: index,
      })),
    );
    if (resourcesError) throw new Error(resourcesError.message);
  }

  const result = await getCommittee(supabase, organizationId, committee.id);
  if (!result) throw new Error('Failed to load created committee');
  return { ...result, type: committeeType };
}

export type UpdateCommitteeInput = {
  name?: string;
  description?: string;
  status?: CommitteeStatus;
  termLabel?: string;
  termStart?: string | null;
  termEnd?: string | null;
  aboutHtml?: string;
};

export async function updateCommittee(
  supabase: SupabaseClient,
  organizationId: string,
  committeeId: string,
  input: UpdateCommitteeInput,
): Promise<Committee> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description;
  if (input.status !== undefined) patch.status = input.status;
  if (input.termLabel !== undefined) patch.term_label = input.termLabel;
  if (input.termStart !== undefined) patch.term_start = input.termStart;
  if (input.termEnd !== undefined) patch.term_end = input.termEnd;
  if (input.aboutHtml !== undefined) patch.about_html = input.aboutHtml;

  const { error } = await supabase
    .from('committees')
    .update(patch)
    .eq('id', committeeId)
    .eq('organization_id', organizationId);

  if (error) throw new Error(error.message);

  const result = await getCommittee(supabase, organizationId, committeeId);
  if (!result) throw new Error('Committee not found after update');
  return result;
}

export async function archiveCommittee(
  supabase: SupabaseClient,
  organizationId: string,
  committeeId: string,
): Promise<Committee> {
  return updateCommittee(supabase, organizationId, committeeId, { status: 'archived' });
}
