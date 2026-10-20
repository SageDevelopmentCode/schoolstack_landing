import type { SchoolProfileBundle } from "./school-profile";

export type SchoolVisitEmailDetailRow = { label: string; value: string };

function pickPrimaryPhone(bundle: SchoolProfileBundle): { label: string; number: string } | null {
  const phones = bundle.primaryCampus.phones;
  if (phones.length === 0) return null;
  const primary = phones.find((p) => p.is_primary) ?? phones[0];
  return { label: primary.label, number: primary.number };
}

function pickPrimaryEmail(bundle: SchoolProfileBundle): { label: string; email: string } | null {
  const emails = bundle.primaryCampus.emails;
  if (emails.length === 0) return null;
  const primary = emails.find((e) => e.is_primary) ?? emails[0];
  return { label: primary.label, email: primary.email };
}

export function formatCampusMailingAddress(bundle: SchoolProfileBundle): string | null {
  const campus = bundle.primaryCampus;
  const lines: string[] = [];

  if (campus.address_line1) lines.push(campus.address_line1);
  if (campus.address_line2) lines.push(campus.address_line2);

  const cityParts: string[] = [];
  if (campus.city) cityParts.push(campus.city);
  if (campus.state_region) {
    cityParts.push(campus.state_region);
  }
  let cityLine = cityParts.join(", ");
  if (campus.postal_code) {
    cityLine = cityLine ? `${cityLine} ${campus.postal_code}` : campus.postal_code;
  }
  if (cityLine) lines.push(cityLine);

  const country = (campus.country_code ?? "US").trim().toUpperCase();
  if (country && country !== "US") {
    lines.push(country);
  }

  if (lines.length === 0) return null;
  return lines.join(", ");
}

function shouldShowCampusName(bundle: SchoolProfileBundle): boolean {
  const name = bundle.primaryCampus.name.trim();
  if (!name) return false;
  if (name.toLowerCase() !== "main campus") return true;
  return formatCampusMailingAddress(bundle) !== null;
}

export function buildSchoolVisitEmailDetailRows(
  bundle: SchoolProfileBundle,
): SchoolVisitEmailDetailRow[] {
  const rows: SchoolVisitEmailDetailRow[] = [];

  if (shouldShowCampusName(bundle)) {
    rows.push({ label: "Campus", value: bundle.primaryCampus.name.trim() });
  }

  const address = formatCampusMailingAddress(bundle);
  if (address) {
    rows.push({ label: "Location", value: address });
  }

  const phone = pickPrimaryPhone(bundle);
  if (phone) {
    const value =
      phone.label && phone.label !== "Phone"
        ? `${phone.label}: ${phone.number}`
        : phone.number;
    rows.push({ label: "Phone", value });
  }

  const email = pickPrimaryEmail(bundle);
  if (email) {
    const value =
      email.label && email.label !== "Email"
        ? `${email.label}: ${email.email}`
        : email.email;
    rows.push({ label: "Email", value });
  }

  if (bundle.profile.website_url) {
    rows.push({ label: "Website", value: bundle.profile.website_url });
  }

  if (bundle.primaryCampus.office_hours_notes) {
    rows.push({
      label: "Office hours",
      value: bundle.primaryCampus.office_hours_notes,
    });
  }

  if (bundle.primaryCampus.directions_notes) {
    rows.push({
      label: "Directions",
      value: bundle.primaryCampus.directions_notes,
    });
  }

  if (bundle.primaryCampus.parking_notes) {
    rows.push({
      label: "Parking",
      value: bundle.primaryCampus.parking_notes,
    });
  }

  if (bundle.profile.emergency_line) {
    rows.push({
      label: "Emergency line",
      value: bundle.profile.emergency_line,
    });
  }

  return rows;
}
