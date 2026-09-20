"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import SchoolAdminSlideOverShell from "@/components/school-admin/ui/SchoolAdminSlideOverShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { formatEnrolledStudentName } from "@/lib/school-admin/enrolled-students";
import { formatAttendancePickupContactName } from "@/lib/school-admin/attendance/attendance-pickup-contacts";
import type {
  AttendancePickupContact,
  AttendancePickupSelection,
  AttendanceRosterStudent,
} from "@/lib/school-admin/attendance/attendance-types";

type AttendancePickupSheetProps = {
  open: boolean;
  student: AttendanceRosterStudent | null;
  organizationId: string;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  saving?: boolean;
  onClose: () => void;
  onConfirm: (selection: AttendancePickupSelection) => void;
};

function selectionKey(selection: AttendancePickupSelection): string {
  return `${selection.source}:${selection.contactId}`;
}

function contactSecondaryLine(contact: AttendancePickupContact): string | null {
  if (contact.source === "guardian") {
    return contact.email?.trim() || null;
  }

  const parts = [contact.relationship?.trim(), contact.phone?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export default function AttendancePickupSheet({
  open,
  student,
  organizationId,
  theme,
  C,
  saving = false,
  onClose,
  onConfirm,
}: AttendancePickupSheetProps) {
  const [contacts, setContacts] = useState<AttendancePickupContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSelection, setSelectedSelection] = useState<AttendancePickupSelection | null>(
    null,
  );

  useEffect(() => {
    if (!open || !student) return;

    let cancelled = false;
    queueMicrotask(() => {
      setLoading(true);
      setError(null);
      setSelectedSelection(null);
    });

    void (async () => {
      try {
        const response = await fetch(
          `/api/school-admin/attendance/pickup-contacts?organizationId=${encodeURIComponent(organizationId)}&familyId=${encodeURIComponent(student.familyId)}&studentId=${encodeURIComponent(student.id)}`,
        );
        const payload = (await response.json().catch(() => null)) as {
          contacts?: AttendancePickupContact[];
          error?: string;
        } | null;

        if (!response.ok) {
          throw new Error(payload?.error ?? "Failed to load pickup contacts.");
        }

        if (!cancelled) {
          setContacts(payload?.contacts ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load pickup contacts.");
          setContacts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, organizationId, student]);

  const groupedContacts = useMemo(() => {
    const parentsOnFile = contacts.filter((contact) => contact.source === "guardian");
    const authorizedPickup = contacts.filter(
      (contact) => contact.source === "authorized_contact",
    );
    return { parentsOnFile, authorizedPickup };
  }, [contacts]);

  if (!student) return null;

  const studentName = formatEnrolledStudentName(student);

  const renderContactButton = (contact: AttendancePickupContact) => {
    const selection = { source: contact.source, contactId: contact.id };
    const selected = selectedSelection
      ? selectionKey(selectedSelection) === selectionKey(selection)
      : false;
    const name = formatAttendancePickupContactName(contact);
    const secondaryLine = contactSecondaryLine(contact);

    return (
      <button
        key={selectionKey(selection)}
        type="button"
        onClick={() => setSelectedSelection(selection)}
        className="w-full rounded-lg border p-3 text-left transition-colors"
        style={{
          borderColor: selected ? C.accent : C.border,
          backgroundColor: selected ? C.accentLight : C.surface,
        }}
      >
        <p className="m-0 text-sm font-semibold" style={{ color: C.textPrimary }}>
          {name}
        </p>
        {secondaryLine ? (
          <p className="m-0 mt-0.5 text-xs leading-relaxed" style={{ color: C.textSecondary }}>
            {secondaryLine}
          </p>
        ) : null}
      </button>
    );
  };

  const renderContactSection = (
    label: string,
    sectionContacts: AttendancePickupContact[],
  ) => {
    if (sectionContacts.length === 0) return null;

    return (
      <div className="space-y-2">
        <AdminSectionKicker theme={theme}>{label}</AdminSectionKicker>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {sectionContacts.map(renderContactButton)}
        </div>
      </div>
    );
  };

  return (
    <SchoolAdminSlideOverShell
      open={open}
      onClose={onClose}
      title="Record Pickup"
      subtitle={studentName}
      C={C}
      widthClassName="w-[min(100%,36rem)]"
      footer={
        <AdminButton
          theme={theme}
          variant="primary"
          type="button"
          disabled={saving || !selectedSelection || loading}
          onClick={() => {
            if (selectedSelection) onConfirm(selectedSelection);
          }}
          className="w-full sm:w-auto"
        >
          {saving ? "Saving…" : "Confirm pickup"}
        </AdminButton>
      }
    >
      <div className="space-y-4">
        <p className="text-sm" style={{ color: C.textSecondary }}>
          Select who picked up this student from parents on file or the family&apos;s authorized
          pickup list.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: C.accent }} />
          </div>
        ) : error ? (
          <p className="text-sm" style={{ color: C.error }}>{error}</p>
        ) : contacts.length === 0 ? (
          <div
            className="rounded-lg border px-3 py-3"
            style={{ borderColor: C.border, backgroundColor: C.elevated }}
          >
            <p className="text-sm" style={{ color: C.textSecondary }}>
              No pickup contacts are on file for this student yet.
            </p>
            <p className="mt-1 text-xs" style={{ color: C.textTertiary }}>
              Families can add authorized pickup contacts from the parent portal under their
              child&apos;s record.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {renderContactSection("Parents on file", groupedContacts.parentsOnFile)}
            {renderContactSection("Authorized pickup", groupedContacts.authorizedPickup)}
          </div>
        )}
      </div>
    </SchoolAdminSlideOverShell>
  );
}
