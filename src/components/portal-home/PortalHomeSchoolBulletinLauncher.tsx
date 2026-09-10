"use client";

import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import BulletinAllPostsSidebar from "@/components/bulletin/BulletinAllPostsSidebar";
import BulletinAttachmentFullscreenViewer, {
  type BulletinAttachmentViewerState,
} from "@/components/bulletin/BulletinAttachmentFullscreenViewer";
import BulletinPostDetailDialog from "@/components/bulletin/BulletinPostDetailDialog";
import { canPreviewBulletinAttachment } from "@/lib/school-bulletin/attachment-preview";
import type { BulletinAttachment, BulletinPost } from "@/lib/school-bulletin/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type PortalHomeSchoolBulletinLauncherProps = {
  theme: ParentThemeTokens;
  bulletinEnabled: boolean;
  bulletinPosts: BulletinPost[];
};

function buildViewerState(
  attachments: BulletinAttachment[],
  attachment: BulletinAttachment,
): BulletinAttachmentViewerState {
  const previewable = attachments.filter(
    (item) => item.downloadUrl && canPreviewBulletinAttachment(item.mimeType),
  );
  const index = previewable.findIndex((item) => item.id === attachment.id);
  return {
    attachments: previewable,
    index: index >= 0 ? index : 0,
  };
}

export default function PortalHomeSchoolBulletinLauncher({
  theme,
  bulletinEnabled,
  bulletinPosts,
}: PortalHomeSchoolBulletinLauncherProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BulletinPost | null>(null);
  const [viewerState, setViewerState] = useState<BulletinAttachmentViewerState | null>(
    null,
  );

  useEffect(() => {
    if (!sidebarOpen && !selectedPost && !viewerState) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (viewerState) {
        setViewerState(null);
      } else if (selectedPost) {
        setSelectedPost(null);
      } else if (sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, selectedPost, viewerState]);

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSelectedPost(null);
    setViewerState(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-opacity hover:opacity-90"
        style={{
          backgroundColor: theme.info,
          color: theme.white,
          boxShadow: theme.shadowPill,
        }}
      >
        <Megaphone className="h-4 w-4" aria-hidden="true" />
        School Bulletin
      </button>

      <BulletinAllPostsSidebar
        theme={theme}
        posts={bulletinPosts}
        bulletinEnabled={bulletinEnabled}
        open={sidebarOpen}
        onClose={handleCloseSidebar}
        onOpenPost={setSelectedPost}
      />

      <BulletinPostDetailDialog
        theme={theme}
        post={selectedPost}
        open={Boolean(selectedPost)}
        onClose={() => setSelectedPost(null)}
        onOpenAttachment={(attachment) => {
          if (!selectedPost) return;
          setViewerState(buildViewerState(selectedPost.attachments, attachment));
        }}
      />

      <BulletinAttachmentFullscreenViewer
        theme={theme}
        viewerState={viewerState}
        open={Boolean(viewerState)}
        onClose={() => setViewerState(null)}
        onChangeIndex={(index) => {
          if (!viewerState) return;
          setViewerState({ ...viewerState, index });
        }}
      />
    </>
  );
}
