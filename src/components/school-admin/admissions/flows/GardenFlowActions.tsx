"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Eye, MoreHorizontal, Save, Send } from "lucide-react";
import { G_FOCUS, gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";
import { BusyLabel, gIconBtn } from "@/components/school-admin/garden/kit";
import type { FlowReadiness, ReadinessItem } from "./flowReadiness";
import { FlowReadinessPopover } from "./FlowReadinessRail";

export type FlowMenuItem = {
  key: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  hint?: string;
  destructive?: boolean;
};

/**
 * Builder toolbar actions (Garden): readiness chip below xl, Preview, the ONE
 * toy action and a ⋯ menu for the rest.
 *
 * The toy action is:
 * - Draft: "Publish" (publishing saves too). While publish checks fail it
 *   becomes "Fix N to publish" and jumps to the first item.
 * - Live with unsaved edits: "Save changes".
 * "Save draft" stays available as an outline button while a draft has edits.
 */
export default function GardenFlowActions({
  readOnly,
  isPublished,
  dirty,
  saving,
  publishing,
  readiness,
  kindLabel,
  publicUrl,
  onSave,
  onPublish,
  onPreview,
  onCopyLink,
  onSelectReadinessItem,
  menuItems,
  extra,
  readinessAlwaysVisible = false,
  hidePrimary = false,
}: {
  readOnly: boolean;
  isPublished: boolean;
  dirty: boolean;
  saving: boolean;
  publishing: boolean;
  readiness: FlowReadiness;
  kindLabel: string;
  publicUrl?: string | null;
  onSave: () => void;
  onPublish: () => void;
  onPreview?: () => void;
  onCopyLink?: () => void;
  onSelectReadinessItem?: (item: ReadinessItem) => void;
  menuItems: FlowMenuItem[];
  /** Extra controls placed before Preview (e.g. program picker). */
  extra?: ReactNode;
  /** Show the readiness chip at every width (builders without a readiness rail). */
  readinessAlwaysVisible?: boolean;
  /** Hide the toy action while the page shows its own (e.g. a review stage's Publish). */
  hidePrimary?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Cmd/Ctrl+S saves when there are unsaved edits.
  const saveRef = useRef(onSave);
  useEffect(() => {
    saveRef.current = onSave;
  }, [onSave]);
  useEffect(() => {
    if (readOnly) return;
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (dirty && !saving && !publishing) saveRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, publishing, readOnly, saving]);

  const firstBlocking = readiness.items.find((item) => item.status === "todo");

  let primary: ReactNode = null;
  if (!readOnly && !hidePrimary) {
    if (!isPublished) {
      primary =
        !readiness.ready && firstBlocking ? (
          <button
            type="button"
            onClick={() => onSelectReadinessItem?.(firstBlocking)}
            className={gBtnPopSm}
            data-testid="flow-fix-to-publish"
          >
            <Send className="h-4 w-4" aria-hidden />
            Fix {readiness.blocking} to publish
          </button>
        ) : (
          <button
            type="button"
            onClick={onPublish}
            disabled={publishing || saving}
            aria-busy={publishing || undefined}
            className={gBtnPopSm}
            data-testid="flow-publish"
          >
            <BusyLabel busy={publishing} busyLabel="Publishing…" icon={<Send className="h-4 w-4" aria-hidden />}>
              Publish
            </BusyLabel>
          </button>
        );
    } else if (dirty || saving) {
      primary = (
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          aria-busy={saving || undefined}
          className={gBtnPopSm}
          data-testid="flow-save"
        >
          <BusyLabel busy={saving} busyLabel="Saving…" icon={<Save className="h-4 w-4" aria-hidden />}>
            Save changes
          </BusyLabel>
        </button>
      );
    }
  }

  const visibleMenu = menuItems.filter(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FlowReadinessPopover
        alwaysVisible={readinessAlwaysVisible}
        readiness={readiness}
        isPublished={isPublished}
        kindLabel={kindLabel}
        publicUrl={publicUrl}
        onSelect={onSelectReadinessItem}
        onPreview={onPreview}
        onCopyLink={onCopyLink}
      />
      {extra}
      {!readOnly && !isPublished && (dirty || saving) ? (
        <button
          type="button"
          onClick={onSave}
          disabled={saving || publishing}
          aria-busy={saving || undefined}
          className={`${gBtnOutlineSm} !py-2`}
          data-testid="flow-save-draft"
        >
          <BusyLabel busy={saving} busyLabel="Saving…" icon={<Save className="h-4 w-4" aria-hidden />}>
            Save draft
          </BusyLabel>
        </button>
      ) : null}
      {onPreview ? (
        <button type="button" onClick={onPreview} className={`${gBtnOutlineSm} !py-2`}>
          <Eye className="h-4 w-4" aria-hidden />
          Preview
        </button>
      ) : null}
      {primary}
      {visibleMenu.length > 0 ? (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={`More ${kindLabel} actions`}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className={gIconBtn}
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden />
          </button>
          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-1.5 shadow-[0_6px_0_0_rgba(43,36,29,0.08),0_20px_40px_-20px_rgba(43,36,29,0.4)]"
            >
              {visibleMenu.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    setMenuOpen(false);
                    item.onSelect();
                  }}
                  className={`flex w-full items-start gap-2.5 rounded-[12px] px-3 py-2.5 text-left transition-colors hover:bg-[var(--sf-accent-wash)] disabled:cursor-not-allowed disabled:opacity-50 ${G_FOCUS} focus-visible:ring-inset ${
                    item.destructive ? "text-[#9a3422]" : "text-[var(--sf-ink)]"
                  }`}
                >
                  <span className="mt-0.5 shrink-0" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-extrabold">{item.label}</span>
                    {item.hint ? (
                      <span className="block text-[12px] font-semibold text-[var(--sf-soft)]">{item.hint}</span>
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
