"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  CircleHelp,
  Copy,
  Eye,
  EyeOff,
  Link2,
  Loader2,
  MoreHorizontal,
  Save,
  Send,
} from "lucide-react";
import { AdmissionsFamilyAccessGuideModal } from "./AdmissionsFamilyAccessGuide";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ApplicationFormEditorToolbarProps = {
  C: AdminThemeTokens;
  schoolSlug: string;
  readOnly: boolean;
  isPublished: boolean;
  publishedPublicUrl: string | null;
  saving: boolean;
  savedPulse: boolean;
  isApplyDirty: boolean;
  isApplyFormSelected: boolean;
  copiedLink: boolean;
  publishing: boolean;
  creating: boolean;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onCopyPublicLink: () => void;
  onPreview: () => void;
  onDuplicate: () => void;
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

export default function ApplicationFormEditorToolbar({
  C,
  schoolSlug,
  readOnly,
  isPublished,
  publishedPublicUrl,
  saving,
  savedPulse,
  isApplyDirty,
  isApplyFormSelected,
  copiedLink,
  publishing,
  creating,
  onSave,
  onPublish,
  onUnpublish,
  onCopyPublicLink,
  onPreview,
  onDuplicate,
}: ApplicationFormEditorToolbarProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideSessionKey, setGuideSessionKey] = useState(0);
  const shareRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useClickOutside(shareRef, shareOpen, () => setShareOpen(false));
  useClickOutside(moreRef, moreOpen, () => setMoreOpen(false));

  const showDuplicate =
    readOnly ? !isApplyFormSelected : isPublished && !isApplyFormSelected;
  const canCopyLink = Boolean(publishedPublicUrl);

  const openGuide = () => {
    setShareOpen(false);
    setGuideSessionKey((key) => key + 1);
    setGuideOpen(true);
  };

  const handleCopyLink = () => {
    if (!canCopyLink) return;
    onCopyPublicLink();
    setShareOpen(false);
  };

  const shareDropdown = (
    <div className="relative shrink-0" ref={shareRef}>
      <button
        type="button"
        onClick={() => setShareOpen((open) => !open)}
        aria-expanded={shareOpen}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold"
        style={getAdminButtonStyle(C, "info")}
      >
        <Link2 className="h-3.5 w-3.5" />
        Share
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
      </button>

      {shareOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-56 rounded-md border py-1 shadow-lg"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          <button
            type="button"
            role="menuitem"
            disabled={!canCopyLink}
            onClick={handleCopyLink}
            className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-xs transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            style={{ color: C.textPrimary }}
          >
            <span className="flex items-center gap-2 font-semibold">
              {copiedLink ? (
                <Check className="h-3.5 w-3.5 shrink-0" style={{ color: C.success }} />
              ) : (
                <Link2 className="h-3.5 w-3.5 shrink-0" />
              )}
              {copiedLink ? "Copied" : "Copy apply link"}
            </span>
            {!canCopyLink ? (
              <span className="text-[10px]" style={{ color: C.textTertiary }}>
                Publish first
              </span>
            ) : null}
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={openGuide}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold"
            style={{ color: C.textPrimary }}
          >
            <CircleHelp className="h-3.5 w-3.5 shrink-0" />
            How families apply
          </button>
        </div>
      ) : null}
    </div>
  );

  const previewButton = (
    <button
      type="button"
      onClick={onPreview}
      className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold"
      style={getAdminButtonStyle(C, "warning")}
    >
      <Eye className="h-3.5 w-3.5" />
      Preview
    </button>
  );

  const moreMenu = showDuplicate ? (
    <div className="relative shrink-0" ref={moreRef}>
      <button
        type="button"
        onClick={() => setMoreOpen((open) => !open)}
        disabled={creating}
        aria-label="More form actions"
        aria-expanded={moreOpen}
        aria-haspopup="menu"
        className="inline-flex h-9 items-center justify-center rounded-sm px-2.5 transition-opacity disabled:opacity-60"
        style={getAdminButtonStyle(C, "neutral")}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {moreOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 min-w-[10rem] rounded-md border py-1 shadow-lg"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          <button
            type="button"
            role="menuitem"
            disabled={creating}
            onClick={() => {
              setMoreOpen(false);
              onDuplicate();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-opacity disabled:opacity-60"
            style={{ color: C.textPrimary }}
          >
            <Copy className="h-3.5 w-3.5 shrink-0" />
            Duplicate
          </button>
        </div>
      ) : null}
    </div>
  ) : null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {readOnly ? (
          <>
            {shareDropdown}
            {previewButton}
            {moreMenu}
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onSave}
              disabled={saving || !isApplyDirty}
              className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              style={
                savedPulse
                  ? getAdminButtonStyle(C, "success")
                  : getAdminButtonStyle(C, "primary")
              }
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {savedPulse ? "Saved" : isPublished ? "Save" : "Save draft"}
            </button>

            {isPublished ? (
              <button
                type="button"
                onClick={onUnpublish}
                className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold"
                style={getAdminButtonStyle(C, "danger")}
              >
                <EyeOff className="h-3.5 w-3.5" />
                Unpublish
              </button>
            ) : (
              <button
                type="button"
                onClick={onPublish}
                disabled={publishing}
                className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                style={getAdminButtonStyle(C, "accentMid")}
              >
                {publishing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Publish
              </button>
            )}

            {shareDropdown}
            {previewButton}
            {moreMenu}
          </>
        )}
      </div>

      <AdmissionsFamilyAccessGuideModal
        key={guideSessionKey}
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        variant="apply"
        C={C}
        schoolSlug={schoolSlug}
        publicPath={publishedPublicUrl}
        isPublished={isPublished}
      />
    </>
  );
}
