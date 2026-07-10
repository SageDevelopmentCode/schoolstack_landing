"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type UseUnsavedChangesGuardOptions = {
  isDirty: boolean;
  enabled?: boolean;
};

export function useUnsavedChangesGuard({
  isDirty,
  enabled = true,
}: UseUnsavedChangesGuardOptions) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);
  const isDirtyRef = useRef(isDirty);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  const requestAction = useCallback(
    (action: () => void) => {
      if (!enabled || !isDirtyRef.current) {
        action();
        return;
      }
      pendingActionRef.current = action;
      setDialogOpen(true);
    },
    [enabled],
  );

  const confirmLeave = useCallback(() => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    setDialogOpen(false);
    action?.();
  }, []);

  const cancelLeave = useCallback(() => {
    pendingActionRef.current = null;
    setDialogOpen(false);
  }, []);

  useEffect(() => {
    if (!enabled || !isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enabled, isDirty]);

  useEffect(() => {
    if (!enabled || !isDirty) return;

    const trapHistory = () => {
      window.history.pushState({ unsavedGuard: true }, "", window.location.href);
    };

    trapHistory();

    const handlePopState = () => {
      if (!isDirtyRef.current) return;
      trapHistory();
      pendingActionRef.current = () => {
        window.history.go(-2);
      };
      setDialogOpen(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [enabled, isDirty]);

  useEffect(() => {
    if (!enabled || !isDirty) return;

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest("a[href]");
      if (!anchor || anchor.getAttribute("target") === "_blank") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;

      const currentPath =
        window.location.pathname + window.location.search + window.location.hash;
      const targetPath = url.pathname + url.search + url.hash;
      if (targetPath === currentPath) return;

      event.preventDefault();
      event.stopPropagation();

      pendingActionRef.current = () => {
        router.push(targetPath);
      };
      setDialogOpen(true);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [enabled, isDirty, router]);

  return {
    dialogOpen,
    requestAction,
    confirmLeave,
    cancelLeave,
  };
}
