import type { SupabaseClient } from '@supabase/supabase-js';

import { userHasEnrolledAccess } from '@/lib/admissions/parent-portal-access';
import { resolvePortalAccountMemberUserIds } from '@/lib/auth/portal-account-link-context';
import type { AccountPortalId } from '@/lib/auth/school-portal-options-types';
import {
  PortalAccessError,
  type ResolvedPortal,
} from '@/lib/auth/resolve-portal';
import type { LiveOrganization } from '@/lib/organizations';

async function isPlatformAdmin(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.role === 'admin';
}

async function userIsOrgAdminForAuthUser(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('organization_memberships')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .in('role', ['owner', 'admin'])
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

async function userIsOrgAdmin(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const memberUserIds = await resolvePortalAccountMemberUserIds(
    supabase,
    organizationId,
    userId,
  );

  for (const memberUserId of memberUserIds) {
    if (await userIsOrgAdminForAuthUser(supabase, memberUserId, organizationId)) {
      return true;
    }
  }

  return false;
}

async function userHasTeacherPortalAccessForAuthUser(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('organization_memberships')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .in('role', ['teacher', 'staff'])
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

async function userHasTeacherPortalAccess(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const memberUserIds = await resolvePortalAccountMemberUserIds(
    supabase,
    organizationId,
    userId,
  );

  for (const memberUserId of memberUserIds) {
    if (
      await userHasTeacherPortalAccessForAuthUser(
        supabase,
        memberUserId,
        organizationId,
      )
    ) {
      return true;
    }
  }

  return false;
}

async function userHasParentAccessForAuthUser(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const [guardianResult, membershipResult] = await Promise.all([
    supabase
      .from('guardians')
      .select('id')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .maybeSingle(),
    supabase
      .from('organization_memberships')
      .select('id')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .eq('role', 'parent')
      .maybeSingle(),
  ]);

  if (guardianResult.error) throw guardianResult.error;
  if (membershipResult.error) throw membershipResult.error;

  return Boolean(guardianResult.data || membershipResult.data);
}

async function userHasParentAccess(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const memberUserIds = await resolvePortalAccountMemberUserIds(
    supabase,
    organizationId,
    userId,
  );

  for (const memberUserId of memberUserIds) {
    if (
      await userHasParentAccessForAuthUser(
        supabase,
        memberUserId,
        organizationId,
      )
    ) {
      return true;
    }
  }

  return false;
}

async function userHasFamilyApplyAccess(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  if (await userHasParentAccess(supabase, userId, organizationId)) {
    return true;
  }

  const memberUserIds = await resolvePortalAccountMemberUserIds(
    supabase,
    organizationId,
    userId,
  );

  for (const memberUserId of memberUserIds) {
    const { data, error } = await supabase
      .from('applications')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('created_by_user_id', memberUserId)
      .limit(1);

    if (error) throw error;
    if ((data ?? []).length > 0) {
      return true;
    }
  }

  return false;
}

export async function resolvePortalForOption(
  supabase: SupabaseClient,
  userId: string,
  school: LiveOrganization,
  optionId: AccountPortalId,
): Promise<ResolvedPortal> {
  const organizationId = school.id;

  switch (optionId) {
    case 'admin': {
      const allowed =
        (await isPlatformAdmin(supabase, userId)) ||
        (await userIsOrgAdmin(supabase, userId, organizationId));
      if (!allowed) {
        throw new PortalAccessError('You do not have school admin access.');
      }
      return { portalType: 'school_admin', school };
    }
    case 'teacher': {
      if (!(await userHasTeacherPortalAccess(supabase, userId, organizationId))) {
        throw new PortalAccessError('You do not have staff portal access.');
      }
      return { portalType: 'teacher', school };
    }
    case 'family_apply': {
      if (!(await userHasFamilyApplyAccess(supabase, userId, organizationId))) {
        throw new PortalAccessError('You do not have access to applications.');
      }
      return { portalType: 'parent_apply', school };
    }
    case 'family_parent': {
      if (!(await userHasParentAccess(supabase, userId, organizationId))) {
        throw new PortalAccessError('You do not have parent portal access.');
      }
      if (!(await userHasEnrolledAccess(supabase, userId, organizationId))) {
        throw new PortalAccessError(
          'The parent portal is available after your family is enrolled.',
        );
      }
      return { portalType: 'parent', school };
    }
  }
}
