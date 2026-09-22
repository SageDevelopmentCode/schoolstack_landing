import { stripPhoneDigits } from "@/lib/phone-format";

export type AuthorizedPickupContactComparable = {
  firstName: string;
  lastName: string;
  phone?: string | null;
};

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

export function areAuthorizedPickupContactsEquivalent(
  left: AuthorizedPickupContactComparable,
  right: AuthorizedPickupContactComparable,
): boolean {
  return (
    normalizeName(left.firstName) === normalizeName(right.firstName) &&
    normalizeName(left.lastName) === normalizeName(right.lastName) &&
    stripPhoneDigits(left.phone ?? "") === stripPhoneDigits(right.phone ?? "")
  );
}
