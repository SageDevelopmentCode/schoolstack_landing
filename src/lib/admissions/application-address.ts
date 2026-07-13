export type ApplicationAddressValue = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
};

export const US_STATES: { value: string; label: string }[] = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "District of Columbia" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

export const EMPTY_APPLICATION_ADDRESS: ApplicationAddressValue = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
};

const ZIP_PATTERN = /^\d{5}(-\d{4})?$/;

function isApplicationAddressValue(value: unknown): value is ApplicationAddressValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.line1 === "string" &&
    typeof record.city === "string" &&
    typeof record.state === "string" &&
    typeof record.zip === "string" &&
    (record.line2 === undefined || typeof record.line2 === "string")
  );
}

export function parseApplicationAddressFieldValue(
  value: string,
): ApplicationAddressValue {
  if (!value.trim()) return { ...EMPTY_APPLICATION_ADDRESS };
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!isApplicationAddressValue(parsed)) {
      return { ...EMPTY_APPLICATION_ADDRESS };
    }
    return {
      line1: parsed.line1,
      line2: parsed.line2 ?? "",
      city: parsed.city,
      state: parsed.state,
      zip: parsed.zip,
    };
  } catch {
    return { ...EMPTY_APPLICATION_ADDRESS };
  }
}

export function serializeApplicationAddressFieldValue(
  address: ApplicationAddressValue,
): string {
  return JSON.stringify({
    line1: address.line1,
    line2: address.line2 ?? "",
    city: address.city,
    state: address.state,
    zip: address.zip,
  });
}

export function isApplicationAddressEmpty(address: ApplicationAddressValue): boolean {
  return (
    !address.line1.trim() &&
    !address.line2?.trim() &&
    !address.city.trim() &&
    !address.state.trim() &&
    !address.zip.trim()
  );
}

export function formatApplicationAddress(address: ApplicationAddressValue): string {
  const parts: string[] = [];
  const line1 = address.line1.trim();
  const line2 = address.line2?.trim();
  const city = address.city.trim();
  const state = address.state.trim();
  const zip = address.zip.trim();

  if (line1) parts.push(line1);
  if (line2) parts.push(line2);

  const cityStateZip = [city, state].filter(Boolean).join(", ");
  const locality = [cityStateZip, zip].filter(Boolean).join(" ");
  if (locality) parts.push(locality);

  return parts.join(", ");
}

export function validateApplicationAddressFieldValue(
  value: string,
  options: { required?: boolean; label?: string },
): string | null {
  const address = parseApplicationAddressFieldValue(value);
  const fieldLabel = options.label ?? "Address";

  if (!options.required && isApplicationAddressEmpty(address)) {
    return null;
  }

  if (!address.line1.trim()) {
    return `${fieldLabel}: street address is required.`;
  }
  if (!address.city.trim()) {
    return `${fieldLabel}: city is required.`;
  }
  if (!address.state.trim()) {
    return `${fieldLabel}: state is required.`;
  }
  if (!address.zip.trim()) {
    return `${fieldLabel}: ZIP code is required.`;
  }
  if (!ZIP_PATTERN.test(address.zip.trim())) {
    return `${fieldLabel}: enter a valid ZIP code.`;
  }

  return null;
}
