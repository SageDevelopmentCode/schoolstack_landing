"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import type { FamilyGuardianRecord } from "@/lib/admissions/family-guardians";
import { formatCents } from "@/lib/tuition/pricing";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import { TuitionChoiceCard } from "@/components/school-admin/tuition/TuitionPaymentScheduleCards";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type SplitRow = {
  guardianId: string;
  guardianName: string;
  sharePercent: string;
};

type TuitionBillingSplitModalProps = {
  familyId: string;
  familyName: string;
  branding: OrganizationBranding;
  onClose: () => void;
  onSaved: () => void;
};

function guardianName(guardian: FamilyGuardianRecord): string {
  return [guardian.firstName, guardian.lastName].filter(Boolean).join(" ").trim();
}

export default function TuitionBillingSplitModal({
  familyId,
  familyName,
  branding,
  onClose,
  onSaved,
}: TuitionBillingSplitModalProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [rows, setRows] = useState<SplitRow[]>([]);
  const [guardians, setGuardians] = useState<FamilyGuardianRecord[]>([]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/tuition/families/${familyId}/billing-splits`);
        const body = (await response.json()) as {
          error?: string;
          splits?: Array<{
            guardianId: string;
            shareBps: number;
            guardianName: string;
          }>;
          guardians?: FamilyGuardianRecord[];
        };
        if (!response.ok) {
          throw new Error(body.error ?? "Failed to load billing split.");
        }

        const loadedGuardians = body.guardians ?? [];
        setGuardians(loadedGuardians);
        const loadedSplits = body.splits ?? [];
        setEnabled(loadedSplits.length > 0);

        if (loadedSplits.length > 0) {
          setRows(
            loadedSplits.map((split) => ({
              guardianId: split.guardianId,
              guardianName: split.guardianName,
              sharePercent: String(split.shareBps / 100),
            })),
          );
        } else if (loadedGuardians.length >= 2) {
          const evenShare = (100 / loadedGuardians.length).toFixed(1);
          setRows(
            loadedGuardians.map((guardian) => ({
              guardianId: guardian.id,
              guardianName: guardianName(guardian),
              sharePercent: evenShare,
            })),
          );
        }
      } catch (err) {
        setError(formatActionError(err, "Failed to load billing split."));
      } finally {
        setLoading(false);
      }
    })();
  }, [familyId]);

  const totalPercent = rows.reduce(
    (sum, row) => sum + (Number(row.sharePercent) || 0),
    0,
  );

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/tuition/families/${familyId}/billing-splits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          enabled
            ? {
                enabled: true,
                splits: rows.map((row) => ({
                  guardianId: row.guardianId,
                  shareBps: Math.round(Number(row.sharePercent) * 100),
                })),
              }
            : { enabled: false },
        ),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to save billing split.");
      }
      adminToast.success(
        enabled ? "Billing split saved" : "Billing split removed",
      );
      onSaved();
      onClose();
    } catch (err) {
      setError(formatActionError(err, "Failed to save billing split."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div
        className="w-full max-w-lg rounded-xl p-5 flex flex-col gap-4"
        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
        data-testid="tuition-billing-split-modal"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
              Billing split
            </h2>
            <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
              {familyName}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" style={{ color: C.textSecondary }} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm" style={{ color: C.textSecondary }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading…
          </div>
        ) : error ? (
          <p className="text-sm" style={{ color: C.error }}>
            {error}
          </p>
        ) : guardians.length < 2 ? (
          <p className="text-sm" style={{ color: C.textSecondary }}>
            Add at least two parents with portal access before splitting tuition billing.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Billing mode">
              <p className="text-xs uppercase tracking-wide" style={{ color: C.textTertiary }}>
                Billing mode
              </p>
              <TuitionChoiceCard
                C={C}
                selected={!enabled}
                label="Combined billing"
                description="The family receives one combined tuition bill as today."
                onSelect={() => setEnabled(false)}
                testId="billing-split-combined"
              />
              <TuitionChoiceCard
                C={C}
                selected={enabled}
                label="Split between guardians"
                description="Each guardian gets separate charges for their share."
                onSelect={() => setEnabled(true)}
                testId="billing-split-split"
              />
            </div>

            {enabled ? (
              <div className="flex flex-col gap-3">
                {rows.map((row) => (
                  <div key={row.guardianId} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                        {row.guardianName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        value={row.sharePercent}
                        onChange={(event) => {
                          const value = event.target.value;
                          setRows((current) =>
                            current.map((item) =>
                              item.guardianId === row.guardianId
                                ? { ...item, sharePercent: value }
                                : item,
                            ),
                          );
                        }}
                        className="w-20 rounded px-2 py-1 text-sm"
                        style={{
                          border: `1px solid ${C.inputBorder}`,
                          backgroundColor: C.input,
                          color: C.textPrimary,
                        }}
                      />
                      <span className="text-sm" style={{ color: C.textSecondary }}>
                        %
                      </span>
                    </div>
                  </div>
                ))}
                <p
                  className="text-xs"
                  style={{
                    color:
                      Math.abs(totalPercent - 100) < 0.05 ? C.textTertiary : C.error,
                  }}
                >
                  Total: {totalPercent.toFixed(1)}% (must equal 100%)
                </p>
                <p className="text-xs" style={{ color: C.textTertiary }}>
                  Example on {formatCents(720000)} annual / 10 payments: each guardian gets
                  separate monthly charges for their share.
                </p>
              </div>
            ) : null}
          </>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            style={getAdminButtonStyle(C, "secondary")}
            className="px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || loading || guardians.length < 2 || Boolean(error)}
            onClick={() => void handleSave()}
            style={getAdminButtonStyle(C, "primary")}
            className="px-4 py-2 text-sm font-medium inline-flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
