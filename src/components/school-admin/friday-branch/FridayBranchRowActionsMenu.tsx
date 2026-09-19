"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type FridayBranchRowActionsMenuProps = {
  C: AdminThemeTokens;
  slotTime: string;
  showDeleteSlot: boolean;
  slotClassCount: number;
  onDeleteClass: () => void;
  onDeleteSlot: () => void;
};

export default function FridayBranchRowActionsMenu({
  C,
  slotTime,
  showDeleteSlot,
  slotClassCount,
  onDeleteClass,
  onDeleteSlot,
}: FridayBranchRowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const handleDeleteSlot = () => {
    setOpen(false);
    if (slotClassCount > 1) {
      const confirmed = window.confirm(
        `Delete the entire ${slotTime} time slot and all ${slotClassCount} classes?`,
      );
      if (!confirmed) return;
    }
    onDeleteSlot();
  };

  const handleDeleteClass = () => {
    setOpen(false);
    onDeleteClass();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="rounded-[7px] px-2 py-1.5"
        style={{ backgroundColor: "#F3F5F3", color: "#718087" }}
        aria-label="More actions"
        aria-expanded={open}
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-20 mt-1 min-w-[10rem] rounded-md border py-1 shadow-lg"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          <button
            type="button"
            onClick={handleDeleteClass}
            className="block w-full px-3 py-2 text-left text-xs"
            style={{ color: C.textPrimary }}
          >
            Delete class
          </button>
          {showDeleteSlot ? (
            <button
              type="button"
              onClick={handleDeleteSlot}
              className="block w-full px-3 py-2 text-left text-xs"
              style={{ color: "#AD574C" }}
            >
              Delete time slot
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
