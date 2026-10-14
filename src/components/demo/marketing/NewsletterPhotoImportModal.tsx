"use client";

import Image from "next/image";
import { useLayoutEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import type { DemoNewsletterGalleryPhoto } from "@/data/school-demos/demo-newsletter-gallery-photos";

type NewsletterPhotoImportModalProps = {
  open: boolean;
  photos: DemoNewsletterGalleryPhoto[];
  selectedIds: Set<string>;
  onTogglePhoto: (id: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  portalRef?: RefObject<HTMLDivElement | null>;
  portalHost?: HTMLElement | null;
};

export default function NewsletterPhotoImportModal({
  open,
  photos,
  selectedIds,
  onTogglePhoto,
  onClose,
  onConfirm,
  portalRef,
  portalHost,
}: NewsletterPhotoImportModalProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const [mountedRoot, setMountedRoot] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setMountedRoot(null);
      return;
    }
    setMountedRoot(portalHost ?? portalRef?.current ?? null);
  }, [open, portalHost, portalRef]);

  if (!open) return null;

  const hasSelection = selectedIds.size > 0;

  const overlay = (
    <div
      className="absolute inset-0 z-[200] flex items-start justify-center px-4 pt-20 pb-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.55)" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-photo-import-title"
        className="flex max-h-[min(480px,78%)] w-full max-w-[720px] flex-col overflow-hidden rounded-lg border shadow-lg"
        style={{
          borderColor: C.border,
          backgroundColor: theme.white,
        }}
      >
        <div className="border-b px-4 pt-1.5 pb-2" style={{ borderColor: C.border }}>
          <div
            id="newsletter-photo-import-title"
            className="text-sm font-bold leading-tight"
            style={{ color: C.textPrimary }}
          >
            Import from school photos
          </div>
          <p className="!mt-0.5 text-[11px]" style={{ color: theme.muted }}>
            Choose shots already in your MudKitchen photo library for this newsletter.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-6">
            {photos.map((photo) => {
              const selected = selectedIds.has(photo.id);
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => onTogglePhoto(photo.id)}
                  className="relative aspect-square overflow-hidden rounded-md border-2 transition-colors"
                  style={{
                    borderColor: selected ? theme.primary : C.border,
                    boxShadow: selected ? `0 0 0 2px ${theme.primarySoft}` : undefined,
                  }}
                  aria-pressed={selected}
                  aria-label={photo.alt}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="flex shrink-0 items-center justify-end gap-2 border-t px-4 py-3"
          style={{ borderColor: C.border }}
        >
          <AdminButton theme={theme} variant="outline" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton
            theme={theme}
            variant="primary"
            onClick={onConfirm}
            disabled={!hasSelection}
          >
            Add to newsletter
          </AdminButton>
        </div>
      </div>
    </div>
  );

  const portalTarget = portalHost ?? portalRef?.current ?? mountedRoot;
  if (portalTarget) {
    return createPortal(overlay, portalTarget);
  }
  if (portalHost !== undefined || portalRef) {
    return null;
  }

  return overlay;
}
