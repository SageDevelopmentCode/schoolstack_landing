import type { SupabaseClient } from "@supabase/supabase-js";

export type OrganizationMobileUserPortal = "parent" | "teacher" | "admin";

export type OrganizationMobileUserDevice = {
  platform: "ios" | "android" | null;
  updatedAt: string;
};

export type OrganizationMobileUser = {
  userId: string;
  email: string | null;
  displayName: string;
  portals: OrganizationMobileUserPortal[];
  devices: OrganizationMobileUserDevice[];
  lastMobileActivityAt: string;
};

export type OrganizationMobileUsersSummary = {
  withMobilePush: number;
  totalDevices: number;
};

export type OrganizationMobileUsersResult = {
  users: OrganizationMobileUser[];
  summary: OrganizationMobileUsersSummary;
};

const USER_ID_CHUNK_SIZE = 100;
const AUTH_USER_LOOKUP_CHUNK_SIZE = 20;

const SCHOOL_ADMIN_MEMBERSHIP_ROLES = new Set(["owner", "admin"]);

type UserAffiliation = {
  displayName: string | null;
  email: string | null;
  portals: Set<OrganizationMobileUserPortal>;
};

function formatPersonName(firstName: string, lastName: string): string {
  const full = `${firstName} ${lastName}`.trim();
  return full || "Unknown user";
}

function mergeAffiliation(
  existing: UserAffiliation | undefined,
  patch: {
    displayName?: string | null;
    email?: string | null;
    portal?: OrganizationMobileUserPortal;
  },
): UserAffiliation {
  const portals = new Set(existing?.portals ?? []);
  if (patch.portal) portals.add(patch.portal);

  return {
    displayName: patch.displayName?.trim()
      ? patch.displayName.trim()
      : (existing?.displayName ?? null),
    email: patch.email?.trim()
      ? patch.email.trim()
      : (existing?.email ?? null),
    portals,
  };
}

async function loadOrgUserAffiliations(
  admin: SupabaseClient,
  organizationId: string,
): Promise<Map<string, UserAffiliation>> {
  const byUserId = new Map<string, UserAffiliation>();

  const [guardiansResult, staffResult, membershipsResult] = await Promise.all([
    admin
      .from("guardians")
      .select(
        "user_id, first_name, last_name, email, families!inner(organization_id)",
      )
      .eq("families.organization_id", organizationId)
      .not("user_id", "is", null),
    admin
      .from("staff_members")
      .select("user_id, first_name, last_name, email")
      .eq("organization_id", organizationId)
      .not("user_id", "is", null),
    admin
      .from("organization_memberships")
      .select("user_id, role")
      .eq("organization_id", organizationId)
      .eq("status", "active"),
  ]);

  if (guardiansResult.error) throw guardiansResult.error;
  if (staffResult.error) throw staffResult.error;
  if (membershipsResult.error) throw membershipsResult.error;

  for (const row of guardiansResult.data ?? []) {
    const userId = row.user_id ? String(row.user_id) : null;
    if (!userId) continue;

    const displayName = formatPersonName(
      String(row.first_name ?? ""),
      String(row.last_name ?? ""),
    );
    const email = typeof row.email === "string" ? row.email : null;
    byUserId.set(
      userId,
      mergeAffiliation(byUserId.get(userId), {
        displayName,
        email,
        portal: "parent",
      }),
    );
  }

  for (const row of staffResult.data ?? []) {
    const userId = row.user_id ? String(row.user_id) : null;
    if (!userId) continue;

    const displayName = formatPersonName(
      String(row.first_name ?? ""),
      String(row.last_name ?? ""),
    );
    const email = typeof row.email === "string" ? row.email : null;
    byUserId.set(
      userId,
      mergeAffiliation(byUserId.get(userId), {
        displayName,
        email,
        portal: "teacher",
      }),
    );
  }

  for (const row of membershipsResult.data ?? []) {
    const userId = row.user_id ? String(row.user_id) : null;
    if (!userId) continue;

    const role = String(row.role ?? "");
    const portal: OrganizationMobileUserPortal | undefined =
      SCHOOL_ADMIN_MEMBERSHIP_ROLES.has(role)
        ? "admin"
        : role === "teacher" || role === "staff"
          ? "teacher"
          : role === "parent"
            ? "parent"
            : undefined;

    byUserId.set(
      userId,
      mergeAffiliation(byUserId.get(userId), {
        portal,
      }),
    );
  }

  return byUserId;
}

type ExpoPushTokenRow = {
  user_id: string;
  platform: string | null;
  updated_at: string;
};

async function loadExpoPushTokensForUserIds(
  admin: SupabaseClient,
  userIds: string[],
): Promise<ExpoPushTokenRow[]> {
  if (userIds.length === 0) return [];

  const rows: ExpoPushTokenRow[] = [];

  for (let index = 0; index < userIds.length; index += USER_ID_CHUNK_SIZE) {
    const chunk = userIds.slice(index, index + USER_ID_CHUNK_SIZE);
    const { data, error } = await admin
      .from("expo_push_tokens")
      .select("user_id, platform, updated_at")
      .in("user_id", chunk);

    if (error) throw error;
    rows.push(...((data ?? []) as ExpoPushTokenRow[]));
  }

  return rows;
}

function parseDevicePlatform(
  value: string | null,
): OrganizationMobileUserDevice["platform"] {
  if (value === "ios" || value === "android") return value;
  return null;
}

function sortPortals(
  portals: Set<OrganizationMobileUserPortal>,
): OrganizationMobileUserPortal[] {
  const order: OrganizationMobileUserPortal[] = ["parent", "teacher", "admin"];
  return order.filter((portal) => portals.has(portal));
}

export async function listOrganizationMobileUsers(
  admin: SupabaseClient,
  organizationId: string,
): Promise<OrganizationMobileUsersResult> {
  const affiliations = await loadOrgUserAffiliations(admin, organizationId);
  const affiliatedUserIds = [...affiliations.keys()];

  const tokenRows = await loadExpoPushTokensForUserIds(admin, affiliatedUserIds);
  const tokensByUserId = new Map<string, ExpoPushTokenRow[]>();

  for (const row of tokenRows) {
    const userId = String(row.user_id);
    const list = tokensByUserId.get(userId) ?? [];
    list.push(row);
    tokensByUserId.set(userId, list);
  }

  const usersWithTokens = [...tokensByUserId.keys()];
  const authEmails = new Map<string, string | null>();

  for (
    let index = 0;
    index < usersWithTokens.length;
    index += AUTH_USER_LOOKUP_CHUNK_SIZE
  ) {
    const chunk = usersWithTokens.slice(index, index + AUTH_USER_LOOKUP_CHUNK_SIZE);
    const results = await Promise.all(
      chunk.map(async (userId) => {
        const { data, error } = await admin.auth.admin.getUserById(userId);
        if (error || !data.user) {
          return [userId, null] as const;
        }
        return [userId, data.user.email ?? null] as const;
      }),
    );
    for (const [userId, email] of results) {
      authEmails.set(userId, email);
    }
  }

  const users: OrganizationMobileUser[] = [];
  let totalDevices = 0;

  for (const userId of usersWithTokens) {
    const deviceRows = tokensByUserId.get(userId) ?? [];
    totalDevices += deviceRows.length;

    const devices: OrganizationMobileUserDevice[] = deviceRows
      .map((row) => ({
        platform: parseDevicePlatform(row.platform),
        updatedAt: String(row.updated_at),
      }))
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );

    const lastMobileActivityAt = devices[0]?.updatedAt ?? "";
    const affiliation = affiliations.get(userId);
    const authEmail = authEmails.get(userId) ?? null;

    users.push({
      userId,
      email: affiliation?.email ?? authEmail,
      displayName:
        affiliation?.displayName?.trim() ||
        authEmail ||
        `${userId.slice(0, 8)}…`,
      portals: sortPortals(affiliation?.portals ?? new Set()),
      devices,
      lastMobileActivityAt,
    });
  }

  users.sort(
    (a, b) =>
      new Date(b.lastMobileActivityAt).getTime() -
      new Date(a.lastMobileActivityAt).getTime(),
  );

  return {
    users,
    summary: {
      withMobilePush: users.length,
      totalDevices,
    },
  };
}
