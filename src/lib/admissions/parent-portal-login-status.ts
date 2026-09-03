import type { SupabaseClient } from "@supabase/supabase-js";
import type { FamilyGuardianRecord } from "./family-guardians";

export type ParentPortalLoginStatus = {
  guardianId: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  familyId: string;
  accountLinked: boolean;
  hasEverSignedIn: boolean;
  lastSignInAt: string | null;
};

export type ParentPortalLoginSummary = {
  total: number;
  linked: number;
  signedIn: number;
  neverSignedIn: number;
  noAccount: number;
};

export type AuthLoginSnapshot = {
  lastSignInAt: string | null;
};

const AUTH_USER_LOOKUP_CHUNK_SIZE = 20;

export function classifyParentPortalLoginStatus(input: {
  userId: string | null;
  lastSignInAt: string | null;
}): Pick<
  ParentPortalLoginStatus,
  "accountLinked" | "hasEverSignedIn" | "lastSignInAt"
> {
  const accountLinked = input.userId != null;
  const lastSignInAt = input.lastSignInAt?.trim() ? input.lastSignInAt : null;

  return {
    accountLinked,
    hasEverSignedIn: accountLinked && lastSignInAt != null,
    lastSignInAt,
  };
}

export function summarizeParentPortalLoginStatus(
  statuses: ParentPortalLoginStatus[],
): ParentPortalLoginSummary {
  let linked = 0;
  let signedIn = 0;
  let neverSignedIn = 0;
  let noAccount = 0;

  for (const status of statuses) {
    if (!status.accountLinked) {
      noAccount += 1;
      continue;
    }

    linked += 1;
    if (status.hasEverSignedIn) {
      signedIn += 1;
    } else {
      neverSignedIn += 1;
    }
  }

  return {
    total: statuses.length,
    linked,
    signedIn,
    neverSignedIn,
    noAccount,
  };
}

export async function fetchAuthLoginStatusByUserIds(
  admin: SupabaseClient,
  userIds: string[],
): Promise<Map<string, AuthLoginSnapshot>> {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
  const loginByUserId = new Map<string, AuthLoginSnapshot>();

  for (let index = 0; index < uniqueUserIds.length; index += AUTH_USER_LOOKUP_CHUNK_SIZE) {
    const chunk = uniqueUserIds.slice(index, index + AUTH_USER_LOOKUP_CHUNK_SIZE);
    const results = await Promise.all(
      chunk.map(async (userId) => {
        const { data, error } = await admin.auth.admin.getUserById(userId);
        if (error || !data.user) {
          return [userId, { lastSignInAt: null }] as const;
        }

        return [
          userId,
          {
            lastSignInAt: data.user.last_sign_in_at ?? null,
          },
        ] as const;
      }),
    );

    for (const [userId, snapshot] of results) {
      loginByUserId.set(userId, snapshot);
    }
  }

  return loginByUserId;
}

type OrgGuardianRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  user_id: string | null;
  family_id: string;
};

export async function listOrgParentPortalLoginStatus(
  admin: SupabaseClient,
  organizationId: string,
  guardianIds?: string[],
): Promise<ParentPortalLoginStatus[]> {
  let query = admin
    .from("guardians")
    .select(
      "id, first_name, last_name, email, user_id, family_id, families!inner(organization_id)",
    )
    .eq("families.organization_id", organizationId)
    .order("created_at", { ascending: true });

  const scopedGuardianIds = [...new Set((guardianIds ?? []).filter(Boolean))].slice(
    0,
    50,
  );
  if (scopedGuardianIds.length > 0) {
    query = query.in("id", scopedGuardianIds);
  }

  const { data, error } = await query;

  if (error) throw error;

  const rows = (data ?? []) as OrgGuardianRow[];
  const userIds = rows
    .map((row) => (row.user_id ? String(row.user_id) : null))
    .filter((userId): userId is string => userId != null);

  const loginByUserId = await fetchAuthLoginStatusByUserIds(admin, userIds);

  return rows.map((row) => {
    const userId =
      row.user_id != null && String(row.user_id).trim() !== ""
        ? String(row.user_id)
        : null;
    const authLogin = userId ? loginByUserId.get(userId) : undefined;
    const classification = classifyParentPortalLoginStatus({
      userId,
      lastSignInAt: authLogin?.lastSignInAt ?? null,
    });

    return {
      guardianId: String(row.id),
      userId,
      firstName: String(row.first_name ?? ""),
      lastName: String(row.last_name ?? ""),
      email: typeof row.email === "string" ? row.email : null,
      familyId: String(row.family_id),
      ...classification,
    };
  });
}

export function enrichGuardiansWithLoginStatus(
  guardians: FamilyGuardianRecord[],
  loginByUserId: Map<string, AuthLoginSnapshot>,
): FamilyGuardianRecord[] {
  return guardians.map((guardian) => {
    const authLogin = guardian.userId ? loginByUserId.get(guardian.userId) : undefined;
    const classification = classifyParentPortalLoginStatus({
      userId: guardian.userId,
      lastSignInAt: authLogin?.lastSignInAt ?? null,
    });

    return {
      ...guardian,
      hasEverSignedIn: classification.hasEverSignedIn,
      lastSignInAt: classification.lastSignInAt,
    };
  });
}
