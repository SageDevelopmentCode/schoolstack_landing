"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, MoreHorizontal, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import { gIconBtn } from "@/components/school-admin/garden/kit";
import { G_FOCUS } from "@/components/school-parent/garden/ui";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type FridayBranchRowActionsMenuProps = {
  C: AdminThemeTokens;
  slotTime: string;
  showDeleteSlot: boolean;
  slotClassCount: number;
  onDeleteClass: () => void;
  onDeleteSlot: () => void;
};

/** Row "more" menu: delete class / delete the whole time slot (confirm when it has several classes). */
export default function FridayBranchRowActionsMenu({
  C,
  slotTime,
  showDeleteSlot,
  slotClassCount,
  onDeleteClass,
  onDeleteSlot,
}: FridayBranchRowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirmSlot, setConfirmSlot] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const itemClass = `flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-left text-[13px] font-bold transition-colors hover:bg-[var(--sf-accent-wash)] ${G_FOCUS}`;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`${gIconBtn} !h-8 !w-8`}
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1.5 min-w-[11rem] rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-1 shadow-[0_10px_30px_-12px_rgba(43,36,29,0.35)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDeleteClass();
            }}
            className={`${itemClass} text-[var(--sf-ink)]`}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Delete class
          </button>
          {showDeleteSlot ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                if (slotClassCount > 1) setConfirmSlot(true);
                else onDeleteSlot();
              }}
              className={`${itemClass} text-[#9a3422]`}
            >
              <Clock className="h-3.5 w-3.5" aria-hidden />
              Delete time slot
            </button>
          ) : null}
        </div>
      ) : null}

      <ConfirmDialog
        C={C}
        open={confirmSlot}
        title={`Delete the ${slotTime} time slot?`}
        description={`This removes the slot and all ${slotClassCount} classes in it. You can undo it until you save the schedule.`}
        confirmLabel="Delete time slot"
        variant="destructive"
        onConfirm={() => {
          setConfirmSlot(false);
          onDeleteSlot();
        }}
        onClose={() => setConfirmSlot(false)}
      />
    </div>
  );
}
