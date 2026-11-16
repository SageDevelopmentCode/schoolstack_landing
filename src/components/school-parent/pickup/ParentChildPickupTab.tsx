"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Car, Copy, Plus } from "lucide-react";
import { formatAuthorizedPickupContactName } from "@/lib/authorized-pickup/map-row";
import type { AuthorizedPickupContact } from "@/lib/authorized-pickup/types";
import { parentToast } from "@/lib/school-parent/parent-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import ParentPickupContactCard from "@/components/school-parent/pickup/ParentPickupContactCard";
import { GConfirmDialog } from "@/components/school-parent/garden/GDialog";
import { GChip, GIcon, GSkeleton, gBtnOutlineSm, gBtnPopSm, gLinkSm } from "@/components/school-parent/garden/ui";
import ParentPickupContactFormSidebar, {
  type PickupContactFormValues,
} from "@/components/school-parent/pickup/ParentPickupContactFormSidebar";
import ParentPickupReuseSheet from "@/components/school-parent/pickup/ParentPickupReuseSheet";
import type { FamilyPickupReuseOption } from "@/lib/authorized-pickup/load-family-pickup-reuse-options";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentChildPickupTabProps = {
  theme: ParentThemeTokens;
  organizationId: string;
  studentId: string;
  studentFirstName: string;
  readOnly?: boolean;
};

type FormState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; contact: AuthorizedPickupContact };

const EMPTY_FORM: PickupContactFormValues = {
  firstName: "",
  lastName: "",
  relationship: "",
  phone: "",
  notes: "",
};

export default function ParentChildPickupTab({
  theme,
  organizationId,
  studentId,
  studentFirstName,
  readOnly = false,
}: ParentChildPickupTabProps) {
  const [contacts, setContacts] = useState<AuthorizedPickupContact[]>([]);
  const [reuseOptions, setReuseOptions] = useState<FamilyPickupReuseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState<FormState>({ mode: "closed" });
  const [reuseOpen, setReuseOpen] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<AuthorizedPickupContact | null>(null);

  const loadContacts = useCallback(async (options: { silent?: boolean } = {}) => {
    if (!options.silent) {
      setLoading(true);
    }
    try {
      const [contactsResponse, reuseResponse] = await Promise.all([
        fetch(
          `/api/parent-portal/students/${encodeURIComponent(studentId)}/authorized-pickup?organizationId=${encodeURIComponent(organizationId)}`,
        ),
        readOnly
          ? Promise.resolve(null)
          : fetch(
              `/api/parent-portal/students/${encodeURIComponent(studentId)}/authorized-pickup/reuse-options?organizationId=${encodeURIComponent(organizationId)}`,
            ),
      ]);

      const payload = (await contactsResponse.json().catch(() => null)) as {
        contacts?: AuthorizedPickupContact[];
        error?: string;
      } | null;

      if (!contactsResponse.ok) {
        throw new Error(payload?.error ?? "Failed to load authorized pickup contacts.");
      }

      setContacts(payload?.contacts ?? []);

      if (reuseResponse) {
        const reusePayload = (await reuseResponse.json().catch(() => null)) as {
          options?: FamilyPickupReuseOption[];
        } | null;
        setReuseOptions(reuseResponse.ok ? reusePayload?.options ?? [] : []);
      } else {
        setReuseOptions([]);
      }
    } catch (error) {
      parentToast.error(
        error instanceof Error ? error.message : "Failed to load authorized pickup contacts.",
      );
      void reportPortalOperationalError("parent_portal", {
        organizationId,
        operation: "authorized_pickup.load",
        error: "",
      }, error);
      setContacts([]);
      setReuseOptions([]);
    } finally {
      if (!options.silent) {
        setLoading(false);
      }
    }
  }, [organizationId, readOnly, studentId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadContacts();
    });
  }, [loadContacts]);

  const openCreateForm = () => {
    setFormState({ mode: "create" });
  };

  const openEditForm = (contact: AuthorizedPickupContact) => {
    setFormState({ mode: "edit", contact });
  };

  const closeForm = () => {
    setFormState({ mode: "closed" });
  };

  const sidebarInitialValues = useMemo((): PickupContactFormValues => {
    if (formState.mode === "edit") {
      return {
        firstName: formState.contact.firstName,
        lastName: formState.contact.lastName,
        relationship: formState.contact.relationship ?? "",
        phone: formState.contact.phone ?? "",
        notes: formState.contact.notes ?? "",
      };
    }
    return EMPTY_FORM;
  }, [formState]);

  const handleSave = async (formValues: PickupContactFormValues) => {
    setSaving(true);
    try {
      const payload = {
        organizationId,
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        relationship: formValues.relationship || null,
        phone: formValues.phone || null,
        notes: formValues.notes || null,
      };

      const response =
        formState.mode === "edit"
          ? await fetch(
              `/api/parent-portal/students/${encodeURIComponent(studentId)}/authorized-pickup/${encodeURIComponent(formState.contact.id)}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              },
            )
          : await fetch(
              `/api/parent-portal/students/${encodeURIComponent(studentId)}/authorized-pickup`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              },
            );

      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to save authorized pickup contact.");
      }

      const savedName = [formValues.firstName.trim(), formValues.lastName.trim()].filter(Boolean).join(" ");
      parentToast.success(
        formState.mode === "edit" ? "Pickup contact updated." : "Pickup contact added.",
        {
          description:
            formState.mode === "edit"
              ? `${savedName}'s details are saved.`
              : `${savedName} is on ${studentFirstName}'s authorized pickup list.`,
        },
      );
      closeForm();
      await loadContacts();
    } catch (error) {
      parentToast.error(
        error instanceof Error ? error.message : "Failed to save authorized pickup contact.",
      );
      void reportPortalOperationalError("parent_portal", {
        organizationId,
        operation: "authorized_pickup.save",
        error: "",
      }, error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (readOnly || formState.mode !== "edit") return;

    setSaving(true);
    try {
      const response = await fetch(
        `/api/parent-portal/students/${encodeURIComponent(studentId)}/authorized-pickup/${encodeURIComponent(formState.contact.id)}?organizationId=${encodeURIComponent(organizationId)}`,
        { method: "DELETE" },
      );
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to remove authorized pickup contact.");
      }

      parentToast.success("Pickup contact removed.", {
        description: `${formatAuthorizedPickupContactName(formState.contact)} is no longer on ${studentFirstName}'s list.`,
      });
      closeForm();
      await loadContacts();
    } catch (error) {
      parentToast.error(
        error instanceof Error ? error.message : "Failed to remove authorized pickup contact.",
      );
      void reportPortalOperationalError("parent_portal", {
        organizationId,
        operation: "authorized_pickup.delete",
        error: "",
      }, error);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickDelete = (contact: AuthorizedPickupContact) => {
    if (readOnly) return;
    setPendingRemove(contact);
  };

  const confirmQuickDelete = async () => {
    const contact = pendingRemove;
    if (readOnly || !contact) return;

    setSaving(true);
    try {
      const response = await fetch(
        `/api/parent-portal/students/${encodeURIComponent(studentId)}/authorized-pickup/${encodeURIComponent(contact.id)}?organizationId=${encodeURIComponent(organizationId)}`,
        { method: "DELETE" },
      );
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to remove authorized pickup contact.");
      }

      parentToast.success("Pickup contact removed.", {
        description: `${formatAuthorizedPickupContactName(contact)} is no longer on ${studentFirstName}'s list.`,
      });
      setPendingRemove(null);
      await loadContacts();
    } catch (error) {
      parentToast.error(
        error instanceof Error ? error.message : "Failed to remove authorized pickup contact.",
      );
      void reportPortalOperationalError("parent_portal", {
        organizationId,
        operation: "authorized_pickup.delete",
        error: "",
      }, error);
    } finally {
      setSaving(false);
    }
  };

  const sidebarOpen = formState.mode !== "closed";
  const sidebarMode = formState.mode === "edit" ? "edit" : "create";
  const hasReuseOptions = reuseOptions.some((group) => group.contacts.length > 0);

  return (
    <div className="flex flex-col gap-4" data-testid="parent-child-pickup-tab">
      <div className="flex flex-col gap-4 rounded-[18px] bg-[var(--sf-accent-wash)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <GIcon size="md">
            <Car />
          </GIcon>
          <div className="min-w-0">
            <h3 className="m-0 text-[17px] font-extrabold text-[var(--sf-ink)]">
              Who can pick up {studentFirstName}?
            </h3>
            <p className="m-0 mt-0.5 text-[13px] font-semibold leading-relaxed text-[var(--sf-ink)]/70">
              People allowed to pick up your child. They do not need a MudKitchen account.
            </p>
            {!loading && contacts.length > 0 ? (
              <GChip tone="info" className="mt-2">
                {contacts.length} {contacts.length === 1 ? "contact" : "contacts"} on file
              </GChip>
            ) : null}
          </div>
        </div>
        {!readOnly ? (
          <div className="flex shrink-0 flex-wrap gap-2 self-start sm:self-center">
            {hasReuseOptions ? (
              <button
                type="button"
                className={`${gBtnOutlineSm} whitespace-nowrap`}
                onClick={() => setReuseOpen(true)}
                disabled={saving}
                data-testid="parent-pickup-reuse-open"
              >
                <Copy className="h-4 w-4" aria-hidden />
                Reuse from another child
              </button>
            ) : null}
            <button
              type="button"
              className={`${gBtnPopSm} whitespace-nowrap`}
              onClick={openCreateForm}
              disabled={saving}
              data-testid="parent-pickup-add-contact"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add contact
            </button>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2" aria-busy="true" aria-label="Loading pickup contacts">
          <GSkeleton className="h-28 !rounded-[18px]" />
          <GSkeleton className="h-28 !rounded-[18px]" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-[18px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-[var(--sf-sky)]/50 px-5 py-6 sm:flex-row sm:items-center">
          <GIcon size="md">
            <Car />
          </GIcon>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">
              No authorized pickup contacts yet
            </p>
            <p className="m-0 mt-1 text-[13px] font-semibold leading-relaxed text-[var(--sf-ink)]/70">
              Add grandparents, nannies, or other trusted adults who can pick up your child.
            </p>
          </div>
          {!readOnly ? (
            <button type="button" className={gLinkSm} onClick={openCreateForm}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Add contact
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
          {contacts.map((contact, index) => (
            <ParentPickupContactCard
              key={contact.id}
              theme={theme}
              contact={contact}
              index={index}
              readOnly={readOnly}
              disabled={saving}
              onEdit={readOnly ? undefined : () => openEditForm(contact)}
              onRemove={readOnly ? undefined : () => handleQuickDelete(contact)}
            />
          ))}
        </ul>
      )}

      <ParentPickupContactFormSidebar
        theme={theme}
        open={sidebarOpen}
        mode={sidebarMode}
        initialValues={sidebarInitialValues}
        readOnly={readOnly}
        saving={saving}
        studentFirstName={studentFirstName}
        onClose={closeForm}
        onSave={(values) => void handleSave(values)}
        onDelete={formState.mode === "edit" ? () => void handleDelete() : undefined}
      />

      <ParentPickupReuseSheet
        theme={theme}
        open={reuseOpen}
        organizationId={organizationId}
        studentId={studentId}
        studentFirstName={studentFirstName}
        options={reuseOptions}
        currentContacts={contacts}
        saving={saving}
        onClose={() => setReuseOpen(false)}
        onContactAdded={() => loadContacts({ silent: true })}
      />

      <GConfirmDialog
        theme={theme}
        open={pendingRemove !== null}
        title="Remove this contact?"
        description={
          pendingRemove
            ? `Remove ${formatAuthorizedPickupContactName(pendingRemove)} from the authorized pickup list?`
            : undefined
        }
        confirmLabel="Remove"
        loadingLabel="Removing…"
        destructive
        loading={saving}
        onConfirm={() => void confirmQuickDelete()}
        onClose={() => {
          if (!saving) setPendingRemove(null);
        }}
        data-testid="parent-pickup-quick-remove-confirm"
      />
    </div>
  );
}
