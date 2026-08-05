"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import MudKitchenLoadingOverlay from "@/components/school/shared/MudKitchenLoadingOverlay";

const NAV_LOADING_STORAGE_KEY = "mk-nav-loading";
const MIN_DISPLAY_MS = 200;
const FALLBACK_TIMEOUT_MS = 10_000;

type NavigationLoadingContextValue = {
  startNavigation: (label?: string) => void;
};

const NavigationLoadingContext =
  createContext<NavigationLoadingContextValue | null>(null);

export function useNavigationLoading(): NavigationLoadingContextValue {
  const context = useContext(NavigationLoadingContext);
  if (!context) {
    return {
      startNavigation: () => {},
    };
  }
  return context;
}

type NavigationLoadingProviderProps = {
  children: ReactNode;
};

export default function NavigationLoadingProvider({
  children,
}: NavigationLoadingProviderProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState("Loading");
  const startedAtRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const previousPathnameRef = useRef(pathname);
  const didHydrateFromStorageRef = useRef(false);

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current != null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const hideWithMinDuration = useCallback(() => {
    clearHideTimeout();

    const startedAt = startedAtRef.current;
    if (startedAt == null) {
      setVisible(false);
      return;
    }

    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

    hideTimeoutRef.current = window.setTimeout(() => {
      setVisible(false);
      startedAtRef.current = null;
      hideTimeoutRef.current = null;
    }, remaining);
  }, [clearHideTimeout]);

  const startNavigation = useCallback(
    (nextLabel = "Loading") => {
      clearHideTimeout();
      try {
        sessionStorage.setItem(NAV_LOADING_STORAGE_KEY, "1");
      } catch {
        // Ignore storage failures (private mode, etc.)
      }
      setLabel(nextLabel);
      startedAtRef.current = Date.now();
      setVisible(true);
    },
    [clearHideTimeout],
  );

  useEffect(() => {
    if (didHydrateFromStorageRef.current) return;
    didHydrateFromStorageRef.current = true;

    let shouldRestore = false;
    try {
      if (sessionStorage.getItem(NAV_LOADING_STORAGE_KEY) === "1") {
        sessionStorage.removeItem(NAV_LOADING_STORAGE_KEY);
        shouldRestore = true;
      }
    } catch {
      // Ignore storage failures
    }

    if (!shouldRestore) return;

    const startedAt = Date.now();
    queueMicrotask(() => {
      setLabel("Loading");
      startedAtRef.current = startedAt;
      previousPathnameRef.current = pathname;
      setVisible(true);
      hideWithMinDuration();
    });
  }, [hideWithMinDuration, pathname]);

  useEffect(() => {
    if (!visible) return;
    if (previousPathnameRef.current === pathname) return;

    previousPathnameRef.current = pathname;
    hideWithMinDuration();

    return clearHideTimeout;
  }, [pathname, visible, hideWithMinDuration, clearHideTimeout]);

  useEffect(() => {
    if (!visible) return;

    const timeoutId = window.setTimeout(() => {
      setVisible(false);
      startedAtRef.current = null;
    }, FALLBACK_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [visible]);

  return (
    <NavigationLoadingContext.Provider value={{ startNavigation }}>
      {children}
      <MudKitchenLoadingOverlay visible={visible} label={label} />
    </NavigationLoadingContext.Provider>
  );
}
