export type SchoolProfileSocialLinks = {
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  youtube: string | null;
};

export type SchoolProfileContactPhone = {
  label: string;
  number: string;
  is_primary: boolean;
};

export type SchoolProfileContactEmail = {
  label: string;
  email: string;
  is_primary: boolean;
};

export type OrganizationSchoolProfile = {
  website_url: string | null;
  about: string | null;
  emergency_line: string | null;
  social_links: SchoolProfileSocialLinks;
};

export type OrganizationCampus = {
  id: string | null;
  organization_id: string;
  name: string;
  is_primary: boolean;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state_region: string | null;
  postal_code: string | null;
  country_code: string;
  phones: SchoolProfileContactPhone[];
  emails: SchoolProfileContactEmail[];
  office_hours_notes: string | null;
  directions_notes: string | null;
  parking_notes: string | null;
};

export type SchoolProfileBundle = {
  profile: OrganizationSchoolProfile;
  primaryCampus: OrganizationCampus;
};

export type SchoolProfilePatch = {
  profile: OrganizationSchoolProfile;
  primaryCampus: Omit<OrganizationCampus, "organization_id" | "is_primary"> & {
    id?: string | null;
  };
};

function trimOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseSocialLinks(raw: unknown): SchoolProfileSocialLinks {
  const record =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  return {
    instagram: trimOrNull(record.instagram),
    facebook: trimOrNull(record.facebook),
    linkedin: trimOrNull(record.linkedin),
    youtube: trimOrNull(record.youtube),
  };
}

export function getDefaultOrganizationSchoolProfile(): OrganizationSchoolProfile {
  return {
    website_url: null,
    about: null,
    emergency_line: null,
    social_links: {
      instagram: null,
      facebook: null,
      linkedin: null,
      youtube: null,
    },
  };
}

export function parseOrganizationSchoolProfile(
  raw: Record<string, unknown> | null | undefined,
): OrganizationSchoolProfile {
  const defaults = getDefaultOrganizationSchoolProfile();
  if (!raw || typeof raw !== "object") {
    return defaults;
  }

  return {
    website_url: trimOrNull(raw.website_url) ?? defaults.website_url,
    about: trimOrNull(raw.about) ?? defaults.about,
    emergency_line: trimOrNull(raw.emergency_line) ?? defaults.emergency_line,
    social_links: parseSocialLinks(raw.social_links),
  };
}

function normalizePrimaryFlag<T extends { is_primary: boolean }>(items: T[]): T[] {
  if (items.length === 0) return items;
  const primaryIndex = items.findIndex((item) => item.is_primary);
  const index = primaryIndex >= 0 ? primaryIndex : 0;
  return items.map((item, i) => ({
    ...item,
    is_primary: i === index,
  }));
}

export function parseSchoolProfilePhones(raw: unknown): SchoolProfileContactPhone[] {
  if (!Array.isArray(raw)) return [];
  const phones: SchoolProfileContactPhone[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    const number = trimOrNull(record.number);
    if (!number) continue;
    phones.push({
      label: trimOrNull(record.label) ?? "Phone",
      number,
      is_primary: record.is_primary === true,
    });
  }
  return normalizePrimaryFlag(phones);
}

export function parseSchoolProfileEmails(raw: unknown): SchoolProfileContactEmail[] {
  if (!Array.isArray(raw)) return [];
  const emails: SchoolProfileContactEmail[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    const email = trimOrNull(record.email)?.toLowerCase() ?? null;
    if (!email) continue;
    emails.push({
      label: trimOrNull(record.label) ?? "Email",
      email,
      is_primary: record.is_primary === true,
    });
  }
  return normalizePrimaryFlag(emails);
}

export function getDefaultPrimaryCampus(organizationId: string): OrganizationCampus {
  return {
    id: null,
    organization_id: organizationId,
    name: "Main campus",
    is_primary: true,
    address_line1: null,
    address_line2: null,
    city: null,
    state_region: null,
    postal_code: null,
    country_code: "US",
    phones: [],
    emails: [],
    office_hours_notes: null,
    directions_notes: null,
    parking_notes: null,
  };
}

export function parseOrganizationCampusRow(
  organizationId: string,
  raw: Record<string, unknown> | null | undefined,
): OrganizationCampus {
  const defaults = getDefaultPrimaryCampus(organizationId);
  if (!raw || typeof raw !== "object") {
    return defaults;
  }

  const id = typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : null;

  return {
    id,
    organization_id: organizationId,
    name: trimOrNull(raw.name) ?? defaults.name,
    is_primary: raw.is_primary === true,
    address_line1: trimOrNull(raw.address_line1),
    address_line2: trimOrNull(raw.address_line2),
    city: trimOrNull(raw.city),
    state_region: trimOrNull(raw.state_region),
    postal_code: trimOrNull(raw.postal_code),
    country_code: trimOrNull(raw.country_code) ?? defaults.country_code,
    phones: parseSchoolProfilePhones(raw.phones),
    emails: parseSchoolProfileEmails(raw.emails),
    office_hours_notes: trimOrNull(raw.office_hours_notes),
    directions_notes: trimOrNull(raw.directions_notes),
    parking_notes: trimOrNull(raw.parking_notes),
  };
}

export function campusToDatabaseRow(campus: OrganizationCampus): Record<string, unknown> {
  return {
    organization_id: campus.organization_id,
    name: campus.name,
    is_primary: campus.is_primary,
    address_line1: campus.address_line1,
    address_line2: campus.address_line2,
    city: campus.city,
    state_region: campus.state_region,
    postal_code: campus.postal_code,
    country_code: campus.country_code,
    phones: campus.phones,
    emails: campus.emails,
    office_hours: [],
    office_hours_notes: campus.office_hours_notes,
    directions_notes: campus.directions_notes,
    parking_notes: campus.parking_notes,
    sort_order: 0,
  };
}

export function serializeSchoolProfileBundle(bundle: SchoolProfileBundle): string {
  return JSON.stringify({
    profile: bundle.profile,
    primaryCampus: bundle.primaryCampus,
  });
}

export function isSchoolProfileBundleDirty(
  current: SchoolProfileBundle,
  saved: SchoolProfileBundle,
): boolean {
  return (
    serializeSchoolProfileBundle(current) !== serializeSchoolProfileBundle(saved)
  );
}

export function parseSchoolProfilePatch(
  organizationId: string,
  body: unknown,
): SchoolProfilePatch | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;

  const profileRaw = record.profile;
  const campusRaw = record.primaryCampus;

  if (!profileRaw || typeof profileRaw !== "object") return null;
  if (!campusRaw || typeof campusRaw !== "object") return null;

  const profile = parseOrganizationSchoolProfile(
    profileRaw as Record<string, unknown>,
  );
  const campusRecord = campusRaw as Record<string, unknown>;
  const campus = parseOrganizationCampusRow(organizationId, {
    ...campusRecord,
    organization_id: organizationId,
    is_primary: true,
  });

  const campusId =
    typeof campusRecord.id === "string" && campusRecord.id.trim()
      ? campusRecord.id.trim()
      : campus.id;

  return {
    profile,
    primaryCampus: {
      ...campus,
      id: campusId,
    },
  };
}
