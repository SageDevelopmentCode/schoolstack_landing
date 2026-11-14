"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { GChip, GKicker, gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import { areAuthorizedPickupContactsEquivalent } from "@/lib/authorized-pickup/contact-equivalence";
import type { FamilyPickupReuseOption } from "@/lib/authorized-pickup/load-family-pickup-reuse-options";
import { formatAuthorizedPickupContactName } from "@/lib/authorized-pickup/map-row";
import type { AuthorizedPickupContact } from "@/lib/authorized-pickup/types";
import { parentToast } from "@/lib/school-parent/parent-toast";
import { ParentPickupContactSummary } from "@/components/school-parent/pickup/ParentPickupContactCard";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentPickupReuseSheetProps = {
  theme: ParentThemeTokens;
  open: boolean;
  organizationId: string;
  studentId: string;
  studentFirstName: string;
  options: FamilyPickupReuseOption[];
  currentContacts: AuthorizedPickupContact[];
  saving?: boolean;
  onClose: () => void;
  onContactAdded: () => Promise<void>;
};

export default function ParentPickupReuseSheet({
  theme,
  open,
  organizationId,
  studentId,
  studentFirstName,
  options,
  currentContacts,
  saving = false,
  onClose,
  onContactAdded,
}: ParentPickupReuseSheetProps) {
  const [addingContactId, setAddingContactId] = useState<string | null>(null);

  const existingComparable = useMemo(
    () =>
      currentContacts.map((contact) => ({
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone,
      })),
    [currentContacts],
  );

  const isAlreadyAdded = (contact: AuthorizedPickupContact) =>
    existingComparable.some((existing) =>
      areAuthorizedPickupContactsEquivalent(existing, contact),
    );

  const handleAdd = async (contact: AuthorizedPickupContact) => {
    if (isAlreadyAdded(contact) || saving || addingContactId) return;

    setAddingContactId(contact.id);
    try {
      const response = await fetch(
        `/api/parent-portal/students/${encodeURIComponent(studentId)}/authorized-pickup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            firstName: contact.firstName,
            lastName: contact.lastName,
            relationship: contact.relationship,
            phone: contact.phone,
            notes: contact.notes,
          }),
        },
      );

      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to add pickup contact.");
      }

      parentToast.success(
        `${formatAuthorizedPickupContactName(contact)} added to ${studentFirstName}'s list.`,
        { description: "You can edit their details from the pickup list anytime." },
      );
      await onContactAdded();
    } catch (error) {
      parentToast.error(
        error instanceof Error ? error.message : "Failed to add pickup contact.",
      );
    } finally {
      setAddingContactId(null);
    }
  };

  const availableCount = options.reduce(
    (sum, group) => sum + group.contacts.filter((contact) => !isAlreadyAdded(contact)).length,
    0,
  );

  return (
    <GSidePanel
      theme={theme}
      open={open}
      title="Reuse from another child"
      kicker="Authorized pickup"
      subtitle={<>Add contacts already on file for another child to {studentFirstName}&apos;s list.</>}
      headerAside={
        availableCount > 0 ? (
          <GChip tone="info">{availableCount} ready to add</GChip>
        ) : (
          <GChip tone="success">Everyone&apos;s already on the list</GChip>
        )
      }
      onClose={() => {
        if (!addingContactId) onClose();
      }}
      testId="parent-pickup-reuse-sheet"
      panelId="parent-pickup-reuse-panel"
      footer={
        <button type="button" className={`${gBtnOutlineSm} ml-auto`} onClick={onClose} disabled={Boolean(addingContactId)}>
          Done
        </button>
      }
    >
      {options.map((group) => (
        <section key={group.studentId} aria-label={`Contacts on file for ${group.studentName}`}>
          <GKicker className="mb-2">From {group.studentName}</GKicker>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {group.contacts.map((contact) => {
              const alreadyAdded = isAlreadyAdded(contact);
              const isAdding = addingContactId === contact.id;

              return (
                <li
                  key={contact.id}
                  className={`flex flex-col gap-3 rounded-[16px] border-[1.5px] px-4 py-3.5 sm:flex-row sm:items-center ${
                    alreadyAdded
                      ? "border-transparent bg-[var(--sf-mint)]/70"
                      : "border-[var(--sf-ink)]/10 bg-white"
                  }`}
                >
                  <ParentPickupContactSummary contact={contact} />
                  {alreadyAdded ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-extrabold text-[var(--sf-forest)]">
                      <Tick className="h-5 w-5" color="var(--sf-forest)" />
                      Already added
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={`${gBtnOutlineSm} shrink-0 !py-2`}
                      disabled={saving || Boolean(addingContactId)}
                      aria-busy={isAdding || undefined}
                      onClick={() => void handleAdd(contact)}
                    >
                      {isAdding ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          Adding…
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" aria-hidden />
                          Add to {studentFirstName}&apos;s list
                        </>
                      )}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </GSidePanel>
  );
}
