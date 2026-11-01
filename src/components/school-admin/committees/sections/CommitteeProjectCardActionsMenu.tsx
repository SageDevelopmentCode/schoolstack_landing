"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type CommitteeProjectCardActionsMenuProps = {
  C: AdminThemeTokens;
  projectId: string;
  onEditDetails: () => void;
  onDelete: () => void;
};

export default function CommitteeProjectCardActionsMenu({
  C,
  projectId,
  onEditDetails,
  onDelete,
}: CommitteeProjectCardActionsMenuProps) {
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

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        className="rounded-[7px] px-2 py-1.5 transition-colors hover:bg-black/5"
        style={{ backgroundColor: "#F3F5F3", color: "#718087" }}
        aria-label="Project actions"
        aria-expanded={open}
        data-testid={`committee-project-card-menu-${projectId}`}
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-20 mt-1 min-w-[10.5rem] rounded-md border py-1 shadow-lg"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEditDetails();
            }}
            className="block w-full px-3 py-2 text-left text-xs"
            style={{ color: C.textPrimary }}
            data-testid="committee-project-edit-details"
          >
            Edit details
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="block w-full px-3 py-2 text-left text-xs"
            style={{ color: "#AD574C" }}
            data-testid="committee-project-delete"
          >
            Delete project
          </button>
        </div>
      ) : null}
    </div>
  );
}
