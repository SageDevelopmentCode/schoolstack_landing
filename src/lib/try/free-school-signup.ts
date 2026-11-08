export const FREE_SCHOOL_PLAN = "free" as const;

/** New self-serve schools are not churned, so public reads work, and they have not gone live with families. */
export const FREE_SCHOOL_STATUS = "onboarding" as const;

const SLUG_MAX_LENGTH = 48;

/**
 * Names and slugs that would impersonate an existing customer or this product.
 * Compared after the same normalization used for generated slugs.
 */
const RESERVED_SLUGS = [
  "rooted-meadows",
  "rooted-meadows-school",
  "rooted-meadows-demo",
  "free-tier-school",
  "sagefield",
  "mudkitchen",
  "schoolstack",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ExistingSchoolIdentity = {
  name: string;
  slug: string;
};

export function normalizeSchoolName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function slugFromSchoolName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, "");

  return slug.length >= 2 ? slug : "school";
}

export function suffixedSlug(base: string, attempt: number): string {
  if (attempt <= 0) return base;
  const suffix = `-${attempt + 1}`;
  const room = SLUG_MAX_LENGTH - suffix.length;
  const trimmed = base.slice(0, Math.max(2, room)).replace(/-+$/g, "");
  return `${trimmed}${suffix}`;
}

export function isValidSignupEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return normalized.length <= 254 && EMAIL_PATTERN.test(normalized);
}

export function emailDomain(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at <= 0 || at === normalized.length - 1) return null;
  return normalized.slice(at + 1);
}

function slugImpersonates(slug: string, reservedOrExisting: string): boolean {
  if (slug === reservedOrExisting) return true;
  if (reservedOrExisting.length < 6) return false;
  return (
    slug.startsWith(`${reservedOrExisting}-`) ||
    reservedOrExisting.startsWith(`${slug}-`)
  );
}

export function signupImpersonationMessage(
  schoolName: string,
  existing: readonly ExistingSchoolIdentity[],
): string | null {
  const slug = slugFromSchoolName(schoolName);
  const normalizedName = normalizeSchoolName(schoolName).toLowerCase();

  for (const reserved of RESERVED_SLUGS) {
    if (slugImpersonates(slug, reserved)) {
      return "That school name is already in use. Try a different name.";
    }
  }

  for (const school of existing) {
    const existingName = school.name.trim().toLowerCase().replace(/\s+/g, " ");
    if (existingName.length >= 4 && existingName === normalizedName) {
      return "That school name is already in use. Try a different name.";
    }
    if (slugImpersonates(slug, school.slug)) {
      return "That school name is already in use. Try a different name.";
    }
  }

  return null;
}
