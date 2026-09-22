"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  buildFlyerCacheKey,
  getCachedFlyer,
  isCachedFlyerObjectUrl,
  setCachedFlyer,
} from "@/lib/parent-portal/friday-branch/flyer-session-cache";

export type ParentFridayBranchFlyerViewerTarget = {
  classId: string;
  fileName: string;
};

type ParentFridayBranchFlyerViewerProps = {
  theme: ParentThemeTokens;
  organizationId: string;
  target: ParentFridayBranchFlyerViewerTarget | null;
  open: boolean;
  onClose: () => void;
  previewFamilyId?: string;
};

type ParentFridayBranchFlyerViewerContentProps = {
  target: ParentFridayBranchFlyerViewerTarget;
  organizationId: string;
  previewFamilyId?: string;
  onClose: () => void;
};

type FlyerState =
  | { status: "loading" }
  | { status: "ready"; objectUrl: string; viewerUrl: string }
  | { status: "error"; message: string };

function buildFlyerUrl(
  organizationId: string,
  classId: string,
  previewFamilyId?: string,
): string {
  const params = new URLSearchParams({
    organizationId,
    classId,
  });
  if (previewFamilyId) {
    return `/api/admin/organizations/${encodeURIComponent(organizationId)}/friday-branch/flyer?${params.toString()}&familyId=${encodeURIComponent(previewFamilyId)}`;
  }
  return `/api/parent-portal/friday-branch/flyer?${params.toString()}`;
}

function createInitialFlyerState(cacheKey: string): FlyerState {
  const cached = getCachedFlyer(cacheKey);
  if (cached) {
    return {
      status: "ready",
      objectUrl: cached.objectUrl,
      viewerUrl: cached.viewerUrl,
    };
  }
  return { status: "loading" };
}

function ParentFridayBranchFlyerViewerContent({
  target,
  onClose,
  previewFamilyId,
  organizationId,
}: ParentFridayBranchFlyerViewerContentProps) {
  const cacheKey = buildFlyerCacheKey(organizationId, target.classId, previewFamilyId);
  const [flyerState, setFlyerState] = useState<FlyerState>(() =>
    createInitialFlyerState(cacheKey),
  );

  useEffect(() => {
    if (getCachedFlyer(cacheKey)) {
      return;
    }

    let activeObjectUrl: string | null = null;
    let cancelled = false;

    const loadFlyer = async () => {
      try {
        const response = await fetch(
          buildFlyerUrl(organizationId, target.classId, previewFamilyId),
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "Failed to load flyer.");
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        activeObjectUrl = objectUrl;

        if (cancelled) {
          if (!isCachedFlyerObjectUrl(objectUrl)) {
            URL.revokeObjectURL(objectUrl);
          }
          return;
        }

        const entry = setCachedFlyer(cacheKey, objectUrl);
        setFlyerState({
          status: "ready",
          objectUrl: entry.objectUrl,
          viewerUrl: entry.viewerUrl,
        });
      } catch (err) {
        if (!cancelled) {
          setFlyerState({
            status: "error",
            message: err instanceof Error ? err.message : "Failed to load flyer.",
          });
        }
      }
    };

    void loadFlyer();

    return () => {
      cancelled = true;
      if (activeObjectUrl && !isCachedFlyerObjectUrl(activeObjectUrl)) {
        URL.revokeObjectURL(activeObjectUrl);
      }
    };
  }, [cacheKey, organizationId, previewFamilyId, target.classId]);

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-[15] flex shrink-0 items-center justify-between gap-3 px-4 py-3"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="min-w-0 truncate text-sm font-medium text-white">
          {target.fileName}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-white transition-colors hover:bg-white/10"
          aria-label="Close flyer viewer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        className="relative z-[15] flex flex-1 items-center justify-center px-4 pb-4"
        onClick={(event) => event.stopPropagation()}
      >
        {flyerState.status === "loading" ? (
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading flyer…
          </div>
        ) : null}

        {flyerState.status === "error" ? (
          <p className="text-sm text-white/90">{flyerState.message}</p>
        ) : null}

        {flyerState.status === "ready" ? (
          <iframe
            src={flyerState.viewerUrl}
            title={target.fileName}
            className="h-[calc(100vh-100px)] w-full max-w-[90vw] rounded-lg border-0 bg-white"
          />
        ) : null}
      </div>
    </motion.div>
  );
}

export default function ParentFridayBranchFlyerViewer({
  target,
  open,
  onClose,
  previewFamilyId,
  organizationId,
}: ParentFridayBranchFlyerViewerProps) {
  return (
    <AnimatePresence>
      {open && target ? (
        <ParentFridayBranchFlyerViewerContent
          key={buildFlyerCacheKey(organizationId, target.classId, previewFamilyId)}
          target={target}
          organizationId={organizationId}
          previewFamilyId={previewFamilyId}
          onClose={onClose}
        />
      ) : null}
    </AnimatePresence>
  );
}
