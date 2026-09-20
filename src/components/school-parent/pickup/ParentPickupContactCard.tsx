"use client";

import { formatAuthorizedPickupContactName } from "@/lib/authorized-pickup/map-row";
import type { AuthorizedPickupContact } from "@/lib/authorized-pickup/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type ParentPickupContactSummaryData = Pick<
  AuthorizedPickupContact,
  "firstName" | "lastName" | "relationship" | "phone" | "notes"
>;

function formatPickupContactMeta(contact: ParentPickupContactSummaryData): string {
  return [contact.relationship?.trim(), contact.phone?.trim()].filter(Boolean).join(" · ");
}

type ParentPickupContactSummaryProps = {
  theme: ParentThemeTokens;
  contact: ParentPickupContactSummaryData;
};

export function ParentPickupContactSummary({
  theme,
  contact,
}: ParentPickupContactSummaryProps) {
  const name = formatAuthorizedPickupContactName(contact);
  const meta = formatPickupContactMeta(contact);

  return (
    <div className="min-w-0 flex-1">
      <p className="m-0 text-sm font-semibold" style={{ color: theme.ink }}>
        {name}
      </p>
      {meta ? (
        <p className="m-0 mt-0.5 text-xs leading-relaxed" style={{ color: theme.muted }}>
          {meta}
        </p>
      ) : null}
      {contact.notes?.trim() ? (
        <p
          className="m-0 mt-1 line-clamp-2 text-xs leading-relaxed"
          style={{ color: theme.muted }}
        >
          {contact.notes.trim()}
        </p>
      ) : null}
    </div>
  );
}

type ParentPickupContactCardProps = {
  theme: ParentThemeTokens;
  contact: AuthorizedPickupContact;
  readOnly?: boolean;
  disabled?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
};

export default function ParentPickupContactCard({
  theme,
  contact,
  readOnly = false,
  disabled = false,
  onEdit,
  onRemove,
}: ParentPickupContactCardProps) {
  const name = formatAuthorizedPickupContactName(contact);

  return (
    <div
      className="rounded-lg border px-3.5 py-3"
      style={{ borderColor: theme.line, backgroundColor: theme.white }}
      data-testid={`parent-pickup-contact-${contact.id}`}
    >
      <ParentPickupContactSummary theme={theme} contact={contact} />
      {!readOnly && (onEdit || onRemove) ? (
        <div className="mt-2 flex flex-wrap items-center gap-1 text-[11px] font-bold">
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              disabled={disabled}
              className="border-0 bg-transparent p-0 disabled:opacity-50"
              style={{ color: theme.primary }}
              aria-label={`Edit ${name}`}
            >
              Edit
            </button>
          ) : null}
          {onEdit && onRemove ? (
            <span style={{ color: theme.muted }} aria-hidden>·</span>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              className="border-0 bg-transparent p-0 disabled:opacity-50"
              style={{ color: theme.alert }}
              aria-label={`Remove ${name}`}
            >
              Remove
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
