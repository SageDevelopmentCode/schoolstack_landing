"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Car, Loader2, Plus } from "lucide-react";
import { formatAuthorizedPickupContactName } from "@/lib/authorized-pickup/map-row";
import type { AuthorizedPickupContact } from "@/lib/authorized-pickup/types";
import { parentToast } from "@/lib/school-parent/parent-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import ParentPickupContactCard from "@/components/school-parent/pickup/ParentPickupContactCard";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
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

      parentToast.success(
        formState.mode === "edit" ? "Pickup contact updated." : "Pickup contact added.",
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

      parentToast.success("Pickup contact removed.");
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

  const handleQuickDelete = async (contact: AuthorizedPickupContact) => {
    if (readOnly) return;
    if (
      !window.confirm(
        `Remove ${formatAuthorizedPickupContactName(contact)} from the authorized pickup list?`,
      )
    ) {
      return;
    }

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

      parentToast.success("Pickup contact removed.");
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
    <div className="space-y-5" data-testid="parent-child-pickup-tab">
      <div
        className="flex flex-col gap-4 rounded-2xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
        style={{ borderColor: theme.line, backgroundColor: theme.white }}
      >
        <div>
          <ParentSectionKicker theme={theme}>Authorized pickup</ParentSectionKicker>
          <ParentDisplayHeading theme={theme} as="h3" size="section" className="!mt-2 !text-[1.05rem]">
            Who can pick up {studentFirstName}?
          </ParentDisplayHeading>
          <p className="m-0 mt-1 text-xs leading-relaxed" style={{ color: theme.muted }}>
            People allowed to pick up your child. They do not need a MudKitchen account.
            {contacts.length > 0 ? ` ${contacts.length} contacts on file.` : ""}
          </p>
        </div>
        {!readOnly ? (
          <div className="flex flex-wrap gap-2 self-start">
            <ParentButton
              theme={theme}
              variant="primary"
              type="button"
              onClick={openCreateForm}
              disabled={saving}
              className="inline-flex items-center gap-1.5"
              data-testid="parent-pickup-add-contact"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add contact
            </ParentButton>
            {hasReuseOptions ? (
              <ParentButton
                theme={theme}
                variant="outline"
                type="button"
                onClick={() => setReuseOpen(true)}
                disabled={saving}
                className="inline-flex items-center gap-1.5"
                data-testid="parent-pickup-reuse-open"
              >
                Reuse from another child
              </ParentButton>
            ) : null}
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: theme.primary }} />
        </div>
      ) : contacts.length === 0 ? (
        <div
          className="rounded-lg border px-4 py-5 sm:px-5"
          style={{ borderColor: theme.line, backgroundColor: theme.white }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px]"
              style={{ backgroundColor: theme.primarySoft }}
            >
              <Car className="h-4 w-4" style={{ color: theme.primary }} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="m-0 text-sm font-semibold" style={{ color: theme.ink }}>
                No authorized pickup contacts yet
              </p>
              <p className="m-0 mt-1 text-xs leading-relaxed" style={{ color: theme.muted }}>
                Add grandparents, nannies, or other trusted adults who can pick up your child.
              </p>
              {!readOnly ? (
                <ParentTextLink
                  theme={theme}
                  onClick={openCreateForm}
                  className="mt-3 !text-xs"
                >
                  Add contact
                </ParentTextLink>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {contacts.map((contact) => (
            <ParentPickupContactCard
              key={contact.id}
              theme={theme}
              contact={contact}
              readOnly={readOnly}
              disabled={saving}
              onEdit={readOnly ? undefined : () => openEditForm(contact)}
              onRemove={readOnly ? undefined : () => void handleQuickDelete(contact)}
            />
          ))}
        </div>
      )}

      <ParentPickupContactFormSidebar
        theme={theme}
        open={sidebarOpen}
        mode={sidebarMode}
        initialValues={sidebarInitialValues}
        readOnly={readOnly}
        saving={saving}
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
    </div>
  );
}
