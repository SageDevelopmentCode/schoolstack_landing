"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  areCoopSupplyColorLegendsEqual,
  COOP_SUPPLY_COLOR_PALETTE,
  type CoopSupplyColorLegendEntry,
} from "@/lib/admissions/program-coop-supply-list-mock";
import { adminToast } from "@/lib/school-admin/admin-toast";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";

type CoopSupplyColorLegendEditPanelProps = {
  legend: CoopSupplyColorLegendEntry[];
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  onClose: () => void;
  onSave: (legend: CoopSupplyColorLegendEntry[]) => void | Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
};

function controlStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.md,
    fontSize: "14px",
    padding: "10px 12px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };
}

function paletteDefaultLabel(colorId: string): string {
  return COOP_SUPPLY_COLOR_PALETTE.find((entry) => entry.id === colorId)?.label ?? colorId;
}

export default function CoopSupplyColorLegendEditPanel({
  legend,
  C,
  theme,
  onClose,
  onSave,
  onDirtyChange,
}: CoopSupplyColorLegendEditPanelProps) {
  const [draftLegend, setDraftLegend] = useState<CoopSupplyColorLegendEntry[]>(() =>
    legend.map((entry) => ({ ...entry })),
  );
  const [savedLegend, setSavedLegend] = useState<CoopSupplyColorLegendEntry[]>(() =>
    legend.map((entry) => ({ ...entry })),
  );
  const [prevLegend, setPrevLegend] = useState(legend);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  if (legend !== prevLegend) {
    setPrevLegend(legend);
    setDraftLegend(legend.map((entry) => ({ ...entry })));
    setSavedLegend(legend.map((entry) => ({ ...entry })));
  }

  const isDirty = useMemo(
    () => !areCoopSupplyColorLegendsEqual(draftLegend, savedLegend),
    [draftLegend, savedLegend],
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateLabel = (id: string, label: string) => {
    setDraftLegend((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, label } : entry)),
    );
  };

  const requestClose = () => {
    if (!isDirty) {
      onClose();
      return;
    }
    setDiscardDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const nextLegend = draftLegend.map((entry) => ({ ...entry }));
      await onSave(nextLegend);
      setSavedLegend(nextLegend);
      adminToast.success("Color categories saved");
    } catch {
      // Parent surfaces persistence errors.
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDiscard = () => {
    setDiscardDialogOpen(false);
    onClose();
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[100]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(34,48,44,0.47)" }}
          onClick={requestClose}
          aria-hidden="true"
        />
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,44rem)] max-w-full flex-col overflow-hidden"
          style={{
            backgroundColor: "#F8FAF8",
            borderLeft: "1px solid #E0E8E0",
            boxShadow: "0 -18px 45px rgba(26,47,37,0.2)",
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className="flex flex-shrink-0 items-start justify-between gap-3 bg-white px-[21px] py-[17px]"
            style={{ borderBottom: "1px solid #E0E8E0" }}
          >
            <div className="min-w-0 flex-1">
              <AdminSectionKicker theme={theme}>Color categories</AdminSectionKicker>
              <AdminDisplayHeading theme={theme} as="h2" size="section" className="mt-1">
                Edit category labels
              </AdminDisplayHeading>
              <p className="mt-1 text-[11px]" style={{ color: theme.muted }}>
                Name each color so families and admins know what the row tint means.
              </p>
            </div>
            <AdminButton
              theme={theme}
              variant="soft"
              size="compact"
              onClick={requestClose}
              aria-label="Close"
              className="shrink-0"
            >
              Close ×
            </AdminButton>
          </div>

          <div className="flex-1 overflow-y-auto px-[21px] py-5">
            <div className="space-y-3">
              {draftLegend.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-md border p-3.5"
                  style={{ borderColor: "#E0E7E0", backgroundColor: C.surface }}
                >
                  <label
                    className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: C.textTertiary }}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: entry.hex }}
                      aria-hidden="true"
                    />
                    {paletteDefaultLabel(entry.id)}
                  </label>
                  <input
                    type="text"
                    value={entry.label}
                    onChange={(event) => updateLabel(entry.id, event.target.value)}
                    placeholder={paletteDefaultLabel(entry.id)}
                    aria-label={`${paletteDefaultLabel(entry.id)} category label`}
                    style={controlStyle(C)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div
            className="flex flex-shrink-0 justify-end bg-white px-[21px] py-4"
            style={{ borderTop: "1px solid #E0E8E0" }}
          >
            <AdminButton
              theme={theme}
              variant="primary"
              size="compact"
              onClick={handleSave}
              disabled={!isDirty || saving}
            >
              Save changes
            </AdminButton>
          </div>
        </motion.div>
      </motion.div>

      <ConfirmDialog
        C={C}
        open={discardDialogOpen}
        title="Unsaved changes"
        description="You have unsaved changes. If you close now, your changes will be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        variant="destructive"
        onConfirm={handleConfirmDiscard}
        onClose={() => setDiscardDialogOpen(false)}
      />
    </>
  );
}
