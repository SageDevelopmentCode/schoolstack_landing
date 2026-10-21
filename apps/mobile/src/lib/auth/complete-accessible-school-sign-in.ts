import type { SupabaseClient } from '@supabase/supabase-js';

import { normalizeAuthErrorMessage } from '@/lib/auth/auth-error-message';
import { listAccessibleLiveOrganizations } from '@/lib/auth/list-accessible-organizations';
import {
  PortalAccessError,
  resolvePortalForSchool,
  type ResolvedPortal,
} from '@/lib/auth/resolve-portal';
import type { LiveOrganization } from '@/lib/organizations';

export const NO_SCHOOL_ACCESS_MESSAGE =
  'You do not have access to any schools for this account. Try signing in with a different account.';

export const SCHOOLS_LOAD_FAILED_MESSAGE =
  "Couldn't load your schools right now. Check your connection and try again.";

export type CompleteAccessibleSchoolSignInResult =
  | { kind: 'completed'; portal: ResolvedPortal }
  | { kind: 'needs_school_picker'; slugs: string[]; organizations: LiveOrganization[] }
  | { kind: 'no_access' }
  | { kind: 'error'; message: string; portalAccessDenied?: boolean };

/** Sign out only when the account has no schools. Load failures keep the session. */
export function shouldSignOutAfterAccessibleSchoolResult(
  kind: CompleteAccessibleSchoolSignInResult['kind'],
): boolean {
  return kind === 'no_access';
}

export async function completeAccessibleSchoolSignIn(
  supabase: SupabaseClient,
  userId: string,
): Promise<CompleteAccessibleSchoolSignInResult> {
  try {
    const organizations = await listAccessibleLiveOrganizations(supabase, userId);

    if (organizations.length === 0) {
      return { kind: 'no_access' };
    }

    if (organizations.length > 1) {
      return {
        kind: 'needs_school_picker',
        slugs: organizations.map((organization) => organization.slug),
        organizations,
      };
    }

    const portal = await resolvePortalForSchool(supabase, userId, organizations[0]);
    return { kind: 'completed', portal };
  } catch (error) {
    if (error instanceof PortalAccessError) {
      return {
        kind: 'error',
        message: error.message,
        portalAccessDenied: true,
      };
    }

    return {
      kind: 'error',
      message: normalizeAuthErrorMessage(error),
    };
  }
}
