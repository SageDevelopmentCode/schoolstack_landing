"use client";

import { Pencil, Phone, Trash2 } from "lucide-react";
import { formatAuthorizedPickupContactName } from "@/lib/authorized-pickup/map-row";
import type { AuthorizedPickupContact } from "@/lib/authorized-pickup/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { TeacherAvatar } from "@/components/school-parent/children/garden/TeacherAvatar";
import { G_FOCUS, gLinkSm } from "@/components/school-parent/garden/ui";

export type ParentPickupContactSummaryData = Pick<
  AuthorizedPickupContact,
  "firstName" | "lastName" | "relationship" | "phone" | "notes"
>;

type ParentPickupContactSummaryProps = {
  /** Kept for API stability (Garden styling uses the frame's tokens). */
  theme?: ParentThemeTokens;
  contact: ParentPickupContactSummaryData;
};

/** Name, relationship · phone and notes for a pickup contact (Garden type). */
export function ParentPickupContactSummary({ contact }: ParentPickupContactSummaryProps) {
  const name = formatAuthorizedPickupContactName(contact);
  const relationship = contact.relationship?.trim();
  const phone = contact.phone?.trim();

  return (
    <div className="min-w-0 flex-1">
      <h4 className="m-0 truncate text-[15px] font-extrabold text-[var(--sf-ink)]">{name}</h4>
      {relationship || phone ? (
        <p className="m-0 mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px] font-semibold text-[var(--sf-soft)]">
          {relationship ? <span>{relationship}</span> : null}
          {relationship && phone ? <span aria-hidden="true">·</span> : null}
          {phone ? (
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3 w-3" aria-hidden="true" />
              {phone}
            </span>
          ) : null}
        </p>
      ) : null}
      {contact.notes?.trim() ? (
        <p className="m-0 mt-1.5 line-clamp-2 text-[13px] font-semibold leading-relaxed text-[var(--sf-ink)]/65">
          {contact.notes.trim()}
        </p>
      ) : null}
    </div>
  );
}

type ParentPickupContactCardProps = {
  theme?: ParentThemeTokens;
  contact: AuthorizedPickupContact;
  readOnly?: boolean;
  disabled?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  index?: number;
};

/** One authorized pickup person: initials, details, Edit / Remove. */
export default function ParentPickupContactCard({
  contact,
  readOnly = false,
  disabled = false,
  onEdit,
  onRemove,
  index = 0,
}: ParentPickupContactCardProps) {
  const name = formatAuthorizedPickupContactName(contact);

  return (
    <li
      className="flex flex-col rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-4"
      data-testid={`parent-pickup-contact-${contact.id}`}
    >
      <div className="flex items-start gap-3">
        <TeacherAvatar teacher={{ name }} index={index} />
        <ParentPickupContactSummary contact={contact} />
      </div>
      {!readOnly && (onEdit || onRemove) ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-3">
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              disabled={disabled}
              className={`${gLinkSm} disabled:opacity-50`}
              aria-label={`Edit ${name}`}
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              Edit
            </button>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              className={`inline-flex items-center gap-1 rounded-md text-sm font-extrabold text-[#b42318] hover:underline hover:decoration-2 hover:underline-offset-4 disabled:opacity-50 ${G_FOCUS}`}
              aria-label={`Remove ${name}`}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Remove
            </button>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
