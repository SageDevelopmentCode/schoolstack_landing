"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdmissionsAvailabilitySlotRecord } from "@/lib/admissions/admissions-availability";
import SchoolAdminModalShell from "@/components/school-admin/ui/SchoolAdminModalShell";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";

const DEFAULT_GROUP_CAPACITY = 10;

function parseCapacity(raw: string): number | null {
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

type TourBookingDraftMode = "exclusive" | "group";

type AdmissionsSlotTourSettingsModalProps = {
  open: boolean;
  onClose: () => void;
  C: AdminThemeTokens;
  storySurface?: boolean;
  organizationId: string;
  date: string;
  timeSlot: string;
  record: AdmissionsAvailabilitySlotRecord | undefined;
  isWholeDayActive: boolean;
  wholeDayCapacity: number | null;
  onUpdated: () => void;
};

export default function AdmissionsSlotTourSettingsModal({
  open,
  onClose,
  C,
  storySurface = false,
  organizationId,
  date,
  timeSlot,
  record,
  isWholeDayActive,
  wholeDayCapacity,
  onUpdated,
}: AdmissionsSlotTourSettingsModalProps) {
  const [draftMode, setDraftMode] = useState<TourBookingDraftMode>("exclusive");
  const [capacity, setCapacity] = useState(String(DEFAULT_GROUP_CAPACITY));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const mode = record?.tourBookingMode === "group" ? "group" : "exclusive";
    setDraftMode(mode);
    if (record?.groupCapacity != null && record.groupCapacity > 0) {
      setCapacity(String(record.groupCapacity));
    } else {
      setCapacity(String(DEFAULT_GROUP_CAPACITY));
    }
  }, [open, date, timeSlot, record?.tourBookingMode, record?.groupCapacity]);

  const panelStyle = useMemo(
    () => ({
      backgroundColor: storySurface ? "#FFFFFF" : C.surface,
      border: `1px solid ${storySurface ? "#E0E7E0" : C.border}`,
    }),
    [C.border, C.surface, storySurface],
  );

  async function patchSlot(mode: TourBookingDraftMode, groupCapacity: number | null) {
    setBusy(true);
    try {
      const response = await fetch("/api/school-admin/admissions/availability/slot-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          date,
          timeSlot,
          tourBookingMode: mode,
          groupCapacity: mode === "group" ? groupCapacity : null,
          groupDayKey: null,
        }),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to update slot.");
      }
      onUpdated();
      if (mode === "exclusive") {
        adminToast.success("Slot set to 1:1");
      } else {
        adminToast.success("Group tour slot saved");
      }
      onClose();
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to update slot."));
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    if (isWholeDayActive || busy) {
      onClose();
      return;
    }

    const serverMode = record?.tourBookingMode === "group" ? "group" : "exclusive";
    if (draftMode === "exclusive") {
      if (serverMode === "exclusive") {
        onClose();
        return;
      }
      await patchSlot("exclusive", null);
      return;
    }

    const parsed = parseCapacity(capacity);
    if (parsed == null) {
      adminToast.error("Capacity must be at least 1.");
      return;
    }
    if (serverMode === "group" && record?.groupCapacity === parsed) {
      onClose();
      return;
    }
    await patchSlot("group", parsed);
  }

  const segmentBase =
    "rounded-sm px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50";

  return (
    <SchoolAdminModalShell
      open={open}
      onClose={onClose}
      maxWidth="sm"
      ariaLabel={`Tour settings for ${timeSlot}`}
      panelStyle={panelStyle}
    >
      <div className="flex flex-col">
        <div
          className="border-b px-5 py-4"
          style={{ borderColor: storySurface ? "#E0E7E0" : C.border }}
        >
          <h2 className="text-base font-semibold" style={{ color: C.textPrimary }}>
            Tour settings · {timeSlot}
          </h2>
          <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
            Choose 1:1 or group tour booking for this open slot.
          </p>
        </div>

        <div className="px-5 py-4">
          {isWholeDayActive ? (
            <div className="space-y-2">
              <p className="text-sm" style={{ color: C.textSecondary }}>
                This slot uses the shared day pool for group tours. Change capacity with the
                whole-day group tour toggle above.
              </p>
              {wholeDayCapacity != null ? (
                <p className="text-xs" style={{ color: C.textTertiary }}>
                  Day capacity: {wholeDayCapacity}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p
                  className="mb-2 text-[11px] font-semibold uppercase tracking-wide"
                  style={{ color: C.textQuaternary }}
                >
                  Booking mode
                </p>
                <div
                  className="inline-flex rounded-sm border p-0.5"
                  style={{ borderColor: C.border, backgroundColor: C.bg }}
                  role="group"
                  aria-label="Tour booking mode"
                >
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setDraftMode("exclusive")}
                    className={segmentBase}
                    style={{
                      backgroundColor: draftMode === "exclusive" ? C.surface : "transparent",
                      color: draftMode === "exclusive" ? C.accent : C.textTertiary,
                      boxShadow:
                        draftMode === "exclusive" ? `0 0 0 1px ${C.border}` : "none",
                    }}
                  >
                    1:1
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setDraftMode("group")}
                    className={segmentBase}
                    style={{
                      backgroundColor: draftMode === "group" ? C.surface : "transparent",
                      color: draftMode === "group" ? C.accent : C.textTertiary,
                      boxShadow: draftMode === "group" ? `0 0 0 1px ${C.border}` : "none",
                    }}
                  >
                    Group
                  </button>
                </div>
              </div>

              {draftMode === "group" ? (
                <div>
                  <label
                    className="mb-2 block text-[11px] font-semibold uppercase tracking-wide"
                    style={{ color: C.textQuaternary }}
                    htmlFor="slot-group-capacity"
                  >
                    Group capacity
                  </label>
                  <input
                    id="slot-group-capacity"
                    type="number"
                    min={1}
                    disabled={busy}
                    value={capacity}
                    onChange={(event) => setCapacity(event.target.value)}
                    className="w-24 rounded-md border px-3 py-2 text-sm"
                    style={{
                      borderColor: C.border,
                      color: C.textPrimary,
                      backgroundColor: C.input,
                    }}
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div
          className="flex justify-end gap-2 border-t px-5 py-4"
          style={{ borderColor: storySurface ? "#E0E7E0" : C.border }}
        >
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm"
            style={{ color: C.textSecondary }}
          >
            {isWholeDayActive ? "Close" : "Cancel"}
          </button>
          {!isWholeDayActive ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleSave()}
              className="rounded-md px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: C.accent, color: "#fff" }}
            >
              {busy ? "Saving…" : "Save"}
            </button>
          ) : null}
        </div>
      </div>
    </SchoolAdminModalShell>
  );
}
