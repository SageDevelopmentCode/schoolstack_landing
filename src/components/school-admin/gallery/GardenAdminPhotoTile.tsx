"use client";

import { useState } from "react";
import { Check, ImageOff, Loader2, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { G_FOCUS } from "@/components/school-parent/garden/ui";
import type { GalleryPhoto } from "@/lib/school-gallery/types";

const TILE_ACTION = `flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-white/80 bg-[rgba(24,20,16,0.62)] text-white backdrop-blur-[2px] transition-colors hover:bg-[rgba(24,20,16,0.85)] ${G_FOCUS}`;

/**
 * Admin Garden photo tile: rounded thumbnail; in selection mode the whole
 * tile toggles (check badge + accent ring); otherwise it opens the viewer and
 * shows edit-date / delete on hover or keyboard focus. Mint ring when just
 * uploaded or moved.
 */
export default function GardenAdminPhotoTile({
  photo,
  selectionMode,
  selected,
  flashed,
  deleting,
  onToggleSelect,
  onView,
  onEditDate,
  onDelete,
}: {
  photo: GalleryPhoto;
  selectionMode: boolean;
  selected: boolean;
  flashed: boolean;
  deleting: boolean;
  onToggleSelect: () => void;
  onView: () => void;
  onEditDate: () => void;
  onDelete: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  // Touch screens have no hover: one "more" button reveals the actions.
  const [menuOpen, setMenuOpen] = useState(false);
  const ring = flashed
    ? "ring-4 ring-[var(--sf-forest)]/45"
    : selected
      ? "ring-4 ring-[var(--sf-clay)]"
      : "ring-0";

  return (
    <div
      className={`group relative aspect-square overflow-hidden rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] transition-[box-shadow,transform] duration-300 ${ring} ${
        deleting ? "opacity-50" : ""
      }`}
      data-photo-id={photo.id}
      data-testid="admin-photo-tile"
    >
      <button
        type="button"
        onClick={selectionMode ? onToggleSelect : onView}
        disabled={!selectionMode && !photo.imageUrl}
        aria-pressed={selectionMode ? selected : undefined}
        aria-label={selectionMode ? `${selected ? "Deselect" : "Select"} ${photo.fileName}` : `Open ${photo.fileName}`}
        className={`absolute inset-0 h-full w-full cursor-pointer ${G_FOCUS} focus-visible:ring-inset focus-visible:ring-offset-0`}
      >
        {photo.imageUrl ? (
          <>
          {!loaded ? <span aria-hidden className="absolute inset-0 animate-pulse bg-[var(--sf-ink)]/[0.06]" /> : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            className={`h-full w-full object-cover transition-[transform,opacity] duration-300 ${loaded ? "opacity-100" : "opacity-0"} ${
              selectionMode && selected ? "scale-[0.94]" : "group-hover:scale-[1.03]"
            }`}
          />
          </>
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[var(--sf-ink)]/35">
            <ImageOff className="h-6 w-6" aria-hidden />
          </span>
        )}
      </button>

      {selectionMode ? (
        <span
          aria-hidden
          className={`pointer-events-none absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
            selected
              ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white shadow-[0_2px_0_0_var(--sf-ink)]"
              : "border-white bg-black/25"
          }`}
        >
          {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
        </span>
      ) : (
        <>
          <div className="absolute right-1.5 top-1.5 hidden gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:hover)]:flex">
            <button type="button" className={TILE_ACTION} onClick={onEditDate} aria-label={`Change date for ${photo.fileName}`}>
              <Pencil className="h-3.5 w-3.5" aria-hidden />
            </button>
            <button
              type="button"
              className={`${TILE_ACTION} hover:!bg-[#9a3422]`}
              onClick={onDelete}
              disabled={deleting}
              aria-busy={deleting || undefined}
              aria-label={`Delete ${photo.fileName}`}
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Trash2 className="h-3.5 w-3.5" aria-hidden />}
            </button>
          </div>
          <div className="[@media(hover:hover)]:hidden">
            <button
              type="button"
              className={`${TILE_ACTION} absolute right-1 top-1 !h-7 !w-7`}
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close photo actions" : `Actions for ${photo.fileName}`}
            >
              {deleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : menuOpen ? (
                <X className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
              )}
            </button>
            {menuOpen ? (
              <div className="absolute inset-x-1 bottom-1 flex flex-col gap-1">
                <button
                  type="button"
                  className="rounded-full bg-white/95 px-2 py-1 text-[12px] font-extrabold text-[var(--sf-ink)] shadow"
                  onClick={() => {
                    setMenuOpen(false);
                    onEditDate();
                  }}
                >
                  Change date
                </button>
                <button
                  type="button"
                  className="rounded-full bg-white/95 px-2 py-1 text-[12px] font-extrabold text-[#9a3422] shadow"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                  disabled={deleting}
                >
                  Delete
                </button>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
