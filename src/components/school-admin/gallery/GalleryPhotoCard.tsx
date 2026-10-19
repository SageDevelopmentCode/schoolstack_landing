"use client";

import { Pencil, Trash2 } from "lucide-react";
import GalleryThumbnail from "@/components/school-gallery/GalleryThumbnail";
import type { GalleryPhoto } from "@/lib/school-gallery/types";

type GalleryPhotoCardProps = {
  photo: GalleryPhoto;
  selected: boolean;
  selectionMode: boolean;
  onToggleSelect: () => void;
  onEditDate: () => void;
  onDelete: () => void;
  showManageActions?: boolean;
  onViewPhoto?: () => void;
};

export default function GalleryPhotoCard({
  photo,
  selected,
  selectionMode,
  onToggleSelect,
  onEditDate,
  onDelete,
  showManageActions = true,
  onViewPhoto,
}: GalleryPhotoCardProps) {
  return (
    <div className="group relative aspect-square overflow-hidden bg-[#F3F5F6]">
      {selectionMode ? (
        <button
          type="button"
          className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-white/90 text-xs font-semibold ring-1 ring-[#D8DEDF]"
          onClick={(event) => {
            event.stopPropagation();
            onToggleSelect();
          }}
          aria-pressed={selected}
        >
          {selected ? "✓" : ""}
        </button>
      ) : null}

      <GalleryThumbnail
        src={photo.imageUrl}
        alt={photo.fileName}
        onClick={onViewPhoto}
        disabled={!photo.imageUrl || !onViewPhoto}
      />

      {!selectionMode && showManageActions ? (
        <div
          className="absolute right-1 top-1 z-10 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <button
            type="button"
            className="rounded-md bg-black/50 p-1.5 text-white hover:bg-black/65"
            onClick={(event) => {
              event.stopPropagation();
              onEditDate();
            }}
            aria-label="Edit date"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="rounded-md bg-black/50 p-1.5 text-white hover:bg-red-600/90"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            aria-label="Delete photo"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
