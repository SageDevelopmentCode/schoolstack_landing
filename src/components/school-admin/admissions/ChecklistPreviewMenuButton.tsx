"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ExternalLink, Eye } from "lucide-react";
import { schoolAdminEnrollmentChecklistPreviewPath } from "@/lib/admissions/enrollment-checklist-templates";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import { adminToast } from "@/lib/school-admin/admin-toast";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ChecklistPreviewMenuButtonProps = {
  C: AdminThemeTokens;
  orgSlug: string;
  checklistId: string;
  disabled?: boolean;
  isDirty?: boolean;
  itemId?: string;
  variant?: "button" | "icon";
  onPreviewHere: (itemId?: string) => void;
};

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, ref]);
}

export default function ChecklistPreviewMenuButton({
  C,
  orgSlug,
  checklistId,
  disabled = false,
  isDirty = false,
  itemId,
  variant = "button",
  onPreviewHere,
}: ChecklistPreviewMenuButtonProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, open, () => setOpen(false));

  const handlePreviewHere = () => {
    setOpen(false);
    onPreviewHere(itemId);
  };

  const handleOpenInNewTab = () => {
    setOpen(false);
    const url = schoolAdminEnrollmentChecklistPreviewPath(orgSlug, checklistId, {
      itemId,
    });
    window.open(url, "_blank", "noopener,noreferrer");
    if (isDirty) {
      adminToast.info(
        "Showing last saved version. Save to update what others see.",
      );
    }
  };

  const menu = open ? (
    <div
      role="menu"
      className={`absolute top-full z-20 mt-1 rounded-md border py-1 shadow-lg ${
        variant === "icon" ? "left-0 w-52" : "right-0 w-56"
      }`}
      style={{ borderColor: C.border, backgroundColor: C.surface }}
    >
      <button
        type="button"
        role="menuitem"
        onClick={handlePreviewHere}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold"
        style={{ color: C.textPrimary }}
      >
        <Eye className="h-3.5 w-3.5 shrink-0" />
        View preview here
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={handleOpenInNewTab}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold"
        style={{ color: C.textPrimary }}
      >
        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        Open in new tab
      </button>
    </div>
  ) : null;

  if (variant === "icon") {
    return (
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) setOpen((value) => !value);
          }}
          disabled={disabled}
          aria-label="Preview item"
          aria-expanded={open}
          aria-haspopup="menu"
          className="rounded p-1 opacity-70 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ color: C.textSecondary }}
        >
          <Eye className="h-3 w-3" />
        </button>
        {menu}
      </div>
    );
  }

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((value) => !value)}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        style={getAdminButtonStyle(C, "warning")}
      >
        <Eye className="h-3.5 w-3.5" />
        Preview
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
      </button>
      {menu}
    </div>
  );
}
