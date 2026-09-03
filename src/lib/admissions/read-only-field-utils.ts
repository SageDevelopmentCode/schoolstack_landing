import type { ApplicationField } from "./application-form-schema";
import { parseApplicationFileFieldValue } from "./application-file-storage";
import {
  formatApplicationAddress,
  isApplicationAddressEmpty,
  parseApplicationAddressFieldValue,
} from "./application-address";
import { formatSelectedDate } from "@/lib/demo-scheduler";
import { formatPhoneNumberInput } from "@/lib/phone-format";

function formatStoredAddressValue(value: string): string | null {
  if (!value.trim().startsWith("{")) return null;
  const address = parseApplicationAddressFieldValue(value);
  if (isApplicationAddressEmpty(address)) return "—";
  return formatApplicationAddress(address);
}

export function formatReadOnlyApplicationFieldValue(
  field: ApplicationField,
  value: string | undefined,
): string {
  if (!value) return "—";

  if (field.type === "checkbox") {
    return value === "true" || value === "on" || value === "1" ? "Yes" : "No";
  }

  if (field.type === "select" || field.type === "radio") {
    const option = field.options?.find((entry) => entry.value === value);
    return option?.label ?? value;
  }

  if (field.type === "tel") {
    return formatPhoneNumberInput(value);
  }

  if (field.type === "date" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return formatSelectedDate(value);
  }

  if (field.type === "address") {
    const address = parseApplicationAddressFieldValue(value);
    if (isApplicationAddressEmpty(address)) return "—";
    return formatApplicationAddress(address);
  }

  if (field.type === "file") {
    const files = parseApplicationFileFieldValue(value);
    if (files.length === 0) return "—";
    return files.map((file) => file.fileName).join(", ");
  }

  const formattedAddress = formatStoredAddressValue(value);
  if (formattedAddress !== null) return formattedAddress;

  return value;
}

export function isEmptyReadOnlyApplicationFieldValue(
  field: ApplicationField,
  value: string | undefined,
): boolean {
  if (!value) return true;
  if (field.type === "file") {
    return parseApplicationFileFieldValue(value).length === 0;
  }
  if (field.type === "address") {
    return isApplicationAddressEmpty(parseApplicationAddressFieldValue(value));
  }
  if (value.trim().startsWith("{")) {
    return isApplicationAddressEmpty(parseApplicationAddressFieldValue(value));
  }
  return false;
}
